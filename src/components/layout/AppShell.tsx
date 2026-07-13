import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, Mic, X } from 'lucide-react';
import { Sidebar, NAV_VIEW_ORDER } from './Sidebar';
import { PageHeader } from './PageHeader';
import { useApp } from '../../state/AppContext';
import type { ScenarioKey, ViewKey } from '../../types';

const VIEW_NAMES: Record<ViewKey, string> = {
  overview:      'Overview',
  vision:        'Vision',
  'idea-hub':    'Idea Hub',
  neuron:        'Neuron',
  schedule:      'Schedule',
  crew:          'Crew',
  sponsors:      'Sponsors',
  risks:         'Risks',
  cast:          'Cast · Story',
  surface:       'Surface',
  four:          'The Four',
  'life-mosaic': 'Life Mosaic',
  threads:       'Threads',
  spine:         'Spine',
  shoots:        'Shoots',
  'usa-trip':    'USA Trip',
  interviews:    'Interviews',
  choir:         'Choir',
  swings:        'Bigger Swings',
  devices:       'Devices',
  resonance:     'Resonance',
  records:       'Records',
  physiology:    'Physiology',
  watchers:      'Watchers',
  'camera-team': 'Camera Team',
  pitch:         'Pitch',
  distribution:  'Distribution',
  contracts:     'Contracts',
  journal:       'Journal',
  post:          'Post-production',
  references:    'References',
  'chapter-2023': 'The 2023 Chapter',
};

const VIEW_SUBTITLES: Partial<Record<ViewKey, string>> = {
  overview:      "one person holds another in the world · the film at a glance",
  vision:        'the film in one breath · grammar · north star',
  'idea-hub':    "the team's open inbox · every idea wired to the film",
  neuron:         'the film as a nervous system · every entity linked',
  schedule:      'phases · milestones · shoot dates · festival deadlines',
  crew:          'film crew · not talent',
  sponsors:      'pipeline · tiers · committed',
  risks:         'probability × impact · mitigation',
  cast:          'person · event · topic — connected, then interviewed',
  surface:       'who holds them · the thesis made literal',
  four:          'Petar · Vito · Sanda · Zsófia · the leads',
  'life-mosaic': 'four biographies running in parallel',
  threads:       '10 narrative arcs woven across every shoot',
  spine:         '5 questions · every person · every shoot · the returning matrix',
  shoots:        '6 stages · Krk ✓ · Sicily ✓ + Etna · Lastovo · Cyprus · Rijeka · USA · Coda',
  'usa-trip':    'Sept RV road-trip for six · SF → Las Vegas → fly Cyprus',
  interviews:    'grouped by location · chained by follow-ups',
  choir:         'same question · four voices side by side',
  swings:        'the ambitious bets · fire breathes in ✓ · water breathes out',
  devices:       'descent monologue · breath-up · body as witness · moment in the dark',
  resonance:     'image echoes · what makes the film feel woven',
  records:       "Petar CNF 103m · Vito ~29min · Sanda first HR past 100m · Zsófia FIM 105m",
  physiology:    'body as witness · the score built from real physiology',
  watchers:      'the faces watching · the emotional centre of every attempt',
  'camera-team': 'cameras · lenses · mics · lights · per-operator kit bag',
  pitch:         'Sundance · Berlinale · IDFA · CPH:DOX targets',
  distribution:  'sales agents · broadcasters · markets · deals',
  contracts:     'talent releases · consent · veto tracking',
  journal:       'production diary · per shoot day',
  post:          'feature 90-100 min · 3-episode series · deliverables',
  references:    'touchstone films · books · papers',
  'chapter-2023': 'evidence library · the peer-reviewed case · the truth on our side',
};

const SCENARIOS: ScenarioKey[] = ['lean', 'realistic', 'ambitious'];

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { state, dispatch } = useApp();

  /* Phase 11 — sidebar drawer state for phone (<md). Desktop ignores. */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Auto-close drawer when active view changes (e.g. navigation tap). */
  const prevViewRef = useRef(state.activeView);
  useEffect(() => {
    if (state.activeView !== prevViewRef.current) {
      setDrawerOpen(false);
      prevViewRef.current = state.activeView;
    }
  }, [state.activeView]);

  /* Lock body scroll while drawer is open. */
  useEffect(() => {
    if (drawerOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [drawerOpen]);

  /* Close drawer on Escape. */
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  /* Keep the active tab scrolled into view in the mobile top strip. */
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [state.activeView]);

  return (
    <div className="h-screen w-screen flex bg-[color:var(--color-paper)] text-[color:var(--color-on-paper)] overflow-hidden">
      <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />

      {/* Phone + iPad-portrait backdrop — closes drawer on tap */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-[color:var(--color-chrome)]/55 backdrop-blur-[2px] transition-opacity"
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="px-5 pt-5 pb-2 md:px-8 md:pt-7 lg:px-14 lg:pt-9 flex items-end justify-between gap-3 md:gap-10 shrink-0 no-print">
          {/* Hamburger — visible on phone + iPad portrait */}
          <button
            type="button"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center w-11 h-11 -ml-2 rounded-[3px] text-[color:var(--color-on-paper)] hover:bg-[color:var(--color-paper-deep)]/40 transition-colors duration-150 shrink-0"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop page header — on phone/tablet the view's own header + the
             tab strip below carry the title, so this big duplicate is hidden. */}
          <div className="flex-1 min-w-0 hidden lg:block">
            <PageHeader
              name={VIEW_NAMES[state.activeView]}
              subtitle={VIEW_SUBTITLES[state.activeView]}
            />
          </div>

          <div
            className="flex items-center pb-2 md:pb-4 border-b-[0.5px] border-transparent shrink-0"
            role="tablist"
            aria-label="scenario"
          >
            {SCENARIOS.map((s, i) => {
              const active = state.activeScenario === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => dispatch({ type: 'SET_SCENARIO', scenario: s })}
                  className={`px-2.5 py-2 md:px-3.5 transition-colors duration-150 ${
                    i > 0 ? 'border-l-[0.5px] border-[color:var(--color-border-paper)]' : ''
                  } ${
                    active
                      ? 'text-[color:var(--color-on-paper)]'
                      : 'text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'
                  }`}
                >
                  <span
                    className={
                      active
                        ? 'display-italic text-[15px] md:text-[18px]'
                        : 'font-sans text-[10px] md:text-[12px] tracking-[0.14em] uppercase'
                    }
                  >
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile view tabs — the grouped menu as a scrollable, clickable strip.
           Replaces the big duplicate title on phone/tablet. Desktop uses the sidebar. */}
        <nav
          aria-label="views"
          className="lg:hidden shrink-0 no-print overflow-x-auto border-b-[0.5px] border-[color:var(--color-border-paper)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-stretch gap-0.5 px-3 md:px-6 min-w-max">
            {NAV_VIEW_ORDER.map((v) => {
              const active = state.activeView === v;
              return (
                <button
                  key={v}
                  ref={active ? activeTabRef : undefined}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_VIEW', view: v })}
                  className={`relative whitespace-nowrap px-3 py-2.5 transition-colors duration-150 ${
                    active
                      ? 'text-[color:var(--color-on-paper)]'
                      : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
                  }`}
                >
                  <span className={active ? 'display-italic text-[15px]' : 'font-sans text-[13px]'}>
                    {VIEW_NAMES[v]}
                  </span>
                  {active && (
                    <span className="absolute left-3 right-3 bottom-0 h-[2px] rounded bg-[color:var(--color-brass)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20 md:px-8 md:pb-16 lg:px-14 lg:pt-7 lg:pb-14">
          {children}
        </div>

        {/* Floating capture button — opens the capture modal (⌘. shortcut also works) */}
        <button
          type="button"
          aria-label="open capture"
          title="capture (⌘.)"
          onClick={() => dispatch({ type: 'OPEN_CAPTURE', open: true })}
          className="no-print fixed lg:absolute bottom-5 right-5 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-12 lg:h-12 rounded-full bg-[color:var(--color-brass)] hover:bg-[color:var(--color-brass-deep)] text-[color:var(--color-chrome)] flex items-center justify-center shadow-[0_4px_22px_rgba(14,30,54,0.22)] transition-colors duration-150 z-20"
        >
          <Mic size={20} strokeWidth={2.25} />
        </button>
      </main>
    </div>
  );
}
