/* Deep Dive · 2026 — seed data
   All entities derived from The Film Bible, Interview Architecture,
   Sicily Shooting Bible, and The 2023 Chapter working paper. */

import type {
  AppState,
  BiggerSwing,
  Broadcaster,
  CalendarEvent,
  Camera,
  CashflowQuarter,
  ChoirEntry,
  ChoirQuestion,
  Contract,
  CoverageCam,
  CostCategoryMeta,
  CrewMember,
  DivingRecord,
  Evidence2023,
  FestivalSubmission,
  FundingSourceMeta,
  GrammarDevice,
  Holder,
  HubIdea,
  Interview,
  JournalEntry,
  Lens,
  LifeEvent,
  Light,
  Microphone,
  Milestone,
  MotifChain,
  PhysiologyDatum,
  PitchCard,
  PitchDeck,
  Reference,
  Risk,
  SalesAgent,
  ScenarioData,
  ScenarioKey,
  Shoot,
  ShootDay,
  Sponsor,
  SchedulePhase,
  SpineIdea,
  StoryEvent,
  Talent,
  TalentFour,
  Thread,
  ThreadQuestion,
  Topic,
  UsaTrip,
  WatcherMoment,
} from '../types';

/* ---------- Scenarios (lean · realistic · ambitious) ---------- */

export const FUNDING_SOURCES: FundingSourceMeta[] = [
  { key: 'havc',   label: 'HAVC',        color: '#4C7A8A', isStateAid: true,  tag: 'state' },
  { key: 'hrt',    label: 'HRT',         color: '#7A5C4A', isStateAid: true,  tag: 'state' },
  { key: 'eu',     label: 'EU MEDIA',    color: '#8FA57E', isStateAid: true,  tag: 'state' },
  { key: 'nfi',    label: 'Nordisk',     color: '#5B7DA1', isStateAid: false, tag: 'private' },
  { key: 'sports', label: 'Sports/foundations', color: '#C88A5A', isStateAid: false, tag: 'private' },
  { key: 'sponsors', label: 'Sponsors',  color: '#9E7A63', isStateAid: false, tag: 'private' },
  { key: 'rebate', label: 'Rebate',      color: '#6B8AA1', isStateAid: false, isCalculated: true, tag: 'private' },
];

export const COST_CATEGORIES: CostCategoryMeta[] = [
  { key: 'dev',   label: 'Development' },
  { key: 'prod',  label: 'Production (shoots)' },
  { key: 'post',  label: 'Post-production' },
  { key: 'sound', label: 'Sound design + mix' },
  { key: 'legal', label: 'Legal + rights' },
  { key: 'travel',label: 'Travel + accommodation' },
  { key: 'safety',label: 'Safety + insurance' },
  { key: 'mkt',   label: 'Marketing + festivals' },
  { key: 'gna',   label: 'G&A' },
];

const emptyCashflow: CashflowQuarter[] = [
  { quarter: '2026-Q1', inflows: {}, outflow: 0 },
  { quarter: '2026-Q2', inflows: {}, outflow: 0 },
  { quarter: '2026-Q3', inflows: {}, outflow: 0 },
  { quarter: '2026-Q4', inflows: {}, outflow: 0 },
  { quarter: '2027-Q1', inflows: {}, outflow: 0 },
  { quarter: '2027-Q2', inflows: {}, outflow: 0 },
];

export const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  /* HAVC fixed at €30k across every scenario — a state grant is one committed
     number, not a figure that scales with ambition. 30 is below even the old
     lean target (40), so it widens the funding gap in all three plans. */
  lean:       { episodes: 3, funding: { havc: 30, hrt: 30, eu: 60, sponsors: 40, sports: 20, rebate: 20 }, costs: { dev: 20, prod: 90, post: 60, sound: 30, legal: 15, travel: 40, safety: 15, mkt: 20, gna: 10 }, cashflow: emptyCashflow, qualifyingSpendPct: 55, blendedRebateRate: 25 },
  realistic:  { episodes: 3, funding: { havc: 30, hrt: 50, eu: 100, sponsors: 80, sports: 40, rebate: 40 }, costs: { dev: 30, prod: 140, post: 90, sound: 50, legal: 25, travel: 60, safety: 25, mkt: 40, gna: 20 }, cashflow: emptyCashflow, qualifyingSpendPct: 60, blendedRebateRate: 25 },
  ambitious:  { episodes: 3, funding: { havc: 30, hrt: 70, eu: 140, sponsors: 120, sports: 60, rebate: 60 }, costs: { dev: 40, prod: 200, post: 140, sound: 80, legal: 40, travel: 90, safety: 40, mkt: 80, gna: 30 }, cashflow: emptyCashflow, qualifyingSpendPct: 65, blendedRebateRate: 25 },
};

/* ---------- The Four ---------- */

export const SEED_FOUR: TalentFour[] = [
  {
    id: 'four-petar',
    key: 'petar',
    name: 'Petar Klovar',
    role: 'the gravity',
    nationality: 'Croatian',
    hometown: 'Rijeka',
    languagePrimary: 'hr',
    epithet: "the one everyone watches · finds peace in the place of death",
    bio: "Broke a 17-year no-fins record. Holds the men's free-immersion world record. Came to the sport a few years ago from beach rescue and swimming. Called the sport's 'bad boy,' a target since 2023, carrying it with defiance. In many ways the spine of the whole story — and the mentor's mirror.",
    arcNote: 'the spine of the whole story',
    colorHint: '#d96c3d',              // coral · Etna fire · gravity
  },
  {
    id: 'four-vito',
    key: 'vito',
    name: 'Vitomir Maričić',
    role: 'the heart and mind',
    nationality: 'Croatian',
    hometown: 'Rijeka',
    languagePrimary: 'hr',
    epithet: 'the mentor · the scientist studying the sport',
    bio: "The mentor at the centre of all four. Goes long rather than deep — Guinness record of nearly 29 minutes without breathing. Teaching staff of the University of Rijeka's centre for diving and hyperbaric medicine. One of the protagonists is the scientist studying the sport. By his own admission, might have left freediving entirely if not for Petar; instead he coaches champions who surpass him. His honesty is the emotional core.",
    arcNote: 'the emotional core of the entire film',
    colorHint: '#3d7a94',              // dock teal · scientist mind · deep sea
  },
  {
    id: 'four-sanda',
    key: 'sanda',
    name: 'Sanda Delija',
    role: 'the first',
    nationality: 'Croatian',
    hometown: 'Trieste',
    languagePrimary: 'hr',
    epithet: 'the first Croatian woman past 100 metres',
    bio: 'A free-immersion world-record holder and one of fewer than ten women who have ever passed 100 metres on a single breath. Twelve national records, two World Championship bronzes, a decade of building a deep that is entirely her own — reached at 103m in the warm water of the Philippines. She was the first Croatian woman to cross 100 metres, and she has spent her life proving the depth belongs to her, not to anyone watching.',
    arcNote: 'the deep that belongs only to her',
    colorHint: '#6f8a72',              // olive · grounded · quiet
  },
  {
    id: 'four-zsofia',
    key: 'zsofia',
    name: 'Zsófia Törőcsik',
    role: 'the newcomer-champion',
    nationality: 'Hungarian',
    hometown: 'Rijeka (relocated) · Hungary (birth)',
    languagePrimary: 'en',
    epithet: 'the outsider who can still see clearly',
    bio: "Three years ago she was a triathlete. Today she holds a free-immersion world record at 105 metres and a fistful of dynamic records — the first woman ever to pass 300 metres in a pool, at the World Games in Chengdu. One of the fastest ascents the sport has seen, and she still looks at this world with an outsider's wonder that everyone born into it has forgotten how to feel. Her interviews are in English — a second nationality threading the film international.",
    arcNote: "the audience's way in · the wonder, the trust, the discovery",
    colorHint: '#e39a5b',              // warm amber · radiant newcomer · dawn
  },
];

/* ---------- Talent adjacent to The Four (v0.8 — the documentary's cast) ----------
   Names beyond the four are film-canon placeholders — confirm/rename as the
   real people say yes. Each carries a bio + the reason they're in the film. */

/* The supporting cast is held back for the beta — Ante, Eszter, Dr. Novak,
   Luka, Marco and the rest return once each real person says yes and we can
   introduce them properly. The Four carry the film for now. */
export const SEED_TALENTS: Talent[] = [];

/* ---------- Topics (v0.8) — themes the interviews mine ---------- */

export const SEED_TOPICS: Topic[] = [
  { id: 'top-bond',        title: 'The bond',            question: 'Who holds you in the world?',                                                        threadIds: ['t1'],  colorHint: '#d96c3d' },
  { id: 'top-fear',        title: 'Fear',                question: 'What does fear do at ninety metres — and who taught you to hold it?',                threadIds: ['t8'],  colorHint: '#8a3a2e' },
  { id: 'top-record',      title: 'The record',          question: 'What does the last metre cost that nobody sees?',                                    threadIds: ['t3'],  colorHint: '#b54f26' },
  { id: 'top-deep',        title: 'The deep itself',     question: 'What is down there that belongs only to you?',                                       threadIds: ['t4'],  colorHint: '#123c68' },
  { id: 'top-2023',        title: 'The storm · 2023',    question: 'What did 2023 change in you — and between you?',                                     threadIds: ['t2'],  colorHint: '#2f4b6e' },
  { id: 'top-body',        title: 'The body as instrument', question: 'What does your body know that your mind refuses?',                                threadIds: ['t7'],  colorHint: '#3d7a94' },
  { id: 'top-friendship',  title: 'Friendship at the deep end', question: 'What does it mean to have one person who understands exactly where you go?', threadIds: ['t5'],  colorHint: '#6f8a72' },
  { id: 'top-outsider',    title: "The outsider's eyes", question: 'What do you still see that the others have stopped noticing?',                       threadIds: ['t6'],  colorHint: '#e39a5b' },
  { id: 'top-recognition', title: 'Recognition',         question: 'When the world that doubted you stands to applaud — what happens inside?',           threadIds: ['t9'],  colorHint: '#c9a961' },
  { id: 'top-longdeep',    title: 'Long vs deep',        question: 'Two ways to leave the world — which is yours, and why?',                             threadIds: ['t10'], colorHint: '#4c6b93' },
  { id: 'top-surface',     title: 'The surface',         question: 'What does the surface sound like when you come back to it?',                         threadIds: [],      colorHint: '#c88a5a' },
];

/* ---------- Story events (v0.8) — the moments the film orbits ---------- */

export const SEED_STORY_EVENTS: StoryEvent[] = [
  { id: 'ev-trubridge',  title: "Trubridge's 102m — the wall goes up",         kind: 'record',        year: 2016,                    summary: 'William Trubridge sets CNF 102m. For the next nine years it reads like a law of physics. Every no-fins diver measures against it.', personKeys: [], topicIds: ['top-record'] },
  { id: 'ev-vito-walk',  title: 'The 107m underwater walk',                    kind: 'record',        year: 2021,                    summary: 'Vito walks 107 metres on the bottom on one breath — Guinness. The long way, made literal.', personKeys: ['vito'], topicIds: ['top-body', 'top-longdeep'] },
  { id: 'ev-malta',      title: 'Malta — the snorkel that reroutes a life',    kind: 'origin',        year: 2022, date: '2022-10-15', summary: 'A disillusioned triathlete goes snorkelling on holiday. The pool career quietly ends itself in one afternoon of clear water.', personKeys: ['zsofia'], topicIds: ['top-outsider'] },
  { id: 'ev-petar-wr1',  title: "Petar's first CNF world record",              kind: 'record',        year: 2022,                    summary: 'CMAS competition. The beach-rescue kid from Rijeka arrives at the top of the hardest discipline.', personKeys: ['petar'], topicIds: ['top-record'] },
  { id: 'ev-sanda-98',   title: 'FIM 98m — Sanda takes the world record',      kind: 'record',        year: 2023, date: '2023-05-15', summary: 'Sharm el Sheikh, 3:58 underwater. Her first world record after 12 national ones.', personKeys: ['sanda'], topicIds: ['top-record', 'top-deep'] },
  { id: 'ev-storm',      title: 'Vertical Blue · the storm',                   kind: 'crisis',        year: 2023, date: '2023-07-15', summary: 'The airport search, the accusation, the six-month suspension under an ethics code — not doping; every test negative. The chapter no one sketches alone.', personKeys: ['petar', 'vito'], topicIds: ['top-2023', 'top-recognition'] },
  { id: 'ev-couples',    title: 'Two couples, one unit',                       kind: 'turning-point', year: 2024,                    summary: 'Petar and Zsófia. Vito and Sanda already. One mentor at the centre of all four. The sport becomes a family — and the family becomes the film.', personKeys: ['petar', 'vito', 'sanda', 'zsofia'], topicIds: ['top-bond'] },
  { id: 'ev-sanda-103',  title: 'FIM 103m at Mabini',                          kind: 'record',        year: 2025, date: '2025-05-04', summary: 'The Philippines give the number back. Among fewer than ten women ever past 100m.', personKeys: ['sanda'], topicIds: ['top-deep', 'top-record'] },
  { id: 'ev-petar-103',  title: 'CNF 103m — the 17-year reign ends',           kind: 'record',        year: 2025, date: '2025-05-10', summary: "Sharm el Sheikh. Petar takes Trubridge's wall down by a metre. The sport's oldest record falls to the man 2023 branded.", personKeys: ['petar'], topicIds: ['top-record', 'top-recognition'] },
  { id: 'ev-vito-2903',  title: 'The 29:03 · Opatija',                         kind: 'record',        year: 2025, date: '2025-06-14', summary: 'A hotel pool, five judges, a hundred spectators. Nearly half an hour without a breath, on pure O₂ — Guinness.', personKeys: ['vito'], topicIds: ['top-body', 'top-longdeep', 'top-recognition'] },
  { id: 'ev-chengdu',    title: '300m · first woman · Chengdu gold',           kind: 'record',        year: 2025, date: '2025-08-10', summary: 'World Games. Three years after Malta, Zsófia becomes the first woman to 300m in a pool.', personKeys: ['zsofia'], topicIds: ['top-outsider', 'top-record'] },
  { id: 'ev-zsofia-105', title: 'Zsófia · FIM 105m',                           kind: 'record',        year: 2026, date: '2026-04-20', summary: 'An absolute free-immersion world record three years after her first freedive. One of the fastest arrivals the sport has ever seen.', personKeys: ['zsofia'], topicIds: ['top-outsider'] },
  { id: 'ev-etna',       title: 'Etna erupts during the shoot',                kind: 'shoot-moment',  year: 2026, date: '2026-07-04', summary: "The mountain lights up during Petar's monofin window. 'Fire breathes in, water breathes out' stops being a storyboard.", personKeys: ['petar', 'vito', 'sanda', 'zsofia'], shootId: 'shoot-sicily', topicIds: ['top-fear'] },
  { id: 'ev-hall',       title: 'Hall of Fame induction',                      kind: 'ceremony',      year: 2027,                    summary: 'The same world that branded him stands to applaud. The 2023 thread closes in America.', personKeys: ['vito'], shootId: 'shoot-usa', topicIds: ['top-recognition', 'top-2023'] },
];

/* ---------- Idea Hub (v0.8) — the team's open inbox ---------- */

export const SEED_HUB_IDEAS: HubIdea[] = [
  {
    id: 'hub-krk-sicily-lastovo', title: 'Connecting interviews from Krk and Sicily to Lastovo',
    body: 'Treat the interviews as one continuous line across locations. Every question opened at Krk (the "before") and Sicily (the attempt) gets returned to at Lastovo — same person, same question, now carrying everything that happened between. Shoot Lastovo with the Krk + Sicily transcripts in hand so we go deeper instead of starting over. The follow-up chains in the Interviews module already map this.',
    kind: 'story', status: 'hot', authorId: 'c-tomo', votes: 4,
    links: [ { targetType: 'shoot', targetId: 'shoot-krk' }, { targetType: 'shoot', targetId: 'shoot-sicily' }, { targetType: 'shoot', targetId: 'shoot-lastovo' }, { targetType: 'thread', targetId: 't1' } ],
    createdAt: '2026-07-13T09:00:00Z', updatedAt: '2026-07-13T09:00:00Z',
  },
  {
    id: 'hub-lastovo-camp', title: 'Lastovo training camp and presentation of the sport',
    body: 'Use the Lastovo block to shoot the first real from-the-inside portrait of freediving as a sport — the training camp: dawn breath-ups, the line work, safety drills, a real competition, maybe a record. Dawn on the dock, the whole apparatus of the discipline laid bare. No film has shown it from within like this.',
    kind: 'scene', status: 'hot', authorId: 'c-vito', votes: 3,
    links: [ { targetType: 'shoot', targetId: 'shoot-lastovo' }, { targetType: 'thread', targetId: 't3' } ],
    createdAt: '2026-07-13T09:05:00Z', updatedAt: '2026-07-13T09:05:00Z',
  },
  {
    id: 'hub-rijeka-labs', title: 'Rijeka labs and institutes',
    body: "Shoot at the University of Rijeka's centre for diving and hyperbaric medicine — where Vito is both researcher and test subject. Ultrasound of the heart mid-apnea, EEG under low O₂, blood-oxygen curves. The body of the sport measured by the sport itself. Feeds the \"score is their bodies\" swing.",
    kind: 'scene', status: 'warm', authorId: 'c-vito', votes: 2,
    links: [ { targetType: 'shoot', targetId: 'shoot-rijeka-zagreb' }, { targetType: 'four', targetId: 'vito' }, { targetType: 'thread', targetId: 't7' }, { targetType: 'swing', targetId: 'sw-1' } ],
    createdAt: '2026-07-13T09:10:00Z', updatedAt: '2026-07-13T09:10:00Z',
  },
  {
    id: 'hub-njivice', title: 'Njivice on Krk island, where it all started (Pero)',
    body: "Njivice, on Krk — where it began for Petar. The origin water: the small-town harbour, the beach where a rescue kid first went under, the \"before\" before any record. Shoot it quiet and early, the film's oldest image for Petar's arc.",
    kind: 'shot', status: 'warm', authorId: 'c-petar', votes: 2,
    links: [ { targetType: 'shoot', targetId: 'shoot-krk' }, { targetType: 'four', targetId: 'petar' }, { targetType: 'thread', targetId: 't1' } ],
    createdAt: '2026-07-13T09:15:00Z', updatedAt: '2026-07-13T09:15:00Z',
  },
  {
    id: 'hub-sea-shepherds', title: 'Sea Shepherds',
    body: "An ocean-conservation layer — approach Sea Shepherd. Where the divers' relationship to the sea meets its protection: a possible partner, a cause, and a wider \"why the water matters\" beyond performance. Explore whether it's a thread of its own or just a texture running under the film.",
    kind: 'wild', status: 'new', authorId: 'c-tomo', votes: 1,
    links: [],
    createdAt: '2026-07-13T09:20:00Z', updatedAt: '2026-07-13T09:20:00Z',
  },
  {
    id: 'hub-usa-hof', title: 'USA hall of fame',
    body: "Vito's Hall of Fame induction in the USA — the same world that once branded the sport's people, standing to honour them. Shoot the ceremony, Vito's face during it, and the other three watching him honoured. The close of the recognition arc; pairs with the SF→Vegas road-trip.",
    kind: 'scene', status: 'hot', authorId: 'c-tomo', votes: 3,
    links: [ { targetType: 'shoot', targetId: 'shoot-usa' }, { targetType: 'four', targetId: 'vito' }, { targetType: 'thread', targetId: 't9' }, { targetType: 'event', targetId: 'ev-hall' } ],
    createdAt: '2026-07-13T09:25:00Z', updatedAt: '2026-07-13T09:25:00Z',
  },
  {
    id: 'hub-rijeka-interviews', title: 'Deep interviews in Rijeka',
    body: 'The long-form, honest sit-downs, done at home in Rijeka where the guard comes down — the inner world, the mind, the things only said on home ground. Where we go deepest with each of the four separately. Paired with the Lastovo conversations.',
    kind: 'question', status: 'warm', authorId: 'c-tomo', votes: 2,
    links: [ { targetType: 'shoot', targetId: 'shoot-rijeka-zagreb' }, { targetType: 'thread', targetId: 't8' } ],
    createdAt: '2026-07-13T09:30:00Z', updatedAt: '2026-07-13T09:30:00Z',
  },
  {
    id: 'hub-mexico-caves', title: 'Mexico caves visit',
    body: 'The cenotes — cave diving in Mexico. Another geography of the deep: fresh water, stone, total dark. A visual and emotional counterpoint to the open Adriatic. Big swing, big logistics — park it as an ambition and cost it out before committing.',
    kind: 'wild', status: 'parked', authorId: 'c-tomo', votes: 1,
    links: [ { targetType: 'thread', targetId: 't4' }, { targetType: 'four', targetId: 'sanda' } ],
    createdAt: '2026-07-13T09:35:00Z', updatedAt: '2026-07-13T09:35:00Z',
  },
  {
    id: 'hub-vito-deep', title: 'Vito, the deepest dive',
    body: 'Vito is known for going long, not deep — but he goes deep too (FIM 123 m, CWT 117 m) and is chasing real depth: a variable-weight attempt toward ~160 m, past Molchanov. Follow that ambition as its own arc — the scientist who also descends. Could be a record we capture live.',
    kind: 'story', status: 'warm', authorId: 'c-vito', votes: 2,
    links: [ { targetType: 'four', targetId: 'vito' }, { targetType: 'thread', targetId: 't10' }, { targetType: 'thread', targetId: 't7' } ],
    createdAt: '2026-07-13T09:40:00Z', updatedAt: '2026-07-13T09:40:00Z',
  },
  {
    id: 'hub-body-brain', title: 'Body and brain',
    body: "The physiology thread — what the body knows that the mind refuses: the diving reflex, bradycardia into the 20s, the brain defending itself under low oxygen. The \"score is their bodies\" swing lives here. Capture real data at the Rijeka lab and build the film's music from it.",
    kind: 'sound', status: 'hot', authorId: 'c-vito', votes: 3,
    links: [ { targetType: 'thread', targetId: 't7' }, { targetType: 'thread', targetId: 't8' }, { targetType: 'swing', targetId: 'sw-1' }, { targetType: 'shoot', targetId: 'shoot-rijeka-zagreb' } ],
    createdAt: '2026-07-13T09:45:00Z', updatedAt: '2026-07-13T09:45:00Z',
  },
];

/* ---------- The 10 Threads ---------- */

export const SEED_THREADS: Thread[] = [
  { id: 't1',  num: 1,  title: 'The four, and what\'s between them',            subtitle: 'the soul',                                    owner: 'ensemble',       synopsis: 'One mentor, two couples, four champions — really one unit. The bonds that make the impossible possible.', status: 'active' },
  { id: 't2',  num: 2,  title: '2023',                                          subtitle: 'the test the bond survived',                  owner: 'ensemble',       synopsis: 'The chapter no one sketches alone. Written with the four, not about them. Only at Lastovo, only when right — never in Sicily.', status: 'opening' },
  { id: 't3',  num: 3,  title: 'The pursuit of the record',                     subtitle: 'cost · risk · obsession',                     owner: 'petar',          synopsis: 'Why go deeper? What does the last metre cost that no one sees?', status: 'active' },
  { id: 't4',  num: 4,  title: 'What it feels like down there',                 subtitle: 'silence · surrender · the deep that\'s only yours', owner: 'sanda',    synopsis: "Sanda's territory — the place she goes that's only hers. Home of the descent monologue.", status: 'active' },
  { id: 't5',  num: 5,  title: 'Two at the deep end',                           subtitle: 'the friendship almost no one else can share',  owner: 'sanda-zsofia',   synopsis: 'Sanda and Zsófia — two of the very few women ever past 100 metres, and the closest of friends. The rare bond of having someone who understands exactly where you go.', status: 'active' },
  { id: 't6',  num: 6,  title: "The newcomer's eyes",                           subtitle: "the outsider who can still see clearly",       owner: 'zsofia',         synopsis: "Zsófia still sees this world clearly — the way those inside it forever no longer can. Her perspective is the audience's way in.", status: 'active' },
  { id: 't7',  num: 7,  title: 'The body as a frontier',                        subtitle: 'subject and scientist at once',               owner: 'vito',           synopsis: 'The physiology of the impossible — and the rare thing of a subject who is also the scientist studying it.', status: 'active' },
  { id: 't8',  num: 8,  title: 'The mind',                                      subtitle: 'fear · control · the meditative state',       owner: 'ensemble',       synopsis: 'Down there, is the mind empty or full? Which one are you looking for?', status: 'active' },
  { id: 't9',  num: 9,  title: 'Recognition',                                   subtitle: 'branded, then enshrined',                     owner: 'ensemble',       synopsis: "Hall of Fame induction in the USA. The world correcting itself.", status: 'opening' },
  { id: 't10', num: 10, title: 'Long vs deep',                                  subtitle: 'two ways to leave the world',                 owner: 'petar-vito',     synopsis: "Petar goes down · Vito goes long. Two ways to disappear from the world.", status: 'active' },
];

export const SEED_THREAD_QUESTIONS: ThreadQuestion[] = [
  /* Thread 1 — the four */
  { id: 'tq1-1', threadId: 't1', target: 'petar',  question: 'Everyone says you lift them. What do you get from them?',                                                                                                                     status: 'draft' },
  { id: 'tq1-2', threadId: 't1', target: 'vito',   question: "You've said you might have walked away without Petar. What was he really saving — the diver, or the man?",                                                                     status: 'draft' },
  { id: 'tq1-3', threadId: 't1', target: 'sanda',  question: 'The person who coaches you also loves you. On the rope, which one is he — and can he be both?',                                                                                status: 'draft' },
  { id: 'tq1-4', threadId: 't1', target: 'zsofia', question: "You follow their plans on faith, because they believe in you more than you believe in yourself. Where's the line between faith and surrender?",                                status: 'draft' },
  /* Thread 3 — pursuit of the record (Petar) */
  { id: 'tq3-1', threadId: 't3', target: 'petar',  question: 'You broke a record that stood 17 years without fins. Now you\'re putting on a monofin and going for raw depth — a discipline that isn\'t yours. Why step into something you could fail at, in front of everyone?', status: 'draft' },
  { id: 'tq3-2', threadId: 't3', target: 'petar',  question: 'A single metre at this depth is years of a life. What does the last metre cost that no one sees?',                                                                             status: 'draft' },
  { id: 'tq3-3', threadId: 't3', target: 'petar',  question: 'You\'ve been called the sport\'s "bad boy" and carried being a target. What does it take to keep going toward the thing people want you to stop doing?',                       status: 'draft' },
  /* Thread 4 — what it feels like (Sanda) */
  { id: 'tq4-1', threadId: 't4', target: 'sanda',  question: 'When you go all the way down, away from coaches and cameras and records — what\'s there that belongs only to you?',                                                            status: 'draft' },
  { id: 'tq4-2', threadId: 't4', target: 'sanda',  question: 'You were the first Croatian woman past 100 metres. What did you have to find in yourself to go where no woman had gone before you?',                                            status: 'draft' },
  { id: 'tq4-3', threadId: 't4', target: 'sanda',  question: 'What does the deep give you that the surface never can?',                                                                                                                       status: 'draft' },
  /* Thread 5 — two at the deep end */
  { id: 'tq5-1', threadId: 't5', target: 'sanda',  question: 'Almost no one else in the world knows the place you go. What does it mean to have a friend who does?',                                                                              status: 'draft' },
  { id: 'tq5-3', threadId: 't5', target: 'zsofia', question: 'When you arrived, Sanda was already deep. What did her being there give you that you couldn\'t have found alone?',                                                             status: 'draft' },
  { id: 'tq5-4', threadId: 't5', target: 'zsofia', question: 'Underwater, at the bottom, alone — what do you carry down there that comes from her?',                                                                                          status: 'draft' },
  { id: 'tq5-5', threadId: 't5', target: 'together', question: 'What does the other one understand about you that no one outside this water ever could?',                                                                                     status: 'draft' },
  /* Thread 6 — newcomer's eyes (Zsófia) */
  { id: 'tq6-1', threadId: 't6', target: 'zsofia', question: 'Three years ago you were a triathlete. Do you ever not quite believe the life you\'re in now?',                                                                                 status: 'draft' },
  { id: 'tq6-2', threadId: 't6', target: 'zsofia', question: 'As the newest, what do you see in this world that the others have stopped noticing?',                                                                                           status: 'draft' },
  { id: 'tq6-3', threadId: 't6', target: 'zsofia', question: 'What did you have to give up to rise this fast — and was it worth it?',                                                                                                         status: 'draft' },
  /* Thread 7 — body as frontier (Vito) */
  { id: 'tq7-1', threadId: 't7', target: 'vito',   question: 'You study the science of what your own body does. What\'s the part the science still can\'t explain, even to you?',                                                             status: 'draft' },
  { id: 'tq7-2', threadId: 't7', target: 'vito',   question: 'Your field admits it can\'t fully predict who comes back from a given dive. How do you live with building a life on something your own science calls unpredictable?',            status: 'draft' },
  /* Thread 8 — the mind (ensemble) */
  { id: 'tq8-1', threadId: 't8', target: 'ensemble', question: 'Down there, is the mind empty or full? Which one are you looking for?',                                                                                                       status: 'draft' },
  { id: 'tq8-2', threadId: 't8', target: 'ensemble', question: 'Fear: do you suppress it, befriend it, or use it? Has that changed since 2023?',                                                                                              status: 'draft' },
  /* Thread 9 — recognition */
  { id: 'tq9-1', threadId: 't9', target: 'vito',   question: 'They\'re putting you among the legends of a sport that punished you. Does that heal 2023 — or does nothing?',                                                                   status: 'draft' },
  { id: 'tq9-2', threadId: 't9', target: 'ensemble', question: 'Watching the same world that doubted him stand and applaud — what goes through you?',                                                                                         status: 'draft' },
  /* Thread 10 — long vs deep */
  { id: 'tq10-1', threadId: 't10', target: 'petar', question: 'Vito can stop time. You can only borrow depth, for three minutes. Which of you is closer to the edge down there?',                                                             status: 'draft' },
  { id: 'tq10-2', threadId: 't10', target: 'vito',  question: 'He runs at the dark by going into it; you meet it by going completely still. What does he understand about fear that you don\'t — and what do you understand that he doesn\'t?', status: 'draft' },
];

/* ---------- Spine · replaced by Ideas Workshop (v0.2) ----------
   The 5 locked questions are removed. See SEED_SPINE_IDEAS below. */

/* ---------- The 6 Shoots ---------- */

export const SEED_SHOOTS: Shoot[] = [
  {
    id: 'shoot-krk',
    key: 'krk',
    title: 'Krk · the "before"',
    location: 'Krk island',
    country: 'Croatia',
    lat: 45.03,
    lng: 14.58,
    status: 'completed',
    startDate: '2026-04-01',
    endDate: '2026-04-07',
    spirit: 'The foundation — the four, the bonds, the home water.',
    captures: ['who they are · at home', 'the bonds, seen', 'first breath-up templates', 'grey winter Adriatic as the "before"'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Krk — the "before"\n\nSoft opening. First shoot. The four at home, in their home water. Establishes the world before Sicily disrupts it.',
    colorHint: '#4c7a8a',            // steel-teal · winter Adriatic
    notes: 'Done · went beautifully.',
  },
  {
    id: 'shoot-sicily',
    key: 'sicily',
    title: "Sicily · Petar's monofin attempt",
    location: 'Catania · next to Etna volcano',
    country: 'Italy',
    lat: 37.51,
    lng: 15.09,
    status: 'completed',
    startDate: '2026-07-01',
    endDate: '2026-07-06',
    spirit: 'The second shoot · the camera meets all four in a real record attempt. The dive comes first, always.',
    captures: ['the attempt · Petar\'s face at surface, every dive', "the watchers · Vito, Sanda, Zsófia while he's down", 'the four together · boat, dinner, between-dive laughs', 'more of Sanda and Zsófia in their own right', 'the volcano interview · Etna at golden hour'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Sicily · 1-6 July 2026\n\nNot a film about depth — a film about who waits for you at the surface.\n\n## The stakes\nPetar attacks a monofin world record: a new discipline for him, the no-fins purist going for raw depth. Could make history. Could miss. Both outcomes are the film.\n\n## Coverage\n- **C1 — the face** · Petar\'s face at surface, every dive · locked · lav on Petar\n- **C2 — the moment + watchers** · turn to the three faces the instant the card shows\n- **C3 — roam** · wider scene · safety team · a quiet word after\n\n## Rules\n- The dive comes first · we shoot around, never in the way\n- Sicily is light · no heavy sit-downs · 2023 stays gentle\n- Two copies before anyone sleeps',
    wonderfulness: '★ Etna erupted DURING the shoot. The "Fire breathes in, water breathes out" swing became real — captured live. Not the world record, but the film gained something a script couldn\'t buy.',
    colorHint: '#d96c3d',            // Etna coral
    notes: 'Completed spectacularly. No WR but Etna erupted — the film opening writes itself.',
  },
  {
    id: 'shoot-lastovo',
    key: 'lastovo',
    title: 'Lastovo · the deep, and the sport itself',
    location: 'Lastovo island',
    country: 'Croatia',
    lat: 42.76,
    lng: 16.90,
    status: 'planned',
    startDate: '2026-08-15',
    endDate: '2026-08-22',
    spirit: "The deepest conversations · the inner world · 2023 when the time is right. AND the first real cinematic presentation of freediving as a sport.",
    captures: ['the deep conversations · the inner world', 'the 2023 chapter when it feels right', 'training camps · breathing exercises · daily discipline', 'a real competition', 'if it happens — a record', 'the sport laid bare, from the inside'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Lastovo — the soul, and the discipline\n\nHolds the most honest conversations AND the first real cinematic presentation of freediving as a sport. No film has shown the sport from the inside like this.\n\n## The 2023 conversation\nOnly here. Only when it\'s right. Never pushed. The wound never gets opened for a schedule.\n\n## The sport, laid bare\nDawn on the dock: breath-holds, the training camp, a real competition, maybe a record.',
    colorHint: '#6f8a72',            // deep olive · Lastovo forests
    notes: 'The soul-shoot. And the definitive document of the discipline.',
  },
  {
    id: 'shoot-cyprus',
    key: 'cyprus',
    title: 'Cyprus · the world stage',
    location: 'Cyprus',
    country: 'Cyprus',
    lat: 34.70,
    lng: 33.02,
    status: 'planned',
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    spirit: 'The competitive proving ground · the world stage.',
    captures: ['the competition · the world level', 'watcher moments at scale', 'the international dive community around the four', 'more spine + thread answers, transformed by the world stage'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Cyprus · autumn\n\nThe world stage. Where the sport meets the world. Coverage template: C1/C2/C3 as Sicily. Watcher moments prioritized.',
    colorHint: '#c9a961',            // Mediterranean gold
  },
  {
    id: 'shoot-rijeka-zagreb',
    key: 'rijeka-zagreb',
    title: 'Rijeka / Zagreb · the science',
    location: 'Rijeka + Zagreb',
    country: 'Croatia',
    lat: 45.33,
    lng: 14.44,
    status: 'planned',
    spirit: 'The body and the mind · the science, with Vito as both subject and researcher.',
    captures: ['Vito\'s lab · the ultrasound, the thermal, the brain scan', 'the score-as-body swing · physiology as music source', 'body-as-witness device · the data testifies', 'Vito the scientist studying Vito the subject'],
    presentFour: ['vito'],
    bible: '# Rijeka/Zagreb · the science\n\nUniversity of Rijeka, hyperbaric medicine research centre. Vito as subject AND researcher.\n\n## Score priority\nThe film\'s music built from real physiology captured here. Twenty-beat heart, blood shift, brain under low O2.',
    colorHint: '#3d7a94',            // dock teal · science
  },
  {
    id: 'shoot-usa',
    key: 'usa',
    title: 'The USA · Hall of Fame + SF→Vegas RV road-trip',
    location: 'USA · Hall of Fame + San Francisco → Las Vegas road-trip',
    country: 'USA',
    lat: 37.77,
    lng: -122.42,
    status: 'planned',
    startDate: '2026-09-01',
    endDate: '2026-09-27',
    spirit: "Vito's Hall of Fame induction · vindication made real · and a shared road-trip that could become the coda itself. Fly into SF, drive the Sierra + desert loop, end in Vegas, fly straight to Cyprus.",
    captures: [
      'the ceremony · the applause · the standing',
      "Vito's face during the induction",
      'the others watching him honoured',
      'the four together on the road · out of the water · new geography',
      'if the trip allows · a special dive · or the coda',
    ],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: `# USA · Hall of Fame + the road-trip

Vito is being inducted into a sports Hall of Fame in the USA. The perfect close to the 2023 thread: the same world that branded him coming, in the end, to honour him.

## The RV plan — Vegas → San Francisco

Rent a cool 6-person RV. Drive from Las Vegas to San Francisco through:

- **Death Valley** — otherworldly desert · zero water · the anti-Adriatic · geological time
- **Mammoth Lakes** — high alpine · thin air (altitude hypoxia connects to Vito's science) · lakes deeper than they look
- **Yosemite** — El Capitan · granite verticality · Free Solo geography — reference-film soil

The trip is a category for itself: not a shoot around a dive, but four freedivers on solid ground, off-water, out of their world.

## Why an RV, why together

- The four of them living in one vehicle for days · the bond visible, unforced
- Geographic contrast — everything ABOVE water · desert, mountain, granite
- No cameras chase them; the cameras live with them
- Could become the coda: "something together, free"

## Editorial

The RV footage is the "long breath" of the film — after every underwater sequence, cut to a moment on the road. Silence between them. The bond off duty.

## Open (fill together — Petar, Vito, Sanda, Zsófia jump in)

- Dates
- Which RV rental company (Cruise America? RVshare? Outdoorsy?)
- Route stops in order
- Any special dives (Mono Lake? Emerald Bay? Ocean cliffs?)
- Meal / camp discipline
- Music we play in the RV
- Who drives what stretch`,
    colorHint: '#a05133',            // deep coral · desert dusk
  },
  {
    id: 'shoot-coda',
    key: 'coda',
    title: 'The coda · something together, free',
    location: 'TBD · possibly bioluminescent water',
    country: 'TBD',
    status: 'planned',
    spirit: 'Something together, free. The night dive in bioluminescent water. No records, no judges. Just the wonder that started it all.',
    captures: ['the four weightless in total black', 'lit only by the glow they stir with their hands', 'silent credits · only breathing returning to normal', 'the audience surfaces with them'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# The coda — free in the dark\n\nA night dive in bioluminescent water. The four weightless in total black, lit only by the glow. No records, no judges, no card.\n\nThen silent credits: no music, only breathing slowly returning to normal, as the audience surfaces with them.',
    colorHint: '#123c68',            // deep sea navy · bioluminescent black
  },
];

/* ---------- Shoot days for Sicily (from the Shooting Bible) ---------- */

export const SEED_SHOOT_DAYS: ShootDay[] = [
  { id: 'sd-sicily-1', shootId: 'shoot-sicily', dayNum: 1, date: '2026-07-01', plan: 'Landed in Catania. Settled in. Met with everybody.',                                                                             mood: 'setup', done: true },
  { id: 'sd-sicily-2', shootId: 'shoot-sicily', dayNum: 2, date: '2026-07-02', plan: 'Training day.',                                                                                                                     mood: 'roll',  done: true },
  /* Day 3+ intentionally open — user fills in as memory returns / edits inline */
];

/* ---------- Camera coverage plan (Sicily) ---------- */

export const SEED_COVERAGE_CAMS: CoverageCam[] = [
  { id: 'cc-sicily-c1', shootId: 'shoot-sicily', role: 'C1-face',     targetPerson: 'petar', descriptor: "Petar's face at the surface, every dive — the gasp, the recovery, the card. Keep rolling for the full minute AFTER the surface; that's where the feeling lives. Lav on Petar.", locked: true },
  { id: 'cc-sicily-c2', shootId: 'shoot-sicily', role: 'C2-watchers', descriptor: 'The instant the result is known, turn to Vito · Zsófia · Sanda. That reaction is the emotional centre of the whole sequence.', locked: true },
  { id: 'cc-sicily-c3', shootId: 'shoot-sicily', role: 'C3-roam',     descriptor: 'The wider scene, the safety team, and a quiet word with whoever just surfaced or just watched.', locked: true },
];

/* ---------- Bigger Swings ---------- */

export const SEED_SWINGS: BiggerSwing[] = [
  {
    id: 'sw-1',
    title: 'The score is their own bodies',
    description: "The film's music built from real physiology — the 20-beat heart, the blood shift, the brain under low O2.",
    whyItMatters: "Every doc about the sport uses a composer's score. This one uses the body the sport happens IN. The music can't lie about the depth — because it IS the depth.",
    narrative: "Vito's lab becomes the orchestra. Ultrasound heartbeats, EEG oscillations, blood-oxygen graphs — mapped to real instrumentation. As the diver descends, the music becomes literally their physiology, slowed and warmed.",
    visualNote: 'Ultrasound + graph overlays. Numbers on screen. The body, not the composer.',
    soundNote: 'Slow-morphed heartbeat as bass. Blood-flow as ambient wash. Silence at bottom.',
    dependencies: 'Requires Vito capture at Rijeka lab.',
    status: 'planned',
    shootId: 'shoot-rijeka-zagreb',
  },
  {
    id: 'sw-2',
    title: 'One dive, real time, no mercy',
    description: 'A full record descent and ascent in a single unbroken shot — the actual duration, no editorial rescue.',
    whyItMatters: "Every other film cuts for the audience's comfort. This one asks the audience to LIVE it. If Petar's dive is 3:15, the sequence is 3:15. No cheat.",
    narrative: "Single camera, single continuous roll — down and back. No cuts. The audience holds their own breath. Some will fail before Petar does. That's the point.",
    visualNote: 'One camera, one take, real time. Simple.',
    soundNote: 'Only breath and water. Then silence at bottom. Then breath again.',
    status: 'planned',
  },
  {
    id: 'sw-3',
    title: 'Four voices, one mind',
    description: 'The descent monologue braided so tight the four become a single voice going into the dark.',
    whyItMatters: "The bond made audible. Four separate people, edited into one continuous internal thought. The film's thesis — 'one person holds another' — expressed at the level of sound.",
    narrative: "Petar, Vito, and Sanda in Croatian, Zsófia in English — sentences of their descent monologues cut so tight they finish each other. Not translation; the languages braid intentionally. Croatian and English become one mind.",
    visualNote: 'Multiple divers in composite / rapid intercut / all descending.',
    soundNote: 'Whisper-close ADR / multi-language braided monologue.',
    status: 'planned',
  },
  {
    id: 'sw-4',
    title: 'Fire breathes in, water breathes out',
    description: "Open on Etna — lava hitting the sea, steam screaming — then cut to a body slipping under, silent.",
    whyItMatters: "The elemental collision. The mountain that can't stop breathing, against people who've mastered not breathing at all. The film's opening image, and its whole thesis in one cut.",
    narrative: "Wide, static, red-hot lava rivers meeting cold sea. Steam explosion. Then hard cut — a single body sinking, blue silence, held. Two elements. One frame apart.",
    visualNote: "★ ACHIEVED — Etna ACTUALLY erupted during Sicily shoot 2026-07-04. Real lava. Real steam. Not scripted.",
    soundNote: 'Roar of eruption → immediate underwater silence. Cut IS the sound event.',
    dependencies: 'Etna eruption footage secured Sicily shoot Day 4.',
    status: 'achieved',
    shootId: 'shoot-sicily',
    achievedNote: '★ ETNA ERUPTED DURING SICILY SHOOT. The swing became real material. Not scripted — captured live. This is the opening.',
    achievedAt: '2026-07-04',
  },
  {
    id: 'sw-5',
    title: 'Surface to the ending, then sink',
    description: "Open on Vito's Hall of Fame induction — the applause, the vindication — then hold a breath and descend back through everything it cost.",
    whyItMatters: "The whole film becomes the held breath between the disgrace and the honour. Ending-as-beginning frames the 2023 chapter as ALREADY resolved. The audience descends knowing the surface is safe — but the depth is not.",
    narrative: "Ceremony. Standing ovation. Vito nods. Then a hard breath — and we descend, backwards through the film, into 2023, into the accusation, into the water, into what it cost.",
    visualNote: 'Reverse structural time. Ceremony → 2023 → sea. Time as a dive.',
    soundNote: 'Applause fading into breath-up. Silence. Water.',
    status: 'planned',
    shootId: 'shoot-usa',
  },
  {
    id: 'sw-6',
    title: 'Free in the dark · the coda',
    description: 'A night dive in bioluminescent water. The four weightless in total black, lit only by the glow they stir with their hands.',
    whyItMatters: "No records. No judges. No card. The wonder that started all of it. The film's answer to the question it opened: what is it really about? — this.",
    narrative: "Silent credits: no music, only breathing slowly returning to normal, as the audience surfaces with them.",
    visualNote: 'Pitch black. Bioluminescent trails from hands. Barely visible bodies.',
    soundNote: 'Silence. Then, near end, breathing returning to normal, only.',
    dependencies: 'Bioluminescent location to scout (Puerto Rico? Maldives? Adriatic in summer?)',
    status: 'planned',
    shootId: 'shoot-coda',
  },
  {
    id: 'sw-7',
    title: 'The volcano interview',
    description: "Vito on the black lava at golden hour, sea far below, Etna smoking behind him, talking about stillness.",
    whyItMatters: "The film's whole world is water. Here it stands on fire and earth. Two elements, one frame. Vito's stillness against the mountain's inability to be still.",
    narrative: "Handheld, static frame. Vito seated on cooled black lava. Etna smoking. Sea 300m below. He talks — quietly — about what stillness means when the ground you sit on can't.",
    visualNote: 'Black lava · Etna in mid-ground · Mediterranean in deep background.',
    soundNote: 'Wind. Very distant volcano rumble. Vito quiet.',
    status: 'planned',
    shootId: 'shoot-sicily',
  },
  {
    id: 'sw-8',
    title: 'Two clocks',
    description: 'Split screen: Vito motionless 29 minutes against Petar falling 3 minutes. Two ways to leave the world.',
    whyItMatters: 'The film has two protagonists who both practice absence — one long, one deep. Side by side, we see they arrive at the same place through different math.',
    narrative: 'Left frame: Vito, dry, floating, static — timer counts 29:00. Right frame: Petar, wet, plummeting, active — timer counts 3:00. Same emotional arrival, radically different bodies. Timers run in real proportion.',
    visualNote: 'Precise 50/50 split. Same-scale timers.',
    soundNote: 'Left: silent respirator air. Right: pressure, water, held breath.',
    status: 'idea',
  },
  {
    id: 'sw-9',
    title: 'The watchers as a chorus',
    description: "The card shows — and the cut goes not to Petar but to Zsófia's face in the half-second before she knows.",
    whyItMatters: "The bond, caught in a reaction. The film's emotional centre isn't the diver — it's the person at the surface. Naming that visually every time a card shows.",
    narrative: "Every attempt: right before the result is announced, cut to a watcher. Not Petar's face. HER face. HIS face. Their reaction becomes the news.",
    visualNote: 'Faces in shallow focus, water blurred behind them.',
    soundNote: 'Ambient boat. No dialogue. Then card announcement.',
    status: 'planned',
    shootId: 'shoot-sicily',
  },
  {
    id: 'sw-10',
    title: 'Two friends, one depth',
    description: "Sanda and Zsófia filmed apart, answering the same question about the deep — cut together so they almost finish each other's sentence.",
    whyItMatters: "Two of the very few women who know what 100 metres feels like, describing the same silence from opposite ends of the earth. The bond made audible: two voices that have been to the same impossible place.",
    narrative: "Same question, same lens, same simple background. But filmed a month apart, on different continents. Cut so their answers overlap on the vowels. They finish each other's sentences without knowing.",
    visualNote: 'Identical framing. Different light. Same silence.',
    soundNote: 'Their voices, together as they never were in the room.',
    status: 'idea',
  },
];

/* ---------- The 4 Grammar Devices ---------- */

export const SEED_DEVICES: GrammarDevice[] = [
  { id: 'dev-1', key: 'descent-monologue',  title: 'The descent monologue',   description: "The words in your head on the way down, present-tense and whispered, married to the slow descent so the audience drops inside the diver's mind. For all four; Zsófia's English braided against the others' Croatian.", captureIds: [] },
  { id: 'dev-2', key: 'breath-up',           title: 'The breath-up',           description: "The still ritual before every dive, filmed the same way everywhere; the film's recurring prayer, where the bond is most visible.",                                                                                    captureIds: [] },
  { id: 'dev-3', key: 'body-as-witness',    title: 'The body as witness',      description: 'Rather than doctors explaining over talking heads, the data testifies: the heart slowing toward stopping, the blood moving into the chest, the thermal image of the deep. The body itself, telling the truth 2023 doubted.', captureIds: [] },
  { id: 'dev-4', key: 'moment-in-the-dark', title: 'A moment in the dark',    description: "At the film's deepest point, image and sound black out for a few seconds. The audience is given the edge, not told about it. Used once.",                                                                                captureIds: [] },
];

/* ---------- Freediving records (researched · real public record) ---------- */

export const SEED_RECORDS: DivingRecord[] = [
  { id: 'rec-petar-cnf',     personKey: 'petar',  discipline: 'CNF',   scope: 'world',    depthM: 103,       date: '2025-05-10', event: 'AIDA Freediving World Cup',                     location: 'Sharm el Sheikh, Egypt',            status: 'standing', notes: "Broke William Trubridge's 102m — a reign that stood since 2016. The end of a 17-year era." },
  { id: 'rec-petar-fim',     personKey: 'petar',  discipline: 'FIM',   scope: 'world',    depthM: 135,       date: '2025-06-15', event: 'FIM world record',                               location: '',                                   status: 'standing', notes: 'Free immersion — the deepest a man has ever pulled himself.' },
  { id: 'rec-vito-sta',      personKey: 'vito',   discipline: 'STA',   scope: 'guinness', timeSeconds: 1743, date: '2025-06-14', event: 'Guinness World Record attempt',                 location: 'Opatija, Croatia · Bristol Hotel pool', status: 'standing', notes: '29:03 on pure O₂ — five judges, ~100 spectators, none of them breathing either.' },
  { id: 'rec-vito-walk',     personKey: 'vito',   discipline: 'other', scope: 'guinness', distanceM: 107,    date: '2021-06-01', event: 'Guinness · longest underwater walk on one breath', location: 'Croatia',                          status: 'standing', notes: 'One breath, 107 metres, on foot, on the bottom.' },
  { id: 'rec-vito-fim',      personKey: 'vito',   discipline: 'FIM',   scope: 'personal', depthM: 123,       date: '2024-09-01', event: 'AIDA depth competition',                          location: '',                                   status: 'standing', notes: 'Free-immersion career best — the mentor goes deep too, not only long. World no. 3 all-time. (Date to confirm.)' },
  { id: 'rec-vito-cwt',      personKey: 'vito',   discipline: 'CWT',   scope: 'personal', depthM: 117,       date: '2024-09-01', event: 'AIDA depth competition',                          location: '',                                   status: 'standing', notes: 'Constant-weight career best. Known for going long — but 117m is genuinely deep. Chasing a variable-weight ~160m next. (Date to confirm.)' },
  { id: 'rec-sanda-fim-98',  personKey: 'sanda',  discipline: 'FIM',   scope: 'world',    depthM: 98,        date: '2023-05-15', event: 'AIDA World Cup',                                 location: 'Sharm el Sheikh, Egypt',            status: 'broken',   brokenByRecordId: 'rec-sanda-fim-103', notes: 'Her first FIM world record · 3:58 dive time.' },
  { id: 'rec-sanda-fim-103', personKey: 'sanda',  discipline: 'FIM',   scope: 'world',    depthM: 103,       date: '2025-05-04', event: 'FIM world record',                               location: 'Mabini, Philippines',               status: 'broken',   brokenByRecordId: 'rec-zsofia-fim', notes: 'Among fewer than ten women ever past 100m. 12 national records behind it.' },
  { id: 'rec-zsofia-fim',    personKey: 'zsofia', discipline: 'FIM',   scope: 'world',    depthM: 105,       date: '2026-04-20', event: 'Absolute FIM world record',                      location: '',                                   status: 'standing', notes: "Two metres past her best friend's number. The record that passed between them." },
  { id: 'rec-zsofia-dyn280', personKey: 'zsofia', discipline: 'DYN',   scope: 'world',    distanceM: 280,    date: '2025-04-15', event: 'DYN world record',                               location: '',                                   status: 'broken',   brokenByRecordId: 'rec-zsofia-dyn', notes: 'Broken by her own 300 four months later.' },
  { id: 'rec-zsofia-dyn',    personKey: 'zsofia', discipline: 'DYN',   scope: 'world',    distanceM: 300,    date: '2025-08-10', event: 'World Games',                                    location: 'Chengdu, China',                    status: 'standing', notes: 'First woman to 300m in a pool · gold.' },
];

/* ---------- Watcher moments (the film's emotional centre) ----------
   When one goes down, we film the other three at the surface. Their face
   the instant the card shows is often more important than the diver's. */

export const SEED_WATCHER_MOMENTS: WatcherMoment[] = [
  { id: 'wm-sic-vito',   shootId: 'shoot-sicily', watcherKey: 'vito',   divingPersonKey: 'petar', moment: "Vito the instant Petar's card shows — the mentor who almost left the sport, watching the student surpass everyone.", captured: true,  timecode: '01:12:40', captureNote: 'C2 held on Vito for the full 40 seconds after the surface. This is the shot.' },
  { id: 'wm-sic-zsofia', shootId: 'shoot-sicily', watcherKey: 'zsofia', divingPersonKey: 'petar', moment: 'Zsófia at the surface willing her partner up — she stops breathing when he does.', captured: true,  timecode: '01:12:44' },
  { id: 'wm-sic-sanda',  shootId: 'shoot-sicily', watcherKey: 'sanda',  divingPersonKey: 'petar', moment: "Sanda, who knows exactly what the last metre costs, watching someone else pay it.", captured: true,  timecode: '01:12:47' },
  { id: 'wm-krk-vito',   shootId: 'shoot-krk',    watcherKey: 'vito',   divingPersonKey: 'sanda', moment: 'Vito counting Sanda down at Krk — coach and partner in the same face.', captured: true },
  { id: 'wm-krk-petar',  shootId: 'shoot-krk',    watcherKey: 'petar',  divingPersonKey: 'zsofia',moment: 'Petar watching Zsófia train — the newcomer he brought into the deep.', captured: false, captureNote: 'Planned pickup — get this at Lastovo if missed at Krk.' },
  { id: 'wm-las-together', shootId: 'shoot-lastovo', watcherKey: 'sanda', divingPersonKey: 'zsofia', moment: 'Sanda at the surface as Zsófia comes up from a deep one — the friend who understands the place she just came from.', captured: false },
];

/* ---------- Physiology (the score built from real bodies) ----------
   dataPointsCsv = bpm samples over the dive; the view charts it as the
   film's would-be score. Bradycardia: the diving reflex drops the heart
   toward a fraction of its resting rate. */

/* ---------- Physiology · the body as witness ----------------------------
   IMPORTANT: every series below is `modelled` — an expected curve built from
   established freediving physiology and each diver's real record. None of it
   has been measured off these people yet. That's the whole point of the Rijeka
   lab shoot: go and get the real numbers, then flip provenance to 'measured'
   and replace the curve. Until then nothing here should be quoted as fact.

   The physics they're built on is real and well established: face immersion
   triggers bradycardia; peripheral vasoconstriction raises blood pressure;
   blood shifts into the chest as the lungs compress past residual volume; the
   spleen contracts and releases stored red cells; SpO₂ stays high at depth
   because partial pressure is high, then collapses on ascent as pressure drops
   — which is why the last ten metres are the dangerous ones. */

export const SEED_PHYSIOLOGY: PhysiologyDatum[] = [
  /* ---- VITO · the 29:03 (real record: rec-vito-sta, 1743s) ---- */
  {
    id: 'phys-vito-hr', personKey: 'vito', metric: 'heart-rate',
    contextNote: 'Vito · static apnea. The diving reflex pulls his heart toward 20-something bpm, then it surges back on the recovery breath.',
    unit: 'bpm', dataPointsCsv: '76,72,66,58,50,44,39,35,31,28,26,25,24,24,25,27,33,44,60,74,80,72',
    peakValue: 80, minValue: 24, duration: 1743, date: '2025-06-14',
    source: 'Expected curve · to be measured at Rijeka', provenance: 'modelled',
    recordId: 'rec-vito-sta', usedInScore: true,
    notes: 'The 29:03 hold. This curve is the spine of the "score is their bodies" swing — and the first thing the lab day should replace with real telemetry.',
  },
  {
    id: 'phys-vito-spo2', personKey: 'vito', metric: 'blood-oxygen',
    contextNote: 'Vito · blood-oxygen across the long hold. On pure O₂ the fall is slower than air, but it still falls — and the body defends the brain last.',
    unit: '% SpO₂', dataPointsCsv: '99,98,97,95,92,88,84,79,74,69,64,61,58,57,60,72,88,97',
    peakValue: 99, minValue: 57, duration: 1743, date: '2025-06-14',
    source: 'Expected curve · to be measured at Rijeka', provenance: 'modelled',
    recordId: 'rec-vito-sta',
  },
  {
    id: 'phys-vito-brain', personKey: 'vito', metric: 'brain-activity',
    contextNote: 'Vito · cerebral oxygenation (NIRS). The organ that is him, running down — and still the last thing the body gives up.',
    unit: '% rSO₂', dataPointsCsv: '72,72,71,70,69,67,65,63,61,58,56,54,52,50,48,47,46,45,45,46,52,62,70',
    peakValue: 72, minValue: 45, duration: 1743, date: '2025-06-14',
    source: 'Expected curve · to be measured at Rijeka', provenance: 'modelled',
    recordId: 'rec-vito-sta', usedInScore: true,
    notes: 'If we get this signal, the film has a shot of a mind going quiet and coming back.',
  },
  {
    id: 'phys-vito-lactate', personKey: 'vito', metric: 'lactate',
    contextNote: 'Vito · blood lactate, sampled after the hold. The cost arrives late — the body pays for the stillness once it is over.',
    unit: 'mmol/L', dataPointsCsv: '0.9,0.9,1.0,1.2,1.5,1.9,2.4,3.0,3.7,4.5,5.4,6.3,7.1,7.8,8.3,8.6,8.4,7.6,6.5,5.2,4.0,3.0,2.2,1.6',
    peakValue: 8.6, minValue: 0.9, date: '2025-06-14',
    source: 'Expected curve · to be measured at Rijeka', provenance: 'modelled',
    recordId: 'rec-vito-sta',
    notes: 'Post-hold sampling, ~30 min. Needs venous draws — has to be planned into the lab day, not improvised.',
  },

  /* ---- PETAR · CNF 103m (real record: rec-petar-cnf) ---- */
  {
    id: 'phys-petar-hr', personKey: 'petar', metric: 'heart-rate',
    contextNote: 'Petar · the 103m no-fins descent. Heart slows on the way down as pressure builds, spikes at the turn, races on the ascent.',
    unit: 'bpm', dataPointsCsv: '84,78,70,62,55,49,45,43,42,44,48,55,64,74,86,96,90,80',
    peakValue: 96, minValue: 42, duration: 195, date: '2025-05-10',
    source: 'Expected curve · to be measured', provenance: 'modelled',
    recordId: 'rec-petar-cnf', depthM: 103, usedInScore: true,
  },
  {
    id: 'phys-petar-spo2', personKey: 'petar', metric: 'blood-oxygen',
    contextNote: "Petar · saturation on the 103m. It holds high at depth — pressure keeps the oxygen useful — then collapses on the way up. The last ten metres are the dangerous ones, in full view of everyone at the surface.",
    unit: '% SpO₂', dataPointsCsv: '99,99,98,98,97,97,96,95,95,94,93,91,89,86,82,77,71,64,59,62,78,94',
    peakValue: 99, minValue: 59, duration: 195, date: '2025-05-10',
    source: 'Expected curve · to be measured', provenance: 'modelled',
    recordId: 'rec-petar-cnf', depthM: 103, usedInScore: true,
    notes: 'This shape is the argument for the whole watchers device: the crisis happens where the camera can see it.',
  },
  {
    id: 'phys-petar-bp', personKey: 'petar', metric: 'blood-pressure',
    contextNote: 'Petar · systolic pressure. The body clamps the limbs shut to keep the core and brain fed — the pressure climbs because the blood has nowhere else to go.',
    unit: 'mmHg systolic', dataPointsCsv: '120,124,130,138,145,152,158,164,170,175,178,180,181,180,176,170,162,152,140,128,122',
    peakValue: 181, minValue: 120, duration: 195, date: '2025-05-10',
    source: 'Literature · elite apneist vasoconstriction response', provenance: 'literature',
    depthM: 103,
    notes: 'Published range for elite apneists, not Petar. Shown to plan the measurement, not to state his numbers.',
  },

  /* ---- SANDA · FIM 98m, 3:58 (real record: rec-sanda-fim-98) ---- */
  {
    id: 'phys-sanda-hr', personKey: 'sanda', metric: 'heart-rate',
    contextNote: 'Sanda · the 98m free immersion, 3:58. Hand over hand down the rope and back. Her heart finds its floor at the bottom — the quietest her body ever gets, in the one place that belongs only to her.',
    unit: 'bpm', dataPointsCsv: '70,64,56,48,43,39,36,34,32,30,29,28,30,33,36,40,44,48,54,62,78,104,96,82',
    peakValue: 104, minValue: 28, duration: 238, date: '2023-05-15',
    source: 'Expected curve · to be measured', provenance: 'modelled',
    recordId: 'rec-sanda-fim-98', depthM: 98, usedInScore: true,
    notes: 'The floor of this curve is the film: below coaches, below cameras, below records.',
  },
  {
    id: 'phys-sanda-spo2', personKey: 'sanda', metric: 'blood-oxygen',
    contextNote: 'Sanda · saturation across the 98m. High while she is deep, falling as she rises — the body is safest where it looks most dangerous.',
    unit: '% SpO₂', dataPointsCsv: '99,99,98,98,97,97,96,96,95,95,94,93,92,90,88,84,79,73,66,60,58,64,80,95',
    peakValue: 99, minValue: 58, duration: 238, date: '2023-05-15',
    source: 'Expected curve · to be measured', provenance: 'modelled',
    recordId: 'rec-sanda-fim-98', depthM: 98,
  },
  {
    id: 'phys-sanda-lung', personKey: 'sanda', metric: 'lung-volume',
    contextNote: 'Sanda · lung volume down the rope. At 98m her lungs are squeezed to roughly a tenth of what they were at the surface — smaller than a body is supposed to allow. Blood moves into the chest to fill what air cannot.',
    unit: 'L', dataPointsCsv: '5.2,4.1,3.2,2.6,2.1,1.7,1.4,1.2,1.0,0.85,0.72,0.62,0.55,0.5,0.48,0.55,0.65,0.8,1.0,1.3,1.8,2.6,3.8,5.2',
    peakValue: 5.2, minValue: 0.48, duration: 238, date: '2023-05-15',
    source: 'Boyle\'s law from a 5.2L surface volume · volume assumed', provenance: 'modelled',
    recordId: 'rec-sanda-fim-98', depthM: 98,
    notes: 'The compression is physics and exact; the 5.2L starting volume is an assumption. Spirometry at the lab fixes that in ten minutes.',
  },
  {
    id: 'phys-sanda-contractions', personKey: 'sanda', metric: 'contractions',
    contextNote: 'Sanda · involuntary diaphragm contractions. Not pain, not panic — the body knocking on the door, and the mind deciding not to answer. This is what discipline looks like from inside.',
    unit: 'per 10s', dataPointsCsv: '0,0,0,0,0,0,0,0,1,1,2,2,3,3,4,4,5,6,6,7,8,9,4,0',
    peakValue: 9, minValue: 0, duration: 238, date: '2023-05-15',
    source: 'Expected onset at CO₂ threshold · to be measured', provenance: 'modelled',
    recordId: 'rec-sanda-fim-98', depthM: 98, usedInScore: true,
    notes: 'A rhythm section that starts two thirds of the way in and accelerates to the surface. Percussion the diver cannot choose.',
  },

  /* ---- ZSÓFIA · FIM 105m (real record: rec-zsofia-fim) ---- */
  {
    id: 'phys-zsofia-hr', personKey: 'zsofia', metric: 'heart-rate',
    contextNote: "Zsófia · the 105m. Three years ago she was a triathlete. The dive reflex sharpens with years of training, so hers is expected to sit higher than Sanda's — her body is still learning what the others' have known for decades, and she goes deeper than them anyway.",
    unit: 'bpm', dataPointsCsv: '78,72,66,60,55,51,48,45,43,41,40,39,40,42,45,48,52,57,63,72,88,112,102,88',
    peakValue: 112, minValue: 39, duration: 250, date: '2026-04-20',
    source: 'Expected curve · to be measured', provenance: 'modelled',
    recordId: 'rec-zsofia-fim', depthM: 105, usedInScore: true,
    notes: 'Put this against Sanda in Compare: the newcomer works harder for a deeper number. If the real data shows that, it is a scene. If it does not, we have learned something better.',
  },
  {
    id: 'phys-zsofia-spleen', personKey: 'zsofia', metric: 'spleen',
    contextNote: 'Zsófia · spleen volume. It contracts under apnea and pushes stored red cells into the blood — the body opening a reserve tank it never mentions.',
    unit: 'ml', dataPointsCsv: '220,215,205,192,180,170,162,156,152,150,149,148,148,150,155,162,172,185,198,210',
    peakValue: 220, minValue: 148, duration: 250, date: '2026-04-20',
    source: 'Literature · spleen contraction in trained apneists', provenance: 'literature',
    depthM: 105,
    notes: 'Published effect, not her measurement. Needs ultrasound — which is exactly what the Rijeka lab has.',
  },
];

/* ---------- Evidence library for the 2023 Chapter ---------- */

export const SEED_EVIDENCE_2023: Evidence2023[] = [
  {
    id: 'ev-1',
    type: 'academic-paper',
    title: 'The CMAS code of ethics and the challenges of safeguarding athletes — the Vertical Blue Case',
    author: 'Škerbić, M. M., Dikić, N., Andjelković, M., Žarković, S., & Parry, J.',
    source: 'AUC Kinanthropologica, 61(1), 32-47 · 2025',
    date: '2025-01-01',
    summary: 'Peer-reviewed paper arguing the punishment involved procedural irregularities, ethically questionable practices, and violations of the athletes\' rights — calling for the decision to be reversed.',
    onFile: true,
  },
  { id: 'ev-2', type: 'test-result',         title: 'ITA doping test results',              source: 'International Testing Agency (WADA-accredited lab, Montreal)', summary: 'All results negative. No anti-doping rule violation. Result management suspended.', onFile: false },
  { id: 'ev-3', type: 'federation-statement', title: 'AIDA statement on 2023',                source: 'AIDA International',                                            summary: "Athletes' own federation did NOT ban them, citing the negative tests.",              onFile: false },
  { id: 'ev-4', type: 'court-document',       title: 'CMAS Disciplinary Committee ruling',   source: 'CMAS',                                                          summary: 'Six-month suspension + €5,000 fine each, under Code of Ethics articles 1.2 and 2.2 — NOT an anti-doping violation.', onFile: false },
  { id: 'ev-5', type: 'press-article',        title: 'Vertical Blue 2023 · reporting',        source: 'DeeperBlue · Divernet · Sports Integrity Initiative',            summary: 'Timeline of arrival, airport search (organiser participating, off-duty police, secretly filmed against event policy).', onFile: false },
];

/* ---------- Film crew (the whole team — film side + talent side) ---------- */

export const SEED_CREW: CrewMember[] = [
  { id: 'c-tomo',      name: 'Tomislav Kovačić',    role: 'Producer',                         languages: ['hr','en'], notes: 'The eye. Holds the whole film — story, pitch, edit. This dashboard is his bridge.' },
  { id: 'c-kristijan', name: 'Kristijan Dimitrijević', role: 'Camera 1',                       languages: ['hr','en'], notes: 'A7 IV #1. Lead camera on every attempt — the face and the surface hero frames.' },
  { id: 'c-toni',      name: 'Toni Batić',           role: 'Camera 2',                         languages: ['hr','en'], notes: 'A7 IV #2. Second angle — the watchers, the roam, matched colour with Camera 1.' },
  { id: 'c-petar',     name: 'Petar Klovar',          role: 'Talent · safety + depth consultant', languages: ['hr','en'], notes: 'The gravity. Also the deepest safety knowledge on the team.' },
  { id: 'c-vito',      name: 'Vitomir Maričić',       role: 'Talent · scientific advisor',      languages: ['hr','en'], notes: 'The heart and mind. Bridges the Rijeka lab and the rope. Heads AIDA Croatia.' },
  { id: 'c-sanda',     name: 'Sanda Delija',          role: 'Talent · story consultant',        languages: ['hr','en','it'], notes: 'The first. Reads every cut of her own thread before lock.' },
  { id: 'c-zsofia',    name: 'Zsófia Törőcsik',       role: 'Talent · international voice',     languages: ['hu','en'], notes: "The newcomer's eyes. Her English interviews carry the film abroad." },
];

/* ---------- Schedule phases + milestones ---------- */

export const SEED_SCHEDULE_PHASES: SchedulePhase[] = [
  { id: 'ph-dev',  label: 'Development',       start: '2025-11-01', end: '2026-03-31', lane: 0, color: '#5B7DA1' },
  { id: 'ph-krk',  label: 'Krk shoot',         start: '2026-04-01', end: '2026-04-07', lane: 1, color: '#4C7A8A' },
  { id: 'ph-sic',  label: 'Sicily shoot',      start: '2026-07-01', end: '2026-07-06', lane: 1, color: '#C88A5A' },
  { id: 'ph-las',  label: 'Lastovo shoot',     start: '2026-08-15', end: '2026-08-22', lane: 1, color: '#8FA57E' },
  { id: 'ph-cyp',  label: 'Cyprus shoot',      start: '2026-10-01', end: '2026-10-08', lane: 1, color: '#9E7A63' },
  { id: 'ph-post', label: 'Post-production',   start: '2026-11-01', end: '2027-06-30', lane: 2, color: '#4C6478' },
];

export const SEED_MILESTONES: Milestone[] = [
  { id: 'ms-krk',    label: 'Krk shoot complete', date: '2026-04-07', category: 'shoot-wrap',  status: 'done' },
  { id: 'ms-sicily', label: 'Sicily shoot complete', date: '2026-07-06', category: 'shoot-wrap', status: 'done' },
  { id: 'ms-lastovo',label: 'Lastovo shoot',      date: '2026-08-15', category: 'shoot-start' },
  { id: 'ms-cyprus', label: 'Cyprus shoot',       date: '2026-10-01', category: 'shoot-start' },
  { id: 'ms-sundance', label: 'Sundance deadline (target)', date: '2027-09-24', category: 'festival-deadline' },
];

/* ---------- Sponsors (empty for now) ---------- */

export const SEED_SPONSORS: Sponsor[] = [];

/* ---------- Risks (light) ---------- */

/* Empty per user feedback — add as they emerge */
export const SEED_RISKS: Risk[] = [];

/* ---------- Contracts (starter set) ---------- */

export const SEED_CONTRACTS: Contract[] = [
  { id: 'con-petar',  type: 'talent-release', partyName: 'Petar Klovar',       personKey: 'petar',  status: 'drafted', notes: 'Ongoing consent language + 2023-chapter veto clause.' },
  { id: 'con-vito',   type: 'talent-release', partyName: 'Vitomir Maričić',    personKey: 'vito',   status: 'drafted', notes: '' },
  { id: 'con-sanda',  type: 'talent-release', partyName: 'Sanda Delija',       personKey: 'sanda',  status: 'drafted', notes: '' },
  { id: 'con-zsofia', type: 'talent-release', partyName: 'Zsófia Törőcsik',    personKey: 'zsofia', status: 'drafted', notes: 'English-language release variant.' },
];

/* ---------- Journal (empty) ---------- */

export const SEED_JOURNAL: JournalEntry[] = [
  { id: 'j-sicily-etna', date: '2026-07-04', shootId: 'shoot-sicily', dayNum: 4, weather: 'Volcano · smoke plume · sea flat', whatHappened: 'Etna erupted during the shoot window. We were filming Vito at the lava fields when the mountain lit up. Turned the camera. The Bigger Swing #4 "Fire breathes in, water breathes out" is now real material.', moodTag: 'great' },
];

/* ---------- References (touchstones) ---------- */

export const SEED_REFERENCES: Reference[] = [
  { id: 'ref-1', type: 'film', title: 'Free Solo',                     director: 'Elizabeth Chai Vasarhelyi & Jimmy Chin', year: 2018, whyItMatters: "Solo pursuit of a physical impossible. Compare on the interior life of the athlete; contrast on our ensemble-of-four vs. solo-hero shape." },
  { id: 'ref-2', type: 'film', title: 'The Deepest Breath',            director: 'Laura McGann',                            year: 2023, whyItMatters: 'The closest genre precedent. Study the ways it did and did NOT hold the sport. Our film needs to be nothing like a companion piece to it — same discipline, entirely different soul.' },
  { id: 'ref-4', type: 'film', title: 'The Alpinist',                  director: 'Peter Mortimer & Nick Rosen',              year: 2021, whyItMatters: 'Silence, interiority, an athlete who resists narration. Reference for how we don\'t over-explain.' },
  { id: 'ref-6', type: 'paper',title: 'The CMAS code of ethics · Vertical Blue Case', author: 'Škerbić, Dikić, Andjelković, Žarković, Parry',            year: 2025, whyItMatters: 'The peer-reviewed footnoted case. Backbone of the 2023 chapter.' },
];

/* ---------- Festival targets (premiere strategy: Sundance world premiere →
   European premiere Berlinale / CPH:DOX → home-turf ZagrebDox after) ---------- */

export const SEED_FESTIVALS: FestivalSubmission[] = [
  { id: 'fest-sundance',  name: 'Sundance Film Festival',    city: 'Park City',   country: 'USA',         category: 'World Documentary Competition',   deadline: '2027-09-24', feeEur: 100, fitScore: 5, status: 'target', notes: 'World-premiere target #1. Free Solo / Deepest Breath territory.' },
  { id: 'fest-berlinale', name: 'Berlinale',                 city: 'Berlin',      country: 'Germany',     category: 'Panorama Dokumente',               deadline: '2027-10-15',              fitScore: 5, status: 'target', notes: 'European-premiere target. EU co-pro friendly.' },
  { id: 'fest-idfa',      name: 'IDFA',                      city: 'Amsterdam',   country: 'Netherlands', category: 'International Competition',        deadline: '2027-05-01', feeEur: 50,  fitScore: 5, status: 'target', notes: 'The doc cathedral. Alternative world-premiere play.' },
  { id: 'fest-cphdox',    name: 'CPH:DOX',                   city: 'Copenhagen',  country: 'Denmark',     category: 'Dox:Award',                        deadline: '2027-08-15', feeEur: 45,  fitScore: 4, status: 'target', notes: 'Bold-form friendly — the swings play well here.' },
  { id: 'fest-hotdocs',   name: 'Hot Docs',                  city: 'Toronto',     country: 'Canada',      category: 'International Spectrum',           deadline: '2026-12-10', feeEur: 60,  fitScore: 4, status: 'target', notes: 'North-American doc market attached.' },
  { id: 'fest-tribeca',   name: 'Tribeca Festival',          city: 'New York',    country: 'USA',         category: 'Documentary Competition',          deadline: '2027-01-10', feeEur: 90,  fitScore: 4, status: 'target', notes: 'US visibility + sports-doc appetite.' },
  { id: 'fest-visions',   name: 'Visions du Réel',           city: 'Nyon',        country: 'Switzerland', category: 'International Competition',        deadline: '2026-12-01', feeEur: 40,  fitScore: 4, status: 'target', notes: 'Author-doc prestige. Loves formal ambition.' },
  { id: 'fest-sheffield', name: 'Sheffield DocFest',         city: 'Sheffield',   country: 'UK',          category: 'International Competition',        deadline: '2027-02-15', feeEur: 55,  fitScore: 4, status: 'target', notes: 'UK broadcast doors open here.' },
  { id: 'fest-sxsw',      name: 'SXSW',                      city: 'Austin',      country: 'USA',         category: 'Documentary Spotlight',            deadline: '2026-10-20', feeEur: 80,  fitScore: 3, status: 'target', notes: 'Younger crowd — the science + body angle.' },
  { id: 'fest-dokleipzig',name: 'DOK Leipzig',               city: 'Leipzig',     country: 'Germany',     category: 'International Competition',        deadline: '2027-07-01', feeEur: 40,  fitScore: 3, status: 'target', notes: 'Strong German doc culture. Broadcaster scouts.' },
  { id: 'fest-thessaloniki', name: 'Thessaloniki Int. Doc Festival', city: 'Thessaloniki', country: 'Greece', category: 'International Competition',    deadline: '2027-11-01', feeEur: 30,  fitScore: 3, status: 'target', notes: 'Mediterranean identity — the sea is home ground.' },
  { id: 'fest-zagrebdox', name: 'ZagrebDox',                 city: 'Zagreb',      country: 'Croatia',     category: 'Regional Competition',             deadline: '2027-11-15',              fitScore: 4, status: 'target', notes: 'Home premiere — AFTER the international bow. The four walk in as heroes.' },
];

/* ---------- Sales agents + broadcasters (empty for now) ---------- */

export const SEED_SALES_AGENTS: SalesAgent[] = [];
export const SEED_BROADCASTERS: Broadcaster[] = [];

/* ---------- Spine · Ideas Workshop (v0.2 · expanded v0.7) ----------
   Candidate spines for the film's structure. Kanban: idea → discussing →
   leading → dropped. The leading ones graduate into locked structure. */

export const SEED_SPINE_IDEAS: SpineIdea[] = [
  {
    id: 'spine-idea-1',
    title: 'One person holds another in the world',
    body: "The film's north-star thesis. The bond that makes the impossible possible. Mentorship, trust, love — the people who see more in us than we see in ourselves.",
    status: 'leading',
    votes: 4,
    linkedThreadIds: ['t1'],
    createdAt: '2026-06-01',
    updatedAt: '2026-07-11',
  },
  {
    id: 'spine-idea-2',
    title: 'Open on fire, end in the dark',
    body: 'Etna opens the film — the loudest element on the planet. The bioluminescent coda closes it — the quietest. The whole film travels from eruption to glow, from the element that cannot stop to the people who can.',
    status: 'leading',
    votes: 3,
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-3',
    title: 'No narrator, no experts',
    body: 'Only the four voices and the body data. Nobody explains them from outside — not a scientist talking head, not a sports commentator. When the film needs authority, the ultrasound testifies.',
    status: 'leading',
    votes: 3,
    linkedThreadIds: ['t7'],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-4',
    title: 'Depth chapters — 0m · 30m · 60m · 90m · ∞',
    body: 'The film structured as one long dive. Chapter cards at depths instead of act numbers. Surface material lives at 0m; the 2023 chapter sits at the coldest depth; the coda is ∞ — past measuring.',
    status: 'discussing',
    votes: 2,
    linkedThreadIds: ['t2'],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-5',
    title: 'The returning-question matrix',
    body: "The same five questions asked at every shoot, across the whole year. The spine is the DRIFT — how the same person answers the same question differently after Sicily, after Lastovo, after the record passes. Time made audible.",
    status: 'discussing',
    votes: 2,
    linkedThreadIds: ['t1', 't8'],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-6',
    title: 'Cut on the breath',
    body: "Every scene transition lands on an exhale. The edit itself breathes — in for tension, out for release. The audience entrains to it without knowing why the film feels like a body.",
    status: 'discussing',
    votes: 1,
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-7',
    title: 'Zsófia narrates the way in',
    body: "The outsider's English VO opens each act — the one who can still see this world clearly. The insiders' Croatian deepens what she opens. Two languages, one staircase down.",
    status: 'idea',
    linkedThreadIds: ['t6'],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-8',
    title: '2023 told only in present tense',
    body: 'No retrospective framing, no "looking back at it now". The chapter plays as if it is happening — archival treated as present, the fear kept alive in the grammar itself.',
    status: 'idea',
    linkedThreadIds: ['t2'],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-9',
    title: 'The camera never goes below the diver',
    body: 'For the whole film the camera stays at or above the diver — the perspective of the one who waits. Only in the final dive does it sink past them. The audience earns the bottom.',
    status: 'idea',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-10',
    title: 'The surface interview',
    body: "Every sit-down filmed within sight of water — a window, a harbour, a pool edge. The sea always somewhere in frame: the film's unconscious.",
    status: 'idea',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 'spine-idea-11',
    title: 'Celebrity narrator',
    body: 'A recognisable international voice narrating the story. Dropped: breaks the intimacy, imports authority the film is explicitly refusing. See "no narrator, no experts".',
    status: 'dropped',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
];

/* ---------- Camera Team · Inventory ----------
   The real kit: 2× Sony A7 IV bodies, Sony E glass, Røde sound.
   Lights intentionally empty — add as they're acquired. */

export const SEED_CAMERAS: Camera[] = [
  { id: 'cam-a7iv-1', brand: 'Sony', model: 'A7 IV · Camera 1', kind: 'body', sensor: '33MP full-frame', maxResolution: '4K', maxFrameRate: '4K60 (S35) / 4K30 FF', ownership: 'owned', operatorId: 'c-kristijan', notes: 'Camera 1 · Kristijan. Lead camera — the face, the surface hero frames, interviews.' },
  { id: 'cam-a7iv-2', brand: 'Sony', model: 'A7 IV · Camera 2', kind: 'body', sensor: '33MP full-frame', maxResolution: '4K', maxFrameRate: '4K60 (S35) / 4K30 FF', ownership: 'owned', operatorId: 'c-toni',      notes: 'Camera 2 · Toni. Second angle — watchers + roam. Matched colour with Camera 1.' },
];

export const SEED_LENSES: Lens[] = [
  { id: 'lens-2470gm2',  brand: 'Sony', focal: '24-70mm',  maxAperture: 'f/2.8', mount: 'E', type: 'photo', characterNotes: 'GM II. The workhorse — interviews, docks, boats.',            ownership: 'owned',  operatorId: 'c-kristijan' },
  { id: 'lens-1635gm',   brand: 'Sony', focal: '16-35mm',  maxAperture: 'f/2.8', mount: 'E', type: 'photo', characterNotes: 'GM. Wide — boat interiors, the sea meeting the sky.',          ownership: 'owned',  operatorId: 'c-toni' },
  { id: 'lens-85f14',    brand: 'Sony', focal: '85mm',     maxAperture: 'f/1.4', mount: 'E', type: 'photo', characterNotes: 'GM. Faces. The watchers device lives on this glass.',          ownership: 'owned',  operatorId: 'c-kristijan' },
  { id: 'lens-70200gm2', brand: 'Sony', focal: '70-200mm', maxAperture: 'f/2.8', mount: 'E', type: 'photo', characterNotes: 'GM II. Long — the buoy from the boat, arrivals from shore.',   ownership: 'coming' },
];

export const SEED_MICS: Microphone[] = [
  { id: 'mic-rode-boom', brand: 'Røde', model: 'NTG5 boom',                    type: 'boom', channels: 1, ownership: 'owned', notes: 'Boom. Interviews + surface ambience.' },
  { id: 'mic-rode-lav',  brand: 'Røde', model: 'Wireless GO II + Lavalier II', type: 'lav',  channels: 2, ownership: 'owned', notes: 'Lav set. Breath-up voices, boat talk, watchers.' },
];

/* Lights — empty for now, per team decision. */
export const SEED_LIGHTS: Light[] = [];

/* ---------- Calendar Events (v0.11 — a serious production calendar) ----------
   The composed schedule also renders shoots + milestones as ghosts; these
   are the surrounding production reality: development, travel, post, festival
   deadlines, delivery — and the parallel September strands (the USA RV trip
   + Burning Man's last three days + a second-unit Sicily pickup shoot). */

export const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  /* Development + financing */
  { id: 'ce-dev',        title: 'Development + financing',        startDate: '2026-01-06', endDate: '2026-03-27', kind: 'meeting',  notes: 'Treatment lock · HAVC, EU MEDIA, HRT applications.' },
  { id: 'ce-havc',       title: 'HAVC pitch',                     startDate: '2026-02-18',                        kind: 'meeting',  notes: 'Main state-fund pitch.' },
  { id: 'ce-sponsor',    title: 'Sponsor + partner meetings',     startDate: '2026-05-04', endDate: '2026-05-08', kind: 'meeting',  notes: 'Molchanovs, Acrisure, gear partners.' },

  /* Travel legs */
  { id: 'ce-lastovo-tr', title: 'Travel to Lastovo',             startDate: '2026-08-14',                        kind: 'travel' },
  { id: 'ce-usa-trip',   title: 'USA road-trip (RV)',            startDate: '2026-09-01', endDate: '2026-09-27', kind: 'travel', personKeys: ['petar','vito','sanda','zsofia'], shootId: 'shoot-usa', notes: 'SF → Black Rock (Burning Man) → Sierra → Death Valley → Vegas → fly Cyprus.' },
  { id: 'ce-fly-cyprus', title: 'Fly USA → Cyprus',              startDate: '2026-09-27', endDate: '2026-09-28', kind: 'travel', notes: 'Main unit straight from Las Vegas to the Cyprus shoot.' },

  /* Parallel September shoot strands */
  { id: 'ce-burningman', title: 'Burning Man — last 3 days',     startDate: '2026-09-05', endDate: '2026-09-07', kind: 'shoot', personKeys: ['petar','vito','sanda','zsofia'], colorHint: '#c94a3a', notes: 'The Man + the Temple burn. Fire in the desert — echoes Etna. Filmed with the main unit on the road-trip.' },
  { id: 'ce-sicily-sep', title: 'Sicily · second-unit pickups',  startDate: '2026-09-10', endDate: '2026-09-14', kind: 'shoot', personKeys: ['sanda'], shootId: 'shoot-sicily', colorHint: '#d96c3d', notes: 'Parallel 5-day unit — Mediterranean pickups + interviews running while the main unit is in the USA.' },

  /* Post-production */
  { id: 'ce-assembly',   title: 'Assembly → rough cut',           startDate: '2026-11-02', endDate: '2027-02-26', kind: 'other',    notes: 'First assembly through rough cut.' },
  { id: 'ce-sound-color',title: 'Sound design + colour',          startDate: '2027-03-01', endDate: '2027-05-14', kind: 'other',    notes: 'The score built from real physiology; grade.' },
  { id: 'ce-lock',       title: 'Picture lock',                   startDate: '2027-05-15',                        kind: 'milestone' },

  /* Festival deadlines */
  { id: 'ce-visions',    title: 'Visions du Réel — deadline',     startDate: '2026-12-01',                        kind: 'milestone' },
  { id: 'ce-hotdocs',    title: 'Hot Docs — deadline',            startDate: '2026-12-10',                        kind: 'milestone' },
  { id: 'ce-idfa',       title: 'IDFA — deadline',                startDate: '2027-05-01',                        kind: 'milestone' },
  { id: 'ce-sundance',   title: 'Sundance — deadline',            startDate: '2027-09-24',                        kind: 'milestone', notes: 'Premiere target #1.' },

  /* Delivery */
  { id: 'ce-feat-deliv', title: 'Feature delivery · 90–100 min',  startDate: '2027-06-30',                        kind: 'delivery' },
  { id: 'ce-ser-deliv',  title: 'Series delivery · 3 episodes',   startDate: '2027-09-15',                        kind: 'delivery' },
];

/* ---------- Surface · who holds them (v0.6) ----------
   The thesis made literal. Some holders are people, some are places,
   objects, songs, rituals — all things that hold each of the Four
   in the world at the surface. */

export const SEED_HOLDERS: Holder[] = [
  /* Only what the script already establishes — the people and places the film
     is built on. No invented objects, songs or rituals. Add more as the real
     interviews and releases land. */

  /* PETAR — the gravity */
  { id: 'h-p-1', subjectKey: 'petar', kind: 'person', name: 'Zsófia',     relationship: 'partner',               oneLine: 'his partner — the room in the world he comes back to.', consent: 'pending', onCameraWilling: true, colorHint: '#e39a5b' },
  { id: 'h-p-2', subjectKey: 'petar', kind: 'person', name: 'Vito',       relationship: 'mentor, oldest friend', oneLine: 'the one who saw him first — before the records.', consent: 'pending', onCameraWilling: true, colorHint: '#3d7a94' },
  { id: 'h-p-3', subjectKey: 'petar', kind: 'place',  name: 'Rijeka',     relationship: 'hometown',              oneLine: 'the harbour that raised a beach-rescue kid into the sport.', consent: 'na', colorHint: '#4c7a8a' },

  /* VITO — the heart and mind */
  { id: 'h-v-1', subjectKey: 'vito',  kind: 'person', name: 'Sanda',        relationship: 'partner',                    oneLine: 'the woman who lets him be both coach and man.', consent: 'pending', onCameraWilling: true, colorHint: '#6f8a72' },
  { id: 'h-v-2', subjectKey: 'vito',  kind: 'person', name: 'Petar',        relationship: 'student who became teacher', oneLine: 'the one he might have left the sport without.', consent: 'pending', onCameraWilling: true, colorHint: '#d96c3d' },
  { id: 'h-v-3', subjectKey: 'vito',  kind: 'place',  name: 'University of Rijeka lab', relationship: 'where the science lives', oneLine: 'the room where he is subject and scientist at once.', consent: 'pending', colorHint: '#5b7da1' },
  { id: 'h-v-6', subjectKey: 'vito',  kind: 'person', name: 'His students', relationship: 'the champions he coaches',    oneLine: 'he coaches divers who out-dive him — that arithmetic is his peace.', consent: 'pending', colorHint: '#8fa57e' },

  /* SANDA — the first, the deep that's only hers */
  { id: 'h-s-1', subjectKey: 'sanda', kind: 'person', name: 'Vito',        relationship: 'partner and coach',    oneLine: 'the person who counts her down and lets her back up.', consent: 'pending', onCameraWilling: true, colorHint: '#3d7a94' },
  { id: 'h-s-2', subjectKey: 'sanda', kind: 'person', name: 'Zsófia',      relationship: 'closest friend in the sport', oneLine: 'the one who understands the deep the same way she does.', consent: 'pending', onCameraWilling: true, colorHint: '#e39a5b' },
  { id: 'h-s-3', subjectKey: 'sanda', kind: 'place',  name: 'Trieste',     relationship: 'chosen home',           oneLine: 'the city she made her home.', consent: 'na', colorHint: '#6f8a72' },
  { id: 'h-s-4', subjectKey: 'sanda', kind: 'place',  name: 'The bottom of the dive', relationship: 'the only place that is only hers', oneLine: 'below coaches, cameras and records — the place she cannot show anyone.', consent: 'na', colorHint: '#0b1b2e' },

  /* ZSÓFIA — the newcomer's eyes */
  { id: 'h-z-1', subjectKey: 'zsofia', kind: 'person', name: 'Petar',      relationship: 'partner',              oneLine: 'her partner in the sport and the deep.', consent: 'pending', onCameraWilling: true, colorHint: '#d96c3d' },
  { id: 'h-z-2', subjectKey: 'zsofia', kind: 'person', name: 'Sanda',      relationship: 'closest friend in the sport', oneLine: 'already deep when she arrived, and welcomed her anyway.', consent: 'pending', onCameraWilling: true, colorHint: '#6f8a72' },
  { id: 'h-z-4', subjectKey: 'zsofia', kind: 'place',  name: 'Hungary',    relationship: 'birthplace',           oneLine: 'the country she carries in her second passport and her English interviews.', consent: 'na', colorHint: '#e39a5b' },
  { id: 'h-z-7', subjectKey: 'zsofia', kind: 'place',  name: 'Malta · October 2022', relationship: 'the holiday that rerouted a life', oneLine: 'one snorkel in Malta and the pool career ended itself.', consent: 'na', colorHint: '#4c7a8a' },
];

/* ---------- Choir · same question × the four (v0.6) ---------- */

export const SEED_CHOIR_QUESTIONS: ChoirQuestion[] = [
  { id: 'cq1', text: 'What do you think about at ninety metres?',                                                createdAt: '2026-07-11T10:00:00Z' },
  { id: 'cq2', text: 'When you come back up, whose face do you want to see first?',                              createdAt: '2026-07-11T10:00:00Z' },
  { id: 'cq3', text: "What's the thing about this sport people outside it never understand?",                    createdAt: '2026-07-11T10:00:00Z' },
  { id: 'cq4', text: 'Do you love the deep, or do you need it?',                                                 createdAt: '2026-07-11T10:00:00Z' },
  { id: 'cq5', text: 'What did 2023 change in you?',                                                             createdAt: '2026-07-11T10:00:00Z' },
  { id: 'cq6', text: 'If a young diver asked what to fear — what would you tell them?',                          createdAt: '2026-07-11T10:00:00Z' },
];

/* Answers imagined for now — replace with real quotes as interviews land. */
export const SEED_CHOIR_ENTRIES: ChoirEntry[] = [
  /* Q1 — at 90m */
  { id: 'ce1', questionId: 'cq1', subjectKey: 'petar',  answer: 'Nothing. If I am thinking, I have brought something down with me that does not belong there.',                       source: 'imagined' },
  { id: 'ce2', questionId: 'cq1', subjectKey: 'vito',   answer: 'The heart rate. Always the heart rate. That is how you know if the body is with you or against you today.',           source: 'imagined' },
  { id: 'ce3', questionId: 'cq1', subjectKey: 'sanda',  answer: 'Nobody. That is the whole point. There is nobody down there and it is quiet and it is only mine.',                    source: 'imagined', isKey: true },
  { id: 'ce4', questionId: 'cq1', subjectKey: 'zsofia', answer: 'That I still cannot believe I get to be here. That is the honest answer. Even at ninety metres.',                     source: 'imagined' },
  /* Q2 — whose face first */
  { id: 'ce5', questionId: 'cq2', subjectKey: 'petar',  answer: 'Zsófia. Every time. And then Vito, because if Vito is calm I know it went well.',                                    source: 'imagined' },
  { id: 'ce6', questionId: 'cq2', subjectKey: 'vito',   answer: 'The safety diver first. That is the professional answer. Sanda second. That is the real one.',                        source: 'imagined' },
  { id: 'ce7', questionId: 'cq2', subjectKey: 'sanda',  answer: 'Vito. But not because I need him to say it was good. Because I need to see if he was afraid.',                        source: 'imagined', isKey: true },
  { id: 'ce8', questionId: 'cq2', subjectKey: 'zsofia', answer: "Petar. I look for Petar and I want to see him smile like he does when he's genuinely surprised.",                     source: 'imagined' },
  /* Q3 — outsiders never understand */
  { id: 'ce9',  questionId: 'cq3', subjectKey: 'petar',  answer: "That it is not brave. Bravery is a bad word for what we do. Preparation is the word.",                                source: 'imagined' },
  { id: 'ce10', questionId: 'cq3', subjectKey: 'vito',   answer: "That the science does not fully know why some of us come back and some do not. We live inside that gap.",             source: 'imagined', isKey: true },
  { id: 'ce11', questionId: 'cq3', subjectKey: 'sanda',  answer: 'That there is a place down there that has nothing to do with performance. That is the place I was going long before I was competing.', source: 'imagined' },
  { id: 'ce12', questionId: 'cq3', subjectKey: 'zsofia', answer: 'That you become good at it by getting comfortable with the moment where you have to trust something you cannot verify.', source: 'imagined' },
  /* Q4 — love or need */
  { id: 'ce13', questionId: 'cq4', subjectKey: 'petar',  answer: 'I love it. Need would be a heavier word than I am willing to carry.',                                                 source: 'imagined' },
  { id: 'ce14', questionId: 'cq4', subjectKey: 'vito',   answer: 'Need. I have thought about this. It is need. And I have made peace with it.',                                         source: 'imagined' },
  { id: 'ce15', questionId: 'cq4', subjectKey: 'sanda',  answer: 'I need the deep. I love the surface. Those are two different sentences.',                                             source: 'imagined', isKey: true },
  { id: 'ce16', questionId: 'cq4', subjectKey: 'zsofia', answer: 'I think I love it. Ask me in five more years.',                                                                       source: 'imagined' },
];

/* ---------- Life Mosaic · biographical timelines (v0.6 · researched v0.7) ----------
   Dates cross-checked against public record (DeeperBlue, Divernet, Guinness,
   AIDA, Molchanovs, World Games coverage). Canon-only events marked in notes. */

export const SEED_LIFE_EVENTS: LifeEvent[] = [
  /* PETAR — the gravity */
  { id: 'le-p-1',  subjectKey: 'petar',  year: 1994,            title: 'born · Rijeka',                                        category: 'birth',        significance: 5 },
  { id: 'le-p-2',  subjectKey: 'petar',  year: 2010,            title: 'beach rescue as a teenager',                           category: 'first-dive',   significance: 3, note: 'the sea as a job before it was a calling' },
  { id: 'le-p-3',  subjectKey: 'petar',  year: 2018,            title: 'first competitive freedive',                           category: 'first-dive',   significance: 3 },
  { id: 'le-p-4',  subjectKey: 'petar',  year: 2020,            title: 'meets Vito',                                           category: 'love',         significance: 4, note: 'the friendship that becomes the whole sport for him' },
  { id: 'le-p-5',  subjectKey: 'petar',  year: 2022,            title: 'first CNF world record · CMAS competition',            category: 'record',       significance: 4 },
  { id: 'le-p-6',  subjectKey: 'petar',  year: 2023, month: 7,  title: 'Vertical Blue · the storm',                            category: 'crisis',       significance: 5, note: 'the chapter no one sketches alone' },
  { id: 'le-p-7',  subjectKey: 'petar',  year: 2024,            title: 'partnership with Zsófia',                              category: 'love',         significance: 4 },
  { id: 'le-p-8',  subjectKey: 'petar',  year: 2025, month: 5,  title: "CNF 103m · Sharm el Sheikh — ends Trubridge's 17-year reign", category: 'record', significance: 5 },
  { id: 'le-p-9',  subjectKey: 'petar',  year: 2025, month: 6,  title: 'FIM world record · 135m',                              category: 'record',       significance: 5, note: 'the deepest a man has ever pulled himself' },
  { id: 'le-p-10', subjectKey: 'petar',  year: 2026, month: 7,  title: 'Sicily · Etna erupts during his monofin attempt',      category: 'breakthrough', significance: 5, note: 'the film opens here' },

  /* VITO — the heart and mind */
  { id: 'le-v-1',  subjectKey: 'vito',   year: 1985,            title: 'born · Rijeka',                                        category: 'birth',        significance: 5 },
  { id: 'le-v-2',  subjectKey: 'vito',   year: 1988,            title: 'first time under the Adriatic · age three',            category: 'first-dive',   significance: 4, note: 'diving from as young as three' },
  { id: 'le-v-3',  subjectKey: 'vito',   year: 2006,            title: 'first competitive freedive',                           category: 'first-dive',   significance: 3 },
  { id: 'le-v-4',  subjectKey: 'vito',   year: 2012,            title: 'joins University of Rijeka diving + hyperbaric centre', category: 'breakthrough', significance: 4 },
  { id: 'le-v-5',  subjectKey: 'vito',   year: 2017,            title: 'meets Sanda',                                          category: 'love',         significance: 5 },
  { id: 'le-v-7',  subjectKey: 'vito',   year: 2020,            title: 'nearly leaves the sport · Petar arrives',              category: 'crisis',       significance: 4 },
  { id: 'le-v-8',  subjectKey: 'vito',   year: 2021,            title: 'Guinness · 107m underwater walk on one breath',        category: 'record',       significance: 4 },
  { id: 'le-v-9',  subjectKey: 'vito',   year: 2022,            title: 'heads AIDA Croatia',                                   category: 'breakthrough', significance: 3, note: 'year approximate' },
  { id: 'le-v-10', subjectKey: 'vito',   year: 2023, month: 7,  title: 'the storm · branded by the sport he serves',           category: 'crisis',       significance: 5 },
  { id: 'le-v-11', subjectKey: 'vito',   year: 2025, month: 6,  title: 'Guinness · 29:03 static on O₂ · Opatija',              category: 'record',       significance: 5, note: '14 June · Bristol Hotel pool · five judges, one hundred spectators' },
  { id: 'le-v-12', subjectKey: 'vito',   year: 2027,            title: 'Hall of Fame induction · USA',                         category: 'joy',          significance: 5, note: 'recognition — the world correcting itself' },

  /* SANDA — the first */
  { id: 'le-s-1',  subjectKey: 'sanda',  year: 1989,            title: 'born · Split',                                         category: 'birth',        significance: 5 },
  { id: 'le-s-2',  subjectKey: 'sanda',  year: 2008,            title: 'first freedive',                                       category: 'first-dive',   significance: 3 },
  { id: 'le-s-3',  subjectKey: 'sanda',  year: 2015,            title: 'first of 12 national records',                         category: 'record',       significance: 4 },
  { id: 'le-s-4',  subjectKey: 'sanda',  year: 2017,            title: 'meets Vito',                                           category: 'love',         significance: 5 },
  { id: 'le-s-6',  subjectKey: 'sanda',  year: 2021,            title: 'two world-championship bronzes',                       category: 'record',       significance: 4, note: 'year approximate' },
  { id: 'le-s-7',  subjectKey: 'sanda',  year: 2023, month: 5,  title: 'FIM world record · 98m · Sharm el Sheikh',             category: 'record',       significance: 5, note: '3:58 dive time' },
  { id: 'le-s-8',  subjectKey: 'sanda',  year: 2023, month: 9,  title: 'moves to Trieste',                                     category: 'family',       significance: 4 },
  { id: 'le-s-9',  subjectKey: 'sanda',  year: 2025, month: 5,  title: 'FIM world record · 103m · Mabini, Philippines',        category: 'record',       significance: 5, note: 'among fewer than ten women ever past 100m' },
  { id: 'le-s-10', subjectKey: 'sanda',  year: 2026, month: 4,  title: 'the record passes to Zsófia',                          category: 'loss',         significance: 5, note: 'pride and loss in the same breath' },

  /* ZSÓFIA — the newcomer's eyes */
  { id: 'le-z-1',  subjectKey: 'zsofia', year: 1993,            title: 'born · Hungary',                                       category: 'birth',        significance: 5 },
  { id: 'le-z-2',  subjectKey: 'zsofia', year: 2012,            title: 'begins a decade of triathlon',                         category: 'breakthrough', significance: 3 },
  { id: 'le-z-3',  subjectKey: 'zsofia', year: 2022, month: 10, title: 'Malta · the holiday that reroutes everything',         category: 'travel',       significance: 5, note: 'one snorkel — the pool career ends itself' },
  { id: 'le-z-4',  subjectKey: 'zsofia', year: 2023,            title: 'switches to freediving for good',                      category: 'first-dive',   significance: 4 },
  { id: 'le-z-5',  subjectKey: 'zsofia', year: 2023, month: 8,  title: 'moves to Rijeka',                                      category: 'travel',       significance: 4 },
  { id: 'le-z-6',  subjectKey: 'zsofia', year: 2024,            title: 'partnership with Petar',                               category: 'love',         significance: 5 },
  { id: 'le-z-7',  subjectKey: 'zsofia', year: 2024,            title: 'DYNB 259m',                                            category: 'record',       significance: 3 },
  { id: 'le-z-8',  subjectKey: 'zsofia', year: 2025, month: 4,  title: 'DYN world record · 280m',                              category: 'record',       significance: 4 },
  { id: 'le-z-9',  subjectKey: 'zsofia', year: 2025, month: 8,  title: 'World Games Chengdu · 300m · first woman · gold',      category: 'record',       significance: 5 },
  { id: 'le-z-10', subjectKey: 'zsofia', year: 2026, month: 4,  title: "FIM 105m · takes her best friend's number",            category: 'record',       significance: 5, note: '20 April · absolute world record' },
];

/* ---------- Resonance · image echoes (v0.6) ----------
   Visual / aural / gestural chains that make the film feel woven. */

export const SEED_MOTIF_CHAINS: MotifChain[] = [
  {
    id: 'mc-1',
    title: 'hair through water',
    kind: 'visual',
    synopsis: 'the slow rise · a specific shape that echoes across all four surfaces',
    createdAt: '2026-07-11T10:00:00Z',
    items: [
      { id: 'mi-1-1', description: "Sanda's hair rising as she breaches, back-lit",          source: 'shoot',    sourceContext: 'Krk · surface hero',   colorHint: '#6f8a72' },
      { id: 'mi-1-2', description: "Zsófia's hair fanning at the top of the ascent",         source: 'shoot',    sourceContext: 'Lastovo · planned',    colorHint: '#e39a5b' },
      { id: 'mi-1-3', description: 'A fishing net catching sun in the same shape',           source: 'observed', sourceContext: 'Rijeka harbour', colorHint: '#7a5c4a' },
      { id: 'mi-1-4', description: 'Kelp moving with a current — held-breath tempo',         source: 'imagined', sourceContext: 'Coda opening',         colorHint: '#3d7a94' },
    ],
  },
  {
    id: 'mc-2',
    title: 'hand on shoulder',
    kind: 'gestural',
    synopsis: 'the small physical language of holding — before and after every dive',
    createdAt: '2026-07-11T10:00:00Z',
    items: [
      { id: 'mi-2-1', description: 'Vito touching Petar just before the descent',            source: 'shoot',    sourceContext: 'Sicily · Etna day',    colorHint: '#3d7a94' },
      { id: 'mi-2-2', description: "Sanda's hand on Zsófia's shoulder at the surface after her record", source: 'imagined', sourceContext: 'the record dive', colorHint: '#6f8a72' },
      { id: 'mi-2-3', description: 'A safety diver adjusting a strap without a word',        source: 'shoot',    sourceContext: 'Krk day 1',            colorHint: '#4c7a8a' },
      { id: 'mi-2-4', description: 'The moment two hands almost meet and stop',              source: 'imagined', sourceContext: '2023 chapter · Lastovo', colorHint: '#123c68' },
    ],
  },
  {
    id: 'mc-3',
    title: 'held breath in silhouette',
    kind: 'visual',
    synopsis: 'a body against light — the pause before movement',
    createdAt: '2026-07-11T10:00:00Z',
    items: [
      { id: 'mi-3-1', description: 'Vito on the lab table, chest paused, monitors above',    source: 'shoot',    sourceContext: 'Rijeka lab',           colorHint: '#5b7da1' },
      { id: 'mi-3-2', description: "Petar's silhouette on the rope before descent, sun above", source: 'imagined', sourceContext: 'Sicily opening',       colorHint: '#d96c3d' },
      { id: 'mi-3-3', description: 'Sanda seated, eyes closed, before the last practice run', source: 'shoot',    sourceContext: 'Krk day 2',            colorHint: '#6f8a72' },
    ],
  },
  {
    id: 'mc-4',
    title: 'sun through blue water',
    kind: 'chromatic',
    synopsis: "the film's core palette · every location returns to this signature",
    createdAt: '2026-07-11T10:00:00Z',
    items: [
      { id: 'mi-4-1', description: 'The specific cyan of Krk at ten metres',                 source: 'shoot',    sourceContext: 'Krk',                  colorHint: '#4c7a8a' },
      { id: 'mi-4-2', description: 'Coral rim of Etna reflected in shallow water',           source: 'shoot',    sourceContext: 'Sicily · Etna erupts', colorHint: '#d96c3d' },
      { id: 'mi-4-3', description: 'Bioluminescent glow at Coda night dive',                 source: 'imagined', sourceContext: 'Coda',                 colorHint: '#123c68' },
      { id: 'mi-4-4', description: 'Gold hour on Cyprus — the last colour Sanda mentions',   source: 'imagined', sourceContext: 'Cyprus',               colorHint: '#c9a961' },
    ],
  },
];

/* ---------- USA Trip (v0.9) ----------
   Sept 1–27, 2026. Fly into San Francisco, drive the Sierra + desert loop
   in a 6-berth RV, end in Las Vegas, fly straight to Cyprus. The route
   listed "the other way round" (SF → Yosemite → Mammoth → Death Valley →
   Vegas). Nights are a starting skeleton — edit freely. */

export const SEED_USA_TRIP: UsaTrip = {
  title: 'USA · the road-trip',
  startDate: '2026-09-01',
  endDate: '2026-09-27',
  startCity: 'San Francisco',
  endCity: 'Las Vegas',
  flyOnTo: 'Cyprus',
  people: 6,
  rvNote: '6-berth Class C RV. Fly into SFO, pick up the RV, catch the last 3 days of Burning Man, loop the Sierra + desert, drop in Las Vegas, fly LAS → Cyprus.',
  stops: [
    {
      id: 'stop-sf', name: 'San Francisco', role: 'start', nights: 3, driveMiles: 0, driveHours: 0,
      note: 'Fly into SFO, pick up the RV. The city, the bridge, and the cold Pacific — one last salt swim before the desert takes the water away.',
      colorHint: '#3d7a94', mapX: 12, mapY: 40,
      pois: [
        { id: 'poi-sf-1', name: 'Golden Gate Bridge', kind: 'sight',  detail: 'Sunrise from Battery Spencer', note: 'The opening frame of the American act.' },
        { id: 'poi-sf-2', name: 'Aquatic Park cold swim', kind: 'dive', detail: 'Protected bay cove, ~14°C', note: 'Open-water cold swim — the discipline, before the land takes over.' },
        { id: 'poi-sf-3', name: 'Muir Woods redwoods', kind: 'hike', detail: '~30 min north', note: 'Scale + silence. Vertical like the sea is deep.' },
        { id: 'poi-sf-4', name: 'Pick up the RV', kind: 'drive', detail: '6-berth Class C', note: 'The vehicle that becomes the fifth character.' },
      ],
    },
    {
      id: 'stop-blackrock', name: 'Black Rock Desert', role: 'stop', nights: 3, driveMiles: 330, driveHours: 5,
      note: 'The last three days of Burning Man. A white playa with no water at all — the anti-sea — and fire again: the Man and the Temple burn.',
      colorHint: '#c94a3a', mapX: 40, mapY: 15,
      pois: [
        { id: 'poi-br-1', name: 'The Man burns',    kind: 'sight', detail: 'Saturday night',        note: 'The centre of it all goes up — fire in the desert, echoing Etna.' },
        { id: 'poi-br-2', name: 'The Temple burns',  kind: 'sight', detail: 'Sunday night · silent', note: 'The quiet burn. Grief and release — the opposite of the Man.' },
        { id: 'poi-br-3', name: 'The playa',         kind: 'drive', detail: 'Black Rock dry lakebed', note: 'A body in a place with zero water. The desert as the deepest anti-dive.' },
        { id: 'poi-br-4', name: 'Deep playa art',    kind: 'sight', detail: 'Night bikes + installations', note: 'Wandering the dark among lit sculptures.' },
        { id: 'poi-br-5', name: 'Exodus',            kind: 'drive', detail: 'The long dusty line out', onTheWay: true, note: 'Leave the playa, turn south toward the Sierra.' },
      ],
    },
    {
      id: 'stop-yosemite', name: 'Yosemite NP', role: 'stop', nights: 5, driveMiles: 250, driveHours: 5,
      note: 'Granite verticality — Free Solo / Alpinist soil. Climbing country for Vito, and cold river pools to swim between walls.',
      colorHint: '#6f8a72', mapX: 40, mapY: 44,
      pois: [
        { id: 'poi-yo-1', name: 'El Capitan · The Nose',   kind: 'climb', detail: '900m granite big-wall',        note: "Free Solo's wall. Watch climbers from El Cap Meadow at dusk." },
        { id: 'poi-yo-2', name: 'Half Dome cables',        kind: 'hike',  detail: '16 mi round trip · permit',    note: 'The cables section — exposure and nerve, on land.' },
        { id: 'poi-yo-3', name: 'Tuolumne Meadows domes',  kind: 'climb', detail: 'Lembert & Pothole · alpine',   note: 'Gentler high-country granite for Vito to actually climb.' },
        { id: 'poi-yo-4', name: 'Swan Slab / Sunnyside',   kind: 'climb', detail: 'Beginner crags by Camp 4',     note: 'Where a first-timer ties in.' },
        { id: 'poi-yo-5', name: 'Merced River pools',      kind: 'dive',  detail: 'Cool pools below the falls',   note: 'A swim between the walls — water in the granite.' },
        { id: 'poi-yo-6', name: 'Glacier Point sunset',    kind: 'sight', detail: '2,200m overlook',             note: 'The whole valley from above.' },
        { id: 'poi-yo-7', name: 'Priest Grade approach',   kind: 'drive', detail: 'CA-120 switchbacks', onTheWay: true, note: 'The white-knuckle climb in — good driving footage.' },
      ],
    },
    {
      id: 'stop-mammoth', name: 'Mammoth Lakes', role: 'stop', nights: 4, driveMiles: 150, driveHours: 3.5,
      note: 'High alpine, thin air — altitude hypoxia connects straight to Vito’s science. Cold, clear lakes deeper than they look, at 2,500m.',
      colorHint: '#5b7da1', mapX: 51, mapY: 52,
      pois: [
        { id: 'poi-ma-1', name: 'Convict Lake dive',   kind: 'dive',  detail: '~43m deep · 2,300m altitude', note: 'Gin-clear, cold, DEEP. A real altitude dive — the science of thin air meets the deep.' },
        { id: 'poi-ma-2', name: 'Lake Mary',           kind: 'dive',  detail: 'Easy shore entry',            note: 'Largest of the basin — calm dive/swim.' },
        { id: 'poi-ma-3', name: 'Horseshoe Lake',      kind: 'dive',  detail: 'CO₂ tree-kill zone nearby',   note: 'Eerie dead-forest shoreline — an image.' },
        { id: 'poi-ma-4', name: 'June Lake Loop',      kind: 'drive', detail: '16 mi scenic loop',           note: 'Clear lakes strung along a canyon.' },
        { id: 'poi-ma-5', name: 'Crowley Lake columns',kind: 'sight', detail: 'Eroded stone pillars',        note: 'Alien columns on the shore — surreal frame.' },
        { id: 'poi-ma-6', name: 'Hot Creek geothermal',kind: 'sight', detail: 'Steaming blue springs',       note: 'Fire under the water — echoes Etna.' },
      ],
    },
    {
      id: 'stop-death', name: 'Death Valley NP', role: 'stop', nights: 2, driveMiles: 200, driveHours: 4,
      note: 'The anti-Adriatic — zero water, geological time, the lowest ground in North America. The four stand on the surface at its deepest floor.',
      colorHint: '#c9a961', mapX: 64, mapY: 63,
      pois: [
        { id: 'poi-dv-1', name: 'Badwater Basin',        kind: 'sight', detail: '−86 m · lowest in N. America', note: 'The inverse of a dive: the deepest point you reach by standing still on dry salt.' },
        { id: 'poi-dv-2', name: 'Zabriskie Point',       kind: 'sight', detail: 'Sunrise badlands',            note: 'The iconic first light.' },
        { id: 'poi-dv-3', name: "Dante's View",          kind: 'sight', detail: '1,600m over the basin',        note: 'The whole valley, 1,600m of relief in one frame.' },
        { id: 'poi-dv-4', name: 'Mesquite Flat Dunes',   kind: 'hike',  detail: 'Walk the sunrise dunes',       note: 'Bodies on sand where there should be sea.' },
        { id: 'poi-dv-5', name: "Artist's Palette drive", kind: 'drive', detail: '9 mi · mineral colours',      note: 'A road of impossible colours.' },
        { id: 'poi-dv-6', name: 'Alabama Hills, Lone Pine',kind: 'climb', detail: 'Mobius Arch · film country', onTheWay: true, note: 'On the way in — Mars-like boulders, a hundred Westerns shot here. Scramble + arch sunrise.' },
      ],
    },
    {
      id: 'stop-vegas', name: 'Las Vegas', role: 'end', nights: 2, driveMiles: 120, driveHours: 2,
      note: 'Drop the RV, then fly directly to Cyprus for the next shoot. One last wall on the way in for Vito.',
      colorHint: '#d96c3d', mapX: 82, mapY: 72,
      pois: [
        { id: 'poi-lv-1', name: 'Red Rock Canyon',      kind: 'climb', detail: 'World-class sandstone · 30 min', note: 'One more wall for Vito, minutes from the Strip.' },
        { id: 'poi-lv-2', name: 'Rhyolite ghost town',  kind: 'sight', detail: 'Goldwell open-air museum', onTheWay: true, note: 'On the way in — a dead mining town + eerie sculptures.' },
        { id: 'poi-lv-3', name: 'Drop the RV',          kind: 'drive', detail: 'One-way return',              note: 'The road-trip ends.' },
        { id: 'poi-lv-4', name: 'Fly LAS → Cyprus',     kind: 'other', detail: 'Long-haul + connection',      note: 'Straight from desert to the Mediterranean.' },
      ],
    },
  ],
  days: [
    { id: 'day-1',  dayNum: 1,  date: '2026-09-01', stopId: 'stop-sf',        title: 'Fly into San Francisco',          plan: 'Land at SFO, settle, first night in the city.' },
    { id: 'day-2',  dayNum: 2,  date: '2026-09-02', stopId: 'stop-sf',        title: 'San Francisco',                    plan: 'Golden Gate at sunrise, a cold swim at Aquatic Park — the last salt water for a while.' },
    { id: 'day-3',  dayNum: 3,  date: '2026-09-03', stopId: 'stop-sf',        title: 'Pick up the RV',                   plan: 'Collect the 6-berth RV, provision, Muir Woods on the way out.' },
    { id: 'day-4',  dayNum: 4,  date: '2026-09-04', stopId: 'stop-blackrock', title: 'Drive to Black Rock Desert',       plan: 'SF → Reno → the playa. Enter Burning Man.', driveMiles: 330 },
    { id: 'day-5',  dayNum: 5,  date: '2026-09-05', stopId: 'stop-blackrock', title: 'Burning Man — the Man burns',      plan: 'The last full day. The Man burns tonight — fire in the desert.' },
    { id: 'day-6',  dayNum: 6,  date: '2026-09-06', stopId: 'stop-blackrock', title: 'Burning Man — the Temple burns',   plan: 'The silent burn. Grief and release.' },
    { id: 'day-7',  dayNum: 7,  date: '2026-09-07', stopId: 'stop-blackrock', title: 'Exodus',                           plan: 'Leave the playa, drive south toward the Sierra.', driveMiles: 250 },
    { id: 'day-8',  dayNum: 8,  date: '2026-09-08', stopId: 'stop-yosemite',  title: 'Arrive Yosemite',                  plan: 'Into the valley. El Cap Meadow at dusk.', driveMiles: 120 },
    { id: 'day-9',  dayNum: 9,  date: '2026-09-09', stopId: 'stop-yosemite',  title: 'Yosemite — the walls',             plan: 'El Capitan, watch the climbers. Vito on the granite.' },
    { id: 'day-10', dayNum: 10, date: '2026-09-10', stopId: 'stop-yosemite',  title: 'Yosemite — Tuolumne',              plan: 'Tuolumne Meadows domes — Vito actually climbs.' },
    { id: 'day-11', dayNum: 11, date: '2026-09-11', stopId: 'stop-yosemite',  title: 'Yosemite — water + light',         plan: 'Merced River swim, Glacier Point sunset.' },
    { id: 'day-12', dayNum: 12, date: '2026-09-12', stopId: 'stop-yosemite',  title: 'Yosemite — Half Dome / rest',      plan: 'Optional Half Dome cables, or a rest day.' },
    { id: 'day-13', dayNum: 13, date: '2026-09-13', stopId: 'stop-mammoth',   title: 'Drive to Mammoth (Tioga Pass)',    plan: 'Over Tioga into the high country.', driveMiles: 140 },
    { id: 'day-14', dayNum: 14, date: '2026-09-14', stopId: 'stop-mammoth',   title: 'Mammoth — Convict Lake',           plan: 'The altitude dive: cold, deep, gin-clear at 2,300m.' },
    { id: 'day-15', dayNum: 15, date: '2026-09-15', stopId: 'stop-mammoth',   title: 'Mammoth — the lakes',              plan: 'Lake Mary, Horseshoe Lake.' },
    { id: 'day-16', dayNum: 16, date: '2026-09-16', stopId: 'stop-mammoth',   title: 'Mammoth — June Loop',              plan: 'June Lake Loop, Crowley columns.' },
    { id: 'day-17', dayNum: 17, date: '2026-09-17', stopId: 'stop-mammoth',   title: 'Mammoth — rest / Hot Creek',       plan: 'Hot Creek geothermal, recovery day.' },
    { id: 'day-18', dayNum: 18, date: '2026-09-18', stopId: 'stop-death',     title: 'Drive to Death Valley',            plan: 'Down US-395 via Lone Pine + Alabama Hills.', driveMiles: 200 },
    { id: 'day-19', dayNum: 19, date: '2026-09-19', stopId: 'stop-death',     title: 'Death Valley — Badwater',          plan: 'Badwater Basin −86m, Zabriskie sunrise.' },
    { id: 'day-20', dayNum: 20, date: '2026-09-20', stopId: 'stop-death',     title: 'Death Valley — the void',          plan: "Dante's View, dunes at dawn, Artist's Palette." },
    { id: 'day-21', dayNum: 21, date: '2026-09-21', stopId: 'stop-vegas',     title: 'Drive to Las Vegas',               plan: 'Via Rhyolite ghost town.', driveMiles: 120 },
    { id: 'day-22', dayNum: 22, date: '2026-09-22', stopId: 'stop-vegas',     title: 'Vegas — Red Rock',                 plan: 'Red Rock Canyon climbing, one last wall for Vito.' },
    { id: 'day-23', dayNum: 23, date: '2026-09-23', stopId: 'stop-vegas',     title: 'Buffer / footage dump',            plan: 'Back up cards, rest, regroup.' },
    { id: 'day-24', dayNum: 24, date: '2026-09-24', stopId: 'stop-vegas',     title: 'Pickups + interviews',             plan: 'Road-trip interviews, reflection pieces.' },
    { id: 'day-25', dayNum: 25, date: '2026-09-25', stopId: 'stop-vegas',     title: 'Drop the RV',                      plan: 'Return the RV, into a hotel.' },
    { id: 'day-26', dayNum: 26, date: '2026-09-26', stopId: 'stop-vegas',     title: 'Vegas — pack',                     plan: 'Final pickups, pack the gear for the flight.' },
    { id: 'day-27', dayNum: 27, date: '2026-09-27', stopId: 'stop-vegas',     title: 'Fly Las Vegas → Cyprus',           plan: 'Straight from desert to the Mediterranean and the next shoot.' },
  ],
  costs: [
    { id: 'cost-rv',     label: 'RV rental (6-berth · incl. one-way drop)', category: 'rv',    amountUsd: 4000, per: 'trip',  notes: 'Whole-trip 6-berth Class C, one-way SF→Vegas.' },
    { id: 'cost-fuel',   label: 'Fuel (~1200 mi @ ~9 mpg)',      category: 'fuel',      amountUsd: 620, per: 'trip',   notes: 'Class C is thirsty; California gas is dear.' },
    { id: 'cost-camp',   label: 'RV parks / campgrounds',        category: 'camp',      amountUsd: 65,  per: 'night' },
    { id: 'cost-food',   label: 'Food (group, per day)',         category: 'food',      amountUsd: 210, per: 'day',    notes: '~$35/person/day × 6.' },
    { id: 'cost-parks',  label: 'America the Beautiful park pass',category: 'park',      amountUsd: 80,  per: 'trip' },
    /* Flights are deliberately out of this tracker — it costs the road-trip
       on the ground. Air fare is budgeted elsewhere. */
    { id: 'cost-ins',    label: 'RV insurance + roadside',       category: 'insurance', amountUsd: 40,  per: 'day' },
    { id: 'cost-gear',   label: 'Production + activities buffer', category: 'gear',      amountUsd: 1500, per: 'trip',  notes: 'Permits, park filming, gear, contingencies.' },
  ],
};

/* ---------- Interviews (v0.8 — seeded with location groups + follow-up chains) ----------
   Krk sessions are captured+transcribed; Sicily captured; Lastovo holds the
   planned follow-ups, chained via followUpOfId so nothing asked once dies there. */

export const SEED_INTERVIEWS: Interview[] = [
  /* Krk · April 2026 · the "before" */
  { id: 'int-krk-petar',  shootId: 'shoot-krk', personKey: 'petar',  setting: 'shore',    date: '2026-04-03', durationMin: 55, status: 'transcribed', threadIds: ['t1', 't3'], topicIds: ['top-bond', 'top-record'],       standoutQuotes: ['Vito saw me before the records did.'] },
  { id: 'int-krk-vito',   shootId: 'shoot-krk', personKey: 'vito',   setting: 'boat',     date: '2026-04-04', durationMin: 70, status: 'transcribed', threadIds: ['t1', 't7'], topicIds: ['top-bond', 'top-body'],         standoutQuotes: ['I coach people to leave me behind. That is the job.'] },
  { id: 'int-krk-sanda',  shootId: 'shoot-krk', personKey: 'sanda',  setting: 'home',     date: '2026-04-05', durationMin: 60, status: 'transcribed', threadIds: ['t4', 't5'], topicIds: ['top-deep', 'top-friendship'],   standoutQuotes: ['The bottom is the only room with no one else in it.'] },
  { id: 'int-krk-zsofia', shootId: 'shoot-krk', personKey: 'zsofia', setting: 'poolside', date: '2026-04-05', durationMin: 50, status: 'transcribed', threadIds: ['t6'],       topicIds: ['top-outsider'],                 standoutQuotes: ["Three years ago I couldn't equalise. Nobody here lets me forget how lucky that makes me."] },

  /* Sicily · July 2026 · around the attempt + the volcano */
  { id: 'int-sic-petar',  shootId: 'shoot-sicily', personKey: 'petar', setting: 'shore',   date: '2026-07-05', durationMin: 40, status: 'captured', threadIds: ['t3', 't8'],  topicIds: ['top-record', 'top-fear'], eventIds: ['ev-etna'], standoutQuotes: ["The mountain wouldn't stop breathing. So I did."] },
  { id: 'int-sic-vito',   shootId: 'shoot-sicily', personKey: 'vito',  setting: 'volcano', date: '2026-07-04', durationMin: 35, status: 'captured', threadIds: ['t8', 't10'], topicIds: ['top-fear', 'top-longdeep'], eventIds: ['ev-etna'], notes: 'The volcano interview — swing #7. Golden hour on the cooled lava.' },

  /* Lastovo · August 2026 · planned follow-ups (chained) */
  { id: 'int-las-petar',  shootId: 'shoot-lastovo', personKey: 'petar', setting: 'boat',  date: '2026-08-17', status: 'planned', threadIds: ['t1', 't2'], topicIds: ['top-bond', 'top-2023'],      followUpOfId: 'int-krk-petar',  notes: 'Follow-up: Krk answers on the bond, now with 2023 open — only if right.' },
  { id: 'int-las-sanda',  shootId: 'shoot-lastovo', personKey: 'sanda', setting: 'shore', date: '2026-08-18', status: 'planned', threadIds: ['t5', 't2'], topicIds: ['top-friendship', 'top-2023'], followUpOfId: 'int-krk-sanda',  notes: 'Follow-up on the deep + the friendship, now with 2023 open.' },
  { id: 'int-las-together', shootId: 'shoot-lastovo', personKey: 'together', setting: 'boat', date: '2026-08-20', status: 'planned', threadIds: ['t2'],   topicIds: ['top-2023'], eventIds: ['ev-storm'], notes: 'The four together. The 2023 conversation — never pushed, only if the week says yes.' },
];

/* ---------- Pitch Deck (v0.14) — the card library + starter decks ----------
   Each card is a self-contained one-pager; the data-bound kinds (four, records,
   etna, visual, team, comparables, budget, festivals, schedule, contact) pull
   live from the workbook so the pitch never goes stale. Compose them into the
   audience decks below, then Present or export to send. */

export const SEED_PITCH_CARDS: PitchCard[] = [
  {
    id: 'pc-cover', kind: 'cover', kicker: 'a feature documentary + 3-part series',
    title: 'Deep Dive',
    body: 'One person holds another in the world. Four of the best freedivers alive — one mentor, two couples, a record passed between best friends. Not a film about depth. A film about who waits for you at the surface.',
    imageNote: 'Full-bleed opener: a body slipping under into blue silence — or Etna lava meeting the cold sea.',
    accent: '#d96c3d', audiences: ['sponsor', 'coproducer', 'fund', 'broadcaster', 'festival', 'general'],
  },
  {
    id: 'pc-logline', kind: 'logline', kicker: 'the logline',
    title: 'Not a film about depth.',
    body: 'Four of the best freedivers alive. One mentor, two couples, a record passed between best friends. Not a film about depth — a film about who waits for you at the surface.',
    accent: '#3d7a94', audiences: ['general', 'festival', 'coproducer', 'broadcaster'],
  },
  {
    id: 'pc-thesis', kind: 'thesis', kicker: 'what it is really about',
    title: 'One person holds another in the world.',
    body: 'Every dive is a duet. One goes into the dark; another stays at the surface, breathing for them both. The film lives on that line — the bond that makes the impossible survivable. The records are the occasion; the holding is the story.',
    accent: '#d96c3d', audiences: ['general', 'festival', 'fund', 'coproducer'],
  },
  {
    id: 'pc-four', kind: 'four', kicker: 'the four',
    title: 'One mentor. Two couples. Four champions.',
    body: 'Really one unit — the mentor at the centre of all four, two couples, and the rare friendship of two women who have both been past 100 metres.',
    accent: '#6f8a72', audiences: ['sponsor', 'coproducer', 'fund', 'broadcaster', 'festival', 'general'],
  },
  {
    id: 'pc-records', kind: 'records', kicker: 'why these four',
    title: 'World records, inside one cast.',
    body: 'A 17-year no-fins wall broken. A Guinness 29-minute breath-hold. The first Croatian woman past 100 metres. The first woman ever to 300m in a pool. All current, all within the production window — the film stays news through the entire festival cycle.',
    accent: '#b54f26', audiences: ['sponsor', 'festival', 'broadcaster', 'coproducer'],
  },
  {
    id: 'pc-stakes', kind: 'stakes', kicker: 'why now',
    title: 'This alignment will not hold.',
    body: 'Four of the best in the world are at their peak at the same moment, in the same circle, in the same sea. We shoot the sport as it actually happens — real attempts, real records, real risk — from the inside, not in reconstruction. The window is now.',
    accent: '#8a3a2e', audiences: ['coproducer', 'fund', 'festival'],
  },
  {
    id: 'pc-etna', kind: 'etna', kicker: 'already captured',
    title: 'The most expensive image already exists.',
    body: 'Etna erupted during our Sicily shoot. Real lava, real steam, cut against a body going silent under the water. A de-risked film with a miracle already in the can.',
    imageNote: 'The Etna eruption plate — lava rivers meeting cold sea, steam screaming — hard-cut to a single body sinking.',
    accent: '#d96c3d', audiences: ['sponsor', 'coproducer', 'festival', 'broadcaster', 'fund'],
  },
  {
    id: 'pc-visual', kind: 'visual', kicker: 'the formal ambition',
    title: 'The score is their own bodies.',
    body: 'A soundtrack built from real physiology — a 24-beat heart, blood-oxygen falling. A full record dive in unbroken real time. A descent monologue braided across two languages. Fire breathes in, water breathes out.',
    accent: '#3d7a94', audiences: ['festival', 'coproducer', 'fund'],
  },
  {
    id: 'pc-arc', kind: 'arc', kicker: 'the shape',
    title: 'Branded, then enshrined.',
    body: '2023 tried to break them — an accusation, a suspension, every test negative, their own federation refusing to ban them. The film closes with a Hall of Fame induction in America: the same world that doubted them, standing to applaud. Told with the athletes, never about them — backed by a peer-reviewed paper, not tabloid framing.',
    accent: '#2f4b6e', audiences: ['festival', 'fund', 'coproducer'],
  },
  {
    id: 'pc-access', kind: 'access', kicker: 'why us',
    title: 'From inside the sport, not above it.',
    body: 'The camera films with the safety team, not from the boat. The mentor is on our crew as scientific advisor; the athletes read their own threads before lock. This is access no outside crew can buy — trust built over years, releases in progress.',
    accent: '#6f8a72', audiences: ['coproducer', 'fund', 'festival'],
  },
  {
    id: 'pc-team', kind: 'team', kicker: 'the makers',
    title: 'A small crew, deep inside.',
    body: 'A lean film-side team, the four as story collaborators, and a scientific partner at the University of Rijeka centre for diving and hyperbaric medicine.',
    accent: '#5b7da1', audiences: ['coproducer', 'fund'],
  },
  {
    id: 'pc-comparables', kind: 'comparables', kicker: 'where it sits',
    title: 'Ensemble, where others chase one obsession.',
    body: 'Free Solo and The Deepest Breath follow a single hero. Deep Dive follows a bond — one mentor, two couples, a record that passed between best friends and did not break them. Same shelf, different soul.',
    accent: '#4c6b93', audiences: ['coproducer', 'broadcaster', 'festival', 'fund'],
  },
  {
    id: 'pc-budget', kind: 'budget', kicker: 'the number',
    title: 'A moving train, not a pitch on paper.',
    body: 'Development self-financed. Two of seven shoots already shot. What we are raising, and against what — at a glance.',
    accent: '#c9a961', audiences: ['sponsor', 'coproducer', 'fund'],
  },
  {
    id: 'pc-festivals', kind: 'festivals', kicker: 'premiere strategy',
    title: 'World premiere, then home.',
    body: 'World premiere international, European premiere at a top doc festival, home premiere in Zagreb after the international bow. The cast holds current records — the film stays newsworthy across the whole cycle.',
    accent: '#c9a961', audiences: ['festival', 'coproducer', 'fund', 'broadcaster'],
  },
  {
    id: 'pc-schedule', kind: 'schedule', kicker: 'status',
    title: 'Footage exists, not promises.',
    body: 'Two of seven shoots complete — Krk and Sicily, with the Etna opening captured. The rest are scheduled and cast-locked.',
    accent: '#4c7a8a', audiences: ['sponsor', 'coproducer', 'fund', 'broadcaster'],
  },
  {
    id: 'pc-offer-sponsor', kind: 'offer', kicker: 'the partnership',
    title: 'What a title partner gets.',
    body: 'Category-exclusive title billing across the theatrical + festival run. Gear and travel partners in-kind against credits, with behind-the-scenes content and athlete access. Each of the four carries their own audience and record headlines — partnerships can attach at the film level or the athlete level.',
    accent: '#9e7a63', audiences: ['sponsor'],
  },
  {
    id: 'pc-offer-copro', kind: 'offer', kicker: 'the co-production',
    title: 'What a co-producer gets.',
    body: 'A stake in a de-risked, mid-production feature + series with a clear festival path and a bilingual master. Qualifying Croatian spend concentrated in Rijeka, Krk, Lastovo and Zagreb, with a national rebate on top. Territory, service and structure open to discuss.',
    accent: '#5b7da1', audiences: ['coproducer', 'fund'],
  },
  {
    id: 'pc-contact', kind: 'contact', kicker: 'let us talk',
    title: 'Deep Dive · 2026',
    body: 'Say the word and we will send the full deck, the Etna sequence, and the current cut of the sizzle.',
    accent: '#0a2b4f', audiences: ['sponsor', 'coproducer', 'fund', 'broadcaster', 'festival', 'general'],
  },
];

export const SEED_PITCH_DECKS: PitchDeck[] = [
  {
    id: 'pd-sponsor', name: 'Sponsor / brand partner', audience: 'sponsor',
    note: 'For a title or gear partner — the audience, the news cycle, and the ask.',
    cardIds: ['pc-cover', 'pc-logline', 'pc-four', 'pc-records', 'pc-etna', 'pc-stakes', 'pc-offer-sponsor', 'pc-contact'],
    accent: '#9e7a63', updatedAt: '2026-07-13T10:00:00Z',
  },
  {
    id: 'pd-copro', name: 'Co-production', audience: 'coproducer',
    note: 'For a co-producer / production partner — the film, the ambition, the numbers.',
    cardIds: ['pc-cover', 'pc-thesis', 'pc-four', 'pc-visual', 'pc-arc', 'pc-access', 'pc-comparables', 'pc-schedule', 'pc-budget', 'pc-offer-copro', 'pc-contact'],
    accent: '#5b7da1', updatedAt: '2026-07-13T10:00:00Z',
  },
  {
    id: 'pd-fund', name: 'Public fund (HAVC · EU MEDIA)', audience: 'fund',
    note: 'For a national / European fund — cultural value, team, budget, festival path.',
    cardIds: ['pc-cover', 'pc-thesis', 'pc-four', 'pc-arc', 'pc-access', 'pc-team', 'pc-schedule', 'pc-budget', 'pc-festivals', 'pc-contact'],
    accent: '#4c7a8a', updatedAt: '2026-07-13T10:00:00Z',
  },
  {
    id: 'pd-broadcaster', name: 'Broadcaster / streamer', audience: 'broadcaster',
    note: 'For a broadcaster or streamer — format, cast, comparables, market.',
    cardIds: ['pc-cover', 'pc-logline', 'pc-four', 'pc-records', 'pc-comparables', 'pc-schedule', 'pc-festivals', 'pc-contact'],
    accent: '#c9a961', updatedAt: '2026-07-13T10:00:00Z',
  },
];

/* ---------- Initial state factory ---------- */

export function makeInitialState(): AppState {
  return {
    activeScenario: 'realistic',
    activeView: 'overview',
    scenarios: SCENARIOS,
    four: SEED_FOUR,
    talents: SEED_TALENTS,
    threads: SEED_THREADS,
    threadQuestions: SEED_THREAD_QUESTIONS,
    spineIdeas: SEED_SPINE_IDEAS,
    shoots: SEED_SHOOTS,
    shootDays: SEED_SHOOT_DAYS,
    coverageCams: SEED_COVERAGE_CAMS,
    interviews: SEED_INTERVIEWS,
    swings: SEED_SWINGS,
    devices: SEED_DEVICES,
    rituals: [],
    watcherMoments: SEED_WATCHER_MOMENTS,
    records: SEED_RECORDS,
    attempts: [],
    physiology: SEED_PHYSIOLOGY,
    evidence2023: SEED_EVIDENCE_2023,
    cameras: SEED_CAMERAS,
    lenses: SEED_LENSES,
    microphones: SEED_MICS,
    lights: SEED_LIGHTS,
    crew: SEED_CREW,
    schedulePhases: SEED_SCHEDULE_PHASES,
    milestones: SEED_MILESTONES,
    calendarEvents: SEED_CALENDAR_EVENTS,
    holders: SEED_HOLDERS,
    choirQuestions: SEED_CHOIR_QUESTIONS,
    choirEntries: SEED_CHOIR_ENTRIES,
    lifeEvents: SEED_LIFE_EVENTS,
    motifChains: SEED_MOTIF_CHAINS,
    storyEvents: SEED_STORY_EVENTS,
    topics: SEED_TOPICS,
    hubIdeas: SEED_HUB_IDEAS,
    usaTrip: SEED_USA_TRIP,
    sponsors: SEED_SPONSORS,
    risks: SEED_RISKS,
    contracts: SEED_CONTRACTS,
    journalEntries: SEED_JOURNAL,
    references: SEED_REFERENCES,
    festivals: SEED_FESTIVALS,
    salesAgents: SEED_SALES_AGENTS,
    broadcasters: SEED_BROADCASTERS,
    pitchCards: SEED_PITCH_CARDS,
    pitchDecks: SEED_PITCH_DECKS,
    tasks: [],
    notes: [],
    assets: [],
    selectedPersonKey: null,
    selectedShootId: null,
    selectedThreadId: null,
    printMode: false,
    paletteOpen: false,
    captureOpen: false,
    locale: 'en',
  };
}
