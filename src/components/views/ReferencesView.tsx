import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function ReferencesView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('references.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('references.subtitle')}</p>
      </header>
      <ul className="space-y-3">
        {state.references.map((r) => (
          <li key={r.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
            <div className="flex items-baseline gap-2">
              <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{r.type}</span>
              {r.year && <span className="tabular-nums text-[10px] text-[color:var(--color-on-paper-muted)]">{r.year}</span>}
            </div>
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">{r.title}</div>
            {r.director && <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-0.5">dir. {r.director}</div>}
            {r.author && <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-0.5">{r.author}</div>}
            <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] mt-2 leading-relaxed">{r.whyItMatters}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
