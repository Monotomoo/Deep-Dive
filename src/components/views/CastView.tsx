import { useMemo, useState } from 'react';
import { CalendarClock, MessageSquareText, Plus, Trash2, Users2, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import { ConnectionDrawer } from '../ConnectionDrawer';
import { VIEW_FOR_ENTITY, type EntityRef } from '../../lib/connections';
import type {
  FourKey, StoryEvent, StoryEventKind, Talent, TalentDiscipline, Topic,
} from '../../types';

/* Cast · Story — the documentary's dashboard in three segments:
   PERSON  · everyone in the film — bio + the reason they're there
   EVENT   · the moments the film orbits
   TOPIC   · the themes the interviews mine
   Everything cross-links, and interviews reference all three. */

type Segment = 'people' | 'events' | 'topics';

const EVENT_KINDS: StoryEventKind[] = ['record', 'crisis', 'ceremony', 'shoot-moment', 'origin', 'turning-point', 'other'];

const EVENT_KIND_COLOR: Record<StoryEventKind, string> = {
  record: '#d96c3d', crisis: '#8a3a2e', ceremony: '#c9a961', 'shoot-moment': '#3d7a94',
  origin: '#6f8a72', 'turning-point': '#b54f26', other: '#8a8375',
};

const DISCIPLINES: TalentDiscipline[] = ['freediver', 'coach', 'safety', 'family', 'researcher', 'medical', 'other'];
const RELEASE_STATUSES: Talent['releaseStatus'][] = ['pending', 'signed', 'expired', 'na'];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CastView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [segment, setSegment] = useState<Segment>('people');
  const [focusRef, setFocusRef] = useState<EntityRef | null>(null);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  function handleDrawerEdit(ref: EntityRef) {
    if (ref.type === 'talent') {
      const tal = state.talents.find((x) => x.id === ref.id);
      if (tal) { setFocusRef(null); setEditingTalent(tal); }
    } else if (ref.type === 'event') {
      const ev = state.storyEvents.find((x) => x.id === ref.id);
      if (ev) { setFocusRef(null); setEditingEvent(ev); }
    } else if (ref.type === 'topic') {
      const top = state.topics.find((x) => x.id === ref.id);
      if (top) { setFocusRef(null); setEditingTopic(top); }
    } else {
      dispatch({ type: 'SET_VIEW', view: VIEW_FOR_ENTITY[ref.type] });
      setFocusRef(null);
    }
  }

  const counts = {
    people: state.four.length + state.talents.length,
    events: state.storyEvents.length,
    topics: state.topics.length,
  };

  const SEGMENTS: { key: Segment; labelKey: StringKey; count: number }[] = [
    { key: 'people', labelKey: 'cast.seg.people', count: counts.people },
    { key: 'events', labelKey: 'cast.seg.events', count: counts.events },
    { key: 'topics', labelKey: 'cast.seg.topics', count: counts.topics },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('cast.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('cast.subtitle')}</p>
      </header>

      {/* Segment tabs */}
      <div className="flex rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden w-fit">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSegment(s.key)}
            className={`px-4 py-2 font-sans text-[12px] tracking-wide transition-colors flex items-center gap-2 ${
              segment === s.key
                ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]'
                : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'
            }`}
          >
            {t(s.labelKey)}
            <span className="tabular-nums text-[10px] opacity-70">{s.count}</span>
          </button>
        ))}
      </div>

      {segment === 'people' && (
        <PeopleSegment
          onAdd={() => setEditingTalent({
            id: makeId('tal'), name: '', role: '', relationshipTo: 'ensemble',
            discipline: 'other', releaseStatus: 'pending', bio: '', whyInFilm: '',
          })}
          onFocus={setFocusRef}
        />
      )}
      {segment === 'events' && (
        <EventsSegment
          onAdd={() => setEditingEvent({
            id: makeId('ev'), title: '', kind: 'other', year: 2026, summary: '', personKeys: [],
          })}
          onFocus={setFocusRef}
        />
      )}
      {segment === 'topics' && (
        <TopicsSegment
          onAdd={() => setEditingTopic({ id: makeId('top'), title: '', question: '', threadIds: [] })}
          onFocus={setFocusRef}
        />
      )}

      <ConnectionDrawer focus={focusRef} onClose={() => setFocusRef(null)} onEdit={handleDrawerEdit} />

      {editingTalent && (
        <TalentEditor
          talent={editingTalent}
          onSave={(tal) => {
            if (state.talents.some((x) => x.id === tal.id)) dispatch({ type: 'UPDATE_TALENT', id: tal.id, patch: tal });
            else dispatch({ type: 'ADD_TALENT', talent: tal });
            setEditingTalent(null);
          }}
          onDelete={() => { dispatch({ type: 'DELETE_TALENT', id: editingTalent.id }); setEditingTalent(null); }}
          onCancel={() => setEditingTalent(null)}
        />
      )}
      {editingEvent && (
        <EventEditor
          event={editingEvent}
          onSave={(ev) => {
            if (state.storyEvents.some((x) => x.id === ev.id)) dispatch({ type: 'UPDATE_STORY_EVENT', id: ev.id, patch: ev });
            else dispatch({ type: 'ADD_STORY_EVENT', event: ev });
            setEditingEvent(null);
          }}
          onDelete={() => { dispatch({ type: 'DELETE_STORY_EVENT', id: editingEvent.id }); setEditingEvent(null); }}
          onCancel={() => setEditingEvent(null)}
        />
      )}
      {editingTopic && (
        <TopicEditor
          topic={editingTopic}
          onSave={(top) => {
            if (state.topics.some((x) => x.id === top.id)) dispatch({ type: 'UPDATE_TOPIC', id: top.id, patch: top });
            else dispatch({ type: 'ADD_TOPIC', topic: top });
            setEditingTopic(null);
          }}
          onDelete={() => { dispatch({ type: 'DELETE_TOPIC', id: editingTopic.id }); setEditingTopic(null); }}
          onCancel={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}

/* ---------- PEOPLE ---------- */

function PeopleSegment({ onAdd, onFocus }: { onAdd: () => void; onFocus: (ref: EntityRef) => void }) {
  const { state } = useApp();
  const t = useT();

  const eventCountFor = (key?: FourKey, talentId?: string) =>
    state.storyEvents.filter((e) =>
      (key && e.personKeys.includes(key)) || (talentId && e.talentIds?.includes(talentId)),
    ).length;

  const interviewCountFor = (key?: FourKey, talentId?: string) =>
    state.interviews.filter((iv) =>
      (key && (iv.personKey === key || iv.personKey === 'together')) ||
      (talentId && iv.talentIds?.includes(talentId)),
    ).length;

  return (
    <div className="space-y-6">
      {/* The Four */}
      <section>
        <h3 className="label-caps text-[color:var(--color-brass)] mb-3">{t('cast.people.four')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {state.four.map((f) => (
            <article
              key={f.key}
              className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
              style={{ borderTopWidth: 3, borderTopColor: f.colorHint ?? 'var(--color-brass)' }}
              onClick={() => onFocus({ type: 'four', id: f.key })}
            >
              <div className="display-italic text-[19px] text-[color:var(--color-on-paper)] leading-tight">{f.name}</div>
              <div className="prose-body italic text-[10px] text-[color:var(--color-brass)] mt-0.5 mb-2">{f.role} · {f.epithet}</div>
              <p className="prose-body text-[11.5px] text-[color:var(--color-on-paper-muted)] leading-snug mb-2 line-clamp-4">{f.bio}</p>
              <div className="mt-auto pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                <div className="label-caps text-[8px] text-[color:var(--color-brass-deep)] mb-0.5">{t('cast.why')}</div>
                <div className="display-italic text-[13px] text-[color:var(--color-on-paper)] leading-snug mb-2">{f.arcNote}</div>
                <PersonCounts events={eventCountFor(f.key)} interviews={interviewCountFor(f.key)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The rest of the cast */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-caps text-[color:var(--color-brass)]">{t('cast.people.talents')}</h3>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
          >
            <Plus size={11} /> {t('cast.people.add')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {state.talents.map((tal) => {
            const anchor = tal.relationshipTo === 'ensemble'
              ? null
              : state.four.find((f) => f.key === tal.relationshipTo);
            return (
              <article
                key={tal.id}
                className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
                style={{ borderLeftWidth: 3, borderLeftColor: tal.colorHint ?? 'var(--color-brass-deep)' }}
                onClick={() => onFocus({ type: 'talent', id: tal.id })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="display-italic text-[17px] text-[color:var(--color-on-paper)] leading-tight">{tal.name}</div>
                    <div className="prose-body italic text-[10px] text-[color:var(--color-brass)] mt-0.5">{tal.role}</div>
                  </div>
                  <span
                    className="shrink-0 uppercase font-sans text-[8px] tracking-wide px-1.5 py-0.5 rounded-[2px] border-[0.5px] border-[color:var(--color-border-paper)] text-[color:var(--color-on-paper-muted)]"
                  >
                    {t(`cast.release.${tal.releaseStatus}` as StringKey)}
                  </span>
                </div>
                {tal.bio && <p className="prose-body text-[11.5px] text-[color:var(--color-on-paper-muted)] leading-snug mt-2">{tal.bio}</p>}
                {tal.whyInFilm && (
                  <div className="mt-2">
                    <div className="label-caps text-[8px] text-[color:var(--color-brass-deep)] mb-0.5">{t('cast.why')}</div>
                    <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper)] leading-snug">{tal.whyInFilm}</div>
                  </div>
                )}
                <div className="mt-auto pt-2 flex items-center gap-2 border-t-[0.5px] border-[color:var(--color-border-paper)] mt-3">
                  {anchor && (
                    <span className="flex items-center gap-1 text-[9px] text-[color:var(--color-on-paper-muted)]">
                      <span className="w-2 h-2 rounded-full" style={{ background: anchor.colorHint }} />
                      {anchor.name.split(' ')[0]}
                    </span>
                  )}
                  <span className="text-[9px] text-[color:var(--color-on-paper-faint)] uppercase">{tal.discipline}</span>
                  <div className="flex-1" />
                  <PersonCounts events={eventCountFor(undefined, tal.id)} interviews={interviewCountFor(undefined, tal.id)} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PersonCounts({ events, interviews }: { events: number; interviews: number }) {
  return (
    <div className="flex items-center gap-3 text-[10px] text-[color:var(--color-on-paper-muted)]">
      <span className="flex items-center gap-1"><CalendarClock size={10} /> {events}</span>
      <span className="flex items-center gap-1"><MessageSquareText size={10} /> {interviews}</span>
    </div>
  );
}

/* ---------- EVENTS ---------- */

function EventsSegment({ onAdd, onFocus }: { onAdd: () => void; onFocus: (ref: EntityRef) => void }) {
  const { state } = useApp();
  const t = useT();

  const sorted = useMemo(
    () => state.storyEvents.slice().sort((a, b) => a.year - b.year || (a.date ?? '').localeCompare(b.date ?? '')),
    [state.storyEvents],
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
        >
          <Plus size={11} /> {t('cast.events.add')}
        </button>
      </div>
      {sorted.map((ev) => {
        const interviewCount = state.interviews.filter((iv) => iv.eventIds?.includes(ev.id)).length;
        const shoot = ev.shootId ? state.shoots.find((s) => s.id === ev.shootId) : null;
        return (
          <article
            key={ev.id}
            className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
            style={{ borderLeftWidth: 3, borderLeftColor: EVENT_KIND_COLOR[ev.kind] }}
            onClick={() => onFocus({ type: 'event', id: ev.id })}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[13px] text-[color:var(--color-brass-deep)] tabular-nums shrink-0">{ev.year}</span>
              <div className="flex-1 min-w-0">
                <div className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-tight">{ev.title}</div>
                <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] leading-snug mt-1">{ev.summary}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span
                    className="uppercase font-sans text-[8px] tracking-wide px-1.5 py-0.5 rounded-[2px]"
                    style={{ background: `color-mix(in oklab, ${EVENT_KIND_COLOR[ev.kind]} 15%, transparent)`, color: EVENT_KIND_COLOR[ev.kind] }}
                  >
                    {t(`cast.event.kind.${ev.kind}` as StringKey)}
                  </span>
                  {ev.personKeys.map((pk) => {
                    const f = state.four.find((x) => x.key === pk);
                    return (
                      <span key={pk} className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper)]">
                        <span className="w-2 h-2 rounded-full" style={{ background: f?.colorHint }} />
                        {f?.name.split(' ')[0]}
                      </span>
                    );
                  })}
                  {(ev.talentIds ?? []).map((tid) => {
                    const tal = state.talents.find((x) => x.id === tid);
                    return tal ? (
                      <span key={tid} className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)]">
                        <Users2 size={9} /> {tal.name.split(' ')[0]}
                      </span>
                    ) : null;
                  })}
                  {(ev.topicIds ?? []).map((tid) => {
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
                  {shoot && (
                    <span className="text-[9px] italic" style={{ color: shoot.colorHint }}>
                      ▸ {shoot.title.split('·')[0].trim()}
                    </span>
                  )}
                  <div className="flex-1" />
                  {interviewCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)]">
                      <MessageSquareText size={10} /> {interviewCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------- TOPICS ---------- */

function TopicsSegment({ onAdd, onFocus }: { onAdd: () => void; onFocus: (ref: EntityRef) => void }) {
  const { state } = useApp();
  const t = useT();

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[11px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] transition-colors"
        >
          <Plus size={11} /> {t('cast.topics.add')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {state.topics.map((top) => {
          const eventCount = state.storyEvents.filter((e) => e.topicIds?.includes(top.id)).length;
          const interviewCount = state.interviews.filter((iv) => iv.topicIds?.includes(top.id)).length;
          const color = top.colorHint ?? '#c9a961';
          return (
            <article
              key={top.id}
              className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 flex flex-col cursor-pointer hover:border-[color:var(--color-brass)] transition-colors"
              style={{ borderTopWidth: 3, borderTopColor: color }}
              onClick={() => onFocus({ type: 'topic', id: top.id })}
            >
              <div className="display-italic text-[18px] text-[color:var(--color-on-paper)] leading-tight mb-1">{top.title}</div>
              <p className="prose-body italic text-[12.5px] text-[color:var(--color-on-paper-muted)] leading-snug flex-1">
                “{top.question}”
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t-[0.5px] border-[color:var(--color-border-paper)]">
                {(top.threadIds ?? []).map((tid) => {
                  const th = state.threads.find((x) => x.id === tid);
                  return th ? (
                    <span key={tid} className="text-[9px] text-[color:var(--color-steel-light)] font-mono">#{th.num}</span>
                  ) : null;
                })}
                <div className="flex-1" />
                <span className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)]"><CalendarClock size={10} /> {eventCount}</span>
                <span className="flex items-center gap-1 text-[10px] text-[color:var(--color-on-paper-muted)]"><MessageSquareText size={10} /> {interviewCount}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- editors ---------- */

function Field({ labelKey, children }: { labelKey: StringKey; children: React.ReactNode }) {
  const t = useT();
  return (
    <label className="block">
      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{t(labelKey)}</div>
      {children}
    </label>
  );
}

const inputCls = 'w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]';

function TalentEditor({
  talent, onSave, onDelete, onCancel,
}: {
  talent: Talent;
  onSave: (t: Talent) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [tal, setTal] = useState<Talent>(talent);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[600px] w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{tal.name || t('cast.people.add')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <Field labelKey="cast.field.name">
            <input type="text" value={tal.name} autoFocus onChange={(e) => setTal({ ...tal, name: e.target.value })} className={inputCls} />
          </Field>
          <Field labelKey="cast.field.role">
            <input type="text" value={tal.role} onChange={(e) => setTal({ ...tal, role: e.target.value })} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field labelKey="cast.field.anchor">
            <select
              value={tal.relationshipTo}
              onChange={(e) => setTal({ ...tal, relationshipTo: e.target.value as Talent['relationshipTo'] })}
              className={inputCls}
            >
              <option value="ensemble">ensemble</option>
              {state.four.map((f) => <option key={f.key} value={f.key}>{f.name.split(' ')[0]}</option>)}
            </select>
          </Field>
          <Field labelKey="cast.field.discipline">
            <select
              value={tal.discipline}
              onChange={(e) => setTal({ ...tal, discipline: e.target.value as TalentDiscipline })}
              className={inputCls}
            >
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field labelKey="cast.field.release">
            <select
              value={tal.releaseStatus}
              onChange={(e) => setTal({ ...tal, releaseStatus: e.target.value as Talent['releaseStatus'] })}
              className={inputCls}
            >
              {RELEASE_STATUSES.map((r) => <option key={r} value={r}>{t(`cast.release.${r}` as StringKey)}</option>)}
            </select>
          </Field>
        </div>

        <Field labelKey="cast.field.bio">
          <textarea value={tal.bio ?? ''} rows={3} onChange={(e) => setTal({ ...tal, bio: e.target.value })} className={`${inputCls} italic`} />
        </Field>

        <Field labelKey="cast.why">
          <textarea value={tal.whyInFilm ?? ''} rows={2} onChange={(e) => setTal({ ...tal, whyInFilm: e.target.value })} className={`${inputCls} italic`} />
        </Field>

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]">
            <Trash2 size={11} /> {t('common.delete')}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
            <button
              type="button"
              onClick={() => onSave(tal)}
              disabled={!tal.name.trim()}
              className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleChips<T extends string>({
  options, selected, onToggle, colorFor,
}: {
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
  colorFor?: (id: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o.id);
        const color = colorFor?.(o.id) ?? 'var(--color-brass)';
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={`px-2 py-0.5 rounded-[2px] text-[11px] border-[0.5px] transition-all ${
              on ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)]'
            }`}
            style={on ? { background: color } : {}}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function EventEditor({
  event, onSave, onDelete, onCancel,
}: {
  event: StoryEvent;
  onSave: (e: StoryEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [ev, setEv] = useState<StoryEvent>(event);

  const toggle = <K extends 'personKeys' | 'talentIds' | 'topicIds'>(field: K, id: string) => {
    const arr = (ev[field] ?? []) as string[];
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    setEv({ ...ev, [field]: next });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[640px] w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{ev.title || t('cast.events.add')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <Field labelKey="cast.field.title">
          <input type="text" value={ev.title} autoFocus onChange={(e) => setEv({ ...ev, title: e.target.value })} className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field labelKey="cast.field.kind">
            <select value={ev.kind} onChange={(e) => setEv({ ...ev, kind: e.target.value as StoryEventKind })} className={inputCls}>
              {EVENT_KINDS.map((k) => <option key={k} value={k}>{t(`cast.event.kind.${k}` as StringKey)}</option>)}
            </select>
          </Field>
          <Field labelKey="cast.field.year">
            <input
              type="number" value={ev.year}
              onChange={(e) => setEv({ ...ev, year: parseInt(e.target.value, 10) || 2026 })}
              className={inputCls}
            />
          </Field>
          <Field labelKey="cast.field.date">
            <input
              type="date" value={ev.date ?? ''}
              onChange={(e) => setEv({ ...ev, date: e.target.value || undefined })}
              className={inputCls}
            />
          </Field>
        </div>

        <Field labelKey="cast.field.summary">
          <textarea value={ev.summary} rows={3} onChange={(e) => setEv({ ...ev, summary: e.target.value })} className={`${inputCls} italic`} />
        </Field>

        <Field labelKey="cast.field.people">
          <ToggleChips
            options={state.four.map((f) => ({ id: f.key, label: f.name.split(' ')[0] }))}
            selected={ev.personKeys}
            onToggle={(id) => toggle('personKeys', id)}
            colorFor={(id) => state.four.find((f) => f.key === id)?.colorHint ?? 'var(--color-brass)'}
          />
        </Field>

        {state.talents.length > 0 && (
          <Field labelKey="cast.field.talents">
            <ToggleChips
              options={state.talents.map((x) => ({ id: x.id, label: x.name.split(' ')[0] }))}
              selected={ev.talentIds ?? []}
              onToggle={(id) => toggle('talentIds', id)}
              colorFor={(id) => state.talents.find((x) => x.id === id)?.colorHint ?? 'var(--color-olive)'}
            />
          </Field>
        )}

        <Field labelKey="cast.field.topics">
          <ToggleChips
            options={state.topics.map((x) => ({ id: x.id, label: x.title }))}
            selected={ev.topicIds ?? []}
            onToggle={(id) => toggle('topicIds', id)}
            colorFor={(id) => state.topics.find((x) => x.id === id)?.colorHint ?? '#c9a961'}
          />
        </Field>

        <Field labelKey="cast.field.shoot">
          <select
            value={ev.shootId ?? ''}
            onChange={(e) => setEv({ ...ev, shootId: e.target.value || undefined })}
            className={inputCls}
          >
            <option value="">—</option>
            {state.shoots.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]">
            <Trash2 size={11} /> {t('common.delete')}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
            <button
              type="button"
              onClick={() => onSave(ev)}
              disabled={!ev.title.trim()}
              className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicEditor({
  topic, onSave, onDelete, onCancel,
}: {
  topic: Topic;
  onSave: (t: Topic) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const [top, setTop] = useState<Topic>(topic);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[560px] w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">{top.title || t('cast.topics.add')}</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>

        <Field labelKey="cast.field.title">
          <input type="text" value={top.title} autoFocus onChange={(e) => setTop({ ...top, title: e.target.value })} className={inputCls} />
        </Field>

        <Field labelKey="cast.field.question">
          <textarea value={top.question} rows={2} onChange={(e) => setTop({ ...top, question: e.target.value })} className={`${inputCls} italic`} />
        </Field>

        <Field labelKey="cast.field.threads">
          <ToggleChips
            options={state.threads.map((th) => ({ id: th.id, label: `${th.num} · ${th.title.slice(0, 26)}` }))}
            selected={top.threadIds ?? []}
            onToggle={(id) => {
              const arr = top.threadIds ?? [];
              setTop({ ...top, threadIds: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] });
            }}
          />
        </Field>

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]">
            <Trash2 size={11} /> {t('common.delete')}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">{t('common.cancel')}</button>
            <button
              type="button"
              onClick={() => onSave(top)}
              disabled={!top.title.trim()}
              className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
