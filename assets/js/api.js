/* ============================================================
   NILE LINK — api.js
   Thin, Promise-returning data facade. Today it wraps in-memory
   mock data (NLDATA). To go live, replace each method body with
   a fetch() to your backend — call sites never change.
   ============================================================ */
window.NL=window.NL||{};
(function(){
  const D=window.NLDATA;
  const ok=(data)=>new Promise(res=>setTimeout(()=>res({ok:true,data}),120));

  /* ---- Live USD → SSP rate ---- */
  let RATE=4585;
  NL.getRate=()=>RATE;
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
          const nv=Math.round(v);animateRate(nv);
          if(RATE!==nv){RATE=nv;document.dispatchEvent(new CustomEvent('nl:rate',{detail:nv}))}
          return;
        }
      }catch(e){/* next source */}
    }
  }
  function animateRate(target){
    document.querySelectorAll('[data-fx-rate]').forEach(el=>{
      const start=parseInt((el.dataset.fxCurrent||el.textContent||'0').replace(/[^0-9]/g,''))||0;
      if(start===target){el.textContent=target.toLocaleString('en-US');el.dataset.fxCurrent=String(target);return}
      const dur=1400,t0=performance.now();
      (function step(now){
        const t=Math.min((now-t0)/dur,1),e=1-Math.pow(1-t,3);
        el.textContent=Math.round(start+(target-start)*e).toLocaleString('en-US');
        if(t<1)requestAnimationFrame(step);
        else{el.dataset.fxCurrent=String(target);el.classList.remove('fx-flash');void el.offsetWidth;el.classList.add('fx-flash')}
      })(t0);
    });
  }
  window.addEventListener('DOMContentLoaded',()=>{fetchLiveRate();setInterval(fetchLiveRate,5*60*1000)});

  /* ---- API facade ---- */
  NL.api={
    listings:{
      list:(opts={})=>{
        let r=D.LISTINGS.slice();
        if(opts.cats&&opts.cats.length)r=r.filter(x=>opts.cats.includes(x.key));
        if(opts.group&&opts.group!=='all')r=r.filter(x=>x.group===opts.group);
        if(opts.search){const q=opts.search.toLowerCase();r=r.filter(x=>(x.title+' '+x.cat+' '+x.seller+' '+x.loc).toLowerCase().includes(q))}
        if(opts.max)r=r.filter(x=>x.usd<=opts.max);
        if(opts.sort==='low')r.sort((a,b)=>a.usd-b.usd);
        else if(opts.sort==='high')r.sort((a,b)=>b.usd-a.usd);
        else r.sort((a,b)=>(b.badges.includes('feat')?2:b.badges.includes('boost')?1:0)-(a.badges.includes('feat')?2:a.badges.includes('boost')?1:0));
        return ok(r);
      },
      get:(id)=>ok(D.LISTINGS.find(x=>x.id===+id)||null),
      related:(id)=>{const it=D.LISTINGS.find(x=>x.id===+id);return ok(it?D.LISTINGS.filter(x=>x.key===it.key&&x.id!==it.id).slice(0,4):[])},
      mine:()=>ok(D.SHOP),
      create:(p)=>ok({id:Date.now(),...p}),
      saveDraft:(p)=>ok({id:'d'+Date.now(),...p})
    },
    requests:{list:()=>ok(D.REQUESTS)},
    messages:{
      conversations:()=>ok(D.CONVERSATIONS),
      thread:(id)=>ok(D.MESSAGES[id]||[]),
      send:(convId,text)=>{const m={from:'me',text,time:'Just now'};(D.MESSAGES[convId]=D.MESSAGES[convId]||[]).push(m);const c=D.CONVERSATIONS.find(x=>x.id===convId);if(c){c.lastMsg=text;c.lastTime='Just now'}return ok(m)}
    },
    notifications:{
      list:()=>ok(D.NOTIFICATIONS),
      unread:()=>ok(D.NOTIFICATIONS.filter(n=>!n.read).length),
      markRead:(id)=>{const n=D.NOTIFICATIONS.find(x=>x.id===id);if(n)n.read=true;return ok(n)},
      markAllRead:()=>{D.NOTIFICATIONS.forEach(n=>n.read=true);return ok(D.NOTIFICATIONS)}
    },
    /* ---- Auth (UI-ready; wire to your backend / OTP provider) ---- */
    auth:{
      requestOtp:(phone)=>ok({phone,sent:true}),
      verifyOtp:(phone,code)=>code&&code.length===6?ok({token:'demo',user:{name:'Neeza',phone,initials:'NS',role:'both',city:'Juba'}}):Promise.resolve({ok:false,error:'Invalid code'}),
      signUp:(p)=>ok({token:'demo',user:{name:p.name||'New User',phone:p.phone,initials:(p.name||'NU').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase(),role:p.role||'buyer',city:p.city||'Juba'}})
    },
    rate:{get:()=>ok(RATE)}
  };
})();
