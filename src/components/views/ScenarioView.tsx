import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Pencil, Plus, Trash2, TrendingDown } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { FUNDING_SOURCES, COST_CATEGORIES } from '../../lib/seed';
import type { ScenarioKey } from '../../types';

/* Scenario board — the money, on one screen. Fully editable.

   Three plans side by side: what each raises, what each costs, and the gap (or
   the spare) between. Click a column to make it the active scenario everywhere;
   flip on edit to change any number, add a line, or remove one — per plan.
   Values are stored in thousands of euros. */

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

/* Label + color for a line: the seed meta when known, a readable fallback for
   lines added in the app. */
function fundingMeta(key: string) {
  const m = FUNDING_SOURCES.find((f) => f.key === key);
  return { label: m?.label ?? prettify(key), color: m?.color ?? '#8a8375', tag: m?.tag };
}
function costMeta(key: string) {
  const m = COST_CATEGORIES.find((c) => c.key === key);
  return { label: m?.label ?? prettify(key) };
}
function prettify(key: string): string {
  return key.replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'line';
}

export function ScenarioView() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);

  const rows = useMemo(() => {
    return ORDER.map((key) => {
      const sc = state.scenarios[key];
      const funding = Object.values(sc.funding).reduce((a, b) => a + b, 0);
      const cost = Object.values(sc.costs).reduce((a, b) => a + b, 0);
      return { key, sc, funding, cost, gap: cost - funding };
    });
  }, [state.scenarios]);

  const maxAmount = Math.max(...rows.map((r) => Math.max(r.cost, r.funding)), 1);

  return (
    <div className="space-y-6 max-w-[1100px]">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The money</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            three plans · what each raises, what each costs · click one to make it active · numbers in €k
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] text-[11px] tracking-[0.1em] uppercase transition-colors ${
            editing
              ? 'border-[color:var(--color-border-brass)] text-[color:var(--color-brass)] bg-[color:var(--color-paper-card)]'
              : 'border-[color:var(--color-border-paper-strong)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
          }`}
        >
          {editing ? <><Check size={12} /> done</> : <><Pencil size={12} /> edit the money</>}
        </button>
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
                <div className={`label-caps ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>
                  {gap > 0 ? 'the gap' : 'covered'}
                </div>
                <div className="display-italic text-[40px] leading-none mt-1" style={{ color: gap > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {gap > 0 ? eur(gap) : gap < 0 ? `+${eur(-gap)}` : eur(0)}
                </div>
                {gap < 0 && (
                  <div className={`prose-body italic text-[11px] mt-1 ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>
                    raises more than it spends — the spare is the safety margin
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Bar label="raise" value={funding} max={maxAmount} tone="var(--color-dock)" active={active} valueLabel={eur(funding)} />
                <Bar label="cost" value={cost} max={maxAmount} tone="var(--color-brass)" active={active} valueLabel={eur(cost)} />
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
          HAVC is fixed at <span className="italic text-[color:var(--color-brass-deep)]">€30k</span> in every plan — a state grant is one
          committed number, not a figure that scales with ambition. Everything on this board is editable: flip on
          <span className="italic"> edit the money</span> and change any line of the active plan.
        </p>
      </div>

      {/* Breakdown for the active scenario */}
      <Breakdown scenarioKey={state.activeScenario} editing={editing} />
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

function Breakdown({ scenarioKey, editing }: { scenarioKey: ScenarioKey; editing: boolean }) {
  const { state } = useApp();
  const sc = state.scenarios[scenarioKey];

  /* Union of the seed's line order and any lines added in the app. */
  const fundingKeys = [
    ...FUNDING_SOURCES.map((f) => f.key).filter((k) => sc.funding[k] !== undefined),
    ...Object.keys(sc.funding).filter((k) => !FUNDING_SOURCES.some((f) => f.key === k)),
  ];
  const costKeys = [
    ...COST_CATEGORIES.map((c) => c.key).filter((k) => sc.costs[k] !== undefined),
    ...Object.keys(sc.costs).filter((k) => !COST_CATEGORIES.some((c) => c.key === k)),
  ];

  const fundTotal = fundingKeys.reduce((a, k) => a + (sc.funding[k] ?? 0), 0);
  const costTotal = costKeys.reduce((a, k) => a + (sc.costs[k] ?? 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MoneySection
        title="where the money comes from" scenarioKey={scenarioKey} kind="funding" editing={editing}
        keys={fundingKeys} values={sc.funding} total={fundTotal} totalLabel="total raise"
        renderMeta={(k) => { const m = fundingMeta(k); return { label: m.label, dot: m.color, tag: m.tag }; }}
      />
      <MoneySection
        title="where it goes" scenarioKey={scenarioKey} kind="costs" editing={editing}
        keys={costKeys} values={sc.costs} total={costTotal} totalLabel="total cost"
        renderMeta={(k) => ({ label: costMeta(k).label })}
        footer={costTotal - fundTotal > 0 ? (
          <div className="flex items-center gap-2 mt-3 text-[color:var(--color-danger)]">
            <AlertTriangle size={12} />
            <span className="prose-body text-[12px]">still to close: <span className="tabular-nums">{eur(costTotal - fundTotal)}</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 text-[color:var(--color-success)]">
            <Check size={12} />
            <span className="prose-body text-[12px]">covered · spare: <span className="tabular-nums">{eur(fundTotal - costTotal)}</span></span>
          </div>
        )}
      />
    </div>
  );
}

function MoneySection({
  title, scenarioKey, kind, editing, keys, values, total, totalLabel, renderMeta, footer,
}: {
  title: string; scenarioKey: ScenarioKey; kind: 'funding' | 'costs'; editing: boolean;
  keys: string[]; values: Record<string, number>; total: number; totalLabel: string;
  renderMeta: (key: string) => { label: string; dot?: string; tag?: string };
  footer?: React.ReactNode;
}) {
  const { dispatch } = useApp();
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  function addLine() {
    const label = newLabel.trim();
    const amount = Math.round(Number(newAmount));
    if (!label || !Number.isFinite(amount) || amount < 0) return;
    let key = slugify(label);
    while (values[key] !== undefined) key = `${key}-2`;
    dispatch({ type: 'SET_MONEY_LINE', scenario: scenarioKey, kind, key, value: amount });
    setNewLabel(''); setNewAmount('');
  }

  return (
    <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="label-caps text-[color:var(--color-brass-deep)]">{title}</h3>
        <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{LABEL[scenarioKey]}</span>
      </div>
      <ul className="space-y-2">
        {keys.map((k) => {
          const meta = renderMeta(k);
          const v = values[k] ?? 0;
          return (
            <li key={k} className="flex items-center gap-2.5 group">
              {meta.dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.dot }} />}
              <span className="prose-body text-[13px] text-[color:var(--color-on-paper)] flex-1">{meta.label}</span>
              {meta.tag && !editing && <span className="label-caps text-[color:var(--color-on-paper-faint)]">{meta.tag}</span>}
              {editing ? (
                <>
                  <input
                    type="number" min={0} defaultValue={v} key={`${scenarioKey}-${k}-${v}`}
                    onBlur={(e) => {
                      const n = Math.round(Number(e.target.value));
                      if (Number.isFinite(n) && n >= 0 && n !== v) dispatch({ type: 'SET_MONEY_LINE', scenario: scenarioKey, kind, key: k, value: n });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    className="w-[72px] bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-brass)] rounded-[3px] px-2 py-0.5 text-[13px] text-right tabular-nums outline-none"
                  />
                  <span className="text-[11px] text-[color:var(--color-on-paper-faint)]">€k</span>
                  <button
                    type="button" title="remove line"
                    onClick={() => { if (window.confirm(`Remove "${meta.label}" from ${LABEL[scenarioKey]}?`)) dispatch({ type: 'DELETE_MONEY_LINE', scenario: scenarioKey, kind, key: k }); }}
                    className="p-0.5 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <span className="tabular-nums text-[13px] text-[color:var(--color-on-paper)] w-[76px] text-right">{eur(v)}</span>
              )}
            </li>
          );
        })}
      </ul>

      {editing && (
        <div className="flex items-center gap-2 mt-3">
          <input
            value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="new line…"
            onKeyDown={(e) => { if (e.key === 'Enter') addLine(); }}
            className="flex-1 bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px] outline-none focus:border-[color:var(--color-border-brass)]"
          />
          <input
            value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0" type="number" min={0}
            onKeyDown={(e) => { if (e.key === 'Enter') addLine(); }}
            className="w-[72px] bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px] text-right tabular-nums outline-none focus:border-[color:var(--color-border-brass)]"
          />
          <button type="button" onClick={addLine} title="add line" className="p-1 text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)]">
            <Plus size={14} />
          </button>
        </div>
      )}

      <div className="flex items-baseline justify-between mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
        <span className="label-caps text-[color:var(--color-on-paper-muted)]">{totalLabel}</span>
        <span className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{eur(total)}</span>
      </div>
      {footer}
    </section>
  );
}
