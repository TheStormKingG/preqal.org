-- ─────────────────────────────────────────────────────────────────────────────
-- Live register sync: fire the sync-register-excel Edge Function whenever
-- one of the live-tracked tables changes. The function regenerates the
-- corresponding REG-XX xlsx in storage://registers/preqal/, which the local
-- cron in scripts/sync-registers-local.cjs mirrors into the QMS folder.
--
-- Prerequisites:
--   1. pg_net extension enabled (we attempt it below).
--   2. `app.regen_url` and `app.regen_auth_token` set on the database; see
--      docs/guides/register-live-sync-deploy.md for the ALTER DATABASE call.
-- ─────────────────────────────────────────────────────────────────────────────

-- pg_net powers the async HTTP POST. No-op if already enabled.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fire-and-forget POST to the sync-register-excel function.
-- ⚠ SECURITY (2026-07-04): the bearer token is NO LONGER hardcoded here — a live
-- service_role JWT in a public repo bypasses all RLS. The token now lives in
-- Supabase Vault under the name 'regen_auth_token'. Set it (and re-set after
-- every key rotation) with:
--   SELECT vault.create_secret('<secret API key>', 'regen_auth_token');
-- Superseded by supabase/migrations/20260704_security_lockdown.sql (same body).
CREATE OR REPLACE FUNCTION regen_register_async(p_register_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  url        constant text := 'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-register-excel';
  auth_token text;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO auth_token
    FROM vault.decrypted_secrets
    WHERE name = 'regen_auth_token'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    auth_token := NULL;
  END;
  IF auth_token IS NULL OR auth_token = '' THEN
    RAISE WARNING 'vault secret regen_auth_token is not set — register regen skipped';
    RETURN;
  END IF;
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

-- qms_documents → REG-01 (only fire for Preqal's own docs; client_id IS NULL)
CREATE OR REPLACE FUNCTION on_qms_documents_change() RETURNS trigger AS $$
BEGIN
  IF (TG_OP IN ('INSERT','UPDATE') AND NEW.client_id IS NULL)
     OR (TG_OP = 'DELETE' AND OLD.client_id IS NULL) THEN
    PERFORM regen_register_async('REG-01');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_qms_documents_regen ON qms_documents;
CREATE TRIGGER tr_qms_documents_regen
AFTER INSERT OR UPDATE OR DELETE ON qms_documents
FOR EACH ROW EXECUTE FUNCTION on_qms_documents_change();

-- qualified_leads → REG-02
CREATE OR REPLACE FUNCTION on_qualified_leads_change() RETURNS trigger AS $$
BEGIN
  PERFORM regen_register_async('REG-02');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_qualified_leads_regen ON qualified_leads;
CREATE TRIGGER tr_qualified_leads_regen
AFTER INSERT OR UPDATE OR DELETE ON qualified_leads
FOR EACH STATEMENT EXECUTE FUNCTION on_qualified_leads_change();

-- crm_clients → REG-10
CREATE OR REPLACE FUNCTION on_crm_clients_change() RETURNS trigger AS $$
BEGIN
  PERFORM regen_register_async('REG-10');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_crm_clients_regen ON crm_clients;
CREATE TRIGGER tr_crm_clients_regen
AFTER INSERT OR UPDATE OR DELETE ON crm_clients
FOR EACH STATEMENT EXECUTE FUNCTION on_crm_clients_change();
