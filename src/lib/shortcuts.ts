import type { ScenarioKey, ViewKey } from '../types';

/* Order used by ⌘1–⌘9 sidebar view shortcuts */
export const VIEW_ORDER: ViewKey[] = [
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

export type UiMode = 'simple' | 'full';
export const UI_MODE_KEY = 'deep-dive-ui-mode';

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
