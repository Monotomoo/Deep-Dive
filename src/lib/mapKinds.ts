import type { MapNode, MapNodeKind } from '../types';

/* Reading a mark's shape from the mark itself.

   The Plan is transcribed from a drawing, and on the drawing nothing is
   tagged — a bubble is a bubble. So rather than making anyone choose a type
   from a dropdown before they can write something down, the board guesses
   from what was typed and lets it be corrected afterwards with one click.

   Kept out of the view because the reducer needs it too: a chip dragged out
   of the tray is a bare string that has to become a typed node on landing. */

/** What a freshly-typed label most likely is. Wrong guesses cost one click. */
export function classifyLabel(raw: string): MapNodeKind {
  const s = raw.trim();
  if (/^\?+$/.test(s)) return 'unknown';
  if (/^\d{2,3}\s*m?$/i.test(s)) return 'depth';
  /* An acronym or a body: short, shouty, no lowercase. AIDA · CMAS · DCI. */
  if (/^[A-Z0-9][A-Z0-9·\-\s/]{1,14}$/.test(s) && s.length <= 16) return 'org';
  return 'note';
}

/* The seed only distinguishes six kinds, but the board wants to draw eight
   shapes — a count ("4x") is not a depth, and a one-word thread is not a
   paragraph of handwriting. Derived at render so no stored node has to be
   retagged and no content generation has to be bumped. */
export type MarkForm = 'person' | 'depth' | 'count' | 'place' | 'org' | 'topic' | 'note' | 'unknown';

export function markForm(n: MapNode): MarkForm {
  if (n.kind === 'person' || n.kind === 'place' || n.kind === 'org' || n.kind === 'unknown') return n.kind;
  if (n.kind === 'depth') return 'depth';
  if (/^\d+\s*x$/i.test(n.label.trim())) return 'count';
  return n.label.trim().length <= 24 ? 'topic' : 'note';
}

/** The digits of a depth mark, or null if it isn't one. */
export function depthValue(label: string): number | null {
  const m = label.trim().match(/^(\d{2,3})\s*m?$/i);
  return m ? Number(m[1]) : null;
}
