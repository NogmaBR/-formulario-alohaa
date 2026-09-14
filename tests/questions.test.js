import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, QUESTION_IDS } from '../js/questions.js';

test('existem exatamente 25 perguntas', () => {
  assert.equal(QUESTIONS.length, 25);
});

test('ids são q1..q25, únicos e em ordem', () => {
  const ids = QUESTIONS.map((q) => q.id);
  assert.deepEqual(ids, Array.from({ length: 25 }, (_, i) => `q${i + 1}`));
  assert.deepEqual(QUESTION_IDS, ids);
});

test('toda pergunta tem título e placeholder não vazios', () => {
  for (const q of QUESTIONS) {
    assert.ok(q.titulo.trim().length > 10, `${q.id} sem título`);
    assert.ok(q.placeholder.trim().length > 0, `${q.id} sem placeholder`);
  }
});

test('primeira e última perguntas batem com o formulário original', () => {
  assert.match(QUESTIONS[0].titulo, /tom da Aloha/);
  assert.match(QUESTIONS[24].titulo, /nome do agente/);
});
