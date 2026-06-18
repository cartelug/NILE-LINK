/* ============================================================
   NILE LINK — messages.js  (v2 — premium chat)
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  let convs=[],active=null;
  const vtick='<span class="v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>';
  const ONLINE={c1:true,c2:false,c3:true,c4:false,c5:true};
  const QREPLIES=['Is it still available?','Best price?','Where can we meet?','Can you deliver?','I\'ll take it','Send more photos'];
  const EMOJIS=['😀','😁','😂','🤣','😊','😍','🥰','😘','😎','🤔','😅','😢','😡','👍','👎','🙏','👏','💪','🤝','❤️','🔥','💯','✨','🎉','✅','❌','⚡','💰','📦','🚗','🏠','📱'];

  function renderList(filter){
    const f=(filter||'').toLowerCase();
    const list=f?convs.filter(c=>(c.with+c.lastMsg+c.listingTitle).toLowerCase().includes(f)):convs;
    $('#convList').innerHTML=list.map(c=>
      '<div class="conv'+(active===c.id?' active':'')+'" data-conv="'+c.id+'">'+
        '<div class="conv-av-wrap"><div class="conv-av">'+c.avInitial+'</div>'+(ONLINE[c.id]?'<span class="conv-online"></span>':'')+'</div>'+
        '<div class="conv-body">'+
          '<div class="conv-top"><span class="conv-name">'+c.with+(c.verified?vtick:'')+'</span><span class="conv-time">'+c.lastTime+'</span></div>'+
          '<div class="conv-last">'+c.lastMsg+'</div>'+
          '<div class="conv-listing">'+c.listingTitle+'</div>'+
        '</div>'+
        (c.unread?'<span class="conv-unread">'+c.unread+'</span>':'')+
      '</div>').join('');
  }

  function dateLabel(i,arr){
    if(i===0)return 'Today';
    return null;
  }

  function bubble(m){
    if(m.img)return '<div class="bubble with-img '+(m.from==='me'?'me':'them')+'"><img src="'+m.img+'" alt="image" loading="lazy"><span class="b-time">'+m.time+(m.from==='me'?receiptHTML(m):'')+'</span></div>';
    return '<div class="bubble '+(m.from==='me'?'me':'them')+'">'+m.text+'<span class="b-time">'+m.time+(m.from==='me'?receiptHTML(m):'')+'</span></div>';
  }
  function receiptHTML(m){
    const seen=m.seen!==false;
    return '<span class="receipts'+(seen?' seen':'')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>'+(seen?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" style="margin-left:-7px"><path d="M20 6L9 17l-5-5"/></svg>':'')+'</span>';
  }

  function listingPin(c){
    const it=D.LISTINGS.find(l=>l.id===c.listingId);
    if(!it)return '';
    return '<div class="thread-pinned"><a href="listing.html?id='+it.id+'"><div class="pt">'+(it.img?'<img src="'+it.img+'" alt="">':NL.glyph(it.key,22))+'</div><div class="pi"><b>'+it.title+'</b><span>'+(it.from?'From ':'')+NL.fmtUSD(it.usd)+(it.note||'')+'</span></div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="width:18px;height:18px;color:var(--tx-3)"><path d="M9 6l6 6-6 6"/></svg></a></div>';
  }

  function openConv(id){
    const c=convs.find(x=>x.id===id);if(!c)return;
    active=id;c.unread=0;NL.updateBadges();renderList($('#convSearch')?$('#convSearch').value:'');
    $('#chat').classList.add('show-thread');
    NL.api.messages.thread(id).then(r=>{
      const online=ONLINE[id];
      $('#thread').innerHTML=
        '<div class="thread-head">'+
          '<button class="thread-back" id="threadBack" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>'+
          '<div class="conv-av-wrap"><div class="conv-av">'+c.avInitial+'</div>'+(online?'<span class="conv-online"></span>':'')+'</div>'+
          '<div style="flex:1;min-width:0"><div class="conv-name">'+c.with+(c.verified?vtick:'')+'</div>'+(online?'<div class="head-status">Online now</div>':'<div class="conv-listing">Last seen 2h ago</div>')+'</div>'+
          '<div class="thread-actions">'+
            '<button title="Call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg></button>'+
            '<button title="More"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>'+
          '</div>'+
        '</div>'+
        listingPin(c)+
        '<div class="thread-body" id="threadBody"><div class="date-sep">Today</div>'+r.data.map(bubble).join('')+'</div>'+
        '<div class="qreplies">'+QREPLIES.map(q=>'<button data-qr="'+q.replace(/"/g,'&quot;')+'">'+q+'</button>').join('')+'</div>'+
        '<form class="thread-compose" id="composeForm">'+
          '<div class="compose-img-preview" id="composePrev" style="display:none"></div>'+
          '<div class="emoji-pop" id="emojiPop">'+EMOJIS.map(e=>'<button type="button" data-emoji="'+e+'">'+e+'</button>').join('')+'</div>'+
          '<div style="display:flex;gap:8px;align-items:center;padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid var(--line);background:var(--paper)">'+
            '<button type="button" class="compose-btn" id="attachBtn" title="Attach photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05l-9.19 9.19a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48"/></svg></button>'+
            '<input id="photoInput" type="file" accept="image/*" multiple hidden>'+
            '<button type="button" class="compose-btn" id="emojiBtn" title="Emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg></button>'+
            '<input id="composeInput" placeholder="Type a message…" autocomplete="off" style="flex:1;padding:11px 16px;border:1.5px solid var(--line-2);border-radius:var(--r-pill);font-weight:600">'+
            '<button class="send" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>'+
          '</div>'+
        '</form>';
      const body=$('#threadBody');body.scrollTop=body.scrollHeight;
      $('#threadBack').addEventListener('click',()=>$('#chat').classList.remove('show-thread'));
      bindCompose(id,c,body);
    });
  }

  function bindCompose(id,c,body){
    const pending=[];
    const inp=$('#composeInput');
    const prev=$('#composePrev');
    $('#attachBtn').addEventListener('click',()=>$('#photoInput').click());
    $('#photoInput').addEventListener('change',e=>{
      [...e.target.files].slice(0,4-pending.length).forEach(f=>{const r=new FileReader();r.onload=ev=>{pending.push(ev.target.result);renderPrev()};r.readAsDataURL(f)});
      e.target.value='';
    });
    function renderPrev(){
      prev.style.display=pending.length?'flex':'none';
      prev.innerHTML=pending.map((src,i)=>'<div class="ip"><img src="'+src+'"><button type="button" data-rmp="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>').join('');
    }
    prev.addEventListener('click',e=>{const r=e.target.closest('[data-rmp]');if(r){pending.splice(+r.dataset.rmp,1);renderPrev()}});

    $('#emojiBtn').addEventListener('click',e=>{e.stopPropagation();$('#emojiPop').classList.toggle('open')});
    $('#emojiPop').addEventListener('click',e=>{const b=e.target.closest('[data-emoji]');if(b){inp.value+=b.dataset.emoji;inp.focus()}});
    document.addEventListener('click',e=>{if(!e.target.closest('#emojiPop')&&!e.target.closest('#emojiBtn'))$('#emojiPop')&&$('#emojiPop').classList.remove('open')});

    document.querySelectorAll('[data-qr]').forEach(b=>b.addEventListener('click',()=>{inp.value=b.dataset.qr;inp.focus()}));

    $('#composeForm').addEventListener('submit',e=>{
      e.preventDefault();
      const txt=inp.value.trim();
      // send images first
      pending.forEach(img=>{const m={from:'me',img,time:'Now',seen:false};D.MESSAGES[id].push(m);body.insertAdjacentHTML('beforeend',bubble(m))});
      pending.length=0;renderPrev();
      if(txt){NL.api.messages.send(id,txt).then(res=>{res.data.seen=false;body.insertAdjacentHTML('beforeend',bubble(res.data));body.scrollTop=body.scrollHeight;renderList()});inp.value=''}
      body.scrollTop=body.scrollHeight;
      // simulate typing + reply
      setTimeout(()=>{const t=document.createElement('div');t.className='typing';t.id='typing';t.innerHTML='<span></span><span></span><span></span>';body.appendChild(t);body.scrollTop=body.scrollHeight},700);
      setTimeout(()=>{const t=$('#typing');if(t)t.remove();const reply={from:'them',text:'Thanks! Let me check and get back to you.',time:'Just now'};D.MESSAGES[id].push(reply);body.insertAdjacentHTML('beforeend',bubble(reply));// mark previous as seen
        document.querySelectorAll('.bubble.me .receipts').forEach(r=>r.classList.add('seen'));
        body.scrollTop=body.scrollHeight;renderList();},2100);
    });

    // image lightbox
    body.addEventListener('click',e=>{const img=e.target.closest('.bubble.with-img img');if(!img)return;
      const lb=document.createElement('div');lb.className='lightbox open';lb.innerHTML='<button class="lb-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img src="'+img.src+'">';document.body.appendChild(lb);document.body.style.overflow='hidden';lb.addEventListener('click',ev=>{if(ev.target===lb||ev.target.closest('.lb-close')){lb.remove();document.body.style.overflow=''}});
    });
  }

  document.addEventListener('click',e=>{const c=e.target.closest('[data-conv]');if(c)openConv(c.dataset.conv)});

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('messages.html');return}
    NL.api.messages.conversations().then(r=>{
      convs=r.data;
      // inject search bar above conv list
      const head=document.querySelector('.conv-list-head');
      if(head&&!document.getElementById('convSearch')){
        const sb=document.createElement('div');sb.className='conv-search';sb.innerHTML='<input id="convSearch" type="search" placeholder="Search conversations…">';head.after(sb);
        sb.querySelector('input').addEventListener('input',e=>renderList(e.target.value));
      }
      renderList();
      const p=new URLSearchParams(location.search);
      const cid=p.get('c');const listing=p.get('listing');
      if(cid)openConv(cid);
      else if(listing){const c=convs.find(x=>x.listingId===+listing);if(c)openConv(c.id)}
      else if(window.innerWidth>=768&&convs.length)openConv(convs[0].id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
