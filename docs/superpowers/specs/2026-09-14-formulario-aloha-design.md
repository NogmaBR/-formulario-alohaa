# Formulário Aloha Recovery — Design

**Data:** 2026-09-14
**Cliente:** Aloha Recovery (Curitiba) · **Fornecedor:** Nogma
**Objetivo:** Formulário web/mobile de 25 perguntas que coleta as informações
que alimentam o Agente de IA da Aloha. Respostas salvas no Supabase e
visualizadas pela Nogma num painel admin. Hospedado no GitHub Pages (gratuito).

## 1. Stack

- HTML + CSS + JS puro (ES modules), sem build, sem `node_modules` em produção.
- Supabase (Postgres + Auth) via CDN `@supabase/supabase-js@2`.
- Fontes Google: Plus Jakarta Sans (texto) + Space Grotesk (display).
- Hospedagem: GitHub Pages servindo a raiz do repositório.
- Testes: lógica pura (perguntas, completude, storage) em `node --test`;
  UI verificada em navegador (desktop 1440px e mobile 390px).

## 2. Identidade visual

| Token | Valor |
|---|---|
| Fundo | `#07080a` (body), `#101216` (card), `#121418` (superfícies) |
| Bordas | `rgba(255,255,255,.08)` |
| Lime | `#ccff00` (primária), hover `#b8e600`, glow `rgba(204,255,0,.35)` |
| Texto | `#f3f4f6` principal, `#8e96a4` secundário |
| Erro | `#ff5c5c` |
| Raio | cards 24px, botões 14px, pílulas 999px |

- Grafismos: curvas/espirais em lime (SVG local, opacidade ~20%) flutuando
  no fundo com animação lenta, como no protótipo do Stitch.
- Logos locais em `assets/`: wordmark `nogma` (header, capa, footer) e
  isotipo `n` (header direita, favicon).
- Animações: entrada de tela `fadeIn` 350ms, troca de pergunta com slide
  horizontal 250ms, progresso com `transition: width 500ms`. Respeita
  `prefers-reduced-motion`.

## 3. Fluxo de telas (`index.html`)

```
Capa → Identificação → Q1…Q25 → Revisão → Enviado
```

### 3.1 Capa
Badge "Ambiente exclusivo Nogma", título "Bem-vinda, **Aloha**", subtítulo
("Estas respostas alimentam o Agente de IA da Aloha Recovery…"), 3 cards
(25 perguntas · ~15 min · salva automaticamente), botão lime
"Começar o formulário". Se existir progresso salvo em `localStorage`, o botão
vira "Continuar de onde parei" e aparece um link "Recomeçar do zero".

### 3.2 Identificação
Campos **Nome** e **Cargo/função** (ambos obrigatórios, mín. 2 caracteres).
Botão "Ir para as perguntas". Salvo em `localStorage` junto com as respostas.

### 3.3 Perguntas (uma por vez)
- **Header fixo**: wordmark Nogma · barra de progresso + "X% concluído"
  (percentual = respondidas/25) · isotipo `n`.
- **Navegador de questões**:
  - Desktop (≥768px): faixa horizontal rolável com 25 pílulas numeradas
    acima do card.
  - Mobile: botão "Questão 7 de 25 ▾" que abre um drawer inferior com a
    lista completa (número + início da pergunta + estado).
  - Estados da pílula: `respondida` (fundo lime, ✓), `atual` (borda lime
    com pulso), `vazia` (cinza). Clique navega direto.
- **Card**: número `07.` grande em lime, pergunta (h2), dica opcional em
  cinza (ex.: "Jovem, Profissional, Descontraído"), `textarea`
  auto-expansível (mín. 5 linhas) com glow lime no foco e contador de
  caracteres. Placeholder específico por pergunta.
- **Ações**: **Voltar** (desabilitado na Q1 → volta para Identificação),
  **Próximo** (na Q25 vira **Revisar respostas**). Indicador
  "Salvo automaticamente" com check que pisca ao salvar.
- Atalho: `Ctrl/Cmd + Enter` avança.
- Autosave: a cada `input` (debounce 300ms) grava em `localStorage`
  chave `aloha-form-v1` → `{ nome, cargo, respostas: {q1..q25}, atual, iniciadoEm }`.

### 3.4 Revisão
- Cabeçalho: "Revise suas respostas" + contador **23/25 respondidas** com
  barra.
- Lista das 25: número, pergunta, resposta completa (texto colapsável acima
  de 6 linhas), botão "Editar" → abre a questão e, ao voltar, retorna à
  revisão.
- Vazias: card com borda vermelha, texto "Sem resposta", botão "Responder".
- Botão **Enviar formulário** desabilitado até 25/25. Ao clicar: estado de
  loading, insere no Supabase, em sucesso vai para Enviado e limpa
  `localStorage`. Em erro: toast vermelho "Não conseguimos enviar. Suas
  respostas continuam salvas aqui — tente de novo." e mantém tudo.

### 3.5 Enviado
Ícone de check com glow, "Obrigado, Aloha!", texto de confirmação, resumo
(nome, cargo, data/hora, 25/25). Sem botão de reenvio.

## 4. Perguntas
As 25 perguntas em `js/questions.js`, cada uma `{ id, titulo, dica?, placeholder }`,
na ordem exata do formulário Google original. Texto extraído do PDF
`FORMMULARIO/Aloha Recovery - Google Formulários.pdf`.

## 5. Backend (Supabase)

### 5.1 Tabela `respostas`
```sql
id            uuid primary key default gen_random_uuid()
created_at    timestamptz not null default now()
nome          text not null
cargo         text not null
respostas     jsonb not null      -- {"q1": "...", ..., "q25": "..."}
duracao_seg   integer             -- tempo de preenchimento
user_agent    text
```

### 5.2 Segurança (RLS)
- RLS ligado.
- `anon`: **INSERT** apenas (`with check (true)`). Nunca SELECT/UPDATE/DELETE.
- `authenticated`: **SELECT** apenas.
- Admin = usuário criado manualmente em Supabase Auth (e-mail + senha) pela
  Nogma. Sem cadastro público (sign-ups desligados).
- A `anon key` é pública por design; fica em `js/config.js`.

### 5.3 Schema versionado
`supabase/schema.sql` com tabela, RLS e políticas — roda uma vez no SQL
Editor do projeto.

## 6. Painel admin (`admin.html`)

Mesma identidade visual, densidade maior.

- **Login**: e-mail + senha (Supabase Auth). Sessão persistida.
- **Lista de envios**: cards ordenados por data desc com nome, cargo, data,
  duração, badge 25/25. Busca por nome. Contador total. Botão
  "Exportar CSV (todos)".
- **Detalhe do envio**: cabeçalho com nome/cargo/data; as 25 perguntas com
  respostas em layout de leitura (pergunta em lime, resposta em branco);
  botões **Copiar como Markdown** (formato pronto para alimentar o agente),
  **Baixar .md**, **Baixar .json**. Botão "Voltar".
- **Sair**.

## 7. Estrutura de arquivos
```
index.html            admin.html
css/tokens.css        css/base.css     css/form.css     css/admin.css
js/config.js          js/questions.js  js/storage.js    js/supabase-client.js
js/form/app.js        js/form/screens.js js/form/nav.js
js/admin/app.js       js/admin/export.js
assets/nogma-wordmark.png  assets/nogma-n.png  assets/curva-*.svg  assets/favicon.png
supabase/schema.sql   tests/*.test.js  README.md
```

## 8. Erros e casos de borda
- Sem internet no envio → mantém dados, mostra toast, permite tentar de novo.
- Fechar aba no meio → retoma pela capa ("Continuar de onde parei").
- Reload em qualquer tela → volta para a mesma questão (campo `atual`).
- Chaves do Supabase não configuradas → banner discreto no console e
  mensagem clara ao tentar enviar (não quebra a navegação).
- Textarea aceita até 4000 caracteres por resposta (contador avisa).

## 9. Deploy
- Repositório público no GitHub. GitHub Pages → branch `main`, pasta `/`.
- README com passo a passo: criar projeto Supabase, rodar `schema.sql`,
  criar usuário admin, colar chaves em `config.js`, ativar Pages.
