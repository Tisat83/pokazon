/*! pokazon CDN loader v2 */
(function () {
  // --- базовый адрес для ассетов ---
  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  var src = script && script.src || '';
  var a = document.createElement('a');
  a.href = src;

  // можно переопределить базу заранее: window.POKAZON_ASSET_BASE = 'https://staging.pokazon.ru'
  var BASE = (window.POKAZON_ASSET_BASE || a.origin || 'https://pokazon.ru').replace(/\/+$/, '');

  // версия для кэш-бастинга — из data-v
  var V = (script && script.getAttribute('data-v')) || '';

  function withV(url) {
    if (!V) return url;
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(V);
  }
  function abs(p) {
    if (/^https?:\/\//i.test(p)) return withV(p);
    return withV(BASE + '/' + String(p).replace(/^\/+/, ''));
  }
  function inject(js) {
    var s = document.createElement('script');
    s.defer = true;
    s.src = abs(js);
    document.head.appendChild(s);
  }
  function css(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = abs(href);
    document.head.appendChild(l);
  }

  // --- режимы ---
  var hash = (location.hash || '').toLowerCase();
  var only = (window.POKAZON_ONLY || '').toLowerCase();

  // Допускаем встраивание во фрейм (если не запретили явно)
  var EMBED_OK = (window.POKAZON_EMBED === true);
  if (window.top !== window && !EMBED_OK) EMBED_OK = true;

  var needHelp     = (hash.indexOf('#help') === 0)     || (only === 'client');
  var needOperator = (hash.indexOf('#operator') === 0) || (only === 'operator');

  // --- ассеты ---
  css('/oko-widget.css');
  inject('/sdk.js');
  if (needHelp)     inject('/oko-widget.js');
  if (needOperator) inject('/oko-operator.js');

  // --- сигнал на автоподнятие ---
  window.addEventListener('DOMContentLoaded', function () {
    if (needHelp)     document.dispatchEvent(new CustomEvent('pokazon:want-help'));
    if (needOperator) document.dispatchEvent(new CustomEvent('pokazon:want-operator'));
  });
})();
