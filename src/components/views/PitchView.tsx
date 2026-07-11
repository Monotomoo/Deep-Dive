import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function PitchView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('pitch.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('pitch.subtitle')}</p>
      </header>
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">festival targets</h3>
        <ul className="space-y-2">
          {state.festivals.map((f) => (
            <li key={f.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 flex items-baseline justify-between gap-3">
              <div>
                <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{f.name}</div>
                <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{f.city}, {f.country} · {f.category}</div>
              </div>
              <div className="text-right text-[11px]">
                <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{f.status}</div>
                {f.fitScore && <div className="tabular-nums text-[color:var(--color-on-paper-muted)]">fit {f.fitScore}/5</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
