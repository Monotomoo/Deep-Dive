import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { ThreadOwner, ThreadStatus } from '../../types';

export function ThreadsView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('threads.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('threads.subtitle')}</p>
      </header>

      <ul className="space-y-3">
        {state.threads.map((th) => {
          const qs = state.threadQuestions.filter((q) => q.threadId === th.id);
          return (
            <li key={th.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <header className="flex items-baseline justify-between gap-3 mb-2">
                <div>
                  <span className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">Thread {th.num.toString().padStart(2, '0')}</span>
                  <div className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight">{th.title}</div>
                  <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-0.5">{th.subtitle}</div>
                </div>
                <div className="flex flex-col items-end text-[11px]">
                  <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('threads.owner')}</span>
                  <span className="prose-body italic text-[color:var(--color-on-paper)]">{ownerLabel(th.owner, t)}</span>
                  <span className={`mt-1 label-caps text-[9px] ${statusColor(th.status)}`}>{th.status}</span>
                </div>
              </header>
              <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-relaxed">{th.synopsis}</p>
              {qs.length > 0 && (
                <details className="mt-2">
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
    </div>
  );
}

function ownerLabel(owner: ThreadOwner, t: (k: never) => string): string {
  if (owner === 'ensemble') return t('threads.owner.ensemble' as never);
  if (owner === 'petar-vito') return t('threads.owner.petar-vito' as never);
  if (owner === 'sanda-zsofia') return t('threads.owner.sanda-zsofia' as never);
  return owner;
}
function statusColor(s: ThreadStatus): string {
  switch (s) {
    case 'active':
    case 'ready':
      return 'text-[color:var(--color-success)]';
    case 'opening':
      return 'text-[color:var(--color-brass)]';
    case 'in-cut':
      return 'text-[color:var(--color-dock)]';
    default:
      return 'text-[color:var(--color-on-paper-faint)]';
  }
}
