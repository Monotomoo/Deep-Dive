import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { SwingStatus } from '../../types';

export function SwingsView() {
  const { state } = useApp();
  const t = useT();

  const groups: { status: SwingStatus; label: string }[] = [
    { status: 'achieved',  label: t('swings.status.achieved') },
    { status: 'in-cut',    label: t('swings.status.in-cut') },
    { status: 'in-final',  label: t('swings.status.in-final') },
    { status: 'planned',   label: t('swings.status.planned') },
    { status: 'attempted', label: t('swings.status.attempted') },
    { status: 'idea',      label: t('swings.status.idea') },
    { status: 'dropped',   label: t('swings.status.dropped') },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('swings.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('swings.subtitle')}</p>
      </header>

      {groups.map((g) => {
        const items = state.swings.filter((s) => s.status === g.status);
        if (items.length === 0) return null;
        return (
          <section key={g.status}>
            <h3 className={`label-caps mb-3 ${g.status === 'achieved' ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-brass-deep)]'}`}>
              {g.label} · {items.length}
            </h3>
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className={`bg-[color:var(--color-paper-light)] border-[0.5px] rounded-[3px] p-4 ${s.status === 'achieved' ? 'border-[color:var(--color-brass)]' : 'border-[color:var(--color-border-paper)]'}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-snug">{s.title}</span>
                    {s.status === 'achieved' && <span className="label-caps text-[9px] text-[color:var(--color-brass)]">★ ACHIEVED</span>}
                  </div>
                  <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] mt-2 leading-relaxed">{s.description}</p>
                  {s.achievedNote && (
                    <div className="mt-2 pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('swings.achieved.at')} {s.achievedAt}</div>
                      <div className="display-italic italic text-[14px] text-[color:var(--color-brass-deep)] mt-1">{s.achievedNote}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
