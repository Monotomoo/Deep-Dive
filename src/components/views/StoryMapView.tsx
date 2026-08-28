import {
  useCallback, useLayoutEffect, useRef, useState, type ReactNode,
} from 'react';
import {
  ArrowLeft, ArrowRight, HelpCircle, Landmark, MapPin, Pencil, Plus, StickyNote, Trash2, User,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { MapAside, MapLane, MapNode, MapNodeKind } from '../../types';

/* The Plan — Tomo and Vito's drawn plan, made editable.

   The paper is a chain of long bars read left to right, with bubbles hanging
   off each bar and a few long curved arrows reaching across the page. That is
   exactly what this renders: bars in a row, bubbles beneath them on stems, and
   real SVG curves for the arrows.

   Why this is NOT the Neuron view: Neuron auto-lays-out the graph, and an
   auto-layout would throw away the only thing that makes the drawing worth
   keeping — that the two of them chose the order and the attachments. Here the
   arrangement IS the data, and it's edited by hand. */

const KIND_META: Record<MapNodeKind, { label: string; icon: ReactNode | null }> = {
  person:  { label: 'person',  icon: <User size={10} /> },
  depth:   { label: 'depth',   icon: null },
  org:     { label: 'body',    icon: <Landmark size={10} /> },
  place:   { label: 'place',   icon: <MapPin size={10} /> },
  note:    { label: 'note',    icon: <StickyNote size={10} /> },
  unknown: { label: 'unread',  icon: <HelpCircle size={10} /> },
};

const KIND_ORDER: MapNodeKind[] = ['person', 'depth', 'org', 'place', 'note', 'unknown'];

export function StoryMapView() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);

  const lanes = [...state.mapLanes].sort((a, b) => a.order - b.order);
  const asides = [...state.mapAsides].sort((a, b) => a.order - b.order);

  /* ---- Measuring, so the long arrows can be drawn as real curves ----
     Every bar and bubble registers its element; after layout we read their
     boxes relative to the board and keep them in state. The SVG lives inside
     the scrolling content, so horizontal scroll needs no re-measure. */
  const boardRef = useRef<HTMLDivElement | null>(null);
  const elsRef = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });

  const register = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) elsRef.current.set(id, el);
    else elsRef.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const b = board.getBoundingClientRect();
    const next: Record<string, { x: number; y: number; w: number; h: number }> = {};
    elsRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
    });
    setBoxes(next);
    setBoardSize({ w: board.scrollWidth, h: board.scrollHeight });
  }, []);

  useLayoutEffect(() => {
    measure();
    const board = boardRef.current;
    if (!board || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(board);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure, state.mapLanes, state.mapNodes, editing]);

  /* Every arrow on the page: a bubble reaching to another bubble or to a bar. */
  const arrows = state.mapNodes.flatMap((n) =>
    (n.links ?? []).map((target) => ({ from: n.id, to: target })),
  );

  function addLane() {
    const maxOrder = state.mapLanes.reduce((m, l) => Math.max(m, l.order), 0);
    dispatch({
      type: 'ADD_MAP_LANE',
      lane: { id: `ml-${Date.now().toString(36)}`, order: maxOrder + 1, title: 'New stage', colorHint: 'var(--color-steel)' },
    });
  }

  function addAside() {
    const maxOrder = state.mapAsides.reduce((m, a) => Math.max(m, a.order), 0);
    dispatch({
      type: 'ADD_MAP_ASIDE',
      aside: { id: `ma-${Date.now().toString(36)}`, order: maxOrder + 1, title: 'New box', lines: [] },
    });
  }

  return (
    <div className="space-y-7">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The Plan</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            the plan Tomo and Vito drew · read left to right · everything moves and edits
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-[3px] border-[0.5px] transition-all ${
            editing
              ? 'border-[color:var(--color-brass)] text-[color:var(--color-brass)] bg-[color:var(--color-paper-card)]'
              : 'border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:border-[color:var(--color-brass)]'
          }`}
        >
          <Pencil size={11} /> {editing ? 'done editing' : 'edit the plan'}
        </button>
      </header>

      <p className="prose-body text-[12.5px] text-[color:var(--color-on-paper-faint)] max-w-[620px] leading-relaxed border-l-2 border-[color:var(--color-border-paper)] pl-3">
        Transcribed off the photograph, nothing added. Two bubbles couldn’t be read and are marked
        <span className="text-[color:var(--color-on-paper-muted)]"> ? </span>
        rather than guessed at. Raul / DCI / CMAS is on the paper but left out for now, as agreed.
      </p>

      {/* ---- The board ---- */}
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div ref={boardRef} className="relative inline-block min-w-full">
          {/* the long arrows, drawn under the bubbles */}
          <svg
            className="absolute left-0 top-0 pointer-events-none"
            width={boardSize.w || '100%'}
            height={boardSize.h || '100%'}
            aria-hidden
          >
            <defs>
              <marker id="map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-brass)" />
              </marker>
            </defs>
            {arrows.map(({ from, to }) => {
              const a = boxes[from];
              const b = boxes[to];
              if (!a || !b) return null;
              const sx = a.x + a.w / 2, sy = a.y + a.h;
              const tx = b.x + b.w / 2, ty = b.y + b.h;
              const drop = Math.max(60, Math.abs(tx - sx) / 3);
              return (
                <path
                  key={`${from}->${to}`}
                  d={`M ${sx} ${sy} C ${sx} ${sy + drop}, ${tx} ${ty + drop}, ${tx} ${ty}`}
                  fill="none"
                  stroke="var(--color-brass)"
                  strokeWidth="1.25"
                  strokeDasharray="4 3"
                  opacity="0.75"
                  markerEnd="url(#map-arrow)"
                />
              );
            })}
          </svg>

          <div className="relative flex items-stretch gap-3">
            {lanes.map((lane, i) => (
              <LaneColumn
                key={lane.id}
                lane={lane}
                index={i}
                isFirst={i === 0}
                isLast={i === lanes.length - 1}
                editing={editing}
                register={register}
              />
            ))}
            {editing && (
              <button
                type="button"
                onClick={addLane}
                className="self-start mt-7 shrink-0 w-[130px] h-[52px] rounded-[4px] border border-dashed border-[color:var(--color-border-paper-strong)] text-[11px] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)] inline-flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={12} /> add a stage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- The boxed asides, sitting off the chain like on the paper ---- */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">off to the side</h3>
          {editing && (
            <button
              type="button"
              onClick={addAside}
              className="text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] inline-flex items-center gap-1 transition-colors"
            >
              <Plus size={11} /> add a box
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {asides.map((a) => <AsideBox key={a.id} aside={a} editing={editing} />)}
        </div>
      </section>
    </div>
  );
}

/* ---------- One stage: the bar, and everything hanging off it ---------- */

function LaneColumn({
  lane, index, isFirst, isLast, editing, register,
}: {
  lane: MapLane; index: number; isFirst: boolean; isLast: boolean; editing: boolean;
  register: (id: string) => (el: HTMLElement | null) => void;
}) {
  const { state, dispatch } = useApp();
  const color = lane.colorHint ?? 'var(--color-steel)';
  const nodes = state.mapNodes
    .filter((n) => n.laneId === lane.id)
    .sort((a, b) => a.order - b.order);
  const roots = nodes.filter((n) => !n.parentId);

  function addNode() {
    const maxOrder = nodes.reduce((m, n) => Math.max(m, n.order), 0);
    dispatch({
      type: 'ADD_MAP_NODE',
      node: { id: `mn-${Date.now().toString(36)}`, laneId: lane.id, order: maxOrder + 1, label: 'new', kind: 'note' },
    });
  }

  return (
    <div className="shrink-0 w-[210px] flex flex-col">
      {/* stage number + the arrow onward */}
      <div className="flex items-center justify-between mb-1.5 h-4">
        <span className="label-caps text-[color:var(--color-on-paper-faint)]">stage {index + 1}</span>
        {!isLast && <span className="text-[color:var(--color-on-paper-faint)] text-[13px] leading-none">&rarr;</span>}
      </div>

      {/* the bar */}
      <div
        ref={register(lane.id)}
        className="rounded-[4px] px-3 py-2.5 border-[0.5px]"
        style={{ background: `color-mix(in srgb, ${color} 12%, var(--color-paper-card))`, borderColor: color }}
      >
        <MapText
          value={lane.title}
          editing={editing}
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { title: v } })}
          className="display-italic text-[19px] leading-tight text-[color:var(--color-on-paper)]"
        />
        <MapText
          value={lane.short ?? ''}
          placeholder="as written"
          editing={editing}
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { short: v } })}
          className="label-caps text-[10px] mt-0.5"
          style={{ color }}
        />
      </div>

      {lane.note !== undefined && (lane.note || editing) && (
        <div className="mt-1.5">
          <MapText
            value={lane.note ?? ''}
            placeholder="handwriting beside the bar"
            editing={editing}
            multiline
            onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { note: v } })}
            className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug"
          />
        </div>
      )}

      {editing && (
        <div className="flex items-center gap-1 mt-1.5">
          <MiniBtn title="move earlier" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: -1 })}>
            <ArrowLeft size={11} />
          </MiniBtn>
          <MiniBtn title="move later" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: 1 })}>
            <ArrowRight size={11} />
          </MiniBtn>
          <MiniBtn title="add a bubble" onClick={addNode}><Plus size={11} /></MiniBtn>
          <MiniBtn title="remove this stage and its bubbles" onClick={() => dispatch({ type: 'DELETE_MAP_LANE', id: lane.id })}>
            <Trash2 size={11} />
          </MiniBtn>
        </div>
      )}

      {/* the stem down to the bubbles */}
      {roots.length > 0 && <div className="w-px h-4 ml-5 mt-1" style={{ background: 'var(--color-border-paper-strong)' }} />}

      <div className="space-y-2 mt-0.5">
        {roots.map((n) => (
          <NodeBubble key={n.id} node={n} nodes={nodes} editing={editing} register={register} laneColor={color} />
        ))}
      </div>
    </div>
  );
}

/* ---------- A bubble, and whatever hangs off it ---------- */

function NodeBubble({
  node, nodes, editing, register, laneColor,
}: {
  node: MapNode; nodes: MapNode[]; editing: boolean;
  register: (id: string) => (el: HTMLElement | null) => void;
  laneColor: string;
}) {
  const { state, dispatch } = useApp();
  const children = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.order - b.order);
  const [open, setOpen] = useState(false);

  const isPerson = node.kind === 'person';
  const isUnknown = node.kind === 'unknown';
  const isDepth = node.kind === 'depth';
  const meta = KIND_META[node.kind];

  const targets = [
    ...state.mapLanes.map((l) => ({ id: l.id, label: `stage · ${l.title}` })),
    ...state.mapNodes.filter((n) => n.id !== node.id).map((n) => ({ id: n.id, label: n.label })),
  ];

  function patch(p: Partial<MapNode>) { dispatch({ type: 'UPDATE_MAP_NODE', id: node.id, patch: p }); }

  function addChild() {
    const maxOrder = nodes.reduce((m, n) => Math.max(m, n.order), 0);
    dispatch({
      type: 'ADD_MAP_NODE',
      node: {
        id: `mn-${Date.now().toString(36)}`, laneId: node.laneId, order: maxOrder + 1,
        label: 'new', kind: 'note', parentId: node.id,
      },
    });
  }

  return (
    <div>
      <div
        ref={register(node.id)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-[0.5px] max-w-full ${
          isPerson ? 'rounded-[3px]' : 'rounded-full'
        } ${isUnknown ? 'border-dashed' : ''}`}
        style={{
          borderColor: isUnknown ? 'var(--color-border-paper-strong)' : isDepth ? 'var(--color-dock)' : laneColor,
          background: isPerson ? `color-mix(in srgb, ${laneColor} 16%, var(--color-paper-card))` : 'var(--color-paper-card)',
        }}
      >
        {meta.icon && <span className="text-[color:var(--color-on-paper-faint)] shrink-0">{meta.icon}</span>}
        <MapText
          value={node.label}
          editing={editing}
          onSave={(v) => patch({ label: v })}
          className={`${isPerson ? 'label-caps text-[11.5px]' : isDepth ? 'mono-num text-[13px]' : 'text-[12px]'} text-[color:var(--color-on-paper)] leading-none`}
        />
        {isDepth && <span className="text-[10px] text-[color:var(--color-on-paper-faint)] leading-none">m</span>}
        {(node.note || node.links?.length) && !editing && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            title={node.note ?? 'linked'}
            className="text-[10px] text-[color:var(--color-brass)] leading-none"
          >
            &bull;
          </button>
        )}
      </div>

      {/* the note under a bubble */}
      {(open || editing) && (node.note || editing) && (
        <div className="mt-1 ml-1">
          <MapText
            value={node.note ?? ''}
            placeholder="note"
            editing={editing}
            multiline
            onSave={(v) => patch({ note: v })}
            className="prose-body italic text-[11.5px] text-[color:var(--color-on-paper-muted)] leading-snug"
          />
        </div>
      )}

      {editing && (
        <div className="mt-1 ml-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1">
            <select
              value={node.kind}
              onChange={(e) => patch({ kind: e.target.value as MapNodeKind })}
              className="text-[10px] bg-transparent border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-1 py-0.5 text-[color:var(--color-on-paper-muted)]"
            >
              {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_META[k].label}</option>)}
            </select>
            <MiniBtn title="hang a bubble off this one" onClick={addChild}><Plus size={11} /></MiniBtn>
            <MiniBtn title="remove this bubble" onClick={() => dispatch({ type: 'DELETE_MAP_NODE', id: node.id })}>
              <Trash2 size={11} />
            </MiniBtn>
          </div>
          <select
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              patch({ links: [...(node.links ?? []), e.target.value] });
            }}
            className="text-[10px] bg-transparent border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-1 py-0.5 text-[color:var(--color-on-paper-faint)] max-w-full"
          >
            <option value="">draw an arrow to…</option>
            {targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      )}

      {/* arrows already drawn from this bubble */}
      {!!node.links?.length && (
        <div className="flex flex-wrap gap-1 mt-1 ml-1">
          {node.links.map((l) => {
            const lane = state.mapLanes.find((x) => x.id === l);
            const other = state.mapNodes.find((x) => x.id === l);
            const label = lane?.title ?? other?.label ?? l;
            return (
              <button
                key={l}
                type="button"
                disabled={!editing}
                onClick={() => patch({ links: (node.links ?? []).filter((x) => x !== l) })}
                title={editing ? 'remove this arrow' : `arrow to ${label}`}
                className="text-[10px] text-[color:var(--color-brass)] border-[0.5px] border-[color:var(--color-border-brass)] rounded-full px-1.5 py-px disabled:cursor-default"
              >
                &rarr; {label}
              </button>
            );
          })}
        </div>
      )}

      {children.length > 0 && (
        <div className="ml-3 mt-1.5 pl-2.5 border-l border-[color:var(--color-border-paper)] space-y-1.5">
          {children.map((c) => (
            <NodeBubble key={c.id} node={c} nodes={nodes} editing={editing} register={register} laneColor={laneColor} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- The boxed aside ---------- */

function AsideBox({ aside, editing }: { aside: MapAside; editing: boolean }) {
  const { dispatch } = useApp();
  function patch(p: Partial<MapAside>) { dispatch({ type: 'UPDATE_MAP_ASIDE', id: aside.id, patch: p }); }

  return (
    <div className="rounded-[4px] border-[0.5px] border-[color:var(--color-border-paper-strong)] bg-[color:var(--color-paper-card)] px-4 py-3 min-w-[160px]">
      <MapText
        value={aside.title}
        editing={editing}
        onSave={(v) => patch({ title: v })}
        className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-tight"
      />
      <div className="mt-1.5 space-y-0.5">
        {aside.lines.map((line, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <MapText
              value={line}
              editing={editing}
              onSave={(v) => patch({ lines: aside.lines.map((l, j) => (j === i ? v : l)) })}
              className="label-caps text-[11px] text-[color:var(--color-on-paper-muted)]"
            />
            {editing && (
              <MiniBtn title="remove this line" onClick={() => patch({ lines: aside.lines.filter((_, j) => j !== i) })}>
                <Trash2 size={10} />
              </MiniBtn>
            )}
          </div>
        ))}
      </div>
      {aside.note && !editing && (
        <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-2 leading-snug max-w-[200px]">{aside.note}</p>
      )}
      {editing && (
        <div className="mt-2">
          <MapText
            value={aside.note ?? ''}
            placeholder="note"
            editing
            multiline
            onSave={(v) => patch({ note: v })}
            className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)]"
          />
          <div className="flex items-center gap-1 mt-1.5">
            <MiniBtn title="add a line" onClick={() => patch({ lines: [...aside.lines, 'new'] })}><Plus size={11} /></MiniBtn>
            <MiniBtn title="remove this box" onClick={() => dispatch({ type: 'DELETE_MAP_ASIDE', id: aside.id })}>
              <Trash2 size={11} />
            </MiniBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small shared bits ---------- */

function MiniBtn({ children, title, onClick, disabled }: { children: ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-1 rounded-[3px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-deep)] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[color:var(--color-on-paper-faint)] transition-colors"
    >
      {children}
    </button>
  );
}

/* Click-to-edit text. Reads as plain type until you're in edit mode; then it
   opens on click and saves on blur or Enter. */
function MapText({
  value, placeholder, onSave, className = '', style, multiline = false, editing = false,
}: {
  value: string; placeholder?: string; onSave: (v: string) => void;
  className?: string; style?: React.CSSProperties; multiline?: boolean; editing?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(value);

  function begin() { if (!editing) return; setDraft(value); setActive(true); }
  function commit() { setActive(false); if (draft !== value) onSave(draft); }

  if (active) {
    const shared = 'w-full bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-1.5 py-0.5 outline-none';
    return multiline ? (
      <textarea
        autoFocus rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') setActive(false); }}
        className={`${shared} ${className} resize-y`} style={style}
      />
    ) : (
      <input
        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setActive(false); }}
        className={`${shared} ${className}`} style={style}
      />
    );
  }

  const empty = value.trim() === '';
  if (empty && !editing) return null;
  return (
    <span
      onClick={begin}
      className={`${className} ${editing ? 'cursor-text hover:bg-[color:var(--color-paper-deep)] rounded-[2px]' : ''} ${empty ? 'italic opacity-45' : ''} block`}
      style={style}
    >
      {empty ? (placeholder ?? 'empty') : value}
    </span>
  );
}
