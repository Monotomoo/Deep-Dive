import { useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';

export function OverviewView() {
  const { state } = useApp();
  const t = useT();

  const stats = useMemo(() => {
    const shootsDone = state.shoots.filter((s) => s.status === 'completed').length;
    const shootsPlanned = state.shoots.filter((s) => s.status === 'planned' || s.status === 'confirmed').length;
    const threadsActive = state.threads.filter((t) => t.status === 'active' || t.status === 'ready').length;
    const spineCaptured = state.spineAnswers.filter((a) => a.answered).length;
    const spineTotal = state.four.length * state.shoots.length * state.spineQuestions.length;
    const swingsAchieved = state.swings.filter((s) => s.status === 'achieved' || s.status === 'in-cut' || s.status === 'in-final').length;
    const nextShoot = state.shoots.find((s) => s.status === 'planned' || s.status === 'confirmed');
    return { shootsDone, shootsPlanned, threadsActive, spineCaptured, spineTotal, swingsAchieved, nextShoot };
  }, [state]);

  return (
    <div className="space-y-8 max-w-[1200px]">
      <header>
        <div className="display-italic text-[42px] text-[color:var(--color-on-paper)] leading-tight">
          {t('overview.epigraph')}
        </div>
        <p className="prose-body italic text-[15px] text-[color:var(--color-on-paper-muted)] mt-2">
          {t('overview.tagline')}
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Tile label={t('overview.shoots.done')}     value={String(stats.shootsDone)} />
        <Tile label={t('overview.shoots.planned')}  value={String(stats.shootsPlanned)} />
        <Tile label={t('overview.threads.active')}  value={String(stats.threadsActive)} />
        <Tile label={t('overview.spine.captured')}  value={`${stats.spineCaptured} / ${stats.spineTotal}`} />
        <Tile label={t('overview.swings.achieved')} value={String(stats.swingsAchieved)} />
        <Tile label={t('overview.next.shoot')}       value={stats.nextShoot?.title ?? '—'} small />
      </section>

      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the four</h3>
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
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">the 6 shoots</h3>
        <ul className="space-y-2">
          {state.shoots.map((s) => (
            <li key={s.id} className="flex items-baseline gap-3 border-b-[0.5px] border-[color:var(--color-border-paper)] py-2">
              <span className={`label-caps text-[9px] ${statusColor(s.status)}`}>{s.status}</span>
              <span className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{s.title}</span>
              <span className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] ml-auto">{s.location}</span>
            </li>
          ))}
        </ul>
      </section>

      {stats.swingsAchieved > 0 && (
        <section>
          <h3 className="label-caps text-[color:var(--color-brass)] mb-3">swings achieved · ★ documentary miracles</h3>
          <ul className="space-y-2">
            {state.swings.filter((s) => s.status === 'achieved').map((s) => (
              <li key={s.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-3">
                <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{s.title}</div>
                {s.achievedNote && <div className="prose-body italic text-[13px] text-[color:var(--color-brass-deep)] mt-1">{s.achievedNote}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tile({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
      <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">{label}</div>
      <div className={`display-italic mt-2 text-[color:var(--color-on-paper)] ${small ? 'text-[20px]' : 'text-[36px]'} leading-none`}>
        {value}
      </div>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-[color:var(--color-success)]';
    case 'in-progress': return 'text-[color:var(--color-brass)]';
    default: return 'text-[color:var(--color-on-paper-faint)]';
  }
}
