# Formulário Aloha Recovery — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formulário de 25 perguntas (web + mobile) com capa, navegação por questão, revisão e envio ao Supabase, mais painel admin para a Nogma ler/exportar as respostas.

**Architecture:** Site estático (HTML/CSS/JS ES modules) servido pelo GitHub Pages. Estado do formulário em memória + `localStorage`; envio único via `supabase-js` (CDN) numa tabela `respostas` protegida por RLS (anon = insert, authenticated = select). Painel admin é uma segunda página que autentica via Supabase Auth e lê a mesma tabela.

**Tech Stack:** HTML5, CSS custom properties, JavaScript ES2022 modules, `@supabase/supabase-js@2` (CDN), Google Fonts, `node --test` para lógica pura.

**Spec:** `docs/superpowers/specs/2026-09-14-formulario-aloha-design.md`

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Marcação das 5 telas do formulário (capa, identificação, pergunta, revisão, enviado) + header/footer |
| `admin.html` | Marcação do painel (login, lista, detalhe) |
| `css/tokens.css` | Variáveis de design (cores, raios, sombras, fontes) |
| `css/base.css` | Reset, tipografia, header/footer, grafismos de fundo, botões, utilitários, animações |
| `css/form.css` | Telas do formulário: capa, card de pergunta, pílulas, drawer mobile, revisão |
| `css/admin.css` | Login, lista de envios, detalhe |
| `js/config.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `js/questions.js` | Array `QUESTIONS` (25) `{ id, titulo, dica, placeholder }` |
| `js/storage.js` | `loadState()`, `saveState()`, `clearState()`, `emptyState()` sobre `localStorage` (injetável p/ teste) |
| `js/progress.js` | Lógica pura: `isAnswered(text)`, `answeredCount(respostas)`, `percent(respostas)`, `missingIds(respostas, ids)`, `isComplete(respostas, ids)` |
| `js/supabase-client.js` | Cria o client uma vez; `submitResponse(payload)`, `signIn`, `signOut`, `getSession`, `onAuth`, `listResponses`, `getResponse`, `getAllResponses` |
| `js/form/app.js` | Orquestra: estado, troca de telas, handlers de botões |
| `js/form/render.js` | Funções que desenham cada tela a partir do estado (pergunta atual, pílulas, revisão, progresso) |
| `js/admin/app.js` | Login, lista, detalhe |
| `js/admin/export.js` | `toMarkdown(row, questions)`, `toCSV(rows, questions)`, `download(filename, text, mime)` |
| `assets/` | `nogma-wordmark.png`, `nogma-n.png`, `curva-1.svg`, `curva-2.svg`, `curva-3.svg`, `favicon.png` |
| `supabase/schema.sql` | Tabela + RLS + políticas |
| `tests/*.test.js` | `progress.test.js`, `storage.test.js`, `export.test.js`, `questions.test.js` |
| `README.md` | Setup Supabase + deploy Pages |

## Fases

- **Fase 0 — Fundação**: git, estrutura, assets, tokens, perguntas, testes de lógica.
- **Fase 1 — Formulário (front)**: capa → identificação → perguntas → revisão → enviado, tudo funcionando com `localStorage`, sem backend.
- **Fase 2 — Backend**: schema Supabase, client, envio real, tratamento de erro.
- **Fase 3 — Painel admin**: login, lista, detalhe, exportações.
- **Fase 4 — Polimento e deploy**: responsividade, animações, acessibilidade, README, GitHub Pages.

---

## Fase 0 — Fundação

### Task 0.1: Repositório e estrutura

**Files:** Create `.gitignore`, `package.json`, pastas `css/ js/form js/admin assets supabase tests`.

- [ ] `git init`, branch `main`.
- [ ] `.gitignore`: `node_modules/`, `.DS_Store`, `Thumbs.db`, `*.log`, `docs/referencia/PROPOSTA-EMPRESA/`.
- [ ] `package.json` mínimo: `{ "name": "formulario-aloha", "private": true, "type": "module", "scripts": { "test": "node --test tests/" } }`
- [ ] Mover as pastas de referência (`CODE-BASE`, `FORMMULARIO`, `LOGOS`, `PROPOSTA-EMPRESA`) para `docs/referencia/` para o repositório ficar limpo (o PDF da proposta de 8MB fica fora do git).
- [ ] Commit: `chore: estrutura inicial do projeto`

### Task 0.2: Assets

- [ ] Copiar `LOGOS/logo-22 (1) (1).png` → `assets/nogma-wordmark.png`; `LOGOS/isotype-n-lime.png` → `assets/nogma-n.png` e também `assets/favicon.png`.
- [ ] Criar 3 SVGs de curvas em lime (`stroke="#ccff00" stroke-width="28" fill="none" stroke-linecap="round"`), paths orgânicos tipo espiral/loop, viewBox 400x400, para usar como grafismos de fundo.
- [ ] Commit: `feat: assets da marca Nogma`

### Task 0.3: Perguntas

**Files:** Create `js/questions.js`, `tests/questions.test.js`.

- [ ] Teste: `QUESTIONS.length === 25`; ids `q1..q25` únicos e em ordem; todo item tem `titulo` não vazio e `placeholder` não vazio.
- [ ] Rodar `npm test` → falha (módulo não existe).
- [ ] Implementar `QUESTIONS` com os 25 títulos exatos do PDF (ver spec §4), `dica` quando o original traz exemplo entre parênteses, `placeholder` curto e útil por pergunta.
- [ ] `npm test` → passa. Commit: `feat: 25 perguntas do formulário`

### Task 0.4: Lógica de progresso

**Files:** Create `js/progress.js`, `tests/progress.test.js`.

```js
// js/progress.js
export const TOTAL = 25;
export const isAnswered = (t) => typeof t === 'string' && t.trim().length > 0;
export const answeredCount = (r = {}) => Object.values(r).filter(isAnswered).length;
export const percent = (r) => Math.round((answeredCount(r) / TOTAL) * 100);
export const missingIds = (r = {}, ids) => ids.filter((id) => !isAnswered(r[id]));
export const isComplete = (r, ids) => missingIds(r, ids).length === 0;
```

- [ ] Testes: `isAnswered('  ')` false; `answeredCount({q1:'a',q2:''})` 1; `percent` com 5 respostas = 20; `missingIds` retorna ids na ordem; `isComplete` true só com 25.
- [ ] Rodar → falha → implementar → passa. Commit: `feat: lógica de progresso e completude`

### Task 0.5: Storage

**Files:** Create `js/storage.js`, `tests/storage.test.js`.

```js
// js/storage.js
export const KEY = 'aloha-form-v1';
export const emptyState = () => ({ nome: '', cargo: '', respostas: {}, atual: 0, iniciadoEm: null, tela: 'capa' });
export function loadState(store = globalThis.localStorage) {
  try { const raw = store.getItem(KEY); return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState(); }
  catch { return emptyState(); }
}
export function saveState(state, store = globalThis.localStorage) {
  try { store.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function clearState(store = globalThis.localStorage) { try { store.removeItem(KEY); } catch {} }
export const hasProgress = (s) => Boolean(s.nome) || Object.keys(s.respostas).length > 0;
```

- [ ] Testes com um fake (`getItem/setItem/removeItem` sobre um `Map`): load vazio devolve `emptyState()`; save+load faz roundtrip; JSON corrompido devolve `emptyState()`; `hasProgress`.
- [ ] Rodar → falha → implementar → passa. Commit: `feat: persistência local do formulário`

### Task 0.6: Tokens e base CSS

**Files:** Create `css/tokens.css`, `css/base.css`.

- [ ] `tokens.css`: `:root { --bg:#07080a; --surface:#101216; --surface-2:#121418; --border:rgba(255,255,255,.08); --lime:#ccff00; --lime-hover:#b8e600; --lime-glow:rgba(204,255,0,.35); --text:#f3f4f6; --muted:#8e96a4; --danger:#ff5c5c; --r-card:24px; --r-btn:14px; --font:'Plus Jakarta Sans',system-ui,sans-serif; --font-display:'Space Grotesk',var(--font); --ease:cubic-bezier(.16,1,.3,1); }`
- [ ] `base.css`: reset, `body` (bg, font, min-height 100dvh, grid rows header/main/footer), `.bg-art` (fixo, mesh-gradient + 3 `<img>` das curvas com `float` animado), `.header` (sticky, blur, logo, progresso, isotipo), `.footer`, `.btn` / `.btn-primary` (lime, glow, hover translateY) / `.btn-ghost`, `.badge`, `.card`, `.sr-only`, `@keyframes fadeIn, float, pulse`, `@media (prefers-reduced-motion) { * { animation: none !important; transition: none !important } }`.
- [ ] Commit: `feat: design tokens e estilos base`

---

## Fase 1 — Formulário (front)

### Task 1.1: index.html com as 5 telas

**Files:** Create `index.html`.

- [ ] Head: meta viewport, título "Aloha Recovery · Formulário Nogma", favicon, preconnect + fontes, `css/tokens.css`, `css/base.css`, `css/form.css`.
- [ ] Body: `.bg-art` → `header.header` (logo, `#progress-wrap` oculto, isotipo) → `main#app` com `section[data-screen=capa|identificacao|pergunta|revisao|enviado]` (todas `hidden` exceto capa) → `footer` → `<div id="toast">` → `<div id="drawer">` (mobile) → `<script type="module" src="js/form/app.js">`.
- [ ] Marcação de cada tela conforme spec §3 (ids: `#btn-start`, `#btn-restart`, `#form-ident` com `#nome #cargo`, `#q-number #q-title #q-hint #q-input #q-count`, `#pills`, `#btn-prev #btn-next`, `#review-list #review-count #btn-submit`, `#done-summary`).
- [ ] Commit: `feat: marcação das telas do formulário`

### Task 1.2: form.css

**Files:** Create `css/form.css`.

- [ ] Capa: `.hero` centralizada, h1 `clamp(2.4rem,6vw,4.2rem)`, destaque `.hero-accent` lime com text-shadow glow, grid 3 stats, CTA.
- [ ] Identificação: card com 2 inputs (`.field` + `label`), validação `.field.is-invalid`.
- [ ] Pergunta: `.q-card` (padding `clamp(1.25rem,4vw,2.5rem)`), `.q-number` display font 2.5rem lime/80%, `.q-title` `clamp(1.25rem,3vw,1.9rem)`, `.q-hint`, `textarea.q-input` (bg `rgba(255,255,255,.03)`, border, radius 16, focus glow lime, auto-grow via JS), `.q-count`, `.q-actions` flex space-between.
- [ ] Pílulas: `.pills` flex gap .4rem overflow-x auto scrollbar fina; `.pill` 36x36 radius 999; `.pill.is-done` bg lime texto preto com ✓; `.pill.is-current` border lime + `animation: pulse`; `.pill` padrão bg `rgba(255,255,255,.05)`.
- [ ] Mobile (`max-width: 767px`): esconde `.pills`, mostra `#btn-drawer`; `#drawer` bottom-sheet com lista `.drawer-item` (número, trecho, estado).
- [ ] Revisão: `.review-item` (número, pergunta em lime pequeno, resposta `white-space: pre-wrap` colapsável `.is-collapsed` max-height 9em + fade), `.review-item.is-missing` border `--danger`, `.review-bar`.
- [ ] Enviado: `.done-icon` 80px radius 24 glow, resumo em card.
- [ ] Transições: `[data-screen].is-enter { animation: fadeIn .35s var(--ease) }`; troca de pergunta `.q-card.is-slide-left/right`.
- [ ] Commit: `feat: estilos das telas do formulário`

### Task 1.3: render.js

**Files:** Create `js/form/render.js`.

Exporta funções de DOM (recebem estado + elementos):
- `showScreen(name)` — alterna `hidden`, adiciona `.is-enter`, mostra/oculta `#progress-wrap` e o botão do drawer (só em `pergunta`), `scrollTo(0,0)`.
- `renderProgress(state)` — width da barra + texto `${percent}% concluído`.
- `renderQuestion(state, dir)` — preenche número, título, dica, placeholder, valor, contador; anima slide.
- `renderPills(state)` — 25 botões com classes por estado, `aria-current`, `title` com a pergunta; também popula o drawer.
- `renderReview(state)` — lista 25 itens; contador; habilita `#btn-submit` só se `isComplete`.
- `renderDone(state, meta)` — resumo.
- `toast(msg, type)` — 4s.

- [ ] Implementar. Commit: `feat: renderização das telas`

### Task 1.4: app.js (orquestração)

**Files:** Create `js/form/app.js`.

- [ ] Carrega `state = loadState()`; se `hasProgress`, botão da capa vira "Continuar de onde parei" e mostra `#btn-restart`.
- [ ] Handlers: start (→ identificação ou → pergunta se nome já existe), restart (`clearState`, `emptyState`), submit da identificação (valida ≥2 chars, salva, `iniciadoEm = Date.now()` se null, → pergunta), `input` na textarea (debounce 300ms → `state.respostas[id]`, `saveState`, `renderProgress`, `renderPills`, pisca "Salvo"), prev/next (limites: Q1 ← volta para identificação; Q25 → revisão), clique em pílula/drawer (`state.atual = i`), `Ctrl/Cmd+Enter` = next, revisão "Editar/Responder" (`state.voltarParaRevisao = true` → ao clicar Próximo/Voltar volta para revisão), `#btn-submit` (Fase 2; por ora `console.log`).
- [ ] Toda mudança de estado passa por `commit()` que faz `saveState` + re-render da tela ativa.
- [ ] Verificar no navegador (desktop 1440 e mobile 390): fluxo completo, reload mantém questão, pílulas mudam estado, revisão bloqueia com faltantes.
- [ ] Commit: `feat: fluxo completo do formulário com autosave`

---

## Fase 2 — Backend Supabase

### Task 2.1: schema.sql

**Files:** Create `supabase/schema.sql`.

```sql
create table if not exists public.respostas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  cargo text not null,
  respostas jsonb not null,
  duracao_seg integer,
  user_agent text
);
alter table public.respostas enable row level security;
create policy "anon pode inserir" on public.respostas for insert to anon with check (true);
create policy "autenticado pode ler" on public.respostas for select to authenticated using (true);
create index if not exists respostas_created_at_idx on public.respostas (created_at desc);
```

- [ ] Commit: `feat: schema Supabase com RLS`

### Task 2.2: config.js + supabase-client.js

**Files:** Create `js/config.js`, `js/supabase-client.js`.

- [ ] `config.js`: `export const SUPABASE_URL = 'COLE_AQUI'; export const SUPABASE_ANON_KEY = 'COLE_AQUI';` + `export const isConfigured = () => !SUPABASE_URL.includes('COLE_AQUI')`.
- [ ] `supabase-client.js`: `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'`; `getClient()` lazy singleton; `submitResponse({nome,cargo,respostas,duracao_seg,user_agent})` → `insert` sem `select` (anon não pode ler); `signIn(email,password)`, `signOut()`, `getSession()`, `onAuth(cb)`, `listResponses()` (select `id,created_at,nome,cargo,duracao_seg` order desc), `getResponse(id)`, `getAllResponses()`.
- [ ] Commit: `feat: cliente Supabase`

### Task 2.3: Envio real

**Files:** Modify `js/form/app.js`.

- [ ] `#btn-submit`: se `!isConfigured()` → toast "Envio não configurado"; senão loading (`disabled`, texto "Enviando…"), `duracao_seg = round((Date.now()-iniciadoEm)/1000)`, `await submitResponse(...)`; sucesso → `renderDone`, `showScreen('enviado')`, `clearState()`; erro → toast vermelho, restaura botão.
- [ ] Testar com projeto Supabase real (usuário cria e cola chaves). Confirmar linha na tabela.
- [ ] Commit: `feat: envio das respostas ao Supabase`

---

## Fase 3 — Painel admin

### Task 3.1: export.js + testes

**Files:** Create `js/admin/export.js`, `tests/export.test.js`.

- [ ] `toMarkdown(row, questions)` → `# Aloha Recovery — Respostas`, `**Nome:**`, `**Cargo:**`, `**Data:**`, depois `## 1. <titulo>` + resposta para cada pergunta. `toCSV(rows, questions)` → cabeçalho `id,created_at,nome,cargo,duracao_seg,q1..q25`, valores com aspas escapadas (`"` → `""`), quebras de linha preservadas. `download(filename, text, mime)` cria Blob + `<a download>`.
- [ ] Testes: markdown contém as 25 seções na ordem; CSV escapa aspas e vírgulas; linha por envio.
- [ ] Commit: `feat: exportação Markdown e CSV`

### Task 3.2: admin.html + admin.css

**Files:** Create `admin.html`, `css/admin.css`.

- [ ] Telas: `[data-screen=login]` (card com e-mail, senha, erro), `[data-screen=lista]` (toolbar: busca, total, Exportar CSV, Sair; grid de `.entry-card`), `[data-screen=detalhe]` (header nome/cargo/data/duração; botões Copiar Markdown, Baixar .md, Baixar .json, Voltar; lista `.answer` pergunta lime + resposta).
- [ ] Commit: `feat: marcação e estilos do painel admin`

### Task 3.3: admin/app.js

**Files:** Create `js/admin/app.js`.

- [ ] Na carga: `getSession()` → lista ou login. `onAuth` mantém sincronizado.
- [ ] Login: `signIn`; erro → mensagem "E-mail ou senha inválidos".
- [ ] Lista: `listResponses()`, render cards, busca filtra por nome (client-side), Exportar CSV chama `getAllResponses()` e `toCSV`.
- [ ] Detalhe: `getResponse(id)`, render 25 respostas, botões de exportação (`navigator.clipboard.writeText` + toast).
- [ ] Verificar no navegador com usuário admin real.
- [ ] Commit: `feat: painel admin com login, lista e detalhe`

---

## Fase 4 — Polimento e deploy

### Task 4.1: Responsividade e acessibilidade
- [ ] Testar 390px, 768px, 1440px em todas as telas; drawer mobile; textarea não quebra layout com texto longo; header não cobre conteúdo.
- [ ] Foco visível em tudo; `aria-live="polite"` no toast e no contador; labels nos inputs; `aria-current="step"` na pílula atual; navegação por teclado no drawer.
- [ ] Commit: `fix: ajustes responsivos e de acessibilidade`

### Task 4.2: README
- [ ] Passo a passo: criar projeto Supabase → SQL Editor → colar `schema.sql` → Authentication > Providers > Email (desligar "Confirm email", desligar sign-ups) → Users > Add user (admin) → Project Settings > API → colar URL e anon key em `js/config.js` → GitHub: Settings > Pages > Deploy from branch `main` `/` → URLs finais `…/index.html` e `…/admin.html`.
- [ ] Commit: `docs: README com setup e deploy`

### Task 4.3: Publicar
- [ ] Criar repositório público no GitHub (`gh repo create`), push `main`, ativar Pages, abrir URL e testar envio de ponta a ponta.
