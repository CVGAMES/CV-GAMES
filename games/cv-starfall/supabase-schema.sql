-- Placar público de CV STARFALL.
-- educvv só grava pela conta autenticada do dono. Os demais apelidos abaixo são
-- gravações anônimas temporárias para testes; sem login individual, qualquer
-- pessoa pode reivindicar um desses apelidos e enviar um resultado.

create table if not exists public.starfall_scores (
  nickname text primary key check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a'
  )),
  wave integer not null check (wave > 0),
  score integer not null check (score >= 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  ship_id text not null,
  ship_name text not null,
  buff_summary jsonb not null default '{}'::jsonb,
  wave_started_at timestamptz,
  wave_ended_at timestamptz,
  rank_order integer,
  updated_at timestamptz not null default now()
);

alter table public.starfall_scores add column if not exists wave_started_at timestamptz;
alter table public.starfall_scores add column if not exists wave_ended_at timestamptz;
alter table public.starfall_scores add column if not exists rank_order integer;

alter table public.starfall_scores enable row level security;
alter table public.starfall_scores drop constraint if exists starfall_scores_nickname_check;
alter table public.starfall_scores add constraint starfall_scores_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a'
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
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a'
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
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a'
  ))
  with check (nickname in (
    'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a'
  ));
create policy "Owner account can improve Starfall score"
  on public.starfall_scores for update to authenticated
  using (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  with check (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv');

revoke all on public.starfall_scores from anon, authenticated;
grant select on public.starfall_scores to anon, authenticated;
grant insert (nickname, wave, score, elapsed_seconds, ship_id, ship_name, buff_summary, wave_started_at, wave_ended_at, updated_at) on public.starfall_scores to anon, authenticated;
grant update (wave, score, elapsed_seconds, ship_id, ship_name, buff_summary, wave_started_at, wave_ended_at, updated_at) on public.starfall_scores to anon, authenticated;

create or replace function public.starfall_admin_reset_scores()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_count integer;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'cv_profile', '') <> 'poder' then
    raise exception 'Apenas o perfil autenticado Poder pode zerar o placar.' using errcode = '42501';
  end if;

  delete from public.starfall_scores;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

create or replace function public.starfall_admin_move_score(p_nickname text, p_direction integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ordered_nicknames text[];
  current_position integer;
  target_position integer;
  swap_nickname text;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'cv_profile', '') <> 'poder' then
    raise exception 'Apenas o perfil autenticado Poder pode reorganizar o placar.' using errcode = '42501';
  end if;
  if p_direction not in (-1, 1) then
    raise exception 'A direção precisa ser -1 ou 1.' using errcode = '22023';
  end if;

  lock table public.starfall_scores in exclusive mode;
  select array_agg(nickname order by rank_order asc nulls last, wave desc, score desc, updated_at asc)
    into ordered_nicknames
    from public.starfall_scores;
  if ordered_nicknames is null then return false; end if;

  current_position := array_position(ordered_nicknames, lower(btrim(p_nickname)));
  if current_position is null then return false; end if;
  target_position := current_position + p_direction;
  if target_position < 1 or target_position > cardinality(ordered_nicknames) then return false; end if;

  swap_nickname := ordered_nicknames[current_position];
  ordered_nicknames[current_position] := ordered_nicknames[target_position];
  ordered_nicknames[target_position] := swap_nickname;
  update public.starfall_scores as scores
    set rank_order = positions.rank_index::integer
    from unnest(ordered_nicknames) with ordinality as positions(nickname, rank_index)
    where scores.nickname = positions.nickname;
  return true;
end;
$$;

revoke all on function public.starfall_admin_reset_scores() from public, anon, authenticated;
revoke all on function public.starfall_admin_move_score(text, integer) from public, anon, authenticated;
grant execute on function public.starfall_admin_reset_scores() to authenticated;
grant execute on function public.starfall_admin_move_score(text, integer) to authenticated;

-- Progresso privado do hangar: códigos 1-12 identificam as naves pela ordem atual.
-- 1 Aurora, 2 Aegis, 3 Chronos, 4 Tempestade, 5 Flashblade,
-- 6 Bastião Rubro, 7 Eclipse, 8 Saurion, 9 Prisma Real (somente educvv),
-- 10 Ferrum, 11 reservado para a forma interna Mahoraga, 12 Umbra.
create table if not exists public.starfall_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unlocked_ships smallint[] not null default array[1]::smallint[],
  selected_ship smallint not null default 1 check (selected_ship between 1 and 12),
  best_completed_wave integer not null default 0 check (best_completed_wave >= 0),
  updated_at timestamptz not null default now()
);

-- Atualiza a faixa para incluir Prisma Real, Ferrum e Umbra em projetos já existentes.
alter table public.starfall_profiles drop constraint if exists starfall_profiles_selected_ship_check;
alter table public.starfall_profiles add constraint starfall_profiles_selected_ship_check
  check (selected_ship between 1 and 12);

alter table public.starfall_profiles enable row level security;

drop policy if exists "Owner can manage Starfall profile" on public.starfall_profiles;
create policy "Owner can manage Starfall profile"
  on public.starfall_profiles for all to authenticated
  using (auth.uid() = user_id and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  with check (auth.uid() = user_id and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv');

revoke all on public.starfall_profiles from anon, authenticated;
grant select, insert, update on public.starfall_profiles to authenticated;

-- Preferências sincronizadas pelo apelido para os perfis de teste do placar.
-- Os apelidos de teste não têm login individual; qualquer pessoa que use um
-- desses apelidos pode alterar suas preferências, como já ocorre no placar.
create table if not exists public.starfall_settings (
  nickname text primary key,
  constraint starfall_settings_nickname_check check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a', 'educvv dev', 'educvv dev1', 'adm'
  )),
  damage_counter_enabled boolean not null default true,
  damage_counter_x real not null default 0.89 check (damage_counter_x between 0.16 and 0.96),
  damage_counter_y real not null default 0.53 check (damage_counter_y between 0.12 and 0.88),
  eclipse_skip_video boolean not null default false,
  control_mode text not null default 'keys' check (control_mode in ('keys','touch','analog')),
  performance_mode text not null default 'normal' check (performance_mode in ('normal','light')),
  setup_complete boolean not null default false,
  selected_ship text check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm'
  )),
  unlocked_special_ships text[] not null default '{}'
    check (unlocked_special_ships <@ array['redshift', 'eclipse', 'saurion', 'megumi']::text[]),
  updated_at timestamptz not null default now()
);

-- Preferências de controle e desempenho também acompanham o apelido entre dispositivos.
alter table public.starfall_settings
  add column if not exists control_mode text not null default 'keys' check (control_mode in ('keys','touch','analog'));
alter table public.starfall_settings
  add column if not exists performance_mode text not null default 'normal' check (performance_mode in ('normal','light'));
alter table public.starfall_settings
  add column if not exists setup_complete boolean not null default false;
alter table public.starfall_settings
  add column if not exists selected_ship text;
alter table public.starfall_settings
  add column if not exists unlocked_special_ships text[] not null default '{}';
alter table public.starfall_settings drop constraint if exists starfall_settings_selected_ship_check;
alter table public.starfall_settings add constraint starfall_settings_selected_ship_check
  check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm'
  ));
alter table public.starfall_settings drop constraint if exists starfall_settings_unlocked_special_ships_check;
alter table public.starfall_settings add constraint starfall_settings_unlocked_special_ships_check
  check (unlocked_special_ships <@ array['redshift', 'eclipse', 'saurion', 'megumi']::text[]);

-- Mantém a lista atualizada mesmo se a tabela já tiver sido criada anteriormente.
alter table public.starfall_settings drop constraint if exists starfall_settings_nickname_check;
alter table public.starfall_settings add constraint starfall_settings_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a', 'educvv dev', 'educvv dev1', 'adm'
  ));
alter table public.starfall_settings alter column damage_counter_enabled set default true;
alter table public.starfall_settings alter column eclipse_skip_video set default false;

alter table public.starfall_settings enable row level security;

drop policy if exists "Anyone can read Starfall settings" on public.starfall_settings;
create policy "Anyone can read Starfall settings"
  on public.starfall_settings for select to anon, authenticated using (true);

drop policy if exists "Approved pilots can add Starfall settings" on public.starfall_settings;
create policy "Approved pilots can add Starfall settings"
  on public.starfall_settings for insert to anon, authenticated
  with check (
    nickname in (
      'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
      'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a',
      'educvv dev', 'educvv dev1', 'adm'
    )
    or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  );

drop policy if exists "Approved pilots can update Starfall settings" on public.starfall_settings;
create policy "Approved pilots can update Starfall settings"
  on public.starfall_settings for update to anon, authenticated
  using (
    nickname in (
      'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
      'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a',
      'educvv dev', 'educvv dev1', 'adm'
    )
    or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  )
  with check (
    nickname in (
      'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
      'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a',
      'educvv dev', 'educvv dev1', 'adm'
    )
    or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
  );

revoke all on public.starfall_settings from anon, authenticated;
grant select, insert, update on public.starfall_settings to anon, authenticated;

-- Padrão inicial para Nys. Se a linha ainda estiver com os valores antigos
-- do primeiro seed, atualiza uma vez sem sobrescrever preferências já alteradas.
insert into public.starfall_settings as current_settings (nickname, damage_counter_enabled, eclipse_skip_video)
values ('nys', true, false)
on conflict (nickname) do update
set damage_counter_enabled = true,
    eclipse_skip_video = false
where current_settings.damage_counter_enabled = false
  and current_settings.eclipse_skip_video = true;

