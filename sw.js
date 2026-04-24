const CACHE_NAME = 'orbita-pwa-v31';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './js/core.js',
  './js/services.js',
  './js/pwa.js',
  './js/data.js',
  './js/game.js',
  './js/render.js',
  './js/debug_tools.js',
  './js/settings_account_ui.js',
  './js/meta_progress_ui.js',
  './js/competitive_ranking_ui.js',
  './js/menu_shell_ui.js',
  './js/gameplay_ui.js',
  './js/tutorial_hybrid_assist_patch.js',
  './js/ranking_hardening_phase2.js',
  './js/analytics_actionable_patch.js',
  './js/fairness_rng_patch.js',
  './js/run_variety_patch.js',
  './js/career_meta_patch.js',
  './js/ux_secondary_polish_patch.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
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

  const isAppAsset =
    url.origin === self.location.origin &&
    (
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.webmanifest') ||
      url.pathname === '/' ||
      url.pathname.endsWith('index.html')
    );

  if (isAppAsset || req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(resp => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

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
