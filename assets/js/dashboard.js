/* ============================================================
   NILE LINK — dashboard.js
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  const di=(p)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';

  function renderStats(){
    const live=D.SHOP.filter(s=>s.status==='live').length;
    const drafts=D.SHOP.filter(s=>s.status==='draft').length;
    const views=D.SHOP.reduce((a,s)=>a+(s.views||0),0);
    const reqs=D.REQUESTS.length;
    const stat=(ic,n,l)=>'<div class="dstat"><div class="di">'+di(ic)+'</div><div class="dn">'+n+'</div><div class="dl">'+l+'</div></div>';
    $('#dashStats').innerHTML=
      stat('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',live,'Live listings')+
      stat('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',views,'Total views')+
      stat('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',reqs,'Requests')+
      stat('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',drafts,'Drafts');
    $('#perfStats').innerHTML=
      stat('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',views,'Views (30d)')+
      stat('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',reqs,'Leads (30d)')+
      stat('<path d="M20 6L9 17l-5-5"/>','1','Sold (30d)')+
      stat('<path d="M12 2l2.4 6.4L21 9l-5 4.5L17.5 21 12 17.3 6.5 21 8 13.5 3 9l6.6-.6z"/>','4.8','Avg. rating');
    const ssp=$('[data-earn-ssp]');if(ssp)ssp.textContent=NL.fmtSSP(1090*NL.getRate());
  }

  function pill(s){const m={live:'Live',draft:'Draft',pending:'Pending',sold:'Sold'};return '<span class="status-pill st-'+s+'">'+m[s]+'</span>'}
  function renderListings(){
    $('#listingRows').innerHTML=D.SHOP.map(s=>
      '<div class="listing-row">'+
        '<div class="lr-thumb">'+NL.glyph(s.key,24)+'</div>'+
        '<div class="lr-body"><div class="lr-title">'+s.title+'</div>'+
          '<div class="lr-meta">'+pill(s.status)+'<span>'+NL.fmtUSD(s.usd)+(s.note||'')+'</span>'+(s.views!=null?'<span>'+s.views+' views</span>':'')+(s.reqs!=null?'<span>'+s.reqs+' requests</span>':'')+'</div>'+
          (s.status==='draft'?'<div class="draft-prog"><i style="width:'+(s.pct||30)+'%"></i></div>':'')+
        '</div>'+
        '<div class="lr-actions"><button data-edit="'+s.id+'" aria-label="Edit">'+di('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>')+'</button>'+
          '<button data-del="'+s.id+'" aria-label="Delete">'+di('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14H6L5 6"/>')+'</button></div>'+
      '</div>').join('');
  }
  function renderRequests(){
    $('#reqRows').innerHTML=D.REQUESTS.map(r=>{
      const tl={order:'Order',contact:'Contact',quote:'Quote'};
      return '<div class="req-row"><div class="req-av">'+r.name[0]+'</div>'+
        '<div style="flex:1;min-width:0"><div class="lr-title">'+r.name+'</div><div class="lr-meta"><span class="status-pill st-live">'+tl[r.type]+'</span><span>'+r.item+'</span><span>'+r.time+'</span></div></div>'+
        '<a class="btn btn-ghost btn-sm" href="messages.html">Reply</a></div>';
    }).join('');
  }

  function bindTabs(){
    $('#dashTabs').addEventListener('click',e=>{const b=e.target.closest('.dash-tab');if(!b)return;
      document.querySelectorAll('.dash-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
      document.querySelectorAll('.dash-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===b.dataset.tab));
    });
  }
  document.addEventListener('click',e=>{
    const del=e.target.closest('[data-del]');if(del){const i=D.SHOP.findIndex(s=>s.id===del.dataset.del);if(i>=0){D.SHOP.splice(i,1);renderListings();renderStats();NL.toast('Listing deleted',{type:'info'})}}
    const ed=e.target.closest('[data-edit]');if(ed)NL.toast('Edit coming soon',{type:'info'});
  });
  document.addEventListener('nl:rate',renderStats);

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('dashboard.html');return}
    renderStats();renderListings();renderRequests();bindTabs();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
