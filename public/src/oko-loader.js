
/*! pokazon loader (dev) — iframe-embed friendly */
(function(){
  var EMBED_OK = (window.POKAZON_EMBED === true);
  if (window.top !== window && !EMBED_OK) { return; }

  var hash = (location.hash||'').toLowerCase();
  var NEED_HELP = hash.indexOf('#help') === 0;
  var NEED_OPERATOR = hash.indexOf('#operator') === 0;

  function inject(src){ var s=document.createElement('script'); s.defer=true; s.src=src; document.head.appendChild(s); }
  function css(href){ var l=document.createElement('link'); l.rel='stylesheet'; l.href=href; document.head.appendChild(l); }

  css('/oko-widget.css');
  inject('/sdk.js');
  inject('/oko-operator.js');
  inject('/oko-widget.js');

  window.addEventListener('DOMContentLoaded', function(){
    if (NEED_HELP) {
      document.dispatchEvent(new CustomEvent('pokazon:want-help'));
    } else if (NEED_OPERATOR) {
      document.dispatchEvent(new CustomEvent('pokazon:want-operator'));
    }
  });
})();
