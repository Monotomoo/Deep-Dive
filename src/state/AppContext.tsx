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
  cloudStatus: 'off' | 'syncing' | 'synced' | 'error';
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

  const dispatch = useCallback<Dispatch<Action>>((action) => internalDispatch(action), []);
  const undo = useCallback(() => internalDispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => internalDispatch({ type: 'REDO' }), []);

  /* Local cache — always on. Persist `present` only. */
  const firstMountRef = useRef(true);
  useEffect(() => {
    if (firstMountRef.current) { firstMountRef.current = false; return; }
    saveState(history.present);
  }, [history.present]);

  /* ---------- Cloud (Stage A) — only active when configured ---------- */
  // undefined = still checking, null = signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(cloudEnabled ? undefined : null);
  const [cloudStatus, setCloudStatus] = useState<'off' | 'syncing' | 'synced' | 'error'>(cloudEnabled ? 'syncing' : 'off');
  const cloudReadyRef = useRef(false); // have we pulled the cloud doc for this session yet?
  /* True while the latest history.present change came FROM the cloud (initial
     pull or a realtime event). The push effect skips exactly one run when set —
     otherwise every hydrate re-pushes the doc it just received, and with two
     tabs open the echoes fight each other and can resurrect stale state. */
  const remoteHydrateRef = useRef(false);

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
    const unsub = onAuthChange((s) => { if (active) setSession(s); });
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
        if (getCloudDirty() && !cloudMoved) {
          saveSharedDoc(history.present).then((r) => {
            if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
            if (!r.error) setCloudDirty(false);
          });
        } else {
          try { window.localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(history.present)); } catch { /* ignore */ }
          remoteHydrateRef.current = true;
          internalDispatch({ type: 'HYDRATE', state: res.doc });
          if (res.updatedAt) setCloudSyncedAt(res.updatedAt);
          setCloudDirty(false);
        }
      } else {
        // First crew member in — seed the shared project from local data.
        saveSharedDoc(history.present).then((r) => { if (r.updatedAt) setCloudSyncedAt(r.updatedAt); if (!r.error) setCloudDirty(false); });
      }
      cloudReadyRef.current = true;
      setCloudStatus('synced');
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* Debounced push on every change, once the initial pull is done. */
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!cloudEnabled || !userId || !cloudReadyRef.current) return;
    /* This change came from the cloud — don't push it straight back. */
    if (remoteHydrateRef.current) { remoteHydrateRef.current = false; return; }
    /* A real local edit: mark dirty NOW, before the debounce — so a refresh
       inside the window still knows there's an unpushed edit to defend. */
    setCloudDirty(true);
    setCloudStatus('syncing');
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      /* Clear the marker as the push commits, so the live-refresh subscription
         knows we're no longer mid-edit and can pull crew changes again. */
      saveTimer.current = undefined;
      saveSharedDoc(history.present).then((r) => {
        if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
        /* Surface write failures instead of lying 'synced'. If the push was
           rejected (e.g. RLS), the footer says so and we know the edit didn't
           reach the cloud. */
        if (r.error) { console.error('[cloud] push rejected:', r.error); setCloudStatus('error'); }
        else { setCloudDirty(false); setCloudStatus('synced'); }
      });
    }, 700);
    return () => window.clearTimeout(saveTimer.current);
  }, [history.present, userId]);

  /* Live-refresh: when another crew member saves, pull their change in — unless
     we have an edit of our own pending (our debounced save will win instead). */
  useEffect(() => {
    if (!cloudEnabled || !userId) return;
    const unsub = subscribeShared((doc, updatedAt) => {
      if (saveTimer.current) return; // mid-edit locally — don't stomp our work
      remoteHydrateRef.current = true;
      internalDispatch({ type: 'HYDRATE', state: doc });
      if (updatedAt) setCloudSyncedAt(updatedAt);
      setCloudStatus('synced');
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    const r = await saveSharedDoc(history.present);
    if (r.updatedAt) setCloudSyncedAt(r.updatedAt);
    if (!r.error) setCloudDirty(false);
    setCloudStatus('synced');
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
