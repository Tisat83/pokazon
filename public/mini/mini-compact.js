// mini-compact.js — твики только для мини-демо (#help / #operator)
(function () {
  function ready(cb){ if(document.readyState!=='loading'){cb()} else {document.addEventListener('DOMContentLoaded',cb)} }
  function qs(sel, root){ return (root||document).querySelector(sel) }
  function qsa(sel, root){ return (root||document).querySelectorAll(sel) }

  // Добавляем стилевые твики один раз
  function ensureStyle() {
    if (qs('#miniCompactStyle')) return;
    var st = document.createElement('style');
    st.id = 'miniCompactStyle';
    st.textContent = `
      /* компактная панель оператора */
      .oko--mini-compact{max-width:420px}
      .oko--mini-compact .oko-title,
      .oko--mini-compact .oko-header .title{display:none !important}
      .oko--mini-compact .oko-log-btn{display:none !important}
      .oko--mini-compact.minimized .oko-body{display:none !important}
      .oko--mini-compact .oko-min-btn{
        margin-left:auto; width:32px; height:28px; border-radius:8px; line-height:26px;
        background:#0b0f1a; color:#fff; border:1px solid rgba(255,255,255,.2); cursor:pointer;
      }
      /* клиентский фон, чтобы был явный скролл */
      .demo-scroll{
        min-height: 2200px;
        background-image: url('/assets/screen2.jpg');
        background-repeat: repeat-y;
        background-size: 100% auto;
        background-position: top left;
      }
      body{overflow:auto}
    `;
    document.head.appendChild(st);
  }

  /* === ОПЕРАТОР: компактная панель === */
  function compactOperator(){
    ensureStyle();

    // сама панель (поддержим разные селекторы)
    var panel = qs('[data-oko-role="operator-panel"]')
             || qs('.oko-operator')
             || qs('.oko-op')
             || qs('.oko-panel')
             || qs('div[class*="operator"][class*="panel"]');
    if(!panel) return;

    panel.classList.add('oko--mini-compact');

    // убрать кнопку «Лог» даже если у неё нет класса
    qsa('button, a', panel).forEach(function(b){
      var t=(b.textContent||'').trim();
      if(t === 'Лог'){ b.style.display='none'; b.remove(); }
    });

    // спрятать возможные заголовки шапки
    qsa('.oko-header .title, .oko-title, h3', panel).forEach(function(el){ el.style.display='none'; });

    // добавить кнопку «–» (свернуть)
    var header = qs('.oko-header, .oko-head, .oko-title-bar', panel) || panel.firstElementChild;
    if(header && !qs('.oko-min-btn', header)){
      var btn = document.createElement('button');
      btn.className = 'oko-min-btn';
      btn.type = 'button';
      btn.title = 'Свернуть';
      btn.textContent = '–';
      btn.addEventListener('click', function(){ panel.classList.toggle('minimized'); });
      header.appendChild(btn);
    }
  }

  /* === КЛИЕНТ: убрать заголовок в модалке и показать скролл-фон === */
  function compactClient(){
    ensureStyle();
    // убрать «Помощь …» в окне кода
    qsa('.oko-modal h2, .oko-help h2, .oko-help .title').forEach(function(h){ h.remove(); });
    // добавить фон с прокруткой (один раз)
    if(!qs('.demo-scroll')){
      var wrap = document.createElement('div');
      wrap.className = 'demo-scroll';
      document.body.prepend(wrap);
    }
  }

  ready(function(){
    var hash = (location.hash||'').toLowerCase();
    if(hash.indexOf('#operator')===0){ compactOperator(); }
    if(hash.indexOf('#help')===0){ compactClient(); }
  });
})();
