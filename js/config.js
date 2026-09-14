// Configuração do Supabase — projeto "formulario-aloha" (Nogma).
// A publishable key é pública por design (vai no navegador). A segurança vem
// das políticas RLS em supabase/schema.sql: anon só insere; leitura só com login.
//
// Onde pegar: Supabase > Project Settings > API Keys
export const SUPABASE_URL = 'https://bbbjbmzgtvtquunrbyvp.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_KrhOxdB9b3XcgdZL81_WiQ_-DUAXfgO';

export const isConfigured = () =>
  !SUPABASE_URL.includes('COLE_AQUI') && !SUPABASE_ANON_KEY.includes('COLE_AQUI');
