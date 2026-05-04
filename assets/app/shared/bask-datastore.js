/**
 * bask-datastore.js — DataStore（共通コア・ライブラリ）
 *
 * localStorage / JSON の読み書きを1箇所に集約し、
 * 他プラグイン由来フィールド（eventLog, annotations, liveState）のマージを内部化する。
 *
 * 依存: schema-200.js, classic-adapter.js, mini-adapter.js
 * 読み込み順: schema-200.js → classic-adapter.js → mini-adapter.js → bask-datastore.js
 */
(function (global) {
  'use strict';

  var S       = global.BASKSCHEMA200;
  var CLASSIC = global.BASKSCLASSIC;
  var MINI    = global.BASKSCMINI;

  var DEFAULT_STORAGE_KEY = 'basketball-scoresheet-v1';

  function deepClone(v) {
    try { return JSON.parse(JSON.stringify(v)); }
    catch (e) { return v; }
  }

  function ensureObject(v) {
    return v && typeof v === 'object' ? v : {};
  }

  /** classic が組み立てる共通スキーマのトップレベルキー（それ以外は「未知キー」として保持対象） */
  function commonRootKeys() {
    return new Set([
      'schemaVersion', 'game', 'meta', 'teams', 'score', 'quarterTimes',
      'foulEvents', 'uiState', 'eventLog', 'annotations', 'liveState'
    ]);
  }

  // ── マージ ──

  /**
   * classic UI が編集しないフィールド（他プラグイン用）を preserveSource から復元する。
   * preferKeys は preserveSource 側を優先。未知キーは存在しなければコピー。
   */
  function mergePreservedCommonFields(target, preserveSource) {
    if (!preserveSource || typeof preserveSource !== 'object') return target;

    var preferKeys = ['eventLog', 'annotations', 'liveState'];
    preferKeys.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(preserveSource, k)) {
        target[k] = deepClone(preserveSource[k]);
      }
    });

    var known = commonRootKeys();
    Object.keys(preserveSource).forEach(function (k) {
      if (!known.has(k) && !Object.prototype.hasOwnProperty.call(target, k)) {
        target[k] = deepClone(preserveSource[k]);
      }
    });

    return target;
  }

  // ── コンストラクタ ──

  /**
   * @param {object} [opts]
   * @param {string} [opts.adapterType]  'classic' | 'mini'  (default: 'classic')
   * @param {string} [opts.storageKey]   localStorage キー    (default: DEFAULT_STORAGE_KEY)
   */
  function DataStore(opts) {
    var o = ensureObject(opts);
    this._adapterType = o.adapterType || 'classic';
    this._storageKey  = o.storageKey  || DEFAULT_STORAGE_KEY;
    this._adapter     = this._adapterType === 'mini' ? MINI : CLASSIC;
  }

  // ========================================================
  //  ストレージ操作
  // ========================================================

  /**
   * localStorage からデータをロードし ViewModel を返す。
   * データが無ければ空の ViewModel を返す。
   */
  DataStore.prototype.load = function (options) {
    var raw = null;
    try {
      var json = global.localStorage.getItem(this._storageKey);
      if (json) raw = JSON.parse(json);
    } catch (e) {
      console.error('[DataStore] load failed:', e);
    }

    var common;
    if (raw) {
      common = this._adapter.fromStorage(raw);
    } else {
      common = S.createCommonData(this._adapterType === 'mini' ? 'mini' : 'standard');
    }

    return this._adapter.toViewModel(common, options);
  };

  /**
   * ViewModel → schema-200 に変換し localStorage に保存する。
   * 他プラグイン由来フィールドを自動マージ。
   */
  DataStore.prototype.save = function (viewModel) {
    var payload = this._adapter.fromViewModel(viewModel);
    payload = this._mergePreservedFromStorage(payload);
    try {
      global.localStorage.setItem(this._storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('[DataStore] save failed:', e);
    }
  };

  /** localStorage をクリアする。 */
  DataStore.prototype.clear = function () {
    global.localStorage.removeItem(this._storageKey);
  };

  /**
   * 保存用 schema-200 JSON を組み立てて返す（export / download 用）。
   */
  DataStore.prototype.buildPayload = function (viewModel) {
    var payload = this._adapter.fromViewModel(viewModel);
    return this._mergePreservedFromStorage(payload);
  };

  /**
   * 変換済み schema-200 ペイロードをそのまま保存する。
   * 呼び出し側が buildStoragePayload 等で独自にペイロードを組み立てた場合に使用。
   * 他プラグイン由来フィールドの自動マージは行う。
   */
  DataStore.prototype.savePayload = function (payload) {
    var merged = this._mergePreservedFromStorage(payload);
    try {
      global.localStorage.setItem(this._storageKey, JSON.stringify(merged));
    } catch (e) {
      console.error('[DataStore] savePayload failed:', e);
    }
  };

  /**
   * 外部 JSON をインポートし、新しい ViewModel を返す。
   * インポート元の eventLog / annotations / liveState を優先保持して保存する。
   */
  DataStore.prototype.importJSON = function (rawJson, options) {
    var common = this._adapter.fromStorage(rawJson);
    var newViewModel = this._adapter.toViewModel(common, options);

    var payload = this._adapter.fromViewModel(newViewModel);
    mergePreservedCommonFields(payload, rawJson);
    try {
      global.localStorage.setItem(this._storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('[DataStore] importJSON save failed:', e);
    }

    return newViewModel;
  };

  // ── 内部ヘルパー ──

  DataStore.prototype._mergePreservedFromStorage = function (payload) {
    var old = null;
    try {
      var raw = global.localStorage.getItem(this._storageKey);
      if (raw) old = JSON.parse(raw);
    } catch (e) {}
    return mergePreservedCommonFields(payload, old);
  };

  // ── 公開 ──

  global.BaskDataStore = DataStore;

})(window);
