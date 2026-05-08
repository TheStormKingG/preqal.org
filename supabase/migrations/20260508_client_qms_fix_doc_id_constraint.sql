-- Drop the global unique constraint on doc_id
ALTER TABLE qms_documents DROP CONSTRAINT IF EXISTS qms_documents_doc_id_key;

-- Add composite unique constraint: (doc_id, client_id) NULLS NOT DISTINCT
-- Allows multiple clients to each have their own copy of e.g. POL-01
-- while preventing duplicates within the same client or within Preqal's own docs.
ALTER TABLE qms_documents
  ADD CONSTRAINT qms_documents_doc_id_client_id_key
  UNIQUE NULLS NOT DISTINCT (doc_id, client_id);

-- Update activate_client_qms to use the correct conflict target
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
  ON CONFLICT (doc_id, client_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION activate_client_qms(uuid) TO authenticated;
