/* NK Lucilan — cores personalizadas: por matéria e por compromisso. */
(() => {
  'use strict';
  const PADRAO = Object.freeze({ atividade: '#3b82f6', prova: '#fb923c', trabalho: '#14b8a6' });
  const AMOSTRAS = ['#3b82f6', '#38bdf8', '#14b8a6', '#22c55e', '#84cc16', '#facc15', '#fb923c', '#ef4444', '#f472b6', '#c084fc', '#94a3b8', '#ffffff'];
  const TABELAS = Object.freeze({ atividade: 'atividades', prova: 'provas', trabalho: 'trabalhos' });

  function normalizar(cor) {
    if (typeof cor !== 'string') return null;
    const hex = cor.trim().toLowerCase();
    return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
  }

  function corAutomatica(item, materias) {
    const materia = (materias || []).find(m => String(m.id) === String(item.materiaId || ''));
    return normalizar(materia?.cor) || PADRAO[item.tipo] || PADRAO.atividade;
  }

  function corEfetiva(item, materias) {
    return normalizar(item.corPersonalizada) || corAutomatica(item, materias);
  }

  function rgba(hex, alpha) {
    const c = normalizar(hex) || PADRAO.atividade;
    const rgb = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  function aplicar(elemento, item, materias) {
    const cor = corEfetiva(item, materias);
    elemento.classList.add('nk-evento-colorido');
    elemento.style.setProperty('--nk-evento-cor', cor);
    elemento.style.setProperty('--nk-evento-fundo', rgba(cor, .14));
    elemento.style.setProperty('--nk-evento-borda', rgba(cor, .43));
    elemento.setAttribute('title', `Clique para personalizar a cor de ${item.titulo || 'este compromisso'}`);
  }

  function amostras(container, selecionar) {
    AMOSTRAS.forEach(cor => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nk-paleta-amostra';
      btn.style.backgroundColor = cor;
      btn.setAttribute('aria-label', `Selecionar cor ${cor}`);
      btn.setAttribute('title', cor);
      btn.addEventListener('click', () => selecionar(cor));
      container.appendChild(btn);
    });
  }

  function abrir({ titulo, atual, automatica, salvar }) {
    document.querySelector('.nk-paleta-sobreposicao')?.remove();
    const anterior = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'nk-paleta-sobreposicao';
    overlay.innerHTML = `
      <div class="nk-paleta-dialogo" role="dialog" aria-modal="true" aria-labelledby="nk-paleta-titulo">
        <div class="nk-paleta-topo"><div><span>PERSONALIZAÇÃO</span><h2 id="nk-paleta-titulo">Cor do compromisso</h2></div>
          <button type="button" class="nk-paleta-fechar" aria-label="Fechar seletor de cores">✕</button></div>
        <p class="nk-paleta-explicacao">Escolha uma cor exclusiva ou mantenha a cor definida para a matéria.</p>
        <div class="nk-paleta-preview"><div class="nk-paleta-preview-marca"></div><strong class="nk-paleta-preview-titulo"></strong><span class="nk-paleta-preview-hex"></span></div>
        <div class="nk-paleta-amostras" aria-label="Cores sugeridas"></div>
        <div class="nk-paleta-livre"><label for="nk-paleta-nativa">Escolher qualquer cor</label><input id="nk-paleta-nativa" type="color" aria-label="Abrir seletor de cores do sistema" />
          <input class="nk-paleta-hex" maxlength="7" spellcheck="false" aria-label="Cor hexadecimal" placeholder="#3b82f6" /></div>
        <button type="button" class="nk-paleta-automatica">↺ Usar cor da matéria / padrão</button>
        <p class="nk-paleta-erro" role="alert" hidden></p>
        <div class="nk-paleta-acoes"><button class="nk-paleta-cancelar" type="button">Cancelar</button><button class="nk-paleta-salvar" type="button">Salvar cor</button></div>
      </div>`;

    document.body.appendChild(overlay);
    const $ = selector => overlay.querySelector(selector);
    $('.nk-paleta-preview-titulo').textContent = titulo || 'Compromisso';
    let selecionada = normalizar(atual);
    const herdada = normalizar(automatica) || PADRAO.atividade;
    const entrada = $('.nk-paleta-hex');
    const nativa = $('#nk-paleta-nativa');
    function render() {
      const cor = selecionada || herdada;
      $('.nk-paleta-preview').style.setProperty('--nk-evento-cor', cor);
      $('.nk-paleta-preview').style.setProperty('--nk-evento-fundo', rgba(cor, .16));
      $('.nk-paleta-preview').style.setProperty('--nk-evento-borda', rgba(cor, .45));
      $('.nk-paleta-preview-hex').textContent = selecionada ? cor : 'Automática';
      $('.nk-paleta-automatica').classList.toggle('selecionada', !selecionada);
      nativa.value = cor;
      entrada.value = cor;
      $('.nk-paleta-erro').hidden = true;
      overlay.querySelectorAll('.nk-paleta-amostra').forEach(b => {
        b.classList.toggle('selecionada', b.title.toLowerCase() === cor && !!selecionada);
      });
    }
    function escolher(cor) { selecionada = normalizar(cor); render(); }
    amostras($('.nk-paleta-amostras'), escolher);
    nativa.addEventListener('input', e => escolher(e.target.value));
    entrada.addEventListener('input', e => {
      const valor = normalizar(e.target.value);
      if (valor) { selecionada = valor; render(); }
    });
    $('.nk-paleta-automatica').addEventListener('click', () => { selecionada = null; render(); });
    function fechar() {
      document.removeEventListener('keydown', teclado, true);
      overlay.remove();
      if (anterior instanceof HTMLElement) anterior.focus();
    }
    function teclado(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); fechar(); }
    }
    document.addEventListener('keydown', teclado, true);
    $('.nk-paleta-fechar').addEventListener('click', fechar);
    $('.nk-paleta-cancelar').addEventListener('click', fechar);
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) fechar(); });
    $('.nk-paleta-salvar').addEventListener('click', async () => {
      const btn = $('.nk-paleta-salvar');
      btn.disabled = true;
      btn.textContent = 'Salvando...';
      try { await salvar(selecionada); fechar(); }
      catch (erro) {
        console.error('Erro ao salvar a cor:', erro);
        $('.nk-paleta-erro').textContent = erro?.message || 'Não foi possível salvar a cor.';
        $('.nk-paleta-erro').hidden = false;
      } finally { btn.disabled = false; btn.textContent = 'Salvar cor'; }
    });
    render();
    $('.nk-paleta-fechar').focus();
  }

  // Legenda adicional para matérias com cores próprias.
  function atualizarLegenda(materias, seletor) {
    const base = document.querySelector(seletor);
    if (!base) return;
    let adicional = base.parentElement.querySelector('.nk-legenda-materias');
    const coloridas = (materias || []).filter(m => normalizar(m.cor));
    if (!coloridas.length) { adicional?.remove(); return; }
    if (!adicional) {
      adicional = document.createElement('div');
      adicional.className = 'nk-legenda-materias';
      base.insertAdjacentElement('afterend', adicional);
    }
    adicional.replaceChildren();
    const legenda = document.createElement('strong');
    legenda.textContent = 'CORES DAS MATÉRIAS';
    adicional.appendChild(legenda);
    coloridas.forEach(materia => {
      const chip = document.createElement('span');
      chip.className = 'nk-legenda-materia';
      const ponto = document.createElement('i');
      ponto.style.backgroundColor = materia.cor;
      const nome = document.createElement('span');
      nome.textContent = materia.nome;
      chip.append(ponto, nome);
      adicional.appendChild(chip);
    });
  }

  async function editarCompromisso(item, materias, usuarioId, atualizar) {
    if (!usuarioId || !item.id || !TABELAS[item.tipo]) return;
    abrir({
      titulo: item.titulo,
      atual: item.corPersonalizada,
      automatica: corAutomatica(item, materias),
      salvar: async (cor) => {
        const { data, error } = await nexoSupabase.from(TABELAS[item.tipo])
          .update({ cor_personalizada: cor })
          .eq('id', item.id)
          .eq('usuario_id', usuarioId)
          .select('id');
        if (error) throw error;
        if (!data?.length) throw new Error('Não foi possível atualizar o compromisso da sua conta.');
        await atualizar();
      }
    });
  }

  window.NKPaleta = Object.freeze({ PADRAO, AMOSTRAS, normalizar, corAutomatica, corEfetiva, aplicar, abrir, amostras, atualizarLegenda, editarCompromisso });
})();
