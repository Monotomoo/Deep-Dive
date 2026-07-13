import { useMemo, useState } from 'react';
import { Eye, Quote, Trophy } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { FourKey, DivingRecord, LifeEventCategory } from '../../types';

/* The Four · a cinematic per-person dossier.
   Pick one of the four and their whole story assembles in their own
   colour — pulled live from every module: records, who holds them, their
   life, their own words (Choir + interviews), and the threads they carry. */

const CAT_COLOR: Record<LifeEventCategory, string> = {
  birth: '#d9a93e', 'first-dive': '#3d7a94', record: '#d96c3d', breakthrough: '#b54f26',
  loss: '#c94a3a', love: '#d96c3d', family: '#6f8a72', travel: '#4c6b93', crisis: '#8a3a2e', joy: '#6f8a72', other: '#8a8375',
};

function recordValue(r: DivingRecord): string {
  if (r.depthM != null) return `${r.depthM} m`;
  if (r.timeSeconds != null) { const m = Math.floor(r.timeSeconds / 60), s = r.timeSeconds % 60; return `${m}:${String(s).padStart(2, '0')}`; }
  if (r.distanceM != null) return `${r.distanceM} m`;
  return '—';
}
function ownersOf(owner: string): FourKey[] {
  if (owner === 'petar-vito') return ['petar', 'vito'];
  if (owner === 'sanda-zsofia') return ['sanda', 'zsofia'];
  if (owner === 'ensemble') return ['petar', 'vito', 'sanda', 'zsofia'];
  return [owner as FourKey];
}

export function FourView() {
  const { state } = useApp();
  const t = useT();
  const [selected, setSelected] = useState<FourKey>('petar');
  const person = state.four.find((f) => f.key === selected)!;
  const color = person.colorHint ?? 'var(--color-brass)';

  const dossier = useMemo(() => {
    const records = state.records.filter((r) => r.personKey === selected).sort((a, b) => (a.date < b.date ? 1 : -1));
    const holders = state.holders.filter((h) => h.subjectKey === selected);
    const life = state.lifeEvents.filter((e) => e.subjectKey === selected).sort((a, b) => a.year - b.year);
    const keyAnswers = state.choirEntries.filter((e) => e.subjectKey === selected && e.isKey).map((e) => ({ q: state.choirQuestions.find((q) => q.id === e.questionId)?.text ?? '', a: e.answer }));
    const quotes = state.interviews.filter((iv) => iv.personKey === selected).flatMap((iv) => iv.standoutQuotes ?? []);
    const threads = state.threads.filter((th) => ownersOf(th.owner).includes(selected));
    const watched = state.watcherMoments.filter((m) => m.watcherKey === selected || m.divingPersonKey === selected);
    return { records, holders, life, keyAnswers, quotes, threads, watched };
  }, [state, selected]);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('four.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('four.subtitle')}</p>
      </header>

      {/* Person selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {state.four.map((f) => {
          const on = f.key === selected;
          const c = f.colorHint ?? 'var(--color-brass)';
          return (
            <button key={f.key} type="button" onClick={() => setSelected(f.key)}
              className={`text-left rounded-[3px] p-3 border-[0.5px] transition-all ${on ? 'text-[color:var(--color-paper-light)]' : 'bg-[color:var(--color-paper-light)] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'}`}
              style={on ? { background: c, borderColor: c } : { borderLeft: `3px solid ${c}` }}>
              <div className={`display-italic text-[19px] leading-tight ${on ? 'text-[color:var(--color-paper-light)]' : 'text-[color:var(--color-on-paper)]'}`}>{f.name.split(' ')[0]}</div>
              <div className={`prose-body italic text-[10px] ${on ? 'text-[color:var(--color-paper-light)]/80' : 'text-[color:var(--color-brass)]'}`}>{f.role}</div>
            </button>
          );
        })}
      </div>

      {/* Hero */}
      <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] overflow-hidden" style={{ borderTop: `4px solid ${color}` }}>
        <div className="p-6" style={{ background: `color-mix(in oklab, ${color} 7%, transparent)` }}>
          <div className="display-italic text-[40px] text-[color:var(--color-on-paper)] leading-none">{person.name}</div>
          <div className="prose-body italic text-[15px] mt-1.5" style={{ color }}>{person.role} · {person.epithet}</div>
          <div className="flex flex-wrap gap-5 mt-3 text-[12px]">
            <Meta label={t('four.hometown')} value={person.hometown} />
            <Meta label="nationality" value={person.nationality} />
            <Meta label={t('four.language')} value={person.languagePrimary.toUpperCase()} />
          </div>
          <p className="prose-body text-[13.5px] text-[color:var(--color-on-paper)] leading-relaxed mt-4 max-w-[820px]">{person.bio}</p>
          <div className="mt-4 pt-4 border-t-[0.5px] border-[color:var(--color-border-paper)]">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('four.arc')}</div>
            <div className="display-italic text-[20px] text-[color:var(--color-on-paper)] leading-snug">{person.arcNote}</div>
          </div>
        </div>
      </section>

      {/* Dossier grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Records */}
        {dossier.records.length > 0 && (
          <Panel title="records" icon={<Trophy size={12} />} color={color}>
            <ul className="space-y-2">
              {dossier.records.map((r) => (
                <li key={r.id} className="flex items-baseline gap-3">
                  <span className="display-italic text-[22px] tabular-nums leading-none" style={{ color }}>{recordValue(r)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] text-[color:var(--color-on-paper)]">{r.discipline} · {r.scope}{r.status === 'broken' ? ' (former)' : ''}</span>
                    {r.notes && <span className="block prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] leading-snug">{r.notes}</span>}
                  </span>
                  <span className="tabular-nums text-[10px] text-[color:var(--color-brass-deep)] shrink-0">{r.date.slice(0, 4)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* Who holds them */}
        {dossier.holders.length > 0 && (
          <Panel title="who holds them" icon={<span className="text-[10px]">✶</span>} color={color}>
            <ul className="space-y-1.5">
              {dossier.holders.map((h) => (
                <li key={h.id} className="text-[12px]">
                  <span className="text-[color:var(--color-on-paper)]">{h.name}</span>
                  <span className="text-[color:var(--color-on-paper-muted)]"> · {h.relationship}</span>
                  {h.oneLine && <span className="block prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug">“{h.oneLine}”</span>}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* In their own words */}
        {(dossier.keyAnswers.length > 0 || dossier.quotes.length > 0) && (
          <Panel title="in their own words" icon={<Quote size={12} />} color={color}>
            <div className="space-y-3">
              {dossier.keyAnswers.map((k, i) => (
                <div key={`k-${i}`}>
                  <div className="prose-body italic text-[10px] text-[color:var(--color-brass-deep)]">{k.q}</div>
                  <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] leading-snug">“{k.a}”</div>
                </div>
              ))}
              {dossier.quotes.map((q, i) => (
                <div key={`q-${i}`} className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] leading-snug">“{q}”</div>
              ))}
            </div>
          </Panel>
        )}

        {/* Their life */}
        {dossier.life.length > 0 && (
          <Panel title="their life" color={color}>
            <ul className="space-y-1">
              {dossier.life.map((e) => (
                <li key={e.id} className="flex items-baseline gap-2.5 text-[12px]">
                  <span className="tabular-nums text-[color:var(--color-brass-deep)] w-9 shrink-0">{e.year}</span>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-1.5" style={{ background: CAT_COLOR[e.category] }} />
                  <span className={`leading-snug ${e.significance >= 4 ? 'text-[color:var(--color-on-paper)]' : 'text-[color:var(--color-on-paper-muted)]'}`}>{e.title}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* Threads they carry */}
        {dossier.threads.length > 0 && (
          <Panel title="threads they carry" color={color}>
            <ul className="space-y-1.5">
              {dossier.threads.map((th) => (
                <li key={th.id} className="text-[12px]">
                  <span className="tabular-nums text-[color:var(--color-brass-deep)] mr-2">{String(th.num).padStart(2, '0')}</span>
                  <span className="text-[color:var(--color-on-paper)]">{th.title}</span>
                  <span className="block prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] leading-snug ml-6">{th.subtitle}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* At the surface */}
        {dossier.watched.length > 0 && (
          <Panel title="at the surface" icon={<Eye size={12} />} color={color}>
            <ul className="space-y-1.5">
              {dossier.watched.map((m) => {
                const other = m.watcherKey === selected ? m.divingPersonKey : m.watcherKey;
                const otherName = state.four.find((f) => f.key === other)?.name.split(' ')[0] ?? other;
                const asWatcher = m.watcherKey === selected;
                return (
                  <li key={m.id} className="text-[12px]">
                    <span className="text-[color:var(--color-on-paper-muted)]">{asWatcher ? `watching ${otherName}` : `${otherName} watches`} · </span>
                    <span className="prose-body italic text-[color:var(--color-on-paper)]">{m.moment}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] block">{label}</span>
      <span className="text-[color:var(--color-on-paper)]">{value}</span>
    </div>
  );
}

function Panel({ title, icon, color, children }: { title: string; icon?: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="label-caps text-[9px] mb-2.5 flex items-center gap-1.5" style={{ color }}>{icon} {title}</div>
      {children}
    </section>
  );
}
