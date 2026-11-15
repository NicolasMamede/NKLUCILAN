/* NKLUCILAN APP — registro PWA e opção de instalação.
   Não solicita permissão para notificações: o sistema já tem um fluxo próprio. */
(() => {
  'use strict';
  if (!window.isSecureContext || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Instalação PWA indisponível:', error);
    });
  });

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;

  let installEvent = null;
  let button = null;

  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function dismiss() {
    button?.remove();
    button = null;
    try { sessionStorage.setItem('nk-app-install-dismissed', '1'); } catch (_) {}
  }

  function iosInstructions() {
    // Safari iOS não oferece o evento beforeinstallprompt.
    const box = document.createElement('div');
    box.className = 'nk-app-ios-instructions';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Como instalar NKLUCILAN');
    const title = document.createElement('strong');
    title.textContent = 'Instalar NKLUCILAN no iPhone';
    const paragraph = document.createElement('p');
    paragraph.textContent = 'No navegador, toque em Compartilhar e depois em “Adicionar à Tela de Início”.';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Entendi';
    close.addEventListener('click', () => { box.remove(); dismiss(); });
    box.append(title, paragraph, close);
    document.body.appendChild(box);
    close.focus();
  }

  function showButton() {
    if (button || isStandalone()) return;
    try { if (sessionStorage.getItem('nk-app-install-dismissed') === '1') return; } catch (_) {}
    if (!installEvent && !isIOS()) return;
    button = document.createElement('div');
    button.className = 'nk-app-install';
    const install = document.createElement('button');
    install.type = 'button';
    install.className = 'nk-app-install-action';
    install.textContent = 'Instalar aplicativo';
    install.setAttribute('aria-label','Instalar aplicativo NKLUCILAN');
    install.addEventListener('click', async () => {
      if (installEvent) {
        const event = installEvent;
        installEvent = null;
        try {
          await event.prompt();
          await event.userChoice;
        } catch (error) {
          console.warn('Instalação cancelada ou indisponível:', error);
        }
        dismiss();
      } else if (isIOS()) {
        iosInstructions();
      }
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'nk-app-install-close';
    close.textContent = '×';
    close.setAttribute('aria-label','Fechar sugestão de instalação');
    close.addEventListener('click', dismiss);
    button.append(install, close);
    document.body.appendChild(button);
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showButton, {once:true});
    } else showButton();
  });
  window.addEventListener('appinstalled', dismiss);
  if (isIOS()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showButton, {once:true});
    } else showButton();
  }
})();
