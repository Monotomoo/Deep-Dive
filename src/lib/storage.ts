import type { AppState } from '../types';
import { makeInitialState } from './seed';

/* v7 bump (2026-07-13): beta prep — seeded watcher moments + physiology so
   those pillars aren't blank. Empty stored arrays [] would mask the new seed. */
const STORAGE_KEY = 'deep-dive-dashboard-v9';
const SPLASH_KEY = 'deep-dive-splash-seen';

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
  return {
    ...defaults,
    ...loaded,
    /* Hard guarantees on every array/object so views never crash on
       undefined access. Uses loaded-if-present-else-default merge. */
    scenarios: loaded.scenarios ?? defaults.scenarios,
    four: loaded.four ?? defaults.four,
    talents: loaded.talents ?? defaults.talents,
    threads: loaded.threads ?? defaults.threads,
    threadQuestions: loaded.threadQuestions ?? defaults.threadQuestions,
    spineIdeas: loaded.spineIdeas ?? defaults.spineIdeas,
    shoots: loaded.shoots ?? defaults.shoots,
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
