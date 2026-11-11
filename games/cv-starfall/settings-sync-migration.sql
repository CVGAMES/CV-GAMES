-- Rode uma vez no Supabase SQL Editor para sincronizar controles e desempenho
-- das preferências do CV STARFALL entre dispositivos.
alter table public.starfall_settings
  add column if not exists control_mode text not null default 'keys'
  check (control_mode in ('keys','touch','analog'));

alter table public.starfall_settings
  add column if not exists performance_mode text not null default 'normal'
  check (performance_mode in ('normal','light'));

alter table public.starfall_settings
  add column if not exists setup_complete boolean not null default false;

-- Permite equipar Umbra (código 12) em perfis existentes.
alter table public.starfall_profiles
  drop constraint if exists starfall_profiles_selected_ship_check;

alter table public.starfall_profiles
  add constraint starfall_profiles_selected_ship_check
  check (selected_ship between 1 and 12);
