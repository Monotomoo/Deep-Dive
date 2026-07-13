import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { FourKey, LifeEvent, LifeEventCategory, TalentFour } from '../../types';

/* Life Mosaic · four biographies running in parallel.
   One SVG timeline · a lane per subject · events as lollipop stems sized
   by significance · vertical convergence bands where two or more of the
   four have events in the same year — the places their lives rhyme. */

const CATEGORY_COLOR: Record<LifeEventCategory, string> = {
  birth:         '#d9a93e',
  'first-dive':  '#3d7a94',
  record:        '#d96c3d',
  breakthrough:  '#b54f26',
  loss:          '#c94a3a',
  love:          '#d96c3d',
  family:        '#6f8a72',
  travel:        '#4c6b93',
  crisis:        '#8a3a2e',
  joy:           '#6f8a72',
  other:         '#8a8375',
};

const CATEGORIES: LifeEventCategory[] = [
  'birth', 'first-dive', 'record', 'breakthrough', 'loss', 'love',
  'family', 'travel', 'crisis', 'joy', 'other',
];

const FOUR_ORDER: FourKey[] = ['petar', 'vito', 'sanda', 'zsofia'];

const LANE_H = 128;
const AXIS_H = 30;
const YEAR_W = 86;
const PAD_L = 20;
const PAD_R = 60;
const STEM_ROWS = [34, 62, 90]; // stem heights, cycled to dodge collisions

function makeId() {
  return `le-${Math.random().toString(36).slice(2, 9)}`;
}

export function LifeMosaicView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<LifeEvent | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<Set<FourKey>>(() => new Set(FOUR_ORDER));
  const [catFilter, setCatFilter] = useState<Set<LifeEventCategory>>(() => new Set(CATEGORIES));

  const events = useMemo(
    () => state.lifeEvents.filter((e) => subjectFilter.has(e.subjectKey) && catFilter.has(e.category)),
    [state.lifeEvents, subjectFilter, catFilter],
  );

  const { minYear, maxYear } = useMemo(() => {
    const years = state.lifeEvents.map((e) => e.year);
    return {
      minYear: (years.length ? Math.min(...years) : 1985) - 1,
      maxYear: (years.length ? Math.max(...years) : 2027) + 1,
    };
  }, [state.lifeEvents]);

  const totalYears = maxYear - minYear + 1;
  const width = PAD_L + totalYears * YEAR_W + PAD_R;
  const height = AXIS_H + FOUR_ORDER.length * LANE_H + 8;

  const xFor = (year: number, month?: number) =>
    PAD_L + (year - minYear + ((month ?? 6) - 1) / 12) * YEAR_W;

  /* convergence: years where ≥2 of the four have events */
  const convergenceYears = useMemo(() => {
    const perYear = new Map<number, Set<FourKey>>();
    for (const e of events) {
      (perYear.get(e.year) ?? perYear.set(e.year, new Set()).get(e.year)!).add(e.subjectKey);
    }
    return [...perYear.entries()].filter(([, s]) => s.size >= 2).map(([y]) => y);
  }, [events]);

  /* lane rows: sorted per subject, greedy row assignment to dodge overlap */
  const placed = useMemo(() => {
    const out: (LifeEvent & { px: number; row: number })[] = [];
    for (const key of FOUR_ORDER) {
      const lane = events
        .filter((e) => e.subjectKey === key)
        .sort((a, b) => a.year - b.year || (a.month ?? 6) - (b.month ?? 6));
      const lastX = [-Infinity, -Infinity, -Infinity];
      for (const e of lane) {
        const px = xFor(e.year, e.month);
        let row = lastX.findIndex((x) => px - x > 62);
        if (row === -1) row = lastX.indexOf(Math.min(...lastX));
        lastX[row] = px;
        out.push({ ...e, px, row });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, minYear]);

  /* open on the dense recent decade */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  function toggleSubject(key: FourKey) {
    setSubjectFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next.size === 0 ? new Set(FOUR_ORDER) : next;
    });
  }
  function toggleCat(cat: LifeEventCategory) {
    setCatFilter((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next.size === 0 ? new Set(CATEGORIES) : next;
    });
  }

  function startAdd(subjectKey: FourKey) {
    setEditing({ id: makeId(), subjectKey, year: 2026, title: '', category: 'other', significance: 3 });
  }

  function saveEvent(e: LifeEvent) {
    const exists = state.lifeEvents.some((x) => x.id === e.id);
    if (exists) dispatch({ type: 'UPDATE_LIFE_EVENT', id: e.id, patch: e });
    else dispatch({ type: 'ADD_LIFE_EVENT', event: e });
    setEditing(null);
  }

  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  return (
    <div className="space-y-5 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('life-mosaic.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('life-mosaic.subtitle')}</p>
      </header>

      {/* Subject toggles + add buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {state.four.map((f) => {
          const on = subjectFilter.has(f.key);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleSubject(f.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] font-sans text-[11px] transition-all ${
                on ? 'text-[color:var(--color-paper-light)]' : 'text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)] opacity-60'
              }`}
              style={on ? { background: f.colorHint ?? 'var(--color-brass)' } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: f.colorHint ?? 'var(--color-brass)' }} />
              {f.name.split(' ')[0]}
            </button>
          );
        })}
        <div className="w-px h-5 bg-[color:var(--color-border-paper)]" />
        <div className="flex items-center gap-1.5 text-[10px] text-[color:var(--color-on-paper-muted)]">
          <span className="inline-block w-3 h-3 rounded-[2px]" style={{ background: 'rgba(217,108,61,0.14)', border: '1px solid rgba(217,108,61,0.35)' }} />
          <span className="italic">{t('life-mosaic.convergence')}</span>
        </div>
      </div>

      {/* Category chips (doubling as legend) */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const on = catFilter.has(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggleCat(c)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[10px] transition-all ${
                on ? 'text-[color:var(--color-on-paper)]' : 'text-[color:var(--color-on-paper-faint)] opacity-50'
              } border-[0.5px] border-[color:var(--color-border-paper)]`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
              {t(`life-mosaic.cat.${c}` as StringKey)}
            </button>
          );
        })}
      </div>

      {/* The mosaic */}
      <div
        ref={scrollRef}
        className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] overflow-x-auto"
      >
        <svg width={width} height={height} style={{ display: 'block' }}>
          {/* convergence bands (behind everything) */}
          {convergenceYears.map((y) => (
            <rect
              key={y}
              x={xFor(y, 1)}
              y={AXIS_H}
              width={YEAR_W}
              height={FOUR_ORDER.length * LANE_H}
              fill="rgba(217,108,61,0.10)"
            />
          ))}

          {/* year grid + axis */}
          {years.map((y) => (
            <g key={y}>
              <line
                x1={xFor(y, 1)} y1={AXIS_H}
                x2={xFor(y, 1)} y2={height - 6}
                stroke={y % 5 === 0 ? 'rgba(10,43,79,0.12)' : 'rgba(10,43,79,0.05)'}
                strokeWidth={y % 10 === 0 ? 1 : 0.5}
              />
              <text
                x={xFor(y, 1) + 3}
                y={AXIS_H - 10}
                fontSize={y % 5 === 0 ? 10.5 : 8.5}
                fontFamily="JetBrains Mono, monospace"
                fill={y % 5 === 0 ? 'rgba(181,79,38,0.9)' : 'rgba(10,43,79,0.35)'}
              >
                {y}
              </text>
              {convergenceYears.includes(y) && (
                <text x={xFor(y, 1) + YEAR_W / 2} y={AXIS_H - 10} fontSize={9} textAnchor="middle" fill="rgba(217,108,61,0.9)">◆</text>
              )}
            </g>
          ))}

          {/* lanes */}
          {FOUR_ORDER.map((key, li) => {
            const subject = state.four.find((f) => f.key === key)!;
            const laneTop = AXIS_H + li * LANE_H;
            const baseline = laneTop + LANE_H - 22;
            const color = subject.colorHint ?? '#d96c3d';
            const laneEvents = placed.filter((e) => e.subjectKey === key);
            const on = subjectFilter.has(key);
            return (
              <g key={key} opacity={on ? 1 : 0.25}>
                {/* lane wash + separator */}
                <rect x={0} y={laneTop} width={width} height={LANE_H} fill={color} opacity={0.045} />
                <line x1={0} y1={laneTop} x2={width} y2={laneTop} stroke="rgba(10,43,79,0.14)" strokeWidth={0.5} />
                {/* baseline */}
                <line x1={PAD_L} y1={baseline} x2={width - 24} y2={baseline} stroke={color} strokeOpacity={0.4} strokeWidth={1.2} />
                {/* lane label */}
                <circle cx={PAD_L + 8} cy={laneTop + 20} r={4} fill={color} />
                <text
                  x={PAD_L + 18} y={laneTop + 24}
                  fontSize={15} fontStyle="italic" fontFamily="Fraunces, serif"
                  fill="rgba(10,43,79,0.9)"
                >
                  {subject.name.split(' ')[0]}
                </text>

                {/* events — lollipop stems */}
                {laneEvents.map((e) => {
                  const stemH = STEM_ROWS[e.row];
                  const dotY = baseline - stemH;
                  const r = 3.5 + e.significance * 1.35;
                  const catColor = e.colorHint ?? CATEGORY_COLOR[e.category];
                  return (
                    <g
                      key={e.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setEditing(state.lifeEvents.find((x) => x.id === e.id) ?? null)}
                    >
                      <title>{`${e.title} · ${e.year}${e.month ? `-${String(e.month).padStart(2, '0')}` : ''} · ${t(`life-mosaic.cat.${e.category}` as StringKey)}${e.note ? `\n${e.note}` : ''}`}</title>
                      <line x1={e.px} y1={baseline} x2={e.px} y2={dotY} stroke={catColor} strokeOpacity={0.45} strokeWidth={1.1} />
                      <circle cx={e.px} cy={baseline} r={1.8} fill={catColor} opacity={0.7} />
                      <circle
                        cx={e.px} cy={dotY} r={r}
                        fill={catColor}
                        stroke="#faf4e6"
                        strokeWidth={1.6}
                      />
                      {e.significance >= 4 && (
                        <text
                          x={e.px} y={dotY - r - 5}
                          textAnchor="middle"
                          fontSize={9.5}
                          fontStyle="italic"
                          fontFamily="Spectral, serif"
                          fill="rgba(10,43,79,0.82)"
                        >
                          {e.title.length > 30 ? `${e.title.slice(0, 28)}…` : e.title}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* per-lane add */}
                <g style={{ cursor: 'pointer' }} onClick={() => startAdd(key)}>
                  <title>{t('life-mosaic.add')}</title>
                  <circle cx={width - 30} cy={laneTop + 20} r={9} fill="none" stroke={color} strokeOpacity={0.5} strokeDasharray="2 2" />
                  <text x={width - 30} y={laneTop + 24} textAnchor="middle" fontSize={12} fill={color}>+</text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {editing && (
        <LifeEventEditor
          event={editing}
          subject={state.four.find((f) => f.key === editing.subjectKey)!}
          onSave={saveEvent}
          onDelete={() => {
            dispatch({ type: 'DELETE_LIFE_EVENT', id: editing.id });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function LifeEventEditor({
  event, subject, onSave, onDelete, onCancel,
}: {
  event: LifeEvent;
  subject: TalentFour;
  onSave: (e: LifeEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [e, setE] = useState<LifeEvent>(event);
  const color = subject.colorHint ?? 'var(--color-brass)';

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[560px] w-full p-6 space-y-4"
        onClick={(ev) => ev.stopPropagation()}
        style={{ borderTop: `3px solid ${color}` }}
      >
        <header className="flex items-center justify-between">
          <div>
            <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{subject.name}</div>
            <div className="prose-body italic text-[11px] text-[color:var(--color-brass)]">{t('life-mosaic.add')}</div>
          </div>
          <button type="button" onClick={onCancel} className="text-[color:var(--color-on-paper-muted)]">
            <X size={16} />
          </button>
        </header>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('life-mosaic.title.field')}</div>
          <input
            type="text"
            value={e.title}
            onChange={(ev) => setE({ ...e, title: ev.target.value })}
            autoFocus
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
          />
        </label>

        <div className="grid grid-cols-4 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('life-mosaic.year')}</div>
            <input
              type="number"
              value={e.year}
              onChange={(ev) => setE({ ...e, year: parseInt(ev.target.value, 10) || 2026 })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">M</div>
            <input
              type="number"
              min={1} max={12}
              value={e.month ?? ''}
              placeholder="—"
              onChange={(ev) => {
                const v = parseInt(ev.target.value, 10);
                setE({ ...e, month: Number.isFinite(v) && v >= 1 && v <= 12 ? v : undefined });
              }}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('life-mosaic.category')}</div>
            <select
              value={e.category}
              onChange={(ev) => setE({ ...e, category: ev.target.value as LifeEventCategory })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`life-mosaic.cat.${c}` as StringKey)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('life-mosaic.significance')}</div>
            <select
              value={e.significance}
              onChange={(ev) => setE({ ...e, significance: parseInt(ev.target.value, 10) as 1|2|3|4|5 })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('life-mosaic.note')}</div>
          <textarea
            value={e.note ?? ''}
            onChange={(ev) => setE({ ...e, note: ev.target.value })}
            rows={2}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic"
          />
        </label>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"
          >
            <Trash2 size={11} /> {t('common.delete')}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => onSave(e)}
              disabled={!e.title.trim()}
              className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
