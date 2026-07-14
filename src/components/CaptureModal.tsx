import { useEffect, useRef, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import type { IdeaKind } from '../types';

/* Quick Capture — the floating mic button and ⌘. land here.
   One box, zero friction: type the thought, pick a flavour, Enter.
   It lands in the Idea Hub as a fresh idea, ready to be wired later. */

const KINDS: { key: IdeaKind; label: string; color: string }[] = [
  { key: 'scene',     label: 'scene',     color: '#d96c3d' },
  { key: 'shot',      label: 'shot',      color: '#3d7a94' },
  { key: 'question',  label: 'question',  color: '#c9a961' },
  { key: 'sound',     label: 'sound',     color: '#6f8a72' },
  { key: 'story',     label: 'story',     color: '#4c6b93' },
  { key: 'logistics', label: 'logistics', color: '#8a8375' },
  { key: 'wild',      label: 'wild',      color: '#b54f26' },
];

export function CaptureModal() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<IdeaKind>('wild');
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = state.captureOpen;

  useEffect(() => {
    if (open) {
      setTitle(''); setBody(''); setKind('wild'); setSaved(false);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  function close() {
    dispatch({ type: 'OPEN_CAPTURE', open: false });
  }

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_HUB_IDEA',
      idea: {
        id: `hub-${Math.random().toString(36).slice(2, 9)}`,
        title: trimmed,
        body: body.trim() || undefined,
        kind, status: 'new', authorId: 'c-tomo',
        links: [], createdAt: now, updatedAt: now,
      },
    });
    setSaved(true);
    window.setTimeout(close, 650);
  }

  function goToHub() {
    close();
    dispatch({ type: 'SET_VIEW', view: 'idea-hub' });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-[2px] flex items-start justify-center pt-[16vh] p-4 no-print"
      onClick={close}
    >
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] w-full max-w-[560px] p-5 space-y-3 shadow-[0_18px_60px_rgba(4,21,49,0.4)]"
        style={{ borderTop: '4px solid var(--color-brass)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.stopPropagation(); close(); }
          if (e.key === 'Enter' && !e.shiftKey && title.trim()) { e.preventDefault(); save(); }
        }}
      >
        <header className="flex items-center gap-2">
          <Lightbulb size={15} className="text-[color:var(--color-brass)]" />
          <div className="label-caps text-[10px] text-[color:var(--color-brass)]">quick capture → idea hub</div>
          <div className="flex-1" />
          <button type="button" onClick={close} className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper)]"><X size={15} /></button>
        </header>

        {saved ? (
          <div className="py-6 text-center">
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">Captured.</div>
            <button type="button" onClick={goToHub} className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-1 hover:text-[color:var(--color-brass-deep)]">
              open the Idea Hub →
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The thought, before it gets away…"
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-2.5 text-[15px] italic"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder="detail (optional)"
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-3 py-2 text-[12.5px]"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setKind(k.key)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] border-[0.5px] transition-all ${
                    kind === k.key ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)]'
                  }`}
                  style={kind === k.key ? { background: k.color } : {}}
                >
                  {k.label}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-[9px] tracking-[0.12em] uppercase text-[color:var(--color-on-paper-faint)]">enter · save</span>
              <button
                type="button"
                onClick={save}
                disabled={!title.trim()}
                className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40 hover:bg-[color:var(--color-brass-deep)] transition-colors"
              >
                Capture
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
