// Lógica pura de progresso/completude. Sem DOM, sem side effects.

import { TOTAL_QUESTIONS } from './questions.js';

export const TOTAL = TOTAL_QUESTIONS;

/** Uma resposta conta como dada quando tem algo além de espaços. */
export const isAnswered = (t) => typeof t === 'string' && t.trim().length > 0;

export const answeredCount = (respostas = {}) =>
  Object.values(respostas ?? {}).filter(isAnswered).length;

export const percent = (respostas) =>
  Math.round((answeredCount(respostas) / TOTAL) * 100);

/** Ids ainda sem resposta, na ordem recebida. */
export const missingIds = (respostas = {}, ids) =>
  ids.filter((id) => !isAnswered((respostas ?? {})[id]));

export const isComplete = (respostas, ids) => missingIds(respostas, ids).length === 0;
