/* ============================================================
   NILE LINK — browse.js  (v2 upgraded)
   Category strip · neighborhood filter · quick-filter pills ·
   save search · grid/map toggle.
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
  const state={search:'',cats:[],type:'all',max:42000,sort:'featured',hoods:[],pills:[]};

  const p=new URLSearchParams(location.search);
  if(p.get('q'))state.search=p.get('q');
  if(p.get('cat'))state.cats=[p.get('cat')];
  if(p.get('group'))state.type=p.get('group');

  /* ---- Category strip (always visible) ---- */
  const CAT_ICONS={
    electronics:'<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/>',
    fashion:'<path d="M8.5 3.5L4.5 6.5L7 9.5L8.5 8.5V21H15.5V8.5L17 9.5L19.5 6.5L15.5 3.5"/>',
    cars:'<path d="M3.5 16V11.5L5.4 7.5C5.7 6.7 6.5 6.2 7.3 6.2H16.7C17.5 6.2 18.3 6.7 18.6 7.5L20.5 11.5V16"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    property:'<path d="M3.5 11L12 3.5L20.5 11"/><path d="M5.5 9.5V20H18.5V9.5"/>',
    services:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.9-5.9a3.5 3.5 0 0 0 4.8-4.8l-2.5 2.5-1.5-1.5z"/>'
  };
  const HOODS=['Hai Cinema','Tongping','Thongpiny','Gudele','Munuki','Jebel','Konyokonyo','Custom','Hai Malakal','Nimra Talata'];

  function renderStrip(){
    const all='<button class="cat-chip'+(state.cats.length?'':' on')+'" data-cat=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>All</button>';
    $('#catStrip').innerHTML=all+D.CATEGORIES.map(c=>
      '<button class="cat-chip'+(state.cats.includes(c.key)?' on':'')+'" data-cat="'+c.key+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+CAT_ICONS[c.key]+'</svg>'+c.short+'</button>'
    ).join('');
    $('#catStrip').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;state.cats=b.dataset.cat?[b.dataset.cat]:[];renderStrip();syncDesktop();render()},{once:true});
  }

  function buildDesktop(){
    $('#fltHoods').innerHTML=HOODS.map(h=>'<label class="check"><input type="checkbox" class="fhood" value="'+h+'"'+(state.hoods.includes(h)?' checked':'')+'> '+h+'</label>').join('');
    $$('.fhood').forEach(cb=>cb.addEventListener('change',()=>{state.hoods=[...$$('.fhood:checked')].map(x=>x.value);render()}));
    $$('input[name="ftype"]').forEach(r=>r.addEventListener('change',e=>{state.type=e.target.value;render()}));
    const mr=$('#fltMax');mr.value=state.max;mr.addEventListener('input',()=>{state.max=+mr.value;$('#fltMaxVal').textContent=NL.fmtUSD(state.max);render()});
    $('#fltMaxVal').textContent=NL.fmtUSD(state.max);
  }
  function syncDesktop(){
    const r=document.querySelector('input[name="ftype"][value="'+state.type+'"]');if(r)r.checked=true;
    const mr=$('#fltMax');if(mr){mr.value=state.max;$('#fltMaxVal').textContent=NL.fmtUSD(state.max)}
    $$('.fhood').forEach(cb=>cb.checked=state.hoods.includes(cb.value));
  }

  function renderSheet(){
    $('#sheetBody').innerHTML=$('#filters').innerHTML;
    $('#sheetBody').querySelectorAll('.fhood').forEach(cb=>{cb.checked=state.hoods.includes(cb.value);cb.addEventListener('change',()=>{state.hoods=[...$('#sheetBody').querySelectorAll('.fhood:checked')].map(x=>x.value);syncDesktop();render()})});
    $('#sheetBody').querySelectorAll('input[name="ftype"]').forEach(r=>{r.name='sftype';r.checked=r.value===state.type;r.addEventListener('change',e=>{state.type=e.target.value;syncDesktop();render()})});
    const mr=$('#sheetBody').querySelector('#fltMax');if(mr){mr.id='sfltMax';mr.value=state.max;const vlbl=$('#sheetBody').querySelector('#fltMaxVal');if(vlbl){vlbl.id='sfltMaxVal';vlbl.textContent=NL.fmtUSD(state.max)}mr.addEventListener('input',()=>{state.max=+mr.value;$('#sfltMaxVal').textContent=NL.fmtUSD(state.max);syncDesktop();render()})}
  }

  /* ---- Quick filter pills ---- */
  function bindPills(){
    $('#browsePills').addEventListener('click',e=>{const b=e.target.closest('[data-pill]');if(!b)return;const k=b.dataset.pill;const i=state.pills.indexOf(k);if(i>=0)state.pills.splice(i,1);else state.pills.push(k);b.classList.toggle('on');render()});
  }

  function renderActive(){
    const chips=[];
    if(state.search)chips.push({k:'search',label:'"'+state.search+'"'});
    state.cats.forEach(c=>{const cat=D.CATEGORIES.find(x=>x.key===c);if(cat)chips.push({k:'cat:'+c,label:cat.name})});
    state.hoods.forEach(h=>chips.push({k:'hood:'+h,label:h}));
    if(state.type!=='all'){const tl={products:'Products',vehprop:'Cars & Property',services:'Services'};chips.push({k:'type',label:tl[state.type]})}
    if(state.max<42000)chips.push({k:'price',label:'Under '+NL.fmtUSD(state.max)});
    $('#activeFilters').innerHTML=chips.map(c=>'<span class="afilter">'+c.label+'<button data-rm="'+c.k+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>').join('');
  }
  function removeFilter(k){
    if(k==='search'){state.search='';$('#browseSearch').value=''}
    else if(k.startsWith('cat:')){state.cats=state.cats.filter(x=>x!==k.slice(4));renderStrip()}
    else if(k.startsWith('hood:'))state.hoods=state.hoods.filter(x=>x!==k.slice(5));
    else if(k==='type')state.type='all';
    else if(k==='price')state.max=42000;
    syncDesktop();render();
  }

  function applyPills(list){
    let r=list;
    if(state.pills.includes('verified'))r=r.filter(x=>x.badges.includes('verified'));
    if(state.pills.includes('photos'))r=r.filter(x=>!!x.img);
    if(state.pills.includes('under100'))r=r.filter(x=>x.usd<100);
    if(state.pills.includes('under1k'))r=r.filter(x=>x.usd<1000);
    if(state.pills.includes('boosted'))r=r.filter(x=>x.badges.includes('boost')||x.badges.includes('feat'));
    if(state.pills.includes('negotiable'))r=r.filter(x=>x.group!=='services');
    return r;
  }

  function render(){
    renderActive();
    NL.renderSkeleton($('#browseGrid'),8);
    NL.api.listings.list(state).then(r=>{
      let list=applyPills(r.data);
      if(state.hoods.length)list=list.filter(x=>state.hoods.some(h=>(x.loc||'').includes(h)));
      NL.renderGrid($('#browseGrid'),list);
      $('#browseCount').textContent=list.length+' result'+(list.length!==1?'s':'');
      if(state.cats.length===1){const c=D.CATEGORIES.find(x=>x.key===state.cats[0]);if(c){$('#browseTitle').textContent=c.name;$('#crumbCat').textContent=c.name;document.title=c.name+' — Nile Link'}}
      else{$('#browseTitle').textContent='Browse listings';$('#crumbCat').textContent='All listings'}
    });
  }

  function bindBar(){
    const i=$('#browseSearch');i.value=state.search;
    let t;i.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{state.search=i.value;render()},160)});
    $('#browseSort').addEventListener('change',e=>{state.sort=e.target.value;render()});
  }
  function bindSheet(){
    const open=()=>{renderSheet();$('#filterSheet').classList.add('open');$('#sheetScrim').classList.add('open');document.body.style.overflow='hidden'};
    const close=()=>{$('#filterSheet').classList.remove('open');$('#sheetScrim').classList.remove('open');document.body.style.overflow=''};
    $('#fltTrigger').addEventListener('click',open);$('#sheetClose').addEventListener('click',close);$('#sheetApply').addEventListener('click',close);$('#sheetScrim').addEventListener('click',close);
  }
  function bindView(){
    document.querySelector('.view-toggle').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;document.querySelectorAll('.view-toggle button').forEach(x=>x.classList.remove('on'));b.classList.add('on');const m=b.dataset.view==='map';$('#browseGrid').style.display=m?'none':'';$('#browseMap').style.display=m?'grid':'none'});
  }
  function bindSave(){
    $('#saveSearch').addEventListener('click',()=>{
      const saved=JSON.parse(localStorage.getItem('nl_saved_searches')||'[]');
      saved.unshift({state:JSON.parse(JSON.stringify(state)),at:Date.now()});localStorage.setItem('nl_saved_searches',JSON.stringify(saved.slice(0,10)));
      NL.toast('Search saved · we\'ll alert you of matches',{type:'success'});
    });
  }

  document.addEventListener('click',e=>{const rm=e.target.closest('[data-rm]');if(rm)removeFilter(rm.dataset.rm);const cb=e.target.closest('#catStrip [data-cat]');if(cb){state.cats=cb.dataset.cat?[cb.dataset.cat]:[];renderStrip();syncDesktop();render()}});
  document.addEventListener('nl:rate',render);

  function init(){renderStrip();buildDesktop();bindBar();bindSheet();bindPills();bindView();bindSave();render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
