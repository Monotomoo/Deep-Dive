import { useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, AlertTriangle, BookOpen, FlaskConical } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { FourKey, PhysiologyDatum, PhysiologyMetric, PhysiologyProvenance } from '../../types';

/* Physiology · the score built from real bodies.

   Three ways in:
     Sessions — every series, one chart each
     Compare  — the same metric across the four, normalised to % of the dive,
                because their dives are different lengths
     Depth    — lung compression against depth. This one is not modelled: it's
                Boyle's law against their actual record depths. The only chart
                here that states a fact.

   Provenance is shown on every card on purpose. These are real people; a
   modelled curve dressed as a measurement is a lie about their bodies. */

const METRIC_COLOR: Record<PhysiologyMetric, string> = {
  'heart-rate': '#d96c3d', 'blood-oxygen': '#3d7a94', 'blood-pressure': '#b54f26',
  'brain-activity': '#6f8a72', 'blood-shift': '#c9a961', thermal: '#c94a3a',
  'lung-volume': '#5b7da1', spleen: '#8fa57e', lactate: '#d9a93e', contractions: '#8a3a2e',
  other: '#8a8375',
};

const METRIC_LABEL: Record<PhysiologyMetric, string> = {
  'heart-rate': 'heart rate', 'blood-oxygen': 'blood oxygen', 'blood-pressure': 'blood pressure',
  'brain-activity': 'brain', 'blood-shift': 'blood shift', thermal: 'thermal',
  'lung-volume': 'lung volume', spleen: 'spleen', lactate: 'lactate', contractions: 'contractions',
  other: 'other',
};

const PROV_STYLE: Record<PhysiologyProvenance, { label: string; color: string; icon: typeof FlaskConical }> = {
  measured: { label: 'measured', color: 'var(--color-success)', icon: FlaskConical },
  modelled: { label: 'modelled · not yet measured', color: 'var(--color-warn)', icon: AlertTriangle },
  literature: { label: 'from literature · not this person', color: 'var(--color-steel-light)', icon: BookOpen },
};

function provOf(d: PhysiologyDatum): PhysiologyProvenance {
  return d.provenance ?? 'modelled';
}

function fmtDur(s?: number): string {
  if (!s) return '';
  const m = Math.floor(s / 60), r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`;
}

function samplesOf(d: PhysiologyDatum): number[] {
  return (d.dataPointsCsv ?? '')
    .split(',')
    .map((v) => parseFloat(v.trim()))
    .filter((v) => Number.isFinite(v));
}

type Mode = 'sessions' | 'compare' | 'depth';

export function PhysiologyView() {
  const { state } = useApp();
  const t = useT();
  const [mode, setMode] = useState<Mode>('sessions');
  const [person, setPerson] = useState<FourKey | 'all'>('all');
  const [metric, setMetric] = useState<PhysiologyMetric | 'all'>('all');

  const person4 = (key: FourKey) => state.four.find((f) => f.key === key);

  const metricsPresent = useMemo(() => {
    const set = new Set<PhysiologyMetric>();
    for (const d of state.physiology) set.add(d.metric);
    return [...set];
  }, [state.physiology]);

  const filtered = useMemo(
    () => state.physiology.filter(
      (d) => (person === 'all' || d.personKey === person) && (metric === 'all' || d.metric === metric),
    ),
    [state.physiology, person, metric],
  );

  const measuredCount = state.physiology.filter((d) => provOf(d) === 'measured').length;

  return (
    <div className="space-y-6 max-w-[1100px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('physiology.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('physiology.subtitle')}</p>
      </header>

      <div className="bg-[color:var(--color-chrome)] rounded-[3px] p-6">
        <div className="label-caps text-[color:var(--color-brass)] mb-2">the score is their own bodies</div>
        <p className="prose-body italic text-[16px] text-[color:var(--color-paper-light)] leading-relaxed max-w-[720px]">
          Every documentary about this sport uses a composer. This one uses the body the sport happens inside —
          the twenty-beat heart, the blood pulled into the chest, the brain defended last. The music can't lie about the depth, because it <span className="text-[color:var(--color-brass)]">is</span> the depth.
        </p>
      </div>

      {/* Provenance is not a footnote. */}
      {measuredCount < state.physiology.length && (
        <div
          className="rounded-[3px] border-[0.5px] p-4"
          style={{ borderColor: 'var(--color-border-brass)', background: 'color-mix(in srgb, var(--color-warn) 8%, transparent)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-[color:var(--color-warn)]" />
            <span className="label-caps text-[color:var(--color-brass-deep)]">
              {measuredCount === 0 ? 'nothing here is measured yet' : `${measuredCount} of ${state.physiology.length} measured`}
            </span>
          </div>
          <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug mt-2 max-w-[76ch]">
            These curves are <span className="italic">expected</span> — built from established freediving physiology and each diver's real
            record, not recorded off their bodies. The shapes are right; the numbers are not theirs yet. That is what the Rijeka lab
            day is for. Don't quote any of it to a funder, a journal, or the divers themselves until it says <span className="italic">measured</span>.
          </p>
          <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-1.5">
            The one exception is <span className="text-[color:var(--color-brass-deep)]">Depth</span> — that's Boyle's law against their real record depths, and it's true today.
          </p>
        </div>
      )}

      {/* Modes */}
      <div className="flex flex-wrap gap-1.5">
        {(['sessions', 'compare', 'depth'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`font-sans text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-[3px] border-[0.5px] transition-colors ${
              mode === m
                ? 'border-[color:var(--color-border-brass)] text-[color:var(--color-brass)] bg-[color:var(--color-paper-card)]'
                : 'border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'
            }`}
          >
            {m === 'sessions' ? `sessions · ${state.physiology.length}` : m === 'compare' ? 'compare' : 'depth · the physics'}
          </button>
        ))}
      </div>

      {mode === 'sessions' && (
        <>
          <Filters
            state={state}
            person={person} setPerson={setPerson}
            metric={metric} setMetric={setMetric}
            metricsPresent={metricsPresent}
          />
          <div className="space-y-5">
            {filtered.length === 0 && (
              <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-faint)] py-8 text-center">
                Nothing recorded for that combination yet.
              </p>
            )}
            {filtered.map((d) => (
              <SessionCard key={d.id} d={d} color={person4(d.personKey)?.colorHint ?? METRIC_COLOR[d.metric]} name={person4(d.personKey)?.name ?? d.personKey} />
            ))}
          </div>
        </>
      )}

      {mode === 'compare' && <CompareChart />}
      {mode === 'depth' && <DepthPhysics />}
    </div>
  );
}

/* ---------- Filters -------------------------------------------------- */

function Filters({
  state, person, setPerson, metric, setMetric, metricsPresent,
}: {
  state: ReturnType<typeof useApp>['state'];
  person: FourKey | 'all'; setPerson: (p: FourKey | 'all') => void;
  metric: PhysiologyMetric | 'all'; setMetric: (m: PhysiologyMetric | 'all') => void;
  metricsPresent: PhysiologyMetric[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Chip active={person === 'all'} onClick={() => setPerson('all')}>everyone</Chip>
        {state.four.map((f) => (
          <Chip key={f.key} active={person === f.key} onClick={() => setPerson(f.key)} color={f.colorHint}>
            {f.name.split(' ')[0]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={metric === 'all'} onClick={() => setMetric('all')}>all signals</Chip>
        {metricsPresent.map((m) => (
          <Chip key={m} active={metric === m} onClick={() => setMetric(m)} color={METRIC_COLOR[m]}>
            {METRIC_LABEL[m]}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-sans text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[3px] border-[0.5px] transition-colors ${
        active ? 'border-current' : 'border-[color:var(--color-border-paper)] opacity-60 hover:opacity-100'
      }`}
      style={{ color: active ? (color ?? 'var(--color-brass)') : 'var(--color-on-paper-muted)' }}
    >
      {children}
    </button>
  );
}

/* ---------- Sessions -------------------------------------------------- */

function ProvChip({ d }: { d: PhysiologyDatum }) {
  const p = PROV_STYLE[provOf(d)];
  const Icon = p.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: p.color }} title={d.source}>
      <Icon size={11} /> {p.label}
    </span>
  );
}

function SessionCard({ d, color, name }: { d: PhysiologyDatum; color: string; name: string }) {
  const metricColor = METRIC_COLOR[d.metric];
  const data = samplesOf(d).map((v, i) => ({ t: i, v }));
  return (
    <article
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <header className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="display-italic text-[20px] text-[color:var(--color-on-paper)]">{name}</span>
          <span className="label-caps text-[color:var(--color-brass-deep)] flex items-center gap-1">
            <Activity size={11} /> {METRIC_LABEL[d.metric]}
          </span>
          {d.depthM != null && <span className="label-caps text-[color:var(--color-on-paper-faint)]">{d.depthM}m</span>}
        </div>
        <div className="flex items-center gap-3">
          <ProvChip d={d} />
          {d.usedInScore && <span className="label-caps text-[color:var(--color-brass)]">★ in the score</span>}
        </div>
      </header>
      <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] leading-snug mb-3 max-w-[80ch]">{d.contextNote}</p>

      {data.length > 1 && (
        <div className="h-[180px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`g-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={metricColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(10,43,79,0.08)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false} width={36} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#0a2b4f', border: 'none', borderRadius: 4, fontSize: 11, color: '#f4ecdc' }}
                labelStyle={{ color: '#d96c3d' }}
                formatter={(v: number | string) => [`${v} ${d.unit}`, '']}
                labelFormatter={(l) => `sample ${l}`}
              />
              <Area type="monotone" dataKey="v" stroke={metricColor} strokeWidth={2} fill={`url(#g-${d.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)] text-[11px]">
        {d.peakValue != null && <Stat label="peak" value={`${d.peakValue} ${d.unit}`} />}
        {d.minValue != null && <Stat label="low" value={`${d.minValue} ${d.unit}`} accent />}
        {d.duration != null && <Stat label="duration" value={fmtDur(d.duration)} />}
        {d.date && <Stat label="date" value={d.date} />}
        <Stat label="source" value={d.source} />
      </div>
      {d.notes && <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2 max-w-[80ch]">{d.notes}</p>}
    </article>
  );
}

/* ---------- Compare ---------------------------------------------------
   Their dives are different lengths, so raw sample index would compare
   nothing. Everything is resampled onto 0–100% of its own dive. */

function interpolate(samples: number[], pct: number): number | null {
  if (samples.length === 0) return null;
  if (samples.length === 1) return samples[0];
  const x = (pct / 100) * (samples.length - 1);
  const i = Math.floor(x);
  const frac = x - i;
  if (i >= samples.length - 1) return samples[samples.length - 1];
  return samples[i] * (1 - frac) + samples[i + 1] * frac;
}

function CompareChart() {
  const { state } = useApp();
  const metricsPresent = useMemo(() => {
    const set = new Set<PhysiologyMetric>();
    for (const d of state.physiology) set.add(d.metric);
    return [...set];
  }, [state.physiology]);

  const [metric, setMetric] = useState<PhysiologyMetric>(metricsPresent.includes('heart-rate') ? 'heart-rate' : metricsPresent[0]);

  const series = state.physiology.filter((d) => d.metric === metric);
  const unit = series[0]?.unit ?? '';

  const data = useMemo(() => {
    const rows: Array<Record<string, number>> = [];
    for (let pct = 0; pct <= 100; pct += 2) {
      const row: Record<string, number> = { pct };
      for (const d of series) {
        const v = interpolate(samplesOf(d), pct);
        if (v !== null) row[d.personKey] = Math.round(v * 100) / 100;
      }
      rows.push(row);
    }
    return rows;
  }, [series]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {metricsPresent.map((m) => (
          <Chip key={m} active={metric === m} onClick={() => setMetric(m)} color={METRIC_COLOR[m]}>
            {METRIC_LABEL[m]}
          </Chip>
        ))}
      </div>

      {series.length < 2 ? (
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-faint)] py-8 text-center max-w-[60ch] mx-auto">
          Only {series.length === 1 ? 'one of them has' : 'nobody has'} a {METRIC_LABEL[metric]} series — there's nothing to compare against yet.
          That absence is itself a note for the lab day.
        </p>
      ) : (
        <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
          <header className="mb-1">
            <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">
              {METRIC_LABEL[metric]} · {series.length} of the four
            </div>
            <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-0.5 max-w-[80ch]">
              Each dive is a different length, so every curve is stretched onto its own 0–100%. 0% is the last breath, 100% is the surface.
            </p>
          </header>

          <div className="h-[340px] -ml-2 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(10,43,79,0.08)" vertical={false} />
                <XAxis
                  dataKey="pct" tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }}
                  tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}
                />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#0a2b4f', border: 'none', borderRadius: 4, fontSize: 11, color: '#f4ecdc' }}
                  labelStyle={{ color: '#d96c3d' }}
                  formatter={(v: number | string, k: string) => {
                    const f = state.four.find((x) => x.key === k);
                    return [`${v} ${unit}`, f?.name ?? k];
                  }}
                  labelFormatter={(l) => `${l}% through the dive`}
                />
                <Legend
                  formatter={(k: string) => {
                    const f = state.four.find((x) => x.key === k);
                    return <span style={{ fontSize: 11, color: 'var(--color-on-paper-muted)' }}>{f?.name ?? k}</span>;
                  }}
                />
                {series.map((d) => {
                  const f = state.four.find((x) => x.key === d.personKey);
                  return (
                    <Line
                      key={d.id}
                      type="monotone"
                      dataKey={d.personKey}
                      stroke={f?.colorHint ?? METRIC_COLOR[metric]}
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray={provOf(d) === 'measured' ? undefined : '5 4'}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-2">
            Dashed = modelled. A solid line means somebody actually measured it.
          </p>
        </article>
      )}
    </div>
  );
}

/* ---------- Depth · the one honest chart -------------------------------
   Boyle's law: at depth d metres the ambient pressure is (1 + d/10) atm, so a
   lung holds 1/(1 + d/10) of its surface volume. That is not modelled and not
   negotiable — and the depths marked on it are their real records. */

function DepthPhysics() {
  const { state } = useApp();

  const curve = useMemo(() => {
    const rows: Array<{ depth: number; pct: number }> = [];
    for (let depth = 0; depth <= 140; depth += 1) {
      rows.push({ depth, pct: Math.round((100 / (1 + depth / 10)) * 100) / 100 });
    }
    return rows;
  }, []);

  /* Each diver's deepest ratified/standing depth, straight from Records. */
  const marks = useMemo(() => {
    return state.four
      .map((f) => {
        const deepest = state.records
          .filter((r) => r.personKey === f.key && typeof r.depthM === 'number')
          .sort((a, b) => (b.depthM ?? 0) - (a.depthM ?? 0))[0];
        if (!deepest?.depthM) return null;
        return {
          key: f.key, name: f.name.split(' ')[0], color: f.colorHint ?? 'var(--color-brass)',
          depth: deepest.depthM, discipline: deepest.discipline,
          pct: Math.round((100 / (1 + deepest.depthM / 10)) * 10) / 10,
        };
      })
      .filter(Boolean) as Array<{ key: string; name: string; color: string; depth: number; discipline: string; pct: number }>;
  }, [state.four, state.records]);

  return (
    <div className="space-y-4">
      <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
        <header className="mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">What depth does to a lung</div>
            <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--color-success)]">
              <FlaskConical size={11} /> physics · true today
            </span>
          </div>
          <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] mt-1 max-w-[80ch]">
            Boyle's law. At {' '}d{' '} metres the pressure is (1 + d/10) atmospheres, so a lung holds 1/(1 + d/10) of what it
            held at the surface. Nothing here is modelled or assumed — and the marks are their real records, pulled from Records.
          </p>
        </header>

        <div className="h-[360px] -ml-2 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curve} margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="g-boyle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d7a94" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3d7a94" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(10,43,79,0.08)" vertical={false} />
              <XAxis
                dataKey="depth" tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }}
                tickLine={false} axisLine={false} tickFormatter={(v) => `${v}m`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false}
                width={40} domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ background: '#0a2b4f', border: 'none', borderRadius: 4, fontSize: 11, color: '#f4ecdc' }}
                labelStyle={{ color: '#d96c3d' }}
                formatter={(v: number | string) => [`${v}% of surface volume`, '']}
                labelFormatter={(l) => `${l} metres`}
              />
              <Area type="monotone" dataKey="pct" stroke="#3d7a94" strokeWidth={2} fill="url(#g-boyle)" />
              {marks.map((m) => (
                <ReferenceLine key={`l-${m.key}`} x={m.depth} stroke={m.color} strokeDasharray="3 3" strokeOpacity={0.7} />
              ))}
              {marks.map((m) => (
                <ReferenceDot key={`d-${m.key}`} x={m.depth} y={m.pct} r={5} fill={m.color} stroke="var(--color-paper-light)" strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t-[0.5px] border-[color:var(--color-border-paper)]">
          {marks.map((m) => (
            <div key={m.key}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                <span className="label-caps text-[color:var(--color-on-paper-muted)]">{m.name} · {m.discipline}</span>
              </div>
              <div className="display-italic text-[26px] text-[color:var(--color-on-paper)] leading-none mt-1">{m.pct}%</div>
              <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-0.5">
                of their lungs left at {m.depth}m
              </div>
            </div>
          ))}
        </div>

        {marks.length > 0 && (
          <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug mt-4 max-w-[80ch]">
            Read the curve, not the numbers: almost all of the crushing happens in the first thirty metres — by 30m half the air is
            already gone. Everything past 100m is the body arguing over the last few percent. That's the shot the film wants: the
            violence is at the top, where it looks safe.
          </p>
        )}
      </article>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="label-caps text-[color:var(--color-brass-deep)]">{label}</div>
      <div className={`display-italic text-[15px] ${accent ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper)]'}`}>{value}</div>
    </div>
  );
}
