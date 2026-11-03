/* NK Lucilan — menu móvel da página Atrasados (somente interface). */
(() => {
  'use strict';
  const menu = document.getElementById('menuMobile');
  const lateral = document.getElementById('sidebar');
  if (!menu || !lateral) return;
  menu.addEventListener('click', () => {
    const aberto = lateral.classList.toggle('ativo');
    menu.setAttribute('aria-expanded', String(aberto));
    menu.setAttribute('aria-label', aberto ? 'Fechar menu lateral' : 'Abrir menu lateral');
  });
  document.addEventListener('click', (event) => {
    if (!lateral.contains(event.target) && !menu.contains(event.target)) {
      lateral.classList.remove('ativo');
      menu.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      lateral.classList.remove('ativo');
      menu.setAttribute('aria-expanded', 'false');
    }
  });
})();
