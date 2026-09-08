// SmartBus Service Worker for PWA
const CACHE_NAME = 'smartbus-v1';
const ASSETS = [
  '/dashboard',
  '/css/style.css',
  '/js/app.js',
  '/js/map.js',
  '/js/tracking.js',
  '/js/guardian.js',
  '/js/voice.js',
  '/js/feedback.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => console.log('PWA cache error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
