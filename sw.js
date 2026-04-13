const CACHE_NAME = 'orbita-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/core.js',
  './js/services.js',
  './js/pwa.js',
  './js/data.js',
  './js/game.js',
  './js/render.js',
  './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // Navegação: tenta rede e cai para cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Assets do próprio app: cache-first com refresh em background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req)
          .then(resp => {
            if (resp && resp.status === 200) {
              const copy = resp.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
            }
            return resp;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
  }
});
