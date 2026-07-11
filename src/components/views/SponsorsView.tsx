import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function SponsorsView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('sponsors.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('sponsors.subtitle')}</p>
      </header>
      {state.sponsors.length === 0 ? (
        <div className="text-[color:var(--color-on-paper-faint)] italic prose-body">No sponsors yet.</div>
      ) : (
        <ul className="space-y-2">
          {state.sponsors.map((s) => (
            <li key={s.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 flex items-baseline justify-between">
              <span className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{s.name}</span>
              <span className="tabular-nums text-[12px] text-[color:var(--color-brass-deep)]">{s.expectedAmount}k · {s.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
