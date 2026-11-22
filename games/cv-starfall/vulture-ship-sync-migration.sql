-- Habilita a sincronização da Vulture (código 15) no perfil e nas preferências
-- do CV STARFALL. Reaplicável; não apaga progresso nem altera o placar.
-- Requer as tabelas public.starfall_profiles e public.starfall_settings,
-- criadas pelo supabase-schema.sql e/ou pelas migrações de sincronização.

alter table public.starfall_profiles
  drop constraint if exists starfall_profiles_selected_ship_check;
alter table public.starfall_profiles
  add constraint starfall_profiles_selected_ship_check
  check (selected_ship between 1 and 15);

alter table public.starfall_settings
  add column if not exists selected_ship text;
alter table public.starfall_settings
  add column if not exists unlocked_special_ships text[] not null default '{}';

alter table public.starfall_settings
  drop constraint if exists starfall_settings_selected_ship_check;
alter table public.starfall_settings
  add constraint starfall_settings_selected_ship_check
  check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm',
    'saurion-primal', 'vulture'
  ));

alter table public.starfall_settings
  drop constraint if exists starfall_settings_unlocked_special_ships_check;
alter table public.starfall_settings
  add constraint starfall_settings_unlocked_special_ships_check
  check (unlocked_special_ships <@ array[
    'redshift', 'eclipse', 'saurion', 'megumi', 'vulture'
  ]::text[]);
