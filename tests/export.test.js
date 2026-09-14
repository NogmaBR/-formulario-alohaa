import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMarkdown, toCSV, csvCell } from '../js/admin/export.js';
import { QUESTIONS } from '../js/questions.js';

const row = {
  id: 'abc-123',
  created_at: '2026-09-14T18:05:00.000Z',
  nome: 'Ana Souza',
  cargo: 'Sócia',
  duracao_seg: 754,
  respostas: Object.fromEntries(QUESTIONS.map((q, i) => [q.id, `Resposta ${i + 1}`])),
};

test('toMarkdown traz cabeçalho e as 25 seções na ordem', () => {
  const md = toMarkdown(row, QUESTIONS);
  assert.match(md, /^# Aloha Recovery — Respostas/);
  assert.match(md, /\*\*Nome:\*\* Ana Souza/);
  assert.match(md, /\*\*Cargo:\*\* Sócia/);
  const headings = [...md.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]));
  assert.deepEqual(headings, Array.from({ length: 25 }, (_, i) => i + 1));
  assert.ok(md.indexOf('Resposta 1') < md.indexOf('Resposta 25'));
});

test('toMarkdown marca resposta vazia', () => {
  const md = toMarkdown({ ...row, respostas: { ...row.respostas, q3: '' } }, QUESTIONS);
  assert.match(md, /## 3\. [^\n]+\n\n_\(sem resposta\)_/);
});

test('csvCell escapa aspas, vírgulas e quebras de linha', () => {
  assert.equal(csvCell('simples'), 'simples');
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('diz "oi"'), '"diz ""oi"""');
  assert.equal(csvCell('linha1\nlinha2'), '"linha1\nlinha2"');
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(42), '42');
});

test('toCSV gera cabeçalho fixo e uma linha por envio', () => {
  const csv = toCSV([row, { ...row, id: 'def-456', nome: 'Bia, a "B"' }], QUESTIONS);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], 'id,created_at,nome,cargo,duracao_seg,' + QUESTIONS.map((q) => q.id).join(','));
  assert.equal(lines.length, 3);
  assert.ok(lines[1].startsWith('abc-123,2026-09-14T18:05:00.000Z,Ana Souza,Sócia,754,Resposta 1,'));
  assert.ok(lines[2].includes('"Bia, a ""B"""'));
});

test('toCSV com lista vazia devolve só o cabeçalho', () => {
  assert.equal(toCSV([], QUESTIONS).split('\r\n').length, 1);
});
