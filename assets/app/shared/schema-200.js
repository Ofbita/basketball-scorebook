(function (global) {
  'use strict';

  const CURRENT_SCHEMA_VERSION = 200;
  const TEAM_KEYS = ['home', 'away'];
  const REGULATION_PERIODS = ['q1', 'q2', 'q3', 'q4'];
  const ALL_PERIODS = ['q1', 'q2', 'q3', 'q4', 'ot1', 'ot2'];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createScore() {
    return { q1: '', q2: '', q3: '', q4: '', ot1: '', ot2: '' };
  }

  function createQuarterTimes() {
    return {
      q1: { start: '', end: '' },
      q2: { start: '', end: '' },
      q3: { start: '', end: '' },
      q4: { start: '', end: '' },
      ot1: { start: '', end: '' },
      ot2: { start: '', end: '' }
    };
  }

  function createParticipation() {
    return { q1: '', q2: '', q3: '', q4: '' };
  }

  function createQuarterStats() {
    return {
      q1: { pt2: '', pt3: '', ft: '', fta: '' },
      q2: { pt2: '', pt3: '', ft: '', fta: '' },
      q3: { pt2: '', pt3: '', ft: '', fta: '' },
      q4: { pt2: '', pt3: '', ft: '', fta: '' },
      ot: { pt2: '', pt3: '', ft: '', fta: '' }
    };
  }

  function createFoulSlot(base) {
    const src = base || {};
    return {
      active: !!src.active,
      time: src.time || '',
      displayText: src.displayText || '',
      markShape: src.markShape || '',
      circle: !!src.circle,
      slash: !!src.slash
    };
  }

  function createPlayer(id) {
    return {
      id: id || '',
      number: '',
      name: '',
      licenseNo: '',
      participation: createParticipation(),
      fouls: Array.from({ length: 5 }, function () {
        return createFoulSlot();
      }),
      quarterStats: createQuarterStats()
    };
  }

  function createMiniTimeoutSlot(base) {
    const src = base || {};
    return {
      active: !!src.active,
      rawClock: src.rawClock || src.time || '',
      mark: src.mark || ''
    };
  }

  function createTimeouts() {
    return {
      q1: [createMiniTimeoutSlot()],
      q2: [createMiniTimeoutSlot()],
      q3: [createMiniTimeoutSlot()],
      q4: [createMiniTimeoutSlot()],
      ot1: [createMiniTimeoutSlot()],
      ot2: [createMiniTimeoutSlot()]
    };
  }

  function createTeam() {
    return {
      name: '',
      coach: '',
      assistantCoach: '',
      coachLicenseNo: '',
      assistantCoachLicenseNo: '',
      players: Array.from({ length: 15 }, function (_, idx) {
        return createPlayer('player-' + idx);
      }),
      teamState: {
        memo: '',
        teamFouls: { q1: 0, q2: 0, q3: 0, q4: 0 },
        timeouts: createTimeouts()
      },
      runningScore: {}
    };
  }

  function createCommonData(ruleSet) {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      game: {
        id: '',
        ruleSet: ruleSet || 'standard',
        date: '',
        venue: '',
        status: 'in_progress'
      },
      meta: {
        tournamentName: '',
        gameNo: '',
        startTime: '',
        endTime: '',
        crewChief: '',
        umpire: '',
        scorer: '',
        assistantScorer: '',
        timer: '',
        shotClock: '',
        homeUniformColor: '',
        awayUniformColor: '',
        winnerTeam: '',
        templateId: ''
      },
      teams: {
        home: createTeam(),
        away: createTeam()
      },
      score: {
        home: createScore(),
        away: createScore()
      },
      quarterTimes: createQuarterTimes(),
      foulEvents: [],
      eventLog: [],
      annotations: {
        foulMarks: {},
        timeoutMarks: {},
        runningMarks: {},
        statMarks: {}
      },
      liveState: {
        homeOnCourtIds: [],
        awayOnCourtIds: []
      },
      uiState: {
        activeTeam: 'home'
      }
    };
  }

  function isCommonSchema200(raw) {
    return !!raw && Number(raw.schemaVersion) === CURRENT_SCHEMA_VERSION;
  }

  global.BASKSCHEMA200 = {
    CURRENT_SCHEMA_VERSION: CURRENT_SCHEMA_VERSION,
    TEAM_KEYS: TEAM_KEYS,
    REGULATION_PERIODS: REGULATION_PERIODS,
    ALL_PERIODS: ALL_PERIODS,
    clone: clone,
    createScore: createScore,
    createQuarterTimes: createQuarterTimes,
    createParticipation: createParticipation,
    createQuarterStats: createQuarterStats,
    createFoulSlot: createFoulSlot,
    createPlayer: createPlayer,
    createMiniTimeoutSlot: createMiniTimeoutSlot,
    createTimeouts: createTimeouts,
    createTeam: createTeam,
    createCommonData: createCommonData,
    isCommonSchema200: isCommonSchema200
  };
})(window);
