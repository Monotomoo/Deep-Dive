import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ChevronDown, ChevronUp, Film, MessageSquare, Mic, Plus, Quote, Sparkles, Trash2, Users, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { EditableText } from '../primitives/EditableText';
import type { FourKey, ScenarioArc, ScenarioPart, ScenarioPartStatus, ViewKey } from '../../types';

/* The Scenario — the film's screenplay.

   The four connected stories lead; every part declares which of them it
   advances. There is NO EDIT MODE — the same as The Plan. Click a word and it
   becomes an input; hover a card and its controls appear.

   THE COLLISION, AND HOW IT IS SETTLED. A chip used to mean two things: while
   reading it navigated to the thing it named, and while editing the same click
   attached or detached it. With the mode gone those two would sit on the same
   pixels, so the rule now is absolute — A CHIP CLICK ALWAYS NAVIGATES, never
   mutates. The biggest, easiest target on the card does the harmless thing.
   Detaching is a small × inside the pill, revealed on hover. Attaching is a +
   at the end of the row that opens a picker.

   THE REST-STATE RULE. With no pointer on the page this must render as the old
   reading mode did. Every secondary control is hover-revealed, because a
   screenplay has to read like a screenplay, not like a form. On touch, where
   hover does not exist, those controls sit at low opacity instead of hidden. */

const STATUS_META: Record<ScenarioPartStatus, { label: string; color: string }> = {
  shot: { label: 'shot', color: 'var(--color-success)' },
  upcoming: { label: 'to come', color: 'var(--color-brass)' },
  idea: { label: 'idea', color: 'var(--color-steel-light)' },
};

const NEXT_STATUS: Record<ScenarioPartStatus, ScenarioPartStatus> = {
  shot: 'upcoming', upcoming: 'idea', idea: 'shot',
};

/* Hover-reveal, with a touch fallback. Pure CSS — a JS matchMedia read happens
   once and never re-evaluates, which is wrong on the hybrid laptops this runs on. */
const REVEAL = 'opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-70 transition-opacity';
const REVEAL_EMPTY = 'hidden group-hover/card:block focus-within:block [@media(hover:none)]:block';

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
      {/* The shell's PageHeader already prints the title at 52px. */}

      {/* ---- The four stories · the spine ---- */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">the connected stories</h3>
          <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
            click any word to rewrite it
          </span>
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
          <button
            type="button"
            onClick={addArc}
            className="rounded-[4px] border border-dashed border-[color:var(--color-border-paper-strong)] text-[12px] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)] inline-flex items-center justify-center gap-1.5 transition-colors min-h-[92px]"
          >
            <Plus size={13} /> add a story
          </button>
        </div>
        {filterArc && (
          <button
            type="button"
            onClick={() => setArcFilter(null)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)] transition-colors"
          >
            <X size={12} /> following &ldquo;{filterArc.title}&rdquo; &middot; show all parts
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
              No part advances this story yet — hover a part and use <span className="not-italic">+</span> on its stories row to attach it.
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
  const [pickPeople, setPickPeople] = useState(false);
  const accent = arc.colorHint ?? 'var(--color-brass)';

  function patch(p: Partial<ScenarioArc>) {
    dispatch({ type: 'UPDATE_SCENARIO_ARC', id: arc.id, patch: p });
  }

  /* The card no longer filters on a card-wide click — the title and synopsis
     are editable text, and a click that both opens an editor and re-filters the
     whole timeline is two things on one pixel again. The numeral and the parts
     count are the two explicit handles. */
  const filterHandle = (extra: string) =>
    `${extra} cursor-pointer hover:text-[color:var(--color-brass)] transition-colors`;

  return (
    <article
      className={`group/card relative rounded-[4px] border-[0.5px] p-4 transition-colors ${
        active
          ? 'bg-[color:var(--color-chrome)] border-[color:var(--color-brass)]'
          : 'bg-[color:var(--color-paper-card)] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'
      }`}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelect}
          title={active ? 'stop following this story' : 'show only the parts that advance this story'}
          className={filterHandle(`display-italic text-[30px] leading-none ${active ? 'text-[color:var(--color-brass)]' : ''}`)}
          style={active ? undefined : { color: accent }}
        >
          {arc.num}
        </button>
        <div className="min-w-0 flex-1">
          <EditableText
            value={arc.title} placeholder="story title…"
            onSave={(v) => patch({ title: v })}
            className={`display-italic text-[17px] leading-snug block ${active ? 'text-[color:var(--color-on-chrome)]' : 'text-[color:var(--color-on-paper)]'}`}
          />
          <EditableText
            multiline value={arc.synopsis} placeholder="what this story is…"
            onSave={(v) => patch({ synopsis: v })}
            className={`prose-body italic text-[12px] leading-snug mt-1 block ${active ? 'text-[color:var(--color-on-chrome-muted)]' : 'text-[color:var(--color-on-paper-muted)]'}`}
          />
          <div className="relative flex items-center gap-2 mt-2 flex-wrap">
            {state.four.filter((f) => arc.personKeys.includes(f.key)).map((f) => (
              <span key={f.key} title={f.name} className="w-2.5 h-2.5 rounded-full" style={{ background: f.colorHint ?? accent }} />
            ))}
            <button
              type="button"
              title="who this story belongs to"
              onClick={() => setPickPeople((v) => !v)}
              className={`${REVEAL} text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)]`}
            >
              <Plus size={11} />
            </button>
            {pickPeople && (
              <Picker
                items={state.four.map((f) => ({ id: f.key, label: f.name, color: f.colorHint }))}
                selected={arc.personKeys}
                onToggle={(id) => patch({
                  personKeys: arc.personKeys.includes(id as FourKey)
                    ? arc.personKeys.filter((k) => k !== id)
                    : [...arc.personKeys, id as FourKey],
                })}
                onClose={() => setPickPeople(false)}
              />
            )}
            <button
              type="button"
              onClick={onSelect}
              title={active ? 'stop following this story' : 'show only the parts that advance this story'}
              className={filterHandle(`ml-auto text-[11px] ${active ? 'text-[color:var(--color-on-chrome-faint)]' : 'text-[color:var(--color-on-paper-faint)]'}`)}
            >
              {partCount} part{partCount === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        title="delete story"
        onClick={() => { if (window.confirm(`Delete story "${arc.title}"? Parts keep everything else.`)) dispatch({ type: 'DELETE_SCENARIO_ARC', id: arc.id }); }}
        className={`${REVEAL} absolute top-2 right-2 p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]`}
      >
        <Trash2 size={11} />
      </button>
    </article>
  );
}

/* ---------- The part cards ---------- */

function PartCard({ part, isFirst, isLast, onArcClick }: { part: ScenarioPart; isFirst: boolean; isLast: boolean; onArcClick: (arcId: string) => void }) {
  const { state, dispatch } = useApp();
  /* One picker slot for the whole card, so opening a second row closes the
     first — you can never be in two attach states at once. */
  const [pick, setPick] = useState<string | null>(null);
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
    <article className="group/card relative pl-6">
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
            <span className={part.kicker ? '' : REVEAL_EMPTY}>
              <EditableText
                value={part.kicker ?? ''} placeholder="kicker — e.g. Part ten · the return…"
                onSave={(v) => patch({ kicker: v })}
                className="label-caps text-[color:var(--color-brass-deep)]"
              />
            </span>
            <EditableText
              value={part.title} placeholder="title…"
              onSave={(v) => patch({ title: v })}
              className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight block"
            />
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <EditableText value={part.location} placeholder="location…" onSave={(v) => patch({ location: v })} className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]" />
              <span className="text-[color:var(--color-on-paper-faint)]">·</span>
              <EditableText value={part.dateLabel} placeholder="when…" onSave={(v) => patch({ dateLabel: v })} className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]" />
              <span className={`inline-flex items-center rounded-full border-[0.5px] border-[color:var(--color-border-paper-strong)] px-2 py-[1px] ${part.episodeHint ? '' : REVEAL_EMPTY}`}>
                <EditableText value={part.episodeHint ?? ''} placeholder="Ep · …" onSave={(v) => patch({ episodeHint: v })} className="font-sans text-[11px] tracking-[0.06em] text-[color:var(--color-on-paper-muted)]" />
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => patch({ status: NEXT_STATUS[part.status] })}
            title={`this part is ${status.label} — click to change it`}
            className="label-caps px-2 py-0.5 rounded-full border-[0.5px] shrink-0"
            style={{ color: status.color, borderColor: status.color }}
          >
            {status.label}
          </button>
        </div>

        {/* stories this part advances */}
        <div className="relative flex flex-wrap items-center gap-1.5 mt-2">
          {partArcs.map((arc) => (
            <span
              key={arc.id}
              className="group/chip inline-flex items-center rounded-full border-[0.5px] pl-2 pr-1 py-0.5"
              style={{ borderColor: arc.colorHint ?? 'var(--color-brass)' }}
            >
              <button
                type="button"
                onClick={() => onArcClick(arc.id)}
                title={`show only the parts that advance "${arc.title}"`}
                className="inline-flex items-center gap-1.5 text-[11px]"
                style={{ color: arc.colorHint ?? 'var(--color-brass)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: arc.colorHint ?? 'var(--color-brass)' }} />
                story {arc.num}
              </button>
              <Detach title={`take "${arc.title}" off this part`} onClick={() => patch({ arcIds: toggle(part.arcIds, arc.id) })} />
            </span>
          ))}
          <AddTo
            open={pick === 'arcs'}
            onOpen={() => setPick(pick === 'arcs' ? null : 'arcs')}
            title="attach a story to this part"
            items={arcs.map((a) => ({ id: a.id, label: `story ${a.num} · ${a.title}`, color: a.colorHint }))}
            selected={part.arcIds ?? []}
            onToggle={(id) => patch({ arcIds: toggle(part.arcIds, id) })}
            onClose={() => setPick(null)}
          />
        </div>

        {/* structural controls — hover only, so the page reads as a document */}
        <div className={`${REVEAL} flex items-center gap-1 mt-2 -ml-1`}>
          <IconBtn title="move this part earlier" disabled={isFirst} onClick={() => dispatch({ type: 'MOVE_SCENARIO_PART', id: part.id, dir: -1 })}><ChevronUp size={14} /></IconBtn>
          <IconBtn title="move this part later" disabled={isLast} onClick={() => dispatch({ type: 'MOVE_SCENARIO_PART', id: part.id, dir: 1 })}><ChevronDown size={14} /></IconBtn>
          <IconBtn title="delete this part" onClick={() => { if (window.confirm(`Delete "${part.title}"?`)) dispatch({ type: 'DELETE_SCENARIO_PART', id: part.id }); }}>
            <Trash2 size={13} className="text-[color:var(--color-danger)]" />
          </IconBtn>
        </div>

        <Field label="background" className="mt-3">
          <EditableText multiline value={part.background} placeholder="what this part is, why it matters…" onSave={(v) => patch({ background: v })} className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-relaxed block" />
        </Field>

        <div className={part.whatHappened || part.status === 'shot' ? '' : REVEAL_EMPTY}>
          <Field label="what happened" className="mt-3">
            <EditableText multiline value={part.whatHappened} placeholder={part.status === 'shot' ? 'the events…' : 'still to come…'} onSave={(v) => patch({ whatHappened: v })} className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-relaxed block" />
          </Field>
        </div>

        {/* who appeared */}
        <ChipRow icon={<Users size={11} />} label="who appeared">
          {part.peopleKeys.map((k) => {
            const f = state.four.find((x) => x.key === k);
            if (!f) return null;
            return (
              <Chip key={f.key} color={f.colorHint} title={`open ${f.name}`} onClick={() => go('four', { person: f.key })}
                onDetach={() => patch({ peopleKeys: toggle(part.peopleKeys, f.key) as FourKey[] })}
                detachTitle={`take ${f.name.split(' ')[0]} off this part`}>
                {f.name.split(' ')[0]}
              </Chip>
            );
          })}
          <AddTo
            open={pick === 'people'} onOpen={() => setPick(pick === 'people' ? null : 'people')}
            title="add someone to this part"
            items={state.four.map((f) => ({ id: f.key, label: f.name, color: f.colorHint }))}
            selected={part.peopleKeys}
            onToggle={(id) => patch({ peopleKeys: toggle(part.peopleKeys, id) as FourKey[] })}
            onClose={() => setPick(null)}
          />
        </ChipRow>

        {/* topics */}
        <ChipRow icon={<MessageSquare size={11} />} label="what they talked about">
          {part.topicIds.map((id) => {
            const t = state.topics.find((x) => x.id === id);
            if (!t) return null;
            return (
              <Chip key={t.id} color={t.colorHint} title="open Cast · Story" onClick={() => go('cast')}
                onDetach={() => patch({ topicIds: toggle(part.topicIds, t.id) })}
                detachTitle={`take "${t.title}" off this part`}>
                {t.title}
              </Chip>
            );
          })}
          <AddTo
            open={pick === 'topics'} onOpen={() => setPick(pick === 'topics' ? null : 'topics')}
            title="add a topic to this part"
            items={state.topics.map((t) => ({ id: t.id, label: t.title, color: t.colorHint }))}
            selected={part.topicIds}
            onToggle={(id) => patch({ topicIds: toggle(part.topicIds, id) })}
            onClose={() => setPick(null)}
          />
        </ChipRow>

        {/* threads */}
        <ChipRow icon={<Film size={11} />} label="threads">
          {part.threadIds.map((id) => {
            const t = state.threads.find((x) => x.id === id);
            if (!t) return null;
            return (
              <Chip key={t.id} title={`open thread ${t.num}`} onClick={() => go('threads', { thread: t.id })}
                onDetach={() => patch({ threadIds: toggle(part.threadIds, t.id) })}
                detachTitle={`take thread ${t.num} off this part`}>
                {String(t.num).padStart(2, '0')} · {t.title}
              </Chip>
            );
          })}
          <AddTo
            open={pick === 'threads'} onOpen={() => setPick(pick === 'threads' ? null : 'threads')}
            title="add a thread to this part"
            items={[...state.threads].sort((a, b) => a.num - b.num).map((t) => ({ id: t.id, label: `${String(t.num).padStart(2, '0')} · ${t.title}` }))}
            selected={part.threadIds}
            onToggle={(id) => patch({ threadIds: toggle(part.threadIds, id) })}
            onClose={() => setPick(null)}
          />
        </ChipRow>

        {/* interviews */}
        <ChipRow icon={<Mic size={11} />} label="interviews">
          {part.interviewIds.map((ivId) => {
            const info = ivLabel(ivId);
            if (!info) return null;
            return (
              <Chip key={ivId} title="open Interviews" onClick={() => go('interviews')}
                onDetach={() => patch({ interviewIds: toggle(part.interviewIds, ivId) })}
                detachTitle="take this interview off this part">
                {info.who} · {info.iv.date}
              </Chip>
            );
          })}
          <AddTo
            open={pick === 'interviews'} onOpen={() => setPick(pick === 'interviews' ? null : 'interviews')}
            title="add an interview to this part"
            items={interviewPool.map((iv) => {
              const info = ivLabel(iv.id);
              return { id: iv.id, label: info ? `${info.who} · ${info.iv.date}` : iv.id };
            })}
            selected={part.interviewIds}
            onToggle={(id) => patch({ interviewIds: toggle(part.interviewIds, id) })}
            onClose={() => setPick(null)}
          />
        </ChipRow>

        {/* moments */}
        <ChipRow icon={<Sparkles size={11} />} label="moments">
          {(part.eventIds ?? []).map((id) => {
            const ev = state.storyEvents.find((x) => x.id === id);
            if (!ev) return null;
            return (
              <Chip key={ev.id} title="open Cast · Story" onClick={() => go('cast')}
                onDetach={() => patch({ eventIds: toggle(part.eventIds, ev.id) })}
                detachTitle={`take "${ev.title}" off this part`}>
                {ev.title}
              </Chip>
            );
          })}
          <AddTo
            open={pick === 'moments'} onOpen={() => setPick(pick === 'moments' ? null : 'moments')}
            title="add a moment to this part"
            items={[...state.storyEvents].sort((a, b) => a.year - b.year).map((e) => ({ id: e.id, label: `${e.year} · ${e.title}` }))}
            selected={part.eventIds ?? []}
            onToggle={(id) => patch({ eventIds: toggle(part.eventIds, id) })}
            onClose={() => setPick(null)}
          />
        </ChipRow>

        {/* beats */}
        <Field label={part.status === 'shot' ? 'beats' : 'to get'} className="mt-3">
          <ul className="space-y-1">
            {part.beats.map((b) => (
              <li key={b.id} className="flex items-start gap-2 group/beat">
                {part.status !== 'shot' ? (
                  <button
                    type="button"
                    onClick={() => patch({ beats: part.beats.map((x) => x.id === b.id ? { ...x, done: !x.done } : x) })}
                    className="mt-[3px] w-3 h-3 rounded-[2px] border-[0.5px] shrink-0 flex items-center justify-center"
                    style={{ borderColor: accent, background: b.done ? accent : 'transparent' }}
                    title={b.done ? 'mark as still to get' : 'mark as got'}
                  >
                    {b.done && <span className="w-1.5 h-1.5 bg-[color:var(--color-paper-light)] rounded-[1px]" />}
                  </button>
                ) : (
                  <span className="mt-[7px] w-1 h-1 rounded-full bg-[color:var(--color-brass)] shrink-0" aria-hidden />
                )}
                <EditableText
                  value={b.text} placeholder="beat…"
                  onSave={(v) => patch({ beats: part.beats.map((x) => x.id === b.id ? { ...x, text: v } : x) })}
                  className={`prose-body text-[13px] leading-snug flex-1 ${b.done ? 'line-through text-[color:var(--color-on-paper-faint)]' : 'text-[color:var(--color-on-paper)]'}`}
                />
                <button
                  type="button"
                  title="remove this beat"
                  onClick={() => patch({ beats: part.beats.filter((x) => x.id !== b.id) })}
                  className="opacity-0 group-hover/beat:opacity-100 [@media(hover:none)]:opacity-70 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-opacity"
                >
                  <Trash2 size={11} />
                </button>
              </li>
            ))}
          </ul>
          <TypeToAdd
            placeholder={part.status === 'shot' ? 'add a beat — Enter to keep going…' : 'add something to get — Enter to keep going…'}
            onAdd={(text) => patch({ beats: [...part.beats, { id: `b-${Date.now().toString(36)}`, text, done: false }] })}
            className={part.beats.length ? REVEAL : ''}
          />
        </Field>

        {/* quotes — the text itself stays read-only. A quote is a verbatim thing
            somebody said, held in a last-write-wins shared doc; it can be added
            and removed, but not silently rewritten in place. */}
        <div className="mt-3 space-y-1.5">
          {(part.quotes ?? []).map((q, i) => (
            <div key={`${i}-${q.slice(0, 12)}`} className="flex items-start gap-2 group/quote">
              <p className="display-italic text-[15px] text-[color:var(--color-on-paper)] leading-snug pl-3 border-l-2 flex-1" style={{ borderColor: accent }}>
                &ldquo;{q}&rdquo;
              </p>
              <button
                type="button"
                title="remove this quote"
                onClick={() => dispatch({ type: 'DELETE_SCENARIO_QUOTE', partId: part.id, index: i, text: q })}
                className="opacity-0 group-hover/quote:opacity-100 [@media(hover:none)]:opacity-70 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] mt-1 transition-opacity"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <div className={`flex items-center gap-2 ${(part.quotes?.length ?? 0) ? REVEAL : ''}`}>
            <Quote size={11} className="text-[color:var(--color-on-paper-faint)] shrink-0" />
            <TypeToAdd
              placeholder="add a standout line — Enter to save…"
              onAdd={(q) => patch({ quotes: [...(part.quotes ?? []), q] })}
            />
          </div>
        </div>

        <div className={part.notes ? '' : REVEAL_EMPTY}>
          <Field label="notes" className="mt-3">
            <EditableText
              multiline value={part.notes ?? ''} placeholder="editor's notes…"
              onSave={(v) => patch({ notes: v })}
              className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] leading-snug block"
            />
          </Field>
        </div>
      </div>
    </article>
  );
}

/* ---------- attach / detach ---------- */

/* The + at the end of a chip row, and the picker it opens. */
function AddTo({
  open, onOpen, onClose, title, items, selected, onToggle,
}: {
  open: boolean; onOpen: () => void; onClose: () => void; title: string;
  items: { id: string; label: string; color?: string }[];
  selected: string[]; onToggle: (id: string) => void;
}) {
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        title={title}
        onClick={onOpen}
        className={`${open ? 'opacity-100 text-[color:var(--color-brass)]' : REVEAL} inline-flex items-center justify-center w-5 h-5 rounded-[3px] border border-dashed border-[color:var(--color-border-paper-strong)] text-[color:var(--color-on-paper-faint)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)]`}
      >
        <Plus size={11} />
      </button>
      {open && <Picker items={items} selected={selected} onToggle={onToggle} onClose={onClose} />}
    </span>
  );
}

/* A fixed-height list, never an inline expansion of the chip row. Filtering a
   flex-wrap reflows it on every keystroke, so the chip you are aiming at moves
   while you type. */
function Picker({
  items, selected, onToggle, onClose,
}: {
  items: { id: string; label: string; color?: string }[];
  selected: string[]; onToggle: (id: string) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const shown = q.trim()
    ? items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase()))
    : items;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-[26px] z-30 w-[260px] rounded-[4px] border-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-light)] shadow-lg overflow-hidden"
    >
      {items.length > 7 && (
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="find…"
          className="w-full bg-[color:var(--color-paper-card)] border-b-[0.5px] border-[color:var(--color-border-paper)] px-2.5 py-1.5 text-[12px] outline-none"
        />
      )}
      <div className="max-h-[210px] overflow-y-auto py-1">
        {shown.map((i) => {
          const on = selected.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onToggle(i.id)}
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
  );
}

function Detach({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="ml-1 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full opacity-0 group-hover/chip:opacity-100 [@media(hover:none)]:opacity-60 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-opacity"
    >
      <X size={9} />
    </button>
  );
}

/* ---------- small pieces ---------- */

function TypeToAdd({ placeholder, onAdd, className = '' }: { placeholder: string; onAdd: (v: string) => void; className?: string }) {
  const [draft, setDraft] = useState('');
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && draft.trim()) { onAdd(draft.trim()); setDraft(''); }
        if (e.key === 'Escape') setDraft('');
      }}
      onBlur={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(''); } }}
      placeholder={placeholder}
      className={`${className} mt-1.5 w-full max-w-[420px] bg-transparent border-b-[0.5px] border-transparent px-0.5 py-0.5 text-[13px] text-[color:var(--color-on-paper)] placeholder:text-[color:var(--color-on-paper-faint)] placeholder:italic outline-none focus:opacity-100 focus:border-[color:var(--color-brass)] transition-colors`}
    />
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
      <div className="relative flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/* A chip's own click ALWAYS navigates. Detaching lives on the × that appears
   inside the pill on hover, which costs no layout because it is already there. */
function Chip({
  children, color, title, onClick, onDetach, detachTitle,
}: {
  children: ReactNode; color?: string; title: string; onClick: () => void;
  onDetach?: () => void; detachTitle?: string;
}) {
  return (
    <span className="group/chip inline-flex items-center text-[12px] pl-2 pr-1 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-all">
      <button type="button" title={title} onClick={onClick} className="inline-flex items-center gap-1.5">
        {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
        {children}
      </button>
      {onDetach && <Detach title={detachTitle ?? 'detach'} onClick={onDetach} />}
    </span>
  );
}
