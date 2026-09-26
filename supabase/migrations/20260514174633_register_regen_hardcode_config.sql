-- 20260514174633  register_regen_hardcode_config
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.

-- Replace regen_register_async with hardcoded config (avoids ALTER DATABASE permission).
-- URL and token are embedded; rotate the token by re-running this migration.
CREATE OR REPLACE FUNCTION regen_register_async(p_register_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  url        constant text := 'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-register-excel';
  auth_token constant text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZGNqbXh4Z3Rub2lkeGdjZG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE0Njk2NiwiZXhwIjoyMDgxNzIyOTY2fQ.C_qlYYgJXtXN4TocJHr4K93IyU5Zm6FRsgmCofm38Z0';
BEGIN
  PERFORM net.http_post(
    url     := url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || auth_token
    ),
    body    := jsonb_build_object('registerKey', p_register_key, 'clientId', NULL)
  );
END;
$$;

