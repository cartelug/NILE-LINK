/* ============================================================
   NILE LINK — home.js  (home page only)
   ============================================================ */
(function(){
  const D=window.NLDATA;
  const $=s=>document.querySelector(s);
  const root=NL.root;

  /* ---- Categories ---- */
  function renderCats(){
    const el=$('#catGrid');if(!el)return;
    el.innerHTML=D.CATEGORIES.map(c=>
      '<a class="cat-card cat-'+c.key+'" href="'+root+'pages/browse.html?cat='+c.key+'">'+
        '<span class="cat-badge">'+c.count.replace(/ .*/,'')+'</span>'+
        '<span class="cat-ic">'+NL.glyph(c.key,26)+'</span>'+
        '<span><span class="cat-name">'+c.short+'</span><span class="cat-count" style="display:block">'+c.count+'</span></span>'+
      '</a>').join('')+
      '<a class="cat-card" style="--cg:linear-gradient(140deg,#11160d,#0a0e08)" href="'+root+'pages/browse.html">'+
        '<span class="cat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>'+
        '<span><span class="cat-name">All categories</span><span class="cat-count" style="display:block">Browse everything</span></span>'+
      '</a>';
  }

  /* ---- Featured grid + tabs ---- */
  let filter='all';
  function renderGrid(){
    NL.api.listings.list({group:filter}).then(r=>NL.renderGrid($('#homeGrid'),r.data));
    // update "See all" links contextually
    document.querySelectorAll('.sec-link[data-see-all]').forEach(a=>{a.href=root+'pages/browse.html'+(filter!=='all'?'?group='+filter:'')});
  }
  function bindTabs(){
    $('#homeTabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(!t)return;document.querySelectorAll('#homeTabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');filter=t.dataset.filter;renderGrid()});
  }

  /* ---- Recently viewed ---- */
  function renderRecent(){
    const ids=NL.recent();if(!ids.length)return;
    const items=ids.map(id=>D.LISTINGS.find(l=>l.id===+id)).filter(Boolean);
    if(!items.length)return;
    $('#recentSec').style.display='';
    $('#recentRail').innerHTML=items.map((it,i)=>NL.cardHTML(it,i)).join('');
  }

  /* ---- How it works ---- */
  const STEP_ICONS={
    buy:[
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/><path d="M11 8v3l2 1.5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="M9 12h6"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'
    ],
    sell:[
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5L5 21"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
    ]
  };
  const STEPS={
    buy:[{h:'Search & discover',p:'Filter by category, location and price across phones, cars, property, fashion and services.'},{h:'Message or order',p:'Tap to chat securely or place an order. Your details stay safe inside Nile Link.'},{h:'Close with confidence',p:'Verified sellers confirm, arrange delivery or viewing, and you close the deal.'}],
    sell:[{h:'Post in minutes',p:'Add photos, price, location and category — or save a draft and finish later.'},{h:'Get real requests',p:'Receive orders and messages from serious buyers, organised in your dashboard.'},{h:'Grow & get paid',p:'Boost listings, earn a verified badge, and close more deals every week.'}]
  };
  function renderSteps(m){
    const ic=STEP_ICONS[m]||STEP_ICONS.buy;
    $('#howSteps').innerHTML=STEPS[m].map((s,i)=>
      '<div class="how-step reveal" data-d="'+(i+1)+'">'+
        '<div class="how-step-top"><div class="how-num">'+(i+1)+'</div>'+(i<2?'<span class="how-line"></span>':'')+'</div>'+
        '<div class="how-screen">'+ic[i]+'</div>'+
        '<h3>'+s.h+'</h3><p>'+s.p+'</p>'+
      '</div>').join('');
    NL.bindReveal();
  }
  function bindHow(){
    $('#howToggle').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#howToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSteps(b.dataset.mode)});
  }

  /* ---- Testimonials ---- */
  function renderTst(){
    const star='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.6L21.6 9l-5 4.6 1.4 6.9L12 17.2 6 20.5 7.4 13.6 2.4 9l6.9-.4z"/></svg>';
    $('#tstGrid').innerHTML=D.TESTIMONIALS.map(t=>
      '<div class="tst-card reveal">'+
        '<div class="tst-stars">'+star.repeat(t.stars)+'</div>'+
        '<p class="tst-quote">"'+t.quote+'"</p>'+
        '<div class="tst-who"><span class="tst-av" style="background:'+t.bg+'">'+t.av+'</span><div><div class="tst-name">'+t.name+'</div><div class="tst-role">'+t.role+'</div></div></div>'+
      '</div>').join('');
    NL.bindReveal();
  }

  /* ---- Stats count-up ---- */
  function bindStats(){
    const sec=$('#stats');if(!sec)return;
    const io=new IntersectionObserver((es)=>{es.forEach(en=>{if(en.isIntersecting){sec.querySelectorAll('[data-count]').forEach(NL.countUp);io.disconnect()}})},{threshold:.4});
    io.observe(sec);
  }

  /* ---- Search ---- */
  function goSearch(q){location.href=root+'pages/browse.html'+(q?'?q='+encodeURIComponent(q):'')}
  function buildSuggestions(q){
    q=(q||'').trim().toLowerCase();if(!q)return[];
    const out=[];
    D.CATEGORIES.forEach(c=>{if(c.name.toLowerCase().includes(q))out.push({type:'cat',data:c})});
    D.LISTINGS.forEach(l=>{if((l.title+' '+l.cat+' '+l.seller+' '+l.loc).toLowerCase().includes(q))out.push({type:'item',data:l})});
    return out.slice(0,7);
  }
  function renderDropdown(input,dd){
    const q=input.value;const items=buildSuggestions(q);
    if(!q.trim()){dd.classList.remove('show');return}
    if(!items.length){dd.innerHTML='<div class="sd-empty">No matches for "<b>'+q.replace(/[<>]/g,'')+'</b>"<div class="sd-empty-sub">Try another word or browse all listings.</div></div>';dd.classList.add('show');return}
    const arrow='<svg class="sd-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    dd.innerHTML=items.map(s=>{
      if(s.type==='cat')return '<a class="sd-item" href="'+root+'pages/browse.html?cat='+s.data.key+'"><div class="sd-thumb">'+NL.glyph(s.data.key,22)+'</div><div class="sd-info"><div class="sd-ttl">'+s.data.name+'</div><div class="sd-meta">Browse category · '+s.data.count+'</div></div>'+arrow+'</a>';
      const it=s.data;
      return '<a class="sd-item" href="'+root+'pages/listing.html?id='+it.id+'"><div class="sd-thumb">'+(it.img?'<img src="'+it.img+'" alt="" loading="lazy">':NL.glyph(it.key,22))+'</div><div class="sd-info"><div class="sd-ttl">'+it.title+'</div><div class="sd-meta">'+it.cat+' · <b>'+(it.from?'From ':'')+NL.fmtUSD(it.usd)+(it.note||'')+'</b></div></div>'+arrow+'</a>';
    }).join('')+'<a class="sd-item sd-all" href="'+root+'pages/browse.html?q='+encodeURIComponent(q)+'"><div class="sd-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></div><div class="sd-info"><div class="sd-ttl">See all results for "'+q.replace(/[<>]/g,'')+'"</div></div></a>';
    dd.classList.add('show');
  }
  function bindSearch(){
    const input=$('#heroSearch'),dd=$('#heroSearchDropdown'),btn=$('#heroSearchBtn');
    btn.addEventListener('click',()=>goSearch(input.value));
    input.addEventListener('keydown',e=>{if(e.key==='Enter')goSearch(input.value);if(e.key==='Escape'){dd.classList.remove('show');input.blur()}});
    let t;input.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>renderDropdown(input,dd),80)});
    input.addEventListener('focus',()=>{if(input.value.trim())renderDropdown(input,dd)});
    document.addEventListener('click',e=>{if(!input.contains(e.target)&&!dd.contains(e.target))dd.classList.remove('show')});
    // rotating placeholder
    const words=['phones, cars, land…','an iPhone 13 Pro','a Land Cruiser','a house to rent','a wedding photographer','Ankara fabric'];let wi=0;
    setInterval(()=>{if(document.activeElement===input||input.value)return;wi=(wi+1)%words.length;input.placeholder='Search '+words[wi]},2600);
  }

  /* ---- Hero lead word-by-word reveal ---- */
  function animateLead(){
    const el=$('#heroLead');if(!el)return;
    const text=el.textContent;
    el.innerHTML=text.split(/(\s+)/).map((w,i)=>w.trim()?'<span class="w" style="animation-delay:'+(i*60+700)+'ms">'+w+'</span>':' ').join('');
  }
  /* ---- Stat-card reveal triggers ring + count-up ---- */
  function bindStatCards(){
    if(!('IntersectionObserver'in window))return;
    const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.25});
    document.querySelectorAll('.stat-card').forEach(c=>io.observe(c));
  }

  /* ---- Init ---- */
  function init(){
    animateLead();
    renderCats();renderGrid();bindTabs();renderRecent();
    renderSteps('buy');bindHow();renderTst();bindStats();bindStatCards();bindSearch();
    document.addEventListener('nl:rate',renderGrid);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
