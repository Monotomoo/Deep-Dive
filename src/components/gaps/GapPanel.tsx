import { useMemo } from 'react';
import { AlertTriangle, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { computeGaps, SEVERITY_COLOR, type Gap, type GapSeverity } from '../../lib/gaps';

/* Shared Gap Radar rendering. The Overview uses GapHero (the top few, as the
   front page's headline); GapRadarView uses GapRow for the full ranked list. */

function daysLabel(g: Gap): string | null {
  if (g.daysUntil === undefined) return null;
  if (g.daysUntil < 0) return `${Math.abs(g.daysUntil)}d overdue`;
  if (g.daysUntil === 0) return 'today';
  return `in ${g.daysUntil}d`;
}

export function GapRow({ gap, onOpen }: { gap: Gap; onOpen: (g: Gap) => void }) {
  const days = daysLabel(gap);
  return (
    <button
      type="button"
      onClick={() => onOpen(gap)}
      className="group w-full text-left flex items-start gap-3 py-2.5 px-3 rounded-[3px] hover:bg-[color:var(--color-paper-deep)]/50 transition-colors"
    >
      <span
        className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: SEVERITY_COLOR[gap.severity] }}
        aria-hidden
      />
      <span className="flex-1 min-w-0">
        <span className="flex items-baseline gap-2 flex-wrap">
          <span className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-snug">{gap.title}</span>
          {days && (
            <span
              className="font-sans text-[11px] tracking-[0.1em] uppercase shrink-0"
              style={{ color: SEVERITY_COLOR[gap.severity] }}
            >
              {days}
            </span>
          )}
        </span>
        <span className="block prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mt-0.5">
          {gap.detail}
        </span>
      </span>
      <ArrowUpRight
        size={13}
        className="mt-1 shrink-0 text-[color:var(--color-on-paper-faint)] opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  );
}

export function useGaps(): Gap[] {
  const { state } = useApp();
  return useMemo(() => computeGaps(state), [state]);
}

export function useOpenGap(): (g: Gap) => void {
  const { dispatch } = useApp();
  return (g: Gap) => {
    if (g.shootId) dispatch({ type: 'SELECT_SHOOT', id: g.shootId });
    dispatch({ type: 'SET_VIEW', view: g.targetView });
  };
}

export function AllClear({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${compact ? 'py-3' : 'py-8 justify-center'}`}>
      <Check size={compact ? 14 : 18} className="text-[color:var(--color-success)]" />
      <span className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)]">
        Nothing is missing. Every shoot is planned, every thread has tape, every release is signed.
      </span>
    </div>
  );
}

const HERO_LIMIT = 5;

/** The Overview headline: what needs you now, ranked. */
export function GapHero() {
  const gaps = useGaps();
  const open = useOpenGap();
  const { dispatch } = useApp();

  const top = gaps.slice(0, HERO_LIMIT);
  const counts = gaps.reduce<Record<GapSeverity, number>>(
    (acc, g) => { acc[g.severity] += 1; return acc; },
    { blocking: 0, urgent: 0, open: 0, nudge: 0 },
  );

  return (
    <section className="bg-[color:var(--color-paper-card)] rounded-[4px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden">
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-[color:var(--color-brass)]" />
          <h2 className="label-caps text-[color:var(--color-on-paper-muted)]">what needs you now</h2>
        </div>
        {gaps.length > 0 && (
          <div className="flex items-center gap-3 font-sans text-[11px] tracking-[0.08em]">
            {(['blocking', 'urgent', 'open'] as const).map((s) =>
              counts[s] > 0 ? (
                <span key={s} style={{ color: SEVERITY_COLOR[s] }}>
                  {counts[s]} {s}
                </span>
              ) : null,
            )}
          </div>
        )}
      </header>

      {gaps.length === 0 ? (
        <div className="px-4 pb-3"><AllClear compact /></div>
      ) : (
        <>
          <div className="px-1 pb-1">
            {top.map((g) => <GapRow key={g.id} gap={g} onOpen={open} />)}
          </div>
          {gaps.length > HERO_LIMIT && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'gap-radar' })}
              className="w-full text-left px-4 py-2.5 border-t-[0.5px] border-[color:var(--color-border-paper)] font-sans text-[11px] tracking-[0.12em] uppercase text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] transition-colors"
            >
              all {gaps.length} findings →
            </button>
          )}
        </>
      )}
    </section>
  );
}
