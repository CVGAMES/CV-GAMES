-- Ajusta a janela do campeonato já instalado no Supabase.
-- Horário de Brasília: 01/12/2026 00:00 até o fim de 31/12/2026.
-- O fim exclusivo é 01/01/2027 00:00 em Brasília (03:00 UTC).

alter policy "Approved pilots can add championship progress"
  on public.starfall_championship_progress
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

alter policy "Approved pilots can update championship progress"
  on public.starfall_championship_progress
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

alter policy "Approved pilots can add championship scores"
  on public.starfall_championship_scores
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );

alter policy "Approved pilots can update championship scores"
  on public.starfall_championship_scores
  with check (
    now() >= timestamptz '2026-12-01 03:00:00+00'
    and now() < timestamptz '2027-01-01 03:00:00+00'
    and (
      nickname in ('cypher', 'nys', 'kauan b', 'eduardo f', 'luiz g', 'yago k', 'johnata h', 'felype j', 'joao p', 'natan r', 'ismail s', 'brendo t', 'adryan v', 'storm', 'hiago a')
      or (nickname = 'educvv' and (select auth.jwt() -> 'app_metadata' ->> 'cv_profile') = 'educvv')
    )
  );
