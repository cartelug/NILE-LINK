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
      $('#savedRoot').innerHTML='<div class="empty-state"><img src="'+NL.root+'assets/images/generated/empty-saved.jpg" alt="" style="width:100%;max-width:280px;border-radius:var(--r-md);box-shadow:var(--sh-2);margin:0 auto 18px;display:block"><h2>No saved items yet</h2><p>Tap the heart on any listing to save it here for later.</p><a class="btn btn-lime" href="browse.html">Browse listings</a></div>';
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
