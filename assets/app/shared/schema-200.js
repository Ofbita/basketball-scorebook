/**
 * schema-200.js — バスケスコア共通永続化スキーマ（schemaVersion 200）
 *
 * 【役割（★260503IO仕様.md）】
 * - `localStorage` / エクスポート JSON の**正本の形**（game / meta / teams / score / eventLog …）を定義する。
 * - `createCommonData` / `createPlayer` 等で空データを組み立て、アダプタ（mini / classic）の土台になる。
 * - **表示座標（mm）や blockOffsets は含まない** — それらは `print/layouts/*.json` と index_mini の画面状態。
 *
 * 公開: `global.BASKSCHEMA200`
 */
(function (global) {
  'use strict';
 
  const CURRENT_SCHEMA_VERSION = 200;
  const TEAM_KEYS = ['home', 'away'];
  const REGULATION_PERIODS = ['q1', 'q2', 'q3', 'q4'];
  const ALL_PERIODS = ['q1', 'q2', 'q3', 'q4', 'ot1', 'ot2'];
 
  /** 安全なディープコピー（JSON 経由）。 */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
 
  /** 各四半期・OT のチーム得点スロット（文字列運用）。 */
  function createScore() {
    return { q1: '', q2: '', q3: '', q4: '', ot1: '', ot2: '' };
  }
 
  /** quarterTimes: 各 period の開始・終了時刻文字列。 */
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
 
  /** 選手の Q 出場フラグ（'' | start | subIn | both）。 */
  function createParticipation() {
    return { q1: '', q2: '', q3: '', q4: '' };
  }
 
  /** classic 互換の四半期別スタッツ集計用スロット。 */
  function createQuarterStats() {
    return {
      q1: { pt2: '', pt3: '', ft: '', fta: '' },
      q2: { pt2: '', pt3: '', ft: '', fta: '' },
      q3: { pt2: '', pt3: '', ft: '', fta: '' },
      q4: { pt2: '', pt3: '', ft: '', fta: '' },
      ot: { pt2: '', pt3: '', ft: '', fta: '' }
    };
  }
 
  /** 個人ファウル 1 スロット（表示文字・図形フラグ含む）。 */
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
 
  /** 1 選手分の初期レコード（id は呼び出し側で上書き可）。 */
  function createPlayer(id) {
    return {
      id: id || '',
      number: '',
      name: '',
      licenseNo: '',
      rosterCancelled: false,
      participation: createParticipation(),
      fouls: Array.from({ length: 5 }, function () {
        return createFoulSlot();
      }),
      quarterStats: createQuarterStats()
    };
  }

  /** ミニバス用: 各 period 1 スロットの TO（active / rawClock / mark）。 */
  function createMiniTimeoutSlot(base) {
    const src = base || {};
    return {
      active: !!src.active,
      rawClock: src.rawClock || src.time || '',
      mark: src.mark || ''
    };
  }

  /** 全 period の TO スロット配列の初期形（各 Q 長さ1配列）。 */
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

  /** home/away 共通のチームブロック初期形（選手15名・runningScore は空オブジェクト起点）。 */
  function createTeam() {
    return {
      name: '',
      coach: '',
      assistantCoach: '',
      coachLicenseNo: '',
      assistantCoachLicenseNo: '',
      coachCancelled: false,
      assistantCoachCancelled: false,
      players: Array.from({ length: 18 }, function (_, idx) {
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
 
  /**
   * ルート直下の完全な schema-200 オブジェクトを生成。
   * @param {string} ruleSet `'standard'` | `'mini'`（game.ruleSet に格納）
   */
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
        templateId: '',
        quarterLength: 6,
        overtimeLength: 3
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
        awayOnCourtIds: [],
        homeCourtPositions: {},
        awayCourtPositions: {}
      },
      uiState: {
        activeTeam: 'home'
      }
    };
  }
 
  /** raw がスキーマ200として扱えるか（schemaVersion のみで判定）。 */
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
