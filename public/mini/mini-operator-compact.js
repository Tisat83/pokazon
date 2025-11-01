<script>
/**
 * Мини-оператор: оставить только поле ввода кода, кнопку «Войти» и «Лог».
 * Остальное скрываем/удаляем только на этой странице.
 */
(function () {
  function shrinkOnce(root) {
    if (!root) return;

    // 1) Секции/группы, которые можно скрыть целиком
    const selectorsToHide = [
      // чекбоксы и секция с ними
      'label:has(input[type="checkbox"])',
      // кнопки навигации и прокрутки
      'button:has(svg)', // стрелки ▲ ▼
      'button:contains("PgUp")',
      'button:contains("PgDn")',
      'button:contains("Top")',
      'button:contains("Bottom")',
      // «Подогнать», «Автоподгон», «Сброс», «Окно W×H»
      'button:contains("Подогнать")',
      'button:contains("Автоподгон")',
      'button:contains("Сброс")',
      'button:contains("Окно W×H")',
      // поле «Якорь» + «Перейти»
      'input[placeholder], select, textarea',
      'button:contains("Перейти")',
      // любые подсказки/строки статуса, кроме «Лог»
      '.oko-status, .oko-hint'
    ];

    // В Safari нет :contains в CSS, поэтому чистим ещё и через JS по тексту.
    function matchByText(el, words) {
      const t = (el.textContent || '').trim();
      return words.some(w => t === w || t.indexOf(w) !== -1);
    }

    // Кнопки, которые нужно оставить
    const shouldKeepButton = (btn) => {
      const keep = ['Войти', 'Лог'];
      return matchByText(btn, keep);
    };

    // Сначала удаляем/прячем известные блоки
    selectorsToHide.forEach(sel => {
      // поддержка :contains для хрома/фаерфокс через JS
      if (sel.includes(':contains')) return;
      root.querySelectorAll(sel).forEach(el => el.style.display = 'none');
    });

    // По тексту: убираем всё, кроме «Войти» и «Лог»
    root.querySelectorAll('button').forEach(btn => {
      if (!shouldKeepButton(btn)) btn.style.display = 'none';
    });

    // Секция «Экран клиента», «Твой экран» — тоже скрыть, если они есть
    Array.from(root.querySelectorAll('*')).forEach(el => {
      const t = (el.textContent || '').trim();
      if (['Экран клиента:', 'Твой экран:'].some(x => t.startsWith(x))) {
        el.style.display = 'none';
      }
    });
  }

  // Ищем корень панели
  function findPanel() {
    // пробуем по заголовку/классу
    const byTitle = Array.from(document.querySelectorAll('div,section,article'))
      .find(el => (el.textContent || '').includes('Панель оператора'));
    if (byTitle) return byTitle.closest('div') || byTitle;

    // fallback — первая модалка (если менялась разметка)
    return document.querySelector('.oko-operator, .oko-modal, .oko-panel');
  }

  function shrinkLoop() {
    const root = findPanel();
    if (root) shrinkOnce(root);
  }

  // старт и несколько повторов + наблюдатель
  const run = () => { shrinkLoop(); };
  run();
  setTimeout(run, 100);
  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);

  const mo = new MutationObserver(run);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  // через 3 секунды отключим наблюдатель (достаточно)
  setTimeout(() => { try { mo.disconnect(); } catch(e){} }, 3000);
})();
</script>
