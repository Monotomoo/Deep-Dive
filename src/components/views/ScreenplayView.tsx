import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronDown, ChevronUp, Film, MessageSquare, Mic, Plus, Trash2, Users,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { FourKey, ScenarioPart, ScenarioPartStatus, ViewKey } from '../../types';

/* The Scenario — the film's screenplay, part by part.

   Not the budget scenarios (that's "The Money"). This is the narrative spine:
   what actually happened on each shoot, who appeared, what they talked about,
   and the real interviews/topics/threads it connects to. Done parts are filled;
   future parts are open blocks to plan into. Everything here is editable, and
   every chip clicks through to the thing it names. */

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
  const parts = useMemo(() => [...state.scenarioParts].sort((a, b) => a.order - b.order), [state.scenarioParts]);

  function addPart() {
    const maxOrder = parts.reduce((m, p) => Math.max(m, p.order), 0);
    dispatch({
      type: 'ADD_SCENARIO_PART',
      part: {
        id: `sp-${Date.now().toString(36)}`, order: maxOrder + 1,
        title: 'New part', location: '', dateLabel: 'TBD', status: 'idea',
        background: '', whatHappened: '', peopleKeys: [], topicIds: [], threadIds: [],
        interviewIds: [], beats: [], colorHint: 'var(--color-brass)',
      },
    });
  }

  return (
    <div className="max-w-[900px] space-y-6">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">The Scenario</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
          the film part by part · what happened, who appeared, what they talked about · every chip goes to the real thing
        </p>
      </header>

      <div className="relative">
        {/* the spine */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[color:var(--color-border-paper-strong)]" aria-hidden />
        <div className="space-y-4">
          {parts.map((p, i) => (
            <PartCard key={p.id} part={p} isFirst={i === 0} isLast={i === parts.length - 1} />
          ))}
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

function PartCard({ part, isFirst, isLast }: { part: ScenarioPart; isFirst: boolean; isLast: boolean }) {
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

  const people = part.peopleKeys.map((k) => state.four.find((f) => f.key === k)).filter(Boolean);
  const topics = part.topicIds.map((id) => state.topics.find((t) => t.id === id)).filter(Boolean);
  const threads = part.threadIds.map((id) => state.threads.find((t) => t.id === id)).filter(Boolean);
  const interviews = part.interviewIds.map((id) => state.interviews.find((iv) => iv.id === id)).filter(Boolean);

  return (
    <article className="relative pl-6">
      {/* spine dot */}
      <span
        className="absolute left-[3px] top-5 w-2.5 h-2.5 rounded-full ring-2 ring-[color:var(--color-paper)]"
        style={{ background: part.status === 'shot' ? accent : 'var(--color-paper)', borderColor: accent, boxShadow: `inset 0 0 0 1.5px ${accent}` }}
        aria-hidden
      />
      <div
        className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] p-5"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {part.kicker !== undefined && (
              <EditableText
                value={part.kicker} placeholder="kicker…" editing={editing}
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
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => patch({ status: NEXT_STATUS[part.status] })}
              title="cycle status"
              className="label-caps px-2 py-0.5 rounded-full border-[0.5px]"
              style={{ color: status.color, borderColor: status.color }}
            >
              {status.label}
            </button>
          </div>
        </div>

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

        {/* connections */}
        {people.length > 0 && (
          <ChipRow icon={<Users size={11} />} label="who appeared">
            {people.map((f) => (
              <Chip key={f!.key} color={f!.colorHint} onClick={() => go('four', { person: f!.key })}>{f!.name.split(' ')[0]}</Chip>
            ))}
          </ChipRow>
        )}
        {topics.length > 0 && (
          <ChipRow icon={<MessageSquare size={11} />} label="what they talked about">
            {topics.map((t) => (
              <Chip key={t!.id} color={t!.colorHint} onClick={() => go('cast')}>{t!.title}</Chip>
            ))}
          </ChipRow>
        )}
        {threads.length > 0 && (
          <ChipRow icon={<Film size={11} />} label="threads">
            {threads.map((t) => (
              <Chip key={t!.id} onClick={() => go('threads', { thread: t!.id })}>{String(t!.num).padStart(2, '0')} · {t!.title}</Chip>
            ))}
          </ChipRow>
        )}
        {interviews.length > 0 && (
          <ChipRow icon={<Mic size={11} />} label="interviews">
            {interviews.map((iv) => (
              <Chip key={iv!.id} onClick={() => go('interviews')}>
                {iv!.personKey === 'together' ? 'the four' : (state.four.find((f) => f.key === iv!.personKey)?.name.split(' ')[0] ?? iv!.personKey)} · {iv!.date}
              </Chip>
            ))}
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
        {part.quotes && part.quotes.length > 0 && (
          <div className="mt-3 space-y-1">
            {part.quotes.map((q, i) => (
              <p key={i} className="display-italic text-[15px] text-[color:var(--color-on-paper)] leading-snug pl-3 border-l-2" style={{ borderColor: accent }}>
                "{q}"
              </p>
            ))}
          </div>
        )}

        {part.notes && (
          <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] mt-3">{part.notes}</p>
        )}
      </div>
    </article>
  );
}

/* ---------- small pieces ---------- */

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

function Chip({ children, color, onClick }: { children: ReactNode; color?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-colors"
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

/* Click-to-edit text. Shows a styled span; in edit mode (or on click) becomes an
   input/textarea that saves on blur or Enter. */
function EditableText({
  value, placeholder, onSave, className = '', multiline = false, editing = false,
}: {
  value: string; placeholder?: string; onSave: (v: string) => void;
  className?: string; multiline?: boolean; editing?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(value);

  const open = active || (editing && (value === '' ));
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
