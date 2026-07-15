import type { AppState, FourKey, ViewKey } from '../types';

/* Gap Radar — the negative space.

   The app holds everything the film WANTS to be (threads, topics, questions,
   swings, spine ideas) and everything it HAS (shoot days, interviews, captures,
   records). The difference between those two is the most useful thing this data
   can produce, and nothing was computing it.

   This module is pure derivation: no new entities, nothing persisted, no side
   effects. computeGaps(state) in, ranked findings out. `now` is injectable so
   the ranking is testable. */

export type GapSeverity = 'blocking' | 'urgent' | 'open' | 'nudge';

export type GapKind =
  | 'shoot-unplanned'
  | 'shoot-contradiction'
  | 'contract-exposure'
  | 'thread-dark'
  | 'topic-unmined'
  | 'question-unasked'
  | 'holder-imbalance'
  | 'consent-pending'
  | 'swing-unevidenced'
  | 'watcher-uncaptured'
  | 'spine-undecided'
  | 'interview-stale'
  | 'coverage-unlocked'
  | 'risk-hot';

export interface Gap {
  id: string;
  severity: GapSeverity;
  kind: GapKind;
  title: string;
  detail: string;
  targetView: ViewKey;
  targetId?: string;
  /* Days until the thing that makes this urgent (negative = already past). */
  daysUntil?: number;
  score: number;
  /* Set when the finding is anchored to a shoot — lets the Overview map pulse. */
  shootId?: string;
}

/* Base weight per rule. Legal/consent exposure outranks creative gaps because
   an unsigned release can void footage you already paid to shoot. */
const WEIGHT: Record<GapKind, number> = {
  'contract-exposure': 100,
  'consent-pending': 88,
  'shoot-unplanned': 84,
  'shoot-contradiction': 70,
  'coverage-unlocked': 62,
  'risk-hot': 60,
  'interview-stale': 52,
  'watcher-uncaptured': 48,
  'thread-dark': 44,
  'spine-undecided': 40,
  'topic-unmined': 34,
  'holder-imbalance': 30,
  'swing-unevidenced': 26,
  'question-unasked': 20,
};

const DAY_MS = 86_400_000;

function daysBetween(fromIso: string | undefined, now: Date): number | undefined {
  if (!fromIso) return undefined;
  const t = Date.parse(fromIso);
  if (Number.isNaN(t)) return undefined;
  return Math.round((t - now.getTime()) / DAY_MS);
}

/* Urgency multiplier — the closer (or more overdue) a date, the louder.
   No date at all is treated as mildly urgent, not silent. */
function urgency(daysUntil: number | undefined): number {
  if (daysUntil === undefined) return 1;
  if (daysUntil < 0) return 2.2;      // already past — loudest
  if (daysUntil <= 7) return 2;
  if (daysUntil <= 21) return 1.6;
  if (daysUntil <= 45) return 1.3;
  if (daysUntil <= 90) return 1.1;
  return 0.85;
}

function severityFor(score: number): GapSeverity {
  if (score >= 140) return 'blocking';
  if (score >= 90) return 'urgent';
  if (score >= 45) return 'open';
  return 'nudge';
}

function make(
  kind: GapKind,
  id: string,
  title: string,
  detail: string,
  targetView: ViewKey,
  opts: { targetId?: string; daysUntil?: number; shootId?: string } = {},
): Gap {
  const score = Math.round(WEIGHT[kind] * urgency(opts.daysUntil));
  return {
    id: `gap-${kind}-${id}`,
    kind,
    severity: severityFor(score),
    title,
    detail,
    targetView,
    targetId: opts.targetId,
    daysUntil: opts.daysUntil,
    shootId: opts.shootId,
    score,
  };
}

const UPCOMING: ReadonlyArray<string> = ['planned', 'confirmed', 'in-progress'];

export function computeGaps(state: AppState, now: Date = new Date()): Gap[] {
  const gaps: Gap[] = [];
  const shootById = new Map(state.shoots.map((s) => [s.id, s]));
  const daysForShoot = (shootId: string | undefined) => {
    if (!shootId) return undefined;
    return daysBetween(shootById.get(shootId)?.startDate, now);
  };

  /* ---- Shoots ------------------------------------------------------- */
  for (const shoot of state.shoots) {
    const days = state.shootDays.filter((d) => d.shootId === shoot.id);
    const until = daysBetween(shoot.startDate, now);

    if (UPCOMING.includes(shoot.status) && days.length === 0) {
      gaps.push(
        make(
          'shoot-unplanned',
          shoot.id,
          `${shoot.title} has no days planned`,
          until === undefined
            ? `${shoot.location} — status "${shoot.status}", but not a single shoot day exists yet.`
            : until >= 0
              ? `${shoot.location} — ${until} day${until === 1 ? '' : 's'} out and not a single shoot day exists yet.`
              : `${shoot.location} — the start date passed ${Math.abs(until)} days ago and no days were ever planned.`,
          'shoots',
          { targetId: shoot.id, daysUntil: until, shootId: shoot.id },
        ),
      );
    }

    if (shoot.status === 'completed' && days.length === 0) {
      gaps.push(
        make(
          'shoot-contradiction',
          shoot.id,
          `${shoot.title} is marked completed but has no days`,
          `${shoot.location} — the shoot is closed out, yet nothing was ever logged. Either the record is wrong or the days were never written down.`,
          'shoots',
          { targetId: shoot.id, shootId: shoot.id },
        ),
      );
    }

    if (shoot.status === 'completed' && days.length > 0 && days.every((d) => !d.done)) {
      gaps.push(
        make(
          'shoot-contradiction',
          `${shoot.id}-undone`,
          `${shoot.title} is completed but no day is ticked done`,
          `${days.length} day${days.length === 1 ? '' : 's'} planned, none marked done — the shoot's own record contradicts its status.`,
          'shoots',
          { targetId: shoot.id, shootId: shoot.id },
        ),
      );
    }
  }

  /* ---- Contracts — the expensive kind of missing ---------------------- */
  for (const c of state.contracts) {
    if (c.status === 'signed') continue;
    const shoot = c.shootId ? shootById.get(c.shootId) : undefined;
    const shootUpcoming = shoot && UPCOMING.includes(shoot.status);
    const dueDays = daysBetween(c.dateDue, now);
    const shootDays = daysForShoot(c.shootId);
    const relevant = dueDays ?? shootDays;
    if (!shootUpcoming && dueDays === undefined) continue;

    gaps.push(
      make(
        'contract-exposure',
        c.id,
        `${c.partyName} — ${c.type.replace(/-/g, ' ')} not signed`,
        shoot
          ? `Status "${c.status}" against ${shoot.title}${shootDays !== undefined && shootDays >= 0 ? `, ${shootDays} days out` : ''}. Shooting a person without a signed release risks the footage.`
          : `Status "${c.status}"${dueDays !== undefined && dueDays < 0 ? `, due date passed ${Math.abs(dueDays)} days ago` : ''}.`,
        'contracts',
        { targetId: c.id, daysUntil: relevant, shootId: c.shootId },
      ),
    );
  }

  /* ---- Consent on holders -------------------------------------------- */
  for (const h of state.holders) {
    if (h.consent !== 'pending') continue;
    gaps.push(
      make(
        'consent-pending',
        h.id,
        `${h.name} hasn't consented`,
        `${h.relationship} to ${h.subjectKey} — consent is still pending, so this holder can't be filmed yet.`,
        'surface',
        { targetId: h.id },
      ),
    );
  }

  /* ---- Threads with no footage --------------------------------------- */
  for (const t of state.threads) {
    if (t.status === 'unopened') continue;
    const hit = state.interviews.some((i) => i.threadIds.includes(t.id));
    if (hit) continue;
    gaps.push(
      make(
        'thread-dark',
        t.id,
        `Thread ${t.num} · "${t.title}" has no interview`,
        `Status "${t.status}" but no interview session references it. The thread is live on paper and dark on tape.`,
        'threads',
        { targetId: t.id },
      ),
    );
  }

  /* ---- Topics never mined -------------------------------------------- */
  for (const topic of state.topics) {
    const hit = state.interviews.some((i) => i.topicIds?.includes(topic.id));
    if (hit) continue;
    gaps.push(
      make(
        'topic-unmined',
        topic.id,
        `Topic "${topic.title}" was never asked about`,
        `The question underneath it — "${topic.question}" — has no interview mining it.`,
        'cast',
        { targetId: topic.id },
      ),
    );
  }

  /* ---- Questions still in draft --------------------------------------- */
  const draftByThread = new Map<string, number>();
  for (const q of state.threadQuestions) {
    if (q.status !== 'draft') continue;
    draftByThread.set(q.threadId, (draftByThread.get(q.threadId) ?? 0) + 1);
  }
  for (const [threadId, count] of draftByThread) {
    const thread = state.threads.find((t) => t.id === threadId);
    if (!thread) continue;
    gaps.push(
      make(
        'question-unasked',
        threadId,
        `${count} question${count === 1 ? '' : 's'} never asked on "${thread.title}"`,
        `Still in draft — written down, never put to anyone.`,
        'threads',
        { targetId: threadId },
      ),
    );
  }

  /* ---- Holder imbalance ----------------------------------------------
     The thesis is "one person holds another." If one of the Four has barely
     any holders mapped, the film can't make that case for them. */
  if (state.four.length > 0 && state.holders.length > 0) {
    const counts = new Map<FourKey, number>();
    for (const f of state.four) counts.set(f.key, 0);
    for (const h of state.holders) {
      if (counts.has(h.subjectKey)) counts.set(h.subjectKey, (counts.get(h.subjectKey) ?? 0) + 1);
    }
    const values = [...counts.values()];
    const max = Math.max(...values);
    for (const [key, n] of counts) {
      /* Flag anyone at or below a third of the best-covered subject. */
      if (max >= 3 && n * 3 <= max) {
        const person = state.four.find((f) => f.key === key);
        gaps.push(
          make(
            'holder-imbalance',
            key,
            `${person?.name ?? key} has ${n} holder${n === 1 ? '' : 's'} mapped`,
            `The best-covered subject has ${max}. The film's whole thesis rests on who holds each of them — this one is thin.`,
            'surface',
            { targetId: person?.id },
          ),
        );
      }
    }
  }

  /* ---- Swings with nothing behind them -------------------------------- */
  for (const s of state.swings) {
    if (s.status === 'idea' || s.status === 'planned') {
      if (!s.shootId) {
        gaps.push(
          make(
            'swing-unevidenced',
            s.id,
            `Swing "${s.title}" isn't attached to a shoot`,
            `Status "${s.status}" with no shoot to actually attempt it on — an ambition with no date.`,
            'swings',
            { targetId: s.id },
          ),
        );
      }
    }
    if (s.status === 'attempted' && !s.achievedNote) {
      gaps.push(
        make(
          'swing-unevidenced',
          `${s.id}-outcome`,
          `Swing "${s.title}" was attempted with no outcome recorded`,
          `Nobody wrote down what happened.`,
          'swings',
          { targetId: s.id, shootId: s.shootId },
        ),
      );
    }
  }

  /* ---- Watcher moments never captured ---------------------------------
     These are the film's emotional centre — an uncaptured one on a finished
     shoot is a scene that no longer exists. */
  for (const w of state.watcherMoments) {
    if (w.captured) continue;
    const shoot = shootById.get(w.shootId);
    if (!shoot || shoot.status !== 'completed') continue;
    gaps.push(
      make(
        'watcher-uncaptured',
        w.id,
        `A watcher moment was missed on ${shoot.title}`,
        `${w.watcherKey} watching ${w.divingPersonKey} — "${w.moment}" — never captured, and the shoot is closed.`,
        'watchers',
        { targetId: w.id, shootId: w.shootId },
      ),
    );
  }

  /* ---- The spine is still undecided ------------------------------------ */
  if (state.spineIdeas.length > 0 && !state.spineIdeas.some((s) => s.status === 'leading')) {
    gaps.push(
      make(
        'spine-undecided',
        'global',
        'No spine idea is leading yet',
        `${state.spineIdeas.length} candidate${state.spineIdeas.length === 1 ? '' : 's'} on the board, none promoted. The film has no declared shape.`,
        'spine',
      ),
    );
  }

  /* ---- Interviews planned in the past ---------------------------------- */
  for (const i of state.interviews) {
    if (i.status !== 'planned') continue;
    const until = daysBetween(i.date, now);
    if (until === undefined || until >= 0) continue;
    const shoot = shootById.get(i.shootId);
    gaps.push(
      make(
        'interview-stale',
        i.id,
        `Interview with ${i.personKey} is still "planned"`,
        `Dated ${i.date}${shoot ? ` on ${shoot.title}` : ''} — ${Math.abs(until)} days ago. Either it happened and nobody updated it, or it never happened.`,
        'interviews',
        { targetId: i.id, daysUntil: until, shootId: i.shootId },
      ),
    );
  }

  /* ---- Coverage not locked before an upcoming shoot --------------------- */
  const unlockedByShoot = new Map<string, number>();
  for (const cam of state.coverageCams) {
    if (cam.locked) continue;
    const shoot = shootById.get(cam.shootId);
    if (!shoot || !UPCOMING.includes(shoot.status)) continue;
    unlockedByShoot.set(cam.shootId, (unlockedByShoot.get(cam.shootId) ?? 0) + 1);
  }
  for (const [shootId, count] of unlockedByShoot) {
    const shoot = shootById.get(shootId);
    const until = daysBetween(shoot?.startDate, now);
    gaps.push(
      make(
        'coverage-unlocked',
        shootId,
        `${count} camera${count === 1 ? '' : 's'} unlocked on ${shoot?.title ?? shootId}`,
        until !== undefined && until >= 0
          ? `${until} days out and the coverage plan still isn't locked.`
          : `The coverage plan was never locked.`,
        'camera-team',
        { targetId: shootId, daysUntil: until, shootId },
      ),
    );
  }

  /* ---- Hot risks -------------------------------------------------------- */
  for (const r of state.risks) {
    const open = r.status === undefined || r.status === 'open';
    if (!open) continue;
    if (r.probability !== 'high' || r.impact !== 'high') continue;
    gaps.push(
      make(
        'risk-hot',
        r.id,
        `Open risk · ${r.title}`,
        `High probability, high impact, still open. ${r.mitigation ? `Mitigation on file: ${r.mitigation}` : 'No mitigation recorded.'}`,
        'risks',
        { targetId: r.id },
      ),
    );
  }

  return gaps.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

/* Convenience roll-ups for the Overview hero + map. */

export function gapsBySeverity(gaps: Gap[]): Record<GapSeverity, Gap[]> {
  const out: Record<GapSeverity, Gap[]> = { blocking: [], urgent: [], open: [], nudge: [] };
  for (const g of gaps) out[g.severity].push(g);
  return out;
}

export function gapsForShoot(gaps: Gap[], shootId: string): Gap[] {
  return gaps.filter((g) => g.shootId === shootId);
}

export const SEVERITY_LABEL: Record<GapSeverity, string> = {
  blocking: 'blocking',
  urgent: 'urgent',
  open: 'open',
  nudge: 'nudge',
};

export const SEVERITY_COLOR: Record<GapSeverity, string> = {
  blocking: 'var(--color-danger)',
  urgent: 'var(--color-brass)',
  open: 'var(--color-warn)',
  nudge: 'var(--color-steel-light)',
};
