import { useMemo, useState, type FormEvent } from 'react';
import { Check, MessageSquare, Pin, Trash2, Undo2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import type { Note, NoteTargetType } from '../../types';

/* Crew comments — margin notes on any entity.

   The Overview has been inviting the crew to "tell us what's wrong" since the
   beta banner went up, with nowhere to actually do it. The Note model and its
   reducer actions already existed and were never wired to a UI; this is that
   UI. Author is the signed-in crew email when the cloud is on, and a plain
   local label when it isn't, so comments work identically offline. */

function authorOf(note: Note): string {
  return note.authorLabel ?? note.authorId ?? 'someone';
}

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function useNotesFor(targetType: NoteTargetType, targetId: string): Note[] {
  const { state } = useApp();
  return useMemo(
    () =>
      state.notes
        .filter((n) => n.targetType === targetType && n.targetId === targetId)
        .sort((a, b) => {
          /* Pinned first, then unresolved, then newest. */
          if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
          if (!!a.resolvedAt !== !!b.resolvedAt) return a.resolvedAt ? 1 : -1;
          return b.createdAt.localeCompare(a.createdAt);
        }),
    [state.notes, targetType, targetId],
  );
}

export function unresolvedCount(notes: Note[]): number {
  return notes.filter((n) => !n.resolvedAt).length;
}

/** Small count chip — put it on a card header to show a conversation exists. */
export function CommentBadge({ targetType, targetId }: { targetType: NoteTargetType; targetId: string }) {
  const notes = useNotesFor(targetType, targetId);
  const open = unresolvedCount(notes);
  if (notes.length === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px]"
      style={{ color: open > 0 ? 'var(--color-brass)' : 'var(--color-on-paper-faint)' }}
      title={`${notes.length} comment${notes.length === 1 ? '' : 's'}${open ? `, ${open} unresolved` : ', all resolved'}`}
    >
      <MessageSquare size={11} />
      {open > 0 ? open : notes.length}
    </span>
  );
}

interface Props {
  targetType: NoteTargetType;
  targetId: string;
  /** What the crew is commenting on — used in the placeholder. */
  label?: string;
}

export function CommentThread({ targetType, targetId, label }: Props) {
  const { dispatch, session, cloudEnabled } = useApp();
  const notes = useNotesFor(targetType, targetId);
  const [body, setBody] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const author = cloudEnabled && session?.user.email ? session.user.email : 'local note';
  const visible = showResolved ? notes : notes.filter((n) => !n.resolvedAt);
  const resolvedCount = notes.length - notes.filter((n) => !n.resolvedAt).length;

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    const note: Note = {
      id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      targetType,
      targetId,
      body: text,
      authorLabel: author,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTE', note });
    setBody('');
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className="text-[color:var(--color-on-paper-faint)]" />
        <h3 className="label-caps text-[color:var(--color-on-paper-muted)]">
          notes{notes.length > 0 ? ` · ${notes.length}` : ''}
        </h3>
        {resolvedCount > 0 && (
          <button
            type="button"
            onClick={() => setShowResolved((v) => !v)}
            className="ml-auto text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)] transition-colors"
          >
            {showResolved ? 'hide' : `show ${resolvedCount} resolved`}
          </button>
        )}
      </div>

      {visible.length > 0 && (
        <ul className="space-y-1.5">
          {visible.map((n) => (
            <li
              key={n.id}
              className={`group rounded-[3px] border-[0.5px] px-3 py-2 transition-colors ${
                n.resolvedAt
                  ? 'border-[color:var(--color-border-paper)] opacity-55'
                  : 'border-[color:var(--color-border-paper-strong)] bg-[color:var(--color-paper-card)]'
              }`}
            >
              <div className="flex items-start gap-2">
                {n.pinned && <Pin size={11} className="mt-1 shrink-0 text-[color:var(--color-brass)]" />}
                <p
                  className={`prose-body text-[13px] leading-snug flex-1 ${
                    n.resolvedAt ? 'line-through text-[color:var(--color-on-paper-faint)]' : 'text-[color:var(--color-on-paper)]'
                  }`}
                >
                  {n.body}
                </p>
                <span className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title={n.pinned ? 'unpin' : 'pin'}
                    onClick={() => dispatch({ type: 'UPDATE_NOTE', id: n.id, patch: { pinned: !n.pinned } })}
                    className="p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-brass)] transition-colors"
                  >
                    <Pin size={11} />
                  </button>
                  <button
                    type="button"
                    title={n.resolvedAt ? 'reopen' : 'resolve'}
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_NOTE',
                        id: n.id,
                        patch: { resolvedAt: n.resolvedAt ? undefined : new Date().toISOString() },
                      })
                    }
                    className="p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-success)] transition-colors"
                  >
                    {n.resolvedAt ? <Undo2 size={11} /> : <Check size={11} />}
                  </button>
                  <button
                    type="button"
                    title="delete"
                    onClick={() => dispatch({ type: 'DELETE_NOTE', id: n.id })}
                    className="p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)] transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              </div>
              <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-1">
                {authorOf(n)} · {when(n.createdAt)}
                {n.resolvedAt ? ' · resolved' : ''}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex items-start gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
          }}
          rows={2}
          placeholder={label ? `What's wrong with ${label}?` : "Tell us what's wrong…"}
          className="flex-1 resize-y bg-[color:var(--color-paper-light)] rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] px-2.5 py-1.5 prose-body text-[13px] text-[color:var(--color-on-paper)] outline-none focus:border-[color:var(--color-border-brass)]"
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="shrink-0 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[11px] tracking-[0.08em] uppercase disabled:opacity-35 hover:bg-[color:var(--color-brass-deep)] transition-colors"
        >
          note
        </button>
      </form>
      <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
        as {author} · ⌘↵ to post
      </div>
    </div>
  );
}
