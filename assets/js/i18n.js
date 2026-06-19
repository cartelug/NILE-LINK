/* ============================================================
   NILE LINK — i18n.js  (v6 — full-coverage translation)
   Strategy: translate EVERY visible text node by its English
   source string. A hand-built dictionary is pre-seeded into the
   cache for instant, accurate strings; anything not in it is
   translated live via MyMemory (primary) → LibreTranslate (backup)
   and cached in localStorage. Result: all words translate.
   Languages: English · Arabic · Juba Arabic · Dinka.
   ============================================================ */
window.NLi18n=(function(){
  const LANGS={
    en:{name:'English',native:'English',dir:'ltr',api:null},
    ar:{name:'Arabic',native:'العربية',dir:'rtl',api:'ar'},
    ja:{name:'Juba Arabic',native:'جوبا عربي',dir:'rtl',api:'ar'},   /* dialect → MSA base + overrides */
    dk:{name:'Dinka',native:'Thuɔŋjäŋ',dir:'ltr',api:null}            /* MyMemory has no Dinka → hand pack */
  };

  /* ---- Hand dictionary, keyed by exact English source text ----
     Covers the whole visible chrome + key page copy. Arabic = MSA,
     Juba = colloquial South-Sudanese Arabic, Dinka = Bor standard.
     Dinka strings are best-effort and worth a native-speaker check. */
  const HAND={
    ar:{
      'Browse':'تصفح','Pricing':'الأسعار','About':'عن المنصة','Help':'المساعدة','Categories':'الفئات',
      'Sign in':'تسجيل الدخول','Register':'إنشاء حساب','Sell':'بيع','Search':'بحث','Saved':'المحفوظات',
      'Messages':'الرسائل','Notifications':'الإشعارات','Dashboard':'لوحة التحكم','Sign out':'تسجيل الخروج',
      'Home':'الرئيسية','Account':'الحساب','Post a Listing':'أضف إعلاناً','Post a listing':'أضف إعلاناً','Learn more':'اعرف المزيد',
      'Now live across 12 cities in South Sudan':'متوفر الآن في 12 مدينة في جنوب السودان',
      "South Sudan's":'جنوب السودان','Leading':'الرائدة','Marketplace':'منصة التسوق',
      'Buy and sell phones, cars, property, fashion and services — safely, with verified sellers, right here at home.':'اشترِ وبِع الهواتف والسيارات والعقارات والأزياء والخدمات — بأمان، مع بائعين موثوقين، هنا في بلدك.',
      '43,000+ Listings':'أكثر من 43,000 إعلان','Verified Sellers':'بائعون موثوقون','Free Forever':'مجاني للأبد','Live rate':'سعر الصرف المباشر',
      'Browse by category':'تصفح حسب الفئة','View all':'عرض الكل','See all':'عرض الكل','Categories':'الفئات',
      'Fresh listings':'إعلانات جديدة','Trending right now':'الأكثر رواجاً الآن',
      'All':'الكل','Products':'منتجات','Cars & Property':'سيارات وعقارات','Services':'خدمات',
      'Simple & safe':'بسيط وآمن','How Nile Link works':'كيف يعمل Nile Link',
      "Whether you're buying or selling, you're three steps away from a deal.":'سواء كنت تشتري أو تبيع، أنت على بعد ثلاث خطوات من إتمام الصفقة.',
      "I'm buying":'أنا أشتري',"I'm selling":'أنا أبيع',
      'Active Listings':'إعلانات نشطة','Verified Sellers':'بائعون موثوقون','Cities Covered':'مدن مغطاة','Always & Forever':'دائماً وأبداً',
      'Live numbers · updated daily':'أرقام مباشرة · تُحدّث يومياً','View full impact report':'عرض تقرير الأثر الكامل',
      'Why Nile Link':'لماذا Nile Link','Built on trust':'مبني على الثقة',
      'Verified sellers':'بائعون موثوقون','Secure in-app chat':'محادثة آمنة داخل التطبيق','Free to list':'النشر مجاني',
      'Loved locally':'محبوب محلياً','Trusted across South Sudan':'موثوق في جميع أنحاء جنوب السودان',
      'Never miss a deal':'لا تفوّت أي صفقة',
      'Get notified when new listings drop in your favourite categories.':'احصل على إشعار عند نزول إعلانات جديدة في فئاتك المفضلة.',
      'Your email address':'بريدك الإلكتروني','Subscribe':'اشترك',
      'Company':'الشركة','Support':'الدعم','About Us':'من نحن','Careers':'وظائف','Contact':'اتصل بنا',
      'Help Center':'مركز المساعدة','Safety Tips':'نصائح الأمان','Report a Listing':'الإبلاغ عن إعلان','Terms & Privacy':'الشروط والخصوصية',
      'Post in 2 min':'انشر في دقيقتين','0 commission':'بدون عمولة','Live in 12 cities':'متوفر في 12 مدينة',
      'Start selling today.':'ابدأ البيع اليوم.',"It's completely":'إنه','free.':'مجاني تماماً.',
      'Reach thousands of buyers across South Sudan. Post your first listing in under two minutes — no fees, no catch.':'اعرض على آلاف المشترين في جنوب السودان. انشر أول إعلان لك في أقل من دقيقتين — بلا رسوم، بلا شروط خفية.',
      'Choose your language':'اختر لغتك','You can change this later from the footer.':'يمكنك تغيير ذلك لاحقاً من أسفل الصفحة.',
      'Skip — continue in English':'تخطّي — المتابعة بالإنجليزية',
      'Filters':'عوامل التصفية','Show results':'عرض النتائج','Neighbourhood':'الحي','Max price (USD)':'أعلى سعر (دولار)','Listing type':'نوع الإعلان',
      'Verified only':'موثوق فقط','With photos':'بصور','Under $100':'أقل من 100$','Under $1,000':'أقل من 1,000$','Boosted':'معزّز','Negotiable':'قابل للتفاوض',
      'Save this search':'احفظ هذا البحث','Grid':'شبكة','Map':'خريطة','Newest':'الأحدث',
      'Sign in':'تسجيل الدخول','Send code':'إرسال الرمز','Continue with Google':'المتابعة عبر Google','Create an account':'إنشاء حساب',
      'Verify & sign in':'تحقّق وسجّل الدخول','Resend code':'إعادة إرسال الرمز','Phone number':'رقم الهاتف','Back':'رجوع',
      'Create your account':'أنشئ حسابك','Continue':'متابعة','Full name':'الاسم الكامل','Buy':'شراء','City':'المدينة','Create account':'إنشاء الحساب',
      'Pricing & Boosts':'الأسعار والتعزيزات','Simple, fair pricing':'أسعار بسيطة وعادلة','Monthly':'شهري','Yearly':'سنوي','Starter':'المبتدئ','Free':'مجاني'
    },
    ja:{
      'Browse':'دوّر','Pricing':'الأسعار','About':'عن النادي','Help':'مساعدة','Categories':'أنواع',
      'Sign in':'دخول','Register':'سجّل','Sell':'بيع','Search':'دوّر','Saved':'المحفوظ','Messages':'رسائل','Notifications':'إشعارات',
      'Home':'البيت','Account':'الحساب','Post a Listing':'حُطّ إعلان','Learn more':'اعرف زيادة',
      'Now live across 12 cities in South Sudan':'هسّع في 12 مدينة في جنوب السودان',
      "South Sudan's":'جنوب السودان','Leading':'الأكبر','Marketplace':'سوق',
      'Buy and sell phones, cars, property, fashion and services — safely, with verified sellers, right here at home.':'اشتري وبيع تلفونات وعربات وبيوت ولبس وخدمات — بأمان مع ناس موثوقين، هنا في بلدك.',
      'Search':'دوّر','View all':'شوف الكل','See all':'شوف الكل',
      'Trending right now':'الدايرين هسّع','All':'الكل','Products':'بضائع','Cars & Property':'عربات وبيوت','Services':'خدمات',
      'How Nile Link works':'Nile Link شغّال كيف',"I'm buying":'أنا بشتري',"I'm selling":'أنا ببيع',
      'Choose your language':'اختار لغتك','You can change this later from the footer.':'تقدر تغيّرها بعدين من تحت.','Skip — continue in English':'سيب — كمّل بالإنجليزي',
      'Subscribe':'اشترك','Continue':'كمّل','Back':'رجّع','Free':'بلاش'
    },
    dk:{
      'Browse':'Yök','Pricing':'Wëu','About':'Ɣɔɔc','Help':'Kuɔny','Categories':'Kuat',
      'Sign in':'Lɔɔr thïn','Register':'Cak rin','Sell':'Ɣaac','Search':'Yök','Saved':'Kɔc tääu','Messages':'Wɛɛt','Notifications':'Lɛk',
      'Home':'Pan','Account':'Akaun','Post a Listing':'Taau ɣäc','Learn more':'Ŋic juëc',
      'Now live across 12 cities in South Sudan':'Aŋoot ke pɛ̈ɛ̈i 12 në Pan-Thudän',
      "South Sudan's":'Pan-Thudän','Leading':'Dït','Marketplace':'Thuk',
      'Buy and sell phones, cars, property, fashion and services — safely, with verified sellers, right here at home.':'Ɣɔc ku ɣaac telefon, mɔbïl, baai, alɛ̈th ku lui — ke piathic, ke kɔc cɔk wɛ̈ɛ̈ny, ne baai.',
      'View all':'Tïŋ kɔ̈k','See all':'Tïŋ kɔ̈k','Trending right now':'Kek dït ëmën',
      'All':'Ëbɛn','Products':'Käŋ','Cars & Property':'Mɔbïl ku Baai','Services':'Lui',
      'How Nile Link works':'Nile Link aloi kadë',"I'm buying":'Ɣɛn aɣɔc',"I'm selling":'Ɣɛn aɣaac',
      'Choose your language':'Kuany thoŋdu','You can change this later from the footer.':'Yïn aleu wëlic ne piny.','Skip — continue in English':'Cuɔt — lɔ tueŋ ne Diŋëlïth',
      'Subscribe':'Mat','Continue':'Lɔ tueŋ','Back':'Dhuk','Free':'Abac','Free Forever':'Abac athɛɛr'
    }
  };

  /* ---- Persistent cache (seeded with HAND) ---- */
  const CKEY='nl_tcache_v6';
  let cache={};try{cache=JSON.parse(localStorage.getItem(CKEY)||'{}')}catch(e){}
  function seed(){for(const code in HAND){for(const src in HAND[code]){cache[code+'|'+src]=HAND[code][src]}}}
  seed();
  const saveCache=()=>{try{localStorage.setItem(CKEY,JSON.stringify(cache))}catch(e){}};

  const getLang=()=>localStorage.getItem('nl_lang')||'';
  const origins=new WeakMap();      /* text node → original English */
  const phOrigins=new WeakMap();    /* input → original placeholder */

  /* ---- which strings to skip (numbers, prices, brand, code) ---- */
  function skip(s){
    const t=s.trim();
    if(t.length<2)return true;
    if(!/[A-Za-z]/.test(t))return true;                 /* no latin letters → numbers/symbols */
    if(/^(Nile|Link|NileLink|SSP|USD|OTP|km|kg)$/i.test(t))return true;
    if(/^\+?\d[\d\s().-]*$/.test(t))return true;          /* phone/number */
    if(/^\$[\d,]/.test(t))return true;                    /* price */
    return false;
  }

  /* ---- translate one string (cache → MyMemory → LibreTranslate) ---- */
  async function translate(src,code){
    const key=code+'|'+src;
    if(cache[key]!=null)return cache[key];
    const api=(LANGS[code]||{}).api;
    if(!api){return src}                                   /* no API for this lang (e.g. Dinka) */
    /* MyMemory */
    try{
      const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(src)+'&langpair=en|'+api,{cache:'force-cache'});
      const d=await r.json();const out=d&&d.responseData&&d.responseData.translatedText;
      if(out&&typeof out==='string'&&!/MYMEMORY WARNING|INVALID/i.test(out)){cache[key]=out;saveCache();return out}
    }catch(e){}
    /* LibreTranslate backup */
    try{
      const r=await fetch('https://libretranslate.com/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:src,source:'en',target:api,format:'text'})});
      const d=await r.json();if(d&&d.translatedText){cache[key]=d.translatedText;saveCache();return d.translatedText}
    }catch(e){}
    return src;
  }

  /* ---- collect translatable text nodes ---- */
  function collectNodes(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode(n){
        const p=n.parentNode;if(!p)return NodeFilter.FILTER_REJECT;
        const tag=p.nodeName;
        if(tag==='SCRIPT'||tag==='STYLE'||tag==='NOSCRIPT'||tag==='CODE')return NodeFilter.FILTER_REJECT;
        if(p.closest('[data-no-translate]'))return NodeFilter.FILTER_REJECT;
        if(skip(n.nodeValue||''))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const out=[];let n;while((n=walker.nextNode()))out.push(n);return out;
  }
  function collectPlaceholders(){
    return [...document.querySelectorAll('input[placeholder],textarea[placeholder]')].filter(el=>!el.closest('[data-no-translate]')&&!skip(el.placeholder));
  }

  /* ---- run translation across the page ---- */
  let running=false;
  async function translatePage(code){
    if(running)return;running=true;
    const nodes=collectNodes();const phs=collectPlaceholders();
    /* dedupe unique source strings */
    const uniq=new Set();
    nodes.forEach(n=>{const o=origins.get(n)||n.nodeValue;uniq.add(o.trim())});
    phs.forEach(el=>{const o=phOrigins.get(el)||el.placeholder;uniq.add(o.trim())});
    /* resolve translations with limited concurrency */
    const list=[...uniq];const map={};let i=0;
    async function worker(){while(i<list.length){const s=list[i++];map[s]=await translate(s,code);}}
    await Promise.all(Array.from({length:4},worker));
    /* apply */
    nodes.forEach(n=>{const o=origins.get(n)||n.nodeValue;if(!origins.has(n))origins.set(n,o);const t=map[o.trim()];if(t)n.nodeValue=o.replace(o.trim(),t)});
    phs.forEach(el=>{const o=phOrigins.get(el)||el.placeholder;if(!phOrigins.has(el))phOrigins.set(el,o);const t=map[o.trim()];if(t)el.placeholder=t});
    running=false;
  }
  function restoreEnglish(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
    let n;while((n=walker.nextNode())){if(origins.has(n))n.nodeValue=origins.get(n)}
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(phOrigins.has(el))el.placeholder=phOrigins.get(el)});
  }

  /* ---- public: set language ---- */
  function setLang(code){
    localStorage.setItem('nl_lang',code);
    document.documentElement.lang=code;
    document.documentElement.dir=(LANGS[code]||{}).dir||'ltr';
    if(code==='en'){restoreEnglish();toast('Language set to English');return}
    const close=window.NL?NL.toast('Translating…',{type:'loading'}):null;
    translatePage(code).then(()=>{if(close)close();toast((HAND[code]&&HAND[code]['__done'])||'تم · Done')});
  }
  function toast(m){if(window.NL)NL.toast(m,{type:'info',duration:1500})}

  /* re-translate dynamically added content (cards, chat, etc.) */
  let reTimer;
  document.addEventListener('nl:translate',()=>{const c=getLang();if(c&&c!=='en'){clearTimeout(reTimer);reTimer=setTimeout(()=>translatePage(c),150)}});

  /* ---- language picker (first visit) ---- */
  function pickerHTML(){
    const root=window.NL&&NL.root?NL.root:'';
    return '<div class="lp-scrim" id="lpScrim" data-no-translate></div>'+
    '<div class="lp" id="lp" role="dialog" aria-labelledby="lpTitle" data-no-translate>'+
      '<div class="lp-inner">'+
        '<div class="lp-logo"><img src="'+root+'assets/images/logo.png" alt=""></div>'+
        '<h2 id="lpTitle">Choose your language<br><span dir="rtl">اختر لغتك</span></h2>'+
        '<p>Pick the language you read best. You can change it anytime.</p>'+
        '<div class="lp-grid">'+
          Object.keys(LANGS).map(k=>'<button class="lp-card" data-lp="'+k+'"><b>'+LANGS[k].native+'</b><span>'+LANGS[k].name+'</span></button>').join('')+
        '</div>'+
        '<button class="lp-skip" data-lp="en">Skip — continue in English</button>'+
      '</div>'+
    '</div>';
  }
  function openPicker(){
    if(document.getElementById('lp'))return;
    const w=document.createElement('div');w.innerHTML=pickerHTML();while(w.firstChild)document.body.appendChild(w.firstChild);
    requestAnimationFrame(()=>{document.getElementById('lp').classList.add('open');document.getElementById('lpScrim').classList.add('open')});
    document.body.style.overflow='hidden';
    const close=()=>{const lp=document.getElementById('lp'),sc=document.getElementById('lpScrim');if(lp)lp.classList.remove('open');if(sc)sc.classList.remove('open');document.body.style.overflow='';setTimeout(()=>{if(lp)lp.remove();if(sc)sc.remove()},340)};
    document.getElementById('lp').addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(!b)return;setLang(b.dataset.lp);close()});
    document.getElementById('lpScrim').addEventListener('click',close);
  }

  /* ---- boot ---- */
  function boot(){
    const cur=getLang();
    if(cur){document.documentElement.lang=cur;document.documentElement.dir=(LANGS[cur]||{}).dir||'ltr';if(cur!=='en')setTimeout(()=>translatePage(cur),300)}
    else{
      const pl=document.getElementById('preloader');
      const show=()=>setTimeout(openPicker,400);
      if(!pl)show();
      else{const obs=new MutationObserver(()=>{if(pl.classList.contains('done')||!pl.parentNode){obs.disconnect();show()}});obs.observe(pl,{attributes:true,attributeFilter:['class']});}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  return {setLang,getLang,openPicker,LANGS,translate};
})();
