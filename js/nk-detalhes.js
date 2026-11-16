/* NKLUCILAN Focus 3.4 — visualização dos detalhes de compromissos.
   Independente do Supabase e reutilizável na Semana, no Mês e no Início. */
(() => {
  'use strict';
  const ROTULOS = Object.freeze({atividade:'Atividade', prova:'Prova', trabalho:'Trabalho'});

  function formatarData(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return '';
    const [ano,mes,dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function abrir({ item, materia, personalizarCor } = {}) {
    if (!item) return;
    document.querySelector('.nk-detalhes-overlay')?.remove();
    const anterior = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'nk-detalhes-overlay';
    const dialogo = document.createElement('section');
    dialogo.className = 'nk-detalhes-dialogo';
    dialogo.setAttribute('role', 'dialog');
    dialogo.setAttribute('aria-modal', 'true');
    dialogo.setAttribute('aria-labelledby', 'nk-detalhes-titulo');

    const topo = document.createElement('header');
    topo.className = 'nk-detalhes-topo';
    const identificacao = document.createElement('div');
    identificacao.className = 'nk-detalhes-identificacao';
    const tipo = document.createElement('span');
    tipo.className = 'nk-detalhes-tipo';
    tipo.textContent = ROTULOS[item.tipo] || 'Compromisso';
    const titulo = document.createElement('h2');
    titulo.id = 'nk-detalhes-titulo';
    titulo.textContent = item.titulo || item.nome || 'Sem título';
    identificacao.append(tipo,titulo);
    const fecharBtn = document.createElement('button');
    fecharBtn.type = 'button';
    fecharBtn.className = 'nk-detalhes-fechar';
    fecharBtn.setAttribute('aria-label', 'Fechar detalhes');
    fecharBtn.textContent = '×';
    topo.append(identificacao,fecharBtn);
    dialogo.appendChild(topo);

    const meta = document.createElement('div');
    meta.className = 'nk-detalhes-meta';
    if (materia && materia !== 'Sem matéria') {
      const m = document.createElement('span');
      m.textContent = `📚 ${materia}`;
      meta.appendChild(m);
    }
    const data = formatarData(item.data);
    if (data) {
      const d = document.createElement('span');
      d.textContent = `📅 ${data}`;
      meta.appendChild(d);
    }
    if (item.horario) {
      const h = document.createElement('span');
      h.textContent = `🕒 ${String(item.horario).slice(0,5)}`;
      meta.appendChild(h);
    }
    if (meta.childElementCount) dialogo.appendChild(meta);

    const bloco = document.createElement('section');
    bloco.className = 'nk-detalhes-descricao';
    const subtitulo = document.createElement('h3');
    subtitulo.textContent = item.tipo === 'prova' ? 'Conteúdo da prova' : 'Descrição';
    const texto = document.createElement('p');
    texto.textContent = String(item.tipo === 'prova' ? (item.conteudo || item.descricao || '') : (item.descricao || '')).trim() || 'Nenhuma descrição cadastrada.';
    if (texto.textContent === 'Nenhuma descrição cadastrada.') texto.classList.add('nk-detalhes-sem-descricao');
    bloco.append(subtitulo,texto);
    dialogo.appendChild(bloco);

    if (typeof personalizarCor === 'function') {
      const rodape = document.createElement('footer');
      rodape.className = 'nk-detalhes-rodape';
      const personalizar = document.createElement('button');
      personalizar.type = 'button';
      personalizar.className = 'nk-detalhes-cor';
      personalizar.textContent = '🎨 Personalizar cor';
      rodape.appendChild(personalizar);
      dialogo.appendChild(rodape);
      personalizar.addEventListener('click', () => {
        fechar(false);
        personalizarCor();
      });
    }
    overlay.appendChild(dialogo);
    document.body.appendChild(overlay);
    document.body.classList.add('nk-detalhes-abertos');
    function fechar(restaurarFoco = true) {
      document.removeEventListener('keydown', teclado, true);
      overlay.remove();
      document.body.classList.remove('nk-detalhes-abertos');
      if (restaurarFoco && anterior instanceof HTMLElement && anterior.isConnected) anterior.focus({preventScroll:true});
    }
    function teclado(event) {
      if (event.key === 'Escape') {
        event.preventDefault();event.stopImmediatePropagation();fechar();
      } else if (event.key === 'Tab') {
        const botoes = Array.from(dialogo.querySelectorAll('button:not([disabled])'));
        if (!botoes.length) return;
        const primeiro = botoes[0], ultimo = botoes[botoes.length - 1];
        if (event.shiftKey && document.activeElement === primeiro) {
          event.preventDefault();ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault();primeiro.focus();
        }
      }
    }
    fecharBtn.addEventListener('click', () => fechar());
    overlay.addEventListener('mousedown', event => {if (event.target === overlay) fechar();});
    document.addEventListener('keydown', teclado, true);
    fecharBtn.focus({preventScroll:true});
  }
  window.NKDetalhes = Object.freeze({abrir});
})();
