(function(){
  var pl=document.getElementById('preloader');
  if(!pl) return;
  var start=Date.now();
  var MIN=2900;  // always show the full ring-reveal animation, even on fast networks
  var CAP=5000;  // absolute safety cap so it never gets stuck
  var hidden=false;
  var hide=function(){if(hidden) return;hidden=true;pl.classList.add('done');setTimeout(function(){if(pl.parentNode)pl.remove();},700);};
  var schedule=function(){setTimeout(hide,Math.max(MIN-(Date.now()-start),0));};
  if(document.readyState==='complete'){schedule();}
  else{window.addEventListener('load',schedule);}
  setTimeout(hide,CAP);
})();
const ICONS={
  electronics:'<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/><path d="M9.5 5h5"/>',
  fashion:'<path d="M8.5 3.5L4.5 6.5L7 9.5L8.5 8.5V21H15.5V8.5L17 9.5L19.5 6.5L15.5 3.5"/><path d="M9.5 3.5C9.5 5.2 10.6 6.5 12 6.5C13.4 6.5 14.5 5.2 14.5 3.5"/>',
  cars:'<path d="M3.5 16V11.5L5.4 7.5C5.7 6.7 6.5 6.2 7.3 6.2H16.7C17.5 6.2 18.3 6.7 18.6 7.5L20.5 11.5V16"/><path d="M3.5 11.5H20.5"/><path d="M6.5 16V18H4.5V16"/><path d="M19.5 16V18H17.5V16"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3"/>',
  property:'<path d="M3.5 11L12 3.5L20.5 11"/><path d="M5.5 9.5V20H18.5V9.5"/><path d="M10 20V14.5H14V20"/><path d="M15 12.5H16.5"/>',
  services:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.9-5.9a3.5 3.5 0 0 0 4.8-4.8l-2.5 2.5-1.5-1.5z"/><circle cx="15.5" cy="8.5" r=".7"/>'
};
function glyph(k,s){return '<svg class="glyph" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[k]||ICONS.services)+'</svg>'}
let RATE=4585;
async function fetchLiveRate(){
  const sources=[
    {url:'https://open.er-api.com/v6/latest/USD',pick:d=>d&&d.rates&&d.rates.SSP},
    {url:'https://api.exchangerate.host/latest?base=USD&symbols=SSP',pick:d=>d&&d.rates&&d.rates.SSP}
  ];
  for(const s of sources){
    try{
      const r=await fetch(s.url,{cache:'no-store'});if(!r.ok)continue;
      const d=await r.json();const v=s.pick(d);
      if(v&&v>500&&v<50000){
        const newRate=Math.round(v);
        animateRate(newRate);
        if(RATE!==newRate){
          RATE=newRate;
          const hg=document.getElementById('homeGrid');if(hg&&hg.children.length)renderGrid(hg,LISTINGS.filter(it=>homeFilter==='all'||it.group===homeFilter));
          const bg=document.getElementById('browseGrid');if(bg&&bg.children.length)renderBrowse();
        }
        return;
      }
    }catch(e){/* try next */}
  }
}
function animateRate(target){
  document.querySelectorAll('[data-fx-rate]').forEach(el=>{
    const start=parseInt((el.dataset.fxCurrent||el.textContent||'0').replace(/[^0-9]/g,''))||0;
    if(start===target){el.textContent=target.toLocaleString('en-US');el.dataset.fxCurrent=String(target);return}
    const dur=1400;const t0=performance.now();
    function step(now){
      const t=Math.min((now-t0)/dur,1);
      const ease=1-Math.pow(1-t,3);
      el.textContent=Math.round(start+(target-start)*ease).toLocaleString('en-US');
      if(t<1)requestAnimationFrame(step);
      else{el.dataset.fxCurrent=String(target);el.classList.remove('fx-flash');void el.offsetWidth;el.classList.add('fx-flash')}
    }
    requestAnimationFrame(step);
  });
}
window.addEventListener('DOMContentLoaded',()=>{fetchLiveRate();setInterval(fetchLiveRate,5*60*1000)});

/* === PWA: service worker with auto-update === */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      /* When a new SW is found waiting, tell it to skip waiting and take over */
      function promote(w){if(w)w.postMessage({type:'SKIP_WAITING'})}
      if(reg.waiting)promote(reg.waiting);
      reg.addEventListener('updatefound',()=>{
        const nw=reg.installing;
        if(nw)nw.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller)promote(nw)});
      });
      /* When the active SW changes, reload once so the page picks up new shell */
      let refreshed=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshed)return;refreshed=true;location.reload()});
      /* Force a check on every load */
      reg.update().catch(()=>{});
    }).catch(()=>{});
  });
}

/* === Multi-image gallery from a single source === */
function listingImages(it){
  if(!it||!it.img)return [];
  const base=it.img.split('?')[0];
  const opts=[
    '?w=900&h=720&fit=crop&auto=format&q=82',
    '?w=900&h=720&fit=crop&crop=top&auto=format&q=82',
    '?w=900&h=720&fit=crop&crop=bottom&auto=format&q=82',
    '?w=900&h=720&fit=crop&crop=entropy&auto=format&q=82'
  ];
  return opts.map(o=>base+o);
}

/* === Skeleton loader === */
function skeletonGrid(n){return '<div class="skel-grid">'+Array.from({length:n||8},()=>'<div class="skel-card"><div class="skel-media"></div><div class="skel-body"><div class="skel-line w90"></div><div class="skel-line w55"></div><div class="skel-meta"></div></div></div>').join('')+'</div>'}

/* === Favorites (localStorage-backed) === */
let FAVS=[];try{FAVS=JSON.parse(localStorage.getItem('nl_favs')||'[]').map(Number).filter(Number.isFinite)}catch(e){FAVS=[]}
function saveFavs(){try{localStorage.setItem('nl_favs',JSON.stringify(FAVS))}catch(e){}}
function isFav(id){return FAVS.includes(+id)}
function toggleFav(id){id=+id;const i=FAVS.indexOf(id);if(i>=0)FAVS.splice(i,1);else FAVS.push(id);saveFavs();updateSavedBadge();return i<0}
function updateSavedBadge(){const badges=document.querySelectorAll('[data-saved-count]');badges.forEach(b=>{if(FAVS.length){b.textContent=FAVS.length>99?'99+':FAVS.length;b.classList.add('show')}else{b.classList.remove('show')}});const sg=document.querySelector('.page[data-page="saved"].active');if(sg)renderSaved()}
const fmtUSD=n=>'$'+Number(n).toLocaleString('en-US');
const fmtSSP=n=>Number(n).toLocaleString('en-US')+' SSP';
const usdLine=it=>(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'');
const sspLine=it=>'≈ '+fmtSSP(it.usd*RATE)+(it.note||'');
const CATEGORIES=[{name:'Phones & Electronics',key:'electronics',count:'120+ items'},{name:'Fashion & Beauty',key:'fashion',count:'90+ items'},{name:'Cars & Motorbikes',key:'cars',count:'45+ listings'},{name:'Property & Land',key:'property',count:'60+ listings'},{name:'Services',key:'services',count:'70+ providers'}];
const CATLABEL={electronics:'Phones & Electronics',fashion:'Fashion & Beauty',cars:'Cars & Motorbikes',property:'Property & Land',services:'Services'};
const typeForCat=k=>k==='services'?'quote':(k==='cars'||k==='property')?'contact':'order';
const groupForCat=k=>k==='services'?'services':(k==='cars'||k==='property')?'vehprop':'products';
const LISTINGS=[
  {id:1,title:'iPhone 13 Pro · 256GB · Clean',cat:'Phones & Electronics',key:'electronics',usd:720,note:'',loc:'Juba, Hai Cinema',seller:'TechHub SS',type:'order',group:'products',badges:['boost','verified'],desc:'iPhone 13 Pro in clean condition, 256GB, battery health 92%. Comes with charger and protective case. Serious buyers only.',img:'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:2,title:'Toyota Land Cruiser V8 (2016)',cat:'Cars & Motorbikes',key:'cars',usd:42000,note:'',loc:'Juba, Tongping',seller:'Nile Motors',type:'contact',group:'vehprop',badges:['feat','verified'],desc:'2016 Toyota Land Cruiser V8, full option, leather seats, low mileage, well maintained. Inspection welcome at our Tongping yard.',img:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:3,title:'3-Bedroom House · Thongpiny',cat:'Property & Land',key:'property',usd:850,note:'/mo',loc:'Juba, Thongpiny',seller:'Juba Homes',type:'contact',group:'vehprop',badges:['verified'],desc:'Spacious 3-bedroom house in a secure compound. Self-contained, parking for 2 cars, water tank, standby generator.',img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:4,title:'Wedding & Event Photography',cat:'Services',key:'services',usd:150,from:true,note:'',loc:'Juba',seller:'Lensia Studio',type:'quote',group:'services',badges:['boost'],desc:'Professional photography and videography for weddings, graduations and corporate events. Packages from half-day to full coverage with edited album.',img:'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:5,title:'Ankara Two-Piece Set · Custom',cat:'Fashion & Beauty',key:'fashion',usd:35,note:'',loc:'Juba, Konyokonyo',seller:'Achol Styles',type:'order',group:'products',badges:['boost'],desc:'Custom-tailored Ankara two-piece set. Choose your fabric and size. Made to order within 3 days.',img:'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:6,title:'Hisense 3.5KVA Generator',cat:'Phones & Electronics',key:'electronics',usd:410,note:'',loc:'Juba, Gudele',seller:'PowerLine',type:'order',group:'products',badges:[],desc:'Hisense 3.5KVA petrol generator, brand new, fuel efficient with key start. Ideal for home or small shop.',img:'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:7,title:'Plot of Land 50x100 · Gudele',cat:'Property & Land',key:'property',usd:12000,note:'',loc:'Juba, Gudele',seller:'Equity Lands',type:'contact',group:'vehprop',badges:['verified'],desc:'Residential plot 50x100 in a fast-developing area of Gudele. Clean documents, ready for transfer.',img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:8,title:'Bajaj Boxer Motorbike (2022)',cat:'Cars & Motorbikes',key:'cars',usd:1250,note:'',loc:'Juba, Munuki',seller:'RideMart',type:'contact',group:'vehprop',badges:['boost'],desc:'2022 Bajaj Boxer, single owner, excellent condition, ideal for boda business or personal use.',img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:9,title:'Home & Office Deep Cleaning',cat:'Services',key:'services',usd:25,from:true,note:'',loc:'Juba',seller:'SparkleCo',type:'quote',group:'services',badges:[],desc:'Reliable home and office cleaning team. One-off or weekly. We bring our own supplies and equipment.',img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:10,title:'Samsung Galaxy A54 · 128GB',cat:'Phones & Electronics',key:'electronics',usd:310,note:'',loc:'Juba, Custom',seller:'TechHub SS',type:'order',group:'products',badges:['verified'],desc:'New Samsung Galaxy A54, 128GB, sealed in box with one year warranty. Multiple colours available.',img:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:11,title:'Custom Cakes & Pastries',cat:'Services',key:'services',usd:20,from:true,note:'',loc:'Juba',seller:'Sweet Nile',type:'quote',group:'services',badges:['boost'],desc:'Custom cakes for birthdays, weddings and events. Order 48 hours ahead. Delivery available in Juba.',img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=460&fit=crop&auto=format&q=80'},
  {id:12,title:'Men’s Leather Shoes · Italian',cat:'Fashion & Beauty',key:'fashion',usd:45,note:'',loc:'Juba, Jebel',seller:'Step Up',type:'order',group:'products',badges:[],desc:'Genuine leather formal shoes, sizes 40-45. Comfortable and durable. Bulk orders welcome.',img:'https://images.unsplash.com/photo-1614253429340-98120bd6d753?w=600&h=460&fit=crop&auto=format&q=80'}
];
let SHOP=[
  {id:'s1',title:'MacBook Air M1 · 256GB',cat:'Electronics',key:'electronics',usd:640,note:'',status:'draft',pct:60,missing:'Add 2 more photos'},
  {id:'s2',title:'2-Bed Apartment · Juba Na Bari',cat:'Property',key:'property',usd:500,note:'/mo',status:'draft',pct:40,missing:'Add description & price details'},
  {id:'s3',title:'Event Decoration Service',cat:'Services',key:'services',usd:80,from:true,note:'',status:'draft',pct:75,missing:'Set your service areas'},
  {id:'s4',title:'iPhone 13 Pro · 256GB',cat:'Electronics',key:'electronics',usd:720,note:'',status:'live',views:42,reqs:3},
  {id:'s5',title:'Samsung Galaxy A54 · 128GB',cat:'Electronics',key:'electronics',usd:310,note:'',status:'live',views:28,reqs:2},
  {id:'s6',title:'JBL Bluetooth Speaker',cat:'Electronics',key:'electronics',usd:55,note:'',status:'live',views:17,reqs:1},
  {id:'s7',title:'Toyota Hilux Double Cab (2014)',cat:'Cars',key:'cars',usd:19500,note:'',status:'pending'},
  {id:'s8',title:'Infinix Note 30 · 128GB',cat:'Electronics',key:'electronics',usd:180,note:'',status:'sold'}
];
let REQUESTS=[
  {id:'r1',name:'Achol Deng',item:'iPhone 13 Pro · 256GB',type:'order',time:'2h ago',phone:'+211 92x xxx 110',status:'new'},
  {id:'r2',name:'Peter Garang',item:'Samsung Galaxy A54',type:'order',time:'5h ago',phone:'+211 92x xxx 884',status:'new'},
  {id:'r3',name:'Mary Nyandeng',item:'2-Bed Apartment · Juba Na Bari',type:'contact',time:'1d ago',phone:'+211 95x xxx 201',status:'contacted'},
  {id:'r4',name:'James Lado',item:'Event Decoration Service',type:'quote',time:'2d ago',phone:'+211 91x xxx 552',status:'quoted'},
  {id:'r5',name:'Rebecca Aluel',item:'JBL Bluetooth Speaker',type:'order',time:'3d ago',phone:'+211 92x xxx 037',status:'contacted'}
];
const CTA={order:{label:'Order Now',cls:'cta-order',icon:'<path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>'},contact:{label:'Request Contact',cls:'cta-contact',icon:'<path d="M4 4h16v12H7l-3 3z"/>'},quote:{label:'Request Quote',cls:'cta-quote',icon:'<path d="M4 5h16v10H4z"/><path d="M8 19h8M12 15v4"/>'}};
const BADGE={boost:{cls:'bdg-boost',label:'Boosted',fill:1,icon:'<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>'},feat:{cls:'bdg-feat',label:'Featured',fill:1,icon:'<path d="M12 2l2.6 6.6L21.6 9l-5 4.6 1.4 6.9L12 17.2 6 20.5 7.4 13.6 2.4 9l6.9-.4z"/>'},verified:{cls:'bdg-verified',label:'Verified',fill:0,icon:'<path d="M20 6L9 17l-5-5"/>'}};
function badgeHTML(b){const d=BADGE[b];if(!d)return'';return '<span class="bdg '+d.cls+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="'+(d.fill?'currentColor':'none')+'" stroke="'+(d.fill?'none':'currentColor')+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+d.icon+'</svg>'+d.label+'</span>'}
function cardHTML(it,i){
  const verified=it.badges.includes('verified');
  let topBadge='';
  if(it.badges.includes('feat'))topBadge='<span class="bdg bdg-feat"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.6L21.6 9l-5 4.6 1.4 6.9L12 17.2 6 20.5 7.4 13.6 2.4 9l6.9-.4z"/></svg>Featured</span>';
  else if(it.badges.includes('boost'))topBadge='<span class="bdg bdg-boost"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>Boosted</span>';
  return '<article class="card" data-id="'+it.id+'" data-group="'+it.group+'" style="animation-delay:'+(i*40)+'ms">'+
    '<div class="media">'+
      topBadge+
      '<button class="fav'+(isFav(it.id)?' on':'')+'" data-fav="'+it.id+'" aria-label="Save"><svg width="16" height="16" viewBox="0 0 24 24" fill="'+(isFav(it.id)?'currentColor':'none')+'" stroke="currentColor" stroke-width="2.2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>'+
      (it.img?'<img src="'+it.img+'" alt="'+it.title+'" class="card-img" loading="lazy">':glyph(it.key,62))+
    '</div>'+
    '<div class="body">'+
      '<div class="ttl">'+it.title+'</div>'+
      '<div class="price">'+usdLine(it)+'</div>'+
      '<div class="price-ssp">'+sspLine(it)+'</div>'+
      '<div class="meta"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg><span class="meta-loc">'+it.loc+'</span>'+(verified?'<span class="vchip"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Verified</span>':'')+'</div>'+
    '</div>'+
  '</article>';
}
function renderGrid(el,list){if(!el)return;el.innerHTML=list.length?list.map((it,i)=>cardHTML(it,i)).join(''):'<div class="empty"><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><p style="font-weight:600;color:var(--slate)">No listings match — try another category or search.</p></div>'}
document.addEventListener('click',e=>{
  const fav=e.target.closest('[data-fav]');
  if(fav){e.stopPropagation();const id=fav.dataset.fav;const on=toggleFav(id);fav.classList.toggle('on',on);const s=fav.querySelector('svg');if(s){s.setAttribute('fill',on?'currentColor':'none');s.classList.add('pop');setTimeout(()=>s.classList.remove('pop'),300)}return}
  const cta=e.target.closest('[data-cta]');
  if(cta){e.stopPropagation();openModal(+cta.dataset.cta);return}
  const sellerLink=e.target.closest('[data-seller-link]');
  if(sellerLink){return}
  const card=e.target.closest('.card[data-id]');
  if(card){location.hash='#listing?id='+card.dataset.id}
});
function initHome(){
  document.getElementById('catStrip').innerHTML=CATEGORIES.map(c=>'<a href="#browse" class="cat-card"><div class="cat-ic">'+glyph(c.key,27)+'</div><div class="cat-name">'+c.name+'</div><div class="cat-count">'+c.count+'</div></a>').join('');
  renderGrid(document.getElementById('homeGrid'),LISTINGS);
  renderShop(document.getElementById('homeShop'),'all');
  renderSteps('buy');
}
let homeFilter='all';
document.getElementById('homeTabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(!t)return;document.querySelectorAll('#homeTabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');homeFilter=t.dataset.filter;renderGrid(document.getElementById('homeGrid'),LISTINGS.filter(it=>homeFilter==='all'||it.group===homeFilter))});
function goSearch(q){location.hash='#browse';setTimeout(()=>{const i=document.getElementById('browseSearch');if(i){i.value=q;browseState.search=q;renderBrowse()}},70)}
document.getElementById('heroSearchBtn').addEventListener('click',()=>goSearch(document.getElementById('heroSearch').value));
document.getElementById('heroSearch').addEventListener('keydown',e=>{if(e.key==='Enter')goSearch(e.target.value)});
document.getElementById('navSearch').addEventListener('keydown',e=>{if(e.key==='Enter')goSearch(e.target.value)});
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>goSearch(c.dataset.q)));

/* === Search autocomplete === */
function buildSuggestions(q){
  q=(q||'').trim().toLowerCase();if(!q)return [];
  const out=[],seen=new Set();
  CATEGORIES.forEach(c=>{if(c.name.toLowerCase().includes(q)){out.push({type:'cat',key:c.key,name:c.name,count:c.count})}});
  LISTINGS.forEach(l=>{
    const blob=(l.title+' '+l.cat+' '+l.seller+' '+l.loc).toLowerCase();
    if(blob.includes(q)&&!seen.has(l.id)){seen.add(l.id);out.push({type:'item',data:l})}
  });
  return out.slice(0,7);
}
function renderSearchDropdown(input,dropdown){
  const q=input.value;const items=buildSuggestions(q);
  if(!q.trim()){dropdown.classList.remove('show');input.setAttribute('aria-expanded','false');return}
  if(!items.length){dropdown.innerHTML='<div class="sd-empty">No matches for &ldquo;<b>'+q.replace(/[<>]/g,'')+'&rdquo;</b><div class="sd-empty-sub">Try a different word or browse all listings.</div></div>';dropdown.classList.add('show');input.setAttribute('aria-expanded','true');return}
  dropdown.innerHTML=items.map(s=>{
    if(s.type==='cat'){return '<a href="#browse" class="sd-item sd-cat-row" data-sd-cat="'+s.key+'" role="option"><div class="sd-thumb sd-cat-thumb">'+glyph(s.key,22)+'</div><div class="sd-info"><div class="sd-ttl">'+s.name+'</div><div class="sd-meta">Browse category &middot; '+s.count+'</div></div><svg class="sd-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></a>'}
    const it=s.data;
    return '<a href="#listing?id='+it.id+'" class="sd-item" role="option"><div class="sd-thumb">'+(it.img?'<img src="'+it.img+'" alt="" loading="lazy">':glyph(it.key,22))+'</div><div class="sd-info"><div class="sd-ttl">'+it.title+'</div><div class="sd-meta">'+it.cat+' &middot; <b>'+(it.from?'From ':'')+fmtUSD(it.usd)+(it.note||'')+'</b></div></div><svg class="sd-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></a>';
  }).join('')+'<a href="#browse" class="sd-item sd-all" data-sd-search="'+q.replace(/"/g,'')+'" role="option"><div class="sd-thumb sd-all-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></div><div class="sd-info"><div class="sd-ttl">See all results for &ldquo;'+q.replace(/[<>]/g,'')+'&rdquo;</div><div class="sd-meta">Search the full marketplace</div></div></a>';
  dropdown.classList.add('show');input.setAttribute('aria-expanded','true');
}
function bindAutocomplete(inputId,dropdownId){
  const input=document.getElementById(inputId);const dropdown=document.getElementById(dropdownId);
  if(!input||!dropdown)return;
  let t;
  input.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>renderSearchDropdown(input,dropdown),80)});
  input.addEventListener('focus',()=>{if(input.value.trim())renderSearchDropdown(input,dropdown)});
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){dropdown.classList.remove('show');input.blur()}});
  document.addEventListener('click',e=>{if(!input.contains(e.target)&&!dropdown.contains(e.target)){dropdown.classList.remove('show');input.setAttribute('aria-expanded','false')}});
  dropdown.addEventListener('click',e=>{
    const cat=e.target.closest('[data-sd-cat]');
    const all=e.target.closest('[data-sd-search]');
    if(cat){setTimeout(()=>{browseState.cats=[cat.dataset.sdCat];browseState.search='';const i=document.getElementById('browseSearch');if(i)i.value='';if(typeof renderBrowse==='function')renderBrowse()},20)}
    else if(all){setTimeout(()=>{browseState.search=all.dataset.sdSearch;const i=document.getElementById('browseSearch');if(i)i.value=all.dataset.sdSearch;if(typeof renderBrowse==='function')renderBrowse()},20)}
    dropdown.classList.remove('show');input.setAttribute('aria-expanded','false');input.value='';
  });
}
bindAutocomplete('heroSearch','heroSearchDropdown');
bindAutocomplete('navSearch','navSearchDropdown');
const STEP_ICONS={
  buy:['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/><path d="M11 8v3l2 1.5"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="M9 12h6M9 15h4"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'],
  sell:['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5L5 21"/><path d="M17 3v4M15 5h4"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/><circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/></svg>','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 2-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2"/></svg>']
};
const STEPS={buy:[{h:'Search &amp; discover',p:'Filter by category, location and price across phones, cars, property, fashion and services.'},{h:'Order or request',p:'Tap Order Now, Request Contact, or Request Quote. Your details stay safely inside Nile Link.'},{h:'Close with confidence',p:'Verified sellers follow up to confirm, arrange viewing or delivery, and close the deal.'}],sell:[{h:'Post in minutes',p:'Add photos, price, location and category — or save as a draft and finish later.'},{h:'Get real requests',p:'Receive orders, contacts and quotes from serious buyers, organized in your dashboard.'},{h:'Grow &amp; get paid',p:'Boost listings, earn a verified badge, and close more deals every week.'}]};
function renderSteps(m){
  const ic=STEP_ICONS[m]||STEP_ICONS.buy;
  document.getElementById('steps').innerHTML=STEPS[m].map((s,i)=>'<div class="step-v2" style="--si:'+i+'">'
    +'<div class="step-num-line">'
    +  '<div class="step-num"><span>'+(i+1)+'</span><span class="step-num-pulse"></span></div>'
    +  (i<STEPS[m].length-1?'<div class="step-line" aria-hidden="true"></div>':'')
    +'</div>'
    +'<div class="step-card">'
    +  '<div class="step-illustration" aria-hidden="true">'+ic[i]+'<span class="step-illust-glow"></span></div>'
    +  '<h3>'+s.h+'</h3>'
    +  '<p>'+s.p+'</p>'
    +'</div>'
    +'</div>').join('');
}
document.getElementById('howToggle').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#howToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSteps(b.dataset.mode)});
const browseState={search:'',cats:[],type:'all',max:42000,sort:'featured'};
let browseBound=false;
function buildBrowseFilters(){document.getElementById('fltCats').innerHTML=CATEGORIES.map(c=>'<label class="check"><input type="checkbox" value="'+c.key+'" class="fcat"> '+c.name+'</label>').join('');document.querySelectorAll('.fcat').forEach(cb=>cb.addEventListener('change',()=>{browseState.cats=[...document.querySelectorAll('.fcat:checked')].map(x=>x.value);renderBrowse()}))}
function renderActiveFilters(){
  const el=document.getElementById('activeFilters');if(!el)return;
  const chips=[];
  if(browseState.search)chips.push({k:'search',label:'"'+browseState.search+'"'});
  browseState.cats.forEach(c=>{const cat=CATEGORIES.find(x=>x.key===c);if(cat)chips.push({k:'cat:'+c,label:cat.name})});
  if(browseState.type!=='all'){const tl={products:'Products',vehprop:'Cars & Property',services:'Services'};chips.push({k:'type',label:tl[browseState.type]||browseState.type})}
  if(browseState.max<42000)chips.push({k:'price',label:'Under '+fmtUSD(browseState.max)});
  el.innerHTML=chips.map(c=>'<span class="afilter">'+c.label+'<button data-rm="'+c.k+'" aria-label="Remove filter"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>').join('');
}
function removeActiveFilter(k){
  if(k==='search'){browseState.search='';const i=document.getElementById('browseSearch');if(i)i.value=''}
  else if(k.startsWith('cat:')){const c=k.slice(4);browseState.cats=browseState.cats.filter(x=>x!==c);const cb=document.querySelector('.fcat[value="'+c+'"]');if(cb)cb.checked=false}
  else if(k==='type'){browseState.type='all';const r=document.querySelector('input[name=ftype][value=all]');if(r)r.checked=true}
  else if(k==='price'){browseState.max=42000;const pr=document.getElementById('priceRange');if(pr)pr.value=42000;const pl=document.getElementById('priceLabel');if(pl)pl.textContent='Up to $42,000'}
  syncCatPills();renderBrowse();
}
function syncCatPills(){
  document.querySelectorAll('.cat-pill').forEach(p=>{
    const c=p.dataset.cat;
    const on=(c==='')?browseState.cats.length===0:browseState.cats.includes(c);
    p.classList.toggle('on',on);p.setAttribute('aria-selected',on?'true':'false');
  });
}
function renderBrowse(){let l=LISTINGS.filter(it=>{if(browseState.search){const q=browseState.search.toLowerCase();if(!(it.title.toLowerCase().includes(q)||it.cat.toLowerCase().includes(q)||it.seller.toLowerCase().includes(q)))return false}if(browseState.cats.length&&!browseState.cats.includes(it.key))return false;if(browseState.type!=='all'&&it.group!==browseState.type)return false;if(it.usd>browseState.max)return false;return true});if(browseState.sort==='low')l=[...l].sort((a,b)=>a.usd-b.usd);else if(browseState.sort==='high')l=[...l].sort((a,b)=>b.usd-a.usd);else if(browseState.sort==='az')l=[...l].sort((a,b)=>a.title.localeCompare(b.title));const rc=document.getElementById('resCount');if(rc)rc.textContent=l.length;renderActiveFilters();syncCatPills();renderGrid(document.getElementById('browseGrid'),l)}
function initBrowse(){
  if(!browseBound){
    buildBrowseFilters();
    document.getElementById('browseSearch').addEventListener('input',e=>{browseState.search=e.target.value;renderBrowse()});
    document.querySelectorAll('input[name=ftype]').forEach(r=>r.addEventListener('change',e=>{browseState.type=e.target.value;renderBrowse()}));
    const pr=document.getElementById('priceRange');
    pr.addEventListener('input',e=>{browseState.max=+e.target.value;document.getElementById('priceLabel').textContent='Up to '+fmtUSD(+e.target.value);renderBrowse()});
    document.getElementById('sortSel').addEventListener('change',e=>{browseState.sort=e.target.value;renderBrowse()});
    document.getElementById('resetFilters').addEventListener('click',()=>{browseState.search='';browseState.cats=[];browseState.type='all';browseState.max=42000;browseState.sort='featured';document.getElementById('browseSearch').value='';document.querySelectorAll('.fcat').forEach(x=>x.checked=false);document.querySelector('input[name=ftype][value=all]').checked=true;pr.value=42000;document.getElementById('priceLabel').textContent='Up to $42,000';document.getElementById('sortSel').value='featured';renderBrowse()});
    document.getElementById('filterToggle').addEventListener('click',()=>document.getElementById('filters').classList.toggle('open'));
    document.getElementById('catPills').addEventListener('click',e=>{const p=e.target.closest('.cat-pill');if(!p)return;const c=p.dataset.cat;if(c===''){browseState.cats=[]}else{browseState.cats=[c]}document.querySelectorAll('.fcat').forEach(cb=>cb.checked=browseState.cats.includes(cb.value));renderBrowse()});
    document.getElementById('activeFilters').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(b)removeActiveFilter(b.dataset.rm)});
    browseBound=true
  }
  renderBrowse()
}
function renderSaved(){
  const items=LISTINGS.filter(l=>FAVS.includes(l.id));
  const el=document.getElementById('savedGrid');if(!el)return;
  const cnt=document.getElementById('savedCount');if(cnt)cnt.textContent=items.length;
  if(!items.length){el.innerHTML='<div class="empty saved-empty"><div class="se-ic"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></div><h3>No saved listings yet</h3><p>Tap the heart on any listing to save it here for later.</p><a href="#browse" class="btn btn-lime">Start browsing</a></div>'}
  else{renderGrid(el,items)}
}
function renderListingDetail(id){
  const it=LISTINGS.find(x=>x.id===id);
  /* tear down any prior sticky CTA */
  const oldSticky=document.querySelector('.pdp-mob-cta');if(oldSticky)oldSticky.remove();
  if(!it){
    document.getElementById('pdpCrumb').innerHTML='<a href="#home">Home</a> › <span>Listing not found</span>';
    document.getElementById('pdpContent').innerHTML='<div class="pdp-notfound"><div class="nf-ic"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/><path d="M8.5 8.5l5 5M13.5 8.5l-5 5"/></svg></div><h2>This listing isn&rsquo;t available</h2><p>It may have been sold, removed by the seller, or never existed. Try browsing for something similar.</p><div class="nf-actions"><a href="#browse" class="btn btn-lime">Browse listings</a><a href="#home" class="btn btn-ghost">Go home</a></div></div>';
    document.getElementById('similarGrid').innerHTML='';return;
  }
  document.getElementById('pdpCrumb').innerHTML='<a href="#home">Home</a> › <a href="#browse">'+it.cat+'</a> › <span>'+it.title+'</span>';
  const imgs=listingImages(it);
  /* sticky mobile CTA */
  const cta0=CTA[it.type];
  const stickyEl=document.createElement('div');stickyEl.className='pdp-mob-cta';
  stickyEl.innerHTML='<div class="pmc-price"><span class="pmc-u">'+(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'')+'</span><span class="pmc-s">≈ '+fmtSSP(it.usd*RATE)+(it.note||'')+'</span></div><button class="btn pmc-cta '+cta0.cls+'" data-cta="'+it.id+'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+cta0.icon+'</svg>'+cta0.label+'</button>';
  document.body.appendChild(stickyEl);
  const cta=CTA[it.type];
  const specs=it.group==='vehprop'?[['Location',it.loc],['Listing type',it.cat],['Status','Available'],['Seller',it.seller]]:[['Condition','Excellent'],['Location',it.loc],['Category',it.cat],['Seller',it.seller]];
  const galleryHTML='<div class="pdp-gallery">'
    +'<div class="main-img" data-zoom-target>'
    +'<div class="badges">'+it.badges.map(badgeHTML).join('')+'</div>'
    +(imgs.length?'<img src="'+imgs[0]+'" alt="'+it.title+'" class="pdp-main-img" id="pdpMainImg" width="600" height="460" loading="eager" decoding="async">':glyph(it.key,120))
    +(imgs.length?'<button class="pdp-zoom-btn" data-zoom-open aria-label="Open full-size image"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg></button>':'')
    +'<div class="pdp-photo-count">'+(imgs.length||1)+' photo'+(imgs.length>1?'s':'')+'</div>'
    +'</div>'
    +(imgs.length>1?'<div class="pdp-thumbs" role="tablist" aria-label="Listing photos">'+imgs.map((src,n)=>'<button class="pdp-thumb'+(n===0?' on':'')+'" data-thumb-src="'+src+'" data-idx="'+n+'" aria-label="View photo '+(n+1)+'" role="tab" aria-selected="'+(n===0?'true':'false')+'"><img src="'+src+'" alt="" loading="lazy" decoding="async"></button>').join('')+'</div>':'')
    +'</div>';
  document.getElementById('pdpContent').innerHTML=galleryHTML+'<div class="pdp-info"><div class="cat">'+it.cat+'</div><h1>'+it.title+'</h1><span class="pdp-loc"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'+it.loc+' · posted 2 days ago</span><div class="pdp-price"><span class="u">'+(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'')+'</span><span class="s">≈ '+fmtSSP(it.usd*RATE)+(it.note||'')+'</span></div><div class="seller-card"><div class="av">'+it.seller[0]+'</div><div><div class="nm">'+it.seller+(it.badges.includes('verified')?' <span class="vb"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'')+'</div><div class="lv">'+(it.badges.includes('verified')?'Verified seller':'Seller')+' · Juba</div></div><a href="#shop?seller='+encodeURIComponent(it.seller)+'" class="vshop">View shop ›</a></div><div class="pdp-cta"><button class="btn btn-lg btn-block '+cta.cls+'" data-cta="'+it.id+'"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+cta.icon+'</svg>'+cta.label+'</button></div><div class="pdp-actions-row"><button class="pdp-icon-btn'+(isFav(it.id)?' on':'')+'" data-fav="'+it.id+'"><svg width="16" height="16" viewBox="0 0 24 24" fill="'+(isFav(it.id)?'currentColor':'none')+'" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>Save</button><button class="pdp-icon-btn" onclick="showToast(\'Listing link copied to share\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>Share</button><button class="pdp-icon-btn" onclick="showToast(\'Reported — our team will review\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4h13l-2 4 2 4H4"/></svg>Report</button></div><div class="pdp-note"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg><p>Your request stays inside Nile Link. The seller follows up directly — no payment is taken on the platform.</p></div><div class="pdp-section"><h3>Description</h3><p>'+it.desc+'</p></div><div class="pdp-section"><h3>Details</h3><div class="specs">'+specs.map(s=>'<div class="spec"><span class="k">'+s[0]+'</span><span class="v">'+s[1]+'</span></div>').join('')+'</div></div></div>';
  renderGrid(document.getElementById('similarGrid'),LISTINGS.filter(x=>x.group===it.group&&x.id!==it.id).slice(0,4));
}

/* === PDP gallery + lightbox bindings === */
document.addEventListener('click',e=>{
  const thumb=e.target.closest('.pdp-thumb[data-thumb-src]');
  if(thumb){
    const main=document.getElementById('pdpMainImg');
    if(main)main.src=thumb.dataset.thumbSrc;
    document.querySelectorAll('.pdp-thumb').forEach(t=>{t.classList.remove('on');t.setAttribute('aria-selected','false')});
    thumb.classList.add('on');thumb.setAttribute('aria-selected','true');
    return;
  }
  const zoomOpen=e.target.closest('[data-zoom-open]')||e.target.closest('.pdp-main-img');
  if(zoomOpen&&zoomOpen.closest('[data-zoom-target]')){
    const main=document.getElementById('pdpMainImg');const lb=document.getElementById('lightbox');const lbi=document.getElementById('lightboxImg');
    if(main&&lb&&lbi){lbi.src=main.src;lb.classList.add('show');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
    return;
  }
  if(e.target.closest('[data-lb-close]')||e.target.id==='lightbox'){
    const lb=document.getElementById('lightbox');if(lb&&lb.classList.contains('show')){lb.classList.remove('show');lb.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const lb=document.getElementById('lightbox');if(lb&&lb.classList.contains('show')){lb.classList.remove('show');lb.setAttribute('aria-hidden','true');document.body.style.overflow=''}}});

const STATUS={live:{cls:'st-live',label:'Live',dot:1},draft:{cls:'st-draft',label:'Draft'},pending:{cls:'st-pending',label:'Pending review'},sold:{cls:'st-sold',label:'Sold'}};
function statpill(s){const d=STATUS[s];return '<span class="statpill '+d.cls+'">'+(d.dot?'<span class="dot"></span>':'')+d.label+'</span>'}
function wsRowHTML(it,i){let mid='';
  if(it.status==='draft'){mid='<div class="draft-meter"><div class="ml"><span>'+it.missing+'</span><b>'+it.pct+'%</b></div><div class="draft-track"><div class="draft-fill" style="width:'+it.pct+'%"></div></div></div><div class="ws-acts"><button class="mini mini-pub" data-pub="'+it.id+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Publish</button><button class="mini mini-edit" data-edit="1">Continue editing</button></div>'}
  else if(it.status==='live'){mid='<div class="live-meta"><span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>'+it.views+' views</span><span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H7l-3 3z"/></svg>'+it.reqs+' requests</span></div><div class="ws-acts"><button class="mini mini-edit" data-edit="1">Edit</button><button class="mini mini-view" data-edit="1">View live</button></div>'}
  else if(it.status==='pending'){mid='<div class="live-meta"><span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>In review — usually under 24h</span></div><div class="ws-acts"><button class="mini mini-edit" data-edit="1">Edit</button></div>'}
  else{mid='<div class="live-meta"><span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Sold via Nile Link</span></div><div class="ws-acts"><button class="mini mini-edit" data-edit="1">Relist</button></div>'}
  return '<div class="ws-row" style="animation-delay:'+(i*45)+'ms"><div class="thumb">'+glyph(it.key,30)+'</div><div class="info"><div class="top-line"><div class="rt">'+it.title+'</div>'+statpill(it.status)+'</div><div class="rcat">'+it.cat+'</div><div class="rp">'+usdLine(it)+' <span class="rp-ssp">'+sspLine(it)+'</span></div>'+mid+'</div></div>'}
let dashFilter='all';
function renderShop(el,filter){if(!el)return;const l=SHOP.filter(it=>filter==='all'||it.status===filter);let html=l.map((it,i)=>wsRowHTML(it,i)).join('');if(filter==='all'||filter==='draft'){html+='<a href="#post" class="ws-newcard"><div class="pl"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div><b>Create a new listing</b><span>Save as draft or publish now</span></a>'}el.innerHTML=html;updateCounts()}
function updateCounts(){const c={all:SHOP.length,live:0,draft:0,pending:0,sold:0};SHOP.forEach(it=>c[it.status]++);['All','Live','Draft','Pending','Sold'].forEach(k=>{const e=document.getElementById('c'+k);if(e)e.textContent=c[k.toLowerCase()]});const dl=document.getElementById('dLive'),dd=document.getElementById('dDraft');if(dl)dl.textContent=c.live;if(dd)dd.textContent=c.draft}

function bindDashboard(){
  const tabs=document.getElementById('dashTabs');
  if(tabs&&!tabs.dataset.b){tabs.dataset.b=1;tabs.addEventListener('click',e=>{const b=e.target.closest('.ws-tab');if(!b)return;document.querySelectorAll('#dashTabs .ws-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.ws-pane').forEach(p=>p.style.display=p.dataset.pane===b.dataset.tab?'block':'none')})}
  const df=document.getElementById('dashFilters');
  if(df&&!df.dataset.b){df.dataset.b=1;df.addEventListener('click',e=>{const b=e.target.closest('.ws-filt');if(!b)return;document.querySelectorAll('#dashFilters .ws-filt').forEach(x=>x.classList.remove('active'));b.classList.add('active');dashFilter=b.dataset.st;renderShop(document.getElementById('dashList'),dashFilter)})}
  const dlst=document.getElementById('dashList');
  if(dlst&&!dlst.dataset.b){dlst.dataset.b=1;dlst.addEventListener('click',e=>{const pub=e.target.closest('[data-pub]');if(pub){const it=SHOP.find(x=>x.id===pub.dataset.pub);if(it){it.status='live';it.views=0;it.reqs=0;renderShop(dlst,dashFilter);showToast('"'+it.title+'" is now live!')}return}const ed=e.target.closest('[data-edit]');if(ed){showToast('Opening the listing editor…')}})}
}
function renderRequests(){const el=document.getElementById('reqList');if(!el)return;const tp={order:'tp-order',contact:'tp-contact',quote:'tp-quote'};const tl={order:'Order',contact:'Contact',quote:'Quote'};el.innerHTML=REQUESTS.map(r=>'<div class="req-row"><div class="av">'+r.name[0]+'</div><div><div class="who">'+r.name+'</div><div class="what">wants: '+r.item+'</div></div><div class="req-meta"><span class="type-pill '+tp[r.type]+'">'+tl[r.type]+'</span><span class="phone">'+r.phone+'</span><span class="req-time">'+r.time+'</span><button class="mini mini-edit" data-rid="'+r.id+'" style="font-size:12px;padding:7px 12px;border-radius:9px">'+(r.status==='new'?'Mark contacted':'Contacted ✓')+'</button></div></div>').join('');el.querySelectorAll('[data-rid]').forEach(b=>b.addEventListener('click',()=>{const r=REQUESTS.find(x=>x.id===b.dataset.rid);if(r){r.status='contacted';b.textContent='Contacted ✓';showToast('Marked as contacted')}}))}
function initDashboard(){bindDashboard();renderShop(document.getElementById('dashList'),dashFilter);renderRequests()}

function renderShopProfile(name){
  const seller=decodeURIComponent(name||'TechHub SS');
  const crumb=document.getElementById('shopCrumbName');if(crumb)crumb.textContent=seller;
  const items=LISTINGS.filter(x=>x.seller===seller);const list=items.length?items:LISTINGS.slice(0,4);const verified=list.some(x=>x.badges.includes('verified'));
  document.getElementById('shopContent').innerHTML='<div class="shop-head"><div class="big-av">'+seller[0]+'</div><div><h1>'+seller+(verified?' <span class="vb"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'')+'</h1><div class="meta-row"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>Juba, South Sudan</span><span class="trust-tag"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'+(verified?'Trusted Seller':'Seller')+'</span></div></div><div class="shop-stats"><div><div class="v">'+list.length+'</div><div class="k">Listings</div></div><div><div class="v">~1h</div><div class="k">Response time</div></div></div></div><div class="sec-head"><div><span class="sec-kick">Listings</span><h2 class="sec-title">From this seller</h2></div></div><div class="grid" id="shopGrid"></div>';
  renderGrid(document.getElementById('shopGrid'),list);
}
const BOOSTS=[{d:'1 Day',u:1},{d:'3 Days',u:3},{d:'7 Days',u:5,pop:1},{d:'30 Days',u:15}];
const VERIF=[{n:'Individual',u:5,ic:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'},{n:'Business',u:20,ic:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'},{n:'Company / Dealer',u:50,ic:'<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6"/>'}];
const PLANS=[{n:'Basic',u:10,f:['Enhanced shop page','Up to 20 active listings','Basic analytics']},{n:'Pro',u:30,pop:1,f:['Everything in Basic','Up to 100 listings','2 free boosts / month','Priority support']},{n:'Premium',u:75,f:['Everything in Pro','Unlimited listings','5 free boosts / month','Featured shop badge']},{n:'Enterprise',u:150,f:['Everything in Premium','Dealer storefront','Account manager','Bulk upload tools']}];
function renderPricing(){
  document.getElementById('boostGrid').innerHTML=BOOSTS.map(b=>'<div class="boost-card'+(b.pop?' popular':'')+'">'+(b.pop?'<span class="pop-tag">Best value</span>':'')+'<div class="dur">'+b.d+'</div><div class="u">'+fmtUSD(b.u)+'</div><div class="s">≈ '+fmtSSP(b.u*RATE)+'</div><button class="btn btn-sm '+(b.pop?'btn-lime':'btn-ghost')+' btn-block" onclick="showToast(\'Boost selected — pay to activate\')">Choose</button></div>').join('');
  document.getElementById('verifyGrid').innerHTML=VERIF.map(v=>'<div class="vcard"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+v.ic+'</svg></div><div class="vn">'+v.n+'</div><div class="u">'+fmtUSD(v.u)+'</div><div class="s">≈ '+fmtSSP(v.u*RATE)+'</div></div>').join('');
  document.getElementById('planGrid').innerHTML=PLANS.map(p=>'<div class="plan'+(p.pop?' popular':'')+'">'+(p.pop?'<span class="pop-tag">Popular</span>':'')+'<div class="pn">'+p.n+'</div><div class="pu">'+fmtUSD(p.u)+'<small>/mo</small></div><div class="ps">≈ '+fmtSSP(p.u*RATE)+'/mo</div><ul>'+p.f.map(x=>'<li>'+x+'</li>').join('')+'</ul><button class="btn '+(p.pop?'btn-lime':'btn-ghost')+' btn-block" onclick="showToast(\''+p.n+' plan selected\')">Choose '+p.n+'</button></div>').join('');
}
const PRICING_FAQ=[['How do I pay for boosts and plans?','At launch you pay by mobile money or bank transfer and upload proof — we activate it for you. Automated payments are coming soon.'],['Is listing really free?','Yes. Posting listings is always free. You only pay if you choose to boost, verify, or subscribe to a shop plan.'],['What does a boost do?','A boosted listing appears at the top of its category and on the homepage for the duration you choose.'],['Can I cancel a shop plan?','Yes, shop plans are monthly and can be cancelled anytime. Your listings stay live on the free tier.']];
const HELP_FAQ=[['How do I contact a seller?','Tap Order Now, Request Contact, or Request Quote on a listing. Your details go to the seller, who follows up directly.'],['Does Nile Link handle payment?','No. Payment happens directly between you and the seller. Always inspect items before paying.'],['How do I become a verified seller?','Go to your shop dashboard, open Get verified, confirm your phone and upload your ID. Approval is usually within 24 hours.'],['How do I report a listing?','Open the listing and tap Report. Our team reviews all reports and removes anything that breaks the rules.']];
function renderFaq(el,data){if(!el)return;el.innerHTML=data.map(f=>'<div class="faq-item"><button class="faq-q">'+f[0]+'<span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button><div class="faq-a"><p>'+f[1]+'</p></div></div>').join('');el.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')))}

document.addEventListener('click',e=>{const r=e.target.closest('.role-opt');if(r){r.parentElement.querySelectorAll('.role-opt').forEach(x=>x.classList.remove('on'));r.classList.add('on')}});

const overlay=document.getElementById('overlay');let currentItem=null;
function openModal(id){const it=LISTINGS.find(x=>x.id===id);if(!it)return;currentItem=it;
  document.getElementById('mMini').innerHTML=glyph(it.key,28);document.getElementById('mCat').textContent=it.cat;document.getElementById('mTtl').innerHTML=it.title;document.getElementById('mPrice').innerHTML=usdLine(it)+' <span class="mt-ssp">'+sspLine(it)+'</span>';
  document.getElementById('mForm').style.display='block';document.getElementById('mSuccess').classList.remove('show');['fName','fPhone','fLoc','fMsg'].forEach(f=>document.getElementById(f).value='');document.getElementById('qVal').value='1';
  const submit=document.getElementById('submitReq'),qty=document.getElementById('qtyField'),lblMsg=document.getElementById('lblMsg'),note=document.getElementById('mNote');
  if(it.type==='order'){submit.textContent='Place order';submit.className='btn btn-block cta-order';qty.style.display='block';lblMsg.innerHTML='Note for seller <span style="color:var(--slate-2);font-weight:500">(optional)</span>';note.textContent='Your order stays inside Nile Link. The seller confirms availability and arranges delivery.'}
  else if(it.type==='contact'){submit.textContent='Request contact';submit.className='btn btn-block cta-contact';qty.style.display='none';lblMsg.innerHTML='Message <span style="color:var(--slate-2);font-weight:500">(optional)</span>';note.textContent='We share your request with the seller. They will reach out to arrange a viewing.'}
  else{submit.textContent='Request quote';submit.className='btn btn-block cta-quote';qty.style.display='none';lblMsg.innerHTML='Describe what you need';note.textContent='Tell the provider what you need — they will send you a quote.'}
  overlay.classList.add('show');document.body.style.overflow='hidden'}
function closeModal(){overlay.classList.remove('show');document.body.style.overflow=''}
document.getElementById('closeModal').addEventListener('click',closeModal);
document.getElementById('successDone').addEventListener('click',closeModal);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show'))closeModal()});
document.getElementById('qMinus').addEventListener('click',()=>{const v=document.getElementById('qVal');v.value=Math.max(1,(+v.value)-1)});
document.getElementById('qPlus').addEventListener('click',()=>{const v=document.getElementById('qVal');v.value=(+v.value)+1});
document.getElementById('submitReq').addEventListener('click',()=>{const name=document.getElementById('fName').value.trim(),phone=document.getElementById('fPhone').value.trim();
  if(!name||!phone){[['fName',name],['fPhone',phone]].forEach(p=>{if(!p[1]){const el=document.getElementById(p[0]);el.style.borderColor='#ef4444';el.style.boxShadow='0 0 0 4px rgba(239,68,68,.12)';el.addEventListener('input',()=>{el.style.borderColor='';el.style.boxShadow=''},{once:true})}});return}
  const ref='SSD-'+Math.floor(100000+Math.random()*900000);document.getElementById('mForm').style.display='none';const t=currentItem.type;
  document.getElementById('sTitle').textContent=t==='order'?'Order placed!':t==='contact'?'Request sent!':'Quote requested!';
  document.getElementById('sMsg').innerHTML=t==='order'?'<b>'+currentItem.seller+'</b> received your order and will confirm availability and delivery shortly.':t==='contact'?'<b>'+currentItem.seller+'</b> got your request and will reach out on the number you provided.':'<b>'+currentItem.seller+'</b> will review your request and send a quote soon.';
  document.getElementById('sRef').textContent='REF · '+ref;document.getElementById('mSuccess').classList.add('show')});

/* legacy initPost removed — replaced by wizard-driven initPost below */

let toastT;function showToast(msg){const t=document.getElementById('toast');document.getElementById('toastMsg').innerHTML=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
const drawer=document.getElementById('drawer');function openDr(){drawer.classList.add('show');drawer.classList.add('open');const ob=document.getElementById('openDrawer');if(ob)ob.setAttribute('aria-expanded','true');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeDr(){drawer.classList.remove('show');drawer.classList.remove('open');const ob=document.getElementById('openDrawer');if(ob)ob.setAttribute('aria-expanded','false');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.getElementById('openDrawer').addEventListener('click',openDr);
document.getElementById('closeDrawer').addEventListener('click',closeDr);
document.getElementById('drawerBg').addEventListener('click',closeDr);
document.querySelectorAll('.drawer-nav').forEach(a=>a.addEventListener('click',closeDr));
/* Bottom-nav + drawer links: always scroll to top, even when tapping the current page */
(function(){
  function scrollTop(){try{window.scrollTo({top:0,left:0,behavior:'smooth'})}catch(e){window.scrollTo(0,0)}}
  document.querySelectorAll('.mob-bottom-nav .mn-item, .drawer-nav, .nav-actions a[data-nav], .nav-actions .nav-msg, .nav-links a').forEach(a=>{
    a.addEventListener('click',()=>{requestAnimationFrame(scrollTop);setTimeout(scrollTop,40)});
  });
})();
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open'))closeDr();});

const PAGES=['home','browse','listing','post','dashboard','shop','pricing','about','help','signin','signup','saved','messages','notifications'];
function parseHash(){let h=location.hash.replace(/^#/,'')||'home';const i=h.indexOf('?');let page=h,query='';if(i>=0){page=h.slice(0,i);query=h.slice(i+1)}if(!PAGES.includes(page))page='home';const params={};query.split('&').filter(Boolean).forEach(p=>{const [k,v]=p.split('=');params[k]=decodeURIComponent(v||'')});return {page,params}}
function route(){const {page,params}=parseHash();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('on',n.dataset.nav===page));document.body.classList.toggle('is-listing',page==='listing');window.scrollTo(0,0);closeDr();updateSavedBadge();if(typeof updateBadges==='function')updateBadges();
  if(page==='messages')renderMessages(params.c||'');
  if(page==='notifications')renderNotificationsPage();
  if(page==='browse')initBrowse();
  if(page==='listing')renderListingDetail(+params.id||1);
  if(page==='post')initPost();
  if(page==='dashboard')initDashboard();
  if(page==='shop')renderShopProfile(params.seller||'TechHub SS');
  if(page==='pricing'){renderPricing();renderFaq(document.getElementById('pricingFaq'),PRICING_FAQ)}
  if(page==='help')renderFaq(document.getElementById('helpFaq'),HELP_FAQ);
  if(page==='saved')renderSaved();
  setTimeout(revealInit,40);
}
function revealInit(){document.querySelectorAll('.reveal').forEach(el=>{if(!el.dataset.io){el.dataset.io=1;io.observe(el)}})}
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.1});
const hdr=document.getElementById('hdr');window.addEventListener('scroll',()=>hdr.classList.toggle('scrolled',window.scrollY>10));
window.addEventListener('hashchange',route);
/* NOTE: initial initHome()/route() bootstrap moved to end of file so all data
   (CONVERSATIONS, NOTIFICATIONS, etc.) is declared before route() first runs. */

/* ===== Auth (client-side, localStorage) ===== */
(function(){
  var KEY='nlAuth'; // {name, identifier, role, signedInAt}
  function getAuth(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  function setAuth(u){localStorage.setItem(KEY,JSON.stringify(u));applyAuthState();}
  function clearAuth(){localStorage.removeItem(KEY);applyAuthState();}

  function applyAuthState(){
    var authed=!!getAuth();
    document.documentElement.classList.toggle('is-authed',authed);
    document.documentElement.classList.toggle('is-guest',!authed);
    // Hide the home seller-preview block when not signed in
    var homeShop=document.getElementById('homeShop');
    if(homeShop){
      var block=homeShop.closest('section[data-block]')||homeShop.parentElement;
      if(block) block.style.display=authed?'':'none';
    }
    // Update any "sign in / sign out" affordances
    document.querySelectorAll('[data-auth-only]').forEach(function(el){el.style.display=authed?'':'none';});
    document.querySelectorAll('[data-guest-only]').forEach(function(el){el.style.display=authed?'none':'';});
    var nm=getAuth()&&getAuth().name;
    document.querySelectorAll('[data-auth-name]').forEach(function(el){el.textContent=nm||'';});
  }

  function guardRoute(){
    var hash=(location.hash||'').replace('#','').split('?')[0];
    if((hash==='dashboard')&&!getAuth()){
      location.hash='#signin';
      return true;
    }
    return false;
  }

  // Wire signin / signup forms. They live in [data-page="signin"] and [data-page="signup"].
  function wireForms(){
    var signin=document.querySelector('[data-page="signin"] form')||document.querySelector('[data-page="signin"]');
    var signup=document.querySelector('[data-page="signup"] form')||document.querySelector('[data-page="signup"]');
    // Sign in: any submit on the signin page sets auth
    function readIdent(scope){var f=scope.querySelector('input[type="email"]')||scope.querySelector('input[type="tel"]');return (f&&f.value)||'';}
    function deriveName(scope,ident){var nf=scope.querySelector('input[type="text"]');var typed=nf&&nf.value&&nf.value.trim();if(typed) return typed;if(ident&&ident.indexOf('@')>-1){var lp=ident.split('@')[0];return lp.charAt(0).toUpperCase()+lp.slice(1);}return 'Friend';}
    if(signin){
      signin.addEventListener('submit',function(e){e.preventDefault();var ident=readIdent(signin);var nm=deriveName(signin,ident);setAuth({name:nm,identifier:ident,role:'buyer',signedInAt:Date.now()});location.hash='#dashboard';});
      // Also catch button clicks in case there's no <form>
      signin.querySelectorAll('button').forEach(function(b){if(b.type!=='button')b.addEventListener('click',function(e){if(!signin.matches('form')){e.preventDefault();var ident=readIdent(signin);var nm=deriveName(signin,ident);setAuth({name:nm,identifier:ident,role:'buyer',signedInAt:Date.now()});location.hash='#dashboard';}});});
    }
    if(signup){
      signup.addEventListener('submit',function(e){e.preventDefault();var ident=readIdent(signup);var nm=deriveName(signup,ident);var role=(document.querySelector('[data-page="signup"] .role-opt.on')||{}).getAttribute&&document.querySelector('[data-page="signup"] .role-opt.on').getAttribute('data-role')||'buyer';setAuth({name:nm,identifier:ident,role:role,signedInAt:Date.now()});location.hash='#dashboard';});
    }
    // Sign-out triggers
    document.querySelectorAll('[data-signout]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();clearAuth();location.hash='#home';});});
  }

  window.addEventListener('hashchange',guardRoute);
  document.addEventListener('DOMContentLoaded',function(){wireForms();applyAuthState();guardRoute();});
  // If DOMContentLoaded already fired (script is `defer`, so DOM is ready), run now:
  if(document.readyState!=='loading'){wireForms();applyAuthState();guardRoute();}

  // Expose for console testing
  window.nlAuth={get:getAuth,set:setAuth,clear:clearAuth};
})();

/* ============================================================
   Month 2 sprint additions
   ============================================================ */

/* ---- Thin API data layer (Promise-returning facade ready for backend swap) ---- */
window.NL=window.NL||{};
NL.api=(function(){
  function delay(ms){return new Promise(r=>setTimeout(r,ms||60))}
  function ok(d){return delay().then(()=>({ok:true,data:d}))}
  return {
    listings:{
      list:(filters)=>ok(LISTINGS),
      get:(id)=>ok(LISTINGS.find(l=>l.id===+id)||null),
      create:(p)=>ok({id:'n'+Date.now(),...p,status:'pending'}),
      saveDraft:(p)=>ok({id:'d'+Date.now(),...p,status:'draft'})
    },
    favorites:{list:()=>ok(FAVS),toggle:(id)=>ok(toggleFav(id))},
    requests:{list:()=>ok(REQUESTS),create:(p)=>ok({id:'r'+Date.now(),...p,status:'new'})},
    messages:{
      conversations:()=>ok(CONVERSATIONS),
      thread:(id)=>ok(MESSAGES[id]||[]),
      send:(convId,text)=>{const m={from:'me',text,time:'Just now'};(MESSAGES[convId]=MESSAGES[convId]||[]).push(m);const c=CONVERSATIONS.find(x=>x.id===convId);if(c){c.lastMsg=text;c.lastTime='Just now'}return ok(m)}
    },
    notifications:{
      list:()=>ok(NOTIFICATIONS),
      markRead:(id)=>{const n=NOTIFICATIONS.find(x=>x.id===id);if(n)n.read=true;return ok(n)},
      markAllRead:()=>{NOTIFICATIONS.forEach(n=>n.read=true);return ok(NOTIFICATIONS)}
    },
    rate:{get:()=>ok(RATE)}
  };
})();

/* ---- Mock data: conversations, messages, notifications ---- */
const CONVERSATIONS=[
  {id:'c1',with:'TechHub SS',listingId:1,listingTitle:'iPhone 13 Pro · 256GB · Clean',lastMsg:'Yes, the price is negotiable. When can you pick up?',lastTime:'2h ago',unread:0,verified:true,avInitial:'T'},
  {id:'c2',with:'Nile Motors',listingId:2,listingTitle:'Toyota Land Cruiser V8 (2016)',lastMsg:'Can we meet tomorrow at 10am at the Tongping yard?',lastTime:'5h ago',unread:2,verified:true,avInitial:'N'},
  {id:'c3',with:'Juba Homes',listingId:3,listingTitle:'3-Bedroom House · Thongpiny',lastMsg:'I sent over the rental contract. Let me know.',lastTime:'1d ago',unread:0,verified:true,avInitial:'J'},
  {id:'c4',with:'Lensia Studio',listingId:4,listingTitle:'Wedding & Event Photography',lastMsg:'Looking forward to your wedding next month!',lastTime:'2d ago',unread:0,verified:false,avInitial:'L'},
  {id:'c5',with:'Achol Styles',listingId:5,listingTitle:'Ankara Two-Piece Set · Custom',lastMsg:'I have 3 fabric options I can show you.',lastTime:'3d ago',unread:1,verified:false,avInitial:'A'}
];
const MESSAGES={
  c1:[{from:'them',text:'Hi, is the iPhone still available?',time:'10:14'},{from:'me',text:'Yes, brand new condition. 256GB, battery health 92%.',time:'10:18'},{from:'them',text:'Can we negotiate on the price?',time:'10:22'},{from:'me',text:'A little. Best is $700 if you can pick up today.',time:'10:24'},{from:'them',text:'Yes, the price is negotiable. When can you pick up?',time:'2h ago'}],
  c2:[{from:'them',text:'Hello, interested in the Land Cruiser. Is it negotiable?',time:'Yesterday'},{from:'me',text:'Yes — come for inspection first then we talk price.',time:'Yesterday'},{from:'them',text:'Sounds good. Can we meet tomorrow at 10am at the Tongping yard?',time:'5h ago'}],
  c3:[{from:'me',text:'Hi, sending the rental contract now.',time:'1d ago'},{from:'them',text:'I sent over the rental contract. Let me know.',time:'1d ago'}],
  c4:[{from:'me',text:'Booked you for May 14 wedding.',time:'2d ago'},{from:'them',text:'Looking forward to your wedding next month!',time:'2d ago'}],
  c5:[{from:'them',text:'I have 3 fabric options I can show you.',time:'3d ago'}]
};
const NOTIFICATIONS=[
  {id:'no1',type:'request',title:'New order request',body:'Achol Deng wants to order iPhone 13 Pro · 256GB',time:'5m ago',read:false,link:'#dashboard',icon:'cart'},
  {id:'no2',type:'message',title:'New message',body:'Nile Motors: Can we meet tomorrow at 10am?',time:'2h ago',read:false,link:'#messages?c=c2',icon:'chat'},
  {id:'no3',type:'system',title:'Verified badge approved',body:'Your shop is now verified — buyers see the green tick everywhere.',time:'1d ago',read:false,link:'#dashboard',icon:'shield'},
  {id:'no4',type:'boost',title:'Boost ending soon',body:'Your boost on iPhone 13 Pro ends in 2 days.',time:'3d ago',read:true,link:'#listing?id=1',icon:'bolt'},
  {id:'no5',type:'request',title:'New quote request',body:'Mary Nyandeng requested a quote for Wedding Photography.',time:'5d ago',read:true,link:'#dashboard',icon:'doc'},
  {id:'no6',type:'system',title:'Welcome to Nile Link!',body:'Your account is set up. Start by listing your first item.',time:'1w ago',read:true,link:'#post',icon:'spark'}
];
const NOTIF_ICONS={
  cart:'<path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
  chat:'<path d="M4 5h16v11H8l-4 4z"/>',
  shield:'<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  bolt:'<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
  doc:'<path d="M14 2H6v20h12V6z"/><path d="M14 2v4h4"/>',
  spark:'<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/>'
};

/* ---- Recently viewed (localStorage) ---- */
let RECENT=[];try{RECENT=JSON.parse(localStorage.getItem('nl_recent')||'[]').map(Number).filter(Number.isFinite)}catch(e){RECENT=[]}
function pushRecent(id){id=+id;if(!id)return;RECENT=[id,...RECENT.filter(x=>x!==id)].slice(0,10);try{localStorage.setItem('nl_recent',JSON.stringify(RECENT))}catch(e){}renderRecentRail()}
function clearRecent(){RECENT=[];try{localStorage.removeItem('nl_recent')}catch(e){}renderRecentRail()}
function renderRecentRail(){
  const sec=document.getElementById('recentSection');const rail=document.getElementById('recentRail');if(!sec||!rail)return;
  const items=RECENT.map(id=>LISTINGS.find(l=>l.id===id)).filter(Boolean);
  if(!items.length){sec.hidden=true;return}
  sec.hidden=false;
  rail.innerHTML=items.map(it=>'<a href="#listing?id='+it.id+'" class="recent-card" role="listitem">'
    +'<div class="rc-media">'+(it.img?'<img src="'+it.img+'" alt="'+it.title+'" loading="lazy">':glyph(it.key,40))+'</div>'
    +'<div class="rc-body"><div class="rc-ttl">'+it.title+'</div><div class="rc-price">'+(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'')+'</div></div>'
    +'</a>').join('');
}

/* ---- Toast queue with types ---- */
const TOAST_ICONS={success:'<path d="M20 6L9 17l-5-5"/>',error:'<path d="M6 6l12 12M18 6L6 18"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',loading:'<circle cx="12" cy="12" r="8" stroke-dasharray="40" stroke-dashoffset="16"/>'};
function ensureToastStack(){let s=document.getElementById('toastStack');if(!s){s=document.createElement('div');s.id='toastStack';s.className='toast-stack';document.body.appendChild(s)}return s}
function toast(msg,opts){
  opts=opts||{};const type=opts.type||'success';const ms=opts.duration||2800;const stack=ensureToastStack();
  const el=document.createElement('div');el.className='t-card t-'+type;
  el.innerHTML='<span class="t-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+(TOAST_ICONS[type]||TOAST_ICONS.info)+'</svg></span><span class="t-msg">'+msg+'</span>';
  stack.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  if(type!=='loading'){setTimeout(()=>{el.classList.remove('show');el.classList.add('hide');setTimeout(()=>el.remove(),320)},ms)}
  return {dismiss:()=>{el.classList.add('hide');setTimeout(()=>el.remove(),320)},update:(newMsg,newType)=>{el.querySelector('.t-msg').innerHTML=newMsg;if(newType){el.className='t-card show t-'+newType}}}
}
/* keep legacy showToast working */
window.showToast=function(msg){toast(msg,{type:'success'})};

/* ---- Bell dropdown + notification rendering ---- */
function unreadCount(){return NOTIFICATIONS.filter(n=>!n.read).length}
function unreadMsgCount(){return CONVERSATIONS.reduce((a,c)=>a+(c.unread||0),0)}
function updateBadges(){
  const n=unreadCount();
  document.querySelectorAll('[data-notif-count]').forEach(el=>{
    if(n){el.textContent=n>9?'9+':n;el.classList.add('show')}else{el.classList.remove('show');el.textContent=''}
  });
  const m=unreadMsgCount();
  document.querySelectorAll('[data-msg-count]').forEach(el=>{
    if(m){el.textContent=m>9?'9+':m;el.classList.add('show')}else{el.classList.remove('show');el.textContent=''}
  });
}
function renderNotifDropdown(){
  const list=document.getElementById('notifList');if(!list)return;
  const show=NOTIFICATIONS.slice(0,5);
  if(!show.length){list.innerHTML='<div class="notif-empty">You&rsquo;re all caught up.</div>';return}
  list.innerHTML=show.map(n=>'<a href="'+n.link+'" class="notif-row'+(n.read?'':' unread')+'" data-notif="'+n.id+'" role="listitem"><span class="notif-ic notif-ic-'+n.type+'"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(NOTIF_ICONS[n.icon]||NOTIF_ICONS.spark)+'</svg></span><span class="notif-body"><span class="notif-ttl">'+n.title+'</span><span class="notif-msg">'+n.body+'</span><span class="notif-time">'+n.time+'</span></span>'+(n.read?'':'<span class="notif-dot" aria-label="Unread"></span>')+'</a>').join('');
}
function renderNotificationsPage(){
  const el=document.getElementById('notifPage');if(!el)return;
  if(!NOTIFICATIONS.length){el.innerHTML='<div class="saved-empty"><div class="se-ic"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg></div><h3>No notifications yet</h3><p>Activity on your listings and account will show here.</p></div>';return}
  el.innerHTML=NOTIFICATIONS.map(n=>'<a href="'+n.link+'" class="notif-row notif-row-lg'+(n.read?'':' unread')+'" data-notif="'+n.id+'"><span class="notif-ic notif-ic-'+n.type+'"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(NOTIF_ICONS[n.icon]||NOTIF_ICONS.spark)+'</svg></span><span class="notif-body"><span class="notif-ttl">'+n.title+'</span><span class="notif-msg">'+n.body+'</span><span class="notif-time">'+n.time+'</span></span>'+(n.read?'':'<span class="notif-dot"></span>')+'</a>').join('');
}
function markNotifRead(id){const n=NOTIFICATIONS.find(x=>x.id===id);if(n){n.read=true;updateBadges();renderNotifDropdown();renderNotificationsPage()}}
function markAllNotifRead(){NOTIFICATIONS.forEach(n=>n.read=true);updateBadges();renderNotifDropdown();renderNotificationsPage();toast('All notifications marked as read',{type:'success'})}

/* ---- Bell + dropdown bindings ---- */
(function(){
  const bell=document.getElementById('navBell');const dd=document.getElementById('notifDropdown');
  if(bell&&dd){
    bell.addEventListener('click',e=>{e.stopPropagation();const open=dd.classList.toggle('show');bell.setAttribute('aria-expanded',open?'true':'false');if(open)renderNotifDropdown()});
    document.addEventListener('click',e=>{if(!bell.contains(e.target)&&!dd.contains(e.target)){dd.classList.remove('show');bell.setAttribute('aria-expanded','false')}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dd.classList.contains('show')){dd.classList.remove('show');bell.setAttribute('aria-expanded','false');bell.focus()}});
    dd.addEventListener('click',e=>{const row=e.target.closest('[data-notif]');if(row)markNotifRead(row.dataset.notif)});
  }
  const clearBtn=document.getElementById('notifClear');if(clearBtn)clearBtn.addEventListener('click',markAllNotifRead);
  const clearAllPage=document.getElementById('notifClearAll');if(clearAllPage)clearAllPage.addEventListener('click',markAllNotifRead);
  const page=document.getElementById('notifPage');if(page)page.addEventListener('click',e=>{const row=e.target.closest('[data-notif]');if(row)markNotifRead(row.dataset.notif)});
  const rc=document.getElementById('recentClear');if(rc)rc.addEventListener('click',()=>{clearRecent();toast('Recently viewed cleared',{type:'success'})});
})();

/* ---- Messages: list + thread + composer ---- */
let activeConvId=null;let msgSearchQuery='';
function renderConvList(){
  const wrap=document.getElementById('msgConvList');const counter=document.getElementById('msgListCount');if(!wrap)return;
  const q=msgSearchQuery.trim().toLowerCase();
  const list=CONVERSATIONS.filter(c=>!q||c.with.toLowerCase().includes(q)||c.lastMsg.toLowerCase().includes(q)||c.listingTitle.toLowerCase().includes(q));
  if(counter)counter.textContent=list.length;
  if(!list.length){wrap.innerHTML='<div class="conv-empty">No conversations found.</div>';return}
  wrap.innerHTML=list.map(c=>'<button type="button" class="conv-row'+(c.id===activeConvId?' on':'')+'" data-conv="'+c.id+'" role="listitem"><span class="conv-av">'+c.avInitial+(c.verified?'<span class="conv-vtick"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'')+'</span><span class="conv-info"><span class="conv-top"><span class="conv-name">'+c.with+'</span><span class="conv-time">'+c.lastTime+'</span></span><span class="conv-snip">'+c.lastMsg+'</span><span class="conv-listing">'+c.listingTitle+'</span></span>'+(c.unread?'<span class="conv-unread">'+c.unread+'</span>':'')+'</button>').join('');
}
function openConversation(id){
  const c=CONVERSATIONS.find(x=>x.id===id);if(!c){document.getElementById('msgEmpty').hidden=false;return}
  activeConvId=id;c.unread=0;updateBadges();renderConvList();
  document.getElementById('msgEmpty').hidden=true;
  const head=document.getElementById('msgThreadHead');const body=document.getElementById('msgThreadBody');const comp=document.getElementById('msgComposer');
  head.hidden=false;body.hidden=false;comp.hidden=false;
  document.getElementById('mtAv').innerHTML=c.avInitial+(c.verified?'<span class="mt-vtick" aria-label="Verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'');
  document.getElementById('mtName').innerHTML=c.with+(c.verified?' <svg class="mt-tick" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':'');
  document.getElementById('mtSub').textContent='About: '+c.listingTitle;
  document.getElementById('mtViewListing').href='#listing?id='+c.listingId;
  const msgs=MESSAGES[id]||[];
  body.innerHTML=msgs.map(m=>'<div class="bubble bubble-'+m.from+'"><div class="bubble-text">'+m.text+'</div><div class="bubble-time">'+m.time+'</div></div>').join('')+'<div class="thread-typing" hidden id="threadTyping"><div class="bubble bubble-them tt-bubble"><span></span><span></span><span></span></div></div>';
  body.scrollTop=body.scrollHeight;
  document.querySelector('.msg-layout')?.classList.add('on-thread');
  if(history.replaceState)history.replaceState(null,'',location.pathname+location.search+'#messages?c='+id);
}
function backToConvList(){
  activeConvId=null;
  document.querySelector('.msg-layout')?.classList.remove('on-thread');
  document.getElementById('msgEmpty').hidden=false;
  document.getElementById('msgThreadHead').hidden=true;
  document.getElementById('msgThreadBody').hidden=true;
  document.getElementById('msgComposer').hidden=true;
  renderConvList();
  if(history.replaceState)history.replaceState(null,'',location.pathname+location.search+'#messages');
}
function sendMessage(){
  if(!activeConvId)return;
  const input=document.getElementById('msgInput');const text=(input.value||'').trim();if(!text)return;
  const c=CONVERSATIONS.find(x=>x.id===activeConvId);if(!c)return;
  const m={from:'me',text,time:'Just now'};(MESSAGES[activeConvId]=MESSAGES[activeConvId]||[]).push(m);
  c.lastMsg=text;c.lastTime='Just now';
  input.value='';input.style.height='';
  const body=document.getElementById('msgThreadBody');
  const bub=document.createElement('div');bub.className='bubble bubble-me bubble-in';bub.innerHTML='<div class="bubble-text">'+text+'</div><div class="bubble-time">Just now</div>';
  const tp=document.getElementById('threadTyping');body.insertBefore(bub,tp);body.scrollTop=body.scrollHeight;
  renderConvList();
  /* simulate reply typing */
  if(tp){tp.hidden=false;setTimeout(()=>{tp.hidden=true;const reply={from:'them',text:"Got it — thanks!",time:'Just now'};MESSAGES[activeConvId].push(reply);c.lastMsg=reply.text;const rb=document.createElement('div');rb.className='bubble bubble-them bubble-in';rb.innerHTML='<div class="bubble-text">'+reply.text+'</div><div class="bubble-time">Just now</div>';body.insertBefore(rb,tp);body.scrollTop=body.scrollHeight;renderConvList()},1400+Math.random()*900)}
}
function renderMessages(convId){
  renderConvList();
  if(convId){openConversation(convId)}else if(window.innerWidth>760&&CONVERSATIONS.length){openConversation(CONVERSATIONS[0].id)}else{backToConvList()}
}
(function(){
  const list=document.getElementById('msgConvList');if(list)list.addEventListener('click',e=>{const r=e.target.closest('[data-conv]');if(r)openConversation(r.dataset.conv)});
  const back=document.getElementById('msgBack');if(back)back.addEventListener('click',backToConvList);
  const search=document.getElementById('msgSearch');if(search)search.addEventListener('input',e=>{msgSearchQuery=e.target.value;renderConvList()});
  const send=document.getElementById('msgSend');if(send)send.addEventListener('click',sendMessage);
  const input=document.getElementById('msgInput');
  if(input){
    input.addEventListener('input',()=>{input.style.height='';input.style.height=Math.min(input.scrollHeight,140)+'px'});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}});
  }
})();

/* ---- Track recently viewed when entering a listing ---- */
const _origRenderListingDetail=renderListingDetail;
renderListingDetail=function(id){const r=_origRenderListingDetail.apply(this,arguments);if(LISTINGS.find(l=>l.id===+id))pushRecent(id);return r};

/* ---- Post wizard ---- */
const PW={step:1,photos:[],MAX_PHOTOS:6};
const PW_CATS=[
  {key:'electronics',name:'Phones & Electronics',sub:'Phones, laptops, audio'},
  {key:'fashion',name:'Fashion & Beauty',sub:'Clothes, shoes, beauty'},
  {key:'cars',name:'Cars & Motorbikes',sub:'Vehicles, bikes, parts'},
  {key:'property',name:'Property & Land',sub:'Houses, rentals, land'},
  {key:'services',name:'Services',sub:'Photography, cleaning, more'}
];
function renderPwCats(){
  const wrap=document.getElementById('pwCats');if(!wrap)return;
  const cur=document.getElementById('pCat').value||'electronics';
  wrap.innerHTML=PW_CATS.map(c=>'<button type="button" class="pw-cat'+(c.key===cur?' on':'')+'" data-pw-cat="'+c.key+'"><span class="pw-cat-ic">'+glyph(c.key,24)+'</span><span class="pw-cat-tx"><b>'+c.name+'</b><span>'+c.sub+'</span></span></button>').join('');
}
function pwGotoStep(n){
  PW.step=Math.max(1,Math.min(4,n));
  document.querySelectorAll('#pwProgress .pw-step').forEach(s=>{const idx=+s.dataset.step;s.classList.toggle('on',idx===PW.step);s.classList.toggle('done',idx<PW.step)});
  document.querySelectorAll('.pw-panel').forEach(p=>{p.hidden=+p.dataset.panel!==PW.step});
  document.getElementById('pwBack').hidden=PW.step===1;
  document.getElementById('pwNext').hidden=PW.step===4;
  document.getElementById('publishBtn').hidden=PW.step!==4;
  if(PW.step===4)pwRenderReview();
  document.querySelector('.pw-form')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function fieldErr(id,msg){const e=document.getElementById(id+'Err');const f=document.getElementById(id);if(!e||!f)return;if(msg){e.textContent=msg;e.hidden=false;f.classList.add('err');f.addEventListener('input',()=>{e.hidden=true;f.classList.remove('err')},{once:true})}else{e.hidden=true;f.classList.remove('err')}}
function pwValidate(step){
  let ok=true;
  if(step===1){const t=document.getElementById('pTitle').value.trim();if(t.length<6){fieldErr('pTitle','At least 6 characters — include brand, model or size.');ok=false}else fieldErr('pTitle','')}
  if(step===2){const d=document.getElementById('pDesc').value.trim();if(d.length<20){fieldErr('pDesc','At least 20 characters — describe condition and what&rsquo;s included.');ok=false}else fieldErr('pDesc','')}
  if(step===3){const p=document.getElementById('pPrice').value;if(!p||+p<=0){fieldErr('pPrice','Enter a price greater than 0.');ok=false}else fieldErr('pPrice','');const l=document.getElementById('pLoc').value.trim();if(l.length<2){fieldErr('pLoc','Add at least a city or area.');ok=false}else fieldErr('pLoc','')}
  return ok;
}
function pwRenderReview(){
  const k=document.getElementById('pCat').value;const cat=PW_CATS.find(c=>c.key===k);
  const title=document.getElementById('pTitle').value.trim();const desc=document.getElementById('pDesc').value.trim();
  const price=+document.getElementById('pPrice').value||0;const loc=document.getElementById('pLoc').value.trim();
  document.getElementById('pwReview').innerHTML='<div class="rv-row"><div class="rv-label">Category</div><div class="rv-val">'+(cat?cat.name:k)+' <button type="button" class="rv-edit" data-pw-goto="1">Edit</button></div></div>'
    +'<div class="rv-row"><div class="rv-label">Title</div><div class="rv-val">'+(title||'<i>Not set</i>')+' <button type="button" class="rv-edit" data-pw-goto="1">Edit</button></div></div>'
    +'<div class="rv-row"><div class="rv-label">Photos</div><div class="rv-val">'+(PW.photos.length?'<div class="rv-photos">'+PW.photos.map(p=>'<img src="'+p+'" alt="">').join('')+'</div>':'<i>No photos added</i>')+' <button type="button" class="rv-edit" data-pw-goto="2">Edit</button></div></div>'
    +'<div class="rv-row"><div class="rv-label">Description</div><div class="rv-val rv-desc">'+(desc||'<i>Not set</i>')+' <button type="button" class="rv-edit" data-pw-goto="2">Edit</button></div></div>'
    +'<div class="rv-row"><div class="rv-label">Price</div><div class="rv-val">'+(price?'<b>'+fmtUSD(price)+'</b> <span class="rv-ssp">≈ '+fmtSSP(price*RATE)+'</span>':'<i>Not set</i>')+' <button type="button" class="rv-edit" data-pw-goto="3">Edit</button></div></div>'
    +'<div class="rv-row"><div class="rv-label">Location</div><div class="rv-val">'+(loc||'<i>Not set</i>')+' <button type="button" class="rv-edit" data-pw-goto="3">Edit</button></div></div>';
}
function pwRenderPhotos(){
  const wrap=document.getElementById('pwPhotos');if(!wrap)return;
  wrap.innerHTML=PW.photos.map((src,i)=>'<div class="pw-photo'+(i===0?' cover':'')+'" role="listitem"><img src="'+src+'" alt="Photo '+(i+1)+'"><button type="button" class="pw-photo-rm" data-rm="'+i+'" aria-label="Remove"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+(i===0?'<span class="pw-cover-tag">Cover</span>':'')+'</div>').join('');
  const add=document.getElementById('pwAddPhoto');if(add)add.disabled=PW.photos.length>=PW.MAX_PHOTOS;
}
let postBound=false;
function initPost(){
  /* keep this function name so route() and existing code still work */
  if(postBound){pwGotoStep(1);return}
  postBound=true;
  const cat=document.getElementById('pCat');const title=document.getElementById('pTitle');const desc=document.getElementById('pDesc');const price=document.getElementById('pPrice');const loc=document.getElementById('pLoc');
  const ssp=document.getElementById('pSsp');const ctaLbl=document.getElementById('ctaHintLabel');const ctaPill=document.getElementById('ctaHintPill');const preview=document.getElementById('previewCard');
  const ctaMap={electronics:['Order Now','Order'],fashion:['Order Now','Order'],cars:['Request Contact','Contact'],property:['Request Contact','Contact'],services:['Request Quote','Quote']};
  function syncCTA(){const m=ctaMap[cat.value]||ctaMap.electronics;ctaLbl.textContent=m[0];ctaPill.textContent=m[1]}
  function syncSsp(){ssp.textContent='≈ '+fmtSSP((+price.value||0)*RATE)}
  function syncTitleCount(){const c=document.getElementById('pTitleCount');if(c)c.textContent=(title.value.length||0)+'/60'}
  function syncDescCount(){const c=document.getElementById('pDescCount');if(c)c.textContent=(desc.value.length||0)+' chars'}
  function syncPreview(){const it={id:'new',title:title.value||'Your listing title',cat:CATLABEL[cat.value],key:cat.value,usd:+price.value||0,loc:loc.value||'Your location',seller:'You',type:typeForCat(cat.value),group:groupForCat(cat.value),badges:[],img:PW.photos[0]||''};preview.innerHTML=cardHTML(it,0)}
  [cat,title,desc,price,loc].forEach(el=>el&&el.addEventListener('input',()=>{syncCTA();syncSsp();syncTitleCount();syncDescCount();syncPreview()}));
  renderPwCats();
  document.getElementById('pwCats')?.addEventListener('click',e=>{const b=e.target.closest('[data-pw-cat]');if(b){cat.value=b.dataset.pwCat;cat.dispatchEvent(new Event('input'));renderPwCats()}});
  document.getElementById('pwNext').addEventListener('click',()=>{if(pwValidate(PW.step))pwGotoStep(PW.step+1)});
  document.getElementById('pwBack').addEventListener('click',()=>pwGotoStep(PW.step-1));
  document.getElementById('pwReview')?.addEventListener('click',e=>{const g=e.target.closest('[data-pw-goto]');if(g)pwGotoStep(+g.dataset.pwGoto)});
  /* photos */
  const file=document.getElementById('pwFile');const addBtn=document.getElementById('pwAddPhoto');
  if(addBtn)addBtn.addEventListener('click',()=>file?.click());
  if(file)file.addEventListener('change',e=>{
    const files=[...(e.target.files||[])];
    files.slice(0,PW.MAX_PHOTOS-PW.photos.length).forEach(f=>{const r=new FileReader();r.onload=ev=>{PW.photos.push(ev.target.result);pwRenderPhotos();syncPreview()};r.readAsDataURL(f)});
    file.value='';
  });
  document.getElementById('pwPhotos')?.addEventListener('click',e=>{const rm=e.target.closest('[data-rm]');if(rm){PW.photos.splice(+rm.dataset.rm,1);pwRenderPhotos();syncPreview()}});
  /* publish + draft */
  document.getElementById('publishBtn').onclick=()=>{
    if(!pwValidate(1)){pwGotoStep(1);return}
    if(!pwValidate(2)){pwGotoStep(2);return}
    if(!pwValidate(3)){pwGotoStep(3);return}
    const k=cat.value;
    NL.api.listings.create({title:title.value.trim(),cat:CATLABEL[k],key:k,usd:+price.value,loc:loc.value.trim(),desc:desc.value.trim(),img:PW.photos[0]||'',imgs:PW.photos.slice(),note:k==='property'?'/mo':''}).then(r=>{
      SHOP.unshift({id:r.data.id,title:r.data.title,cat:r.data.cat,key:r.data.key,usd:r.data.usd,note:r.data.note,status:'pending'});
      toast('Listing submitted — awaiting review',{type:'success'});
      setTimeout(()=>location.hash='#dashboard',700);
    });
  };
  document.getElementById('draftBtn').onclick=()=>{
    if(!title.value.trim()){toast('Add a title first',{type:'error'});pwGotoStep(1);return}
    const k=cat.value;
    NL.api.listings.saveDraft({title:title.value.trim(),cat:CATLABEL[k],key:k,usd:+price.value||0,loc:loc.value.trim(),desc:desc.value.trim(),img:PW.photos[0]||'',note:k==='property'?'/mo':''}).then(r=>{
      SHOP.unshift({id:r.data.id,title:r.data.title,cat:r.data.cat,key:r.data.key,usd:r.data.usd,note:r.data.note,status:'draft',pct:30,missing:'Add more details'});
      toast('Saved as draft',{type:'success'});
      setTimeout(()=>location.hash='#dashboard',600);
    });
  };
  syncCTA();syncSsp();syncTitleCount();syncDescCount();syncPreview();pwGotoStep(1);
}

/* ---- Initial hydration of badges + recent rail ---- */
document.addEventListener('DOMContentLoaded',()=>{updateBadges();renderRecentRail()});
updateBadges();renderRecentRail();

/* ---- App bootstrap (runs last, after every const/function above is defined) ---- */
function bootApp(){initHome();route();}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',bootApp);}else{bootApp();}
