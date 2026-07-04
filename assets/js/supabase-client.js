/* ============================================================
   NILE LINK — supabase-client.js
   Boots the Supabase JS client and exposes it as NL.sb, and
   bridges the real Supabase auth session into the site's existing
   nl_user localStorage state (so nav, guards and .auth-only CSS
   keep working unchanged).

   If NL_SUPABASE.url / anonKey are blank, NL.sb stays null and
   api.js falls back to mock data.
   ============================================================ */
window.NL = window.NL || {};
NL.sb = null;
NL.sbReady = false;
NL.sbBucket = (window.NL_SUPABASE && window.NL_SUPABASE.storageBucket) || 'listing-photos';

(function(){
  const cfg = window.NL_SUPABASE || {};
  if(!cfg.url || !cfg.anonKey){
    console.info('[Nile Link] Supabase keys not set — running against mock data.');
    document.documentElement.dataset.nlBackend = 'mock';
    return;
  }
  document.documentElement.dataset.nlBackend = 'live';

  function initials(name){
    return (name||'U').trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase() || 'U';
  }

  // Build the site's nl_user object from a Supabase session + profile row.
  async function syncUser(session){
    if(!session || !session.user){
      if(NL.setUser) NL.setUser(null);
      document.dispatchEvent(new CustomEvent('nl:auth', {detail:{signedIn:false}}));
      return;
    }
    const u = session.user;
    let profile = null;
    try{
      const { data } = await NL.sb.from('profiles').select('*').eq('id', u.id).maybeSingle();
      profile = data;
    }catch(_){}

    const meta = u.user_metadata || {};
    let name = (profile && profile.name && profile.name !== 'Guest') ? profile.name
             : (meta.name || meta.full_name || (u.email ? u.email.split('@')[0] : 'You'));

    // Make sure a profile row exists and carries the name
    try{
      if(!profile){
        await NL.sb.from('profiles').upsert({ id:u.id, name });
      }else if(!profile.name || profile.name === 'Guest'){
        await NL.sb.from('profiles').update({ name }).eq('id', u.id);
      }
    }catch(_){}

    const nlUser = {
      id: u.id,
      name,
      email: u.email || (profile && profile.email) || '',
      phone: (profile && profile.phone) || u.phone || '',
      initials: initials(name),
      role: (profile && profile.role) || 'both',
      city: (profile && profile.city) || 'Juba',
      verified: !!(profile && profile.verified)
    };
    if(NL.setUser) NL.setUser(nlUser);
    document.dispatchEvent(new CustomEvent('nl:auth', {detail:{signedIn:true, user:nlUser}}));
  }
  NL.syncUser = syncUser;

  function boot(){
    try{
      NL.sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,   // completes Google OAuth redirect
          flowType: 'pkce'
        },
        realtime: { params: { eventsPerSecond: 5 } }
      });
      NL.sbReady = true;

      // React to sign-in / sign-out / token refresh
      NL.sb.auth.onAuthStateChange((_evt, session)=>{ syncUser(session); });

      // Initial hydrate
      NL.sb.auth.getSession().then(({data})=>{
        syncUser(data.session);
        document.dispatchEvent(new CustomEvent('nl:sb-ready'));
      });
    }catch(e){
      console.warn('[Nile Link] Supabase boot failed — falling back to mock.', e);
      NL.sb = null;
    }
  }

  if(window.supabase){ boot(); }
  else{
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.async = true;
    s.onload = boot;
    s.onerror = ()=> console.warn('[Nile Link] Failed to load supabase-js.');
    document.head.appendChild(s);
  }
})();
