// Renderização das telas a partir do estado. Só DOM; nenhuma regra de negócio.
// Todo texto vindo do usuário entra via textContent (nunca como HTML).
import { QUESTIONS, QUESTION_IDS, TOTAL_QUESTIONS } from '../questions.js';
import { isAnswered, answeredCount, percent, missingIds, isComplete } from '../progress.js';

const $ = (sel) => document.querySelector(sel);
const pad = (n) => String(n).padStart(2, '0');

/** Cria elemento: h('button', { class: 'x', dataset: { i: 1 } }, 'texto', childEl) */
function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'hidden') node.hidden = Boolean(v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) {
    if (c == null) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const el = {
  screens: () => document.querySelectorAll('[data-screen]'),
  progressWrap: () => $('#progress-wrap'),
  progressBar: () => $('#progress-bar'),
  progressText: () => $('#progress-text'),
  progressTrack: () => $('#progress-wrap .progress-track'),
  qBadge: () => $('#q-badge'),
  qNumber: () => $('#q-number'),
  qTitle: () => $('#q-title'),
  qHint: () => $('#q-hint'),
  qInput: () => $('#q-input'),
  qCount: () => $('#q-count'),
  qCard: () => $('#q-card'),
  qSaved: () => $('#q-saved'),
  pills: () => $('#pills'),
  drawerList: () => $('#drawer-list'),
  btnPrevText: () => $('#btn-prev span'),
  btnNextText: () => $('#btn-next-text'),
  reviewList: () => $('#review-list'),
  reviewCount: () => $('#review-count'),
  reviewProgress: () => $('#review-progress'),
  reviewMissing: () => $('#review-missing'),
  reviewActions: () => $('.review-actions'),
  reviewCtaTitle: () => $('#review-cta-title'),
  reviewCtaSub: () => $('#review-cta-sub'),
  btnSubmit: () => $('#btn-submit'),
  doneSummary: () => $('#done-summary'),
  toast: () => $('#toast'),
};

/* ---------- Telas ---------- */
export function showScreen(name) {
  el.screens().forEach((s) => {
    const active = s.dataset.screen === name;
    s.hidden = !active;
    s.classList.remove('is-enter');
    if (active) {
      void s.offsetWidth; // reinicia a animação de entrada
      s.classList.add('is-enter');
    }
  });
  el.progressWrap().hidden = !(name === 'pergunta' || name === 'revisao');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ---------- Progresso (header) ---------- */
export function renderProgress(state) {
  const p = percent(state.respostas);
  el.progressBar().style.width = `${p}%`;
  el.progressText().textContent = `${p}% concluído`;
  el.progressTrack().setAttribute('aria-valuenow', String(p));
}

/* ---------- Pergunta ---------- */
export function renderQuestion(state, dir = 0) {
  const i = state.atual;
  const q = QUESTIONS[i];
  const card = el.qCard();

  el.qBadge().textContent = `Questão ${i + 1} de ${TOTAL_QUESTIONS}`;
  el.qNumber().textContent = `${pad(i + 1)}.`;
  el.qTitle().textContent = q.titulo;
  const hint = el.qHint();
  hint.hidden = !q.dica;
  hint.textContent = q.dica ?? '';

  const input = el.qInput();
  input.placeholder = q.placeholder;
  input.value = state.respostas[q.id] ?? '';
  renderCount(input);
  autoGrow(input);

  el.btnPrevText().textContent = i === 0 ? 'Voltar' : 'Anterior';
  el.btnNextText().textContent = state.voltarParaRevisao
    ? 'Voltar à revisão'
    : i === TOTAL_QUESTIONS - 1 ? 'Revisar respostas' : 'Próximo';

  card.classList.remove('is-slide-left', 'is-slide-right');
  if (dir !== 0) {
    void card.offsetWidth;
    card.classList.add(dir > 0 ? 'is-slide-left' : 'is-slide-right');
  }
}

export function renderCount(input) {
  const n = input.value.length;
  const max = Number(input.maxLength) || 4000;
  const c = el.qCount();
  c.textContent = `${n} / ${max}`;
  c.classList.toggle('is-near', n > max * 0.9);
}

export function autoGrow(input) {
  input.style.height = 'auto';
  input.style.height = `${Math.max(input.scrollHeight, 152)}px`;
}

export function flashSaved() {
  const s = el.qSaved();
  s.classList.add('is-flash');
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => s.classList.remove('is-flash'), 900);
}

/* ---------- Navegação por questão (pílulas + drawer) ---------- */
export function renderPills(state) {
  const pills = [];
  const items = [];

  QUESTIONS.forEach((q, i) => {
    const done = isAnswered(state.respostas[q.id]);
    const current = i === state.atual;
    const cls = `${done ? ' is-done' : ''}${current ? ' is-current' : ''}`;

    pills.push(h('button', {
      type: 'button',
      class: `pill${cls}`,
      dataset: { index: i },
      title: q.titulo,
      'aria-label': `Questão ${i + 1}${done ? ', respondida' : ''}`,
      'aria-current': current ? 'step' : null,
    }, String(i + 1)));

    items.push(h('li', {},
      h('button', { type: 'button', class: `drawer-item${cls}`, dataset: { index: i } },
        h('span', { class: 'n' }, String(i + 1)),
        h('span', { class: 't' }, q.titulo),
        h('span', { class: 's' }, done ? 'Feita' : current ? 'Atual' : 'Vazia'),
      ),
    ));
  });

  el.pills().replaceChildren(...pills);
  el.drawerList().replaceChildren(...items);

  // mantém a pílula atual visível na faixa rolável
  el.pills().querySelector('.is-current')
    ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

/* ---------- Revisão ---------- */
export function renderReview(state) {
  const missing = missingIds(state.respostas, QUESTION_IDS);
  const done = answeredCount(state.respostas);

  const items = QUESTIONS.map((q, i) => {
    const text = state.respostas[q.id] ?? '';
    const answered = isAnswered(text);
    return h('li', { class: `review-item${answered ? '' : ' is-missing'}`, id: `review-${q.id}` },
      h('span', { class: 'n' }, String(i + 1)),
      h('div', {},
        h('div', { class: 'q' }, q.titulo),
        h('div', { class: 'a' }, answered ? text : 'Sem resposta'),
        h('div', { class: 'tools' },
          h('button', { type: 'button', class: `btn ${answered ? 'btn-ghost' : 'btn-primary'} btn-sm`, dataset: { edit: i } },
            answered ? 'Editar' : 'Responder'),
          h('button', { type: 'button', class: 'btn-link', dataset: { expand: '' }, hidden: true }, 'Ver tudo'),
        ),
      ),
    );
  });
  const list = el.reviewList();
  list.replaceChildren(...items);

  // colapsa respostas longas (precisa estar no DOM para medir)
  list.querySelectorAll('.review-item .a').forEach((a) => {
    if (a.scrollHeight > a.clientHeight + 4) {
      a.classList.add('is-clamped');
      a.parentElement.querySelector('[data-expand]').hidden = false;
    }
  });

  el.reviewCount().textContent = `${done}/${TOTAL_QUESTIONS}`;
  el.reviewProgress().style.width = `${percent(state.respostas)}%`;
  const rm = el.reviewMissing();
  rm.hidden = missing.length === 0;
  rm.textContent = missing.length === 1 ? 'Falta 1 resposta' : `Faltam ${missing.length} respostas`;

  const complete = isComplete(state.respostas, QUESTION_IDS);
  el.btnSubmit().disabled = !complete;
  el.reviewActions().classList.toggle('is-blocked', !complete);
  el.reviewCtaTitle().textContent = complete ? 'Tudo pronto?' : 'Ainda faltam respostas';
  el.reviewCtaSub().textContent = complete
    ? 'Ao enviar, suas respostas vão direto para a equipe Nogma.'
    : 'Responda as questões marcadas em vermelho para liberar o envio.';
}

/* ---------- Enviado ---------- */
export function renderDone(state, meta = {}) {
  const when = new Date(meta.enviadoEm ?? Date.now());
  const rows = [
    ['Nome', state.nome],
    ['Cargo', state.cargo],
    ['Enviado em', when.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })],
    ['Respostas', `${answeredCount(state.respostas)}/${TOTAL_QUESTIONS}`],
  ];
  el.doneSummary().replaceChildren(
    ...rows.map(([k, v]) => h('div', { class: 'row' }, h('span', {}, k), h('strong', {}, v))),
  );
}

/* ---------- Toast ---------- */
export function toast(msg, type = 'info', ms = 4200) {
  const t = el.toast();
  t.textContent = msg;
  t.className = `toast is-show${type === 'error' ? ' is-error' : type === 'success' ? ' is-success' : ''}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('is-show'), ms);
}
