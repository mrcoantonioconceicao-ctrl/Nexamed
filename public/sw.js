// Service Worker para Cache Local de Prontuários, Medicamentos (MAR) e Alertas Críticos - NexaMed
const STATIC_CACHE = 'nexamed-shell-v2';
const DATA_CACHE = 'nexamed-clinical-data-v2';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/favicon.ico'
];

// Instalação do Service Worker & Pre-cache do App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      const cachePromises = APP_SHELL_ASSETS.map((url) => {
        return cache.add(url).catch((err) => {
          console.warn('Cache add failed for ' + url, err);
        });
      });
      return Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégias de interceptação de rede (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Interceptar requisições da rota virtual de dados clínicos offline
  if (url.pathname === '/api/offline/clinical-data') {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match('/api/offline/clinical-data');
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response(JSON.stringify({ 
          residents: [], 
          evolutions: [], 
          medications: [], 
          lastSyncedAt: new Date().toISOString(),
          status: 'empty_cache' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Não interceptar chamadas externas de telemetria / firestore diretas do SDK se não for GET
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Estratégia Stale-While-Revalidate / Network-First para navegação e assets da aplicação
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html') || await caches.match('/');
          return fallback || new Response('Offline - NexaMed', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 4. Recursos estáticos (JS, CSS, Imagens, Fontes): Cache-First com atualização em background
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.includes('/assets/'))
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const resClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, resClone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }
});

// Listener para sincronização de dados clínicos e notificações
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  // Sincronização do cache de prontuários e medicações
  if (event.data.type === 'CACHE_CLINICAL_DATA') {
    const payload = event.data.payload || {};
    try {
      const dataCache = await caches.open(DATA_CACHE);
      const jsonResponse = new Response(JSON.stringify({
        residents: payload.residents || [],
        evolutions: payload.evolutions || [],
        medications: payload.medications || [],
        lastSyncedAt: payload.lastSyncedAt || new Date().toISOString(),
        version: 'v2'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'X-NexaMed-Offline-Cache': 'true'
        }
      });

      await dataCache.put('/api/offline/clinical-data', jsonResponse);

      // Notifica todos os clientes que o cache foi atualizado com sucesso
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({
          type: 'CLINICAL_DATA_CACHED_CONFIRM',
          lastSyncedAt: payload.lastSyncedAt || new Date().toISOString(),
          counts: {
            residents: (payload.residents || []).length,
            evolutions: (payload.evolutions || []).length,
            medications: (payload.medications || []).length
          }
        });
      });
    } catch (err) {
      console.error('[SW] Erro ao salvar dados clínicos no cache:', err);
    }
  }

  // Consulta de dados clínicos em cache quando offline
  if (event.data.type === 'GET_CACHED_CLINICAL_DATA') {
    try {
      const dataCache = await caches.open(DATA_CACHE);
      const response = await dataCache.match('/api/offline/clinical-data');
      if (response) {
        const data = await response.json();
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true, data });
        }
      } else {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: false, reason: 'not_found' });
        }
      }
    } catch (err) {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: false, error: String(err) });
      }
    }
  }

  // Notificações de Alertas Críticos de Enfermagem
  if (event.data.type === 'SHOW_CRITICAL_ALERT') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/assets/icon.png',
      badge: '/assets/icon.png',
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
      tag: options?.tag || 'critical-resident-alert',
      renotify: true,
      data: options?.data || {}
    });
  }
});

// Listener para clique na notificação: foca na janela da aplicação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TO_RESIDENT',
            residentId: event.notification.data?.residentId
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
