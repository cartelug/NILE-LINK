/* ============================================================
   NILE LINK — auth.js  (email/password + Google via Supabase)
   Sign in + sign up. Redirects are driven by the `nl:auth` event
   that supabase-client.js fires once a real session is synced —
   this covers email sign-in, Google OAuth return, and an
   already-signed-in visitor landing on an auth page.
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
  const page=document.body.dataset.page;
  if(page!=='signin' && page!=='signup') return;

  const params=new URLSearchParams(location.search);
  const next=params.get('next')||'dashboard.html';
  const intendLive=()=>document.documentElement.dataset.nlBackend==='live';

  // Resolve true once the Supabase client is ready (or false in mock mode).
  function whenReady(){
    return new Promise(res=>{
      if(!intendLive()) return res(false);
      if(NL.sb) return res(true);
      let done=false;
      document.addEventListener('nl:sb-ready', ()=>{ if(!done){done=true;res(!!NL.sb);} }, {once:true});
      setTimeout(()=>{ if(!done){done=true;res(!!NL.sb);} }, 7000);
    });
  }

  function oauthRedirect(){
    return location.origin + location.pathname + (params.get('next')?('?next='+encodeURIComponent(params.get('next'))):'');
  }

  let redirected=false;
  function goNext(){ if(redirected) return; redirected=true; location.href=next; }
  document.addEventListener('nl:auth', e=>{ if(e.detail && e.detail.signedIn) goNext(); });

  // Safety net: if a session already exists (incl. Google OAuth return), redirect.
  whenReady().then(ok=>{ if(ok && NL.sb){ NL.sb.auth.getSession().then(({data})=>{ if(data && data.session) goNext(); }); } });

  const busy=(btn,on,label)=>{ if(!btn)return; btn.disabled=on; if(on){btn.dataset._t=btn.textContent;btn.textContent=label||'Please wait…';}else if(btn.dataset._t){btn.textContent=btn.dataset._t;} };

  /* ---------------- SIGN IN ---------------- */
  if(page==='signin'){
    const form=$('#siForm');
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const email=$('#siEmail').value.trim(), password=$('#siPassword').value;
      if(!email||!password){ NL.toast('Enter your email and password',{type:'error'}); return; }
      const btn=$('#siSubmit'); busy(btn,true,'Signing in…');
      const isLive=await whenReady();
      const r=await NL.api.auth.signInEmail({email,password});
      if(!r.ok){ busy(btn,false); NL.toast(r.error||'Sign in failed',{type:'error'}); return; }
      NL.toast('Welcome back! 🎉',{type:'success'});
      if(!isLive){ NL.setUser(r.data.user); goNext(); }   // mock fallback
    });

    $('#siGoogle').addEventListener('click', async ()=>{
      const isLive=await whenReady();
      if(!isLive){ NL.toast('Google sign-in is warming up — try again in a moment',{type:'info'}); return; }
      const r=await NL.api.auth.signInGoogle(oauthRedirect());
      if(!r.ok) NL.toast(r.error||'Google sign-in failed',{type:'error'});
    });

    $('#siForgot').addEventListener('click', async ()=>{
      const email=$('#siEmail').value.trim();
      if(!email){ NL.toast('Type your email above first, then tap Forgot password',{type:'info'}); return; }
      await whenReady();
      const r=await NL.api.auth.resetPassword(email, location.origin+location.pathname);
      if(r.ok) NL.toast('Password reset link sent to '+email,{type:'success'});
      else NL.toast(r.error||'Could not send reset link',{type:'error'});
    });
  }

  /* ---------------- SIGN UP ---------------- */
  if(page==='signup'){
    const sel=$('#suCity');
    if(sel) sel.innerHTML=(D&&D.CITIES?D.CITIES:['Juba']).map(c=>'<option'+(c==='Juba'?' selected':'')+'>'+c+'</option>').join('');
    let role='buyer';
    const rolePick=$('#suRole');
    if(rolePick) rolePick.addEventListener('click',e=>{const o=e.target.closest('[data-role]');if(!o)return;$$('.role-opt').forEach(x=>x.classList.remove('on'));o.classList.add('on');role=o.dataset.role;});

    const form=$('#suForm');
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const name=$('#suName').value.trim();
      const email=$('#suEmail').value.trim();
      const password=$('#suPassword').value;
      const city=sel?sel.value:'Juba';
      if(!name){ NL.toast('Enter your name',{type:'error'}); return; }
      if(!email){ NL.toast('Enter your email',{type:'error'}); return; }
      if(!password||password.length<6){ NL.toast('Password must be at least 6 characters',{type:'error'}); return; }
      const btn=$('#suFinish'); busy(btn,true,'Creating account…');
      const isLive=await whenReady();
      const r=await NL.api.auth.signUpEmail({name,email,password,role,city});
      if(!r.ok){ busy(btn,false); NL.toast(r.error||'Could not create account',{type:'error'}); return; }
      if(r.data.needsConfirm){ busy(btn,false); showConfirm(email); return; }
      NL.toast('Account created! 🎉',{type:'success'});
      if(!isLive){ NL.setUser(r.data.user); goNext(); }
    });

    const gbtn=$('#suGoogle');
    if(gbtn) gbtn.addEventListener('click', async ()=>{
      const isLive=await whenReady();
      if(!isLive){ NL.toast('Google sign-up is warming up — try again in a moment',{type:'info'}); return; }
      const r=await NL.api.auth.signInGoogle(oauthRedirect());
      if(!r.ok) NL.toast(r.error||'Google sign-up failed',{type:'error'});
    });

    function showConfirm(email){
      const card=document.querySelector('.auth-step[data-step="1"]');
      if(!card) return;
      card.innerHTML=
        '<div style="text-align:center;padding:8px 0">'+
        '<div style="width:64px;height:64px;border-radius:18px;background:var(--lime-soft,#eefcca);color:var(--lime-deep,#4d7c0f);display:grid;place-items:center;margin:0 auto 16px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 7l8 6 8-6"/></svg></div>'+
        '<h1>Check your email</h1>'+
        '<p class="auth-sub">We sent a confirmation link to <b>'+email+'</b>. Tap it to activate your account, then sign in.</p>'+
        '<a class="btn btn-lime btn-block btn-lg" href="signin.html'+(params.get('next')?('?next='+encodeURIComponent(params.get('next'))):'')+'" style="margin-top:12px">Go to sign in</a>'+
        '<p class="auth-foot" style="margin-top:14px">Wrong email? <a href="signup.html">Start over</a></p>'+
        '</div>';
    }
  }
})();
