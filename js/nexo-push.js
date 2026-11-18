/* NK Lucilan Push — carregue depois de supabase.js e auth.js */
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
    if (error || !data.user) throw new Error('Faça login no NK Lucilan novamente.');
    return data.user;
  }
  async function ativar() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      throw new Error('Este navegador não oferece suporte a notificações push.');
    }
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.startsWith('COLE_AQUI')) {
      throw new Error('Configure a chave VAPID pública no arquivo nexo-push.js.');
    }
    // Pedir consentimento somente se ainda não existir. Fazer antes dos awaits
    // para preservar o clique do usuário exigido pelos navegadores.
    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission() : Notification.permission;
    if (permission !== 'granted') throw new Error(
      permission === 'denied' ? 'Notificações bloqueadas nas configurações do aparelho.' : 'Permissão de notificações não concedida.'
    );
    const user = await getUser();
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
    await atualizarBotaoAtivar();
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
  // A permissão do navegador NÃO é uma assinatura push. Apresente cada estado
  // separadamente, sem pedir autorização novamente em todo acesso.
  async function atualizarBotaoAtivar() {
    const btn = document.getElementById('nk-botao-ativar-push');
    if (!btn) return;
    function mostrar(label, message) {
      btn.hidden = false;
      btn.style.display = '';
      btn.textContent = label;
      info(message);
    }
    function ocultar(message) {
      btn.hidden = true;
      btn.style.display = 'none';
      info(message);
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      mostrar('Notificações indisponíveis', 'Este dispositivo não suporta notificações push.');
      btn.disabled = true;
      return;
    }
    if (Notification.permission === 'denied') {
      mostrar('Permissão bloqueada', 'Autorize notificações nas configurações do aplicativo ou navegador.');
      btn.disabled = true;
      return;
    }
    btn.disabled = false;
    if (Notification.permission !== 'granted') {
      mostrar('Ativar notificações', 'Permissão ainda não concedida neste dispositivo.');
      return;
    }
    try {
      const user = await getUser();
      const registration = await navigator.serviceWorker.getRegistration(WORKER_PATH);
      const subscription = registration && await registration.pushManager.getSubscription();
      if (!subscription) {
        mostrar('Conectar dispositivo', 'Permissão concedida, mas o push ainda não está conectado neste aparelho.');
        return;
      }
      const {data,error}=await nexoSupabase.from('push_subscriptions')
        .select('id').eq('usuario_id',user.id).eq('endpoint',subscription.endpoint).limit(1);
      if (error) throw error;
      if (!data || !data.length) {
        // Uma assinatura local válida pode não estar registrada no banco (por
        // exemplo, após troca de sessão). Tentar reparar sem nova permissão.
        const {error:syncError}=await nexoSupabase.from('push_subscriptions').upsert({
          usuario_id:user.id, endpoint:subscription.endpoint, subscription:subscription.toJSON()
        },{onConflict:'endpoint'});
        if (syncError) throw syncError;
      }
      ocultar('Permissão concedida e dispositivo conectado para push.');
    } catch (error) {
      console.warn('[NK Lucilan Push] Assinatura não confirmada:',error);
      mostrar('Verificar conexão', 'Permissão já concedida. Falta confirmar a assinatura push no Supabase; toque para sincronizar.');
    }
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
    titulo.textContent = '🔔 Notificações do NK Lucilan';
    const linha = document.createElement('div');
    linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';
    const ativarBtn = botao('Ativar notificações', ativar);
    ativarBtn.id = 'nk-botao-ativar-push';
    linha.append(ativarBtn, botao('Enviar teste', testar));
    const status = document.createElement('p');
    status.id = 'nexo-push-status';
    status.style.cssText = 'margin:10px 0 0;color:#475569';
    status.textContent = 'Ative e depois envie um teste.';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nk-push-toggle';
    toggle.textContent = '🔔 Notificações';
    toggle.setAttribute('aria-label', 'Abrir ou recolher painel de notificações');
    const compact = window.matchMedia('(max-width: 900px)');
    const setCompact = value => {
      painel.classList.toggle('nk-push-minimized', Boolean(value));
      toggle.setAttribute('aria-expanded', String(!value));
      toggle.textContent = value ? '🔔 Notificações' : '× Recolher';
    };
    toggle.addEventListener('click', () => {
      const next = !painel.classList.contains('nk-push-minimized');
      setCompact(next);
      if (next) painel.classList.remove('nk-push-open');
    });
    painel.append(toggle, titulo, linha, status);
    document.body.append(painel);
    setCompact(compact.matches);
    void atualizarBotaoAtivar();
    window.addEventListener('pageshow', () => void atualizarBotaoAtivar());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void atualizarBotaoAtivar();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
