-- Rode uma vez no Supabase SQL Editor para sincronizar nave equipada e
-- desbloqueios de naves especiais pelo nick autorizado do CV STARFALL.
-- As colunas são opcionais para preservar as preferências já salvas.
alter table public.starfall_settings
  add column if not exists selected_ship text;

alter table public.starfall_settings
  drop constraint if exists starfall_settings_selected_ship_check;
alter table public.starfall_settings
  add constraint starfall_settings_selected_ship_check
  check (selected_ship is null or selected_ship in (
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi'
  ));

alter table public.starfall_settings
  add column if not exists unlocked_special_ships text[] not null default '{}';

alter table public.starfall_settings
  drop constraint if exists starfall_settings_unlocked_special_ships_check;
alter table public.starfall_settings
  add constraint starfall_settings_unlocked_special_ships_check
  check (unlocked_special_ships <@ array['redshift', 'eclipse', 'saurion', 'megumi']::text[]);
