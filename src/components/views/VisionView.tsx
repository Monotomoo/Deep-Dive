import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function VisionView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-10 max-w-[1000px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('vision.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('vision.subtitle')}</p>
      </header>

      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-10 text-center">
        <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)] mb-4">north star · the thesis</div>
        <div className="display-italic italic text-[38px] text-[color:var(--color-on-paper)] leading-snug">
          {t('vision.thesis')}
        </div>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the film in one breath</h3>
        <p className="prose-body italic text-[16px] text-[color:var(--color-on-paper)] leading-relaxed">
          One person holds another in the world. Not a film about depth, or records, or even freediving —
          a film about the bonds that make the impossible possible: mentorship, trust, love, the people who see more in
          us than we see in ourselves. Freediving is how it's told, because freediving makes the bond visible:
          someone goes into the dark alone, and someone waits at the surface to bring them back.
        </p>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('vision.grammar')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
            <div className="label-caps text-[10px] text-[color:var(--color-brass)] mb-2">above the surface</div>
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">alive · moving · social</div>
            <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">
              Boats, laughter, festivals, the waiting. The camera lives among them.
            </p>
          </div>
          <div className="bg-[color:var(--color-chrome)] border-[0.5px] border-[color:var(--color-chrome-elevated)] rounded-[3px] p-5">
            <div className="label-caps text-[10px] text-[color:var(--color-brass)] mb-2">below the surface</div>
            <div className="display-italic text-[20px] text-[color:var(--color-on-chrome)]">sacred · slow · held</div>
            <p className="prose-body italic text-[12px] text-[color:var(--color-on-chrome-muted)] mt-2 leading-snug">
              In the still moment before a dive · in the descent · in the silence. Everything holds.
            </p>
          </div>
        </div>
        <p className="prose-body italic text-[15px] text-[color:var(--color-on-paper)] text-center mt-6">
          {t('vision.grammar.text')}
        </p>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the four · arcs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.four.map((f) => (
            <article key={f.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight">{f.name}</div>
              <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-1">{f.role}</div>
              <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] mt-3 leading-relaxed">{f.arcNote}</div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">how the film speaks · devices</h3>
        <ol className="space-y-3">
          {state.devices.map((d, i) => (
            <li key={d.id} className="border-l-2 border-[color:var(--color-brass)] pl-4 py-1">
              <div className="flex items-baseline gap-3">
                <span className="tabular-nums text-[color:var(--color-brass-deep)] text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{d.title}</div>
              </div>
              <p className="prose-body text-[13px] text-[color:var(--color-on-paper-muted)] mt-1 leading-relaxed">{d.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the shape</h3>
        <ul className="space-y-3">
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">The Bond · surface</div>
            <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)]">Who they are · the four · the mentorship · the world they're about to risk.</div>
          </li>
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">The Wound · descent</div>
            <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)]">2023 · the inner world · the philosophy · body and mind under pressure.</div>
          </li>
          <li className="border-l-2 border-[color:var(--color-brass)] pl-4">
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)]">The Rise · ascent</div>
            <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)]">The records · the vindication · the recognition · and something they do together, free.</div>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the 10 threads · at a glance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {state.threads.map((th) => (
            <div key={th.id} className="border-b-[0.5px] border-[color:var(--color-border-paper)] pb-1">
              <div className="flex items-baseline gap-2 text-[13px]">
                <span className="tabular-nums text-[color:var(--color-brass-deep)] text-[10px] w-6">{String(th.num).padStart(2, '0')}</span>
                <span className="display-italic text-[color:var(--color-on-paper)] flex-1">{th.title}</span>
              </div>
              <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)] pl-8">{th.subtitle}</div>
            </div>
          ))}
        </div>
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
