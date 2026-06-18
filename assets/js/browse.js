/* ============================================================
   NILE LINK — browse.js
   Desktop sidebar + mobile bottom-sheet share one `state`.
   Sheet renders its own controls (prefixed ids) to avoid
   duplicate-id / radio-group collisions.
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  const state={search:'',cats:[],type:'all',max:42000,sort:'featured'};

  const p=new URLSearchParams(location.search);
  if(p.get('q'))state.search=p.get('q');
  if(p.get('cat'))state.cats=[p.get('cat')];

  /* ---- Desktop sidebar (markup already in HTML) ---- */
  function buildDesktop(){
    $('#fltCats').innerHTML=D.CATEGORIES.map(c=>'<label class="check"><input type="checkbox" class="fcat" value="'+c.key+'"'+(state.cats.includes(c.key)?' checked':'')+'> '+c.name+'</label>').join('');
    document.querySelectorAll('.fcat').forEach(cb=>cb.addEventListener('change',()=>{state.cats=[...document.querySelectorAll('.fcat:checked')].map(x=>x.value);syncDesktop();render()}));
    document.querySelectorAll('input[name="ftype"]').forEach(r=>r.addEventListener('change',e=>{state.type=e.target.value;render()}));
    const mr=$('#fltMax');mr.value=state.max;mr.addEventListener('input',()=>{state.max=+mr.value;$('#fltMaxVal').textContent=NL.fmtUSD(state.max);render()});
    $('#fltMaxVal').textContent=NL.fmtUSD(state.max);
  }
  function syncDesktop(){
    document.querySelectorAll('.fcat').forEach(cb=>cb.checked=state.cats.includes(cb.value));
    const r=document.querySelector('input[name="ftype"][value="'+state.type+'"]');if(r)r.checked=true;
    const mr=$('#fltMax');if(mr){mr.value=state.max;$('#fltMaxVal').textContent=NL.fmtUSD(state.max)}
  }

  /* ---- Mobile sheet (self-contained controls) ---- */
  function renderSheet(){
    $('#sheetBody').innerHTML=
      '<div class="flt-card"><h4>Category</h4>'+D.CATEGORIES.map(c=>'<label class="check"><input type="checkbox" class="sfcat" value="'+c.key+'"'+(state.cats.includes(c.key)?' checked':'')+'> '+c.name+'</label>').join('')+'</div>'+
      '<div class="flt-card"><h4>Type</h4><div class="flt-radio">'+
        ['all|All types','products|Products','vehprop|Cars & Property','services|Services'].map(o=>{const[v,l]=o.split('|');return '<label class="check"><input type="radio" name="sftype" value="'+v+'"'+(state.type===v?' checked':'')+'> '+l+'</label>'}).join('')+
      '</div></div>'+
      '<div class="flt-card"><h4>Max price (USD)</h4><input type="range" class="flt-range" id="sfltMax" min="20" max="42000" step="10" value="'+state.max+'"><div class="flt-range-val">Up to <span id="sfltMaxVal">'+NL.fmtUSD(state.max)+'</span></div></div>';
    $('#sheetBody').querySelectorAll('.sfcat').forEach(cb=>cb.addEventListener('change',()=>{state.cats=[...$('#sheetBody').querySelectorAll('.sfcat:checked')].map(x=>x.value);syncDesktop();render()}));
    $('#sheetBody').querySelectorAll('input[name="sftype"]').forEach(r=>r.addEventListener('change',e=>{state.type=e.target.value;syncDesktop();render()}));
    const mr=$('#sfltMax');mr.addEventListener('input',()=>{state.max=+mr.value;$('#sfltMaxVal').textContent=NL.fmtUSD(state.max);syncDesktop();render()});
  }

  function renderActive(){
    const chips=[];
    if(state.search)chips.push({k:'search',label:'"'+state.search+'"'});
    state.cats.forEach(c=>{const cat=D.CATEGORIES.find(x=>x.key===c);if(cat)chips.push({k:'cat:'+c,label:cat.name})});
    if(state.type!=='all'){const tl={products:'Products',vehprop:'Cars & Property',services:'Services'};chips.push({k:'type',label:tl[state.type]})}
    if(state.max<42000)chips.push({k:'price',label:'Under '+NL.fmtUSD(state.max)});
    $('#activeFilters').innerHTML=chips.map(c=>'<span class="afilter">'+c.label+'<button data-rm="'+c.k+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>').join('');
  }
  function removeFilter(k){
    if(k==='search'){state.search='';$('#browseSearch').value=''}
    else if(k.startsWith('cat:'))state.cats=state.cats.filter(x=>x!==k.slice(4));
    else if(k==='type')state.type='all';
    else if(k==='price')state.max=42000;
    syncDesktop();render();
  }

  function render(){
    renderActive();
    NL.api.listings.list(state).then(r=>{
      NL.renderGrid($('#browseGrid'),r.data);
      $('#browseCount').textContent=r.data.length+' result'+(r.data.length!==1?'s':'');
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
    $('#fltTrigger').addEventListener('click',open);
    $('#sheetClose').addEventListener('click',close);
    $('#sheetApply').addEventListener('click',close);
    $('#sheetScrim').addEventListener('click',close);
  }

  document.addEventListener('click',e=>{const rm=e.target.closest('[data-rm]');if(rm)removeFilter(rm.dataset.rm)});
  document.addEventListener('nl:rate',render);

  function init(){buildDesktop();bindBar();bindSheet();render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
