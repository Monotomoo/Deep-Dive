import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function CrewView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('crew.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('crew.subtitle')}</p>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.crew.map((c) => (
          <li key={c.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">{c.name}</div>
            <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-1">{c.role}</div>
            {c.link && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-1">{c.link}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
