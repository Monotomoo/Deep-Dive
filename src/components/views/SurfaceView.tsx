import { useMemo, useState } from 'react';
import { Anchor, Music, Package, Plus, Sparkles, Trash2, Users2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { FourKey, Holder, HolderConsent, HolderKind, TalentFour } from '../../types';

/* One person holds another in the world.
   For each of the Four, list the people, places, objects, rituals, and
   songs that hold them at the surface. This is the film's thesis, made
   browsable. */

const KIND_ICON: Record<HolderKind, typeof Users2> = {
  person: Users2,
  place: Anchor,
  object: Package,
  ritual: Sparkles,
  song: Music,
};

const KIND_ORDER: HolderKind[] = ['person', 'place', 'object', 'ritual', 'song'];

const CONSENT_TONE: Record<HolderConsent, string> = {
  pending: 'var(--color-brass)',
  given: 'var(--color-olive)',
  declined: 'var(--color-coral)',
  na: 'var(--color-on-paper-faint)',
};

type Filter = 'all' | HolderKind;

function makeId() {
  return `h-${Math.random().toString(36).slice(2, 9)}`;
}

export function SurfaceView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Holder | null>(null);
  const [addingFor, setAddingFor] = useState<FourKey | null>(null);

  const byPerson = useMemo(() => {
    const map: Record<FourKey, Holder[]> = { petar: [], vito: [], sanda: [], zsofia: [] };
    for (const h of state.holders) {
      if (filter !== 'all' && h.kind !== filter) continue;
      map[h.subjectKey].push(h);
    }
    for (const key of Object.keys(map) as FourKey[]) {
      map[key].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
    }
    return map;
  }, [state.holders, filter]);

  const filters: { key: Filter; labelKey: StringKey }[] = [
    { key: 'all', labelKey: 'surface.filter.all' },
    { key: 'person', labelKey: 'surface.filter.person' },
    { key: 'place', labelKey: 'surface.filter.place' },
    { key: 'object', labelKey: 'surface.filter.object' },
    { key: 'ritual', labelKey: 'surface.filter.ritual' },
    { key: 'song', labelKey: 'surface.filter.song' },
  ];

  function startAdd(subjectKey: FourKey) {
    setAddingFor(subjectKey);
    setEditing({
      id: makeId(),
      subjectKey,
      kind: 'person',
      name: '',
      relationship: '',
      oneLine: '',
      consent: 'pending',
      onCameraWilling: undefined,
    });
  }

  function saveHolder(h: Holder) {
    const exists = state.holders.some((x) => x.id === h.id);
    if (exists) dispatch({ type: 'UPDATE_HOLDER', id: h.id, patch: h });
    else dispatch({ type: 'ADD_HOLDER', holder: h });
    setEditing(null);
    setAddingFor(null);
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">
          {t('surface.title')}
        </h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
          {t('surface.subtitle')}
        </p>
        <div className="mt-4 max-w-[520px] display-italic text-[22px] leading-snug text-[color:var(--color-on-paper)]">
          <span className="text-[color:var(--color-brass)]">“</span>
          {t('surface.hero')}
          <span className="text-[color:var(--color-brass)]">”</span>
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-[3px] font-sans text-[11px] tracking-wide transition-colors ${
              filter === f.key
                ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] border-[0.5px] border-[color:var(--color-border-paper)]'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Four columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {state.four.map((subject) => (
          <SubjectColumn
            key={subject.key}
            subject={subject}
            holders={byPerson[subject.key]}
            onAdd={() => startAdd(subject.key)}
            onEdit={(h) => setEditing(h)}
            onDelete={(id) => {
              if (confirm(`Delete "${state.holders.find((x) => x.id === id)?.name ?? 'this holder'}"?`)) {
                dispatch({ type: 'DELETE_HOLDER', id });
              }
            }}
          />
        ))}
      </div>

      {editing && (
        <HolderEditor
          holder={editing}
          isNew={addingFor !== null}
          onSave={saveHolder}
          onCancel={() => {
            setEditing(null);
            setAddingFor(null);
          }}
        />
      )}
    </div>
  );
}

function SubjectColumn({
  subject,
  holders,
  onAdd,
  onEdit,
  onDelete,
}: {
  subject: TalentFour;
  holders: Holder[];
  onAdd: () => void;
  onEdit: (h: Holder) => void;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const color = subject.colorHint ?? 'var(--color-brass)';
  return (
    <section
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col min-h-[400px]"
      style={{ borderTopWidth: 3, borderTopColor: color }}
    >
      <header className="pb-3 mb-3 border-b-[0.5px] border-[color:var(--color-border-paper)]">
        <div className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight">
          {subject.name}
        </div>
        <div className="prose-body italic text-[11px] text-[color:var(--color-brass)] mt-0.5">
          {subject.role}
        </div>
      </header>

      <div className="flex-1 space-y-2">
        {holders.length === 0 ? (
          <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] text-center py-8">
            {t('surface.empty.subject')}
          </div>
        ) : (
          holders.map((h) => (
            <HolderCard key={h.id} holder={h} onEdit={() => onEdit(h)} onDelete={() => onDelete(h.id)} />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] hover:border-[color:var(--color-brass)] text-[11px] transition-colors"
      >
        <Plus size={12} />
        <span className="italic">{t('surface.add')}</span>
      </button>
    </section>
  );
}

function HolderCard({
  holder,
  onEdit,
  onDelete,
}: {
  holder: Holder;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const Icon = KIND_ICON[holder.kind];
  const kindLabel = t(`surface.kind.${holder.kind}` as StringKey);
  return (
    <article
      className="group relative bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 hover:border-[color:var(--color-brass)] transition-colors cursor-pointer"
      onClick={onEdit}
      style={{ borderLeftWidth: 3, borderLeftColor: holder.colorHint ?? 'var(--color-brass-deep)' }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)] transition-opacity"
        aria-label="delete"
      >
        <Trash2 size={12} />
      </button>
      <div className="flex items-start gap-2 mb-1.5">
        <Icon size={12} className="mt-0.5 text-[color:var(--color-brass-deep)] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="display-italic text-[15px] text-[color:var(--color-on-paper)] leading-tight">{holder.name}</div>
          <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            {kindLabel} · {holder.relationship}
          </div>
        </div>
      </div>
      {holder.oneLine && (
        <p className="prose-body text-[12px] text-[color:var(--color-on-paper)] leading-snug italic">
          “{holder.oneLine}”
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 text-[9px] tracking-wide">
        <span
          className="uppercase font-sans"
          style={{ color: `color-mix(in oklab, ${CONSENT_TONE[holder.consent]} 100%, white)` }}
        >
          {t(`surface.consent.${holder.consent}` as StringKey)}
        </span>
        {holder.onCameraWilling !== undefined && (
          <span className="text-[color:var(--color-on-paper-faint)]">
            · {holder.onCameraWilling ? 'on-camera ok' : 'no camera'}
          </span>
        )}
      </div>
    </article>
  );
}

function HolderEditor({
  holder,
  isNew,
  onSave,
  onCancel,
}: {
  holder: Holder;
  isNew: boolean;
  onSave: (h: Holder) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [h, setH] = useState<Holder>(holder);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[520px] w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">
            {isNew ? t('surface.add') : t('common.edit')}
          </div>
          <button type="button" onClick={onCancel} className="text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]">
            <X size={16} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('surface.name')}</div>
            <input
              type="text"
              value={h.name}
              onChange={(e) => setH({ ...h, name: e.target.value })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
              autoFocus
            />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">kind</div>
            <select
              value={h.kind}
              onChange={(e) => setH({ ...h, kind: e.target.value as HolderKind })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>{t(`surface.kind.${k}` as StringKey)}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('surface.relationship')}</div>
          <input
            type="text"
            value={h.relationship}
            onChange={(e) => setH({ ...h, relationship: e.target.value })}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
          />
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('surface.oneLine')}</div>
          <textarea
            value={h.oneLine}
            onChange={(e) => setH({ ...h, oneLine: e.target.value })}
            placeholder={t('surface.oneLine.hint')}
            rows={3}
            className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('surface.consent')}</div>
            <select
              value={h.consent}
              onChange={(e) => setH({ ...h, consent: e.target.value as HolderConsent })}
              className="w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]"
            >
              <option value="pending">{t('surface.consent.pending')}</option>
              <option value="given">{t('surface.consent.given')}</option>
              <option value="declined">{t('surface.consent.declined')}</option>
              <option value="na">{t('surface.consent.na')}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              checked={!!h.onCameraWilling}
              onChange={(e) => setH({ ...h, onCameraWilling: e.target.checked })}
            />
            <span className="text-[12px] text-[color:var(--color-on-paper-muted)]">{t('surface.onCamera')}</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onSave(h)}
            disabled={!h.name.trim()}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
