(function (global) {
  'use strict';

  const S = global.BASKSCHEMA200;

  function ensureObject(value) {
    return value && typeof value === 'object' ? value : {};
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeParticipation(value) {
    if (value === true) return 'both';
    if (value === false || value == null) return '';
    if (['', 'start', 'subIn', 'both'].includes(value)) return value;
    if (value === 'X') return 'both';
    return '';
  }

  function mapMiniPlayerToCommon(player, idx, teamKey) {
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
      out.fouls = src.fouls.slice(0, 5).map(function (slot) {
        if (typeof slot === 'boolean') return S.createFoulSlot({ active: slot, time: '' });
        return S.createFoulSlot(slot);
      });
      while (out.fouls.length < 5) out.fouls.push(S.createFoulSlot());
    }

    return out;
  }

  function mapCommonPlayerToMini(player, idx, teamKey) {
    const src = ensureObject(player);
    const out = S.createPlayer(src.id || (teamKey + '-' + idx));
    out.number = src.number || '';
    out.name = src.name || '';
    out.licenseNo = src.licenseNo || '';
    out.participation.q1 = normalizeParticipation(src.participation && src.participation.q1);
    out.participation.q2 = normalizeParticipation(src.participation && src.participation.q2);
    out.participation.q3 = normalizeParticipation(src.participation && src.participation.q3);
    out.participation.q4 = normalizeParticipation(src.participation && src.participation.q4);
    out.fouls = ensureArray(src.fouls).slice(0, 5).map(function (slot) {
      return S.createFoulSlot(slot);
    });
    while (out.fouls.length < 5) out.fouls.push(S.createFoulSlot());
    return out;
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

  function normalizeCommon(raw) {
    const src = ensureObject(raw);
    const out = S.createCommonData(src.game && src.game.ruleSet ? src.game.ruleSet : 'mini');
    out.schemaVersion = S.CURRENT_SCHEMA_VERSION;
    out.game = Object.assign(out.game, ensureObject(src.game));
    out.game.ruleSet = 'mini';
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
        return mapMiniPlayerToCommon(player, idx, teamKey);
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
    const out = S.createCommonData('mini');
    out.game.date = src.date || '';
    out.game.venue = src.venue || '';
    out.meta.tournamentName = src.meta && src.meta.tournamentName ? src.meta.tournamentName : '';
    out.meta.gameNo = src.meta && src.meta.gameNo ? src.meta.gameNo : '';
    out.meta.startTime = src.meta && src.meta.time ? src.meta.time : '';
    out.meta.endTime = src.meta && src.meta.gameEndTime ? src.meta.gameEndTime : '';
    out.meta.crewChief = src.meta && src.meta.crewChief ? src.meta.crewChief : '';
    out.meta.umpire = src.meta && src.meta.umpire ? src.meta.umpire : '';
    out.meta.scorer = src.meta && src.meta.scorer ? src.meta.scorer : '';
    out.meta.assistantScorer = src.meta && src.meta.assistantScorer ? src.meta.assistantScorer : '';
    out.meta.timer = src.meta && src.meta.timer ? src.meta.timer : '';
    out.meta.shotClock = src.meta && src.meta.shotClock ? src.meta.shotClock : '';
    out.meta.homeUniformColor = src.meta && src.meta.homeUniformColor ? src.meta.homeUniformColor : '';
    out.meta.awayUniformColor = src.meta && src.meta.awayUniformColor ? src.meta.awayUniformColor : '';
    out.meta.winnerTeam = src.meta && src.meta.winnerTeam ? src.meta.winnerTeam : '';
    out.meta.templateId = src.meta && src.meta.templateId ? src.meta.templateId : '';
    out.score.home = Object.assign(S.createScore(), ensureObject(src.myScore));
    out.score.away = Object.assign(S.createScore(), ensureObject(src.opScore));
    out.quarterTimes = Object.assign(S.createQuarterTimes(), ensureObject(src.quarterTimes));
    out.foulEvents = ensureArray(src.foulEvents).map(function (event) {
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
    out.teams.home.name = src.myTeamName || '';
    out.teams.away.name = src.opponentTeamName || '';

    S.TEAM_KEYS.forEach(function (teamKey) {
      const team = ensureObject(src.teams && src.teams[teamKey]);
      out.teams[teamKey].coach = team.coach || '';
      out.teams[teamKey].assistantCoach = team.assistantCoach || '';
      out.teams[teamKey].coachLicenseNo = team.coachLicenseNo || '';
      out.teams[teamKey].assistantCoachLicenseNo = team.assistantCoachLicenseNo || '';
      out.teams[teamKey].players = ensureArray(team.players).slice(0, 15).map(function (player, idx) {
        return mapMiniPlayerToCommon(player, idx, teamKey);
      });
      while (out.teams[teamKey].players.length < 15) {
        out.teams[teamKey].players.push(S.createPlayer(teamKey + '-' + out.teams[teamKey].players.length));
      }
      out.teams[teamKey].teamState.memo = team.teamState && team.teamState.memo ? team.teamState.memo : '';
      out.teams[teamKey].teamState.teamFouls = Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(team.teamState && team.teamState.teamFouls));
      out.teams[teamKey].teamState.timeouts = ensureObject(team.teamState && team.teamState.timeouts);
      S.ALL_PERIODS.forEach(function (period) {
        out.teams[teamKey].teamState.timeouts[period] = [S.createMiniTimeoutSlot(ensureArray(out.teams[teamKey].teamState.timeouts[period])[0])];
      });
      out.teams[teamKey].runningScore = ensureRunningScore(team.runningScore);
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

    return out;
  }

  function fromStorage(raw) {
    if (S.isCommonSchema200(raw)) return normalizeCommon(raw);
    return fromLegacy(raw);
  }

  function toViewModel(common, options) {
    const src = normalizeCommon(common);
    const templateId = options && options.templateId ? options.templateId : (src.meta.templateId || 'mini_v230415');
    return {
      meta: {
        schemaVersion: S.CURRENT_SCHEMA_VERSION,
        templateId: templateId,
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
      quarterTimes: S.clone(src.quarterTimes),
      teams: {
        home: {
          coach: src.teams.home.coach || '',
          assistantCoach: src.teams.home.assistantCoach || '',
          coachLicenseNo: src.teams.home.coachLicenseNo || '',
          assistantCoachLicenseNo: src.teams.home.assistantCoachLicenseNo || '',
          players: ensureArray(src.teams.home.players).slice(0, 15).map(function (player, idx) {
            return mapCommonPlayerToMini(player, idx, 'home');
          }),
          teamState: {
            memo: src.teams.home.teamState.memo || '',
            teamFouls: Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(src.teams.home.teamState.teamFouls)),
            timeouts: S.clone(src.teams.home.teamState.timeouts)
          },
          runningScore: ensureRunningScore(src.teams.home.runningScore)
        },
        away: {
          coach: src.teams.away.coach || '',
          assistantCoach: src.teams.away.assistantCoach || '',
          coachLicenseNo: src.teams.away.coachLicenseNo || '',
          assistantCoachLicenseNo: src.teams.away.assistantCoachLicenseNo || '',
          players: ensureArray(src.teams.away.players).slice(0, 15).map(function (player, idx) {
            return mapCommonPlayerToMini(player, idx, 'away');
          }),
          teamState: {
            memo: src.teams.away.teamState.memo || '',
            teamFouls: Object.assign({ q1: 0, q2: 0, q3: 0, q4: 0 }, ensureObject(src.teams.away.teamState.teamFouls)),
            timeouts: S.clone(src.teams.away.teamState.timeouts)
          },
          runningScore: ensureRunningScore(src.teams.away.runningScore)
        }
      },
      foulEvents: S.clone(src.foulEvents),
      eventLog: S.clone(src.eventLog),
      annotations: S.clone(src.annotations),
      liveState: S.clone(src.liveState)
    };
  }

  function fromViewModel(viewModel) {
    return fromLegacy(viewModel);
  }

  global.BASKSCMINI = {
    fromStorage: fromStorage,
    fromLegacy: fromLegacy,
    toViewModel: toViewModel,
    fromViewModel: fromViewModel
  };
})(window);
