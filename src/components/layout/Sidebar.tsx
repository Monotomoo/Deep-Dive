import {
  Activity,
  Anchor,
  BookOpen,
  CalendarRange,
  Clapperboard,
  Coins,
  Compass,
  Layers2,
  Eye,
  FileText,
  Film,
  GitBranch,
  HeartPulse,
  Layers,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  MapPin,
  Milestone as MilestoneIcon,
  Music,
  Network,
  Notebook,
  Orbit,
  Presentation,
  Quote,
  Radar,
  Route,
  Redo2,
  RotateCcw,
  Save,
  ScrollText,
  Sparkles,
  Trophy,
  Waypoints,
  UsersRound,
  Undo2,
  Users,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { BackupPanel } from '../backup/BackupPanel';
import { SIMPLE_VIEW_SET } from '../../lib/shortcuts';
import { useApp } from '../../state/AppContext';
import { clearSyncLog, readSyncLog, syncLogText } from '../../lib/syncLog';
import type { ViewKey } from '../../types';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';

interface NavItem {
  key: ViewKey;
  labelKey: StringKey;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  labelKey: StringKey;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    labelKey: 'nav.group.plan',
    items: [
      { key: 'overview', labelKey: 'nav.overview', icon: LayoutDashboard },
      { key: 'gap-radar', labelKey: 'nav.gap-radar', icon: Radar },
      { key: 'screenplay', labelKey: 'nav.screenplay', icon: Film },
      { key: 'story-map', labelKey: 'nav.story-map', icon: Waypoints },
      { key: 'vision',   labelKey: 'nav.vision',   icon: Quote },
      { key: 'idea-hub', labelKey: 'nav.idea-hub', icon: Lightbulb },
      { key: 'neuron',   labelKey: 'nav.neuron',   icon: Network },
      { key: 'schedule', labelKey: 'nav.schedule', icon: CalendarRange },
      { key: 'crew',     labelKey: 'nav.crew',     icon: Users },
    ],
  },
  {
    labelKey: 'nav.group.make',
    items: [
      { key: 'cast',       labelKey: 'nav.cast',       icon: Clapperboard },
      { key: 'surface',    labelKey: 'nav.surface',    icon: Anchor },
      { key: 'four',       labelKey: 'nav.four',       icon: UsersRound },
      { key: 'life-mosaic',labelKey: 'nav.life-mosaic',icon: MilestoneIcon },
      { key: 'threads',    labelKey: 'nav.threads',    icon: GitBranch },
      { key: 'spine',      labelKey: 'nav.spine',      icon: Layers },
      { key: 'shoots',     labelKey: 'nav.shoots',     icon: MapPin },
      { key: 'usa-trip',   labelKey: 'nav.usa-trip',   icon: Route },
      { key: 'interviews', labelKey: 'nav.interviews', icon: Notebook },
      { key: 'choir',      labelKey: 'nav.choir',      icon: Music },
      { key: 'swings',     labelKey: 'nav.swings',     icon: Sparkles },
      { key: 'devices',    labelKey: 'nav.devices',    icon: Compass },
      { key: 'resonance',  labelKey: 'nav.resonance',  icon: Orbit },
      { key: 'records',    labelKey: 'nav.records',    icon: Trophy },
      { key: 'physiology', labelKey: 'nav.physiology', icon: HeartPulse },
      { key: 'watchers',   labelKey: 'nav.watchers',   icon: Eye },
      { key: 'camera-team',labelKey: 'nav.camera-team',icon: Activity },
    ],
  },
  {
    labelKey: 'nav.group.tell',
    items: [
      { key: 'pitch',        labelKey: 'nav.pitch',        icon: FileText },
      { key: 'scenario',     labelKey: 'nav.scenario',     icon: Coins },
      { key: 'pitch-deck',   labelKey: 'nav.pitch-deck',   icon: Presentation },
      { key: 'journal',      labelKey: 'nav.journal',      icon: ScrollText },
    ],
  },
  {
    labelKey: 'nav.group.library',
    items: [
      { key: 'references',   labelKey: 'nav.references',   icon: BookOpen },
      { key: 'chapter-2023', labelKey: 'nav.chapter-2023', icon: ListChecks },
    ],
  },
];

/* Flat view order — mirrors the grouped menu, reused by the mobile top tab strip. */
export const NAV_VIEW_ORDER: ViewKey[] = GROUPS.flatMap((g) => g.items.map((i) => i.key));


interface SidebarProps {
  /* Phase 11 — drawer-mode props for phone. On md+ these are ignored. */
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

export function Sidebar({ drawerOpen = false, onCloseDrawer }: SidebarProps = {}) {
  const { state, dispatch, undo, redo, canUndo, canRedo, cloudEnabled, session, cloudStatus, signOut, publishLocal, uiMode, setUiMode } = useApp();
  const t = useT();
  const [backupOpen, setBackupOpen] = useState(false);

  /* In simple mode, show only the core pillars; drop groups that empty out. */
  const groups = uiMode === 'simple'
    ? GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => SIMPLE_VIEW_SET.has(i.key)) })).filter((g) => g.items.length > 0)
    : GROUPS;

  function setView(view: ViewKey) {
    dispatch({ type: 'SET_VIEW', view });
    onCloseDrawer?.();
  }

  function handleReset() {
    if (window.confirm('Reset to seed?\n\nThis discards all your edits and restores the original seed data.')) {
      dispatch({ type: 'RESET_TO_SEED' });
    }
  }

  return (
    <aside
      className={`w-[260px] shrink-0 h-full flex flex-col bg-[color:var(--color-chrome)] border-r-[0.5px] border-[color:var(--color-border-chrome-strong)] scrollbar-chrome
        fixed top-0 left-0 z-40 transition-transform duration-200 ease-out
        lg:static lg:z-auto lg:translate-x-0 lg:transition-none
        ${drawerOpen ? 'translate-x-0 shadow-[8px_0_32px_rgba(0,0,0,0.35)]' : '-translate-x-full lg:shadow-none'}
      `}
      aria-hidden={!drawerOpen ? undefined : 'false'}
    >
      {/* Wordmark */}
      <div className="px-7 pt-8 pb-9">
        <h1 className="display-italic text-[34px] text-[color:var(--color-on-chrome)] leading-none">
          Deep&nbsp;Dive
        </h1>
        <div className="prose-body italic text-[12px] text-[color:var(--color-brass)] mt-1 tracking-wide">
          two thousand twenty-six
        </div>
        <div className="mt-3 h-px w-12 bg-[color:var(--color-border-brass)]" />
        <div className="prose-body italic text-[11px] text-[color:var(--color-on-chrome-faint)] mt-3 leading-snug">
          one person holds another<br />in the world
        </div>
      </div>

      {/* Simple / Full mode toggle */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1 p-0.5 rounded-[4px] bg-[color:var(--color-chrome-deep)]/60 border-[0.5px] border-[color:var(--color-border-chrome)]">
          {(['simple', 'full'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setUiMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[3px] text-[11px] tracking-[0.1em] uppercase transition-colors ${
                uiMode === m
                  ? 'bg-[color:var(--color-chrome-elevated)] text-[color:var(--color-brass)]'
                  : 'text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome-muted)]'
              }`}
            >
              {m === 'simple' ? <Sparkles size={11} /> : <Layers2 size={11} />}
              {m}
            </button>
          ))}
        </div>
        {uiMode === 'simple' && (
          <div className="text-[11px] text-[color:var(--color-on-chrome-faint)] mt-1.5 px-1 leading-snug italic">
            the essentials · switch to Full for every module
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {groups.map((group) => (
          <div key={group.labelKey} className="mb-7">
            <div className="px-3 mb-2.5 flex items-center gap-2.5">
              <span className="label-caps text-[color:var(--color-brass)]/75">
                {t(group.labelKey)}
              </span>
              <div className="flex-1 h-px bg-[color:var(--color-border-brass)]/50" />
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = state.activeView === item.key;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setView(item.key)}
                      className={`relative w-full text-left flex items-center gap-3 px-3 py-2 rounded-[3px] transition-colors duration-150 ${
                        active
                          ? 'bg-[color:var(--color-chrome-elevated)] text-[color:var(--color-on-chrome)]'
                          : 'text-[color:var(--color-on-chrome-muted)] hover:text-[color:var(--color-on-chrome)] hover:bg-[color:var(--color-chrome-elevated)]/55'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[color:var(--color-brass)] rounded-r" />
                      )}
                      <Icon size={14} className="shrink-0 opacity-90" />
                      <span
                        className={
                          active
                            ? 'display-italic text-[15px]'
                            : 'font-sans text-[13px] font-normal'
                        }
                      >
                        {t(item.labelKey)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t-[0.5px] border-[color:var(--color-border-chrome)] px-7 py-5 space-y-3.5">
        {/* Undo / redo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className="flex items-center gap-1.5 py-1 font-sans text-[11px] text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome)] disabled:opacity-30 disabled:hover:text-[color:var(--color-on-chrome-faint)] transition-colors duration-150"
          >
            <Undo2 size={11} />
            <span className="italic">undo</span>
          </button>
          <span className="text-[color:var(--color-on-chrome-faint)] opacity-40">·</span>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
            className="flex items-center gap-1.5 py-1 font-sans text-[11px] text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome)] disabled:opacity-30 disabled:hover:text-[color:var(--color-on-chrome-faint)] transition-colors duration-150"
          >
            <Redo2 size={11} />
            <span className="italic">redo</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center gap-2 py-1 font-sans text-[12px] text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-coral)] transition-colors duration-150"
        >
          <RotateCcw size={11} />
          <span className="italic">reset to seed</span>
        </button>

        <button
          type="button"
          onClick={() => setBackupOpen(true)}
          className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-brass)] transition-colors"
        >
          <Save size={11} />
          <span className="italic">backup &amp; restore</span>
        </button>
        <BackupPanel open={backupOpen} onClose={() => setBackupOpen(false)} />

        {cloudEnabled && session && (
          <div className="pt-1 border-t-[0.5px] border-[color:var(--color-border-chrome)]/60">
            <div className="flex items-center gap-2 text-[11px] text-[color:var(--color-on-chrome-faint)]">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cloudStatus === 'error' ? 'var(--color-danger)' : cloudStatus === 'synced' ? 'var(--color-success)' : 'var(--color-brass)' }} />
              <span className="italic truncate flex-1">{session.user.email}</span>
              <button type="button" onClick={signOut} title="sign out" className="flex items-center gap-1 hover:text-[color:var(--color-on-chrome)]">
                <LogOut size={10} /> out
              </button>
            </div>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[color:var(--color-on-chrome-faint)]/70 mt-1">
              {cloudStatus === 'error' ? 'shared crew project · SYNC ERROR — not saved' : cloudStatus === 'synced' ? 'shared crew project · synced' : 'shared crew project · syncing…'}
            </div>
            <SyncLogPanel />
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Publish THIS browser\'s copy as the shared crew project?\n\nThis overwrites the cloud copy everyone sees with what\'s on this machine. Use it to seed the crew project from the computer that holds the real data.')) {
                  publishLocal();
                }
              }}
              title="overwrite the shared crew project with this browser's data"
              className="mt-1.5 text-[11px] tracking-[0.1em] uppercase text-[color:var(--color-on-chrome-faint)]/60 hover:text-[color:var(--color-brass)] transition-colors"
            >
              ↑ publish my copy to crew
            </button>
                      </div>
        )}

        {/* Build stamp — if this doesn't match the latest deploy, the browser
           is running a stale cached bundle (hard-refresh fixes it). */}
        <div className="font-sans text-[11px] text-[color:var(--color-on-chrome-faint)]/60">
          build {__BUILD_TS__}
        </div>

        <div className="font-sans text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-on-chrome-faint)] flex items-center gap-2">
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ⌘K
          </span>
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ⌘1–9
          </span>
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ⌘.
          </span>
        </div>
      </div>
    </aside>
  );
}


/* ---------- the sync log ----------
   What the sync actually did, in order, with the server's own words. This
   exists because "nothing is being saved" was diagnosed three times by reading
   code and guessing; one copyable panel ends that. */
function SyncLogPanel() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, tick] = useState(0);
  const events = readSyncLog();
  const failures = events.filter((e) => !e.ok).length;

  async function copy() {
    const text = syncLogText({
      localScenarioGen: state.scenarioSeedVersion,
      localMoneyGen: state.moneySeedVersion,
      build: typeof __BUILD_TS__ === 'string' ? __BUILD_TS__ : '?',
    });
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt('Copy this:', text); }
  }

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { tick((n) => n + 1); setOpen((v) => !v); }}
          className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--color-on-chrome-faint)]/60 hover:text-[color:var(--color-brass)] transition-colors"
        >
          sync log{failures > 0 && <span className="text-[color:var(--color-danger)]"> · {failures} failed</span>}
        </button>
        {open && (
          <>
            <button type="button" onClick={copy} className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--color-brass)] hover:text-[color:var(--color-on-chrome)]">
              {copied ? 'copied' : 'copy'}
            </button>
            <button type="button" onClick={() => { clearSyncLog(); tick((n) => n + 1); }} className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--color-on-chrome-faint)]/50 hover:text-[color:var(--color-on-chrome)]">
              clear
            </button>
          </>
        )}
      </div>
      {open && (
        <div className="mt-1.5 max-h-[190px] overflow-y-auto rounded-[3px] bg-[color:var(--color-chrome-deep)]/70 p-2 space-y-1">
          {events.length === 0 && (
            <p className="text-[10px] italic text-[color:var(--color-on-chrome-faint)]/60">nothing recorded yet — reload once</p>
          )}
          {events.slice().reverse().map((e, i) => (
            <div key={i} className="text-[10px] leading-snug">
              <span className="mono-num text-[color:var(--color-on-chrome-faint)]/50">{e.t.slice(11, 19)}</span>{' '}
              <span style={{ color: e.ok ? 'var(--color-on-chrome-muted)' : 'var(--color-danger)' }}>
                {e.kind} — {e.what}
              </span>
              {e.detail && (
                <div className="text-[9px] text-[color:var(--color-on-chrome-faint)]/45 break-all">
                  {JSON.stringify(e.detail)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
