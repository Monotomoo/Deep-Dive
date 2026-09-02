/* A written record of what the sync actually did.

   Three rounds of "nothing is being saved" were diagnosed by reading code and
   shipping a theory, because there was no way to see a real session. This is
   that way. Every load, decision, push and remote change is recorded with its
   outcome, kept in localStorage so it survives the refresh being investigated,
   and copyable in one click.

   It records facts, not opinions: what the cloud returned, which branch was
   taken and why, what the server said when a write was refused. */

import type { AppState } from '../types';

const KEY = 'deep-dive-sync-log';
const MAX = 60;

export type SyncEventKind =
  | 'auth'      // session appeared or went away
  | 'load'      // pulled the shared doc
  | 'decide'    // chose between keeping local and taking the cloud copy
  | 'push'      // wrote the shared doc
  | 'edit'      // a dispatch changed the document
  | 'verify'    // read the row back and compared it with what we sent
  | 'remote';   // another crew member's change arrived

export interface SyncEvent {
  t: string;                 // ISO time
  kind: SyncEventKind;
  ok: boolean;
  what: string;              // one plain sentence
  detail?: Record<string, unknown>;
}

export function logSync(kind: SyncEventKind, ok: boolean, what: string, detail?: Record<string, unknown>): void {
  const e: SyncEvent = { t: new Date().toISOString(), kind, ok, what, ...(detail ? { detail } : {}) };
  try {
    const raw = localStorage.getItem(KEY);
    const arr: SyncEvent[] = raw ? (JSON.parse(raw) as SyncEvent[]) : [];
    arr.push(e);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX)));
  } catch { /* a full or blocked localStorage must never break the app */ }
  /* Also to the console, so it is visible without opening the panel. */
  const line = `[sync] ${ok ? 'ok ' : 'FAIL'} ${kind} — ${what}`;
  if (ok) console.info(line, detail ?? ''); else console.error(line, detail ?? '');
}

export function readSyncLog(): SyncEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SyncEvent[]) : [];
  } catch { return []; }
}

export function clearSyncLog(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** The whole log as text, for pasting into a message. */
export function syncLogText(extra?: Record<string, unknown>): string {
  const head = [
    `Deep Dive sync log · ${new Date().toISOString()}`,
    `url: ${typeof location !== 'undefined' ? location.origin : '?'}`,
    extra ? `state: ${JSON.stringify(extra)}` : '',
    '',
  ].filter(Boolean);
  const body = readSyncLog().map((e) => {
    const time = e.t.slice(11, 19);
    const d = e.detail ? '  ' + JSON.stringify(e.detail) : '';
    return `${time} ${e.ok ? 'ok  ' : 'FAIL'} ${e.kind.padEnd(6)} ${e.what}${d}`;
  });
  return [...head, ...(body.length ? body : ['(nothing recorded yet)'])].join('\n');
}


/* A few real values out of the document, so a push and the next load can be
   compared directly. "The write succeeded" and "the write contained my edit"
   are different claims, and only this distinguishes them. */
export function fingerprint(doc: Partial<AppState>): Record<string, unknown> {
  const sum = (o?: Record<string, number>) =>
    o ? Object.values(o).reduce((a, b) => a + b, 0) : null;
  const sc = doc.scenarios?.realistic;
  return {
    havc: sc?.funding?.havc ?? null,
    income: sum(sc?.funding),
    costs: sum(sc?.costs),
    post: sc?.costs?.post ?? null,
    part1: doc.scenarioParts?.find((p) => p.order === 1)?.title?.slice(0, 24) ?? null,
    lane1: doc.mapLanes?.[0]?.title ?? null,
    nParts: doc.scenarioParts?.length ?? null,
  };
}
