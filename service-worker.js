const CACHE='hotel-soonre-security-v7';
const ASSETS=['./index.html','./hotelsoonre.html','./app.js','./manifest.webmanifest','./icon.svg','./vendor/purify.min.js','./vendor/supabase.js','./vendor/chart.umd.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('hotel-soonre-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!ASSETS.some(asset=>new URL(asset,self.registration.scope).pathname===url.pathname))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;}).catch(async()=>{const cached=await caches.match(event.request);return cached||new Response('Ressource hors ligne indisponible',{status:503});}));
});
