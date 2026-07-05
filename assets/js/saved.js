/* ============================================================
   NILE LINK — saved.js
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  async function render(){
    const ids=NL.favs();
    const rr=await NL.api.listings.getMany(ids);
    const items=(rr&&rr.data)||[];
    $('#savedSub').textContent=items.length?items.length+' saved item'+(items.length!==1?'s':''):'Items you\'ve hearted';
    if(!items.length){
      $('#savedRoot').innerHTML='<div class="empty-state"><div class="ei"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></div><h2>No saved items yet</h2><p>Tap the heart on any listing to save it here for later.</p><a class="btn btn-lime" href="browse.html">Browse listings</a></div>';
      return;
    }
    $('#savedRoot').innerHTML='<div class="grid">'+items.map((it,i)=>NL.cardHTML(it,i)).join('')+'</div>';
  }
  // re-render when a fav is toggled (core handles the toggle; we listen on click)
  document.addEventListener('click',e=>{if(e.target.closest('[data-fav]'))setTimeout(render,50)});
  document.addEventListener('nl:rate',render);
  function init(){if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('saved.html');return}render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
