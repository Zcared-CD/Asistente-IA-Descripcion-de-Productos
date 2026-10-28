
const CACHE_NAME = 'carlsoft-v7';

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

self.addEventListener('push', (event) => {
  console.log('Carlsoft: notificación PUSH recibida');

  let data = {
    title: 'Carlsoft Product IA',
    body: '¡Tienes una nueva notificación!',
    url: '/'
  };

  if (event.data) {
    try {
      const receivedData = event.data.json();

      data = {
        ...data,
        ...receivedData
      };

    } catch (error) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `carlsoft-${Date.now()}`,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );
});



/* ==========================================
   AL HACER CLIC EN LA NOTIFICACIÓN
========================================== */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const requestedUrl = event.notification.data?.url || '/';

  const targetUrl = new URL(
    requestedUrl,
    self.location.origin
  );

  // Seguridad: impedir URLs de otros dominios.
  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Buscar una pestaña abierta de Carlsoft.
    for (const ventana of ventanas) {
      const urlVentana = new URL(ventana.url);

      if (urlVentana.origin === self.location.origin) {

        // NO utilizar navigate(), porque recarga React.
        await ventana.focus();

        // Informar a React del clic.
        ventana.postMessage({
          type: 'CARLSOFT_NOTIFICACION_CLICK',
          url: targetUrl.pathname + targetUrl.search
        });

        return;
      }
    }

    // Si Carlsoft está cerrado, abrir una nueva ventana.
    await self.clients.openWindow(targetUrl.href);
  })());
});

