import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { AppState, FourKey, Thread, ViewKey } from '../../types';

/* Neuron · the film as a nervous system.
   Three ways to see the same graph:
   — Web:           live force simulation · the organic tangle
   — Orbits:        concentric rings around the thesis · the readable poster
   — Constellation: each of the Four as a night sky of what holds them
   Click any node → connections panel → jump straight to its view. */

type NodeType = 'four' | 'holder' | 'shoot' | 'thread' | 'swing' | 'idea';
type NeuronMode = 'web' | 'orbits' | 'constellation' | 'dashboard';

interface NNode {
  id: string;
  type: NodeType;
  label: string;
  color: string;
  size: number;
  subject?: FourKey;          // owner subject (holders, single-owner threads)
  x: number; y: number;
  vx: number; vy: number;
  fx?: number; fy?: number;   // drag pin
  ax?: number; ay?: number;   // soft anchor (the Four, web mode)
}

interface NLink {
  source: string;
  target: string;
  strength: number;
  dist: number;               // ideal spring length
}

const W = 1200;
const H = 800;
const CX = W / 2;
const CY = H / 2;

const TYPE_COLOR: Record<NodeType, string> = {
  four:   '#d96c3d',
  holder: '#6f8a72',
  shoot:  '#3d7a94',
  thread: '#4c6b93',
  swing:  '#b54f26',
  idea:   '#d9a93e',
};

const TYPE_SIZE: Record<NodeType, number> = {
  four: 19, holder: 6.5, shoot: 12, thread: 8.5, swing: 7.5, idea: 6,
};

const VIEW_FOR_TYPE: Record<NodeType, ViewKey> = {
  four: 'four', holder: 'surface', shoot: 'shoots',
  thread: 'threads', swing: 'swings', idea: 'spine',
};

const FILTERS: { type: NodeType; labelKey: StringKey }[] = [
  { type: 'four',   labelKey: 'neuron.filter.people' },
  { type: 'holder', labelKey: 'neuron.filter.holders' },
  { type: 'shoot',  labelKey: 'neuron.filter.shoots' },
  { type: 'thread', labelKey: 'neuron.filter.threads' },
  { type: 'swing',  labelKey: 'neuron.filter.swings' },
  { type: 'idea',   labelKey: 'neuron.filter.ideas' },
];

const MODES: { key: NeuronMode; labelKey: StringKey }[] = [
  { key: 'web',           labelKey: 'neuron.mode.web' },
  { key: 'orbits',        labelKey: 'neuron.mode.orbits' },
  { key: 'constellation', labelKey: 'neuron.mode.constellation' },
  { key: 'dashboard',     labelKey: 'neuron.mode.dashboard' },
];

/* The Four's home positions — a ring where every real relationship is an
   adjacency: petar—zsofia (partners), zsofia—sanda (best friends),
   sanda—vito (partners), vito—petar (mentor). */
const FOUR_ANGLE: Record<FourKey, number> = {
  petar: -Math.PI / 2,      // top
  zsofia: 0,                // right
  sanda: Math.PI / 2,       // bottom
  vito: Math.PI,            // left
};

const FOUR_ANCHOR: Record<FourKey, [number, number]> = {
  petar:  [CX - 240, CY - 190],
  zsofia: [CX + 240, CY - 190],
  vito:   [CX - 240, CY + 190],
  sanda:  [CX + 240, CY + 190],
};

/* ---------- graph construction (deterministic — no Math.random) ---------- */

function buildGraph(state: AppState): { nodes: NNode[]; links: NLink[] } {
  const nodes: NNode[] = [];
  const links: NLink[] = [];

  for (const f of state.four) {
    const [ax, ay] = FOUR_ANCHOR[f.key];
    nodes.push({
      id: `four:${f.key}`, type: 'four', label: f.name.split(' ')[0],
      color: f.colorHint ?? TYPE_COLOR.four, size: TYPE_SIZE.four,
      subject: f.key, x: ax, y: ay, vx: 0, vy: 0, ax, ay,
    });
  }

  const rel: [FourKey, FourKey, number, number][] = [
    ['petar', 'zsofia', 2.0, 300],
    ['vito', 'sanda', 2.0, 300],
    ['sanda', 'zsofia', 1.8, 320],
    ['vito', 'petar', 1.8, 320],
    ['petar', 'sanda', 0.6, 430],
    ['vito', 'zsofia', 0.6, 430],
  ];
  for (const [a, b, strength, dist] of rel) {
    links.push({ source: `four:${a}`, target: `four:${b}`, strength, dist });
  }

  /* Holders — deterministic fan around their subject */
  const holderCount: Record<string, number> = {};
  for (const h of state.holders) {
    const idx = (holderCount[h.subjectKey] = (holderCount[h.subjectKey] ?? 0) + 1);
    const [ax, ay] = FOUR_ANCHOR[h.subjectKey];
    const angle = FOUR_ANGLE[h.subjectKey] + idx * 0.8;
    nodes.push({
      id: `holder:${h.id}`, type: 'holder', label: h.name,
      color: h.colorHint ?? TYPE_COLOR.holder, size: TYPE_SIZE.holder,
      subject: h.subjectKey,
      x: ax + Math.cos(angle) * 90, y: ay + Math.sin(angle) * 90,
      vx: 0, vy: 0,
    });
    links.push({ source: `four:${h.subjectKey}`, target: `holder:${h.id}`, strength: 1.2, dist: 85 });
  }

  /* Shoots — start on an outer ring, linked to everyone present */
  state.shoots.forEach((sh, i) => {
    const a = -Math.PI / 2 + (i / Math.max(state.shoots.length, 1)) * Math.PI * 2;
    nodes.push({
      id: `shoot:${sh.id}`, type: 'shoot', label: sh.title.split('·')[0].trim(),
      color: sh.colorHint ?? TYPE_COLOR.shoot, size: TYPE_SIZE.shoot,
      x: CX + Math.cos(a) * 430, y: CY + Math.sin(a) * 300, vx: 0, vy: 0,
    });
    for (const pk of sh.presentFour) {
      links.push({ source: `shoot:${sh.id}`, target: `four:${pk}`, strength: 0.5, dist: 260 });
    }
  });

  /* Threads — linked to their owner(s) */
  state.threads.forEach((th, i) => {
    const a = -Math.PI / 2 + 0.31 + (i / Math.max(state.threads.length, 1)) * Math.PI * 2;
    const single = th.owner !== 'ensemble' && th.owner !== 'petar-vito' && th.owner !== 'sanda-zsofia';
    nodes.push({
      id: `thread:${th.id}`, type: 'thread', label: `${th.num} · ${th.title}`,
      color: TYPE_COLOR.thread, size: TYPE_SIZE.thread,
      subject: single ? (th.owner as FourKey) : undefined,
      x: CX + Math.cos(a) * 360, y: CY + Math.sin(a) * 260, vx: 0, vy: 0,
    });
    const owners: FourKey[] =
      th.owner === 'ensemble' ? ['petar', 'vito', 'sanda', 'zsofia']
      : th.owner === 'petar-vito' ? ['petar', 'vito']
      : th.owner === 'sanda-zsofia' ? ['sanda', 'zsofia']
      : [th.owner];
    const strength = owners.length > 2 ? 0.25 : owners.length === 2 ? 0.7 : 1.0;
    for (const o of owners) {
      links.push({ source: `thread:${th.id}`, target: `four:${o}`, strength, dist: owners.length > 2 ? 300 : 210 });
    }
  });

  /* Swings — orbit their shoot (or float) */
  state.swings.forEach((sw, i) => {
    const a = 0.5 + (i / Math.max(state.swings.length, 1)) * Math.PI * 2;
    nodes.push({
      id: `swing:${sw.id}`, type: 'swing', label: sw.title,
      color: TYPE_COLOR.swing, size: TYPE_SIZE.swing,
      x: CX + Math.cos(a) * 500, y: CY + Math.sin(a) * 330, vx: 0, vy: 0,
    });
    if (sw.shootId) {
      links.push({ source: `swing:${sw.id}`, target: `shoot:${sw.shootId}`, strength: 0.9, dist: 120 });
    }
  });

  /* Spine ideas — linked to threads where declared */
  state.spineIdeas.forEach((idea, i) => {
    const a = 1.1 + (i / Math.max(state.spineIdeas.length, 1)) * Math.PI * 2;
    nodes.push({
      id: `idea:${idea.id}`, type: 'idea', label: idea.title,
      color: TYPE_COLOR.idea, size: TYPE_SIZE.idea,
      x: CX + Math.cos(a) * 545, y: CY + Math.sin(a) * 355, vx: 0, vy: 0,
    });
    for (const tid of idea.linkedThreadIds ?? []) {
      links.push({ source: `idea:${idea.id}`, target: `thread:${tid}`, strength: 0.8, dist: 130 });
    }
  });

  return { nodes, links };
}

/* ---------- web-mode physics ---------- */

const REPULSE_K = 42000;      // F = K / d² — real spread (the old value was ~200× too weak)
const LINK_K = 0.055;
const CENTER_K = 0.0012;
const ANCHOR_K = 0.028;
const DAMP = 0.82;
const MAX_V = 7;

function tick(nodes: NNode[], links: NLink[], active: Set<NodeType>) {
  const live = nodes.filter((n) => active.has(n.type));

  /* pairwise repulsion + collision separation */
  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) { dx = (i % 2 ? 1 : -1) * 0.5; dy = 0.5; d2 = 0.5; }
      const d = Math.sqrt(d2);
      const f = REPULSE_K / Math.max(d2, 400);
      const fx = (dx / d) * f, fy = (dy / d) * f;
      if (a.fx === undefined) { a.vx -= fx; a.vy -= fy; }
      if (b.fx === undefined) { b.vx += fx; b.vy += fy; }
      /* hard de-overlap */
      const minD = a.size + b.size + 10;
      if (d < minD) {
        const push = (minD - d) * 0.5;
        const px = (dx / d) * push, py = (dy / d) * push;
        if (a.fx === undefined) { a.x -= px; a.y -= py; }
        if (b.fx === undefined) { b.x += px; b.y += py; }
      }
    }
  }

  /* link springs with per-link ideal length */
  const map = new Map(live.map((n) => [n.id, n]));
  for (const l of links) {
    const s = map.get(l.source), t = map.get(l.target);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const delta = (d - l.dist) * LINK_K * l.strength;
    const fx = (dx / d) * delta, fy = (dy / d) * delta;
    if (s.fx === undefined) { s.vx += fx; s.vy += fy; }
    if (t.fx === undefined) { t.vx -= fx; t.vy -= fy; }
  }

  /* gentle centering + anchor springs + integration */
  for (const n of live) {
    if (n.fx !== undefined && n.fy !== undefined) {
      n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0;
      continue;
    }
    n.vx += (CX - n.x) * CENTER_K;
    n.vy += (CY - n.y) * CENTER_K;
    if (n.ax !== undefined && n.ay !== undefined) {
      n.vx += (n.ax - n.x) * ANCHOR_K;
      n.vy += (n.ay - n.y) * ANCHOR_K;
    }
    n.vx = Math.max(-MAX_V, Math.min(MAX_V, n.vx * DAMP));
    n.vy = Math.max(-MAX_V, Math.min(MAX_V, n.vy * DAMP));
    n.x += n.vx; n.y += n.vy;
    /* keep inside frame */
    n.x = Math.max(30, Math.min(W - 30, n.x));
    n.y = Math.max(30, Math.min(H - 30, n.y));
  }
}

/* ---------- static layouts ---------- */

const YS = 0.78; // vertical squash so outer rings fit the 3:2 frame

function layoutOrbits(nodes: NNode[]): NNode[] {
  const out = nodes.map((n) => ({ ...n }));
  const byType = (t: NodeType) => out.filter((n) => n.type === t);

  for (const n of byType('four')) {
    const a = FOUR_ANGLE[n.subject as FourKey];
    n.x = CX + Math.cos(a) * 150;
    n.y = CY + Math.sin(a) * 150 * YS;
  }
  /* holders fan just outside their subject */
  const groups: Record<string, NNode[]> = {};
  for (const n of byType('holder')) (groups[n.subject ?? '?'] ??= []).push(n);
  for (const [subj, group] of Object.entries(groups)) {
    const base = FOUR_ANGLE[subj as FourKey];
    group.forEach((n, i) => {
      const spread = group.length > 1 ? -0.72 + (1.44 * i) / (group.length - 1) : 0;
      const a = base + spread;
      n.x = CX + Math.cos(a) * 232;
      n.y = CY + Math.sin(a) * 232 * YS;
    });
  }
  const ring = (arr: NNode[], r: number, offset: number) => {
    arr.forEach((n, i) => {
      const a = -Math.PI / 2 + offset + (i / Math.max(arr.length, 1)) * Math.PI * 2;
      n.x = CX + Math.cos(a) * r;
      n.y = CY + Math.sin(a) * r * YS;
    });
  };
  ring(byType('thread'), 330, 0.16);
  ring(byType('shoot'), 405, 0.42);
  ring([...byType('swing'), ...byType('idea')], 478, 0.05);
  return out;
}

function layoutConstellation(nodes: NNode[]): NNode[] {
  const out = nodes.map((n) => ({ ...n }));
  const Q: Record<FourKey, [number, number]> = {
    petar: [305, 205], zsofia: [895, 205], vito: [305, 600], sanda: [895, 600],
  };
  const holderIdx: Record<string, number> = {};
  for (const n of out) {
    if (n.type === 'four') {
      const [qx, qy] = Q[n.subject as FourKey];
      n.x = qx; n.y = qy;
    } else if (n.type === 'holder' && n.subject) {
      const i = (holderIdx[n.subject] = (holderIdx[n.subject] ?? 0) + 1) - 1;
      const [qx, qy] = Q[n.subject];
      const a = i * 2.39996; // golden angle — star scatter
      const r = 62 + 26 * Math.sqrt(i + 1);
      n.x = qx + Math.cos(a) * r;
      n.y = qy + Math.sin(a) * r * 0.62;
    } else if (n.type === 'thread') {
      /* single-owner threads over their subject; shared threads between */
      n.x = CX; n.y = CY;
    } else {
      n.x = -100; n.y = -100; // hidden in this mode
    }
  }
  /* threads: place by ownership */
  const threads = out.filter((n) => n.type === 'thread');
  const singles: Record<string, NNode[]> = {};
  const shared: NNode[] = [];
  for (const t of threads) {
    if (t.subject) (singles[t.subject] ??= []).push(t);
    else shared.push(t);
  }
  for (const [subj, group] of Object.entries(singles)) {
    const [qx, qy] = Q[subj as FourKey];
    const up = qy < CY ? -1 : 1;
    group.forEach((t, i) => {
      t.x = qx + (i - (group.length - 1) / 2) * 120;
      t.y = qy + up * 128;
    });
  }
  shared.forEach((t, i) => {
    t.x = CX + (i - (shared.length - 1) / 2) * 128;
    t.y = CY;
  });
  return out;
}

/* deterministic decorative star field for constellation mode */
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 379) % 1187) + 8,
  y: ((i * 523) % 779) + 10,
  r: 0.7 + ((i * 7) % 10) / 9,
}));

/* ---------- component ---------- */

export function NeuronView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const svgRef = useRef<SVGSVGElement>(null);

  const [mode, setMode] = useState<NeuronMode>('web');
  const [, setFrame] = useState(0);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(
    () => new Set<NodeType>(['four', 'holder', 'shoot', 'thread', 'swing', 'idea']),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const graph = useMemo(() => buildGraph(state), [state]);
  const simRef = useRef<{ nodes: NNode[]; links: NLink[] }>(graph);

  /* (re)start the simulation when inputs change */
  useEffect(() => {
    if (mode !== 'web') return;
    simRef.current = buildGraph(state);
    for (let i = 0; i < 300; i++) tick(simRef.current.nodes, simRef.current.links, activeTypes);
    setFrame((f) => f + 1);
    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      tick(simRef.current.nodes, simRef.current.links, activeTypes);
      setFrame((f) => (f + 1) % 1_000_000);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => { running = false; window.cancelAnimationFrame(raf); };
  }, [state, activeTypes, mode]);

  /* nodes to draw for the current mode */
  const staticNodes = useMemo(() => {
    if (mode === 'orbits') return layoutOrbits(graph.nodes);
    if (mode === 'constellation') return layoutConstellation(graph.nodes);
    return graph.nodes; // dashboard mode never renders the canvas; avoid a null draw list
  }, [graph, mode]);

  const drawNodes = mode === 'web' ? simRef.current.nodes : staticNodes!;
  const links = mode === 'web' ? simRef.current.links : graph.links;

  const modeTypes = useMemo(() => {
    /* constellation shows only people · holders · threads */
    if (mode === 'constellation') {
      return new Set<NodeType>([...activeTypes].filter((x) => x === 'four' || x === 'holder' || x === 'thread'));
    }
    return activeTypes;
  }, [activeTypes, mode]);

  const visible = drawNodes.filter((n) => modeTypes.has(n.type));
  const visibleIds = new Set(visible.map((n) => n.id));
  const nodeById = new Map(drawNodes.map((n) => [n.id, n]));
  const visibleLinks = links.filter((l) => visibleIds.has(l.source) && visibleIds.has(l.target));

  const neighbourIds = useMemo(() => {
    if (!selectedId) return null;
    const set = new Set<string>([selectedId]);
    for (const l of graph.links) {
      if (l.source === selectedId) set.add(l.target);
      if (l.target === selectedId) set.add(l.source);
    }
    return set;
  }, [selectedId, graph.links]);

  const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) ?? null : null;
  const selectedConnections = useMemo(() => {
    if (!selectedId) return [];
    const ids = new Set<string>();
    for (const l of graph.links) {
      if (l.source === selectedId) ids.add(l.target);
      if (l.target === selectedId) ids.add(l.source);
    }
    return graph.nodes.filter((n) => ids.has(n.id));
  }, [selectedId, graph]);

  function toggleType(type: NodeType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }

  function recenter() {
    setSelectedId(null);
    if (mode === 'web') {
      simRef.current = buildGraph(state);
      for (let i = 0; i < 300; i++) tick(simRef.current.nodes, simRef.current.links, activeTypes);
      setFrame((f) => f + 1);
    }
  }

  /* drag (web mode only) */
  function onPointerDown(e: React.PointerEvent<SVGCircleElement>, id: string) {
    e.stopPropagation();
    setSelectedId(id);
    if (mode !== 'web') return;
    setDragId(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragId || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const p = pt.matrixTransform(ctm.inverse());
    const n = simRef.current.nodes.find((x) => x.id === dragId);
    if (n) { n.fx = p.x; n.fy = p.y; }
  }
  function onPointerUp() {
    if (dragId) {
      const n = simRef.current.nodes.find((x) => x.id === dragId);
      if (n) { n.fx = undefined; n.fy = undefined; }
    }
    setDragId(null);
  }

  function labelVisible(n: NNode): boolean {
    if (n.id === selectedId || n.id === hoverId) return true;
    if (neighbourIds?.has(n.id)) return true;
    if (n.type === 'four') return true;
    if (mode !== 'constellation' && n.type === 'shoot') return true;
    if (mode === 'orbits' && n.type === 'thread') return true;
    if (mode === 'constellation' && (n.type === 'holder' || n.type === 'thread')) return true;
    return false;
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('neuron.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('neuron.subtitle')}</p>
      </header>

      {/* Mode toggle + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => { setMode(m.key); setSelectedId(null); }}
              className={`px-3 py-1.5 font-sans text-[11px] tracking-wide transition-colors ${
                mode === m.key
                  ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                  : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
              }`}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>
        {mode !== 'dashboard' && (
          <>
        <div className="w-px h-5 bg-[color:var(--color-border-paper)]" />
        {FILTERS.map((f) => {
          const active = activeTypes.has(f.type);
          const dimmed = mode === 'constellation' && !(f.type === 'four' || f.type === 'holder' || f.type === 'thread');
          return (
            <button
              key={f.type}
              type="button"
              onClick={() => toggleType(f.type)}
              className={`px-2.5 py-1 rounded-[3px] font-sans text-[11px] tracking-wide transition-all flex items-center gap-1.5 ${
                active
                  ? 'text-[color:var(--color-paper-light)]'
                  : 'text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)]'
              } ${dimmed ? 'opacity-35' : ''}`}
              style={active ? { background: TYPE_COLOR[f.type] } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[f.type] }} />
              {t(f.labelKey)}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={recenter}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"
        >
          <RotateCcw size={11} /> {t('neuron.reset')}
        </button>
          </>
        )}
      </div>

      {/* Canvas · or the editable dashboard */}
      {mode === 'dashboard' ? (
        <NeuronDashboard />
      ) : (
      <div
        className="bg-[color:var(--color-chrome-deep)] rounded-[3px] border-[0.5px] border-[color:var(--color-border-chrome)] overflow-hidden relative"
        style={{ aspectRatio: '3/2' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <radialGradient id="nn-bg" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#12386a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#041531" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#nn-bg)" pointerEvents="all" onClick={() => setSelectedId(null)} />

          {/* constellation star field */}
          {mode === 'constellation' &&
            STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgba(244,236,220,0.13)" />
            ))}

          {/* orbit ring guides */}
          {mode === 'orbits' && (
            <g>
              {[150, 232, 330, 405, 478].map((r) => (
                <ellipse
                  key={r}
                  cx={CX} cy={CY} rx={r} ry={r * YS}
                  fill="none"
                  stroke="rgba(244,236,220,0.06)"
                  strokeWidth={0.8}
                  strokeDasharray="3 5"
                />
              ))}
              <text
                x={CX} y={CY + 4}
                textAnchor="middle"
                fill="rgba(217,108,61,0.85)"
                fontSize="12.5"
                fontStyle="italic"
                fontFamily="Fraunces, serif"
              >
                one person holds another
              </text>
            </g>
          )}

          {/* links */}
          <g>
            {visibleLinks.map((l, i) => {
              const s = nodeById.get(l.source);
              const tt = nodeById.get(l.target);
              if (!s || !tt) return null;
              const dim = neighbourIds && !(neighbourIds.has(l.source) && neighbourIds.has(l.target));
              const opacity = dim ? 0.04 : mode === 'web' ? 0.42 : 0.28;
              if (mode === 'orbits') {
                const mx = (s.x + tt.x) / 2 + (CX - (s.x + tt.x) / 2) * 0.42;
                const my = (s.y + tt.y) / 2 + (CY - (s.y + tt.y) / 2) * 0.42;
                return (
                  <path
                    key={i}
                    d={`M ${s.x} ${s.y} Q ${mx} ${my} ${tt.x} ${tt.y}`}
                    fill="none"
                    stroke="rgba(217,108,61,0.5)"
                    strokeWidth={0.5 + l.strength * 0.4}
                    opacity={opacity}
                  />
                );
              }
              return (
                <line
                  key={i}
                  x1={s.x} y1={s.y} x2={tt.x} y2={tt.y}
                  stroke="rgba(217,108,61,0.5)"
                  strokeWidth={0.5 + l.strength * 0.55}
                  strokeDasharray={mode === 'constellation' ? '2 4' : undefined}
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* nodes */}
          <g>
            {visible.map((n) => {
              const dim = neighbourIds && !neighbourIds.has(n.id);
              const isSel = n.id === selectedId;
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`} opacity={dim ? 0.13 : 1} style={{ cursor: mode === 'web' ? 'grab' : 'pointer' }}>
                  <title>{n.label}</title>
                  {n.type === 'four' && (
                    <circle r={n.size + 7} fill="none" stroke={n.color} strokeOpacity={0.35} strokeWidth={1} />
                  )}
                  <circle
                    r={n.size + (isSel ? 3.5 : 0)}
                    fill={n.color}
                    stroke={isSel ? 'rgba(244,236,220,0.95)' : 'rgba(244,236,220,0.28)'}
                    strokeWidth={isSel ? 2 : 1}
                    onPointerDown={(e) => onPointerDown(e, n.id)}
                    onPointerEnter={() => setHoverId(n.id)}
                    onPointerLeave={() => setHoverId(null)}
                  />
                  {labelVisible(n) && (
                    <text
                      y={n.size + (n.type === 'four' ? 19 : 13)}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill={n.type === 'four' ? 'rgba(244,236,220,0.95)' : 'rgba(244,236,220,0.72)'}
                      fontSize={n.type === 'four' ? 15 : n.type === 'shoot' ? 10.5 : 9}
                      fontStyle={n.type === 'four' ? 'italic' : 'normal'}
                      fontFamily={n.type === 'four' ? 'Fraunces, serif' : 'Inter, sans-serif'}
                    >
                      {n.label.length > 26 ? `${n.label.slice(0, 24)}…` : n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* selected connections panel */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-[250px] max-h-[85%] overflow-y-auto bg-[color:var(--color-chrome)]/90 backdrop-blur-sm rounded-[3px] border-[0.5px] border-[color:var(--color-border-chrome-strong)] p-3">
            <div className="label-caps text-[9px] text-[color:var(--color-brass)] mb-0.5">{t('neuron.selected')}</div>
            <div className="display-italic text-[16px] text-[color:var(--color-paper-light)] leading-tight">{selectedNode.label}</div>
            <div className="prose-body italic text-[10px] text-[color:var(--color-paper-light)]/50 mt-0.5 mb-2">
              {selectedConnections.length} {t('neuron.connections')} · {selectedNode.type}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', view: VIEW_FOR_TYPE[selectedNode.type] })}
              className="w-full mb-2 flex items-center justify-center gap-1 py-1.5 rounded-[2px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[11px] hover:bg-[color:var(--color-brass-deep)] transition-colors"
            >
              {t('neuron.open')} <ArrowUpRight size={11} />
            </button>
            <ul className="space-y-1">
              {selectedConnections.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="w-full text-left flex items-center gap-2 px-1.5 py-1 rounded-[2px] hover:bg-[color:var(--color-chrome-elevated)] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[11px] text-[color:var(--color-paper-light)]/85 truncate">{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-[9px] tracking-[0.14em] uppercase text-[color:var(--color-paper-light)]/30 pointer-events-none">
          {t('neuron.hint')}
        </div>
      </div>
      )}
    </div>
  );
}

/* ---------- Dashboard · edit + add everything the graph is built from ----------
   The neuron is a picture of real entities. This is where you change them:
   edit any field, add new nodes, remove them — it all flows back into the map. */

function dashId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const THREAD_OWNERS = ['ensemble', 'petar', 'vito', 'sanda', 'zsofia', 'petar-vito', 'sanda-zsofia'] as const;
const FIELD = 'bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[12px]';

function NeuronDashboard() {
  const { state, dispatch } = useApp();

  function addHolder() {
    dispatch({ type: 'ADD_HOLDER', holder: { id: dashId('h'), subjectKey: 'petar', kind: 'person', name: 'New holder', relationship: '', oneLine: '', consent: 'pending' } });
  }
  function addThread() {
    const nextNum = (Math.max(0, ...state.threads.map((th) => th.num)) + 1) as Thread['num'];
    dispatch({ type: 'ADD_THREAD', thread: { id: dashId('t'), num: nextNum, title: 'New thread', subtitle: '', owner: 'ensemble', synopsis: '', status: 'active' } });
  }
  function addSwing() {
    dispatch({ type: 'ADD_SWING', swing: { id: dashId('sw'), title: 'New swing', description: '', status: 'planned' } });
  }
  function addIdea() {
    const now = new Date().toISOString();
    dispatch({ type: 'ADD_SPINE_IDEA', idea: { id: dashId('sp'), title: 'New idea', body: '', status: 'idea', createdAt: now, updatedAt: now } });
  }

  return (
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5 space-y-7 max-h-[74vh] overflow-y-auto">
      <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">
        Everything the map is built from — edit any field, add new nodes, or remove them. Every change flows straight back into the graph.
      </p>

      <DashSection title="The Four" count={state.four.length}>
        {state.four.map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.colorHint ?? '#d96c3d' }} />
            <input className={`${FIELD} w-[150px]`} defaultValue={f.name} onBlur={(e) => dispatch({ type: 'UPDATE_FOUR', key: f.key, patch: { name: e.target.value } })} />
            <input className={`${FIELD} flex-1`} defaultValue={f.role} onBlur={(e) => dispatch({ type: 'UPDATE_FOUR', key: f.key, patch: { role: e.target.value } })} />
          </div>
        ))}
      </DashSection>

      <DashSection title="Surface · who holds them" count={state.holders.length} onAdd={addHolder}>
        {state.holders.map((h) => (
          <div key={h.id} className="flex items-center gap-2">
            <input className={`${FIELD} w-[150px]`} defaultValue={h.name} onBlur={(e) => dispatch({ type: 'UPDATE_HOLDER', id: h.id, patch: { name: e.target.value } })} />
            <select className={FIELD} value={h.subjectKey} onChange={(e) => dispatch({ type: 'UPDATE_HOLDER', id: h.id, patch: { subjectKey: e.target.value as FourKey } })}>
              {state.four.map((f) => <option key={f.key} value={f.key}>{f.name.split(' ')[0]}</option>)}
            </select>
            <input className={`${FIELD} flex-1`} defaultValue={h.relationship} placeholder="relationship" onBlur={(e) => dispatch({ type: 'UPDATE_HOLDER', id: h.id, patch: { relationship: e.target.value } })} />
            <DelButton onClick={() => dispatch({ type: 'DELETE_HOLDER', id: h.id })} />
          </div>
        ))}
      </DashSection>

      <DashSection title="Threads" count={state.threads.length} onAdd={addThread}>
        {[...state.threads].sort((a, b) => a.num - b.num).map((th) => (
          <div key={th.id} className="flex items-center gap-2">
            <span className="tabular-nums text-[10px] text-[color:var(--color-brass-deep)] w-6 shrink-0">{String(th.num).padStart(2, '0')}</span>
            <input className={`${FIELD} flex-1`} defaultValue={th.title} onBlur={(e) => dispatch({ type: 'UPDATE_THREAD', id: th.id, patch: { title: e.target.value } })} />
            <select className={FIELD} value={th.owner} onChange={(e) => dispatch({ type: 'UPDATE_THREAD', id: th.id, patch: { owner: e.target.value as Thread['owner'] } })}>
              {THREAD_OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <DelButton onClick={() => dispatch({ type: 'DELETE_THREAD', id: th.id })} />
          </div>
        ))}
      </DashSection>

      <DashSection title="Shoots" count={state.shoots.length}>
        {state.shoots.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.colorHint ?? '#3d7a94' }} />
            <input className={`${FIELD} flex-1`} defaultValue={s.title} onBlur={(e) => dispatch({ type: 'UPDATE_SHOOT', id: s.id, patch: { title: e.target.value } })} />
            <span className="label-caps text-[8px] text-[color:var(--color-on-paper-faint)] w-16 text-right">{s.status}</span>
            <DelButton onClick={() => dispatch({ type: 'DELETE_SHOOT', id: s.id })} />
          </div>
        ))}
      </DashSection>

      <DashSection title="Bigger Swings" count={state.swings.length} onAdd={addSwing}>
        {state.swings.map((sw) => (
          <div key={sw.id} className="flex items-center gap-2">
            <input className={`${FIELD} flex-1`} defaultValue={sw.title} onBlur={(e) => dispatch({ type: 'UPDATE_SWING', id: sw.id, patch: { title: e.target.value } })} />
            <DelButton onClick={() => dispatch({ type: 'DELETE_SWING', id: sw.id })} />
          </div>
        ))}
      </DashSection>

      <DashSection title="Spine · Ideas" count={state.spineIdeas.length} onAdd={addIdea}>
        {state.spineIdeas.map((idea) => (
          <div key={idea.id} className="flex items-center gap-2">
            <input className={`${FIELD} flex-1`} defaultValue={idea.title} onBlur={(e) => dispatch({ type: 'UPDATE_SPINE_IDEA', id: idea.id, patch: { title: e.target.value } })} />
            <DelButton onClick={() => dispatch({ type: 'DELETE_SPINE_IDEA', id: idea.id })} />
          </div>
        ))}
      </DashSection>
    </div>
  );
}

function DashSection({ title, count, onAdd, children }: { title: string; count: number; onAdd?: () => void; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <h3 className="label-caps text-[color:var(--color-brass)]">{title}</h3>
        <span className="tabular-nums text-[10px] text-[color:var(--color-on-paper-faint)]">{count}</span>
        <div className="flex-1 h-px bg-[color:var(--color-border-paper)]" />
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[10px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
          >
            <Plus size={10} /> add
          </button>
        )}
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function DelButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] shrink-0">
      <Trash2 size={12} />
    </button>
  );
}
