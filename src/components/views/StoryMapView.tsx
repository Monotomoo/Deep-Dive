import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type DragEvent, type ReactNode,
} from 'react';
import { ChevronDown, ChevronUp, MapPin, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { FourKey, MapAside, MapLane, MapNode, MapNodeKind } from '../../types';
import { classifyLabel, depthValue, markForm } from '../../lib/mapKinds';

/* The Plan — the map Tomo and Vito drew, as a printed plate.

   It reads as one sheet: a head strip, six numbered bands, and the tray of
   things with no stage yet, all on the same four-column grid so every rule
   lines up from the top of the plate to the bottom.

   Two decisions carry the whole design.

   ONE INK. The stages are told apart by a 30px numeral and their name, not by
   six pastel fills. Colour is spent only where it means something: a diver's
   signature hue, the one line that crosses the sheet, and the deepest number
   on the board. Everything else is navy on cream.

   NO EDIT MODE. There is no toggle. Click any word to rewrite it, type in the
   line under a band to add a mark, drag a mark to move it. A board you have to
   unlock before you can think on it is a board you stop using. */

const GRID = 'grid grid-cols-[52px_196px_1fr_92px]';
const GRID_SM = 'max-lg:grid-cols-[40px_1fr]';

/* ---------- helpers ------------------------------------------------------ */

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
const norm = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

/* A depth is sized from its own value, so reading down a band tells you how
   deep these people go before you have read a single word. */
function depthSize(v: number, nested: boolean): number {
  const base = v >= 130 ? 30 : v >= 100 ? 22 : 17;
  return nested ? (base === 30 ? 22 : base === 22 ? 17 : 15) : base;
}

interface DragPayload {
  kind: 'node' | 'tray';
  id?: string;               // node
  asideId?: string;          // tray
  index?: number;            // tray
  label?: string;            // tray
}

/* ---------- the view ----------------------------------------------------- */

export function StoryMapView() {
  const { state, dispatch } = useApp();
  const lanes = useMemo(() => [...state.mapLanes].sort((a, b) => a.order - b.order), [state.mapLanes]);
  const trays = useMemo(() => [...state.mapAsides].sort((a, b) => a.order - b.order), [state.mapAsides]);

  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [dropLane, setDropLane] = useState<string | null>(null);
  const [dropTray, setDropTray] = useState<string | null>(null);

  /* The deepest number anywhere on the board gets the coral and the label. */
  const deepest = useMemo(() => {
    let best = 0;
    for (const n of state.mapNodes) {
      const v = depthValue(n.label);
      if (v && v > best) best = v;
    }
    return best;
  }, [state.mapNodes]);

  /* ---- measurement, for the one line that crosses the sheet ---- */
  const plateRef = useRef<HTMLElement | null>(null);
  const bandRefs = useRef(new Map<string, HTMLElement>());
  const [geom, setGeom] = useState<{ h: number; y: Record<string, number> }>({ h: 0, y: {} });

  const registerBand = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) bandRefs.current.set(id, el); else bandRefs.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const plate = plateRef.current;
    if (!plate) return;
    const p = plate.getBoundingClientRect();
    const y: Record<string, number> = {};
    bandRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      y[id] = r.top - p.top + r.height / 2;
    });
    setGeom({ h: plate.offsetHeight, y });
  }, []);

  useLayoutEffect(() => {
    measure();
    const plate = plateRef.current;
    if (!plate || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(plate);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure, state.mapLanes, state.mapNodes, state.mapAsides]);

  /* Which band does a mark live in — so a link between two marks can be drawn
     between the bands that hold them. */
  const laneOfNode = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of state.mapNodes) m.set(n.id, n.laneId);
    return m;
  }, [state.mapNodes]);

  const links = useMemo(() => (
    state.mapNodes.flatMap((n) => (n.links ?? []).map((target) => {
      const fromLane = n.laneId;
      const toLane = state.mapLanes.some((l) => l.id === target) ? target : laneOfNode.get(target);
      if (!toLane || toLane === fromLane) return null;
      return { id: `${n.id}->${target}`, fromLane, toLane, label: n.label };
    })).filter(Boolean) as { id: string; fromLane: string; toLane: string; label: string }[]
  ), [state.mapNodes, state.mapLanes, laneOfNode]);

  const linkedLanes = useMemo(() => {
    const s = new Set<string>();
    links.forEach((l) => { s.add(l.fromLane); s.add(l.toLane); });
    return s;
  }, [links]);

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

  const markCount = state.mapNodes.length;
  const looseCount = trays.reduce((n, t) => n + t.lines.length, 0);

  function addLane() {
    const max = state.mapLanes.reduce((m, l) => Math.max(m, l.order), 0);
    dispatch({ type: 'ADD_MAP_LANE', lane: { id: `ml-${Date.now().toString(36)}`, order: max + 1, title: 'New stage' } });
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* No title here — the shell's PageHeader already sets it, in 52px. */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h3 className="label-caps text-[color:var(--color-brass)]">the map</h3>
        <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
          click any word to rewrite it · drag a mark between stages
        </span>
      </div>

      {/* ---------------- the plate ---------------- */}
      <figure
        ref={plateRef}
        className="relative m-0 bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] overflow-hidden"
      >
        {/* the one line that crosses the sheet, in its own reserved margin */}
        <svg
          className="absolute top-0 right-0 w-[92px] pointer-events-none max-lg:hidden"
          height={geom.h || 0}
          width={92}
          aria-hidden
        >
          {links.map((l, i) => {
            const y1 = geom.y[l.fromLane], y2 = geom.y[l.toLane];
            if (y1 === undefined || y2 === undefined) return null;
            const x = 20 + i * 14;              // stacked, so a second link never tangles
            const up = y2 < y1;
            const r = 6;
            return (
              <g key={l.id} opacity="0.85">
                <path
                  d={`M 2 ${y1} H ${x - r} Q ${x} ${y1} ${x} ${up ? y1 - r : y1 + r} V ${up ? y2 + r : y2 - r} Q ${x} ${y2} ${x - r} ${y2} H 6`}
                  fill="none" stroke="var(--color-brass)" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <circle cx="2" cy={y1} r="2.5" fill="var(--color-brass)" />
                <path d={`M 6 ${y2} l 4 -3 M 6 ${y2} l 4 3`} stroke="var(--color-brass)" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </svg>
        {links.map((l, i) => {
          const y1 = geom.y[l.fromLane], y2 = geom.y[l.toLane];
          if (y1 === undefined || y2 === undefined) return null;
          return (
            <span
              key={`cap-${l.id}`}
              className="absolute -translate-y-1/2 px-1.5 py-0.5 rounded-full bg-[color:var(--color-paper-light)] label-caps !text-[8px] !tracking-[0.1em] text-[color:var(--color-brass)] whitespace-nowrap pointer-events-none max-lg:hidden"
              style={{ right: 92 - (20 + i * 14) - 26, top: (y1 + y2) / 2 }}
            >
              {l.label} &rarr;
            </span>
          );
        })}

        {/* head strip — what turns a diagram into a printed table */}
        <div className={`${GRID} ${GRID_SM} bg-[color:var(--color-paper-card)] border-b-[0.5px] border-[color:var(--color-border-paper-strong)] py-2`}>
          <div className="pr-3 text-right label-caps !text-[9px] text-[color:var(--color-brass-deep)]">&#8470;</div>
          <div className="px-5 label-caps !text-[9px] text-[color:var(--color-brass-deep)] border-r-[0.5px] border-[color:var(--color-border-paper)] max-lg:border-r-0">stage</div>
          <div className="px-5 label-caps !text-[9px] text-[color:var(--color-brass-deep)] max-lg:hidden">what sits on it</div>
          <div className="px-2 label-caps !text-[9px] text-[color:var(--color-brass-deep)] max-lg:hidden">links</div>
        </div>

        {lanes.map((lane, i) => (
          <Band
            key={lane.id}
            lane={lane}
            n={i + 1}
            isFirst={i === 0}
            isLast={i === lanes.length - 1}
            deepest={deepest}
            linked={linkedLanes.has(lane.id)}
            dropping={dropLane === lane.id}
            registerBand={registerBand}
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

        {/* the tray closes the plate */}
        <section className="border-t-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-card)] px-5 py-3.5">
          <div className="flex items-baseline justify-between gap-3 mb-2.5">
            <h3 className="label-caps text-[color:var(--color-brass)]">
              not sorted yet{' '}
              <span className="mono-num !text-[10px] opacity-60">{looseCount}</span>
            </h3>
            <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
              drag onto a stage to file it &middot; drag back here to unfile it
            </span>
          </div>
          <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
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
        </section>
      </figure>

      <figcaption className="flex items-baseline justify-between gap-4 flex-wrap prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
        <span>
          After the paper map drawn by Tomo and Vito &middot; {word(lanes.length)} stages &middot;{' '}
          <span className="mono-num">{markCount}</span> marks &middot;{' '}
          <span className="mono-num">{looseCount}</span> still loose
        </span>
        <button
          type="button"
          onClick={addLane}
          className="not-italic label-caps !text-[9px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] inline-flex items-center gap-1 transition-colors"
        >
          <Plus size={10} /> add a stage
        </button>
      </figcaption>
    </div>
  );
}

/* ---------- one band ----------------------------------------------------- */

function Band({
  lane, n, isFirst, isLast, deepest, linked, dropping,
  registerBand, onDragStartNode, onDragOver, onDragLeave, onDrop,
}: {
  lane: MapLane; n: number; isFirst: boolean; isLast: boolean;
  deepest: number; linked: boolean; dropping: boolean;
  registerBand: (id: string) => (el: HTMLElement | null) => void;
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

  /* The short code only earns its place when it isn't just the title again —
     which is how "2023 / 2023" and "The 4 / THE 4" happened. */
  const code = lane.short && norm(lane.short) !== norm(lane.title) ? lane.short.toUpperCase() : null;

  /* One line of type that says what is actually on this stage. Counted, not
     typed, so it can never drift from the marks. */
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

  return (
    <section
      ref={registerBand(lane.id)}
      className={`group relative ${GRID} ${GRID_SM} min-h-[92px] border-t-[0.5px] border-[color:var(--color-border-paper)] transition-colors ${
        dropping ? 'bg-[color:var(--color-brass)]/[0.07]' : 'hover:bg-[color:var(--color-paper-card)]/60'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* № */}
      <div className="pt-4 pr-3 text-right select-none">
        <span className="display-italic text-[30px] mono-num leading-none text-[color:var(--color-on-paper-faint)] group-hover:text-[color:var(--color-brass)] transition-colors">
          {n}
        </span>
      </div>

      {/* the stage rail */}
      <div className="px-5 py-4 border-r-[0.5px] border-[color:var(--color-border-paper)] max-lg:border-r-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <EditableText
            value={lane.title}
            onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { title: v } })}
            className="display-italic text-[19px] text-[color:var(--color-on-paper)]"
          />
          {code && (
            <EditableText
              value={code}
              onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { short: v } })}
              className="label-caps !text-[9px] text-[color:var(--color-brass-deep)]"
            />
          )}
        </div>
        <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-1">
          {gloss}
          {linked && <span className="text-[color:var(--color-brass)]"> &middot; linked</span>}
        </p>
        <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Tool title="move up" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: -1 })}><ChevronUp size={13} /></Tool>
          <Tool title="move down" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: 1 })}><ChevronDown size={13} /></Tool>
          <Tool title="remove this stage and everything on it" onClick={() => dispatch({ type: 'DELETE_MAP_LANE', id: lane.id })}><Trash2 size={12} /></Tool>
        </div>
      </div>

      {/* the field */}
      <div className="px-5 py-4 flex flex-wrap items-start content-start gap-x-3 gap-y-2.5">
        {roots.map((node) => (
          <Mark
            key={node.id}
            node={node}
            nodes={nodes}
            deepest={deepest}
            onDragStart={onDragStartNode}
          />
        ))}
        {lane.note && (
          <blockquote className="basis-full m-0 mt-1 pl-3 border-l-2 border-[color:var(--color-border-brass)]">
            <EditableText
              value={lane.note}
              multiline
              onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { note: v } })}
              className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] leading-snug max-w-[560px]"
            />
          </blockquote>
        )}
        <AddMark laneId={lane.id} laneTitle={lane.title} hasMarks={roots.length > 0} />
      </div>

      <div className="px-2 max-lg:hidden" />
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

  /* One click walks the mark to the next kind. Faster than a dropdown and it
     shows you the result instead of a list of words. */
  const KINDS: MapNodeKind[] = ['note', 'depth', 'person', 'place', 'org', 'unknown'];
  function cycleKind() {
    const i = KINDS.indexOf(node.kind);
    patch({ kind: KINDS[(i + 1) % KINDS.length] });
  }

  /* Floated clear of the flow. An opacity-0 toolbar still occupies layout, and
     one reserved per mark blew ~60px of air between every bubble on the board. */
  const tools = (
    <span className="absolute -top-3 right-0 z-20 hidden group-hover/mark:flex focus-within:flex items-center rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-light)]">
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
            className="inline-flex flex-col rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-card)] px-2.5 py-2 hover:border-[color:var(--color-brass)] transition-colors"
            style={{ borderTopWidth: 3, borderTopColor: hue ?? 'var(--color-on-paper)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hue ?? 'var(--color-on-paper)' }} />
              <EditableText
                value={node.label}
                onSave={(v) => patch({ label: v })}
                onOpenChange={setEditing}
                className="display-italic text-[15px] text-[color:var(--color-on-paper)]"
              />
            </div>
            {kids.length > 0 && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1.5 pt-1.5 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                {kids.map((k) => (
                  <Mark key={k.id} node={k} nodes={nodes} deepest={deepest} nested onDragStart={onDragStart} />
                ))}
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
            {isMax && !nested && (
              <span className="label-caps !text-[8px] !tracking-[0.14em] text-[color:var(--color-brass-deep)] mb-0.5">deepest</span>
            )}
            <span className="inline-flex items-baseline">
              <EditableText
                value={node.label}
                onSave={(v2) => patch({ label: v2 })}
                onOpenChange={setEditing}
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
            <EditableText
              value={node.label}
              onSave={(v) => patch({ label: v })}
              onOpenChange={setEditing}
              className="display-italic mono-num leading-none text-[color:var(--color-on-paper-muted)]"
              style={{ fontSize: nested ? 15 : 17 }}
            />
          </span>
        );
      case 'place':
        return (
          <span className="inline-flex items-baseline gap-1 border-b-[0.5px] border-[color:var(--color-border-paper-strong)] hover:border-[color:var(--color-brass)] transition-colors">
            <MapPin size={9} className="text-[color:var(--color-on-paper-faint)] self-center shrink-0" />
            <EditableText
              value={node.label}
              onSave={(v) => patch({ label: v })}
              onOpenChange={setEditing}
              className="prose-body italic text-[14px] text-[color:var(--color-on-paper)]"
            />
          </span>
        );
      case 'org':
        return (
          <span
            className="inline-flex items-center gap-1 font-sans text-[11px] tracking-[0.05em] px-2 py-1 rounded-[2px]"
            style={{ background: 'color-mix(in srgb, var(--color-dock) 13%, transparent)', color: 'var(--color-dock-deep)' }}
          >
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} />
          </span>
        );
      case 'unknown':
        return (
          <span className="inline-flex items-center gap-1">
            <span
              title="unreadable on the original — click to name it"
              className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper-strong)] hover:border-[color:var(--color-brass)] transition-colors"
            >
              <EditableText
                value={node.label}
                onSave={(v) => patch({ label: v })}
                onOpenChange={setEditing}
                className="display-italic text-[14px] text-[color:var(--color-on-paper-faint)]"
              />
            </span>
          </span>
        );
      case 'note':
        return (
          <span className="inline-flex items-baseline">
            <EditableText
              value={node.label}
              multiline
              onSave={(v) => patch({ label: v })}
              onOpenChange={setEditing}
              className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] leading-snug max-w-[520px]"
            />
          </span>
        );
      default: // topic
        return (
          <span className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-all">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[color:var(--color-on-paper-muted)] shrink-0" />
            <EditableText value={node.label} onSave={(v) => patch({ label: v })} onOpenChange={setEditing} />
          </span>
        );
    }
  })();

  return (
    <span
      className={`group/mark relative inline-flex max-w-full ${form === 'note' ? 'basis-full' : ''}`}
      /* Dragging is switched off while an input is open, or the browser steals
         the pointer from text selection mid-word. */
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
    dispatch({
      type: 'ADD_MAP_NODE',
      node: { id: `mn-${Date.now().toString(36)}`, laneId, order: max + 1, label: v, kind: classifyLabel(v) },
    });
    setDraft('');
  }

  return (
    <span className={`inline-flex items-baseline ${hasMarks ? 'basis-full mt-0.5' : ''}`}>
      {!hasMarks && (
        <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] mr-3">
          Nothing here yet.
        </span>
      )}
      <input
        value={draft}
        placeholder={`add to ${laneTitle.toLowerCase()}…`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') setDraft('');
        }}
        className={`w-[180px] bg-transparent border-b-[0.5px] border-transparent px-0.5 py-0.5 text-[12px] text-[color:var(--color-on-paper)] placeholder:text-[color:var(--color-on-paper-faint)] placeholder:italic outline-none transition-colors focus:border-[color:var(--color-brass)] ${
          hasMarks ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : ''
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
        <EditableText
          value={tray.title}
          onSave={(v) => patch({ title: v })}
          className="label-caps !text-[9px] text-[color:var(--color-on-paper-faint)]"
        />
        <span className="opacity-0 group-hover/tray:opacity-100 transition-opacity">
          <Tool title="remove this bracket" onClick={() => dispatch({ type: 'DELETE_MAP_ASIDE', id: tray.id })}>
            <Trash2 size={10} />
          </Tool>
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
            <EditableText
              value={line}
              onSave={(v) => patch({ lines: tray.lines.map((l, j) => (j === i ? v : l)) })}
              className="text-[12px] text-[color:var(--color-on-paper-muted)]"
            />
            <button
              type="button"
              title="remove"
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
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft.trim()) { patch({ lines: [...tray.lines, draft.trim()] }); setDraft(''); }
            }
            if (e.key === 'Escape') setDraft('');
          }}
          className="w-[86px] bg-transparent border-b-[0.5px] border-transparent px-0.5 text-[12px] text-[color:var(--color-on-paper)] placeholder:text-[color:var(--color-on-paper-faint)] placeholder:italic outline-none focus:border-[color:var(--color-brass)] transition-colors"
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
      className="p-1.5 rounded-[3px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-deep)] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[color:var(--color-on-paper-faint)] transition-colors leading-none"
    >
      {children}
    </button>
  );
}

/* Always live. Click the word, it becomes an input; Enter or blur commits,
   Escape reverts. There is no mode to be in. */
function EditableText({
  value, placeholder, onSave, onOpenChange, className = '', style, multiline = false,
}: {
  value: string; placeholder?: string; onSave: (v: string) => void;
  onOpenChange?: (open: boolean) => void;
  className?: string; style?: CSSProperties; multiline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  function begin() { setDraft(value); setOpen(true); }
  function commit() { setOpen(false); if (draft !== value) onSave(draft); }

  if (open) {
    const shared = 'bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-1.5 py-0.5 outline-none';
    return multiline ? (
      <textarea
        autoFocus rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        className={`${shared} ${className} w-full resize-y`} style={style}
      />
    ) : (
      <input
        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setOpen(false); }}
        className={`${shared} ${className} w-full min-w-[60px]`} style={style}
      />
    );
  }

  const empty = value.trim() === '';
  return (
    <span
      onClick={begin}
      className={`${className} cursor-text hover:bg-[color:var(--color-paper-deep)]/50 rounded-[2px] px-0.5 -mx-0.5 transition-colors ${empty ? 'italic opacity-40' : ''}`}
      style={style}
    >
      {empty ? (placeholder ?? '…') : value}
    </span>
  );
}
