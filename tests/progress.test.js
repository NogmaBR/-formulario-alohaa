import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAnswered, answeredCount, percent, missingIds, isComplete } from '../js/progress.js';

const IDS = Array.from({ length: 25 }, (_, i) => `q${i + 1}`);
const fill = (n) => Object.fromEntries(IDS.slice(0, n).map((id) => [id, `resposta ${id}`]));

test('isAnswered ignora espaços e valores não-string', () => {
  assert.equal(isAnswered('  '), false);
  assert.equal(isAnswered(''), false);
  assert.equal(isAnswered(undefined), false);
  assert.equal(isAnswered(null), false);
  assert.equal(isAnswered('ok'), true);
  assert.equal(isAnswered('  ok  '), true);
});

test('answeredCount conta só respostas preenchidas', () => {
  assert.equal(answeredCount({ q1: 'a', q2: '', q3: '   ' }), 1);
  assert.equal(answeredCount({}), 0);
  assert.equal(answeredCount(undefined), 0);
});

test('percent é arredondado sobre 25', () => {
  assert.equal(percent(fill(5)), 20);
  assert.equal(percent(fill(0)), 0);
  assert.equal(percent(fill(25)), 100);
  assert.equal(percent(fill(1)), 4);
});

test('missingIds devolve os ids faltantes na ordem', () => {
  const r = { q1: 'a', q3: 'c', q5: '' };
  assert.deepEqual(missingIds(r, ['q1', 'q2', 'q3', 'q4', 'q5']), ['q2', 'q4', 'q5']);
  assert.deepEqual(missingIds(undefined, ['q1']), ['q1']);
});

test('isComplete só com todas respondidas', () => {
  assert.equal(isComplete(fill(24), IDS), false);
  assert.equal(isComplete(fill(25), IDS), true);
});
