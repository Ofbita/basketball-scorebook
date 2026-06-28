/**
 * bask-datastore.js — DataStore（共通コア・ライブラリ）
 *
 * 【役割（★260503IO仕様.md の「保存・読み込み系」）】
 * - 永続化の単一窓口: `localStorage` キー（既定 `basketball-scoresheet-v1`）への読み書き。
 * - アダプタ（mini / classic）に ViewModel ⇔ 格納 JSON（スキーマ200またはレガシ形）の変換を委譲。
 * - `save` / `buildPayload` / `savePayload` 直前に、既存ストレージから **eventLog / annotations / liveState**
 *   等を不足分だけ補完し、adapter 変換の取りこぼしを防ぐ（`mergePreservedCommonFields`）。
 *
 * 【index_mini からの典型的な呼び出し】
 * - 起動: `_store.load({ templateId })` → `mini-adapter.toViewModel`
 * - 定期・明示保存: `buildStoragePayload` 後 `_store.savePayload(payload)`（index_mini 側で組み立て）
 * - 印刷前: `openOfficialSheet` が `savePayload` のあと `official-sheet.html` を開き、同じ LS キーを読む。
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
 
  /** JSON 安全なディープコピー。循環参照は未対応（本データはツリー想定）。 */
  function deepClone(v) {
    try { return JSON.parse(JSON.stringify(v)); }
    catch (e) { return v; }
  }
 
  function ensureObject(v) {
    return v && typeof v === 'object' ? v : {};
  }
 
  /**
   * 共通スキーマとして「既知」のトップレベルキー集合。
   * `mergePreservedCommonFields` で、ここに含まれないキーは preserveSource から不足分のみコピーする。
   */
  function commonRootKeys() {
    return new Set([
      'schemaVersion', 'game', 'meta', 'teams', 'score', 'quarterTimes',
      'foulEvents', 'uiState', 'eventLog', 'annotations', 'liveState'
    ]);
  }
 
  // ── マージ ──
 
  /**
   * 保存ペイロード `target` に、古いストレージまたはインポート元 `preserveSource` からフィールドを補完する。
   * - `eventLog`, `annotations`, `liveState`: target に無いときだけ preserve から補完（画面の正本を優先）。
   * - 上記以外で `commonRootKeys` に無いキー: target に無ければコピー（将来拡張の未知キー温存）。
   * index_mini の `savePayload(buildStoragePayload())` は adapter 変換で eventLog を欠き得るため、
   * 欠落時のフォールバックとして `_mergePreservedFromStorage` とセットで重要。
   */
  function mergePreservedCommonFields(target, preserveSource) {
    if (!preserveSource || typeof preserveSource !== 'object') return target;
 
    var preferKeys = ['eventLog', 'annotations', 'liveState'];
    preferKeys.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(target, k)) return;
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
   * @param {string} [opts.adapterType]  `'classic'` | `'mini'` — `mini` 時は `BASKSCMINI`（index_mini）。
   * @param {string} [opts.storageKey]   localStorage キー（既定: `basketball-scoresheet-v1`）。印刷用 official-sheet と共有。
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
   * localStorage → `fromStorage`（スキーマ200正規化 or レガシ取り込み）→ `toViewModel`。
   * @param {object} [options] アダプタへそのまま転送（例: mini の `{ templateId }`）。
   * @returns {object} 画面用 ViewModel
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
   * ViewModel 全体を `fromViewModel` で格納形にし、既存 LS とマージして保存。
   * index_mini の主経路は `savePayload(buildStoragePayload())` だが、汎用 API として残す。
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
   * ファイルダウンロード等用: ViewModel を変換したペイロードを返すのみ（localStorage は更新しない）。
   */
  DataStore.prototype.buildPayload = function (viewModel) {
    var payload = this._adapter.fromViewModel(viewModel);
    return this._mergePreservedFromStorage(payload);
  };
 
  /**
   * 既に adapter 済みの共通 JSON を保存（index_mini の `buildStoragePayload` → ここが定番）。
   * 直前の LS 内容と `mergePreservedCommonFields` し、eventLog 等の欠落を防ぐ。
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
   * 外部ファイル等の raw JSON を取り込み、adapter で共通形にしたうえで LS に保存し ViewModel を返す。
   * `mergePreservedCommonFields(payload, rawJson)` でインポート元の eventLog 等をペイロード上乗せ。
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
 
  /** 現在の localStorage 内容を preserve として `mergePreservedCommonFields` に渡す。 */
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
