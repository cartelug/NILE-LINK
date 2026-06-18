/* ============================================================
   NILE LINK — listing.js  (product detail page)
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  const id=+(new URLSearchParams(location.search).get('id')||1);
  let imgs=[],gi=0;

  function images(it){
    if(!it||!it.img)return[];
    const base=it.img.split('?')[0];
    return['?w=1000&h=760&fit=crop&auto=format&q=82','?w=1000&h=760&fit=crop&crop=top&auto=format&q=82','?w=1000&h=760&fit=crop&crop=bottom&auto=format&q=82','?w=1000&h=760&fit=crop&crop=entropy&auto=format&q=82'].map(o=>base+o);
  }

  function ctaBtns(it){
    const labels={order:'Order Now',contact:'Contact Seller',quote:'Request Quote'};
    return '<a class="btn btn-lime btn-lg" href="messages.html?listing='+it.id+'" data-auth-required><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message Seller</a>'+
      '<button class="btn btn-primary btn-lg" data-cta-order><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1 12H6z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>'+(labels[it.type]||'Order Now')+'</button>';
  }

  function render(it){
    if(!it){$('#pdpContent').innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="ei"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></div><h2>Listing not found</h2><p>This listing may have been removed or sold.</p><a class="btn btn-lime" href="browse.html">Browse listings</a></div>';return}
    NL.pushRecent(it.id);
    imgs=images(it);
    const verified=it.badges.includes('verified');
    const bdg=it.badges.map(b=>{
      if(b==='feat')return '<span class="bdg bdg-feat">★ Featured</span>';
      if(b==='boost')return '<span class="bdg bdg-boost">⚡ Boosted</span>';
      if(b==='verified')return '<span class="bdg bdg-verified"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>Verified</span>';
      return '';
    }).join('');

    $('#pdpContent').innerHTML=
      '<div class="gallery">'+
        '<div class="crumbs"><a href="../index.html">Home</a><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg><a href="browse.html?cat='+it.key+'">'+it.cat+'</a></div>'+
        '<div class="gallery-main" id="galMain">'+
          '<img id="galImg" src="'+imgs[0]+'" alt="'+it.title+'">'+
          '<button class="g-nav g-prev" id="galPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>'+
          '<button class="g-nav g-next" id="galNext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>'+
          '<span class="g-count" id="galCount">1 / '+imgs.length+'</span>'+
        '</div>'+
        '<div class="gallery-thumbs" id="galThumbs">'+imgs.map((src,i)=>'<button class="'+(i===0?'on':'')+'" data-gi="'+i+'"><img src="'+src.replace('1000','200').replace('760','160')+'" alt=""></button>').join('')+'</div>'+
      '</div>'+
      '<div class="pdp-info">'+
        '<div class="pdp-cat">'+it.cat+'</div>'+
        '<h1>'+it.title+'</h1>'+
        '<div class="pdp-price">'+(it.from?'From ':'')+NL.fmtUSD(it.usd)+'<small>'+(it.note||'')+'</small></div>'+
        '<div class="pdp-price-ssp" data-pdp-ssp>≈ '+NL.fmtSSP(it.usd*NL.getRate())+(it.note||'')+'</div>'+
        '<div class="pdp-badges">'+bdg+'</div>'+
        '<div class="pdp-meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>'+it.loc+'</div>'+
        '<div class="pdp-actions">'+ctaBtns(it)+
          '<button class="btn btn-ghost btn-lg" data-fav="'+it.id+'" aria-label="Save"><svg viewBox="0 0 24 24" fill="'+(NL.isFav(it.id)?'currentColor':'none')+'" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>'+
        '</div>'+
        '<div class="seller-card">'+
          '<div class="seller-av">'+it.seller[0]+'</div>'+
          '<div style="flex:1"><div class="seller-name">'+it.seller+(verified?' <span class="v"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>':'')+'</div><div class="seller-sub">Member · Responds quickly</div></div>'+
          '<a class="btn btn-ghost btn-sm" href="messages.html?listing='+it.id+'" data-auth-required>Chat</a>'+
        '</div>'+
        '<div class="pdp-desc"><h3>Description</h3><p>'+it.desc+'</p></div>'+
        '<div class="pdp-safety"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/></svg>Stay safe: meet in a public place, inspect before you pay, and never send money in advance to someone you don\'t know.</div>'+
      '</div>';

    // sticky CTA
    $('#pdpSticky').innerHTML='<div class="ps-price">'+(it.from?'From ':'')+NL.fmtUSD(it.usd)+'</div><a class="btn btn-lime" href="messages.html?listing='+it.id+'" data-auth-required>Message Seller</a>';
    bindGallery();
    document.title=it.title+' — Nile Link';

    // related
    NL.api.listings.related(it.id).then(r=>{
      if(!r.data.length)return;
      $('#relatedSec').innerHTML='<div class="sec-head"><div><span class="sec-eyebrow">Similar</span><h2 class="sec-title">You might also like</h2></div></div><div class="grid">'+r.data.map((x,i)=>NL.cardHTML(x,i)).join('')+'</div>';
    });
  }

  function setImg(n){gi=(n+imgs.length)%imgs.length;$('#galImg').src=imgs[gi];$('#galCount').textContent=(gi+1)+' / '+imgs.length;document.querySelectorAll('#galThumbs button').forEach((b,i)=>b.classList.toggle('on',i===gi));if($('#lightbox').classList.contains('open'))$('#lbImg').src=imgs[gi]}
  function bindGallery(){
    $('#galPrev').addEventListener('click',e=>{e.stopPropagation();setImg(gi-1)});
    $('#galNext').addEventListener('click',e=>{e.stopPropagation();setImg(gi+1)});
    $('#galThumbs').addEventListener('click',e=>{const b=e.target.closest('[data-gi]');if(b)setImg(+b.dataset.gi)});
    $('#galMain').addEventListener('click',e=>{if(e.target.closest('.g-nav'))return;$('#lbImg').src=imgs[gi];$('#lightbox').classList.add('open');document.body.style.overflow='hidden'});
  }
  function bindLightbox(){
    const lb=$('#lightbox');
    $('#lbClose').addEventListener('click',()=>{lb.classList.remove('open');document.body.style.overflow=''});
    lb.addEventListener('click',e=>{if(e.target===lb){lb.classList.remove('open');document.body.style.overflow=''}});
    $('#lbPrev').addEventListener('click',e=>{e.stopPropagation();setImg(gi-1)});
    $('#lbNext').addEventListener('click',e=>{e.stopPropagation();setImg(gi+1)});
    document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape'){lb.classList.remove('open');document.body.style.overflow=''}if(e.key==='ArrowLeft')setImg(gi-1);if(e.key==='ArrowRight')setImg(gi+1)});
  }

  /* order modal (lightweight) */
  document.addEventListener('click',e=>{if(e.target.closest('[data-cta-order]')){if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('listing.html'+location.search);return}NL.toast('Request sent to the seller ✓',{type:'success'})}});

  /* sticky show on scroll */
  function bindSticky(){window.addEventListener('scroll',()=>{$('#pdpSticky').classList.toggle('show',window.scrollY>320)},{passive:true})}

  document.addEventListener('nl:rate',()=>{NL.api.listings.get(id).then(r=>{const el=document.querySelector('[data-pdp-ssp]');if(el&&r.data)el.textContent='≈ '+NL.fmtSSP(r.data.usd*NL.getRate())+(r.data.note||'')})});

  function init(){NL.api.listings.get(id).then(r=>render(r.data));bindLightbox();bindSticky()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
