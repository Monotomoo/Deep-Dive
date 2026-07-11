import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function ShootsView() {
  const { state } = useApp();
  const t = useT();
  const [openId, setOpenId] = useState<string | null>('shoot-sicily');

  return (
    <div className="space-y-8 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('shoots.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('shoots.subtitle')}</p>
      </header>

      <ul className="space-y-3">
        {state.shoots.map((s) => {
          const isOpen = openId === s.id;
          const days = state.shootDays.filter((d) => d.shootId === s.id);
          const cams = state.coverageCams.filter((c) => c.shootId === s.id);
          return (
            <li key={s.id} className={`bg-[color:var(--color-paper-light)] border-[0.5px] rounded-[3px] p-4 ${s.wonderfulness ? 'border-[color:var(--color-brass)]' : 'border-[color:var(--color-border-paper)]'}`}>
              <button className="w-full text-left" onClick={() => setOpenId(isOpen ? null : s.id)}>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`label-caps text-[9px] ${statusColor(s.status)}`}>{s.status}</span>
                      {s.wonderfulness && <span className="label-caps text-[9px] text-[color:var(--color-brass)]">★ miracle</span>}
                    </div>
                    <div className="display-italic text-[24px] text-[color:var(--color-on-paper)] leading-tight mt-1">{s.title}</div>
                    <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{s.location}</div>
                  </div>
                  <div className="text-right text-[11px]">
                    {s.startDate && <div className="tabular-nums text-[color:var(--color-on-paper-muted)]">{s.startDate}{s.endDate ? ` → ${s.endDate}` : ''}</div>}
                    <div className="prose-body italic text-[color:var(--color-brass-deep)] mt-1">{s.presentFour.length} present</div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t-[0.5px] border-[color:var(--color-border-paper)] space-y-4">
                  <div>
                    <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('shoots.spirit')}</div>
                    <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper)] leading-relaxed">{s.spirit}</p>
                  </div>
                  {s.wonderfulness && (
                    <div className="bg-[color:var(--color-brass)]/10 border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-3">
                      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('shoots.wonderfulness')}</div>
                      <div className="display-italic text-[16px] text-[color:var(--color-on-paper)] leading-snug">{s.wonderfulness}</div>
                    </div>
                  )}
                  <div>
                    <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">{t('shoots.captures')}</div>
                    <ul className="space-y-1">
                      {s.captures.map((c, i) => (
                        <li key={i} className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[color:var(--color-brass)]">{c}</li>
                      ))}
                    </ul>
                  </div>
                  {cams.length > 0 && (
                    <div>
                      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">{t('shoots.coverage')}</div>
                      <ul className="space-y-2">
                        {cams.map((c) => (
                          <li key={c.id} className="text-[12px] border-l-2 border-[color:var(--color-brass)]/40 pl-3">
                            <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{c.role}</span>
                            {c.locked && <span className="ml-2 text-[9px] tracking-[0.14em] uppercase text-[color:var(--color-success)]">locked</span>}
                            <div className="prose-body text-[color:var(--color-on-paper)] mt-0.5">{c.descriptor}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {days.length > 0 && (
                    <div>
                      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">{t('shoots.days')}</div>
                      <ul className="space-y-1">
                        {days.map((d) => (
                          <li key={d.id} className="text-[12px] flex gap-3 items-baseline">
                            <span className="tabular-nums text-[color:var(--color-on-paper-muted)] w-16">DAY {d.dayNum} · {d.date}</span>
                            <span className="prose-body text-[color:var(--color-on-paper)] flex-1">{d.plan}</span>
                            {d.done && <span className="label-caps text-[9px] text-[color:var(--color-success)]">✓</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <details>
                    <summary className="label-caps text-[9px] text-[color:var(--color-brass-deep)] cursor-pointer">{t('shoots.bible')}</summary>
                    <pre className="prose-body whitespace-pre-wrap text-[12px] text-[color:var(--color-on-paper)] mt-2 leading-relaxed font-serif italic">{s.bible}</pre>
                  </details>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-[color:var(--color-success)]';
    case 'in-progress':
    case 'confirmed': return 'text-[color:var(--color-brass)]';
    case 'archived': return 'text-[color:var(--color-on-paper-muted)]';
    default: return 'text-[color:var(--color-on-paper-faint)]';
  }
}
