// ========================================
// NEXO
// CONEXÃO COM O SUPABASE
// ========================================


// URL pública do projeto Nexo

const SUPABASE_URL =
    "https://vwwfprtgzrgdrkzeqxxk.supabase.co";


// Chave publicável do projeto
// Esta chave pode ser utilizada no frontend.

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_rTUSyITylSw6SB51-pNxXg_08x317mg";


// ========================================
// CRIAR CLIENTE SUPABASE
// ========================================

const nexoSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);