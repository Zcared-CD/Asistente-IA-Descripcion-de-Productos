
const CACHE_NAME = 'carlsoft-v5';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo1.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('Service Worker: instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('Service Worker: activado');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) =>
            name.startsWith('carlsoft-') && name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Gestión de solicitudes
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No interceptar otros dominios ni las solicitudes API
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navegación: intentar Internet, usar caché si falla
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, copy)
            )
          );
        }
        return response;
      }).catch(async () => {
        return (await caches.match(request)) ||
               (await caches.match('/')) ||
               Response.error();
      })
    );
    return;
  }

  // Archivos estáticos: caché primero
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;

      const response = await fetch(request);

      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(request, copy)
          )
        );
      }

      return response;
    })
  );
});
