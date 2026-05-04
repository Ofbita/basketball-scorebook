(function (global) {
  'use strict';

  const S = global.BASKSCHEMA200;

  function ensureObject(value) {
    return value && typeof value === 'object' ? value : {};
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function toInt(value) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function stringOrEmpty(value) {
    return value == null ? '' : String(value);
  }

  function createSnapshotEventFactory() {
    var now = Date.now();
    var seq = 0;
    return function createEvent(base) {
      var eventId = 'evt-classic-' + now + '-' + seq;
      seq += 1;
      return Object.assign({
        id: eventId,
        action: 'create',
        replacesEventId: null,
        createdAt: now + seq,
        kind: 'note',
        team: 'home',
        clock: '',
        payload: {},
        subjectType: '',
        subjectId: ''
      }, base || {});
    };
  }

  function createSafetyEventLogFromCommon(common) {
    var out = [];
    var createEvent = createSnapshotEventFactory();
    var periods = ['q1', 'q2', 'q3', 'q4', 'ot1', 'ot2'];

    S.TEAM_KEYS.forEach(function (teamKey) {
      var teamScore = ensureObject(common.score && common.score[teamKey]);
      periods.forEach(function (period) {
        var points = toInt(teamScore[period]);
        if (points === 0) return;
        out.push(createEvent({
          kind: 'score',
          team: teamKey,
          clock: '',
          subjectType: 'team',
          subjectId: teamKey,
          payload: {
            period: period,
            points: points,
            scoreType: 'snapshot'
          }
        }));
      });
    });

    S.TEAM_KEYS.forEach(function (teamKey) {
      var players = ensureArray(common.teams && common.teams[teamKey] && common.teams[teamKey].players);
      players.forEach(function (player, playerIdx) {
        var p = ensureObject(player);
        var playerId = p.id || (teamKey + '-' + playerIdx);
        var fouls = ensureArray(p.fouls);
        fouls.slice(0, 5).forEach(function (foul, slotIndex) {
          var fs = ensureObject(foul);
          if (!fs.active) return;
          var clock = stringOrEmpty(fs.time);
          out.push(createEvent({
            kind: 'foul',
            team: teamKey,
            clock: clock,
            subjectType: 'player',
            subjectId: playerId,
            payload: {
              who: 'player',
              playerId: playerId,
              period: 'q1',
              type: stringOrEmpty(fs.displayText || 'P'),
              ftCount: null,
              note: '',
              slotIndex: slotIndex,
              displayText: stringOrEmpty(fs.displayText || '')
            }
          }));
        });
      });
    });

    S.TEAM_KEYS.forEach(function (teamKey) {
      var timeouts = ensureObject(common.teams && common.teams[teamKey] && common.teams[teamKey].teamState && common.teams[teamKey].teamState.timeouts);
      periods.forEach(function (period) {
        var slots = ensureArray(timeouts[period]);
        slots.forEach(function (slot, slotIndex) {
          var timeout = ensureObject(slot);
          if (!timeout.active) return;
          var rawClock = stringOrEmpty(timeout.rawClock || timeout.time);
          out.push(createEvent({
            kind: 'timeout',
            team: teamKey,
            clock: rawClock,
            subjectType: 'team',
            subjectId: teamKey,
            payload: {
              period: period,
              slotIndex: slotIndex,
              active: true,
              rawClock: rawClock,
              mark: stringOrEmpty(timeout.mark || ''),
              timeoutType: 'charged'
            }
          }));
        });
      });
    });

    return out;
  }

  function normalizeParticipation(value) {
    if (value === true) return 'both';
    if (value === false || value == null) return '';
    if (['', 'start', 'subIn', 'both'].includes(value)) return value;
    if (value === 'X') return 'both';
    return '';
  }

  function normalizeClassicTimeoutSlot(slot) {
    const src = ensureObject(slot);
    return {
      active: !!src.active,
      time: src.time || ''
    };
  }

  function createClassicTimeouts() {
    return {
      firstHalf: [normalizeClassicTimeoutSlot(), normalizeClassicTimeoutSlot()],
      secondHalf: [normalizeClassicTimeoutSlot(), normalizeClassicTimeoutSlot(), normalizeClassicTimeoutSlot()],
      ot1: [normalizeClassicTimeoutSlot()],
      ot2: [normalizeClassicTimeoutSlot()]
    };
  }

  function commonTimeoutsFromClassic(raw) {
    const src = ensureObject(raw);
    return {
      q1: [S.createMiniTimeoutSlot(ensureArray(src.firstHalf)[0])],
      q2: [S.createMiniTimeoutSlot(ensureArray(src.firstHalf)[1])],
      q3: [S.createMiniTimeoutSlot(ensureArray(src.secondHalf)[0])],
      q4: [S.createMiniTimeoutSlot(ensureArray(src.secondHalf)[1])],
      ot1: [S.createMiniTimeoutSlot(ensureArray(src.ot1)[0])],
      ot2: [S.createMiniTimeoutSlot(ensureArray(src.ot2)[0])]
    };
  }

  function classicTimeoutsFromCommon(raw) {
    const src = ensureObject(raw);
    return {
      firstHalf: [
        normalizeClassicTimeoutSlot(ensureArray(src.q1)[0]),
        normalizeClassicTimeoutSlot(ensureArray(src.q2)[0])
      ],
      secondHalf: [
        normalizeClassicTimeoutSlot(ensureArray(src.q3)[0]),
        normalizeClassicTimeoutSlot(ensureArray(src.q4)[0]),
        normalizeClassicTimeoutSlot()
      ],
      ot1: [normalizeClassicTimeoutSlot(ensureArray(src.ot1)[0])],
      ot2: [normalizeClassicTimeoutSlot(ensureArray(src.ot2)[0])]
    };
  }

  function mapLegacyPlayerToCommon(player, idx, teamKey) {
    const src = ensureObject(player);
    const out = S.createPlayer(src.id || (teamKey + '-' + idx));
    out.number = src.number || '';
    out.name = src.name || '';
    out.licenseNo = src.licenseNo || '';
    out.participation.q1 = normalizeParticipation(src.participation && src.participation.q1);
    out.participation.q2 = normalizeParticipation(src.participation && src.participation.q2);
    out.participation.q3 = normalizeParticipation(src.participation && src.participation.q3);
    out.participation.q4 = normalizeParticipation(src.participation && src.participation.q4);

    if (Array.isArray(src.fouls)) {
      out.fouls = src.fouls.slice(0, 5).map(function (f) {
        if (typeof f === 'boolean') return S.createFoulSlot({ active: f, time: '' });
        return S.createFoulSlot(f);
      });
      while (out.fouls.length < 5) out.fouls.push(S.createFoulSlot());
    }

    if (src.quarterStats && typeof src.quarterStats === 'object') {
      out.quarterStats = {
        q1: Object.assign(S.createQuarterStats().q1, ensureObject(src.quarterStats.q1)),
        q2: Object.assign(S.createQuarterStats().q2, ensureObject(src.quarterStats.q2)),
        q3: Object.assign(S.createQuarterStats().q3, ensureObject(src.quarterStats.q3)),
        q4: Object.assign(S.createQuarterStats().q4, ensureObject(src.quarterStats.q4)),
        ot: Object.assign(S.createQuarterStats().ot, ensureObject(src.quarterStats.ot))
      };
    }

    return out;
  }

  function mapCommonPlayerToClassic(player, idx, teamKey) {
    const src = ensureObject(player);
    return {
      id: src.id || (teamKey + '-' + idx),
      number: src.number || '',
      name: src.name || '',
      licenseNo: src.licenseNo || '',
      participation: {
        q1: normalizeParticipation(src.participation && src.participation.q1),
        q2: normalizeParticipation(src.participation && src.participation.q2),
        q3: normalizeParticipation(src.participation && src.participation.q3),
        q4: normalizeParticipation(src.participation && src.participation.q4)
      },
      fouls: ensureArray(src.fouls).slice(0, 5).map(function (f) {
        return {
          active: !!f.active,
          time: f.time || ''
        };
      }).concat(Array.from({ length: Math.max(0, 5 - ensureArray(src.fouls).length) }, function () {
        return { active: false, time: '' };
      })),
      quarterStats: {
        q1: Object.assign({ pt2: '', pt3: '', ft: '', fta: '' }, ensureObject(src.quarterStats && src.quarterStats.q1)),
        q2: Object.assign({ pt2: '', pt3: '', ft: '', fta: '' }, ensureObject(src.quarterStats && src.quarterStats.q2)),
        q3: Object.assign({ pt2: '', pt3: '', ft: '', fta: '' }, ensureObject(src.quarterStats && src.quarterStats.q3)),
        q4: Object.assign({ pt2: '', pt3: '', ft: '', fta: '' }, ensureObject(src.quarterStats && src.quarterStats.q4)),
        ot: Object.assign({ pt2: '', pt3: '', ft: '', fta: '' }, ensureObject(src.quarterStats && src.quarterStats.ot))
      }
    };
  }

  function ensureRunningScore(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const out = {};
    for (let i = 1; i <= 160; i++) {
      const key = String(i);
      const item = ensureObject(src[key]);
      out[key] = {
        number: item.number || '',
        time: item.time || ''
      };
    }
    return out;
  }

  function mapLegacyTeamToCommon(team, fallbackName, teamKey) {
    const src = ensureObject(team);
    const out = S.createTeam();
    out.name = fallbackName || src.name || '';
    out.coach = src.coach || '';
    out.assistantCoach = src.assistantCoach || '';
    out.coachLicenseNo = src.coachLicenseNo || '';
    out.assistantCoachLicenseNo = src.assistantCoachLicenseNo || '';
    out.players = ensureArray(src.players).slice(0, 15).map(function (player, idx) {
      return mapLegacyPlayerToCommon(player, idx, teamKey);
    });
    while (out.players.length < 15) {
      out.players.push(S.createPlayer(teamKey + '-' + out.players.length));
    }
    out.teamState.memo = src.teamState && src.teamState.memo ? src.teamState.memo : '';
    out.teamState.teamFouls = Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(src.teamState && src.teamState.teamFouls));
    out.teamState.timeouts = commonTimeoutsFromClassic(src.teamState && src.teamState.timeouts);
    out.runningScore = ensureRunningScore(src.runningScore);
    return out;
  }

  function mapCommonTeamToClassic(team, teamKey) {
    const src = ensureObject(team);
    return {
      coach: src.coach || '',
      assistantCoach: src.assistantCoach || '',
      coachLicenseNo: src.coachLicenseNo || '',
      assistantCoachLicenseNo: src.assistantCoachLicenseNo || '',
      players: ensureArray(src.players).slice(0, 15).map(function (player, idx) {
        return mapCommonPlayerToClassic(player, idx, teamKey);
      }),
      teamState: {
        memo: src.teamState && src.teamState.memo ? src.teamState.memo : '',
        teamFouls: Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(src.teamState && src.teamState.teamFouls)),
        timeouts: classicTimeoutsFromCommon(src.teamState && src.teamState.timeouts)
      },
      runningScore: ensureRunningScore(src.runningScore)
    };
  }

  function normalizeCommon(raw) {
    const src = ensureObject(raw);
    const out = S.createCommonData(src.game && src.game.ruleSet ? src.game.ruleSet : 'standard');
    out.schemaVersion = S.CURRENT_SCHEMA_VERSION;

    out.game.id = src.game && src.game.id ? src.game.id : '';
    out.game.ruleSet = src.game && src.game.ruleSet ? src.game.ruleSet : 'standard';
    out.game.date = src.game && src.game.date ? src.game.date : '';
    out.game.venue = src.game && src.game.venue ? src.game.venue : '';
    out.game.status = src.game && src.game.status ? src.game.status : 'in_progress';

    out.meta = Object.assign(out.meta, ensureObject(src.meta));
    out.score.home = Object.assign(S.createScore(), ensureObject(src.score && src.score.home));
    out.score.away = Object.assign(S.createScore(), ensureObject(src.score && src.score.away));
    out.quarterTimes = Object.assign(S.createQuarterTimes(), ensureObject(src.quarterTimes));
    out.foulEvents = ensureArray(src.foulEvents).map(function (event) {
      const e = ensureObject(event);
      return {
        id: e.id || ('f-' + Date.now() + '-' + Math.random().toString(16).slice(2)),
        team: e.team || 'home',
        who: e.who || 'player',
        playerId: e.playerId || '',
        period: e.period || 'q1',
        clock: e.clock || '',
        type: e.type || '',
        ftCount: e.ftCount == null ? null : e.ftCount,
        note: e.note || '',
        createdAt: e.createdAt || Date.now()
      };
    });
    if (Object.prototype.hasOwnProperty.call(src, 'eventLog')) {
      out.eventLog = S.clone(src.eventLog);
    }
    if (src.annotations && typeof src.annotations === 'object') {
      out.annotations = S.clone(src.annotations);
    }
    if (src.liveState && typeof src.liveState === 'object') {
      out.liveState = S.clone(src.liveState);
    }
    out.uiState.activeTeam = src.uiState && src.uiState.activeTeam === 'away' ? 'away' : 'home';

    S.TEAM_KEYS.forEach(function (teamKey) {
      const team = ensureObject(src.teams && src.teams[teamKey]);
      const normalized = S.createTeam();
      normalized.name = team.name || '';
      normalized.coach = team.coach || '';
      normalized.assistantCoach = team.assistantCoach || '';
      normalized.coachLicenseNo = team.coachLicenseNo || '';
      normalized.assistantCoachLicenseNo = team.assistantCoachLicenseNo || '';
      normalized.players = ensureArray(team.players).slice(0, 15).map(function (player, idx) {
        return mapLegacyPlayerToCommon(player, idx, teamKey);
      });
      while (normalized.players.length < 15) {
        normalized.players.push(S.createPlayer(teamKey + '-' + normalized.players.length));
      }
      normalized.teamState.memo = team.teamState && team.teamState.memo ? team.teamState.memo : '';
      normalized.teamState.teamFouls = Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(team.teamState && team.teamState.teamFouls));
      normalized.teamState.timeouts = ensureObject(team.teamState && team.teamState.timeouts);
      S.ALL_PERIODS.forEach(function (period) {
        normalized.teamState.timeouts[period] = [S.createMiniTimeoutSlot(ensureArray(normalized.teamState.timeouts[period])[0])];
      });
      normalized.runningScore = ensureRunningScore(team.runningScore);
      out.teams[teamKey] = normalized;
    });

    return out;
  }

  function fromLegacy(raw) {
    const src = ensureObject(raw);
    const common = S.createCommonData('standard');
    common.game.date = src.date || '';
    common.game.venue = src.venue || '';
    common.meta.tournamentName = src.meta && src.meta.tournamentName ? src.meta.tournamentName : '';
    common.meta.gameNo = src.meta && src.meta.gameNo ? src.meta.gameNo : '';
    common.meta.startTime = src.meta && src.meta.time ? src.meta.time : '';
    common.meta.endTime = src.meta && src.meta.gameEndTime ? src.meta.gameEndTime : '';
    common.meta.crewChief = src.meta && src.meta.crewChief ? src.meta.crewChief : '';
    common.meta.umpire = src.meta && src.meta.umpire ? src.meta.umpire : '';
    common.meta.scorer = src.meta && src.meta.scorer ? src.meta.scorer : '';
    common.meta.assistantScorer = src.meta && src.meta.assistantScorer ? src.meta.assistantScorer : '';
    common.meta.timer = src.meta && src.meta.timer ? src.meta.timer : '';
    common.meta.shotClock = src.meta && src.meta.shotClock ? src.meta.shotClock : '';
    common.meta.homeUniformColor = src.meta && src.meta.homeUniformColor ? src.meta.homeUniformColor : '';
    common.meta.awayUniformColor = src.meta && src.meta.awayUniformColor ? src.meta.awayUniformColor : '';
    common.meta.winnerTeam = src.meta && src.meta.winnerTeam ? src.meta.winnerTeam : '';
    common.score.home = Object.assign(S.createScore(), ensureObject(src.myScore));
    common.score.away = Object.assign(S.createScore(), ensureObject(src.opScore));
    common.quarterTimes = Object.assign(S.createQuarterTimes(), ensureObject(src.quarterTimes));
    common.foulEvents = ensureArray(src.foulEvents).map(function (event) {
      return {
        id: event.id || ('f-' + Date.now() + '-' + Math.random().toString(16).slice(2)),
        team: event.team || 'home',
        who: event.who || 'player',
        playerId: event.playerId || '',
        period: event.period || 'q1',
        clock: event.clock || '',
        type: event.type || '',
        ftCount: event.ftCount == null ? null : event.ftCount,
        note: event.note || '',
        createdAt: event.createdAt || Date.now()
      };
    });
    common.uiState.activeTeam = src.activeTeam === 'away' ? 'away' : 'home';
    common.teams.home = mapLegacyTeamToCommon(src.teams && src.teams.home, src.myTeamName || '', 'home');
    common.teams.away = mapLegacyTeamToCommon(src.teams && src.teams.away, src.opponentTeamName || '', 'away');
    if (Object.prototype.hasOwnProperty.call(src, 'eventLog')) {
      common.eventLog = S.clone(src.eventLog);
    }
    if (src.annotations && typeof src.annotations === 'object') {
      common.annotations = S.clone(src.annotations);
    }
    if (src.liveState && typeof src.liveState === 'object') {
      common.liveState = S.clone(src.liveState);
    }
    return common;
  }

  function toViewModel(common) {
    const src = normalizeCommon(common);
    return {
      meta: {
        schemaVersion: S.CURRENT_SCHEMA_VERSION,
        tournamentName: src.meta.tournamentName || '',
        gameNo: src.meta.gameNo || '',
        time: src.meta.startTime || '',
        crewChief: src.meta.crewChief || '',
        umpire: src.meta.umpire || '',
        scorer: src.meta.scorer || '',
        assistantScorer: src.meta.assistantScorer || '',
        timer: src.meta.timer || '',
        shotClock: src.meta.shotClock || '',
        homeUniformColor: src.meta.homeUniformColor || '',
        awayUniformColor: src.meta.awayUniformColor || '',
        winnerTeam: src.meta.winnerTeam || '',
        gameEndTime: src.meta.endTime || ''
      },
      myTeamName: src.teams.home.name || '',
      opponentTeamName: src.teams.away.name || '',
      venue: src.game.venue || '',
      date: src.game.date || '',
      myScore: S.clone(src.score.home),
      opScore: S.clone(src.score.away),
      teams: {
        home: mapCommonTeamToClassic(src.teams.home, 'home'),
        away: mapCommonTeamToClassic(src.teams.away, 'away')
      },
      activeTeam: src.uiState.activeTeam === 'away' ? 'away' : 'home',
      quarterTimes: S.clone(src.quarterTimes),
      foulEvents: S.clone(src.foulEvents)
    };
  }

  function fromViewModel(viewModel) {
    var common = fromLegacy(viewModel);
    common.eventLog = createSafetyEventLogFromCommon(common);
    return common;
  }

  function fromStorage(raw) {
    if (S.isCommonSchema200(raw)) {
      return normalizeCommon(raw);
    }
    return fromLegacy(raw);
  }

  global.BASKSCLASSIC = {
    fromStorage: fromStorage,
    fromLegacy: fromLegacy,
    toViewModel: toViewModel,
    fromViewModel: fromViewModel
  };
})(window);
