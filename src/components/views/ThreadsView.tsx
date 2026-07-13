import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { Thread, ThreadOwner, ThreadStatus } from '../../types';

/* Threads · the narrative arcs woven across every shoot.
   Now with full create / edit / delete — the ten are a starting point,
   not a ceiling. */

const OWNERS: ThreadOwner[] = ['ensemble', 'petar', 'vito', 'sanda', 'zsofia', 'petar-vito', 'sanda-zsofia'];
const STATUSES: ThreadStatus[] = ['unopened', 'opening', 'active', 'ready', 'in-cut'];

function ownerLabel(owner: ThreadOwner, four: { key: string; name: string }[]): string {
  if (owner === 'ensemble') return 'ensemble';
  if (owner === 'petar-vito') return 'Petar & Vito';
  if (owner === 'sanda-zsofia') return 'Sanda & Zsófia';
  return four.find((f) => f.key === owner)?.name.split(' ')[0] ?? owner;
}

function statusColor(s: ThreadStatus): string {
  switch (s) {
    case 'active':
    case 'ready':  return 'text-[color:var(--color-success)]';
    case 'opening':return 'text-[color:var(--color-brass)]';
    case 'in-cut': return 'text-[color:var(--color-dock)]';
    default:       return 'text-[color:var(--color-on-paper-faint)]';
  }
}

function nextNum(threads: Thread[]): Thread['num'] {
  const max = threads.reduce((m, t) => Math.max(m, t.num), 0);
  return Math.min(max + 1, 10) as Thread['num'];
}

export function ThreadsView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [editing, setEditing] = useState<Thread | null>(null);
  const [isNew, setIsNew] = useState(false);

  const sorted = [...state.threads].sort((a, b) => a.num - b.num);

  function startNew() {
    setIsNew(true);
    setEditing({
      id: `t-${Math.random().toString(36).slice(2, 8)}`,
      num: nextNum(state.threads),
      title: '', subtitle: '', owner: 'ensemble', synopsis: '', status: 'unopened',
    });
  }

  function save(th: Thread) {
    if (state.threads.some((x) => x.id === th.id)) dispatch({ type: 'UPDATE_THREAD', id: th.id, patch: th });
    else dispatch({ type: 'ADD_THREAD', thread: th });
    setEditing(null);
    setIsNew(false);
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('threads.title')}</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('threads.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] hover:bg-[color:var(--color-brass-deep)] transition-colors shrink-0"
        >
          <Plus size={13} /> {t('threads.add')}
        </button>
      </header>

      <ul className="space-y-3">
        {sorted.map((th) => {
          const qs = state.threadQuestions.filter((q) => q.threadId === th.id);
          return (
            <li
              key={th.id}
              className="group bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
              onClick={() => { setIsNew(false); setEditing(th); }}
            >
              <header className="flex items-baseline justify-between gap-3 mb-2">
                <div>
                  <span className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">Thread {th.num.toString().padStart(2, '0')}</span>
                  <div className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight">{th.title || t('common.untitled')}</div>
                  <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-0.5">{th.subtitle}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-end text-[11px]">
                    <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('threads.owner')}</span>
                    <span className="prose-body italic text-[color:var(--color-on-paper)]">{ownerLabel(th.owner, state.four)}</span>
                    <span className={`mt-1 label-caps text-[9px] ${statusColor(th.status)}`}>{th.status}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete thread "${th.title}"?`)) dispatch({ type: 'DELETE_THREAD', id: th.id }); }}
                    className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </header>
              <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-relaxed">{th.synopsis}</p>
              {qs.length > 0 && (
                <details className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <summary className="label-caps text-[10px] text-[color:var(--color-brass-deep)] cursor-pointer">{qs.length} {t('threads.questions')}</summary>
                  <ul className="mt-2 space-y-1">
                    {qs.map((q) => (
                      <li key={q.id} className="prose-body text-[12px] text-[color:var(--color-on-paper)] italic leading-snug border-l-2 border-[color:var(--color-brass)]/40 pl-3">
                        <span className="text-[color:var(--color-brass-deep)] not-italic text-[10px] mr-2">[{q.target}]</span>
                        {q.question}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      {editing && (
        <ThreadEditor
          thread={editing}
          isNew={isNew}
          onSave={save}
          onCancel={() => { setEditing(null); setIsNew(false); }}
        />
      )}
    </div>
  );
}

function ThreadEditor({
  thread, isNew, onSave, onCancel,
}: {
  thread: Thread;
  isNew: boolean;
  onSave: (t: Thread) => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [th, setTh] = useState<Thread>(thread);
  const inputCls = 'w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]';

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[560px] w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{isNew ? t('threads.add') : t('common.edit')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <div className="grid grid-cols-[70px_1fr] gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">No.</div>
            <input
              type="number" min={1} max={10} value={th.num}
              onChange={(e) => setTh({ ...th, num: (parseInt(e.target.value, 10) || 1) as Thread['num'] })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('threads.field.title')}</div>
            <input type="text" value={th.title} autoFocus onChange={(e) => setTh({ ...th, title: e.target.value })} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('threads.field.subtitle')}</div>
          <input type="text" value={th.subtitle} onChange={(e) => setTh({ ...th, subtitle: e.target.value })} className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('threads.owner')}</div>
            <select value={th.owner} onChange={(e) => setTh({ ...th, owner: e.target.value as ThreadOwner })} className={inputCls}>
              {OWNERS.map((o) => <option key={o} value={o}>{ownerLabel(o, state.four)}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('common.status')}</div>
            <select value={th.status} onChange={(e) => setTh({ ...th, status: e.target.value as ThreadStatus })} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{t(`threads.status.${s === 'in-cut' ? 'incut' : s}` as StringKey)}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('threads.field.synopsis')}</div>
          <textarea value={th.synopsis} rows={3} onChange={(e) => setTh({ ...th, synopsis: e.target.value })} className={`${inputCls} italic leading-relaxed`} />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
          <button
            type="button"
            onClick={() => onSave(th)}
            disabled={!th.title.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
