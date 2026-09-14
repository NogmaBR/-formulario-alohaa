// Cliente de demonstração: abra admin.html?mock para ver o painel com dados
// de exemplo, sem Supabase. Mesma interface de js/supabase-client.js.
import { QUESTIONS } from '../questions.js';

const mk = (id, nome, cargo, daysAgo, dur, fill) => ({
  id,
  created_at: new Date(Date.now() - daysAgo * 864e5).toISOString(),
  nome, cargo, duracao_seg: dur,
  user_agent: 'mock',
  respostas: Object.fromEntries(QUESTIONS.map((q, i) => [q.id, fill(q, i)])),
});

const rows = [
  mk('m1', 'Ana Souza', 'Sócia', 0, 754, (q, i) => i === 6
    ? 'Recovery completo: começa com avaliação rápida, depois crioterapia (10 min), compressão pneumática nas pernas (20 min) e finaliza com liberação miofascial.\n\nSauna: sessão de 30 min em sauna seca a 80°C, com hidratação incluída.'
    : `Exemplo de resposta para "${q.titulo.slice(0, 40)}…"`),
  mk('m2', 'Bruno Lima', 'Gerente', 2, 1210, (q, i) => (i % 5 === 0 ? '' : `Resposta ${i + 1} do Bruno.`)),
  mk('m3', 'Carla Mendes', 'Recepção', 5, 640, (q, i) => `Resposta ${i + 1} da Carla, bem detalhada.`),
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let session = { user: { email: 'demo@nogma.com.br' } };

export async function signIn() { await wait(300); session = { user: { email: 'demo@nogma.com.br' } }; return session; }
export async function signOut() { session = null; }
export async function getSession() { return session; }
export function onAuth() { return { data: { subscription: { unsubscribe() {} } } }; }
export async function listResponses() { await wait(250); return rows.map(({ respostas, user_agent, ...r }) => r); }
export async function getResponse(id) { await wait(150); return rows.find((r) => r.id === id); }
export async function getAllResponses() { await wait(200); return rows; }
