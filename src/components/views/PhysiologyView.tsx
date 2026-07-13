import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { FourKey, PhysiologyMetric } from '../../types';

/* Physiology · the score built from real bodies.
   The film's music, made from the divers' own physiology — the heart
   slowing toward stopping, blood-oxygen falling, then the surge back.
   Each datum's dataPointsCsv is charted as the would-be score. */

const METRIC_COLOR: Record<PhysiologyMetric, string> = {
  'heart-rate': '#d96c3d', 'blood-oxygen': '#3d7a94', 'blood-pressure': '#b54f26',
  'brain-activity': '#6f8a72', 'blood-shift': '#c9a961', thermal: '#c94a3a', other: '#8a8375',
};

function fmtDur(s?: number): string {
  if (!s) return '';
  const m = Math.floor(s / 60), r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`;
}

export function PhysiologyView() {
  const { state } = useApp();
  const t = useT();
  function person(key: FourKey) { return state.four.find((f) => f.key === key); }

  return (
    <div className="space-y-6 max-w-[1100px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('physiology.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('physiology.subtitle')}</p>
      </header>

      <div className="bg-[color:var(--color-chrome)] rounded-[3px] p-6">
        <div className="label-caps text-[9px] text-[color:var(--color-brass)] mb-2">the score is their own bodies</div>
        <p className="prose-body italic text-[16px] text-[color:var(--color-paper-light)] leading-relaxed max-w-[720px]">
          Every documentary about this sport uses a composer. This one uses the body the sport happens inside —
          the twenty-beat heart, the blood pulled into the chest, the brain defended last. The music can't lie about the depth, because it <span className="text-[color:var(--color-brass)]">is</span> the depth.
        </p>
      </div>

      <div className="space-y-5">
        {state.physiology.map((d) => {
          const p = person(d.personKey);
          const color = METRIC_COLOR[d.metric];
          const data = (d.dataPointsCsv ?? '').split(',').map((v, i) => ({ t: i, v: parseFloat(v.trim()) })).filter((x) => Number.isFinite(x.v));
          return (
            <article key={d.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5"
              style={{ borderTop: `3px solid ${p?.colorHint ?? color}` }}>
              <header className="flex items-baseline justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p?.colorHint ?? color }} />
                  <span className="display-italic text-[20px] text-[color:var(--color-on-paper)]">{p?.name ?? d.personKey}</span>
                  <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] flex items-center gap-1"><Activity size={11} /> {d.metric.replace('-', ' ')}</span>
                </div>
                {d.usedInScore && <span className="label-caps text-[8px] text-[color:var(--color-brass)]">★ in the score</span>}
              </header>
              <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] leading-snug mb-3">{d.contextNote}</p>

              {data.length > 1 && (
                <div className="h-[180px] -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`g-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(10,43,79,0.08)" vertical={false} />
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'rgba(10,43,79,0.4)' }} tickLine={false} axisLine={false} width={30} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        contentStyle={{ background: '#0a2b4f', border: 'none', borderRadius: 4, fontSize: 11, color: '#f4ecdc' }}
                        labelStyle={{ color: '#d96c3d' }}
                        formatter={(v: number | string) => [`${v} ${d.unit}`, '']}
                        labelFormatter={(l) => `sample ${l}`}
                      />
                      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${d.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)] text-[11px]">
                {d.peakValue != null && <Stat label="peak" value={`${d.peakValue} ${d.unit}`} />}
                {d.minValue != null && <Stat label="low" value={`${d.minValue} ${d.unit}`} accent />}
                {d.duration != null && <Stat label="duration" value={fmtDur(d.duration)} />}
                <Stat label="source" value={d.source} />
              </div>
              {d.notes && <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2">{d.notes}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="label-caps text-[8px] text-[color:var(--color-brass-deep)]">{label}</div>
      <div className={`display-italic text-[15px] ${accent ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper)]'}`}>{value}</div>
    </div>
  );
}
