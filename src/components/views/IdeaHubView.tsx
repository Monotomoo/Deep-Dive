import { useMemo, useState } from 'react';
import { LayoutGrid, Link2, Plus, Sparkles, ThumbsUp, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import { ConnectionDrawer } from '../ConnectionDrawer';
import { VIEW_FOR_ENTITY, type EntityRef, type EntityType } from '../../lib/connections';
import type {
  AppState, HubIdea, HubIdeaStatus, IdeaKind, IdeaLink, IdeaLinkType,
} from '../../types';

type HubMode = 'board' | 'map';

/* Idea Hub · the team's open inbox.
   Anyone drops an idea and wires it to anything in the film — a person,
   an event, a topic, a shoot, a thread, a swing, an interview.
   Quick-add for speed; the editor for the full wiring. */

const KINDS: IdeaKind[] = ['scene', 'shot', 'question', 'sound', 'story', 'logistics', 'wild'];
const STATUSES: HubIdeaStatus[] = ['new', 'warm', 'hot', 'adopted', 'parked'];
const LINK_TYPES: IdeaLinkType[] = ['four', 'talent', 'event', 'topic', 'shoot', 'thread', 'swing', 'interview'];

const KIND_COLOR: Record<IdeaKind, string> = {
  scene: '#d96c3d', shot: '#3d7a94', question: '#c9a961', sound: '#6f8a72',
  story: '#4c6b93', logistics: '#8a8375', wild: '#b54f26',
};

const STATUS_COLOR: Record<HubIdeaStatus, string> = {
  new: '#4c6b93', warm: '#d9a93e', hot: '#d96c3d', adopted: '#6f8a72', parked: '#8a8375',
};

const STATUS_CYCLE: Record<HubIdeaStatus, HubIdeaStatus> = {
  new: 'warm', warm: 'hot', hot: 'adopted', adopted: 'parked', parked: 'new',
};

function makeId() {
  return `hub-${Math.random().toString(36).slice(2, 9)}`;
}

/* Resolve a link to a display label + color from live state. */
export function resolveLink(state: AppState, link: IdeaLink): { label: string; color: string } {
  switch (link.targetType) {
    case 'four': {
      const f = state.four.find((x) => x.key === link.targetId);
      return { label: f?.name.split(' ')[0] ?? link.targetId, color: f?.colorHint ?? '#d96c3d' };
    }
    case 'talent': {
      const t = state.talents.find((x) => x.id === link.targetId);
      return { label: t?.name ?? link.targetId, color: t?.colorHint ?? '#6f8a72' };
    }
    case 'event': {
      const e = state.storyEvents.find((x) => x.id === link.targetId);
      return { label: e?.title ?? link.targetId, color: '#b54f26' };
    }
    case 'topic': {
      const t = state.topics.find((x) => x.id === link.targetId);
      return { label: t?.title ?? link.targetId, color: t?.colorHint ?? '#c9a961' };
    }
    case 'shoot': {
      const s = state.shoots.find((x) => x.id === link.targetId);
      return { label: s?.title.split('·')[0].trim() ?? link.targetId, color: s?.colorHint ?? '#3d7a94' };
    }
    case 'thread': {
      const t = state.threads.find((x) => x.id === link.targetId);
      return { label: t ? `${t.num} · ${t.title}` : link.targetId, color: '#4c6b93' };
    }
    case 'swing': {
      const s = state.swings.find((x) => x.id === link.targetId);
      return { label: s?.title ?? link.targetId, color: '#b54f26' };
    }
    case 'interview': {
      const iv = state.interviews.find((x) => x.id === link.targetId);
      if (!iv) return { label: link.targetId, color: '#8a8375' };
      const shoot = state.shoots.find((s) => s.id === iv.shootId);
      return { label: `${iv.personKey} @ ${shoot?.title.split('·')[0].trim() ?? '?'}`, color: '#8a8375' };
    }
  }
}

/* Options for the link builder, per type. */
function linkOptions(state: AppState, type: IdeaLinkType): { id: string; label: string }[] {
  switch (type) {
    case 'four':      return state.four.map((f) => ({ id: f.key, label: f.name }));
    case 'talent':    return state.talents.map((t) => ({ id: t.id, label: t.name }));
    case 'event':     return state.storyEvents.map((e) => ({ id: e.id, label: `${e.year} · ${e.title}` }));
    case 'topic':     return state.topics.map((t) => ({ id: t.id, label: t.title }));
    case 'shoot':     return state.shoots.map((s) => ({ id: s.id, label: s.title }));
    case 'thread':    return state.threads.map((t) => ({ id: t.id, label: `${t.num} · ${t.title}` }));
    case 'swing':     return state.swings.map((s) => ({ id: s.id, label: s.title }));
    case 'interview': return state.interviews.map((iv) => {
      const shoot = state.shoots.find((s) => s.id === iv.shootId);
      return { id: iv.id, label: `${iv.personKey} · ${shoot?.title.split('·')[0].trim() ?? '?'} · ${iv.date}` };
    });
  }
}

export function IdeaHubView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [quickTitle, setQuickTitle] = useState('');
  const [kindFilter, setKindFilter] = useState<IdeaKind | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HubIdeaStatus | 'all'>('all');
  const [editing, setEditing] = useState<HubIdea | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [mode, setMode] = useState<HubMode>('board');
  const [focusRef, setFocusRef] = useState<EntityRef | null>(null);

  function handleDrawerEdit(ref: EntityRef) {
    if (ref.type === 'idea') {
      const idea = state.hubIdeas.find((x) => x.id === ref.id);
      if (idea) { setFocusRef(null); setIsNew(false); setEditing(idea); }
    } else {
      dispatch({ type: 'SET_VIEW', view: VIEW_FOR_ENTITY[ref.type] });
      setFocusRef(null);
    }
  }

  const ideas = useMemo(() => {
    return state.hubIdeas
      .filter((i) => (kindFilter === 'all' || i.kind === kindFilter) && (statusFilter === 'all' || i.status === statusFilter))
      .slice()
      .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  }, [state.hubIdeas, kindFilter, statusFilter]);

  function quickAdd() {
    const title = quickTitle.trim();
    if (!title) return;
    dispatch({
      type: 'ADD_HUB_IDEA',
      idea: {
        id: makeId(), title, kind: 'wild', status: 'new', authorId: 'c-tomo',
        links: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      },
    });
    setQuickTitle('');
  }

  function startNew() {
    setIsNew(true);
    setEditing({
      id: makeId(), title: '', body: '', kind: 'scene', status: 'new', authorId: 'c-tomo',
      links: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }

  function save(idea: HubIdea) {
    const patched = { ...idea, updatedAt: new Date().toISOString() };
    if (state.hubIdeas.some((x) => x.id === idea.id)) {
      dispatch({ type: 'UPDATE_HUB_IDEA', id: idea.id, patch: patched });
    } else {
      dispatch({ type: 'ADD_HUB_IDEA', idea: patched });
    }
    setEditing(null);
    setIsNew(false);
  }

  return (
    <div className="space-y-6 max-w-[1300px]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('idea-hub.title')}</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('idea-hub.subtitle')}</p>
        </div>
        <div className="flex rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden shrink-0 mt-1">
          {([['board', LayoutGrid, 'Board'], ['map', Sparkles, 'Map']] as const).map(([m, Icon, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-sans text-[11px] tracking-wide transition-colors ${
                mode === m ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]' : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </header>

      {/* Quick add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') quickAdd(); }}
          placeholder={t('idea-hub.quickAdd')}
          className="flex-1 bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-2 text-[14px] italic"
        />
        <button
          type="button"
          onClick={quickAdd}
          disabled={!quickTitle.trim()}
          className="px-3 py-2 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={startNew}
          className="px-3 py-2 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[12px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
        >
          {t('idea-hub.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setKindFilter('all')}
          className={`px-2 py-0.5 rounded-[3px] text-[10px] border-[0.5px] border-[color:var(--color-border-paper)] ${kindFilter === 'all' ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)]'}`}
        >
          {t('common.all')}
        </button>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKindFilter(kindFilter === k ? 'all' : k)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[10px] border-[0.5px] border-[color:var(--color-border-paper)] transition-all ${kindFilter === k ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)]'}`}
            style={kindFilter === k ? { background: KIND_COLOR[k] } : {}}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {t(`idea-hub.kind.${k}` as StringKey)}
          </button>
        ))}
        <div className="w-px h-4 bg-[color:var(--color-border-paper)] mx-1" />
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`px-2 py-0.5 rounded-[3px] text-[10px] border-[0.5px] border-[color:var(--color-border-paper)] transition-all ${statusFilter === s ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)]'}`}
            style={statusFilter === s ? { background: STATUS_COLOR[s] } : {}}
          >
            {t(`idea-hub.status.${s}` as StringKey)}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-[color:var(--color-on-paper-faint)] tabular-nums">{ideas.length} / {state.hubIdeas.length}</span>
      </div>

      {/* Idea cards / map */}
      {mode === 'map' ? (
        <IdeaMap ideas={ideas} onFocus={(id) => setFocusRef({ type: 'idea', id })} />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {ideas.map((idea) => {
          const author = state.crew.find((c) => c.id === idea.authorId);
          return (
            <article
              key={idea.id}
              className="group bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
              style={{ borderTopWidth: 3, borderTopColor: KIND_COLOR[idea.kind] }}
              onClick={() => setFocusRef({ type: 'idea', id: idea.id })}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="display-italic text-[17px] text-[color:var(--color-on-paper)] leading-tight">{idea.title}</div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_HUB_IDEA', id: idea.id }); }}
                  className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {idea.body && (
                <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mb-2">{idea.body}</p>
              )}
              {idea.links.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {idea.links.map((l, i) => {
                    const r = resolveLink(state, l);
                    return (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9px] max-w-[170px] truncate"
                        style={{ background: `color-mix(in oklab, ${r.color} 14%, transparent)`, color: r.color }}
                        title={`${l.targetType}: ${r.label}`}
                      >
                        <Link2 size={8} className="shrink-0" /> {r.label}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] border-t-[0.5px] border-[color:var(--color-border-paper)]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'UPDATE_HUB_IDEA', id: idea.id, patch: { status: STATUS_CYCLE[idea.status] } });
                  }}
                  className="uppercase font-sans tracking-wide px-1.5 py-0.5 rounded-[2px]"
                  style={{ background: `color-mix(in oklab, ${STATUS_COLOR[idea.status]} 16%, transparent)`, color: STATUS_COLOR[idea.status] }}
                  title={t('idea-hub.cycleStatus')}
                >
                  {t(`idea-hub.status.${idea.status}` as StringKey)}
                </button>
                <span className="uppercase font-sans tracking-wide" style={{ color: KIND_COLOR[idea.kind] }}>
                  {t(`idea-hub.kind.${idea.kind}` as StringKey)}
                </span>
                <div className="flex-1" />
                <span className="italic text-[color:var(--color-on-paper-faint)]">{author?.name.split(' ')[0] ?? '—'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'UPDATE_HUB_IDEA', id: idea.id, patch: { votes: (idea.votes ?? 0) + 1 } });
                  }}
                  className="flex items-center gap-1 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"
                >
                  <ThumbsUp size={10} /> {idea.votes ?? 0}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      )}

      <ConnectionDrawer focus={focusRef} onClose={() => setFocusRef(null)} onEdit={handleDrawerEdit} />

      {editing && (
        <IdeaEditor
          idea={editing}
          isNew={isNew}
          onSave={save}
          onCancel={() => { setEditing(null); setIsNew(false); }}
        />
      )}
    </div>
  );
}

/* ---------- Idea Map · the innovative dashboard ----------
   Every linked entity becomes an anchor on the ring; every idea floats at
   the centroid of what it connects to, coloured by status, sized by votes.
   Loose ideas (no links) drift in an "unwired" cluster. Click → drawer. */

const ANCHOR_COLOR: Record<string, string> = {
  four: '#d96c3d', talent: '#6f8a72', event: '#b54f26', topic: '#c9a961',
  shoot: '#3d7a94', thread: '#4c6b93', interview: '#3d7a94', swing: '#b54f26',
};

function IdeaMap({ ideas, onFocus }: { ideas: HubIdea[]; onFocus: (id: string) => void }) {
  const { state } = useApp();
  const [hover, setHover] = useState<string | null>(null);

  const W = 1000, H = 620, CX = 500, CY = 300;

  const { anchors, nodes, links } = useMemo(() => {
    /* collect distinct anchors from all links (skip swing — not a node here) */
    const anchorKeys: string[] = [];
    const seen = new Set<string>();
    for (const idea of ideas) {
      for (const l of idea.links) {
        if (l.targetType === 'swing') continue;
        const key = `${l.targetType}:${l.targetId}`;
        if (!seen.has(key)) { seen.add(key); anchorKeys.push(key); }
      }
    }
    const anchorPos = new Map<string, { x: number; y: number; label: string; color: string; type: string; id: string }>();
    anchorKeys.forEach((key, i) => {
      const [type, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
      const a = (2 * Math.PI * i) / Math.max(anchorKeys.length, 1) - Math.PI / 2;
      const label = anchorLabel(state, type as EntityType, id);
      anchorPos.set(key, {
        x: CX + Math.cos(a) * 400, y: CY + Math.sin(a) * 250,
        label, color: ANCHOR_COLOR[type] ?? '#8a8375', type, id,
      });
    });

    const nodes = ideas.map((idea, i) => {
      const keys = idea.links.filter((l) => l.targetType !== 'swing').map((l) => `${l.targetType}:${l.targetId}`).filter((k) => anchorPos.has(k));
      let x = CX, y = CY;
      if (keys.length) {
        x = keys.reduce((s, k) => s + anchorPos.get(k)!.x, 0) / keys.length;
        y = keys.reduce((s, k) => s + anchorPos.get(k)!.y, 0) / keys.length;
      } else {
        /* unwired cluster, bottom-left drift */
        const a = i * 2.399;
        x = 150 + Math.cos(a) * 60;
        y = H - 110 + Math.sin(a) * 46;
      }
      /* golden-angle jitter to de-cluster shared centroids */
      const j = i * 2.399;
      x += Math.cos(j) * 22; y += Math.sin(j) * 22;
      return { idea, x, y, keys };
    });

    const links: { x1: number; y1: number; x2: number; y2: number; ideaId: string }[] = [];
    for (const n of nodes) {
      for (const k of n.keys) {
        const a = anchorPos.get(k)!;
        links.push({ x1: n.x, y1: n.y, x2: a.x, y2: a.y, ideaId: n.idea.id });
      }
    }
    return { anchors: [...anchorPos.values()], nodes, links };
  }, [ideas, state]);

  return (
    <div className="bg-[color:var(--color-chrome-deep)] rounded-[3px] border-[0.5px] border-[color:var(--color-border-chrome)] overflow-hidden" style={{ aspectRatio: '1000/620' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <defs>
          <radialGradient id="ih-bg" cx="50%" cy="48%" r="60%">
            <stop offset="0%" stopColor="#12386a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#041531" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="url(#ih-bg)" />

        {/* links */}
        {links.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(217,108,61,0.4)"
            strokeWidth={hover === l.ideaId ? 1.6 : 0.6}
            opacity={hover && hover !== l.ideaId ? 0.06 : 0.5} />
        ))}

        {/* anchors */}
        {anchors.map((a) => (
          <g key={`${a.type}:${a.id}`} transform={`translate(${a.x},${a.y})`}>
            <circle r={5} fill={a.color} stroke="rgba(244,236,220,0.35)" strokeWidth={1} />
            <text
              x={a.x > CX ? 9 : -9} y={3}
              textAnchor={a.x > CX ? 'start' : 'end'}
              fontSize={9.5} fontFamily="Inter, sans-serif" fill="rgba(244,236,220,0.7)"
            >
              {a.label.length > 20 ? `${a.label.slice(0, 18)}…` : a.label}
            </text>
          </g>
        ))}

        {/* idea nodes */}
        {nodes.map((n) => {
          const r = 5 + Math.min((n.idea.votes ?? 0) * 1.6, 10);
          const color = STATUS_COLOR[n.idea.status];
          const dim = hover && hover !== n.idea.id;
          return (
            <g key={n.idea.id} transform={`translate(${n.x},${n.y})`} opacity={dim ? 0.25 : 1} style={{ cursor: 'pointer' }}
               onMouseEnter={() => setHover(n.idea.id)} onMouseLeave={() => setHover(null)}
               onClick={() => onFocus(n.idea.id)}>
              <circle r={r} fill={color} stroke="rgba(244,236,220,0.85)" strokeWidth={1.2} />
              {(hover === n.idea.id) && (
                <text y={-r - 6} textAnchor="middle" fontSize={11} fontStyle="italic" fontFamily="Fraunces, serif" fill="rgba(244,236,220,0.96)">
                  {n.idea.title.length > 34 ? `${n.idea.title.slice(0, 32)}…` : n.idea.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function anchorLabel(state: AppState, type: EntityType, id: string): string {
  switch (type) {
    case 'four':   return state.four.find((f) => f.key === id)?.name.split(' ')[0] ?? id;
    case 'talent': return state.talents.find((t) => t.id === id)?.name ?? id;
    case 'event':  return state.storyEvents.find((e) => e.id === id)?.title ?? id;
    case 'topic':  return state.topics.find((t) => t.id === id)?.title ?? id;
    case 'shoot':  return state.shoots.find((s) => s.id === id)?.title.split('·')[0].trim() ?? id;
    case 'thread': { const th = state.threads.find((t) => t.id === id); return th ? `${th.num} · ${th.title}` : id; }
    default:       return id;
  }
}

function IdeaEditor({
  idea, isNew, onSave, onCancel,
}: {
  idea: HubIdea;
  isNew: boolean;
  onSave: (i: HubIdea) => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [i, setI] = useState<HubIdea>(idea);
  const [linkType, setLinkType] = useState<IdeaLinkType>('four');
  const [linkTarget, setLinkTarget] = useState<string>('');

  const options = linkOptions(state, linkType);

  function addLink() {
    if (!linkTarget) return;
    if (i.links.some((l) => l.targetType === linkType && l.targetId === linkTarget)) return;
    setI({ ...i, links: [...i.links, { targetType: linkType, targetId: linkTarget }] });
    setLinkTarget('');
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[600px] w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `3px solid ${KIND_COLOR[i.kind]}` }}
      >
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{isNew ? t('idea-hub.add') : t('common.edit')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('idea-hub.field.title')}</div>
          <input
            type="text" value={i.title} autoFocus
            onChange={(e) => setI({ ...i, title: e.target.value })}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[14px]"
          />
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('idea-hub.field.body')}</div>
          <textarea
            value={i.body ?? ''} rows={3}
            onChange={(e) => setI({ ...i, body: e.target.value })}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('idea-hub.field.kind')}</div>
            <select
              value={i.kind}
              onChange={(e) => setI({ ...i, kind: e.target.value as IdeaKind })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {KINDS.map((k) => <option key={k} value={k}>{t(`idea-hub.kind.${k}` as StringKey)}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('common.status')}</div>
            <select
              value={i.status}
              onChange={(e) => setI({ ...i, status: e.target.value as HubIdeaStatus })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{t(`idea-hub.status.${s}` as StringKey)}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('idea-hub.field.author')}</div>
            <select
              value={i.authorId ?? ''}
              onChange={(e) => setI({ ...i, authorId: e.target.value || undefined })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              <option value="">—</option>
              {state.crew.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        {/* Links */}
        <div>
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1.5">{t('idea-hub.field.links')}</div>
          {i.links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {i.links.map((l, idx) => {
                const r = resolveLink(state, l);
                return (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 rounded-[2px] text-[11px]"
                    style={{ background: `color-mix(in oklab, ${r.color} 14%, transparent)`, color: r.color }}
                  >
                    <span className="uppercase text-[8px] opacity-70">{l.targetType}</span> {r.label}
                    <button
                      type="button"
                      onClick={() => setI({ ...i, links: i.links.filter((_, x) => x !== idx) })}
                      className="ml-1 opacity-70 hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <select
              value={linkType}
              onChange={(e) => { setLinkType(e.target.value as IdeaLinkType); setLinkTarget(''); }}
              className="bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[12px]"
            >
              {LINK_TYPES.map((lt) => <option key={lt} value={lt}>{t(`idea-hub.link.${lt}` as StringKey)}</option>)}
            </select>
            <select
              value={linkTarget}
              onChange={(e) => setLinkTarget(e.target.value)}
              className="flex-1 bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[12px]"
            >
              <option value="">…</option>
              {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <button
              type="button"
              onClick={addLink}
              disabled={!linkTarget}
              className="px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
          <button
            type="button"
            onClick={() => onSave(i)}
            disabled={!i.title.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
