import { useMemo, useState } from 'react';
import { useApp } from '../../state/AppContext';
import { computeGaps, gapsForShoot, type Gap } from '../../lib/gaps';
import type { Shoot } from '../../types';

/* The film's map — every shoot, plotted where it actually happens.

   Deliberately a stylised chart, not a tile map: no external tiles or API key
   (the app stays local-first and offline-capable), it prints, and the sea can
   be the film's chrome navy while the land is paper cream — the two worlds the
   whole palette is built on.

   Coastlines are low-poly by intent. They exist to make positions legible, not
   to survey Italy. Everything is authored in real [lng, lat] and projected, so
   the geography is honest even where the outline is loose. */

/* Frame: the western Med (Sardinia) across to Cyprus. */
const LON0 = 8;
const LON1 = 35;
const LAT0 = 33.5;
const LAT1 = 46.5;

/* Equirectangular, with the viewBox aspect pre-compressed by cos(latMid) so
   the proportions read correctly without per-point trig. */
const W = 1000;
const H = Math.round((W * (LAT1 - LAT0)) / ((LON1 - LON0) * Math.cos((40 * Math.PI) / 180)));

type Pt = readonly [number, number]; // [lng, lat]

function px(lng: number): number {
  return ((lng - LON0) / (LON1 - LON0)) * W;
}
function py(lat: number): number {
  return ((LAT1 - lat) / (LAT1 - LAT0)) * H;
}
function ring(points: readonly Pt[]): string {
  return points.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${px(lng).toFixed(1)},${py(lat).toFixed(1)}`).join(' ') + ' Z';
}

/* ---- Low-poly landmasses (authored in [lng, lat]) ---------------------- */

const ITALY: readonly Pt[] = [
  [6.8, 44.0], [8.8, 44.4], [10.0, 44.0], [10.3, 43.5], [11.2, 42.4], [12.0, 41.9],
  [13.0, 41.2], [14.0, 40.8], [14.9, 40.6], [15.8, 40.0], [16.0, 39.4], [15.9, 38.9],
  [15.6, 38.2], [16.2, 38.0], [16.6, 38.5], [17.2, 39.0], [17.1, 39.4], [16.5, 39.8],
  [17.0, 40.5], [17.9, 40.7], [18.4, 40.15], [18.5, 40.3], [18.0, 40.7], [17.2, 41.1],
  [16.2, 41.4], [15.9, 41.9], [16.2, 41.95], [15.5, 42.0], [14.7, 42.2], [14.2, 42.5],
  [13.7, 43.0], [13.5, 43.6], [12.9, 44.1], [12.3, 44.4], [12.3, 45.4], [13.6, 45.75],
  [12.5, 46.3], [10.5, 46.2], [8.5, 46.1], [6.8, 45.5],
];

const SICILY: readonly Pt[] = [
  [12.4, 37.8], [13.3, 38.2], [14.5, 38.1], [15.2, 38.3], [15.6, 38.2], [15.1, 37.5],
  [15.3, 37.1], [14.5, 36.7], [13.2, 37.1],
];

const SARDINIA: readonly Pt[] = [
  [8.2, 41.1], [9.3, 41.2], [9.6, 40.9], [9.7, 40.0], [9.6, 39.2], [9.1, 39.0],
  [8.4, 38.9], [8.4, 39.9], [8.2, 40.5],
];

const CORSICA: readonly Pt[] = [
  [8.6, 42.6], [9.4, 42.7], [9.5, 42.2], [9.4, 41.4], [8.8, 41.4], [8.6, 41.9],
];

/* Istria → the Croatian coast → Greece → Anatolia, closed off the top of frame. */
const BALKANS_ANATOLIA: readonly Pt[] = [
  [13.6, 45.75], [14.5, 45.3], [14.9, 44.9], [15.2, 44.3], [16.2, 43.5], [17.3, 42.9],
  [18.5, 42.4], [19.3, 41.9], [19.4, 41.3], [19.9, 40.5], [20.0, 39.5], [20.8, 39.0],
  [21.1, 38.3], [22.0, 38.4], [22.6, 38.0], [23.2, 37.4], [23.7, 37.9], [24.1, 38.4],
  [23.4, 39.2], [22.9, 39.6], [22.7, 40.5], [23.8, 40.4], [24.7, 40.9], [26.1, 40.6],
  [26.3, 41.7], [28.2, 41.4], [29.5, 41.0], [30.5, 40.5], [31.5, 40.0], [33.0, 36.8],
  [34.5, 36.3], [36.0, 36.2], [36.5, 40.0], [36.5, 47.5], [13.0, 47.5],
];

/* Painted back over the land above — cheaper and truer than routing the ring. */
const BLACK_SEA: readonly Pt[] = [
  [28.0, 41.2], [31.0, 41.3], [33.5, 42.0], [36.5, 41.8], [36.5, 45.0], [35.0, 45.3],
  [33.5, 46.2], [31.0, 46.6], [29.0, 45.0], [28.2, 43.4],
];

const CYPRUS: readonly Pt[] = [
  [32.3, 35.1], [33.5, 35.4], [34.6, 35.7], [34.0, 34.9], [33.0, 34.6], [32.3, 34.6],
];

const CRETE: readonly Pt[] = [
  [23.5, 35.3], [24.8, 35.4], [26.3, 35.2], [26.0, 34.9], [24.5, 35.0], [23.5, 35.1],
];

/* Tunisia + the Libyan edge; the rest falls below the frame. */
const AFRICA: readonly Pt[] = [
  [8.0, 37.3], [9.8, 37.35], [11.0, 37.1], [11.1, 36.5], [10.6, 35.9], [11.1, 35.2],
  [10.2, 34.5], [10.5, 33.8], [11.5, 33.3], [13.0, 32.9], [13.0, 30.0], [8.0, 30.0],
];

const LANDS: ReadonlyArray<readonly Pt[]> = [
  ITALY, SICILY, SARDINIA, CORSICA, BALKANS_ANATOLIA, CYPRUS, CRETE, AFRICA,
];

interface Plotted {
  shoot: Shoot;
  x: number;
  y: number;
  offMap: boolean;
  gaps: Gap[];
  worst?: Gap;
}

const STATUS_DONE = new Set(['completed', 'archived']);

export function FilmMap() {
  const { state, dispatch } = useApp();
  const [hover, setHover] = useState<string | null>(null);

  const gaps = useMemo(() => computeGaps(state), [state]);

  const plotted = useMemo<Plotted[]>(() => {
    return state.shoots
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .map((s) => {
        const lat = s.lat as number;
        const lng = s.lng as number;
        const inFrame = lng >= LON0 && lng <= LON1 && lat >= LAT0 && lat <= LAT1;
        const shootGaps = gapsForShoot(gaps, s.id);
        return {
          shoot: s,
          x: inFrame ? px(lng) : 0,
          y: inFrame ? py(lat) : 0,
          offMap: !inFrame,
          gaps: shootGaps,
          worst: shootGaps[0],
        };
      });
  }, [state.shoots, gaps]);

  const onMap = plotted.filter((p) => !p.offMap);
  const offMap = plotted.filter((p) => p.offMap);

  /* The route: shoots in date order — the film's actual journey. */
  const route = useMemo(() => {
    const dated = onMap
      .filter((p) => p.shoot.startDate)
      .sort((a, b) => (a.shoot.startDate as string).localeCompare(b.shoot.startDate as string));
    if (dated.length < 2) return '';
    return dated.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [onMap]);

  const graticule = useMemo(() => {
    const lines: Array<{ d: string; label: string; lx: number; ly: number }> = [];
    for (let lng = 10; lng <= LON1; lng += 5) {
      lines.push({ d: `M${px(lng)},0 L${px(lng)},${H}`, label: `${lng}°E`, lx: px(lng) + 3, ly: 12 });
    }
    for (let lat = 35; lat <= LAT1; lat += 5) {
      lines.push({ d: `M0,${py(lat)} L${W},${py(lat)}`, label: `${lat}°N`, lx: 4, ly: py(lat) - 3 });
    }
    return lines;
  }, []);

  function open(shootId: string) {
    dispatch({ type: 'SELECT_SHOOT', id: shootId });
    dispatch({ type: 'SET_VIEW', view: 'shoots' });
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto rounded-[4px] border-[0.5px] border-[color:var(--color-border-paper)]"
        role="img"
        aria-label="Map of every shoot location"
      >
        <defs>
          <linearGradient id="fm-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chrome-elevated)" />
            <stop offset="55%" stopColor="var(--color-chrome)" />
            <stop offset="100%" stopColor="var(--color-chrome-deep)" />
          </linearGradient>
        </defs>

        {/* the sea — below the surface */}
        <rect width={W} height={H} fill="url(#fm-sea)" />

        {/* graticule */}
        <g>
          {graticule.map((g, i) => (
            <path key={i} d={g.d} stroke="var(--color-border-chrome)" strokeWidth={0.5} fill="none" />
          ))}
          {graticule.map((g, i) => (
            <text
              key={`t${i}`}
              x={g.lx}
              y={g.ly}
              fill="var(--color-on-chrome-faint)"
              fontSize={9}
              fontFamily="var(--font-sans)"
              letterSpacing="0.08em"
            >
              {g.label}
            </text>
          ))}
        </g>

        {/* the land — alive, above */}
        <g>
          {LANDS.map((land, i) => (
            <path
              key={i}
              d={ring(land)}
              fill="var(--color-paper)"
              fillOpacity={0.9}
              stroke="var(--color-paper-deep)"
              strokeWidth={0.75}
            />
          ))}
          <path d={ring(BLACK_SEA)} fill="url(#fm-sea)" stroke="none" />
        </g>

        {/* the journey */}
        {route && (
          <path
            d={route}
            fill="none"
            stroke="var(--color-brass)"
            strokeWidth={1.25}
            strokeDasharray="5 5"
            strokeOpacity={0.65}
          />
        )}

        {/* the shoots */}
        <g>
          {onMap.map(({ shoot, x, y, worst }) => {
            const done = STATUS_DONE.has(shoot.status);
            const accent = shoot.colorHint ?? 'var(--color-brass)';
            const urgent = worst && (worst.severity === 'blocking' || worst.severity === 'urgent');
            const active = hover === shoot.id;
            return (
              <g
                key={shoot.id}
                transform={`translate(${x},${y})`}
                className="cursor-pointer"
                onClick={() => open(shoot.id)}
                onMouseEnter={() => setHover(shoot.id)}
                onMouseLeave={() => setHover(null)}
              >
                {/* a gap here — the map tells you before you ask */}
                {urgent && (
                  <circle r={16} fill="none" stroke="var(--color-danger)" strokeWidth={1} strokeOpacity={0.85}>
                    <animate attributeName="r" values="11;19;11" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.85;0;0.85" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={active ? 9 : 7} fill={done ? accent : 'var(--color-chrome-deep)'} stroke={accent} strokeWidth={2} />
                {done && <circle r={2.5} fill="var(--color-paper-light)" />}
                <text
                  x={12}
                  y={4}
                  fill="var(--color-on-chrome)"
                  fontSize={13}
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  style={{ paintOrder: 'stroke', stroke: 'var(--color-chrome-deep)', strokeWidth: 3 } as React.CSSProperties}
                >
                  {shoot.title.split('·')[0].trim()}
                </text>
                {shoot.startDate && (
                  <text
                    x={12}
                    y={18}
                    fill="var(--color-on-chrome-muted)"
                    fontSize={9}
                    fontFamily="var(--font-sans)"
                    letterSpacing="0.08em"
                    style={{ paintOrder: 'stroke', stroke: 'var(--color-chrome-deep)', strokeWidth: 3 } as React.CSSProperties}
                  >
                    {shoot.startDate}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Shoots outside the frame (the USA leg) + shoots with no coordinates yet. */}
      {(offMap.length > 0 || state.shoots.some((s) => s.lat === undefined)) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {offMap.map(({ shoot }) => (
            <button
              key={shoot.id}
              type="button"
              onClick={() => open(shoot.id)}
              className="text-[11px] px-2 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-border-brass)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] transition-colors"
            >
              ↗ off-map · {shoot.title.split('·')[0].trim()}
            </button>
          ))}
          {state.shoots
            .filter((s) => s.lat === undefined)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => open(s.id)}
                className="text-[11px] px-2 py-1 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper-strong)] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper)] transition-colors"
              >
                ? no location yet · {s.title.split('·')[0].trim()}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
