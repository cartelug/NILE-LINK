/* ============================================================
   NILE LINK — i18n.js
   Two-layer translation:
   (1) Pre-shipped UI strings for English / Arabic / Juba Arabic / Dinka
   (2) Live MyMemory API for dynamic content (with localStorage cache)
   Strings are addressed by `data-i18n="key"` and `data-i18n-ph="key"` for
   placeholders. Translate calls happen on language change + on init.
   ============================================================ */
(function(){
  const LANGS={
    en:{name:'English',native:'English',dir:'ltr'},
    ar:{name:'Arabic',native:'العربية',dir:'rtl'},
    ja:{name:'Juba Arabic',native:'جوبا عربي',dir:'rtl'},
    dk:{name:'Dinka',native:'Thuɔŋjäŋ',dir:'ltr'}
  };

  /* Pre-shipped UI translations. English is the canonical source.
     Other languages use the same keys; missing keys fall back to English. */
  const STRINGS={
    en:{},
    ar:{
      'nav.browse':'تصفح','nav.pricing':'الأسعار','nav.about':'عن المنصة','nav.help':'المساعدة',
      'nav.signin':'تسجيل الدخول','nav.register':'إنشاء حساب','nav.sell':'بِع','nav.categories':'الفئات',
      'hero.badge':'متوفر الآن في 12 مدينة في جنوب السودان',
      'hero.h1.line1':"جنوب السودان",
      'hero.h1.leading':'الرائدة','hero.h1.market':'منصة التسوق',
      'hero.lead':'اشترِ وبِع الهواتف والسيارات والعقارات والأزياء والخدمات — بأمان، مع بائعين موثقين.',
      'hero.search':'ابحث عن هواتف، سيارات، أراضٍ…','hero.btn.search':'بحث',
      'hero.pill.listings':'أكثر من 43,000 إعلان','hero.pill.verified':'بائعون موثقون','hero.pill.free':'مجاني للأبد',
      'hero.fx.label':'سعر الصرف المباشر',
      'home.cat.title':'تصفح حسب الفئة','home.cat.viewall':'عرض الكل',
      'home.trending.eyebrow':'إعلانات جديدة','home.trending.title':'الأكثر رواجاً الآن','home.trending.seeall':'عرض الكل',
      'home.tabs.all':'الكل','home.tabs.products':'منتجات','home.tabs.vehprop':'سيارات وعقارات','home.tabs.services':'خدمات',
      'home.how.eyebrow':'بسيط وآمن','home.how.title':'كيف يعمل Nile Link','home.how.sub':'سواء كنت تشتري أو تبيع، أنت على بعد ثلاث خطوات من الصفقة.',
      'home.how.buy':'أنا أشتري','home.how.sell':'أنا أبيع',
      'home.stats.live':'أرقام مباشرة · تحدث يومياً','home.stats.report':'عرض تقرير التأثير الكامل',
      'home.stats.listings':'إعلانات نشطة','home.stats.verified':'بائعون موثقون','home.stats.cities':'مدن مغطاة','home.stats.free':'دائماً وأبداً',
      'home.why.eyebrow':'لماذا Nile Link','home.why.title':'مبني على الثقة',
      'home.why.verified.h':'بائعون موثقون','home.why.verified.p':'كل متجر بعلامة التحقق الخضراء قام فريقنا بمراجعته.',
      'home.why.chat.h':'محادثة آمنة','home.why.chat.p':'تحدث مع البائعين دون مشاركة رقمك حتى تكون مستعداً.',
      'home.why.free.h':'مجاني للنشر','home.why.free.p':'انشر إعلانات بلا حدود، مجاناً تماماً.',
      'home.cta.h':"ابدأ البيع اليوم. <span class='hl'>إنه مجاني تماماً.</span>",
      'home.cta.p':'اعرض على آلاف المشترين في جنوب السودان. انشر أول إعلان لك في أقل من دقيقتين.',
      'home.cta.post':'انشر إعلاناً','home.cta.learn':'اعرف المزيد',
      'home.cta.chip1':'✓ النشر في دقيقتين','home.cta.chip2':'✓ بدون عمولة','home.cta.chip3':'✓ متوفر في 12 مدينة',
      'home.tst.eyebrow':'محبوب محلياً','home.tst.title':'موثوق في جميع أنحاء جنوب السودان',
      'footer.news.h':'لا تفوّت أي صفقة','footer.news.p':'احصل على إشعارات بالإعلانات الجديدة في فئاتك المفضلة.','footer.news.email':'بريدك الإلكتروني','footer.news.btn':'اشترك',
      'footer.browse':'تصفّح','footer.company':'الشركة','footer.support':'الدعم',
      'lang.picker.h':'اختر لغتك','lang.picker.p':'يمكنك تغيير ذلك في أي وقت لاحقاً من التذييل.','lang.picker.skip':'تخطي',
      'lang.changed':'تم تغيير اللغة',
    },
    ja:{
      'nav.browse':'دور','nav.pricing':'الأسعار','nav.about':'عن النادي','nav.help':'مساعدة',
      'nav.signin':'دخول','nav.register':'سجِّل','nav.sell':'بيع','nav.categories':'أنواع',
      'hero.badge':'هَسَّع في ١٢ مدينة في جنوب السودان',
      'hero.h1.line1':'جنوب السودان',
      'hero.h1.leading':'الأكبر','hero.h1.market':'سوق',
      'hero.lead':'اشتري وبيع تلفونات وعربات وبيوت ولبس وخدمات — بأمان مع ناس موثوقين.',
      'hero.search':'دوّر تلفونات، عربات، أرض…','hero.btn.search':'دوّر',
      'lang.picker.h':'اختار لغتك','lang.picker.p':'تَقدر تغيرها بعدين من تحت.','lang.picker.skip':'سيب','lang.changed':'تغيّرت اللغة',
    },
    dk:{
      'nav.browse':'Yök','nav.pricing':'Wëu','nav.about':'Ɣɔn kɔɔr','nav.help':'Kony',
      'nav.signin':'Lɔɔr','nav.register':'Cak','nav.sell':'Ɣaac','nav.categories':'Kuat',
      'hero.badge':'Aŋoot ke wuɔt 12 ne Pan-Thudän',
      'hero.h1.line1':'Pan-Thudän',
      'hero.h1.leading':'eet','hero.h1.market':'Thuk',
      'hero.lead':'Ɣɔc ku ɣaac telefon, mobil, paan, lupɔ ku lui — ke piath, ke kɔc dɛ kek wɛɛny.',
      'hero.search':'Yök telefon, mobil, piny…','hero.btn.search':'Yök',
      'lang.picker.h':'Kuɛɛny thoŋ duɔn','lang.picker.p':'A leu wɛlke aŋuɔt ne piny.','lang.picker.skip':'Cuɔt','lang.changed':'Thoŋ aci wɛlke',
    }
  };

  function getLang(){return localStorage.getItem('nl_lang')||''}
  function setLang(code){
    localStorage.setItem('nl_lang',code);
    document.documentElement.lang=code;
    document.documentElement.dir=(LANGS[code]||{}).dir||'ltr';
    applyStrings(code);
    if(code!=='en')liveTranslateAll(code);
    if(window.NL)NL.toast((STRINGS[code]&&STRINGS[code]['lang.changed'])||'Language changed',{type:'info',duration:1500});
  }
  function get(code,key){const s=STRINGS[code]||{};return s[key]||STRINGS.en[key]||null}

  /* Apply pre-shipped strings to anything with data-i18n / data-i18n-html / data-i18n-ph */
  function applyStrings(code){
    if(!code||code==='en'){
      document.querySelectorAll('[data-i18n-orig]').forEach(el=>{el.innerHTML=el.dataset.i18nOrig;delete el.dataset.i18nOrig});
      document.querySelectorAll('[data-i18n-ph-orig]').forEach(el=>{el.placeholder=el.dataset.i18nPhOrig;delete el.dataset.i18nPhOrig});
      return;
    }
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const v=get(code,el.dataset.i18n);if(!v)return;
      if(!el.dataset.i18nOrig)el.dataset.i18nOrig=el.innerHTML;
      el.innerHTML=v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const v=get(code,el.dataset.i18nPh);if(!v)return;
      if(!el.dataset.i18nPhOrig)el.dataset.i18nPhOrig=el.placeholder||'';
      el.placeholder=v;
    });
  }

  /* Live translation via MyMemory (free, no key) for arbitrary text nodes.
     Targets nodes inside [data-i18n-live]. Caches per (text|targetLang). */
  const CACHE_KEY='nl_tcache';
  let cache={};try{cache=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch(e){}
  const targetCode={ar:'ar-SA',ja:'ar-SD',dk:'ar-SD'}; // Juba/Dinka fall back to ar-SD where API doesn't have it
  async function liveTranslate(text,toLang){
    const t=targetCode[toLang];if(!t)return text;
    const k=t+'|'+text;if(cache[k])return cache[k];
    try{
      const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=en|'+t,{cache:'force-cache'});
      const d=await r.json();const out=d&&d.responseData&&d.responseData.translatedText;
      if(out&&typeof out==='string'){cache[k]=out;try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch(e){}return out}
    }catch(e){}
    return text;
  }
  function liveTranslateAll(code){
    if(code==='en')return;
    document.querySelectorAll('[data-i18n-live]').forEach(async el=>{
      const orig=el.dataset.i18nLiveOrig||el.textContent.trim();
      if(!el.dataset.i18nLiveOrig)el.dataset.i18nLiveOrig=orig;
      const out=await liveTranslate(orig,code);el.textContent=out;
    });
  }

  /* ---------- Language picker modal ---------- */
  function pickerHTML(){
    return '<div class="lp-scrim" id="lpScrim"></div>'+
    '<div class="lp" id="lp" role="dialog" aria-labelledby="lpTitle">'+
      '<div class="lp-inner">'+
        '<div class="lp-logo"><img src="'+(window.NL&&NL.root?NL.root:'')+'assets/images/logo.png" alt=""></div>'+
        '<h2 id="lpTitle">Choose your language<br><span dir="rtl">اختر لغتك</span></h2>'+
        '<p>You can change this later from the footer.</p>'+
        '<div class="lp-grid">'+
          Object.keys(LANGS).map(k=>'<button class="lp-card" data-lp="'+k+'"><b>'+LANGS[k].native+'</b><span>'+LANGS[k].name+'</span></button>').join('')+
        '</div>'+
        '<button class="lp-skip" data-lp="en">Skip — continue in English</button>'+
      '</div>'+
    '</div>';
  }
  function openPicker(){
    if(document.getElementById('lp'))return;
    const wrap=document.createElement('div');wrap.innerHTML=pickerHTML();while(wrap.firstChild)document.body.appendChild(wrap.firstChild);
    requestAnimationFrame(()=>{document.getElementById('lp').classList.add('open');document.getElementById('lpScrim').classList.add('open')});
    document.body.style.overflow='hidden';
    document.getElementById('lp').addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(!b)return;
      setLang(b.dataset.lp);closePicker();});
  }
  function closePicker(){const lp=document.getElementById('lp');const sc=document.getElementById('lpScrim');if(lp)lp.classList.remove('open');if(sc)sc.classList.remove('open');document.body.style.overflow='';setTimeout(()=>{if(lp)lp.remove();if(sc)sc.remove();},340)}

  /* re-translate dynamic content when caller signals */
  document.addEventListener('nl:translate',()=>{const c=getLang();if(c&&c!=='en')liveTranslateAll(c)});

  /* ---------- Boot ---------- */
  window.NLi18n={setLang,getLang,openPicker,LANGS,liveTranslate,applyStrings};
  function boot(){
    const cur=getLang();
    if(cur){document.documentElement.lang=cur;document.documentElement.dir=(LANGS[cur]||{}).dir||'ltr';applyStrings(cur);if(cur!=='en')liveTranslateAll(cur)}
    else{
      // wait until preloader is gone, then show picker
      const show=()=>setTimeout(openPicker,400);
      const pl=document.getElementById('preloader');
      if(!pl)show();else{
        const obs=new MutationObserver(()=>{if(pl.classList.contains('done')||!pl.parentNode){obs.disconnect();show()}});
        obs.observe(pl,{attributes:true,attributeFilter:['class']});
        // safety: if preloader was already removed
        if(!document.body.contains(pl))show();
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
