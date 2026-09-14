// Acesso ao Supabase. Único ponto do app que fala com o backend.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js';

let client = null;

export function getClient() {
  if (!isConfigured()) throw new Error('Supabase não configurado (js/config.js).');
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

/* ---------- Formulário (anon) ---------- */

/** Insere um envio. Não faz select de volta: anon não tem permissão de leitura. */
export async function submitResponse({ nome, cargo, respostas, duracao_seg, user_agent }) {
  const { error } = await getClient()
    .from('respostas')
    .insert({ nome, cargo, respostas, duracao_seg, user_agent });
  if (error) throw error;
}

/* ---------- Admin (authenticated) ---------- */

export async function signIn(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await getClient().auth.signOut();
}

export async function getSession() {
  const { data } = await getClient().auth.getSession();
  return data.session ?? null;
}

export function onAuth(cb) {
  return getClient().auth.onAuthStateChange((_event, session) => cb(session));
}

/** Lista resumida para a tela de envios. */
export async function listResponses() {
  const { data, error } = await getClient()
    .from('respostas')
    .select('id, created_at, nome, cargo, duracao_seg')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getResponse(id) {
  const { data, error } = await getClient()
    .from('respostas')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** Todas as linhas completas (exportação CSV). */
export async function getAllResponses() {
  const { data, error } = await getClient()
    .from('respostas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
