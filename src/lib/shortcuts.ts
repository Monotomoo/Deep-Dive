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
