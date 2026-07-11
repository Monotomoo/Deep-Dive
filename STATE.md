# Deep Dive · V1.1 — session checkpoint (v0.5)

> A feature documentary + 3-episode series about four of the best freedivers alive:
> **Petar Klovar · Vitomir Maričić · Sanda Delija · Zsófia Törőcsik**
> Not a film about depth. A film about who waits for you at the surface.
> *"One person holds another in the world."*

## Quick orientation

- **Project folder:** `D:/CLAUDE PROJECTS/Deep Dive V1.1/`
- **Dev server:** `npm run dev` → `http://localhost:5173+/` (auto-fallback if in use) · skip splash `?nosplash=1`
- **Build:** TypeScript clean · 398 KB / 110 KB gzipped
- **Origin:** forked from Ribanje V1.1 scaffold · 2026-07-11
- **Sidebar IA:** 25 views · Plan (6) · Make (11) · Tell (5) · Library (2)
- **Repo:** local `.git` · 2 commits (v0.1 init + v0.2)  · uncommitted v0.3+v0.4+v0.5 changes ready for commit

## Session summary — v0.1 → v0.5 · one long build day

### v0.1 · initial scaffold (2026-07-11)
Forked Ribanje V1.1. Stripped Ribanje-specific modules (Almanac, Bridge, Pilot Plan, fisherman modules). Wrote fresh Deep Dive types + seed + reducer + storage from 4 PDFs (Film Bible, Interview Architecture, Sicily Shooting Bible, 2023 Chapter Working Paper). Own palette: deep-blue-below + warm-cream-above + Etna coral. 24 view stubs. HR/EN i18n parity.

### v0.2 · data corrections + Camera Team + Ideas Workshop
- Sanda hometown → Trieste
- Borna removed
- Sicily location → Catania (not Santa Tecla)
- Sicily Day 1: landed + met, Day 2: training, Days 3+ open
- Crew added: Toni + Christian (camera operators)
- Empty risks
- USA shoot expanded with Vegas→SF RV road-trip bible
- **Camera Team module**: Camera / Lens / Microphone / Light entities · 3 tabs (All inventory · Per-operator kit bag · Per-shoot loadout) · realistic starter kit seeded (Sony FX3, Canon C70, Nauticam UW housing, DJI Mavic 3 Pro, Cooke 32mm, Sennheiser/DPA/Aquarian mics, Aputure/Nanlite/Kraken lights)
- **Spine → Ideas Workshop kanban** (idea/discussing/leading/dropped)
- **Bigger Swings** — added whyItMatters + narrative + visualNote + soundNote + dependencies to all 10
- **Overview** — countdown to next shoot + achieved-swings hero + activity feed + 6-tile stats
- **Vision** — 7 new sections (grammar, four-arcs, devices, shape, threads-at-a-glance)
- **Shoots editable** — inline click-to-edit for spirit, captures, bible, days (CRUD)

### v0.3 · Schedule Calendar + Timeline foundation
- **CalendarEvent** entity with kind (shoot/milestone/meeting/travel/delivery/personal/other), shootId, personKeys, notes
- **ScheduleView rebuild**: toggle Calendar (month grid) + Timeline (horizontal)
- Calendar month: click-day-to-add + click-event-to-edit + multi-day event rendering
- Timeline: 2-year horizontal scroll (2026-01 → 2027-12), lanes per kind, event bars
- Composed event stream: user events + shoots as ghost events + milestones as ghost events

### v0.4 · Drag + filters + person colors + agenda
- **Person color assignments** — Petar coral, Vito dock teal, Sanda olive, Zsófia warm amber
- **Drag-to-reschedule** — HTML5 drag in calendar (cell drop zones with brass ring on hover), pointer events in timeline (live preview at 60% opacity)
- **Two-way sync** — dragging a shoot ghost dispatches UPDATE_SHOOT (calendar reschedules the actual shoot)
- **Filters** — by kind + by person + by shoot + search + clear button + counter
- **Agenda view** — third mode, chronological grouping by date with left-rail date label + right-rail events

### v0.5 · Week + recurring + multi-select + copy/paste + shoot borders (final turn before compact)
- **Shoot signature colors** — 7 shoots each with unique color used as event's **left border** when linked
- **Week view (4th mode)** — 7-column daily grid with 500px+ min height per cell, weekly navigation
- **Recurring events** — types (RecurrenceRule: daily/weekly/monthly) + recurrenceEnd + expansion helper that generates virtual instances in 2026-2027 range
- **Multi-select** — Shift+click / Cmd+click adds/removes from selection (only user events, not ghosts)
- **Bulk delete** — Delete/Backspace deletes all selected + "delete selected" button in filter row
- **Copy/paste** — Ctrl/⌘+C snapshots single-selected event to clipboard state + flash toast; Ctrl/⌘+V pastes at anchor date with preserved duration
- **Duplicate button** in editor — creates copy shifted +1 day
- **Enhanced editor** — recurrence dropdown + end-date + "affects all future occurrences" warning on virtual instances

## Locked stack (all decisions)

- **Cloud sync** — user picked "Firebase / Supabase real multi-user" but explicitly deferred (v0.6+, needs dedicated session with platform choice + auth + permissions design)
- **Palette** — deep-blue-below + warm-cream-above + Etna coral (own identity, not Ribanje's Stari Grad)
- **Language** — HR/EN parity with type-locked dictionary (Ribanje pattern)
- **2023 Chapter** — ordinary thread with evidence library (no special gating per user decision)
- **Editability** — everything inline click-to-edit; multi-user achieved via app running on Vercel + shared laptop for now
- **Recurring events** — master-only editing (edit occurrence = edit all future); "edit only this occurrence" is future feature

## Sidebar IA — 25 views in 4 groups

```
PLAN                MAKE                    TELL              LIBRARY
Overview            The Four                Pitch             References
Vision              Threads                 Distribution      The 2023 Chapter
Schedule            Spine (Workshop)        Contracts
Crew                Shoots                  Journal
Sponsors            Interviews              Post-production
Risks               Bigger Swings
                    Devices
                    Records
                    Physiology
                    Watchers
                    Camera Team
```

## Schedule module — what works now

**Views:** Calendar (month grid) · Week (7-col daily grid) · Timeline (2-year horizontal) · Agenda (chronological list)

**Interactions:**
- Click empty day → add event at that date (editor opens)
- Click event → edit event (editor opens)
- Shift+click event → toggle selection
- Ctrl/⌘+click event → toggle selection
- Drag event chip (calendar/week) → HTML5 drag-and-drop to new day cell
- Drag timeline bar → pointer events with live preview
- Delete/Backspace → delete selected events
- Ctrl/⌘+C → copy single selected event to clipboard
- Ctrl/⌘+V → paste clipboard at current anchor date
- Escape → clear selection

**Filters:** by kind, by person, by shoot, search text. Counter shows filtered / total.

**Legend:** shows kind colors + person colors below filter row.

**Editor:** title, start date, end date, kind, repeats (daily/weekly/monthly + until), person picker (chips with signature colors), linked shoot, notes. Duplicate button + Delete button on existing events.

**Two-way sync:** dragging a shoot ghost event updates the underlying shoot's dates.

**Recurring expansion:** master event with recurrence generates virtual instances rendered across 2026-2027. Instances marked with `⟲` icon. Click instance opens master with warning.

## Files touched in v0.3-v0.5

### Modified (7)
- `src/types.ts` — added CalendarEvent, RecurrenceRule, colorHint on TalentFour + Shoot, extended CalendarEvent
- `src/lib/seed.ts` — added SEED_CALENDAR_EVENTS (empty), shoot colorHint values, four colorHint values
- `src/lib/storage.ts` — added calendarEvents migration
- `src/state/reducer.ts` — added ADD/UPDATE/DELETE_CALENDAR_EVENT actions
- `src/i18n/en.ts` + `src/i18n/hr.ts` — added ~60 schedule.* keys (calendar, week, timeline, agenda, filters, recurrence, clipboard, hints)
- `src/components/views/ScheduleView.tsx` — full rewrite, ~1000 lines: 4 view modes + drag + filters + selection + clipboard + recurrence expansion + enhanced editor

## Cloud sync design (deferred to next session)

User confirmed wants "Firebase or Supabase real multi-user". Deferred because it needs its own dedicated session for:
- Platform choice (Supabase vs Firebase pros/cons)
- Auth model (Google login? Magic link? Password?)
- Permissions model (who can edit what — talent can edit own threads? 2023 chapter locked?)
- Realtime listener strategy (which entities are hot?)
- Offline queue + conflict resolution (last-write-wins vs field-level merge?)
- Migration path from current local state → cloud
- Cost model (free tier for 4-6 users)

Realistic scope: 3-5 focused sessions.

## Backlog for post-compact

Immediate (next session or two):
1. **Cloud sync** — the big one, user asked for it
2. **Interviews editable** — proper session capture editor (video/audio/transcript/tag-by-thread)
3. **Shoot bible print A4** — for handing to team on paper
4. **Undo/redo UI in Sidebar footer** — history reducer already supports it

Medium (few sessions):
5. **Copy multiple** — bulk clipboard
6. **Drag multiple** — bulk reschedule (drag one selected event moves all)
7. **Time-of-day** on events (09:00–11:00) + hour grid in Week view
8. **Right-click context menu** on events (duplicate, delete, open shoot)
9. **Print A4 layouts** for calendar/agenda/spine cards
10. **CommandPalette fuzzy search** with fuse.js (installed)

Longer arc:
11. **Sicily Days 3+** — fill in from Tomo's memory (was left open)
12. **Real interview capture** during Lastovo (August 2026 — coming)
13. **Physiology capture at Rijeka lab** (Vito's data → the score-as-body swing)
14. **Talent releases** with per-scene consent tracking (2023 chapter special needs)
15. **Vercel deploy + shared URL** (before cloud sync — makes shared-laptop workflow easier)

## Notes for post-compact session

- **Everything works on `http://localhost:5178/`** (or whichever port Vite chose that day)
- Skip splash: `?nosplash=1`
- **Schedule module is the most-touched surface** — user has been iterating on it heavily
- **Cloud sync is the elephant** — don't just start it; plan it first
- **User's mode** is "keep building, ask when ambiguous" — the AskUserQuestion 4-question ABCD format works well for him
- **HR is his primary language** but he writes English easily too. The doc is going international (Sundance/Berlinale target).
- **Sicily happened for real July 2026** and Etna erupted — this is the film opening, treated as `achieved` swing #4
- **The Four are locked** — Petar, Vito, Sanda, Zsófia · no adding/removing
- **The 7 shoots are locked** — Krk (done) · Sicily (done + Etna miracle) · Lastovo · Cyprus · Rijeka/Zagreb · USA (Vegas→SF RV) · Coda (bioluminescent night dive TBD)
- **2023 Chapter** is ordinary thread, no special gates — user was clear on this

— end checkpoint · 2026-07-11 · Deep Dive V1.1 v0.5 · ready for compact
