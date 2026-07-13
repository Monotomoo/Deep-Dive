import { useMemo, useState } from 'react';
import { Plus, Star, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { ChoirAnswerSource, ChoirEntry, FourKey, TalentFour } from '../../types';

/* Choir · same question, four voices.
   Pick or add a question, see the four subjects' answers side-by-side.
   Answers can be interview (real), imagined (placeholder), quoted, or
   observed. Mark any answer as a KEY line to promote it into Essence. */

const SOURCES: ChoirAnswerSource[] = ['interview', 'imagined', 'quoted', 'observed'];

const SOURCE_COLOR: Record<ChoirAnswerSource, string> = {
  interview: 'var(--color-olive)',
  imagined: 'var(--color-brass)',
  quoted: 'var(--color-dock)',
  observed: 'var(--color-brass-deep)',
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChoirView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    state.choirQuestions[0]?.id ?? null,
  );
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingEntry, setEditingEntry] = useState<ChoirEntry | null>(null);

  const currentQuestion = state.choirQuestions.find((q) => q.id === activeQuestionId) ?? null;

  const entriesByPerson = useMemo(() => {
    const map: Record<FourKey, ChoirEntry | null> = {
      petar: null, vito: null, sanda: null, zsofia: null,
    };
    if (!currentQuestion) return map;
    for (const e of state.choirEntries) {
      if (e.questionId !== currentQuestion.id) continue;
      map[e.subjectKey] = e;
    }
    return map;
  }, [currentQuestion, state.choirEntries]);

  function submitNewQuestion() {
    const text = newQuestionText.trim();
    if (!text) return;
    const q = { id: makeId('cq'), text, createdAt: new Date(2026, 6, 11).toISOString() };
    dispatch({ type: 'ADD_CHOIR_QUESTION', question: q });
    setActiveQuestionId(q.id);
    setNewQuestionText('');
    setAddingQuestion(false);
  }

  function deleteCurrentQuestion() {
    if (!currentQuestion) return;
    if (!confirm(t('choir.deleteQuestion.confirm'))) return;
    dispatch({ type: 'DELETE_CHOIR_QUESTION', id: currentQuestion.id });
    const remaining = state.choirQuestions.filter((q) => q.id !== currentQuestion.id);
    setActiveQuestionId(remaining[0]?.id ?? null);
  }

  function startAdd(subjectKey: FourKey) {
    if (!currentQuestion) return;
    setEditingEntry({
      id: makeId('ce'),
      questionId: currentQuestion.id,
      subjectKey,
      answer: '',
      source: 'imagined',
    });
  }

  function saveEntry(entry: ChoirEntry) {
    const exists = state.choirEntries.some((e) => e.id === entry.id);
    if (exists) dispatch({ type: 'UPDATE_CHOIR_ENTRY', id: entry.id, patch: entry });
    else dispatch({ type: 'ADD_CHOIR_ENTRY', entry });
    setEditingEntry(null);
  }

  return (
    <div className="space-y-8 max-w-[1500px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('choir.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('choir.subtitle')}</p>
      </header>

      {/* Question picker */}
      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="label-caps text-[10px] text-[color:var(--color-brass)]">{t('choir.pickQuestion')}</div>
          {!addingQuestion && (
            <button
              type="button"
              onClick={() => setAddingQuestion(true)}
              className="flex items-center gap-1 text-[11px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)] transition-colors"
            >
              <Plus size={11} /> {t('choir.addQuestion')}
            </button>
          )}
        </div>

        {addingQuestion && (
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewQuestion();
                if (e.key === 'Escape') {
                  setNewQuestionText('');
                  setAddingQuestion(false);
                }
              }}
              placeholder={t('choir.newQuestion')}
              autoFocus
              className="flex-1 bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-1.5 text-[13px] italic"
            />
            <button
              type="button"
              onClick={submitNewQuestion}
              disabled={!newQuestionText.trim()}
              className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingQuestion(false);
                setNewQuestionText('');
              }}
              className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {state.choirQuestions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveQuestionId(q.id)}
              className={`px-3 py-1.5 rounded-[3px] text-[12px] transition-colors text-left max-w-[300px] truncate ${
                activeQuestionId === q.id
                  ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                  : 'bg-white border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
              }`}
            >
              {q.text}
            </button>
          ))}
        </div>
      </section>

      {/* Current question hero */}
      {currentQuestion && (
        <section>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="max-w-[900px] display-italic text-[26px] leading-snug text-[color:var(--color-on-paper)]">
              <span className="text-[color:var(--color-brass)]">“</span>
              {currentQuestion.text}
              <span className="text-[color:var(--color-brass)]">”</span>
            </div>
            <button
              type="button"
              onClick={deleteCurrentQuestion}
              className="text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] flex items-center gap-1 shrink-0 mt-2"
              title={t('choir.deleteQuestion')}
            >
              <Trash2 size={11} />
              <span>{t('common.delete')}</span>
            </button>
          </div>

          {/* Four columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {state.four.map((subject) => (
              <AnswerColumn
                key={subject.key}
                subject={subject}
                entry={entriesByPerson[subject.key]}
                onAdd={() => startAdd(subject.key)}
                onEdit={(entry) => setEditingEntry(entry)}
                onToggleKey={(entry) =>
                  dispatch({ type: 'UPDATE_CHOIR_ENTRY', id: entry.id, patch: { isKey: !entry.isKey } })
                }
                onDelete={(id) => dispatch({ type: 'DELETE_CHOIR_ENTRY', id })}
              />
            ))}
          </div>
        </section>
      )}

      {!currentQuestion && (
        <div className="text-center py-12 prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)]">
          Add a question to begin.
        </div>
      )}

      {editingEntry && (
        <EntryEditor
          entry={editingEntry}
          subject={state.four.find((f) => f.key === editingEntry.subjectKey)!}
          onSave={saveEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}

function AnswerColumn({
  subject,
  entry,
  onAdd,
  onEdit,
  onToggleKey,
  onDelete,
}: {
  subject: TalentFour;
  entry: ChoirEntry | null;
  onAdd: () => void;
  onEdit: (e: ChoirEntry) => void;
  onToggleKey: (e: ChoirEntry) => void;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const color = subject.colorHint ?? 'var(--color-brass)';

  return (
    <article
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col min-h-[280px]"
      style={{ borderTopWidth: 3, borderTopColor: color }}
    >
      <header className="pb-3 mb-3 border-b-[0.5px] border-[color:var(--color-border-paper)]">
        <div className="display-italic text-[20px] text-[color:var(--color-on-paper)] leading-tight">
          {subject.name}
        </div>
        <div className="prose-body italic text-[10px] text-[color:var(--color-brass)] mt-0.5">
          {subject.role}
        </div>
      </header>

      {entry ? (
        <>
          <div className="flex items-center gap-2 mb-2 text-[9px] tracking-wide">
            <span
              className="uppercase font-sans px-1.5 py-0.5 rounded-[2px]"
              style={{
                background: `color-mix(in oklab, ${SOURCE_COLOR[entry.source]} 15%, transparent)`,
                color: SOURCE_COLOR[entry.source],
              }}
            >
              {t(`choir.source.${entry.source}` as StringKey)}
            </span>
            {entry.isKey && (
              <span className="uppercase font-sans text-[color:var(--color-brass)] flex items-center gap-1">
                <Star size={9} fill="currentColor" /> {t('choir.key')}
              </span>
            )}
          </div>
          <p
            className="flex-1 prose-body italic text-[13px] text-[color:var(--color-on-paper)] leading-relaxed cursor-pointer hover:text-[color:var(--color-brass)]"
            onClick={() => onEdit(entry)}
          >
            “{entry.answer}”
          </p>
          {entry.sourceContext && (
            <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] mt-2">
              — {entry.sourceContext}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)]">
            <button
              type="button"
              onClick={() => onToggleKey(entry)}
              className="text-[10px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)] flex items-center gap-1"
              title={entry.isKey ? t('choir.unmarkKey') : t('choir.markKey')}
            >
              <Star size={10} fill={entry.isKey ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="text-[10px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] mb-3">
            {t('choir.emptyAnswer')}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] text-[11px] transition-colors"
          >
            <Plus size={11} />
            <span className="italic">{t('choir.addAnswer')}</span>
          </button>
        </div>
      )}
    </article>
  );
}

function EntryEditor({
  entry,
  subject,
  onSave,
  onCancel,
}: {
  entry: ChoirEntry;
  subject: TalentFour;
  onSave: (e: ChoirEntry) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [e, setE] = useState<ChoirEntry>(entry);
  const color = subject.colorHint ?? 'var(--color-brass)';

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[520px] w-full p-6 space-y-4"
        onClick={(ev) => ev.stopPropagation()}
        style={{ borderTop: `3px solid ${color}` }}
      >
        <header className="flex items-center justify-between">
          <div>
            <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{subject.name}</div>
            <div className="prose-body italic text-[11px] text-[color:var(--color-brass)]">{t('choir.answerHint')}</div>
          </div>
          <button type="button" onClick={onCancel} className="text-[color:var(--color-on-paper-muted)]">
            <X size={16} />
          </button>
        </header>

        <label className="block">
          <textarea
            value={e.answer}
            onChange={(ev) => setE({ ...e, answer: ev.target.value })}
            rows={5}
            autoFocus
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-2 text-[14px] italic leading-relaxed"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">source</div>
            <select
              value={e.source}
              onChange={(ev) => setE({ ...e, source: ev.target.value as ChoirAnswerSource })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{t(`choir.source.${s}` as StringKey)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">where</div>
            <input
              type="text"
              value={e.sourceContext ?? ''}
              onChange={(ev) => setE({ ...e, sourceContext: ev.target.value })}
              placeholder="Interview #3 · Krk"
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!e.isKey}
            onChange={(ev) => setE({ ...e, isKey: ev.target.checked })}
          />
          <span className="text-[12px] text-[color:var(--color-on-paper-muted)] flex items-center gap-1">
            <Star size={11} className="text-[color:var(--color-brass)]" />
            {t('choir.markKey')}
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onSave(e)}
            disabled={!e.answer.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
