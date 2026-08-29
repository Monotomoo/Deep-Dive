import type {
  AppState,
  Asset,
  BiggerSwing,
  Broadcaster,
  CalendarEvent,
  Camera,
  ChoirEntry,
  ChoirQuestion,
  Contract,
  CoverageCam,
  CrewMember,
  DivingRecord,
  Evidence2023,
  FestivalSubmission,
  FourKey,
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
  MotifItem,
  Note,
  PhysiologyDatum,
  PitchCard,
  PitchDeck,
  RecordAttempt,
  Reference,
  Risk,
  Ritual,
  SalesAgent,
  SchedulePhase,
  ScenarioKey,
  MapAside,
  MapLane,
  MapNode,
  ScenarioArc,
  ScenarioPart,
  Shoot,
  ShootDay,
  Sponsor,
  SpineIdea,
  StoryEvent,
  Talent,
  TalentFour,
  Task,
  Thread,
  ThreadQuestion,
  Topic,
  TripCostLine,
  TripDay,
  TripStop,
  UsaTrip,
  ViewKey,
  WatcherMoment,
} from '../types';
import { makeInitialState } from '../lib/seed';
import { classifyLabel } from '../lib/mapKinds';

export type Action =
  | { type: 'SET_VIEW'; view: ViewKey }
  | { type: 'SET_SCENARIO'; scenario: ScenarioKey }
  | { type: 'RESET_TO_SEED' }
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'OPEN_PALETTE'; open: boolean }
  | { type: 'OPEN_CAPTURE'; open: boolean }
  | { type: 'SET_PRINT_MODE'; on: boolean }
  | { type: 'SET_LOCALE'; locale: 'en' | 'hr' }
  | { type: 'SELECT_PERSON'; key: FourKey | null }
  | { type: 'SELECT_SHOOT'; id: string | null }
  | { type: 'SELECT_THREAD'; id: string | null }
  /* Finance */
  | { type: 'SET_FUNDING'; scenario: ScenarioKey; key: string; value: number }
  | { type: 'SET_COST'; scenario: ScenarioKey; key: string; value: number }
  /* The Four */
  | { type: 'UPDATE_FOUR'; key: FourKey; patch: Partial<TalentFour> }
  /* Talents */
  | { type: 'ADD_TALENT'; talent: Talent }
  | { type: 'UPDATE_TALENT'; id: string; patch: Partial<Talent> }
  | { type: 'DELETE_TALENT'; id: string }
  /* Threads */
  | { type: 'ADD_THREAD'; thread: Thread }
  | { type: 'UPDATE_THREAD'; id: string; patch: Partial<Thread> }
  | { type: 'DELETE_THREAD'; id: string }
  | { type: 'ADD_THREAD_Q'; question: ThreadQuestion }
  | { type: 'UPDATE_THREAD_Q'; id: string; patch: Partial<ThreadQuestion> }
  | { type: 'DELETE_THREAD_Q'; id: string }
  /* Spine · Ideas Workshop */
  | { type: 'ADD_SPINE_IDEA'; idea: SpineIdea }
  | { type: 'UPDATE_SPINE_IDEA'; id: string; patch: Partial<SpineIdea> }
  | { type: 'DELETE_SPINE_IDEA'; id: string }
  /* Camera Team · inventory */
  | { type: 'ADD_CAMERA'; camera: Camera }
  | { type: 'UPDATE_CAMERA'; id: string; patch: Partial<Camera> }
  | { type: 'DELETE_CAMERA'; id: string }
  | { type: 'ADD_LENS'; lens: Lens }
  | { type: 'UPDATE_LENS'; id: string; patch: Partial<Lens> }
  | { type: 'DELETE_LENS'; id: string }
  | { type: 'ADD_MIC'; mic: Microphone }
  | { type: 'UPDATE_MIC'; id: string; patch: Partial<Microphone> }
  | { type: 'DELETE_MIC'; id: string }
  | { type: 'ADD_LIGHT'; light: Light }
  | { type: 'UPDATE_LIGHT'; id: string; patch: Partial<Light> }
  | { type: 'DELETE_LIGHT'; id: string }
  /* Shoots */
  | { type: 'ADD_SHOOT'; shoot: Shoot }
  | { type: 'UPDATE_SHOOT'; id: string; patch: Partial<Shoot> }
  | { type: 'DELETE_SHOOT'; id: string }
  | { type: 'ADD_SHOOT_DAY'; day: ShootDay }
  | { type: 'UPDATE_SHOOT_DAY'; id: string; patch: Partial<ShootDay> }
  | { type: 'DELETE_SHOOT_DAY'; id: string }
  | { type: 'ADD_COVERAGE_CAM'; cam: CoverageCam }
  | { type: 'UPDATE_COVERAGE_CAM'; id: string; patch: Partial<CoverageCam> }
  | { type: 'DELETE_COVERAGE_CAM'; id: string }
  /* Interviews */
  | { type: 'ADD_INTERVIEW'; interview: Interview }
  | { type: 'UPDATE_INTERVIEW'; id: string; patch: Partial<Interview> }
  | { type: 'DELETE_INTERVIEW'; id: string }
  /* Swings */
  | { type: 'ADD_SWING'; swing: BiggerSwing }
  | { type: 'UPDATE_SWING'; id: string; patch: Partial<BiggerSwing> }
  | { type: 'DELETE_SWING'; id: string }
  /* Devices */
  | { type: 'UPDATE_DEVICE'; id: string; patch: Partial<GrammarDevice> }
  /* Rituals */
  | { type: 'ADD_RITUAL'; ritual: Ritual }
  | { type: 'UPDATE_RITUAL'; id: string; patch: Partial<Ritual> }
  | { type: 'DELETE_RITUAL'; id: string }
  /* Watchers */
  | { type: 'ADD_WATCHER'; moment: WatcherMoment }
  | { type: 'UPDATE_WATCHER'; id: string; patch: Partial<WatcherMoment> }
  | { type: 'DELETE_WATCHER'; id: string }
  /* Records + Attempts */
  | { type: 'ADD_RECORD'; record: DivingRecord }
  | { type: 'UPDATE_RECORD'; id: string; patch: Partial<DivingRecord> }
  | { type: 'DELETE_RECORD'; id: string }
  | { type: 'ADD_ATTEMPT'; attempt: RecordAttempt }
  | { type: 'UPDATE_ATTEMPT'; id: string; patch: Partial<RecordAttempt> }
  | { type: 'DELETE_ATTEMPT'; id: string }
  /* Physiology */
  | { type: 'ADD_PHYSIOLOGY'; datum: PhysiologyDatum }
  | { type: 'UPDATE_PHYSIOLOGY'; id: string; patch: Partial<PhysiologyDatum> }
  | { type: 'DELETE_PHYSIOLOGY'; id: string }
  /* 2023 Evidence */
  | { type: 'ADD_EVIDENCE'; evidence: Evidence2023 }
  | { type: 'UPDATE_EVIDENCE'; id: string; patch: Partial<Evidence2023> }
  | { type: 'DELETE_EVIDENCE'; id: string }
  /* Support entities */
  | { type: 'ADD_CREW'; member: CrewMember }
  | { type: 'UPDATE_CREW'; id: string; patch: Partial<CrewMember> }
  | { type: 'DELETE_CREW'; id: string }
  | { type: 'ADD_PHASE'; phase: SchedulePhase }
  | { type: 'UPDATE_PHASE'; id: string; patch: Partial<SchedulePhase> }
  | { type: 'DELETE_PHASE'; id: string }
  | { type: 'ADD_MILESTONE'; milestone: Milestone }
  | { type: 'UPDATE_MILESTONE'; id: string; patch: Partial<Milestone> }
  | { type: 'DELETE_MILESTONE'; id: string }
  | { type: 'ADD_CALENDAR_EVENT'; event: CalendarEvent }
  | { type: 'UPDATE_CALENDAR_EVENT'; id: string; patch: Partial<CalendarEvent> }
  | { type: 'DELETE_CALENDAR_EVENT'; id: string }
  /* v0.6 — Surface (holders) */
  | { type: 'ADD_HOLDER'; holder: Holder }
  | { type: 'UPDATE_HOLDER'; id: string; patch: Partial<Holder> }
  | { type: 'DELETE_HOLDER'; id: string }
  /* v0.6 — Choir (questions + entries) */
  | { type: 'ADD_CHOIR_QUESTION'; question: ChoirQuestion }
  | { type: 'UPDATE_CHOIR_QUESTION'; id: string; patch: Partial<ChoirQuestion> }
  | { type: 'DELETE_CHOIR_QUESTION'; id: string }
  | { type: 'ADD_CHOIR_ENTRY'; entry: ChoirEntry }
  | { type: 'UPDATE_CHOIR_ENTRY'; id: string; patch: Partial<ChoirEntry> }
  | { type: 'DELETE_CHOIR_ENTRY'; id: string }
  /* v0.6 — Life Mosaic (life events) */
  | { type: 'ADD_LIFE_EVENT'; event: LifeEvent }
  | { type: 'UPDATE_LIFE_EVENT'; id: string; patch: Partial<LifeEvent> }
  | { type: 'DELETE_LIFE_EVENT'; id: string }
  /* v0.6 — Resonance (motif chains + items) */
  | { type: 'ADD_MOTIF_CHAIN'; chain: MotifChain }
  | { type: 'UPDATE_MOTIF_CHAIN'; id: string; patch: Partial<MotifChain> }
  | { type: 'DELETE_MOTIF_CHAIN'; id: string }
  | { type: 'ADD_MOTIF_ITEM'; chainId: string; item: MotifItem }
  | { type: 'UPDATE_MOTIF_ITEM'; chainId: string; itemId: string; patch: Partial<MotifItem> }
  | { type: 'DELETE_MOTIF_ITEM'; chainId: string; itemId: string }
  /* v0.8 — story graph + idea hub */
  | { type: 'ADD_STORY_EVENT'; event: StoryEvent }
  | { type: 'UPDATE_STORY_EVENT'; id: string; patch: Partial<StoryEvent> }
  | { type: 'DELETE_STORY_EVENT'; id: string }
  | { type: 'ADD_TOPIC'; topic: Topic }
  | { type: 'UPDATE_TOPIC'; id: string; patch: Partial<Topic> }
  | { type: 'DELETE_TOPIC'; id: string }
  | { type: 'ADD_HUB_IDEA'; idea: HubIdea }
  | { type: 'UPDATE_HUB_IDEA'; id: string; patch: Partial<HubIdea> }
  | { type: 'DELETE_HUB_IDEA'; id: string }
  /* v0.9 — USA trip */
  | { type: 'UPDATE_TRIP'; patch: Partial<UsaTrip> }
  | { type: 'ADD_TRIP_STOP'; stop: TripStop }
  | { type: 'UPDATE_TRIP_STOP'; id: string; patch: Partial<TripStop> }
  | { type: 'DELETE_TRIP_STOP'; id: string }
  | { type: 'REORDER_TRIP_STOPS'; ids: string[] }
  | { type: 'ADD_TRIP_COST'; cost: TripCostLine }
  | { type: 'UPDATE_TRIP_COST'; id: string; patch: Partial<TripCostLine> }
  | { type: 'DELETE_TRIP_COST'; id: string }
  | { type: 'ADD_TRIP_DAY'; day: TripDay }
  | { type: 'UPDATE_TRIP_DAY'; id: string; patch: Partial<TripDay> }
  | { type: 'DELETE_TRIP_DAY'; id: string }
  | { type: 'ADD_SPONSOR'; sponsor: Sponsor }
  | { type: 'UPDATE_SPONSOR'; id: string; patch: Partial<Sponsor> }
  | { type: 'DELETE_SPONSOR'; id: string }
  | { type: 'ADD_RISK'; risk: Risk }
  | { type: 'UPDATE_RISK'; id: string; patch: Partial<Risk> }
  | { type: 'DELETE_RISK'; id: string }
  | { type: 'ADD_CONTRACT'; contract: Contract }
  | { type: 'UPDATE_CONTRACT'; id: string; patch: Partial<Contract> }
  | { type: 'DELETE_CONTRACT'; id: string }
  | { type: 'ADD_JOURNAL'; entry: JournalEntry }
  | { type: 'UPDATE_JOURNAL'; id: string; patch: Partial<JournalEntry> }
  | { type: 'DELETE_JOURNAL'; id: string }
  | { type: 'ADD_REFERENCE'; reference: Reference }
  | { type: 'UPDATE_REFERENCE'; id: string; patch: Partial<Reference> }
  | { type: 'DELETE_REFERENCE'; id: string }
  | { type: 'ADD_FESTIVAL'; festival: FestivalSubmission }
  | { type: 'UPDATE_FESTIVAL'; id: string; patch: Partial<FestivalSubmission> }
  | { type: 'DELETE_FESTIVAL'; id: string }
  | { type: 'ADD_SALES_AGENT'; agent: SalesAgent }
  | { type: 'UPDATE_SALES_AGENT'; id: string; patch: Partial<SalesAgent> }
  | { type: 'DELETE_SALES_AGENT'; id: string }
  | { type: 'ADD_BROADCASTER'; b: Broadcaster }
  | { type: 'UPDATE_BROADCASTER'; id: string; patch: Partial<Broadcaster> }
  | { type: 'DELETE_BROADCASTER'; id: string }
  /* v0.14 — Pitch Deck */
  | { type: 'ADD_PITCH_CARD'; card: PitchCard }
  | { type: 'UPDATE_PITCH_CARD'; id: string; patch: Partial<PitchCard> }
  | { type: 'DELETE_PITCH_CARD'; id: string }
  | { type: 'ADD_PITCH_DECK'; deck: PitchDeck }
  | { type: 'UPDATE_PITCH_DECK'; id: string; patch: Partial<PitchDeck> }
  | { type: 'DELETE_PITCH_DECK'; id: string }
  /* Cross-cutting */
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; patch: Partial<Note> }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'ADD_ASSET'; asset: Asset }
  | { type: 'UPDATE_ASSET'; id: string; patch: Partial<Asset> }
  | { type: 'DELETE_ASSET'; id: string }
  | { type: 'ADD_SCENARIO_PART'; part: ScenarioPart }
  | { type: 'UPDATE_SCENARIO_PART'; id: string; patch: Partial<ScenarioPart> }
  | { type: 'DELETE_SCENARIO_PART'; id: string }
  | { type: 'MOVE_SCENARIO_PART'; id: string; dir: -1 | 1 }
  | { type: 'ADD_SCENARIO_ARC'; arc: ScenarioArc }
  | { type: 'UPDATE_SCENARIO_ARC'; id: string; patch: Partial<ScenarioArc> }
  | { type: 'DELETE_SCENARIO_ARC'; id: string }
  /* Quotes are a bare string[] addressed by index, so a delete carries the text
     it believes it is removing. If the array moved under us between render and
     click, the index now points at a different line — and silently deleting a
     subject's words is the worst thing this view could do. */
  | { type: 'DELETE_SCENARIO_QUOTE'; partId: string; index: number; text: string }
  /* The Map — the drawn plan */
  | { type: 'ADD_MAP_LANE'; lane: MapLane }
  | { type: 'UPDATE_MAP_LANE'; id: string; patch: Partial<MapLane> }
  | { type: 'DELETE_MAP_LANE'; id: string }
  | { type: 'MOVE_MAP_LANE'; id: string; dir: -1 | 1 }
  | { type: 'ADD_MAP_NODE'; node: MapNode }
  | { type: 'UPDATE_MAP_NODE'; id: string; patch: Partial<MapNode> }
  | { type: 'DELETE_MAP_NODE'; id: string }
  | { type: 'ADD_MAP_ASIDE'; aside: MapAside }
  | { type: 'UPDATE_MAP_ASIDE'; id: string; patch: Partial<MapAside> }
  | { type: 'DELETE_MAP_ASIDE'; id: string }
  /* The three moves, atomic on purpose. Each one is a single gesture on the
     board, so each one must be a single undo step — composing them from
     ADD + UPDATE would cost two Ctrl+Z presses and flash the mark in two
     places while the history settled. */
  | { type: 'MOVE_MAP_NODE'; id: string; laneId: string }
  | { type: 'PROMOTE_MAP_ASIDE_LINE'; asideId: string; index: number; label: string; laneId: string }
  | { type: 'DEMOTE_MAP_NODE'; id: string; asideId: string }
  /* The Money — edit a funding/cost line on one budget scenario (values in €k).
     SET with a new key adds the line; DELETE removes it. */
  | { type: 'SET_MONEY_LINE'; scenario: ScenarioKey; kind: 'funding' | 'costs'; key: string; value: number }
  | { type: 'DELETE_MONEY_LINE'; scenario: ScenarioKey; kind: 'funding' | 'costs'; key: string };

/* Generic list CRUD helpers */
function upd<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T[] {
  return arr.map((x) => (x.id === id ? { ...x, ...patch } : x));
}
function del<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((x) => x.id !== id);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':          return { ...state, activeView: action.view };
    case 'SET_SCENARIO':      return { ...state, activeScenario: action.scenario };
    case 'RESET_TO_SEED':     return makeInitialState();
    case 'HYDRATE':           return action.state;
    case 'OPEN_PALETTE':      return { ...state, paletteOpen: action.open };
    case 'OPEN_CAPTURE':      return { ...state, captureOpen: action.open };
    case 'SET_PRINT_MODE':    return { ...state, printMode: action.on };
    case 'SET_LOCALE':        return { ...state, locale: action.locale };
    case 'SELECT_PERSON':     return { ...state, selectedPersonKey: action.key };
    case 'SELECT_SHOOT':      return { ...state, selectedShootId: action.id };
    case 'SELECT_THREAD':     return { ...state, selectedThreadId: action.id };

    case 'SET_FUNDING':
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [action.scenario]: {
            ...state.scenarios[action.scenario],
            funding: { ...state.scenarios[action.scenario].funding, [action.key]: action.value },
          },
        },
      };
    case 'SET_COST':
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [action.scenario]: {
            ...state.scenarios[action.scenario],
            costs: { ...state.scenarios[action.scenario].costs, [action.key]: action.value },
          },
        },
      };

    /* The Four */
    case 'UPDATE_FOUR':
      return { ...state, four: state.four.map((f) => f.key === action.key ? { ...f, ...action.patch } : f) };

    /* Talents */
    case 'ADD_TALENT':    return { ...state, talents: [...state.talents, action.talent] };
    case 'UPDATE_TALENT': return { ...state, talents: upd(state.talents, action.id, action.patch) };
    case 'DELETE_TALENT': return { ...state, talents: del(state.talents, action.id) };

    /* Threads */
    case 'ADD_THREAD':      return { ...state, threads: [...state.threads, action.thread] };
    case 'UPDATE_THREAD':   return { ...state, threads: upd(state.threads, action.id, action.patch) };
    case 'DELETE_THREAD':   return { ...state, threads: del(state.threads, action.id) };
    case 'ADD_THREAD_Q':    return { ...state, threadQuestions: [...state.threadQuestions, action.question] };
    case 'UPDATE_THREAD_Q': return { ...state, threadQuestions: upd(state.threadQuestions, action.id, action.patch) };
    case 'DELETE_THREAD_Q': return { ...state, threadQuestions: del(state.threadQuestions, action.id) };

    /* Spine · Ideas Workshop */
    case 'ADD_SPINE_IDEA':    return { ...state, spineIdeas: [...state.spineIdeas, action.idea] };
    case 'UPDATE_SPINE_IDEA': return { ...state, spineIdeas: upd(state.spineIdeas, action.id, action.patch) };
    case 'DELETE_SPINE_IDEA': return { ...state, spineIdeas: del(state.spineIdeas, action.id) };

    /* Camera Team */
    case 'ADD_CAMERA':    return { ...state, cameras: [...state.cameras, action.camera] };
    case 'UPDATE_CAMERA': return { ...state, cameras: upd(state.cameras, action.id, action.patch) };
    case 'DELETE_CAMERA': return { ...state, cameras: del(state.cameras, action.id) };
    case 'ADD_LENS':      return { ...state, lenses: [...state.lenses, action.lens] };
    case 'UPDATE_LENS':   return { ...state, lenses: upd(state.lenses, action.id, action.patch) };
    case 'DELETE_LENS':   return { ...state, lenses: del(state.lenses, action.id) };
    case 'ADD_MIC':       return { ...state, microphones: [...state.microphones, action.mic] };
    case 'UPDATE_MIC':    return { ...state, microphones: upd(state.microphones, action.id, action.patch) };
    case 'DELETE_MIC':    return { ...state, microphones: del(state.microphones, action.id) };
    case 'ADD_LIGHT':     return { ...state, lights: [...state.lights, action.light] };
    case 'UPDATE_LIGHT':  return { ...state, lights: upd(state.lights, action.id, action.patch) };
    case 'DELETE_LIGHT':  return { ...state, lights: del(state.lights, action.id) };

    /* Shoots */
    case 'ADD_SHOOT':          return { ...state, shoots: [...state.shoots, action.shoot] };
    case 'UPDATE_SHOOT':       return { ...state, shoots: upd(state.shoots, action.id, action.patch) };
    case 'DELETE_SHOOT':       return { ...state, shoots: del(state.shoots, action.id) };
    case 'ADD_SHOOT_DAY':      return { ...state, shootDays: [...state.shootDays, action.day] };
    case 'UPDATE_SHOOT_DAY':   return { ...state, shootDays: upd(state.shootDays, action.id, action.patch) };
    case 'DELETE_SHOOT_DAY':   return { ...state, shootDays: del(state.shootDays, action.id) };
    case 'ADD_COVERAGE_CAM':   return { ...state, coverageCams: [...state.coverageCams, action.cam] };
    case 'UPDATE_COVERAGE_CAM':return { ...state, coverageCams: upd(state.coverageCams, action.id, action.patch) };
    case 'DELETE_COVERAGE_CAM':return { ...state, coverageCams: del(state.coverageCams, action.id) };

    /* Interviews */
    case 'ADD_INTERVIEW':    return { ...state, interviews: [...state.interviews, action.interview] };
    case 'UPDATE_INTERVIEW': return { ...state, interviews: upd(state.interviews, action.id, action.patch) };
    case 'DELETE_INTERVIEW': return { ...state, interviews: del(state.interviews, action.id) };

    /* Swings */
    case 'ADD_SWING':    return { ...state, swings: [...state.swings, action.swing] };
    case 'UPDATE_SWING': return { ...state, swings: upd(state.swings, action.id, action.patch) };
    case 'DELETE_SWING': return { ...state, swings: del(state.swings, action.id) };

    /* Devices */
    case 'UPDATE_DEVICE': return { ...state, devices: upd(state.devices, action.id, action.patch) };

    /* Rituals */
    case 'ADD_RITUAL':    return { ...state, rituals: [...state.rituals, action.ritual] };
    case 'UPDATE_RITUAL': return { ...state, rituals: upd(state.rituals, action.id, action.patch) };
    case 'DELETE_RITUAL': return { ...state, rituals: del(state.rituals, action.id) };

    /* Watchers */
    case 'ADD_WATCHER':    return { ...state, watcherMoments: [...state.watcherMoments, action.moment] };
    case 'UPDATE_WATCHER': return { ...state, watcherMoments: upd(state.watcherMoments, action.id, action.patch) };
    case 'DELETE_WATCHER': return { ...state, watcherMoments: del(state.watcherMoments, action.id) };

    /* Records + Attempts */
    case 'ADD_RECORD':    return { ...state, records: [...state.records, action.record] };
    case 'UPDATE_RECORD': return { ...state, records: upd(state.records, action.id, action.patch) };
    case 'DELETE_RECORD': return { ...state, records: del(state.records, action.id) };
    case 'ADD_ATTEMPT':   return { ...state, attempts: [...state.attempts, action.attempt] };
    case 'UPDATE_ATTEMPT':return { ...state, attempts: upd(state.attempts, action.id, action.patch) };
    case 'DELETE_ATTEMPT':return { ...state, attempts: del(state.attempts, action.id) };

    /* Physiology */
    case 'ADD_PHYSIOLOGY':    return { ...state, physiology: [...state.physiology, action.datum] };
    case 'UPDATE_PHYSIOLOGY': return { ...state, physiology: upd(state.physiology, action.id, action.patch) };
    case 'DELETE_PHYSIOLOGY': return { ...state, physiology: del(state.physiology, action.id) };

    /* Evidence */
    case 'ADD_EVIDENCE':    return { ...state, evidence2023: [...state.evidence2023, action.evidence] };
    case 'UPDATE_EVIDENCE': return { ...state, evidence2023: upd(state.evidence2023, action.id, action.patch) };
    case 'DELETE_EVIDENCE': return { ...state, evidence2023: del(state.evidence2023, action.id) };

    /* Crew */
    case 'ADD_CREW':    return { ...state, crew: [...state.crew, action.member] };
    case 'UPDATE_CREW': return { ...state, crew: upd(state.crew, action.id, action.patch) };
    case 'DELETE_CREW': return { ...state, crew: del(state.crew, action.id) };

    /* Phases + Milestones */
    case 'ADD_PHASE':      return { ...state, schedulePhases: [...state.schedulePhases, action.phase] };
    case 'UPDATE_PHASE':   return { ...state, schedulePhases: upd(state.schedulePhases, action.id, action.patch) };
    case 'DELETE_PHASE':   return { ...state, schedulePhases: del(state.schedulePhases, action.id) };
    case 'ADD_MILESTONE':  return { ...state, milestones: [...state.milestones, action.milestone] };
    case 'UPDATE_MILESTONE':return { ...state, milestones: upd(state.milestones, action.id, action.patch) };
    case 'DELETE_MILESTONE':return { ...state, milestones: del(state.milestones, action.id) };
    case 'ADD_CALENDAR_EVENT':    return { ...state, calendarEvents: [...state.calendarEvents, action.event] };
    case 'UPDATE_CALENDAR_EVENT': return { ...state, calendarEvents: upd(state.calendarEvents, action.id, action.patch) };
    case 'DELETE_CALENDAR_EVENT': return { ...state, calendarEvents: del(state.calendarEvents, action.id) };

    /* v0.6 — Surface (holders) */
    case 'ADD_HOLDER':    return { ...state, holders: [...state.holders, action.holder] };
    case 'UPDATE_HOLDER': return { ...state, holders: upd(state.holders, action.id, action.patch) };
    case 'DELETE_HOLDER': return { ...state, holders: del(state.holders, action.id) };

    /* v0.6 — Choir */
    case 'ADD_CHOIR_QUESTION':    return { ...state, choirQuestions: [...state.choirQuestions, action.question] };
    case 'UPDATE_CHOIR_QUESTION': return { ...state, choirQuestions: upd(state.choirQuestions, action.id, action.patch) };
    case 'DELETE_CHOIR_QUESTION': return {
      ...state,
      choirQuestions: del(state.choirQuestions, action.id),
      choirEntries: state.choirEntries.filter((e) => e.questionId !== action.id),
    };
    case 'ADD_CHOIR_ENTRY':    return { ...state, choirEntries: [...state.choirEntries, action.entry] };
    case 'UPDATE_CHOIR_ENTRY': return { ...state, choirEntries: upd(state.choirEntries, action.id, action.patch) };
    case 'DELETE_CHOIR_ENTRY': return { ...state, choirEntries: del(state.choirEntries, action.id) };

    /* v0.6 — Life Mosaic */
    case 'ADD_LIFE_EVENT':    return { ...state, lifeEvents: [...state.lifeEvents, action.event] };
    case 'UPDATE_LIFE_EVENT': return { ...state, lifeEvents: upd(state.lifeEvents, action.id, action.patch) };
    case 'DELETE_LIFE_EVENT': return { ...state, lifeEvents: del(state.lifeEvents, action.id) };

    /* v0.6 — Resonance */
    case 'ADD_MOTIF_CHAIN':    return { ...state, motifChains: [...state.motifChains, action.chain] };
    case 'UPDATE_MOTIF_CHAIN': return { ...state, motifChains: upd(state.motifChains, action.id, action.patch) };
    case 'DELETE_MOTIF_CHAIN': return { ...state, motifChains: del(state.motifChains, action.id) };
    case 'ADD_MOTIF_ITEM':     return {
      ...state,
      motifChains: state.motifChains.map((c) =>
        c.id === action.chainId ? { ...c, items: [...c.items, action.item] } : c,
      ),
    };
    case 'UPDATE_MOTIF_ITEM':  return {
      ...state,
      motifChains: state.motifChains.map((c) =>
        c.id === action.chainId
          ? { ...c, items: c.items.map((it) => (it.id === action.itemId ? { ...it, ...action.patch } : it)) }
          : c,
      ),
    };
    case 'DELETE_MOTIF_ITEM':  return {
      ...state,
      motifChains: state.motifChains.map((c) =>
        c.id === action.chainId ? { ...c, items: c.items.filter((it) => it.id !== action.itemId) } : c,
      ),
    };

    /* v0.8 — story graph + idea hub */
    case 'ADD_STORY_EVENT':    return { ...state, storyEvents: [...state.storyEvents, action.event] };
    case 'UPDATE_STORY_EVENT': return { ...state, storyEvents: upd(state.storyEvents, action.id, action.patch) };
    case 'DELETE_STORY_EVENT': return { ...state, storyEvents: del(state.storyEvents, action.id) };
    case 'ADD_TOPIC':          return { ...state, topics: [...state.topics, action.topic] };
    case 'UPDATE_TOPIC':       return { ...state, topics: upd(state.topics, action.id, action.patch) };
    case 'DELETE_TOPIC':       return { ...state, topics: del(state.topics, action.id) };
    case 'ADD_HUB_IDEA':       return { ...state, hubIdeas: [...state.hubIdeas, action.idea] };
    case 'UPDATE_HUB_IDEA':    return { ...state, hubIdeas: upd(state.hubIdeas, action.id, action.patch) };
    case 'DELETE_HUB_IDEA':    return { ...state, hubIdeas: del(state.hubIdeas, action.id) };

    /* v0.9 — USA trip */
    case 'UPDATE_TRIP':        return { ...state, usaTrip: { ...state.usaTrip, ...action.patch } };
    case 'ADD_TRIP_STOP':      return { ...state, usaTrip: { ...state.usaTrip, stops: [...state.usaTrip.stops, action.stop] } };
    case 'UPDATE_TRIP_STOP':   return { ...state, usaTrip: { ...state.usaTrip, stops: upd(state.usaTrip.stops, action.id, action.patch) } };
    case 'DELETE_TRIP_STOP':   return { ...state, usaTrip: { ...state.usaTrip, stops: del(state.usaTrip.stops, action.id) } };
    case 'REORDER_TRIP_STOPS': return {
      ...state,
      usaTrip: {
        ...state.usaTrip,
        stops: action.ids.map((id) => state.usaTrip.stops.find((s) => s.id === id)).filter((s): s is TripStop => !!s),
      },
    };
    case 'ADD_TRIP_COST':      return { ...state, usaTrip: { ...state.usaTrip, costs: [...state.usaTrip.costs, action.cost] } };
    case 'UPDATE_TRIP_COST':   return { ...state, usaTrip: { ...state.usaTrip, costs: upd(state.usaTrip.costs, action.id, action.patch) } };
    case 'DELETE_TRIP_COST':   return { ...state, usaTrip: { ...state.usaTrip, costs: del(state.usaTrip.costs, action.id) } };
    case 'ADD_TRIP_DAY':       return { ...state, usaTrip: { ...state.usaTrip, days: [...state.usaTrip.days, action.day] } };
    case 'UPDATE_TRIP_DAY':    return { ...state, usaTrip: { ...state.usaTrip, days: upd(state.usaTrip.days, action.id, action.patch) } };
    case 'DELETE_TRIP_DAY':    return { ...state, usaTrip: { ...state.usaTrip, days: del(state.usaTrip.days, action.id) } };

    /* Sponsors + Risks + Contracts + Journal */
    case 'ADD_SPONSOR':    return { ...state, sponsors: [...state.sponsors, action.sponsor] };
    case 'UPDATE_SPONSOR': return { ...state, sponsors: upd(state.sponsors, action.id, action.patch) };
    case 'DELETE_SPONSOR': return { ...state, sponsors: del(state.sponsors, action.id) };
    case 'ADD_RISK':       return { ...state, risks: [...state.risks, action.risk] };
    case 'UPDATE_RISK':    return { ...state, risks: upd(state.risks, action.id, action.patch) };
    case 'DELETE_RISK':    return { ...state, risks: del(state.risks, action.id) };
    case 'ADD_CONTRACT':   return { ...state, contracts: [...state.contracts, action.contract] };
    case 'UPDATE_CONTRACT':return { ...state, contracts: upd(state.contracts, action.id, action.patch) };
    case 'DELETE_CONTRACT':return { ...state, contracts: del(state.contracts, action.id) };
    case 'ADD_JOURNAL':    return { ...state, journalEntries: [...state.journalEntries, action.entry] };
    case 'UPDATE_JOURNAL': return { ...state, journalEntries: upd(state.journalEntries, action.id, action.patch) };
    case 'DELETE_JOURNAL': return { ...state, journalEntries: del(state.journalEntries, action.id) };
    case 'ADD_REFERENCE':  return { ...state, references: [...state.references, action.reference] };
    case 'UPDATE_REFERENCE':return { ...state, references: upd(state.references, action.id, action.patch) };
    case 'DELETE_REFERENCE':return { ...state, references: del(state.references, action.id) };

    /* Festivals + Sales + Broadcasters */
    case 'ADD_FESTIVAL':      return { ...state, festivals: [...state.festivals, action.festival] };
    case 'UPDATE_FESTIVAL':   return { ...state, festivals: upd(state.festivals, action.id, action.patch) };
    case 'DELETE_FESTIVAL':   return { ...state, festivals: del(state.festivals, action.id) };
    case 'ADD_SALES_AGENT':   return { ...state, salesAgents: [...state.salesAgents, action.agent] };
    case 'UPDATE_SALES_AGENT':return { ...state, salesAgents: upd(state.salesAgents, action.id, action.patch) };
    case 'DELETE_SALES_AGENT':return { ...state, salesAgents: del(state.salesAgents, action.id) };
    case 'ADD_BROADCASTER':   return { ...state, broadcasters: [...state.broadcasters, action.b] };
    case 'UPDATE_BROADCASTER':return { ...state, broadcasters: upd(state.broadcasters, action.id, action.patch) };
    case 'DELETE_BROADCASTER':return { ...state, broadcasters: del(state.broadcasters, action.id) };

    /* Pitch Deck */
    case 'ADD_PITCH_CARD':    return { ...state, pitchCards: [...state.pitchCards, action.card] };
    case 'UPDATE_PITCH_CARD': return { ...state, pitchCards: upd(state.pitchCards, action.id, action.patch) };
    case 'DELETE_PITCH_CARD': return {
      ...state,
      pitchCards: del(state.pitchCards, action.id),
      pitchDecks: state.pitchDecks.map((d) => ({ ...d, cardIds: d.cardIds.filter((cid) => cid !== action.id) })),
    };
    case 'ADD_PITCH_DECK':    return { ...state, pitchDecks: [...state.pitchDecks, action.deck] };
    case 'UPDATE_PITCH_DECK': return { ...state, pitchDecks: upd(state.pitchDecks, action.id, action.patch) };
    case 'DELETE_PITCH_DECK': return { ...state, pitchDecks: del(state.pitchDecks, action.id) };

    /* Cross-cutting */
    case 'ADD_TASK':    return { ...state, tasks: [...state.tasks, action.task] };
    case 'UPDATE_TASK': return { ...state, tasks: upd(state.tasks, action.id, action.patch) };
    case 'DELETE_TASK': return { ...state, tasks: del(state.tasks, action.id) };
    case 'ADD_NOTE':    return { ...state, notes: [...state.notes, action.note] };
    case 'UPDATE_NOTE': return { ...state, notes: upd(state.notes, action.id, action.patch) };
    case 'DELETE_NOTE': return { ...state, notes: del(state.notes, action.id) };
    case 'ADD_ASSET':   return { ...state, assets: [...state.assets, action.asset] };
    case 'UPDATE_ASSET':return { ...state, assets: upd(state.assets, action.id, action.patch) };
    case 'DELETE_ASSET':return { ...state, assets: del(state.assets, action.id) };
    case 'ADD_SCENARIO_PART':    return { ...state, scenarioParts: [...state.scenarioParts, action.part] };
    case 'UPDATE_SCENARIO_PART': return { ...state, scenarioParts: upd(state.scenarioParts, action.id, action.patch) };
    case 'DELETE_SCENARIO_PART': return { ...state, scenarioParts: del(state.scenarioParts, action.id) };
    case 'SET_MONEY_LINE': {
      const sc = state.scenarios[action.scenario];
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [action.scenario]: { ...sc, [action.kind]: { ...sc[action.kind], [action.key]: action.value } },
        },
      };
    }
    case 'DELETE_MONEY_LINE': {
      const sc = state.scenarios[action.scenario];
      const rest = { ...sc[action.kind] };
      delete rest[action.key];
      return {
        ...state,
        scenarios: { ...state.scenarios, [action.scenario]: { ...sc, [action.kind]: rest } },
      };
    }
    case 'ADD_SCENARIO_ARC':    return { ...state, scenarioArcs: [...state.scenarioArcs, action.arc] };
    case 'UPDATE_SCENARIO_ARC': return { ...state, scenarioArcs: upd(state.scenarioArcs, action.id, action.patch) };
    case 'DELETE_SCENARIO_ARC': return {
      ...state,
      scenarioArcs: del(state.scenarioArcs, action.id),
      /* A story that no longer exists shouldn't linger as a chip on parts. */
      scenarioParts: state.scenarioParts.map((p) =>
        p.arcIds?.includes(action.id) ? { ...p, arcIds: p.arcIds.filter((a) => a !== action.id) } : p,
      ),
    };
    /* ---- The Map ---- */
    case 'ADD_MAP_LANE':    return { ...state, mapLanes: [...state.mapLanes, action.lane] };
    case 'UPDATE_MAP_LANE': return { ...state, mapLanes: upd(state.mapLanes, action.id, action.patch) };
    case 'DELETE_MAP_LANE': return {
      ...state,
      mapLanes: del(state.mapLanes, action.id),
      /* A stage takes its own bubbles with it, and any arrow pointing at it
         goes too — a link to something that no longer exists would draw a
         curve into empty space. */
      mapNodes: state.mapNodes
        .filter((n) => n.laneId !== action.id)
        .map((n) => (n.links?.includes(action.id) ? { ...n, links: n.links.filter((l) => l !== action.id) } : n)),
    };
    case 'MOVE_MAP_LANE': {
      const sorted = [...state.mapLanes].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((l) => l.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= sorted.length) return state;
      const oi = sorted[i].order, oj = sorted[j].order;
      return {
        ...state,
        mapLanes: state.mapLanes.map((l) =>
          l.id === sorted[i].id ? { ...l, order: oj } : l.id === sorted[j].id ? { ...l, order: oi } : l,
        ),
      };
    }
    case 'ADD_MAP_NODE':    return { ...state, mapNodes: [...state.mapNodes, action.node] };
    case 'UPDATE_MAP_NODE': return { ...state, mapNodes: upd(state.mapNodes, action.id, action.patch) };
    case 'DELETE_MAP_NODE': return {
      ...state,
      /* Drop the bubble, anything hanging off it, and every arrow aimed at it. */
      mapNodes: state.mapNodes
        .filter((n) => n.id !== action.id && n.parentId !== action.id)
        .map((n) => (n.links?.includes(action.id) ? { ...n, links: n.links.filter((l) => l !== action.id) } : n)),
    };
    case 'ADD_MAP_ASIDE':    return { ...state, mapAsides: [...state.mapAsides, action.aside] };
    case 'UPDATE_MAP_ASIDE': return { ...state, mapAsides: upd(state.mapAsides, action.id, action.patch) };
    case 'DELETE_MAP_ASIDE': return { ...state, mapAsides: del(state.mapAsides, action.id) };

    case 'MOVE_MAP_NODE': {
      const moving = state.mapNodes.find((n) => n.id === action.id);
      if (!moving || moving.laneId === action.laneId) return state;
      /* A mark takes its children with it. Without the cascade the children
         keep the old laneId and are stranded — present in the doc, drawn
         nowhere, because every field renders `laneId === lane.id`. */
      const family = new Set<string>([action.id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const n of state.mapNodes) {
          if (n.parentId && family.has(n.parentId) && !family.has(n.id)) { family.add(n.id); grew = true; }
        }
      }
      const max = state.mapNodes
        .filter((n) => n.laneId === action.laneId)
        .reduce((m, n) => Math.max(m, n.order), 0);
      return {
        ...state,
        mapNodes: state.mapNodes.map((n) =>
          n.id === action.id ? { ...n, laneId: action.laneId, parentId: undefined, order: max + 1 }
          : family.has(n.id) ? { ...n, laneId: action.laneId }
          : n,
        ),
      };
    }

    case 'PROMOTE_MAP_ASIDE_LINE': {
      const aside = state.mapAsides.find((a) => a.id === action.asideId);
      /* The tray holds bare strings, not rows with ids, so the only handle we
         have is the index — and it can have shifted under us between dragstart
         and drop. Verify the label still sits where we left it; a mismatch
         means someone else edited the tray, and the safe move is nothing. */
      if (!aside || aside.lines[action.index] !== action.label) return state;
      const max = state.mapNodes
        .filter((n) => n.laneId === action.laneId)
        .reduce((m, n) => Math.max(m, n.order), 0);
      return {
        ...state,
        mapAsides: upd(state.mapAsides, action.asideId, {
          lines: aside.lines.filter((_, i) => i !== action.index),
        }),
        mapNodes: [...state.mapNodes, {
          id: `mn-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
          laneId: action.laneId, order: max + 1, label: action.label, kind: classifyLabel(action.label),
        }],
      };
    }

    case 'DEMOTE_MAP_NODE': {
      const node = state.mapNodes.find((n) => n.id === action.id);
      const aside = state.mapAsides.find((a) => a.id === action.asideId);
      if (!node || !aside) return state;
      return {
        ...state,
        /* Children would be orphaned by the move, so they go back to the tray
           alongside their parent rather than vanishing with it. */
        mapNodes: state.mapNodes.filter((n) => n.id !== action.id && n.parentId !== action.id),
        mapAsides: upd(state.mapAsides, action.asideId, {
          lines: [
            ...aside.lines,
            node.label,
            ...state.mapNodes.filter((n) => n.parentId === action.id).map((n) => n.label),
          ],
        }),
      };
    }

    case 'DELETE_SCENARIO_QUOTE': {
      const part = state.scenarioParts.find((p) => p.id === action.partId);
      if (!part || part.quotes?.[action.index] !== action.text) return state;
      return {
        ...state,
        scenarioParts: upd(state.scenarioParts, action.partId, {
          quotes: (part.quotes ?? []).filter((_, i) => i !== action.index),
        }),
      };
    }

    case 'MOVE_SCENARIO_PART': {
      const sorted = [...state.scenarioParts].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((p) => p.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= sorted.length) return state;
      /* Swap the two parts' order values so the sequence reshuffles. */
      const oi = sorted[i].order, oj = sorted[j].order;
      const parts = state.scenarioParts.map((p) =>
        p.id === sorted[i].id ? { ...p, order: oj } : p.id === sorted[j].id ? { ...p, order: oi } : p,
      );
      return { ...state, scenarioParts: parts };
    }

    default:
      return state;
  }
}
