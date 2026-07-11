/* Deep Dive · 2026 — seed data
   All entities derived from The Film Bible, Interview Architecture,
   Sicily Shooting Bible, and The 2023 Chapter working paper. */

import type {
  AppState,
  BiggerSwing,
  Broadcaster,
  Camera,
  CashflowQuarter,
  Contract,
  CoverageCam,
  CostCategoryMeta,
  CrewMember,
  DivingRecord,
  Evidence2023,
  FestivalSubmission,
  FundingSourceMeta,
  GrammarDevice,
  Interview,
  JournalEntry,
  Lens,
  Light,
  Microphone,
  Milestone,
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
  Talent,
  TalentFour,
  Thread,
  ThreadQuestion,
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
  lean:       { episodes: 3, funding: { havc: 40, hrt: 30, eu: 60, sponsors: 40, sports: 20, rebate: 20 }, costs: { dev: 20, prod: 90, post: 60, sound: 30, legal: 15, travel: 40, safety: 15, mkt: 20, gna: 10 }, cashflow: emptyCashflow, qualifyingSpendPct: 55, blendedRebateRate: 25 },
  realistic:  { episodes: 3, funding: { havc: 60, hrt: 50, eu: 100, sponsors: 80, sports: 40, rebate: 40 }, costs: { dev: 30, prod: 140, post: 90, sound: 50, legal: 25, travel: 60, safety: 25, mkt: 40, gna: 20 }, cashflow: emptyCashflow, qualifyingSpendPct: 60, blendedRebateRate: 25 },
  ambitious:  { episodes: 3, funding: { havc: 80, hrt: 70, eu: 140, sponsors: 120, sports: 60, rebate: 60 }, costs: { dev: 40, prod: 200, post: 140, sound: 80, legal: 40, travel: 90, safety: 40, mkt: 80, gna: 30 }, cashflow: emptyCashflow, qualifyingSpendPct: 65, blendedRebateRate: 25 },
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
  },
  {
    id: 'four-sanda',
    key: 'sanda',
    name: 'Sanda Delija',
    role: 'the first, and a champion in her own right',
    nationality: 'Croatian',
    hometown: 'Trieste',
    languagePrimary: 'hr',
    epithet: 'the first Croatian woman past 100m',
    bio: 'Former free-immersion world-record holder. Multiple national champion. Coached by Vito, partnered with him — and best friends with Zsófia, the woman who took her record. Never "a partner who dives" — a world-record holder whose story the film is determined to tell with its full weight.',
    arcNote: 'the deep that belongs only to her',
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
    bio: "Triathlete three years ago, now a free-immersion world-record holder at 105m — one metre deeper than the most celebrated woman in the sport — and holder of multiple dynamic records, first woman past 300m in a pool. Petar's partner. Sanda's best friend. Her interviews are in English — a second nationality threading the film international.",
    arcNote: "the audience's way in · the wonder, the trust, the discovery",
  },
];

/* ---------- Talent adjacent to The Four ---------- */
/* Empty for now — Borna out per user feedback; add ideas incrementally. */

export const SEED_TALENTS: Talent[] = [];

/* ---------- The 10 Threads ---------- */

export const SEED_THREADS: Thread[] = [
  { id: 't1',  num: 1,  title: 'The four, and what\'s between them',            subtitle: 'the soul',                                    owner: 'ensemble',       synopsis: 'One mentor, two couples, a record passed between best friends — really one unit.', status: 'active' },
  { id: 't2',  num: 2,  title: '2023',                                          subtitle: 'the test the bond survived',                  owner: 'ensemble',       synopsis: 'The chapter no one sketches alone. Written with the four, not about them. Only at Lastovo, only when right — never in Sicily.', status: 'opening' },
  { id: 't3',  num: 3,  title: 'The pursuit of the record',                     subtitle: 'cost · risk · obsession',                     owner: 'petar',          synopsis: 'Why go deeper? What does the last metre cost that no one sees?', status: 'active' },
  { id: 't4',  num: 4,  title: 'What it feels like down there',                 subtitle: 'silence · surrender · the deep that\'s only yours', owner: 'sanda',    synopsis: "Sanda's territory — the place she goes that's only hers. Home of the descent monologue.", status: 'active' },
  { id: 't5',  num: 5,  title: 'The record between best friends',               subtitle: 'being overtaken by someone you love',         owner: 'sanda-zsofia',   synopsis: 'A world record passing from Sanda to Zsófia, between two best friends, at the same event where Petar set the men\'s mark.', status: 'active' },
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
  /* Thread 5 — the record between best friends */
  { id: 'tq5-1', threadId: 't5', target: 'sanda',  question: 'Your best friend broke your record and the world celebrated her. How do you hold pride and loss for the same person, in the same breath?',                                     status: 'draft' },
  { id: 'tq5-2', threadId: 't5', target: 'sanda',  question: 'Is there a freedom in being overtaken — or only the loss?',                                                                                                                     status: 'draft' },
  { id: 'tq5-3', threadId: 't5', target: 'zsofia', question: 'You went one metre deeper than the most celebrated woman in the sport. Did that feel like arriving, or like taking something not yet yours?',                                   status: 'draft' },
  { id: 'tq5-4', threadId: 't5', target: 'zsofia', question: 'Underwater, in that moment, before the celebration — what was in your heart?',                                                                                                  status: 'draft' },
  { id: 'tq5-5', threadId: 't5', target: 'together', question: 'Is there a version of this that ends the friendship? How close did it come? What does the other one give you that no one else can?',                                          status: 'draft' },
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
    status: 'completed',
    startDate: '2026-04-01',
    endDate: '2026-04-07',
    spirit: 'The foundation — the four, the bonds, the family, the home water.',
    captures: ['who they are · at home', 'the bonds, seen', 'the family that watched it begin', 'first breath-up templates', 'grey winter Adriatic as the "before"'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Krk — the "before"\n\nSoft opening. First shoot. The four at home, in their home water. Establishes the world before Sicily disrupts it.',
    notes: 'Done · went beautifully.',
  },
  {
    id: 'shoot-sicily',
    key: 'sicily',
    title: "Sicily · Petar's monofin attempt",
    location: 'Catania · next to Etna volcano',
    country: 'Italy',
    status: 'completed',
    startDate: '2026-07-01',
    endDate: '2026-07-06',
    spirit: 'The second shoot · the camera meets all four in a real record attempt. The dive comes first, always.',
    captures: ['the attempt · Petar\'s face at surface, every dive', "the watchers · Vito, Sanda, Zsófia while he's down", 'the four together · boat, dinner, between-dive laughs', 'more of Sanda and Zsófia in their own right', 'the volcano interview · Etna at golden hour'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Sicily · 1-6 July 2026\n\nNot a film about depth — a film about who waits for you at the surface.\n\n## The stakes\nPetar attacks a monofin world record: a new discipline for him, the no-fins purist going for raw depth. Could make history. Could miss. Both outcomes are the film.\n\n## Coverage\n- **C1 — the face** · Petar\'s face at surface, every dive · locked · lav on Petar\n- **C2 — the moment + watchers** · turn to the three faces the instant the card shows\n- **C3 — roam** · wider scene · safety team · a quiet word after\n\n## Rules\n- The dive comes first · we shoot around, never in the way\n- Sicily is light · no heavy sit-downs · 2023 stays gentle\n- Two copies before anyone sleeps',
    wonderfulness: '★ Etna erupted DURING the shoot. The "Fire breathes in, water breathes out" swing became real — captured live. Not the world record, but the film gained something a script couldn\'t buy.',
    notes: 'Completed spectacularly. No WR but Etna erupted — the film opening writes itself.',
  },
  {
    id: 'shoot-lastovo',
    key: 'lastovo',
    title: 'Lastovo · the deep, and the sport itself',
    location: 'Lastovo island',
    country: 'Croatia',
    status: 'planned',
    startDate: '2026-08-15',
    endDate: '2026-08-22',
    spirit: "The deepest conversations · the inner world · 2023 when the time is right. AND the first real cinematic presentation of freediving as a sport.",
    captures: ['the deep conversations · the inner world', 'the 2023 chapter when it feels right', 'training camps · breathing exercises · daily discipline', 'a real competition', 'if it happens — a record', 'the sport laid bare, from the inside'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Lastovo — the soul, and the discipline\n\nHolds the most honest conversations AND the first real cinematic presentation of freediving as a sport. No film has shown the sport from the inside like this.\n\n## The 2023 conversation\nOnly here. Only when it\'s right. Never pushed. The wound never gets opened for a schedule.\n\n## The sport, laid bare\nDawn on the dock: breath-holds, the training camp, a real competition, maybe a record.',
    notes: 'The soul-shoot. And the definitive document of the discipline.',
  },
  {
    id: 'shoot-cyprus',
    key: 'cyprus',
    title: 'Cyprus · the world stage',
    location: 'Cyprus',
    country: 'Cyprus',
    status: 'planned',
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    spirit: 'The competitive proving ground · the world stage.',
    captures: ['the competition · the world level', 'watcher moments at scale', 'the international dive community around the four', 'more spine + thread answers, transformed by the world stage'],
    presentFour: ['petar','vito','sanda','zsofia'],
    bible: '# Cyprus · autumn\n\nThe world stage. Where the sport meets the world. Coverage template: C1/C2/C3 as Sicily. Watcher moments prioritized.',
  },
  {
    id: 'shoot-rijeka-zagreb',
    key: 'rijeka-zagreb',
    title: 'Rijeka / Zagreb · the science',
    location: 'Rijeka + Zagreb',
    country: 'Croatia',
    status: 'planned',
    spirit: 'The body and the mind · the science, with Vito as both subject and researcher.',
    captures: ['Vito\'s lab · the ultrasound, the thermal, the brain scan', 'the score-as-body swing · physiology as music source', 'body-as-witness device · the data testifies', 'Vito the scientist studying Vito the subject'],
    presentFour: ['vito'],
    bible: '# Rijeka/Zagreb · the science\n\nUniversity of Rijeka, hyperbaric medicine research centre. Vito as subject AND researcher.\n\n## Score priority\nThe film\'s music built from real physiology captured here. Twenty-beat heart, blood shift, brain under low O2.',
  },
  {
    id: 'shoot-usa',
    key: 'usa',
    title: 'The USA · Hall of Fame + Vegas→SF RV road-trip',
    location: 'USA · Hall of Fame + Las Vegas → San Francisco road-trip',
    country: 'USA',
    status: 'planned',
    spirit: "Vito's Hall of Fame induction · vindication made real · and a shared road-trip that could become the coda itself.",
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
    title: 'Two friends, one record',
    description: "Sanda and Zsófia filmed apart, answering the same question — cut together so they almost finish each other's sentence.",
    whyItMatters: "The film's thesis test-case. The record that passed between best friends could have broken them. It didn't. The cut proves it.",
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

/* ---------- Freediving records (public knowledge as of Film Bible) ---------- */

export const SEED_RECORDS: DivingRecord[] = [
  { id: 'rec-petar-cnf',   personKey: 'petar',  discipline: 'CNF',     scope: 'world',    depthM: 103,  date: '2024-07-30', event: 'Vertical Blue 2024',                            location: "Dean's Blue Hole, Bahamas",  status: 'standing',                notes: 'Broke a record that stood 17 years.' },
  { id: 'rec-petar-fim',   personKey: 'petar',  discipline: 'FIM',     scope: 'world',    depthM: 128,  date: '2025-06-15', event: 'AIDA World Championship',                       location: 'Kalamata, Greece',             status: 'standing' },
  { id: 'rec-vito-sta',    personKey: 'vito',   discipline: 'STA',     scope: 'guinness', timeSeconds: 1743, date: '2024-03-10', event: 'Guinness attempt',                             location: 'Rijeka, Croatia',             status: 'standing',                notes: '~29 minutes without breathing. Longest static apnea recorded (Guinness).' },
  { id: 'rec-sanda-fim-hr',personKey: 'sanda',  discipline: 'FIM',     scope: 'world',    depthM: 100,   date: '2019-07-18', event: 'Vertical Blue 2019',                            location: "Dean's Blue Hole, Bahamas",   status: 'broken',   brokenByRecordId: 'rec-zsofia-fim', notes: 'First Croatian woman past 100m FIM (former WR).' },
  { id: 'rec-zsofia-fim',  personKey: 'zsofia', discipline: 'FIM',     scope: 'world',    depthM: 105,   date: '2024-07-28', event: 'Vertical Blue 2024',                            location: "Dean's Blue Hole, Bahamas",   status: 'standing',                notes: 'One metre deeper than the most celebrated woman in the sport.' },
  { id: 'rec-zsofia-dyn',  personKey: 'zsofia', discipline: 'DYN',     scope: 'world',    distanceM: 301, date: '2024-04-20', event: 'AIDA Pool World Championship',                  location: 'Belgrade, Serbia',            status: 'standing',                notes: 'First woman past 300m DYN.' },
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

/* ---------- Film crew (film-side, not talent) ---------- */

export const SEED_CREW: CrewMember[] = [
  { id: 'c-tomo',      name: 'Tomislav Kovačić', role: 'Producer / Director',  languages: ['hr','en'], link: 'terminimal.com' },
  { id: 'c-toni',      name: 'Toni',              role: 'Camera Operator',      languages: ['hr','en'] },
  { id: 'c-christian', name: 'Christian',         role: 'Camera Operator',      languages: ['hr','en'] },
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
  { id: 'ref-3', type: 'film', title: 'Fire of Love',                  director: 'Sara Dosa',                                year: 2022, whyItMatters: 'Two people at the edge of an element, and the bond between them. Volcanic footage as archive-driven poetry. Reference for Etna and for the "one holds the other" love-under-the-edge grammar.' },
  { id: 'ref-4', type: 'film', title: 'The Alpinist',                  director: 'Peter Mortimer & Nick Rosen',              year: 2021, whyItMatters: 'Silence, interiority, an athlete who resists narration. Reference for how we don\'t over-explain.' },
  { id: 'ref-5', type: 'film', title: 'Meru',                           director: 'Elizabeth Chai Vasarhelyi & Jimmy Chin', year: 2015, whyItMatters: 'The mentor-protégé bond made visible.' },
  { id: 'ref-6', type: 'paper',title: 'The CMAS code of ethics · Vertical Blue Case', author: 'Škerbić, Dikić, Andjelković, Žarković, Parry',            year: 2025, whyItMatters: 'The peer-reviewed footnoted case. Backbone of the 2023 chapter.' },
];

/* ---------- Festival targets (Sundance / Berlinale / IDFA priority) ---------- */

export const SEED_FESTIVALS: FestivalSubmission[] = [
  { id: 'fest-sundance',  name: 'Sundance Film Festival', city: 'Park City',    country: 'USA',         category: 'World Documentary Competition', fitScore: 5, status: 'target', notes: 'Deep Dive premiere target #1. Deadline Sep 2027.' },
  { id: 'fest-berlinale', name: 'Berlinale',              city: 'Berlin',       country: 'Germany',     category: 'Encounters / Panorama Dokumente', fitScore: 5, status: 'target', notes: 'Deep Dive premiere target #2.' },
  { id: 'fest-idfa',      name: 'IDFA',                   city: 'Amsterdam',    country: 'Netherlands', category: 'International Competition',      fitScore: 5, status: 'target', notes: '' },
  { id: 'fest-cphdox',    name: 'CPH:DOX',                city: 'Copenhagen',   country: 'Denmark',     category: 'Dox:Award',                        fitScore: 4, status: 'target', notes: '' },
  { id: 'fest-sarajevo',  name: 'Sarajevo Film Festival', city: 'Sarajevo',     country: 'Bosnia',      category: 'Documentary Competition',        fitScore: 4, status: 'target', notes: 'Regional identity, home turf.' },
];

/* ---------- Sales agents + broadcasters (empty for now) ---------- */

export const SEED_SALES_AGENTS: SalesAgent[] = [];
export const SEED_BROADCASTERS: Broadcaster[] = [];

/* ---------- Spine · Ideas Workshop (v0.2) ----------
   User will fill in as ideas emerge from team discussion. Seed one anchor. */

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
];

/* ---------- Camera Team · Inventory (v0.2) ----------
   Placeholder starter kit — user + Toni + Christian edit. Realistic gear
   for a freediving documentary: underwater rigs are first-class. */

export const SEED_CAMERAS: Camera[] = [
  { id: 'cam-fx3-1',    brand: 'Sony',    model: 'FX3',                 kind: 'body',    sensor: 'Full-Frame CMOS',  maxResolution: '4K UHD', maxFrameRate: '120fps',                              ownership: 'owned',    operatorId: 'c-toni',      notes: 'Primary A-cam. Low-light king for below-deck + night dives.' },
  { id: 'cam-fx3-2',    brand: 'Sony',    model: 'FX3',                 kind: 'body',    sensor: 'Full-Frame CMOS',  maxResolution: '4K UHD', maxFrameRate: '120fps',                              ownership: 'owned',    operatorId: 'c-christian', notes: 'B-cam · matched color with A-cam.' },
  { id: 'cam-a7s3',     brand: 'Sony',    model: 'a7S III',              kind: 'body',    sensor: 'Full-Frame CMOS',  maxResolution: '4K UHD', maxFrameRate: '120fps',                              ownership: 'owned',    operatorId: 'c-tomo',      notes: 'Roam · watcher-cam · handheld.' },
  { id: 'cam-c70',      brand: 'Canon',   model: 'C70',                  kind: 'body',    sensor: 'Super 35 DGO',     maxResolution: '4K',      maxFrameRate: '120fps',                              ownership: 'rented',   operatorId: 'c-toni',      notes: 'Set-piece cinema camera. Interviews.' },
  { id: 'cam-uw-nauticam',brand: 'Nauticam', model: 'FX3 housing',        kind: 'uw-rig',  underwaterDepthM: 100,                                                                                    ownership: 'rented',   operatorId: 'c-christian', notes: 'FX3 housed. Primary underwater rig.' },
  { id: 'cam-gopro',    brand: 'GoPro',   model: 'Hero 12 Black',        kind: 'action',                                                                                                              ownership: 'owned',                              notes: 'Multiple units. Rope-mount, chest-mount, bail-out.' },
  { id: 'cam-drone',    brand: 'DJI',     model: 'Mavic 3 Pro',          kind: 'drone',                                                                                                                ownership: 'owned',    operatorId: 'c-christian', notes: 'Aerials. Boat approaches, wide land, coast.' },
];

export const SEED_LENSES: Lens[] = [
  { id: 'lens-2470',  brand: 'Sony',       focal: '24-70mm', maxAperture: 'f/2.8',  mount: 'E',  type: 'photo', characterNotes: 'Everyday zoom, sharp, contrasty.',        ownership: 'owned',  operatorId: 'c-toni' },
  { id: 'lens-70200', brand: 'Sony',       focal: '70-200mm',maxAperture: 'f/2.8',  mount: 'E',  type: 'photo', characterNotes: 'Compression + reach. Watcher-cam.',      ownership: 'owned',  operatorId: 'c-christian' },
  { id: 'lens-16354', brand: 'Sony',       focal: '16-35mm', maxAperture: 'f/2.8',  mount: 'E',  type: 'photo', characterNotes: 'Wide interiors, boats.',                 ownership: 'owned',  operatorId: 'c-tomo' },
  { id: 'lens-50gm',  brand: 'Sony',       focal: '50mm',    maxAperture: 'f/1.2',  mount: 'E',  type: 'photo', characterNotes: 'Fast prime. Portraits, interviews.',     ownership: 'owned',  operatorId: 'c-toni' },
  { id: 'lens-85gm',  brand: 'Sony',       focal: '85mm',    maxAperture: 'f/1.4',  mount: 'E',  type: 'photo', characterNotes: 'Portrait king. The-face cam.',           ownership: 'owned',  operatorId: 'c-toni' },
  { id: 'lens-cine',  brand: 'Cooke',      focal: '32mm',    maxAperture: 'T2.0',   mount: 'PL', type: 'cine',  characterNotes: 'Warm falloff, gentle bokeh. Set-piece.', ownership: 'rented', operatorId: 'c-toni' },
  { id: 'lens-uw',    brand: 'Sony',       focal: '16-35mm', maxAperture: 'f/2.8',  mount: 'E',  type: 'photo', characterNotes: 'Housed for underwater.',                 ownership: 'rented', operatorId: 'c-christian' },
];

export const SEED_MICS: Microphone[] = [
  { id: 'mic-lav-1',    brand: 'Sennheiser', model: 'MKE 2 Gold',    type: 'lav',        channels: 1, ownership: 'owned',  notes: 'Talent lav #1' },
  { id: 'mic-lav-2',    brand: 'Sennheiser', model: 'MKE 2 Gold',    type: 'lav',        channels: 1, ownership: 'owned',  notes: 'Talent lav #2' },
  { id: 'mic-lav-3',    brand: 'DPA',        model: '4060',           type: 'lav',        channels: 1, ownership: 'owned',  notes: 'Backup lav (waterproof)' },
  { id: 'mic-boom',     brand: 'Sennheiser', model: 'MKH 416',        type: 'shotgun',    channels: 1, ownership: 'owned',  notes: 'Interview boom.' },
  { id: 'mic-stereo',   brand: 'Rode',       model: 'NTG-3',          type: 'shotgun',    channels: 1, ownership: 'owned',  notes: 'Boom #2.' },
  { id: 'mic-hydro',    brand: 'Aquarian',   model: 'H2a',            type: 'hydrophone', channels: 1, ownership: 'rented', notes: 'Underwater ambient. The sound of the deep.' },
  { id: 'mic-ambisonic',brand: 'Zoom',       model: 'H3-VR',          type: 'stereo',     channels: 4, ownership: 'owned',  notes: 'Ambisonic room · atmos. For volcano scene + open water.' },
];

export const SEED_LIGHTS: Light[] = [
  { id: 'light-aputure-1', brand: 'Aputure', model: '600d Pro',       type: 'led-panel', watts: 600, colorTempK: '5600K',      ownership: 'rented', notes: 'Interview key.' },
  { id: 'light-aputure-2', brand: 'Aputure', model: 'Amaran 200x',    type: 'led-panel', watts: 200, colorTempK: '2700-6500K', ownership: 'owned',  notes: 'Fill / accent.' },
  { id: 'light-nanlite',   brand: 'Nanlite', model: 'PavoTube II 30X',type: 'led-tube',  watts: 40,  colorTempK: 'RGB',        ownership: 'owned',  notes: 'Practical effects.' },
  { id: 'light-uw',        brand: 'Kraken',  model: 'Hydra 15000',    type: 'battery',   watts: 150, colorTempK: '5000K',      ownership: 'rented', notes: 'Underwater dive light. Cave + night dive.' },
];

/* ---------- Empty seed containers ---------- */

const EMPTY_INTERVIEWS: Interview[] = [];

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
    interviews: EMPTY_INTERVIEWS,
    swings: SEED_SWINGS,
    devices: SEED_DEVICES,
    rituals: [],
    watcherMoments: [],
    records: SEED_RECORDS,
    attempts: [],
    physiology: [],
    evidence2023: SEED_EVIDENCE_2023,
    cameras: SEED_CAMERAS,
    lenses: SEED_LENSES,
    microphones: SEED_MICS,
    lights: SEED_LIGHTS,
    crew: SEED_CREW,
    schedulePhases: SEED_SCHEDULE_PHASES,
    milestones: SEED_MILESTONES,
    sponsors: SEED_SPONSORS,
    risks: SEED_RISKS,
    contracts: SEED_CONTRACTS,
    journalEntries: SEED_JOURNAL,
    references: SEED_REFERENCES,
    festivals: SEED_FESTIVALS,
    salesAgents: SEED_SALES_AGENTS,
    broadcasters: SEED_BROADCASTERS,
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
