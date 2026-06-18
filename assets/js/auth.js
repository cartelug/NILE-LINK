/* ============================================================
   NILE LINK — auth.js  (sign in + sign up flows)
   ============================================================ */
(function(){
  const D=window.NLDATA;const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
  const page=document.body.dataset.page;
  const params=new URLSearchParams(location.search);
  const next=params.get('next')||'dashboard.html';
  const fmtPhone=v=>v.replace(/\D/g,'').slice(0,9);
  const finish=user=>{NL.setUser(user);NL.toast('Welcome, '+user.name+'! 🎉',{type:'success'});setTimeout(()=>location.href=next,700);};

  /* ---------- SIGN IN ---------- */
  if(page==='signin'){
    const phone=$('#siPhone');
    phone.addEventListener('input',()=>phone.value=fmtPhone(phone.value));
    function toOtp(){
      if(phone.value.length<9){NL.toast('Enter a valid phone number',{type:'error'});return}
      $('#otpPhone').textContent='+211 '+phone.value;
      NL.api.auth.requestOtp('+211'+phone.value);
      $$('.auth-step').forEach(s=>s.classList.toggle('active',s.dataset.step==='otp'));
      const first=document.querySelector('#otpRow input');if(first)setTimeout(()=>first.focus(),80);
    }
    $('#siSend').addEventListener('click',toOtp);
    phone.addEventListener('keydown',e=>{if(e.key==='Enter')toOtp()});
    $('[data-back]').addEventListener('click',()=>$$('.auth-step').forEach(s=>s.classList.toggle('active',s.dataset.step==='phone')));
    $('#siGoogle').addEventListener('click',()=>finish({name:'Neeza Shyaka',phone:'+211900000000',initials:'NS',role:'both',city:'Juba'}));
    $('#siResend').addEventListener('click',()=>NL.toast('Code resent',{type:'info'}));
    bindOtp(()=>doVerify());
    $('#siVerify').addEventListener('click',doVerify);
    function doVerify(){
      const code=[...$$('#otpRow input')].map(i=>i.value).join('');
      if(code.length<6){NL.toast('Enter the 6-digit code',{type:'error'});return}
      const close=NL.toast('Verifying…',{type:'loading'});
      NL.api.auth.verifyOtp('+211'+phone.value,code).then(r=>{close();if(r.ok)finish(r.data.user);else NL.toast(r.error||'Invalid code',{type:'error'})});
    }
  }

  /* ---------- SIGN UP ---------- */
  if(page==='signup'){
    const sel=$('#suCity');sel.innerHTML=D.CITIES.map(c=>'<option'+(c==='Juba'?' selected':'')+'>'+c+'</option>').join('');
    let role='buyer';
    $('#suRole').addEventListener('click',e=>{const o=e.target.closest('[data-role]');if(!o)return;$$('.role-opt').forEach(x=>x.classList.remove('on'));o.classList.add('on');role=o.dataset.role});
    const phone=$('#suPhone');phone.addEventListener('input',()=>phone.value=fmtPhone(phone.value));
    function goStep(n){
      $$('.auth-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n));
      $$('.auth-dots span').forEach((d,i)=>d.classList.toggle('on',i<n));
    }
    $$('[data-su-next]').forEach(b=>b.addEventListener('click',()=>{
      const s=+b.dataset.suNext;
      if(s===1&&phone.value.length<9){NL.toast('Enter a valid phone number',{type:'error'});return}
      if(s===2&&!$('#suName').value.trim()){NL.toast('Enter your name',{type:'error'});return}
      goStep(s+1);
    }));
    $$('[data-su-back]').forEach(b=>b.addEventListener('click',()=>goStep(+b.dataset.suBack-1)));
    $('#suFinish').addEventListener('click',()=>{
      const name=$('#suName').value.trim()||'New User';
      const close=NL.toast('Creating account…',{type:'loading'});
      NL.api.auth.signUp({name,phone:'+211 '+phone.value,role,city:sel.value}).then(r=>{close();finish(r.data.user)});
    });
  }

  /* ---------- OTP input behaviour ---------- */
  function bindOtp(onComplete){
    const inputs=[...$$('#otpRow input')];
    inputs.forEach((inp,i)=>{
      inp.addEventListener('input',()=>{
        inp.value=inp.value.replace(/\D/g,'').slice(0,1);
        if(inp.value&&i<inputs.length-1)inputs[i+1].focus();
        if(inputs.every(x=>x.value))onComplete();
      });
      inp.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!inp.value&&i>0)inputs[i-1].focus()});
      inp.addEventListener('paste',e=>{e.preventDefault();const d=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);d.split('').forEach((c,k)=>{if(inputs[k])inputs[k].value=c});if(d.length===6)onComplete()});
    });
  }
})();
