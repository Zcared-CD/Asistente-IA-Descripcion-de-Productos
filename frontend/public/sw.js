const CACHE_NAME = 'carlsoft-v4';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo1.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/index-DJGwNHvG.js',
  '/assets/index-DOCZymNA.css'
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('Service Worker: instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('Service Worker: activado');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

// Gestión de solicitudes
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo solicitudes GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // No almacenar la API de Django
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Solo recursos del mismo dominio
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();

        // Esperar a que el recurso se guarde correctamente
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.put(request, responseToCache);
          })
        );

        return networkResponse;
      });
    })
  );
});