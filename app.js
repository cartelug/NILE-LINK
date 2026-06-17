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
const ICONS={electronics:'<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 18.5h4"/>',fashion:'<path d="M8 3l-4 4 2.5 2.5L8 8v13h8V8l1.5 1.5L20 7l-4-4-2 2a2 2 0 0 1-4 0z"/>',cars:'<path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5"/><path d="M3 13h18v4a1 1 0 0 1-1 1h-2M3 13v4a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',property:'<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-6h5v6"/>',services:'<path d="M14.5 6.5a3.5 3.5 0 0 1-4.7 4.7L4 17l3 3 5.8-5.8a3.5 3.5 0 0 1 4.7-4.7l-2.5 2.5-1.4-1.4 2.5-2.5"/>'};
function glyph(k,s){return '<svg class="glyph" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="#2f4d0c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[k]||ICONS.services)+'</svg>'}
const RATE=4585;
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
      '<button class="fav" data-fav="'+it.id+'" aria-label="Save"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>'+
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
  if(fav){e.stopPropagation();fav.classList.toggle('on');const s=fav.querySelector('svg');if(s){s.classList.add('pop');setTimeout(()=>s.classList.remove('pop'),300)}return}
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
const STEPS={buy:[{h:'Browse & search',p:'Filter by category, location and price across phones, cars, property, fashion and services.'},{h:'Order or request',p:'Tap Order Now, Request Contact, or Request Quote. Your details are captured safely inside Nile Link.'},{h:'Close with confidence',p:'Verified sellers follow up to confirm, arrange a viewing or delivery, and close the deal.'}],sell:[{h:'Post or save a draft',p:'Add photos, price, location and category in minutes — or save as a draft and finish later.'},{h:'Receive real requests',p:'Get orders, contacts and quotes from serious buyers, organized in your shop dashboard.'},{h:'Grow & get paid',p:'Boost listings, earn a verified badge, and close more deals.'}]};
function renderSteps(m){document.getElementById('steps').innerHTML=STEPS[m].map((s,i)=>'<div class="step" style="animation:rise .5s ease both;animation-delay:'+(i*65)+'ms"><div class="num"></div><h3>'+s.h+'</h3><p>'+s.p+'</p><div class="bigno">'+(i+1)+'</div></div>').join('')}
document.getElementById('howToggle').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#howToggle button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSteps(b.dataset.mode)});
const browseState={search:'',cats:[],type:'all',max:42000,sort:'featured'};
let browseBound=false;
function buildBrowseFilters(){document.getElementById('fltCats').innerHTML=CATEGORIES.map(c=>'<label class="check"><input type="checkbox" value="'+c.key+'" class="fcat"> '+c.name+'</label>').join('');document.querySelectorAll('.fcat').forEach(cb=>cb.addEventListener('change',()=>{browseState.cats=[...document.querySelectorAll('.fcat:checked')].map(x=>x.value);renderBrowse()}))}
function renderBrowse(){let l=LISTINGS.filter(it=>{if(browseState.search){const q=browseState.search.toLowerCase();if(!(it.title.toLowerCase().includes(q)||it.cat.toLowerCase().includes(q)||it.seller.toLowerCase().includes(q)))return false}if(browseState.cats.length&&!browseState.cats.includes(it.key))return false;if(browseState.type!=='all'&&it.group!==browseState.type)return false;if(it.usd>browseState.max)return false;return true});if(browseState.sort==='low')l=[...l].sort((a,b)=>a.usd-b.usd);else if(browseState.sort==='high')l=[...l].sort((a,b)=>b.usd-a.usd);else if(browseState.sort==='az')l=[...l].sort((a,b)=>a.title.localeCompare(b.title));const rc=document.getElementById('resCount');if(rc)rc.textContent=l.length;renderGrid(document.getElementById('browseGrid'),l)}
function initBrowse(){if(!browseBound){buildBrowseFilters();document.getElementById('browseSearch').addEventListener('input',e=>{browseState.search=e.target.value;renderBrowse()});document.querySelectorAll('input[name=ftype]').forEach(r=>r.addEventListener('change',e=>{browseState.type=e.target.value;renderBrowse()}));const pr=document.getElementById('priceRange');pr.addEventListener('input',e=>{browseState.max=+e.target.value;document.getElementById('priceLabel').textContent='Up to '+fmtUSD(+e.target.value);renderBrowse()});document.getElementById('sortSel').addEventListener('change',e=>{browseState.sort=e.target.value;renderBrowse()});document.getElementById('resetFilters').addEventListener('click',()=>{browseState.search='';browseState.cats=[];browseState.type='all';browseState.max=42000;browseState.sort='featured';document.getElementById('browseSearch').value='';document.querySelectorAll('.fcat').forEach(x=>x.checked=false);document.querySelector('input[name=ftype][value=all]').checked=true;pr.value=42000;document.getElementById('priceLabel').textContent='Up to $42,000';document.getElementById('sortSel').value='featured';renderBrowse()});document.getElementById('filterToggle').addEventListener('click',()=>document.getElementById('filters').classList.toggle('open'));browseBound=true}renderBrowse()}
function renderListingDetail(id){
  const it=LISTINGS.find(x=>x.id===id)||LISTINGS[0];
  document.getElementById('pdpCrumb').innerHTML='<a href="#home">Home</a> › <a href="#browse">'+it.cat+'</a> › <span>'+it.title+'</span>';
  const cta=CTA[it.type];
  const specs=it.group==='vehprop'?[['Location',it.loc],['Listing type',it.cat],['Status','Available'],['Seller',it.seller]]:[['Condition','Excellent'],['Location',it.loc],['Category',it.cat],['Seller',it.seller]];
  document.getElementById('pdpContent').innerHTML='<div class="pdp-gallery"><div class="main-img"><div class="badges">'+it.badges.map(badgeHTML).join('')+'</div>'+(it.img?'<img src="'+it.img+'" alt="'+it.title+'" class="pdp-main-img" loading="eager">':glyph(it.key,120))+'</div><div class="pdp-thumbs">'+[0,1,2,3].map(n=>'<div class="pdp-thumb '+(n===0?'on':'')+'">'+(it.img?'<img src="'+it.img+'" alt="" loading="lazy">':glyph(it.key,30))+'</div>').join('')+'</div></div><div class="pdp-info"><div class="cat">'+it.cat+'</div><h1>'+it.title+'</h1><span class="pdp-loc"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'+it.loc+' · posted 2 days ago</span><div class="pdp-price"><span class="u">'+(it.from?'From ':'')+fmtUSD(it.usd)+(it.note?'<small>'+it.note+'</small>':'')+'</span><span class="s">≈ '+fmtSSP(it.usd*RATE)+(it.note||'')+'</span></div><div class="seller-card"><div class="av">'+it.seller[0]+'</div><div><div class="nm">'+it.seller+(it.badges.includes('verified')?' <span class="vb"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'')+'</div><div class="lv">'+(it.badges.includes('verified')?'Verified seller':'Seller')+' · Juba</div></div><a href="#shop?seller='+encodeURIComponent(it.seller)+'" class="vshop">View shop ›</a></div><div class="pdp-cta"><button class="btn btn-lg btn-block '+cta.cls+'" data-cta="'+it.id+'"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+cta.icon+'</svg>'+cta.label+'</button></div><div class="pdp-actions-row"><button class="pdp-icon-btn" data-fav="'+it.id+'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>Save</button><button class="pdp-icon-btn" onclick="showToast(\'Listing link copied to share\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>Share</button><button class="pdp-icon-btn" onclick="showToast(\'Reported — our team will review\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4h13l-2 4 2 4H4"/></svg>Report</button></div><div class="pdp-note"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg><p>Your request stays inside Nile Link. The seller follows up directly — no payment is taken on the platform.</p></div><div class="pdp-section"><h3>Description</h3><p>'+it.desc+'</p></div><div class="pdp-section"><h3>Details</h3><div class="specs">'+specs.map(s=>'<div class="spec"><span class="k">'+s[0]+'</span><span class="v">'+s[1]+'</span></div>').join('')+'</div></div></div>';
  renderGrid(document.getElementById('similarGrid'),LISTINGS.filter(x=>x.group===it.group&&x.id!==it.id).slice(0,4));
}

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

let postBound=false;
function previewListing(){const cat=document.getElementById('pCat').value;const title=document.getElementById('pTitle').value||'Your listing title';const usd=+document.getElementById('pPrice').value||0;const loc=document.getElementById('pLoc').value||'Location';const t=typeForCat(cat);const cta=CTA[t];const it={id:0,title:title,cat:CATLABEL[cat],key:cat,usd:usd,note:cat==='property'?'/mo':'',loc:loc,seller:'You',type:t,group:groupForCat(cat),badges:['boost']};document.getElementById('previewCard').innerHTML=cardHTML(it,0)}
function initPost(){
  if(!postBound){
    const cat=document.getElementById('pCat'),title=document.getElementById('pTitle'),desc=document.getElementById('pDesc'),price=document.getElementById('pPrice'),loc=document.getElementById('pLoc');
    function updHint(){const k=cat.value;const t=typeForCat(k);const lbl={order:'Order Now',contact:'Request Contact',quote:'Request Quote'}[t];const pill={order:'Order',contact:'Contact',quote:'Quote'}[t];document.getElementById('ctaHintLabel').textContent=lbl;document.getElementById('ctaHintPill').textContent=pill;previewListing()}
    function updSsp(){const v=+price.value||0;document.getElementById('pSsp').textContent='≈ '+fmtSSP(v*RATE);previewListing()}
    cat.addEventListener('change',updHint);[title,desc,price,loc].forEach(el=>el.addEventListener('input',previewListing));price.addEventListener('input',updSsp);
    document.getElementById('publishBtn').addEventListener('click',()=>{if(!title.value.trim()||!price.value){showToast('Add a title and price first');return}const k=cat.value;SHOP.unshift({id:'n'+Date.now(),title:title.value.trim(),cat:CATLABEL[k],key:k,usd:+price.value,note:k==='property'?'/mo':'',status:'pending'});showToast('Published — awaiting review');setTimeout(()=>location.hash='#dashboard',600)});
    document.getElementById('draftBtn').addEventListener('click',()=>{if(!title.value.trim()){showToast('Add a title first');return}const k=cat.value;SHOP.unshift({id:'d'+Date.now(),title:title.value.trim(),cat:CATLABEL[k],key:k,usd:+price.value||0,note:k==='property'?'/mo':'',status:'draft',pct:30,missing:'Add more details'});showToast('Saved as draft');setTimeout(()=>location.hash='#dashboard',600)});
    postBound=true;
  }
  previewListing();
}

let toastT;function showToast(msg){const t=document.getElementById('toast');document.getElementById('toastMsg').innerHTML=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
const drawer=document.getElementById('drawer');function openDr(){drawer.classList.add('show');drawer.classList.add('open');const ob=document.getElementById('openDrawer');if(ob)ob.setAttribute('aria-expanded','true');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeDr(){drawer.classList.remove('show');drawer.classList.remove('open');const ob=document.getElementById('openDrawer');if(ob)ob.setAttribute('aria-expanded','false');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.getElementById('openDrawer').addEventListener('click',openDr);
document.getElementById('closeDrawer').addEventListener('click',closeDr);
document.getElementById('drawerBg').addEventListener('click',closeDr);
document.querySelectorAll('.drawer-nav').forEach(a=>a.addEventListener('click',closeDr));
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open'))closeDr();});

const PAGES=['home','browse','listing','post','dashboard','shop','pricing','about','help','signin','signup'];
function parseHash(){let h=location.hash.replace(/^#/,'')||'home';const i=h.indexOf('?');let page=h,query='';if(i>=0){page=h.slice(0,i);query=h.slice(i+1)}if(!PAGES.includes(page))page='home';const params={};query.split('&').filter(Boolean).forEach(p=>{const [k,v]=p.split('=');params[k]=decodeURIComponent(v||'')});return {page,params}}
function route(){const {page,params}=parseHash();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('on',n.dataset.nav===page));window.scrollTo(0,0);closeDr();
  if(page==='browse')initBrowse();
  if(page==='listing')renderListingDetail(+params.id||1);
  if(page==='post')initPost();
  if(page==='dashboard')initDashboard();
  if(page==='shop')renderShopProfile(params.seller||'TechHub SS');
  if(page==='pricing'){renderPricing();renderFaq(document.getElementById('pricingFaq'),PRICING_FAQ)}
  if(page==='help')renderFaq(document.getElementById('helpFaq'),HELP_FAQ);
  setTimeout(revealInit,40);
}
function revealInit(){document.querySelectorAll('.reveal').forEach(el=>{if(!el.dataset.io){el.dataset.io=1;io.observe(el)}})}
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.1});
const hdr=document.getElementById('hdr');window.addEventListener('scroll',()=>hdr.classList.toggle('scrolled',window.scrollY>10));
window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',()=>{initHome();route()});
initHome();route();

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
