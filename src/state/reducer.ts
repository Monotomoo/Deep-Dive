import type {
  AppState,
  Asset,
  BiggerSwing,
  Broadcaster,
  Contract,
  CoverageCam,
  CrewMember,
  DivingRecord,
  Evidence2023,
  FestivalSubmission,
  FourKey,
  GrammarDevice,
  Interview,
  JournalEntry,
  Milestone,
  Note,
  PhysiologyDatum,
  RecordAttempt,
  Reference,
  Risk,
  Ritual,
  SalesAgent,
  SchedulePhase,
  ScenarioKey,
  Shoot,
  ShootDay,
  Sponsor,
  SpineAnswer,
  Talent,
  TalentFour,
  Task,
  Thread,
  ThreadQuestion,
  ViewKey,
  WatcherMoment,
} from '../types';
import { makeInitialState } from '../lib/seed';

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
  /* Spine */
  | { type: 'UPSERT_SPINE_ANSWER'; answer: SpineAnswer }
  | { type: 'DELETE_SPINE_ANSWER'; id: string }
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
  /* Cross-cutting */
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; id: string; patch: Partial<Note> }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'ADD_ASSET'; asset: Asset }
  | { type: 'UPDATE_ASSET'; id: string; patch: Partial<Asset> }
  | { type: 'DELETE_ASSET'; id: string };

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

    /* Spine */
    case 'UPSERT_SPINE_ANSWER': {
      const exists = state.spineAnswers.some((a) => a.id === action.answer.id);
      return {
        ...state,
        spineAnswers: exists
          ? upd(state.spineAnswers, action.answer.id, action.answer)
          : [...state.spineAnswers, action.answer],
      };
    }
    case 'DELETE_SPINE_ANSWER': return { ...state, spineAnswers: del(state.spineAnswers, action.id) };

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

    default:
      return state;
  }
}
