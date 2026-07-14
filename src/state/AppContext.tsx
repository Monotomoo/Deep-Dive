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
import { loadState, saveState } from '../lib/storage';
import {
  cloudEnabled, getSession, loadSharedDoc, onAuthChange, saveSharedDoc, signOutCloud, subscribeShared,
} from '../lib/cloud';
import { SignIn } from '../components/auth/SignIn';
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
  cloudStatus: 'off' | 'syncing' | 'synced';
  signOut: () => Promise<void>;
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
  const [cloudStatus, setCloudStatus] = useState<'off' | 'syncing' | 'synced'>(cloudEnabled ? 'syncing' : 'off');
  const cloudReadyRef = useRef(false); // have we pulled the cloud doc for this session yet?

  useEffect(() => {
    if (!cloudEnabled) return;
    let active = true;
    getSession().then((s) => { if (active) setSession(s); });
    const unsub = onAuthChange((s) => { if (active) { cloudReadyRef.current = false; setSession(s); } });
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
    loadSharedDoc().then((doc) => {
      if (!active) return;
      if (doc) {
        try { window.localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(history.present)); } catch { /* ignore */ }
        internalDispatch({ type: 'HYDRATE', state: doc });
      } else {
        // First crew member in — seed the shared project from local data.
        saveSharedDoc(history.present);
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
    setCloudStatus('syncing');
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveSharedDoc(history.present).then(() => setCloudStatus('synced'));
    }, 900);
    return () => window.clearTimeout(saveTimer.current);
  }, [history.present, userId]);

  /* Live-refresh: when another crew member saves, pull their change in — unless
     we have an edit of our own pending (our debounced save will win instead). */
  useEffect(() => {
    if (!cloudEnabled || !userId) return;
    const unsub = subscribeShared((doc) => {
      if (saveTimer.current) return; // mid-edit locally — don't stomp our work
      internalDispatch({ type: 'HYDRATE', state: doc });
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

  const publishLocal = useCallback(async () => {
    if (!cloudEnabled || !userId) return;
    setCloudStatus('syncing');
    await saveSharedDoc(history.present);
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
