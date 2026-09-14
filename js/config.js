// Configuração do Supabase.
// A "anon key" é pública por design — a segurança vem das políticas RLS
// em supabase/schema.sql (anon só insere; leitura só com login).
//
// Onde pegar: Supabase > Project Settings > API
export const SUPABASE_URL = 'COLE_AQUI_A_PROJECT_URL';
export const SUPABASE_ANON_KEY = 'COLE_AQUI_A_ANON_PUBLIC_KEY';

export const isConfigured = () =>
  !SUPABASE_URL.includes('COLE_AQUI') && !SUPABASE_ANON_KEY.includes('COLE_AQUI');
