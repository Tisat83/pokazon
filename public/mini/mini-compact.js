/* mini-compact.js — компакт для мини-демо на главной pokazon.ru */
(function () {
  function log() {
    try { console.debug('[mini-compact]', ...arguments); } catch (e) {}
  }

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

  function apply() {
    if (isHelp()) {
      // Клиент: спрятать кнопку «ОКО Оператор» и саму панель, если вдруг появилась
      hideByText(document, ['ОКО Оператор', 'ОКО · Панель оператора']);
    }
    if (isOperator()) {
      // Оператор: оставить только поле кода, «Войти» и «Лог»
      hideByText(document, [
        'Только указка', 'Синхронная прокрутка',
        'Подогнать', 'Автоподгон', 'Сброс',
        'Окно W×H', 'Окно WxH', 'Якорь',
        'PgUp', 'PgDn', 'Top', 'Bottom', '▲', '▼'
      ]);
      try { document.body.style.setProperty('--oko-panel-scale', '0.95'); } catch(e){}
    }
  }

  function observeThenApply() {
    // На демо панель может появиться чуть позже — наблюдаем за DOM 2 сек
    var mo = new MutationObserver(function () { apply(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { try { mo.disconnect(); } catch(e){} }, 2000);
    apply();
  }

  log('loaded', location.pathname + location.hash);
  whenReady(observeThenApply);
})();
