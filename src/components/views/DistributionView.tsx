import { useT } from '../../i18n';

export function DistributionView() {
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('distribution.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('distribution.subtitle')}</p>
      </header>
      <p className="prose-body italic text-[color:var(--color-on-paper-faint)]">Sales agents and broadcasters populated when we start pitching post-Lastovo.</p>
    </div>
  );
}
