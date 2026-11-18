# NKLUCILAN Focus 3.6 — Estabilidade de notificações

## Correções no aplicativo
- O painel do Início diferencia permissão do navegador e assinatura push no Supabase. Não pede autorização novamente quando já está concedida.
- Se houver uma assinatura push existente mas não registrada no banco, tenta reconciliar sem solicitar nova permissão.
- A página Estatísticas mostra o estado da permissão e oferece um diagnóstico de horários de lembrete lidos do Supabase.
- Após salvar atividades e provas nos principais formulários, a verificação local é refeita a partir dos dados atuais. Trabalhos também notificam essa alteração.
- A lista de lembretes é apenas um diagnóstico dos dados atuais: não indica que o servidor agendou envio.

## Limitação importante
O ZIP do site NÃO inclui o código da Supabase Edge Function `send-push` ou a rotina cron de envio. As notificações com o aplicativo fechado dependem desse servidor; este pacote não pode garantir nem corrigir um problema na função do servidor. Para verificar edições que deixaram de notificar, confira na função de envio se a rotina consulta `data`, `horario` e `lembretes` atualizados a cada execução, usando o fuso America/Sao_Paulo (ou convertendo-o corretamente para UTC). Notificações futuras não devem permanecer baseadas numa programação em memória ou nos valores antigos. Confirme os logs da função/cron e erros de entrega.

## Verificação sugerida
1. Abra Estatísticas > Diagnóstico de notificações e toque em Conferir lembretes cadastrados.
2. Edite uma atividade de amanhã para outra data/hora, marque Na hora, salve e refaça o diagnóstico.
3. Se a nova data/hora está na lista mas o aviso só falha com o app fechado, investigue a função de envio do Supabase.
4. No Início > Notificações, use Enviar teste para verificar a assinatura e a conexão push.
5. Para evitar confusão, teste um horário 5 a 10 minutos adiante e lembre que o cron do servidor pode ter frequência maior que um minuto.

Não foi executada alteração SQL ou modificada a base de dados. Não há necessidade de reinstalar o PWA.
