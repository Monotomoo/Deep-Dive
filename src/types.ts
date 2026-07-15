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
  colorHint?: string;        // signature color (hex) — used in calendar dots
  /* Emotional-arc anchors (from Film Bible) */
  arcNote: string;           // one-line — "the spine of the whole story"
  interiorityNote?: string;
}

/* Talent adjacent to The Four (family, coaches, researchers, judges).
   These are the documentary's CAST beyond the four leads. */
export interface Talent {
  id: string;
  name: string;
  role: string;
  relationshipTo: FourKey | 'ensemble';
  discipline: TalentDiscipline;
  contact?: string;
  releaseStatus: 'pending' | 'signed' | 'expired' | 'na';
  onCameraNotes?: string;
  bio?: string;               // who they are (v0.8 cast dashboard)
  whyInFilm?: string;         // the reason they're in the documentary
  colorHint?: string;
  notes?: string;
}

/* ---------- Story graph · Events + Topics (v0.8) ----------
   The cast dashboard's three segments: Person (four + talents),
   Event (moments the film orbits), Topic (themes interviews mine).
   Everything cross-links, and interviews reference all three. */

export type StoryEventKind =
  | 'record'
  | 'crisis'
  | 'ceremony'
  | 'shoot-moment'
  | 'origin'
  | 'turning-point'
  | 'other';

export interface StoryEvent {
  id: string;
  title: string;
  kind: StoryEventKind;
  year: number;
  date?: string;              // ISO when known precisely
  summary: string;
  personKeys: FourKey[];      // which of the four it involves
  talentIds?: string[];       // other cast involved
  topicIds?: string[];
  shootId?: string;           // where the film touches it
  colorHint?: string;
  notes?: string;
}

export interface Topic {
  id: string;
  title: string;              // 'Fear' · 'Being overtaken' · 'The storm'
  question: string;           // the question underneath the topic
  threadIds?: string[];       // narrative threads it feeds
  colorHint?: string;
  notes?: string;
}

/* ---------- Idea Hub (v0.8) ----------
   Anyone on the team drops an idea and wires it to anything:
   a person, an event, a topic, a shoot, a thread, a swing, an interview. */

export type IdeaKind =
  | 'scene'
  | 'shot'
  | 'question'
  | 'sound'
  | 'story'
  | 'logistics'
  | 'wild';

export type HubIdeaStatus = 'new' | 'warm' | 'hot' | 'adopted' | 'parked';

export type IdeaLinkType =
  | 'four'
  | 'talent'
  | 'event'
  | 'topic'
  | 'shoot'
  | 'thread'
  | 'swing'
  | 'interview';

export interface IdeaLink {
  targetType: IdeaLinkType;
  targetId: string;           // four → FourKey · others → entity id
}

export interface HubIdea {
  id: string;
  title: string;
  body?: string;
  kind: IdeaKind;
  status: HubIdeaStatus;
  authorId?: string;          // crew id — who dropped it
  links: IdeaLink[];
  votes?: number;
  createdAt: string;
  updatedAt: string;
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

/* ---------- Spine · Ideas Workshop ----------
   Not 5 locked questions — a live board of candidate spines for the film.
   Add ideas, discuss them, promote leading ones, drop what stops working.
   Later, once clear, the leading ideas graduate into locked structure. */

export type SpineIdeaStatus = 'idea' | 'discussing' | 'leading' | 'dropped';

export interface SpineIdea {
  id: string;
  title: string;              // "the returning-question matrix"
  body: string;               // longer description
  status: SpineIdeaStatus;
  ownerId?: string;
  votes?: number;
  linkedThreadIds?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  colorHint?: string;             // signature color · hex · used in calendar chip borders
  /* Real coordinates — plotted on the Overview map. Shoots outside the
     Mediterranean frame (the USA leg) are shown as an off-map marker. */
  lat?: number;
  lng?: number;
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
  personKey: FourKey | 'together' | 'other';   // 'other' → subject is a talent (talentIds)
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
  /* v0.8 — story-graph links + follow-up chains */
  talentIds?: string[];       // cast subjects/participants beyond the four
  topicIds?: string[];        // topics this session mines
  eventIds?: string[];        // story events it touches
  followUpOfId?: string;      // parent interview — enables location-to-location chains
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
  /* Richer context per user feedback v0.2 */
  whyItMatters?: string;
  narrative?: string;
  visualNote?: string;
  soundNote?: string;
  dependencies?: string;
  referenceIds?: string[];
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
  /* v0.19 — the rest of what the body does down there */
  | 'lung-volume'
  | 'spleen'
  | 'lactate'
  | 'contractions'
  | 'other';

/* Where a series actually came from. This matters: these are real, named
   people, and a modelled curve presented as a measurement is a lie about their
   bodies. Nothing here is measured until someone measures it.
     measured   — recorded off this person, on this date, by this source
     modelled   — an expected curve built from known physiology; to be measured
     literature — a published finding about elite apneists, not this individual */
export type PhysiologyProvenance = 'measured' | 'modelled' | 'literature';

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
  /* Undefined is treated as 'modelled' in the UI — never claim a measurement
     that nobody can point at. */
  provenance?: PhysiologyProvenance;
  /* The dive this series belongs to, when it's a depth dive — lets the curve
     be read against a real record. */
  depthM?: number;
  recordId?: string;
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

/* ---------- Camera Team · Inventory (v0.2) ---------- */

export type KitOwnership = 'owned' | 'rented' | 'borrowed' | 'coming';

export type CameraKind = 'body' | 'action' | 'drone' | 'uw-rig' | 'other';

export interface Camera {
  id: string;
  brand: string;
  model: string;
  kind: CameraKind;
  sensor?: string;
  maxResolution?: string;
  maxFrameRate?: string;
  underwaterDepthM?: number;
  ownership: KitOwnership;
  operatorId?: string;               // crew id
  assignedShootIds?: string[];
  notes?: string;
}

export type LensType = 'photo' | 'cine' | 'anamorphic' | 'other';

export interface Lens {
  id: string;
  brand: string;
  focal: string;                     // "24-70mm" or "50mm"
  maxAperture: string;               // "f/1.4"
  mount: string;                     // "EF" | "RF" | "PL" | "E" · free-form
  type: LensType;
  characterNotes?: string;
  ownership: KitOwnership;
  operatorId?: string;
  assignedShootIds?: string[];
  notes?: string;
}

export type MicType =
  | 'lav'
  | 'boom'
  | 'shotgun'
  | 'hydrophone'
  | 'stereo'
  | 'omni'
  | 'other';

export interface Microphone {
  id: string;
  brand: string;
  model: string;
  type: MicType;
  channels?: number;
  ownership: KitOwnership;
  operatorId?: string;
  assignedShootIds?: string[];
  notes?: string;
}

export type LightType =
  | 'led-panel'
  | 'led-tube'
  | 'battery'
  | 'hmi'
  | 'tungsten'
  | 'natural'
  | 'other';

export interface Light {
  id: string;
  brand: string;
  model: string;
  type: LightType;
  watts?: number;
  colorTempK?: string;
  ownership: KitOwnership;
  operatorId?: string;
  assignedShootIds?: string[];
  notes?: string;
}

/* ---------- Surface · who holds them (v0.6) ----------
   The film's thesis made literal: for each of the Four, who and what
   holds them at the surface. One person holds another in the world. */

export type HolderKind =
  | 'person'      // mother, partner, coach, safety diver, therapist
  | 'place'       // hometown, family house, the sea itself
  | 'object'      // fishing net, dive gear, photograph
  | 'ritual'      // morning coffee, prayer, breath practice
  | 'song';       // literal song they return to

export type HolderConsent = 'pending' | 'given' | 'declined' | 'na';

export interface Holder {
  id: string;
  subjectKey: FourKey;
  kind: HolderKind;
  name: string;                     // "Ana" / "Rijeka" / "the fishing net"
  relationship: string;             // "mother" / "partner" / "coach" / "birthplace"
  oneLine: string;                  // what they represent / what they said
  onCameraWilling?: boolean;        // undefined = unknown
  consent: HolderConsent;
  photoNote?: string;
  colorHint?: string;
  notes?: string;
}

/* ---------- Choir · same question × the four (v0.6) ---------- */

export interface ChoirQuestion {
  id: string;
  text: string;
  threadIds?: string[];
  notes?: string;
  createdAt: string;
}

export type ChoirAnswerSource = 'interview' | 'imagined' | 'quoted' | 'observed';

export interface ChoirEntry {
  id: string;
  questionId: string;
  subjectKey: FourKey;
  answer: string;
  source: ChoirAnswerSource;
  sourceContext?: string;           // "Interview #3 at Krk" / "IG post 2024-02"
  timecodeIn?: string;
  isKey?: boolean;                  // starred as pivot line
  notes?: string;
}

/* ---------- Life Mosaic · biographical timelines (v0.6) ---------- */

export type LifeEventCategory =
  | 'birth'
  | 'first-dive'
  | 'record'
  | 'breakthrough'
  | 'loss'
  | 'love'
  | 'family'
  | 'travel'
  | 'crisis'
  | 'joy'
  | 'other';

export interface LifeEvent {
  id: string;
  subjectKey: FourKey;
  year: number;                     // main axis
  month?: number;
  day?: number;
  title: string;
  category: LifeEventCategory;
  significance: 1 | 2 | 3 | 4 | 5;
  note?: string;
  colorHint?: string;
}

/* ---------- Resonance · image echoes (v0.6) ---------- */

export type ResonanceKind = 'visual' | 'aural' | 'gestural' | 'situational' | 'chromatic';

export type MotifItemSource =
  | 'shoot'
  | 'reference'
  | 'imagined'
  | 'observed'
  | 'quote';

export interface MotifItem {
  id: string;
  description: string;
  source: MotifItemSource;
  sourceContext?: string;
  shootId?: string;
  referenceId?: string;
  colorHint?: string;
  notes?: string;
}

export interface MotifChain {
  id: string;
  title: string;                    // "hair through water"
  kind: ResonanceKind;
  synopsis?: string;
  items: MotifItem[];
  notes?: string;
  createdAt: string;
}

/* ---------- USA Trip (v0.9) ----------
   The Sept 2026 RV road-trip for six: fly into San Francisco, drive the
   Sierra + desert loop, end in Las Vegas, fly straight to Cyprus.
   Itinerary + a running RV cost estimate. */

export type TripCostCategory =
  | 'rv'
  | 'fuel'
  | 'camp'
  | 'food'
  | 'park'
  | 'flights'
  | 'gear'
  | 'insurance'
  | 'other';

export type TripCostPer = 'trip' | 'day' | 'night' | 'person';

export type TripPoiKind = 'climb' | 'dive' | 'hike' | 'sight' | 'food' | 'camp' | 'drive' | 'other';

export interface TripPoi {
  id: string;
  name: string;
  kind: TripPoiKind;
  detail?: string;        // difficulty / depth / elevation / distance
  note?: string;          // why it matters for the film / the four
  onTheWay?: boolean;     // reached en route to this stop
}

export interface TripStop {
  id: string;
  name: string;
  role?: 'start' | 'stop' | 'end';
  nights?: number;
  driveMiles?: number;
  driveHours?: number;
  note?: string;
  colorHint?: string;
  mapX?: number;          // 0–100 stylised map position (west→east)
  mapY?: number;          // 0–100 stylised map position (north→south)
  pois?: TripPoi[];
}

export interface TripCostLine {
  id: string;
  label: string;
  category: TripCostCategory;
  amountUsd: number;      // unit amount
  per: TripCostPer;       // multiplier basis
  qty?: number;           // optional extra multiplier (default 1)
  notes?: string;
}

export interface TripDay {
  id: string;
  dayNum: number;
  date: string;           // ISO
  title: string;
  stopId?: string;        // where this day is based
  plan?: string;
  driveMiles?: number;
  note?: string;
  done?: boolean;
}

export interface UsaTrip {
  title: string;
  startDate: string;      // ISO — 2026-09-01
  endDate: string;        // ISO — 2026-09-27
  startCity: string;      // San Francisco
  endCity: string;        // Las Vegas
  flyOnTo: string;        // Cyprus
  people: number;         // 6
  rvNote?: string;
  stops: TripStop[];
  days: TripDay[];
  costs: TripCostLine[];
}

/* ---------- Calendar Events (v0.3) ----------
   User-managed events living on the calendar / timeline. Composed view
   also renders shoots + milestones as read-only ghosts. */

export type CalendarEventKind =
  | 'shoot'
  | 'milestone'
  | 'meeting'
  | 'travel'
  | 'delivery'
  | 'personal'
  | 'other';

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;              // ISO YYYY-MM-DD
  endDate?: string;               // ISO YYYY-MM-DD (multi-day range, inclusive)
  kind: CalendarEventKind;
  shootId?: string;
  personKeys?: FourKey[];
  notes?: string;
  colorHint?: string;             // optional override hex
  /* Recurrence (v0.5) */
  recurrence?: RecurrenceRule;    // if set, event repeats
  recurrenceEnd?: string;         // ISO YYYY-MM-DD · last possible occurrence (inclusive)
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

/* ---------- Pitch Deck (v0.14) ----------
   A library of modular pitch CARDS (each a self-contained one-pager, many
   bound to live workbook data) that you compose into audience-tailored DECKS
   to present live or export/send to a specific sponsor, co-producer, or fund. */

export type PitchCardKind =
  | 'cover'        // film title + format + thesis — the opener
  | 'logline'      // the one-line hook
  | 'thesis'       // what the film is really about
  | 'four'         // the protagonists (live: state.four)
  | 'records'      // the achievements — why these four (live: state.records)
  | 'stakes'       // why now · the drama
  | 'etna'         // "already captured" — the de-risking proof (live: Sicily shoot)
  | 'visual'       // the formal ambition (live: state.swings)
  | 'arc'          // 2023 → recognition, the redemption structure
  | 'access'       // from inside the sport — unique access
  | 'team'         // the makers + the athletes as collaborators (live: state.crew)
  | 'comparables'  // Free Solo / Deepest Breath / Alpinist positioning (live: references)
  | 'budget'       // the number + the ask (live: state.scenarios)
  | 'festivals'    // premiere strategy (live: state.festivals)
  | 'schedule'     // shoot status — footage exists (live: state.shoots)
  | 'offer'        // what a partner gets — tiers / terms
  | 'contact'      // who to talk to · the call to action
  | 'custom';      // freeform

export type PitchAudience =
  | 'sponsor' | 'coproducer' | 'fund' | 'broadcaster' | 'festival' | 'general';

export interface PitchCard {
  id: string;
  kind: PitchCardKind;
  title: string;                 // headline
  kicker?: string;               // small label above the title
  body?: string;                 // main copy — for live kinds, an optional intro/override
  imageNote?: string;            // note describing the still/visual this card wants
  accent?: string;               // hex accent
  audiences?: PitchAudience[];   // which rooms this card suits (suggests cards per deck)
}

export interface PitchDeck {
  id: string;
  name: string;
  audience: PitchAudience;
  recipient?: string;            // "Nordisk Film & TV Fond" / "Acrisure"
  note?: string;                 // cover note / intro line for the send
  cardIds: string[];             // ordered selection from the card library
  accent?: string;
  updatedAt: string;
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
  /* v0.18 — comments reach the rest of the graph */
  | 'topic'
  | 'event'
  | 'holder'
  | 'hub-idea'
  | 'record'
  | 'spine-idea'
  | 'pitch-card'
  | 'shoot-day'
  | 'global';

export interface Note {
  id: string;
  authorId?: string;
  /* Who wrote it, as displayed. Signed-in crew email when the cloud is on;
     falls back to a local label when it's off. authorId stays for crew links. */
  authorLabel?: string;
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
  | 'gap-radar'
  | 'vision'
  | 'idea-hub'
  | 'neuron'
  | 'schedule'
  | 'crew'
  | 'sponsors'
  | 'risks'
  /* Make */
  | 'cast'
  | 'surface'
  | 'four'
  | 'life-mosaic'
  | 'threads'
  | 'spine'
  | 'shoots'
  | 'usa-trip'
  | 'interviews'
  | 'choir'
  | 'swings'
  | 'devices'
  | 'resonance'
  | 'records'
  | 'physiology'
  | 'watchers'
  | 'camera-team'
  /* Tell */
  | 'pitch'
  | 'pitch-deck'
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
  spineIdeas: SpineIdea[];
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
  /* Camera Team · inventory (v0.2) */
  cameras: Camera[];
  lenses: Lens[];
  microphones: Microphone[];
  lights: Light[];
  /* Support entities */
  crew: CrewMember[];
  schedulePhases: SchedulePhase[];
  milestones: Milestone[];
  calendarEvents: CalendarEvent[];
  /* v0.6 — soul + perception modes */
  holders: Holder[];
  choirQuestions: ChoirQuestion[];
  choirEntries: ChoirEntry[];
  lifeEvents: LifeEvent[];
  motifChains: MotifChain[];
  /* v0.8 — story graph + idea hub */
  storyEvents: StoryEvent[];
  topics: Topic[];
  hubIdeas: HubIdea[];
  /* v0.9 — USA trip */
  usaTrip: UsaTrip;
  sponsors: Sponsor[];
  risks: Risk[];
  contracts: Contract[];
  journalEntries: JournalEntry[];
  references: Reference[];
  festivals: FestivalSubmission[];
  salesAgents: SalesAgent[];
  broadcasters: Broadcaster[];
  /* v0.14 — Pitch Deck: modular cards → audience-tailored decks */
  pitchCards: PitchCard[];
  pitchDecks: PitchDeck[];
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
