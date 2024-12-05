const CACHE_NAME = 'crud-pwa-cache-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Registro de OneSignal en el Service Worker para recibir notificaciones push
self.addEventListener('push', (event) => {
  const title = event.data ? event.data.text() : 'Notificación Push';
  const options = {
    body: 'Tienes una nueva notificación',
    icon: '/icon.png', // Cambia esto por el icono que deseas mostrar
    badge: '/badge.png', // Cambia esto por el icono de la insignia
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Sincronización en segundo plano (si la necesitas)
self.addEventListener('sync', (event) => {
  if (event.tag === 'mySyncTag') {
    event.waitUntil(
      // Realiza la tarea que quieras hacer aquí, como sincronizar datos
      fetch('/sync-endpoint').then((response) => response.json())
    );
  }
});
