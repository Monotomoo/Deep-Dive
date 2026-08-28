import {
  useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { MapAside, MapLane, MapNode, MapNodeKind } from '../../types';

/* The Plan — the map Tomo and Vito drew, made into a board.

   Stages run left to right along a rail, bubbles hang off each stage on stems,
   long curved arrows reach back across the board, and anything not yet placed
   sits in a bracket underneath. The arrangement is the data: it is edited by
   hand, never auto-laid-out, because the arrangement is the thinking. */

const KIND_ORDER: MapNodeKind[] = ['person', 'depth', 'place', 'org', 'note', 'unknown'];
const KIND_LABEL: Record<MapNodeKind, string> = {
  person: 'person', depth: 'depth', place: 'place', org: 'body', note: 'note', unknown: 'unread',
};

const BAR_H = 82;   // every stage bar is the same height so the rail runs true
const RAIL_Y = BAR_H / 2;

export function StoryMapView() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);

  const lanes = [...state.mapLanes].sort((a, b) => a.order - b.order);
  const brackets = [...state.mapAsides].sort((a, b) => a.order - b.order);

  /* ---- Measure, so the long arrows are real curves between real elements ---- */
  const boardRef = useRef<HTMLDivElement | null>(null);
  const elsRef = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  const register = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) elsRef.current.set(id, el); else elsRef.current.delete(id);
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
    setSize({ w: board.scrollWidth, h: board.scrollHeight });
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

  const arrows = state.mapNodes.flatMap((n) => (n.links ?? []).map((to) => ({ from: n.id, to })));

  function addLane() {
    const max = state.mapLanes.reduce((m, l) => Math.max(m, l.order), 0);
    dispatch({
      type: 'ADD_MAP_LANE',
      lane: { id: `ml-${Date.now().toString(36)}`, order: max + 1, title: 'New stage', colorHint: '#4c6b93' },
    });
  }

  function addBracket() {
    const max = state.mapAsides.reduce((m, a) => Math.max(m, a.order), 0);
    dispatch({
      type: 'ADD_MAP_ASIDE',
      aside: { id: `ma-${Date.now().toString(36)}`, order: max + 1, title: 'Unsorted', lines: [] },
    });
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The Plan</h2>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border-[0.5px] transition-all ${
            editing
              ? 'border-[color:var(--color-brass)] text-[color:var(--color-brass)] bg-[color:var(--color-paper-card)]'
              : 'border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)]'
          }`}
        >
          {editing ? <Check size={12} /> : <Pencil size={11} />} {editing ? 'done' : 'edit'}
        </button>
      </header>

      {/* ---- The board ---- */}
      <div className="relative">
        <div className="overflow-x-auto pb-3 -mx-6 px-6">
          <div ref={boardRef} className="relative inline-block min-w-full">
            {/* the rail every stage sits on */}
            <div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{ top: RAIL_Y, background: 'var(--color-border-paper-strong)' }}
            />

            {/* the long arrows, drawn beneath the bubbles */}
            <svg
              className="absolute left-0 top-0 pointer-events-none overflow-visible"
              width={size.w || '100%'}
              height={size.h || '100%'}
              aria-hidden
            >
              <defs>
                <marker id="plan-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-brass)" />
                </marker>
              </defs>
              {arrows.map(({ from, to }) => {
                const a = boxes[from], b = boxes[to];
                if (!a || !b) return null;
                const sx = a.x + a.w / 2, sy = a.y + a.h;
                const tx = b.x + b.w / 2, ty = b.y + b.h;
                const drop = Math.max(56, Math.abs(tx - sx) / 3.4);
                return (
                  <path
                    key={`${from}->${to}`}
                    d={`M ${sx} ${sy} C ${sx} ${sy + drop}, ${tx} ${ty + drop}, ${tx} ${ty}`}
                    fill="none" stroke="var(--color-brass)" strokeWidth="1.1"
                    strokeDasharray="3 4" strokeLinecap="round" opacity="0.6"
                    markerEnd="url(#plan-arrow)"
                  />
                );
              })}
            </svg>

            <div className="relative flex items-start gap-4">
              {lanes.map((lane, i) => (
                <Stage
                  key={lane.id}
                  lane={lane}
                  n={i + 1}
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
                  className="shrink-0 w-[130px] rounded-[6px] border border-dashed border-[color:var(--color-border-paper-strong)] text-[11px] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)] inline-flex items-center justify-center gap-1 transition-colors"
                  style={{ height: BAR_H }}
                >
                  <Plus size={12} /> stage
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Brackets · anything not placed on the board yet ---- */}
      <section className="pt-2 border-t border-[color:var(--color-border-paper)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="label-caps text-[color:var(--color-on-paper-faint)]">not sorted yet</h3>
          {editing && (
            <button
              type="button"
              onClick={addBracket}
              className="text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] inline-flex items-center gap-1 transition-colors"
            >
              <Plus size={11} /> bracket
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-5">
          {brackets.map((b) => <Bracket key={b.id} bracket={b} editing={editing} />)}
        </div>
      </section>
    </div>
  );
}

/* ---------- One stage on the rail ---------- */

function Stage({
  lane, n, isFirst, isLast, editing, register,
}: {
  lane: MapLane; n: number; isFirst: boolean; isLast: boolean; editing: boolean;
  register: (id: string) => (el: HTMLElement | null) => void;
}) {
  const { state, dispatch } = useApp();
  const color = lane.colorHint ?? 'var(--color-steel)';
  const nodes = state.mapNodes.filter((x) => x.laneId === lane.id).sort((a, b) => a.order - b.order);
  const roots = nodes.filter((x) => !x.parentId);

  function addNode() {
    const max = nodes.reduce((m, x) => Math.max(m, x.order), 0);
    dispatch({
      type: 'ADD_MAP_NODE',
      node: { id: `mn-${Date.now().toString(36)}`, laneId: lane.id, order: max + 1, label: 'new', kind: 'note' },
    });
  }

  return (
    <div className="relative shrink-0 grow basis-[186px] min-w-[186px] max-w-[250px]">
      {/* the bar */}
      <div
        ref={register(lane.id)}
        className="relative rounded-[6px] border-[0.5px] px-3.5 pt-3 pb-2.5 flex flex-col justify-center"
        style={{
          height: BAR_H,
          borderColor: `color-mix(in srgb, ${color} 55%, transparent)`,
          background: `linear-gradient(180deg, color-mix(in srgb, ${color} 13%, var(--color-paper-card)), var(--color-paper-card))`,
          boxShadow: '0 1px 0 rgba(10,43,79,0.04)',
        }}
      >
        <span
          className="absolute -top-2 left-3 w-[18px] h-[18px] rounded-full flex items-center justify-center mono-num text-[10px]"
          style={{ background: color, color: 'var(--color-paper-light)' }}
        >
          {n}
        </span>
        <MapText
          value={lane.title}
          editing={editing}
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { title: v } })}
          className="display-italic text-[20px] leading-[1.1] text-[color:var(--color-on-paper)]"
        />
        <MapText
          value={lane.short ?? ''}
          placeholder="as written"
          editing={editing}
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { short: v } })}
          className="label-caps text-[9.5px] mt-1 tracking-[0.14em]"
          style={{ color }}
        />
      </div>

      {/* the chevron onward */}
      {!isLast && (
        <span
          className="absolute text-[color:var(--color-on-paper-faint)] text-[12px] leading-none select-none"
          style={{ top: RAIL_Y - 6, right: -12 }}
          aria-hidden
        >
          &#9656;
        </span>
      )}

      {lane.note !== undefined && (lane.note || editing) && (
        <MapText
          value={lane.note ?? ''}
          placeholder="the handwriting beside the bar"
          editing={editing}
          multiline
          onSave={(v) => dispatch({ type: 'UPDATE_MAP_LANE', id: lane.id, patch: { note: v } })}
          className="prose-body italic text-[11.5px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2"
        />
      )}

      {editing && (
        <div className="flex items-center gap-0.5 mt-2">
          <Mini title="move earlier" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: -1 })}><ArrowLeft size={11} /></Mini>
          <Mini title="move later" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_MAP_LANE', id: lane.id, dir: 1 })}><ArrowRight size={11} /></Mini>
          <Mini title="add a bubble" onClick={addNode}><Plus size={11} /></Mini>
          <Mini title="remove this stage and its bubbles" onClick={() => dispatch({ type: 'DELETE_MAP_LANE', id: lane.id })}><Trash2 size={11} /></Mini>
        </div>
      )}

      {/* the stems, and everything hanging off them */}
      {roots.length > 0 && (
        <div className="relative mt-4 pl-5">
          <span
            className="absolute left-2 w-px"
            style={{ top: -14, bottom: 12, background: 'var(--color-border-paper-strong)' }}
          />
          <div className="space-y-2.5">
            {roots.map((node) => (
              <Bubble key={node.id} node={node} nodes={nodes} editing={editing} register={register} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- A bubble on a stem ---------- */

function Bubble({
  node, nodes, editing, register, color,
}: {
  node: MapNode; nodes: MapNode[]; editing: boolean;
  register: (id: string) => (el: HTMLElement | null) => void; color: string;
}) {
  const { state, dispatch } = useApp();
  const kids = nodes.filter((x) => x.parentId === node.id).sort((a, b) => a.order - b.order);
  const isPerson = node.kind === 'person';
  const isDepth = node.kind === 'depth';
  const isUnknown = node.kind === 'unknown';

  function patch(p: Partial<MapNode>) { dispatch({ type: 'UPDATE_MAP_NODE', id: node.id, patch: p }); }

  function addChild() {
    const max = nodes.reduce((m, x) => Math.max(m, x.order), 0);
    dispatch({
      type: 'ADD_MAP_NODE',
      node: { id: `mn-${Date.now().toString(36)}`, laneId: node.laneId, order: max + 1, label: 'new', kind: 'note', parentId: node.id },
    });
  }

  const targets = [
    ...state.mapLanes.map((l) => ({ id: l.id, label: `stage · ${l.title}` })),
    ...state.mapNodes.filter((x) => x.id !== node.id).map((x) => ({ id: x.id, label: x.label })),
  ];

  return (
    <div className="relative">
      {/* the tick joining this bubble to the stem */}
      <span className="absolute h-px w-3" style={{ left: -12, top: 13, background: 'var(--color-border-paper-strong)' }} aria-hidden />

      <span
        ref={register(node.id)}
        title={node.note || undefined}
        className={`inline-flex items-baseline gap-1 border-[0.5px] max-w-full align-top ${
          isPerson ? 'rounded-[4px] px-2.5 py-1' : isDepth ? 'rounded-full px-2 py-0.5' : 'rounded-full px-2.5 py-0.5'
        } ${isUnknown ? 'border-dashed' : ''} ${node.note ? 'cursor-help' : ''}`}
        style={{
          borderColor: isUnknown
            ? 'var(--color-border-paper-strong)'
            : isDepth ? 'color-mix(in srgb, var(--color-dock) 60%, transparent)'
            : `color-mix(in srgb, ${color} 45%, transparent)`,
          background: isPerson
            ? `color-mix(in srgb, ${color} 18%, var(--color-paper-card))`
            : 'var(--color-paper-card)',
        }}
      >
        <MapText
          value={node.label}
          editing={editing}
          onSave={(v) => patch({ label: v })}
          className={
            isPerson ? 'label-caps text-[11px] tracking-[0.1em] text-[color:var(--color-on-paper)]'
            : isDepth ? 'mono-num text-[13px] text-[color:var(--color-on-paper)]'
            : `text-[12px] ${isUnknown ? 'text-[color:var(--color-on-paper-faint)]' : 'text-[color:var(--color-on-paper-muted)]'}`
          }
        />
        {isDepth && <span className="text-[9px] text-[color:var(--color-on-paper-faint)]">m</span>}
      </span>

      {editing && (
        <div className="mt-1.5 space-y-1">
          <MapText
            value={node.note ?? ''}
            placeholder="note"
            editing
            multiline
            onSave={(v) => patch({ note: v })}
            className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug"
          />
          <div className="flex flex-wrap items-center gap-1">
            <select
              value={node.kind}
              onChange={(e) => patch({ kind: e.target.value as MapNodeKind })}
              className="text-[10px] bg-transparent border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-1 py-0.5 text-[color:var(--color-on-paper-muted)]"
            >
              {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
            <Mini title="hang a bubble off this one" onClick={addChild}><Plus size={11} /></Mini>
            <Mini title="remove this bubble" onClick={() => dispatch({ type: 'DELETE_MAP_NODE', id: node.id })}><Trash2 size={11} /></Mini>
          </div>
          <select
            value=""
            onChange={(e) => { if (e.target.value) patch({ links: [...(node.links ?? []), e.target.value] }); }}
            className="text-[10px] w-full bg-transparent border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-1 py-0.5 text-[color:var(--color-on-paper-faint)]"
          >
            <option value="">draw an arrow to…</option>
            {targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {!!node.links?.length && (
            <div className="flex flex-wrap gap-1">
              {node.links.map((l) => {
                const label = state.mapLanes.find((x) => x.id === l)?.title
                  ?? state.mapNodes.find((x) => x.id === l)?.label ?? l;
                return (
                  <button
                    key={l}
                    type="button"
                    title="remove this arrow"
                    onClick={() => patch({ links: (node.links ?? []).filter((x) => x !== l) })}
                    className="inline-flex items-center gap-1 text-[10px] text-[color:var(--color-brass)] border-[0.5px] border-[color:var(--color-border-brass)] rounded-full px-1.5 py-px hover:bg-[color:var(--color-paper-deep)]"
                  >
                    &rarr; {label} <X size={8} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {kids.length > 0 && (
        <div className="relative mt-2 ml-3 pl-4">
          <span className="absolute left-1 top-0 bottom-3 w-px" style={{ background: 'var(--color-border-paper)' }} aria-hidden />
          <div className="space-y-2">
            {kids.map((k) => (
              <div key={k.id} className="relative">
                <span className="absolute h-px w-3" style={{ left: -12, top: 11, background: 'var(--color-border-paper)' }} aria-hidden />
                <Bubble node={k} nodes={nodes} editing={editing} register={register} color={color} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- A bracket · things with no place on the board yet ---------- */

function Bracket({ bracket, editing }: { bracket: MapAside; editing: boolean }) {
  const { dispatch } = useApp();
  function patch(p: Partial<MapAside>) { dispatch({ type: 'UPDATE_MAP_ASIDE', id: bracket.id, patch: p }); }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5 ml-3">
        <MapText
          value={bracket.title}
          editing={editing}
          onSave={(v) => patch({ title: v })}
          className="label-caps text-[10px] tracking-[0.14em] text-[color:var(--color-on-paper-faint)]"
        />
        {editing && (
          <Mini title="remove this bracket" onClick={() => dispatch({ type: 'DELETE_MAP_ASIDE', id: bracket.id })}>
            <Trash2 size={10} />
          </Mini>
        )}
      </div>

      <div className="flex items-stretch">
        <BracketRule side="left" />
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 min-h-[34px]">
          {bracket.lines.map((line, i) => (
            <span
              key={i}
              className="group inline-flex items-center gap-1 rounded-full border-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper-card)] px-2.5 py-0.5"
            >
              <MapText
                value={line}
                editing={editing}
                onSave={(v) => patch({ lines: bracket.lines.map((l, j) => (j === i ? v : l)) })}
                className="text-[12px] text-[color:var(--color-on-paper-muted)]"
              />
              {editing && (
                <button
                  type="button"
                  title="remove"
                  onClick={() => patch({ lines: bracket.lines.filter((_, j) => j !== i) })}
                  className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-colors"
                >
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
          {editing && <AddToBracket onAdd={(v) => patch({ lines: [...bracket.lines, v] })} />}
          {!editing && bracket.lines.length === 0 && (
            <span className="text-[12px] italic text-[color:var(--color-on-paper-faint)]">empty</span>
          )}
        </div>
        <BracketRule side="right" />
      </div>

      {bracket.note && (
        <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-1.5 ml-3 max-w-[240px] leading-snug">
          {bracket.note}
        </p>
      )}
    </div>
  );
}

/* The bracket glyph, drawn rather than typed so it scales with the contents. */
function BracketRule({ side }: { side: 'left' | 'right' }) {
  const edge = side === 'left'
    ? 'border-l border-t border-b rounded-l-[3px]'
    : 'border-r border-t border-b rounded-r-[3px]';
  return <span className={`w-2 shrink-0 ${edge}`} style={{ borderColor: 'var(--color-border-paper-strong)' }} aria-hidden />;
}

function AddToBracket({ onAdd }: { onAdd: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  function commit(keepOpen: boolean) {
    const v = draft.trim();
    if (v) onAdd(v);
    setDraft('');
    setOpen(keepOpen);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-[color:var(--color-border-paper-strong)] px-2 py-0.5 text-[11px] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)] transition-colors"
      >
        <Plus size={10} /> add
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={draft}
      placeholder="name it, Enter to keep adding"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(true); }
        if (e.key === 'Escape') { setDraft(''); setOpen(false); }
      }}
      className="w-[190px] rounded-full border-[0.5px] border-[color:var(--color-brass)] bg-[color:var(--color-paper-light)] px-2.5 py-0.5 text-[12px] text-[color:var(--color-on-paper)] outline-none"
    />
  );
}

/* ---------- Small shared bits ---------- */

function Mini({ children, title, onClick, disabled }: { children: ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button" title={title} onClick={onClick} disabled={disabled}
      className="p-1 rounded-[3px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-deep)] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[color:var(--color-on-paper-faint)] transition-colors"
    >
      {children}
    </button>
  );
}

/* Click-to-edit text: plain type until edit mode, then opens on click and
   saves on blur or Enter. */
function MapText({
  value, placeholder, onSave, className = '', style, multiline = false, editing = false,
}: {
  value: string; placeholder?: string; onSave: (v: string) => void;
  className?: string; style?: CSSProperties; multiline?: boolean; editing?: boolean;
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
      className={`${className} ${editing ? 'cursor-text hover:bg-[color:var(--color-paper-deep)] rounded-[2px]' : ''} ${empty ? 'italic opacity-40' : ''} ${multiline ? 'block' : ''}`}
      style={style}
    >
      {empty ? (placeholder ?? 'empty') : value}
    </span>
  );
}
