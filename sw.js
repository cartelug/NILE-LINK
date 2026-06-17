/* Nile Link service worker — v3
   Network-first for code/HTML (so deploys reach users instantly),
   cache-first for images/icons (offline-friendly).
   Cache key bumped to force purge of v1/v2. */
const CACHE='nl-shell-v3';
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.json','./favicon.svg','./favicon-32.png','./favicon-48.png','./logo.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

/* Network-first for HTML/CSS/JS/JSON, cache fallback only when offline */
function networkFirst(req){
  return fetch(req,{cache:'no-cache'}).then(r=>{
    if(r&&r.status===200){const clone=r.clone();caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{})}
    return r;
  }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html')));
}
/* Cache-first (stale-while-revalidate) for images & fonts */
function staleWhileRevalidate(req){
  return caches.match(req).then(cached=>{
    const fetched=fetch(req).then(r=>{
      if(r&&r.status===200){const clone=r.clone();caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{})}
      return r;
    }).catch(()=>cached);
    return cached||fetched;
  });
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  /* always live: FX rate APIs */
  if(url.hostname.includes('er-api.com')||url.hostname.includes('exchangerate.host'))return;
  const isSameOrigin=url.origin===self.location.origin;
  const isImageCDN=/images\.unsplash\.com|picsum\.photos|images\.pexels\.com/.test(url.hostname);
  const isFont=/fonts\.gstatic\.com|fonts\.googleapis\.com/.test(url.hostname);
  if(!isSameOrigin&&!isImageCDN&&!isFont)return;
  /* code files: network-first */
  const path=url.pathname.toLowerCase();
  const isCode=isSameOrigin&&(path.endsWith('/')||path.endsWith('.html')||path.endsWith('.css')||path.endsWith('.js')||path.endsWith('.json'));
  if(isCode){e.respondWith(networkFirst(e.request));return}
  /* everything else: stale-while-revalidate */
  e.respondWith(staleWhileRevalidate(e.request));
});

/* Allow page to ask SW to skip waiting (for instant updates) */
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
