-- Adiciona horários, controle manual de posições e ações seguras do perfil Poder.
-- Execute uma vez no SQL Editor do Supabase antes de publicar a versão do site.
begin;

alter table public.starfall_scores add column if not exists wave_started_at timestamptz;
alter table public.starfall_scores add column if not exists wave_ended_at timestamptz;
alter table public.starfall_scores add column if not exists rank_order integer;

-- A API pública continua podendo gravar resultados dos apelidos autorizados,
-- mas não pode escrever a posição manual nem apagar linhas diretamente.
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

commit;
