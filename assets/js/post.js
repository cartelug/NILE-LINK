/* ============================================================
   NILE LINK — post.js  (multi-step listing wizard)
   v2: real photo upload via NL.api.storage.uploadPhoto (falls
   back to base64 preview when running against mock).
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  let step=1;const state={cat:'',photos:[]};   // photos: [{url, uploading?}]
  const CICONS={electronics:'<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/>',fashion:'<path d="M8.5 3.5L4.5 6.5L7 9.5L8.5 8.5V21H15.5V8.5L17 9.5L19.5 6.5L15.5 3.5"/>',cars:'<path d="M3.5 16V11.5L5.4 7.5C5.7 6.7 6.5 6.2 7.3 6.2H16.7C17.5 6.2 18.3 6.7 18.6 7.5L20.5 11.5V16"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3"/>',property:'<path d="M3.5 11L12 3.5L20.5 11"/><path d="M5.5 9.5V20H18.5V9.5"/>',services:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.9-5.9a3.5 3.5 0 0 0 4.8-4.8l-2.5 2.5-1.5-1.5z"/>'};

  function renderCatPick(){
    $('#catPick').innerHTML=D.CATEGORIES.map(c=>'<div class="cat-opt" data-cat="'+c.key+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+CICONS[c.key]+'</svg>'+c.short+'</div>').join('');
    $('#catPick').addEventListener('click',e=>{const o=e.target.closest('[data-cat]');if(!o)return;document.querySelectorAll('.cat-opt').forEach(x=>x.classList.remove('on'));o.classList.add('on');state.cat=o.dataset.cat;$('#next1').disabled=false});
  }

  function go(n){
    step=n;
    document.querySelectorAll('.pw-panel').forEach(p=>p.classList.toggle('active',+p.dataset.panel===n));
    document.querySelectorAll('.pw-step').forEach(s=>{const sn=+s.dataset.s;s.classList.toggle('active',sn===n);s.classList.toggle('done',sn<n)});
    window.scrollTo({top:0,behavior:'smooth'});
    if(n===4)renderReview();
  }
  function validateStep2(){
    if(!$('#pTitle').value.trim()){NL.toast('Add a title',{type:'error'});return false}
    if(!$('#pPrice').value||+$('#pPrice').value<0){NL.toast('Add a price',{type:'error'});return false}
    if(!$('#pLoc').value.trim()){NL.toast('Add a location',{type:'error'});return false}
    return true;
  }

  function bindNav(){
    document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{
      if(step===2&&!validateStep2())return;
      go(step+1);
    }));
    document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>go(step-1)));
  }

  /* Photos — real upload to Supabase Storage when live, base64 fallback in mock mode */
  function bindPhotos(){
    $('#pPhotos').addEventListener('change', async e=>{
      const files=[...e.target.files].slice(0,6-state.photos.length);
      for(const f of files){
        const placeholder={url:'', uploading:true};
        state.photos.push(placeholder);
        renderPhotos();
        try{
          const r=await NL.api.storage.uploadPhoto(f);
          if(r.ok){ placeholder.url=r.data.url; placeholder.uploading=false; }
          else{
            NL.toast(r.error||'Upload failed',{type:'error'});
            state.photos.splice(state.photos.indexOf(placeholder),1);
          }
        }catch(err){
          NL.toast('Upload failed',{type:'error'});
          state.photos.splice(state.photos.indexOf(placeholder),1);
        }
        renderPhotos();
      }
      e.target.value='';
    });
    $('#photoGrid').addEventListener('click',e=>{const b=e.target.closest('[data-rmphoto]');if(b){state.photos.splice(+b.dataset.rmphoto,1);renderPhotos()}});
  }
  function renderPhotos(){
    $('#photoGrid').innerHTML=state.photos.map((p,i)=>{
      const src=p.url||'';
      const uploading=p.uploading?'<div class="photo-uploading">Uploading…</div>':'';
      return '<div class="photo-thumb">'+
        (src?'<img src="'+src+'" alt="">':'<div class="photo-thumb-placeholder"></div>')+
        uploading+
        '<button data-rmphoto="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    }).join('');
  }

  function renderReview(){
    const cat=D.CATLABEL[state.cat]||'—';
    const note=state.cat==='property'?'/mo':'';
    $('#reviewCard').innerHTML=
      '<div class="review-row"><span class="k">Category</span><span class="v">'+cat+'</span></div>'+
      '<div class="review-row"><span class="k">Title</span><span class="v">'+($('#pTitle').value||'—')+'</span></div>'+
      '<div class="review-row"><span class="k">Price</span><span class="v">'+NL.fmtUSD(+$('#pPrice').value||0)+note+'</span></div>'+
      '<div class="review-row"><span class="k">Location</span><span class="v">'+($('#pLoc').value||'—')+'</span></div>'+
      '<div class="review-row"><span class="k">Photos</span><span class="v">'+state.photos.length+' added</span></div>';
    const firstUrl = (state.photos.find(p=>p.url)||{}).url || '';
    const it={id:'new',title:$('#pTitle').value||'Your listing',cat,key:state.cat,usd:+$('#pPrice').value||0,note,loc:$('#pLoc').value||'Your location',seller:'You',group:D.groupForCat(state.cat),badges:[],img:firstUrl};
    $('#reviewPreview').innerHTML=NL.cardHTML(it,0);
  }

  function photoUrls(){ return state.photos.filter(p=>p.url && !p.uploading).map(p=>p.url); }

  function publish(){
    if(state.photos.some(p=>p.uploading)){NL.toast('Photos still uploading…',{type:'info'});return}
    const urls = photoUrls();
    const close=NL.toast('Publishing…',{type:'loading'});
    NL.api.listings.create({title:$('#pTitle').value.trim(),cat:D.CATLABEL[state.cat],key:state.cat,usd:+$('#pPrice').value,loc:$('#pLoc').value.trim(),desc:$('#pDesc').value.trim(),img:urls[0]||'',imgs:urls,note:state.cat==='property'?'/mo':''}).then(r=>{
      close();
      if(!r.ok){ NL.toast(r.error||'Publish failed',{type:'error'}); return; }
      NL.toast('Listing published! 🎉',{type:'success'});
      setTimeout(()=>location.href='dashboard.html',900);
    });
  }
  function saveDraft(){
    const urls = photoUrls();
    const close=NL.toast('Saving draft…',{type:'loading'});
    NL.api.listings.saveDraft({title:$('#pTitle').value.trim(),cat:D.CATLABEL[state.cat],key:state.cat,usd:+$('#pPrice').value||0,imgs:urls}).then(r=>{
      close();
      if(!r.ok){ NL.toast(r.error||'Save failed',{type:'error'}); return; }
      NL.toast('Draft saved',{type:'success'});
      setTimeout(()=>location.href='dashboard.html',800);
    });
  }

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('post.html');return}
    renderCatPick();bindNav();bindPhotos();
    $('#publish').addEventListener('click',publish);
    $('#saveDraft').addEventListener('click',saveDraft);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
