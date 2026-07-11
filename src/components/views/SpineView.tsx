import { useState } from 'react';
import { Plus, Trash2, ThumbsUp } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { SpineIdea, SpineIdeaStatus } from '../../types';

const STATUSES: SpineIdeaStatus[] = ['idea', 'discussing', 'leading', 'dropped'];

const STATUS_TONE: Record<SpineIdeaStatus, string> = {
  idea:       'var(--color-on-paper-muted)',
  discussing: 'var(--color-brass)',
  leading:    'var(--color-success)',
  dropped:    'var(--color-coral-deep)',
};

export function SpineView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [drafting, setDrafting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  function addIdea() {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_SPINE_IDEA',
      idea: {
        id: `spine-${Date.now()}`,
        title: newTitle.trim() || 'Untitled idea',
        body: newBody.trim(),
        status: 'idea',
        votes: 0,
        createdAt: now,
        updatedAt: now,
      },
    });
    setNewTitle('');
    setNewBody('');
    setDrafting(false);
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header className="flex items-baseline justify-between gap-6 flex-wrap">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('spine.title')}</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('spine.subtitle')}</p>
        </div>
        {!drafting && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[color:var(--color-brass)] text-[color:var(--color-paper)] rounded-[3px] label-caps text-[10px]"
            onClick={() => setDrafting(true)}
          >
            <Plus size={12} />
            {t('spine.add')}
          </button>
        )}
      </header>

      {drafting && (
        <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-5 space-y-3">
          <input
            className="w-full bg-transparent border-b border-[color:var(--color-border-paper)] display-italic text-[22px] text-[color:var(--color-on-paper)] outline-none py-2"
            placeholder="Idea title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="w-full bg-transparent border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 prose-body text-[14px] text-[color:var(--color-on-paper)] outline-none resize-y min-h-[100px]"
            placeholder="Longer description... why is this an interesting spine? what does it commit the film to?"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 label-caps text-[10px] text-[color:var(--color-on-paper-muted)]"
              onClick={() => { setDrafting(false); setNewTitle(''); setNewBody(''); }}
            >{t('common.cancel')}</button>
            <button
              className="px-4 py-1.5 bg-[color:var(--color-brass)] text-[color:var(--color-paper)] rounded-[3px] label-caps text-[10px]"
              onClick={addIdea}
            >{t('common.save')}</button>
          </div>
        </section>
      )}

      {state.spineIdeas.length === 0 && !drafting && (
        <div className="prose-body italic text-[color:var(--color-on-paper-faint)] p-6 border-[0.5px] border-dashed border-[color:var(--color-border-paper)] rounded-[3px] text-center">
          {t('spine.empty')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {STATUSES.map((status) => {
          const ideas = state.spineIdeas.filter((i) => i.status === status);
          return (
            <section key={status} className="min-h-[200px]">
              <header className="mb-3 pb-2 border-b-[0.5px] flex items-baseline justify-between" style={{ borderColor: STATUS_TONE[status] + '33' }}>
                <span className="label-caps" style={{ color: STATUS_TONE[status] }}>{t(`spine.status.${status}` as StringKey)}</span>
                <span className="tabular-nums text-[10px] text-[color:var(--color-on-paper-muted)]">{ideas.length}</span>
              </header>
              <div className="space-y-2">
                {ideas.map((i) => (<IdeaCard key={i.id} idea={i} />))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function IdeaCard({ idea }: { idea: SpineIdea }) {
  const { dispatch } = useApp();
  function cycleStatus() {
    const nextStatus: Record<SpineIdeaStatus, SpineIdeaStatus> = { idea: 'discussing', discussing: 'leading', leading: 'dropped', dropped: 'idea' };
    dispatch({ type: 'UPDATE_SPINE_IDEA', id: idea.id, patch: { status: nextStatus[idea.status], updatedAt: new Date().toISOString() } });
  }
  function vote() {
    dispatch({ type: 'UPDATE_SPINE_IDEA', id: idea.id, patch: { votes: (idea.votes ?? 0) + 1, updatedAt: new Date().toISOString() } });
  }
  function remove() {
    dispatch({ type: 'DELETE_SPINE_IDEA', id: idea.id });
  }
  return (
    <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 group">
      <div className="display-italic text-[16px] text-[color:var(--color-on-paper)] leading-snug">{idea.title}</div>
      {idea.body && <div className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 leading-relaxed">{idea.body}</div>}
      <div className="flex items-center justify-between mt-3 pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)] opacity-70 group-hover:opacity-100 transition-opacity">
        <button className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]" onClick={vote} title="vote">
          <ThumbsUp size={11} />
          <span className="tabular-nums">{idea.votes ?? 0}</span>
        </button>
        <button className="text-[10px] label-caps text-[color:var(--color-brass-deep)] hover:text-[color:var(--color-brass)]" onClick={cycleStatus} title="cycle status">→ next</button>
        <button className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral-deep)]" onClick={remove} title="delete">
          <Trash2 size={11} />
        </button>
      </div>
    </article>
  );
}
