
self.addEventListener("push", (event) => {
  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {
      title: "Nexo",
      body: event.data?.text() || "Você tem uma nova notificação."
    };
  }

  const titulo = dados.title || "Nexo";

  const opcoes = {
    body: dados.body || "Você tem uma nova notificação.",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: dados.tag || "nexo-notificacao",
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
