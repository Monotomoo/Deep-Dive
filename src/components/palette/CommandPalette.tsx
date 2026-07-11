/* Minimal palette stub — Deep Dive v0.1
   Full fuzzy search palette will be rebuilt in v0.2. For now, just navigates
   to a view via keyboard sequence. */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { ViewKey } from '../../types';

interface Props { open: boolean; onClose: () => void; }

const VIEW_LIST: { key: ViewKey; labelKey: StringKey }[] = [
  { key: 'overview',      labelKey: 'nav.overview' },
  { key: 'vision',        labelKey: 'nav.vision' },
  { key: 'four',          labelKey: 'nav.four' },
  { key: 'threads',       labelKey: 'nav.threads' },
  { key: 'spine',         labelKey: 'nav.spine' },
  { key: 'shoots',        labelKey: 'nav.shoots' },
  { key: 'interviews',    labelKey: 'nav.interviews' },
  { key: 'swings',        labelKey: 'nav.swings' },
  { key: 'devices',       labelKey: 'nav.devices' },
  { key: 'records',       labelKey: 'nav.records' },
  { key: 'physiology',    labelKey: 'nav.physiology' },
  { key: 'watchers',      labelKey: 'nav.watchers' },
  { key: 'schedule',      labelKey: 'nav.schedule' },
  { key: 'crew',          labelKey: 'nav.crew' },
  { key: 'sponsors',      labelKey: 'nav.sponsors' },
  { key: 'risks',         labelKey: 'nav.risks' },
  { key: 'pitch',         labelKey: 'nav.pitch' },
  { key: 'distribution',  labelKey: 'nav.distribution' },
  { key: 'contracts',     labelKey: 'nav.contracts' },
  { key: 'journal',       labelKey: 'nav.journal' },
  { key: 'post',          labelKey: 'nav.post' },
  { key: 'references',    labelKey: 'nav.references' },
  { key: 'chapter-2023',  labelKey: 'nav.chapter-2023' },
];

export function CommandPalette({ open, onClose }: Props) {
  const { dispatch } = useApp();
  const t = useT();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const q = query.toLowerCase();
  const filtered = VIEW_LIST.filter((v) => q === '' || t(v.labelKey).toLowerCase().includes(q));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-[color:var(--color-chrome-deep)]/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-[560px] max-w-[92vw] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[4px] overflow-hidden"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.search')}
              className="w-full bg-transparent px-4 py-3 outline-none border-b-[0.5px] border-[color:var(--color-border-paper)] text-[15px] italic prose-body"
            />
            <ul className="max-h-96 overflow-y-auto">
              {filtered.map((v) => (
                <li key={v.key}>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-[color:var(--color-paper-deep)]/30 display-italic text-[16px] text-[color:var(--color-on-paper)]"
                    onClick={() => { dispatch({ type: 'SET_VIEW', view: v.key }); onClose(); }}
                  >
                    {t(v.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
