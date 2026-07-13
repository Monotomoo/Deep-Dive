import type { AppState, FourKey, ViewKey } from '../types';

/* Connection graph — the connective tissue behind the dashboards.
   Given any entity (a person, event, topic, idea, interview, shoot,
   thread, talent) resolve everything linked to it, grouped, so a single
   drawer can show "everything connected in one place" and let you hop
   from node to node. */

export type EntityType =
  | 'four' | 'talent' | 'event' | 'topic' | 'idea'
  | 'interview' | 'shoot' | 'thread';

export interface EntityRef {
  type: EntityType;
  id: string;               // four → FourKey; else entity id
}

export interface ConnItem extends EntityRef {
  label: string;
  sub?: string;
  color: string;
}

export interface ConnGroup {
  key: string;
  label: string;
  items: ConnItem[];
}

export const VIEW_FOR_ENTITY: Record<EntityType, ViewKey> = {
  four: 'cast', talent: 'cast', event: 'cast', topic: 'cast',
  idea: 'idea-hub', interview: 'interviews', shoot: 'shoots', thread: 'threads',
};

const C = {
  four: '#d96c3d', talent: '#6f8a72', event: '#b54f26', topic: '#c9a961',
  idea: '#d9a93e', interview: '#3d7a94', shoot: '#3d7a94', thread: '#4c6b93',
};

/* ---- label + color for a ref ---- */
export function refTitle(state: AppState, ref: EntityRef): { label: string; sub?: string; color: string } {
  switch (ref.type) {
    case 'four': {
      const f = state.four.find((x) => x.key === ref.id);
      return { label: f?.name ?? ref.id, sub: f?.role, color: f?.colorHint ?? C.four };
    }
    case 'talent': {
      const t = state.talents.find((x) => x.id === ref.id);
      return { label: t?.name ?? ref.id, sub: t?.role, color: t?.colorHint ?? C.talent };
    }
    case 'event': {
      const e = state.storyEvents.find((x) => x.id === ref.id);
      return { label: e?.title ?? ref.id, sub: e ? `${e.year}` : undefined, color: C.event };
    }
    case 'topic': {
      const t = state.topics.find((x) => x.id === ref.id);
      return { label: t?.title ?? ref.id, sub: t?.question, color: t?.colorHint ?? C.topic };
    }
    case 'idea': {
      const i = state.hubIdeas.find((x) => x.id === ref.id);
      return { label: i?.title ?? ref.id, sub: i?.kind, color: C.idea };
    }
    case 'interview': {
      const iv = state.interviews.find((x) => x.id === ref.id);
      if (!iv) return { label: ref.id, color: C.interview };
      const shoot = state.shoots.find((s) => s.id === iv.shootId);
      const who = iv.personKey === 'together' ? 'The four' : iv.personKey === 'other'
        ? state.talents.find((t) => t.id === iv.talentIds?.[0])?.name ?? 'Cast'
        : state.four.find((f) => f.key === iv.personKey)?.name ?? iv.personKey;
      return { label: `${who}`, sub: `${shoot?.title.split('·')[0].trim() ?? ''} · ${iv.date}`, color: C.interview };
    }
    case 'shoot': {
      const s = state.shoots.find((x) => x.id === ref.id);
      return { label: s?.title.split('·')[0].trim() ?? ref.id, sub: s?.location, color: s?.colorHint ?? C.shoot };
    }
    case 'thread': {
      const th = state.threads.find((x) => x.id === ref.id);
      return { label: th ? `${th.num} · ${th.title}` : ref.id, sub: th?.subtitle, color: C.thread };
    }
  }
}

function toItem(state: AppState, ref: EntityRef): ConnItem {
  const { label, sub, color } = refTitle(state, ref);
  return { ...ref, label, sub, color };
}

function ownersOf(owner: string): FourKey[] {
  if (owner === 'petar-vito') return ['petar', 'vito'];
  if (owner === 'sanda-zsofia') return ['sanda', 'zsofia'];
  if (owner === 'ensemble') return ['petar', 'vito', 'sanda', 'zsofia'];
  return [owner as FourKey];
}

/* ---- the resolver ---- */
export function getConnections(state: AppState, ref: EntityRef): ConnGroup[] {
  const groups: ConnGroup[] = [];
  const push = (key: string, label: string, refs: EntityRef[]) => {
    if (refs.length) groups.push({ key, label, items: refs.map((r) => toItem(state, r)) });
  };

  switch (ref.type) {
    case 'four': {
      const key = ref.id as FourKey;
      push('events', 'Story events', state.storyEvents.filter((e) => e.personKeys.includes(key)).map((e) => ({ type: 'event', id: e.id })));
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.personKey === key || iv.personKey === 'together').map((iv) => ({ type: 'interview', id: iv.id })));
      push('threads', 'Threads', state.threads.filter((th) => ownersOf(th.owner).includes(key)).map((th) => ({ type: 'thread', id: th.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'four' && l.targetId === key)).map((i) => ({ type: 'idea', id: i.id })));
      const topicIds = new Set<string>();
      for (const e of state.storyEvents) if (e.personKeys.includes(key)) (e.topicIds ?? []).forEach((t) => topicIds.add(t));
      for (const iv of state.interviews) if (iv.personKey === key) (iv.topicIds ?? []).forEach((t) => topicIds.add(t));
      push('topics', 'Topics', [...topicIds].map((id) => ({ type: 'topic', id })));
      break;
    }
    case 'talent': {
      const id = ref.id;
      const tal = state.talents.find((x) => x.id === id);
      if (tal && tal.relationshipTo !== 'ensemble') push('anchor', 'Anchored to', [{ type: 'four', id: tal.relationshipTo }]);
      push('events', 'Story events', state.storyEvents.filter((e) => e.talentIds?.includes(id)).map((e) => ({ type: 'event', id: e.id })));
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.talentIds?.includes(id)).map((iv) => ({ type: 'interview', id: iv.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'talent' && l.targetId === id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
    case 'event': {
      const e = state.storyEvents.find((x) => x.id === ref.id);
      if (!e) break;
      push('people', 'People', e.personKeys.map((k) => ({ type: 'four' as const, id: k })));
      push('cast', 'Cast', (e.talentIds ?? []).map((id) => ({ type: 'talent' as const, id })));
      push('topics', 'Topics', (e.topicIds ?? []).map((id) => ({ type: 'topic' as const, id })));
      if (e.shootId) push('shoot', 'Captured at', [{ type: 'shoot', id: e.shootId }]);
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.eventIds?.includes(e.id)).map((iv) => ({ type: 'interview', id: iv.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'event' && l.targetId === e.id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
    case 'topic': {
      const t = state.topics.find((x) => x.id === ref.id);
      if (!t) break;
      push('threads', 'Feeds threads', (t.threadIds ?? []).map((id) => ({ type: 'thread' as const, id })));
      push('events', 'Story events', state.storyEvents.filter((e) => e.topicIds?.includes(t.id)).map((e) => ({ type: 'event', id: e.id })));
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.topicIds?.includes(t.id)).map((iv) => ({ type: 'interview', id: iv.id })));
      const people = new Set<string>();
      for (const e of state.storyEvents) if (e.topicIds?.includes(t.id)) e.personKeys.forEach((p) => people.add(p));
      for (const iv of state.interviews) if (iv.topicIds?.includes(t.id) && iv.personKey !== 'together' && iv.personKey !== 'other') people.add(iv.personKey);
      push('people', 'People', [...people].map((id) => ({ type: 'four' as const, id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'topic' && l.targetId === t.id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
    case 'idea': {
      const i = state.hubIdeas.find((x) => x.id === ref.id);
      if (!i) break;
      const map: Record<string, EntityType> = { four: 'four', talent: 'talent', event: 'event', topic: 'topic', shoot: 'shoot', thread: 'thread', interview: 'interview' };
      const byType: Record<string, EntityRef[]> = {};
      for (const l of i.links) {
        const et = map[l.targetType];
        if (!et || l.targetType === 'swing') continue;
        (byType[et] ??= []).push({ type: et, id: l.targetId });
      }
      const order: EntityType[] = ['four', 'talent', 'event', 'topic', 'shoot', 'thread', 'interview'];
      for (const et of order) if (byType[et]) push(et, `${et[0].toUpperCase()}${et.slice(1)}s`, byType[et]);
      break;
    }
    case 'interview': {
      const iv = state.interviews.find((x) => x.id === ref.id);
      if (!iv) break;
      if (iv.personKey === 'together') push('people', 'People', (['petar', 'vito', 'sanda', 'zsofia'] as FourKey[]).map((k) => ({ type: 'four', id: k })));
      else if (iv.personKey === 'other') push('cast', 'Subject', (iv.talentIds ?? []).map((id) => ({ type: 'talent' as const, id })));
      else push('people', 'Subject', [{ type: 'four', id: iv.personKey }]);
      push('shoot', 'Location', [{ type: 'shoot', id: iv.shootId }]);
      push('topics', 'Topics', (iv.topicIds ?? []).map((id) => ({ type: 'topic' as const, id })));
      push('events', 'Story events', (iv.eventIds ?? []).map((id) => ({ type: 'event' as const, id })));
      push('threads', 'Threads', iv.threadIds.map((id) => ({ type: 'thread' as const, id })));
      if (iv.followUpOfId) push('parent', 'Follow-up of', [{ type: 'interview', id: iv.followUpOfId }]);
      push('children', 'Followed up by', state.interviews.filter((x) => x.followUpOfId === iv.id).map((x) => ({ type: 'interview', id: x.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'interview' && l.targetId === iv.id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
    case 'shoot': {
      const s = state.shoots.find((x) => x.id === ref.id);
      if (!s) break;
      push('people', 'Present', s.presentFour.map((k) => ({ type: 'four' as const, id: k })));
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.shootId === s.id).map((iv) => ({ type: 'interview', id: iv.id })));
      push('events', 'Story events', state.storyEvents.filter((e) => e.shootId === s.id).map((e) => ({ type: 'event', id: e.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'shoot' && l.targetId === s.id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
    case 'thread': {
      const th = state.threads.find((x) => x.id === ref.id);
      if (!th) break;
      push('people', 'Owners', ownersOf(th.owner).map((k) => ({ type: 'four' as const, id: k })));
      push('topics', 'Topics', state.topics.filter((t) => t.threadIds?.includes(th.id)).map((t) => ({ type: 'topic', id: t.id })));
      push('interviews', 'Interviews', state.interviews.filter((iv) => iv.threadIds.includes(th.id)).map((iv) => ({ type: 'interview', id: iv.id })));
      push('ideas', 'Ideas', state.hubIdeas.filter((i) => i.links.some((l) => l.targetType === 'thread' && l.targetId === th.id)).map((i) => ({ type: 'idea', id: i.id })));
      break;
    }
  }
  return groups;
}

export function connectionCount(state: AppState, ref: EntityRef): number {
  return getConnections(state, ref).reduce((n, g) => n + g.items.length, 0);
}
