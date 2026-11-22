const CACHE='hotel-soonre-staff-v24';
const ASSETS=['./index.html','./hotelsoonre.html','./app.js','./account-security.js?v=24','./messagerie.js?v=24','./messagerie.css?v=24','./staff-alerts.js?v=24','./analyses.js?v=21','./analyses.css?v=21','./theme.css?v=22','./theme.js','./workspace.js?v=20','./experience.js?v=22','./assets/workspace-lobby.jpg','./reliability.js','./setup-accounts.js','./housekeeping.js','./stay-billing.js','./manifest.webmanifest','./icon.svg','./vendor/purify.min.js','./vendor/supabase.js','./vendor/chart.umd.min.js'];
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

self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{const own=windows.find(c=>c.url.startsWith(self.registration.scope));if(own){await own.focus();own.postMessage({type:'soonre-open-chat'});}else await clients.openWindow(new URL('./?page=messagerie',self.registration.scope).href);}));});
