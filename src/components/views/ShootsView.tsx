import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Share2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import { ConnectionDrawer } from '../ConnectionDrawer';
import { CommentBadge, CommentThread } from '../comments/CommentThread';
import { VIEW_FOR_ENTITY, type EntityRef } from '../../lib/connections';
import type { Shoot, ShootDay } from '../../types';

export function ShootsView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [openId, setOpenId] = useState<string | null>('shoot-sicily');
  const [focusRef, setFocusRef] = useState<EntityRef | null>(null);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('shoots.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
          {t('shoots.subtitle')} · <span className="text-[color:var(--color-brass)]">click to edit everywhere</span>
        </p>
      </header>

      <ul className="space-y-3">
        {state.shoots.map((s) => (
          <ShootCard key={s.id} shoot={s} isOpen={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)}
            onConnections={() => setFocusRef({ type: 'shoot', id: s.id })} />
        ))}
      </ul>

      <ConnectionDrawer focus={focusRef} onClose={() => setFocusRef(null)}
        onEdit={(ref) => { if (ref.type !== 'shoot') { dispatch({ type: 'SET_VIEW', view: VIEW_FOR_ENTITY[ref.type] }); setFocusRef(null); } }} />
    </div>
  );
}

function ShootCard({ shoot, isOpen, onToggle, onConnections }: { shoot: Shoot; isOpen: boolean; onToggle: () => void; onConnections: () => void }) {
  const { state, dispatch } = useApp();
  const t = useT();
  const days = state.shootDays.filter((d) => d.shootId === shoot.id).sort((a, b) => a.dayNum - b.dayNum);
  const cams = state.coverageCams.filter((c) => c.shootId === shoot.id);

  function patch(p: Partial<Shoot>) {
    dispatch({ type: 'UPDATE_SHOOT', id: shoot.id, patch: p });
  }

  return (
    <li className={`bg-[color:var(--color-paper-light)] border-[0.5px] rounded-[3px] p-4 ${shoot.wonderfulness ? 'border-[color:var(--color-brass)]' : 'border-[color:var(--color-border-paper)]'}`}>
      <button className="w-full text-left" onClick={onToggle}>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`label-caps ${statusColor(shoot.status)}`}>{shoot.status}</span>
              {shoot.wonderfulness && <span className="label-caps text-[color:var(--color-brass-deep)]">★ captured</span>}
              <CommentBadge targetType="shoot" targetId={shoot.id} />
            </div>
            <div className="display-italic text-[24px] text-[color:var(--color-on-paper)] leading-tight mt-1">{shoot.title}</div>
            <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)]">{shoot.location}</div>
          </div>
          <div className="text-right text-[11px]">
            {shoot.startDate && <div className="tabular-nums text-[color:var(--color-on-paper-muted)]">{shoot.startDate}{shoot.endDate ? ` → ${shoot.endDate}` : ''}</div>}
            <div className="prose-body italic text-[color:var(--color-brass-deep)] mt-1">{shoot.presentFour.length} present</div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t-[0.5px] border-[color:var(--color-border-paper)] space-y-4">
          <button type="button" onClick={onConnections}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors">
            <Share2 size={11} /> See all connections
          </button>
          <EditableField label={t('shoots.spirit')} value={shoot.spirit} onSave={(v) => patch({ spirit: v })} multiline />

          {shoot.wonderfulness && (
            <div className="bg-[color:var(--color-brass)]/10 border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-3">
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t('shoots.wonderfulness')}</div>
              <div className="display-italic text-[16px] text-[color:var(--color-on-paper)] leading-snug">{shoot.wonderfulness}</div>
            </div>
          )}

          <CapturesEditor shoot={shoot} />

          {cams.length > 0 && (
            <div>
              <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">{t('shoots.coverage')}</div>
              <ul className="space-y-2">
                {cams.map((c) => (
                  <li key={c.id} className="text-[12px] border-l-2 border-[color:var(--color-brass)]/40 pl-3">
                    <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{c.role}</span>
                    {c.locked && <span className="ml-2 text-[9px] tracking-[0.14em] uppercase text-[color:var(--color-success)]">locked</span>}
                    <div className="prose-body text-[color:var(--color-on-paper)] mt-0.5">{c.descriptor}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DaysEditor shootId={shoot.id} days={days} />

          <EditableField label={t('shoots.bible')} value={shoot.bible} onSave={(v) => patch({ bible: v })} multiline longform />

          <div className="pt-3 border-t-[0.5px] border-[color:var(--color-border-paper)]">
            <CommentThread targetType="shoot" targetId={shoot.id} label={shoot.title.split('·')[0].trim()} />
          </div>
        </div>
      )}
    </li>
  );
}

function EditableField({ label, value, onSave, multiline, longform }: { label: string; value: string; onSave: (v: string) => void; multiline?: boolean; longform?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  function save() { onSave(draft); setEditing(false); }
  function cancel() { setDraft(value); setEditing(false); }
  if (editing) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{label}</div>
          <div className="flex gap-1">
            <button onClick={save} className="text-[color:var(--color-success)] p-1"><Check size={12} /></button>
            <button onClick={cancel} className="text-[color:var(--color-on-paper-muted)] p-1"><X size={12} /></button>
          </div>
        </div>
        {multiline ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            className={`w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-3 prose-body text-[color:var(--color-on-paper)] outline-none resize-y ${longform ? 'text-[13px] min-h-[300px] font-mono' : 'italic text-[14px] min-h-[60px]'}`}
          />
        ) : (
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] p-2 prose-body italic text-[14px] text-[color:var(--color-on-paper)] outline-none"
          />
        )}
      </div>
    );
  }
  return (
    <div className="group" onClick={() => setEditing(true)}>
      <div className="flex items-baseline justify-between mb-1">
        <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{label}</div>
        <Edit3 size={11} className="text-[color:var(--color-on-paper-faint)] opacity-0 group-hover:opacity-100 cursor-pointer" />
      </div>
      {longform ? (
        <pre className="prose-body whitespace-pre-wrap text-[12px] text-[color:var(--color-on-paper)] leading-relaxed font-serif italic hover:bg-[color:var(--color-paper)]/40 rounded p-2 cursor-text">{value || <span className="text-[color:var(--color-on-paper-faint)]">click to write...</span>}</pre>
      ) : (
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper)] leading-relaxed hover:bg-[color:var(--color-paper)]/40 rounded p-2 cursor-text">{value || <span className="text-[color:var(--color-on-paper-faint)]">click to write...</span>}</p>
      )}
    </div>
  );
}

function CapturesEditor({ shoot }: { shoot: Shoot }) {
  const { dispatch } = useApp();
  const t = useT();
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState('');

  function addCapture() {
    if (!draft.trim()) return;
    dispatch({ type: 'UPDATE_SHOOT', id: shoot.id, patch: { captures: [...shoot.captures, draft.trim()] } });
    setDraft(''); setDrafting(false);
  }
  function removeCapture(idx: number) {
    dispatch({ type: 'UPDATE_SHOOT', id: shoot.id, patch: { captures: shoot.captures.filter((_, i) => i !== idx) } });
  }
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('shoots.captures')}</div>
        {!drafting && <button onClick={() => setDrafting(true)} className="text-[color:var(--color-brass)] flex items-center gap-1 text-[10px]"><Plus size={11} /> add</button>}
      </div>
      <ul className="space-y-1">
        {shoot.captures.map((c, i) => (
          <li key={i} className="prose-body italic text-[13px] text-[color:var(--color-on-paper)] pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[color:var(--color-brass)] group flex items-baseline gap-2">
            <span className="flex-1">{c}</span>
            <button onClick={() => removeCapture(i)} className="text-[color:var(--color-on-paper-faint)] opacity-0 group-hover:opacity-100 hover:text-[color:var(--color-coral-deep)]"><Trash2 size={10} /></button>
          </li>
        ))}
      </ul>
      {drafting && (
        <div className="mt-2 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            placeholder="what to come home with..."
            className="flex-1 bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-2 py-1 text-[13px] italic text-[color:var(--color-on-paper)] outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') addCapture(); if (e.key === 'Escape') { setDraft(''); setDrafting(false); } }}
          />
          <button onClick={addCapture} className="text-[color:var(--color-success)] p-1"><Check size={14} /></button>
          <button onClick={() => { setDraft(''); setDrafting(false); }} className="text-[color:var(--color-on-paper-muted)] p-1"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function DaysEditor({ shootId, days }: { shootId: string; days: ShootDay[] }) {
  const { dispatch } = useApp();
  const t = useT();
  const [drafting, setDrafting] = useState(false);
  const [draftPlan, setDraftPlan] = useState('');
  const [draftDate, setDraftDate] = useState('');

  function addDay() {
    if (!draftPlan.trim()) return;
    const nextDayNum = days.length ? Math.max(...days.map((d) => d.dayNum)) + 1 : 1;
    dispatch({
      type: 'ADD_SHOOT_DAY',
      day: {
        id: `sd-${shootId}-${Date.now()}`,
        shootId,
        dayNum: nextDayNum,
        date: draftDate || '',
        plan: draftPlan.trim(),
        done: false,
      },
    });
    setDraftPlan(''); setDraftDate(''); setDrafting(false);
  }
  function removeDay(id: string) {
    dispatch({ type: 'DELETE_SHOOT_DAY', id });
  }
  function updateDay(id: string, patch: Partial<ShootDay>) {
    dispatch({ type: 'UPDATE_SHOOT_DAY', id, patch });
  }
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('shoots.days')}</div>
        {!drafting && <button onClick={() => setDrafting(true)} className="text-[color:var(--color-brass)] flex items-center gap-1 text-[10px]"><Plus size={11} /> add day</button>}
      </div>
      <ul className="space-y-1">
        {days.map((d) => (
          <li key={d.id} className="text-[12px] flex gap-3 items-baseline group">
            <span className="tabular-nums text-[color:var(--color-brass-deep)] w-6 label-caps text-[9px]">D{d.dayNum}</span>
            <input type="date" value={d.date} onChange={(e) => updateDay(d.id, { date: e.target.value })}
              className="tabular-nums text-[color:var(--color-on-paper-muted)] w-28 bg-transparent border-b border-transparent focus:border-[color:var(--color-brass)] outline-none" />
            <input value={d.plan} onChange={(e) => updateDay(d.id, { plan: e.target.value })}
              className="prose-body text-[color:var(--color-on-paper)] flex-1 bg-transparent border-b border-transparent focus:border-[color:var(--color-brass)] outline-none" />
            <button onClick={() => updateDay(d.id, { done: !d.done })} className={`label-caps text-[9px] ${d.done ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>{d.done ? '✓' : '○'}</button>
            <button onClick={() => removeDay(d.id)} className="text-[color:var(--color-on-paper-faint)] opacity-0 group-hover:opacity-100 hover:text-[color:var(--color-coral-deep)]"><Trash2 size={10} /></button>
          </li>
        ))}
      </ul>
      {drafting && (
        <div className="mt-2 flex gap-2 items-baseline">
          <span className="text-[color:var(--color-brass-deep)] label-caps text-[9px]">D{days.length + 1}</span>
          <input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)}
            className="tabular-nums text-[12px] w-28 bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-2 py-1 outline-none" />
          <input value={draftPlan} onChange={(e) => setDraftPlan(e.target.value)} autoFocus
            placeholder="what happens this day..."
            className="flex-1 bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] px-2 py-1 text-[12px] italic text-[color:var(--color-on-paper)] outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') addDay(); if (e.key === 'Escape') { setDraftPlan(''); setDrafting(false); } }}
          />
          <button onClick={addDay} className="text-[color:var(--color-success)] p-1"><Check size={14} /></button>
          <button onClick={() => { setDraftPlan(''); setDrafting(false); }} className="text-[color:var(--color-on-paper-muted)] p-1"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-[color:var(--color-success)]';
    case 'in-progress':
    case 'confirmed': return 'text-[color:var(--color-brass)]';
    case 'archived': return 'text-[color:var(--color-on-paper-muted)]';
    default: return 'text-[color:var(--color-on-paper-faint)]';
  }
}
