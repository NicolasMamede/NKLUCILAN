# NKLUCILAN Focus 3.0

Atualização de interface para uso no celular, inspirada no princípio de organização simples dos gerenciadores de tarefas. Não usa marcas, logos ou arquivos do TickTick.

## Mudanças
- Interface clara e limpa em telas até 900px; layout desktop original preservado.
- Navegação inferior Início, Semana, Mês, Atrasados e Mais (menu lateral completo).
- Botão flutuante + para criar atividade, prova ou trabalho, com atalhos para os formulários existentes.
- Agenda mensal compacta, com pontinhos para compromissos e detalhe do dia abaixo.
- Semana organizada em cartões mais leves; resumo do Início em faixa de sete dias.
- Notificações da página inicial não ocupam mais espaço constantemente: o painel abre pelo sino.
- Service worker atualizado para detectar a versão v3 dos arquivos estáticos sem guardar dados do Supabase.

## Publicação
Faça backup do repositório local. Copie o CONTEÚDO desta pasta para a pasta clonada do GitHub, preservando .git, confira `git diff --stat`, rode `git add .`, `git commit -m "NKLUCILAN Focus 3.0"`, `git push origin main`. Depois feche e reabra o app no telefone, se necessário.

## Testes e limites
Testes de navegação e sintaxe com conta simulada, não com dados reais da sua conta Supabase. O funcionamento completo de notificações push exige configuração de envio no servidor. O layout desktop não recebe as novas regras de interface.
