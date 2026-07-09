/* ============================================================
   NILE LINK — core.js
   Path resolution · Auth state · Shared chrome (nav/footer/
   mobile nav/drawer) · Favorites · Toast · Card HTML · Reveal
   Loaded on every page (after data.js + api.js).
   ============================================================ */
window.NL=window.NL||{};
(function(){
  const D=window.NLDATA;

  /* ---- Path root (works at domain root, subpath, or file://) ---- */
  const ROOT=/\/pages\//.test(location.pathname)?'../':'./';
  NL.root=ROOT;
  const href=p=>ROOT+p;

  /* ---- Money helpers ---- */
  const fmtUSD=n=>'$'+Number(n).toLocaleString('en-US');
  const fmtSSP=n=>Number(n).toLocaleString('en-US')+' SSP';
  NL.fmtUSD=fmtUSD;NL.fmtSSP=fmtSSP;
  NL.usdLine=it=>(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'');
  NL.sspLine=it=>'≈ '+fmtSSP(it.usd*NL.getRate())+(it.note||'');
  NL.glyph=(k,s)=>'<svg class="glyph" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(D.ICONS[k]||D.ICONS.services)+'</svg>';

  /* ---- Broken-photo fallback: on flaky connections a listing photo
     can fail to load anywhere on the site (card, gallery, chat). Without
     this, the browser renders the raw alt text over the image box. Swap
     any failed remote <img> to a neutral placeholder graphic instead. ---- */
  const IMG_FALLBACK='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eef1e6"/><g fill="none" stroke="#9aa88c" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="28" width="60" height="44" rx="5"/><circle cx="35" cy="43" r="5.5"/><path d="M20 63l15-15 12 12 11-9 22 22" /></g></svg>');
  document.addEventListener('error',e=>{
    const img=e.target;
    if(!img||img.tagName!=='IMG'||img.dataset.fallback)return;
    if((img.src||'').indexOf('assets/images/')!==-1)return; // trust local site assets
    img.dataset.fallback='1';
    img.src=IMG_FALLBACK;
    img.alt='';
    img.removeAttribute('srcset');
    img.classList.add('img-fallback');
  },true);

  /* ============================================================
     AUTH STATE
     ============================================================ */
  function getUser(){try{return JSON.parse(localStorage.getItem('nl_user')||'null')}catch(e){return null}}
  function setUser(u){localStorage.setItem('nl_user',JSON.stringify(u));applyAuthState();}
  async function signOut(){
    try{ if(window.NL&&NL.sb){ await NL.sb.auth.signOut(); } }catch(_){/* ignore */}
    localStorage.removeItem('nl_user');applyAuthState();location.href=href('index.html');
  }
  NL.getUser=getUser;NL.setUser=setUser;NL.signOut=signOut;
  NL.isAuthed=()=>!!getUser();

  function applyAuthState(){
    const u=getUser();const r=document.documentElement;
    r.classList.toggle('is-authed',!!u);
    r.classList.toggle('is-guest',!u);
    if(u){
      document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent=u.name||'You');
      document.querySelectorAll('[data-user-initials]').forEach(el=>el.textContent=u.initials||'U');
      document.querySelectorAll('[data-user-phone]').forEach(el=>el.textContent=u.phone||'');
      document.querySelectorAll('[data-user-city]').forEach(el=>el.textContent=u.city||'Juba');
    }
  }
  NL.applyAuthState=applyAuthState;
  /* Guard: protected links bounce guests to sign-in with ?next= */
  function guard(e){
    if(getUser())return;
    const t=e.target.closest('[data-auth-required]');if(!t)return;
    e.preventDefault();
    /* all protected pages live in /pages/, so store just the basename (+query) */
    const next=(t.getAttribute('href')||'').split('/').pop();
    location.href=href('pages/signin.html')+(next?'?next='+encodeURIComponent(next):'');
  }

  /* ============================================================
     FAVORITES
     ============================================================ */
  let FAVS=[];try{FAVS=JSON.parse(localStorage.getItem('nl_favs')||'[]').map(Number).filter(Number.isFinite)}catch(e){FAVS=[]}
  const saveFavs=()=>{try{localStorage.setItem('nl_favs',JSON.stringify(FAVS))}catch(e){}};
  NL.isFav=id=>FAVS.includes(+id);
  NL.favs=()=>FAVS.slice();
  NL.toggleFav=id=>{id=+id;const i=FAVS.indexOf(id);if(i>=0)FAVS.splice(i,1);else FAVS.push(id);saveFavs();updateBadges();return i<0;};

  /* ---- Recently viewed ---- */
  NL.pushRecent=id=>{let r=[];try{r=JSON.parse(localStorage.getItem('nl_recent')||'[]')}catch(e){}r=[+id,...r.filter(x=>x!==+id)].slice(0,10);localStorage.setItem('nl_recent',JSON.stringify(r));};
  NL.recent=()=>{try{return JSON.parse(localStorage.getItem('nl_recent')||'[]')}catch(e){return[]}};

  /* ============================================================
     BADGES (saved count, notif/msg dots)
     ============================================================ */
  function paintDot(sel,n){
    document.querySelectorAll(sel).forEach(b=>{if(n){b.textContent=n>99?'99+':n;b.classList.add('show')}else b.classList.remove('show')});
  }
  function updateBadges(){
    paintDot('[data-saved-count]', FAVS.length);
    if(!NL.isAuthed()){ paintDot('[data-notif-dot]',0); paintDot('[data-msg-dot]',0); return; }
    if(window.NL && NL.api && NL.api.notifications){
      NL.api.notifications.unread().then(r=>paintDot('[data-notif-dot]', (r&&r.ok)?r.data:0));
    }
    if(window.NL && NL.api && NL.api.messages){
      NL.api.messages.unreadCount().then(r=>paintDot('[data-msg-dot]', (r&&r.ok)?r.data:0));
    }
  }
  NL.updateBadges=updateBadges;
  // Any page: refresh the nav badges the moment a new message/notification
  // arrives, or a conversation's unread count changes (e.g. read elsewhere).
  document.addEventListener('nl:new-message', updateBadges);
  document.addEventListener('nl:new-notification', updateBadges);
  document.addEventListener('nl:conv-updated', updateBadges);
  document.addEventListener('nl:auth', updateBadges);

  /* ============================================================
     PRODUCT CARD  (kept identical in spirit)
     ============================================================ */
  function cardHTML(it,i){
    const verified=it.badges&&it.badges.includes('verified');
    let topBadge='';
    if(it.badges&&it.badges.includes('feat'))topBadge='<span class="bdg bdg-feat"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.6L21.6 9l-5 4.6 1.4 6.9L12 17.2 6 20.5 7.4 13.6 2.4 9l6.9-.4z"/></svg>Featured</span>';
    else if(it.badges&&it.badges.includes('boost'))topBadge='<span class="bdg bdg-boost" title="The seller paid to promote this listing"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>Sponsored</span>';
    return '<article class="card" data-id="'+it.id+'" data-group="'+it.group+'" style="animation-delay:'+((i||0)*40)+'ms">'+
      '<div class="media">'+topBadge+
        '<button class="fav'+(NL.isFav(it.id)?' on':'')+'" data-fav="'+it.id+'" aria-label="Save"><svg width="16" height="16" viewBox="0 0 24 24" fill="'+(NL.isFav(it.id)?'currentColor':'none')+'" stroke="currentColor" stroke-width="2.2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>'+
        (it.img?'<img src="'+it.img+'" alt="'+it.title+'" class="card-img" loading="lazy">':NL.glyph(it.key,62))+
      '</div>'+
      '<div class="body">'+
        '<div class="ttl" data-i18n-live>'+it.title+'</div>'+
        '<div class="price">'+NL.usdLine(it)+'</div>'+
        '<div class="price-ssp">'+NL.sspLine(it)+'</div>'+
        '<div class="meta"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg><span class="meta-loc" data-i18n-live>'+it.loc+'</span>'+(verified?'<span class="vchip"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Verified</span>':'')+'</div>'+
      '</div>'+
    '</article>';
  }
  NL.cardHTML=cardHTML;
  NL.renderGrid=(el,list)=>{if(!el)return;el.innerHTML=list&&list.length?list.map((it,i)=>cardHTML(it,i)).join(''):'<div class="empty"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><p style="font-weight:600">No listings match — try another category or search.</p></div>';if(window.NLi18n&&NLi18n.getLang()&&NLi18n.getLang()!=='en')document.dispatchEvent(new CustomEvent('nl:translate'));if(window.NLAnim)NLAnim.rescan()};

  /* Shown while a listings fetch is in flight (real backend can be slow
     on weak connections) so the grid never sits blank between page load
     and data arriving. */
  NL.renderSkeleton=(el,count)=>{
    if(!el)return;
    const card='<div class="skel-card"><div class="skel-media"></div><div class="skel-body"><div class="skel-line w90"></div><div class="skel-line w55"></div><div class="skel-meta"></div></div></div>';
    el.innerHTML=card.repeat(count||8);
  };

  /* ============================================================
     TOAST
     ============================================================ */
  let toastWrap;
  const TICONS={
    success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    loading:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.5"/></svg>'
  };
  NL.toast=(msg,opts={})=>{
    if(!toastWrap){toastWrap=document.createElement('div');toastWrap.className='toast-wrap';document.body.appendChild(toastWrap);}
    const type=opts.type||'success';
    const el=document.createElement('div');el.className='toast t-'+type;
    el.innerHTML='<span class="t-ic">'+(TICONS[type]||'')+'</span><span>'+msg+'</span>';
    toastWrap.appendChild(el);
    const dur=opts.duration||(type==='loading'?6000:3000);
    const close=()=>{el.classList.add('out');setTimeout(()=>el.remove(),300)};
    if(type!=='loading')setTimeout(close,dur);
    return close;
  };
  window.showToast=(m,t)=>NL.toast(m,{type:t});

  /* ============================================================
     CHROME — Nav, Drawer, Footer, Mobile nav
     ============================================================ */
  const LOGO_IMG='<img src="'+href('assets/images/logo.png')+'" alt="Nile Link" width="36" height="36">';
  const LOGO_SVG='<svg viewBox="0 0 32 32" fill="none"><path d="M9 7.5v17h3.6V14.3l9.2 10.2h2.6v-17h-3.6v10.2L11.6 7.5z" fill="#7cfc00"/></svg>';
  const SUBCATS={
    electronics:['iPhone','Samsung','Laptops','TVs','Generators','Audio','Cameras','Accessories'],
    fashion:['Men','Women','Kids','Shoes','Bags','Watches','Jewelry','Tailoring'],
    cars:['Toyota','Nissan','Mitsubishi','Motorbikes','Trucks','Parts','Rental','Inspection'],
    property:['For rent','For sale','Land','Apartments','Houses','Commercial','Shared','Short-stay'],
    services:['Photography','Cleaning','Catering','Tutoring','Construction','Beauty','Events','Logistics']
  };
  const CAT_ICONS={
    electronics:'<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/>',
    fashion:'<path d="M8.5 3.5L4.5 6.5L7 9.5L8.5 8.5V21H15.5V8.5L17 9.5L19.5 6.5L15.5 3.5"/>',
    cars:'<path d="M3.5 16V11.5L5.4 7.5C5.7 6.7 6.5 6.2 7.3 6.2H16.7C17.5 6.2 18.3 6.7 18.6 7.5L20.5 11.5V16"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    property:'<path d="M3.5 11L12 3.5L20.5 11"/><path d="M5.5 9.5V20H18.5V9.5"/>',
    services:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.9-5.9a3.5 3.5 0 0 0 4.8-4.8l-2.5 2.5-1.5-1.5z"/>'
  };
  function megaHTML(){
    const labels={electronics:'Electronics',fashion:'Fashion',cars:'Cars',property:'Property',services:'Services'};
    const cols=Object.keys(SUBCATS).map(k=>
      '<div class="mega-col"><h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+CAT_ICONS[k]+'</svg>'+labels[k]+'</h5>'+
        SUBCATS[k].map(s=>'<a href="'+href('pages/browse.html')+'?cat='+k+'&q='+encodeURIComponent(s)+'">'+s+'</a>').join('')+
      '</div>'
    ).join('');
    return '<div class="mega"><div class="mega-inner">'+cols+'</div><div class="mega-foot"><a href="'+href('pages/browse.html')+'">See all categories <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div>';
  }

  function navHTML(){
    return '<nav class="nav" id="nlNav"><div class="nav-inner">'+
      '<a class="nav-logo" href="'+href('index.html')+'"><span class="nav-logo-mark">'+LOGO_IMG+'</span><span class="nav-logo-txt">Nile<b>Link</b></span></a>'+
      '<div class="nav-links">'+
        '<div class="has-mega"><button type="button">Categories <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>'+megaHTML()+'</div>'+
        '<a data-nav="browse" href="'+href('pages/browse.html')+'">Browse</a>'+
        '<a data-nav="pricing" href="'+href('pages/pricing.html')+'">Pricing</a>'+
        '<a data-nav="about" href="'+href('pages/about.html')+'">About</a>'+
        '<a data-nav="help" href="'+href('pages/help.html')+'">Help</a>'+
      '</div>'+
      '<div class="nav-right">'+
        '<a class="btn btn-lime btn-sm nav-sell" href="'+href('pages/post.html')+'" data-auth-required><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Sell</a>'+
        '<a class="icon-btn auth-only" href="'+href('pages/saved.html')+'" aria-label="Saved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg><span class="icon-dot" data-saved-count></span></a>'+
        '<a class="icon-btn auth-only" href="'+href('pages/notifications.html')+'" aria-label="Notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg><span class="icon-dot" data-notif-dot></span></a>'+
        '<a class="icon-btn auth-only" href="'+href('pages/messages.html')+'" aria-label="Messages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="icon-dot" data-msg-dot></span></a>'+
        '<button type="button" class="nav-avatar auth-only" data-drawer-open data-user-initials aria-label="Account menu">U</button>'+
        '<a class="btn btn-ghost btn-sm guest-only" href="'+href('pages/signin.html')+'">Sign in</a>'+
        '<a class="btn btn-primary btn-sm guest-only" href="'+href('pages/signup.html')+'">Register</a>'+
        '<button class="icon-btn nav-burger" data-drawer-open aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'+
      '</div>'+
    '</div></nav>';
  }

  function drawerHTML(){
    const dic=(p)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
    return '<div class="drawer-scrim" data-drawer-close></div>'+
    '<aside class="drawer" id="nlDrawer">'+
      '<div class="drawer-head">'+
        '<div class="drawer-user">'+
          '<span class="drawer-av auth-only" data-user-initials>U</span>'+
          '<span class="nav-logo-mark guest-only">'+LOGO_IMG+'</span>'+
          '<div><div style="font-weight:800" class="auth-only" data-user-name>You</div><div style="font-weight:800" class="guest-only">Welcome</div><div class="muted" style="font-size:.8rem">South Sudan\'s Marketplace</div></div>'+
        '</div>'+
        '<button class="icon-btn" data-drawer-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
      '</div>'+
      '<div class="drawer-tiles">'+
        '<a class="drawer-tile lime" href="'+href('pages/post.html')+'" data-auth-required>'+dic('<path d="M12 5v14M5 12h14"/>')+'Sell an item</a>'+
        '<a class="drawer-tile" href="'+href('pages/browse.html')+'">'+dic('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>')+'Browse</a>'+
        '<a class="drawer-tile" href="'+href('pages/saved.html')+'" data-auth-required>'+dic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>')+'Saved</a>'+
        '<a class="drawer-tile" href="'+href('pages/messages.html')+'" data-auth-required>'+dic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>')+'Messages</a>'+
      '</div>'+
      '<div class="drawer-rows">'+
        '<a class="drawer-row" href="'+href('pages/dashboard.html')+'" data-auth-required><span class="dr-ic" style="background:#eef2e7;color:#4d7c0f">'+dic('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>')+'</span>Dashboard</a>'+
        '<a class="drawer-row" href="'+href('pages/notifications.html')+'" data-auth-required><span class="dr-ic" style="background:#fdeee0;color:#ea580c">'+dic('<path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/>')+'</span>Notifications</a>'+
        '<a class="drawer-row" href="'+href('pages/pricing.html')+'"><span class="dr-ic" style="background:#e7eefb;color:#3b82f6">'+dic('<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>')+'</span>Pricing & Boost</a>'+
        '<a class="drawer-row" href="'+href('pages/about.html')+'"><span class="dr-ic" style="background:#e7f7ed;color:#19a974">'+dic('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>')+'</span>About Nile Link</a>'+
        '<a class="drawer-row" href="'+href('pages/help.html')+'"><span class="dr-ic" style="background:#f0e9fb;color:#7c3aed">'+dic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01"/>')+'</span>Help Center</a>'+
      '</div>'+
      '<div class="drawer-legal">'+
        '<span class="dl-label">Legal</span>'+
        '<a href="'+href('pages/terms.html')+'">Terms &amp; Conditions</a>'+
        '<a href="'+href('pages/privacy.html')+'">Privacy Policy</a>'+
        '<a href="'+href('pages/cookies.html')+'">Cookie Policy</a>'+
      '</div>'+
      '<div class="drawer-foot">'+
        '<div class="guest-only" style="display:flex;gap:10px"><a class="btn btn-ghost btn-block" href="'+href('pages/signin.html')+'">Sign in</a><a class="btn btn-primary btn-block" href="'+href('pages/signup.html')+'">Register</a></div>'+
        '<button class="btn btn-ghost btn-block auth-only" data-signout>Sign out</button>'+
      '</div>'+
    '</aside>';
  }

  function footerHTML(){
    const so=(p)=>'<svg viewBox="0 0 24 24" fill="currentColor">'+p+'</svg>';
    const FOOT_LOGO='<img src="'+href('assets/images/logo.png')+'" alt="Nile Link" width="36" height="36" style="border-radius:8px;background:#fff;padding:4px">';
    return '<section class="foot-news"><span class="fade-edge fade-top fade-from-bg"></span><div class="foot-news-inner">'+
        '<div><h3>Never miss a deal</h3><p>Get notified when new listings drop in your favourite categories.</p></div>'+
        '<form class="foot-news-form" data-news-form><input type="email" placeholder="Your email address" required aria-label="Email"><button class="btn btn-lime" type="submit">Subscribe</button></form>'+
      '</div></section>'+
    '<footer class="foot"><div class="foot-grid">'+
      '<div class="foot-brand">'+
        '<div class="foot-logo"><span class="foot-logo-mark">'+FOOT_LOGO+'</span><span class="foot-logo-txt">Nile<b>Link</b></span></div>'+
        '<p class="foot-tag">South Sudan\'s marketplace for phones, cars, property, fashion & services. Buy and sell with confidence.</p>'+
        '<div class="foot-social">'+
          '<a href="#" aria-label="Facebook">'+so('<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9z"/>')+'</a>'+
          '<a href="#" aria-label="Instagram">'+so('<path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9C2.4 3.9 4 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.9A4.9 4.9 0 1 0 12 17a4.9 4.9 0 0 0 0-9.8zm0 8.1A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm5.1-8.3a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3z"/>')+'</a>'+
          '<a href="#" aria-label="WhatsApp">'+so('<path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2 0-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c.6.3 1.1.4 1.5.5a3.5 3.5 0 0 0 1.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z"/>')+'</a>'+
          '<a href="#" aria-label="TikTok">'+so('<path d="M16 3c.3 2 1.6 3.6 3.6 3.9v2.8c-1.3 0-2.5-.4-3.6-1.1v5.8a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.9a2.7 2.7 0 1 0 1.9 2.6V3H16z"/>')+'</a>'+
        '</div>'+
      '</div>'+
      '<div class="foot-col"><h4>Browse</h4>'+
        '<a href="'+href('pages/browse.html')+'?cat=electronics">Phones & Electronics</a>'+
        '<a href="'+href('pages/browse.html')+'?cat=cars">Cars & Motorbikes</a>'+
        '<a href="'+href('pages/browse.html')+'?cat=property">Property & Land</a>'+
        '<a href="'+href('pages/browse.html')+'?cat=fashion">Fashion & Beauty</a>'+
        '<a href="'+href('pages/browse.html')+'?cat=services">Services</a>'+
      '</div>'+
      '<div class="foot-col"><h4>Company</h4>'+
        '<a href="'+href('pages/about.html')+'">About Us</a>'+
        '<a href="'+href('pages/sell-guide.html')+'">How to Sell</a>'+
        '<a href="'+href('pages/pricing.html')+'">Pricing</a>'+
        '<a href="'+href('pages/about.html')+'#careers">Careers</a>'+
        '<a href="'+href('pages/help.html')+'">Contact</a>'+
      '</div>'+
      '<div class="foot-col"><h4>Support</h4>'+
        '<a href="'+href('pages/help.html')+'">Help Center</a>'+
        '<a href="'+href('pages/help.html')+'#safety">Safety Tips</a>'+
        '<a href="'+href('pages/help.html')+'#report">Report a Listing</a>'+
        '<a href="'+href('pages/terms.html')+'">Terms &amp; Conditions</a>'+
        '<a href="'+href('pages/privacy.html')+'">Privacy Policy</a>'+
        '<a href="'+href('pages/cookies.html')+'">Cookie Policy</a>'+
      '</div>'+
    '</div>'+
    '<div class="foot-bottom"><div class="foot-flag"></div><div class="foot-bottom-inner">'+
      '<span>© '+new Date().getFullYear()+' Nile Link. Made in South Sudan 🇸🇸</span>'+
      '<button class="foot-lang-btn" data-open-lang><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg><span data-no-translate>Language · العربية · Thuɔŋjäŋ</span></button>'+
    '</div></div></footer>';
  }

  function mobNavHTML(){
    const ic=(p)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
    return '<nav class="mob-nav">'+
      '<a data-nav="home" href="'+href('index.html')+'">'+ic('<path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/>')+'Home</a>'+
      '<a data-nav="browse" href="'+href('pages/browse.html')+'">'+ic('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>')+'Browse</a>'+
      '<div class="mob-fab"><a class="fab-btn" href="'+href('pages/post.html')+'" data-auth-required aria-label="Sell">'+ic('<path d="M12 5v14M5 12h14"/>')+'</a><span>Sell</span></div>'+
      '<a data-nav="saved" href="'+href('pages/saved.html')+'" data-auth-required>'+ic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>')+'Saved<span class="icon-dot" data-saved-count></span></a>'+
      '<a data-nav="account" href="'+(getUser()?href('pages/dashboard.html'):href('pages/signin.html'))+'">'+ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>')+'Account</a>'+
    '</nav>';
  }

  function mountChrome(){
    const navMount=document.querySelector('[data-nl-nav]');if(navMount)navMount.innerHTML=navHTML();
    /* Drawer is position:fixed → mount on <body>, outside .app-shell's transform
       containing block, so it always anchors to the viewport. */
    if(navMount&&!document.getElementById('nlDrawer')){const w=document.createElement('div');w.innerHTML=drawerHTML();while(w.firstChild)document.body.appendChild(w.firstChild);}
    const footMount=document.querySelector('[data-nl-footer]');if(footMount)footMount.innerHTML=footerHTML();
    if(document.querySelector('[data-nl-mobnav]')!==null||document.body.classList.contains('has-mobnav')){
      const m=document.querySelector('[data-nl-mobnav]');
      if(m)m.innerHTML=mobNavHTML();
    }
    // active states
    const page=document.body.dataset.page;
    if(page)document.querySelectorAll('[data-nav="'+page+'"]').forEach(a=>a.classList.add('active'));
  }

  /* ---- Drawer open/close ---- */
  function bindDrawer(){
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-drawer-open]')){const d=document.getElementById('nlDrawer');const s=document.querySelector('.drawer-scrim');if(d)d.classList.add('open');if(s)s.classList.add('open');document.body.style.overflow='hidden';}
      if(e.target.closest('[data-drawer-close]')){const d=document.getElementById('nlDrawer');const s=document.querySelector('.drawer-scrim');if(d)d.classList.remove('open');if(s)s.classList.remove('open');document.body.style.overflow='';}
      if(e.target.closest('[data-signout]')){signOut();}
    });
  }

  /* ============================================================
     GLOBAL CLICK HANDLERS  (fav toggle, card → listing, guard)
     ============================================================ */
  function bindGlobal(){
    document.addEventListener('click',e=>{
      guard(e);
      const fav=e.target.closest('[data-fav]');
      if(fav){e.preventDefault();e.stopPropagation();const id=fav.dataset.fav;const on=NL.toggleFav(id);fav.classList.toggle('on',on);const s=fav.querySelector('svg');if(s){s.setAttribute('fill',on?'currentColor':'none');s.classList.add('pop');setTimeout(()=>s.classList.remove('pop'),300)}NL.toast(on?'Saved to your list':'Removed from saved',{type:on?'success':'info',duration:1500});return}
      const card=e.target.closest('.card[data-id]');
      if(card&&!e.target.closest('a')){location.href=href('pages/listing.html')+'?id='+card.dataset.id;}
    });
    // newsletter
    document.addEventListener('submit',e=>{const f=e.target.closest('[data-news-form]');if(f){e.preventDefault();f.reset();NL.toast('You\'re subscribed! 🎉',{type:'success'})}});
    // language: open the picker (managed by i18n.js)
    document.addEventListener('click',e=>{if(e.target.closest('[data-open-lang]')&&window.NLi18n)NLi18n.openPicker()});
    // nav scroll shadow
    const nav=()=>document.getElementById('nlNav');
    window.addEventListener('scroll',()=>{const n=nav();if(n)n.classList.toggle('scrolled',window.scrollY>8)},{passive:true});
  }

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  function bindReveal(){
    const els=document.querySelectorAll('.reveal,[data-reveal-root]');
    if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('in'));return}
    const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    els.forEach(e=>io.observe(e));
  }
  NL.bindReveal=bindReveal;

  /* ============================================================
     COUNT-UP (stats)
     ============================================================ */
  NL.countUp=(el)=>{
    const target=parseFloat(el.dataset.count);const suffix=el.dataset.suffix||'';const prefix=el.dataset.prefix||'';
    const dur=1600,t0=performance.now();
    (function step(now){const t=Math.min((now-t0)/dur,1),e=1-Math.pow(1-t,3);const v=Math.round(target*e);el.textContent=prefix+v.toLocaleString('en-US')+suffix;if(t<1)requestAnimationFrame(step)})(t0);
  };

  /* ============================================================
     BOOT
     ============================================================ */
  function boot(){
    applyAuthState();
    mountChrome();
    applyAuthState();      // re-apply after chrome injected
    updateBadges();
    bindDrawer();
    bindGlobal();
    bindReveal();
    document.addEventListener('nl:rate',()=>{document.dispatchEvent(new CustomEvent('nl:rate-applied'))});
    mountCookieBanner();
    registerSW();
  }

  /* ---- Cookie consent banner ----
     The site only uses essential local storage (session, language, saved
     items) plus Google Fonts and Google sign-in. There is no ad/analytics
     tracking, so this is a straightforward accept/decline notice with a
     link to the full Cookie Policy. The choice is remembered on-device. ---- */
  function mountCookieBanner(){
    try{ if(localStorage.getItem('nl_cookie_consent')) return; }catch(e){ return; }
    if(document.getElementById('nlCookie')) return;
    const to=href('pages/cookies.html');
    const el=document.createElement('div');
    el.id='nlCookie';
    el.className='cookie-bar';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-label','Cookie notice');
    el.innerHTML=
      '<div class="cookie-bar-in">'+
        '<div class="cookie-txt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="9" cy="12" r="1"/><circle cx="14" cy="15" r="1"/><circle cx="15" cy="9" r="1"/></svg>'+
          '<span>We use essential cookies and local storage to keep you signed in and remember your preferences. See our <a href="'+to+'">Cookie Policy</a>.</span></div>'+
        '<div class="cookie-btns">'+
          '<button type="button" class="cookie-decline" data-cookie="declined">Decline</button>'+
          '<button type="button" class="btn btn-lime cookie-accept" data-cookie="accepted">Accept</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    el.addEventListener('click',e=>{
      const b=e.target.closest('[data-cookie]'); if(!b) return;
      try{ localStorage.setItem('nl_cookie_consent',b.dataset.cookie); localStorage.setItem('nl_cookie_consent_at',new Date().toISOString()); }catch(_){}
      el.classList.remove('show');
      setTimeout(()=>el.remove(),320);
    });
  }
  NL.reopenCookieSettings=function(){ try{localStorage.removeItem('nl_cookie_consent');}catch(e){} mountCookieBanner(); };

  /* ---- Offline / PWA service worker (real caching; safe, versioned) ---- */
  function registerSW(){
    if(!('serviceWorker' in navigator)) return;
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register(ROOT+'sw.js').catch(()=>{/* non-fatal */});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
