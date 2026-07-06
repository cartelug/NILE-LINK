/* ============================================================
   NILE LINK — messages.js  (v4 — conversations rebuild)

   What changed vs v3:
   - OPTIMISTIC SEND: your message appears instantly ("sending…"),
     confirms on success, and the realtime echo is de-duplicated —
     chat feels instant even on slow connections.
   - Honest presence: no fake "Online now / last seen"; the thread
     header shows the listing context instead.
   - REAL date separators (Today / Yesterday / date) from timestamps.
   - Live listing pin: photo + title + price fetched for the thread.
   - Message grouping: consecutive bubbles from the same sender tighten.
   - Proper empty states for the list and thread.
   Mock mode (no Supabase keys) keeps the old demo behaviour.
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  let convs=[],active=null,lastFrom=null,lastDayKey=null;
  const sentIds=new Set();          // ids of messages I sent (de-dupe realtime echo)
  let cid=0;                        // client id for optimistic bubbles
  const vtick='<span class="v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>';
  const QREPLIES=['Is it still available?','Best price?','Where can we meet?','Can you deliver?','I\'ll take it','Send more photos'];
  const EMOJIS=['😀','😁','😂','🤣','😊','😍','🥰','😘','😎','🤔','😅','😢','😡','👍','👎','🙏','👏','💪','🤝','❤️','🔥','💯','✨','🎉','✅','❌','⚡','💰','📦','🚗','🏠','📱'];
  const isLive = ()=> !!NL.sb;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------------- Conversation list ---------------- */
  function renderList(filter){
    const f=(filter||'').toLowerCase();
    const list=f?convs.filter(c=>((c.with||'')+(c.lastMsg||'')+(c.listingTitle||'')).toLowerCase().includes(f)):convs;
    if(!convs.length){
      $('#convList').innerHTML=
        '<div class="conv-empty">'+
          '<div class="ce-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>'+
          '<h3>No conversations yet</h3>'+
          '<p>Message a seller from any listing and the chat shows up here.</p>'+
          '<a class="btn btn-lime btn-sm" href="browse.html">Browse listings</a>'+
        '</div>';
      return;
    }
    if(!list.length){
      $('#convList').innerHTML='<div class="conv-empty"><p>No chats match "<b>'+esc(f)+'</b>".</p></div>';
      return;
    }
    $('#convList').innerHTML=list.map(c=>
      '<div class="conv'+(active===c.id?' active':'')+'" data-conv="'+esc(c.id)+'">'+
        '<div class="conv-av-wrap"><div class="conv-av">'+esc(c.avInitial||(c.with||'?').charAt(0).toUpperCase())+'</div></div>'+
        '<div class="conv-body">'+
          '<div class="conv-top"><span class="conv-name">'+esc(c.with||'Chat')+(c.verified?vtick:'')+'</span><span class="conv-time">'+esc(c.lastTime||'')+'</span></div>'+
          '<div class="conv-last">'+esc(c.lastMsg||'Say hello 👋')+'</div>'+
          (c.listingTitle?'<div class="conv-listing">'+esc(c.listingTitle)+'</div>':'')+
        '</div>'+
        (c.unread?'<span class="conv-unread">'+c.unread+'</span>':'')+
      '</div>').join('');
  }

  /* ---------------- Bubbles + separators ---------------- */
  function dayKey(ts){ const d=ts?new Date(ts):new Date(); return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate(); }
  function dayLabel(ts){
    const d=ts?new Date(ts):new Date(); const now=new Date();
    const yest=new Date(now); yest.setDate(now.getDate()-1);
    if(dayKey(ts)===dayKey(now.toISOString())) return 'Today';
    if(d.getFullYear()===yest.getFullYear()&&d.getMonth()===yest.getMonth()&&d.getDate()===yest.getDate()) return 'Yesterday';
    return d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
  }
  function clock(ts){ const d=ts?new Date(ts):new Date(); return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }

  function bubble(m,cont){
    const cls='bubble '+(m.from==='me'?'me':'them')+(cont?' cont':'')+(m.sending?' sending':'');
    const cidAttr=m.cid?' data-cid="'+m.cid+'"':'';
    const retryAttr=m.from==='me'?(m.image?' data-retry-img="'+esc(m.image)+'"':' data-retry-text="'+esc(m.text||'')+'"'):'';
    const status=m.from==='me'?('<span class="b-check">'+(m.sending?'·':'✓')+'</span>'):'';
    if(m.image||m.img)return '<div class="'+cls+' with-img"'+cidAttr+retryAttr+'><img src="'+(m.image||m.img)+'" alt="photo" loading="lazy"><span class="b-time">'+clock(m.ts)+status+'</span></div>';
    return '<div class="'+cls+'"'+cidAttr+retryAttr+'>'+esc(m.text)+'<span class="b-time">'+clock(m.ts)+status+'</span></div>';
  }
  function appendMsg(body,m){
    let html='';
    const dk=dayKey(m.ts);
    if(dk!==lastDayKey){ html+='<div class="date-sep">'+dayLabel(m.ts)+'</div>'; lastDayKey=dk; lastFrom=null; }
    html+=bubble(m, lastFrom===m.from);
    lastFrom=m.from;
    body.insertAdjacentHTML('beforeend',html);
    body.scrollTop=body.scrollHeight;
  }

  /* ---------------- Listing pin ---------------- */
  async function listingPinHTML(c){
    if(!c.listingId) return '';
    let it=null;
    try{ const r=await NL.api.listings.get(c.listingId); if(r.ok) it=r.data; }catch(_){}
    if(!it) return c.listingTitle?'<div class="thread-pinned"><a href="listing.html?id='+esc(c.listingId)+'"><div class="pi"><b>'+esc(c.listingTitle)+'</b></div></a></div>':'';
    return '<div class="thread-pinned"><a href="listing.html?id='+esc(it.id)+'">'+
      '<div class="pt">'+(it.img?'<img src="'+it.img+'" alt="">':NL.glyph(it.key,22))+'</div>'+
      '<div class="pi"><b>'+esc(it.title)+'</b><span>'+(it.from?'From ':'')+NL.fmtUSD(it.usd)+(it.note||'')+(it.status==='sold'?' · Sold':'')+'</span></div>'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="width:18px;height:18px;color:var(--tx-3)"><path d="M9 6l6 6-6 6"/></svg></a></div>';
  }

  /* ---------------- Open a thread ---------------- */
  async function openConv(id){
    const c=convs.find(x=>String(x.id)===String(id));if(!c)return;
    id=c.id;
    active=id;c.unread=0;NL.updateBadges();renderList($('#convSearch')?$('#convSearch').value:'');
    $('#chat').classList.add('show-thread');
    lastFrom=null; lastDayKey=null;

    const [r,pin]=await Promise.all([NL.api.messages.thread(id), listingPinHTML(c)]);
    const msgs=(r.ok&&r.data)?r.data:[];

    $('#thread').innerHTML=
      '<div class="thread-head">'+
        '<button class="thread-back" id="threadBack" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>'+
        '<div class="conv-av-wrap"><div class="conv-av">'+esc(c.avInitial||(c.with||'?').charAt(0).toUpperCase())+'</div></div>'+
        '<div style="flex:1;min-width:0"><div class="conv-name">'+esc(c.with||'Chat')+(c.verified?vtick:'')+'</div>'+
          (c.listingTitle?'<div class="conv-listing">About: '+esc(c.listingTitle)+'</div>':'<div class="conv-listing">Nile Link chat</div>')+
        '</div>'+
      '</div>'+
      pin+
      '<div class="thread-body" id="threadBody"></div>'+
      '<div class="qreplies">'+QREPLIES.map(q=>'<button data-qr="'+q.replace(/"/g,'&quot;')+'">'+q+'</button>').join('')+'</div>'+
      '<form class="thread-compose" id="composeForm">'+
        '<div class="compose-img-preview" id="composePrev" style="display:none"></div>'+
        '<div class="emoji-pop" id="emojiPop">'+EMOJIS.map(e=>'<button type="button" data-emoji="'+e+'">'+e+'</button>').join('')+'</div>'+
        '<div style="display:flex;gap:8px;align-items:center;padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid var(--line);background:var(--paper)">'+
          '<button type="button" class="compose-btn" id="attachBtn" title="Attach photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05l-9.19 9.19a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48"/></svg></button>'+
          '<input id="photoInput" type="file" accept="image/*" multiple hidden>'+
          '<button type="button" class="compose-btn" id="emojiBtn" title="Emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg></button>'+
          '<input id="composeInput" placeholder="Type a message…" autocomplete="off" style="flex:1;padding:11px 16px;border:1.5px solid var(--line-2);border-radius:var(--r-pill);font-weight:600">'+
          '<button class="send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>'+
        '</div>'+
      '</form>';

    const body=$('#threadBody');
    if(!msgs.length){
      body.innerHTML='<div class="thread-empty"><div class="te-ic">👋</div><h3>Start the conversation</h3><p>Ask about availability, price or delivery — sellers reply fast.</p></div>';
    }else{
      msgs.forEach(m=>appendMsg(body,m));
    }
    body.scrollTop=body.scrollHeight;
    $('#threadBack').addEventListener('click',()=>$('#chat').classList.remove('show-thread'));
    bindCompose(id,c,body);
  }

  /* ---------------- Compose ---------------- */
  function bindCompose(id,c,body){
    const pending=[]; // uploaded image URLs (live) or data URLs (mock)
    const inp=$('#composeInput');
    const prev=$('#composePrev');
    $('#attachBtn').addEventListener('click',()=>$('#photoInput').click());
    $('#photoInput').addEventListener('change', async e=>{
      const files=[...e.target.files].slice(0,4-pending.length);
      for(const f of files){
        if(isLive()){
          const r=await NL.api.storage.uploadPhoto(f);
          if(r.ok) pending.push(r.data.url); else NL.toast(r.error||'Upload failed',{type:'error'});
        }else{
          await new Promise(res=>{const r=new FileReader();r.onload=ev=>{pending.push(ev.target.result);res()};r.readAsDataURL(f)});
        }
      }
      renderPrev(); e.target.value='';
    });
    function renderPrev(){
      prev.style.display=pending.length?'flex':'none';
      prev.innerHTML=pending.map((src,i)=>'<div class="ip"><img src="'+src+'"><button type="button" data-rmp="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>').join('');
    }
    prev.addEventListener('click',e=>{const r=e.target.closest('[data-rmp]');if(r){pending.splice(+r.dataset.rmp,1);renderPrev()}});

    $('#emojiBtn').addEventListener('click',e=>{e.stopPropagation();$('#emojiPop').classList.toggle('open')});
    $('#emojiPop').addEventListener('click',e=>{const b=e.target.closest('[data-emoji]');if(b){inp.value+=b.dataset.emoji;inp.focus()}});
    document.addEventListener('click',e=>{if(!e.target.closest('#emojiPop')&&!e.target.closest('#emojiBtn')){const p=$('#emojiPop');if(p)p.classList.remove('open')}});
    document.querySelectorAll('[data-qr]').forEach(b=>b.addEventListener('click',()=>{inp.value=b.dataset.qr;inp.focus()}));

    function clearEmpty(){ const e=body.querySelector('.thread-empty'); if(e)e.remove(); }

    // Optimistic append; returns the client id so we can confirm/fail it.
    function optimistic(m){
      clearEmpty();
      m.cid='c'+(++cid); m.sending=true; m.ts=m.ts||new Date().toISOString();
      appendMsg(body,m);
      return m.cid;
    }
    function confirmSent(cidKey,realId){
      const el=body.querySelector('[data-cid="'+cidKey+'"]');
      if(el){ el.classList.remove('sending'); const ck=el.querySelector('.b-check'); if(ck)ck.textContent='✓'; }
      if(realId!=null) sentIds.add(realId);
    }
    function failSent(cidKey){
      const el=body.querySelector('[data-cid="'+cidKey+'"]');
      if(el){ el.classList.add('failed'); const ck=el.querySelector('.b-check'); if(ck){ck.textContent='!';ck.title='Failed to send — tap to retry'} el.title='Tap to retry'; }
    }

    async function sendText(txt){
      const k=optimistic({from:'me',text:txt});
      const res=await NL.api.messages.send(id,txt);
      if(res.ok){ confirmSent(k,res.data.id); c.lastMsg=txt; c.lastTime='Just now'; renderList($('#convSearch')?$('#convSearch').value:''); }
      else{ failSent(k); NL.toast(res.error||'Message failed to send',{type:'error'}); }
    }
    async function sendImage(img){
      const k=optimistic({from:'me',image:img});
      if(isLive()){
        try{
          const uid=(await NL.sb.auth.getUser()).data.user.id;
          const { data, error } = await NL.sb.from('messages').insert({conversation_id:id,sender_id:uid,body:'',image_url:img}).select().single();
          if(error) failSent(k); else confirmSent(k,data.id);
        }catch(_){ failSent(k); }
      }else{ confirmSent(k); }
    }

    // Tap a failed bubble to retry the exact same send.
    body.addEventListener('click', e=>{
      const failed=e.target.closest('.bubble.failed'); if(!failed) return;
      if(e.target.closest('img')) return; // let the lightbox handler own image taps
      failed.remove();
      if(failed.dataset.retryImg) sendImage(failed.dataset.retryImg);
      else if(failed.dataset.retryText) sendText(failed.dataset.retryText);
    });

    $('#composeForm').addEventListener('submit', async e=>{
      e.preventDefault();
      const txt=inp.value.trim();
      if(!txt&&!pending.length) return;

      // images first
      const imgs=pending.splice(0,pending.length); renderPrev();
      for(const img of imgs) await sendImage(img);

      if(txt){ inp.value=''; await sendText(txt); }

      // mock-mode demo reply
      if(!isLive()){
        setTimeout(()=>{const t=document.createElement('div');t.className='typing';t.id='typing';t.innerHTML='<span></span><span></span><span></span>';body.appendChild(t);body.scrollTop=body.scrollHeight},700);
        setTimeout(()=>{const t=$('#typing');if(t)t.remove();appendMsg(body,{from:'them',text:'Thanks! Let me check and get back to you.'});renderList();},2100);
      }
    });

    // image lightbox
    body.addEventListener('click',e=>{const img=e.target.closest('.bubble.with-img img');if(!img)return;
      const lb=document.createElement('div');lb.className='lightbox open';lb.innerHTML='<button class="lb-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img src="'+img.src+'">';document.body.appendChild(lb);document.body.style.overflow='hidden';lb.addEventListener('click',ev=>{if(ev.target===lb||ev.target.closest('.lb-close')){lb.remove();document.body.style.overflow=''}});
    });
  }

  document.addEventListener('click',e=>{const c=e.target.closest('[data-conv]');if(c)openConv(c.dataset.conv)});

  /* ---------------- Realtime ---------------- */
  document.addEventListener('nl:new-message', ev=>{
    const m=ev.detail; if(!m) return;
    if(sentIds.has(m.id)) return;                    // my own echo — already shown optimistically
    if(m.conversation_id===active){
      const body=$('#threadBody'); if(!body) return;
      const e=body.querySelector('.thread-empty'); if(e)e.remove();
      appendMsg(body,{from:'them',text:m.body||'',image:m.image_url||undefined,ts:m.created_at});
    }else{
      const c=convs.find(x=>x.id===m.conversation_id);
      if(c){ c.lastMsg=m.body||(m.image_url?'📷 Photo':''); c.lastTime='Just now'; c.unread=(c.unread||0)+1; renderList($('#convSearch')?$('#convSearch').value:''); NL.updateBadges(); }
      else{ NL.api.messages.conversations().then(r=>{ if(r.ok){convs=r.data; renderList($('#convSearch')?$('#convSearch').value:'');} }); }
    }
  });
  document.addEventListener('nl:conv-updated', ()=>{
    NL.api.messages.conversations().then(r=>{ if(r.ok){convs=r.data; renderList($('#convSearch')?$('#convSearch').value:'');} });
  });

  /* ---------------- Init ---------------- */
  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('messages.html');return}
    NL.api.messages.conversations().then(r=>{
      convs=(r.ok&&r.data)?r.data:[];
      const head=document.querySelector('.conv-list-head');
      if(head&&!document.getElementById('convSearch')){
        const sb=document.createElement('div');sb.className='conv-search';sb.innerHTML='<input id="convSearch" type="search" placeholder="Search conversations…">';head.after(sb);
        sb.querySelector('input').addEventListener('input',e=>renderList(e.target.value));
      }
      renderList();
      const p=new URLSearchParams(location.search);
      const cidParam=p.get('c');const listing=p.get('listing');
      if(cidParam)openConv(cidParam);
      else if(listing){
        if(isLive()){
          NL.api.messages.startWith(listing).then(res=>{
            if(res.ok){
              NL.api.messages.conversations().then(r2=>{ if(r2.ok)convs=r2.data; renderList(); openConv(res.data.id); });
            }else{
              NL.toast(res.error||'Could not open chat',{type:'error'});
            }
          });
        }else{
          const c=convs.find(x=>x.listingId===+listing);if(c)openConv(c.id);
        }
      }
      else if(window.innerWidth>=768&&convs.length)openConv(convs[0].id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
