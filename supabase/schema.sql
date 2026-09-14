-- ============================================================
-- Formulário Aloha Recovery — Nogma
-- Rode este arquivo UMA vez no SQL Editor do seu projeto Supabase.
-- ============================================================

create table if not exists public.respostas (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null,
  cargo        text not null,
  respostas    jsonb not null,        -- {"q1": "...", ..., "q25": "..."}
  duracao_seg  integer,               -- tempo de preenchimento em segundos
  user_agent   text
);

comment on table public.respostas is 'Envios do formulário de onboarding do Agente de IA (Aloha Recovery).';

-- Índice para listagem por data (painel admin)
create index if not exists respostas_created_at_idx on public.respostas (created_at desc);

-- ---------- Segurança (RLS) ----------
alter table public.respostas enable row level security;

-- Quem preenche (anon) só pode INSERIR. Nunca lê, altera ou apaga.
drop policy if exists "anon pode inserir" on public.respostas;
create policy "anon pode inserir"
  on public.respostas for insert
  to anon
  with check (true);

-- Equipe Nogma (usuário logado via Supabase Auth) só pode LER.
drop policy if exists "autenticado pode ler" on public.respostas;
create policy "autenticado pode ler"
  on public.respostas for select
  to authenticated
  using (true);

-- Garantias extras: sem UPDATE/DELETE para ninguém via API.
revoke update, delete on public.respostas from anon, authenticated;
