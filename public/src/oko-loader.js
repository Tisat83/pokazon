/*! pokazon loader (dev) — iframe-embed friendly & role-aware */
(function () {
  // Разрешить работу внутри iframe только если явный флаг
  var EMBED_OK = (window.POKAZON_EMBED === true);
  if (window.top !== window && !EMBED_OK) return;

  var hash = (location.hash || '').toLowerCase();
  var NEED_HELP = hash.indexOf('#help') === 0;
  var NEED_OPERATOR = hash.indexOf('#operator') === 0;

  // Роль: '', 'client' или 'operator'
  var ONLY = (window.POKAZON_ONLY || '').toLowerCase();
  var ALLOW_CLIENT = (ONLY === '' || ONLY === 'client');
  var ALLOW_OPERATOR = (ONLY === '' || ONLY === 'operator');

  function inject(src) { var s = document.createElement('script'); s.defer = true; s.src = src; document.head.appendChild(s); }
  function css(href)   { var l = document.createElement('link');   l.rel  = 'stylesheet'; l.href = href; document.head.appendChild(l); }

  css('/oko-widget.css');
  inject('/sdk.js');

  // Загружаем только нужные файлы
  if (ALLOW_OPERATOR) inject('/oko-operator.js');
  if (ALLOW_CLIENT)   inject('/oko-widget.js');

  window.addEventListener('DOMContentLoaded', function () {
    // Ровно одно событие, в зависимости от хеша
    if (NEED_HELP && ALLOW_CLIENT) {
      document.dispatchEvent(new CustomEvent('pokazon:want-help'));
    } else if (NEED_OPERATOR && ALLOW_OPERATOR) {
      document.dispatchEvent(new CustomEvent('pokazon:want-operator'));
    }
  });
})();
