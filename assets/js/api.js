/* ============================================================
   NILE LINK — api.js  (v2, Supabase-backed with mock fallback)

   Response shape: every method resolves to { ok, data } (or
   { ok:false, error }). Keeps the pre-Supabase call sites intact.

   Backend selection:
     - If NL.sb (from supabase-client.js) is set, real Supabase is used.
     - Otherwise, methods wrap the in-memory NLDATA arrays (mock).
   ============================================================ */
window.NL=window.NL||{};
(function(){
  const D=window.NLDATA;
  const ok=(data)=>Promise.resolve({ok:true,data});
  const err=(error)=>Promise.resolve({ok:false,error});
  const useSb=()=>!!NL.sb;

  /* ---- Live USD → SSP rate (kept as-is) ---- */
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

  /* ---- Row → UI shape mapper (Supabase row → what pages expect) ---- */
  function rowToListing(r){
    if(!r) return null;
    return {
      id: r.id,
      title: r.title,
      cat: r.cat,
      key: r.key,
      group: r.group,
      type: r.type,
      usd: Number(r.usd)||0,
      from: !!r.from,
      note: r.note || '',
      loc: r.loc,
      seller: r.seller_name || 'Seller',
      badges: r.badges || [],
      desc: r.descr || '',
      img: r.img || '',
      imgs: r.imgs || []
    };
  }
  function rowToConversation(r){
    if(!r) return null;
    const me = NL.sb && NL.sb.auth.getUser ? null : null; // resolved by caller when needed
    return {
      id: r.id,
      listingId: r.listing_id,
      listingTitle: r.listing_title || '',
      buyerId: r.buyer_id,
      sellerId: r.seller_id,
      // "with" is filled in when we know which side we are
      with: '',
      lastMsg: r.last_msg || '',
      lastTime: r.last_time ? relativeTime(r.last_time) : '',
      unread: 0,
      verified: false,
      avInitial: ''
    };
  }
  function relativeTime(iso){
    const d = new Date(iso).getTime(); if(!d) return '';
    const diff = Math.max(0, Date.now() - d);
    const m = Math.floor(diff/60000);
    if(m < 1) return 'Just now';
    if(m < 60) return m+'m ago';
    const h = Math.floor(m/60); if(h < 24) return h+'h ago';
    const days = Math.floor(h/24); if(days < 7) return days+'d ago';
    return new Date(iso).toLocaleDateString();
  }

  async function currentUid(){
    if(!useSb()) return null;
    const { data } = await NL.sb.auth.getUser();
    return data && data.user ? data.user.id : null;
  }

  /* ============================================================
     LISTINGS
     ============================================================ */
  const listings = {
    async list(opts={}){
      if(!useSb()){
        // ---- mock ----
        let r=D.LISTINGS.slice();
        if(opts.cats&&opts.cats.length)r=r.filter(x=>opts.cats.includes(x.key));
        if(opts.group&&opts.group!=='all')r=r.filter(x=>x.group===opts.group);
        if(opts.search){const q=opts.search.toLowerCase();r=r.filter(x=>(x.title+' '+x.cat+' '+x.seller+' '+x.loc).toLowerCase().includes(q))}
        if(opts.max)r=r.filter(x=>x.usd<=opts.max);
        if(opts.sort==='low')r.sort((a,b)=>a.usd-b.usd);
        else if(opts.sort==='high')r.sort((a,b)=>b.usd-a.usd);
        else r.sort((a,b)=>(b.badges.includes('feat')?2:b.badges.includes('boost')?1:0)-(a.badges.includes('feat')?2:a.badges.includes('boost')?1:0));
        return ok(r);
      }
      // ---- live ----
      let q = NL.sb.from('v_listings').select('*').eq('status','live');
      if(opts.cats && opts.cats.length) q = q.in('key', opts.cats);
      if(opts.group && opts.group !== 'all') q = q.eq('group', opts.group);
      if(opts.max) q = q.lte('usd', opts.max);
      if(opts.search){
        const s = String(opts.search).replace(/[%_]/g,'').trim();
        if(s) q = q.or(`title.ilike.%${s}%,loc.ilike.%${s}%,cat.ilike.%${s}%`);
      }
      if(opts.sort==='low') q = q.order('usd',{ascending:true});
      else if(opts.sort==='high') q = q.order('usd',{ascending:false});
      else q = q.order('created_at',{ascending:false});
      const { data, error } = await q.limit(120);
      if(error) return err(error.message);
      return ok((data||[]).map(rowToListing));
    },

    async get(id){
      if(!useSb()) return ok(D.LISTINGS.find(x=>x.id===+id)||null);
      const { data, error } = await NL.sb.from('v_listings').select('*').eq('id', +id).maybeSingle();
      if(error) return err(error.message);
      return ok(rowToListing(data));
    },

    async related(id){
      if(!useSb()){
        const it=D.LISTINGS.find(x=>x.id===+id);
        return ok(it?D.LISTINGS.filter(x=>x.key===it.key&&x.id!==it.id).slice(0,4):[]);
      }
      const { data: item } = await NL.sb.from('listings').select('key').eq('id', +id).maybeSingle();
      if(!item) return ok([]);
      const { data, error } = await NL.sb.from('v_listings').select('*')
        .eq('status','live').eq('key', item.key).neq('id', +id).limit(4);
      if(error) return err(error.message);
      return ok((data||[]).map(rowToListing));
    },

    async mine(){
      if(!useSb()) return ok(D.SHOP);
      const uid = await currentUid(); if(!uid) return ok([]);
      const { data, error } = await NL.sb.from('v_listings').select('*').eq('owner_id', uid).order('created_at',{ascending:false});
      if(error) return err(error.message);
      return ok((data||[]).map(rowToListing));
    },

    async create(p){
      if(!useSb()) return ok({id:Date.now(),...p});
      const uid = await currentUid(); if(!uid) return err('Not signed in');
      const row = {
        owner_id: uid,
        title: p.title || 'Untitled',
        cat: p.cat || 'Other',
        key: p.key || 'electronics',
        "group": D.groupForCat(p.key) || 'products',
        type: D.typeForCat(p.key) || 'order',
        usd: p.usd || 0,
        "from": !!p.from,
        note: p.note || '',
        loc: p.loc || 'Juba',
        descr: p.desc || '',
        img: p.img || (p.imgs && p.imgs[0]) || '',
        imgs: p.imgs || [],
        status: 'live'
      };
      const { data, error } = await NL.sb.from('listings').insert(row).select().single();
      if(error) return err(error.message);
      return ok({id: data.id, ...p});
    },

    async saveDraft(p){
      if(!useSb()) return ok({id:'d'+Date.now(),...p});
      const uid = await currentUid(); if(!uid) return err('Not signed in');
      const { data, error } = await NL.sb.from('drafts').insert({
        owner_id: uid,
        payload: p,
        pct: p.pct || 30,
        missing: p.missing || ''
      }).select().single();
      if(error) return err(error.message);
      return ok({id: data.id, ...p});
    }
  };

  /* ============================================================
     MESSAGES
     ============================================================ */
  const messages = {
    async conversations(){
      if(!useSb()) return ok(D.CONVERSATIONS);
      const uid = await currentUid(); if(!uid) return ok([]);
      const { data, error } = await NL.sb.from('v_conversations').select('*')
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order('updated_at',{ascending:false});
      if(error) return err(error.message);
      const rows = (data||[]).map(r=>{
        const isBuyer = r.buyer_id === uid;
        return {
          id: r.id,
          listingId: r.listing_id,
          listingTitle: r.listing_title || '',
          with: isBuyer ? (r.seller_name||'Seller') : (r.buyer_name||'Buyer'),
          lastMsg: r.last_msg || '',
          lastTime: r.last_time ? relativeTime(r.last_time) : '',
          unread: isBuyer ? (r.unread_for_buyer||0) : (r.unread_for_seller||0),
          verified: isBuyer ? !!r.seller_verified : !!r.buyer_verified,
          avInitial: ((isBuyer ? r.seller_name : r.buyer_name) || '?').charAt(0).toUpperCase()
        };
      });
      return ok(rows);
    },

    async thread(id){
      if(!useSb()) return ok(D.MESSAGES[id]||[]);
      const uid = await currentUid();
      const { data, error } = await NL.sb.from('messages').select('*')
        .eq('conversation_id', id).order('created_at',{ascending:true}).limit(300);
      if(error) return err(error.message);
      // Mark thread read for this user
      const conv = await NL.sb.from('conversations').select('buyer_id,seller_id').eq('id',id).maybeSingle();
      if(conv.data){
        const patch = conv.data.buyer_id === uid ? {unread_for_buyer:0} : {unread_for_seller:0};
        await NL.sb.from('conversations').update(patch).eq('id', id);
      }
      const rows = (data||[]).map(m=>({
        from: m.sender_id === uid ? 'me' : 'them',
        text: m.body,
        image: m.image_url || undefined,
        time: relativeTime(m.created_at)
      }));
      return ok(rows);
    },

    async send(convId, text){
      if(!useSb()){
        const m={from:'me',text,time:'Just now'};
        (D.MESSAGES[convId]=D.MESSAGES[convId]||[]).push(m);
        const c=D.CONVERSATIONS.find(x=>x.id===convId);
        if(c){c.lastMsg=text;c.lastTime='Just now'}
        return ok(m);
      }
      const uid = await currentUid(); if(!uid) return err('Not signed in');
      const { data, error } = await NL.sb.from('messages').insert({
        conversation_id: convId, sender_id: uid, body: text
      }).select().single();
      if(error) return err(error.message);
      return ok({from:'me', text, time:'Just now', id:data.id});
    },

    // New: start (or return existing) conversation about a listing
    async startWith(listingId){
      if(!useSb()) return ok({id:'c-mock', with:'Seller'});
      const uid = await currentUid(); if(!uid) return err('Not signed in');
      const { data: l } = await NL.sb.from('listings').select('owner_id').eq('id', +listingId).maybeSingle();
      if(!l) return err('Listing not found');
      const sellerId = l.owner_id;
      if(sellerId === uid) return err("You can't message yourself");
      // upsert
      const { data, error } = await NL.sb.from('conversations')
        .upsert({ listing_id:+listingId, buyer_id: uid, seller_id: sellerId }, { onConflict: 'listing_id,buyer_id,seller_id' })
        .select().single();
      if(error) return err(error.message);
      return ok({id: data.id});
    }
  };

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */
  const notifications = {
    async list(){
      if(!useSb()) return ok(D.NOTIFICATIONS);
      const uid = await currentUid(); if(!uid) return ok([]);
      const { data, error } = await NL.sb.from('notifications').select('*')
        .eq('user_id', uid).order('created_at',{ascending:false}).limit(50);
      if(error) return err(error.message);
      return ok((data||[]).map(n=>({
        id: n.id, type: n.type, title: n.title, body: n.body,
        time: relativeTime(n.created_at), read: !!n.read, link: n.link, icon: n.icon
      })));
    },
    async unread(){
      if(!useSb()) return ok(D.NOTIFICATIONS.filter(n=>!n.read).length);
      const uid = await currentUid(); if(!uid) return ok(0);
      const { count, error } = await NL.sb.from('notifications')
        .select('id', {count:'exact', head:true}).eq('user_id', uid).eq('read', false);
      if(error) return err(error.message);
      return ok(count||0);
    },
    async markRead(id){
      if(!useSb()){const n=D.NOTIFICATIONS.find(x=>x.id===id);if(n)n.read=true;return ok(n)}
      const { data, error } = await NL.sb.from('notifications').update({read:true}).eq('id', id).select().maybeSingle();
      if(error) return err(error.message);
      return ok(data);
    },
    async markAllRead(){
      if(!useSb()){D.NOTIFICATIONS.forEach(n=>n.read=true);return ok(D.NOTIFICATIONS)}
      const uid = await currentUid(); if(!uid) return ok([]);
      const { error } = await NL.sb.from('notifications').update({read:true}).eq('user_id', uid).eq('read', false);
      if(error) return err(error.message);
      return ok([]);
    }
  };

  /* ============================================================
     REQUESTS (kept as mock — surfaces on dashboard only)
     ============================================================ */
  const requests = { list: ()=> ok(D.REQUESTS) };

  /* ============================================================
     REPORTS — file a listing report (feeds the admin moderation queue)
     ============================================================ */
  const reports = {
    async file(listingId, reason){
      if(!useSb()) return ok({filed:true});
      const uid = await currentUid(); if(!uid) return err('Please sign in to report');
      const { error } = await NL.sb.from('reports').insert({
        listing_id: +listingId, reporter_id: uid, reason: (reason||'Reported').slice(0,300), details:''
      });
      if(error) return err(error.message);
      return ok({filed:true});
    }
  };

  /* ============================================================
     AUTH — real email/password + Google (Supabase Auth).
     When NL.sb is present these hit Supabase; otherwise a mock
     fallback keeps the site usable without keys.
     The site's nl_user localStorage mirror is kept in sync by
     supabase-client.js (NL.syncUser) on every auth state change.
     ============================================================ */
  function mockUser(p){
    const name = p.name || (p.email? p.email.split('@')[0] : 'You');
    return { id:'mock', name, email:p.email||'', phone:'', initials:(name).split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase(), role:p.role||'both', city:p.city||'Juba' };
  }
  const auth = {
    // Create account with email + password
    async signUpEmail(p){
      if(!useSb()) return ok({ user: mockUser(p), needsConfirm:false });
      const { data, error } = await NL.sb.auth.signUp({
        email: p.email, password: p.password,
        options: { data: { name: p.name || '' } }
      });
      if(error) return err(error.message);
      // If a session came back (email confirmation OFF), write the profile now.
      if(data.session && data.user){
        try{ await NL.sb.from('profiles').upsert({
          id: data.user.id, name: p.name || '', role: p.role || 'both', city: p.city || 'Juba'
        }); }catch(_){}
      }
      return ok({ user: data.user, needsConfirm: !data.session });
    },

    // Sign in with email + password
    async signInEmail(p){
      if(!useSb()) return ok({ user: mockUser(p) });
      const { data, error } = await NL.sb.auth.signInWithPassword({ email:p.email, password:p.password });
      if(error) return err(error.message);
      return ok({ user: data.user });
    },

    // Google OAuth. redirectTo = where Google sends the user back.
    async signInGoogle(redirectTo){
      if(!useSb()) return err('Google sign-in needs the live backend');
      const { error } = await NL.sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if(error) return err(error.message);
      return ok({ redirecting:true });
    },

    async resetPassword(email, redirectTo){
      if(!useSb()) return ok({ sent:true });
      const { error } = await NL.sb.auth.resetPasswordForEmail(email, { redirectTo });
      if(error) return err(error.message);
      return ok({ sent:true });
    },

    async updatePassword(newPassword){
      if(!useSb()) return ok({});
      const { error } = await NL.sb.auth.updateUser({ password:newPassword });
      if(error) return err(error.message);
      return ok({});
    },

    async signOut(){
      if(useSb()){ try{ await NL.sb.auth.signOut(); }catch(_){} }
      return ok({});
    }
  };

  /* ============================================================
     Storage helpers (used by post.js photo upload)
     ============================================================ */
  const storage = {
    async uploadPhoto(file){
      if(!useSb()){
        return new Promise(res=>{
          const r=new FileReader();
          r.onload=e=>res({ok:true, data:{url:e.target.result}});
          r.readAsDataURL(file);
        });
      }
      const uid = await currentUid(); if(!uid) return err('Not signed in');
      const path = `${uid}/${Date.now()}-${(file.name||'photo').replace(/[^A-Za-z0-9._-]/g,'_')}`;
      const { error } = await NL.sb.storage.from(NL.sbBucket).upload(path, file, {
        cacheControl:'3600', upsert:false, contentType: file.type || 'image/jpeg'
      });
      if(error) return err(error.message);
      const { data } = NL.sb.storage.from(NL.sbBucket).getPublicUrl(path);
      return ok({url: data.publicUrl, path});
    }
  };

  NL.api = { listings, messages, notifications, requests, reports, auth, storage, rate:{get:()=>ok(RATE)} };
})();
