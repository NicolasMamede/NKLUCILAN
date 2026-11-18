# NKLUCILAN Focus 3.5 — Rotina inteligente

Esta versão parte do pacote Focus 3.4 e preserva as páginas existentes, as cores das matérias, os detalhes de compromissos e a versão PWA.

## Novidades

1. **Atividades recorrentes** nos formulários de Atividades, Semana e Mês: todos os dias, todas as semanas ou todos os meses, com uma data final. O aplicativo cria até **60 ocorrências reais e independentes** no Supabase. Alterar ou excluir uma ocorrência não modifica automaticamente as outras. Não há renovação automática quando a data final é alcançada. Escolher um período menor é útil para evitar excesso de tarefas.
2. **Lembretes configuráveis**: além das opções já existentes, 3 e 6 horas antes. As escolhas continuam salvas no campo `lembretes` das atividades, provas e trabalhos. Quando o aplicativo **está aberto**, com internet e permissão de notificações, ele verifica os prazos a cada minuto. Avisos com o app fechado dependem do push já existente, da configuração no servidor e das permissões do dispositivo.
3. **Busca** (`buscar.html`): pesquisa por título, matéria e descrição, com filtros por tipo e situação; abre detalhes e permite concluir atividades/trabalhos.
4. **Estatísticas** (`estatisticas.html`): total concluído, pendências, atrasos, próximos 7 dias e distribuição por matéria. O sistema **não possui data de conclusão** no esquema atual; por isso, não inventa a evolução semanal de tarefas concluídas.
5. **Conclusão rápida** nos cartões de Semana, Mês e na agenda mensal compacta do celular. Provas não têm botão de concluir porque o esquema atual não disponibiliza um campo de conclusão para provas.
6. **Revisão de qualidade**: estilos desktop mantidos; textos, cores e cartões Focus 3.4 preservados; testes de navegação, criação recorrente, filtros, estatísticas e responsividade realizados com Supabase simulado.

## Publicação no GitHub Pages

1. Extraia o ZIP e abra a pasta `NKLUCILAN-main`.
2. Faça cópia de segurança da pasta `NKLUCILAN-repo` do seu computador.
3. Copie **o conteúdo** de `NKLUCILAN-main` para a pasta `NKLUCILAN-repo`. Substitua os arquivos correspondentes, mas nunca exclua a pasta `.git`.
4. Abra o PowerShell:

```powershell
cd C:\Users\nickm\Desktop\NKLUCILAN-repo
git status
git add .
git commit -m "NKLUCILAN Focus 3.5 - Rotina inteligente"
git push origin main
```

O PWA já instalado pode receber a atualização após a publicação do GitHub Pages e a atualização do service worker. Se necessário, feche e reabra o app. **Não é preciso reinstalar.**

## Importante para a conta de outro estudante

As consultas de Busca e Estatísticas são filtradas pelo ID da pessoa autenticada e pela visibilidade privada. As novas atividades recorrentes usam o mesmo usuário e as mesmas políticas do Supabase já existentes. Esta versão **não precisa de SQL adicional**.

## Checklist após a publicação

- No celular: abrir Semana, verificar o menu e concluir uma tarefa por ✓ sem abrir a janela de detalhes.
- No celular: abrir Mês, selecionar um dia, concluir uma tarefa no cartão do dia.
- Em Atividades: criar uma atividade semanal terminando em duas semanas e conferir as três datas criadas.
- Em Busca: pesquisar uma palavra da descrição e abrir os detalhes.
- Em Estatísticas: comparar os números com registros reais, lembrando que provas passadas não contam como tarefas concluídas.
- Em Estatísticas: ativar notificações por gesto do usuário; cadastrar um lembrete próximo e manter o app aberto para validar.
- No computador: conferir Semana, Mês e formulários sem perda do tema original.

> Os testes automatizados foram feitos com dados simulados, sem acesso à conta real e sem executar mudanças na base existente. Não é possível garantir notificações em segundo plano apenas com JavaScript de página.
