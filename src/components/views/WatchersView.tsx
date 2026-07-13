import { useMemo } from 'react';
import { Circle, Eye } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { FourKey } from '../../types';

/* Watchers · the film's emotional centre.
   When one goes down, we film the other three at the surface. Their face
   the instant the card shows is often worth more than the diver's. */

export function WatchersView() {
  const { state } = useApp();
  const t = useT();

  const byShoot = useMemo(() => {
    const map = new Map<string, typeof state.watcherMoments>();
    for (const m of state.watcherMoments) {
      const list = map.get(m.shootId) ?? [];
      list.push(m);
      map.set(m.shootId, list);
    }
    return [...map.entries()];
  }, [state.watcherMoments]);

  const captured = state.watcherMoments.filter((m) => m.captured).length;

  function name(key: FourKey) { return state.four.find((f) => f.key === key)?.name.split(' ')[0] ?? key; }
  function color(key: FourKey) { return state.four.find((f) => f.key === key)?.colorHint ?? 'var(--color-brass)'; }

  return (
    <div className="space-y-6 max-w-[1100px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('watchers.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('watchers.subtitle')}</p>
      </header>

      <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-6">
        <p className="prose-body italic text-[16px] text-[color:var(--color-on-paper)] leading-relaxed">
          When one goes down, we film the <span className="text-[color:var(--color-brass)]">other three</span> at the surface.
          Their face the instant the card shows is often more important than the diver's. This is where the thesis becomes an image.
        </p>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-[color:var(--color-on-paper-muted)]">
          <span className="flex items-center gap-1.5"><Eye size={12} className="text-[color:var(--color-brass)]" /> {state.watcherMoments.length} moments</span>
          <span className="flex items-center gap-1.5"><Circle size={9} fill="currentColor" className="text-[color:var(--color-olive)]" /> {captured} captured</span>
        </div>
      </div>

      {byShoot.map(([shootId, moments]) => {
        const shoot = state.shoots.find((s) => s.id === shootId);
        return (
          <section key={shootId}>
            <div className="flex items-baseline gap-2 mb-3 pb-2 border-b-[0.5px]" style={{ borderColor: `color-mix(in oklab, ${shoot?.colorHint ?? '#d96c3d'} 45%, transparent)` }}>
              <span className="w-2.5 h-2.5 rounded-full translate-y-[1px]" style={{ background: shoot?.colorHint ?? 'var(--color-brass)' }} />
              <h3 className="display-italic text-[20px] text-[color:var(--color-on-paper)]">{shoot?.title.split('·')[0].trim() ?? shootId}</h3>
            </div>
            <div className="space-y-2">
              {moments.map((m) => (
                <article key={m.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3.5"
                  style={{ borderLeft: `3px solid ${color(m.watcherKey)}` }}>
                  <div className="flex items-center gap-2 mb-1.5 text-[12px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color(m.watcherKey) }} />
                      <span className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{name(m.watcherKey)}</span>
                    </span>
                    <Eye size={12} className="text-[color:var(--color-on-paper-faint)]" />
                    <span className="prose-body italic text-[color:var(--color-on-paper-muted)]">watches {name(m.divingPersonKey)}</span>
                    <div className="flex-1" />
                    {m.timecode && <span className="tabular-nums text-[10px] text-[color:var(--color-brass-deep)]">{m.timecode}</span>}
                    <span className={`label-caps text-[8px] ${m.captured ? 'text-[color:var(--color-olive)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>
                      {m.captured ? 'captured' : 'planned'}
                    </span>
                  </div>
                  <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] leading-snug">“{m.moment}”</p>
                  {m.captureNote && <p className="prose-body text-[11px] text-[color:var(--color-on-paper-muted)] leading-snug mt-1.5">{m.captureNote}</p>}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
