// Exportação de envios: Markdown (para alimentar o agente) e CSV (planilha).
// Funções puras, sem DOM, exceto download().

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const fmtDuration = (seg) => {
  if (seg == null) return '—';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m ? `${m} min ${s ? `${s} s` : ''}`.trim() : `${s} s`;
};

/** Um envio em Markdown pronto para leitura ou para virar contexto do agente. */
export function toMarkdown(row, questions) {
  const head = [
    '# Aloha Recovery — Respostas do formulário',
    '',
    `**Nome:** ${row.nome}  `,
    `**Cargo:** ${row.cargo}  `,
    `**Data:** ${fmtDate(row.created_at)}  `,
    `**Duração:** ${fmtDuration(row.duracao_seg)}`,
    '',
    '---',
    '',
  ];
  const body = questions.flatMap((q, i) => {
    const a = (row.respostas?.[q.id] ?? '').trim();
    return [`## ${i + 1}. ${q.titulo}`, '', a || '_(sem resposta)_', ''];
  });
  return [...head, ...body].join('\n');
}

/** Escapa um valor para CSV (RFC 4180). */
export function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Todos os envios em CSV: metadados + q1..q25. */
export function toCSV(rows, questions) {
  const header = ['id', 'created_at', 'nome', 'cargo', 'duracao_seg', ...questions.map((q) => q.id)];
  const lines = rows.map((r) => [
    r.id, r.created_at, r.nome, r.cargo, r.duracao_seg,
    ...questions.map((q) => r.respostas?.[q.id] ?? ''),
  ].map(csvCell).join(','));
  return [header.join(','), ...lines].join('\r\n');
}

/** Dispara download de texto no navegador. */
export function download(filename, text, mime = 'text/plain') {
  const blob = new Blob(['﻿' + text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nome de arquivo seguro: "ana-souza-2026-09-14". */
export const slug = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
