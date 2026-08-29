import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Plus, Trash2, TrendingDown } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { FUNDING_SOURCES, COST_CATEGORIES } from '../../lib/seed';
import type { ScenarioKey } from '../../types';
import { SCENARIO_LABEL } from '../../lib/shortcuts';
import { EditableText } from '../primitives/EditableText';

/* Scenario board — the money, on one screen.

   Three plans side by side: what each raises, what each costs, and the gap (or
   the spare) between. Click a column to make it the active scenario everywhere.

   There is no edit mode, the same as The Plan and The Scenario: click any
   amount and it becomes a field. Removing a line and adding one appear on
   hover, so at rest this reads as a budget rather than a form. Values are
   stored in thousands of euros. */

const ORDER: ScenarioKey[] = ['lean', 'realistic', 'ambitious'];
const LABEL = SCENARIO_LABEL;
const BLURB: Record<ScenarioKey, string> = {
  lean: 'HRT alone · the film airs at home',
  realistic: 'sold around — mid-tier TV, smaller streamers',
  ambitious: 'Netflix, HBO, Apple',
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
      {/* The shell's PageHeader already prints the title and the subtitle. */}
      <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)]">
        click a plan to make it active · click any number to change it · values in &euro;k
      </p>

      {/* The three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.map(({ key, sc, funding, cost, gap }) => {
          const active = state.activeScenario === key;
          return (
            /* A div, not a button: the assumption line inside is editable, and an
               editor cannot live inside a button. Activating the plan moves onto
               the name and the bars, the same way The Scenario's arc filter moved
               onto explicit handles. */
            <div
              key={key}
              className={`text-left rounded-[4px] p-5 border transition-colors ${
                active
                  ? 'bg-[color:var(--color-chrome)] border-[color:var(--color-brass)]'
                  : 'bg-[color:var(--color-paper-light)] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: key })}
                  title={active ? 'this is the active plan' : `make ${LABEL[key]} the active plan`}
                  className={`label-caps transition-colors ${active ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-brass-deep)] hover:text-[color:var(--color-brass)]'}`}
                >
                  {LABEL[key]}
                </button>
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

              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: key })}
                title={active ? 'this is the active plan' : `make ${LABEL[key]} the active plan`}
                className="block w-full mt-4 space-y-2 cursor-pointer"
              >
                <Bar label="raise" value={funding} max={maxAmount} tone="var(--color-dock)" active={active} valueLabel={eur(funding)} />
                <Bar label="cost" value={cost} max={maxAmount} tone="var(--color-brass)" active={active} valueLabel={eur(cost)} />
              </button>

              {/* What this plan is betting on. Every budget is a set of
                  assumptions, and this is the half a funder interrogates. */}
              <div className={`mt-4 pt-3 border-t-[0.5px] ${active ? 'border-[color:var(--color-border-chrome)]' : 'border-[color:var(--color-border-paper)]'}`}>
                <div className={`label-caps !text-[9px] mb-1 ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>
                  what it assumes
                </div>
                <EditableText
                  multiline
                  value={sc.assumption ?? ''}
                  placeholder="what has to be true for this plan to work…"
                  onSave={(v) => dispatch({ type: 'SET_SCENARIO_ASSUMPTION', scenario: key, text: v })}
                  className={`prose-body italic text-[11.5px] leading-snug block ${active ? 'text-[color:var(--color-on-chrome-muted)]' : 'text-[color:var(--color-on-paper-muted)]'}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* HAVC note */}
      <div className="rounded-[3px] border-[0.5px] p-4 flex items-start gap-2.5"
        style={{ borderColor: 'var(--color-border-brass)', background: 'color-mix(in srgb, var(--color-warn) 8%, transparent)' }}>
        <TrendingDown size={14} className="text-[color:var(--color-brass)] mt-0.5 shrink-0" />
        <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug max-w-[80ch]">
          HAVC is fixed at <span className="italic text-[color:var(--color-brass-deep)]">€30k</span> in every plan — a state grant is one
          committed number, not a figure that scales with ambition. Every line below is editable — click a number and type.
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
        title="where the money comes from" scenarioKey={scenarioKey} kind="funding"
        keys={fundingKeys} values={sc.funding} total={fundTotal} totalLabel="total raise"
        renderMeta={(k) => { const m = fundingMeta(k); return { label: m.label, dot: m.color, tag: m.tag }; }}
      />
      <MoneySection
        title="where it goes" scenarioKey={scenarioKey} kind="costs"
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
  title, scenarioKey, kind, keys, values, total, totalLabel, renderMeta, footer,
}: {
  title: string; scenarioKey: ScenarioKey; kind: 'funding' | 'costs';
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
    <section className="group/panel bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
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
              {meta.tag && <span className="label-caps text-[color:var(--color-on-paper-faint)] opacity-100 group-hover:opacity-0 [@media(hover:none)]:opacity-100 transition-opacity">{meta.tag}</span>}
              <Amount
                value={v}
                onSave={(n) => dispatch({ type: 'SET_MONEY_LINE', scenario: scenarioKey, kind, key: k, value: n })}
                title={`${meta.label} — click to change`}
              />
              <button
                type="button" title={`remove "${meta.label}" from ${LABEL[scenarioKey]}`}
                onClick={() => { if (window.confirm(`Remove "${meta.label}" from ${LABEL[scenarioKey]}?`)) dispatch({ type: 'DELETE_MONEY_LINE', scenario: scenarioKey, kind, key: k }); }}
                className="p-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-70 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover/panel:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
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
        <button type="button" onClick={addLine} title="add a line to this plan" className="p-1 text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)]">
          <Plus size={14} />
        </button>
      </div>

      <div className="flex items-baseline justify-between mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
        <span className="label-caps text-[color:var(--color-on-paper-muted)]">{totalLabel}</span>
        <span className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{eur(total)}</span>
      </div>
      {footer}
    </section>
  );
}


/* An amount that is always click-to-edit.

   It carries the same two guards as EditableText — commit nothing when nothing
   changed, and refuse to write over a value another crew member moved while
   this field was open — because the money board shares the same last-write-wins
   cloud document as everything else. It also holds its width and alignment when
   it opens, so a column of figures does not jump as you tab down it. */
function Amount({ value, onSave, title }: { value: number; onSave: (n: number) => void; title?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const baseRef = useRef(value);
  const liveRef = useRef(value);
  liveRef.current = value;

  function begin() { baseRef.current = value; setDraft(String(value)); setOpen(true); }

  function commit() {
    const n = Math.round(Number(draft));
    setOpen(false);
    if (!Number.isFinite(n) || n < 0) return;              // a typo is not an edit
    if (n === baseRef.current) return;                      // nothing changed
    if (liveRef.current !== baseRef.current) return;         // someone else moved it
    onSave(n);
  }

  if (open) {
    return (
      <input
        autoFocus type="number" min={0} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setOpen(false); }}
        className="w-[76px] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-1.5 py-0.5 text-[13px] text-right tabular-nums outline-none"
      />
    );
  }
  return (
    <span
      title={title}
      onClick={begin}
      className="w-[76px] text-right tabular-nums text-[13px] text-[color:var(--color-on-paper)] cursor-text rounded-[2px] px-1.5 py-0.5 hover:bg-[color:var(--color-paper-deep)]/60 transition-colors"
    >
      {eur(value)}
    </span>
  );
}
