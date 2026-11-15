# NKLUCILAN Focus 3.2 — Cartões coloridos

Projeto completo, baseado no Focus 3.1, sem alterar dados do Supabase.

## Alterações
- **Semana**: tarefas, provas e trabalhos voltam a ter fundo inteiro na cor da matéria ou do evento, com borda arredondada.
- **Mês (agenda abaixo do calendário)**: a mesma identificação por cartões coloridos.
- Cores claras (inclusive branco e amarelo) são exibidas sobre um tom neutro para manter os cartões distinguíveis.
- Textos escuros e legíveis; correções de contraste do Focus 3.1 mantidas.
- Alterações somente em telas de até 900px; CSS para desktop não foi modificado.
- Correção exclusiva de CSS: nenhuma tabela, funcionalidade ou dado foi alterado.
- Atualização de `nk-focus-mobile.css` para `?v=3.2` e cache PWA `v5`.

## Publicação
Extraia o ZIP e copie **o conteúdo** de `NKLUCILAN-main` para `NKLUCILAN-repo` sem apagar a pasta `.git`. Revise `git status`, faça `git add .`, `git commit -m "Focus 3.2 - cartoes coloridos"` e `git push origin main`.

Abra o aplicativo após a publicação pelo GitHub Pages. Caso necessário, feche e reabra ou toque em **Atualizar agora**. Não é preciso reinstalar.

## Escopo dos testes
Testado em Chromium simulando celular e desktop, com cartões de cores diferentes e contraste medido. Fluxos autenticados com dados reais do Supabase não foram testados.
