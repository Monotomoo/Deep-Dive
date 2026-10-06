# The Plan · timeline

Agreed 2026-10-06. Answers: Q1 A · Q2 A · Q3 A · Q4 B (no episode tag for now).

## TASK
Rebuild The Plan as one horizontal timeline: the six stages Tomo and Vito drew, in story order left to right, over a real calendar of the season, with app entities connectable to each stage.

## CONTEXT
- Why: the hand-drawn plan is the film's chapter map, but it floats free of the production. A producer will ask "what is shot, what remains, where does each chapter's material come from." The Plan should answer that on one screen.
- Who: Tomo and Vito first, then the crew. Read by a producer over Tomo's shoulder.
- Where: `src/components/views/StoryMapView.tsx` (rewrite), `src/types.ts` (MapLane gains links), `src/state/reducer.ts` (link/unlink actions), `src/lib/storage.ts` (additive migration), `src/lib/seed.ts` (seed links for the obvious pairs).
- Connects to: shoots (real dates, status, colour), scenario parts, interviews, ideas, threads, the four, milestones. Reuses the picker pattern from The Scenario and the shared EditableText.

## CONSTRAINTS
- Stack as is: React 19, TypeScript strict, Tailwind v4, HTML5 drag and drop, inline SVG for lines. No new libraries.
- Out of scope this pass: editing shoot dates from The Plan (dates belong to Shoots), Gantt scheduling (Schedule owns that), anything automatic or AI-suggested, per-field merge sync, episode tags per stage.
- Non-negotiables: nothing in the current Plan is lost (every mark, bracket, arrow, note survives the migration); no edit mode, click to edit; syncs through the crew doc like everything else; works at phone width with no horizontal page scroll; prints on A4 landscape.
- Budget: one session, three commits (data and picker; timeline layout; phone, print, polish).

## OUTPUT
One view, two registers, joined by lines.

**Top register, the stages.** Six segments left to right in story order. Each shows its number, title, short code (BO, LS…), the handwritten note, its colour. Inside it, the existing marks (Pero, 132, Vegas, AIDA · CMAS…) as small tags, still editable and draggable between stages. Under the marks, connected chips (shoot, part, interview, idea, thread, person) with a kind icon; click opens the thing; × on hover detaches. A "+ connect" control per stage opens the picker: tabs by kind, search, Esc closes. Curved arrows between stages stay.

**Bottom register, the season.** A proportional calendar from Krk (June 2026) to the coda (2027). Every shoot as a bar at its real dates in its colour, done shoots solid, planned ones outlined, title and dates on hover; milestone ticks; a "today" line. Shoots without dates sit in a small "no dates yet" strip.

**Between them:** a line from each stage down to every shoot connected to it.

**Right edge:** the brackets (Unsorted, People) as a tray; drag a line onto a stage as today.

**Phone:** stages stack vertically, the calendar becomes a scrollable band under them, lines are dropped. **Print:** landscape, tray and controls hidden.

**Data:** `MapLane.links?: { kind: 'shoot' | 'part' | 'interview' | 'idea' | 'thread' | 'person'; id: string }[]`. Actions `LINK_MAP_LANE` / `UNLINK_MAP_LANE`. Migration additive. Seed links only for pairs the drawing already implies.

## DONE-WHEN
- [ ] The Plan opens as one horizontal timeline: six stages left to right, calendar below with every shoot at its real dates and a today line.
- [ ] From any stage, "+ connect" offers shoots, scenario parts, interviews, ideas, threads, the four; choosing one adds a chip; the chip opens the thing; × removes it.
- [ ] A stage connected to a shoot shows a line to that shoot's bar.
- [ ] Every existing mark, bracket, note and arrow is present after the update, checked against the crew doc.
- [ ] A connection made in one browser appears in another within seconds.
- [ ] Phone width: no horizontal page scroll; stages readable; calendar scrolls.
- [ ] Prints on A4 landscape without controls.
- [ ] Build clean, deployed, verified live with a screenshot.
