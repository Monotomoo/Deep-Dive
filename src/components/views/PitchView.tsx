import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { useI18n } from '../../i18n';
import type { StringKey } from '../../i18n';

/* Pitch · one film, four audiences.
   The same log line lands differently on a sponsor, on HAVC, on a festival
   programmer, and on a person we want inside the film. Each tab is the
   version of the pitch tuned to that room. */

type Audience = 'sponsors' | 'havc' | 'festivals' | 'contacts';

const LOG_LINE =
  'Four of the best freedivers alive. One mentor, two couples, a record passed between best friends. ' +
  'Not a film about depth — a film about who waits for you at the surface.';

interface PitchContent {
  angle: string[];
  ask: string[];
  proof: string[];
}

const CONTENT: Record<Audience, PitchContent> = {
  sponsors: {
    angle: [
      'An authentic global sports story with a built-in news cycle: a Guinness 29:03 breath-hold, the first woman to 300m in a pool, a 17-year record finally broken — all inside our cast, all within the production window.',
      'Audiences this film reaches natively: freediving + scuba, open-water swimming, breathwork and wellness, adventure documentary viewers — the Free Solo / Deepest Breath demographic.',
      'The Etna eruption during our Sicily shoot is already captured. The opening sequence exists. This is a de-risked film with a miracle in the can.',
    ],
    ask: [
      'Title partner — category-exclusive, name attached to the theatrical + festival run.',
      'Gear + travel partners — in-kind against credits, BTS content, athlete access.',
      'Athlete-level partnerships — each of the four carries their own audience and record headlines.',
    ],
    proof: [
      'Two of seven shoots complete (Krk, Sicily) — footage exists, not promises.',
      'All four leads locked, exclusive access, releases in progress.',
      'Record headlines from our cast covered by France24, Guinness, DeeperBlue, Divernet within the last 14 months.',
    ],
  },
  havc: {
    angle: [
      'A Croatian story of world significance: two Croatian world-record holders, the Croatian mentor-scientist at the University of Rijeka hyperbaric centre, the Adriatic as a central character — Krk, Lastovo, Rijeka.',
      'Croatian-language film with international reach: HR/EN bilingual by design, with Zsófia\'s English interviews carrying it to Sundance-tier festivals.',
      'The 2023 chapter is a matter of Croatian sporting justice — told with a peer-reviewed academic paper behind it, not tabloid framing.',
    ],
    ask: [
      'Production support for a feature documentary (90–100 min) + 3-episode series.',
      'Qualifying Croatian spend concentrated in Rijeka, Krk, Lastovo + Zagreb post-production.',
      'Development already self-financed — HAVC enters a moving train.',
    ],
    proof: [
      'Two shoots complete on schedule and self-funded.',
      'University of Rijeka scientific collaboration attached (Vito on teaching staff).',
      'Clear festival strategy: world premiere international, home premiere ZagrebDox.',
    ],
  },
  festivals: {
    angle: [
      'Ensemble, not solo-hero: where Free Solo and The Deepest Breath follow one obsession, Deep Dive follows a bond — one mentor, two couples, a record that passed between best friends and did not break them.',
      'Formal ambition: a score built from the divers\' real physiology, a full record dive in unbroken real time, a descent monologue braided across two languages.',
      'From inside the sport, not above it — the director films with the safety team, and the sport\'s own federation-crisis chapter is told with the athletes, not about them.',
    ],
    ask: [
      'World premiere: Sundance World Documentary Competition (alternative: IDFA main competition).',
      'European premiere: Berlinale Panorama Dokumente or CPH:DOX Dox:Award.',
      'Home premiere: ZagrebDox — after the international bow.',
    ],
    proof: [
      'The Etna opening is shot. The film\'s most expensive image already exists.',
      'Cast holds current world records — the film stays news through the festival cycle.',
      'HR/EN bilingual, subtitled master planned from day one.',
    ],
  },
  contacts: {
    angle: [
      'The film needs specific people and institutions inside it — as partners, verifiers, and doors. This is the map of who, and what each one unlocks.',
      'Everyone on this list is already adjacent to the four: their university, their federation, their record-keepers, their brands.',
    ],
    ask: [
      'University of Rijeka — hyperbaric centre access, lab shoot (the score-as-body swing).',
      'AIDA Croatia — sanctioning + competition access (Vito heads the branch).',
      'Guinness World Records — archival of the 29:03 attempt + the 107m walk.',
      'Molchanovs — Zsófia\'s brand; global freediving community reach.',
      'Acrisure — Sanda\'s sponsor; precedent of corporate backing in the cast.',
    ],
    proof: [
      'Two Guinness records inside the cast — the record-keepers already know these names.',
      'Vito\'s dual role (subject + scientist) makes the university a co-author, not a location.',
      'The 2023 chapter\'s academic paper gives institutional partners a safe, sourced frame.',
    ],
  },
};

const TABS: { key: Audience; labelKey: StringKey }[] = [
  { key: 'sponsors',  labelKey: 'pitch.tab.sponsors' },
  { key: 'havc',      labelKey: 'pitch.tab.havc' },
  { key: 'festivals', labelKey: 'pitch.tab.festivals' },
  { key: 'contacts',  labelKey: 'pitch.tab.contacts' },
];

export function PitchView() {
  const { state } = useApp();
  const { t, fmtDate, fmtCurrency } = useI18n();
  const [tab, setTab] = useState<Audience>('sponsors');
  const content = CONTENT[tab];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('pitch.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('pitch.subtitle')}</p>
      </header>

      {/* Shared log line */}
      <div className="bg-[color:var(--color-chrome)] rounded-[3px] p-5">
        <div className="label-caps text-[9px] text-[color:var(--color-brass)] mb-2">{t('pitch.section.logline')}</div>
        <p className="display-italic text-[20px] leading-snug text-[color:var(--color-paper-light)]">
          {LOG_LINE}
        </p>
      </div>

      {/* Audience tabs */}
      <div className="flex rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden w-fit">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 font-sans text-[12px] tracking-wide transition-colors ${
              tab === tb.key
                ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
            }`}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      {/* Angle · Ask · Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PitchColumn titleKey="pitch.section.angle" items={content.angle} />
        <PitchColumn titleKey="pitch.section.ask" items={content.ask} accent />
        <PitchColumn titleKey="pitch.section.proof" items={content.proof} />
      </div>

      {/* Targets per audience */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('pitch.section.targets')}</h3>

        {tab === 'festivals' && (
          <div className="overflow-x-auto bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b-[0.5px] border-[color:var(--color-border-paper)]">
                  <th className="text-left px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Festival</th>
                  <th className="text-left px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Section</th>
                  <th className="text-left px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('pitch.deadline')}</th>
                  <th className="text-right px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('pitch.fee')}</th>
                  <th className="text-right px-3 py-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">Fit</th>
                </tr>
              </thead>
              <tbody>
                {state.festivals.map((f) => (
                  <tr key={f.id} className="border-b-[0.5px] border-[color:var(--color-border-paper)] last:border-0 hover:bg-[color:var(--color-paper-card)]">
                    <td className="px-3 py-2">
                      <div className="display-italic text-[15px] text-[color:var(--color-on-paper)]">{f.name}</div>
                      <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)]">{f.city}, {f.country}{f.notes ? ` — ${f.notes}` : ''}</div>
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-on-paper-muted)]">{f.category}</td>
                    <td className="px-3 py-2 tabular-nums text-[color:var(--color-on-paper-muted)]">{f.deadline ? fmtDate(f.deadline) : '—'}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-[color:var(--color-on-paper-muted)]">{f.feeEur ? fmtCurrency(f.feeEur) : '—'}</td>
                    <td className="px-3 py-2 tabular-nums text-right">
                      <span className="text-[color:var(--color-brass)]">{'●'.repeat(f.fitScore ?? 0)}</span>
                      <span className="text-[color:var(--color-on-paper-faint)]">{'●'.repeat(Math.max(0, 5 - (f.fitScore ?? 0)))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'sponsors' && (
          state.sponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.sponsors.map((s) => (
                <div key={s.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 flex items-baseline justify-between gap-3">
                  <div>
                    <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{s.name}</div>
                    <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)]">{s.category} · tier {s.tier}</div>
                  </div>
                  <div className="text-right">
                    <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{s.status}</div>
                    <div className="tabular-nums text-[12px] text-[color:var(--color-on-paper-muted)]">{fmtCurrency(s.expectedAmount * 1000)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)]">
              {t('pitch.sponsors.empty')}
            </p>
          )
        )}

        {tab === 'havc' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">HAVC target · {state.activeScenario}</div>
              <div className="display-italic text-[28px] text-[color:var(--color-on-paper)] tabular-nums">
                {fmtCurrency((state.scenarios[state.activeScenario].funding.havc ?? 0) * 1000)}
              </div>
            </div>
            <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Format</div>
              <div className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug">Feature documentary 90–100 min<br />+ 3-episode series</div>
            </div>
            <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">Croatian spend</div>
              <div className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug">Rijeka · Krk · Lastovo shoots<br />Zagreb post-production</div>
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'University of Rijeka · hyperbaric centre', role: 'lab access · scientific partner', hook: 'Vito is on the teaching staff — the lab shoot makes them a co-author.' },
              { name: 'AIDA Croatia', role: 'federation · sanctioning', hook: 'Vito heads the branch. Competition access flows through here.' },
              { name: 'Guinness World Records', role: 'record verification · archive', hook: 'Two records in the cast: 29:03 static and the 107m underwater walk.' },
              { name: 'Molchanovs', role: 'brand · community reach', hook: "Zsófia's brand — the largest freediving community in the world." },
              { name: 'Acrisure', role: 'corporate sponsor precedent', hook: "Already backs Sanda — proof the cast carries corporate value." },
              { name: 'CMAS · the counterpart', role: 'the 2023 chapter', hook: 'Handled through the peer-reviewed paper — factual, sourced, no ambush.' },
            ].map((c) => (
              <div key={c.name} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
                <div className="display-italic text-[16px] text-[color:var(--color-on-paper)] leading-tight">{c.name}</div>
                <div className="prose-body italic text-[10px] text-[color:var(--color-brass)] mt-0.5 mb-1.5">{c.role}</div>
                <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug">{c.hook}</p>
              </div>
            ))}
            {state.salesAgents.map((a) => (
              <div key={a.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
                <div className="display-italic text-[16px]">{a.name}</div>
                <div className="prose-body italic text-[10px] text-[color:var(--color-brass)]">{a.territories.join(' · ')} · {a.status}</div>
              </div>
            ))}
            {state.broadcasters.map((b) => (
              <div key={b.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
                <div className="display-italic text-[16px]">{b.name}</div>
                <div className="prose-body italic text-[10px] text-[color:var(--color-brass)]">{b.country} · {b.slot} · {b.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PitchColumn({ titleKey, items, accent }: { titleKey: StringKey; items: string[]; accent?: boolean }) {
  const { t } = useI18n();
  return (
    <div
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4"
      style={accent ? { borderTop: '3px solid var(--color-brass)' } : { borderTop: '3px solid rgba(10,43,79,0.15)' }}
    >
      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">{t(titleKey)}</div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="prose-body text-[13px] text-[color:var(--color-on-paper)] leading-snug flex gap-2">
            <span className="text-[color:var(--color-brass)] shrink-0">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
