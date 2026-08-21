/**
 * mini-adapter.js — ミニバス画面（index_mini）用アダプタ
 *
 * 【IO 上の位置（★260503IO仕様.md）】
 * - **保存・読込の橋渡し**: 永続化される正本はスキーマ 200 形だが、画面はフラットな ViewModel（`myTeamName` 等）で編集する。
 * - **fromStorage**: LS / ファイルの raw → 内部共通オブジェクト（`normalizeCommon` またはレガシ `fromLegacy`）。
 * - **toViewModel**: 共通オブジェクト → Alpine が束ねる `data` 互換オブジェクト。
 * - **fromViewModel**: 画面 `data` → レガシ互換トップレベル構造（実装は `fromLegacy` と対になるマッピングの逆変換ではなく、ViewModel を fromLegacy に渡す）。
 *
 * 依存: `schema-200.js`（`BASKSCHEMA200`）
 * 公開: `global.BASKSCMINI`
 */
(function (global) {
  'use strict';
 
  const S = global.BASKSCHEMA200;
 
  function ensureObject(value) {
    return value && typeof value === 'object' ? value : {};
  }
 
  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }
 
  /** 出場 Q フラグをスキーマ200の列挙値へ正規化（boolean / 旧 'X' 等を吸収）。 */
  function normalizeParticipation(value) {
    if (value === true) return 'both';
    if (value === false || value == null) return '';
    if (['', 'start', 'subIn', 'both'].includes(value)) return value;
    if (value === 'X') return 'both';
    return '';
  }
 
  /**
   * ミニ ViewModel 側の1選手 → `teams.*.players[]` の共通スキーマ形へ。
   * `mapMiniPlayerToCommon` / `mapCommonPlayerToMini` は保存・表示の往復で対になる。
   */
  function mapMiniPlayerToCommon(player, idx, teamKey) {
    const src = ensureObject(player);
    const out = S.createPlayer(src.id || (teamKey + '-' + idx));
    out.number = src.number || '';
    out.name = src.name || '';
    out.licenseNo = src.licenseNo || '';
    out.rosterCancelled = !!src.rosterCancelled;
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
 
  /** 共通スキーマ上の選手 → ミニ画面が期待する同一構造（トップレベル key 名は toViewModel で別途フラット化）。 */
  function mapCommonPlayerToMini(player, idx, teamKey) {
    const src = ensureObject(player);
    const out = S.createPlayer(src.id || (teamKey + '-' + idx));
    out.number = src.number || '';
    out.name = src.name || '';
    out.licenseNo = src.licenseNo || '';
    out.rosterCancelled = !!src.rosterCancelled;
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
 
  /** ランニングスコア連番 1..160 を常に揃えたオブジェクトにする（欠損キーを埋める）。 */
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
 
  /** `liveState` の配列フィールドを文字列 ID の配列として正規化。 */
  function ensureLiveState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      homeOnCourtIds: ensureArray(src.homeOnCourtIds).map(String),
      awayOnCourtIds: ensureArray(src.awayOnCourtIds).map(String)
    };
  }
 
  /** eventLog 1要素の型・必須キーを揃える（create / revise / void チェーン用）。 */
  function mapEventLogEntry(event) {
    const e = ensureObject(event);
    let repl = e.replacesEventId;
    if (repl == null || repl === '') repl = null;
    else repl = String(repl);
    return {
      id: String(e.id || ('evt-' + Date.now() + '-' + Math.random().toString(16).slice(2))),
      action: e.action ? String(e.action) : 'create',
      replacesEventId: repl,
      kind: String(e.kind || 'note'),
      team: e.team === 'away' ? 'away' : 'home',
      clock: String(e.clock || ''),
      payload: ensureObject(e.payload),
      createdAt: Number(e.createdAt) || Date.now(),
      subjectType: e.subjectType != null ? String(e.subjectType) : '',
      subjectId: e.subjectId != null ? String(e.subjectId) : ''
    };
  }
 
  /**
   * `schemaVersion === 200` の raw を、欠損を埋めた完全な共通データへ正規化。
   * `fromStorage` のメイン経路のひとつ。
   */
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
    out.eventLog = ensureArray(src.eventLog).map(mapEventLogEntry);
    if (src.annotations && typeof src.annotations === 'object') {
      out.annotations = Object.assign({}, ensureObject(out.annotations), S.clone(src.annotations));
    }
    out.liveState = ensureLiveState(src.liveState);
    out.uiState.activeTeam = src.uiState && src.uiState.activeTeam === 'away' ? 'away' : 'home';
 
    S.TEAM_KEYS.forEach(function (teamKey) {
      const team = ensureObject(src.teams && src.teams[teamKey]);
      const normalized = S.createTeam();
      normalized.name = team.name || '';
      normalized.coach = team.coach || '';
      normalized.assistantCoach = team.assistantCoach || '';
      normalized.coachLicenseNo = team.coachLicenseNo || '';
      normalized.assistantCoachLicenseNo = team.assistantCoachLicenseNo || '';
      normalized.coachCancelled = !!team.coachCancelled;
      normalized.assistantCoachCancelled = !!team.assistantCoachCancelled;
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
 
  /**
   * ミニ ViewModel 側の「フラット」ViewModel または旧形式トップレベル → 共通スキーマ200オブジェクト。
   * `fromViewModel` からも呼ばれる（保存直前の再正規化と同型）。
   */
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
    out.meta.quarterLength = src.meta && src.meta.quarterLength != null ? Number(src.meta.quarterLength) : 6;
    out.meta.overtimeLength = src.meta && src.meta.overtimeLength != null ? Number(src.meta.overtimeLength) : 3;
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
    out.eventLog = ensureArray(src.eventLog).map(mapEventLogEntry);
    if (src.annotations && typeof src.annotations === 'object') {
      out.annotations = Object.assign({}, ensureObject(out.annotations), S.clone(src.annotations));
    }
    out.liveState = ensureLiveState(src.liveState);
    out.teams.home.name = src.myTeamName || '';
    out.teams.away.name = src.opponentTeamName || '';
 
    S.TEAM_KEYS.forEach(function (teamKey) {
      const team = ensureObject(src.teams && src.teams[teamKey]);
      out.teams[teamKey].coach = team.coach || '';
      out.teams[teamKey].assistantCoach = team.assistantCoach || '';
      out.teams[teamKey].coachLicenseNo = team.coachLicenseNo || '';
      out.teams[teamKey].assistantCoachLicenseNo = team.assistantCoachLicenseNo || '';
      out.teams[teamKey].coachCancelled = !!team.coachCancelled;
      out.teams[teamKey].assistantCoachCancelled = !!team.assistantCoachCancelled;
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
 
    return out;
  }
 
  /**
   * LS / インポート JSON の入口。スキーマ200なら `normalizeCommon`、それ以外はレガシ `fromLegacy`。
   */
  function fromStorage(raw) {
    if (S.isCommonSchema200(raw)) return normalizeCommon(raw);
    return fromLegacy(raw);
  }
 
  /**
   * 共通データをミニ画面用 ViewModel（`index_mini` の `this.data` 形）へ変換。
   * @param {object} options.templateId レイアウト ID（`meta.templateId` より優先）。
   */
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
        gameEndTime: src.meta.endTime || '',
        quarterLength: src.meta.quarterLength != null ? Number(src.meta.quarterLength) : 6,
        overtimeLength: src.meta.overtimeLength != null ? Number(src.meta.overtimeLength) : 3
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
          coachCancelled: !!src.teams.home.coachCancelled,
          assistantCoachCancelled: !!src.teams.home.assistantCoachCancelled,
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
          coachCancelled: !!src.teams.away.coachCancelled,
          assistantCoachCancelled: !!src.teams.away.assistantCoachCancelled,
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
      liveState: ensureLiveState(src.liveState)
    };
  }
 
  /** 画面 `data` → ストレージ用オブジェクトへ（内部は `fromLegacy`）。 */
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
