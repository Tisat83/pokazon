/*! pokazon loader (dev) — iframe-embed friendly */
(function () {
  var EMBED_OK = (window.POKAZON_EMBED === true);
  if (window.top !== window && !EMBED_OK) { return; }

  var hash = (location.hash || '').toLowerCase();
  var ONLY = (window.POKAZON_ONLY || '').toLowerCase(); // 'client' | 'operator' | ''

  // Что хотим запустить
  var WANT_HELP     = (ONLY === 'client')   || (hash.indexOf('#help') === 0);
  var WANT_OPERATOR = (ONLY === 'operator') || (hash.indexOf('#operator') === 0);

  function inject(src) { var s = document.createElement('script'); s.defer = true; s.src = src; document.head.appendChild(s); }
  function css(href)  { var l = document.createElement('link');   l.rel  = 'stylesheet'; l.href = href; document.head.appendChild(l); }

  css('/oko-widget.css');

  // Подключаем только нужные части
  inject('/sdk.js');

  if (ONLY === 'client') {
    inject('/oko-widget.js');
  } else if (ONLY === 'operator') {
    inject('/oko-operator.js');
  } else {
    // старое поведение — всё сразу
    inject('/oko-operator.js');
    inject('/oko-widget.js');
  }

  // Отправляем одно событие — в соответствии с режимом/хэшем
  window.addEventListener('DOMContentLoaded', function () {
    if (WANT_HELP && !WANT_OPERATOR) {
      document.dispatchEvent(new CustomEvent('pokazon:want-help'));
    } else if (WANT_OPERATOR && !WANT_HELP) {
      document.dispatchEvent(new CustomEvent('pokazon:want-operator'));
    } else {
      // если ничего не задано — не открываем автоматом
    }
  });
})();
