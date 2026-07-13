import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Copy,
  GanttChartSquare,
  List,
  Plus,
  Repeat,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { CalendarEvent, CalendarEventKind, FourKey, RecurrenceRule, Shoot, TalentFour } from '../../types';

/* ---------------- Types + Constants ---------------- */

type ViewMode = 'calendar' | 'week' | 'timeline' | 'agenda';

const KIND_COLORS: Record<CalendarEventKind, string> = {
  shoot:     'var(--color-brass)',
  milestone: 'var(--color-dock)',
  meeting:   'var(--color-olive)',
  travel:    'var(--color-steel-light)',
  delivery:  'var(--color-success)',
  personal:  'var(--color-brass-deep)',
  other:     'var(--color-on-paper-muted)',
};

const KIND_KEYS: CalendarEventKind[] = ['shoot','milestone','meeting','travel','delivery','personal','other'];
const RECURRENCE_KEYS: RecurrenceRule[] = ['daily','weekly','monthly'];

type EventSource = 'user' | 'shoot' | 'milestone';

type RenderedEvent = {
  id: string;                        // instance id (differs from originalId for recurring instances)
  originalId: string;
  title: string;
  startDate: string;
  endDate?: string;
  kind: CalendarEventKind;
  source: EventSource;
  editable: boolean;
  draggable: boolean;
  notes?: string;
  shootId?: string;
  personKeys?: FourKey[];
  recurring?: boolean;
  isRecurrenceInstance?: boolean;
};

const RANGE_START = new Date(2026, 0, 1);
const RANGE_END = new Date(2027, 11, 31);

/* ---------------- Recurrence expansion ---------------- */

function expandRecurrence(evt: CalendarEvent): CalendarEvent[] {
  if (!evt.recurrence) return [evt];
  const results: CalendarEvent[] = [];
  const originalStart = parseISO(evt.startDate);
  const originalEnd = evt.endDate ? parseISO(evt.endDate) : originalStart;
  const durationDays = Math.max(0, differenceInDays(originalEnd, originalStart));
  const cap = evt.recurrenceEnd ? parseISO(evt.recurrenceEnd) : RANGE_END;

  let cursor = originalStart;
  let i = 0;
  while (cursor <= cap && cursor <= RANGE_END && i < 500) {
    const start = format(cursor, 'yyyy-MM-dd');
    const end = durationDays > 0 ? format(addDays(cursor, durationDays), 'yyyy-MM-dd') : undefined;
    results.push({ ...evt, id: i === 0 ? evt.id : `${evt.id}::r${i}`, startDate: start, endDate: end });
    if (evt.recurrence === 'daily') cursor = addDays(cursor, 1);
    else if (evt.recurrence === 'weekly') cursor = addDays(cursor, 7);
    else if (evt.recurrence === 'monthly') cursor = addMonths(cursor, 1);
    i++;
  }
  return results;
}

/* ---------------- ScheduleView ---------------- */

export function ScheduleView() {
  const { state, dispatch } = useApp();
  const t = useT();
  const [mode, setMode] = useState<ViewMode>('calendar');
  const [anchor, setAnchor] = useState<Date>(() => {
    try { return new Date(); } catch { return new Date(2026, 6, 1); }
  });
  const [editing, setEditing] = useState<RenderedEvent | null>(null);
  const [newDraft, setNewDraft] = useState<{ startDate: string } | null>(null);

  /* Selection · clipboard · flash message */
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<CalendarEvent | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  /* Filters */
  const [filterKind, setFilterKind] = useState<CalendarEventKind | 'all'>('all');
  const [filterPerson, setFilterPerson] = useState<FourKey | 'all'>('all');
  const [filterShoot, setFilterShoot] = useState<string>('all');
  const [search, setSearch] = useState('');

  /* Compose events: user (with recurrence expansion) + shoot ghosts + milestone ghosts */
  const allEvents = useMemo<RenderedEvent[]>(() => {
    const userEvents: RenderedEvent[] = state.calendarEvents.flatMap((e) => {
      const expanded = expandRecurrence(e);
      return expanded.map((exp, idx) => ({
        id: exp.id,
        originalId: e.id,
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        kind: exp.kind,
        source: 'user' as const,
        editable: true,
        draggable: !idx,           // only the master is directly draggable · instances follow
        notes: exp.notes,
        shootId: exp.shootId,
        personKeys: exp.personKeys,
        recurring: !!e.recurrence,
        isRecurrenceInstance: idx > 0,
      }));
    });
    const shootEvents: RenderedEvent[] = state.shoots
      .filter((s) => s.startDate)
      .map((s) => ({
        id: `ghost-shoot-${s.id}`, originalId: s.id, title: s.title,
        startDate: s.startDate!, endDate: s.endDate, kind: 'shoot',
        source: 'shoot', editable: false, draggable: true, shootId: s.id,
      }));
    const milestoneEvents: RenderedEvent[] = state.milestones.map((m) => ({
      id: `ghost-ms-${m.id}`, originalId: m.id, title: m.label,
      startDate: m.date, kind: 'milestone', source: 'milestone', editable: false, draggable: false,
    }));
    return [...userEvents, ...shootEvents, ...milestoneEvents];
  }, [state.calendarEvents, state.shoots, state.milestones]);

  const events = useMemo(() => {
    return allEvents.filter((e) => {
      if (filterKind !== 'all' && e.kind !== filterKind) return false;
      if (filterPerson !== 'all' && !(e.personKeys ?? []).includes(filterPerson)) return false;
      if (filterShoot !== 'all' && e.shootId !== filterShoot) return false;
      if (search.trim() && !e.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [allEvents, filterKind, filterPerson, filterShoot, search]);

  const anyFilter = filterKind !== 'all' || filterPerson !== 'all' || filterShoot !== 'all' || search.trim() !== '';
  function clearFilters() { setFilterKind('all'); setFilterPerson('all'); setFilterShoot('all'); setSearch(''); }

  /* Selection helpers */
  function toggleSelected(id: string, additive: boolean) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (additive) {
        if (next.has(id)) next.delete(id); else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  }
  function clearSelection() { setSelection(new Set()); }

  /* Flash message helper */
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showFlash(msg: string) {
    setFlash(msg);
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setFlash(null), 1600);
  }

  /* Two-way sync */
  function rescheduleEvent(evt: RenderedEvent, newStartDate: string, newEndDate: string | undefined) {
    if (evt.source === 'user') {
      dispatch({ type: 'UPDATE_CALENDAR_EVENT', id: evt.originalId, patch: { startDate: newStartDate, endDate: newEndDate } });
    } else if (evt.source === 'shoot') {
      const shootPatch: Partial<Shoot> = { startDate: newStartDate, endDate: newEndDate };
      dispatch({ type: 'UPDATE_SHOOT', id: evt.originalId, patch: shootPatch });
    }
  }

  /* Editor save/delete */
  function addEvent(startDate: string) { setNewDraft({ startDate }); }
  function saveNewEvent(patch: Partial<CalendarEvent> & { title: string; startDate: string; kind: CalendarEventKind }) {
    const id = `evt-${Date.now()}`;
    dispatch({ type: 'ADD_CALENDAR_EVENT', event: { id, ...patch } });
    setNewDraft(null);
  }
  function saveEdit(patch: Partial<CalendarEvent>) {
    if (!editing || editing.source !== 'user') return;
    dispatch({ type: 'UPDATE_CALENDAR_EVENT', id: editing.originalId, patch });
    setEditing(null);
  }
  function deleteEdit() {
    if (!editing || editing.source !== 'user') return;
    dispatch({ type: 'DELETE_CALENDAR_EVENT', id: editing.originalId });
    setEditing(null);
    setSelection((prev) => {
      const next = new Set(prev);
      next.delete(editing.id);
      return next;
    });
  }
  function duplicateEvent() {
    if (!editing || editing.source !== 'user') return;
    const src = state.calendarEvents.find((e) => e.id === editing.originalId);
    if (!src) return;
    const id = `evt-${Date.now()}`;
    const newStart = format(addDays(parseISO(src.startDate), 1), 'yyyy-MM-dd');
    const durationDays = src.endDate ? Math.max(0, differenceInDays(parseISO(src.endDate), parseISO(src.startDate))) : 0;
    const newEnd = durationDays > 0 ? format(addDays(parseISO(newStart), durationDays), 'yyyy-MM-dd') : undefined;
    dispatch({ type: 'ADD_CALENDAR_EVENT', event: { ...src, id, startDate: newStart, endDate: newEnd } });
    setEditing(null);
    showFlash(t('schedule.clipboard.pasted'));
  }

  /* Bulk delete */
  function deleteSelected() {
    const toDelete: string[] = [];
    for (const selId of selection) {
      const evt = allEvents.find((e) => e.id === selId);
      if (evt && evt.source === 'user') {
        if (!toDelete.includes(evt.originalId)) toDelete.push(evt.originalId);
      }
    }
    toDelete.forEach((id) => dispatch({ type: 'DELETE_CALENDAR_EVENT', id }));
    setSelection(new Set());
  }

  /* Keyboard shortcuts: ⌘C/⌘V, Delete, Escape */
  useEffect(() => {
    function isEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    }

    function onKey(e: KeyboardEvent) {
      if (isEditable(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'c' && selection.size === 1) {
        const selId = Array.from(selection)[0];
        const rendered = allEvents.find((x) => x.id === selId);
        if (rendered?.source === 'user') {
          const src = state.calendarEvents.find((x) => x.id === rendered.originalId);
          if (src) {
            setClipboard(src);
            showFlash(t('schedule.clipboard.copied'));
            e.preventDefault();
          }
        }
      } else if (mod && e.key.toLowerCase() === 'v' && clipboard) {
        const newStart = format(anchor, 'yyyy-MM-dd');
        const durationDays = clipboard.endDate ? Math.max(0, differenceInDays(parseISO(clipboard.endDate), parseISO(clipboard.startDate))) : 0;
        const newEnd = durationDays > 0 ? format(addDays(anchor, durationDays), 'yyyy-MM-dd') : undefined;
        const id = `evt-${Date.now()}`;
        dispatch({ type: 'ADD_CALENDAR_EVENT', event: { ...clipboard, id, startDate: newStart, endDate: newEnd } });
        showFlash(t('schedule.clipboard.pasted'));
        e.preventDefault();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selection.size > 0) {
        deleteSelected();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        clearSelection();
        setEditing(null);
        setNewDraft(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, clipboard, allEvents, anchor, state.calendarEvents]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('schedule.title')}</h2>
          <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">
            {t('schedule.subtitle')} · <span className="text-[color:var(--color-brass)]">{t('schedule.hint.select')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-0.5">
            <ViewToggle active={mode === 'calendar'} onClick={() => setMode('calendar')} icon={<CalendarDays size={12} />} label={t('schedule.view.calendar')} />
            <ViewToggle active={mode === 'week'}     onClick={() => setMode('week')}     icon={<CalendarRange size={12} />} label={t('schedule.view.week')} />
            <ViewToggle active={mode === 'timeline'} onClick={() => setMode('timeline')} icon={<GanttChartSquare size={12} />} label={t('schedule.view.timeline')} />
            <ViewToggle active={mode === 'agenda'}   onClick={() => setMode('agenda')}   icon={<List size={12} />} label={t('schedule.view.agenda')} />
          </div>
          <button
            onClick={() => addEvent(format(anchor, 'yyyy-MM-dd'))}
            className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--color-brass)] text-[color:var(--color-paper)] rounded-[3px] label-caps text-[10px]"
          >
            <Plus size={12} />
            {t('schedule.add.event')}
          </button>
        </div>
      </header>

      {/* Filters + Selection bar */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-y-[0.5px] border-[color:var(--color-border-paper)]">
        <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">filter:</span>

        <FilterSelect value={filterKind} onChange={(v) => setFilterKind(v as CalendarEventKind | 'all')}
          options={[{ value: 'all', label: t('schedule.filter.all') + ' ' + t('schedule.filter.kind') },
                    ...KIND_KEYS.map((k) => ({ value: k, label: t(`schedule.kind.${k}` as StringKey) }))]} />

        <FilterSelect value={filterPerson} onChange={(v) => setFilterPerson(v as FourKey | 'all')}
          options={[{ value: 'all', label: t('schedule.filter.all') + ' ' + t('schedule.filter.person') },
                    ...state.four.map((f) => ({ value: f.key, label: f.name.split(' ')[0] }))]} />

        <FilterSelect value={filterShoot} onChange={(v) => setFilterShoot(v)}
          options={[{ value: 'all', label: t('schedule.filter.all') + ' ' + t('schedule.filter.shoot') },
                    ...state.shoots.map((s) => ({ value: s.id, label: s.title }))]} />

        <div className="flex items-center bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1">
          <Search size={11} className="text-[color:var(--color-on-paper-faint)] mr-1" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('schedule.filter.search')}
            className="bg-transparent outline-none text-[11px] italic w-32" />
        </div>

        {anyFilter && (
          <button onClick={clearFilters} className="label-caps text-[9px] text-[color:var(--color-coral-deep)] px-2 py-1 hover:text-[color:var(--color-coral)]">
            <X size={10} className="inline -mt-0.5" /> {t('schedule.filter.clear')}
          </button>
        )}

        {selection.size > 0 && (
          <>
            <span className="text-[color:var(--color-on-paper-faint)]">·</span>
            <span className="label-caps text-[9px] text-[color:var(--color-brass)] tabular-nums">
              {selection.size} {t('schedule.select.count')}
            </span>
            <button onClick={deleteSelected}
              className="label-caps text-[9px] text-[color:var(--color-coral-deep)] px-2 py-1 hover:text-[color:var(--color-coral)] flex items-center gap-1">
              <Trash2 size={10} /> {t('schedule.select.delete.all')}
            </button>
            <button onClick={clearSelection} className="label-caps text-[9px] text-[color:var(--color-on-paper-muted)] px-2 py-1">
              <X size={10} className="inline -mt-0.5" />
            </button>
          </>
        )}

        <div className="ml-auto label-caps text-[9px] text-[color:var(--color-on-paper-muted)] tabular-nums">
          {events.length} / {allEvents.length}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        {KIND_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-1.5 label-caps text-[color:var(--color-on-paper-muted)]">
            <span className="w-2.5 h-2.5 rounded-[1px]" style={{ background: KIND_COLORS[k] }} />
            {t(`schedule.kind.${k}` as StringKey)}
          </div>
        ))}
        <span className="text-[color:var(--color-on-paper-faint)]">·</span>
        {state.four.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 label-caps text-[color:var(--color-on-paper-muted)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.colorHint ?? 'var(--color-on-paper-faint)' }} />
            {f.name.split(' ')[0]}
          </div>
        ))}
      </div>

      {mode === 'calendar' && (
        <CalendarMonth anchor={anchor} setAnchor={setAnchor} events={events}
          selection={selection} onSelect={toggleSelected}
          onDayClick={(d) => addEvent(format(d, 'yyyy-MM-dd'))}
          onEventClick={(e) => setEditing(e)}
          onReschedule={rescheduleEvent} />
      )}
      {mode === 'week' && (
        <CalendarWeek anchor={anchor} setAnchor={setAnchor} events={events}
          selection={selection} onSelect={toggleSelected}
          onDayClick={(d) => addEvent(format(d, 'yyyy-MM-dd'))}
          onEventClick={(e) => setEditing(e)}
          onReschedule={rescheduleEvent} />
      )}
      {mode === 'timeline' && (
        <TimelineView events={events} selection={selection} onSelect={toggleSelected}
          onEventClick={(e) => setEditing(e)} onReschedule={rescheduleEvent} />
      )}
      {mode === 'agenda' && (
        <AgendaView events={events} selection={selection} onSelect={toggleSelected}
          onEventClick={(e) => setEditing(e)} />
      )}

      {(editing || newDraft) && (
        <EventEditor
          editing={editing}
          newDraft={newDraft}
          onClose={() => { setEditing(null); setNewDraft(null); }}
          onSaveNew={saveNewEvent}
          onSaveEdit={saveEdit}
          onDelete={deleteEdit}
          onDuplicate={duplicateEvent}
        />
      )}

      {flash && (
        <div className="fixed bottom-6 right-6 bg-[color:var(--color-chrome)] text-[color:var(--color-paper)] px-4 py-2 rounded-[3px] label-caps text-[10px] z-50 shadow-xl">
          {flash}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-[2px] label-caps text-[10px] transition-colors ${active ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper)]' : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[11px] italic outline-none">
      {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

/* ---------------- Shared EventChip ---------------- */

function EventChip({ evt, onClick, onDragStart, four, shoots, selected }: {
  evt: RenderedEvent;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  four: TalentFour[];
  shoots: Shoot[];
  selected: boolean;
}) {
  const shoot = evt.shootId ? shoots.find((s) => s.id === evt.shootId) : null;
  const borderColor = shoot?.colorHint ?? KIND_COLORS[evt.kind];
  const bg = `color-mix(in srgb, ${KIND_COLORS[evt.kind]} 22%, transparent)`;

  return (
    <div
      draggable={evt.draggable && !evt.isRecurrenceInstance}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`text-[10px] px-1.5 py-0.5 rounded-[1px] leading-tight truncate cursor-pointer flex items-center gap-1 relative
        ${evt.draggable && !evt.isRecurrenceInstance ? 'active:cursor-grabbing' : ''}
        ${selected ? 'ring-2 ring-[color:var(--color-brass)] ring-inset' : ''}`}
      style={{
        background: bg,
        borderLeft: `3px solid ${borderColor}`,
        color: 'var(--color-on-paper)',
        fontStyle: evt.source !== 'user' ? 'italic' : 'normal',
      }}
      title={`${evt.title} · ${evt.source}${evt.recurring ? ' · repeats' : ''}${evt.draggable ? ' · drag to move · shift+click to select' : ''}`}
    >
      {(evt.personKeys ?? []).map((pk) => {
        const p = four.find((f) => f.key === pk);
        return <span key={pk} className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p?.colorHint ?? 'var(--color-on-paper-faint)' }} />;
      })}
      <span className="truncate">{evt.title}</span>
      {evt.recurring && <Repeat size={8} className="shrink-0 opacity-60" />}
    </div>
  );
}

/* Handler for click that decides between select and open based on modifier */
function makeChipClick(
  evt: RenderedEvent,
  onClick: (e: RenderedEvent) => void,
  onSelect: (id: string, additive: boolean) => void,
) {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      if (evt.source === 'user') onSelect(evt.id, true);
    } else {
      onClick(evt);
    }
  };
}

/* ---------------- Calendar Month ---------------- */

function CalendarMonth({ anchor, setAnchor, events, selection, onSelect, onDayClick, onEventClick, onReschedule }: {
  anchor: Date;
  setAnchor: (d: Date) => void;
  events: RenderedEvent[];
  selection: Set<string>;
  onSelect: (id: string, additive: boolean) => void;
  onDayClick: (d: Date) => void;
  onEventClick: (e: RenderedEvent) => void;
  onReschedule: (evt: RenderedEvent, newStart: string, newEnd: string | undefined) => void;
}) {
  const { state } = useApp();
  const t = useT();
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const dragRef = useRef<{ event: RenderedEvent } | null>(null);

  let today: Date;
  try { today = new Date(); } catch { today = new Date(2026, 6, 11); }

  const dayNames = ['schedule.day.mon','schedule.day.tue','schedule.day.wed','schedule.day.thu','schedule.day.fri','schedule.day.sat','schedule.day.sun'] as const;
  const monthKey = `schedule.month.${format(anchor, 'MMM').toLowerCase()}` as StringKey;

  function onEventDragStart(e: React.DragEvent, evt: RenderedEvent) {
    if (!evt.draggable || evt.isRecurrenceInstance) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', evt.id);
    dragRef.current = { event: evt };
  }
  function onDayDragOver(e: React.DragEvent, day: Date) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(format(day, 'yyyy-MM-dd'));
  }
  function onDayDrop(e: React.DragEvent, day: Date) {
    e.preventDefault();
    if (!dragRef.current) return;
    const evt = dragRef.current.event;
    const originalStart = parseISO(evt.startDate);
    const originalEnd = evt.endDate ? parseISO(evt.endDate) : originalStart;
    const durationDays = differenceInDays(originalEnd, originalStart);
    const newStart = format(day, 'yyyy-MM-dd');
    const newEnd = durationDays > 0 ? format(addDays(day, durationDays), 'yyyy-MM-dd') : undefined;
    onReschedule(evt, newStart, newEnd);
    dragRef.current = null;
    setDragOverDay(null);
  }

  return (
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] overflow-hidden">
      <div className="flex items-baseline justify-between px-4 py-3 border-b-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper)]">
        <div className="flex items-baseline gap-3">
          <button onClick={() => setAnchor(addMonths(anchor, -1))} className="p-1 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"><ChevronLeft size={16} /></button>
          <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{t(monthKey)} {format(anchor, 'yyyy')}</div>
          <button onClick={() => setAnchor(addMonths(anchor, 1))} className="p-1 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"><ChevronRight size={16} /></button>
        </div>
        <button onClick={() => setAnchor(today)} className="label-caps text-[10px] text-[color:var(--color-brass-deep)] hover:text-[color:var(--color-brass)]">{t('schedule.today')}</button>
      </div>

      <div className="grid grid-cols-7 border-b-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper)]">
        {dayNames.map((k) => (
          <div key={k} className="p-2 text-center label-caps text-[10px] text-[color:var(--color-brass-deep)]">
            {t(k as StringKey)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(110px,auto)]">
        {days.map((day) => {
          const inMonth = isSameMonth(day, anchor);
          const isToday = isSameDay(day, today);
          const dayKey = format(day, 'yyyy-MM-dd');
          const isDragOver = dragOverDay === dayKey;
          const dayEvents = events.filter((e) => {
            const s = parseISO(e.startDate);
            const en = e.endDate ? parseISO(e.endDate) : s;
            return isWithinInterval(day, { start: s, end: en });
          });
          return (
            <div
              key={day.toISOString()}
              onDragOver={(e) => onDayDragOver(e, day)}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => onDayDrop(e, day)}
              onClick={() => onDayClick(day)}
              className={`text-left border-r-[0.5px] border-b-[0.5px] border-[color:var(--color-border-paper)] p-1.5 relative flex flex-col gap-1 transition-colors cursor-pointer
                ${inMonth ? 'bg-[color:var(--color-paper-light)]' : 'bg-[color:var(--color-paper)]/40'}
                ${isDragOver ? 'ring-2 ring-[color:var(--color-brass)] ring-inset bg-[color:var(--color-brass)]/10' : ''}
                hover:bg-[color:var(--color-paper)]`}
            >
              <div className={`flex items-baseline justify-between ${inMonth ? '' : 'opacity-50'}`}>
                <div className={`tabular-nums text-[13px] display-italic ${isToday ? 'text-[color:var(--color-brass)] font-bold' : 'text-[color:var(--color-on-paper)]'}`}>
                  {format(day, 'd')}
                </div>
                {isToday && <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-brass)]" />}
              </div>
              {dayEvents.slice(0, 4).map((e) => (
                <EventChip key={e.id} evt={e}
                  onClick={makeChipClick(e, onEventClick, onSelect)}
                  onDragStart={(ev) => onEventDragStart(ev, e)}
                  four={state.four}
                  shoots={state.shoots}
                  selected={selection.has(e.id)}
                />
              ))}
              {dayEvents.length > 4 && (
                <div className="text-[9px] text-[color:var(--color-on-paper-muted)] mt-auto">+{dayEvents.length - 4} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Calendar Week ---------------- */

function CalendarWeek({ anchor, setAnchor, events, selection, onSelect, onDayClick, onEventClick, onReschedule }: {
  anchor: Date;
  setAnchor: (d: Date) => void;
  events: RenderedEvent[];
  selection: Set<string>;
  onSelect: (id: string, additive: boolean) => void;
  onDayClick: (d: Date) => void;
  onEventClick: (e: RenderedEvent) => void;
  onReschedule: (evt: RenderedEvent, newStart: string, newEnd: string | undefined) => void;
}) {
  const { state } = useApp();
  const t = useT();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const dragRef = useRef<{ event: RenderedEvent } | null>(null);

  let today: Date;
  try { today = new Date(); } catch { today = new Date(2026, 6, 11); }

  const dayNames = ['schedule.day.mon','schedule.day.tue','schedule.day.wed','schedule.day.thu','schedule.day.fri','schedule.day.sat','schedule.day.sun'] as const;
  const monthKey = `schedule.month.${format(weekStart, 'MMM').toLowerCase()}` as StringKey;

  function onEventDragStart(e: React.DragEvent, evt: RenderedEvent) {
    if (!evt.draggable || evt.isRecurrenceInstance) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', evt.id);
    dragRef.current = { event: evt };
  }
  function onDayDragOver(e: React.DragEvent, day: Date) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(format(day, 'yyyy-MM-dd'));
  }
  function onDayDrop(e: React.DragEvent, day: Date) {
    e.preventDefault();
    if (!dragRef.current) return;
    const evt = dragRef.current.event;
    const originalStart = parseISO(evt.startDate);
    const originalEnd = evt.endDate ? parseISO(evt.endDate) : originalStart;
    const durationDays = differenceInDays(originalEnd, originalStart);
    const newStart = format(day, 'yyyy-MM-dd');
    const newEnd = durationDays > 0 ? format(addDays(day, durationDays), 'yyyy-MM-dd') : undefined;
    onReschedule(evt, newStart, newEnd);
    dragRef.current = null;
    setDragOverDay(null);
  }

  return (
    <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] overflow-hidden">
      <div className="flex items-baseline justify-between px-4 py-3 border-b-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper)]">
        <div className="flex items-baseline gap-3">
          <button onClick={() => setAnchor(addWeeks(anchor, -1))} className="p-1 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"><ChevronLeft size={16} /></button>
          <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">
            {t('schedule.week.of')} {t(monthKey)} {format(weekStart, 'd')} – {format(weekEnd, 'd')} · {format(weekStart, 'yyyy')}
          </div>
          <button onClick={() => setAnchor(addWeeks(anchor, 1))} className="p-1 text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-brass)]"><ChevronRight size={16} /></button>
        </div>
        <button onClick={() => setAnchor(today)} className="label-caps text-[10px] text-[color:var(--color-brass-deep)] hover:text-[color:var(--color-brass)]">{t('schedule.today')}</button>
      </div>

      <div className="grid grid-cols-7 border-b-[0.5px] border-[color:var(--color-border-paper)] bg-[color:var(--color-paper)]">
        {dayNames.map((k, i) => {
          const d = days[i];
          const isToday = isSameDay(d, today);
          return (
            <div key={k} className="p-2 text-center border-r-[0.5px] border-[color:var(--color-border-paper)] last:border-r-0">
              <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">{t(k as StringKey)}</div>
              <div className={`tabular-nums display-italic text-[24px] mt-0.5 ${isToday ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper)]'}`}>{format(d, 'd')}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 min-h-[500px]">
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const isDragOver = dragOverDay === dayKey;
          const dayEvents = events.filter((e) => {
            const s = parseISO(e.startDate);
            const en = e.endDate ? parseISO(e.endDate) : s;
            return isWithinInterval(day, { start: s, end: en });
          });
          return (
            <div
              key={day.toISOString()}
              onDragOver={(e) => onDayDragOver(e, day)}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => onDayDrop(e, day)}
              onClick={() => onDayClick(day)}
              className={`border-r-[0.5px] border-[color:var(--color-border-paper)] last:border-r-0 p-2 relative flex flex-col gap-1.5 transition-colors cursor-pointer
                bg-[color:var(--color-paper-light)]
                ${isDragOver ? 'ring-2 ring-[color:var(--color-brass)] ring-inset bg-[color:var(--color-brass)]/10' : ''}
                hover:bg-[color:var(--color-paper)]`}
            >
              {dayEvents.map((e) => (
                <EventChip key={e.id} evt={e}
                  onClick={makeChipClick(e, onEventClick, onSelect)}
                  onDragStart={(ev) => onEventDragStart(ev, e)}
                  four={state.four}
                  shoots={state.shoots}
                  selected={selection.has(e.id)}
                />
              ))}
              {dayEvents.length === 0 && (
                <div className="prose-body italic text-[10px] text-[color:var(--color-on-paper-faint)] mt-1">— empty —</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Timeline ---------------- */

function TimelineView({ events, selection, onSelect, onEventClick, onReschedule }: {
  events: RenderedEvent[];
  selection: Set<string>;
  onSelect: (id: string, additive: boolean) => void;
  onEventClick: (e: RenderedEvent) => void;
  onReschedule: (evt: RenderedEvent, newStart: string, newEnd: string | undefined) => void;
}) {
  const { state } = useApp();
  const t = useT();
  const totalDays = differenceInDays(RANGE_END, RANGE_START) + 1;
  const pxPerDay = 4.6;
  const totalWidth = totalDays * pxPerDay;
  const HEADER_H = 54;
  const LANE_H = 52;

  const [dragPreview, setDragPreview] = useState<{ id: string; leftOffset: number } | null>(null);

  const activeKinds = useMemo(() => KIND_KEYS.filter((k) => events.some((e) => e.kind === k)), [events]);

  const monthMarkers = useMemo(() => {
    const markers: { date: Date; label: string; offset: number; isYear: boolean; even: boolean }[] = [];
    let d = new Date(RANGE_START);
    while (d <= RANGE_END) {
      const label = t(`schedule.month.${format(d, 'MMM').toLowerCase()}` as StringKey).substring(0, 3);
      markers.push({
        date: new Date(d),
        label,
        offset: differenceInDays(d, RANGE_START) * pxPerDay,
        isYear: d.getMonth() === 0,
        even: d.getMonth() % 2 === 0,
      });
      d = addMonths(d, 1);
    }
    return markers;
  }, [t]);

  let today: Date;
  try { today = new Date(); } catch { today = new Date(2026, 6, 11); }
  const todayOffset = differenceInDays(today, RANGE_START) * pxPerDay;

  function onBarPointerDown(e: React.PointerEvent, evt: RenderedEvent) {
    /* Shift-click / cmd-click → select */
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      if (evt.source === 'user') { onSelect(evt.id, true); e.preventDefault(); e.stopPropagation(); }
      return;
    }
    if (!evt.draggable || evt.isRecurrenceInstance) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const originalStart = parseISO(evt.startDate);
    const originalEnd = evt.endDate ? parseISO(evt.endDate) : originalStart;
    const originalLeft = differenceInDays(originalStart, RANGE_START) * pxPerDay;
    let currentDeltaDays = 0;

    function onMove(ev: PointerEvent) {
      const deltaX = ev.clientX - startX;
      currentDeltaDays = Math.round(deltaX / pxPerDay);
      setDragPreview({ id: evt.id, leftOffset: originalLeft + currentDeltaDays * pxPerDay });
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragPreview(null);
      if (Math.abs(currentDeltaDays) < 1) {
        onEventClick(evt);
        return;
      }
      const newStart = format(addDays(originalStart, currentDeltaDays), 'yyyy-MM-dd');
      const newEnd = evt.endDate ? format(addDays(originalEnd, currentDeltaDays), 'yyyy-MM-dd') : undefined;
      onReschedule(evt, newStart, newEnd);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const gridH = HEADER_H + activeKinds.length * LANE_H;

  return (
    <div className="flex bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[4px] overflow-hidden">
      {/* Fixed left rail — lane labels stay put while the timeline scrolls */}
      <div className="shrink-0 w-[128px] border-r-[0.5px] border-[color:var(--color-border-paper-strong)] bg-[color:var(--color-paper-card)]">
        <div style={{ height: HEADER_H }} className="border-b-[0.5px] border-[color:var(--color-border-paper)] flex items-end px-3 pb-2">
          <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">lanes</span>
        </div>
        {activeKinds.map((kind) => (
          <div key={kind} style={{ height: LANE_H }} className="flex items-center gap-2 px-3 border-b-[0.5px] border-[color:var(--color-border-paper)] last:border-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: KIND_COLORS[kind] }} />
            <span className="font-sans text-[11px] text-[color:var(--color-on-paper)] leading-tight">{t(`schedule.kind.${kind}` as StringKey)}</span>
          </div>
        ))}
      </div>

      {/* Scrollable timeline */}
      <div className="overflow-x-auto flex-1 scrollbar-chrome">
        <div className="relative" style={{ width: `${totalWidth}px`, height: gridH }}>
          {/* Alternating month background bands */}
          {monthMarkers.map((m, i) => {
            const next = monthMarkers[i + 1];
            const w = (next ? next.offset : totalWidth) - m.offset;
            return (
              <div
                key={`band-${m.date.toISOString()}`}
                className="absolute top-0"
                style={{ left: m.offset, width: w, height: gridH, background: m.even ? 'transparent' : 'rgba(10,43,79,0.025)' }}
              />
            );
          })}

          {/* Month grid lines */}
          {monthMarkers.map((m) => (
            <div
              key={`line-${m.date.toISOString()}`}
              className="absolute top-0 pointer-events-none"
              style={{ left: m.offset, height: gridH, borderLeft: m.isYear ? '1px solid rgba(10,43,79,0.18)' : '0.5px solid rgba(10,43,79,0.07)' }}
            />
          ))}

          {/* Header */}
          <div className="absolute top-0 left-0 right-0" style={{ height: HEADER_H }}>
            {monthMarkers.map((m) => (
              <div key={`hdr-${m.date.toISOString()}`} className="absolute top-0" style={{ left: m.offset }}>
                {m.isYear && (
                  <div className="absolute top-2 left-1.5 display-italic text-[17px] text-[color:var(--color-brass)] leading-none whitespace-nowrap">
                    {format(m.date, 'yyyy')}
                  </div>
                )}
                <div className="absolute left-1.5 label-caps text-[8px] text-[color:var(--color-on-paper-muted)] whitespace-nowrap" style={{ top: m.isYear ? 30 : 20 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Today marker */}
          {todayOffset > 0 && todayOffset < totalWidth && (
            <div className="absolute top-0 pointer-events-none z-20" style={{ left: todayOffset, height: gridH }}>
              <div className="absolute top-0 h-full w-[2px]" style={{ background: 'linear-gradient(to bottom, var(--color-brass), transparent)' }} />
              <div className="absolute top-1 -translate-x-1/2 left-0 px-1.5 py-0.5 rounded-full bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[8px] tracking-wide uppercase whitespace-nowrap">
                {t('schedule.today')}
              </div>
            </div>
          )}

          {/* Lanes */}
          {activeKinds.map((kind, laneIdx) => {
            const laneEvents = events.filter((e) => e.kind === kind);
            return (
              <div
                key={kind}
                className="absolute left-0 right-0 border-b-[0.5px] border-[color:var(--color-border-paper)]"
                style={{ top: HEADER_H + laneIdx * LANE_H, height: LANE_H }}
              >
                {laneEvents.map((e) => {
                  const start = parseISO(e.startDate);
                  const end = e.endDate ? parseISO(e.endDate) : start;
                  const leftDays = differenceInDays(start, RANGE_START);
                  const durationDays = differenceInDays(end, start) + 1;
                  const preview = dragPreview?.id === e.id;
                  const left = preview ? (dragPreview?.leftOffset ?? 0) : leftDays * pxPerDay;
                  const width = Math.max(durationDays * pxPerDay, 8);
                  const shoot = e.shootId ? state.shoots.find((s) => s.id === e.shootId) : null;
                  const isSel = selection.has(e.id);
                  const accent = shoot?.colorHint ?? KIND_COLORS[e.kind];
                  return (
                    <div
                      key={e.id}
                      onPointerDown={(ev) => onBarPointerDown(ev, e)}
                      className={`absolute h-7 rounded-[5px] shadow-[0_1px_3px_rgba(10,30,54,0.18)] hover:shadow-[0_2px_8px_rgba(10,30,54,0.28)] transition-shadow ${e.draggable && !e.isRecurrenceInstance ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${isSel ? 'ring-2 ring-[color:var(--color-brass)] ring-offset-1 ring-offset-[color:var(--color-paper-light)]' : ''}`}
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                        top: (LANE_H - 28) / 2,
                        background: `linear-gradient(180deg, color-mix(in srgb, ${KIND_COLORS[e.kind]} 92%, white) 0%, ${KIND_COLORS[e.kind]} 100%)`,
                        borderLeft: `3px solid ${accent}`,
                        opacity: preview ? 0.55 : (e.source !== 'user' ? 0.9 : 1),
                      }}
                      title={`${e.title} · ${e.startDate}${e.endDate ? ` → ${e.endDate}` : ''}${e.recurring ? ' · repeats' : ''}`}
                    >
                      {width > 46 && (
                        <div className="px-2 text-[10px] leading-tight text-[color:var(--color-paper)] truncate flex items-center gap-1 h-full">
                          {(e.personKeys ?? []).map((pk) => {
                            const p = state.four.find((f) => f.key === pk);
                            return <span key={pk} className="w-1.5 h-1.5 rounded-full shrink-0 border border-[color:var(--color-paper)]/50" style={{ background: p?.colorHint ?? 'var(--color-paper)' }} />;
                          })}
                          <span className="truncate font-sans">{e.title}</span>
                          {e.recurring && <Repeat size={8} className="opacity-70 shrink-0" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Agenda View ---------------- */

function AgendaView({ events, selection, onSelect, onEventClick }: {
  events: RenderedEvent[];
  selection: Set<string>;
  onSelect: (id: string, additive: boolean) => void;
  onEventClick: (e: RenderedEvent) => void;
}) {
  const { state } = useApp();
  const t = useT();

  let today: Date;
  try { today = new Date(); } catch { today = new Date(2026, 6, 11); }

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const map = new Map<string, RenderedEvent[]>();
    for (const e of sorted) {
      const list = map.get(e.startDate) ?? [];
      list.push(e);
      map.set(e.startDate, list);
    }
    return [...map.entries()];
  }, [events]);

  if (grouped.length === 0) {
    return (
      <div className="prose-body italic text-[color:var(--color-on-paper-faint)] p-8 text-center border-[0.5px] border-dashed border-[color:var(--color-border-paper)] rounded-[3px]">
        {t('schedule.agenda.no.events')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([date, dayEvents]) => {
        const d = parseISO(date);
        const isToday = isSameDay(d, today);
        return (
          <section key={date} className="grid grid-cols-[140px_1fr] gap-6">
            <div className="text-right">
              <div className={`tabular-nums display-italic text-[24px] ${isToday ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper)]'}`}>
                {format(d, 'd')}
              </div>
              <div className="label-caps text-[10px] text-[color:var(--color-brass-deep)]">
                {t(`schedule.month.${format(d, 'MMM').toLowerCase()}` as StringKey)} {format(d, 'yyyy')}
              </div>
              <div className="label-caps text-[9px] text-[color:var(--color-on-paper-faint)] mt-1">
                {t(`schedule.day.${format(d, 'EEE').toLowerCase().substring(0,3)}` as StringKey)}
              </div>
              {isToday && <div className="label-caps text-[9px] text-[color:var(--color-brass)] mt-1">{t('schedule.today')}</div>}
            </div>
            <ul className="space-y-2 border-l-[0.5px] border-[color:var(--color-border-paper)] pl-6 py-1">
              {dayEvents.map((e) => {
                const isSel = selection.has(e.id);
                const shoot = e.shootId ? state.shoots.find((s) => s.id === e.shootId) : null;
                return (
                  <li key={e.id}>
                    <button
                      onClick={(ev) => {
                        if (ev.shiftKey || ev.metaKey || ev.ctrlKey) {
                          if (e.source === 'user') onSelect(e.id, true);
                        } else {
                          onEventClick(e);
                        }
                      }}
                      className={`text-left w-full flex items-baseline gap-3 group hover:bg-[color:var(--color-paper-light)] p-2 rounded-[3px] transition-colors ${isSel ? 'ring-2 ring-[color:var(--color-brass)]' : ''}`}
                    >
                      <span className="w-1 h-6 rounded-[1px] shrink-0" style={{ background: shoot?.colorHint ?? KIND_COLORS[e.kind] }} />
                      <div className="flex-1 min-w-0">
                        <div className="display-italic text-[16px] text-[color:var(--color-on-paper)] leading-tight flex items-center gap-2">
                          {e.title}
                          {e.recurring && <Repeat size={10} className="opacity-60 text-[color:var(--color-brass-deep)]" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t(`schedule.kind.${e.kind}` as StringKey)}</span>
                          {e.endDate && e.endDate !== e.startDate && (
                            <span className="prose-body italic text-[10px] text-[color:var(--color-on-paper-muted)]">→ {e.endDate}</span>
                          )}
                          {e.source !== 'user' && (
                            <span className="label-caps text-[9px] text-[color:var(--color-dock)]">· {e.source}</span>
                          )}
                          {(e.personKeys ?? []).map((pk) => {
                            const p = state.four.find((f) => f.key === pk);
                            if (!p) return null;
                            return (
                              <span key={pk} className="flex items-center gap-1 text-[9px] text-[color:var(--color-on-paper-muted)]">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.colorHint ?? 'var(--color-on-paper-faint)' }} />
                                {p.name.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ---------------- Event Editor ---------------- */

function EventEditor({ editing, newDraft, onClose, onSaveNew, onSaveEdit, onDelete, onDuplicate }: {
  editing: RenderedEvent | null;
  newDraft: { startDate: string } | null;
  onClose: () => void;
  onSaveNew: (patch: Partial<CalendarEvent> & { title: string; startDate: string; kind: CalendarEventKind }) => void;
  onSaveEdit: (patch: Partial<CalendarEvent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { state } = useApp();
  const t = useT();
  const isNew = !editing;

  /* If editing recurring instance, source master */
  const master = editing && editing.source === 'user'
    ? state.calendarEvents.find((e) => e.id === editing.originalId)
    : null;

  const [title, setTitle] = useState(master?.title ?? editing?.title ?? '');
  const [startDate, setStartDate] = useState(master?.startDate ?? editing?.startDate ?? newDraft?.startDate ?? '');
  const [endDate, setEndDate] = useState(master?.endDate ?? editing?.endDate ?? '');
  const [kind, setKind] = useState<CalendarEventKind>(master?.kind ?? editing?.kind ?? 'meeting');
  const [notes, setNotes] = useState(master?.notes ?? editing?.notes ?? '');
  const [personKeys, setPersonKeys] = useState<FourKey[]>(master?.personKeys ?? editing?.personKeys ?? []);
  const [shootId, setShootId] = useState<string>(master?.shootId ?? editing?.shootId ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceRule | ''>(master?.recurrence ?? '');
  const [recurrenceEnd, setRecurrenceEnd] = useState<string>(master?.recurrenceEnd ?? '');

  const readOnly = editing?.source && editing.source !== 'user';

  function togglePerson(k: FourKey) {
    setPersonKeys((prev) => prev.includes(k) ? prev.filter((p) => p !== k) : [...prev, k]);
  }

  function save() {
    if (!title.trim() || !startDate) return;
    const patch: Partial<CalendarEvent> & { title: string; startDate: string; kind: CalendarEventKind } = {
      title: title.trim(),
      startDate,
      endDate: endDate || undefined,
      kind,
      notes: notes || undefined,
      personKeys: personKeys.length ? personKeys : undefined,
      shootId: shootId || undefined,
      recurrence: recurrence || undefined,
      recurrenceEnd: recurrence && recurrenceEnd ? recurrenceEnd : undefined,
    };
    if (isNew) onSaveNew(patch);
    else onSaveEdit(patch);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[color:var(--color-chrome-deep)]/60" onClick={onClose}>
      <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-brass)] rounded-[3px] max-w-[560px] w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="display-italic text-[22px] text-[color:var(--color-on-paper)]">
            {isNew ? t('schedule.new.event') : t('schedule.edit.event')}
          </h3>
          <button onClick={onClose} className="text-[color:var(--color-on-paper-muted)]"><X size={16} /></button>
        </div>

        {readOnly && (
          <div className="mb-3 p-2 bg-[color:var(--color-paper)] border-l-2 border-[color:var(--color-dock)] rounded-[2px] label-caps text-[10px] text-[color:var(--color-dock)]">
            {t('schedule.event.ghost')}
          </div>
        )}
        {editing?.isRecurrenceInstance && (
          <div className="mb-3 p-2 bg-[color:var(--color-paper)] border-l-2 border-[color:var(--color-brass)] rounded-[2px] label-caps text-[10px] text-[color:var(--color-brass-deep)]">
            <Repeat size={10} className="inline -mt-0.5 mr-1" />
            {t('schedule.recurrence.affects')}
          </div>
        )}

        <div className="space-y-3">
          <Field label={t('schedule.event.title')}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!!readOnly} autoFocus
              className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[14px] italic outline-none focus:border-[color:var(--color-brass)]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('schedule.event.start')}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!!readOnly}
                className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] tabular-nums outline-none focus:border-[color:var(--color-brass)]" />
            </Field>
            <Field label={t('schedule.event.end')}>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!!readOnly}
                className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] tabular-nums outline-none focus:border-[color:var(--color-brass)]" />
            </Field>
          </div>
          <Field label={t('schedule.event.kind')}>
            <select value={kind} onChange={(e) => setKind(e.target.value as CalendarEventKind)} disabled={!!readOnly}
              className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[color:var(--color-brass)]">
              {KIND_KEYS.map((k) => (<option key={k} value={k}>{t(`schedule.kind.${k}` as StringKey)}</option>))}
            </select>
          </Field>

          {!readOnly && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('schedule.recurrence')}>
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as RecurrenceRule | '')}
                  className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[color:var(--color-brass)]">
                  <option value="">{t('schedule.recurrence.none')}</option>
                  {RECURRENCE_KEYS.map((r) => (<option key={r} value={r}>{t(`schedule.recurrence.${r}` as StringKey)}</option>))}
                </select>
              </Field>
              {recurrence && (
                <Field label={t('schedule.recurrence.until')}>
                  <input type="date" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)}
                    className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] tabular-nums outline-none focus:border-[color:var(--color-brass)]" />
                </Field>
              )}
            </div>
          )}

          {!readOnly && (
            <Field label={t('schedule.filter.person')}>
              <div className="flex flex-wrap gap-2">
                {state.four.map((f) => {
                  const on = personKeys.includes(f.key);
                  return (
                    <button key={f.key} onClick={() => togglePerson(f.key)}
                      className={`px-2 py-1 rounded-[3px] label-caps text-[10px] flex items-center gap-1.5 transition-colors ${on ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper)]' : 'bg-[color:var(--color-paper)] text-[color:var(--color-on-paper-muted)] border-[0.5px] border-[color:var(--color-border-paper)]'}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: f.colorHint ?? 'var(--color-on-paper-faint)' }} />
                      {f.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
          {!readOnly && (
            <Field label={t('schedule.event.linkedShoot')}>
              <select value={shootId} onChange={(e) => setShootId(e.target.value)}
                className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[color:var(--color-brass)]">
                <option value="">—</option>
                {state.shoots.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
              </select>
            </Field>
          )}
          <Field label={t('schedule.event.notes')}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!!readOnly} rows={3}
              className="w-full bg-[color:var(--color-paper)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1.5 text-[13px] italic outline-none resize-y focus:border-[color:var(--color-brass)]" />
          </Field>
        </div>

        <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
          {!isNew && !readOnly && (
            <>
              <button onClick={onDelete} className="flex items-center gap-1 text-[color:var(--color-coral-deep)] label-caps text-[10px]">
                <Trash2 size={11} /> {t('common.delete')}
              </button>
              <button onClick={onDuplicate} className="flex items-center gap-1 text-[color:var(--color-brass-deep)] label-caps text-[10px]">
                <Copy size={11} /> {t('schedule.duplicate')}
              </button>
            </>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="label-caps text-[10px] text-[color:var(--color-on-paper-muted)] px-3 py-1.5">{t('common.cancel')}</button>
            {!readOnly && (
              <button onClick={save} className="label-caps text-[10px] bg-[color:var(--color-brass)] text-[color:var(--color-paper)] px-4 py-1.5 rounded-[3px]">
                {t('common.save')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">{label}</div>
      {children}
    </div>
  );
}
