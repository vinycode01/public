// --- SELF DESTRUCT ---
// Se o navegador tentar carregar este arquivo (por cache antigo),
// ele força a desinstalação imediata.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => {
        // Avisa as abas abertas para recarregarem se necessário
        client.postMessage({ type: 'SW_UNREGISTERED' });
      });
    });
});