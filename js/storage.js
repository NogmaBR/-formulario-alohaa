// Persistência do progresso do formulário em localStorage.
// O `store` é injetável para testes fora do navegador.

export const KEY = 'aloha-form-v1';

export const emptyState = () => ({
  nome: '',
  cargo: '',
  respostas: {},
  atual: 0,          // índice da pergunta atual (0..24)
  iniciadoEm: null,  // timestamp de quando começou a responder
  tela: 'capa',      // capa | identificacao | pergunta | revisao
});

export function loadState(store = globalThis.localStorage) {
  try {
    const raw = store.getItem(KEY);
    return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state, store = globalThis.localStorage) {
  try {
    store.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(store = globalThis.localStorage) {
  try { store.removeItem(KEY); } catch { /* storage indisponível: ignora */ }
}

/** Há algo que valha a pena retomar? */
export const hasProgress = (s) => Boolean(s.nome) || Object.keys(s.respostas ?? {}).length > 0;
