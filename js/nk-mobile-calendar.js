/* NKLUCILAN 2.0 — Calendário compacto: 7 colunas, data selecionada e agenda.
   Funciona em Mês, Trabalhos, Estudos e Agenda Pública sem alterar consultas ao banco. */
(() => {
  'use strict';
  const enhanced = new WeakMap();
  let updateQueued = false;

  function enhanceGrid(grid) {
    const cells = [...grid.children].filter(el => el.classList.contains('calendario-dia'));
    if (cells.length === 0) return;
    const calendar = grid.closest('.calendario-mes');
    if (!calendar) return;
    const previous = enhanced.get(grid) || {};
    const selected = cells.find(el => el.classList.contains('nk-dia-selecionado')) ||
      cells.find(el => el.classList.contains('calendario-hoje')) ||
      cells.find(el => !el.classList.contains('calendario-outro-mes')) || cells[0];
    let panel = previous.panel;
    if (!panel || !panel.isConnected) {
      panel = document.createElement('section');
      panel.className = 'nk-mobile-agenda';
      panel.setAttribute('aria-live', 'polite');
      panel.setAttribute('aria-label', 'Compromissos do dia selecionado');
      calendar.insertAdjacentElement('afterend', panel);
    }

    function select(cell) {
      for (const other of cells) {
        const yes = other === cell;
        other.classList.toggle('nk-dia-selecionado', yes);
        other.setAttribute('aria-pressed', String(yes));
      }
      const number = cell.querySelector('.calendario-numero')?.textContent?.trim() || '';
      panel.replaceChildren();
      const heading = document.createElement('div');
      heading.className = 'nk-mobile-agenda-heading';
      const headingText = document.createElement('div');
      const kicker = document.createElement('span');
      kicker.textContent = 'AGENDA DO DIA';
      const title = document.createElement('h3');
      title.textContent = `Dia ${number}`;
      headingText.append(kicker, title);
      heading.appendChild(headingText);
      const addOriginal = cell.querySelector('.calendario-adicionar');
      if (addOriginal) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'nk-mobile-add';
        add.textContent = '+ Adicionar';
        add.addEventListener('click', () => addOriginal.click());
        heading.appendChild(add);
      }
      panel.appendChild(heading);

      const items = [...cell.querySelectorAll('.calendario-itens > .calendario-item')];
      if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'nk-mobile-agenda-empty';
        empty.textContent = 'Nenhum compromisso neste dia.';
        panel.appendChild(empty);
      } else {
        const list = document.createElement('div');
        list.className = 'nk-mobile-agenda-items';
        for (const original of items) {
          const proxy = document.createElement('button');
          proxy.type = 'button';
          proxy.className = original.className.replace('nk-mobile-extra', '') + ' nk-mobile-agenda-item';
          proxy.innerHTML = original.innerHTML;

          // No Mês, o resumo do dia mostra a categoria acima do título,
          // como os cartões da Semana. Não interfere nos outros calendários.
          if (grid.id === 'calendarioGrade') {
            const categorias = [
              ['calendario-item-atividade', 'ATIVIDADE'],
              ['calendario-item-trabalho', 'TRABALHO'],
              ['calendario-item-prova', 'PROVA']
            ];
            const categoria = categorias.find(([classe]) => original.classList.contains(classe));
            if (categoria) {
              const tipo = document.createElement('span');
              tipo.className = 'nk-mobile-agenda-tipo';
              tipo.textContent = categoria[1];
              proxy.prepend(tipo);
            }
          }

          const originalStyle = original.getAttribute('style');
          if (originalStyle) proxy.setAttribute('style', originalStyle);
          if (original.hasAttribute('role') || original.onclick) {
            proxy.setAttribute('aria-label', original.getAttribute('aria-label') || `Abrir ${original.querySelector('strong')?.textContent || 'compromisso'}`);
            proxy.addEventListener('click', () => original.click());
          } else {
            proxy.disabled = true; // A agenda pública é somente leitura.
          }
          list.appendChild(proxy);
        }
        panel.appendChild(list);
      }
    }

    for (const cell of cells) {
      if (cell.dataset.nkCalendarReady) continue;
      cell.dataset.nkCalendarReady = '1';
      const count = cell.querySelectorAll('.calendario-itens > .calendario-item').length;
      if (count > 0) {
        const dot = document.createElement('span');
        dot.className = 'nk-dia-contador';
        dot.textContent = count > 9 ? '9+' : String(count);
        dot.setAttribute('aria-hidden', 'true');
        cell.querySelector('.calendario-dia-topo')?.appendChild(dot);
      }
      cell.setAttribute('role', 'button');
      cell.tabIndex = window.matchMedia('(max-width: 700px)').matches ? 0 : -1;
      const day = cell.querySelector('.calendario-numero')?.textContent?.trim() || 'dia';
      cell.setAttribute('aria-label', `Ver compromissos do dia ${day}${count ? `, ${count} item(ns)` : ''}`);
      cell.addEventListener('click', event => {
        if (!window.matchMedia('(max-width: 700px)').matches) return;
        if (event.target.closest('.calendario-item,.calendario-adicionar')) return;
        select(cell);
      });
      cell.addEventListener('keydown', event => {
        if (!window.matchMedia('(max-width: 700px)').matches) return;
        if (event.target !== cell || !['Enter',' '].includes(event.key)) return;
        event.preventDefault(); select(cell);
      });
    }
    enhanced.set(grid, {panel});
    select(selected);
  }

  function enhanceAll() {
    updateQueued = false;
    document.querySelectorAll('.calendario-grade').forEach(enhanceGrid);
  }
  function scheduleUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(enhanceAll);
  }
  const start = () => {
    scheduleUpdate();
    const observer = new MutationObserver(records => {
      if (records.some(r => r.target.classList?.contains('calendario-grade') ||
        [...r.addedNodes].some(n => n.nodeType === 1 && (n.matches?.('.calendario-grade') || n.querySelector?.('.calendario-grade'))))) {
        scheduleUpdate();
      }
    });
    observer.observe(document.body, {childList:true, subtree:true});
    window.addEventListener('resize', () => {
      const small = window.matchMedia('(max-width: 700px)').matches;
      document.querySelectorAll('.calendario-dia[data-nk-calendar-ready]')
        .forEach(cell => { cell.tabIndex = small ? 0 : -1; });
    }, {passive:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
