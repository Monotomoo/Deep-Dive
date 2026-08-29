import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/* Click-to-edit text — the one implementation, shared by every view.

   There is no edit mode anywhere in this app any more: you click a word and it
   becomes an input. That is only safe because of three guards, and all three
   exist because of how this particular app stores its state.

   1. THE CONFLICT GUARD — the important one.
      The crew share ONE cloud document, last-write-wins. When another member
      saves, AppContext dispatches HYDRATE, which reducer.ts:295 treats as a
      total state replacement, and history.ts keeps HYDRATE out of the undo
      stack entirely. So if an editor is sitting open while their save lands,
      its stale draft would, on blur, be written straight over their work —
      and they could never undo it, because their `past` never held it.
      Always-on editing widens that window from "while I chose to be editing"
      to "until I next click something", so we capture the value we started
      from and refuse to commit over a value that has moved underneath us.
      The editor stays open, marked, holding your text: you decide.

   2. THE NO-OP GUARD — open a field, change nothing, close. That must not
      reach the reducer, or every stray click burns one of the 30 undo steps.

   3. THE SELECTION GUARD — a director drag-selects a sentence of the
      screenplay to quote it. Opening an editor on that release would swallow
      the selection. We compare where the pointer went down and came up rather
      than reading window.getSelection(), which still reports the old
      selection when you click inside it to collapse it, and would eat the
      first click every time. */

interface Props {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
  rows?: number;
  title?: string;
  /* Lets a draggable parent switch dragging off while an input is focused —
     otherwise the browser takes the pointer and you cannot select a word. */
  onOpenChange?: (open: boolean) => void;
  /* Rendered instead of the placeholder when empty and not editing. */
  emptyAs?: ReactNode;
}

/* Pointer travel beyond this many px between down and up is a drag, not a
   click — either a text selection or the start of a drag-and-drop. */
const CLICK_SLOP = 4;

export function EditableText({
  value, onSave, placeholder, multiline = false, className = '', style,
  rows = 2, title, onOpenChange, emptyAs,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [conflict, setConflict] = useState(false);

  /* What the field held when this edit began. Compared against the live value
     at commit time to detect a remote change. */
  const baseRef = useRef(value);
  /* The live prop, readable from inside a stale closure (blur handlers run
     with whatever they captured, which is exactly the bug we are guarding). */
  const liveRef = useRef(value);
  liveRef.current = value;
  const downRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  function begin() {
    baseRef.current = value;
    setDraft(value);
    setConflict(false);
    setOpen(true);
  }

  function close() { setOpen(false); setConflict(false); }

  function commit() {
    /* Compare exactly what we would save, so a field can never look unchanged
       and still dispatch (the old copies compared raw and saved trimmed). */
    const next = multiline ? draft : draft.trim();
    if (next === baseRef.current) { close(); return; }          // guard 2
    if (liveRef.current !== baseRef.current) { setConflict(true); return; } // guard 1
    onSave(next);
    close();
  }

  if (open) {
    const shell = `bg-[color:var(--color-paper-light)] border-[0.5px] rounded-[3px] px-1.5 py-0.5 outline-none w-full ${
      conflict ? 'border-[color:var(--color-danger)]' : 'border-[color:var(--color-brass)]'
    }`;
    const shared = {
      autoFocus: true,
      value: draft,
      onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
      /* Blur must not silently drop a conflicted draft — keep it on screen. */
      onBlur: () => { if (!conflict) commit(); },
      title: conflict
        ? 'Someone else changed this while you were typing. Press Enter to overwrite theirs, or Escape to keep theirs.'
        : title,
      style,
    };
    return (
      <span className="inline-flex flex-col w-full">
        {multiline ? (
          <textarea
            {...shared}
            rows={rows}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                if (conflict) { onSave(draft); close(); } else commit();
              }
            }}
            className={`${shell} ${className} resize-y`}
          />
        ) : (
          <input
            {...shared}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter') {
                /* A second Enter on a conflicted field is a deliberate
                   "mine wins" — the only way this ever overwrites someone. */
                if (conflict) { onSave(draft.trim()); close(); } else commit();
              }
            }}
            className={`${shell} ${className}`}
          />
        )}
        {conflict && (
          <span className="prose-body italic text-[10px] text-[color:var(--color-danger)] mt-0.5 leading-tight">
            someone else edited this — Enter keeps yours, Esc keeps theirs
          </span>
        )}
      </span>
    );
  }

  const empty = value.trim() === '';
  return (
    <span
      title={title}
      onMouseDown={(e) => { downRef.current = { x: e.clientX, y: e.clientY }; }}
      onMouseUp={(e) => {
        const d = downRef.current;
        downRef.current = null;
        if (d && (Math.abs(e.clientX - d.x) > CLICK_SLOP || Math.abs(e.clientY - d.y) > CLICK_SLOP)) return; // guard 3
        begin();
      }}
      className={`${className} cursor-text hover:bg-[color:var(--color-paper-deep)]/50 rounded-[2px] px-0.5 -mx-0.5 transition-colors ${
        empty ? 'italic opacity-40' : ''
      }`}
      style={style}
    >
      {empty ? (emptyAs ?? placeholder ?? '…') : value}
    </span>
  );
}
