import { useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function OverviewView() {
  const { state } = useApp();
  const t = useT();

  const stats = useMemo(() => {
    const shootsDone = state.shoots.filter((s) => s.status === 'completed').length;
    const shootsPlanned = state.shoots.filter((s) => s.status === 'planned' || s.status === 'confirmed').length;
    const threadsActive = state.threads.filter((th) => th.status === 'active' || th.status === 'ready').length;
    const spineIdeas = state.spineIdeas.length;
    const spineLeading = state.spineIdeas.filter((i) => i.status === 'leading').length;
    const swingsAchieved = state.swings.filter((s) => s.status === 'achieved' || s.status === 'in-cut' || s.status === 'in-final').length;
    const nextShoot = state.shoots.find((s) => s.status === 'planned' || s.status === 'confirmed');
    const doneShoot = state.shoots.find((s) => s.status === 'completed' && s.wonderfulness);

    /* Countdown to next shoot */
    let daysToNext: number | null = null;
    if (nextShoot?.startDate) {
      const target = new Date(nextShoot.startDate).getTime();
      const now = new Date('2026-07-11').getTime();     // hardcode session date since environment lacks Date.now
      daysToNext = Math.round((target - now) / (1000 * 60 * 60 * 24));
    }

    /* Recent journal (top 3) */
    const recent = [...state.journalEntries].sort((a, b) => (a.date > b.date ? -1 : 1)).slice(0, 3);

    return { shootsDone, shootsPlanned, threadsActive, spineIdeas, spineLeading, swingsAchieved, nextShoot, doneShoot, daysToNext, recent };
  }, [state]);

  return (
    <div className="space-y-10 max-w-[1200px]">
      <header>
        <div className="display-italic italic text-[48px] text-[color:var(--color-on-paper)] leading-tight">{t('overview.epigraph')}</div>
        <p className="prose-body italic text-[16px] text-[color:var(--color-on-paper-muted)] mt-3 max-w-[720px]">
          {t('overview.tagline')}
        </p>
      </header>

      {stats.doneShoot?.wonderfulness && (
        <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="label-caps text-[10px] text-[color:var(--color-brass)]">★ documentary miracle · achieved</span>
            <span className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{stats.doneShoot.title}</span>
          </div>
          <p className="display-italic italic text-[20px] text-[color:var(--color-on-paper)] leading-snug">{stats.doneShoot.wonderfulness}</p>
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Tile label={t('overview.shoots.done')}     value={String(stats.shootsDone)} />
        <Tile label={t('overview.shoots.planned')}  value={String(stats.shootsPlanned)} />
        <Tile label={t('overview.threads.active')}  value={String(stats.threadsActive)} />
        <Tile label={t('overview.spine.captured')}  value={`${stats.spineLeading} / ${stats.spineIdeas}`} />
        <Tile label={t('overview.swings.achieved')} value={String(stats.swingsAchieved)} />
        <Tile label={t('overview.next.shoot')}
          value={stats.daysToNext !== null ? (stats.daysToNext >= 0 ? `${stats.daysToNext}d` : `${Math.abs(stats.daysToNext)}d ago`) : '—'}
          sub={stats.nextShoot?.title}
        />
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-4">the four</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {state.four.map((f) => (
            <article key={f.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
              <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{f.name}</div>
              <div className="prose-body italic text-[11px] text-[color:var(--color-brass)] mt-1">{f.role}</div>
              <div className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{f.arcNote}</div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-4">the shoots · journey</h3>
        <ol className="space-y-2">
          {state.shoots.map((s, i) => (
            <li key={s.id} className="flex items-baseline gap-3 border-b-[0.5px] border-[color:var(--color-border-paper)] py-2">
              <span className="tabular-nums text-[color:var(--color-brass-deep)] text-[11px] w-6">{String(i + 1).padStart(2, '0')}</span>
              <span className={`label-caps text-[9px] w-24 ${statusColor(s.status)}`}>{s.status}</span>
              <span className="display-italic text-[16px] text-[color:var(--color-on-paper)] flex-1">{s.title}</span>
              <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{s.location}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-4">the 10 threads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {state.threads.map((th) => (
            <div key={th.id} className="flex items-baseline gap-3 text-[13px]">
              <span className="tabular-nums text-[color:var(--color-brass-deep)] w-6 text-[10px]">{String(th.num).padStart(2, '0')}</span>
              <span className={`label-caps text-[8px] w-16 ${threadStatusColor(th.status)}`}>{th.status}</span>
              <span className="display-italic text-[color:var(--color-on-paper)] flex-1">{th.title}</span>
            </div>
          ))}
        </div>
      </section>

      {stats.recent.length > 0 && (
        <section>
          <h3 className="label-caps text-[color:var(--color-brass)] mb-4">recent activity</h3>
          <ul className="space-y-3">
            {stats.recent.map((e) => (
              <li key={e.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
                <div className="tabular-nums text-[10px] text-[color:var(--color-brass-deep)] mb-1">{e.date}</div>
                <div className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] leading-snug">{e.whatHappened}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
      <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">{label}</div>
      <div className="display-italic mt-2 text-[color:var(--color-on-paper)] text-[28px] leading-none">{value}</div>
      {sub && <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] mt-1 truncate">{sub}</div>}
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-[color:var(--color-success)]';
    case 'in-progress': case 'confirmed': return 'text-[color:var(--color-brass)]';
    default: return 'text-[color:var(--color-on-paper-faint)]';
  }
}
function threadStatusColor(s: string): string {
  switch (s) {
    case 'active': case 'ready': return 'text-[color:var(--color-success)]';
    case 'opening': return 'text-[color:var(--color-brass)]';
    case 'in-cut': return 'text-[color:var(--color-dock)]';
    default: return 'text-[color:var(--color-on-paper-faint)]';
  }
}
