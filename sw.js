const CACHE='nl-shell-v1';
const SHELL=['./','./index.html','./styles.css','./app.js','./logo.png','./favicon.svg','./manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // Always go to network for live FX rate
  if(url.hostname.includes('er-api.com')||url.hostname.includes('exchangerate.host'))return;
  // Stale-while-revalidate for same-origin and image CDNs
  const isSameOrigin=url.origin===self.location.origin;
  const isImageCDN=/images\.unsplash\.com|picsum\.photos/.test(url.hostname);
  if(!isSameOrigin&&!isImageCDN)return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetched=fetch(e.request).then(r=>{
        if(r&&r.status===200&&r.type!=='opaqueredirect'){
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});
        }
        return r;
      }).catch(()=>cached||caches.match('./index.html'));
      return cached||fetched;
    })
  );
});
