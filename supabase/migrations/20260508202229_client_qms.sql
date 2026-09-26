-- supabase/migrations/20260508_client_qms.sql

-- ── 1. qms_active flag on crm_clients ────────────────────────────────────────
ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS qms_active boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS crm_clients_qms_active_idx
  ON crm_clients (qms_active) WHERE qms_active = true;

-- ── 2. client_id on qms_documents ────────────────────────────────────────────
ALTER TABLE qms_documents
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES crm_clients(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS qms_documents_client_id_idx
  ON qms_documents (client_id);

-- ── 3. activate_client_qms function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION activate_client_qms(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE crm_clients
    SET qms_active = true
  WHERE id = p_client_id;

  INSERT INTO qms_documents (
    id, doc_id, title, category, description,
    file_url, version, status, owner, review_date,
    client_id, created_at
  )
  SELECT
    gen_random_uuid(),
    doc_id,
    title,
    category,
    description,
    file_url,
    version,
    status,
    owner,
    review_date,
    p_client_id,
    now()
  FROM qms_documents
  WHERE client_id IS NULL
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_client_qms(uuid) TO authenticated;
