// tarot/sw.js

const CACHE_NAME = 'tarot-cache-v1';

const CORE_FILES = [
  './',
  './index.html',
  './styles/main.css',
  './js/main.js',
  './js/starfield.js',
  './js/state.js',
  './js/storage.js',
  './js/tarot.js',
  './js/tarotDeck.js',
  './js/ui.js'
];

// Install: cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
  );
});

// Fetch: cache-first strategy + image caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache images as they are fetched
        if (event.request.destination === 'image') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
