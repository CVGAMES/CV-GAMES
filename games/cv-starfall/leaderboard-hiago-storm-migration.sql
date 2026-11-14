-- Adiciona HIAGO A, renomeia geovanagamer099 para STORM e atualiza as permissões.
-- Pode ser executado novamente sem duplicar nem apagar o melhor recorde.
begin;

alter table public.starfall_scores drop constraint if exists starfall_scores_nickname_check;
alter table public.starfall_scores add constraint starfall_scores_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'geovanagamer099', 'storm', 'hiago a'
  ));

insert into public.starfall_scores as current_score
  (nickname, wave, score, elapsed_seconds, ship_id, ship_name, buff_summary, updated_at)
select 'storm', wave, score, elapsed_seconds, ship_id, ship_name, buff_summary, updated_at
from public.starfall_scores
where nickname = 'geovanagamer099'
on conflict (nickname) do update
set wave = excluded.wave,
    score = excluded.score,
    elapsed_seconds = excluded.elapsed_seconds,
    ship_id = excluded.ship_id,
    ship_name = excluded.ship_name,
    buff_summary = excluded.buff_summary,
    updated_at = greatest(current_score.updated_at, excluded.updated_at)
where (excluded.wave, excluded.score) > (current_score.wave, current_score.score);

delete from public.starfall_scores where nickname = 'geovanagamer099';

alter table public.starfall_scores drop constraint if exists starfall_scores_nickname_check;
alter table public.starfall_scores add constraint starfall_scores_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a'
  ));

alter table public.starfall_settings drop constraint if exists starfall_settings_nickname_check;
alter table public.starfall_settings add constraint starfall_settings_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'geovanagamer099', 'storm', 'hiago a', 'educvv dev', 'educvv dev1', 'adm'
  ));

insert into public.starfall_settings as current_settings
  (nickname, damage_counter_enabled, damage_counter_x, damage_counter_y, eclipse_skip_video,
   control_mode, performance_mode, setup_complete, updated_at)
select 'storm', damage_counter_enabled, damage_counter_x, damage_counter_y, eclipse_skip_video,
       control_mode, performance_mode, setup_complete, updated_at
from public.starfall_settings
where nickname = 'geovanagamer099'
on conflict (nickname) do nothing;

delete from public.starfall_settings where nickname = 'geovanagamer099';

alter table public.starfall_settings drop constraint if exists starfall_settings_nickname_check;
alter table public.starfall_settings add constraint starfall_settings_nickname_check
  check (nickname = lower(btrim(nickname)) and nickname in (
    'educvv', 'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k',
    'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v',
    'storm', 'hiago a', 'educvv dev', 'educvv dev1', 'adm'
  ));

drop policy if exists "Approved test pilots can add Starfall scores" on public.starfall_scores;
create policy "Approved test pilots can add Starfall scores"
  on public.starfall_scores for insert to anon
  with check (nickname in (
    'cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h',
    'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a'
  ));

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

commit;
