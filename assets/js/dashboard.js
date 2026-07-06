/* ============================================================
   NILE LINK — dashboard.js  (real data)
   Shows the signed-in user's own listings, stats and incoming
   conversations (requests), with real edit / mark-sold / delete.
   ============================================================ */
(function(){
  const $=s=>document.querySelector(s);
  const di=(p)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
  let MINE=[];       // my listings
  let CONVOS=[];     // conversations (activity / requests)

  const statuslabel={live:'Live',draft:'Draft',pending:'Pending',sold:'Sold',removed:'Removed'};
  function pill(s){return '<span class="status-pill st-'+(s==='removed'?'sold':s)+'">'+(statuslabel[s]||s)+'</span>'}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function renderStats(){
    const live=MINE.filter(s=>s.status==='live').length;
    const sold=MINE.filter(s=>s.status==='sold').length;
    const views=MINE.reduce((a,s)=>a+(s.views||0),0);
    const reqs=CONVOS.length;
    const stat=(ic,n,l)=>'<div class="dstat"><div class="di">'+di(ic)+'</div><div class="dn">'+n+'</div><div class="dl">'+l+'</div></div>';
    $('#dashStats').innerHTML=
      stat('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',live,'Live listings')+
      stat('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',views,'Total views')+
      stat('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',reqs,'Requests')+
      stat('<path d="M20 6L9 17l-5-5"/>',sold,'Sold');
    if($('#perfStats')) $('#perfStats').innerHTML=
      stat('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',views,'Views (all)')+
      stat('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',reqs,'Leads')+
      stat('<path d="M20 6L9 17l-5-5"/>',sold,'Sold')+
      stat('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',MINE.length,'Total listings');
  }

  function renderListings(){
    if(!MINE.length){
      $('#listingRows').innerHTML='<div class="empty-state" style="padding:36px 12px;text-align:center"><h3 style="font-weight:800;margin-bottom:6px">No listings yet</h3><p class="muted" style="margin-bottom:14px">Post your first item and it shows up here.</p><a class="btn btn-lime" href="post.html">+ New listing</a></div>';
      return;
    }
    $('#listingRows').innerHTML=MINE.map(s=>
      '<div class="listing-row">'+
        '<div class="lr-thumb">'+(s.img?'<img src="'+s.img+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">':NL.glyph(s.key,24))+'</div>'+
        '<div class="lr-body"><div class="lr-title">'+esc(s.title)+'</div>'+
          '<div class="lr-meta">'+pill(s.status)+'<span>'+NL.fmtUSD(s.usd)+(s.note||'')+'</span>'+(s.views?'<span>'+s.views+' views</span>':'')+'</div>'+
        '</div>'+
        '<div class="lr-actions">'+
          (s.status!=='sold'?'<button data-sold="'+s.id+'" title="Mark as sold">'+di('<path d="M20 6L9 17l-5-5"/>')+'</button>':'<button data-relist="'+s.id+'" title="Relist">'+di('<path d="M3 2v6h6M21 12A9 9 0 0 0 6 5.3L3 8"/>')+'</button>')+
          '<button data-edit="'+s.id+'" title="Edit">'+di('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>')+'</button>'+
          '<button data-del="'+s.id+'" title="Delete">'+di('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14H6L5 6"/>')+'</button>'+
        '</div>'+
      '</div>').join('');
  }

  function renderRequests(){
    const box=$('#reqRows'); if(!box) return;
    if(!CONVOS.length){ box.innerHTML='<div class="empty-state" style="padding:36px 12px;text-align:center"><p class="muted">No requests yet. When someone messages you about a listing, they appear here.</p></div>'; return; }
    box.innerHTML=CONVOS.map(c=>
      '<div class="req-row"><div class="req-av">'+esc((c.with||'?').charAt(0).toUpperCase())+'</div>'+
        '<div style="flex:1;min-width:0"><div class="lr-title">'+esc(c.with||'Buyer')+'</div>'+
          '<div class="lr-meta">'+(c.unread?'<span class="status-pill st-live">'+c.unread+' new</span>':'')+'<span>'+esc(c.listingTitle||'')+'</span><span>'+esc(c.lastTime||'')+'</span></div>'+
          '<div class="muted" style="font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(c.lastMsg||'')+'</div>'+
        '</div>'+
        '<a class="btn btn-ghost btn-sm" href="messages.html?c='+encodeURIComponent(c.id)+'">Open</a></div>'
    ).join('');
  }

  function bindTabs(){
    $('#dashTabs').addEventListener('click',e=>{const b=e.target.closest('.dash-tab');if(!b)return;
      document.querySelectorAll('.dash-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
      document.querySelectorAll('.dash-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===b.dataset.tab));
    });
  }

  async function reload(){
    const r=await NL.api.listings.mine();
    MINE=(r.ok&&r.data)?r.data:[];
    renderListings(); renderStats();
  }
  async function loadRequests(){
    const r=await NL.api.messages.conversations();
    // "Requests" = buyers messaging YOU about your listings — i.e.
    // conversations where you're the seller side. Conversations you
    // started as a buyer (messaging someone else's listing) belong in
    // the regular Messages inbox, not here.
    const all=(r.ok&&r.data)?r.data:[];
    // Mock conversations have no buyer/seller side to filter by — show
    // them all so the offline/dev preview still has demo content.
    CONVOS=NL.sb ? all.filter(c=>c.isSeller) : all;
    renderRequests(); renderStats();
  }

  document.addEventListener('click', async e=>{
    const del=e.target.closest('[data-del]');
    if(del){ if(!confirm('Delete this listing permanently?'))return;
      const r=await NL.api.listings.remove(del.dataset.del);
      NL.toast(r.ok?'Listing deleted':(r.error||'Delete failed'),{type:r.ok?'success':'error'}); if(r.ok) reload(); return; }
    const sold=e.target.closest('[data-sold]');
    if(sold){ const r=await NL.api.listings.setStatus(sold.dataset.sold,'sold');
      NL.toast(r.ok?'Marked as sold ✓':(r.error||'Failed'),{type:r.ok?'success':'error'}); if(r.ok) reload(); return; }
    const relist=e.target.closest('[data-relist]');
    if(relist){ const r=await NL.api.listings.setStatus(relist.dataset.relist,'live');
      NL.toast(r.ok?'Listing is live again':(r.error||'Failed'),{type:r.ok?'success':'error'}); if(r.ok) reload(); return; }
    const ed=e.target.closest('[data-edit]');
    if(ed){
      const it=MINE.find(s=>String(s.id)===ed.dataset.edit); if(!it)return;
      const title=prompt('Edit title:', it.title); if(title===null)return;
      const priceStr=prompt('Edit price (USD):', it.usd); if(priceStr===null)return;
      const usd=parseFloat(priceStr); if(isNaN(usd)||usd<0){NL.toast('Enter a valid price',{type:'error'});return;}
      const r=await NL.api.listings.update(it.id,{title:title.trim()||it.title, usd});
      NL.toast(r.ok?'Listing updated ✓':(r.error||'Update failed'),{type:r.ok?'success':'error'}); if(r.ok) reload();
    }
  });
  document.addEventListener('nl:rate',renderStats);

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('dashboard.html');return}
    bindTabs();
    reload();
    loadRequests();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
