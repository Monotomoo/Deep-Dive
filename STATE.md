# Deep Dive · V1.1 — session checkpoint (v0.2)

> A feature documentary + 3-episode series about four of the best freedivers alive:
> **Petar Klovar · Vitomir Maričić · Sanda Delija · Zsófia Törőcsik**
> Not a film about depth. A film about who waits for you at the surface.
> *"One person holds another in the world."*

## Quick orientation

- **Project folder:** `D:/CLAUDE PROJECTS/Deep Dive V1.1/`
- **Dev server:** `npm run dev` → `http://localhost:5173/` (or next available 5174/5175) · skip splash `?nosplash=1`
- **Build:** TypeScript clean · 337 KB / 94 KB gzipped
- **Origin:** forked from Ribanje V1.1 scaffold · 2026-07-11 (v0.1) → 2026-07-11 (v0.2)

## v0.2 changes (this session, second round)

### Data corrections applied
- **Sanda Delija hometown → Trieste** (not Rijeka)
- **Borna removed** from Talents (empty for now)
- **Sicily location → Catania** (kraj Etne, not Santa Tecla)
- **Sicily days simplified:** Day 1 = landed + met everybody; Day 2 = training. Days 3+ open for user to fill in as memory returns.
- **Crew added:** Toni (Camera Operator), Christian (Camera Operator)
- **Risks emptied** — user will add as they emerge
- **USA shoot expanded** into full-blown road-trip bible: Vegas → SF via Death Valley → Mammoth Lakes → Yosemite in a 6-person RV. Off-water counterpoint to underwater sequences. Could become the coda.

### New modules
- **Camera Team** module — 4 entity types (Camera, Lens, Microphone, Light) with brand/model/ownership/operator/shoot-assignments. Placeholder-seeded with realistic freediving doc kit: Sony FX3 ×2 + a7S III + Canon C70, Nauticam UW housing, DJI Mavic 3 Pro, Cooke 32mm cine, Sennheiser + DPA + Aquarian hydrophone, Aputure + Nanlite + Kraken UW lights. Three views: All Inventory · Per-operator Kit Bags · Per-shoot Loadout.
- **Spine → Ideas Workshop** — the 5 locked questions are gone. Replaced with 4-column kanban (idea / discussing / leading / dropped) with add/vote/cycle/delete. Empty seeded with the anchor "One person holds another in the world" as `leading`.

### Enriched content
- **Bigger Swings** — added 5 new fields per swing: `whyItMatters` · `narrative` · `visualNote` · `soundNote` · `dependencies`. All 10 swings expanded with real narrative from the Film Bible / Interview Architecture. Etna swing (#4) documents the actual eruption. Each swing now reads like a proper scene brief.
- **Overview** — countdown to next shoot · achieved-swings hero banner · full-6-tile stat row · the four with per-person arc-notes · shoots journey list · 10 threads at-a-glance · recent activity feed
- **Vision** — added 6 new sections: 2-column above/below grammar visualization · four-arcs panel · how-the-film-speaks (4 devices) · the shape (3-episode structure) · 10-threads at-a-glance · where-this-is-going

### Editable everywhere
- **Shoots** — inline click-to-edit for spirit + captures (add/delete individual lines) + bible (longform markdown) + days (add/edit/delete/toggle done). Every field is now click-to-write.
- **Days system** — user can add/remove/reorder days per shoot. Editable date + plan + done-toggle inline.

## Sidebar IA — 25 views in 4 groups (added Camera Team)

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
                    Camera Team ⭐ new
```

## Planned for next turn(s) — user asked for these too, but they need separate architecture

### Schedule — calendar + timeline toggle (user picked "Both")

Custom implementation, no library. Two views sharing one state:
1. **Month grid** — full calendar visual, weekly rows, click-a-day to add event, drag events between days, color-coded per shoot/person
2. **Horizontal timeline** — Gantt-ish view of all shoots + milestones across 2026-2027, drag-to-reschedule
3. **Toggle** in header — persist choice in state
4. New entities: `CalendarEvent` (id, date, endDate?, title, kind, colorHint, shootId?, personKey?, notes)
5. Reducer actions + storage migration
6. ~1 full session of dedicated work

### Cloud sync (Supabase or Firebase) — user picked "Cloud sync real multi-user"

Big architectural decision. Everything the app does needs to work in a cloud-backed multi-user world.

**Design decisions to make first:**
- Supabase (Postgres, self-hostable, generous free tier) or Firebase (Google managed)?
- Auth model — Google login? Email/password? Magic links?
- Who has edit rights on which entities? Owner-only, or team-wide?
- Offline queue — how do we merge edits when someone was offline?
- Conflict resolution — last-write-wins? Field-level merge?
- Real-time listeners on which entities? (Interviews yes, references maybe no.)
- Cost model — free tier probably enough for 4-6 users

**Implementation phases:**
1. Choose backend + set up project
2. Auth (Google / magic link)
3. Sync layer — replace localStorage with Supabase/Firestore
4. Real-time listeners on hot entities
5. Migration path — export current local state, import to cloud
6. Offline queue with local caching
7. Multi-device testing with 4 team members

Realistic scope: 3-5 focused sessions. Cannot be done incidentally.

### Interviews editable
Basic display exists; full inline editing (add new session · edit transcript · tag threads · link spine ideas) is a proper editor build. Comes next turn.

### Additional interesting stretches
- **Print A4 briefs** for shoots (grab and go on device)
- **Fuzzy search** in CommandPalette (fuse.js is installed, just needs implementation)
- **Undo/redo UI** in Sidebar footer (reducer supports it, needs buttons)
- **Cross-linking** — click a swing referencing a shoot, jump straight to the shoot bible
- **Talent releases** — proper contract editor with template variables

## Files touched in v0.2

### New
- `src/components/views/CameraTeamView.tsx` (5 KB)

### Rewritten
- `src/components/views/SpineView.tsx` (workshop kanban)
- `src/components/views/OverviewView.tsx` (richer 7-section dashboard)
- `src/components/views/VisionView.tsx` (7-section manifesto)
- `src/components/views/ShootsView.tsx` (inline editable, days CRUD)
- `src/components/views/SwingsView.tsx` (richer field render)

### Edited
- `src/types.ts` (added Camera/Lens/Microphone/Light + SpineIdea, extended BiggerSwing, dropped SpineQuestion/SpineAnswer)
- `src/lib/seed.ts` (data corrections + camera kit + spine ideas + swing narrative)
- `src/lib/storage.ts` (migration for new entities)
- `src/state/reducer.ts` (12 new actions)
- `src/i18n/en.ts` + `src/i18n/hr.ts` (~30 new keys with parity)
- `src/App.tsx` (added CameraTeamView route)
- `src/components/layout/Sidebar.tsx` (added Camera Team nav)
- `src/components/layout/AppShell.tsx` (Camera Team name + subtitle)

## Notes for next session

- **Cloud sync is a first-class discussion.** Don't just start it. Plan platform choice, auth, permissions, offline queue.
- **Calendar is a solid week's work** if done at custom-SVG quality. Timeline view can share state.
- **Interviews page** is the natural next module to make editable after this.
- **Everybody edits** = we're aiming toward multi-user, but this turn we shipped rich local-first editability. Next turn we start bridging to cloud.

— end checkpoint · 2026-07-11 · Deep Dive V1.1 v0.2
