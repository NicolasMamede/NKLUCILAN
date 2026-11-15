# NKLUCILAN • versão aplicativo (PWA)

Esta versão foi criada a partir do ZIP **NKLUCILAN-corrigido** que você enviou na conversa. Ela mantém o site, as cores das matérias, os recursos Supabase e o service worker existente para notificações.

## O que foi adicionado

- `manifest.webmanifest`: nome, ícone, cores e tela inicial do app;
- `icons/`: ícones Android e iOS;
- `js/nk-app.js` e `css/nk-app.css`: registro do aplicativo e botão para instalação em navegadores compatíveis;
- `offline.html`: orientação quando ficar sem internet;
- `sw.js`: complementado com cache de arquivos estáticos, preservando notificações push.

> **Importante:** o app usa Supabase; login, consulta e gravação de atividades ainda exigem internet. Offline é exibida uma tela explicativa. Este ZIP **não é um APK nativo**.

## Enviar para o GitHub com sua pasta atual

1. Extraia este ZIP em outra pasta.
2. Copie **o conteúdo interno da pasta NKLUCILAN-main** para `C:\Users\nickm\Desktop\NKLUCILAN-repo`, substituindo arquivos existentes. Não copie a pasta `.git` (não há nenhuma neste ZIP).
3. Abra o terminal do VS Code e execute:

```powershell
cd C:\Users\nickm\Desktop\NKLUCILAN-repo
git status
git add .
git commit -m "Adiciona versao aplicativo PWA do NKLUCILAN"
git push origin main
```

4. Publique o site via **HTTPS** (por exemplo, GitHub Pages, Settings → Pages → Deploy from a branch → `main` → `/ (root)`). Se já estiver publicado, mantenha o procedimento atual.
5. Em Android: abra o **endereço HTTPS do site** no Chrome e use o botão **Instalar aplicativo** ou o menu `⋮` → **Instalar app / Adicionar à tela inicial**.
6. Em iPhone: abra o site no Safari, toque em **Compartilhar** → **Adicionar à Tela de Início**.

Instalabilidade é determinada pelo navegador e pode variar conforme HTTPS, ícones, manifest, sistema operacional e cache antigo. Se não aparecer, feche/reabra o navegador ou teste após atualizar a página. A URL de `github.com/...` exibe o repositório, não o aplicativo: acesse a URL do site **publicado**.

## Observações e cuidados

- O **push** existente foi mantido; não há garantia de notificações em segundo plano em todos os dispositivos, e o usuário precisa consentir com as permissões.
- O app não é publicado na Play Store/App Store por este pacote. Se depois quiser um APK, a próxima etapa é empacotar este PWA em formato Android.
- Teste login, matérias, Semana, Mês, Trabalhos, Provas, Atrasados e notificações no site de produção antes de divulgar.
- Ao atualizar versão futura do service worker, incremente o número da constante `NK_CACHE` para limpar caches antigos de recursos.
