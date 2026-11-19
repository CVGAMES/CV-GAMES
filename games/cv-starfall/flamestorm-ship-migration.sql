-- Rode uma vez no Supabase SQL Editor para permitir salvar a Flame Storm
-- como nave equipada nas preferências sincronizadas do CV STARFALL.
alter table public.starfall_settings
  drop constraint if exists starfall_settings_selected_ship_check;

alter table public.starfall_settings
  add constraint starfall_settings_selected_ship_check
  check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm'
  ));
