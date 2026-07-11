import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function DevicesView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('devices.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('devices.subtitle')}</p>
      </header>

      <ul className="space-y-4">
        {state.devices.map((d) => (
          <li key={d.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
            <div className="display-italic text-[24px] text-[color:var(--color-on-paper)]">{d.title}</div>
            <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-relaxed mt-2">{d.description}</p>
            <div className="mt-3 flex items-baseline gap-4 text-[11px] text-[color:var(--color-on-paper-muted)]">
              <span>{d.captureIds.length} {t('devices.captures')}</span>
              {d.timesUsedInCut !== undefined && <span>{d.timesUsedInCut} {t('devices.used.in.cut')}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
