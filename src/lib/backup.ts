import type { AppState } from '../types';
import { migrateLoaded } from './storage';

/* Backup — export / import the whole film as a file.

   Until now the only copies of this workbook were a browser's localStorage and
   (optionally) a last-write-wins cloud doc with no restore path. One cleared
   browser and the film's brain was gone. This module is the insurance. */

export const BACKUP_FORMAT = 'deep-dive-backup';
export const BACKUP_VERSION = 1;

export interface BackupEnvelope {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  appVersion?: string;
  doc: AppState;
}

/* A quick, human-readable census of what's in a doc — shown before an import
   replaces anything, so nobody restores a stale file blind. */
export interface BackupSummary {
  exportedAt?: string;
  shoots: number;
  shootDays: number;
  interviews: number;
  threads: number;
  holders: number;
  hubIdeas: number;
  records: number;
  notes: number;
}

export function summarize(state: AppState): BackupSummary {
  return {
    shoots: state.shoots?.length ?? 0,
    shootDays: state.shootDays?.length ?? 0,
    interviews: state.interviews?.length ?? 0,
    threads: state.threads?.length ?? 0,
    holders: state.holders?.length ?? 0,
    hubIdeas: state.hubIdeas?.length ?? 0,
    records: state.records?.length ?? 0,
    notes: state.notes?.length ?? 0,
  };
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Download the whole state as a timestamped JSON file. */
export function exportJson(state: AppState): string {
  const envelope: BackupEnvelope = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    doc: { ...state, paletteOpen: false, captureOpen: false, printMode: false },
  };
  const filename = `deep-dive-${stamp(new Date())}.json`;
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  /* Revoke on the next tick — Safari needs the URL alive through the click. */
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export type ImportResult =
  | { ok: true; state: AppState; summary: BackupSummary }
  | { ok: false; error: string };

/* Accepts either a v1 envelope or a bare AppState (an older hand-saved dump).
   Everything runs through migrateLoaded, so a v10-era file lands on the current
   shape rather than half-populating it. */
export function parseBackup(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: "That file doesn't contain a Deep Dive backup." };
  }

  const maybe = parsed as Partial<BackupEnvelope> & Partial<AppState>;
  const doc: unknown =
    maybe.format === BACKUP_FORMAT && maybe.doc ? maybe.doc : parsed;

  if (!doc || typeof doc !== 'object') {
    return { ok: false, error: 'The backup envelope is empty.' };
  }
  /* Sanity-check that this is a Deep Dive doc and not some other JSON — every
     real doc has these. */
  const probe = doc as Partial<AppState>;
  const looksRight =
    Array.isArray(probe.shoots) || Array.isArray(probe.threads) || Array.isArray(probe.four);
  if (!looksRight) {
    return { ok: false, error: "This JSON isn't a Deep Dive workbook (no shoots, threads, or four)." };
  }

  try {
    const state = migrateLoaded(probe);
    return {
      ok: true,
      state,
      summary: { ...summarize(state), exportedAt: maybe.exportedAt },
    };
  } catch {
    return { ok: false, error: 'The backup could not be migrated to the current format.' };
  }
}

export async function readFile(file: File): Promise<ImportResult> {
  try {
    return parseBackup(await file.text());
  } catch {
    return { ok: false, error: 'That file could not be read.' };
  }
}
