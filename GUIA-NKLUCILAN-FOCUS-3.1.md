# NKLUCILAN Focus 3.1 — Contraste mobile

Correção incremental sobre o NKLUCILAN Focus 3.0. Os arquivos do projeto estão completos.

## Corrigido
- Textos de atividades, provas e trabalhos na Semana ficam escuros e visíveis sobre fundo claro.
- Nome da matéria e horário não são mais cinza-claro sobre branco.
- Agenda expandida do Mês usa títulos e detalhes escuros, inclusive para eventos com cor personalizada.
- A cor da matéria continua representada pela barra lateral, sem alterar os registros do Supabase.
- Rótulos pequenos de calendário e estados vazios com melhor contraste.
- Alterações limitadas a telas de até 900 px; desktop e regras de dados preservados.
- Referências CSS atualizadas para v3.1, cache PWA versão v4.

## Publicar
Copie **o conteúdo** de `NKLUCILAN-main` para a pasta já clonada `NKLUCILAN-repo`, preservando `.git`. Use `git status`, `git add .`, `git commit -m "Corrige contraste do NKLUCILAN Focus mobile"` e `git push origin main`.
Depois feche e reabra o PWA; aceite **Atualizar agora** se aparecer.

## Testes
Verificações de contraste com atividades de cores azul, branca e amarela e agenda do Mês usando dados de exemplo. A conta real do usuário não foi acessada.
