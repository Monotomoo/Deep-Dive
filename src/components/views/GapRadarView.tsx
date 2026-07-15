import { useState } from 'react';
import { gapsBySeverity, SEVERITY_COLOR, type GapSeverity } from '../../lib/gaps';
import { AllClear, GapRow, useGaps, useOpenGap } from '../gaps/GapPanel';

/* Gap Radar — the negative space, in full.

   Everything here is derived live from the workbook. Nothing is stored, so a
   finding disappears the moment the underlying hole is filled. That's the
   point: this list is only ever as long as the work that's actually missing. */

const ORDER: GapSeverity[] = ['blocking', 'urgent', 'open', 'nudge'];

const BLURB: Record<GapSeverity, string> = {
  blocking: 'Fix before you roll. Legal exposure, or a shoot that cannot happen as recorded.',
  urgent: 'Time is the problem here — these get worse on their own.',
  open: 'Real holes in the film. No deadline, but the story is thinner without them.',
  nudge: 'Housekeeping. Worth a pass when you have a quiet hour.',
};

export function GapRadarView() {
  const gaps = useGaps();
  const open = useOpenGap();
  const grouped = gapsBySeverity(gaps);
  const [only, setOnly] = useState<GapSeverity | 'all'>('all');

  if (gaps.length === 0) {
    return (
      <div className="max-w-[760px]">
        <AllClear />
      </div>
    );
  }

  const shown = ORDER.filter((s) => grouped[s].length > 0 && (only === 'all' || only === s));

  return (
    <div className="max-w-[860px] space-y-6">
      <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] max-w-[62ch]">
        The film knows what it wants to be — threads, topics, questions, swings — and it knows what it
        has. This is the difference between the two, ranked by what hurts soonest. It's computed fresh
        every time you look; fill the hole and the line disappears.
      </p>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setOnly('all')}
          className={`font-sans text-[11px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-[3px] border-[0.5px] transition-colors ${
            only === 'all'
              ? 'border-[color:var(--color-border-brass)] text-[color:var(--color-brass)]'
              : 'border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'
          }`}
        >
          all {gaps.length}
        </button>
        {ORDER.map((s) =>
          grouped[s].length > 0 ? (
            <button
              key={s}
              type="button"
              onClick={() => setOnly(only === s ? 'all' : s)}
              className={`font-sans text-[11px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-[3px] border-[0.5px] transition-colors ${
                only === s ? 'border-current' : 'border-[color:var(--color-border-paper)] opacity-70 hover:opacity-100'
              }`}
              style={{ color: SEVERITY_COLOR[s] }}
            >
              {grouped[s].length} {s}
            </button>
          ) : null,
        )}
      </div>

      {shown.map((sev) => (
        <section key={sev}>
          <header className="flex items-baseline gap-2.5 mb-1 px-3">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERITY_COLOR[sev] }} aria-hidden />
            <h2 className="label-caps" style={{ color: SEVERITY_COLOR[sev] }}>
              {sev} · {grouped[sev].length}
            </h2>
          </header>
          <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] mb-1.5 px-3 pl-[22px]">
            {BLURB[sev]}
          </p>
          <div className="bg-[color:var(--color-paper-card)] rounded-[4px] border-[0.5px] border-[color:var(--color-border-paper)] py-1">
            {grouped[sev].map((g) => <GapRow key={g.id} gap={g} onOpen={open} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
