-- 20260510174428  create_ims_storage_bucket
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Create the ims bucket for QMS document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ims', 'ims', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop policies if they already exist, then recreate
DO $$
BEGIN
  DROP POLICY IF EXISTS "ims_authenticated_upload" ON storage.objects;
  DROP POLICY IF EXISTS "ims_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "ims_authenticated_update" ON storage.objects;
  DROP POLICY IF EXISTS "ims_authenticated_delete" ON storage.objects;
END$$;

CREATE POLICY "ims_authenticated_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ims');

CREATE POLICY "ims_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ims');

CREATE POLICY "ims_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ims');

CREATE POLICY "ims_authenticated_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ims');

