import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './state/AppContext';
import { AppShell } from './components/layout/AppShell';
import { CommandPalette } from './components/palette/CommandPalette';
import { CaptureModal } from './components/CaptureModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Splash } from './components/layout/Splash';
import { hasSeenSplash } from './lib/storage';
import { isEditableTarget, isMod, SCENARIO_KEYS, VIEW_ORDER } from './lib/shortcuts';
/* Light, common views — loaded eagerly. */
import { OverviewView } from './components/views/OverviewView';
import { VisionView } from './components/views/VisionView';
import { CrewView } from './components/views/CrewView';
import { SponsorsView } from './components/views/SponsorsView';
import { RisksView } from './components/views/RisksView';
import { FourView } from './components/views/FourView';
import { ThreadsView } from './components/views/ThreadsView';
import { SpineView } from './components/views/SpineView';
import { ShootsView } from './components/views/ShootsView';
import { InterviewsView } from './components/views/InterviewsView';
import { SwingsView } from './components/views/SwingsView';
import { DevicesView } from './components/views/DevicesView';
import { WatchersView } from './components/views/WatchersView';
import { CameraTeamView } from './components/views/CameraTeamView';
import { PitchView } from './components/views/PitchView';
import { DistributionView } from './components/views/DistributionView';
import { ContractsView } from './components/views/ContractsView';
import { JournalView } from './components/views/JournalView';
import { PostProductionView } from './components/views/PostProductionView';
import { ReferencesView } from './components/views/ReferencesView';
import { Chapter2023View } from './components/views/Chapter2023View';
import { SurfaceView } from './components/views/SurfaceView';
import { ChoirView } from './components/views/ChoirView';
import type { ViewKey } from './types';

/* Heavy views — code-split so recharts + big SVG canvases load on demand. */
const ScheduleView = lazy(() => import('./components/views/ScheduleView').then((m) => ({ default: m.ScheduleView })));
const RecordsView = lazy(() => import('./components/views/RecordsView').then((m) => ({ default: m.RecordsView })));
const PhysiologyView = lazy(() => import('./components/views/PhysiologyView').then((m) => ({ default: m.PhysiologyView })));
const NeuronView = lazy(() => import('./components/views/NeuronView').then((m) => ({ default: m.NeuronView })));
const CastView = lazy(() => import('./components/views/CastView').then((m) => ({ default: m.CastView })));
const IdeaHubView = lazy(() => import('./components/views/IdeaHubView').then((m) => ({ default: m.IdeaHubView })));
const LifeMosaicView = lazy(() => import('./components/views/LifeMosaicView').then((m) => ({ default: m.LifeMosaicView })));
const ResonanceView = lazy(() => import('./components/views/ResonanceView').then((m) => ({ default: m.ResonanceView })));
const UsaTripView = lazy(() => import('./components/views/UsaTripView').then((m) => ({ default: m.UsaTripView })));
const PitchDeckView = lazy(() => import('./components/views/PitchDeckView').then((m) => ({ default: m.PitchDeckView })));

function ViewLoading() {
  return (
    <div className="flex items-center justify-center py-[18vh]">
      <span className="prose-body italic text-[14px] text-[color:var(--color-on-paper-faint)]">loading…</span>
    </div>
  );
}

function ViewSwitch() {
  const { state } = useApp();
  return (
    <motion.div
      key={state.activeView}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <ErrorBoundary key={state.activeView}>
        <Suspense fallback={<ViewLoading />}>
          {renderView(state.activeView)}
        </Suspense>
      </ErrorBoundary>
    </motion.div>
  );
}

function renderView(view: ViewKey) {
  switch (view) {
    case 'overview':      return <OverviewView />;
    case 'vision':        return <VisionView />;
    case 'idea-hub':      return <IdeaHubView />;
    case 'neuron':        return <NeuronView />;
    case 'schedule':      return <ScheduleView />;
    case 'crew':          return <CrewView />;
    case 'sponsors':      return <SponsorsView />;
    case 'risks':         return <RisksView />;
    case 'cast':          return <CastView />;
    case 'surface':       return <SurfaceView />;
    case 'four':          return <FourView />;
    case 'life-mosaic':   return <LifeMosaicView />;
    case 'threads':       return <ThreadsView />;
    case 'spine':         return <SpineView />;
    case 'shoots':        return <ShootsView />;
    case 'usa-trip':      return <UsaTripView />;
    case 'interviews':    return <InterviewsView />;
    case 'choir':         return <ChoirView />;
    case 'swings':        return <SwingsView />;
    case 'devices':       return <DevicesView />;
    case 'resonance':     return <ResonanceView />;
    case 'records':       return <RecordsView />;
    case 'physiology':    return <PhysiologyView />;
    case 'watchers':      return <WatchersView />;
    case 'camera-team':   return <CameraTeamView />;
    case 'pitch':         return <PitchView />;
    case 'pitch-deck':    return <PitchDeckView />;
    case 'distribution':  return <DistributionView />;
    case 'contracts':     return <ContractsView />;
    case 'journal':       return <JournalView />;
    case 'post':          return <PostProductionView />;
    case 'references':    return <ReferencesView />;
    case 'chapter-2023':  return <Chapter2023View />;
  }
}

function GlobalShortcuts() {
  const { dispatch, undo, redo } = useApp();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isMod(e) && e.key.toLowerCase() === 'z') {
        if (!isEditableTarget(e.target)) {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
      }
      /* ⌘K → global search · works anywhere, even inside inputs */
      if (isMod(e) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch({ type: 'OPEN_PALETTE', open: true });
        return;
      }
      /* ⌘. → quick capture · works anywhere */
      if (isMod(e) && e.key === '.') {
        e.preventDefault();
        dispatch({ type: 'OPEN_CAPTURE', open: true });
        return;
      }
      if (isEditableTarget(e.target)) return;
      /* ⌘1–9 → jump views */
      if (isMod(e) && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const view = VIEW_ORDER[idx];
        if (view) {
          e.preventDefault();
          dispatch({ type: 'SET_VIEW', view });
        }
        return;
      }
      /* 1/2/3 → scenarios */
      if (!isMod(e) && SCENARIO_KEYS[e.key]) {
        e.preventDefault();
        dispatch({ type: 'SET_SCENARIO', scenario: SCENARIO_KEYS[e.key] });
        return;
      }
      /* ⌘R → reset to seed */
      if (isMod(e) && e.key.toLowerCase() === 'r' && !e.shiftKey) {
        e.preventDefault();
        if (window.confirm('Reset to seed?\n\nThis discards all your edits and restores the original seed data.')) {
          dispatch({ type: 'RESET_TO_SEED' });
        }
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, undo, redo]);
  return null;
}

function AppInner() {
  const { state, dispatch } = useApp();
  return (
    <>
      <GlobalShortcuts />
      <AppShell>
        <ViewSwitch />
      </AppShell>
      <CommandPalette open={state.paletteOpen} onClose={() => dispatch({ type: 'OPEN_PALETTE', open: false })} />
      <CaptureModal />
    </>
  );
}

export function App() {
  const skipSplash =
    hasSeenSplash() ||
    new URLSearchParams(window.location.search).get('nosplash') === '1';
  const [splashDone, setSplashDone] = useState(skipSplash);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <AppProvider>
      {!splashDone && <Splash onComplete={handleSplashComplete} />}
      <AppInner />
    </AppProvider>
  );
}

export default App;
