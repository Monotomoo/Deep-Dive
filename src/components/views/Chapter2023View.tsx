import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function Chapter2023View() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('chapter-2023.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('chapter-2023.subtitle')}</p>
      </header>

      {/* Draft / unverified warning — this chapter touches real people and a
         real, sensitive case; nothing here is confirmed yet. */}
      <section
        className="rounded-[3px] border-[0.5px] border-[color:var(--color-coral)] p-4"
        style={{ background: 'color-mix(in oklab, var(--color-coral) 8%, transparent)' }}
      >
        <div className="label-caps text-[10px] text-[color:var(--color-coral)] mb-1.5">⚠ draft · needs editing</div>
        <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-relaxed">
          This is a <span className="italic">draft version composed for the start</span>, and some of the information here is
          unverified. Treat every line as provisional — it needs to be checked, sourced, and confirmed with
          Petar, Vito, Sanda and Zsófia before any of it is used or shown.
        </p>
      </section>

      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-6">
        <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)] mb-2">the case, in one line</div>
        <p className="display-italic italic text-[18px] text-[color:var(--color-on-paper)] leading-snug">
          Tests negative. Own federation didn't ban them. Punished anyway through a 3-page Code of Ethics.
          Peer-reviewed paper argues it was procedurally and ethically wrong.
        </p>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">evidence library</h3>
        <ul className="space-y-3">
          {state.evidence2023.map((e) => (
            <li key={e.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{e.type}</span>
                {e.onFile && <span className="label-caps text-[9px] text-[color:var(--color-success)]">on file</span>}
              </div>
              <div className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-snug">{e.title}</div>
              {e.author && <div className="prose-body italic text-[12px] text-[color:var(--color-brass-deep)] mt-1">{e.author}</div>}
              <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)]">{e.source}</div>
              <p className="prose-body text-[13px] text-[color:var(--color-on-paper)] mt-2 leading-relaxed">{e.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-6">
        <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)] mb-3">the non-negotiables</div>
        <ol className="space-y-2 prose-body text-[13px] text-[color:var(--color-on-paper)]">
          <li>1 · The four see every 2023 frame before the world does. Veto power in the edit.</li>
          <li>2 · Their truth is the spine. We build around their account, not over it.</li>
          <li>3 · Consent at every step · right to stop, any day, any reason.</li>
          <li>4 · Rigour, never spectacle. Everything sourced or it doesn't go in.</li>
          <li>5 · Nothing that makes them wince.</li>
        </ol>
      </section>
    </div>
  );
}
