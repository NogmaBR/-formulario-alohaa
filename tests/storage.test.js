import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEY, emptyState, loadState, saveState, clearState, hasProgress } from '../js/storage.js';

// Fake de localStorage: mesma interface, sem browser.
const fakeStore = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};

test('loadState sem nada salvo devolve emptyState', () => {
  assert.deepEqual(loadState(fakeStore()), emptyState());
});

test('saveState + loadState fazem roundtrip', () => {
  const store = fakeStore();
  const s = { ...emptyState(), nome: 'Ana', cargo: 'Sócia', respostas: { q1: 'x' }, atual: 3 };
  assert.equal(saveState(s, store), true);
  assert.deepEqual(loadState(store), s);
});

test('loadState com JSON corrompido devolve emptyState', () => {
  const store = fakeStore();
  store.setItem(KEY, '{nope');
  assert.deepEqual(loadState(store), emptyState());
});

test('loadState preenche campos ausentes com defaults', () => {
  const store = fakeStore();
  store.setItem(KEY, JSON.stringify({ nome: 'Ana' }));
  const s = loadState(store);
  assert.equal(s.nome, 'Ana');
  assert.deepEqual(s.respostas, {});
  assert.equal(s.atual, 0);
});

test('clearState remove e saveState tolera store quebrado', () => {
  const store = fakeStore();
  saveState(emptyState(), store);
  clearState(store);
  assert.equal(store.getItem(KEY), null);
  const broken = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('x'); } };
  assert.equal(saveState(emptyState(), broken), false);
  assert.deepEqual(loadState(broken), emptyState());
  assert.doesNotThrow(() => clearState(broken));
});

test('hasProgress detecta nome ou respostas', () => {
  assert.equal(hasProgress(emptyState()), false);
  assert.equal(hasProgress({ ...emptyState(), nome: 'Ana' }), true);
  assert.equal(hasProgress({ ...emptyState(), respostas: { q1: 'a' } }), true);
});
