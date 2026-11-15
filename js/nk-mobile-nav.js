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

    // Cinco destinos essenciais e um menu completo; visual limpo estilo agenda.
    const icons = {
      home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/>',
      week: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M14 14h3"/>',
      month: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
      late: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
      task: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
      exam: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
      work: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>'
    };
    const svg = key => `<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${icons[key]}</svg>`;
    const links = [
      ['dashboard.html', 'Início', 'home'],
      ['semana.html', 'Semana', 'week'],
      ['mes.html', 'Mês', 'month'],
      ['atrasados.html', 'Atrasados', 'late'],
      [null, 'Mais', 'menu']
    ];
    const current = location.pathname.split('/').pop() || 'index.html';
    const nav = document.createElement('nav');
    nav.className = 'nk-mobile-tabs';
    nav.setAttribute('aria-label', 'Navegação rápida');
    for (const [href, label, symbol] of links) {
      const control = document.createElement(href ? 'a' : 'button');
      if (href) control.href = href;
      else {
        control.type = 'button';
        control.setAttribute('aria-label', 'Abrir todas as páginas');
        control.addEventListener('click', () => menu.click());
      }
      control.className = 'nk-mobile-tab';
      if (current === href) { control.classList.add('nk-current'); control.setAttribute('aria-current', 'page'); }
      const icon = document.createElement('span');
      icon.className = 'nk-mobile-tab-icon';
      icon.innerHTML = svg(symbol); // SVG fixo local, nenhuma entrada do usuário
      icon.setAttribute('aria-hidden', 'true');
      const title = document.createElement('span');
      title.textContent = label;
      control.append(icon, title);
      nav.appendChild(control);
    }
    document.body.appendChild(nav);

    // Adicionar rapidamente, sem navegar por vários painéis.
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'nk-mobile-fab';
    fab.textContent = '+';
    fab.setAttribute('aria-label', 'Criar atividade, prova ou trabalho');
    fab.setAttribute('aria-controls', 'nkMobileQuickCreate');
    fab.setAttribute('aria-expanded', 'false');
    const shade = document.createElement('div');
    shade.className = 'nk-mobile-sheet-shade';
    const sheet = document.createElement('section');
    sheet.id = 'nkMobileQuickCreate';
    sheet.className = 'nk-mobile-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Criar compromisso');
    sheet.innerHTML = `
      <div class="nk-mobile-sheet-heading"><strong>Adicionar novo</strong><button type="button" class="nk-mobile-sheet-close" aria-label="Fechar">×</button></div>
      <a href="atividades.html?criar=1">${svg('task')} Nova atividade <span>Tarefa</span></a>
      <a href="provas.html?criar=1">${svg('exam')} Nova prova <span>Avaliação</span></a>
      <a href="trabalhos.html?criar=1">${svg('work')} Novo trabalho <span>Entrega</span></a>`;
    document.body.append(fab, shade, sheet);
    function setSheet(open, restore = false) {
      const show = Boolean(open && mobile.matches);
      shade.classList.toggle('nk-visible', show);
      sheet.classList.toggle('nk-visible', show);
      fab.setAttribute('aria-expanded', String(show));
      sheet.setAttribute('aria-hidden', String(!show));
      document.body.classList.toggle('nk-sheet-aberto', show);
      if (show) sheet.querySelector('.nk-mobile-sheet-close').focus({preventScroll:true});
      else if (restore) fab.focus({preventScroll:true});
    }
    fab.addEventListener('click', () => setSheet(fab.getAttribute('aria-expanded') !== 'true'));
    shade.addEventListener('click', () => setSheet(false, true));
    sheet.querySelector('.nk-mobile-sheet-close').addEventListener('click', () => setSheet(false, true));
    document.addEventListener('keydown', event => {
      if (!sheet.classList.contains('nk-visible')) return;
      if (event.key === 'Escape') {event.preventDefault();setSheet(false,true);}
      if (event.key === 'Tab') {
        const controls = [...sheet.querySelectorAll('button,a[href]')];
        if (event.shiftKey && document.activeElement === controls[0]) {event.preventDefault();controls[controls.length-1].focus();}
        else if (!event.shiftKey && document.activeElement === controls[controls.length-1]) {event.preventDefault();controls[0].focus();}
      }
    });
    if (mobile.addEventListener) mobile.addEventListener('change', () => setSheet(false));

    // Atalho: a opção do menu abre o formulário real da página de destino.
    if (new URLSearchParams(location.search).get('criar') === '1') {
      const buttonId = {'atividades.html':'novaAtividade','provas.html':'novaProva','trabalhos.html':'novaTrabalho'}[current];
      if (buttonId) {
        window.setTimeout(() => {
          const button = document.getElementById(buttonId);
          if (!button) return;
          history.replaceState(history.state, '', location.pathname + location.hash);
          button.click();
        }, 250);
      }
    }

    // Botão de notificações antes sem ação nas páginas Início e Agenda Pública.
    document.getElementById('notificacoes')?.addEventListener('click', () => {
      const panel = document.getElementById('nexo-push-painel');
      if (panel) {
        panel.classList.remove('nk-push-minimized');
        panel.classList.add('nk-push-open');
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
