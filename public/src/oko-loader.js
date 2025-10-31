/*! OKO Loader v17 — loads widget on #help and operator on #operator; robust hash watcher */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function load(src){ return new Promise((res,rej)=>{ var s=document.createElement('script'); s.src=src; s.async=true; s.onload=res; s.onerror=function(e){console.error('[oko-loader] fail',src,e); rej(e)}; document.head.appendChild(s); }); }
  function need(tag){ return (location.hash||'').toLowerCase().indexOf('#'+tag)===0 || (location.hash||'').toLowerCase().split('&').includes(tag); }
  function decide(){
    var h=(location.hash||'').toLowerCase();
    if(h.indexOf('#help')===0){ return 'help'; }
    if(h.indexOf('#operator')===0){ return 'operator'; }
    return null;
  }
  async function boot(){
    var mode=decide();
    if(!mode) return;
    try{
      await load('/public/sdk.js?v=13');
      if(mode==='help'){ await load('/public/oko-widget.js?v=64'); }
      if(mode==='operator'){ await load('/public/oko-operator.js?v=18_6_9'); }
      console.log('[oko-loader] loaded', mode);
    }catch(e){ console.error('[oko-loader] error', e); }
  }
  ready(boot);
  window.addEventListener('hashchange', boot);
})();