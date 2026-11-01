-- Placar público de CV STARFALL.
-- educvv só grava pela conta autenticada do dono. Os demais apelidos abaixo são
-- gravações anônimas temporárias para testes; sem login individual, qualquer
-- pessoa pode reivindicar um desses apelidos e enviar um resultado.

create table if not exists public.starfall_scores (
  nickname text primary key check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'geovanagamer099'
  )),
  wave integer not null check (wave > 0),
  score integer not null check (score >= 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  ship_id text not null,
  ship_name text not null,
  buff_summary jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.starfall_scores enable row level security;
alter table public.starfall_scores drop constraint if exists starfall_scores_nickname_check;
alter table public.starfall_scores add constraint starfall_scores_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'geovanagamer099'
  ));

drop policy if exists "Anyone can read Starfall top scores" on public.starfall_scores;
create policy "Anyone can read Starfall top scores"
  on public.starfall_scores for select to anon, authenticated using (true);

drop policy if exists "Test profile can add Starfall score" on public.starfall_scores;
drop policy if exists "Owner account can add Starfall score" on public.starfall_scores;
drop policy if exists "Approved test pilots can add Starfall scores" on public.starfall_scores;
create policy "Approved test pilots can add Starfall scores"
  on public.starfall_scores for insert to anon
  with check (nickname in (
    'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'geovanagamer099'
  ));
create policy "Owner account can add Starfall score"
  on public.starfall_scores for insert to authenticated
  with check (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv');

drop policy if exists "Test profile can improve Starfall score" on public.starfall_scores;
drop policy if exists "Owner account can improve Starfall score" on public.starfall_scores;
drop policy if exists "Approved test pilots can improve Starfall scores" on public.starfall_scores;
create policy "Approved test pilots can improve Starfall scores"
  on public.starfall_scores for update to anon
  using (nickname in (
    'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'geovanagamer099'
  ))
  with check (nickname in (
    'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'geovanagamer099'
  ));
create policy "Owner account can improve Starfall score"
  on public.starfall_scores for update to authenticated
  using (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  with check (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv');

revoke all on public.starfall_scores from anon, authenticated;
grant select, insert, update on public.starfall_scores to anon;
grant select, insert, update on public.starfall_scores to authenticated;

-- Progresso privado do hangar: códigos 1-8 identificam as naves pela ordem atual.
-- 1 Aurora, 2 Aegis, 3 Chronos, 4 Tempestade, 5 Flashblade,
-- 6 Bastião Rubro, 7 Eclipse e 8 Saurion.
create table if not exists public.starfall_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unlocked_ships smallint[] not null default array[1]::smallint[],
  selected_ship smallint not null default 1 check (selected_ship between 1 and 8),
  best_completed_wave integer not null default 0 check (best_completed_wave >= 0),
  updated_at timestamptz not null default now()
);

alter table public.starfall_profiles enable row level security;

drop policy if exists "Owner can manage Starfall profile" on public.starfall_profiles;
create policy "Owner can manage Starfall profile"
  on public.starfall_profiles for all to authenticated
  using (auth.uid() = user_id and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  with check (auth.uid() = user_id and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv');

revoke all on public.starfall_profiles from anon, authenticated;
grant select, insert, update on public.starfall_profiles to authenticated;
