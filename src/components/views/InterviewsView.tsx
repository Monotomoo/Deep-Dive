import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function InterviewsView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('interviews.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('interviews.subtitle')}</p>
      </header>
      {state.interviews.length === 0 ? (
        <div className="prose-body italic text-[color:var(--color-on-paper-faint)]">No interviews captured yet. Sicily footage + transcripts arrive here.</div>
      ) : (
        <ul className="space-y-3">
          {state.interviews.map((iv) => {
            const shoot = state.shoots.find((s) => s.id === iv.shootId);
            const person = state.four.find((f) => f.key === iv.personKey);
            return (
              <li key={iv.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
                <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{person?.name ?? iv.personKey} · {shoot?.title ?? iv.shootId}</div>
                <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{iv.setting} · {iv.date} · {iv.status}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
