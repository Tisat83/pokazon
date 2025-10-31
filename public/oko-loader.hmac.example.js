// Example HMAC-enabled loader for pokazon
(function(){
  const API_ORIGIN = window.OKO_API_ORIGIN || 'https://api.pokazon.ru';
  const origin = window.location.origin;
  const ts = Math.floor(Date.now()/1000);
  // sig должен быть посчитан на стороне CDN или с помощью вшитого секрета НЕЛЬЗЯ.
  // Здесь мы делаем упрощённый вариант: сервер может включать режим без HMAC (на старте)
  const sig = (window.OKO_HMAC_SIG || '');

  function qs(obj){
    return Object.entries(obj).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  }

  function boot(){
    return fetch(`${API_ORIGIN}/boot?`+qs({ origin, ts, sig }), { credentials: 'omit' })
      .then(r => r.json())
      .catch(() => ({ ok:false }));
  }

  function inject(src){
    var s=document.createElement('script'); s.defer=true; s.src=src;
    document.head.appendChild(s);
  }

  boot().then(resp => {
    if (resp.ok) {
      // грузим SDK/виджеты с CDN
      var cdn = window.OKO_CDN_ORIGIN || 'https://cdn.pokazon.ru';
      inject(cdn + '/oko/sdk.js?v=prod');
      inject(cdn + '/oko/oko-widget.js?v=prod');
      inject(cdn + '/oko/oko-operator.js?v=prod');
    } else {
      console.warn('[OKO] boot rejected', resp);
    }
  });
})();
