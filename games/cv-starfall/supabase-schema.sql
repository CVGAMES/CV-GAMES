-- Placar de teste do CV STARFALL: uma melhor partida por apelido autorizado.
-- No momento, somente "educvv" está permitido. Acrescente os outros quatro nomes
-- à restrição e ao arquivo leaderboard-config.js quando o dono os informar.

create table if not exists public.starfall_scores (
  nickname text primary key check (nickname = lower(btrim(nickname)) and nickname in ('educvv')),
  wave integer not null check (wave > 0),
  score integer not null check (score >= 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  ship_id text not null,
  ship_name text not null,
  buff_summary jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.starfall_scores enable row level security;

drop policy if exists "Anyone can read Starfall top scores" on public.starfall_scores;
create policy "Anyone can read Starfall top scores"
  on public.starfall_scores for select to anon using (true);

drop policy if exists "Test profile can add Starfall score" on public.starfall_scores;
create policy "Test profile can add Starfall score"
  on public.starfall_scores for insert to anon with check (nickname = 'educvv');

drop policy if exists "Test profile can improve Starfall score" on public.starfall_scores;
create policy "Test profile can improve Starfall score"
  on public.starfall_scores for update to anon
  using (nickname = 'educvv') with check (nickname = 'educvv');

grant select, insert, update on public.starfall_scores to anon;
