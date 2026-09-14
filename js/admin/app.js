// Painel admin: login (Supabase Auth), lista de envios e detalhe com exportações.
import { QUESTIONS, TOTAL_QUESTIONS } from '../questions.js';
import { isConfigured } from '../config.js';
import { toMarkdown, toCSV, download, slug, fmtDuration } from './export.js';

const $ = (sel) => document.querySelector(sel);

/** Cria elemento sem innerHTML: h('div', { class: 'x' }, 'texto', child) */
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c != null) node.append(c instanceof Node ? c : String(c));
  return node;
}

const fmtDate = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const initials = (nome) => nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

let sb = null;        // módulo supabase-client (import dinâmico)
let entries = [];     // lista resumida
let current = null;   // envio aberto no detalhe

/* ---------- Telas / util ---------- */
function showScreen(name) {
  document.querySelectorAll('[data-screen]').forEach((s) => {
    const active = s.dataset.screen === name;
    s.hidden = !active;
    s.classList.remove('is-enter');
    if (active) { void s.offsetWidth; s.classList.add('is-enter'); }
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function toast(msg, type = 'info', ms = 3800) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast is-show${type === 'error' ? ' is-error' : type === 'success' ? ' is-success' : ''}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('is-show'), ms);
}

function setUser(session) {
  const wrap = $('#admin-user');
  wrap.hidden = !session;
  $('#admin-email').textContent = session?.user?.email ?? '';
}

/* ---------- Login ---------- */
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#btn-login');
  const err = $('#login-error');
  err.textContent = '';
  btn.disabled = true;
  $('#btn-login-text').textContent = 'Entrando…';
  try {
    const session = await sb.signIn($('#email').value.trim(), $('#password').value);
    setUser(session);
    await openList();
  } catch (ex) {
    console.error('[admin] login', ex);
    err.textContent = 'E-mail ou senha inválidos.';
  } finally {
    btn.disabled = false;
    $('#btn-login-text').textContent = 'Entrar';
  }
});

$('#btn-logout').addEventListener('click', async () => {
  await sb.signOut();
  setUser(null);
  entries = [];
  showScreen('login');
});

/* ---------- Lista ---------- */
async function openList() {
  showScreen('lista');
  const state = $('#list-state');
  state.hidden = false;
  state.className = 'list-state';
  state.textContent = 'Carregando envios…';
  $('#entries').replaceChildren();
  try {
    entries = await sb.listResponses();
    state.hidden = true;
    renderEntries();
  } catch (ex) {
    console.error('[admin] lista', ex);
    state.className = 'list-state is-error';
    state.textContent = 'Não foi possível carregar. Verifique a conexão e as políticas RLS.';
  }
}

function renderEntries() {
  const q = $('#search').value.trim().toLowerCase();
  const rows = q
    ? entries.filter((r) => `${r.nome} ${r.cargo}`.toLowerCase().includes(q))
    : entries;
  $('#list-total').textContent = String(entries.length);

  const state = $('#list-state');
  if (rows.length === 0) {
    state.hidden = false;
    state.className = 'list-state';
    state.textContent = entries.length === 0 ? 'Nenhum envio ainda. Assim que o Aloha responder, aparece aqui.' : 'Nenhum envio encontrado para essa busca.';
  } else {
    state.hidden = true;
  }

  $('#entries').replaceChildren(...rows.map((r, i) =>
    h('button', { type: 'button', class: 'entry', dataset: { id: r.id }, style: `animation-delay:${Math.min(i, 12) * 40}ms` },
      h('div', { class: 'entry-top' },
        h('span', { class: 'avatar' }, initials(r.nome)),
        h('div', {},
          h('div', { class: 'entry-name' }, r.nome),
          h('div', { class: 'entry-cargo' }, r.cargo),
        ),
      ),
      h('div', { class: 'entry-meta' },
        h('span', { class: 'mono' }, fmtDate(r.created_at)),
        h('span', { class: 'chip' }, `${TOTAL_QUESTIONS}/${TOTAL_QUESTIONS} · ${fmtDuration(r.duracao_seg)}`),
      ),
    ),
  ));
}

$('#search').addEventListener('input', renderEntries);
$('#btn-refresh').addEventListener('click', openList);

$('#entries').addEventListener('click', (e) => {
  const card = e.target.closest('.entry');
  if (card) openDetail(card.dataset.id);
});

$('#btn-csv').addEventListener('click', async () => {
  const btn = $('#btn-csv');
  btn.disabled = true;
  try {
    const rows = await sb.getAllResponses();
    download(`aloha-respostas-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows, QUESTIONS), 'text/csv');
    toast(`CSV com ${rows.length} envio(s) gerado.`, 'success');
  } catch (ex) {
    console.error('[admin] csv', ex);
    toast('Falha ao exportar CSV.', 'error');
  } finally {
    btn.disabled = false;
  }
});

/* ---------- Detalhe ---------- */
async function openDetail(id) {
  try {
    current = await sb.getResponse(id);
  } catch (ex) {
    console.error('[admin] detalhe', ex);
    return toast('Não foi possível abrir este envio.', 'error');
  }
  const r = current;
  $('#d-avatar').textContent = initials(r.nome);
  $('#d-nome').textContent = r.nome;
  $('#d-cargo').textContent = r.cargo;
  $('#d-data').textContent = fmtDate(r.created_at);
  $('#d-duracao').textContent = fmtDuration(r.duracao_seg);

  $('#answers').replaceChildren(...QUESTIONS.map((q, i) => {
    const a = (r.respostas?.[q.id] ?? '').trim();
    return h('li', { class: 'answer', style: `animation-delay:${Math.min(i, 10) * 30}ms` },
      h('span', { class: 'n' }, String(i + 1)),
      h('div', {},
        h('div', { class: 'q' }, q.titulo),
        h('div', { class: `a${a ? '' : ' is-empty'}` }, a || 'Sem resposta'),
      ),
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm copy', dataset: { copy: q.id }, title: 'Copiar resposta' }, 'Copiar'),
    );
  }));
  showScreen('detalhe');
}

$('#btn-back').addEventListener('click', () => { current = null; showScreen('lista'); });

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg, 'success');
  } catch {
    toast('Não foi possível copiar. Use "Baixar" como alternativa.', 'error');
  }
}

$('#answers').addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) copyText(current?.respostas?.[b.dataset.copy] ?? '', 'Resposta copiada.');
});

const fileBase = () => `aloha-${slug(current.nome)}-${current.created_at.slice(0, 10)}`;
$('#btn-copy-md').addEventListener('click', () => copyText(toMarkdown(current, QUESTIONS), 'Markdown copiado.'));
$('#btn-dl-md').addEventListener('click', () => download(`${fileBase()}.md`, toMarkdown(current, QUESTIONS), 'text/markdown'));
$('#btn-dl-json').addEventListener('click', () => download(`${fileBase()}.json`, JSON.stringify(current, null, 2), 'application/json'));

/* ---------- Boot ---------- */
(async function boot() {
  const mock = new URLSearchParams(location.search).has('mock');
  if (mock) {
    sb = await import('./mock-client.js');
    toast('Modo demonstração: dados de exemplo, nada é salvo.', 'info', 5000);
    setUser(await sb.getSession());
    return openList();
  }
  if (!isConfigured()) {
    showScreen('login');
    $('#login-config').hidden = false;
    $('#btn-login').disabled = true;
    return;
  }
  try {
    sb = await import('../supabase-client.js');
  } catch (ex) {
    console.error('[admin] supabase', ex);
    showScreen('login');
    $('#login-error').textContent = 'Não foi possível carregar o Supabase. Verifique a conexão.';
    return;
  }
  const session = await sb.getSession();
  setUser(session);
  sb.onAuth((s) => { setUser(s); if (!s) showScreen('login'); });
  if (session) await openList();
  else showScreen('login');
})();
