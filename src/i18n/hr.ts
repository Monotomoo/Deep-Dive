/* Croatian locale retired (v0.9) — the app is English-only now.
   Kept as an empty Partial so the locale plumbing still type-checks;
   every lookup falls back to en.ts, the single source of truth. */

import type { Strings } from './en';

export const hr: Partial<Strings> = {};
