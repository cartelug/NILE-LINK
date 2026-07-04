/* ============================================================
   NILE LINK — supabase-client.js
   Boots the Supabase JS client and exposes it as NL.sb.
   If NL_SUPABASE.url / anonKey are blank, NL.sb stays null and
   api.js falls back to the mock data — so the site keeps working
   before the project owner has pasted keys.
   ============================================================ */
window.NL = window.NL || {};
NL.sb = null;
NL.sbReady = false;
NL.sbBucket = (window.NL_SUPABASE && window.NL_SUPABASE.storageBucket) || 'listing-photos';

(function(){
  const cfg = window.NL_SUPABASE || {};
  if(!cfg.url || !cfg.anonKey){
    console.info('[Nile Link] Supabase keys not set — running against mock data. Fill assets/js/supabase-config.js to go live.');
    document.documentElement.dataset.nlBackend = 'mock';
    return;
  }
  document.documentElement.dataset.nlBackend = 'live';

  function boot(){
    try{
      NL.sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        realtime: { params: { eventsPerSecond: 5 } }
      });
      NL.sbReady = true;
      // Ensure we have a Supabase auth session (anonymous for now — replace
      // with real phone-OTP later, no other code needs to change).
      NL.sb.auth.getSession().then(async ({data})=>{
        if(!data || !data.session){
          try{ await NL.sb.auth.signInAnonymously(); }
          catch(e){ console.warn('[Nile Link] anon sign-in failed', e); }
        }
        document.dispatchEvent(new CustomEvent('nl:sb-ready'));
      });
      // Keep local NL user in sync when auth state changes
      NL.sb.auth.onAuthStateChange((_evt, session)=>{
        if(!session) return;
        // If a Nile Link user object exists in localStorage, patch its id
        try{
          const u = NL.getUser && NL.getUser();
          if(u && !u.id){ u.id = session.user.id; NL.setUser(u); }
        }catch(_){/* ignore */}
      });
    }catch(e){
      console.warn('[Nile Link] Supabase boot failed — falling back to mock.', e);
      NL.sb = null;
    }
  }

  if(window.supabase){ boot(); }
  else{
    // Lazy-load the JS SDK from esm.sh CDN as UMD build.
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.async = true;
    s.onload = boot;
    s.onerror = ()=> console.warn('[Nile Link] Failed to load supabase-js — falling back to mock.');
    document.head.appendChild(s);
  }
})();
