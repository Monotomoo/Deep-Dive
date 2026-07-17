import type { AppState } from '../types';
import { makeInitialState } from './seed';

/* v15 bump (2026-07-15): HAVC funding fixed at €30k in every scenario — a
   stored v14 doc keeps the old 40/60/80 and would misreport the funding gap.
   v14: physiology gained Sanda and Zsófia, six new signals, and an honest
   `provenance` flag — a stored v13 doc has only the old three series.
   v13: flights out of the USA cost tracker — it prices the road-trip on the
   ground, and air fare is budgeted elsewhere.
   v12: family removed from the plan — Petar's father and Zsófia's sister as
   holders, plus the biographical beats about Sanda's father and Vito's mother.
   v11: shoots gained lat/lng for the Overview map; Note gained authorLabel. */
const STORAGE_KEY = 'deep-dive-dashboard-v15';
const SPLASH_KEY = 'deep-dive-splash-seen';
const SNAPSHOT_KEY = 'deep-dive-snapshots-v1';

/** A restore point. Kept small in number — this is a scratch safety net, not an archive. */
export interface LocalSnapshot {
  id: string;
  name: string;
  createdAt: string;
  doc: AppState;
}

const MAX_LOCAL_SNAPSHOTS = 12;

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return migrateState(parsed);
  } catch {
    return null;
  }
}

function migrateState(loaded: Partial<AppState>): AppState {
  const defaults = makeInitialState();
  /* Coordinates arrived in v11. A cloud doc written before that has shoots with
     no lat/lng and would silently vanish from the map, so backfill from the
     seed by shoot key while leaving every user-edited field alone. */
  const seedCoords = new Map(defaults.shoots.map((s) => [s.key, { lat: s.lat, lng: s.lng }]));
  const shoots = (loaded.shoots ?? defaults.shoots).map((s) =>
    s.lat === undefined && s.lng === undefined ? { ...s, ...(seedCoords.get(s.key) ?? {}) } : s,
  );
  return {
    ...defaults,
    ...loaded,
    shoots,
    /* Hard guarantees on every array/object so views never crash on
       undefined access. Uses loaded-if-present-else-default merge. */
    scenarios: loaded.scenarios ?? defaults.scenarios,
    four: loaded.four ?? defaults.four,
    talents: loaded.talents ?? defaults.talents,
    threads: loaded.threads ?? defaults.threads,
    threadQuestions: loaded.threadQuestions ?? defaults.threadQuestions,
    spineIdeas: loaded.spineIdeas ?? defaults.spineIdeas,
    shootDays: loaded.shootDays ?? defaults.shootDays,
    coverageCams: loaded.coverageCams ?? defaults.coverageCams,
    interviews: loaded.interviews ?? defaults.interviews,
    swings: loaded.swings ?? defaults.swings,
    devices: loaded.devices ?? defaults.devices,
    rituals: loaded.rituals ?? defaults.rituals,
    watcherMoments: loaded.watcherMoments ?? defaults.watcherMoments,
    records: loaded.records ?? defaults.records,
    attempts: loaded.attempts ?? defaults.attempts,
    physiology: loaded.physiology ?? defaults.physiology,
    evidence2023: loaded.evidence2023 ?? defaults.evidence2023,
    cameras: loaded.cameras ?? defaults.cameras,
    lenses: loaded.lenses ?? defaults.lenses,
    microphones: loaded.microphones ?? defaults.microphones,
    lights: loaded.lights ?? defaults.lights,
    crew: loaded.crew ?? defaults.crew,
    schedulePhases: loaded.schedulePhases ?? defaults.schedulePhases,
    milestones: loaded.milestones ?? defaults.milestones,
    calendarEvents: loaded.calendarEvents ?? defaults.calendarEvents,
    holders: loaded.holders ?? defaults.holders,
    choirQuestions: loaded.choirQuestions ?? defaults.choirQuestions,
    choirEntries: loaded.choirEntries ?? defaults.choirEntries,
    lifeEvents: loaded.lifeEvents ?? defaults.lifeEvents,
    motifChains: loaded.motifChains ?? defaults.motifChains,
    storyEvents: loaded.storyEvents ?? defaults.storyEvents,
    topics: loaded.topics ?? defaults.topics,
    hubIdeas: loaded.hubIdeas ?? defaults.hubIdeas,
    usaTrip: loaded.usaTrip ?? defaults.usaTrip,
    locale: 'en',
    sponsors: loaded.sponsors ?? defaults.sponsors,
    risks: loaded.risks ?? defaults.risks,
    contracts: loaded.contracts ?? defaults.contracts,
    journalEntries: loaded.journalEntries ?? defaults.journalEntries,
    references: loaded.references ?? defaults.references,
    festivals: loaded.festivals ?? defaults.festivals,
    salesAgents: loaded.salesAgents ?? defaults.salesAgents,
    broadcasters: loaded.broadcasters ?? defaults.broadcasters,
    pitchCards: loaded.pitchCards ?? defaults.pitchCards,
    pitchDecks: loaded.pitchDecks ?? defaults.pitchDecks,
    tasks: loaded.tasks ?? defaults.tasks,
    notes: loaded.notes ?? defaults.notes,
    assets: loaded.assets ?? defaults.assets,
  };
}

/** Public wrapper — run the same defensive merge on a doc loaded from the cloud. */
export function migrateLoaded(loaded: Partial<AppState>): AppState {
  return migrateState(loaded);
}

export function saveState(state: AppState): void {
  try {
    const persistable = {
      ...state,
      paletteOpen: false,
      captureOpen: false,
      printMode: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    /* quota / unavailable — silently degrade */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/* ---------- Local snapshots ----------------------------------------------
   Fast, free, per-browser restore points. These protect against "I broke
   something in the last hour." They do NOT protect against a dead laptop or a
   crew member overwriting the shared cloud doc — cloud snapshots cover that. */

export function listLocalSnapshots(): LocalSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function writeLocalSnapshots(list: LocalSnapshot[]): boolean {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(list.slice(0, MAX_LOCAL_SNAPSHOTS)));
    return true;
  } catch {
    /* Almost always a quota error — the caller surfaces it rather than
       pretending the snapshot was taken. */
    return false;
  }
}

export function saveLocalSnapshot(name: string, state: AppState): LocalSnapshot | null {
  const snap: LocalSnapshot = {
    id: `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
    doc: { ...state, paletteOpen: false, captureOpen: false, printMode: false },
  };
  const next = [snap, ...listLocalSnapshots()];
  return writeLocalSnapshots(next) ? snap : null;
}

export function restoreLocalSnapshot(id: string): AppState | null {
  const found = listLocalSnapshots().find((s) => s.id === id);
  if (!found) return null;
  try {
    return migrateState(found.doc as Partial<AppState>);
  } catch {
    return null;
  }
}

export function deleteLocalSnapshot(id: string): void {
  writeLocalSnapshots(listLocalSnapshots().filter((s) => s.id !== id));
}

export function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    sessionStorage.setItem(SPLASH_KEY, '1');
  } catch {
    /* noop */
  }
}

export function estimateStorageMB(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k) ?? '';
      total += k.length + v.length;
    }
    return total / (1024 * 1024);
  } catch {
    return 0;
  }
}
