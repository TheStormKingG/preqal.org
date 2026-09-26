-- supabase/migrations/20260508_qualified_leads.sql
-- Renames quote_submissions → qualified_leads, adds pipeline columns,
-- creates helper function and storage bucket, inserts REG-02 doc entry.

-- ── 1. Rename table ──────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS quote_submissions RENAME TO qualified_leads;

-- ── 2. Add pipeline columns ──────────────────────────────────────────────────
ALTER TABLE qualified_leads
  ADD COLUMN IF NOT EXISTS selected_steps    int2,
  ADD COLUMN IF NOT EXISTS recommended_tier  text,
  ADD COLUMN IF NOT EXISTS tier              text,
  ADD COLUMN IF NOT EXISTS quote_sent_at     timestamptz,
  ADD COLUMN IF NOT EXISTS quote_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS agreement_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_token  uuid,
  ADD COLUMN IF NOT EXISTS notes             text;

-- Ensure status column exists with correct default
ALTER TABLE qualified_leads
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
-- If column already exists, ensure default is set
ALTER TABLE qualified_leads
  ALTER COLUMN status SET DEFAULT 'new';
-- Backfill nulls and enforce NOT NULL on pre-existing nullable column
UPDATE qualified_leads SET status = 'new' WHERE status IS NULL;
ALTER TABLE qualified_leads
  ALTER COLUMN status SET NOT NULL;

-- ── 3. Unique index on onboarding_token ──────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS qualified_leads_onboarding_token_idx
  ON qualified_leads (onboarding_token)
  WHERE onboarding_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS qualified_leads_status_idx
  ON qualified_leads (status);

CREATE INDEX IF NOT EXISTS qualified_leads_created_at_idx
  ON qualified_leads (created_at DESC);

-- ── 4. Enable RLS on qualified_leads ─────────────────────────────────────────
ALTER TABLE qualified_leads ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) get full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'qualified_leads'
      AND policyname = 'qualified_leads admin access'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "qualified_leads admin access"
        ON qualified_leads FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true)
    $p$;
  END IF;
END;
$$;

-- ── 5. Helper function for client-facing token lookup ────────────────────────
-- Returns only the fields the client-onboarding form needs.
-- SECURITY DEFINER so anonymous callers can query without touching other rows.
CREATE OR REPLACE FUNCTION get_lead_by_token(p_token uuid)
RETURNS TABLE (
  id                uuid,
  company_name      text,
  contact_person    text,
  email             text,
  staff_size        text,
  selected_steps    int2,
  recommended_tier  text,
  tier              text,
  status            text,
  agreement_sent_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ql.id,
    ql.company_name,
    ql.contact_person,
    ql.email,
    ql.staff_size,
    ql.selected_steps,
    ql.recommended_tier,
    ql.tier,
    ql.status,
    ql.agreement_sent_at
  FROM qualified_leads ql
  WHERE ql.onboarding_token = p_token
    AND ql.status = 'onboarding_sent';
END;
$$;

-- Grant execute to anon so the client-facing form can call it without auth
GRANT EXECUTE ON FUNCTION get_lead_by_token(uuid) TO anon;

-- ── 6. pdf-temp storage bucket ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-temp',
  'pdf-temp',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: only authenticated users (admin) can read/write pdf-temp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'pdf-temp admin access'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "pdf-temp admin access"
        ON storage.objects FOR ALL TO authenticated
        USING (bucket_id = 'pdf-temp')
        WITH CHECK (bucket_id = 'pdf-temp')
    $p$;
  END IF;
END;
$$;

-- ── 7. Add lead_id foreign key to crm_clients ─────────────────────────────────
ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES qualified_leads(id) ON DELETE SET NULL;

-- ── 8. Insert REG-02 into qms_documents ──────────────────────────────────────
INSERT INTO qms_documents (doc_id, title, category, description, file_url, version, status)
VALUES (
  'REG-02',
  'Qualified Leads Register',
  'Record',
  'Live register of all qualified leads from the Business Growth Assessment form, tracking pipeline status from quote through to onboarding.',
  'REG-02-QUALIFIED-LEADS-REGISTER.xlsx',
  '1.0',
  'active'
)
ON CONFLICT (doc_id) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  file_url    = EXCLUDED.file_url;
