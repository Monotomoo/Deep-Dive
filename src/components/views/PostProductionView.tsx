import { useT } from '../../i18n';

export function PostProductionView() {
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('post.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('post.subtitle')}</p>
      </header>
      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-6">
        <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)] mb-3">two forms from one journey</div>
        <ul className="space-y-3 prose-body text-[14px] text-[color:var(--color-on-paper)]">
          <li><span className="display-italic text-[18px]">Feature</span> · 90-100 minutes · Sundance / Berlinale premiere target · one continuous breath</li>
          <li><span className="display-italic text-[18px]">Series</span> · 3 episodes · The Bond · The Wound · The Rise</li>
        </ul>
      </section>
    </div>
  );
}
