import type { ScenarioKey, ViewKey } from '../types';

/* Full mode is hidden for now (September 2026): the crew gets the simple
   version only. The other modules still exist and still render when something
   links into them (a chip in The Scenario, say); they are just off every menu,
   shortcut and search until this flips back to true. */
export const FULL_MODE_AVAILABLE = false;

/* Order used by ⌘1–⌘9 sidebar view shortcuts */
const FULL_VIEW_ORDER: ViewKey[] = [
  'overview',
  'four',
  'threads',
  'shoots',
  'spine',
  'interviews',
  'swings',
  'devices',
  'records',
];

/* The simple version — the six pillars the crew opens every day, plus the three
   extras chosen in the scoping pass (Threads, Schedule, the Scenario board).
   Everything else still exists and renders; it's just hidden from the menu until
   you flip to Full. Order here is the order shown in the simple sidebar. */
export const SIMPLE_VIEWS: readonly ViewKey[] = [
  'overview',
  'gap-radar',
  'screenplay',
  'story-map',
  'four',
  'cast',
  'shoots',
  'schedule',
  'idea-hub',
  'threads',
  'scenario',
  'pitch-deck',
];

export const SIMPLE_VIEW_SET: ReadonlySet<ViewKey> = new Set(SIMPLE_VIEWS);

/* ⌘1–⌘9 — the first nine of whichever menu is showing. */
export const VIEW_ORDER: ViewKey[] = FULL_MODE_AVAILABLE ? FULL_VIEW_ORDER : SIMPLE_VIEWS.slice(0, 9);

export type UiMode = 'simple' | 'full';
export const UI_MODE_KEY = 'deep-dive-ui-mode';

/* What the three plans are called. The KEYS stay lean/realistic/ambitious —
   they are wired through the whole app and the stored document — but what they
   MEAN is who buys the film, so every surface prints the name, never the key. */
export const SCENARIO_LABEL: Record<ScenarioKey, string> = {
  lean: 'HRT',
  realistic: 'Networks',
  ambitious: 'Platform',
};

export const SCENARIO_KEYS: Record<string, ScenarioKey> = {
  '1': 'lean',
  '2': 'realistic',
  '3': 'ambitious',
};

export function isMod(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}
