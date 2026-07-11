import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function FourView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('four.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('four.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.four.map((f) => (
          <article key={f.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-6">
            <header className="mb-3">
              <div className="display-italic text-[32px] text-[color:var(--color-on-paper)] leading-tight">{f.name}</div>
              <div className="prose-body italic text-[14px] text-[color:var(--color-brass)] mt-1">{f.role}</div>
              <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-1">{f.epithet}</div>
            </header>
            <div className="grid grid-cols-3 gap-2 mb-3 text-[12px]">
              <div><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] block">{t('four.hometown')}</span>{f.hometown}</div>
              <div><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] block">nationality</span>{f.nationality}</div>
              <div><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] block">{t('four.language')}</span>{f.languagePrimary.toUpperCase()}</div>
            </div>
            <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-relaxed mb-3">{f.bio}</p>
            <div className="border-t-[0.5px] border-[color:var(--color-border-paper)] pt-3">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('four.arc')}</div>
              <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{f.arcNote}</div>
            </div>
          </article>
        ))}
      </div>

      {state.talents.length > 0 && (
        <section>
          <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('four.related')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.talents.map((talent) => (
              <article key={talent.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
                <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{talent.name}</div>
                <div className="prose-body italic text-[11px] text-[color:var(--color-brass)]">{talent.role}</div>
                {talent.onCameraNotes && <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{talent.onCameraNotes}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
