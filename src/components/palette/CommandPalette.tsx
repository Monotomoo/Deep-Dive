/* Command palette · global fuzzy search across the whole film.
   ⌘K opens it; type to search people, cast, shoots, threads, topics,
   story events, ideas, interviews, swings, spine, references, holders,
   the USA trip, crew — and jump straight to wherever they live. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { CornerDownLeft } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { AppState, ViewKey } from '../../types';

interface Props { open: boolean; onClose: () => void; }

interface Entry {
  id: string;
  label: string;
  sub?: string;
  group: string;
  view: ViewKey;
  keywords?: string;
}

const NAV: { view: ViewKey; label: string }[] = [
  { view: 'overview', label: 'Overview' }, { view: 'vision', label: 'Vision' },
  { view: 'idea-hub', label: 'Idea Hub' }, { view: 'neuron', label: 'Neuron' },
  { view: 'schedule', label: 'Schedule' }, { view: 'crew', label: 'Crew' },
  { view: 'cast', label: 'Cast · Story' }, { view: 'surface', label: 'Surface' },
  { view: 'four', label: 'The Four' }, { view: 'life-mosaic', label: 'Life Mosaic' },
  { view: 'threads', label: 'Threads' }, { view: 'spine', label: 'Spine' },
  { view: 'shoots', label: 'Shoots' }, { view: 'usa-trip', label: 'USA Trip' },
  { view: 'interviews', label: 'Interviews' }, { view: 'choir', label: 'Choir' },
  { view: 'swings', label: 'Bigger Swings' }, { view: 'devices', label: 'Devices' },
  { view: 'resonance', label: 'Resonance' }, { view: 'records', label: 'Records' },
  { view: 'physiology', label: 'Physiology' }, { view: 'watchers', label: 'Watchers' },
  { view: 'camera-team', label: 'Camera Team' }, { view: 'pitch', label: 'Pitch' },
  { view: 'journal', label: 'Journal' },
  { view: 'references', label: 'References' },
  { view: 'chapter-2023', label: 'The 2023 Chapter' },
];

function buildIndex(state: AppState): Entry[] {
  const out: Entry[] = [];
  NAV.forEach((n) => out.push({ id: `view:${n.view}`, label: n.label, group: 'Go to', view: n.view, keywords: 'view page tab' }));
  state.four.forEach((f) => out.push({ id: `four:${f.key}`, label: f.name, sub: f.role, group: 'The Four', view: 'cast', keywords: `${f.epithet} ${f.hometown}` }));
  state.talents.forEach((tl) => out.push({ id: `tal:${tl.id}`, label: tl.name, sub: tl.role, group: 'Cast', view: 'cast', keywords: tl.whyInFilm }));
  state.shoots.forEach((s) => out.push({ id: `shoot:${s.id}`, label: s.title, sub: s.location, group: 'Shoots', view: 'shoots', keywords: s.spirit }));
  state.threads.forEach((th) => out.push({ id: `thread:${th.id}`, label: `${th.num} · ${th.title}`, sub: th.subtitle, group: 'Threads', view: 'threads', keywords: th.synopsis }));
  state.topics.forEach((tp) => out.push({ id: `topic:${tp.id}`, label: tp.title, sub: tp.question, group: 'Topics', view: 'cast' }));
  state.storyEvents.forEach((e) => out.push({ id: `event:${e.id}`, label: e.title, sub: `${e.year}`, group: 'Events', view: 'cast', keywords: e.summary }));
  state.hubIdeas.forEach((i) => out.push({ id: `idea:${i.id}`, label: i.title, sub: i.kind, group: 'Ideas', view: 'idea-hub', keywords: i.body }));
  state.interviews.forEach((iv) => {
    const shoot = state.shoots.find((s) => s.id === iv.shootId);
    const who = iv.personKey === 'together' ? 'The four' : iv.personKey === 'other'
      ? state.talents.find((t) => t.id === iv.talentIds?.[0])?.name ?? 'Cast'
      : state.four.find((f) => f.key === iv.personKey)?.name ?? iv.personKey;
    out.push({ id: `int:${iv.id}`, label: `${who} · ${shoot?.title.split('·')[0].trim() ?? ''}`, sub: iv.date, group: 'Interviews', view: 'interviews', keywords: iv.standoutQuotes?.join(' ') });
  });
  state.swings.forEach((s) => out.push({ id: `swing:${s.id}`, label: s.title, sub: 'bigger swing', group: 'Swings', view: 'swings', keywords: s.whyItMatters }));
  state.spineIdeas.forEach((s) => out.push({ id: `spine:${s.id}`, label: s.title, sub: s.status, group: 'Spine', view: 'spine', keywords: s.body }));
  state.references.forEach((r) => out.push({ id: `ref:${r.id}`, label: r.title, sub: r.director ?? r.author, group: 'References', view: 'references', keywords: r.whyItMatters }));
  state.holders.forEach((h) => { const f = state.four.find((x) => x.key === h.subjectKey); out.push({ id: `hold:${h.id}`, label: h.name, sub: `holds ${f?.name.split(' ')[0] ?? ''} · ${h.relationship}`, group: 'Surface', view: 'surface', keywords: h.oneLine }); });
  state.usaTrip.stops.forEach((s) => out.push({ id: `stop:${s.id}`, label: s.name, sub: 'USA trip stop', group: 'USA Trip', view: 'usa-trip', keywords: (s.pois ?? []).map((p) => p.name).join(' ') }));
  state.crew.forEach((c) => out.push({ id: `crew:${c.id}`, label: c.name, sub: c.role, group: 'Crew', view: 'crew' }));
  return out;
}

export function CommandPalette({ open, onClose }: Props) {
  const { state, dispatch } = useApp();
  const t = useT();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const index = useMemo(() => buildIndex(state), [state]);
  const fuse = useMemo(() => new Fuse(index, { keys: ['label', 'sub', 'group', 'keywords'], threshold: 0.4, ignoreLocation: true }), [index]);

  const results = useMemo(() => {
    if (!query.trim()) return index.filter((e) => e.group === 'Go to');
    return fuse.search(query).slice(0, 40).map((r) => r.item);
  }, [query, fuse, index]);

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); }
  }, [open]);
  useEffect(() => { setActive(0); }, [query]);

  function choose(e: Entry) {
    dispatch({ type: 'SET_VIEW', view: e.view });
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) choose(results[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-24 bg-[color:var(--color-chrome-deep)]/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        >
          <motion.div
            className="w-[600px] max-w-[92vw] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[5px] overflow-hidden shadow-[0_16px_48px_rgba(4,21,49,0.4)]"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`${t('common.search')} the whole film — people, shoots, ideas, topics…`}
              className="w-full bg-transparent px-4 py-3.5 outline-none border-b-[0.5px] border-[color:var(--color-border-paper)] text-[15px] italic prose-body"
            />
            <ul ref={listRef} className="max-h-[420px] overflow-y-auto py-1">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)]">Nothing matches “{query}”.</li>
              )}
              {results.map((e, i) => (
                <li key={e.id} data-idx={i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(e)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2 ${i === active ? 'bg-[color:var(--color-brass)]/12' : ''}`}
                  >
                    <span className="shrink-0 w-[74px] label-caps text-[8px] text-[color:var(--color-brass-deep)]">{e.group}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block display-italic text-[15px] text-[color:var(--color-on-paper)] truncate">{e.label}</span>
                      {e.sub && <span className="block prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] truncate">{e.sub}</span>}
                    </span>
                    {i === active && <CornerDownLeft size={13} className="shrink-0 text-[color:var(--color-brass)]" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 px-4 py-2 border-t-[0.5px] border-[color:var(--color-border-paper)] text-[9px] tracking-wide uppercase text-[color:var(--color-on-paper-faint)]">
              <span>↑↓ move</span><span>↵ open</span><span>esc close</span>
              <div className="flex-1" />
              <span>{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
