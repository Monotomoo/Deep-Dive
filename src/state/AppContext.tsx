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
  cloudEnabled, getSession, loadCloudDoc, onAuthChange, saveCloudDoc, signOutCloud,
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
}

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

  /* Pull the cloud doc once when a session appears; seed it if empty. */
  const userId = session?.user.id;
  useEffect(() => {
    if (!cloudEnabled || !userId) return;
    let active = true;
    setCloudStatus('syncing');
    loadCloudDoc(userId).then((doc) => {
      if (!active) return;
      if (doc) internalDispatch({ type: 'HYDRATE', state: doc });
      else saveCloudDoc(userId, history.present);
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
      saveCloudDoc(userId, history.present).then(() => setCloudStatus('synced'));
    }, 900);
    return () => window.clearTimeout(saveTimer.current);
  }, [history.present, userId]);

  const signOut = useCallback(async () => {
    await signOutCloud();
    cloudReadyRef.current = false;
    setSession(null);
  }, []);

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
