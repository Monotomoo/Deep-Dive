import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { MotifChain, MotifItem, MotifItemSource, ResonanceKind } from '../../types';

/* Resonance · image echoes.
   Motif chains group visual/aural/gestural rhymes that make the film
   feel woven. Each chain expands to a horizontal reel of items. */

const KIND_COLORS: Record<ResonanceKind, string> = {
  visual: 'var(--color-brass)',
  aural: 'var(--color-dock)',
  gestural: 'var(--color-olive)',
  situational: 'var(--color-warn)',
  chromatic: 'var(--color-brass-deep)',
};

const KINDS: ResonanceKind[] = ['visual', 'aural', 'gestural', 'situational', 'chromatic'];
const SOURCES: MotifItemSource[] = ['shoot', 'reference', 'imagined', 'observed', 'quote'];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ResonanceView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(state.motifChains.map((c) => c.id)));
  const [kindFilter, setKindFilter] = useState<ResonanceKind | 'all'>('all');
  const [editingChain, setEditingChain] = useState<MotifChain | null>(null);
  const [addingChain, setAddingChain] = useState(false);
  const [editingItem, setEditingItem] = useState<{ chainId: string; item: MotifItem } | null>(null);
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);

  const chains = useMemo(() => {
    return state.motifChains.filter((c) => kindFilter === 'all' || c.kind === kindFilter);
  }, [state.motifChains, kindFilter]);

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startAddChain() {
    setAddingChain(true);
    setEditingChain({
      id: makeId('mc'),
      title: '',
      kind: 'visual',
      synopsis: '',
      items: [],
      createdAt: new Date(2026, 6, 11).toISOString(),
    });
  }

  function saveChain(chain: MotifChain) {
    const exists = state.motifChains.some((c) => c.id === chain.id);
    if (exists) dispatch({ type: 'UPDATE_MOTIF_CHAIN', id: chain.id, patch: chain });
    else dispatch({ type: 'ADD_MOTIF_CHAIN', chain });
    setEditingChain(null);
    setAddingChain(false);
  }

  function startAddItem(chainId: string) {
    setAddingItemFor(chainId);
    setEditingItem({
      chainId,
      item: {
        id: makeId('mi'),
        description: '',
        source: 'imagined',
      },
    });
  }

  function saveItem(chainId: string, item: MotifItem) {
    const chain = state.motifChains.find((c) => c.id === chainId);
    const exists = chain?.items.some((it) => it.id === item.id);
    if (exists) dispatch({ type: 'UPDATE_MOTIF_ITEM', chainId, itemId: item.id, patch: item });
    else dispatch({ type: 'ADD_MOTIF_ITEM', chainId, item });
    setEditingItem(null);
    setAddingItemFor(null);
  }

  return (
    <div className="space-y-6 max-w-[1300px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('resonance.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('resonance.subtitle')}</p>
      </header>

      {/* Filter + add */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setKindFilter('all')}
          className={`px-2.5 py-1 rounded-[3px] text-[11px] transition-colors ${
            kindFilter === 'all'
              ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
              : 'text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)]'
          }`}
        >
          all
        </button>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKindFilter(k)}
            className={`px-2.5 py-1 rounded-[3px] text-[11px] transition-colors flex items-center gap-1.5 ${
              kindFilter === k
                ? 'text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)]'
            }`}
            style={kindFilter === k ? { background: KIND_COLORS[k] } : {}}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLORS[k] }} />
            {t(`resonance.kind.${k}` as StringKey)}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={startAddChain}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] text-[color:var(--color-brass)] border-[0.5px] border-[color:var(--color-brass)] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
        >
          <Plus size={11} /> {t('resonance.addChain')}
        </button>
      </div>

      {/* Chain list */}
      <div className="space-y-3">
        {chains.map((chain) => (
          <ChainCard
            key={chain.id}
            chain={chain}
            isOpen={openIds.has(chain.id)}
            onToggle={() => toggleOpen(chain.id)}
            onEditChain={() => setEditingChain(chain)}
            onDeleteChain={() => {
              if (confirm(t('resonance.deleteChain.confirm'))) {
                dispatch({ type: 'DELETE_MOTIF_CHAIN', id: chain.id });
              }
            }}
            onEditItem={(item) => setEditingItem({ chainId: chain.id, item })}
            onDeleteItem={(itemId) =>
              dispatch({ type: 'DELETE_MOTIF_ITEM', chainId: chain.id, itemId })
            }
            onAddItem={() => startAddItem(chain.id)}
          />
        ))}
      </div>

      {editingChain && (
        <ChainEditor
          chain={editingChain}
          isNew={addingChain}
          onSave={saveChain}
          onCancel={() => {
            setEditingChain(null);
            setAddingChain(false);
          }}
        />
      )}

      {editingItem && (
        <ItemEditor
          item={editingItem.item}
          isNew={addingItemFor !== null}
          onSave={(item) => saveItem(editingItem.chainId, item)}
          onCancel={() => {
            setEditingItem(null);
            setAddingItemFor(null);
          }}
        />
      )}
    </div>
  );
}

function ChainCard({
  chain, isOpen, onToggle, onEditChain, onDeleteChain, onEditItem, onDeleteItem, onAddItem,
}: {
  chain: MotifChain;
  isOpen: boolean;
  onToggle: () => void;
  onEditChain: () => void;
  onDeleteChain: () => void;
  onEditItem: (item: MotifItem) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}) {
  const t = useT();
  const kindColor = KIND_COLORS[chain.kind];

  return (
    <article
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: kindColor }}
    >
      <header
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[color:var(--color-paper-card)]"
        onClick={onToggle}
      >
        <button type="button" className="text-[color:var(--color-on-paper-muted)]" aria-label={isOpen ? 'collapse' : 'expand'}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="display-italic text-[19px] text-[color:var(--color-on-paper)] leading-tight">{chain.title}</div>
          <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            <span style={{ color: kindColor }} className="font-sans uppercase text-[9px] tracking-wide mr-2">
              {t(`resonance.kind.${chain.kind}` as StringKey)}
            </span>
            {chain.synopsis}
          </div>
        </div>
        <div className="text-[10px] text-[color:var(--color-on-paper-faint)] shrink-0">
          {chain.items.length} items
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEditChain(); }}
          className="text-[10px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"
        >
          {t('common.edit')}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDeleteChain(); }}
          className="text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"
        >
          <Trash2 size={11} />
        </button>
      </header>

      {isOpen && (
        <div className="p-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {chain.items.map((item) => (
              <div
                key={item.id}
                className="group relative shrink-0 w-[240px] bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
                onClick={() => onEditItem(item)}
                style={{ borderTopWidth: 3, borderTopColor: item.colorHint ?? kindColor }}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"
                >
                  <Trash2 size={11} />
                </button>
                <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper)] leading-snug mb-2">
                  “{item.description}”
                </div>
                <div className="flex items-center gap-2 text-[9px] tracking-wide">
                  <span className="uppercase font-sans text-[color:var(--color-brass-deep)]">
                    {t(`resonance.source.${item.source}` as StringKey)}
                  </span>
                  {item.sourceContext && (
                    <span className="text-[color:var(--color-on-paper-faint)] italic normal-case">
                      · {item.sourceContext}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={onAddItem}
              className="shrink-0 w-[240px] min-h-[110px] flex flex-col items-center justify-center gap-2 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] transition-colors"
            >
              <Plus size={16} />
              <span className="italic text-[11px]">{t('resonance.addItem')}</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function ChainEditor({
  chain, isNew, onSave, onCancel,
}: {
  chain: MotifChain;
  isNew: boolean;
  onSave: (c: MotifChain) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [c, setC] = useState<MotifChain>(chain);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[520px] w-full p-6 space-y-4"
        onClick={(ev) => ev.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{isNew ? t('resonance.addChain') : t('common.edit')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('resonance.chainTitle')}</div>
          <input
            type="text"
            value={c.title}
            onChange={(e) => setC({ ...c, title: e.target.value })}
            autoFocus
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
          />
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">kind</div>
          <select
            value={c.kind}
            onChange={(e) => setC({ ...c, kind: e.target.value as ResonanceKind })}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
          >
            {KINDS.map((k) => <option key={k} value={k}>{t(`resonance.kind.${k}` as StringKey)}</option>)}
          </select>
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('resonance.chainSynopsis')}</div>
          <textarea
            value={c.synopsis ?? ''}
            onChange={(e) => setC({ ...c, synopsis: e.target.value })}
            rows={2}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
          <button
            type="button"
            onClick={() => onSave(c)}
            disabled={!c.title.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemEditor({
  item, isNew, onSave, onCancel,
}: {
  item: MotifItem;
  isNew: boolean;
  onSave: (it: MotifItem) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [it, setIt] = useState<MotifItem>(item);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[480px] w-full p-6 space-y-4"
        onClick={(ev) => ev.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{isNew ? t('resonance.addItem') : t('common.edit')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('resonance.itemDescription')}</div>
          <textarea
            value={it.description}
            onChange={(e) => setIt({ ...it, description: e.target.value })}
            autoFocus
            rows={3}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">source</div>
            <select
              value={it.source}
              onChange={(e) => setIt({ ...it, source: e.target.value as MotifItemSource })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {SOURCES.map((s) => <option key={s} value={s}>{t(`resonance.source.${s}` as StringKey)}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('resonance.itemContext')}</div>
            <input
              type="text"
              value={it.sourceContext ?? ''}
              onChange={(e) => setIt({ ...it, sourceContext: e.target.value })}
              placeholder="Krk day 2 · Free Solo 42:15"
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
          <button
            type="button"
            onClick={() => onSave(it)}
            disabled={!it.description.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
