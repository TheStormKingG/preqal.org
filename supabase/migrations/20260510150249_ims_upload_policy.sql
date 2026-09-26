-- 20260510150249  20260510_ims_upload_policy
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.

-- Step 1: Drop the blocking policy that explicitly denies authenticated INSERT
DROP POLICY IF EXISTS "IMS docs not writable by authenticated users" ON storage.objects;

-- Step 2: Add INSERT policy for authenticated users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Authenticated users can upload to ims'
  ) THEN
    CREATE POLICY "Authenticated users can upload to ims"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'ims');
  END IF;
END $$;

-- Step 3: Add UPDATE policy for authenticated users (needed for re-uploads)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Authenticated users can update ims objects'
  ) THEN
    CREATE POLICY "Authenticated users can update ims objects"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'ims');
  END IF;
END $$;
