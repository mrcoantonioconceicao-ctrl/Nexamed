// Service Worker para Alertas Críticos da Equipe de Enfermagem - Nexa Saúde
const CACHE_NAME = 'nexa-critical-alerts-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener para disparar notificações em background enviadas pelo app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_CRITICAL_ALERT') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/assets/icon.png',
      badge: '/assets/icon.png',
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true, // Mantém a notificação até o enfermeiro interagir
      tag: options?.tag || 'critical-resident-alert',
      renotify: true,
      data: options?.data || {},
      ...options
    });
  }
});

// Listener para clique na notificação: foca na janela da aplicação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se a aba já estiver aberta, dá foco nela
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TO_RESIDENT',
            residentId: event.notification.data?.residentId
          });
          return client.focus();
        }
      }
      // Se não houver aba aberta, abre uma nova
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
