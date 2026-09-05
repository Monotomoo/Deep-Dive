import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppState } from '../types';
import { makeInitialState } from '../lib/seed';
import { loadState, saveState, getCloudSyncedAt, setCloudSyncedAt, getCloudDirty, setCloudDirty } from '../lib/storage';
import {
  cloudEnabled, getSession, loadSharedDoc, onAuthChange, saveSharedDoc, signOutCloud, subscribeShared,
} from '../lib/cloud';
import { SignIn } from '../components/auth/SignIn';
import { UI_MODE_KEY, type UiMode } from '../lib/shortcuts';
import { fingerprint, logSync } from '../lib/syncLog';
import { type Action } from './reducer';
import { historyReducer, makeHistory } from './history';

interface ContextShape {
  state: AppState;
  dispatch: Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /* Cloud (inert unless a Supabase project is configured). */
  cloudEnabled: boolean;
  session: Session | null;
  cloudStatus: 'off' | 'syncing' | 'synced' | 'error' | 'detached';
  signOut: () => Promise<void>;
  /* Simple vs Full sidebar. Per-device (own localStorage key), deliberately NOT
     part of the synced doc — a crew member switching to Full mustn't flip
     everyone else. Defaults to 'simple': the curated version is the front door. */
  uiMode: UiMode;
  setUiMode: (m: UiMode) => void;
  /* Push this browser's local copy up as the shared crew project (overwrites
     the cloud doc). Used to seed the crew project from the machine that holds
     the real data. Resolves once the upload lands. */
  publishLocal: () => Promise<void>;
}

const LOCAL_BACKUP_KEY = 'deep-dive-local-backup-before-cloud';

const AppContext = createContext<ContextShape | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, internalDispatch] = useReducer(
    historyReducer,
    null,
    () => makeHistory(loadState() ?? makeInitialState())
  );

  /* The live state, readable from inside an async handler. The load effect's
     closure captures `history.present` as it was at mount, so pushing that
     would push a copy from BEFORE the edit we are trying to defend. */
  const presentRef = useRef(history.present);
  presentRef.current = history.present;

  /* Actions that change only what THIS person is looking at. They alter
     `present` (so they flow through the reducer normally) but they are nobody
     else's business, and pushing the whole document to the cloud every time
     somebody clicks a menu item is churn — wasted writes, a sync log full of
     noise, and more chances for a blocked request on a bad network. */
  const UI_ONLY: ReadonlySet<string> = new Set([
    'SET_VIEW', 'SELECT_PERSON', 'SELECT_SHOOT', 'SELECT_THREAD',
    'SELECT_EPISODE', 'OPEN_PALETTE', 'OPEN_CAPTURE', 'SET_PRINT_MODE',
  ]);
  const uiOnlyRef = useRef(false);

  /* Actions that change the document but must NEVER be pushed to the crew.
     Resetting to seed is a decision about THIS browser's copy — one person
     doing it must not replace the project everyone else is working on. The
     reset shows locally, and the next load pulls the crew copy back. Anyone
     who genuinely wants the shared project reset does it deliberately, with
     "publish my copy to crew" afterwards. */
  const LOCAL_ONLY: ReadonlySet<string> = new Set(['RESET_TO_SEED']);
  const localOnlyRef = useRef(false);
  /* After a reset this browser shows the seed, and the crew shows the project.
     If the very next edit were pushed, it would carry the whole seed with it —
     the same overwrite, one click later. So a reset DETACHES this browser:
     nothing goes up until a reload (which brings the crew copy back) or an
     explicit "publish my copy". */
  const detachedRef = useRef(false);

  /* Which action last changed the document. The sync log can say a value went
     back to what it was, but not WHAT put it back — and a revert with no
     hydrate and no remote event means some dispatch did it. This names it. */
  const lastActionRef = useRef<string>('load');

  const dispatch = useCallback<Dispatch<Action>>((action) => {
    if (UI_ONLY.has(action.type)) uiOnlyRef.current = true;
    else logSync('edit', true, action.type, { was: fingerprint(presentRef.current) });
    if (LOCAL_ONLY.has(action.type)) localOnlyRef.current = true;
    lastActionRef.current = action.type;
    internalDispatch(action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const undo = useCallback(() => {
    lastActionRef.current = 'UNDO';
    logSync('edit', true, 'UNDO', { was: fingerprint(presentRef.current) });
    internalDispatch({ type: 'UNDO' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const redo = useCallback(() => {
    lastActionRef.current = 'REDO';
    logSync('edit', true, 'REDO', { was: fingerprint(presentRef.current) });
    internalDispatch({ type: 'REDO' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Local cache — always on. Persist `present` only. */
  const firstMountRef = useRef(true);
  useEffect(() => {
    if (firstMountRef.current) { firstMountRef.current = false; return; }
    saveState(history.present);
  }, [history.present]);

  /* ---------- Cloud (Stage A) — only active when configured ---------- */
  // undefined = still checking, null = signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(cloudEnabled ? undefined : null);
  const [cloudStatus, setCloudStatus] = useState<'off' | 'syncing' | 'synced' | 'error' | 'detached'>(cloudEnabled ? 'syncing' : 'off');
  const cloudReadyRef = useRef(false); // have we pulled the cloud doc for this session yet?
  /* True while the latest history.present change came FROM the cloud (initial
     pull or a realtime event). The push effect skips exactly one run when set —
     otherwise every hydrate re-pushes the doc it just received, and with two
     tabs open the echoes fight each other and can resurrect stale state. */
  const remoteHydrateRef = useRef(false);
  /* Has anything been edited in this browser since it opened? Set for any real
     change, including one made before the cloud finished answering. */
  const localEditRef = useRef(false);
  /* The last state we saw, so we can tell a genuine edit from this effect
     merely re-running because the session arrived. */
  const lastPresentRef = useRef(history.present);

  useEffect(() => {
    if (!cloudEnabled) return;
    let active = true;
    getSession().then((s) => { if (active) setSession(s); });
    /* Only track the session here. Do NOT reset cloudReadyRef on every auth
       event — Supabase fires INITIAL_SESSION and periodic TOKEN_REFRESHED for
       the same user, and resetting the flag left it stuck false (the load
       effect only re-pulls on a userId change), which silently killed every
       cloud push. Readiness is (re)established by the load effect per userId,
       and cleared on sign-out. */
    const unsub = onAuthChange((s) => { if (active) { setSession(s); logSync('auth', !!s, s ? 'signed in' : 'signed out', { user: s?.user?.email }); } });
    return () => { active = false; unsub(); };
  }, []);

  /* Pull the ONE shared crew doc when a session appears; seed it from this
     browser's local copy if the shared project doesn't exist yet.

     Safety: before the first hydrate overwrites local state, stash the current
     local copy under a backup key so nothing this machine holds is ever lost to
     an empty/stale cloud doc. */
  const userId = session?.user.id;
  useEffect(() => {
    if (!cloudEnabled || !userId) return;
    let active = true;
    setCloudStatus('syncing');
    loadSharedDoc().then((res) => {
      if (!active) return;
      if (res) {
        /* Who wins on load?
           - This browser is DIRTY (a local edit whose push never landed — e.g.
             an edit followed by an instant refresh, killing the debounced push)
             AND the cloud hasn't moved past our last sync → the LOCAL copy is
             the newest truth: keep it and push it up.
           - Otherwise → the cloud is the truth: hydrate it. (If we were dirty
             but the cloud DID move, someone else edited meanwhile — last write
             wins, the cloud copy stands, and our unpushed edit is dropped.) */
        const marker = getCloudSyncedAt();
        const cloudMoved = !marker || !res.updatedAt || res.updatedAt > marker;
        /* `localEditRef` matters as much as the stored flag: the app is
           interactive from the first paint, but this pull can take seconds, and
           an edit typed in that window never reached the push effect. Without
           counting it here, the hydrate below would quietly overwrite it. */
        const haveLocalEdit = getCloudDirty() || localEditRef.current;
        logSync('decide', true,
          haveLocalEdit && !cloudMoved
            ? 'keeping this browser’s unpushed edit and sending it up'
            : 'taking the crew copy and replacing what is on this browser',
          { haveLocalEdit, storedDirty: getCloudDirty(), inFlightEdit: localEditRef.current,
            cloudMoved, marker: getCloudSyncedAt(), cloudUpdatedAt: res.updatedAt,
            ONSCREEN: fingerprint(presentRef.current), FROMCLOUD: fingerprint(res.doc) });
        if (haveLocalEdit && !cloudMoved) {
          saveSharedDoc(presentRef.current, 'load-handler: defending an unpushed edit').then((r) => {
            if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
            if (!r.error) { setCloudDirty(false); localEditRef.current = false; }
          });
        } else {
          try { window.localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(presentRef.current)); } catch { /* ignore */ }
          logSync('decide', true, 'HYDRATE — replacing on-screen state with the crew copy', { to: fingerprint(res.doc) });
          remoteHydrateRef.current = true;
          detachedRef.current = false;
          internalDispatch({ type: 'HYDRATE', state: res.doc });
          if (res.updatedAt) setCloudSyncedAt(res.updatedAt);
          setCloudDirty(false);
        }
      } else {
        // First crew member in — seed the shared project from local data.
        saveSharedDoc(presentRef.current, 'load-handler: seeding an empty project').then((r) => { if (r.updatedAt) setCloudSyncedAt(r.updatedAt); if (!r.error) { setCloudDirty(false); localEditRef.current = false; } });
      }
      cloudReadyRef.current = true;
      setCloudStatus('synced');
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* Debounced push on every change, once the initial pull is done. */
  const saveTimer = useRef<number | undefined>(undefined);
  const retryTimer = useRef<number | undefined>(undefined);

  /* A push that fails is retried, because the failure we actually see in the
     wild is a transport one — "NetworkError when attempting to fetch
     resource", a browser or extension blocking the cross-origin request to
     Supabase. Before this, one blocked request meant the edit simply never
     reached the cloud: the footer went red, nothing retried, and the next
     refresh pulled the older crew copy back over the work. Always sends the
     LATEST state, never the one that failed. */
  const pushWithRetry = useCallback((via: string, attempt = 0) => {
    window.clearTimeout(retryTimer.current);
    saveSharedDoc(presentRef.current, attempt ? `${via} · retry ${attempt}` : via).then((r) => {
      if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
      if (!r.error) {
        setCloudDirty(false);
        localEditRef.current = false;
        setCloudStatus('synced');
        return;
      }
      const waits = [2000, 5000, 12000];
      if (attempt < waits.length) {
        setCloudStatus('syncing');
        logSync('push', false, `will retry in ${waits[attempt] / 1000}s`, { attempt: attempt + 1, error: r.error });
        retryTimer.current = window.setTimeout(() => pushWithRetry(via, attempt + 1), waits[attempt]);
      } else {
        /* Out of retries. The dirty flag stays set, so the next load defends
           this edit instead of letting the crew copy overwrite it. */
        logSync('push', false, 'gave up after 3 retries — the edit is still only on this browser', { error: r.error });
        setCloudStatus('error');
      }
    });
  }, []);
  useEffect(() => {
    if (!cloudEnabled) return;
    /* Did the state actually change, or is this effect just re-running because
       the session finally arrived? Only a real change counts as an edit. */
    if (lastPresentRef.current === history.present) return;
    lastPresentRef.current = history.present;
    /* This change came from the cloud — don't push it straight back. */
    if (remoteHydrateRef.current) { remoteHydrateRef.current = false; return; }
    /* Looking at a different view is not an edit. */
    if (uiOnlyRef.current) { uiOnlyRef.current = false; return; }
    /* A reset is this browser's business, not the crew's. It is not marked
       dirty — a reset means "discard my edits", so an older unpushed edit must
       not be "defended" on the next load either — and from here on this
       browser is detached: the next load brings the crew copy straight back. */
    if (localOnlyRef.current) {
      localOnlyRef.current = false;
      localEditRef.current = false;
      setCloudDirty(false);
      if (userId) {
        detachedRef.current = true;
        setCloudStatus('detached');
        logSync('decide', true, 'reset to seed on THIS browser only — detached from the crew project until reload or publish', { now: fingerprint(presentRef.current) });
      }
      return;
    }
    if (detachedRef.current) return;

    /* Mark the edit BEFORE checking whether the cloud is ready. This gate used
       to sit at the top of the effect, so anything typed before the initial
       pull answered was never marked dirty and never pushed — and then the
       pull hydrated the crew copy straight over it. That is why an edit could
       survive closing the window (the tab still held it in memory) and vanish
       on a refresh. */
    localEditRef.current = true;
    setCloudDirty(true);
    if (!userId || !cloudReadyRef.current) return;  // the load handler pushes it
    setCloudStatus('syncing');
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      /* Clear the marker as the push commits, so the live-refresh subscription
         knows we're no longer mid-edit and can pull crew changes again. */
      saveTimer.current = undefined;
      pushWithRetry('debounced edit');
    }, 700);
    return () => window.clearTimeout(saveTimer.current);
  }, [history.present, userId]);

  /* Live-refresh: when another crew member saves, pull their change in — unless
     we have an edit of our own pending (our debounced save will win instead). */
  useEffect(() => {
    if (!cloudEnabled || !userId) return;
    const unsub = subscribeShared((doc, updatedAt) => {
      if (saveTimer.current) return; // mid-edit locally — don't stomp our work
      logSync('remote', true, 'HYDRATE — a crew change replaced on-screen state', { to: fingerprint(doc) });
      remoteHydrateRef.current = true;
      detachedRef.current = false;
      internalDispatch({ type: 'HYDRATE', state: doc });
      if (updatedAt) setCloudSyncedAt(updatedAt);
      setCloudStatus('synced');
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* If every retry failed, the edit exists only in this browser. Closing or
     refreshing now is how the work is lost — and refreshing is exactly what
     somebody does when the screen looks wrong. Say so before it happens. */
  useEffect(() => {
    if (!cloudEnabled || cloudStatus !== 'error') return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [cloudStatus]);

  const signOut = useCallback(async () => {
    await signOutCloud();
    cloudReadyRef.current = false;
    setSession(null);
  }, []);

  /* Simple/Full — read once, persist on change. Anything but an explicit
     'full' is treated as simple, so the curated view is the safe default. */
  const [uiMode, setUiModeState] = useState<UiMode>(() => {
    try { return localStorage.getItem(UI_MODE_KEY) === 'full' ? 'full' : 'simple'; } catch { return 'simple'; }
  });
  const setUiMode = useCallback((m: UiMode) => {
    setUiModeState(m);
    try { localStorage.setItem(UI_MODE_KEY, m); } catch { /* noop */ }
  }, []);

  const publishLocal = useCallback(async () => {
    if (!cloudEnabled || !userId) return;
    setCloudStatus('syncing');
    const r = await saveSharedDoc(presentRef.current, 'publish my copy button');
    if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
    if (!r.error) { setCloudDirty(false); detachedRef.current = false; }
    setCloudStatus(r.error ? 'error' : 'synced');
  }, [userId, history.present]);

  const value: ContextShape = {
    state: history.present,
    dispatch,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    cloudEnabled,
    session: session ?? null,
    cloudStatus,
    signOut,
    publishLocal,
    uiMode,
    setUiMode,
  };

  return (
    <AppContext.Provider value={value}>
      {cloudEnabled && session === undefined ? (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#041531' }}>
          <div className="display-italic text-[28px] text-[color:var(--color-paper)]/70">Deep&nbsp;Dive</div>
        </div>
      ) : cloudEnabled && session === null ? (
        <SignIn />
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useApp(): ContextShape {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
