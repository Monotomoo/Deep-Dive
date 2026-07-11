import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function PhysiologyView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('physiology.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('physiology.subtitle')}</p>
      </header>
      <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-6">
        <p className="prose-body italic text-[15px] text-[color:var(--color-on-paper)] leading-relaxed">
          The film's music built from real physiology — the 20-beat heart, the blood shift, the brain under low O2.
          Vito's lab becomes the orchestra. This surface holds the data Vito captures at the University of Rijeka.
          Fill during the Rijeka/Zagreb shoot.
        </p>
      </div>
      {state.physiology.length > 0 && (
        <ul className="space-y-2">
          {state.physiology.map((p) => (
            <li key={p.id} className="border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 text-[12px]">
              <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{p.metric} · {p.personKey}</div>
              <div className="prose-body italic text-[color:var(--color-on-paper-muted)]">{p.contextNote}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
