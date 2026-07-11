import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function ScheduleView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('schedule.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('schedule.subtitle')}</p>
      </header>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">phases</h3>
        <ul className="space-y-2">
          {state.schedulePhases.map((p) => (
            <li key={p.id} className="flex items-baseline gap-3 py-2 border-b-[0.5px] border-[color:var(--color-border-paper)]">
              <span className="display-italic text-[16px] text-[color:var(--color-on-paper)] flex-1">{p.label}</span>
              <span className="tabular-nums text-[11px] text-[color:var(--color-on-paper-muted)]">{p.start} → {p.end}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">milestones</h3>
        <ul className="space-y-2">
          {state.milestones.map((m) => (
            <li key={m.id} className="flex items-baseline gap-3 py-2 border-b-[0.5px] border-[color:var(--color-border-paper)]">
              <span className="tabular-nums text-[11px] text-[color:var(--color-brass-deep)] w-24">{m.date}</span>
              <span className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] flex-1">{m.label}</span>
              {m.status && <span className={`label-caps text-[9px] ${m.status === 'done' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>{m.status}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
