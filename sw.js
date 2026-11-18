/* NKLUCILAN APP — Instalação e suporte à navegação.
   Só salvamos arquivos estáticos do mesmo domínio. Respostas de login,
   chamadas Supabase e informações privadas NÃO são armazenadas neste cache.
   O comportamento de notificações push preexistente é preservado abaixo. */
const NK_CACHE = 'nklucilan-app-v9-focus36';
const NK_OFFLINE_URL = new URL('./offline.html', self.registration.scope).href;
const NK_SHELL = [
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(NK_CACHE);
    await cache.addAll(NK_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('nklucilan-app-') && key !== NK_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, CDN e APIs: rede normal

  if (req.mode === 'navigate') {
    // Nunca cachear páginas que podem levar a estados de sessão desatualizados.
    event.respondWith(fetch(req, { cache: 'no-cache' }).catch(async () =>
      (await caches.match(NK_OFFLINE_URL)) || Response.error()
    ));
    return;
  }

  // Somente recursos públicos e estáticos, nunca resultados de API.
  if (!/\.(?:css|js|png|jpg|jpeg|webp|svg|ico|webmanifest)$/i.test(url.pathname)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(req, { cache: 'no-cache' });
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(NK_CACHE);
        await cache.put(req, response.clone());
      }
      return response;
    } catch (err) {
      return (await caches.match(req)) || Response.error();
    }
  })());
});


self.addEventListener("push", (event) => {
  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {
      title: "NK Lucilan",
      body: event.data?.text() || "Você tem uma nova notificação."
    };
  }

  const titulo = dados.title || "NK Lucilan";

  const opcoes = {
    body: dados.body || "Você tem uma nova notificação.",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: dados.tag || "nk-lucilan-notificacao",
    data: {
      url: dados.url || "./dashboard.html"
    }
  };

  event.waitUntil(
    self.registration.showNotification(titulo, opcoes)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destino = new URL(
    event.notification.data?.url || "./dashboard.html",
    self.registration.scope
  );

  if (destino.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    (async () => {
      const janelas = await clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      for (const janela of janelas) {
        if (janela.url === destino.href) {
          await janela.focus();
          return;
        }
      }

      await clients.openWindow(destino.href);
    })()
  );
});
