const CACHE_NAME = 'portal-artes-webapk-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // O Chrome exige um tratador de fetch para habilitar o botão "Instalar" em vez de "Adicionar à tela inicial"
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
