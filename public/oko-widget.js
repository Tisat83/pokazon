/*! OKO Widget v6.7 — dispatch oko:set-code / oko:clear-code so sdk can bind */
(function(){
  const SIO="https://cdn.socket.io/4.7.5/socket.io.min.js";
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function load(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  function copyText(t){ if(navigator.clipboard&&navigator.clipboard.writeText){ return navigator.clipboard.writeText(t).catch(()=>{}); }
    const ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); }

  ready(async function(){
    try{
      if(!/#help\b/i.test(location.href)) return;

      const st=document.createElement('style'); st.textContent=`
        .oko-help-btn{position:fixed;right:18px;bottom:18px;z-index:2147483400;background:#111;color:#fff;border:0;border-radius:999px;padding:12px 16px;box-shadow:0 12px 32px rgba(0,0,0,.25);cursor:pointer}
        .oko-modal{position:fixed;inset:0;background:rgba(2,6,23,.55);display:flex;align-items:center;justify-content:center;z-index:2147483401}
        .oko-card{background:#fff;border-radius:14px;padding:18px 18px 14px;min-width:320px;max-width:420px;box-shadow:0 14px 48px rgba(0,0,0,.35);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
        .oko-title{font-weight:700;font-size:16px;margin-bottom:6px}
        .oko-code{font-size:28px;font-weight:800;letter-spacing:2px;background:#f8fafc;border:1px dashed #e5e7eb;border-radius:10px;padding:10px 12px;user-select:all;text-align:center;cursor:pointer;margin:10px 0}
        .oko-muted{color:#64748b;font-size:12px}
        .oko-row{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:10px}
        .oko-btn{background:#111;color:#fff;border:0;border-radius:10px;padding:10px 12px;cursor:pointer}
      `; document.head.appendChild(st);

      let socket=null, sessionCode=null, connected=false;
      async function ensureSocket(){
        if(socket) return socket;
        if(!window.io){ await load(SIO); }
        socket = window.io(location.origin, {transports:['websocket','polling']});
        socket.on('guest:joined', ()=>{ connected=true; updateBtn(); });
        socket.on('session:stopped', ()=>{ connected=false; updateBtn(); window.dispatchEvent(new CustomEvent('oko:clear-code')); });
        return socket;
      }

      const btn=document.getElementById('oko-help-btn') || document.createElement('button');
      if(!btn.id){ btn.id='oko-help-btn'; btn.className='oko-help-btn'; document.body.appendChild(btn); }
      function updateBtn(){ btn.textContent = connected ? 'Остановить' : 'Подключить'; }
      updateBtn();

      btn.onclick = async ()=>{
        await ensureSocket();
        if(connected){
          socket.emit('host:stop', {code: sessionCode});
          connected=false; updateBtn();
          window.dispatchEvent(new CustomEvent('oko:clear-code'));
          return;
        }
        openModal();
      };

      function newLocalCode(){ return (Math.floor(100000 + Math.random()*900000)+'' ); }

      async function openModal(){
        await ensureSocket();
        const modal=document.createElement('div'); modal.className='oko-modal';
        modal.innerHTML=`
          <div class="oko-card">
            <div class="oko-title">Помощь от Pokazon</div>
            <div class="oko-muted">Продиктуйте код сотруднику или отправьте код:</div>
            <div class="oko-code" id="oko-code">••••••</div>
            <div class="oko-muted">Нажмите на код, чтобы скопировать его.</div>
            <div class="oko-muted" style="margin-top:6px">Мы не увидим ваш экран. Доступ есть только к этой странице. Сессию можно остановить кнопкой ниже.</div>
            <div class="oko-row">
              <button class="oko-btn" id="oko-close">Закрыть</button>
            </div>
          </div>`;
        document.body.appendChild(modal);

        const codeEl=modal.querySelector('#oko-code');
        let displayed=false;

        // ask server for code
        socket.emit('host:new_session', {}, (resp)=>{
          sessionCode = resp && resp.code ? (''+resp.code) : newLocalCode();
          codeEl.textContent = sessionCode;
          displayed=true;
          // register & announce code to SDK
          socket.emit('host:start', {code: sessionCode});
          window.dispatchEvent(new CustomEvent('oko:set-code',{detail:{code: sessionCode}}));
        });

        // fallback
        setTimeout(()=>{
          if (!displayed) {
            sessionCode = newLocalCode();
            codeEl.textContent = sessionCode;
            socket.emit('host:start', {code: sessionCode});
            window.dispatchEvent(new CustomEvent('oko:set-code',{detail:{code: sessionCode}}));
          }
        }, 600);

        codeEl.addEventListener('click', ()=>{
          const c = sessionCode || codeEl.textContent;
          try{ navigator.clipboard.writeText(c); codeEl.style.background='#dcfce7'; }catch(e){}
        });
        modal.querySelector('#oko-close').onclick = ()=> modal.remove();
      }
    }catch(e){ console.error('[OKO widget v6.7]', e); }
  });
})();

// === Pokazon: click-to-copy for one-time code ===
(function(){
  function getCode(el){
    if(!el) return '';
    var a = el.getAttribute && (el.getAttribute('data-oko-code') || el.getAttribute('data-code'));
    var t = (el.textContent || '').trim();
    var v = (a || t || '').replace(/\s+/g,'');
    return v;
  }
  function markClickable(el){
    try { el.style.cursor = 'pointer'; el.title = 'Нажмите, чтобы скопировать код'; } catch(e){}
  }
  try {
    document.querySelectorAll('.oko-code,[data-oko-code],[data-code]').forEach(markClickable);
  } catch(e){}
  document.addEventListener('click', function(ev){
    var el = ev.target && (ev.target.closest && ev.target.closest('.oko-code,[data-oko-code],[data-code]') || null);
    if(!el) return;
    var code = getCode(el);
    if(!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function(){
        try {
          var prev = el.textContent;
          el.textContent = 'Скопировано: ' + code;
          setTimeout(function(){ el.textContent = prev; }, 1200);
        } catch(e){}
      }).catch(function(e){ console.warn('Clipboard copy failed', e); });
    }
  }, true);
})();
// === /Pokazon: click-to-copy ===


// === Pokazon: add small copy icon next to the code ===
(function(){
  function ensureIconFor(el){
    if(!el) return;
    if (el.__pokazon_copy_icon) return; // already added
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label','Скопировать код');
    btn.title = 'Скопировать код';
    btn.className = 'pokazon-copy-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    // basic inline style (doesn't depend on global CSS)
    btn.style.marginLeft = '8px';
    btn.style.verticalAlign = 'middle';
    btn.style.border = '1px solid rgba(0,0,0,0.1)';
    btn.style.background = 'white';
    btn.style.borderRadius = '6px';
    btn.style.padding = '4px 6px';
    btn.style.cursor = 'pointer';
    btn.style.lineHeight = '0';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.color = '#222';
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var text = (el.getAttribute('data-oko-code') || el.getAttribute('data-code') || el.textContent || '').trim();
      text = text.replace(/\s+/g, '');
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          var old = btn.innerHTML;
          btn.innerHTML = '✓';
          setTimeout(function(){ btn.innerHTML = old; }, 900);
        }).catch(function(e){ console.warn('Clipboard copy failed', e); });
      }
    }, true);
    el.insertAdjacentElement('afterend', btn);
    el.__pokazon_copy_icon = btn;
  }
  function scan(){
    try {
      document.querySelectorAll('.oko-code,[data-oko-code],[data-code]').forEach(ensureIconFor);
    } catch(e){}
  }
  scan();
  var mo = new MutationObserver(scan);
  mo.observe(document.documentElement, {childList:true, subtree:true});
  // optional: stop after 5s to not observe forever
  setTimeout(function(){ try{mo.disconnect();}catch(e){} }, 5000);
})();
// === /Pokazon: copy icon ===
