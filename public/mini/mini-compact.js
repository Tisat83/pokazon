/* mini-compact.js — компакт для мини-демо на главной pokazon.ru */
(function () {
  function whenReady(cb) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(cb, 0);
    } else {
      window.addEventListener('DOMContentLoaded', cb, { once: true });
      window.addEventListener('load', cb, { once: true });
    }
  }

  function hideByText(root, texts) {
    var nodes = root.querySelectorAll('button, a, label, div, span, p, section, fieldset');
    nodes.forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      if (texts.some(function (s) { return t.indexOf(s) !== -1; })) {
        el.style.display = 'none';
      }
    });
  }

  function isOperator() { return location.hash.indexOf('operator') !== -1; }
  function isHelp()     { return location.hash.indexOf('help') !== -1; }

  whenReady(function () {
    if (isHelp()) {
      // Клиентское мини-окно: убрать кнопку «ОКО Оператор» и саму панель (если кто-то откроет хоткеем)
      hideByText(document, ['ОКО Оператор', 'ОКО · Панель оператора']);
    }

    if (isOperator()) {
      // Операторское мини-окно: оставить только поле кода, «Войти» и «Лог»
      hideByText(document, [
        'Только указка', 'Синхронная прокрутка',
        'Подогнать', 'Автоподгон', 'Сброс',
        'Окно W×H', 'Окно WxH', 'Якорь',
        'PgUp', 'PgDn', 'Top', 'Bottom', '▲', '▼'
      ]);
      try { document.body.style.setProperty('--oko-panel-scale', '0.95'); } catch(e){}
    }
  });
})();
