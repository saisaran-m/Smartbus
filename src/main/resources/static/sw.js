// SmartBus 2.0 Elite — Enhanced Service Worker
// Caches app shell, tickets, and schedule data for offline access
const CACHE_NAME = 'smartbus-v10';
const ASSETS = [
  '/dashboard',
  '/css/style.css',
  '/js/app.js',
  '/js/map.js',
  '/js/tracking.js',
  '/js/guardian.js',
  '/js/voice.js',
  '/js/feedback.js',
  '/js/ticket.js',
  '/js/driver.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Dynamic caches for API responses
const API_CACHE = 'smartbus-api-v7';
const TICKET_CACHE = 'smartbus-tickets-v7';

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
        keys.filter(key => ![CACHE_NAME, API_CACHE, TICKET_CACHE].includes(key))
            .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache ticket data for offline boarding pass
  if (url.pathname.startsWith('/api/tickets/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(TICKET_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache bus/route data for offline schedule viewing
  if (url.pathname.startsWith('/api/buses/') || url.pathname.startsWith('/api/routes/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets (CSS, JS, images, icons, fonts) - Cache First for instant opening
  if (ASSETS.includes(url.pathname) || url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/') || url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          // Fetch updated version in background (stale-while-revalidate)
          fetch(event.request).then(res => {
            if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res));
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Dashboard / HTML Pages: Try Cache first so the app opens in 0.1 seconds without waiting for Render spin-up
  if (url.pathname === '/' || url.pathname === '/dashboard') {
    event.respondWith(
      caches.match('/dashboard').then(cached => {
        const networkFetch = fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put('/dashboard', clone));
          return res;
        }).catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // Fallback for general requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listen for messages to cache specific ticket data
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_TICKET') {
    const ticketData = event.data.ticket;
    caches.open(TICKET_CACHE).then(cache => {
      const response = new Response(JSON.stringify(ticketData), {
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put(`/offline-ticket/${ticketData.pnrNumber}`, response);
    });
  }
});
