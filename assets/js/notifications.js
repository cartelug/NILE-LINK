/* ============================================================
   NILE LINK — notifications.js
   v2: realtime-aware (re-renders on nl:new-notification)
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  const ICONS={
    cart:'<path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
    chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    shield:'<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
    bolt:'<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
    doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    spark:'<path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>'
  };
  function render(){
    NL.api.notifications.list().then(r=>{
      const today=r.data.filter(n=>/m ago|h ago|Just now/.test(n.time));
      const earlier=r.data.filter(n=>!/m ago|h ago|Just now/.test(n.time));
      const grp=(label,items)=>items.length?'<div class="notif-group-label">'+label+'</div>'+items.map(card).join(''):'';
      $('#notifList').innerHTML=grp('Today',today)+grp('Earlier',earlier);
      NL.updateBadges();
    });
  }
  function card(n){
    return '<a class="notif'+(n.read?'':' unread')+'" href="'+n.link+'" data-nid="'+n.id+'">'+
      '<div class="notif-ic ni-'+n.type+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n.icon]||ICONS.spark)+'</svg></div>'+
      '<div class="notif-body"><div class="notif-title">'+n.title+'</div><div class="notif-text">'+n.body+'</div><div class="notif-time">'+n.time+'</div></div>'+
      (n.read?'':'<span class="notif-dot"></span>')+
    '</a>';
  }
  document.addEventListener('click',e=>{const a=e.target.closest('[data-nid]');if(a)NL.api.notifications.markRead(a.dataset.nid)});
  document.addEventListener('nl:new-notification', ()=>{ render(); NL.toast&&NL.toast('New notification',{type:'info'}); });

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('notifications.html');return}
    render();
    $('#markAll').addEventListener('click',()=>NL.api.notifications.markAllRead().then(()=>{render();NL.toast('All caught up',{type:'success'})}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
