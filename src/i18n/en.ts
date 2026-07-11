/* ---------- English strings (canonical source of truth) ----------
   Deep Dive · a documentary about four freedivers, the bonds that hold them.
   Keys use dot.namespace.format. hr.ts mirrors this shape.
   The `Strings` type is derived from this object so the compiler enforces
   parity between locales. */

export const en = {
  /* ---------- Sidebar nav ---------- */
  'nav.overview':     'Overview',
  'nav.vision':       'Vision',
  'nav.schedule':     'Schedule',
  'nav.crew':         'Crew',
  'nav.sponsors':     'Sponsors',
  'nav.risks':        'Risks',
  'nav.four':         'The Four',
  'nav.threads':      'Threads',
  'nav.spine':        'Spine',
  'nav.shoots':       'Shoots',
  'nav.interviews':   'Interviews',
  'nav.swings':       'Bigger Swings',
  'nav.devices':      'Devices',
  'nav.records':      'Records',
  'nav.physiology':   'Physiology',
  'nav.watchers':     'Watchers',
  'nav.camera-team':  'Camera Team',
  'nav.pitch':        'Pitch',
  'nav.distribution': 'Distribution',
  'nav.contracts':    'Contracts',
  'nav.journal':      'Journal',
  'nav.post':         'Post-production',
  'nav.references':   'References',
  'nav.chapter-2023': 'The 2023 Chapter',

  /* Sidebar group headers */
  'nav.group.plan':    'Plan',
  'nav.group.make':    'Make',
  'nav.group.tell':    'Tell',
  'nav.group.library': 'Library',

  /* ---------- Common UI ---------- */
  'common.add':       'Add',
  'common.delete':    'Delete',
  'common.edit':      'Edit',
  'common.save':      'Save',
  'common.cancel':    'Cancel',
  'common.close':     'Close',
  'common.confirm':   'Confirm',
  'common.remove':    'Remove',
  'common.open':      'Open',
  'common.search':    'Search',
  'common.filter':    'Filter',
  'common.export':    'Export',
  'common.import':    'Import',
  'common.print':     'Print',
  'common.notes':     'Notes',
  'common.notes.placeholder': 'Notes',
  'common.untitled':  'Untitled',
  'common.empty':     'Empty',
  'common.new':       'New',
  'common.status':    'Status',
  'common.date':      'Date',
  'common.location':  'Location',
  'common.owner':     'Owner',

  /* ---------- Splash + epigraph ---------- */
  'splash.title':     'Deep Dive',
  'splash.subtitle':  'a feature and a series',
  'splash.epigraph':  'one person holds another in the world',

  /* ---------- Overview ---------- */
  'overview.title':               'Overview',
  'overview.subtitle':            'the film at a glance · shoots · threads · spine',
  'overview.epigraph':            'one person holds another in the world',
  'overview.tagline':             'not a film about depth · a film about who waits for you at the surface',
  'overview.shoots.done':         'Shoots complete',
  'overview.shoots.planned':      'Shoots planned',
  'overview.threads.active':      'Threads active',
  'overview.spine.captured':      'Spine captures',
  'overview.next.shoot':          'Next shoot',
  'overview.swings.achieved':     'Swings achieved',

  /* ---------- The Four ---------- */
  'four.title':                   'The Four',
  'four.subtitle':                'Petar · Vito · Sanda · Zsófia · the leads',
  'four.role':                    'role',
  'four.epithet':                 'epithet',
  'four.hometown':                'hometown',
  'four.language':                'primary language',
  'four.arc':                     'arc note',
  'four.bio':                     'bio',
  'four.related':                 'related talent',

  /* ---------- Threads ---------- */
  'threads.title':                'The 10 Threads',
  'threads.subtitle':             'narrative arcs woven across every shoot',
  'threads.owner':                'owner',
  'threads.owner.ensemble':       'ensemble',
  'threads.owner.petar-vito':     'Petar & Vito',
  'threads.owner.sanda-zsofia':   'Sanda & Zsófia',
  'threads.status.unopened':      'unopened',
  'threads.status.opening':       'opening',
  'threads.status.active':        'active',
  'threads.status.ready':         'ready to cut',
  'threads.status.incut':         'in cut',
  'threads.questions':            'questions',
  'threads.q.draft':              'draft',
  'threads.q.asked':              'asked',
  'threads.q.answered':           'answered',
  'threads.q.follow-up':          'follow up',
  'threads.q.retired':            'retired',

  /* ---------- Spine · Ideas Workshop ---------- */
  'spine.title':                  'Spine · Ideas Workshop',
  'spine.subtitle':               'candidate spines for the film · discuss, promote, drop · not locked yet',
  'spine.add':                    'add spine idea',
  'spine.status.idea':            'idea',
  'spine.status.discussing':      'discussing',
  'spine.status.leading':         'leading',
  'spine.status.dropped':         'dropped',
  'spine.votes':                  'votes',
  'spine.empty':                  'No spine ideas yet. Add the first candidate — the film\'s core question is still open.',

  /* ---------- Shoots ---------- */
  'shoots.title':                 'The Shoots',
  'shoots.subtitle':              'the 6 stages of the film · where we shoot it',
  'shoots.status.planned':        'planned',
  'shoots.status.confirmed':      'confirmed',
  'shoots.status.in-progress':    'rolling',
  'shoots.status.completed':      'completed',
  'shoots.status.archived':       'archived',
  'shoots.spirit':                'spirit',
  'shoots.captures':              'what to come home with',
  'shoots.bible':                 'shoot bible',
  'shoots.present.four':          'who is there',
  'shoots.days':                  'days',
  'shoots.wonderfulness':         'what surpassed the plan',
  'shoots.coverage':              'camera coverage',

  /* ---------- Interviews ---------- */
  'interviews.title':             'Interviews',
  'interviews.subtitle':          'session captures · tagged by thread · spine · person · shoot',
  'interviews.status.planned':    'planned',
  'interviews.status.in-session': 'in session',
  'interviews.status.captured':   'captured',
  'interviews.status.transcribed':'transcribed',
  'interviews.status.in-cut':     'in cut',
  'interviews.status.in-final':   'in final',

  /* ---------- Bigger Swings ---------- */
  'swings.title':                 'Bigger Swings',
  'swings.subtitle':              'the ambitious bets · the things that could make the film unlike anything in the genre',
  'swings.status.idea':           'idea',
  'swings.status.planned':        'planned',
  'swings.status.attempted':      'attempted',
  'swings.status.achieved':       'achieved',
  'swings.status.in-cut':         'in cut',
  'swings.status.in-final':       'in final',
  'swings.status.dropped':        'dropped',
  'swings.achieved.at':           'achieved',

  /* ---------- Grammar Devices ---------- */
  'devices.title':                'Grammar Devices',
  'devices.subtitle':             'the 4 recurring ways the film speaks',
  'devices.captures':             'captures',
  'devices.used.in.cut':          'times used in cut',

  /* ---------- Records + Attempts ---------- */
  'records.title':                'Records',
  'records.subtitle':             'the four\'s standing marks · Petar CNF 103m · Vito ~29min STA · Sanda first HR woman past 100m · Zsófia FIM 105m + 300m DYN',
  'records.discipline':           'discipline',
  'records.depth':                'depth',
  'records.time':                 'time',
  'records.distance':             'distance',
  'records.scope':                'scope',
  'records.status.standing':      'standing',
  'records.status.broken':        'broken',
  'records.status.pending':       'pending ratification',

  /* ---------- Physiology ---------- */
  'physiology.title':             'Physiology',
  'physiology.subtitle':          "body as witness · the film's score is built from real physiology",
  'physiology.metric':            'metric',
  'physiology.used.in.score':     'used in score',

  /* ---------- Watchers ---------- */
  'watchers.title':               'Watcher Moments',
  'watchers.subtitle':            'the faces watching · the emotional centre of every attempt',

  /* ---------- Camera Team + Inventory ---------- */
  'camera-team.title':            'Camera Team',
  'camera-team.subtitle':         'cameras · lenses · mics · lights · per-operator kit bag · per-shoot loadout',
  'camera-team.tab.all':          'All inventory',
  'camera-team.tab.bags':         'Kit bags',
  'camera-team.tab.shoot':        'Per shoot',
  'camera-team.cameras':          'Cameras',
  'camera-team.lenses':           'Lenses',
  'camera-team.mics':             'Microphones',
  'camera-team.lights':           'Lights',
  'camera-team.add.camera':       'add camera',
  'camera-team.add.lens':         'add lens',
  'camera-team.add.mic':          'add mic',
  'camera-team.add.light':        'add light',
  'camera-team.owner.owned':      'owned',
  'camera-team.owner.rented':     'rented',
  'camera-team.owner.borrowed':   'borrowed',
  'camera-team.owner.coming':     'coming',
  'camera-team.operator':         'operator',
  'camera-team.no.operator':      'unassigned',
  'camera-team.uw':               'UW rig',
  'camera-team.assigned.to':      'assigned to',

  /* ---------- 2023 Chapter ---------- */
  'chapter-2023.title':           'The 2023 Chapter',
  'chapter-2023.subtitle':        'evidence library · the peer-reviewed case · the truth on our side',
  'chapter-2023.evidence.type':   'type',
  'chapter-2023.on-file':         'on file',

  /* ---------- Vision ---------- */
  'vision.title':                 'Vision',
  'vision.subtitle':              'the film in one breath · the grammar · the north star',
  'vision.grammar':               'grammar',
  'vision.grammar.text':          'dynamic above the surface · sacred below it · the cut between those two worlds is the film',
  'vision.thesis':                'one person holds another in the world',

  /* ---------- Schedule ---------- */
  'schedule.title':               'Schedule',
  'schedule.subtitle':            'shoots · milestones · festival deadlines',

  /* ---------- Crew ---------- */
  'crew.title':                   'Crew',
  'crew.subtitle':                'the film crew · not talent',

  /* ---------- Sponsors ---------- */
  'sponsors.title':               'Sponsors',
  'sponsors.subtitle':            'pipeline · tiers · committed',

  /* ---------- Risks ---------- */
  'risks.title':                  'Risks',
  'risks.subtitle':               'probability × impact · mitigation',

  /* ---------- Contracts ---------- */
  'contracts.title':              'Contracts',
  'contracts.subtitle':           'talent releases · consent · veto tracking',

  /* ---------- Journal ---------- */
  'journal.title':                'Journal',
  'journal.subtitle':             'production diary · per shoot day',

  /* ---------- Pitch ---------- */
  'pitch.title':                  'Pitch',
  'pitch.subtitle':               'Sundance · Berlinale · IDFA · target festivals',

  /* ---------- Distribution ---------- */
  'distribution.title':           'Distribution',
  'distribution.subtitle':        'sales · broadcasters · markets · deals',

  /* ---------- Post-production ---------- */
  'post.title':                   'Post-production',
  'post.subtitle':                'feature 90-100 min · 3-episode series · deliverables',

  /* ---------- References ---------- */
  'references.title':             'References',
  'references.subtitle':          'touchstone films · books · papers',
} as const;

export type StringKey = keyof typeof en;
export type Strings = Record<StringKey, string>;
