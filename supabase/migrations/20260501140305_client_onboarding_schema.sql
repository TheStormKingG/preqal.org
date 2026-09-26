-- 20260501140305  client_onboarding_schema
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


ALTER TABLE quote_submissions
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by text;

ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS quote_submission_id uuid,
  ADD COLUMN IF NOT EXISTS onboarding_token uuid,
  ADD COLUMN IF NOT EXISTS onboarding_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS contract_url text;

CREATE TABLE IF NOT EXISTS client_onboarding (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  token                 uuid NOT NULL UNIQUE,
  crm_client_id         uuid,
  company_name          text,
  company_type          text,
  registration_number   text,
  legal_address         text,
  office_addresses      jsonb DEFAULT '[]',
  services              jsonb DEFAULT '[]',
  doc_company_reg       text,
  doc_tin               text,
  doc_gra               text,
  doc_nis               text,
  doc_local_content     text,
  doc_iso_certs         jsonb DEFAULT '[]',
  doc_other             jsonb DEFAULT '[]',
  existing_docs         jsonb DEFAULT '[]',
  signed_contract_url   text,
  status                text DEFAULT 'pending',
  submitted_at          timestamptz
);

ALTER TABLE client_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_client_onboarding" ON client_onboarding FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_client_onboarding" ON client_onboarding FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "allow_anon_client_docs_upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'client-documents');
CREATE POLICY "allow_anon_client_docs_select" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'client-documents');
CREATE POLICY "allow_auth_client_docs_all" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'client-documents') WITH CHECK (bucket_id = 'client-documents');

