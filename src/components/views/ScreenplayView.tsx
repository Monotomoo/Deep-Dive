import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronDown, ChevronUp, Film, MessageSquare, Mic, Plus, Quote, Sparkles, Trash2, Users, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { FourKey, ScenarioArc, ScenarioPart, ScenarioPartStatus, ViewKey } from '../../types';

/* The Scenario — the film's screenplay.

   The FOUR CONNECTED STORIES lead: they are the highlight and the spine, and
   every part declares which of them it advances (click a story to see only its
   parts). Below them, the parts — what happened, who appeared, what they talked
   about — all editable in place, including the links themselves: in edit mode
   every chip row becomes a picker, so stories, people, topics, threads and
   interviews can be attached and detached without touching code. */

const STATUS_META: Record<ScenarioPartStatus, { label: string; color: string }> = {
  shot: { label: 'shot', color: 'var(--color-success)' },
  upcoming: { label: 'to come', color: 'var(--color-brass)' },
  idea: { label: 'idea', color: 'var(--color-steel-light)' },
};

const NEXT_STATUS: Record<ScenarioPartStatus, ScenarioPartStatus> = {
  shot: 'upcoming', upcoming: 'idea', idea: 'shot',
};

export function ScreenplayView() {
  const { state, dispatch } = useApp();
  const [arcFilter, setArcFilter] = useState<string | null>(null);
  const arcs = useMemo(() => [...state.scenarioArcs].sort((a, b) => a.num - b.num), [state.scenarioArcs]);
  const parts = useMemo(() => {
    const sorted = [...state.scenarioParts].sort((a, b) => a.order - b.order);
    return arcFilter ? sorted.filter((p) => p.arcIds?.includes(arcFilter)) : sorted;
  }, [state.scenarioParts, arcFilter]);

  const filterArc = arcFilter ? arcs.find((a) => a.id === arcFilter) : null;

  function addPart() {
    const maxOrder = state.scenarioParts.reduce((m, p) => Math.max(m, p.order), 0);
    dispatch({
      type: 'ADD_SCENARIO_PART',
      part: {
        id: `sp-${Date.now().toString(36)}`, order: maxOrder + 1,
        title: 'New part', location: '', dateLabel: 'TBD', status: 'idea',
        background: '', whatHappened: '', arcIds: arcFilter ? [arcFilter] : [],
        peopleKeys: [], topicIds: [], threadIds: [],
        interviewIds: [], beats: [], colorHint: 'var(--color-brass)',
      },
    });
  }

  function addArc() {
    const maxNum = state.scenarioArcs.reduce((m, a) => Math.max(m, a.num), 0);
    dispatch({
      type: 'ADD_SCENARIO_ARC',
      arc: {
        id: `arc-${Date.now().toString(36)}`, num: maxNum + 1,
        title: 'New story', synopsis: '', personKeys: [], colorHint: 'var(--color-brass)',
      },
    });
  }

  return (
    <div className="max-w-[940px] space-y-7">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The Scenario</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
          four connected stories, told across the parts · click a story to follow only it · everything edits in place
        </p>
      </header>

      {/* ---- The four stories · the spine ---- */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">the connected stories</h3>
          <button
            type="button"
            onClick={addArc}
            className="text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] inline-flex items-center gap-1 transition-colors"
          >
            <Plus size={11} /> add a story
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {arcs.map((arc) => (
            <ArcCard
              key={arc.id}
              arc={arc}
              active={arcFilter === arc.id}
              partCount={state.scenarioParts.filter((p) => p.arcIds?.includes(arc.id)).length}
              onSelect={() => setArcFilter(arcFilter === arc.id ? null : arc.id)}
            />
          ))}
        </div>
        {filterArc && (
          <button
            type="button"
            onClick={() => setArcFilter(null)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)] transition-colors"
          >
            <X size={12} /> following “{filterArc.title}” · show all parts
          </button>
        )}
      </section>

      {/* ---- The parts ---- */}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[color:var(--color-border-paper-strong)]" aria-hidden />
        <div className="space-y-4">
          {parts.map((p, i) => (
            <PartCard key={p.id} part={p} isFirst={i === 0} isLast={i === parts.length - 1} onArcClick={(id) => setArcFilter(arcFilter === id ? null : id)} />
          ))}
          {parts.length === 0 && (
            <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)] pl-6 py-4">
              No part advances this story yet — open a part's edit mode and attach it.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={addPart}
        className="ml-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper-strong)] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] transition-colors"
      >
        <Plus size={13} /> add a part
      </button>
    </div>
  );
}

/* ---------- The story cards ---------- */

function ArcCard({ arc, active, partCount, onSelect }: { arc: ScenarioArc; active: boolean; partCount: number; onSelect: () => void }) {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const accent = arc.colorHint ?? 'var(--color-brass)';

  function patch(p: Partial<ScenarioArc>) {
    dispatch({ type: 'UPDATE_SCENARIO_ARC', id: arc.id, patch: p });
  }

  return (
    <article
      className={`relative rounded-[4px] border-[0.5px] p-4 transition-colors cursor-pointer ${
        active
          ? 'bg-[color:var(--color-chrome)] border-[color:var(--color-brass)]'
          : 'bg-[color:var(--color-paper-card)] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'
      }`}
      style={{ borderTop: `3px solid ${accent}` }}
      onClick={editing ? undefined : onSelect}
    >
      <div className="flex items-start gap-3">
        <span className={`display-italic text-[30px] leading-none ${active ? 'text-[color:var(--color-brass)]' : ''}`} style={active ? undefined : { color: accent }}>
          {arc.num}
        </span>
        <div className="min-w-0 flex-1">
          <EditableText
            value={arc.title} placeholder="story title…" editing={editing}
            onSave={(v) => patch({ title: v })}
            className={`display-italic text-[17px] leading-snug block ${active ? 'text-[color:var(--color-on-chrome)]' : 'text-[color:var(--color-on-paper)]'}`}
          />
          <EditableText
            multiline value={arc.synopsis} placeholder="what this story is…" editing={editing}
            onSave={(v) => patch({ synopsis: v })}
            className={`prose-body italic text-[12px] leading-snug mt-1 block ${active ? 'text-[color:var(--color-on-chrome-muted)]' : 'text-[color:var(--color-on-paper-muted)]'}`}
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {state.four.map((f) => {
              const on = arc.personKeys.includes(f.key);
              if (!editing && !on) return null;
              return (
                <button
                  key={f.key}
                  type="button"
                  title={f.name}
                  disabled={!editing}
                  onClick={(e) => {
                    e.stopPropagation();
                    patch({ personKeys: on ? arc.personKeys.filter((k) => k !== f.key) : [...arc.personKeys, f.key] });
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-opacity ${on ? '' : 'opacity-25'}`}
                  style={{ background: f.colorHint ?? accent }}
                />
              );
            })}
            <span className={`ml-auto text-[11px] ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>
              {partCount} part{partCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {editing && (
          <button
            type="button"
            title="delete story"
            onClick={() => { if (window.confirm(`Delete story "${arc.title}"? Parts keep everything else.`)) dispatch({ type: 'DELETE_SCENARIO_ARC', id: arc.id }); }}
            className="p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]"
          >
            <Trash2 size={11} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`text-[10px] px-1.5 py-0.5 rounded-[3px] tracking-[0.08em] uppercase transition-colors ${
            editing ? 'text-[color:var(--color-brass)] bg-[color:var(--color-paper-deep)]/60'
            : active ? 'text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome)]'
            : 'text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'
          }`}
        >
          {editing ? 'done' : 'edit'}
        </button>
      </div>
    </article>
  );
}

/* ---------- The part cards ---------- */

function PartCard({ part, isFirst, isLast, onArcClick }: { part: ScenarioPart; isFirst: boolean; isLast: boolean; onArcClick: (arcId: string) => void }) {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const accent = part.colorHint ?? 'var(--color-brass)';
  const status = STATUS_META[part.status];

  function patch(p: Partial<ScenarioPart>) {
    dispatch({ type: 'UPDATE_SCENARIO_PART', id: part.id, patch: p });
  }
  function go(view: ViewKey, sel?: { person?: FourKey; thread?: string }) {
    if (sel?.person) dispatch({ type: 'SELECT_PERSON', key: sel.person });
    if (sel?.thread) dispatch({ type: 'SELECT_THREAD', id: sel.thread });
    dispatch({ type: 'SET_VIEW', view });
  }
  const toggle = (list: string[] | undefined, id: string) => {
    const cur = list ?? [];
    return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  };

  const arcs = [...state.scenarioArcs].sort((a, b) => a.num - b.num);
  const partArcs = (part.arcIds ?? []).map((id) => arcs.find((a) => a.id === id)).filter(Boolean) as ScenarioArc[];
  const interviewPool = part.shootId ? state.interviews.filter((iv) => iv.shootId === part.shootId) : state.interviews;

  const ivLabel = (ivId: string) => {
    const iv = state.interviews.find((x) => x.id === ivId);
    if (!iv) return null;
    const who = iv.subjectLabel
      ?? (iv.personKey === 'together' ? 'the four'
        : iv.personKey === 'other' ? 'guests'
        : state.four.find((f) => f.key === iv.personKey)?.name.split(' ')[0] ?? iv.personKey);
    return { iv, who };
  };

  return (
    <article className="relative pl-6">
      <span
        className="absolute left-[3px] top-5 w-2.5 h-2.5 rounded-full ring-2 ring-[color:var(--color-paper)]"
        style={{ background: part.status === 'shot' ? accent : 'var(--color-paper)', boxShadow: `inset 0 0 0 1.5px ${accent}` }}
        aria-hidden
      />
      <div
        className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] p-5"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {(part.kicker !== undefined || editing) && (
              <EditableText
                value={part.kicker ?? ''} placeholder="kicker — e.g. Part ten · the return…" editing={editing}
                onSave={(v) => patch({ kicker: v })}
                className="label-caps text-[color:var(--color-brass-deep)]"
              />
            )}
            <EditableText
              value={part.title} placeholder="title…" editing={editing}
              onSave={(v) => patch({ title: v })}
              className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight block"
            />
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <EditableText value={part.location} placeholder="location…" editing={editing} onSave={(v) => patch({ location: v })} className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]" />
              <span className="text-[color:var(--color-on-paper-faint)]">·</span>
              <EditableText value={part.dateLabel} placeholder="when…" editing={editing} onSave={(v) => patch({ dateLabel: v })} className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => patch({ status: NEXT_STATUS[part.status] })}
            title="cycle status"
            className="label-caps px-2 py-0.5 rounded-full border-[0.5px] shrink-0"
            style={{ color: status.color, borderColor: status.color }}
          >
            {status.label}
          </button>
        </div>

        {/* stories this part advances */}
        {(partArcs.length > 0 || editing) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {(editing ? arcs : partArcs).map((arc) => {
              const on = (part.arcIds ?? []).includes(arc.id);
              return (
                <button
                  key={arc.id}
                  type="button"
                  onClick={() => editing ? patch({ arcIds: toggle(part.arcIds, arc.id) }) : onArcClick(arc.id)}
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border-[0.5px] transition-all ${editing && !on ? 'opacity-35 hover:opacity-70' : ''}`}
                  style={{ borderColor: arc.colorHint ?? 'var(--color-brass)', color: arc.colorHint ?? 'var(--color-brass)' }}
                  title={editing ? (on ? 'detach story' : 'attach story') : 'follow this story'}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: arc.colorHint ?? 'var(--color-brass)' }} />
                  story {arc.num}
                </button>
              );
            })}
          </div>
        )}

        {/* toolbar */}
        <div className="flex items-center gap-1 mt-2 -ml-1">
          <IconBtn title="move up" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_SCENARIO_PART', id: part.id, dir: -1 })}><ChevronUp size={14} /></IconBtn>
          <IconBtn title="move down" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_SCENARIO_PART', id: part.id, dir: 1 })}><ChevronDown size={14} /></IconBtn>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`text-[11px] px-2 py-0.5 rounded-[3px] tracking-[0.08em] uppercase transition-colors ${editing ? 'text-[color:var(--color-brass)] bg-[color:var(--color-paper-deep)]/60' : 'text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'}`}
          >
            {editing ? 'done' : 'edit'}
          </button>
          {editing && (
            <IconBtn title="delete part" onClick={() => { if (window.confirm(`Delete "${part.title}"?`)) dispatch({ type: 'DELETE_SCENARIO_PART', id: part.id }); }}>
              <Trash2 size={13} className="text-[color:var(--color-danger)]" />
            </IconBtn>
          )}
        </div>

        {/* background */}
        <Field label="background" className="mt-3">
          <EditableText multiline value={part.background} placeholder="what this part is, why it matters…" editing={editing} onSave={(v) => patch({ background: v })} className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-relaxed block" />
        </Field>

        {/* what happened */}
        {(part.whatHappened || editing || part.status === 'shot') && (
          <Field label="what happened" className="mt-3">
            <EditableText multiline value={part.whatHappened} placeholder={part.status === 'shot' ? 'the events…' : 'still to come…'} editing={editing} onSave={(v) => patch({ whatHappened: v })} className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-relaxed block" />
          </Field>
        )}

        {/* who appeared */}
        {(part.peopleKeys.length > 0 || editing) && (
          <ChipRow icon={<Users size={11} />} label="who appeared">
            {(editing ? state.four : part.peopleKeys.map((k) => state.four.find((f) => f.key === k)).filter(Boolean)).map((f) => {
              if (!f) return null;
              const on = part.peopleKeys.includes(f.key);
              return (
                <Chip
                  key={f.key} color={f.colorHint} dim={editing && !on}
                  onClick={() => editing ? patch({ peopleKeys: toggle(part.peopleKeys, f.key) as FourKey[] }) : go('four', { person: f.key })}
                >
                  {f.name.split(' ')[0]}
                </Chip>
              );
            })}
          </ChipRow>
        )}

        {/* topics */}
        {((part.topicIds.length > 0) || editing) && (
          <ChipRow icon={<MessageSquare size={11} />} label="what they talked about">
            {(editing ? state.topics : part.topicIds.map((id) => state.topics.find((t) => t.id === id)).filter(Boolean)).map((t) => {
              if (!t) return null;
              const on = part.topicIds.includes(t.id);
              return (
                <Chip key={t.id} color={t.colorHint} dim={editing && !on}
                  onClick={() => editing ? patch({ topicIds: toggle(part.topicIds, t.id) }) : go('cast')}>
                  {t.title}
                </Chip>
              );
            })}
          </ChipRow>
        )}

        {/* threads */}
        {((part.threadIds.length > 0) || editing) && (
          <ChipRow icon={<Film size={11} />} label="threads">
            {(editing ? [...state.threads].sort((a, b) => a.num - b.num) : part.threadIds.map((id) => state.threads.find((t) => t.id === id)).filter(Boolean)).map((t) => {
              if (!t) return null;
              const on = part.threadIds.includes(t.id);
              return (
                <Chip key={t.id} dim={editing && !on}
                  onClick={() => editing ? patch({ threadIds: toggle(part.threadIds, t.id) }) : go('threads', { thread: t.id })}>
                  {String(t.num).padStart(2, '0')} · {t.title}
                </Chip>
              );
            })}
          </ChipRow>
        )}

        {/* interviews */}
        {((part.interviewIds.length > 0) || editing) && (
          <ChipRow icon={<Mic size={11} />} label="interviews">
            {(editing ? interviewPool.map((iv) => iv.id) : part.interviewIds).map((ivId) => {
              const info = ivLabel(ivId);
              if (!info) return null;
              const on = part.interviewIds.includes(ivId);
              return (
                <Chip key={ivId} dim={editing && !on}
                  onClick={() => editing ? patch({ interviewIds: toggle(part.interviewIds, ivId) }) : go('interviews')}>
                  {info.who} · {info.iv.date}
                </Chip>
              );
            })}
          </ChipRow>
        )}

        {/* moments — the story events this part touches */}
        {(((part.eventIds?.length ?? 0) > 0) || editing) && (
          <ChipRow icon={<Sparkles size={11} />} label="moments">
            {(editing
              ? [...state.storyEvents].sort((a, b) => a.year - b.year)
              : (part.eventIds ?? []).map((id) => state.storyEvents.find((e) => e.id === id)).filter(Boolean)
            ).map((ev) => {
              if (!ev) return null;
              const on = (part.eventIds ?? []).includes(ev.id);
              return (
                <Chip key={ev.id} dim={editing && !on}
                  onClick={() => editing ? patch({ eventIds: toggle(part.eventIds, ev.id) }) : go('cast')}>
                  {ev.title}
                </Chip>
              );
            })}
          </ChipRow>
        )}

        {/* beats */}
        {(part.beats.length > 0 || editing) && (
          <Field label={part.status === 'shot' ? 'beats' : 'to get'} className="mt-3">
            <ul className="space-y-1">
              {part.beats.map((b) => (
                <li key={b.id} className="flex items-start gap-2 group">
                  {part.status !== 'shot' ? (
                    <button
                      type="button"
                      onClick={() => patch({ beats: part.beats.map((x) => x.id === b.id ? { ...x, done: !x.done } : x) })}
                      className="mt-[3px] w-3 h-3 rounded-[2px] border-[0.5px] shrink-0 flex items-center justify-center"
                      style={{ borderColor: accent, background: b.done ? accent : 'transparent' }}
                      aria-label="toggle"
                    >
                      {b.done && <span className="w-1.5 h-1.5 bg-[color:var(--color-paper-light)] rounded-[1px]" />}
                    </button>
                  ) : (
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-[color:var(--color-brass)] shrink-0" aria-hidden />
                  )}
                  <EditableText
                    value={b.text} placeholder="beat…" editing={editing}
                    onSave={(v) => patch({ beats: part.beats.map((x) => x.id === b.id ? { ...x, text: v } : x) })}
                    className={`prose-body text-[13px] leading-snug flex-1 ${b.done ? 'line-through text-[color:var(--color-on-paper-faint)]' : 'text-[color:var(--color-on-paper)]'}`}
                  />
                  {editing && (
                    <button type="button" onClick={() => patch({ beats: part.beats.filter((x) => x.id !== b.id) })} className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]">
                      <Trash2 size={11} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {editing && (
              <button
                type="button"
                onClick={() => patch({ beats: [...part.beats, { id: `b-${Date.now().toString(36)}`, text: '', done: false }] })}
                className="mt-1.5 text-[11px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)] inline-flex items-center gap-1"
              >
                <Plus size={11} /> add a beat
              </button>
            )}
          </Field>
        )}

        {/* quotes */}
        {((part.quotes?.length ?? 0) > 0 || editing) && (
          <div className="mt-3 space-y-1.5">
            {(part.quotes ?? []).map((q, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <p className="display-italic text-[15px] text-[color:var(--color-on-paper)] leading-snug pl-3 border-l-2 flex-1" style={{ borderColor: accent }}>
                  “{q}”
                </p>
                {editing && (
                  <button type="button" onClick={() => patch({ quotes: (part.quotes ?? []).filter((_, j) => j !== i) })} className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] mt-1">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            {editing && <QuoteAdder onAdd={(q) => patch({ quotes: [...(part.quotes ?? []), q] })} />}
          </div>
        )}

        {(part.notes || editing) && (
          <Field label="notes" className="mt-3">
            <EditableText
              multiline value={part.notes ?? ''} placeholder="editor's notes…" editing={editing}
              onSave={(v) => patch({ notes: v })}
              className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] leading-snug block"
            />
          </Field>
        )}
      </div>
    </article>
  );
}

/* ---------- small pieces ---------- */

function QuoteAdder({ onAdd }: { onAdd: (q: string) => void }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="flex items-center gap-2">
      <Quote size={11} className="text-[color:var(--color-on-paper-faint)] shrink-0" />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { onAdd(draft.trim()); setDraft(''); } }}
        placeholder="add a standout line — Enter to save…"
        className="flex-1 bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px] outline-none focus:border-[color:var(--color-border-brass)]"
      />
    </div>
  );
}

function IconBtn({ children, title, onClick, disabled }: { children: ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled} className="p-1 rounded-[3px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper)] disabled:opacity-25 disabled:hover:text-[color:var(--color-on-paper-faint)] transition-colors">
      {children}
    </button>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="label-caps text-[color:var(--color-on-paper-faint)] mb-1">{label}</div>
      {children}
    </div>
  );
}

function ChipRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-1 text-[color:var(--color-on-paper-faint)]">
        {icon}<span className="label-caps">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ children, color, dim, onClick }: { children: ReactNode; color?: string; dim?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-all ${dim ? 'opacity-35 hover:opacity-75' : ''}`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

/* Click-to-edit text. Shows a styled span; in edit mode becomes an
   input/textarea that saves on blur or Enter. */
function EditableText({
  value, placeholder, onSave, className = '', multiline = false, editing = false,
}: {
  value: string; placeholder?: string; onSave: (v: string) => void;
  className?: string; multiline?: boolean; editing?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(value);

  const open = active || (editing && value === '');
  function begin() { setDraft(value); setActive(true); }
  function commit() { setActive(false); if (draft !== value) onSave(draft.trim()); }

  if (open || active) {
    return multiline ? (
      <textarea
        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit(); if (e.key === 'Escape') setActive(false); }}
        rows={3}
        className="w-full bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-brass)] rounded-[3px] px-2.5 py-1.5 prose-body text-[14px] text-[color:var(--color-on-paper)] outline-none resize-y leading-relaxed"
        placeholder={placeholder}
      />
    ) : (
      <input
        autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setActive(false); }}
        className="w-full bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-brass)] rounded-[3px] px-2 py-1 text-[14px] text-[color:var(--color-on-paper)] outline-none"
        placeholder={placeholder}
      />
    );
  }

  const isEmpty = value.trim() === '';
  return (
    <span
      onClick={editing ? begin : undefined}
      className={`${className} ${editing ? 'cursor-text hover:bg-[color:var(--color-paper-deep)]/40 rounded px-0.5 -mx-0.5' : ''} ${isEmpty ? 'text-[color:var(--color-on-paper-faint)] italic' : ''}`}
    >
      {isEmpty ? (editing ? (placeholder ?? 'empty') : '') : value}
    </span>
  );
}
