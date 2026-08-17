import { useMemo } from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { FUNDING_SOURCES, COST_CATEGORIES } from '../../lib/seed';
import type { ScenarioKey } from '../../types';

/* Scenario board — the money, on one screen.

   Three plans side by side: what each can raise, what each costs, and the gap
   between. This is the "scenario" pillar of the simple version — the financial
   truth a producer needs at a glance, without the tabbed Pitch view. Click a
   column to make it the active scenario everywhere else in the app. */

const ORDER: ScenarioKey[] = ['lean', 'realistic', 'ambitious'];
const LABEL: Record<ScenarioKey, string> = { lean: 'Lean', realistic: 'Realistic', ambitious: 'Ambitious' };
const BLURB: Record<ScenarioKey, string> = {
  lean: 'the film gets made, tightly',
  realistic: 'the plan we pitch',
  ambitious: 'everything the film could be',
};

function eur(thousands: number): string {
  return `€${(thousands * 1000).toLocaleString('en-US')}`;
}

export function ScenarioView() {
  const { state, dispatch } = useApp();

  const rows = useMemo(() => {
    return ORDER.map((key) => {
      const sc = state.scenarios[key];
      const funding = Object.values(sc.funding).reduce((a, b) => a + b, 0);
      const cost = Object.values(sc.costs).reduce((a, b) => a + b, 0);
      return { key, sc, funding, cost, gap: cost - funding };
    });
  }, [state.scenarios]);

  const maxCost = Math.max(...rows.map((r) => r.cost), 1);

  return (
    <div className="space-y-6 max-w-[1100px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The money</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
          three plans · what each raises, what each costs, and the gap between · click one to make it active
        </p>
      </header>

      {/* The three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.map(({ key, sc, funding, cost, gap }) => {
          const active = state.activeScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: key })}
              className={`text-left rounded-[4px] p-5 border transition-colors ${
                active
                  ? 'bg-[color:var(--color-chrome)] border-[color:var(--color-brass)]'
                  : 'bg-[color:var(--color-paper-light)] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className={`label-caps ${active ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-brass-deep)]'}`}>
                  {LABEL[key]}
                </span>
                {active && <span className="label-caps text-[color:var(--color-brass)]">active</span>}
              </div>
              <div className={`prose-body italic text-[12px] mt-0.5 ${active ? 'text-[color:var(--color-on-chrome-muted)]' : 'text-[color:var(--color-on-paper-muted)]'}`}>
                {BLURB[key]} · {sc.episodes} eps
              </div>

              <div className="mt-4">
                <div className={`label-caps ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>the gap</div>
                <div className="display-italic text-[40px] leading-none mt-1" style={{ color: gap > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {gap > 0 ? eur(gap) : 'covered'}
                </div>
              </div>

              {/* funding vs cost mini-bars */}
              <div className="mt-4 space-y-2">
                <Bar label="raise" value={funding} max={maxCost} tone="var(--color-dock)" active={active} valueLabel={eur(funding)} />
                <Bar label="cost" value={cost} max={maxCost} tone="var(--color-brass)" active={active} valueLabel={eur(cost)} />
              </div>
            </button>
          );
        })}
      </div>

      {/* HAVC note */}
      <div className="rounded-[3px] border-[0.5px] p-4 flex items-start gap-2.5"
        style={{ borderColor: 'var(--color-border-brass)', background: 'color-mix(in srgb, var(--color-warn) 8%, transparent)' }}>
        <TrendingDown size={14} className="text-[color:var(--color-brass)] mt-0.5 shrink-0" />
        <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug max-w-[80ch]">
          HAVC is fixed at <span className="italic text-[color:var(--color-brass-deep)]">€30k</span> across all three — a state grant is one
          committed number, not a figure that scales with ambition. It sits below even the lean target, so every plan carries a gap.
          The gap is what sponsors, co-production, and the rebate have to close.
        </p>
      </div>

      {/* Breakdown for the active scenario */}
      <Breakdown scenarioKey={state.activeScenario} />
    </div>
  );
}

function Bar({ label, value, max, tone, active, valueLabel }: { label: string; value: number; max: number; tone: string; active: boolean; valueLabel: string }) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className={active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}>{label}</span>
        <span className={`tabular-nums ${active ? 'text-[color:var(--color-on-chrome)]' : 'text-[color:var(--color-on-paper)]'}`}>{valueLabel}</span>
      </div>
      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: active ? 'rgba(244,236,220,0.12)' : 'rgba(10,43,79,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function Breakdown({ scenarioKey }: { scenarioKey: ScenarioKey }) {
  const { state } = useApp();
  const sc = state.scenarios[scenarioKey];
  const funding = FUNDING_SOURCES.map((f) => ({ label: f.label, color: f.color, tag: f.tag, v: sc.funding[f.key] ?? 0 })).filter((x) => x.v > 0);
  const costs = COST_CATEGORIES.map((c) => ({ label: c.label, v: sc.costs[c.key] ?? 0 })).filter((x) => x.v > 0);
  const fundTotal = funding.reduce((a, b) => a + b.v, 0);
  const costTotal = costs.reduce((a, b) => a + b.v, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass-deep)]">where the money comes from</h3>
          <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{LABEL[scenarioKey]}</span>
        </div>
        <ul className="space-y-2">
          {funding.map((f) => (
            <li key={f.label} className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.color }} />
              <span className="prose-body text-[13px] text-[color:var(--color-on-paper)] flex-1">{f.label}</span>
              <span className="label-caps text-[color:var(--color-on-paper-faint)]">{f.tag}</span>
              <span className="tabular-nums text-[13px] text-[color:var(--color-on-paper)] w-[70px] text-right">{eur(f.v)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
          <span className="label-caps text-[color:var(--color-on-paper-muted)]">total raise</span>
          <span className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{eur(fundTotal)}</span>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass-deep)]">where it goes</h3>
          <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{LABEL[scenarioKey]}</span>
        </div>
        <ul className="space-y-2">
          {costs.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5">
              <span className="prose-body text-[13px] text-[color:var(--color-on-paper)] flex-1">{c.label}</span>
              <span className="tabular-nums text-[13px] text-[color:var(--color-on-paper)] w-[70px] text-right">{eur(c.v)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
          <span className="label-caps text-[color:var(--color-on-paper-muted)]">total cost</span>
          <span className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{eur(costTotal)}</span>
        </div>
        {costTotal - fundTotal > 0 && (
          <div className="flex items-center gap-2 mt-3 text-[color:var(--color-danger)]">
            <AlertTriangle size={12} />
            <span className="prose-body text-[12px]">still to close: <span className="tabular-nums">{eur(costTotal - fundTotal)}</span></span>
          </div>
        )}
      </section>
    </div>
  );
}
