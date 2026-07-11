import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function ContractsView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('contracts.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('contracts.subtitle')}</p>
      </header>
      <ul className="space-y-2">
        {state.contracts.map((c) => (
          <li key={c.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 flex items-baseline gap-3">
            <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] w-32">{c.type}</span>
            <span className="display-italic text-[16px] text-[color:var(--color-on-paper)] flex-1">{c.partyName}</span>
            <span className={`label-caps text-[9px] ${c.status === 'signed' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-brass-deep)]'}`}>{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
