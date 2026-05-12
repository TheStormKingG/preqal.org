-- supabase/migrations/20260512_register_client_id.sql
-- Add client_id FK to all register tables that don't already have it.
-- NULL = Preqal's own records. UUID = that client's records.
-- qms_documents already has client_id — skip it.

ALTER TABLE qms_context_issues
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_employees
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_org_register
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_legal_register
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_quality_risk
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_hse_risk
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_ncr
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_capa
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_audit
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
