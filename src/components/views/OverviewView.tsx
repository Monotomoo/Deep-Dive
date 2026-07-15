import { useMemo, useState } from 'react';
import {
  Anchor, CalendarRange, Clapperboard, Lightbulb, MapPin, Music, Network,
  Plus, Route, Sparkles, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import { GapHero } from '../gaps/GapPanel';
import { FilmMap } from '../map/FilmMap';
import type { Shoot, ShootDay, ViewKey } from '../../types';

/* Overview · what needs you now.

   The front page's job is not to list six numbers at equal weight — it's to
   answer "what should I do today". So Gap Radar leads, the map shows where the
   film physically is, and the pulse tiles sit underneath as context rather than
   headline. */

export function OverviewView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem('deep-dive-beta-welcome') !== '1'; } catch { return false; }
  });
  function dismissWelcome() {
    try { localStorage.setItem('deep-dive-beta-welcome', '1'); } catch { /* noop */ }
    setShowWelcome(false);
  }

  const stats = useMemo(() => {
    const shootsDone = state.shoots.filter((s) => s.status === 'completed').length;
    const shootsPlanned = state.shoots.filter((s) => s.status === 'planned' || s.status === 'confirmed').length;
    const threadsActive = state.threads.filter((th) => th.status === 'active' || th.status === 'ready').length;
    const swingsAchieved = state.swings.filter((s) => s.status === 'achieved' || s.status === 'in-cut' || s.status === 'in-final').length;
    const interviewsPlanned = state.interviews.filter((iv) => iv.status === 'planned').length;
    const ideasHot = state.hubIdeas.filter((i) => i.status === 'hot').length;
    /* The soonest upcoming shoot by date — not merely the first one that happens
       to sit earliest in the array. */
    const nextShoot = state.shoots
      .filter((s) => (s.status === 'planned' || s.status === 'confirmed') && s.startDate)
      .sort((a, b) => (a.startDate as string).localeCompare(b.startDate as string))[0]
      ?? state.shoots.find((s) => s.status === 'planned' || s.status === 'confirmed');
    const doneShoot = state.shoots.find((s) => s.status === 'completed' && s.wonderfulness);

    let daysToNext: number | null = null;
    if (nextShoot?.startDate) {
      /* Counts from today. This was pinned to a hardcoded date and had been
         quietly drifting further from the truth every day since. */
      const target = new Date(nextShoot.startDate).getTime();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      daysToNext = Math.round((target - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    const recent = [...state.journalEntries].sort((a, b) => (a.date > b.date ? -1 : 1)).slice(0, 3);
    return { shootsDone, shootsPlanned, threadsActive, swingsAchieved, interviewsPlanned, ideasHot, nextShoot, doneShoot, daysToNext, recent };
  }, [state]);

  function go(view: ViewKey) { dispatch({ type: 'SET_VIEW', view }); }

  function addDay(shootId: string) {
    const text = (drafts[shootId] ?? '').trim();
    if (!text) return;
    const shoot = state.shoots.find((s) => s.id === shootId);
    const existing = state.shootDays.filter((d) => d.shootId === shootId);
    const dayNum = existing.reduce((m, d) => Math.max(m, d.dayNum), 0) + 1;
    const day: ShootDay = {
      id: `sd-${Math.random().toString(36).slice(2, 8)}`,
      shootId, dayNum, date: shoot?.startDate ?? '', plan: text, done: false,
    };
    dispatch({ type: 'ADD_SHOOT_DAY', day });
    setDrafts((d) => ({ ...d, [shootId]: '' }));
  }

  const JUMPS: { view: ViewKey; label: string; icon: typeof Anchor }[] = [
    { view: 'cast', label: 'Cast · Story', icon: Clapperboard },
    { view: 'idea-hub', label: 'Idea Hub', icon: Lightbulb },
    { view: 'usa-trip', label: 'USA Trip', icon: Route },
    { view: 'surface', label: 'Surface', icon: Anchor },
    { view: 'neuron', label: 'Neuron', icon: Network },
    { view: 'schedule', label: 'Schedule', icon: CalendarRange },
    { view: 'shoots', label: 'Shoots', icon: MapPin },
    { view: 'choir', label: 'Choir', icon: Music },
    { view: 'swings', label: 'Bigger Swings', icon: Sparkles },
  ];

  return (
    <div className="space-y-9 max-w-[1200px]">
      {showWelcome && (
        <div className="relative bg-[color:var(--color-chrome)] rounded-[4px] p-6 pr-12">
          <button type="button" onClick={dismissWelcome} className="absolute top-3 right-3 text-[color:var(--color-paper-light)]/50 hover:text-[color:var(--color-paper-light)]"><X size={16} /></button>
          <div className="label-caps text-[color:var(--color-brass)] mb-2">a beta · for the four, and the crew</div>
          <p className="prose-body italic text-[16px] text-[color:var(--color-paper-light)] leading-relaxed max-w-[760px]">
            Petar, Vito, Sanda, Zsófia — and everyone making this with us: this is the film as a living thing.
            Every part of it is here to explore and to argue with. Nothing is final. Move it around, break it, tell us what's wrong.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={() => { dismissWelcome(); go('cast'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] hover:bg-[color:var(--color-brass-deep)] transition-colors">
              <Clapperboard size={12} /> Meet the cast &amp; story
            </button>
            <span className="text-[11px] text-[color:var(--color-paper-light)]/50 tracking-wide">press ⌘K anywhere to search the whole film</span>
          </div>
        </div>
      )}

      <header>
        <div className="display-italic italic text-[48px] text-[color:var(--color-on-paper)] leading-tight">{t('overview.epigraph')}</div>
        <p className="prose-body italic text-[16px] text-[color:var(--color-on-paper-muted)] mt-3 max-w-[720px]">{t('overview.tagline')}</p>
      </header>

      {/* What needs you now — the front page's actual job. */}
      <GapHero />

      {/* Where the film is */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">the map</h3>
          <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
            every shoot, where it actually happens · the dashed line is the order they happen in
          </span>
        </div>
        <FilmMap />
      </section>

      {stats.doneShoot?.wonderfulness && (
        <section className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-6" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--color-brass)' }}>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="label-caps text-[color:var(--color-brass-deep)]">already captured</span>
            <span className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{stats.doneShoot.title}</span>
          </div>
          <p className="prose-body text-[15px] text-[color:var(--color-on-paper)] leading-snug">{stats.doneShoot.wonderfulness}</p>
        </section>
      )}

      {/* The pulse — one figure that's actually urgent, the rest as context. */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => go('shoots')}
          className="col-span-2 lg:col-span-2 text-left bg-[color:var(--color-chrome)] rounded-[4px] p-5 hover:bg-[color:var(--color-chrome-elevated)] transition-colors"
        >
          <div className="label-caps text-[color:var(--color-brass)]">next shoot</div>
          <div className="display-italic text-[color:var(--color-on-chrome)] text-[56px] leading-none mt-1.5">
            {stats.daysToNext !== null
              ? (stats.daysToNext >= 0 ? `${stats.daysToNext}d` : `${Math.abs(stats.daysToNext)}d ago`)
              : '—'}
          </div>
          {stats.nextShoot && (
            <div className="prose-body italic text-[13px] text-[color:var(--color-on-chrome-muted)] mt-2">
              {stats.nextShoot.title}
            </div>
          )}
        </button>
        <Tile label="shoots done" value={String(stats.shootsDone)} />
        <Tile label="shoots planned" value={String(stats.shootsPlanned)} />
        <Tile label="threads active" value={String(stats.threadsActive)} />
        <Tile label="swings achieved" value={String(stats.swingsAchieved)} />
        <Tile label="hot ideas" value={String(stats.ideasHot)} />
        <Tile label="interviews planned" value={String(stats.interviewsPlanned)} />
      </section>

      {/* Quick jump-offs */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">jump to</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {JUMPS.map((j) => {
            const Icon = j.icon;
            return (
              <button key={j.view} type="button" onClick={() => go(j.view)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[3px] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-paper-card)] transition-colors text-left">
                <Icon size={14} className="text-[color:var(--color-brass)] shrink-0" />
                <span className="font-sans text-[12px] text-[color:var(--color-on-paper)] truncate">{j.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Shoot plan · by location */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">shoot plan · by location</h3>
          <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">plan each shoot where it happens</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {state.shoots.map((shoot) => {
            const daysList = state.shootDays.filter((d) => d.shootId === shoot.id).sort((a, b) => a.dayNum - b.dayNum);
            const isUsa = shoot.key === 'usa';
            return (
              <article key={shoot.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col"
                style={{ borderTopWidth: 3, borderTopColor: shoot.colorHint ?? 'var(--color-brass)' }}>
                <header className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`label-caps ${statusColor(shoot.status)}`}>{shoot.status}</span>
                    <div className="flex-1" />
                    {shoot.presentFour.map((pk) => {
                      const f = state.four.find((x) => x.key === pk);
                      return <span key={pk} className="w-2 h-2 rounded-full" style={{ background: f?.colorHint }} title={f?.name} />;
                    })}
                  </div>
                  <div className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-tight mt-1">{shoot.title.split('·')[0].trim()}</div>
                  <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)]">
                    {shoot.location}{shoot.startDate ? ` · ${shoot.startDate}` : ''}
                  </div>
                </header>

                {/* Plan items */}
                <div className="flex-1 space-y-1 mb-2">
                  {isUsa ? (
                    <>
                      {state.usaTrip.stops.map((st) => (
                        <div key={st.id} className="flex items-baseline gap-2 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-1" style={{ background: st.colorHint ?? 'var(--color-brass)' }} />
                          <span className="text-[color:var(--color-on-paper)]">{st.name}</span>
                          <span className="text-[color:var(--color-on-paper-faint)]">{st.nights ?? 0}n · {st.pois?.length ?? 0} spots</span>
                        </div>
                      ))}
                      <button type="button" onClick={() => go('usa-trip')}
                        className="mt-1 text-[11px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)]">open the RV trip →</button>
                    </>
                  ) : daysList.length > 0 ? (
                    daysList.map((d) => (
                      <div key={d.id} className="flex items-baseline gap-2 text-[11px]">
                        <span className="tabular-nums text-[color:var(--color-brass-deep)] shrink-0">D{d.dayNum}</span>
                        <span className="text-[color:var(--color-on-paper)] leading-snug">{d.plan}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyDays shoot={shoot} />
                  )}
                </div>

                {/* Quick add */}
                {!isUsa && (
                  <div className="flex gap-1.5 pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                    <input
                      type="text"
                      value={drafts[shoot.id] ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [shoot.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') addDay(shoot.id); }}
                      placeholder="+ plan a day…"
                      className="flex-1 bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[11px]"
                    />
                    <button type="button" onClick={() => addDay(shoot.id)} disabled={!(drafts[shoot.id] ?? '').trim()}
                      className="px-2 py-1 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] disabled:opacity-40"><Plus size={12} /></button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* The four */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-4">the four</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {state.four.map((f) => (
            <button key={f.id} type="button" onClick={() => go('cast')}
              className="text-left bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 hover:border-[color:var(--color-brass)] transition-colors"
              style={{ borderTopWidth: 3, borderTopColor: f.colorHint ?? 'var(--color-brass)' }}>
              <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{f.name}</div>
              <div className="prose-body italic text-[11px] text-[color:var(--color-brass)] mt-1">{f.role}</div>
              <div className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{f.arcNote}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Threads */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-4">the threads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...state.threads].sort((a, b) => a.num - b.num).map((th) => (
            <button key={th.id} type="button" onClick={() => go('threads')} className="flex items-baseline gap-3 text-[13px] text-left hover:text-[color:var(--color-brass)]">
              <span className="tabular-nums text-[color:var(--color-brass-deep)] w-6 text-[11px] shrink-0">{String(th.num).padStart(2, '0')}</span>
              <span className={`label-caps w-20 shrink-0 ${threadStatusColor(th.status)}`}>{th.status}</span>
              <span className="display-italic text-[color:var(--color-on-paper)] flex-1">{th.title}</span>
            </button>
          ))}
        </div>
      </section>

      {stats.recent.length > 0 && (
        <section>
          <h3 className="label-caps text-[color:var(--color-brass)] mb-4">recent activity</h3>
          <ul className="space-y-3">
            {stats.recent.map((e) => (
              <li key={e.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
                <div className="tabular-nums text-[11px] text-[color:var(--color-brass-deep)] mb-1">{e.date}</div>
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
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3.5">
      <div className="label-caps text-[color:var(--color-on-paper-faint)]">{label}</div>
      <div className="display-italic mt-1.5 text-[color:var(--color-on-paper)] text-[26px] leading-none">{value}</div>
      {sub && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-1 truncate">{sub}</div>}
    </div>
  );
}

/* An empty shoot used to say "No days planned yet." and stop there — the app's
   most-repeated sentence, and a dead end. It knows how urgent the emptiness is,
   so it should say that instead. */
function EmptyDays({ shoot }: { shoot: Shoot }) {
  const until = useMemo(() => {
    if (!shoot.startDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((new Date(shoot.startDate).getTime() - today.getTime()) / 86_400_000);
  }, [shoot.startDate]);

  if (shoot.status === 'completed') {
    return (
      <div className="prose-body italic text-[12px] leading-snug text-[color:var(--color-danger)]">
        Marked completed — but no day was ever logged. Either the status is wrong or the record is missing.
      </div>
    );
  }
  if (until !== null && until >= 0) {
    const hot = until <= 45;
    return (
      <div
        className="prose-body italic text-[12px] leading-snug"
        style={{ color: hot ? 'var(--color-brass)' : 'var(--color-on-paper-muted)' }}
      >
        Nothing planned yet — {until === 0 ? 'it starts today' : `${until} day${until === 1 ? '' : 's'} out`}.
        <span className="text-[color:var(--color-on-paper-faint)]"> Write the first day below.</span>
      </div>
    );
  }
  return (
    <div className="prose-body italic text-[12px] leading-snug text-[color:var(--color-on-paper-muted)]">
      No days yet, and no date set.
      <span className="text-[color:var(--color-on-paper-faint)]"> Write the first day below.</span>
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
