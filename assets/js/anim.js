/* ============================================================
   NILE LINK — anim.js
   Motion engine: scroll-progress, reveal vocabulary, count-ups,
   ripple, and desktop pointer effects (cursor glow, magnetic
   buttons, 3-D tilt, parallax). No dependencies. Fully guarded by
   prefers-reduced-motion and pointer/width checks. Safe if elements
   are missing; re-scannable for dynamically injected content.
   ============================================================ */
(function(){
  'use strict';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE   = window.matchMedia && matchMedia('(pointer:fine)').matches;
  var deskFX = FINE && window.innerWidth >= 1024 && !REDUCE;
  var raf = window.requestAnimationFrame || function(f){return setTimeout(f,16)};
  function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

  /* ---------- 1. scroll progress bar ---------- */
  function scrollProgress(){
    if(REDUCE) return;
    var bar=document.createElement('div'); bar.className='nl-progress'; document.body.appendChild(bar);
    var ticking=false;
    function upd(){
      var h=document.documentElement, max=(h.scrollHeight-h.clientHeight);
      var p=max>0 ? (h.scrollTop||document.body.scrollTop)/max : 0;
      bar.style.transform='scaleX('+Math.min(Math.max(p,0),1)+')';
      ticking=false;
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;raf(upd)}},{passive:true});
    window.addEventListener('resize',upd,{passive:true}); upd();
  }

  /* ---------- 2. reveal vocabulary ([data-anim] / [data-anim-stagger]) ---------- */
  function reveals(){
    var els=$all('[data-anim],[data-anim-stagger]');
    if(!els.length) return;
    if(REDUCE || !('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('in')});return}
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target) } });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
  }

  /* ---------- 3. count-ups ([data-count] / [data-tcount]) ---------- */
  function countUps(){
    var els=$all('[data-count],[data-tcount]').filter(function(e){return !e.dataset.counted});
    if(!els.length) return;
    function run(el){
      if(el.dataset.counted) return; el.dataset.counted='1';
      var target=parseFloat(el.dataset.count||el.dataset.tcount)||0;
      var suffix=el.dataset.suffix||el.dataset.tsuffix||'';
      var prefix=el.dataset.prefix||el.dataset.tprefix||'';
      if(REDUCE){ el.textContent=prefix+target.toLocaleString('en-US')+suffix; return }
      var dur=1500, t0=performance.now();
      (function step(now){
        var t=Math.min((now-t0)/dur,1), e=1-Math.pow(1-t,3), v=Math.round(target*e);
        el.textContent=prefix+v.toLocaleString('en-US')+suffix;
        if(t<1) raf(step);
      })(t0);
    }
    if(!('IntersectionObserver'in window)){els.forEach(run);return}
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target) } });
    },{threshold:.4});
    els.forEach(function(e){io.observe(e)});
  }

  /* ---------- 4. ripple on primary buttons ---------- */
  function ripple(){
    document.addEventListener('pointerdown',function(e){
      var b=e.target.closest('.btn-lime,.btn-primary'); if(!b||REDUCE) return;
      var r=b.getBoundingClientRect(), size=Math.max(r.width,r.height);
      var s=document.createElement('span'); s.className='nl-ripple';
      s.style.width=s.style.height=size+'px';
      s.style.left=(e.clientX-r.left-size/2)+'px';
      s.style.top=(e.clientY-r.top-size/2)+'px';
      b.appendChild(s); setTimeout(function(){s.remove()},600);
    },{passive:true});
  }

  /* ---------- 5. desktop pointer effects ---------- */
  function cursorGlow(){
    if(!deskFX) return;
    var g=document.createElement('div'); g.className='nl-cursor'; document.body.appendChild(g);
    var sel='.hero,.seller-cta,.auth-brand,.why-band,.hc-hero,.about-hero';
    var x=0,y=0,tx=0,ty=0,active=false,ticking=false;
    function loop(){ tx+=(x-tx)*.18; ty+=(y-ty)*.18;
      g.style.transform='translate3d('+tx+'px,'+ty+'px,0) translate(-50%,-50%)';
      if(active) raf(loop); else ticking=false;
    }
    document.addEventListener('pointermove',function(e){
      var over=e.target.closest(sel);
      g.classList.toggle('on',!!over);
      active=!!over; x=e.clientX; y=e.clientY;
      if(active && !ticking){ ticking=true; raf(loop) }
    },{passive:true});
  }

  function magnetic(){
    if(!deskFX) return;
    $all('.btn-lime.btn-lg, .hero-search-bar .btn, .seller-cta .btn-lime, [data-magnetic]').forEach(function(el){
      var strength=14;
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        var mx=(e.clientX-(r.left+r.width/2))/(r.width/2);
        var my=(e.clientY-(r.top+r.height/2))/(r.height/2);
        el.style.transform='translate('+(mx*strength)+'px,'+(my*strength*.6)+'px)';
      });
      el.addEventListener('pointerleave',function(){ el.style.transform='' });
    });
  }

  function tilt(){
    if(!deskFX) return;
    $all('.bento-card, .value-card, .hc-tile, .cat-card, [data-tilt]').forEach(function(el){
      var MAX=6;
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width - .5;
        var py=(e.clientY-r.top)/r.height - .5;
        el.classList.remove('tilt-reset'); el.classList.add('tilt-on');
        el.style.setProperty('--tx',(px*MAX*2)+'deg');
        el.style.setProperty('--ty',(-py*MAX*2)+'deg');
      });
      el.addEventListener('pointerleave',function(){
        el.classList.remove('tilt-on'); el.classList.add('tilt-reset');
        el.style.setProperty('--tx','0deg'); el.style.setProperty('--ty','0deg');
      });
    });
  }

  /* ---------- 6. parallax ---------- */
  function parallax(){
    if(REDUCE) return;
    var items=$all('[data-parallax]');
    var hero=document.querySelector('.hero-bg img'); if(hero) items.push(hero);
    if(!items.length) return;
    var rate=window.innerWidth<900 ? .06 : .14, ticking=false;
    function upd(){
      var sy=window.scrollY||document.documentElement.scrollTop;
      items.forEach(function(el){
        var r=parseFloat(el.getAttribute('data-parallax'))||rate;
        el.style.transform='translate3d(0,'+(sy*r)+'px,0)';
      });
      ticking=false;
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;raf(upd)}},{passive:true}); upd();
  }

  /* ---------- init ---------- */
  var started=false;
  function init(){
    if(started) return; started=true;
    try{ scrollProgress(); }catch(e){}
    try{ reveals(); }catch(e){}
    try{ countUps(); }catch(e){}
    try{ ripple(); }catch(e){}
    try{ cursorGlow(); }catch(e){}
    try{ magnetic(); }catch(e){}
    try{ tilt(); }catch(e){}
    try{ parallax(); }catch(e){}
  }
  // re-scan hook for dynamically injected content (grids, chat, etc.)
  window.NLAnim={ rescan:function(){ try{reveals();countUps();magnetic();tilt();}catch(e){} } };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
