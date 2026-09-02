/* Is this document open in more than one tab?

   It matters because the crew document is last-write-wins. Two tabs of the
   same browser each hold their own copy of the state; whichever one you touch
   pushes ITS copy over the other's. A tab left open from an hour ago will
   cheerfully overwrite the edit you just made in the new one, over and over,
   and from the user's side that looks exactly like "nothing is being saved".

   That is not a hypothetical: it cost an entire evening's debugging. The app
   has to say so out loud. */

const CHANNEL = 'deep-dive-tabs';

export interface TabPresence {
  id: string;
  build: string;
  born: number;
}

export const tabId: string = `t_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

type Msg =
  | { type: 'hello'; from: TabPresence }
  | { type: 'here'; from: TabPresence }
  | { type: 'bye'; id: string };

/* Calls `onChange` with the OTHER live tabs whenever that set changes.
   Returns an unsubscribe. No-ops where BroadcastChannel is unavailable. */
export function watchTabs(build: string, onChange: (others: TabPresence[]) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const me: TabPresence = { id: tabId, build, born: Date.now() };
  const others = new Map<string, TabPresence>();
  const ch = new BroadcastChannel(CHANNEL);

  const emit = () => onChange([...others.values()]);

  ch.onmessage = (e: MessageEvent<Msg>) => {
    const m = e.data;
    if (m.type === 'bye') { if (others.delete(m.id)) emit(); return; }
    if (m.from.id === tabId) return;
    /* Someone announced themselves — record them and answer, so THEY learn
       about us too. Answers are not answered, or two tabs ping forever. */
    const known = others.has(m.from.id);
    others.set(m.from.id, m.from);
    if (!known) emit();
    if (m.type === 'hello') ch.postMessage({ type: 'here', from: me } satisfies Msg);
  };

  ch.postMessage({ type: 'hello', from: me } satisfies Msg);

  const bye = () => { try { ch.postMessage({ type: 'bye', id: tabId } satisfies Msg); } catch { /* closing */ } };
  window.addEventListener('pagehide', bye);

  return () => {
    bye();
    window.removeEventListener('pagehide', bye);
    ch.close();
  };
}
