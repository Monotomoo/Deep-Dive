/* deep dive · 2026 — full data model
   A feature documentary and a 3-episode series about four of the best
   freedivers alive: Petar, Vito, Sanda, Zsófia. Not a film about depth
   or records — a film about the bonds that make the impossible possible.
   One person holds another in the world.
*/

/* ---------- Scenarios & finance (retained for pitch/budget) ---------- */

export type ScenarioKey = 'lean' | 'realistic' | 'ambitious';

export interface FundingSourceMeta {
  key: string;
  label: string;
  color: string;
  isStateAid: boolean;
  isCalculated?: boolean;
  tag: 'state' | 'private';
}

export interface CostCategoryMeta {
  key: string;
  label: string;
}

export interface CashflowQuarter {
  quarter: string;
  inflows: Record<string, number>;
  outflow: number;
}

export interface ScenarioData {
  episodes: number;
  funding: Record<string, number>;
  costs: Record<string, number>;
  cashflow: CashflowQuarter[];
  qualifyingSpendPct: number;
  blendedRebateRate: number;
}

/* ---------- The Four (first-class talent) ---------- */

/* Fixed identity slots for the four leads. */
export type FourKey = 'petar' | 'vito' | 'sanda' | 'zsofia';

export type TalentDiscipline =
  | 'freediver'
  | 'coach'
  | 'safety'
  | 'family'
  | 'researcher'
  | 'medical'
  | 'other';

export interface TalentFour {
  id: string;
  key: FourKey;
  name: string;
  role: string;              // "the gravity" · "the heart and mind" · etc.
  nationality: string;
  hometown: string;
  languagePrimary: string;   // 'hr' · 'en' · 'hu'
  epithet: string;           // "the one everyone watches" etc.
  bio: string;
  contact?: string;
  imageBase64?: string;
  /* Emotional-arc anchors (from Film Bible) */
  arcNote: string;           // one-line — "the spine of the whole story"
  interiorityNote?: string;
}

/* Talent adjacent to The Four (Borna, family, coaches, researchers) */
export interface Talent {
  id: string;
  name: string;
  role: string;
  relationshipTo: FourKey | 'ensemble';
  discipline: TalentDiscipline;
  contact?: string;
  releaseStatus: 'pending' | 'signed' | 'expired' | 'na';
  onCameraNotes?: string;
  notes?: string;
}

/* ---------- The 10 Threads (narrative arcs across all locations) ---------- */

export type ThreadOwner =
  | FourKey
  | 'ensemble'
  | 'petar-vito'
  | 'sanda-zsofia';

export type ThreadStatus = 'unopened' | 'opening' | 'active' | 'ready' | 'in-cut';

export interface ThreadQuestion {
  id: string;
  threadId: string;
  target: FourKey | 'ensemble' | 'together';
  question: string;
  status: 'draft' | 'asked' | 'answered' | 'follow-up' | 'retired';
  notes?: string;
}

export interface Thread {
  id: string;
  num: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  title: string;
  subtitle: string;
  owner: ThreadOwner;
  synopsis: string;
  status: ThreadStatus;
  notes?: string;
}

/* ---------- The 5 Spine Questions (the returning matrix) ---------- */

export type SpineQuestionKey =
  | 'bottom'
  | 'holds'
  | 'wound'
  | 'without'
  | 'toward';

export interface SpineQuestion {
  key: SpineQuestionKey;
  text: string;
  order: 1 | 2 | 3 | 4 | 5;
  note: string;
}

/* Captured answer to a spine question by a person at a shoot */
export interface SpineAnswer {
  id: string;
  spineKey: SpineQuestionKey;
  personKey: FourKey;
  shootId: string;
  asked: boolean;
  answered: boolean;
  quote?: string;
  interviewId?: string;
  moodNote?: string;
  timecode?: string;
  updatedAt?: string;
}

/* ---------- The 6 Shoots ---------- */

export type ShootKey =
  | 'krk'
  | 'sicily'
  | 'lastovo'
  | 'cyprus'
  | 'rijeka-zagreb'
  | 'usa'
  | 'coda';

export type ShootStatus =
  | 'planned'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'archived';

export interface Shoot {
  id: string;
  key: ShootKey;
  title: string;
  location: string;
  country: string;
  status: ShootStatus;
  startDate?: string;
  endDate?: string;
  spirit: string;
  captures: string[];
  presentFour: FourKey[];
  bible: string;
  wonderfulness?: string;
  notes?: string;
}

export interface ShootDay {
  id: string;
  shootId: string;
  dayNum: number;
  date: string;
  plan: string;
  mood?: 'setup' | 'roll' | 'buffer' | 'wrap' | 'break';
  weather?: string;
  seaState?: string;
  done: boolean;
  reflection?: string;
}

/* ---------- Camera coverage plan (Sicily-style C1/C2/C3) ---------- */

export type CoverageRole =
  | 'C1-face'
  | 'C2-watchers'
  | 'C3-roam'
  | 'C4-underwater'
  | 'C5-drone'
  | 'C-lav'
  | 'C-boom'
  | 'other';

export interface CoverageCam {
  id: string;
  shootId: string;
  role: CoverageRole;
  operator?: string;
  targetPerson?: FourKey;
  descriptor: string;
  locked: boolean;
  notes?: string;
}

/* ---------- Interviews (session captures) ---------- */

export type InterviewStatus =
  | 'planned'
  | 'in-session'
  | 'captured'
  | 'transcribed'
  | 'in-cut'
  | 'in-final';

export type InterviewSetting =
  | 'boat'
  | 'poolside'
  | 'shore'
  | 'volcano'
  | 'lab'
  | 'home'
  | 'stage'
  | 'other';

export interface Interview {
  id: string;
  shootId: string;
  personKey: FourKey | 'together';
  setting: InterviewSetting;
  date: string;
  durationMin?: number;
  status: InterviewStatus;
  threadIds: string[];
  spineAnswerIds?: string[];
  transcript?: string;
  media?: {
    audio?: string;
    video?: string;
    stills?: string[];
  };
  timecodeIn?: string;
  timecodeOut?: string;
  consentNote?: string;
  standoutQuotes?: string[];
  notes?: string;
}

/* ---------- Bigger Swings (ambitious ideas) ---------- */

export type SwingStatus =
  | 'idea'
  | 'planned'
  | 'attempted'
  | 'achieved'
  | 'in-cut'
  | 'in-final'
  | 'dropped';

export interface BiggerSwing {
  id: string;
  title: string;
  description: string;
  status: SwingStatus;
  shootId?: string;
  achievedNote?: string;
  achievedAt?: string;
  notes?: string;
}

/* ---------- Grammar Devices (the film's recurring vocabulary) ---------- */

export type DeviceKey =
  | 'descent-monologue'
  | 'breath-up'
  | 'body-as-witness'
  | 'moment-in-the-dark';

export interface GrammarDevice {
  id: string;
  key: DeviceKey;
  title: string;
  description: string;
  captureIds: string[];
  timesUsedInCut?: number;
  notes?: string;
}

/* ---------- Rituals (breath-up + descent as recurring capture template) ---------- */

export type RitualType = 'breath-up' | 'descent' | 'ascent' | 'surface-recovery';

export interface Ritual {
  id: string;
  shootId: string;
  personKey: FourKey;
  type: RitualType;
  date: string;
  quiet: boolean;
  audio?: string;
  video?: string;
  attemptId?: string;
  notes?: string;
}

/* ---------- Watcher Moments (the film's emotional centre) ---------- */

export interface WatcherMoment {
  id: string;
  shootId: string;
  watcherKey: FourKey;
  divingPersonKey: FourKey;
  attemptId?: string;
  moment: string;
  captured: boolean;
  captureNote?: string;
  timecode?: string;
  interviewId?: string;
}

/* ---------- Freediving Records + Attempts ---------- */

export type DiveDiscipline =
  | 'CNF'
  | 'CWT'
  | 'CWTB'
  | 'FIM'
  | 'VWT'
  | 'NLT'
  | 'STA'
  | 'DYN'
  | 'DYNB'
  | 'DNF'
  | 'MonoFin'
  | 'other';

export type RecordScope = 'world' | 'national' | 'personal' | 'guinness' | 'other';

export interface DivingRecord {
  id: string;
  personKey: FourKey | 'other';
  otherPersonName?: string;
  discipline: DiveDiscipline;
  scope: RecordScope;
  depthM?: number;
  timeSeconds?: number;
  distanceM?: number;
  date: string;
  event?: string;
  location?: string;
  status: 'standing' | 'broken' | 'pending-ratification' | 'unratified';
  brokenByRecordId?: string;
  notes?: string;
}

export type AttemptOutcome =
  | 'record'
  | 'clean-target'
  | 'clean-below-target'
  | 'no-official-result'
  | 'blackout'
  | 'lmc'
  | 'squeeze'
  | 'aborted'
  | 'weather-cancelled'
  | 'pending';

export interface RecordAttempt {
  id: string;
  personKey: FourKey;
  shootId?: string;
  targetRecordId?: string;
  discipline: DiveDiscipline;
  targetDepthM?: number;
  targetTimeSeconds?: number;
  actualDepthM?: number;
  actualTimeSeconds?: number;
  date: string;
  outcome: AttemptOutcome;
  coverageCamIds?: string[];
  watcherMomentIds?: string[];
  ritualIds?: string[];
  interviewIds?: string[];
  narrative?: string;
  notes?: string;
}

/* ---------- Physiology data (body-as-witness / score) ---------- */

export type PhysiologyMetric =
  | 'heart-rate'
  | 'blood-oxygen'
  | 'blood-pressure'
  | 'brain-activity'
  | 'blood-shift'
  | 'thermal'
  | 'other';

export interface PhysiologyDatum {
  id: string;
  personKey: FourKey;
  metric: PhysiologyMetric;
  contextNote: string;
  unit: string;
  dataPointsCsv?: string;
  peakValue?: number;
  minValue?: number;
  duration?: number;
  date?: string;
  source: string;
  usedInScore?: boolean;
  notes?: string;
}

/* ---------- 2023 Chapter (ordinary thread — evidence library) ---------- */

export type EvidenceType =
  | 'academic-paper'
  | 'court-document'
  | 'press-article'
  | 'federation-statement'
  | 'test-result'
  | 'interview'
  | 'photo'
  | 'video'
  | 'other';

export interface Evidence2023 {
  id: string;
  type: EvidenceType;
  title: string;
  author?: string;
  source: string;
  date?: string;
  summary: string;
  keyQuote?: string;
  onFile: boolean;
  notes?: string;
}

/* ---------- Film crew ---------- */

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  rate?: string;
  contact?: string;
  link?: string;
  languages?: string[];
  notes?: string;
}

/* ---------- Schedule (phases + milestones) ---------- */

export interface SchedulePhase {
  id: string;
  label: string;
  start: string;
  end: string;
  lane: number;
  color: string;
  ownerId?: string;
  critical?: boolean;
  notes?: string;
}

export type MilestoneCategory =
  | 'shoot-start'
  | 'shoot-wrap'
  | 'festival-deadline'
  | 'funding-deadline'
  | 'post-milestone'
  | 'delivery'
  | 'internal';

export type MilestoneStatus = 'open' | 'snoozed' | 'done';

export interface Milestone {
  id: string;
  label: string;
  date: string;
  category?: MilestoneCategory;
  ownerId?: string;
  status?: MilestoneStatus;
  notes?: string;
}

/* ---------- Sponsors + Funding ---------- */

export type SponsorStatus = 'prospect' | 'contacted' | 'pitched' | 'committed';

export interface Sponsor {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  expectedAmount: number;
  category: string;
  status: SponsorStatus;
  notes: string;
  shootIds?: string[];
  valueExchange?: string;
  decisionMaker?: string;
  briefNotes?: string;
  lastContactDate?: string;
}

/* ---------- Risks (light) ---------- */

export type RiskAxis = 'low' | 'high';

export type RiskCategory =
  | 'weather'
  | 'safety-diver'
  | 'equipment'
  | 'talent'
  | 'legal'
  | 'financial'
  | 'operational'
  | 'post'
  | 'health'
  | 'other';

export type RiskScale = 1 | 2 | 3 | 4 | 5;

export type RiskStatus =
  | 'open'
  | 'mitigating'
  | 'mitigated'
  | 'accepted'
  | 'closed';

export interface Risk {
  id: string;
  title: string;
  probability: RiskAxis;
  impact: RiskAxis;
  description: string;
  mitigation: string;
  category?: RiskCategory;
  probabilityScale?: RiskScale;
  impactScale?: RiskScale;
  ownerId?: string;
  residualP?: RiskScale;
  residualI?: RiskScale;
  status?: RiskStatus;
  triggerConditions?: string;
  responsePlan?: string;
}

/* ---------- Contracts ---------- */

export type ContractType =
  | 'talent-release'
  | 'location-release'
  | 'music-clearance'
  | 'sponsor'
  | 'crew'
  | 'safety-liability'
  | 'facility-access'
  | 'other';

export type ContractStatus = 'drafted' | 'sent' | 'signed' | 'expired';

export interface Contract {
  id: string;
  type: ContractType;
  partyName: string;
  personKey?: FourKey | 'other';
  shootId?: string;
  status: ContractStatus;
  dateDue?: string;
  notes: string;
}

/* ---------- Journal ---------- */

export type MoodTag = 'great' | 'good' | 'neutral' | 'rough' | 'bad';

export interface JournalEntry {
  id: string;
  date: string;
  shootId?: string;
  dayNum?: number;
  weather?: string;
  whatHappened: string;
  photoBase64?: string;
  moodTag: MoodTag;
}

/* ---------- Reference library (touchstones) ---------- */

export type ReferenceType = 'film' | 'book' | 'paper' | 'song' | 'image' | 'quote' | 'other';

export interface Reference {
  id: string;
  type: ReferenceType;
  title: string;
  director?: string;
  author?: string;
  year?: number;
  sourceUrl?: string;
  whyItMatters: string;
  notes?: string;
}

/* ---------- Festival submissions ---------- */

export type FestivalStatus =
  | 'target'
  | 'submitted'
  | 'accepted'
  | 'declined'
  | 'won'
  | 'withdrawn';

export interface FestivalSubmission {
  id: string;
  name: string;
  url?: string;
  city: string;
  country: string;
  category?: string;
  deadline?: string;
  feeEur?: number;
  fitScore?: number;
  status: FestivalStatus;
  notes: string;
}

/* ---------- Distribution ---------- */

export type SalesAgentStatus = 'target' | 'pitched' | 'in-talks' | 'signed' | 'declined';

export interface SalesAgent {
  id: string;
  name: string;
  territories: string[];
  catalogHighlights?: string;
  docTrackRecord?: string;
  contact?: string;
  fitScore?: number;
  status: SalesAgentStatus;
  notes?: string;
}

export type BroadcasterStatus =
  | 'target'
  | 'pitched'
  | 'in-talks'
  | 'acquired'
  | 'declined';

export interface Broadcaster {
  id: string;
  name: string;
  country: string;
  slot: 'prime' | 'late-night' | 'streaming' | 'weekend' | 'matinee' | 'mixed';
  docStrand?: string;
  acquisitions?: string;
  fitScore?: number;
  contact?: string;
  status: BroadcasterStatus;
  notes?: string;
}

/* ---------- Cross-cutting primitives ---------- */

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'med' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  shootId?: string;
  status: TaskStatus;
  dueDate?: string;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NoteTargetType =
  | 'crew'
  | 'four'
  | 'talent'
  | 'thread'
  | 'shoot'
  | 'interview'
  | 'swing'
  | 'device'
  | 'risk'
  | 'global';

export interface Note {
  id: string;
  authorId?: string;
  targetType: NoteTargetType;
  targetId: string;
  body: string;
  createdAt: string;
  resolvedAt?: string;
  pinned?: boolean;
}

export type AssetType = 'image' | 'audio' | 'video' | 'pdf' | 'other';

export interface Asset {
  id: string;
  type: AssetType;
  label: string;
  base64?: string;
  url?: string;
  size?: number;
  uploadedAt: string;
  shootId?: string;
  personKey?: FourKey;
  interviewId?: string;
  notes?: string;
}

/* ---------- View keys ---------- */

export type ViewKey =
  /* Plan */
  | 'overview'
  | 'vision'
  | 'schedule'
  | 'crew'
  | 'sponsors'
  | 'risks'
  /* Make */
  | 'four'
  | 'threads'
  | 'spine'
  | 'shoots'
  | 'interviews'
  | 'swings'
  | 'devices'
  | 'records'
  | 'physiology'
  | 'watchers'
  /* Tell */
  | 'pitch'
  | 'distribution'
  | 'contracts'
  | 'journal'
  | 'post'
  /* Library */
  | 'references'
  | 'chapter-2023';

/* ---------- App state ---------- */

export interface AppState {
  activeScenario: ScenarioKey;
  activeView: ViewKey;
  scenarios: Record<ScenarioKey, ScenarioData>;
  /* Core Deep Dive entities */
  four: TalentFour[];
  talents: Talent[];
  threads: Thread[];
  threadQuestions: ThreadQuestion[];
  spineQuestions: SpineQuestion[];
  spineAnswers: SpineAnswer[];
  shoots: Shoot[];
  shootDays: ShootDay[];
  coverageCams: CoverageCam[];
  interviews: Interview[];
  swings: BiggerSwing[];
  devices: GrammarDevice[];
  rituals: Ritual[];
  watcherMoments: WatcherMoment[];
  records: DivingRecord[];
  attempts: RecordAttempt[];
  physiology: PhysiologyDatum[];
  evidence2023: Evidence2023[];
  /* Support entities */
  crew: CrewMember[];
  schedulePhases: SchedulePhase[];
  milestones: Milestone[];
  sponsors: Sponsor[];
  risks: Risk[];
  contracts: Contract[];
  journalEntries: JournalEntry[];
  references: Reference[];
  festivals: FestivalSubmission[];
  salesAgents: SalesAgent[];
  broadcasters: Broadcaster[];
  /* Cross-cutting primitives */
  tasks: Task[];
  notes: Note[];
  assets: Asset[];
  /* UI state — not persisted */
  selectedPersonKey: FourKey | null;
  selectedShootId: string | null;
  selectedThreadId: string | null;
  printMode: boolean;
  paletteOpen: boolean;
  captureOpen: boolean;
  locale: 'en' | 'hr';
}
