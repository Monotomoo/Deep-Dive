import { useMemo, useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import {
  Camera, Car, Footprints, Gauge, MapPin, Mountain, Plane, Plus, Tent,
  Trash2, Users, Utensils, Waves, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useI18n } from '../../i18n';
import type {
  TripCostCategory, TripCostLine, TripCostPer, TripDay, TripPoi, TripPoiKind, TripStop, UsaTrip,
} from '../../types';

/* USA Trip · the September RV road-trip for six.
   A stylised map you can read + edit — climbing walls, dive lakes, desert
   sights, stops on the way — plus a live RV budget. Fly SF → drive the
   Sierra + desert loop → end Las Vegas → fly straight to Cyprus. */

const CAT_COLOR: Record<TripCostCategory, string> = {
  rv: '#d96c3d', fuel: '#b54f26', camp: '#6f8a72', food: '#c9a961',
  park: '#3d7a94', flights: '#4c6b93', gear: '#8a8375', insurance: '#5b7da1', other: '#9e7a63',
};
const CATEGORIES: TripCostCategory[] = ['rv', 'fuel', 'camp', 'food', 'park', 'flights', 'insurance', 'gear', 'other'];
const PERS: TripCostPer[] = ['trip', 'day', 'night', 'person'];

const POI_KINDS: TripPoiKind[] = ['climb', 'dive', 'hike', 'sight', 'food', 'camp', 'drive', 'other'];
const POI_COLOR: Record<TripPoiKind, string> = {
  climb: '#b54f26', dive: '#3d7a94', hike: '#6f8a72', sight: '#c9a961',
  food: '#d96c3d', camp: '#5b7da1', drive: '#8a8375', other: '#9e7a63',
};
const POI_ICON: Record<TripPoiKind, typeof Mountain> = {
  climb: Mountain, dive: Waves, hike: Footprints, sight: Camera,
  food: Utensils, camp: Tent, drive: Car, other: MapPin,
};

const MAP_W = 1000, MAP_H = 560;

function makeId(p: string) { return `${p}-${Math.random().toString(36).slice(2, 8)}`; }
function usd(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
const px = (mx?: number) => ((mx ?? 50) / 100) * MAP_W;
const py = (my?: number) => ((my ?? 50) / 100) * MAP_H;

export function UsaTripView() {
  const { state, dispatch } = useApp();
  const { fmtDate } = useI18n();
  const trip = state.usaTrip;

  const [selectedStopId, setSelectedStopId] = useState<string>(trip.stops[0]?.id ?? '');
  const [editingStop, setEditingStop] = useState<TripStop | null>(null);
  const [newStop, setNewStop] = useState(false);
  const [editingCost, setEditingCost] = useState<TripCostLine | null>(null);
  const [newCost, setNewCost] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [editingDay, setEditingDay] = useState<TripDay | null>(null);
  const [newDay, setNewDay] = useState(false);

  const selected = trip.stops.find((s) => s.id === selectedStopId) ?? trip.stops[0] ?? null;

  const days = useMemo(() => {
    try { return Math.max(1, differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1); }
    catch { return 27; }
  }, [trip.startDate, trip.endDate]);
  const nights = useMemo(() => {
    const fromStops = trip.stops.reduce((s, x) => s + (x.nights ?? 0), 0);
    return fromStops > 0 ? fromStops : days - 1;
  }, [trip.stops, days]);
  const totalMiles = useMemo(() => trip.stops.reduce((s, x) => s + (x.driveMiles ?? 0), 0), [trip.stops]);

  function lineTotal(line: TripCostLine): number {
    const qty = line.qty ?? 1;
    const mult = line.per === 'trip' ? 1 : line.per === 'day' ? days : line.per === 'night' ? nights : trip.people;
    return line.amountUsd * qty * mult;
  }
  const { grandTotal, byCategory } = useMemo(() => {
    let total = 0; const cat: Record<string, number> = {};
    for (const line of trip.costs) { const v = lineTotal(line); total += v; cat[line.category] = (cat[line.category] ?? 0) + v; }
    return { grandTotal: total, byCategory: cat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.costs, days, nights, trip.people]);
  const perPerson = grandTotal / Math.max(trip.people, 1);
  const perDay = grandTotal / days;

  const routePath = useMemo(() => {
    if (!trip.stops.length) return '';
    return trip.stops.map((s, i) => `${i === 0 ? 'M' : 'L'} ${px(s.mapX).toFixed(0)} ${py(s.mapY).toFixed(0)}`).join(' ');
  }, [trip.stops]);

  function saveStop(s: TripStop) {
    if (trip.stops.some((x) => x.id === s.id)) dispatch({ type: 'UPDATE_TRIP_STOP', id: s.id, patch: s });
    else dispatch({ type: 'ADD_TRIP_STOP', stop: s });
    setSelectedStopId(s.id); setEditingStop(null); setNewStop(false);
  }
  function saveCost(c: TripCostLine) {
    if (trip.costs.some((x) => x.id === c.id)) dispatch({ type: 'UPDATE_TRIP_COST', id: c.id, patch: c });
    else dispatch({ type: 'ADD_TRIP_COST', cost: c });
    setEditingCost(null); setNewCost(false);
  }
  function saveDay(d: TripDay) {
    if (trip.days.some((x) => x.id === d.id)) dispatch({ type: 'UPDATE_TRIP_DAY', id: d.id, patch: d });
    else dispatch({ type: 'ADD_TRIP_DAY', day: d });
    setEditingDay(null); setNewDay(false);
  }
  const sortedDays = [...(trip.days ?? [])].sort((a, b) => a.dayNum - b.dayNum);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <style>{`@keyframes dashmove { to { stroke-dashoffset: -24; } }`}</style>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{trip.title}</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)} · {days} days · {trip.startCity} → {trip.endCity} → fly {trip.flyOnTo}
          </p>
        </div>
        <button type="button" onClick={() => setEditingMeta(true)}
          className="mt-1 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] shrink-0">
          Trip settings
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        <MetaChip icon={<Users size={13} />} label="People" value={`${trip.people}`} />
        <MetaChip icon={<Gauge size={13} />} label="Total drive" value={`${totalMiles} mi`} />
        <MetaChip icon={<MapPin size={13} />} label="Nights" value={`${nights}`} />
        <MetaChip icon={<Plane size={13} />} label="Ends" value={`fly ${trip.endCity} → ${trip.flyOnTo}`} />
      </div>

      {/* Map + selected-stop detail */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Map */}
        <div className="bg-[color:var(--color-chrome-deep)] rounded-[4px] border-[0.5px] border-[color:var(--color-border-chrome)] overflow-hidden relative">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-full block">
            <defs>
              <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#123c68" />
                <stop offset="100%" stopColor="#0a2b4f" />
              </linearGradient>
              <linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0e3358" />
                <stop offset="100%" stopColor="#08213c" />
              </linearGradient>
            </defs>

            {/* land */}
            <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#land)" />
            {/* Pacific — a wedge on the west/southwest */}
            <path d="M 0 0 L 165 0 C 150 120, 95 180, 130 250 C 165 330, 70 430, 0 520 L 0 560 L 0 0 Z" fill="url(#ocean)" />
            <text x="46" y="120" fontSize="12" fontStyle="italic" fontFamily="Spectral, serif" fill="rgba(244,236,220,0.35)" transform="rotate(-42 46 120)">Pacific</text>

            {/* CA / NV border */}
            <path d="M 615 0 L 560 560" fill="none" stroke="rgba(244,236,220,0.12)" strokeWidth="1" strokeDasharray="4 5" />
            <text x="300" y="500" fontSize="12" letterSpacing="3" fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.16)">CALIFORNIA</text>
            <text x="700" y="120" fontSize="12" letterSpacing="3" fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.16)">NEVADA</text>

            {/* Sierra hint — little peaks along the range */}
            {[[360, 250], [395, 300], [430, 360], [470, 410], [340, 210]].map(([x, y], i) => (
              <path key={i} d={`M ${x - 14} ${y} L ${x} ${y - 20} L ${x + 14} ${y} Z`} fill="rgba(244,236,220,0.06)" />
            ))}

            {/* route */}
            <path d={routePath} fill="none" stroke="rgba(217,108,61,0.35)" strokeWidth="5" strokeLinecap="round" />
            <path d={routePath} fill="none" stroke="var(--color-brass)" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray="2 10" style={{ animation: 'dashmove 1.2s linear infinite' }} />

            {/* fly-on arrow from Vegas toward off-map Cyprus */}
            {(() => {
              const end = trip.stops.find((s) => s.role === 'end') ?? trip.stops[trip.stops.length - 1];
              if (!end) return null;
              const ex = px(end.mapX), ey = py(end.mapY);
              return (
                <g>
                  <path d={`M ${ex} ${ey} Q ${ex + 60} ${ey - 30}, ${MAP_W - 12} ${ey - 46}`} fill="none" stroke="rgba(61,122,148,0.7)" strokeWidth="1.6" strokeDasharray="5 5" />
                  <text x={MAP_W - 14} y={ey - 52} textAnchor="end" fontSize="12" fontStyle="italic" fontFamily="Fraunces, serif" fill="rgba(61,122,148,0.95)">✈ {trip.flyOnTo}</text>
                </g>
              );
            })()}

            {/* pins */}
            {trip.stops.map((s, i) => {
              const x = px(s.mapX), y = py(s.mapY);
              const isSel = s.id === selectedStopId;
              const color = s.colorHint ?? '#d96c3d';
              return (
                <g key={s.id} transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={() => setSelectedStopId(s.id)}>
                  {isSel && <circle r="16" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />}
                  <circle r={isSel ? 9 : 7} fill={color} stroke="rgba(244,236,220,0.9)" strokeWidth="2" />
                  <text y="-14" textAnchor="middle" fontSize={isSel ? 14 : 12} fontStyle="italic" fontFamily="Fraunces, serif"
                    fill={isSel ? 'rgba(244,236,220,0.98)' : 'rgba(244,236,220,0.72)'}>{s.name}</text>
                  {(s.pois?.length ?? 0) > 0 && (
                    <text y="4" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(244,236,220,0.95)">{s.pois!.length}</text>
                  )}
                  <text y="22" textAnchor="middle" fontSize="9" fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.45)">
                    {i === 0 ? 'fly in' : s.role === 'end' ? 'fly out' : `${s.nights ?? 0}n`}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* kind legend */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 max-w-[70%]">
            {(['climb', 'dive', 'hike', 'sight'] as TripPoiKind[]).map((k) => (
              <span key={k} className="flex items-center gap-1 text-[9px] text-[color:var(--color-paper-light)]/60">
                <span className="w-2 h-2 rounded-full" style={{ background: POI_COLOR[k] }} /> {k}
              </span>
            ))}
          </div>
        </div>

        {/* Selected stop detail */}
        {selected && (
          <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] p-4 flex flex-col" style={{ borderTop: `3px solid ${selected.colorHint ?? 'var(--color-brass)'}` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="label-caps text-[8px] text-[color:var(--color-brass-deep)]">
                  {selected.role === 'start' ? 'fly in · start' : selected.role === 'end' ? 'end · drop RV' : 'stop'}
                </div>
                <div className="display-italic text-[24px] text-[color:var(--color-on-paper)] leading-tight">{selected.name}</div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[color:var(--color-on-paper-muted)]">
                  {selected.nights != null && <span>{selected.nights} nights</span>}
                  {selected.driveMiles ? <span>· {selected.driveMiles} mi</span> : null}
                  {selected.driveHours ? <span>· {selected.driveHours} h drive</span> : null}
                </div>
              </div>
              <button type="button" onClick={() => { setNewStop(false); setEditingStop(selected); }}
                className="text-[10px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)] shrink-0">edit</button>
            </div>
            {selected.note && <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2">{selected.note}</p>}

            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mt-3 mb-1.5">
              things to do · {selected.pois?.length ?? 0}
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[340px] pr-1">
              {(selected.pois ?? []).map((p) => {
                const Icon = POI_ICON[p.kind];
                return (
                  <div key={p.id} className="bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-2.5" style={{ borderLeft: `3px solid ${POI_COLOR[p.kind]}` }}>
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} style={{ color: POI_COLOR[p.kind] }} />
                      <span className="text-[13px] text-[color:var(--color-on-paper)] font-sans leading-tight">{p.name}</span>
                      {p.onTheWay && <span className="text-[8px] uppercase tracking-wide px-1 py-0.5 rounded-[2px] bg-[color:var(--color-paper-deep)] text-[color:var(--color-on-paper-muted)]">on the way</span>}
                    </div>
                    {p.detail && <div className="prose-body text-[10px] text-[color:var(--color-brass-deep)] mt-0.5">{p.detail}</div>}
                    {p.note && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-0.5">{p.note}</div>}
                  </div>
                );
              })}
              {(selected.pois?.length ?? 0) === 0 && (
                <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] py-4 text-center">No spots yet — hit edit to add climbs, dives, sights.</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Stop selector chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {trip.stops.map((s) => (
          <button key={s.id} type="button" onClick={() => setSelectedStopId(s.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] transition-colors ${
              s.id === selectedStopId ? 'text-[color:var(--color-paper-light)]' : 'text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)]'
            }`} style={s.id === selectedStopId ? { background: s.colorHint ?? 'var(--color-brass)' } : {}}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.colorHint ?? 'var(--color-brass)' }} /> {s.name}
          </button>
        ))}
        <button type="button" onClick={() => { setNewStop(true); setEditingStop({ id: makeId('stop'), name: '', role: 'stop', nights: 1, mapX: 50, mapY: 50, pois: [] }); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors">
          <Plus size={11} /> Add stop
        </button>
      </div>

      {trip.rvNote && (
        <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-4 py-2.5">
          {trip.rvNote}
        </p>
      )}

      {/* Day by day */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">day by day · {sortedDays.length} days</h3>
          <button type="button"
            onClick={() => {
              const n = sortedDays.length;
              const last = sortedDays[n - 1];
              setNewDay(true);
              setEditingDay({ id: makeId('day'), dayNum: (last?.dayNum ?? 0) + 1, date: last?.date ?? trip.startDate, title: '', stopId: last?.stopId });
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors">
            <Plus size={11} /> Add day
          </button>
        </div>
        <div className="space-y-1.5">
          {sortedDays.map((d) => {
            const stop = d.stopId ? trip.stops.find((s) => s.id === d.stopId) : null;
            return (
              <button key={d.id} type="button" onClick={() => { setNewDay(false); setEditingDay(d); }}
                className="group w-full text-left flex items-stretch gap-3 bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-2.5 hover:border-[color:var(--color-brass)] transition-colors"
                style={{ borderLeft: `3px solid ${stop?.colorHint ?? 'var(--color-brass-deep)'}` }}>
                <div className="shrink-0 w-[86px] text-center border-r-[0.5px] border-[color:var(--color-border-paper)] pr-3 flex flex-col justify-center">
                  <div className="display-italic text-[18px] text-[color:var(--color-brass)] leading-none">D{d.dayNum}</div>
                  <div className="tabular-nums text-[10px] text-[color:var(--color-on-paper-muted)] mt-0.5">{fmtDate(d.date)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[13px] text-[color:var(--color-on-paper)] leading-tight">{d.title}</span>
                    {stop && <span className="text-[9px] px-1.5 py-0.5 rounded-[2px]" style={{ background: `color-mix(in oklab, ${stop.colorHint ?? '#d96c3d'} 14%, transparent)`, color: stop.colorHint ?? '#d96c3d' }}>{stop.name}</span>}
                    {d.driveMiles ? <span className="text-[9px] text-[color:var(--color-on-paper-faint)] flex items-center gap-0.5"><Car size={9} /> {d.driveMiles}mi</span> : null}
                  </div>
                  {d.plan && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-0.5">{d.plan}</div>}
                </div>
              </button>
            );
          })}
          {sortedDays.length === 0 && (
            <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)] py-6 text-center">No days yet — add the itinerary day by day.</p>
          )}
        </div>
      </section>

      {/* Budget */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="label-caps text-[color:var(--color-brass)]">RV budget · estimate</h3>
            <button type="button" onClick={() => { setNewCost(true); setEditingCost({ id: makeId('cost'), label: '', category: 'other', amountUsd: 0, per: 'trip' }); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors">
              <Plus size={11} /> Add cost
            </button>
          </div>
          <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b-[0.5px] border-[color:var(--color-border-paper)]">
                  <th className="text-left px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Item</th>
                  <th className="text-right px-2 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Unit</th>
                  <th className="text-left px-2 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">×</th>
                  <th className="text-right px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Total</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {trip.costs.map((line) => (
                  <tr key={line.id} className="group border-b-[0.5px] border-[color:var(--color-border-paper)] last:border-0 hover:bg-[color:var(--color-paper-card)] cursor-pointer"
                    onClick={() => { setNewCost(false); setEditingCost(line); }}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLOR[line.category] }} />
                        <span className="text-[color:var(--color-on-paper)]">{line.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-[color:var(--color-on-paper-muted)]">{usd(line.amountUsd)}</td>
                    <td className="px-2 py-2 text-[10px] text-[color:var(--color-on-paper-faint)]">/{line.per}{line.qty && line.qty !== 1 ? ` ×${line.qty}` : ''}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[color:var(--color-on-paper)]">{usd(lineTotal(line))}</td>
                    <td className="px-1">
                      <button type="button" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_TRIP_COST', id: line.id }); }}
                        className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"><Trash2 size={11} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-[color:var(--color-chrome)] rounded-[3px] p-5">
            <div className="label-caps text-[9px] text-[color:var(--color-brass)] mb-1">estimated total</div>
            <div className="display-italic text-[38px] text-[color:var(--color-paper-light)] tabular-nums leading-none">{usd(grandTotal)}</div>
            <div className="flex gap-4 mt-3 pt-3 border-t-[0.5px] border-[color:var(--color-border-chrome)]">
              <div><div className="label-caps text-[8px] text-[color:var(--color-paper-light)]/50">per person</div><div className="display-italic text-[18px] text-[color:var(--color-paper-light)] tabular-nums">{usd(perPerson)}</div></div>
              <div><div className="label-caps text-[8px] text-[color:var(--color-paper-light)]/50">per day</div><div className="display-italic text-[18px] text-[color:var(--color-paper-light)] tabular-nums">{usd(perDay)}</div></div>
            </div>
          </div>
          <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">by category</div>
            <ul className="space-y-1.5">
              {CATEGORIES.filter((c) => byCategory[c]).map((c) => {
                const pct = grandTotal > 0 ? (byCategory[c] / grandTotal) * 100 : 0;
                return (
                  <li key={c}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-[color:var(--color-on-paper)]"><span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[c] }} /> {c}</span>
                      <span className="tabular-nums text-[color:var(--color-on-paper-muted)]">{usd(byCategory[c])}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[color:var(--color-paper-deep)] mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: CAT_COLOR[c] }} /></div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {editingStop && (
        <StopEditor stop={editingStop} isNew={newStop} onSave={saveStop}
          onDelete={() => { dispatch({ type: 'DELETE_TRIP_STOP', id: editingStop.id }); setEditingStop(null); setNewStop(false); }}
          onCancel={() => { setEditingStop(null); setNewStop(false); }} />
      )}
      {editingCost && (
        <CostEditor cost={editingCost} isNew={newCost} onSave={saveCost}
          onDelete={() => { dispatch({ type: 'DELETE_TRIP_COST', id: editingCost.id }); setEditingCost(null); setNewCost(false); }}
          onCancel={() => { setEditingCost(null); setNewCost(false); }} />
      )}
      {editingMeta && (
        <MetaEditor trip={trip} onSave={(patch) => { dispatch({ type: 'UPDATE_TRIP', patch }); setEditingMeta(false); }} onCancel={() => setEditingMeta(false)} />
      )}
      {editingDay && (
        <DayEditor day={editingDay} stops={trip.stops} isNew={newDay} onSave={saveDay}
          onDelete={() => { dispatch({ type: 'DELETE_TRIP_DAY', id: editingDay.id }); setEditingDay(null); setNewDay(false); }}
          onCancel={() => { setEditingDay(null); setNewDay(false); }} />
      )}
    </div>
  );
}

function DayEditor({ day, stops, isNew, onSave, onDelete, onCancel }: { day: TripDay; stops: TripStop[]; isNew: boolean; onSave: (d: TripDay) => void; onDelete: () => void; onCancel: () => void }) {
  const [d, setD] = useState<TripDay>(day);
  return (
    <Modal title={isNew ? 'Add day' : `Day ${d.dayNum}`} onCancel={onCancel}>
      <div className="grid grid-cols-4 gap-3">
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Day #</div>
          <input type="number" min={1} value={d.dayNum} onChange={(e) => setD({ ...d, dayNum: parseInt(e.target.value, 10) || 1 })} className={inputCls} /></label>
        <label className="block col-span-2"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Date</div>
          <input type="date" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Miles</div>
          <input type="number" min={0} value={d.driveMiles ?? 0} onChange={(e) => setD({ ...d, driveMiles: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></label>
      </div>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Title</div>
        <input type="text" value={d.title} autoFocus onChange={(e) => setD({ ...d, title: e.target.value })} className={inputCls} /></label>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Based at</div>
        <select value={d.stopId ?? ''} onChange={(e) => setD({ ...d, stopId: e.target.value || undefined })} className={inputCls}>
          <option value="">—</option>
          {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select></label>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Plan</div>
        <textarea value={d.plan ?? ''} rows={2} onChange={(e) => setD({ ...d, plan: e.target.value })} className={`${inputCls} italic`} /></label>
      <Actions onCancel={onCancel} onSave={() => onSave(d)} onDelete={isNew ? undefined : onDelete} disabled={!d.title.trim()} />
    </Modal>
  );
}

function MetaChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-1.5">
      <span className="text-[color:var(--color-brass)]">{icon}</span>
      <div><div className="label-caps text-[8px] text-[color:var(--color-brass-deep)]">{label}</div><div className="display-italic text-[14px] text-[color:var(--color-on-paper)] leading-none">{value}</div></div>
    </div>
  );
}

const inputCls = 'w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]';

function Modal({ title, wide, children, onCancel }: { title: string; wide?: boolean; children: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className={`bg-[color:var(--color-paper-light)] rounded-[4px] ${wide ? 'max-w-[640px]' : 'max-w-[500px]'} w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{title}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

function Actions({ onCancel, onSave, onDelete, disabled }: { onCancel: () => void; onSave: () => void; onDelete?: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-between pt-2">
      {onDelete ? (
        <button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"><Trash2 size={11} /> Delete</button>
      ) : <span />}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">Cancel</button>
        <button type="button" onClick={onSave} disabled={disabled} className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40">Save</button>
      </div>
    </div>
  );
}

function StopEditor({ stop, isNew, onSave, onDelete, onCancel }: { stop: TripStop; isNew: boolean; onSave: (s: TripStop) => void; onDelete: () => void; onCancel: () => void }) {
  const [s, setS] = useState<TripStop>({ ...stop, pois: stop.pois ?? [] });

  const setPoi = (id: string, patch: Partial<TripPoi>) => setS({ ...s, pois: (s.pois ?? []).map((p) => p.id === id ? { ...p, ...patch } : p) });
  const addPoi = () => setS({ ...s, pois: [...(s.pois ?? []), { id: makeId('poi'), name: '', kind: 'sight' }] });
  const delPoi = (id: string) => setS({ ...s, pois: (s.pois ?? []).filter((p) => p.id !== id) });

  return (
    <Modal title={isNew ? 'Add stop' : `Edit · ${s.name || 'stop'}`} wide onCancel={onCancel}>
      <label className="block">
        <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Name</div>
        <input type="text" value={s.name} autoFocus onChange={(e) => setS({ ...s, name: e.target.value })} className={inputCls} />
      </label>
      <div className="grid grid-cols-4 gap-3">
        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Role</div>
          <select value={s.role ?? 'stop'} onChange={(e) => setS({ ...s, role: e.target.value as TripStop['role'] })} className={inputCls}>
            <option value="start">start</option><option value="stop">stop</option><option value="end">end</option>
          </select>
        </label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Nights</div>
          <input type="number" min={0} value={s.nights ?? 0} onChange={(e) => setS({ ...s, nights: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Miles</div>
          <input type="number" min={0} value={s.driveMiles ?? 0} onChange={(e) => setS({ ...s, driveMiles: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Hours</div>
          <input type="number" min={0} step={0.5} value={s.driveHours ?? 0} onChange={(e) => setS({ ...s, driveHours: parseFloat(e.target.value) || 0 })} className={inputCls} /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Map X (0–100 · west→east)</div>
          <input type="number" min={0} max={100} value={s.mapX ?? 50} onChange={(e) => setS({ ...s, mapX: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Map Y (0–100 · north→south)</div>
          <input type="number" min={0} max={100} value={s.mapY ?? 50} onChange={(e) => setS({ ...s, mapY: parseInt(e.target.value, 10) || 0 })} className={inputCls} /></label>
      </div>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Note</div>
        <textarea value={s.note ?? ''} rows={2} onChange={(e) => setS({ ...s, note: e.target.value })} className={`${inputCls} italic`} /></label>

      {/* POIs */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">Things to do</div>
          <button type="button" onClick={addPoi} className="flex items-center gap-1 text-[10px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)]"><Plus size={10} /> add spot</button>
        </div>
        <div className="space-y-2">
          {(s.pois ?? []).map((p) => (
            <div key={p.id} className="bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-2 space-y-1.5" style={{ borderLeft: `3px solid ${POI_COLOR[p.kind]}` }}>
              <div className="flex gap-2">
                <input type="text" value={p.name} placeholder="Name" onChange={(e) => setPoi(p.id, { name: e.target.value })} className={`${inputCls} flex-1`} />
                <select value={p.kind} onChange={(e) => setPoi(p.id, { kind: e.target.value as TripPoiKind })} className={`${inputCls} w-[92px]`}>
                  {POI_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <button type="button" onClick={() => delPoi(p.id)} className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] px-1"><Trash2 size={12} /></button>
              </div>
              <div className="flex gap-2 items-center">
                <input type="text" value={p.detail ?? ''} placeholder="detail (depth / grade / distance)" onChange={(e) => setPoi(p.id, { detail: e.target.value })} className={`${inputCls} flex-1 text-[11px]`} />
                <label className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)] shrink-0">
                  <input type="checkbox" checked={!!p.onTheWay} onChange={(e) => setPoi(p.id, { onTheWay: e.target.checked })} /> on the way
                </label>
              </div>
              <input type="text" value={p.note ?? ''} placeholder="note — why it matters" onChange={(e) => setPoi(p.id, { note: e.target.value })} className={`${inputCls} text-[11px] italic`} />
            </div>
          ))}
        </div>
      </div>

      <Actions onCancel={onCancel} onSave={() => onSave(s)} onDelete={isNew ? undefined : onDelete} disabled={!s.name.trim()} />
    </Modal>
  );
}

function CostEditor({ cost, isNew, onSave, onDelete, onCancel }: { cost: TripCostLine; isNew: boolean; onSave: (c: TripCostLine) => void; onDelete: () => void; onCancel: () => void }) {
  const [c, setC] = useState<TripCostLine>(cost);
  return (
    <Modal title={isNew ? 'Add cost' : 'Edit cost'} onCancel={onCancel}>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Label</div>
        <input type="text" value={c.label} autoFocus onChange={(e) => setC({ ...c, label: e.target.value })} className={inputCls} /></label>
      <div className="grid grid-cols-4 gap-3">
        <label className="block col-span-2"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Category</div>
          <select value={c.category} onChange={(e) => setC({ ...c, category: e.target.value as TripCostCategory })} className={inputCls}>{CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">USD</div>
          <input type="number" min={0} value={c.amountUsd} onChange={(e) => setC({ ...c, amountUsd: parseFloat(e.target.value) || 0 })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Per</div>
          <select value={c.per} onChange={(e) => setC({ ...c, per: e.target.value as TripCostPer })} className={inputCls}>{PERS.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
      </div>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Notes</div>
        <input type="text" value={c.notes ?? ''} onChange={(e) => setC({ ...c, notes: e.target.value })} className={inputCls} /></label>
      <Actions onCancel={onCancel} onSave={() => onSave(c)} onDelete={isNew ? undefined : onDelete} disabled={!c.label.trim()} />
    </Modal>
  );
}

function MetaEditor({ trip, onSave, onCancel }: { trip: UsaTrip; onSave: (p: Partial<UsaTrip>) => void; onCancel: () => void }) {
  const [m, setM] = useState<UsaTrip>(trip);
  return (
    <Modal title="Trip settings" onCancel={onCancel}>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Title</div>
        <input type="text" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} className={inputCls} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Start date</div>
          <input type="date" value={m.startDate} onChange={(e) => setM({ ...m, startDate: e.target.value })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">End date</div>
          <input type="date" value={m.endDate} onChange={(e) => setM({ ...m, endDate: e.target.value })} className={inputCls} /></label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Start city</div>
          <input type="text" value={m.startCity} onChange={(e) => setM({ ...m, startCity: e.target.value })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">End city</div>
          <input type="text" value={m.endCity} onChange={(e) => setM({ ...m, endCity: e.target.value })} className={inputCls} /></label>
        <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Fly on to</div>
          <input type="text" value={m.flyOnTo} onChange={(e) => setM({ ...m, flyOnTo: e.target.value })} className={inputCls} /></label>
      </div>
      <label className="block w-1/3"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">People</div>
        <input type="number" min={1} value={m.people} onChange={(e) => setM({ ...m, people: parseInt(e.target.value, 10) || 1 })} className={inputCls} /></label>
      <label className="block"><div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">RV note</div>
        <textarea value={m.rvNote ?? ''} rows={2} onChange={(e) => setM({ ...m, rvNote: e.target.value })} className={`${inputCls} italic`} /></label>
      <Actions onCancel={onCancel} onSave={() => onSave(m)} />
    </Modal>
  );
}
