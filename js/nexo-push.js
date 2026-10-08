/* Nexo Push — carregue depois de supabase.js e auth.js */
(() => {
  'use strict';
  // Cole SOMENTE a chave VAPID PUBLICA gerada anteriormente.
  const VAPID_PUBLIC_KEY = 'BJ86mQ6GCqNgDbSWdfEqKd7dFSmAV7UFr3jI0O6Xy85pSiADBYFB4SJdlWLvayEcoW3f9LgR3TGDmgQgKvbe-XM';
  const WORKER_PATH = './sw.js';
  const FUNCTIONS_URL = 'https://vwwfprtgzrgdrkzeqxxk.supabase.co/functions/v1/send-push';

  function base64ToUint8Array(base64) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob((base64.replace(/-/g, '+').replace(/_/g, '/')) + padding);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }
  function info(msg) {
    const el = document.getElementById('nexo-push-status');
    if (el) el.textContent = msg;
  }
  async function getUser() {
    const { data, error } = await nexoSupabase.auth.getUser();
    if (error || !data.user) throw new Error('Faça login no Nexo novamente.');
    return data.user;
  }
  async function ativar() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      throw new Error('Este navegador não oferece suporte a notificações push.');
    }
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.startsWith('COLE_AQUI')) {
      throw new Error('Configure a chave VAPID pública no arquivo nexo-push.js.');
    }
    const user = await getUser();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permissão de notificações não concedida.');
    const reg = await navigator.serviceWorker.register(WORKER_PATH);
    const ready = await navigator.serviceWorker.ready;
    let sub = await ready.pushManager.getSubscription();
    if (sub) {
      // Se a inscrição foi criada com outra chave, é necessário renová-la.
      const current = sub.options?.applicationServerKey;
      const desired = base64ToUint8Array(VAPID_PUBLIC_KEY);
      if (current && (new Uint8Array(current).length !== desired.length ||
        new Uint8Array(current).some((n, i) => n !== desired[i]))) {
        await sub.unsubscribe();
        sub = null;
      }
    }
    if (!sub) sub = await ready.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    const { error } = await nexoSupabase.from('push_subscriptions').upsert({
      usuario_id: user.id,
      endpoint: sub.endpoint,
      subscription: sub.toJSON()
    }, { onConflict: 'endpoint' });
    if (error) throw error;
    info('Notificações ativadas neste dispositivo!');
    return reg;
  }
  async function testar() {
    await getUser();
    const { data: { session }, error } = await nexoSupabase.auth.getSession();
    if (error || !session) throw new Error('Sessão expirada. Faça login novamente.');
    const response = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({ action: 'test' })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Erro HTTP ${response.status}`);
    if (!payload.enviados) throw new Error('Nenhum dispositivo recebeu. Ative as notificações primeiro.');
    info(`Teste enviado para ${payload.enviados} dispositivo(s)!`);
  }
  function botao(label, fn) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = 'padding:10px 15px;border:0;border-radius:10px;background:#2563eb;color:white;font:inherit;cursor:pointer';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { info('Aguarde...'); await fn(); }
      catch (e) { console.error('[Nexo Push]', e); info(e.message || 'Erro nas notificações.'); }
      finally { btn.disabled = false; }
    });
    return btn;
  }
  function montar() {
    if (document.getElementById('nexo-push-painel')) return;
    const painel = document.createElement('section');
    painel.id = 'nexo-push-painel';
    painel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;background:white;color:#1e293b;padding:16px;border-radius:14px;box-shadow:0 8px 30px #0003;max-width:340px;font:14px system-ui,sans-serif';
    const titulo = document.createElement('strong');
    titulo.textContent = '🔔 Notificações do Nexo';
    const linha = document.createElement('div');
    linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';
    linha.append(botao('Ativar notificações', ativar), botao('Enviar teste', testar));
    const status = document.createElement('p');
    status.id = 'nexo-push-status';
    status.style.cssText = 'margin:10px 0 0;color:#475569';
    status.textContent = 'Ative e depois envie um teste.';
    painel.append(titulo, linha, status);
    document.body.append(painel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
