# NKLUCILAN Focus 3.3 — Categorias dos compromissos no Mês

Base: NKLUCILAN Focus 3.2 (cartões coloridos).

## Alteração
Ao tocar em um dia no calendário **Mês** no celular, a agenda abaixo da grade mostra o tipo **ATIVIDADE**, **TRABALHO** ou **PROVA** acima do título de cada compromisso — como já acontece na **Semana**.

- Preservados: cores dos cartões, textos legíveis, data e matéria, navegação e alteração de cores por toque.
- Mudança limitada à agenda de dias do Mês em telas pequenas; desktop não foi alterado.
- Dados e consultas do Supabase não foram alterados.
- `nk-mobile-calendar.js` e CSS atualizados com versão de URL para evitar cache antigo; cache PWA v6.

## Publicação
Copie o conteúdo da pasta `NKLUCILAN-main` deste ZIP para sua pasta clonada `NKLUCILAN-repo`, preservando `.git`. Em seguida:

```powershell
cd C:\Users\nickm\Desktop\NKLUCILAN-repo
git status
git add .
git commit -m "NKLUCILAN Focus 3.3 - tipos no Mes"
git push origin main
```

No aplicativo instalado, feche e reabra após a publicação do GitHub Pages, e toque em **Atualizar agora** caso apareça.

## Testes
Teste com exemplos de prova, trabalho e atividade; não inclui autenticação ou dados reais do Supabase.
