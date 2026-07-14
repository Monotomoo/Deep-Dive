# Deep Dive · V1.1 — session checkpoint (v0.16 · cloud backend · Stage A)

## Deploy note (do first tomorrow)
Beta punch-list is DONE. To ship: `vercel` (or the Vercel MCP `deploy_to_vercel`) from `D:/CLAUDE PROJECTS/Deep Dive V1.1`. `vercel.json` already has the SPA rewrite + build config. Tell viewers: open on a laptop; it's localStorage-only (each viewer starts from the seed, edits stay in their browser, "reset to seed" in the sidebar footer). Post-beta optimisation: lazy-load PhysiologyView to defer the recharts chunk (~107 KB gzip) off the initial load. **Storage key is now `deep-dive-dashboard-v10`** (seed changed in v0.13). Pushed to GitHub — `github.com/Monotomoo/Deep-Dive`, branch `main`. Vercel deploy: Tomo imports the repo in the Vercel dashboard (git-linked auto-deploy); `vercel.json` is preconfigured. Private planning docs are gitignored.

---

### v0.16 · Supabase backend — Stage A (2026-07-13)

The "make it live" step. Optional, **feature-flagged** cloud sync via Supabase.

- **Off by default.** With no `VITE_SUPABASE_*` env vars, `cloudEnabled` is false, the Supabase client is never created, and the app runs exactly as before (localStorage only). Verified in-browser: no gate, no network, identical behaviour.
- **On when configured.** Set two env vars (see `SUPABASE.md`) → passwordless magic-link **sign-in gate** → the whole AppState is stored as one JSON doc per user (`deep_dive_projects`, RLS-protected), pulled on sign-in (`HYDRATE`) and **debounced-synced** on every change. Sidebar footer shows signed-in email + sync status + sign-out.
- Files: `src/lib/cloud.ts` (client + auth + doc load/save — all inert when off), `src/components/auth/SignIn.tsx`, cloud wiring in `src/state/AppContext.tsx` (session → hydrate → debounced push), `storage.ts` exports `migrateLoaded`. Guide `SUPABASE.md` + `.env.example` (`.env.local` gitignored).
- Cost: supabase-js adds ~60 KB gzip to the main bundle → **roadmap:** lazy-load cloud when off + code-split heavy views (Physiology/Records/Neuron); main bundle now ~236 KB gzip.
- To go live: create a Supabase project, run the one SQL block, paste URL + anon key, add the same vars in Vercel. ~5 min.

### v0.15 · connect + bug-fix pass (2026-07-13)

Pre-backend audit. Fixed the one genuinely-dead control and widened the connective tissue.

- **Fixed: the capture button was dead.** The floating mic + the advertised `⌘.` dispatched `OPEN_CAPTURE`, but nothing anywhere consumed `state.captureOpen`, and `⌘.` wasn't even bound in GlobalShortcuts. Built a real **Quick Capture** modal (`src/components/CaptureModal.tsx`): type a thought, pick a flavour, Enter → lands in the Idea Hub as a `new` idea. Bound `⌘.`. Turned the sidebar's dead **?** hint into the now-live **⌘.**. Verified end-to-end in the browser.
- **Widened ⌘K search** — the palette buildIndex now also covers Records, Festivals, Pitch decks, Pitch cards and Watcher moments (previously unsearchable).
- **Audit checks (verified):** i18n — 0 used-but-undefined keys (224 used / 499 defined); seed — 0 dangling talent (`tal-*`) or topic references. Build clean.
- Known remaining (roadmap, not bugs): main JS bundle >700 KB (needs code-splitting/lazy-load); ConnectionDrawer only mounts in 4 views; no backend yet.

### v0.14 · Pitch Deck — cards → decks → send (2026-07-13)

A new external-facing module for financing: a library of modular **pitch cards** you compose into audience-tailored **decks**, then **present** live or **export to send**. The existing internal Pitch (angle/ask/proof strategy) stays; this is the deliverable side. Build clean; browser-verified end-to-end. (Storage key later bumped to **v10** to scrub the studio name from the seed.)

- **18-card library** — each a self-contained one-pager. Ten kinds bind to LIVE workbook data so the pitch never goes stale: the Four (names/roles), Records (real standing records), Etna ("already captured" — pulls the Sicily moment), Formal ambition (the Bigger Swings), Team (crew), Comparables (the reference films), Budget (real numbers from the active scenario), Festivals, Status (shoots done vs planned), Contact (Tomo). The rest (cover, logline, thesis, why-now, the shape, access, the offer ×2) are editable copy. Add / edit / delete + per-card accent.
- **4 starter decks**, each an ordered, audience-tuned selection: **Sponsor** (8), **Co-production** (11), **Public fund · HAVC/EU** (10), **Broadcaster** (8). Editable name / audience / recipient / cover-note; add-remove cards (suited cards marked ★), reorder.
- **Present** — fullscreen, one card at a time, ← → / space / esc — for pitching live on a screen-share.
- **Export / Send** — a print-preview overlay → **Print / Save PDF** (one card per A4 page, print-isolated so only the deck prints) + **Copy as text** (a markdown draft with live data folded in, for the email body). Actual sending stays the user's action.
- Data: `PitchCard` + `PitchDeck` types, reducer CRUD (deleting a card also unlinks it from every deck). Nav: **Pitch Deck** in the Tell group, beside the strategy Pitch.

### v0.13 · beta revisions — client-feedback pass (2026-07-13)

A review round from Tomo. Storage bumped **v7 → v8** (seed changed). Build clean (tsc + vite, ~657 KB / 169 KB gzip). Browser-verified end-to-end.

- **Idea Hub reworked** — the 10 production ideas now live in the **Idea Hub** (the team's idea board), replacing the old 8, each with a detailed body + links to the real shoots/threads/events: Krk→Sicily→Lastovo interview through-line · Lastovo camp & the sport · Rijeka labs · Njivice origin (Pero) · Sea Shepherds · USA Hall of Fame · deep Rijeka interviews · Mexico caves · Vito's deepest dive · Body & brain. The **Topics** stay as the original 11 interview themes (bond, fear, record, deep, 2023, body, friendship, outsider, recognition, long-vs-deep, surface) — no duplication. *(First pass mistakenly put these as Topics; corrected here.)*
- **Neuron — click fixed + Dashboard mode.** Nodes now stay selected on click (the deselect handler moved off the `<svg>` onto the backdrop `<rect>`, so a node click no longer bubbles up and clears itself). New 4th **Dashboard** mode: an editable/addable table of everything the graph is built from — The Four, Holders, Threads, Shoots, Swings, Ideas — wired to the real reducer CRUD (edit any field, add, delete).
- **Cast · Story — supporting cast held back.** `SEED_TALENTS` emptied (Ante, Eszter, Dr. Novak, Luka, Marco return once each real person says yes). The Four carry it for now.
- **Surface — trimmed to script-grounded holders only** (dropped invented objects/songs/rituals — the father's watch, the Chengdu song, the triathlon bike, etc.). 33 → 17.
- **Records — Vito goes deep too.** Added real depth: **FIM 123 m · CWT 117 m** (world no. 3 all-time; researched via freedivingranking + press). He's no longer only "long, not deep."
- **Crew — Director title removed** from Tomislav Kovačić → "Producer"; dropped the `director` clause in the Camera Team filter.
- **Essence tab removed** entirely — route, sidebar, palette, AppShell, ViewKey; `EssenceView.tsx` deleted. Sidebar Library is now 2 views (References · 2023 Chapter).
- **Intro splash** rewritten to a ~2 s simple fade (title + epigraph on deep water), auto-enters, no click required.
- **2023 Chapter — draft/unverified banner** added at the top (real people, sensitive case; flagged as a draft composed for the start, needs checking before use).
- **"documentary miracle · achieved"** highlight normalized to a calm "already captured."
- **Mobile nav** — on phone/tablet (<lg) the oversized duplicate page-title header is hidden; a horizontal, scrollable, **clickable tab strip of all 27 views** replaces it (active tab underlined in brass + auto-centred on change), so navigation matches the sidebar. No horizontal page overflow. Desktop keeps the big `PageHeader`. `NAV_VIEW_ORDER` exported from `Sidebar` and reused so the strip stays in sync with the menu.



> A feature documentary + 3-episode series about four of the best freedivers alive:
> **Petar Klovar · Vitomir Maričić · Sanda Delija · Zsófia Törőcsik**
> Not a film about depth. A film about who waits for you at the surface.
> *"One person holds another in the world."*

## Quick orientation

- **Project folder:** `D:/CLAUDE PROJECTS/Deep Dive V1.1/`
- **Dev server:** `npm run dev` → `http://localhost:5173+/` (auto-fallback if in use) · skip splash `?nosplash=1`
- **Build:** TypeScript clean · 477 KB / 128 KB gzipped
- **Origin:** forked from Ribanje V1.1 scaffold · 2026-07-11
- **Sidebar IA:** 31 views · Plan (7) · Make (15) · Tell (5) · Library (3) *(+6 in v0.6)*
- **Repo:** local `.git` · v0.1 init + v0.2 + v0.3-v0.5 · v0.6 six-modes turn ready for commit

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

### v0.12 · Beta punch-list — no dead ends + 3 creative swings (2026-07-13)

Hard audit of all 33 views (line counts + editability + seed). Found the app was ~80% showpiece, ~20% scaffold stubs. Fixed every soft spot for the beta.

- **No more dead ends.** Hid 5 premature/producer-only modules from the sidebar + palette (kept routes): **Sponsors, Risks, Distribution, Contracts, Post-production** (Sponsors is covered by Pitch's tab, Post by the Schedule's post lane, the rest are pre-shoot). Seeded the two conceptual pillars that were blank: **Watchers** (6 moments — the other three at the surface, Sicily + Krk + Lastovo, captured/planned) and **Physiology** (3 datasets).
- **Swing 1 · The Four → cinematic dossier.** Rebuilt FourView: pick one of the four and their whole story assembles *in their colour*, pulled live from every module — records, who holds them (Surface), their own words (Choir key answers + interview quotes), their life (Life Mosaic timeline), the threads they carry, and their watcher moments. The payoff of all the connective plumbing; when each of the four opens their own page it's the emotional hook.
- **Swing 2 · Records → ocean-depth chart.** Bespoke SVG: an ocean that darkens with depth, each of the four dropping from the surface to their number (Petar −103/−135, Sanda −98/−103 former, Zsófia −105), Vito's "goes long, not deep" at the surface. Below it a "long & wide" panel (29:03, 107m walk, 300m DYN) + the full table.
- **Swing 3 · Physiology → the score.** Seeded real bradycardia curves (Vito's heart to 24 bpm across the 29:03, blood-oxygen defence, Petar's descent) and charted them with recharts as the film's would-be score. "The score is their own bodies" made literal.
- **Beta polish.** Favicon (coral droplet on deep blue) + share-preview meta + a proper page title. One-time **"for the four, and the crew" welcome** on the Overview with a "begin with the one line" button (→ Essence) and a ⌘K hint.
- storage → **v7**. Build: TS clean · 660 KB main / 170 KB gzip + recharts 387 KB / 107 KB gzip (separate chunk) · zero console errors · every showpiece browser-verified. Sidebar now 28 focused views.

### v0.11 · Beta prep — day-by-day trip, serious schedule, global ⌘K search (2026-07-13)

Final push before the beta goes to the four + crew.

- **USA trip · day by day** — `TripDay[]` on UsaTrip. Seeded a full **27-day itinerary** (Sep 1–27) that now includes the **last 3 days of Burning Man** (Black Rock Desert, Sep 5–7 — the Man + Temple burn, "fire in the desert, echoes Etna"), then the Sierra + desert loop. Added a **Black Rock Desert stop** (6 stops total) to the map with its own POIs; the route now spikes north to the playa then drops south. Each day is an editable card (date, title, plan, based-at stop, drive miles) with add/edit/delete.
- **Serious production Schedule** — `SEED_CALENDAR_EVENTS` went from empty to **17 events** across 6 lanes (shoot / milestone / meeting / travel / delivery / other): development + financing, HAVC pitch, sponsor meetings, the **USA road-trip bar (Sep 1–27)**, **Burning Man (Sep 5–7)** and a **parallel 5-day second-unit Sicily pickup shoot (Sep 10–14)** running while the main unit is in the USA, post-production blocks (assembly→rough cut, sound+colour), picture lock, festival deadlines (Visions/Hot Docs/IDFA/Sundance), and feature + series delivery. The timeline now reads like a real production calendar with visible parallel September strands.
- **Global ⌘K search** (super upgrade — the palette was dead code) — rebuilt with **fuse.js** into a fuzzy search across **every entity**: views, the four, cast, shoots, threads, topics, story events, ideas, interviews, swings, spine ideas, references, holders, USA-trip stops, crew. Arrow-key nav, Enter to jump to wherever it lives. Mounted in App + wired to ⌘K (works even inside inputs). This is the connective spine tying all modules together.
- **Connections drawer → Shoots** — each shoot's expanded card has a "See all connections" button opening the shared drawer (interviews, events, present four, ideas). Drawer now lives in Cast, Idea Hub, Interviews, and Shoots.
- storage → **v6**. Build: TS clean · 641 KB / 165 KB gzip (fuse.js split to its own 27 KB chunk) · zero console errors · all flows browser-verified.
- **Beta-ready.** Uncommitted across v0.7–v0.11. Not yet deployed — offer Vercel for a shareable URL.

### v0.10 · USA trip map + Overview home base (2026-07-12)

- **USA trip map** — the trip view now leads with a stylised SVG map of California/Nevada: Pacific coast, CA/NV border, Sierra peak hints, an **animated dashed route** through all stops, labelled pins (fly-in / nights / fly-out) + a "✈ Cyprus" arrow off the east edge. Click a pin/chip → the detail panel shows that stop's **things to do**. Fully editable (pins carry mapX/mapY 0–100).
- **Points of interest** — `TripStop.pois[]` (kind: climb/dive/hike/sight/food/camp/drive/other, each with detail + note + on-the-way flag). 27 seeded: **Yosemite climbs for Vito** (El Capitan · The Nose, Half Dome cables, Tuolumne domes, Swan Slab) + Merced River swim; **Mammoth dive lakes** (Convict Lake ~43m altitude dive, Lake Mary, Horseshoe, June Loop, Crowley columns, Hot Creek); **Death Valley** (Badwater −86m, Zabriskie, Dante's View, dunes, Artist's Palette, Alabama Hills on the way); SF (Golden Gate, Aquatic Park cold swim, Muir Woods) + Vegas (Red Rock climbing, Rhyolite ghost town). POIs edited inline in the stop editor.
- **RV cost → $4000** (single whole-trip line). New estimate **$24,125** total ($4,021 pp).
- **Overview = home base** — added a **jump-to grid** (10 module shortcuts via SET_VIEW) and a **"shoot plan · by location" board**: every shoot is a card with status + present-four dots + dates + its planned days, and a **quick-add "plan a day" input** that dispatches ADD_SHOOT_DAY (verified: added a Krk day live). The USA card lists trip stops + links straight to the RV trip. Pulse tiles refreshed (hot ideas, planned interviews). The four + threads are now click-through to Cast/Threads.
- storage → **v5** (USA-trip blob gained POIs + map coords). Build: TS clean · 621 KB / 160 KB gzip · zero console errors.

### v0.9 · Connections + USA Trip + English-only (2026-07-12)

User asked for: connection dashboards on click, an innovative Idea Hub dashboard, a USA trip tab with RV costs, English-only (+ stop speaking Croatian in chat), a prettier Schedule timeline, thread creation, camera roles (no DoPs), remove Meru + Fire of Love, remove Sanda's mother, drop the Sanda/Zsófia "battle" with stronger standalone intros.

- **App is English-only.** `hr.ts` emptied to `Partial<Strings>` (every lookup falls back to en — en.ts is now the SOLE source, never touch hr again). DICTS retyped. Locale toggle removed from Sidebar. storage forces `locale: 'en'`.
- **Connections drawer** (`src/components/ConnectionDrawer.tsx` + `src/lib/connections.ts`) — the connective backbone. `getConnections(state, ref)` resolves any entity (four / talent / event / topic / idea / interview / shoot / thread) into grouped links. Click any card in **Cast**, **Idea Hub**, or **Interviews** → right-side drawer showing everything connected (people, topics, places, events, ideas, interviews, threads), each clickable to **re-focus the drawer (browse the graph)**, plus Open-view + Edit. Verified: Petar → 22 connections; drawer graph-browsing works (person → topic → person).
- **Idea Hub · Map mode** — Board/Map toggle. Map is an SVG constellation: every linked entity is an anchor on the ring, every idea floats at the centroid of what it connects to (golden-angle de-clustering), coloured by status, sized by votes, unwired ideas drift bottom-left. Hover labels, click → drawer. Verified: 14 anchors + 8 idea nodes + 17 links.
- **USA Trip tab** (Make, after Shoots) — `UsaTrip` entity (stops + cost lines + meta). Route ribbon SF → Yosemite → Mammoth Lakes → Death Valley → Las Vegas → **fly Cyprus** card. Sept 1–27 2026, 6 people, 6-berth Class C RV. Live **RV budget**: 10 cost lines with per-trip/day/night/person multipliers → estimated total, per-person, per-day, category bars. Verified total **$27,795** (27 days, 15 nights, 6 pax). Everything editable (stops, costs, trip settings). Existing shoot-usa dates updated to Sept + SF→Vegas direction.
- **Schedule timeline redesigned** — fixed left LANES rail (labels stay put while scrolling), coral year headers + month columns, alternating month bands + grid lines, taller gradient rounded bars with shoot-colour borders + person dots, pill-style today marker. pxPerDay 3→4.6.
- **Threads · create** — New-thread button + full editor (num / title / subtitle / owner / status / synopsis), click-to-edit, delete. Title dropped from "The 10 Threads" → "Threads".
- **Camera roles** — no DoPs: **Kristijan Dimitrijević = Camera 1** (A7 IV #1, lead), **Toni Batić = Camera 2** (A7 IV #2). Lens operators reassigned to match.
- **References** — removed Meru + Fire of Love (4 remain: Free Solo, The Deepest Breath, The Alpinist, CMAS paper).
- **Sanda's mother (Mira Delija) removed** everywhere — talent, holder, Lastovo interview.
- **Sanda + Zsófia** — rewritten strong standalone intros (Sanda: first Croatian woman past 100m, 103m Mabini, 12 national records; Zsófia: triathlete → 105m + first woman past 300m Chengdu). **"Battle" dropped**: `top-overtaken` → `top-friendship`, `ev-pass` → `ev-zsofia-105`, thread 5 reframed "Two at the deep end / the friendship almost no one else can share", its questions + swing sw-10 + rivalry holders all softened to shared-depth friendship.
- storage → **v4**. @types/node added (vite reads PORT). Build: TS clean · 605 KB / 156 KB gzip · zero console errors · all flows browser-verified. Sidebar now 35 views.

### v0.8 · Story graph — Idea Hub + Cast·Story + Interview chains (2026-07-12)

User: "Idea Hub where anyone creates an idea that connects to something. Dashboard of all documentary people — bio + why — in 3 segments: Person / Event / Topic, all connected, then connected to interviews. Interviews grouped by location for follow-ups."

- **Idea Hub** (Plan, after Vision) — team's open inbox. Quick-add bar (Enter → new idea) + full editor. Each idea: kind (scene/shot/question/sound/story/logistics/wild), status lifecycle (new→warm→hot→adopted→parked, click-to-cycle on card), author from crew, votes, and **IdeaLink[] to anything**: one of the four, cast member, story event, topic, shoot, thread, swing, interview. Link builder in editor (type select → entity select). 8 seed ideas from Tomo/Toni/Kristijan/Zsófia with 18 live link chips.
- **Cast · Story** (Make, first) — the documentary dashboard in 3 segments with counts:
  - **People**: The Four (bio + arcNote as "why in film" + event/interview counts) + the rest of the cast — 6 seeded: Ante Klovar (Petar's father-fisherman), Mira Delija (Sanda's mother), Eszter Törőcsik (sister), Dr. Ivana Novak (Rijeka hyperbaric), Luka Perić (lead safety), Marco Ferri (AIDA judge). Each with bio + whyInFilm + release status. Full CRUD.
  - **Events**: 14 seeded story moments 2016→2027 (Trubridge's wall, 107m walk, Malta, the storm, both 103s, 29:03, Chengdu, the record passing, Etna, Hall of Fame) — each with kind, people chips, topic chips, shoot link, interview count. Full CRUD with toggle-chip multi-selects.
  - **Topics**: 11 seeded themes each with the question underneath ("Who holds you in the world?") + thread mapping + event/interview counts. Full CRUD.
- **Interviews rebuilt** — grouped by location (shoot sections with color, location, date range, per-section add). Cards show subject (four color / talent / together), setting, status, thread/topic/event chips, standout quote. **Follow-up chains**: followUpOfId wires sessions across locations; cards show "↩ follow-up of X @ Krk" and "↳ follow-ups: Lastovo". **Follow-up button** creates a planned session carrying subject+topics+threads and auto-advances the shoot to the NEXT planned location (verified: Krk parent → Lastovo prefilled). 10 seeded interviews: 4 Krk transcribed (with quotes), 2 Sicily captured (volcano interview), 4 Lastovo planned incl. two chained follow-ups + the four-together 2023 session + Mira (cast interview via personKey 'other' + talentIds).
- Interview type extended: talentIds, topicIds, eventIds, followUpOfId + personKey 'other'.
- STORAGE_KEY → v3. @types/node added (vite configs read PORT env for the preview harness; both projects' launch.json got autoPort after a port-collision incident).
- Build: TS clean · 579 KB / 152 KB gzip · zero console errors · all flows browser-verified.

### v0.7 · Neuron fix + real-data pass (2026-07-12)

User feedback: "Neuron is fucked up" (nodes collapsed into a centre blob) + wants real team, real kit, researched bios, richer Spine/Surface, restructured Pitch.

- **Neuron fixed + 3 modes** — repulsion was ~200× too weak vs centering, everything collapsed. New physics (F=K/d² with K=42000, per-link ideal distances, soft anchors for the Four, collision de-overlap, frame clamp). Verified spread: 76 nodes across 1140×740. Three modes now: **Web** (live sim) · **Orbits** (concentric rings around the thesis line, curved edge bundling, the readable poster) · **Constellation** (each of the Four as a night sky of holders + threads, star field, dashed constellation lines). Click node → connections panel → "Open view" jumps to that entity's module.
- **Crew = whole team (7)** — Tomislav Kovačić (director·producer), Toni Batić (DoP·A-cam), Kristijan Dimitrijević (B-cam), + the Four as talent roles (safety consultant / scientific advisor / story consultant / international voice).
- **Camera Team reset to real kit** — 2× Sony A7 IV (Toni #1, Kristijan #2), 4 Sony E lenses (24-70 GM II, 16-35 GM, 85 f/1.4, 70-200 coming), Røde NTG5 boom + Wireless GO II lav set. Lights empty per team decision.
- **Life Mosaic researched + rebuilt** — real dates via web search: Petar CNF 103m Sharm 5/2025 (ends Trubridge's 17-year reign) + FIM 135m; Vito b.1985, Adriatic at 3, Guinness 107m underwater walk 2021, Guinness 29:03 O₂ static Opatija 14.6.2025, heads AIDA Croatia; Sanda FIM 98m Sharm 5/2023 → FIM 103m Mabini 4.5.2025 (<10 women past 100m, 12 national records); Zsófia decade of triathlon, Malta 10/2022 pivot, DYNB 259m, DYN 280m, 300m World Games Chengdu 8/2025 gold, FIM 105m 20.4.2026. 42 events, month precision. **View rewritten as SVG**: lane washes per subject, lollipop stems with 3-row collision dodging, always-labels for sig≥4, native tooltips, subject + category filter chips, auto-scroll to the dense decade, **convergence bands** marking years where 2+ lives rhyme (10 bands).
- **Records seed corrected to real data** — 9 records incl. both Guinness entries and Sanda's 98→103 arc broken by Zsófia's 105.
- **Surface +13 holders** (34 total) — Petar's father/monofin/pre-dawn drive; Vito's students/Opatija pool/whiteboard; Sanda's mother/Mabini/Trieste espresso; Zsófia's bike/Malta/Chengdu song/grandmother.
- **Spine +10 ideas** (11 total, all 4 kanban columns) — open-on-fire-end-in-dark, no-narrator-no-experts (leading); depth chapters, returning-question matrix, cut-on-the-breath (discussing); Zsófia VO, 2023 present tense, camera-never-below-diver, surface interview (idea); celebrity narrator (dropped).
- **Pitch restructured — 4 audiences** — Sponsors / HAVC / Festivals / People & partners tabs, each with Angle · Ask · Proof columns + targets. Festivals table: Sarajevo REMOVED, now 12 targets (Sundance, Berlinale, IDFA, CPH:DOX, Hot Docs, Tribeca, Visions du Réel, Sheffield, SXSW, DOK Leipzig, Thessaloniki, ZagrebDox-after-international). Contacts tab lists real institutions: Uni Rijeka, AIDA Croatia, Guinness, Molchanovs (Zsófia's brand), Acrisure (Sanda's sponsor), CMAS.
- **STORAGE_KEY bumped → deep-dive-dashboard-v2** so the reseeded data loads (old stored arrays would mask it). Old edits under v1 remain in localStorage but unused.

### v0.6 · Soul + Perception modes — six new "godlike" surfaces (2026-07-11)

The user asked for many more godlike modes; picked Week 1 (soul first) + Week 3 (perception). Six new views built in one session.

**Soul-first cluster (Week 1):**
- **Surface / Površina** (Make top) — 4-column atlas of who holds each subject: person / place / object / ritual / song. 21 seed holders (5-6 per Four). Kind filter. Consent tracking + on-camera willingness. Full CRUD. The film's thesis made literal.
- **Essence / Bit** (Library top) — Full-screen minimalist rotator over the film's soul. Composes from tagline + log-line + thesis + Bigger Swing whyItMatters + starred Choir key-lines + Thread synopses = ~29 rotating lines. Space pause, ← → nav, Esc exit, click to pause. Slow crossfade with framer-motion + radial ambient pulse.
- **Choir / Zbor** (Make, near Interviews) — Same question × four voices side-by-side. 6 seed questions, ~16 imagined answers marked as such. Source badges (interview / imagined / quoted / observed). Mark any answer as "key" to promote it into Essence. Full CRUD.

**Perception cluster (Week 3):**
- **Neuron / Neuron** (Plan, between Vision and Schedule) — Custom SVG force-directed graph of every core entity: The Four + Holders + Shoots + Threads + Swings + Spine Ideas. 53 nodes, 87 links. Live physics (rAF-driven, ~180ms warmup). Filter by node type. Drag to reposition. Click to highlight neighbours. No d3-force dependency — 200-line custom charge/link/centering simulation. Reveals hidden clusters.
- **Life Mosaic / Mozaik života** (Make, near The Four) — Four horizontal biographical lanes, 1985 → 2028. 34 seed events across the four (Petar 1994 born → 2025 world record; Vito 1988 → Guinness 29min; Sanda 1989 → 2020 first Croatian woman past 100m; Zsófia 1993 triathlete → 2025 105m FIM). Category-colored dots sized by significance. Full CRUD.
- **Resonance / Rezonanca** (Make, after Devices) — Motif chains of image echoes. 4 seed chains × 3-4 items each ("hair through water", "hand on shoulder", "held breath in silhouette", "sun through blue water"). Kind filter (visual / aural / gestural / situational / chromatic). Chain expand/collapse. Full CRUD on chains + items.

**Also this turn:**
- Fixed pre-existing `AnimatePresence mode="wait"` freeze bug — removed the wait-mode wrapper, kept the enter transition. Navigation between views now instant + smooth.
- All new views have full i18n parity (EN + HR); ~90 new keys per locale.
- Reducer +18 new action types (ADD/UPDATE/DELETE × 6 entities incl. nested motif items).
- Storage migration for all 5 new arrays; 34 seed events, 21 holders, 6 questions, 16 answers, 4 chains preserved on RESET_TO_SEED.

### v0.5 · Week + recurring + multi-select + copy/paste + shoot borders (before compact)
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

## Sidebar IA — 31 views in 4 groups (v0.6)

```
PLAN                MAKE                    TELL              LIBRARY
Overview            Surface  ★NEW           Pitch             Essence ★NEW
Vision              The Four                Distribution      References
Neuron  ★NEW        Life Mosaic  ★NEW       Contracts         The 2023 Chapter
Schedule            Threads                 Journal
Crew                Spine (Workshop)        Post-production
Sponsors            Shoots
Risks               Interviews
                    Choir  ★NEW
                    Bigger Swings
                    Devices
                    Resonance  ★NEW
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
