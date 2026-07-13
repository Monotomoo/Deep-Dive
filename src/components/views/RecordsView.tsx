import { useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { DivingRecord, FourKey } from '../../types';

/* Records · how deep, how long.
   The depth records drawn as an ocean that darkens as it deepens — each
   of the four dropping from the surface to their number. The time and
   distance records (Vito's stillness, Zsófia's pool) sit alongside:
   long, not deep. The full table stays below for reference. */

const W = 920, H = 470, TOP = 54, BOT = 34, LEFT = 96;

function timeFmt(s: number): string { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }
function measure(r: DivingRecord): string {
  if (r.depthM != null) return `${r.depthM} m`;
  if (r.timeSeconds != null) return timeFmt(r.timeSeconds);
  if (r.distanceM != null) return `${r.distanceM} m`;
  return '—';
}

export function RecordsView() {
  const { state } = useApp();
  const t = useT();

  const four = state.four;
  const colW = (W - LEFT - 30) / four.length;
  const colX = (i: number) => LEFT + colW * i + colW / 2;

  const depthRecs = useMemo(() => state.records.filter((r) => r.depthM != null), [state.records]);
  const maxDepth = Math.max(135, ...depthRecs.map((r) => r.depthM ?? 0)) + 8;
  const depthY = (d: number) => TOP + (d / maxDepth) * (H - TOP - BOT);
  const gridDepths = [25, 50, 75, 100, 125];

  const nonDepth = state.records.filter((r) => r.depthM == null);
  function person(key: FourKey | 'other') { return four.find((f) => f.key === key); }

  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('records.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('records.subtitle')}</p>
      </header>

      {/* Depth ocean */}
      <div className="rounded-[4px] overflow-hidden border-[0.5px] border-[color:var(--color-border-chrome)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
          <defs>
            <linearGradient id="ocean-depth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6f86" />
              <stop offset="30%" stopColor="#17517a" />
              <stop offset="65%" stopColor="#0a2b4f" />
              <stop offset="100%" stopColor="#04162c" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#ocean-depth)" />

          {/* surface shimmer */}
          <line x1="0" y1={TOP} x2={W} y2={TOP} stroke="rgba(244,236,220,0.5)" strokeWidth="1" />
          <text x="12" y={TOP - 8} fontSize="10" letterSpacing="2" fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.6)">SURFACE · 0 m</text>

          {/* depth gridlines */}
          {gridDepths.map((d) => (
            <g key={d}>
              <line x1={LEFT - 10} y1={depthY(d)} x2={W} y2={depthY(d)} stroke="rgba(244,236,220,0.09)" strokeWidth="0.5" strokeDasharray="3 6" />
              <text x="12" y={depthY(d) + 3} fontSize="10" fontFamily="JetBrains Mono, monospace" fill="rgba(244,236,220,0.4)">−{d} m</text>
            </g>
          ))}

          {/* per-person columns */}
          {four.map((f, i) => {
            const x = colX(i);
            const recs = depthRecs.filter((r) => r.personKey === f.key).sort((a, b) => (a.depthM ?? 0) - (b.depthM ?? 0));
            const c = f.colorHint ?? '#d96c3d';
            const deepest = recs[recs.length - 1];
            return (
              <g key={f.key}>
                <text x={x} y={26} textAnchor="middle" fontSize="15" fontStyle="italic" fontFamily="Fraunces, serif" fill="rgba(244,236,220,0.95)">{f.name.split(' ')[0]}</text>
                {deepest?.depthM != null && (
                  <line x1={x} y1={TOP} x2={x} y2={depthY(deepest.depthM)} stroke={c} strokeWidth="2" strokeOpacity="0.5" />
                )}
                {recs.map((r) => {
                  const y = depthY(r.depthM!);
                  const broken = r.status === 'broken';
                  return (
                    <g key={r.id}>
                      <circle cx={x} cy={y} r={broken ? 4 : 6} fill={broken ? 'none' : c} stroke={c} strokeWidth={broken ? 1.5 : 2} strokeDasharray={broken ? '2 2' : undefined} />
                      <text x={x + 12} y={y - 3} fontSize="13" fontStyle="italic" fontFamily="Fraunces, serif" fill="rgba(244,236,220,0.95)">{r.depthM} m</text>
                      <text x={x + 12} y={y + 10} fontSize="9" fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.55)">{r.discipline} · {r.date.slice(0, 4)}{broken ? ' · former' : ''}</text>
                    </g>
                  );
                })}
                {recs.length === 0 && (
                  <g>
                    <circle cx={x} cy={TOP} r="5" fill={c} />
                    <text x={x} y={TOP + 22} textAnchor="middle" fontSize="10" fontStyle="italic" fontFamily="Spectral, serif" fill="rgba(244,236,220,0.6)">goes long,</text>
                    <text x={x} y={TOP + 35} textAnchor="middle" fontSize="10" fontStyle="italic" fontFamily="Spectral, serif" fill="rgba(244,236,220,0.6)">not deep</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Long & wide — non-depth records */}
      {nonDepth.length > 0 && (
        <section>
          <h3 className="label-caps text-[color:var(--color-brass)] mb-3">long &amp; wide · time and distance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nonDepth.map((r) => {
              const p = person(r.personKey);
              return (
                <div key={r.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4" style={{ borderLeft: `3px solid ${p?.colorHint ?? 'var(--color-brass)'}` }}>
                  <div className="flex items-baseline gap-2">
                    <span className="display-italic text-[26px] text-[color:var(--color-on-paper)] tabular-nums leading-none">{measure(r)}</span>
                    <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{r.discipline} · {r.scope}</span>
                  </div>
                  <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-1">{p?.name ?? r.otherPersonName}</div>
                  {r.notes && <p className="prose-body text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-1">{r.notes}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full table */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">every record</h3>
        <div className="overflow-x-auto bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px]">
          <table className="text-[12px] w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[color:var(--color-border-paper)] text-left">
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">person</th>
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.discipline')}</th>
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.depth')}/{t('records.time')}</th>
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.scope')}</th>
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">event</th>
                <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">status</th>
              </tr>
            </thead>
            <tbody>
              {state.records.map((r) => {
                const p = person(r.personKey);
                return (
                  <tr key={r.id} className="border-b-[0.5px] border-[color:var(--color-border-paper)]/50 last:border-0">
                    <td className="p-2 display-italic text-[15px] text-[color:var(--color-on-paper)]">{p?.name ?? r.otherPersonName ?? '—'}</td>
                    <td className="p-2 tabular-nums">{r.discipline}</td>
                    <td className="p-2 tabular-nums text-[color:var(--color-brass-deep)]">{measure(r)}</td>
                    <td className="p-2 tabular-nums">{r.scope}</td>
                    <td className="p-2 prose-body italic text-[color:var(--color-on-paper-muted)]">{r.event ?? '—'}</td>
                    <td className={`p-2 label-caps text-[9px] ${r.status === 'standing' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>{r.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
