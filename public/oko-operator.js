/*! OKO Operator v18.6.9 — hide duplicate join in popup; log toggle; keeps 18.6.8 fit */
(function(){
  const SIO="https://cdn.socket.io/4.7.5/socket.io.min.js";
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function load(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function getCodeFromStrictUrl(){
    try{
      const u=new URL(location.href);
      let code=u.searchParams.get('code');
      if(!code){
        const h=(u.hash||'').replace(/^#/,''); 
        if (h) {
          const parts = h.split(/[?&]/).slice(1);
          const hp = new URLSearchParams(parts.join('&'));
          code = hp.get('code');
        }
      }
      return /^\d{6}$/.test(code||'') ? code : null;
    }catch(e){ return null; }
  }

  ready(async function(){
    try{
      if(!document.getElementById('oko-op-style')){
        const st=document.createElement('style'); st.id='oko-op-style'; st.textContent=`
          .oko-op-dock{position:fixed;right:16px;bottom:16px;z-index:2147483500;width:380px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,.25);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
          .oko-op-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #eee;background:#0f172a;color:#e2e8f0;border-radius:12px 12px 0 0}
          .oko-op-bd{padding:10px 12px}
          .oko-op-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
          .oko-op-row input[type=text]{flex:1 1 auto;padding:8px;border:1px solid #ddd;border-radius:8px}
          .oko-op-row button{padding:8px 10px;border-radius:8px;border:1px solid #111;background:#111;color:#fff;cursor:pointer}
          .oko-op-muted{color:#64748b;font-size:12px;white-space:pre-wrap}
          .oko-op-mini{position:fixed;right:16px;bottom:16px;z-index:2147483499;background:#111;color:#fff;border-radius:999px;padding:10px 12px;box-shadow:0 10px 28px rgba(0,0,0,.25);cursor:pointer}
          .oko-op-badge{display:inline-block;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;padding:4px 6px;border-radius:6px;font-size:12px}
          .oko-op-ok{display:inline-block;background:#dcfce7;color:#166534;border:1px solid #bbf7d0;padding:4px 6px;border-radius:6px;font-size:12px}
          .oko-op-pulse{position:fixed;width:10px;height:10px;border:3px solid #f43f5e;border-radius:999px;opacity:.95;pointer-events:none;z-index:2147483646;animation:okoPulse .5s ease-out forwards}
          @keyframes okoPulse{0%{transform:scale(.9);opacity:.95}100%{transform:scale(2.8);opacity:0}}
          .oko-op-joinhint{position:absolute;right:12px;top:10px;background:#10b981;color:#052e1d;border:0;border-radius:8px;padding:6px 8px;font-size:12px;cursor:pointer;display:none}
          .oko-op-joinnow{background:#0ea5e9;border:0;border-radius:8px;padding:6px 10px;font-size:12px;color:#042b3a;cursor:pointer}
          .oko-op-diag{margin-top:6px;padding:6px;border:1px dashed #e5e7eb;border-radius:8px;background:#f8fafc;max-height:120px;overflow:auto;display:none}
          .oko-op-diag-toggle{background:#e5e7eb;border:0;border-radius:6px;padding:4px 6px;font-size:12px;color:#111;cursor:pointer}
        `; document.head.appendChild(st);
      }

      const dock=document.createElement('div'); dock.className='oko-op-dock'; dock.style.display='none';
      dock.innerHTML=`
        <div class="oko-op-hd">
          <div>OKO · Панель оператора</div>
          <div style="display:flex;gap:6px;align-items:center">
            <button id="okoOpAutoJoin" class="oko-op-joinhint" title="Автовход по коду">Автовход</button>
            <button id="okoOpClose" style="background:transparent;border:0;color:#e2e8f0;font-size:18px;cursor:pointer">×</button>
          </div>
        </div>
        <div class="oko-op-bd">
          <div class="oko-op-row">
            <input id="okoOpCode" type="text" maxlength="6" placeholder="Код (6 цифр)" />
            <button id="okoOpJoin">Войти</button>
            <button id="okoOpJoinNow" class="oko-op-joinnow" style="display:none">Войти сейчас</button>
          </div>
          <div class="oko-op-row">
            <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="okoOpPointer"> Только указка</label>
            <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="okoOpSync" checked> Синхронная прокрутка</label>
          </div>
          <div class="oko-op-row"><span id="okoOpVP" class="oko-op-muted">Экран клиента: —</span></div>
          <div class="oko-op-row"><span id="okoOpMyVP" class="oko-op-muted">Твой экран: —</span></div>
          <div class="oko-op-row">
            <button id="okoOpFit">Подогнать</button>
            <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="okoOpAutoFit"> Автоподгон</label>
            <button id="okoOpReset">Сброс</button>
            <button id="okoOpPopup">Окно W×H</button>
          </div>
          <div class="oko-op-row">
            <input id="okoOpAnchor" type="text" placeholder="Якорь (qty/cart/...)" style="flex:1 1 auto">
            <button id="okoOpGo">Перейти</button>
          </div>
          <div class="oko-op-row">
            <button data-cmd="lineUp">▲</button>
            <button data-cmd="lineDown">▼</button>
            <button data-cmd="pageUp">PgUp</button>
            <button data-cmd="pageDown">PgDn</button>
            <button data-cmd="top">Top</button>
            <button data-cmd="bottom">Bottom</button>
          </div>
          <div id="okoOpFeedback" class="oko-op-muted">Готов к подключению.</div>
          <div class="oko-op-row" style="justify-content:flex-end"><button id="okoOpToggleLog" class="oko-op-diag-toggle">Лог</button></div>
          <div id="okoOpDiag" class="oko-op-diag"></div>
        </div>
      `;
      document.body.appendChild(dock);

      // Panel isolation (bubble-phase)
      const isolateTypes=['pointerdown','mousedown','click','mouseup','keydown','keyup','wheel'];
      isolateTypes.forEach(type=>{
        dock.addEventListener(type, (e)=>{ e.stopPropagation(); if(type==='wheel') e.preventDefault(); }, {capture:false, passive:false});
      });

      const mini=document.createElement('button'); mini.className='oko-op-mini'; mini.textContent='OKO Оператор'; document.body.appendChild(mini);
      function showDock(v){ dock.style.display=v?'block':'none'; mini.style.display=v?'none':'inline-block'; }
      mini.addEventListener('click', ()=>showDock(true));
      dock.querySelector('#okoOpClose').addEventListener('click', ()=>showDock(false));
      window.OkoOp = { open:()=>showDock(true), close:()=>showDock(false) };

      // Refs
      const status=dock.querySelector('#okoOpFeedback');
      const diag=dock.querySelector('#okoOpDiag');
      const toggleLog=dock.querySelector('#okoOpToggleLog');
      const vpEl=dock.querySelector('#okoOpVP');
      const myVpEl=dock.querySelector('#okoOpMyVP');
      const syncBox=dock.querySelector('#okoOpSync');
      const pointerOnly=dock.querySelector('#okoOpPointer');
      const autoFit=dock.querySelector('#okoOpAutoFit');
      const fitBtn=dock.querySelector('#okoOpFit');
      const resetBtn=dock.querySelector('#okoOpReset');
      const popupBtn=dock.querySelector('#okoOpPopup');
      const codeInput=dock.querySelector('#okoOpCode');
      const autoJoinBtn=dock.querySelector('#okoOpAutoJoin');
      const joinNowBtn=dock.querySelector('#okoOpJoinNow');
      const joinBtn=dock.querySelector('#okoOpJoin');

      toggleLog.addEventListener('click', ()=>{
        const vis = diag.style.display!=='none';
        diag.style.display = vis ? 'none' : 'block';
      });

      function log(s){ if(diag.style.display!=='block') return; diag.textContent += (diag.textContent?'\n':'') + s; }
      function clearLog(){ diag.textContent=''; }

      // State
      let socket=null,connected=false,codeVal=null,lastNorm={nx:.5,ny:.5};
      let clientW=null,clientH=null,clientDpr=1;
      const urlCode = getCodeFromStrictUrl(); // popup detection

      // Hide duplicate join button in popup
      if (urlCode) { joinBtn.style.display='none'; }

      function fromPanel(e){ return e.target.closest && (e.target.closest('.oko-op-dock')||e.target.closest('.oko-op-mini')); }
      function send(type,payload){ if(!connected) return; socket.emit('control:event',{code:codeVal,type,payload}); }
      function resetFit(){ document.body.style.zoom=''; document.body.style.transform=''; document.body.style.width=''; }
      function applyFit(){ if(!clientW) return; resetFit(); const scale=clientW/window.innerWidth; if(window.chrome){ document.body.style.zoom=String(scale); } else { document.body.style.transformOrigin='0 0'; document.body.style.transform='scale('+scale+')'; document.body.style.width=(window.innerWidth/scale)+'px'; } }
      function updateMyVP(){ myVpEl.textContent='Твой экран: '+window.innerWidth+'×'+window.innerHeight; }
      updateMyVP(); window.addEventListener('resize', updateMyVP);

      // In popup enable AutoFit by default
      if (urlCode) { autoFit.checked = true; }

      fitBtn.addEventListener('click', ()=>{ send('pingViewport',{}); applyFit(); });
      resetBtn.addEventListener('click', resetFit);

      // POPUP builder: uses client's size if known
      popupBtn.addEventListener('click', ()=>{
        const candidate = (codeVal && /^\d{6}$/.test(codeVal)) ? codeVal : (codeInput.value||'').trim();
        if(!/^\d{6}$/.test(candidate)){ alert('Сначала введите 6-значный код (или нажмите Войти).'); return; }
        let w,h;
        if (clientW && clientH) { w = Math.round(clientW); h = Math.round(clientH); }
        else { w = Math.max(960, Math.round(window.innerWidth*0.9)||1200); h = Math.max(640, Math.round(window.innerHeight*0.9)||800); }
        const base = location.origin + location.pathname;
        const u = new URL(base);
        u.searchParams.set('code', candidate);
        const url = u.toString() + '#operator';
        const f='width='+w+',height='+h+',resizable=yes,scrollbars=yes,noopener';
        window.open(url,'oko_view_'+Date.now(),f);
      });

      dock.querySelector('#okoOpGo').addEventListener('click', ()=>{ const id=dock.querySelector('#okoOpAnchor').value.trim(); if(id) send('jumpTo',{id}); });

      dock.querySelectorAll('[data-cmd]').forEach(btn=> btn.addEventListener('click', ()=>{
        if(pointerOnly.checked) return;
        const cmd=btn.getAttribute('data-cmd'); send('scrollCmd',{cmd});
        if(syncBox.checked){
          const vh=innerHeight,l=Math.max(16,Math.round(vh*0.06));
          if(cmd==='lineDown')window.scrollBy({top:l});
          if(cmd==='lineUp')window.scrollBy({top:-l});
          if(cmd==='pageDown')window.scrollBy({top:vh});
          if(cmd==='pageUp')window.scrollBy({top:-vh});
          if(cmd==='top')window.scrollTo({top:0});
          if(cmd==='bottom')window.scrollTo({top:document.documentElement.scrollHeight});
        }
      }));

      addEventListener('mousemove', e=>{ if(!connected||fromPanel(e)) return; lastNorm={nx:clamp(e.clientX/innerWidth,0,1),ny:clamp(e.clientY/innerHeight,0,1)}; send('cursor',lastNorm); }, true);
      addEventListener('click', e=>{ if(!connected||fromPanel(e)) return; if(pointerOnly.checked) return; const nx=clamp(e.clientX/innerWidth,0,1), ny=clamp(e.clientY/innerHeight,0,1); lastNorm={nx,ny}; send('click',{nx,ny}); }, true);
      addEventListener('keydown', e=>{ if(!connected) return; if(fromPanel(e)) return; if(pointerOnly.checked) return; if(e.metaKey||e.ctrlKey||e.altKey) return; const k=e.key; if (k.length===1 || k==='Backspace' || k==='Delete' || k==='Enter' || k===' ') { send('key',{key:k}); e.preventDefault(); } }, true);
      addEventListener('wheel', e=>{ if(!connected) return; if(pointerOnly.checked) return; if(!e.ctrlKey){ const dy=Math.sign(e.deltaY)*Math.max(60,Math.abs(e.deltaY)); send('wheelDelta',{dy}); if(syncBox.checked) window.scrollBy({top:dy}); e.preventDefault(); } }, {passive:false});
      addEventListener('wheel', e=>{ if(e.ctrlKey && e.stopImmediatePropagation) e.stopImmediatePropagation(); }, {capture:true});

      if(!window.io){ await load(SIO); }
      const origin = location.origin;
      const IO = window.io && window.io(origin, { transports: ['websocket','polling'] });
      if(!IO){ status.innerHTML='<span class="oko-op-badge">Socket.io не загрузился</span>'; return; }
      const socketRef = IO; window.__okoSocket = IO;
      socket = socketRef;

      socket.on('connect', ()=>{
        const sid = socket.id || '(нет id)';
        status.textContent='Готов к подключению.' + (urlCode? '\nКод из URL: '+urlCode : '') + '\nSocketID: '+sid;
        if (urlCode) { joinNowBtn.style.display='inline-block'; attemptJoin(urlCode); }
      });
      socket.on('connect_error', (err)=>{ status.innerHTML='<span class="oko-op-badge">Ошибка соединения: '+(err&&err.message||'connect_error')+'</span>'; });
      socket.on('disconnect', ()=>{ status.innerHTML='<span class="oko-op-badge">Отключено от сервера</span>'; });

      function doJoin(c){
        if(!c) return;
        codeVal=c; codeInput.value=c;
        status.textContent='Подключаемся к коду '+c+'…';
        socket.emit('guest:join',{code:c});
        let joined=false;
        const t=setTimeout(()=>{ if(!joined){ status.innerHTML = '<span class="oko-op-badge">Код не найден или истёк.</span>'; } }, 4000);
        socket.once('guest:joined', ()=>{
          joined=true; clearTimeout(t);
          connected=true;
          status.innerHTML='<span class="oko-op-ok">Гость подключён</span>';
          send('pingViewport',{});
        });
        socket.once('guest:error', (err)=>{ clearTimeout(t); status.innerHTML='<span class="oko-op-badge">Ошибка: '+(err&&err.message||'join')+'</span>'; });
        socket.on('session:stopped', ()=>{ connected=false; status.innerHTML='<span class="oko-op-badge">Сессия завершена</span>'; });

        socket.on('feedback:client', ({kind,payload})=>{
          if(kind==='viewport'){ clientW=payload.w; clientH=payload.h; clientDpr=payload.dpr||1; vpEl.textContent='Экран клиента: '+clientW+'×'+clientH+' (dpr '+clientDpr+')'; if(autoFit.checked) applyFit(); }
          if(kind==='scroll'){ if(syncBox.checked){ const maxY=Math.max(1,document.documentElement.scrollHeight-innerHeight); scrollTo({top:payload.ry*maxY}); } }
          if(kind==='clientClick'){
            const x = clamp(payload.nx*innerWidth,0,innerWidth);
            const y = clamp(payload.ny*innerHeight,0,innerHeight);
            const d=document.createElement('div'); d.className='oko-op-pulse'; d.style.left=(x-7)+'px'; d.style.top=(y-7)+'px'; document.body.appendChild(d); setTimeout(()=>d.remove(),520);
          }
        });
      }

      function attemptJoin(code){
        autoJoinBtn.style.display = 'inline-block';
        autoJoinBtn.onclick = ()=> doJoin(code);
        joinNowBtn.style.display = 'inline-block';
        joinNowBtn.onclick = ()=> doJoin(code);
        let tries=0;
        const tick=()=>{
          if(connected) return;
          tries++;
          status.textContent = 'Готов к подключению.\nАвтовход попытка '+tries+'… (код '+code+')';
          doJoin(code);
          if(tries<3) setTimeout(tick, 1500);
        };
        tick();
      }

      dock.querySelector('#okoOpJoin').addEventListener('click', ()=>{
        const c=dock.querySelector('#okoOpCode').value.trim();
        if(!/^\d{6}$/.test(c)) return alert('Введите 6 цифр');
        doJoin(c);
      });
      codeInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ const c=codeInput.value.trim(); if(/^\d{6}$/.test(c)) doJoin(c); } });

      if (/#operator\b/i.test(location.href)) {
        showDock(true);
        if (urlCode) { joinNowBtn.style.display='inline-block'; }
      }
    }catch(e){ console.error('[OKO op v18.6.9]', e); }
  });
})();