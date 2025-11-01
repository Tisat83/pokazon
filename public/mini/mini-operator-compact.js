// public/mini/mini-operator-compact.js
(function () {
  // Какие подписи оставить на кнопках
  var KEEP_BTNS = ['Войти', 'Лог'];

  function text(el) { return (el && (el.textContent || el.value || '')).trim(); }

  function hide(el) { if (!el) return; el.style.display = 'none'; }

  function closestBlock(el) {
    // Пытаемся скрывать не только сам input/checkbox, но и ближайший контейнер
    return (el.closest('label') || el.closest('.row') || el.closest('div') || el);
  }

  function shrink(root) {
    if (!root) return;

    // 1) Прячем ВСЕ кнопки, кроме "Войти" и "Лог"
    root.querySelectorAll('button').forEach(function (btn) {
      var t = text(btn);
      if (KEEP_BTNS.indexOf(t) === -1) hide(btn);
    });

    // 2) Прячем все checkbox'ы и их обёртки
    root.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      hide(closestBlock(cb));
    });

    // 3) Прячем все поля ввода, кроме "Код (6 цифр)"
    root.querySelectorAll('input,select,textarea').forEach(function (inp) {
      if (inp.type === 'checkbox') return; // уже спрятаны
      var ph = (inp.getAttribute('placeholder') || '').toLowerCase();
      if (/код/.test(ph)) return; // оставить поле кода
      hide(closestBlock(inp));
    });

    // 4) Убираем всё, где подпись про экраны/подгон/навигацию
    Array.prototype.slice.call(root.querySelectorAll('*')).forEach(function (el) {
      var t = text(el);
      if (!t) return;
      if (
        t.indexOf('Экран клиента') === 0 ||
        t.indexOf('Твой экран') === 0 ||
        t.indexOf('Подогнать') === 0 ||
        t.indexOf('Автоподгон') === 0 ||
        t.indexOf('Окно W×H') === 0 ||
        t.indexOf('PgUp') === 0 ||
        t.indexOf('PgDn') === 0 ||
        t === 'Top' || t === 'Bottom' ||
        t.indexOf('Якорь') === 0 || t.indexOf('Перейти') === 0
      ) {
        hide(el.closest('div') || el);
      }
    });
  }

  function findPanelRoot() {
    // модалка/панель оператора — ищем по типовым признакам
    var byTitle = Array.prototype.slice.call(document.querySelectorAll('div,section,article'))
      .find(function (el) { return /Панель оператора/.test(text(el)); });
    if (byTitle) return byTitle.closest('div') || byTitle;

    return document.querySelector('.oko-operator, .oko-modal, .oko-panel') || document.body;
  }

  function run() { shrink(findPanelRoot()); }

  // Несколько прогонов + наблюдатель, чтобы перекрыть позднюю отрисовку
  run(); setTimeout(run, 100); setTimeout(run, 300); setTimeout(run, 800); setTimeout(run, 1500);
  var mo = new MutationObserver(run);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function(){ try { mo.disconnect(); } catch(e){} }, 3000);
})();
