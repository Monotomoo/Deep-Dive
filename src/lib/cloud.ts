import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '../types';
import { migrateLoaded } from './storage';

/* Cloud layer — optional Supabase sync, SHARED-PROJECT model.

   The whole thing is gated on `cloudEnabled`. With no VITE_SUPABASE_* env vars
   set, cloudEnabled is false, `cloud` is null, and every function here is inert
   — the app runs exactly as it always has, purely on localStorage.

   Configure a project (see SUPABASE.md) and the app becomes an authenticated,
   cloud-synced CREW tool. There is ONE shared document (`project = 'main'`) that
   every signed-in crew member reads and writes — everyone sees the same Deep
   Dive. Access is invite-only: only emails you invite in Supabase can sign in.

   Concurrency is last-write-wins on the whole JSON doc, debounced, with a
   Realtime subscription so each client live-refreshes when someone else saves.
   That keeps a small crew in sync; it is not per-field merge (that's Stage C). */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled: boolean = Boolean(URL && ANON);

export const cloud: SupabaseClient | null = cloudEnabled
  ? createClient(URL as string, ANON as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const TABLE = 'deep_dive_shared';
const SNAP_TABLE = 'deep_dive_snapshots';
const PROJECT = 'main'; // the single shared project every crew member edits

/* A stable per-tab id so we can tell our own Realtime echoes apart from
   genuine edits made by other crew members. */
export const clientId: string = `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

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

/* Invite-only: shouldCreateUser=false means an email that hasn't been invited
   in Supabase can't sign in — Supabase returns a "signups not allowed" error,
   which SignIn surfaces as "ask to be added." */
export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!cloud) return { error: 'Cloud is not configured.' };
  const { error } = await cloud.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
  });
  return { error: error?.message };
}

export async function signOutCloud(): Promise<void> {
  if (cloud) await cloud.auth.signOut();
}

/* Load the one shared project doc (same row for every crew member). */
export async function loadSharedDoc(): Promise<AppState | null> {
  if (!cloud) return null;
  const { data, error } = await cloud
    .from(TABLE)
    .select('doc')
    .eq('project', PROJECT)
    .maybeSingle();
  if (error) { console.warn('[cloud] load failed:', error.message); return null; }
  if (!data?.doc) return null;
  try { return migrateLoaded(data.doc as Partial<AppState>); } catch { return null; }
}

/* Upsert the shared project doc. `updated_by` carries our clientId so our own
   Realtime echo can be ignored by this tab. */
export async function saveSharedDoc(state: AppState): Promise<{ error?: string }> {
  if (!cloud) return {};
  const { error } = await cloud.from(TABLE).upsert(
    { project: PROJECT, doc: stripEphemeral(state), updated_at: new Date().toISOString(), updated_by: clientId },
    { onConflict: 'project' },
  );
  if (error) console.warn('[cloud] save failed:', error.message);
  return { error: error?.message };
}

/* ---------- Cloud snapshots ----------------------------------------------
   Crew-wide restore points. Unlike local snapshots these survive a dead laptop
   and — the real reason they exist — they're the only defence against someone
   overwriting the shared doc, since the shared doc is last-write-wins. */

export interface CloudSnapshot {
  id: string;
  name: string;
  createdAt: string;
  createdBy?: string;
}

export async function listCloudSnapshots(): Promise<CloudSnapshot[]> {
  if (!cloud) return [];
  const { data, error } = await cloud
    .from(SNAP_TABLE)
    .select('id, name, created_at, created_by')
    .eq('project', PROJECT)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.warn('[cloud] snapshot list failed:', error.message); return []; }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    createdAt: r.created_at as string,
    createdBy: (r.created_by as string | null) ?? undefined,
  }));
}

export async function saveCloudSnapshot(
  name: string,
  state: AppState,
  createdBy?: string,
): Promise<{ error?: string }> {
  if (!cloud) return { error: 'Cloud is not configured.' };
  const { error } = await cloud.from(SNAP_TABLE).insert({
    project: PROJECT,
    name,
    doc: stripEphemeral(state),
    created_by: createdBy ?? null,
  });
  if (error) console.warn('[cloud] snapshot save failed:', error.message);
  return { error: error?.message };
}

export async function restoreCloudSnapshot(id: string): Promise<AppState | null> {
  if (!cloud) return null;
  const { data, error } = await cloud.from(SNAP_TABLE).select('doc').eq('id', id).maybeSingle();
  if (error || !data?.doc) {
    if (error) console.warn('[cloud] snapshot restore failed:', error.message);
    return null;
  }
  try { return migrateLoaded(data.doc as Partial<AppState>); } catch { return null; }
}

export async function deleteCloudSnapshot(id: string): Promise<void> {
  if (!cloud) return;
  const { error } = await cloud.from(SNAP_TABLE).delete().eq('id', id);
  if (error) console.warn('[cloud] snapshot delete failed:', error.message);
}

/* Live-refresh: fire `onRemoteChange` with the fresh doc whenever ANOTHER
   client writes the shared row. Our own writes (matching clientId) are skipped.
   Returns an unsubscribe fn. */
export function subscribeShared(onRemoteChange: (doc: AppState) => void): () => void {
  if (!cloud) return () => {};
  const channel = cloud
    .channel('deep-dive-shared')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `project=eq.${PROJECT}` },
      (payload) => {
        const row = payload.new as { doc?: unknown; updated_by?: string } | undefined;
        if (!row?.doc) return;
        if (row.updated_by === clientId) return; // our own echo
        try { onRemoteChange(migrateLoaded(row.doc as Partial<AppState>)); } catch { /* ignore */ }
      },
    )
    .subscribe();
  return () => { cloud.removeChannel(channel); };
}
