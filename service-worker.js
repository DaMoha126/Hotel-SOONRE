const CACHE='hotel-soonre-security-v11';
const ASSETS=['./index.html','./hotelsoonre.html','./app.js','./manifest.webmanifest','./icon.svg','./vendor/purify.min.js','./vendor/supabase.js','./vendor/chart.umd.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('hotel-soonre-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 const pathname=url.pathname===scope.pathname?new URL('./index.html',scope).pathname:url.pathname;
 const asset=ASSETS.find(asset=>new URL(asset,scope).pathname===pathname);
 if(!asset)return;
 const cacheKey=new URL(asset,scope).href;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(cacheKey,copy)));}
  return response;
 }).catch(async()=>{const cached=await caches.match(cacheKey);return cached||new Response('Ressource hors ligne indisponible',{status:503});}));
});
