/* Offline cache for the static city guides. All URLs are scope-relative so the
   app works both at a custom domain and at /europe-trip/ on GitHub Pages. */
const CACHE_NAME = 'europe-trip-2026-v4';
const ROOT = self.registration.scope;
const ASSETS = [
  '', 'index.html', 'search.html', 'css/style.css', 'js/main.js', 'manifest.json',
  'images/icon-192.png', 'images/icon-512.png',
  'paris/index.html', 'paris/navigo.html', 'paris/metro.html', 'paris/metro-etiquette.html',
  'paris/seine-cruise.html', 'paris/dior.html', 'paris/eiffel.html', 'paris/arc.html',
  'paris/notre-dame.html', 'paris/louvre.html', 'paris/montmartre.html',
  'amsterdam/index.html', 'amsterdam/transport.html', 'amsterdam/anne-frank.html',
  'amsterdam/dam-square.html', 'amsterdam/canals.html', 'amsterdam/jordaan.html',
  'amsterdam/rijksmuseum.html', 'amsterdam/sightseeing.html',
  'berlin/index.html', 'berlin/transport.html', 'berlin/brandenburg-gate.html',
  'berlin/reichstag.html', 'berlin/jewish-memorial.html', 'berlin/museum-island.html',
  'berlin/east-side-gallery.html', 'berlin/wall-memorial.html', 'berlin/checkpoint-charlie.html',
  'berlin/sightseeing.html',
  'prague/index.html', 'prague/airport.html', 'prague/transport.html', 'prague/old-town.html',
  'prague/charles-bridge.html', 'prague/castle.html', 'prague/clock.html',
  'prague/jewish-quarter.html', 'prague/sightseeing.html',
  'bookings/index.html',
  'money/index.html', 'money/halifax.html', 'money/cash.html', 'money/atms.html',
  'money/dcc.html', 'money/currencies.html',
  'safety/index.html', 'safety/pickpockets.html', 'safety/transport.html',
  'safety/scams.html', 'safety/emergency-contacts.html', 'safety/medical.html',
  'emergency/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ASSETS.map(path => cache.add(new URL(path, ROOT)).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(new URL('index.html', ROOT))))
  );
});
