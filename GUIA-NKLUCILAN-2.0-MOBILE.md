# NKLUCILAN — App 2.0 (Mobile + Desktop)

## Novidades
- Menu ☰ unificado em todas as páginas internas: abre, fecha, fecha pelo fundo, Escape, links e botão ×; acessível por teclado.
- Navegação inferior com cinco atalhos no celular (Início, Semana, Mês, Atrasados, Perfil); toda a navegação permanece no menu lateral.
- Calendário mensal responsivo: 7 colunas compactas; toque no dia para ver seus compromissos e botão de adicionar, quando disponível.
- Calendários mensais de Trabalhos, Estudos e Agenda Pública adaptados ao celular; o desktop mantém a grade completa.
- Semana com cartões compactos empilhados, sem rolagem horizontal de 7 colunas.
- Melhorias em botões e modais para telas estreitas; botão 🔔 conectado ao painel push/Novidades, que agora pode ser recolhido no celular.
- Correção do JavaScript da integração de Trabalhos na Agenda Pública que lançava erro em páginas sem o controlador da agenda.
- PWA com conferência de atualizações quando o app é reaberto e aviso “Atualizar agora” quando uma nova versão assume o controle.
- Recursos estáticos priorizam a rede e revalidam o cache; dados privados do Supabase não são cacheados.

## Publicar no repositório existente
1. Faça backup da pasta atual `C:\Users\nickm\Desktop\NKLUCILAN-repo` ou crie uma branch.
2. Extraia o ZIP. **Abra a pasta interna `NKLUCILAN-main`.**
3. Copie todo o conteúdo dessa pasta interna para `C:\Users\nickm\Desktop\NKLUCILAN-repo`, aceitando substituir arquivos existentes.
4. Não substitua nem exclua a pasta `.git` de `NKLUCILAN-repo`.
5. Abra o terminal **na pasta `NKLUCILAN-repo`**:

```powershell
cd C:\Users\nickm\Desktop\NKLUCILAN-repo
git status
git add .
git commit -m "NKLUCILAN 2.0: melhorias para mobile e PWA"
git push origin main
```

## Atualização do aplicativo instalado
Não é necessário reinstalar o PWA. Após a publicação no GitHub Pages e com conexão à internet, feche e reabra o app. Se aparecer a opção “Atualizar agora”, toque nela. O ciclo de atualização depende do navegador e da disponibilidade da rede; não é instantâneo.

## Notificações
O código original já conta com inscrição para Web Push e um teste no painel do Início. Esta versão melhora o acesso e a apresentação desse painel, mas **não substitui a função de envio push no Supabase nem implementa, sozinha, um agendador de notificações automáticas**. Para receber alertas com o app fechado, confirme permissão, inscrição válida e rotina de envio no servidor. Permissão de notificações nunca é solicitada automaticamente.

## Testes e limites
- Sintaxe dos JavaScripts validada por Node.js.
- Links internos e arquivos locais referenciados verificados.
- Teste visual e de interação do menu em 12 páginas internas, em tela simulada de 390 px; nenhum erro JavaScript com dados de teste simulados.
- Layout desktop conferido em 1366 px, inclusive calendário Mês.
- As ações que precisam de conta real, políticas Supabase ou servidor push não foram executadas no banco do usuário. Teste essas ações com a conta real após publicar.

## Backup e compatibilidade
O visual desktop é preservado por media queries. O projeto continua conectado ao mesmo Supabase e usa o mesmo manifesto PWA. A lógica de prazos vencidos e as cores das matérias continuam nos arquivos originais. Nenhuma migração SQL foi adicionada.
