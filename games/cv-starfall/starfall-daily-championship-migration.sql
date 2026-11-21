-- Campeonato de missões diárias do CV STARFALL.
-- Cria tabelas novas; não altera nem apaga placares, perfis ou desbloqueios existentes.
-- Janela do evento em horário de Brasília (UTC-3):
-- início 01/12/2026 00:00; encerramento ao fim de 31/12/2026.

create table if not exists public.starfall_championship_progress (
  nickname text primary key check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t',
    'adryan v', 'storm', 'hiago a'
  )),
  mission_date date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  kills integer not null default 0 check (kills between 0 and 10),
  waves integer not null default 0 check (waves between 0 and 3),
  score integer not null default 0 check (score between 0 and 5000),
  claimed text[] not null default '{}'
    check (claimed <@ array['kills', 'waves', 'score']::text[]),
  tickets integer not null default 0 check (tickets >= 0),
  cv_coins integer not null default 0 check (cv_coins between 0 and 10000000),
  unlocked_ships text[] not null default '{}'
    check (unlocked_ships <@ array['aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade', 'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm']::text[]),
  bonus_date date,
  updated_at timestamptz not null default now()
);

-- Converte o saldo antigo de fichas uma única vez para CV Coins.
alter table public.starfall_championship_progress
  add column if not exists cv_coins integer not null default 0
  check (cv_coins between 0 and 10000000);

update public.starfall_championship_progress
set cv_coins = greatest(cv_coins, least(10000000::bigint, tickets::bigint * 50)::integer),
    tickets = 0
where tickets > 0;

create table if not exists public.starfall_championship_scores (
  nickname text primary key check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t',
    'adryan v', 'storm', 'hiago a'
  )),
  wave integer not null check (wave > 0),
  score integer not null check (score >= 0),
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  ship_id text not null,
  ship_name text not null,
  updated_at timestamptz not null default now()
);

alter table public.starfall_championship_progress enable row level security;
alter table public.starfall_championship_scores enable row level security;

drop policy if exists "Anyone can read championship progress" on public.starfall_championship_progress;
create policy "Anyone can read championship progress"
  on public.starfall_championship_progress for select to anon, authenticated using (true);

drop policy if exists "Approved pilots can add championship progress" on public.starfall_championship_progress;
create policy "Approved pilots can add championship progress"
  on public.starfall_championship_progress for insert to anon, authenticated
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

drop policy if exists "Approved pilots can update championship progress" on public.starfall_championship_progress;
create policy "Approved pilots can update championship progress"
  on public.starfall_championship_progress for update to anon, authenticated
  using (
    nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
    or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  )
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

drop policy if exists "Anyone can read championship scores" on public.starfall_championship_scores;
create policy "Anyone can read championship scores"
  on public.starfall_championship_scores for select to anon, authenticated using (true);

drop policy if exists "Approved pilots can add championship scores" on public.starfall_championship_scores;
create policy "Approved pilots can add championship scores"
  on public.starfall_championship_scores for insert to anon, authenticated
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

drop policy if exists "Approved pilots can update championship scores" on public.starfall_championship_scores;
create policy "Approved pilots can update championship scores"
  on public.starfall_championship_scores for update to anon, authenticated
  using (
    nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
    or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  )
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

-- Evita que uma atualização concorrente substitua um resultado melhor já salvo.
create or replace function public.starfall_championship_keep_best()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.wave > new.wave or (old.wave = new.wave and old.score >= new.score) then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists starfall_championship_keep_best_before_update on public.starfall_championship_scores;
create trigger starfall_championship_keep_best_before_update
before update on public.starfall_championship_scores
for each row execute function public.starfall_championship_keep_best();

revoke all on public.starfall_championship_progress from anon, authenticated;
revoke all on public.starfall_championship_scores from anon, authenticated;
grant select, insert, update on public.starfall_championship_progress to anon, authenticated;
grant select, insert, update on public.starfall_championship_scores to anon, authenticated;
