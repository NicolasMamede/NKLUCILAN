/* NKLUCILAN 2.0 — Navegação móvel compartilhada.
   O ouvinte em captura substitui controles diferentes das páginas antigas,
   sem alterar a navegação existente no desktop. */
(() => {
  'use strict';
  const init = () => {
    const menu = document.getElementById('menuMobile');
    const sidebar = document.getElementById('sidebar');
    if (!menu || !sidebar || sidebar.dataset.nkNavReady) return;
    sidebar.dataset.nkNavReady = '1';
    const mobile = window.matchMedia('(max-width: 900px)');
    let lastFocus = null;
    menu.setAttribute('aria-controls', 'sidebar');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu de navegação');

    const overlay = document.createElement('div');
    overlay.className = 'nk-mobile-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'nk-mobile-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Fechar menu');
    sidebar.insertBefore(close, sidebar.firstChild);

    function setOpen(open, restore = false) {
      const showing = Boolean(open && mobile.matches);
      sidebar.classList.toggle('ativo', showing);
      sidebar.classList.toggle('aberta', showing);
      sidebar.classList.remove('abrir');
      menu.setAttribute('aria-expanded', String(showing));
      menu.setAttribute('aria-label', showing ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
      overlay.classList.toggle('nk-visible', showing);
      document.body.classList.toggle('nk-menu-aberto', showing);
      if (showing) {
        lastFocus = document.activeElement;
        close.focus({preventScroll: true});
      } else if (restore && mobile.matches) {
        (lastFocus?.isConnected ? lastFocus : menu).focus({preventScroll: true});
      }
    }

    // Captura antes dos listeners antigos que alternam classes diferentes.
    document.addEventListener('click', (event) => {
      if (event.target.closest('#menuMobile')) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(menu.getAttribute('aria-expanded') !== 'true');
      } else if (event.target.closest('.nk-mobile-overlay, .nk-mobile-close')) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false, true);
      } else if (mobile.matches && sidebar.contains(event.target) && event.target.closest('a[href]')) {
        setOpen(false);
      }
    }, true);

    document.addEventListener('keydown', (event) => {
      if (menu.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); return; }
      if (event.key === 'Tab') {
        const focusable = [...sidebar.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')]
          .filter(el => el.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }, true);
    if (mobile.addEventListener) mobile.addEventListener('change', () => setOpen(false));
    else mobile.addListener(() => setOpen(false));

    // Acesso rápido com cinco destinos; o menu ☰ continua mostrando todas as páginas.
    const links = [
      ['dashboard.html', 'Início', '⌂'],
      ['semana.html', 'Semana', '▤'],
      ['mes.html', 'Mês', '▦'],
      ['atrasados.html', 'Atrasados', '◷'],
      ['perfil.html', 'Perfil', '◉']
    ];
    const current = location.pathname.split('/').pop() || 'index.html';
    const nav = document.createElement('nav');
    nav.className = 'nk-mobile-tabs';
    nav.setAttribute('aria-label', 'Navegação rápida');
    for (const [href, label, symbol] of links) {
      const a = document.createElement('a');
      a.href = href;
      a.className = 'nk-mobile-tab';
      if (current === href) { a.classList.add('nk-current'); a.setAttribute('aria-current', 'page'); }
      const icon = document.createElement('span');
      icon.className = 'nk-mobile-tab-icon';
      icon.textContent = symbol;
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.textContent = label;
      a.append(icon, text);
      nav.appendChild(a);
    }
    document.body.appendChild(nav);

    // Botão de notificações antes sem ação nas páginas Início e Agenda Pública.
    document.getElementById('notificacoes')?.addEventListener('click', () => {
      const panel = document.getElementById('nexo-push-painel');
      if (panel) {
        panel.classList.remove('nk-push-minimized');
        panel.querySelector('.nk-push-toggle')?.setAttribute('aria-expanded', 'true');
        panel.querySelector('#nk-botao-ativar-push, .nk-push-toggle')?.focus();
      } else {
        window.location.href = 'central.html#novidades';
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
