import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function JournalView() {
  const { state } = useApp();
  const t = useT();
  const sorted = [...state.journalEntries].sort((a, b) => (a.date > b.date ? -1 : 1));
  return (
    <div className="space-y-6 max-w-[900px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('journal.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('journal.subtitle')}</p>
      </header>
      <ul className="space-y-3">
        {sorted.map((e) => (
          <li key={e.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
            <header className="flex items-baseline justify-between mb-2">
              <span className="tabular-nums text-[11px] text-[color:var(--color-brass-deep)]">{e.date}{e.dayNum ? ` · DAY ${e.dayNum}` : ''}</span>
              <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{e.moodTag}</span>
            </header>
            <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper)] leading-relaxed">{e.whatHappened}</p>
            {e.weather && <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-1">weather · {e.weather}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
