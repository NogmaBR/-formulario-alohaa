// Orquestração do formulário: estado, transições e handlers.
import { QUESTIONS, QUESTION_IDS, TOTAL_QUESTIONS } from '../questions.js';
import { loadState, saveState, clearState, emptyState, hasProgress } from '../storage.js';
import { isComplete } from '../progress.js';
import {
  showScreen, renderProgress, renderQuestion, renderCount, autoGrow, flashSaved,
  renderPills, renderReview, renderDone, toast,
} from './render.js';

const $ = (sel) => document.querySelector(sel);

let state = loadState();
let tela = 'capa';

/* ---------- Persistência + re-render ---------- */
function commit() {
  state.tela = tela;
  saveState(state);
}

function goto(name, opts = {}) {
  tela = name;
  showScreen(name); // antes do render: a revisão mede alturas e precisa estar visível
  if (name === 'pergunta') {
    renderQuestion(state, opts.dir ?? 0);
    renderPills(state);
    renderProgress(state);
  } else if (name === 'revisao') {
    renderProgress(state);
    renderReview(state);
  } else if (name === 'capa') {
    renderCover();
  }
  commit();
  if (name === 'pergunta' && opts.focus !== false) {
    // foco só no desktop: no mobile abriria o teclado a cada troca
    if (window.matchMedia('(min-width: 768px)').matches) $('#q-input').focus({ preventScroll: true });
  }
}

function renderCover() {
  const resume = hasProgress(state);
  $('#btn-start-text').textContent = resume ? 'Continuar de onde parei' : 'Começar o formulário';
  $('#btn-restart').hidden = !resume;
}

/* ---------- Capa ---------- */
$('#btn-start').addEventListener('click', () => {
  if (state.nome && state.cargo) goto('pergunta');
  else goto('identificacao');
});
$('#btn-restart').addEventListener('click', () => {
  clearState();
  state = emptyState();
  $('#nome').value = '';
  $('#cargo').value = '';
  renderCover();
  toast('Formulário reiniciado.');
});
$('#brand-home').addEventListener('click', (e) => { e.preventDefault(); if (tela !== 'enviado') goto('capa'); });

/* ---------- Identificação ---------- */
const formIdent = $('#form-ident');
function validateField(id) {
  const input = $(`#${id}`);
  const field = input.closest('.field');
  const ok = input.value.trim().length >= 2;
  field.classList.toggle('is-invalid', !ok);
  $(`#${id}-error`).textContent = ok ? '' : 'Preencha com pelo menos 2 caracteres.';
  return ok;
}
['nome', 'cargo'].forEach((id) => {
  $(`#${id}`).addEventListener('input', () => { if ($(`#${id}`).closest('.field').classList.contains('is-invalid')) validateField(id); });
});
formIdent.addEventListener('submit', (e) => {
  e.preventDefault();
  const okNome = validateField('nome');
  const okCargo = validateField('cargo');
  if (!okNome) return $('#nome').focus();
  if (!okCargo) return $('#cargo').focus();
  state.nome = $('#nome').value.trim();
  state.cargo = $('#cargo').value.trim();
  if (!state.iniciadoEm) state.iniciadoEm = Date.now();
  goto('pergunta');
});
$('#btn-ident-back').addEventListener('click', () => goto('capa'));

/* ---------- Pergunta ---------- */
const input = $('#q-input');
let saveTimer = null;

input.addEventListener('input', () => {
  const id = QUESTION_IDS[state.atual];
  state.respostas[id] = input.value;
  renderCount(input);
  autoGrow(input);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    commit();
    renderProgress(state);
    renderPills(state);
    flashSaved();
  }, 300);
});

function flushSave() {
  clearTimeout(saveTimer);
  commit();
}

function next() {
  flushSave();
  if (state.voltarParaRevisao) {
    state.voltarParaRevisao = false;
    return goto('revisao');
  }
  if (state.atual >= TOTAL_QUESTIONS - 1) return goto('revisao');
  state.atual += 1;
  goto('pergunta', { dir: 1 });
}

function prev() {
  flushSave();
  if (state.voltarParaRevisao) {
    state.voltarParaRevisao = false;
    return goto('revisao');
  }
  if (state.atual === 0) return goto('identificacao');
  state.atual -= 1;
  goto('pergunta', { dir: -1 });
}

function jumpTo(i) {
  if (i === state.atual) return;
  flushSave();
  const dir = i > state.atual ? 1 : -1;
  state.atual = i;
  goto('pergunta', { dir });
}

$('#btn-next').addEventListener('click', next);
$('#btn-prev').addEventListener('click', prev);
$('#btn-review-jump').addEventListener('click', () => { flushSave(); goto('revisao'); });
$('#btn-to-cover').addEventListener('click', () => { flushSave(); goto('capa'); });

$('#pills').addEventListener('click', (e) => {
  const b = e.target.closest('.pill');
  if (b) jumpTo(Number(b.dataset.index));
});

// Ctrl/Cmd + Enter avança
input.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); next(); }
});

/* ---------- Drawer (mobile) ---------- */
const drawer = $('#drawer');
function openDrawer() {
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  drawer.querySelector('.drawer-item.is-current')?.scrollIntoView({ block: 'center' });
  drawer.querySelector('.drawer-item.is-current')?.focus();
}
function closeDrawer() {
  drawer.hidden = true;
  document.body.style.overflow = '';
}
$('#btn-drawer').addEventListener('click', openDrawer);
drawer.addEventListener('click', (e) => {
  if (e.target.closest('[data-drawer-close]')) return closeDrawer();
  const item = e.target.closest('.drawer-item');
  if (item) { closeDrawer(); jumpTo(Number(item.dataset.index)); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
});

/* ---------- Revisão ---------- */
$('#review-list').addEventListener('click', (e) => {
  const edit = e.target.closest('[data-edit]');
  if (edit) {
    state.voltarParaRevisao = true;
    state.atual = Number(edit.dataset.edit);
    return goto('pergunta');
  }
  const expand = e.target.closest('[data-expand]');
  if (expand) {
    const a = expand.closest('.review-item').querySelector('.a');
    const open = a.classList.toggle('is-open');
    a.classList.toggle('is-clamped', !open);
    expand.textContent = open ? 'Ver menos' : 'Ver tudo';
  }
});

$('#btn-submit').addEventListener('click', async () => {
  if (!isComplete(state.respostas, QUESTION_IDS)) return;
  // Fase 2: envio real ao Supabase. Por ora apenas simula.
  const btn = $('#btn-submit');
  btn.disabled = true;
  $('#btn-submit-text').textContent = 'Enviando…';
  console.log('[aloha-form] payload', { nome: state.nome, cargo: state.cargo, respostas: state.respostas });
  await new Promise((r) => setTimeout(r, 600));
  renderDone(state, { enviadoEm: Date.now() });
  tela = 'enviado';
  showScreen('enviado');
  clearState();
});

/* ---------- Atalho global: Enter na capa ---------- */
document.addEventListener('keydown', (e) => {
  if (tela === 'capa' && e.key === 'Enter' && !e.target.closest('button, a')) $('#btn-start').click();
});

/* ---------- Boot ---------- */
(function boot() {
  $('#nome').value = state.nome;
  $('#cargo').value = state.cargo;
  renderProgress(state);
  // Retoma na tela em que parou, exceto se estava na capa/enviado.
  const resume = hasProgress(state) && (state.tela === 'pergunta' || state.tela === 'revisao');
  goto(resume ? state.tela : 'capa', { focus: false });
})();
