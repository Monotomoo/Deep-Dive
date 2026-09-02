import type { AppState } from '../types';
import { makeInitialState } from './seed';

/* v17 bump (2026-08-19): the Scenario rebuilt around the four connected
   stories (scenarioArcs) + nine parts from Tomo's full outline (Zso's Lastovo
   WR, the Sicily training month with Molchanov, the records attack, the
   Philippines, the 2023 studio sessions). scenarioSeedVersion gates a content
   upgrade for docs that already carry the old parts — including the cloud doc.
   v16: the Scenario module, 4 Lastovo topics, Krk as the championship,
   Lastovo completed, Pero's blackout event.
   v15: HAVC funding fixed at €30k in every scenario — a stored v14 doc keeps
   the old 40/60/80 and would misreport the funding gap.
   v14: physiology gained Sanda and Zsófia, six new signals, and an honest
   `provenance` flag — a stored v13 doc has only the old three series.
   v13: flights out of the USA cost tracker — it prices the road-trip on the
   ground, and air fare is budgeted elsewhere.
   v12: family removed from the plan — Petar's father and Zsófia's sister as
   holders, plus the biographical beats about Sanda's father and Vito's mother.
   v11: shoots gained lat/lng for the Overview map; Note gained authorLabel. */
export const STORAGE_KEY = 'deep-dive-dashboard-v17';
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

/* Add what is new from the seed; never overwrite what is already there.

   This replaces a wholesale swap that was quietly destroying work. The old
   rule was "if the doc's generation is behind, take the seed's copy of these
   collections" — which meant every time a new build shipped, the next load
   threw away whatever the crew had written in the scenario, the map, the
   shoots and the records. Eight generations shipped in one day; eight silent
   wipes of a shared document.

   The rule now: an item the doc already has is the crew's, full stop. Items
   the seed has and the doc does not are new content and get added. Nothing is
   ever removed. The cost is that a correction to an EXISTING seed item no
   longer reaches an existing doc — which is the right trade, because the
   alternative is losing somebody's afternoon. */
function mergeById<T extends { id: string }>(loaded: T[] | undefined, seed: T[]): T[] {
  if (!loaded) return seed;
  const have = new Set(loaded.map((x) => x.id));
  const added = seed.filter((x) => !have.has(x.id));
  return added.length ? [...loaded, ...added] : loaded;
}

/* Shoots are keyed by `key`, not `id`, everywhere else in the app. */
function mergeByKey<T extends { key: string }>(loaded: T[] | undefined, seed: T[]): T[] {
  if (!loaded) return seed;
  const have = new Set(loaded.map((x) => x.key));
  const added = seed.filter((x) => !have.has(x.key));
  return added.length ? [...loaded, ...added] : loaded;
}

function migrateState(loaded: Partial<AppState>): AppState {
  const defaults = makeInitialState();
  /* The budget was restructured on generation 8 — "Production (shoots)" became
     four separate categories, so an old doc's cost keys no longer describe the
     same thing and cannot be merged item by item. This is the ONE gate that
     still replaces, it fires once per doc, and it exists because the budget was
     rebuilt on request rather than edited. Everything else merges. */
  const budgetRestructure = (loaded.moneySeedVersion ?? 0) < 8;
  /* Coordinates arrived in v11. A cloud doc written before that has shoots with
     no lat/lng and would silently vanish from the map, so backfill from the
     seed by shoot key while leaving every user-edited field alone. */
  const seedCoords = new Map(defaults.shoots.map((s) => [s.key, { lat: s.lat, lng: s.lng }]));
  const shoots = mergeByKey(loaded.shoots, defaults.shoots).map((s) =>
    s.lat === undefined && s.lng === undefined ? { ...s, ...(seedCoords.get(s.key) ?? {}) } : s,
  );
  return {
    ...defaults,
    ...loaded,
    shoots,
    /* Hard guarantees on every array/object so views never crash on
       undefined access. Uses loaded-if-present-else-default merge. */
    /* The budget is gated on its OWN generation. It used to ride along with
       the story's, which meant retuning the money reset the screenplay and
       rewriting the screenplay reset the money. */
    scenarios: budgetRestructure ? defaults.scenarios : (loaded.scenarios ?? defaults.scenarios),
    four: loaded.four ?? defaults.four,
    talents: loaded.talents ?? defaults.talents,
    threads: loaded.threads ?? defaults.threads,
    threadQuestions: loaded.threadQuestions ?? defaults.threadQuestions,
    spineIdeas: loaded.spineIdeas ?? defaults.spineIdeas,
    shootDays: mergeById(loaded.shootDays, defaults.shootDays),
    coverageCams: loaded.coverageCams ?? defaults.coverageCams,
    interviews: mergeById(loaded.interviews, defaults.interviews),
    swings: loaded.swings ?? defaults.swings,
    devices: loaded.devices ?? defaults.devices,
    rituals: loaded.rituals ?? defaults.rituals,
    watcherMoments: loaded.watcherMoments ?? defaults.watcherMoments,
    records: mergeById(loaded.records, defaults.records),
    attempts: loaded.attempts ?? defaults.attempts,
    physiology: loaded.physiology ?? defaults.physiology,
    evidence2023: loaded.evidence2023 ?? defaults.evidence2023,
    cameras: loaded.cameras ?? defaults.cameras,
    lenses: loaded.lenses ?? defaults.lenses,
    microphones: loaded.microphones ?? defaults.microphones,
    lights: loaded.lights ?? defaults.lights,
    crew: loaded.crew ?? defaults.crew,
    schedulePhases: mergeById(loaded.schedulePhases, defaults.schedulePhases),
    milestones: mergeById(loaded.milestones, defaults.milestones),
    calendarEvents: mergeById(loaded.calendarEvents, defaults.calendarEvents),
    holders: loaded.holders ?? defaults.holders,
    choirQuestions: loaded.choirQuestions ?? defaults.choirQuestions,
    choirEntries: loaded.choirEntries ?? defaults.choirEntries,
    lifeEvents: loaded.lifeEvents ?? defaults.lifeEvents,
    motifChains: loaded.motifChains ?? defaults.motifChains,
    storyEvents: mergeById(loaded.storyEvents, defaults.storyEvents),
    topics: mergeById(loaded.topics, defaults.topics),
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
    /* Merged, not replaced: new parts and stories arrive, existing ones are
       whatever the crew last made them. */
    scenarioParts: mergeById(loaded.scenarioParts, defaults.scenarioParts),
    scenarioArcs: mergeById(loaded.scenarioArcs, defaults.scenarioArcs),
    /* Same for the map: new stages and marks arrive, edited ones stay. */
    mapLanes: mergeById(loaded.mapLanes, defaults.mapLanes),
    mapNodes: mergeById(loaded.mapNodes, defaults.mapNodes),
    mapAsides: mergeById(loaded.mapAsides, defaults.mapAsides),
    scenarioSeedVersion: Math.max(loaded.scenarioSeedVersion ?? 1, defaults.scenarioSeedVersion),
    moneySeedVersion: Math.max(loaded.moneySeedVersion ?? 0, defaults.moneySeedVersion),
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

/* The cloud row's updated_at as of this browser's last successful sync (push,
   pull, or realtime). On load we compare the cloud's current updated_at to this:
   if the cloud hasn't advanced past it, our LOCAL copy is authoritative (it may
   hold edits the debounced push never sent) and we keep it instead of letting a
   stale cloud pull overwrite them. */
const CLOUD_SYNCED_AT_KEY = 'deep-dive-cloud-synced-at';
/* True while this browser holds a local edit the cloud hasn't confirmed yet.
   Set the moment a user edit happens (BEFORE the debounced push — so a refresh
   inside the debounce window still knows), cleared when a push lands. On load,
   dirty + an unmoved cloud = keep the local copy and push it up. */
const CLOUD_DIRTY_KEY = 'deep-dive-cloud-dirty';

export function getCloudDirty(): boolean {
  try { return localStorage.getItem(CLOUD_DIRTY_KEY) === '1'; } catch { return false; }
}

export function setCloudDirty(dirty: boolean): void {
  try {
    if (dirty) localStorage.setItem(CLOUD_DIRTY_KEY, '1');
    else localStorage.removeItem(CLOUD_DIRTY_KEY);
  } catch { /* noop */ }
}

export function getCloudSyncedAt(): string | null {
  try { return localStorage.getItem(CLOUD_SYNCED_AT_KEY); } catch { return null; }
}

export function setCloudSyncedAt(iso: string): void {
  try { localStorage.setItem(CLOUD_SYNCED_AT_KEY, iso); } catch { /* noop */ }
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
