import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function SpineView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('spine.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('spine.subtitle')}</p>
      </header>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the 5 questions</h3>
        <ol className="space-y-2">
          {state.spineQuestions.map((q) => (
            <li key={q.key} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="flex items-baseline gap-3">
                <span className="display-italic text-[32px] text-[color:var(--color-brass)] leading-none">{q.order}</span>
                <div>
                  <div className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-snug">{q.text}</div>
                  <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-1">{q.note}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('spine.matrix.header')}</h3>
        <div className="overflow-x-auto">
          <table className="text-[11px] w-full border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px]">
            <thead>
              <tr className="border-b-[0.5px] border-[color:var(--color-border-paper)]">
                <th className="p-2 text-left label-caps text-[9px] text-[color:var(--color-brass-deep)]">question</th>
                {state.four.map((f) => (
                  <th key={f.id} className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{f.name.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.spineQuestions.map((q) => (
                <tr key={q.key} className="border-b-[0.5px] border-[color:var(--color-border-paper)]/50 hover:bg-[color:var(--color-paper-deep)]/20">
                  <td className="p-2 prose-body italic text-[color:var(--color-on-paper)]">{q.text}</td>
                  {state.four.map((f) => {
                    const shootsCount = state.shoots.length;
                    const answered = state.spineAnswers.filter((a) => a.spineKey === q.key && a.personKey === f.key && a.answered).length;
                    return (
                      <td key={f.id} className="p-2 text-center tabular-nums">
                        <span className={answered > 0 ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-on-paper-faint)]'}>{answered}</span>
                        <span className="text-[color:var(--color-on-paper-faint)]"> / {shootsCount}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
