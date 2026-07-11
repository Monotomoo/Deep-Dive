import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function WatchersView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-6 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('watchers.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('watchers.subtitle')}</p>
      </header>
      <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-6">
        <p className="prose-body italic text-[15px] text-[color:var(--color-on-paper)] leading-relaxed">
          When one goes down, we film the OTHER THREE at the surface. Their face when the card shows is often more
          important than the diver's. This is the film's emotional centre. Log every watcher moment here as you cut.
        </p>
      </div>
      {state.watcherMoments.length === 0 && (
        <p className="prose-body italic text-[color:var(--color-on-paper-faint)]">No watcher moments logged yet. Sicily has C2 coverage lined up.</p>
      )}
    </div>
  );
}
