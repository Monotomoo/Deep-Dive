import { useT } from '../../i18n';

export function VisionView() {
  const t = useT();
  return (
    <div className="space-y-8 max-w-[900px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('vision.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('vision.subtitle')}</p>
      </header>

      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-8 text-center">
        <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)] mb-3">north star · the thesis</div>
        <div className="display-italic text-[32px] text-[color:var(--color-on-paper)] leading-snug">
          {t('vision.thesis')}
        </div>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the film in one breath</h3>
        <p className="prose-body text-[15px] text-[color:var(--color-on-paper)] leading-relaxed">
          One person holds another in the world. Not a film about depth, or records, or even freediving —
          a film about the bonds that make the impossible possible: mentorship, trust, love, the people who see more in
          us than we see in ourselves. Freediving is how it's told, because freediving makes the bond visible:
          someone goes into the dark alone, and someone waits at the surface to bring them back.
        </p>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('vision.grammar')}</h3>
        <p className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-snug italic">
          {t('vision.grammar.text')}
        </p>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the shape</h3>
        <ul className="space-y-3">
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">The Bond · surface</div>
            <div className="prose-body text-[13px] text-[color:var(--color-on-paper-muted)]">Who they are · the four · the mentorship · the world they're about to risk.</div>
          </li>
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">The Wound · descent</div>
            <div className="prose-body text-[13px] text-[color:var(--color-on-paper-muted)]">2023 · the inner world · the philosophy · body and mind under pressure.</div>
          </li>
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">The Rise · ascent</div>
            <div className="prose-body text-[13px] text-[color:var(--color-on-paper-muted)]">The records · the vindication · the recognition · and something they do together, free.</div>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">where this is going</h3>
        <p className="prose-body text-[14px] text-[color:var(--color-on-paper)] leading-relaxed">
          Feature documentary (90–100 minutes) built to premiere at Sundance / Berlinale — and a three-episode series
          for television and streaming. Same story, same heart, two homes.
        </p>
      </section>
    </div>
  );
}
