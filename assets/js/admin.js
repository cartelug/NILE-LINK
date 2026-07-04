/* ============================================================
   NILE LINK — admin.js
   Key-gated moderation dashboard. Every action calls the
   nl_admin() SECURITY DEFINER RPC (see supabase/04_admin.sql),
   which re-verifies the secret admin key server-side. The key
   lives only in sessionStorage for this tab.
   ============================================================ */
(function(){
  const $=s=>document.querySelector(s);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEYNAME='nl_admin_key';
  let KEY=sessionStorage.getItem(KEYNAME)||'';

  function ready(){
    return new Promise(res=>{
      if(NL.sb) return res(true);
      if(document.documentElement.dataset.nlBackend!=='live') return res(false);
      document.addEventListener('nl:sb-ready',()=>res(!!NL.sb),{once:true});
      setTimeout(()=>res(!!NL.sb),8000);
    });
  }

  async function call(action, payload){
    if(!(await ready()) || !NL.sb) return {ok:false,error:'Backend not ready'};
    const { data, error } = await NL.sb.rpc('nl_admin', { p_key: KEY, p_action: action, p_payload: payload||{} });
    if(error) return {ok:false, error:error.message};
    return data; // { ok, data } | { ok:false, error }
  }

  /* ---------- GATE ---------- */
  function showGate(msg){
    $('#adminApp').style.display='none';
    $('#adminGate').style.display='flex';
    if(msg) $('#gateErr').textContent=msg;
    const inp=$('#gateKey'); inp.value=''; inp.focus();
  }
  async function tryUnlock(k){
    KEY=k;
    const r=await call('stats');
    if(r && r.ok){
      sessionStorage.setItem(KEYNAME,KEY);
      $('#adminGate').style.display='none';
      $('#adminApp').style.display='block';
      renderStats(r.data);
      loadTab('listings');
    }else{
      sessionStorage.removeItem(KEYNAME);
      showGate((r&&r.error)||'Invalid admin key');
    }
  }

  /* ---------- STATS ---------- */
  function renderStats(s){
    if(!s) return;
    $('#stats').innerHTML=[
      ['Live listings',s.listings_live,'live'],
      ['Removed',s.listings_removed,'muted'],
      ['Open reports',s.reports_open, s.reports_open>0?'warn':'muted'],
      ['Sellers',s.sellers,'muted'],
      ['Verified',s.sellers_verified,'live']
    ].map(([k,v,c])=>`<div class="stat ${c}"><div class="v">${esc(v)}</div><div class="k">${esc(k)}</div></div>`).join('');
  }
  async function refreshStats(){ const r=await call('stats'); if(r&&r.ok) renderStats(r.data); }

  /* ---------- TABS ---------- */
  let TAB='listings';
  function loadTab(tab){
    TAB=tab;
    document.querySelectorAll('.atab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
    $('#tabBody').innerHTML='<div class="loading">Loading…</div>';
    if(tab==='listings') loadListings();
    else if(tab==='reports') loadReports();
    else if(tab==='sellers') loadSellers();
  }

  async function loadListings(){
    const r=await call('listings');
    if(!r||!r.ok){ $('#tabBody').innerHTML=`<div class="err">${esc((r&&r.error)||'Failed')}</div>`; return; }
    const rows=(r.data||[]).map(l=>`
      <tr>
        <td><b>${esc(l.title)}</b><div class="sub">${esc(l.cat)} · ${esc(l.loc||'')}</div></td>
        <td>${esc(l.seller_name||'—')}${l.seller_verified?' <span class="chip ok">✓</span>':''}</td>
        <td class="num">$${esc(Number(l.usd).toLocaleString('en-US'))}</td>
        <td><span class="chip ${l.status==='live'?'ok':(l.status==='removed'?'bad':'muted')}">${esc(l.status)}</span></td>
        <td class="right">${
          l.status==='removed'
          ? `<button class="mini" data-act="restore_listing" data-id="${esc(l.id)}">Restore</button>`
          : `<button class="mini danger" data-act="remove_listing" data-id="${esc(l.id)}">Remove</button>`
        }</td>
      </tr>`).join('');
    $('#tabBody').innerHTML=table(['Listing','Seller','Price','Status',''], rows, (r.data||[]).length, 'No listings yet.');
  }

  async function loadReports(){
    const r=await call('reports');
    if(!r||!r.ok){ $('#tabBody').innerHTML=`<div class="err">${esc((r&&r.error)||'Failed')}</div>`; return; }
    const rows=(r.data||[]).map(x=>`
      <tr>
        <td><b>${esc(x.listing_title||('Listing #'+x.listing_id))}</b>${x.listing_id?` <a class="lnk" href="listing.html?id=${esc(x.listing_id)}" target="_blank">view</a>`:''}</td>
        <td>${esc(x.reason)}</td>
        <td><span class="chip ${x.status==='open'?'warn':'muted'}">${esc(x.status)}</span></td>
        <td class="right">${
          x.status==='open'
          ? `<button class="mini" data-act="resolve_report" data-id="${esc(x.id)}" data-status="resolved">Resolve</button>
             <button class="mini" data-act="resolve_report" data-id="${esc(x.id)}" data-status="dismissed">Dismiss</button>`
          : '—'
        }</td>
      </tr>`).join('');
    $('#tabBody').innerHTML=table(['Listing','Reason','Status',''], rows, (r.data||[]).length, 'No reports — all clear. 🎉');
  }

  async function loadSellers(){
    const r=await call('sellers');
    if(!r||!r.ok){ $('#tabBody').innerHTML=`<div class="err">${esc((r&&r.error)||'Failed')}</div>`; return; }
    const rows=(r.data||[]).map(p=>`
      <tr>
        <td><b>${esc(p.name||'—')}</b><div class="sub">${esc(p.city||'')} · ${esc(p.role||'')}</div></td>
        <td>${esc(p.phone||p.email||'—')}</td>
        <td class="num">${esc(p.listing_count||0)}</td>
        <td>${p.verified?'<span class="chip ok">Verified</span>':'<span class="chip muted">No</span>'}</td>
        <td class="right">
          <button class="mini" data-act="set_verified" data-id="${esc(p.id)}" data-verified="${p.verified?'false':'true'}">
            ${p.verified?'Unverify':'Verify'}
          </button>
        </td>
      </tr>`).join('');
    $('#tabBody').innerHTML=table(['Seller','Contact','Listings','Verified',''], rows, (r.data||[]).length, 'No sellers yet.');
  }

  function table(heads, rows, count, empty){
    if(!count) return `<div class="empty">${esc(empty)}</div>`;
    return `<div class="tblwrap"><table class="atbl"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  /* ---------- ACTIONS ---------- */
  document.addEventListener('click', async e=>{
    const b=e.target.closest('[data-act]'); if(!b) return;
    const act=b.dataset.act;
    const payload={};
    if(b.dataset.id) payload.id=b.dataset.id;
    if(b.dataset.status) payload.status=b.dataset.status;
    if(b.dataset.verified) payload.verified=b.dataset.verified;
    if(act==='remove_listing' && !confirm('Remove this listing from the marketplace?')) return;
    b.disabled=true; b.textContent='…';
    const r=await call(act, payload);
    if(r&&r.ok){ NL.toast&&NL.toast('Done',{type:'success'}); loadTab(TAB); refreshStats(); }
    else { NL.toast&&NL.toast((r&&r.error)||'Action failed',{type:'error'}); b.disabled=false; }
  });

  /* ---------- INIT ---------- */
  function init(){
    document.querySelectorAll('.atab').forEach(b=>b.addEventListener('click',()=>loadTab(b.dataset.tab)));
    $('#gateForm').addEventListener('submit',e=>{e.preventDefault();const k=$('#gateKey').value.trim();if(k)tryUnlock(k);});
    $('#refreshBtn').addEventListener('click',()=>{loadTab(TAB);refreshStats();});
    $('#lockBtn').addEventListener('click',()=>{sessionStorage.removeItem(KEYNAME);KEY='';showGate('');});
    if(KEY) tryUnlock(KEY); else showGate('');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
