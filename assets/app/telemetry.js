/**
 * v1.0.5 telemetry helper (Matomo) - opt-in only.
 *
 * - No pageviews. Events only.
 * - Uses Image beacon to avoid CORS issues.
 * - Sets referrerPolicy=no-referrer to avoid leaking site URL via Referer.
 */
(function () {
  'use strict';

  function getQueryParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || '';
    } catch (e) {
      return '';
    }
  }

  var enabled = getQueryParam('telemetry') === '1';
  var pv = getQueryParam('pv');
  var wpv = getQueryParam('wpv');
  var phpv = getQueryParam('phpv');
  var loc = getQueryParam('loc');

  // Default Matomo endpoint (should allow cross-site image beacons).
  // Matches: https://test.doc778.com/ + matomo.php, siteId=4
  var endpoint = 'https://test.doc778.com/matomo.php';
  var siteId = '4';

  // IMPORTANT: do not send the user's site URL.
  var fixedUrl = 'https://basketball-scorebook.invalid/';

  function buildEventName(extra) {
    var base = 'pv=' + pv + '|wp=' + wpv + '|php=' + phpv + '|loc=' + loc;
    if (!extra) return base;
    return String(extra) + '|' + base;
  }

  function track(action, extraName) {
    if (!enabled) return;
    if (!endpoint || !siteId) return;
    if (!action) return;

    var params = new URLSearchParams();
    params.set('idsite', siteId);
    params.set('rec', '1');
    params.set('apiv', '1');
    params.set('rand', String(Math.floor(Math.random() * 1e9)));
    params.set('url', fixedUrl);
    params.set('e_c', 'basketball_scorebook');
    params.set('e_a', String(action));
    params.set('e_n', buildEventName(extraName));
    params.set('send_image', '1');
    params.set('cookie', '0');

    var img = new Image();
    try {
      img.referrerPolicy = 'no-referrer';
    } catch (e) {}
    img.src = endpoint + '?' + params.toString();
  }

  window.BASKSC_TELEMETRY = {
    enabled: enabled,
    track: track
  };
})();

