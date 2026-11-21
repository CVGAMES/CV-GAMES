-- Atualiza os IDs de nave aceitos nas recompensas da roleta do CV Starfall.
-- Seguro para reaplicar: remove apenas CHECK constraints ligados a unlocked_ships.

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.starfall_championship_progress'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%unlocked_ships%'
  loop
    execute format(
      'alter table public.starfall_championship_progress drop constraint %I',
      constraint_row.conname
    );
  end loop;
end;
$$;

alter table public.starfall_championship_progress
  add constraint starfall_championship_progress_unlocked_ships_pool_check
  check (unlocked_ships <@ array[
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm'
  ]::text[]);
