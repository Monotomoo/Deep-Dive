import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '../types';
import { migrateLoaded } from './storage';

/* Cloud layer (Stage A) — optional Supabase sync.

   The whole thing is gated on `cloudEnabled`. With no VITE_SUPABASE_* env vars
   set, cloudEnabled is false, `cloud` is null, and every function here is inert
   — the app runs exactly as it always has, purely on localStorage.

   Configure a project (see SUPABASE.md) and the app becomes an authenticated,
   cloud-synced, multi-device tool. Stage A stores the entire AppState as one
   JSON document per signed-in user. */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled: boolean = Boolean(URL && ANON);

export const cloud: SupabaseClient | null = cloudEnabled
  ? createClient(URL as string, ANON as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const TABLE = 'deep_dive_projects';
const PROJECT = 'main'; // Stage A: a single project document per user

function stripEphemeral(state: AppState): AppState {
  return { ...state, paletteOpen: false, captureOpen: false, printMode: false };
}

export async function getSession(): Promise<Session | null> {
  if (!cloud) return null;
  const { data } = await cloud.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  if (!cloud) return () => {};
  const { data } = cloud.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!cloud) return { error: 'Cloud is not configured.' };
  const { error } = await cloud.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return { error: error?.message };
}

export async function signOutCloud(): Promise<void> {
  if (cloud) await cloud.auth.signOut();
}

export async function loadCloudDoc(userId: string): Promise<AppState | null> {
  if (!cloud) return null;
  const { data, error } = await cloud
    .from(TABLE)
    .select('doc')
    .eq('owner', userId)
    .eq('project', PROJECT)
    .maybeSingle();
  if (error) { console.warn('[cloud] load failed:', error.message); return null; }
  if (!data?.doc) return null;
  try { return migrateLoaded(data.doc as Partial<AppState>); } catch { return null; }
}

export async function saveCloudDoc(userId: string, state: AppState): Promise<{ error?: string }> {
  if (!cloud) return {};
  const { error } = await cloud.from(TABLE).upsert(
    { owner: userId, project: PROJECT, doc: stripEphemeral(state), updated_at: new Date().toISOString() },
    { onConflict: 'owner,project' },
  );
  if (error) console.warn('[cloud] save failed:', error.message);
  return { error: error?.message };
}
