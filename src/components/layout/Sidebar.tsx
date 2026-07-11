import {
  AlertTriangle,
  Activity,
  BookOpen,
  CalendarRange,
  Compass,
  Disc3,
  Eye,
  FileText,
  GitBranch,
  Handshake,
  HeartPulse,
  Layers,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Notebook,
  Quote,
  Redo2,
  RotateCcw,
  Scroll,
  ScrollText,
  Send,
  Sparkles,
  Trophy,
  UsersRound,
  Undo2,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useApp } from '../../state/AppContext';
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
      { key: 'vision',   labelKey: 'nav.vision',   icon: Quote },
      { key: 'schedule', labelKey: 'nav.schedule', icon: CalendarRange },
      { key: 'crew',     labelKey: 'nav.crew',     icon: Users },
      { key: 'sponsors', labelKey: 'nav.sponsors', icon: Handshake },
      { key: 'risks',    labelKey: 'nav.risks',    icon: AlertTriangle },
    ],
  },
  {
    labelKey: 'nav.group.make',
    items: [
      { key: 'four',       labelKey: 'nav.four',       icon: UsersRound },
      { key: 'threads',    labelKey: 'nav.threads',    icon: GitBranch },
      { key: 'spine',      labelKey: 'nav.spine',      icon: Layers },
      { key: 'shoots',     labelKey: 'nav.shoots',     icon: MapPin },
      { key: 'interviews', labelKey: 'nav.interviews', icon: Notebook },
      { key: 'swings',     labelKey: 'nav.swings',     icon: Sparkles },
      { key: 'devices',    labelKey: 'nav.devices',    icon: Compass },
      { key: 'records',    labelKey: 'nav.records',    icon: Trophy },
      { key: 'physiology', labelKey: 'nav.physiology', icon: HeartPulse },
      { key: 'watchers',   labelKey: 'nav.watchers',   icon: Eye },
    ],
  },
  {
    labelKey: 'nav.group.tell',
    items: [
      { key: 'pitch',        labelKey: 'nav.pitch',        icon: FileText },
      { key: 'distribution', labelKey: 'nav.distribution', icon: Send },
      { key: 'contracts',    labelKey: 'nav.contracts',    icon: Scroll },
      { key: 'journal',      labelKey: 'nav.journal',      icon: ScrollText },
      { key: 'post',         labelKey: 'nav.post',         icon: Disc3 },
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

/* Silence unused-import warnings for icons that may not be picked up above.
   Kept for potential future use. */
void Activity;

interface SidebarProps {
  /* Phase 11 — drawer-mode props for phone. On md+ these are ignored. */
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

export function Sidebar({ drawerOpen = false, onCloseDrawer }: SidebarProps = {}) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useApp();
  const t = useT();

  function setView(view: ViewKey) {
    dispatch({ type: 'SET_VIEW', view });
    /* Close drawer after navigation on phone — desktop ignores this. */
    onCloseDrawer?.();
  }

  function handleReset() {
    if (
      window.confirm(
        'Reset to seed?\n\nThis discards all your edits and restores the original seed data.'
      )
    ) {
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

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {GROUPS.map((group) => (
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
        {/* Scenario chip */}
        <div className="flex items-baseline justify-between">
          <span className="label-caps text-[color:var(--color-on-chrome-faint)]">
            Scenario
          </span>
          <span className="display-italic text-[15px] text-[color:var(--color-brass)]">
            {state.activeScenario}
          </span>
        </div>

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

        <div className="font-sans text-[10px] tracking-[0.14em] uppercase text-[color:var(--color-on-chrome-faint)] flex items-center gap-2">
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ⌘K
          </span>
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ⌘1–9
          </span>
          <span className="border-[0.5px] border-[color:var(--color-border-chrome-strong)] rounded px-1.5 py-[1px]">
            ?
          </span>
        </div>

        {/* Locale switcher — Phase 12 wave 4 */}
        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_LOCALE', locale: 'en' })}
            className={`px-2 py-0.5 rounded-[2px] font-sans text-[10px] tracking-[0.10em] uppercase transition-colors ${
              state.locale === 'en'
                ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome)] border-[0.5px] border-[color:var(--color-border-chrome-strong)]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_LOCALE', locale: 'hr' })}
            className={`px-2 py-0.5 rounded-[2px] font-sans text-[10px] tracking-[0.10em] uppercase transition-colors ${
              state.locale === 'hr'
                ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-chrome-faint)] hover:text-[color:var(--color-on-chrome)] border-[0.5px] border-[color:var(--color-border-chrome-strong)]'
            }`}
          >
            HR
          </button>
        </div>
      </div>
    </aside>
  );
}
