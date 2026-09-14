# Formulário Aloha Recovery · Nogma

Formulário interativo (web + mobile) de 27 perguntas que coleta as informações
que alimentam o Agente de IA da **Aloha Recovery**. As respostas são salvas no
**Supabase** e a equipe Nogma acessa tudo pelo **painel admin**.

- `index.html` — formulário público (capa → identificação → 27 perguntas → revisão → enviado)
- `admin.html` — painel da Nogma (login, lista de envios, detalhe, exportar Markdown/CSV/JSON)
- `admin.html?mock` — painel em modo demonstração com dados de exemplo (sem Supabase)

Site 100% estático: HTML + CSS + JS puro, sem build. Roda na Vercel (ou GitHub Pages).

---

## 1. Configurar o Supabase (uma vez, ~5 min)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano gratuito serve).
2. No menu lateral, abra **SQL Editor** → **New query**, cole o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
   Isso cria a tabela `respostas` com as regras de segurança (RLS):
   - quem preenche o formulário só consegue **inserir**;
   - só usuário logado (equipe Nogma) consegue **ler**;
   - ninguém altera ou apaga pela API.
3. **Authentication → Sign In / Providers → Email**: deixe ativo.
   Desmarque **Confirm email** (para não depender de e-mail de confirmação).
4. **Authentication → Sign In / Providers → (topo) Allow new users to sign up**: **desligue**.
   Assim ninguém cria conta sozinho.
5. **Authentication → Users → Add user → Create new user**: crie o usuário da
   Nogma (e-mail + senha). Marque **Auto Confirm User**. Repita para cada pessoa
   que precisar acessar o painel.
6. **Project Settings → API**: copie **Project URL** e **anon public** key.
7. Abra [`js/config.js`](js/config.js) e cole os dois valores:

```js
export const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

> A anon key é pública por design. A segurança está nas políticas RLS do
> `schema.sql`, não na chave.

## 2. Publicar na Vercel (gratuito)

O projeto é estático, sem build — a Vercel serve os arquivos como estão.

1. Acesse [vercel.com](https://vercel.com) e entre com a conta do GitHub (NogmaBR).
2. **Add New → Project → Import** o repositório `NogmaBR/-formulario-alohaa`.
3. Na tela de configuração:
   - Framework Preset: **Other**
   - Root Directory: `./` (padrão)
   - Build Command: **deixe vazio** (desligue o override se aparecer)
   - Output Directory: **deixe vazio**
4. **Deploy**. Em ~30 s sai a URL `https://<projeto>.vercel.app`.
   - Formulário: `https://<projeto>.vercel.app/`
   - Painel: `https://<projeto>.vercel.app/admin.html`
5. Todo `git push` na `main` gera um novo deploy automaticamente.

> Alternativa: GitHub Pages também funciona (Settings → Pages → branch `main`, pasta `/`).

## 3. Rodar localmente

Qualquer servidor estático serve (módulos ES não funcionam via `file://`):

```bash
python -m http.server 5173
# ou: npx serve .
```

Abra `http://localhost:5173/index.html`.

## 4. Testes

Lógica pura (perguntas, progresso, persistência, exportação) tem testes em `tests/`:

```bash
npm test
```

## 5. Editar as perguntas

Tudo fica em [`js/questions.js`](js/questions.js): título, dica (opcional) e
placeholder de cada pergunta. A ordem do array é a ordem do formulário.

## Estrutura

```
index.html  admin.html
css/   tokens.css  base.css  form.css  admin.css
js/    config.js  questions.js  progress.js  storage.js  supabase-client.js
       form/app.js  form/render.js
       admin/app.js  admin/export.js  admin/mock-client.js
assets/     logos da Nogma
supabase/   schema.sql
tests/      testes node --test
docs/       spec, plano e materiais de referência
```

## Como funciona

- **Autosave**: cada tecla é salva em `localStorage` (`aloha-form-v1`). Fechou
  o navegador? Ao voltar, a capa oferece "Continuar de onde parei".
- **Navegação**: Voltar/Próximo, pílulas numeradas (desktop) ou drawer
  "Escolher questão" (mobile), `Ctrl/Cmd + Enter` avança.
- **Revisão**: mostra as 27 respostas; as vazias ficam em vermelho com botão
  "Responder". O envio só libera com 27/27.
- **Envio**: um único `INSERT` na tabela `respostas`. Se falhar (sem internet),
  nada se perde — a pessoa tenta de novo.
- **Painel**: lista por data, busca por nome/cargo, detalhe com as 27
  respostas, **Copiar Markdown** (pronto para virar contexto do agente),
  **Baixar .md / .json**, **Exportar CSV** de todos os envios.
