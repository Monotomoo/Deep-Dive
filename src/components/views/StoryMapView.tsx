import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type DragEvent, type ReactNode,
} from 'react';
import {
  ChevronLeft, ChevronRight, Film, GitBranch, Lightbulb, MapPin, Notebook, Plus, Trash2, User, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type {
  AppState, FourKey, Interview, MapAside, MapLane, MapLink, MapLinkKind, MapNode, MapNodeKind, Milestone, Shoot,
} from '../../types';
import { classifyLabel, depthValue, markForm } from '../../lib/mapKinds';
import { EditableText } from '../primitives/EditableText';

/* The Plan — the map Tomo and Vito drew, laid over the season.

   Two registers on one board. On top, the six stages they drew, left to right
   in the order they drew them: the chapters of the film. Underneath, the
   season itself: every shoot as a bar at its real dates, done ones solid,
   planned ones outlined, with today marked. Between the two, wires. A stage
   that is wired to a shoot gets a line from its foot down to that bar, so the
   board answers the producer's question without a word: what is shot, what
   remains, and where each chapter's material comes from.

   Still no edit mode. Click a word to rewrite it, type under a stage to add a
   mark, drag a mark between stages, "+ connect" to wire a stage to a shoot, a
   part of the scenario, an interview, an idea, a thread or one of the four.

   Colour is spent only where it carries meaning: a diver's signature hue, a
   shoot's own colour on its bar, and each stage's colour on the wires that
   leave it — so a line can be followed back to its stage by eye. */

/* ---------- small helpers ---------------------------------------------- */

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
const norm = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

const DAY = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PX_PER_MONTH = 58;          // the calendar never gets narrower than this
const BOARD_MIN = 960;            // nor the board

function parseDay(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}
function fmtDay(t: number): string {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
function monthStart(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}
function addMonths(t: number, n: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
}
function todayUTC(): number {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/* A depth is sized from its own value, so reading a stage tells you how deep
   these people go before you have read a single word. */
function depthSize(v: number, nested: boolean): number {
  const base = v >= 130 ? 26 : v >= 100 ? 20 : 16;
  return nested ? (base === 26 ? 20 : base === 20 ? 16 : 14) : base;
}

interface DragPayload {
  kind: 'node' | 'tray';
  id?: string;               // node
  asideId?: string;          // tray
  index?: number;            // tray
  label?: string;            // tray
}

const KIND_ICON: Record<MapLinkKind, typeof MapPin> = {
  shoot: MapPin, part: Film, interview: Notebook, idea: Lightbulb, thread: GitBranch, person: User,
};
const KIND_LABEL: Record<MapLinkKind, string> = {
  shoot: 'shoots', part: 'parts', interview: 'interviews', idea: 'ideas', thread: 'threads', person: 'the four',
};
const KINDS: MapLinkKind[] = ['shoot', 'part', 'interview', 'idea', 'thread', 'person'];

function interviewLabel(state: AppState, iv: Interview): string {
  const shoot = state.shoots.find((s) => s.id === iv.shootId);
  const who = iv.personKey === 'together' ? 'The four' : iv.personKey === 'other'
    ? (state.talents.find((t) => t.id === iv.talentIds?.[0])?.name ?? 'Cast')
    : (state.four.find((f) => f.key === iv.personKey)?.name ?? iv.personKey);
  const where = shoot?.title.split('·')[0].trim();
  return [iv.subjectLabel ?? who, where].filter(Boolean).join(' · ');
}

interface Resolved { label: string; sub?: string; color?: string; ok: boolean }

/* What a connection points at, in words — or the fact that it points at
   nothing any more, so the chip can still be removed. */
function resolve(state: AppState, c: MapLink): Resolved {
  const missing: Resolved = { label: `(${c.kind} no longer exists)`, ok: false };
  switch (c.kind) {
    case 'shoot': {
      const s = state.shoots.find((x) => x.id === c.id);
      if (!s) return missing;
      const a = parseDay(s.startDate), b = parseDay(s.endDate);
      const when = a ? (b && b !== a ? `${fmtDay(a)} – ${fmtDay(b)}` : fmtDay(a)) : 'no dates yet';
      return { label: s.title, sub: `${when} · ${s.status}`, color: s.colorHint, ok: true };
    }
    case 'part': {
      const p = state.scenarioParts.find((x) => x.id === c.id);
      return p ? { label: `${p.order}. ${p.title}`, sub: p.dateLabel, color: p.colorHint, ok: true } : missing;
    }
    case 'interview': {
      const iv = state.interviews.find((x) => x.id === c.id);
      return iv ? { label: interviewLabel(state, iv), sub: iv.date, ok: true } : missing;
    }
    case 'idea': {
      const i = state.hubIdeas.find((x) => x.id === c.id);
      return i ? { label: i.title, sub: i.kind, ok: true } : missing;
    }
    case 'thread': {
      const t = state.threads.find((x) => x.id === c.id);
      return t ? { label: `${t.num} · ${t.title}`, sub: t.subtitle, ok: true } : missing;
    }
    case 'person': {
      const f = state.four.find((x) => x.key === c.id);
      return f ? { label: f.name, sub: f.role, color: f.colorHint, ok: true } : missing;
    }
  }
}

function itemsFor(state: AppState, kind: MapLinkKind): { id: string; label: string; color?: string }[] {
  switch (kind) {
    case 'shoot':     return state.shoots.map((s) => ({ id: s.id, label: s.title, color: s.colorHint }));
    case 'part':      return [...state.scenarioParts].sort((a, b) => a.order - b.order).map((p) => ({ id: p.id, label: `${p.order}. ${p.title}`, color: p.colorHint }));
    case 'interview': return state.interviews.map((iv) => ({ id: iv.id, label: `${interviewLabel(state, iv)} · ${iv.date}` }));
    case 'idea':      return state.hubIdeas.map((i) => ({ id: i.id, label: i.title }));
    case 'thread':    return [...state.threads].sort((a, b) => a.num - b.num).map((t) => ({ id: t.id, label: `${t.num} · ${t.title}` }));
    case 'person':    return state.four.map((f) => ({ id: f.key, label: f.name, color: f.colorHint }));
  }
}

const sameLink = (a: MapLink, b: MapLink) => a.kind === b.kind && a.id === b.id;

/* ---------- the season's axis ------------------------------------------ */

/* Positions along the season are fractions of `span`, which is in
   milliseconds like every timestamp here — so a fraction is always
   (t - t0) / span, never divided by a day count. */
interface Axis {
  t0: number; t1: number; span: number;
  months: { t: number; label: string; first: boolean; x: number; w: number }[];
}

function buildAxis(shoots: Shoot[], milestones: Milestone[], today: number): Axis {
  const ts: number[] = [today];
  for (const s of shoots) { const a = parseDay(s.startDate), b = parseDay(s.endDate); if (a) ts.push(a); if (b) ts.push(b); }
  for (const m of milestones) { const t = parseDay(m.date); if (t) ts.push(t); }
  const t0 = monthStart(Math.min(...ts));
  const t1 = addMonths(monthStart(Math.max(...ts)), 1);
  const span = t1 - t0;
  const months: Axis['months'] = [];
  for (let t = t0; t < t1; t = addMonths(t, 1)) {
    const d = new Date(t);
    months.push({
      t, x: (t - t0) / span, w: (addMonths(t, 1) - t) / span,
      label: MONTHS[d.getUTCMonth()], first: d.getUTCMonth() === 0 || t === t0,
    });
  }
  return { t0, t1, span, months };
}

interface Bar { shoot: Shoot; start: number; end: number; row: number; x: number; w: number }

/* Bars packed into rows, greedily, so overlapping shoots (the September
   cluster) stack instead of hiding each other. The label to the right of a
   bar is counted as part of its footprint, at the board's minimum width, so
   two labels never collide even on the narrowest board. */
function packBars(shoots: Shoot[], axis: Axis, boardPx: number): Bar[] {
  const dated = shoots
    .map((s) => ({ s, a: parseDay(s.startDate), b: parseDay(s.endDate) }))
    .filter((x): x is { s: Shoot; a: number; b: number | null } => x.a !== null)
    .sort((p, q) => p.a - q.a);
  const rowEnds: number[] = [];
  return dated.map(({ s, a, b }) => {
    const end = b && b >= a ? b : a;
    const x = (a - axis.t0) / axis.span;
    const w = Math.max((end - a + DAY) / axis.span, 10 / boardPx);
    const labelW = (10 + s.title.split('·')[0].trim().length * 6.4) / boardPx;
    const foot = x + w + labelW;
    let row = rowEnds.findIndex((e) => e + 4 / boardPx < x);
    if (row < 0) { row = rowEnds.length; rowEnds.push(foot); } else rowEnds[row] = foot;
    return { shoot: s, start: a, end, row, x, w };
  });
}

/* ---------- the view --------------------------------------------------- */

interface Wire { id: string; d: string; color: string; ax: number; ay: number; bx: number; by: number }
interface Arc { id: string; d: string; label: string; lx: number; ly: number; bx: number; by: number }

export function StoryMapView() {
  const { state, dispatch } = useApp();
  const lanes = useMemo(() => [...state.mapLanes].sort((a, b) => a.order - b.order), [state.mapLanes]);
  const trays = useMemo(() => [...state.mapAsides].sort((a, b) => a.order - b.order), [state.mapAsides]);

  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [dropLane, setDropLane] = useState<string | null>(null);
  const [dropTray, setDropTray] = useState<string | null>(null);

  /* The deepest number anywhere on the board gets the brass and the label. */
  const deepest = useMemo(() => {
    let best = 0;
    for (const n of state.mapNodes) { const v = depthValue(n.label); if (v && v > best) best = v; }
    return best;
  }, [state.mapNodes]);

  const today = useMemo(() => todayUTC(), []);
  const axis = useMemo(() => buildAxis(state.shoots, state.milestones, today), [state.shoots, state.milestones, today]);
  const boardMin = Math.max(BOARD_MIN, axis.months.length * PX_PER_MONTH);
  const bars = useMemo(() => packBars(state.shoots, axis, boardMin), [state.shoots, axis, boardMin]);
  const undated = useMemo(() => state.shoots.filter((s) => !parseDay(s.startDate)), [state.shoots]);

  /* ---- measurement, for the wires and the arcs ---- */
  const boardRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef(new Map<string, HTMLElement>());
  const shootRefs = useRef(new Map<string, HTMLElement>());
  const [geom, setGeom] = useState<{ w: number; h: number; wires: Wire[]; arcs: Arc[] }>({ w: 0, h: 0, wires: [], arcs: [] });

  const registerCol = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) colRefs.current.set(id, el); else colRefs.current.delete(id);
  }, []);
  const registerShoot = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) shootRefs.current.set(id, el); else shootRefs.current.delete(id);
  }, []);

  const laneOfNode = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of state.mapNodes) m.set(n.id, n.laneId);
    return m;
  }, [state.mapNodes]);

  /* The curved arrows between stages — a mark that reaches across the sheet. */
  const arcLinks = useMemo(() => (
    state.mapNodes.flatMap((n) => (n.links ?? []).map((target) => {
      const toLane = state.mapLanes.some((l) => l.id === target) ? target : laneOfNode.get(target);
      if (!toLane || toLane === n.laneId) return null;
      return { id: `${n.id}->${target}`, fromLane: n.laneId, toLane, label: n.label };
    })).filter(Boolean) as { id: string; fromLane: string; toLane: string; label: string }[]
  ), [state.mapNodes, state.mapLanes, laneOfNode]);

  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const b = board.getBoundingClientRect();
    const rel = (r: DOMRect) => ({ left: r.left - b.left, top: r.top - b.top, width: r.width, height: r.height });

    const wires: Wire[] = [];
    for (const lane of lanes) {
      const col = colRefs.current.get(lane.id);
      if (!col) continue;
      const c = rel(col.getBoundingClientRect());
      const shoots = (lane.connections ?? []).filter((x) => x.kind === 'shoot');
      shoots.forEach((x, i) => {
        const el = shootRefs.current.get(x.id);
        if (!el) return;
        const r = rel(el.getBoundingClientRect());
        const ax = c.left + (c.width * (i + 1)) / (shoots.length + 1);
        const ay = c.top + c.height;
        const bx = r.left + r.width / 2;
        const by = r.top;
        const mid = ay + Math.max(18, (by - ay) * 0.5);
        wires.push({
          id: `${lane.id}:${x.id}`, color: lane.colorHint ?? 'var(--color-brass)',
          ax, ay, bx, by,
          d: `M ${ax} ${ay} C ${ax} ${mid}, ${bx} ${mid}, ${bx} ${by}`,
        });
      });
    }

    const arcs: Arc[] = [];
    arcLinks.forEach((l, i) => {
      const a = colRefs.current.get(l.fromLane), z = colRefs.current.get(l.toLane);
      if (!a || !z) return;
      const ra = rel(a.getBoundingClientRect()), rz = rel(z.getBoundingClientRect());
      const ax = ra.left + ra.width / 2, ay = ra.top;
      const bx = rz.left + rz.width / 2, by = rz.top;
      const lift = 22 + i * 10;
      arcs.push({
        id: l.id, label: l.label,
        d: `M ${ax} ${ay} C ${ax} ${ay - lift}, ${bx} ${by - lift}, ${bx} ${by}`,
        lx: (ax + bx) / 2, ly: ay - lift * 0.75, bx, by,
      });
    });

    setGeom({ w: board.offsetWidth, h: board.offsetHeight, wires, arcs });
  }, [lanes, arcLinks]);

  useLayoutEffect(() => {
    measure();
    const board = boardRef.current;
    if (!board || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(board);
    colRefs.current.forEach((el) => ro.observe(el));
    window.addEventListener('resize', measure);
    /* A background tab is throttled, and a resize that happened while it was
       hidden can leave the wires drawn for the old layout. Measure again the
       moment it is looked at. */
    document.addEventListener('visibilitychange', measure);
    document.fonts?.ready.then(() => measure()).catch(() => { /* ignore */ });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', measure);
    };
  }, [measure, state.mapLanes, state.mapNodes, state.mapAsides, state.shoots]);

  /* ---- drop handling ---- */
  function onDropInLane(e: DragEvent, laneId: string) {
    e.preventDefault();
    setDropLane(null);
    let p: DragPayload | null = drag;
    try { p = JSON.parse(e.dataTransfer.getData('text/plain')) as DragPayload; } catch { /* keep state copy */ }
    if (!p) return;
    if (p.kind === 'node' && p.id) dispatch({ type: 'MOVE_MAP_NODE', id: p.id, laneId });
    else if (p.kind === 'tray' && p.asideId && p.label !== undefined && p.index !== undefined) {
      dispatch({ type: 'PROMOTE_MAP_ASIDE_LINE', asideId: p.asideId, index: p.index, label: p.label, laneId });
    }
    setDrag(null);
  }
  function onDropInTray(e: DragEvent, asideId: string) {
    e.preventDefault();
    setDropTray(null);
    let p: DragPayload | null = drag;
    try { p = JSON.parse(e.dataTransfer.getData('text/plain')) as DragPayload; } catch { /* keep state copy */ }
    if (p?.kind === 'node' && p.id) dispatch({ type: 'DEMOTE_MAP_NODE', id: p.id, asideId });
    setDrag(null);
  }

  function openShoot(id: string) {
    dispatch({ type: 'SELECT_SHOOT', id });
    dispatch({ type: 'SET_VIEW', view: 'shoots' });
  }

  function addLane() {
    const max = state.mapLanes.reduce((m, l) => Math.max(m, l.order), 0);
    dispatch({ type: 'ADD_MAP_LANE', lane: { id: `ml-${Date.now().toString(36)}`, order: max + 1, title: 'New stage', connections: [] } });
  }

  const markCount = state.mapNodes.length;
  const wiredCount = lanes.reduce((n, l) => n + (l.connections?.length ?? 0), 0);
  const looseCount = trays.reduce((n, t) => n + t.lines.length, 0);
  const done = state.shoots.filter((s) => s.status === 'completed').length;
  const hasArcs = geom.arcs.length > 0 || arcLinks.length > 0;

  return (
    <div className="space-y-5 max-w-[1240px]">
      {/* Landscape, because the board is wide. The element is scoped to this
          view's lifetime, so no other page prints sideways. */}
      <style>{'@media print { @page { size: A4 landscape; margin: 12mm; } }'}</style>

      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h3 className="label-caps text-[color:var(--color-brass)]">the map · over the season</h3>
        <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
          click any word to rewrite it · drag a mark between stages · + connect wires a stage to the film
        </span>
      </div>

      {/* The board scrolls inside itself on a narrow desktop; the page never does. */}
      <div className="lg:overflow-x-auto print:overflow-visible rounded-[4px] border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-light)]">
        <div
          ref={boardRef}
          className="relative lg:min-w-[var(--board-min)] print:min-w-0"
          style={{ ['--board-min' as string]: `${boardMin}px` }}
        >
          {/* ---- wires and arcs, drawn over the whole board ---- */}
          <svg
            className="absolute inset-0 pointer-events-none max-lg:hidden"
            width={geom.w || 0}
            height={geom.h || 0}
            aria-hidden
          >
            {geom.wires.map((w) => (
              <g key={w.id} style={{ color: w.color }}>
                <path d={w.d} fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.75" />
                <circle cx={w.ax} cy={w.ay} r="2.6" fill="currentColor" />
                <circle cx={w.bx} cy={w.by} r="2" fill="currentColor" />
              </g>
            ))}
            {geom.arcs.map((a) => (
              <g key={a.id} opacity="0.85">
                <path d={a.d} fill="none" stroke="var(--color-brass)" strokeWidth="1" strokeLinecap="round" />
                <path d={`M ${a.bx} ${a.by} l -3.5 -4.5 M ${a.bx} ${a.by} l 3.5 -4.5`} stroke="var(--color-brass)" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            ))}
          </svg>
          {geom.arcs.map((a) => (
            <span
              key={`cap-${a.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-full bg-[color:var(--color-paper-light)] label-caps !text-[8px] !tracking-[0.1em] text-[color:var(--color-brass)] whitespace-nowrap pointer-events-none max-lg:hidden"
              style={{ left: a.lx, top: a.ly }}
            >
              {a.label} &rarr;
            </span>
          ))}

          {/* ---- the stages ---- */}
          <div className={`flex max-lg:flex-col items-stretch ${hasArcs ? 'lg:pt-9' : 'lg:pt-2'}`}>
            {lanes.map((lane, i) => (
              <Stage
                key={lane.id}
                lane={lane}
                n={i + 1}
                isFirst={i === 0}
                isLast={i === lanes.length - 1}
                alignRight={i >= lanes.length / 2}
                deepest={deepest}
                dropping={dropLane === lane.id}
                registerCol={registerCol}
                onDragStartNode={(node, e) => {
                  const p: DragPayload = { kind: 'node', id: node.id };
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', JSON.stringify(p));
                  setDrag(p);
                }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropLane(lane.id); }}
                onDragLeave={() => setDropLane((cur) => (cur === lane.id ? null : cur))}
                onDrop={(e) => onDropInLane(e, lane.id)}
              />
            ))}

            {/* the tray — the right edge of the strip, under the stages on a phone */}
            <aside className="no-print shrink-0 lg:w-[172px] max-lg:border-t-[0.5px] lg:border-l-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-card)]/70 px-3 py-3">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h4 className="label-caps !text-[9px] text-[color:var(--color-brass)]">
                  not sorted yet <span className="mono-num opacity-60">{looseCount}</span>
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {trays.map((tray) => (
                  <Tray
                    key={tray.id}
                    tray={tray}
                    dropping={dropTray === tray.id}
                    onDragStartLine={(index, label, e) => {
                      const p: DragPayload = { kind: 'tray', asideId: tray.id, index, label };
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', JSON.stringify(p));
                      setDrag(p);
                    }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTray(tray.id); }}
                    onDragLeave={() => setDropTray((cur) => (cur === tray.id ? null : cur))}
                    onDrop={(e) => onDropInTray(e, tray.id)}
                  />
                ))}
              </div>
              <p className="prose-body italic text-[10.5px] leading-snug text-[color:var(--color-on-paper-faint)] mt-3">
                drag onto a stage to file it · drag a mark back here to unfile it
              </p>
            </aside>
          </div>

          {/* ---- the season ---- */}
          <Season
            axis={axis}
            bars={bars}
            undated={undated}
            milestones={state.milestones}
            today={today}
            registerShoot={registerShoot}
            onOpenShoot={openShoot}
          />
        </div>
      </div>

      <figcaption className="flex items-baseline justify-between gap-4 flex-wrap prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
        <span>
          After the paper map drawn by Tomo and Vito &middot; {word(lanes.length)} stages &middot;{' '}
          <span className="mono-num">{markCount}</span> marks &middot;{' '}
          <span className="mono-num">{wiredCount}</span> wired &middot;{' '}
          <span className="mono-num">{looseCount}</span> still loose &middot;{' '}
          <span className="mono-num">{done}</span> of <span className="mono-num">{state.shoots.length}</span> shoots done
        </span>
        <button
          type="button"
          onClick={addLane}
          className="no-print not-italic label-caps !text-[9px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] inline-flex items-center gap-1 transition-colors"
        >
          <Plus size={10} /> add a stage
        </button>
      </figcaption>
    </div>
  );
}

/* ---------- one stage ---------------------------------------------------- */

function Stage({
  lane, n, isFirst, isLast, alignRight, deepest, dropping,
  registerCol, onDragStartNode, onDragOver, onDragLeave, onDrop,
}: {
  lane: MapLane; n: number; isFirst: boolean; isLast: boolean; alignRight: boolean;
  deepest: number; dropping: boolean;
  registerCol: (id: string) => (el: HTMLElement | null) => void;
  onDragStartNode: (node: MapNode, e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
}) {
  const { state, dispatch } = useApp();
  const nodes = useMemo(
    () => state.mapNodes.filter((x) => x.laneId === lane.id).sort((a, b) => a.order - b.order),
    [state.mapNodes, lane.id],
  );
  const roots = nodes.filter((x) => !x.parentId);
  const connections = lane.connections ?? [];
  const hue = lane.colorHint ?? 'var(--color-on-paper)';

  /* The short code only earns its place when it isn't just the title again. */
  const code = lane.short && norm(lane.short) !== norm(lane.title) ? lane.short.toUpperCase() : null;

  /* One line that says what is on this stage. Counted, never typed. */
  const gloss = useMemo(() => {
    const c: Record<string, number> = {};
    nodes.forEach((x) => { const f = markForm(x); c[f] = (c[f] ?? 0) + 1; });
    const bits = [
      c.person && `${word(c.person)} ${c.person === 1 ? 'diver' : 'divers'}`,
      c.depth && `${word(c.depth)} ${c.depth === 1 ? 'record' : 'records'}`,
      c.place && `${word(c.place)} ${c.place === 1 ? 'place' : 'places'}`,
      c.org && `${word(c.org)} ${c.org === 1 ? 'body' : 'bodies'}`,
      c.topic && `${word(c.topic)} ${c.topic === 1 ? 'thread' : 'threads'}`,
      c.count && 'a count',
      c.note && 'a note',
      c.unknown && `${word(c.unknown)} unread`,
    ].filter(Boolean);
    return bits.length ? bits.join(' · ') : 'nothing on this stage yet';
  }, [nodes]);

  function open(c: MapLink) {
    switch (c.kind) {
      case 'shoot':     dispatch({ type: 'SELECT_SHOOT', id: c.id }); dispatch({ type: 'SET_VIEW', view: 'shoots' }); break;
      case 'part':      dispatch({ type: 'SET_VIEW', view: 'screenplay' }); break;
      case 'interview': dispatch({ type: 'SET_VIEW', view: 'interviews' }); break;
      case 'idea':      dispatch({ type: 'SET_VIEW', view: 'idea-hub' }); break;
      case 'thread':    dispatch({ type: 'SELECT_THREAD', id: c.id }); dispatch({ type: 'SET_VIEW', view: 'threads' }); break;
      case 'person':    dispatch({ type: 'SELECT_PERSON', key: c.id as FourKey }); dispatch({ type: 'SET_VIEW', view: 'four' }); break;
    }
  }

  return (
    <section
      ref={registerCol(lane.id)}
      className={`group/stage relative flex flex-col min-w-0 flex-1 lg:basis-0 lg:border-r-[0.5px] max-lg:border-b-[0.5px] border-[color:var(--color-border-paper)] transition-colors ${
        dropping ? 'bg-[color:var(--color-brass)]/[0.07]' : 'hover:bg-[color:var(--color-paper-card)]/50'
      }`}
      style={{ boxShadow: `inset 0 3px 0 ${hue}` }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* head */}
      <header className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className="display-italic text-[26px] mono-num leading-none text-[color:var(--color-on-paper-faint)] group-hover/stage:text-[color:var(--color-brass)] transition-colors select-none">
            {n}
          </span>
          <div className="flex items-center gap-1">
            {code && (
              <EditableText
                value={code}
                onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { short: v } })}
                className="label-caps !text-[9px] text-[color:var(--color-brass-deep)]"
              />
            )}
            <span className="no-print flex items-center opacity-0 group-hover/stage:opacity-100 focus-within:opacity-100 transition-opacity">
              <Tool title="move left" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: -1 })}><ChevronLeft size={12} /></Tool>
              <Tool title="move right" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: 1 })}><ChevronRight size={12} /></Tool>
              <Tool title="remove this stage and everything on it" onClick={() => dispatch({ type: 'DELETE_MAP_LANE', id: lane.id })}><Trash2 size={11} /></Tool>
            </span>
          </div>
        </div>
        <EditableText
          value={lane.title}
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { title: v } })}
          className="display-italic text-[18px] leading-tight text-[color:var(--color-on-paper)] mt-1"
        />
        <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-0.5">{gloss}</p>
      </header>

      {/* the field */}
      <div className="px-3 pb-3 flex flex-wrap items-start content-start gap-x-2.5 gap-y-2">
        {roots.map((node) => (
          <Mark key={node.id} node={node} nodes={nodes} deepest={deepest} onDragStart={onDragStartNode} />
        ))}
        {lane.note && (
          <blockquote className="basis-full m-0 mt-0.5 pl-2.5 border-l-2 border-[color:var(--color-border-brass)]">
            <EditableText
              value={lane.note}
              multiline
              onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { note: v } })}
              className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug"
            />
          </blockquote>
        )}
        <AddMark laneId={lane.id} laneTitle={lane.title} hasMarks={roots.length > 0} />
      </div>

      {/* what feeds it — pinned to the foot, where the wires leave */}
      <div className="mt-auto border-t-[0.5px] border-dashed border-[color:var(--color-border-paper)] px-3 pt-2 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="label-caps !text-[8px] !tracking-[0.14em] text-[color:var(--color-on-paper-faint)]">wired to</span>
          <Connect lane={lane} alignRight={alignRight} />
        </div>
        {connections.length === 0 ? (
          <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">nothing yet</p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-1">
            {connections.map((c) => {
              const r = resolve(state, c);
              const Icon = KIND_ICON[c.kind];
              return (
                <li key={`${c.kind}:${c.id}`} className="group/chip flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    title={r.ok ? `${r.label}${r.sub ? ` · ${r.sub}` : ''} — open` : 'this no longer exists — remove it'}
                    onClick={() => r.ok && open(c)}
                    className={`flex items-center gap-1.5 min-w-0 text-left text-[12px] leading-tight transition-colors ${
                      r.ok ? 'text-[color:var(--color-on-paper)] hover:text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper-faint)] italic'
                    }`}
                  >
                    {c.kind === 'shoot' && r.ok
                      ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hue }} title="wired to the season below" />
                      : <Icon size={11} className="shrink-0 text-[color:var(--color-on-paper-faint)]" />}
                    {r.color && c.kind !== 'shoot' && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />}
                    <span className="truncate">{r.label}</span>
                  </button>
                  <button
                    type="button"
                    title="detach"
                    onClick={() => dispatch({ type: 'DISCONNECT_MAP_LANE', laneId: lane.id, link: c })}
                    className="no-print ml-auto w-3.5 h-3.5 inline-flex items-center justify-center rounded-full opacity-0 group-hover/chip:opacity-100 [@media(hover:none)]:opacity-60 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-opacity shrink-0"
                  >
                    <X size={9} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- + connect ---------------------------------------------------- */

function Connect({ lane, alignRight }: { lane: MapLane; alignRight: boolean }) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MapLinkKind>('shoot');
  const [q, setQ] = useState('');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left?: number; right?: number; top?: number; bottom?: number }>({});

  /* Fixed to the viewport, not absolute in the column: the board scrolls
     inside itself, and an absolute popover near the foot of a stage would be
     clipped by that scroller. Flips upward when the window ends too soon. */
  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const W = 288, H = 300;
    const below = window.innerHeight - r.bottom > H + 8;
    const p: typeof pos = below ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 };
    if (alignRight) p.right = Math.max(8, window.innerWidth - r.right);
    else p.left = Math.min(r.left, window.innerWidth - W - 8);
    setPos(p);
  }, [alignRight]);

  useEffect(() => {
    if (!open) return;
    place();
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current && !popRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    function onScroll(e: Event) { if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return; setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  const items = useMemo(() => itemsFor(state, kind), [state, kind]);
  const shown = q.trim() ? items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())) : items;
  const has = (id: string) => (lane.connections ?? []).some((c) => sameLink(c, { kind, id }));
  const counts = useMemo(() => {
    const c: Partial<Record<MapLinkKind, number>> = {};
    (lane.connections ?? []).forEach((x) => { c[x.kind] = (c[x.kind] ?? 0) + 1; });
    return c;
  }, [lane.connections]);

  function toggle(id: string) {
    const link: MapLink = { kind, id };
    dispatch({ type: has(id) ? 'DISCONNECT_MAP_LANE' : 'CONNECT_MAP_LANE', laneId: lane.id, link });
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="connect this stage to a shoot, a part, an interview, an idea, a thread or one of the four"
        onClick={() => setOpen((o) => !o)}
        className={`no-print inline-flex items-center gap-1 label-caps !text-[8px] !tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border border-dashed transition-colors ${
          open ? 'border-[color:var(--color-brass)] text-[color:var(--color-brass)]' : 'border-[color:var(--color-border-paper-strong)] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)]'
        }`}
      >
        <Plus size={9} /> connect
      </button>
      {open && (
        <div
          ref={popRef}
          className="fixed z-[120] w-[288px] rounded-[4px] border-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-light)] shadow-xl overflow-hidden"
          style={pos}
        >
          <div className="flex items-stretch border-b-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-card)]">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setKind(k); setQ(''); }}
                className={`flex-1 px-1 py-1.5 label-caps !text-[7.5px] !tracking-[0.1em] whitespace-nowrap border-b-2 transition-colors ${
                  k === kind ? 'border-[color:var(--color-brass)] text-[color:var(--color-brass)]' : 'border-transparent text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper)]'
                }`}
              >
                {KIND_LABEL[k]}{counts[k] ? <span className="mono-num ml-0.5 opacity-70">{counts[k]}</span> : null}
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`find a ${kind === 'person' ? 'diver' : kind}…`}
            className="w-full bg-[color:var(--color-paper-light)] border-b-[0.5px] border-[color:var(--color-border-paper)] px-2.5 py-1.5 text-[12px] outline-none placeholder:italic"
          />
          <div className="max-h-[224px] overflow-y-auto py-1">
            {shown.map((i) => {
              const on = has(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => toggle(i.id)}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1 text-[12px] hover:bg-[color:var(--color-paper-deep)]/50 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-[2px] border-[0.5px] shrink-0 flex items-center justify-center"
                    style={{ borderColor: on ? 'var(--color-brass)' : 'var(--color-border-paper-strong)', background: on ? 'var(--color-brass)' : 'transparent' }}
                  >
                    {on && <span className="w-1 h-1 rounded-[1px] bg-[color:var(--color-paper-light)]" />}
                  </span>
                  {i.color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i.color }} />}
                  <span className="truncate text-[color:var(--color-on-paper)]">{i.label}</span>
                </button>
              );
            })}
            {shown.length === 0 && (
              <p className="px-2.5 py-2 prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">nothing matches</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- the season --------------------------------------------------- */

function Season({
  axis, bars, undated, milestones, today, registerShoot, onOpenShoot,
}: {
  axis: Axis; bars: Bar[]; undated: Shoot[]; milestones: Milestone[]; today: number;
  registerShoot: (id: string) => (el: HTMLElement | null) => void;
  onOpenShoot: (id: string) => void;
}) {
  const rows = bars.reduce((m, b) => Math.max(m, b.row + 1), 0);
  const ROW = 24;
  const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
  const inRange = (t: number) => t >= axis.t0 && t < axis.t1;
  const ticks = milestones
    .map((m) => ({ m, t: parseDay(m.date) }))
    .filter((x): x is { m: Milestone; t: number } => x.t !== null && inRange(x.t));
  const todayX = inRange(today) ? (today - axis.t0) / axis.span : null;
  const yearOf = (t: number) => String(new Date(t).getUTCFullYear()).slice(2);

  return (
    <section className="border-t-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-card)]/40 pt-10 pb-3">
      <div className="flex items-baseline justify-between gap-3 px-4 mb-2">
        <h4 className="label-caps !text-[9px] text-[color:var(--color-brass)]">the season</h4>
        <span className="prose-body italic text-[10.5px] text-[color:var(--color-on-paper-faint)]">
          solid = shot &middot; outlined = still to shoot &middot; click a bar to open the shoot
        </span>
      </div>

      {/* scrolls on its own on a phone; on a desktop the board already made room */}
      <div className="max-lg:overflow-x-auto print:overflow-visible">
        <div className="relative mx-4 max-lg:min-w-[880px]">
          {/* ruler */}
          <div className="relative h-5 border-b-[0.5px] border-[color:var(--color-border-paper-strong)]">
            {axis.months.map((m) => (
              <div
                key={m.t}
                className="absolute top-0 bottom-0 border-l-[0.5px] border-[color:var(--color-border-paper)] pl-1 label-caps !text-[8px] !tracking-[0.1em] text-[color:var(--color-on-paper-faint)] whitespace-nowrap overflow-hidden"
                style={{ left: pct(m.x), width: pct(m.w) }}
              >
                {m.label}{m.first && <span className="opacity-60"> ’{yearOf(m.t)}</span>}
              </div>
            ))}
          </div>

          {/* bars */}
          <div className="relative" style={{ height: Math.max(1, rows) * ROW + 10 }}>
            {axis.months.map((m) => (
              <div key={m.t} className="absolute top-0 bottom-0 border-l-[0.5px] border-[color:var(--color-border-paper)]/60" style={{ left: pct(m.x) }} />
            ))}
            {bars.map((b) => {
              const doneBar = b.shoot.status === 'completed';
              const live = b.shoot.status === 'in-progress';
              const colour = b.shoot.colorHint ?? 'var(--color-on-paper)';
              const short = b.shoot.title.split('·')[0].trim();
              const when = b.end !== b.start ? `${fmtDay(b.start)} – ${fmtDay(b.end)}` : fmtDay(b.start);
              return (
                <div key={b.shoot.id} className="absolute" style={{ left: pct(b.x), top: b.row * ROW + 6, width: pct(b.w), minWidth: 10 }}>
                  <button
                    ref={registerShoot(b.shoot.id)}
                    type="button"
                    title={`${b.shoot.title} · ${when} · ${b.shoot.status}`}
                    onClick={() => onOpenShoot(b.shoot.id)}
                    className="group/bar block w-full h-[14px] rounded-[2px] transition-transform hover:scale-y-110 origin-center"
                    style={{
                      background: doneBar ? colour : live ? `color-mix(in srgb, ${colour} 35%, transparent)` : 'transparent',
                      border: `1px ${b.shoot.status === 'planned' ? 'dashed' : 'solid'} ${colour}`,
                    }}
                  />
                  <span
                    className="absolute top-0 left-full ml-1.5 leading-[14px] text-[11px] whitespace-nowrap pointer-events-none"
                    style={{ color: doneBar ? 'var(--color-on-paper)' : 'var(--color-on-paper-muted)' }}
                  >
                    {short}
                  </span>
                </div>
              );
            })}

            {/* milestones — hover for the name */}
            {ticks.map(({ m, t }) => (
              <span
                key={m.id}
                title={`${m.label} · ${fmtDay(t)}`}
                className="absolute -top-[5px] -translate-x-1/2 w-[7px] h-[7px] rotate-45 bg-[color:var(--color-brass)] border-[0.5px] border-[color:var(--color-paper-light)]"
                style={{ left: pct((t - axis.t0) / axis.span) }}
              />
            ))}

            {/* today */}
            {todayX !== null && (
              <div className="absolute -top-5 bottom-0 w-px bg-[color:var(--color-coral)] pointer-events-none" style={{ left: pct(todayX) }}>
                <span className="absolute -top-[14px] left-1 label-caps !text-[8px] !tracking-[0.12em] text-[color:var(--color-coral)] whitespace-nowrap">today</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {undated.length > 0 && (
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 px-4 mt-2 pt-2 border-t-[0.5px] border-dashed border-[color:var(--color-border-paper)]">
          <span className="label-caps !text-[8px] !tracking-[0.14em] text-[color:var(--color-on-paper-faint)] mr-1">no dates yet</span>
          {undated.map((s) => (
            <button
              key={s.id}
              ref={registerShoot(s.id)}
              type="button"
              title={`${s.title} · no dates yet · open the shoot to set them`}
              onClick={() => onOpenShoot(s.id)}
              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-[3px] border border-dashed text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] transition-colors"
              style={{ borderColor: s.colorHint ?? 'var(--color-border-paper-strong)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.colorHint ?? 'var(--color-on-paper-faint)' }} />
              {s.title.split('·')[0].trim()}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- a mark ------------------------------------------------------- */

function Mark({
  node, nodes, deepest, nested = false, onDragStart,
}: {
  node: MapNode; nodes: MapNode[]; deepest: number; nested?: boolean;
  onDragStart: (node: MapNode, e: DragEvent) => void;
}) {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const form = markForm(node);
  const kids = nodes.filter((x) => x.parentId === node.id).sort((a, b) => a.order - b.order);

  function patch(p: Partial<MapNode>) { dispatch({ type: 'UPDATE_MAP_NODE', id: node.id, patch: p }); }

  /* One click walks the mark to the next kind. */
  const KINDS_CYCLE: MapNodeKind[] = ['note', 'depth', 'person', 'place', 'org', 'unknown'];
  function cycleKind() {
    const i = KINDS_CYCLE.indexOf(node.kind);
    patch({ kind: KINDS_CYCLE[(i + 1) % KINDS_CYCLE.length] });
  }

  const tools = (
    <span className="no-print absolute -top-3 right-0 z-20 hidden group-hover/mark:flex focus-within:flex items-center rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-light)]">
      <Tool title={`this is a ${form} — click to change`} onClick={cycleKind}>
        <span className="label-caps !text-[8px] !tracking-[0.1em]">{form}</span>
      </Tool>
      <Tool title="remove" onClick={() => dispatch({ type: 'DELETE_MAP_NODE', id: node.id })}>
        <Trash2 size={11} />
      </Tool>
    </span>
  );

  const body = (() => {
    switch (form) {
      case 'person': {
        const hue = state.four.find((f) => f.key === (node.personKey as FourKey))?.colorHint;
        return (
          <div
            className="inline-flex flex-col max-w-full rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-card)] px-2 py-1.5 hover:border-[color:var(--color-brass)] transition-colors"
            style={{ borderTopWidth: 3, borderTopColor: hue ?? 'var(--color-on-paper)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hue ?? 'var(--color-on-paper)' }} />
              <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} className="display-italic text-[14px] text-[color:var(--color-on-paper)]" />
            </div>
            {kids.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mt-1.5 pt-1.5 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                {kids.map((k) => <Mark key={k.id} node={k} nodes={nodes} deepest={deepest} nested onDragStart={onDragStart} />)}
              </div>
            )}
          </div>
        );
      }
      case 'depth': {
        const v = depthValue(node.label) ?? 0;
        const isMax = v > 0 && v === deepest;
        return (
          <span className="inline-flex flex-col">
            {isMax && !nested && <span className="label-caps !text-[8px] !tracking-[0.14em] text-[color:var(--color-brass-deep)] mb-0.5">deepest</span>}
            <span className="inline-flex items-baseline">
              <EditableText
                value={node.label} onSave={(v2) => patch({ label: v2 })} onOpenChange={setEditing}
                className="display-italic mono-num leading-none border-b-[0.5px] border-[color:var(--color-border-brass)] pb-[2px]"
                style={{ fontSize: depthSize(v, nested), color: isMax ? 'var(--color-brass)' : 'var(--color-on-paper)' }}
              />
              <span className="font-sans text-[10px] tracking-[0.16em] text-[color:var(--color-brass-deep)] ml-0.5 relative -top-[2px]">m</span>
            </span>
          </span>
        );
      }
      case 'count':
        return (
          <span className="inline-flex items-baseline">
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} className="display-italic mono-num leading-none text-[color:var(--color-on-paper-muted)]" style={{ fontSize: nested ? 14 : 16 }} />
          </span>
        );
      case 'place':
        return (
          <span className="inline-flex items-baseline gap-1 border-b-[0.5px] border-[color:var(--color-border-paper-strong)] hover:border-[color:var(--color-brass)] transition-colors">
            <MapPin size={9} className="text-[color:var(--color-on-paper-faint)] self-center shrink-0" />
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} className="prose-body italic text-[13px] text-[color:var(--color-on-paper)]" />
          </span>
        );
      case 'org':
        return (
          <span className="inline-flex items-center gap-1 font-sans text-[11px] tracking-[0.05em] px-1.5 py-0.5 rounded-[2px]" style={{ background: 'color-mix(in srgb, var(--color-dock) 13%, transparent)', color: 'var(--color-dock-deep)' }}>
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} />
          </span>
        );
      case 'unknown':
        return (
          <span title="unreadable on the original — click to name it" className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper-strong)] hover:border-[color:var(--color-brass)] transition-colors">
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} className="display-italic text-[14px] text-[color:var(--color-on-paper-faint)]" />
          </span>
        );
      case 'note':
        return (
          <span className="inline-flex items-baseline max-w-full">
            <EditableText value={node.label} multiline onSave={(v) => patch({ label: v })} onOpenChange={setEditing} className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug" />
          </span>
        );
      default: // topic
        return (
          <span className="inline-flex items-center gap-1.5 text-[12px] px-1.5 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-all">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[color:var(--color-on-paper-muted)] shrink-0" />
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} />
          </span>
        );
    }
  })();

  return (
    <span
      className={`group/mark relative inline-flex max-w-full ${form === 'note' ? 'basis-full' : ''}`}
      draggable={!editing}
      onDragStart={(e) => { e.stopPropagation(); onDragStart(node, e); }}
      title={node.note || undefined}
    >
      {body}
      {tools}
    </span>
  );
}

/* ---------- type-to-add -------------------------------------------------- */

function AddMark({ laneId, laneTitle, hasMarks }: { laneId: string; laneTitle: string; hasMarks: boolean }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState('');

  function commit() {
    const v = draft.trim();
    if (!v) return;
    const max = state.mapNodes.filter((n) => n.laneId === laneId).reduce((m, n) => Math.max(m, n.order), 0);
    dispatch({ type: 'ADD_MAP_NODE', node: { id: `mn-${Date.now().toString(36)}`, laneId, order: max + 1, label: v, kind: classifyLabel(v) } });
    setDraft('');
  }

  return (
    <span className={`no-print inline-flex items-baseline w-full ${hasMarks ? 'mt-0.5' : ''}`}>
      <input
        value={draft}
        placeholder={hasMarks ? `add to ${laneTitle.toLowerCase()}…` : `nothing here yet — add to ${laneTitle.toLowerCase()}…`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') setDraft('');
        }}
        className={`w-full bg-transparent border-b-[0.5px] border-transparent px-0.5 py-0.5 text-[12px] text-[color:var(--color-on-paper)] placeholder:text-[color:var(--color-on-paper-faint)] placeholder:italic outline-none transition-colors focus:border-[color:var(--color-brass)] ${
          hasMarks ? 'opacity-0 group-hover/stage:opacity-100 focus:opacity-100' : ''
        }`}
      />
    </span>
  );
}

/* ---------- the tray ----------------------------------------------------- */

function Tray({
  tray, dropping, onDragStartLine, onDragOver, onDragLeave, onDrop,
}: {
  tray: MapAside; dropping: boolean;
  onDragStartLine: (index: number, label: string, e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
}) {
  const { dispatch } = useApp();
  const [draft, setDraft] = useState('');
  function patch(p: Partial<MapAside>) { dispatch({ type: 'UPDATE_MAP_ASIDE', id: tray.id, patch: p }); }

  return (
    <div
      className={`group/tray rounded-[3px] px-2 py-1.5 -mx-2 transition-colors ${dropping ? 'bg-[color:var(--color-brass)]/[0.09]' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <EditableText value={tray.title} onSave={(v) => patch({ title: v })} className="label-caps !text-[9px] text-[color:var(--color-on-paper-faint)]" />
        <span className="opacity-0 group-hover/tray:opacity-100 transition-opacity">
          <Tool title="remove this bracket" onClick={() => dispatch({ type: 'DELETE_MAP_ASIDE', id: tray.id })}><Trash2 size={10} /></Tool>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tray.lines.map((line, i) => (
          <span
            key={`${line}-${i}`}
            draggable
            onDragStart={(e) => onDragStartLine(i, line, e)}
            className="group/chip inline-flex items-center gap-1 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper-strong)] bg-[color:var(--color-paper-light)] px-2 py-0.5 cursor-grab active:cursor-grabbing hover:border-[color:var(--color-brass)] transition-colors"
          >
            <EditableText value={line} onSave={(v) => patch({ lines: tray.lines.map((l, j) => (j === i ? v : l)) })} className="text-[12px] text-[color:var(--color-on-paper-muted)]" />
            <button
              type="button" title="remove"
              onClick={() => patch({ lines: tray.lines.filter((_, j) => j !== i) })}
              className="opacity-0 group-hover/chip:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-all leading-none text-[13px]"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder="add…"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { if (draft.trim()) { patch({ lines: [...tray.lines, draft.trim()] }); setDraft(''); } }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (draft.trim()) { patch({ lines: [...tray.lines, draft.trim()] }); setDraft(''); } }
            if (e.key === 'Escape') setDraft('');
          }}
          className="w-[70px] bg-transparent border-b-[0.5px] border-transparent px-0.5 text-[12px] text-[color:var(--color-on-paper)] placeholder:text-[color:var(--color-on-paper-faint)] placeholder:italic outline-none focus:border-[color:var(--color-brass)] transition-colors"
        />
      </div>
    </div>
  );
}

/* ---------- shared ------------------------------------------------------- */

function Tool({ children, title, onClick, disabled }: { children: ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button" title={title} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-1 rounded-[3px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-deep)] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[color:var(--color-on-paper-faint)] transition-colors leading-none"
    >
      {children}
    </button>
  );
}
