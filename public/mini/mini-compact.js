<script>
/* Мини-правки только для demo-страниц (#help / #operator) */
(function () {
  function onReady(cb){ if(document.readyState!=='loading'){cb()} else {document.addEventListener('DOMContentLoaded',cb)} }
  function qs(s,root){ return (root||document).querySelector(s) }
  function qsa(s,root){ return (root||document).querySelectorAll(s) }

  /* === ОПЕРАТОР: компактная панель === */
  function compactOperator(){
    var panel = qs('.oko-operator, .oko-op, [data-oko-role="operator-panel"]');
    if(!panel) return;

    // стилевые твики только для мини-версии
    var css = `
      .oko--mini-compact{max-width:420px}
      .oko--mini-compact .oko-log-btn,
      .oko--mini-compact button, .oko--mini-compact a{ /* общий селектор дальше переопределим нужные */ }
      .oko--mini-compact .oko-header .title,
      .oko--mini-compact .oko-title { display:none !important; }
      .oko--mini-compact.minimized .oko-body{ display:none !important; }
      .oko--mini-compact.minimized { width:420px; }
    `;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    panel.classList.add('oko--mini-compact');

    // убрать кнопку «Лог»
    qsa('button, a', panel).forEach(function(b){
      var t=(b.textContent||'').trim();
      if(t === 'Лог'){ b.remove(); }
    });

    // заголовок спрячем (если остался какой-то текст)
    qsa('.oko-header .title, .oko-title, h3', panel).forEach(function(el){ el.remove(); });

    // добавить кнопку «свернуть» в шапку
    var header = qs('.oko-header, .oko-head, .oko-title-bar', panel);
    if(header && !qs('.oko-min-btn', header)){
      var minBtn = document.createElement('button');
      minBtn.className = 'oko-min-btn';
      minBtn.type='button';
      minBtn.title='Свернуть';
      minBtn.textContent = '–';
      minBtn.style.cssText = 'margin-left:auto; width:32px; height:28px; border-radius:8px; line-height:26px;';
      minBtn.addEventListener('click', function(){ panel.classList.toggle('minimized'); });
      header.appendChild(minBtn);
    }
  }

  /* === КЛИЕНТ: убрать заголовок в модалке и показать скролл-фон === */
  function compactClient(){
    // убрать «Помощь …» в окне кода
    qsa('.oko-modal h2, .oko-help h2').forEach(function(h){ h.remove(); });

    // добавить «длинный» фон с прокруткой (две копии картинки подряд)
    if(!qs('.demo-scroll')){
      var wrap = document.createElement('div');
      wrap.className = 'demo-scroll';
      wrap.innerHTML =
        '<img src="/assets/screen2.jpg" alt="" style="display:block;width:100%;">' +
        '<img src="/assets/screen2.jpg" alt="" style="display:block;width:100%;">';
      document.body.prepend(wrap);

      var st = document.createElement('style');
      st.textContent = `
        body{overflow:auto;}
        .demo-scroll{position:relative}
      `;
      document.head.appendChild(st);
    }
  }

  onReady(function(){
    var hash = (location.hash||'').toLowerCase();
    if(hash.indexOf('#operator')===0){ compactOperator(); }
    if(hash.indexOf('#help')===0){ compactClient(); }
  });
})();
</script>
