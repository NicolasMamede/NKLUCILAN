(() => {
  'use strict';
  const fontes = [
    ['atividades', 'concluida'],
    ['trabalhos', 'concluido'],
    ['estudos', 'concluido']
  ];
  // Use explicit date parts to avoid relying on locale-dependent order.
  function hojeBrasil() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  }
  async function contar() {
    if (!document.querySelector('.nk-atrasados-badge') || typeof nexoSupabase === 'undefined') return;
    const { data: { session } } = await nexoSupabase.auth.getSession();
    if (!session?.user) return;
    const hoje = hojeBrasil();
    const resultados = await Promise.all(fontes.map(async ([tabela, campo]) => {
      const q = nexoSupabase.from(tabela).select('id', { count: 'exact', head: true })
        .eq('usuario_id', session.user.id).lt('data', hoje).eq(campo, false);
      const { count, error } = await q;
      if (error) { console.warn('[NK Atrasados]', tabela, error); return 0; }
      return count || 0;
    }));
    const total = resultados.reduce((a, b) => a + b, 0);
    document.querySelectorAll('.nk-atrasados-badge').forEach(el => {
      el.textContent = String(total);
      el.hidden = total === 0;
    });
  }
  window.NKAtrasadosAtualizar = contar;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', contar);
  else void contar();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void contar(); });
})();
