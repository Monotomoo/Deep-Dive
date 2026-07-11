import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function RisksView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('risks.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('risks.subtitle')}</p>
      </header>
      <ul className="space-y-3">
        {state.risks.map((r) => (
          <li key={r.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
            <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{r.title}</div>
            <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)] mt-1">
              {r.category} · P{r.probabilityScale ?? '—'} × I{r.impactScale ?? '—'}
            </div>
            <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] mt-2">{r.description}</p>
            <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 italic">Mitigation: {r.mitigation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
