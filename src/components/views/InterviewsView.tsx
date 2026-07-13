import { useMemo, useState } from 'react';
import { CornerDownRight, Plus, Quote, Trash2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useI18n, useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import { ConnectionDrawer } from '../ConnectionDrawer';
import { VIEW_FOR_ENTITY, type EntityRef } from '../../lib/connections';
import type {
  AppState, FourKey, Interview, InterviewSetting, InterviewStatus, Shoot,
} from '../../types';

/* Interviews · grouped by location, chained by follow-ups.
   Every session lives under its shoot; anything asked once can be
   re-asked later — "add follow-up" carries the person and the topics
   to the next location, wired back via followUpOfId. */

const SETTINGS: InterviewSetting[] = ['boat', 'poolside', 'shore', 'volcano', 'lab', 'home', 'stage', 'other'];
const STATUSES: InterviewStatus[] = ['planned', 'in-session', 'captured', 'transcribed', 'in-cut', 'in-final'];

const STATUS_COLOR: Record<InterviewStatus, string> = {
  planned: '#4c6b93', 'in-session': '#d9a93e', captured: '#3d7a94',
  transcribed: '#6f8a72', 'in-cut': '#b54f26', 'in-final': '#d96c3d',
};

function makeId() {
  return `int-${Math.random().toString(36).slice(2, 9)}`;
}

function subjectLabel(state: AppState, iv: Interview): { name: string; color: string } {
  if (iv.personKey === 'together') return { name: 'The four · together', color: 'var(--color-brass)' };
  if (iv.personKey === 'other') {
    const names = (iv.talentIds ?? [])
      .map((id) => state.talents.find((x) => x.id === id)?.name)
      .filter(Boolean);
    const first = (iv.talentIds ?? [])
      .map((id) => state.talents.find((x) => x.id === id))
      .find(Boolean);
    return { name: names.join(' + ') || '—', color: first?.colorHint ?? 'var(--color-olive)' };
  }
  const f = state.four.find((x) => x.key === iv.personKey);
  return { name: f?.name ?? iv.personKey, color: f?.colorHint ?? 'var(--color-brass)' };
}

/* next planned/confirmed shoot after the given one — the follow-up's home */
function nextShootAfter(state: AppState, currentShootId: string): Shoot | null {
  const current = state.shoots.find((s) => s.id === currentShootId);
  const fromDate = current?.endDate ?? current?.startDate ?? '';
  const candidates = state.shoots
    .filter((s) => (s.status === 'planned' || s.status === 'confirmed'))
    .filter((s) => (s.startDate ?? '9999') > fromDate)
    .sort((a, b) => (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'));
  return candidates[0] ?? null;
}

export function InterviewsView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const { fmtDate } = useI18n();
  const [editing, setEditing] = useState<Interview | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [focusRef, setFocusRef] = useState<EntityRef | null>(null);

  function handleDrawerEdit(ref: EntityRef) {
    if (ref.type === 'interview') {
      const iv = state.interviews.find((x) => x.id === ref.id);
      if (iv) { setFocusRef(null); setIsNew(false); setEditing(iv); }
    } else {
      dispatch({ type: 'SET_VIEW', view: VIEW_FOR_ENTITY[ref.type] });
      setFocusRef(null);
    }
  }

  const groups = useMemo(() => {
    const shootsSorted = state.shoots.slice().sort((a, b) => (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'));
    const out: { shoot: Shoot | null; interviews: Interview[] }[] = [];
    for (const shoot of shootsSorted) {
      const ivs = state.interviews
        .filter((iv) => iv.shootId === shoot.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (ivs.length > 0) out.push({ shoot, interviews: ivs });
    }
    const orphans = state.interviews.filter((iv) => !state.shoots.some((s) => s.id === iv.shootId));
    if (orphans.length > 0) out.push({ shoot: null, interviews: orphans });
    return out;
  }, [state.shoots, state.interviews]);

  function startAdd(shootId: string) {
    setIsNew(true);
    const shoot = state.shoots.find((s) => s.id === shootId);
    setEditing({
      id: makeId(), shootId, personKey: 'petar', setting: 'boat',
      date: shoot?.startDate ?? '', status: 'planned', threadIds: [],
      topicIds: [], eventIds: [],
    });
  }

  function startFollowUp(parent: Interview) {
    const next = nextShootAfter(state, parent.shootId);
    setIsNew(true);
    setEditing({
      id: makeId(),
      shootId: next?.id ?? parent.shootId,
      personKey: parent.personKey,
      talentIds: parent.talentIds,
      setting: parent.setting,
      date: next?.startDate ?? '',
      status: 'planned',
      threadIds: [...parent.threadIds],
      topicIds: [...(parent.topicIds ?? [])],
      eventIds: [...(parent.eventIds ?? [])],
      followUpOfId: parent.id,
    });
  }

  function save(iv: Interview) {
    if (state.interviews.some((x) => x.id === iv.id)) dispatch({ type: 'UPDATE_INTERVIEW', id: iv.id, patch: iv });
    else dispatch({ type: 'ADD_INTERVIEW', interview: iv });
    setEditing(null);
    setIsNew(false);
  }

  return (
    <div className="space-y-8 max-w-[1300px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('interviews.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('interviews.subtitle')}</p>
      </header>

      {groups.map(({ shoot, interviews }) => {
        const color = shoot?.colorHint ?? 'var(--color-brass-deep)';
        return (
          <section key={shoot?.id ?? 'unassigned'}>
            {/* Location header */}
            <div className="flex items-baseline gap-3 mb-3 pb-2 border-b-[0.5px]" style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)` }}>
              <span className="w-3 h-3 rounded-full shrink-0 translate-y-[1px]" style={{ background: color }} />
              <h3 className="display-italic text-[22px] text-[color:var(--color-on-paper)] leading-tight">
                {shoot ? shoot.title : t('interviews.group.unassigned')}
              </h3>
              {shoot && (
                <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)]">
                  {shoot.location}
                  {shoot.startDate && ` · ${fmtDate(shoot.startDate)}${shoot.endDate ? ` – ${fmtDate(shoot.endDate)}` : ''}`}
                </span>
              )}
              <div className="flex-1" />
              <span className="text-[10px] text-[color:var(--color-on-paper-faint)] tabular-nums">{interviews.length}</span>
              {shoot && (
                <button
                  type="button"
                  onClick={() => startAdd(shoot.id)}
                  className="flex items-center gap-1 text-[11px] text-[color:var(--color-brass)] hover:text-[color:var(--color-brass-deep)]"
                >
                  <Plus size={11} /> {t('common.add')}
                </button>
              )}
            </div>

            {/* Interview cards */}
            <div className="space-y-2">
              {interviews.map((iv) => (
                <InterviewCard
                  key={iv.id}
                  iv={iv}
                  onEdit={() => setFocusRef({ type: 'interview', id: iv.id })}
                  onFollowUp={() => startFollowUp(iv)}
                  onDelete={() => dispatch({ type: 'DELETE_INTERVIEW', id: iv.id })}
                />
              ))}
            </div>
          </section>
        );
      })}

      <ConnectionDrawer focus={focusRef} onClose={() => setFocusRef(null)} onEdit={handleDrawerEdit} />

      {editing && (
        <InterviewEditor
          interview={editing}
          isNew={isNew}
          onSave={save}
          onCancel={() => { setEditing(null); setIsNew(false); }}
        />
      )}
    </div>
  );
}

function InterviewCard({
  iv, onEdit, onFollowUp, onDelete,
}: {
  iv: Interview;
  onEdit: () => void;
  onFollowUp: () => void;
  onDelete: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const { fmtDate } = useI18n();

  const subject = subjectLabel(state, iv);
  const parent = iv.followUpOfId ? state.interviews.find((x) => x.id === iv.followUpOfId) : null;
  const parentShoot = parent ? state.shoots.find((s) => s.id === parent.shootId) : null;
  const children = state.interviews.filter((x) => x.followUpOfId === iv.id);

  return (
    <article
      className="group bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3.5 cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
      style={{ borderLeftWidth: 3, borderLeftColor: subject.color }}
      onClick={onEdit}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="display-italic text-[17px] text-[color:var(--color-on-paper)]">{subject.name}</span>
            <span className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">
              {t(`interviews.setting.${iv.setting}` as StringKey)} · {iv.date ? fmtDate(iv.date) : '—'}
              {iv.durationMin ? ` · ${iv.durationMin}′` : ''}
            </span>
            <span
              className="uppercase font-sans text-[8px] tracking-wide px-1.5 py-0.5 rounded-[2px]"
              style={{ background: `color-mix(in oklab, ${STATUS_COLOR[iv.status]} 16%, transparent)`, color: STATUS_COLOR[iv.status] }}
            >
              {t(`interviews.status.${iv.status}` as StringKey)}
            </span>
          </div>

          {/* Follow-up chain markers */}
          {parent && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[color:var(--color-on-paper-muted)]">
              <CornerDownRight size={10} className="text-[color:var(--color-brass)]" />
              <span className="italic">
                {t('interviews.followUpOf')} {subjectLabel(state, parent).name.split(' ')[0]} @ {parentShoot?.title.split('·')[0].trim() ?? '?'}
                {parent.date ? ` (${fmtDate(parent.date)})` : ''}
              </span>
            </div>
          )}
          {children.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[color:var(--color-on-paper-muted)]">
              <span className="text-[color:var(--color-brass)]">↳</span>
              <span className="italic">
                {t('interviews.followUps')}: {children.map((c) => {
                  const sh = state.shoots.find((s) => s.id === c.shootId);
                  return sh?.title.split('·')[0].trim() ?? '?';
                }).join(' · ')}
              </span>
            </div>
          )}

          {/* Chips: threads · topics · events */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {iv.threadIds.map((tid) => {
              const th = state.threads.find((x) => x.id === tid);
              return th ? <span key={tid} className="text-[9px] font-mono text-[color:var(--color-steel-light)]">#{th.num}</span> : null;
            })}
            {(iv.topicIds ?? []).map((tid) => {
              const top = state.topics.find((x) => x.id === tid);
              return top ? (
                <span
                  key={tid}
                  className="px-1.5 py-0.5 rounded-[2px] text-[9px]"
                  style={{ background: `color-mix(in oklab, ${top.colorHint ?? '#c9a961'} 14%, transparent)`, color: top.colorHint ?? '#c9a961' }}
                >
                  {top.title}
                </span>
              ) : null;
            })}
            {(iv.eventIds ?? []).map((eid) => {
              const ev = state.storyEvents.find((x) => x.id === eid);
              return ev ? (
                <span key={eid} className="px-1.5 py-0.5 rounded-[2px] text-[9px] bg-[color:var(--color-paper-deep)] text-[color:var(--color-on-paper-muted)]">
                  {ev.title.length > 30 ? `${ev.title.slice(0, 28)}…` : ev.title}
                </span>
              ) : null;
            })}
          </div>

          {iv.standoutQuotes && iv.standoutQuotes.length > 0 && (
            <div className="flex items-start gap-1.5 mt-2 text-[12px] italic text-[color:var(--color-on-paper)]">
              <Quote size={10} className="mt-1 shrink-0 text-[color:var(--color-brass)]" />
              <span>“{iv.standoutQuotes[0]}”</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFollowUp(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-[2px] border-[0.5px] border-[color:var(--color-brass)]/50 text-[10px] text-[color:var(--color-brass)] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
          >
            <CornerDownRight size={10} /> {t('interviews.addFollowUp')}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------- editor ---------- */

function InterviewEditor({
  interview, isNew, onSave, onCancel,
}: {
  interview: Interview;
  isNew: boolean;
  onSave: (iv: Interview) => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [iv, setIv] = useState<Interview>(interview);

  const subjectValue =
    iv.personKey === 'other' ? `talent:${iv.talentIds?.[0] ?? ''}` :
    iv.personKey === 'together' ? 'together' : `four:${iv.personKey}`;

  function setSubject(value: string) {
    if (value === 'together') setIv({ ...iv, personKey: 'together', talentIds: undefined });
    else if (value.startsWith('four:')) setIv({ ...iv, personKey: value.slice(5) as FourKey, talentIds: undefined });
    else if (value.startsWith('talent:')) setIv({ ...iv, personKey: 'other', talentIds: [value.slice(7)] });
  }

  const toggle = (field: 'threadIds' | 'topicIds' | 'eventIds', id: string) => {
    const arr = (iv[field] ?? []) as string[];
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    setIv({ ...iv, [field]: next });
  };

  const parent = iv.followUpOfId ? state.interviews.find((x) => x.id === iv.followUpOfId) : null;
  const inputCls = 'w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]';

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[640px] w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{isNew ? t('interviews.add') : t('common.edit')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        {parent && (
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--color-on-paper-muted)] bg-[color:var(--color-paper-deep)]/50 rounded-[3px] px-3 py-2">
            <CornerDownRight size={11} className="text-[color:var(--color-brass)]" />
            <span className="italic">
              {t('interviews.followUpOf')} {subjectLabel(state, parent).name} · {parent.date}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.subject')}</div>
            <select value={subjectValue} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
              {state.four.map((f) => <option key={f.key} value={`four:${f.key}`}>{f.name}</option>)}
              <option value="together">{t('interviews.subject.together')}</option>
              {state.talents.map((tal) => <option key={tal.id} value={`talent:${tal.id}`}>{tal.name}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.shoot')}</div>
            <select value={iv.shootId} onChange={(e) => setIv({ ...iv, shootId: e.target.value })} className={inputCls}>
              {state.shoots.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.setting')}</div>
            <select value={iv.setting} onChange={(e) => setIv({ ...iv, setting: e.target.value as InterviewSetting })} className={inputCls}>
              {SETTINGS.map((s) => <option key={s} value={s}>{t(`interviews.setting.${s}` as StringKey)}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.date')}</div>
            <input type="date" value={iv.date} onChange={(e) => setIv({ ...iv, date: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.duration')}</div>
            <input
              type="number" value={iv.durationMin ?? ''} placeholder="—"
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setIv({ ...iv, durationMin: Number.isFinite(v) && v > 0 ? v : undefined });
              }}
              className={inputCls}
            />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('common.status')}</div>
            <select value={iv.status} onChange={(e) => setIv({ ...iv, status: e.target.value as InterviewStatus })} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{t(`interviews.status.${s}` as StringKey)}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1.5">{t('interviews.field.topics')}</div>
          <div className="flex flex-wrap gap-1.5">
            {state.topics.map((top) => {
              const on = (iv.topicIds ?? []).includes(top.id);
              const color = top.colorHint ?? '#c9a961';
              return (
                <button
                  key={top.id} type="button"
                  onClick={() => toggle('topicIds', top.id)}
                  className={`px-2 py-0.5 rounded-[2px] text-[11px] border-[0.5px] transition-all ${on ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)]'}`}
                  style={on ? { background: color } : {}}
                >
                  {top.title}
                </button>
              );
            })}
          </div>
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1.5">{t('interviews.field.threads')}</div>
          <div className="flex flex-wrap gap-1.5">
            {state.threads.map((th) => {
              const on = iv.threadIds.includes(th.id);
              return (
                <button
                  key={th.id} type="button"
                  onClick={() => toggle('threadIds', th.id)}
                  className={`px-2 py-0.5 rounded-[2px] text-[11px] border-[0.5px] transition-all ${on ? 'bg-[color:var(--color-steel)] text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)]'}`}
                >
                  {th.num} · {th.title.slice(0, 24)}
                </button>
              );
            })}
          </div>
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1.5">{t('interviews.field.events')}</div>
          <div className="flex flex-wrap gap-1.5">
            {state.storyEvents.map((ev) => {
              const on = (iv.eventIds ?? []).includes(ev.id);
              return (
                <button
                  key={ev.id} type="button"
                  onClick={() => toggle('eventIds', ev.id)}
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] border-[0.5px] transition-all ${on ? 'bg-[color:var(--color-brass-deep)] text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)]'}`}
                >
                  {ev.year} · {ev.title.slice(0, 26)}
                </button>
              );
            })}
          </div>
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('interviews.field.quote')}</div>
          <textarea
            value={(iv.standoutQuotes ?? []).join('\n')}
            onChange={(e) => setIv({ ...iv, standoutQuotes: e.target.value.split('\n').filter((x) => x.trim()) })}
            rows={2}
            placeholder={t('interviews.field.quote.hint')}
            className={`${inputCls} italic`}
          />
        </label>

        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('common.notes')}</div>
          <textarea
            value={iv.notes ?? ''}
            onChange={(e) => setIv({ ...iv, notes: e.target.value })}
            rows={2}
            className={`${inputCls} italic`}
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
          <button
            type="button"
            onClick={() => onSave(iv)}
            disabled={!iv.shootId || !iv.date}
            className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
