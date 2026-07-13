import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, Pencil, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import {
  getConnections, refTitle, VIEW_FOR_ENTITY,
  type EntityRef, type EntityType,
} from '../lib/connections';

/* ConnectionDrawer — the "everything connected in one place" panel.
   Open it on any entity; it shows every linked person / topic / place /
   event / idea / interview / thread, grouped. Click any connection to
   re-focus the drawer on it (browse the graph), jump to its home view,
   or edit it. Shared by Cast, Idea Hub, and Interviews. */

const TYPE_LABEL: Record<EntityType, string> = {
  four: 'person', talent: 'cast', event: 'event', topic: 'topic',
  idea: 'idea', interview: 'interview', shoot: 'shoot', thread: 'thread',
};

export function ConnectionDrawer({
  focus,
  onClose,
  onEdit,
}: {
  focus: EntityRef | null;
  onClose: () => void;
  onEdit?: (ref: EntityRef) => void;
}) {
  const { state, dispatch } = useApp();
  /* Local focus so you can browse the graph inside the drawer,
     seeded from the incoming prop each time it opens. */
  const [ref, setRef] = useState<EntityRef | null>(focus);
  useEffect(() => { setRef(focus); }, [focus]);

  const title = useMemo(() => (ref ? refTitle(state, ref) : null), [state, ref]);
  const groups = useMemo(() => (ref ? getConnections(state, ref) : []), [state, ref]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (focus) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, onClose]);

  if (!focus || !ref || !title) return null;

  const detail = entityDetail(state, ref);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
      <button type="button" aria-label="close" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-[380px] max-w-[92vw] h-full bg-[color:var(--color-paper)] border-l-[0.5px] border-[color:var(--color-border-paper-strong)] shadow-[-8px_0_32px_rgba(0,0,0,0.18)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[color:var(--color-paper)] border-b-[0.5px] border-[color:var(--color-border-paper)] px-5 pt-5 pb-4" style={{ borderTop: `3px solid ${title.color}` }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{TYPE_LABEL[ref.type]} · {total} connections</div>
              <div className="display-italic text-[24px] text-[color:var(--color-on-paper)] leading-tight">{title.label}</div>
              {title.sub && <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-0.5 leading-snug">{title.sub}</div>}
            </div>
            <button type="button" onClick={onClose} className="shrink-0 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"><X size={18} /></button>
          </div>

          {detail && <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2">{detail}</p>}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => { dispatch({ type: 'SET_VIEW', view: VIEW_FOR_ENTITY[ref.type] }); onClose(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[11px] hover:bg-[color:var(--color-brass-deep)] transition-colors"
            >
              Open view <ArrowUpRight size={11} />
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ref)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper-strong)] text-[11px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"
              >
                <Pencil size={11} /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Groups */}
        <div className="px-5 py-4 space-y-4">
          {total === 0 && (
            <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)] py-6 text-center">
              Nothing connected yet. Wire it up from its editor.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.key}>
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1.5">{g.label} · {g.items.length}</div>
              <ul className="space-y-1">
                {g.items.map((it) => (
                  <li key={`${it.type}:${it.id}`}>
                    <button
                      type="button"
                      onClick={() => setRef({ type: it.type, id: it.id })}
                      className="group w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-[3px] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)] transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] text-[color:var(--color-on-paper)] truncate">{it.label}</span>
                        {it.sub && <span className="block prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] truncate">{it.sub}</span>}
                      </span>
                      <ChevronRight size={13} className="shrink-0 text-[color:var(--color-on-paper-faint)] group-hover:text-[color:var(--color-brass)]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* A short one-line detail for the focused entity's header. */
function entityDetail(state: ReturnType<typeof useApp>['state'], ref: EntityRef): string | null {
  switch (ref.type) {
    case 'four':      return state.four.find((f) => f.key === ref.id)?.bio ?? null;
    case 'talent':    return state.talents.find((t) => t.id === ref.id)?.whyInFilm ?? state.talents.find((t) => t.id === ref.id)?.bio ?? null;
    case 'event':     return state.storyEvents.find((e) => e.id === ref.id)?.summary ?? null;
    case 'topic':     return state.topics.find((t) => t.id === ref.id)?.question ?? null;
    case 'idea':      return state.hubIdeas.find((i) => i.id === ref.id)?.body ?? null;
    case 'thread':    return state.threads.find((t) => t.id === ref.id)?.synopsis ?? null;
    case 'shoot':     return state.shoots.find((s) => s.id === ref.id)?.spirit ?? null;
    case 'interview': {
      const iv = state.interviews.find((x) => x.id === ref.id);
      return iv?.standoutQuotes?.[0] ? `“${iv.standoutQuotes[0]}”` : iv?.notes ?? null;
    }
  }
}
