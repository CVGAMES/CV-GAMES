-- Rode uma vez no Supabase SQL Editor para permitir sincronizar a nova Saurion
-- (código 14 / identificador saurion-primal) em dispositivos autorizados.
alter table public.starfall_profiles
  drop constraint if exists starfall_profiles_selected_ship_check;

alter table public.starfall_profiles
  add constraint starfall_profiles_selected_ship_check
  check (selected_ship between 1 and 14);

alter table public.starfall_settings
  drop constraint if exists starfall_settings_selected_ship_check;

alter table public.starfall_settings
  add constraint starfall_settings_selected_ship_check
  check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm', 'saurion-primal'
  ));
