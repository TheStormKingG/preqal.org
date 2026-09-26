-- 20260429182057  employee_salary_and_storage_bucket
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Add salary columns
ALTER TABLE qms_employees
  ADD COLUMN IF NOT EXISTS gross_salary NUMERIC,
  ADD COLUMN IF NOT EXISTS net_salary NUMERIC;

-- Create employee-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employee-documents',
  'employee-documents',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'image/png','image/jpeg','image/jpg','image/gif','image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DO $$
BEGIN
  -- Public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'employee_docs_public_read' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY employee_docs_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = ''employee-documents'')';
  END IF;
  -- Authenticated upload + manage
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'employee_docs_auth_all' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY employee_docs_auth_all ON storage.objects FOR ALL TO authenticated USING (bucket_id = ''employee-documents'') WITH CHECK (bucket_id = ''employee-documents'')';
  END IF;
  -- Anon upload (for onboarding form public page)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'employee_docs_anon_insert' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY employee_docs_anon_insert ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = ''employee-documents'')';
  END IF;
END$$;

