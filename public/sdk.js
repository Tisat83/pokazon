/*! OKO SDK v14.1 — binds socket to session code on oko:set-code */
(function(){
  const SIO="https://cdn.socket.io/4.7.5/socket.io.min.js";
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function load(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function typeInto(el, key){
    if(!el) return;
    const tag = (el.tagName||'').toLowerCase();
    const editable = el.isContentEditable || tag==='input' || tag==='textarea';
    if(!editable) return;
    if(key==='Backspace' || key==='Delete'){
      const start = el.selectionStart, end = el.selectionEnd;
      if(typeof start==='number' && typeof end==='number'){
        if(start===end && key==='Backspace' && start>0){
          el.setRangeText('', start-1, end, 'end');
        }else if(start===end && key==='Delete'){
          el.setRangeText('', start, end+1, 'end');
        }else{
          el.setRangeText('', start, end, 'end');
        }
      }else{
        document.execCommand(key==='Backspace'?'delete':'forwardDelete');
      }
      el.dispatchEvent(new Event('input', {bubbles:true}));
      return;
    }
    if(key==='Enter'){
      if(tag==='input'){ el.form && el.form.submit && el.form.submit(); }
      else if(tag==='textarea' || el.isContentEditable){ document.execCommand('insertHTML', false, '\n'); }
      return;
    }
    if(key && key.length===1){
      if(typeof el.selectionStart==='number'){
        const start=el.selectionStart, end=el.selectionEnd;
        el.setRangeText(key, start, end, 'end');
        el.dispatchEvent(new Event('input', {bubbles:true}));
      }else{
        document.execCommand('insertText', false, key);
      }
    }
  }

  ready(async function(){
    try{
      if(!window.io){ await load(SIO); }
      const socket = window.io(location.origin, {transports:['websocket','polling']});
      window.__okoClientSocket = socket;

      // show remote cursor
      const st=document.createElement('style'); st.textContent=`
        .oko-rc{position:fixed;left:0;top:0;width:16px;height:16px;border:3px solid #111;background:#fff;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.35);transform:translate(-50%,-50%);pointer-events:none;z-index:2147483645;opacity:.95}
        .oko-rc-hide{opacity:0;transition:opacity .25s ease}
      `; document.head.appendChild(st);
      const rc=document.createElement('div'); rc.className='oko-rc oko-rc-hide'; document.body.appendChild(rc);
      let rcTimer=null; function showRC(x,y){ rc.style.left=x+'px'; rc.style.top=y+'px'; rc.classList.remove('oko-rc-hide'); clearTimeout(rcTimer); rcTimer=setTimeout(()=>rc.classList.add('oko-rc-hide'),900); }

      function clampXY(nx,ny){ return { x: clamp(nx*innerWidth,0,innerWidth), y: clamp(ny*innerHeight,0,innerHeight) }; }
      function elAt(nx,ny){ const p=clampXY(nx,ny); return document.elementFromPoint(p.x,p.y); }

      socket.on('control:event', ({type, payload})=>{
        if(type==='cursor'){ const p=clampXY(payload.nx,payload.ny); showRC(p.x,p.y); }
        if(type==='click'){ const el=elAt(payload.nx,payload.ny); if(!el) return; if(el.focus) el.focus({preventScroll:true}); const p=clampXY(payload.nx,payload.ny); ['mousedown','mouseup','click'].forEach(ev=> el.dispatchEvent(new MouseEvent(ev,{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,view:window}))); }
        if(type==='wheelDelta'){ window.scrollBy({top: payload.dy}); }
        if(type==='key'){ typeInto(document.activeElement, payload.key); }
        if(type==='scrollCmd'){ const vh=innerHeight,l=Math.max(16,Math.round(vh*0.06)),c=payload.cmd; if(c==='lineDown')scrollBy({top:l}); if(c==='lineUp')scrollBy({top:-l}); if(c==='pageDown')scrollBy({top:vh}); if(c==='pageUp')scrollBy({top:-vh}); if(c==='top')scrollTo({top:0}); if(c==='bottom')scrollTo({top:document.documentElement.scrollHeight}); }
        if(type==='pingViewport'){ socket.emit('feedback:client',{code:(window.OKO_CODE||null),kind:'viewport',payload:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio||1}}); }
      });

      addEventListener('scroll', ()=>{
        const maxY=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        const ry = clamp(scrollY/maxY,0,1);
        socket.emit('feedback:client',{code:(window.OKO_CODE||null),kind:'scroll',payload:{ry}});
      }, {passive:true});

      addEventListener('click', (e)=>{
        const nx = clamp(e.clientX/innerWidth,0,1);
        const ny = clamp(e.clientY/innerHeight,0,1);
        socket.emit('feedback:client',{code:(window.OKO_CODE||null),kind:'clientClick',payload:{nx,ny}});
      }, true);

      // Bind to session when widget announces the code
      window.addEventListener('oko:set-code', (e)=>{
        const c = e.detail && e.detail.code;
        window.OKO_CODE = c;
        if (c) socket.emit('host:bind', { code: c });
      });
      window.addEventListener('oko:clear-code', ()=>{
        window.OKO_CODE = null;
      });
    }catch(e){ console.error('[OKO sdk v14.1]', e); }
  });
})();