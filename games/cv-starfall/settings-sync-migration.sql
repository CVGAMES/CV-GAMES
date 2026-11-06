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
