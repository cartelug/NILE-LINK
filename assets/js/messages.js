/* ============================================================
   NILE LINK — messages.js
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);
  let convs=[],active=null;
  const vtick='<span class="v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg></span>';

  function renderList(){
    $('#convList').innerHTML=convs.map(c=>
      '<div class="conv'+(active===c.id?' active':'')+'" data-conv="'+c.id+'">'+
        '<div class="conv-av">'+c.avInitial+'</div>'+
        '<div class="conv-body">'+
          '<div class="conv-top"><span class="conv-name">'+c.with+(c.verified?vtick:'')+'</span><span class="conv-time">'+c.lastTime+'</span></div>'+
          '<div class="conv-last">'+c.lastMsg+'</div>'+
          '<div class="conv-listing">'+c.listingTitle+'</div>'+
        '</div>'+
        (c.unread?'<span class="conv-unread">'+c.unread+'</span>':'')+
      '</div>').join('');
  }

  function openConv(id){
    const c=convs.find(x=>x.id===id);if(!c)return;
    active=id;c.unread=0;NL.updateBadges();renderList();
    $('#chat').classList.add('show-thread');
    NL.api.messages.thread(id).then(r=>{
      $('#thread').innerHTML=
        '<div class="thread-head">'+
          '<button class="thread-back" id="threadBack"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>'+
          '<div class="conv-av">'+c.avInitial+'</div>'+
          '<div style="flex:1"><div class="conv-name">'+c.with+(c.verified?vtick:'')+'</div><div class="conv-listing">'+c.listingTitle+'</div></div>'+
          '<a class="btn btn-ghost btn-sm" href="listing.html?id='+c.listingId+'">View item</a>'+
        '</div>'+
        '<div class="thread-body" id="threadBody">'+r.data.map(m=>bubble(m)).join('')+'</div>'+
        '<form class="thread-compose" id="composeForm"><input id="composeInput" placeholder="Type a message…" autocomplete="off"><button class="send" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form>';
      const body=$('#threadBody');body.scrollTop=body.scrollHeight;
      $('#threadBack').addEventListener('click',()=>$('#chat').classList.remove('show-thread'));
      $('#composeForm').addEventListener('submit',e=>{
        e.preventDefault();const inp=$('#composeInput');const txt=inp.value.trim();if(!txt)return;
        NL.api.messages.send(id,txt).then(res=>{body.insertAdjacentHTML('beforeend',bubble(res.data));body.scrollTop=body.scrollHeight;renderList()});
        inp.value='';
        setTimeout(()=>{const reply={from:'them',text:'Thanks! Let me check and get back to you.',time:'Just now'};D.MESSAGES[id].push(reply);body.insertAdjacentHTML('beforeend',bubble(reply));body.scrollTop=body.scrollHeight},1400);
      });
    });
  }
  function bubble(m){return '<div class="bubble '+(m.from==='me'?'me':'them')+'">'+m.text+'<span class="b-time">'+m.time+'</span></div>'}

  document.addEventListener('click',e=>{const c=e.target.closest('[data-conv]');if(c)openConv(c.dataset.conv)});

  function init(){
    if(!NL.isAuthed()){location.href='signin.html?next='+encodeURIComponent('messages.html');return}
    NL.api.messages.conversations().then(r=>{
      convs=r.data;renderList();
      const p=new URLSearchParams(location.search);
      const cid=p.get('c');const listing=p.get('listing');
      if(cid)openConv(cid);
      else if(listing){const c=convs.find(x=>x.listingId===+listing);if(c)openConv(c.id)}
      else if(window.innerWidth>=768&&convs.length)openConv(convs[0].id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
