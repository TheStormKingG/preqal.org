-- =============================================================================
-- Preqal security lockdown (2026-07-04)
-- Closes the critical/high findings from the 2026-07-04 security audit:
--   • crm_clients readable by anon (RLS off)            → admin-only
--   • qualified_leads readable by anon (live drift)     → anon INSERT-only + admin
--   • qms_documents readable by anon (RLS off)          → admin-only
--   • page_views                                        → anon INSERT-only + admin
--   • activate_client_qms callable by anyone            → onboarding-token-gated
--   • regen_register_async hardcoded service_role JWT   → reads a DB-level GUC
--
-- Edge Functions use the service_role key and BYPASS RLS — the register
-- pipeline, admin flows via functions, etc. keep working unchanged.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Admin helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_preqal_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((auth.jwt() ->> 'email'), '') IN
    ('stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org');
$$;

-- ---------------------------------------------------------------------------
-- 1. crm_clients — admin-only (client PII + business-confidential CRM data)
-- ---------------------------------------------------------------------------
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'crm_clients' LOOP
    EXECUTE format('DROP POLICY %I ON crm_clients', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "crm_admin_all" ON crm_clients
  FOR ALL TO authenticated
  USING (is_preqal_admin()) WITH CHECK (is_preqal_admin());

-- ---------------------------------------------------------------------------
-- 2. qualified_leads — public assessment form may INSERT; only admin may read
-- ---------------------------------------------------------------------------
ALTER TABLE qualified_leads ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'qualified_leads' LOOP
    EXECUTE format('DROP POLICY %I ON qualified_leads', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "ql_public_insert" ON qualified_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "ql_admin_all" ON qualified_leads
  FOR ALL TO authenticated
  USING (is_preqal_admin()) WITH CHECK (is_preqal_admin());

-- ---------------------------------------------------------------------------
-- 3. qms_documents — internal IMS documents, admin-only via the API
--    (Edge Functions / service_role bypass RLS; qms.html now requires an
--    admin session — see public/qms.html change shipped alongside this.)
-- ---------------------------------------------------------------------------
ALTER TABLE qms_documents ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'qms_documents' LOOP
    EXECUTE format('DROP POLICY %I ON qms_documents', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "qd_admin_all" ON qms_documents
  FOR ALL TO authenticated
  USING (is_preqal_admin()) WITH CHECK (is_preqal_admin());

-- ---------------------------------------------------------------------------
-- 4. page_views — public tracker may INSERT; only admin may read
-- ---------------------------------------------------------------------------
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'page_views' LOOP
    EXECUTE format('DROP POLICY %I ON page_views', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "pv_public_insert" ON page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "pv_admin_select" ON page_views
  FOR SELECT TO authenticated
  USING (is_preqal_admin());

-- ---------------------------------------------------------------------------
-- 5. activate_client_qms — now requires the lead's onboarding token
--    (previously any authenticated user could flip qms_active on any client)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS activate_client_qms(uuid);

CREATE OR REPLACE FUNCTION activate_client_qms(p_client_id uuid, p_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM crm_clients c
    JOIN qualified_leads l ON l.id = c.lead_id
    WHERE c.id = p_client_id
      AND l.onboarding_token = p_token
  ) AND NOT is_preqal_admin() THEN
    RAISE EXCEPTION 'Invalid onboarding token for this client';
  END IF;

  UPDATE crm_clients SET qms_active = true WHERE id = p_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_client_qms(uuid, uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5b. complete_client_onboarding — token-gated server-side onboarding
--     client-onboarding.html previously wrote crm_clients / qualified_leads
--     directly as anon; with RLS locked down, the whole submission now runs
--     through this SECURITY DEFINER function, gated by the onboarding token.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION complete_client_onboarding(p_token uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id   uuid;
  v_client_id uuid;
BEGIN
  SELECT id INTO v_lead_id
  FROM qualified_leads
  WHERE onboarding_token = p_token;
  IF v_lead_id IS NULL THEN
    RAISE EXCEPTION 'Invalid onboarding token';
  END IF;

  INSERT INTO crm_clients (
    company_name, legal_name, contact_person, email, phone, address,
    company_reg, vat_number, rep_id_passport, contract_start,
    kickoff_meeting_date, pipeline_stage, onboarding_stage, lead_id, qms_active
  ) VALUES (
    p_payload->>'company_name',
    p_payload->>'legal_name',
    p_payload->>'contact_person',
    lower(p_payload->>'email'),
    p_payload->>'phone',
    p_payload->>'address',
    p_payload->>'company_reg',
    nullif(p_payload->>'vat_number', ''),
    p_payload->>'rep_id_passport',
    (p_payload->>'contract_start')::date,
    (p_payload->>'kickoff_meeting_date')::date,
    'onboarded',
    'complete',
    v_lead_id,
    true
  )
  ON CONFLICT (lead_id) DO UPDATE SET
    company_name         = EXCLUDED.company_name,
    legal_name           = EXCLUDED.legal_name,
    contact_person       = EXCLUDED.contact_person,
    email                = EXCLUDED.email,
    phone                = EXCLUDED.phone,
    address              = EXCLUDED.address,
    company_reg          = EXCLUDED.company_reg,
    vat_number           = EXCLUDED.vat_number,
    rep_id_passport      = EXCLUDED.rep_id_passport,
    contract_start       = EXCLUDED.contract_start,
    kickoff_meeting_date = EXCLUDED.kickoff_meeting_date,
    pipeline_stage       = 'onboarded',
    onboarding_stage     = 'complete',
    qms_active           = true
  RETURNING id INTO v_client_id;

  UPDATE qualified_leads SET status = 'onboarded' WHERE id = v_lead_id;

  RETURN v_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION complete_client_onboarding(uuid, jsonb) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. regen_register_async — no hardcoded service_role JWT
--    The bearer token now comes from a database-level GUC. Set it once (and
--    again after every key rotation) with:
--      ALTER DATABASE postgres SET app.regen_auth_token TO '<service_role key>';
--    (Sessions started before the ALTER pick it up on reconnect; pg_net calls
--    run in fresh backends so triggers see it immediately.)
-- ---------------------------------------------------------------------------
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
  auth_token := current_setting('app.regen_auth_token', true);
  IF auth_token IS NULL OR auth_token = '' THEN
    RAISE WARNING 'app.regen_auth_token is not set — register regen skipped';
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
