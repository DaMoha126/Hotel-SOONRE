const CACHE = 'hotel-soonre-v4';
const APP_SHELL = [
  './manifest.webmanifest',
  './icon.svg'
];

function cleanFooter(html) {
  return html
    .replace(/<div[^>]*>\s*v2\.0\.0\s+—\s*TDR édition\s*<\/div>/gi, '')
    .replace(/<div[^>]*>\s*©\s*2026\s+Hadotech\s*<\/div>/gi, '');
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const acceptsHtml = event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html');

  if (!acceptsHtml) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    return;
  }

  event.respondWith(
    fetch(event.request).then(async response => {
      if (!response || response.status !== 200) return response;
      const html = await response.text();
      const cleaned = cleanFooter(html);
      const transformed = new Response(cleaned, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      const copy = transformed.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return transformed;
    }).catch(() => caches.match(event.request))
  );
});
