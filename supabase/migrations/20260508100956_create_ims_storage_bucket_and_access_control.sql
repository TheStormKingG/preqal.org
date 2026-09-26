-- 20260508100956  create_ims_storage_bucket_and_access_control
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- ─── 1. Create the private IMS storage bucket ───────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ims',
  'ims',
  false,
  52428800,
  ARRAY[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Authorised IMS user list ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS authorized_ims_users (
  email TEXT PRIMARY KEY,
  name  TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO authorized_ims_users (email, name) VALUES
  ('stefan.gravesande@preqal.org', 'Dr. Stefan Gravesande'),
  ('stefan.gravesande@gmail.com',  'Dr. Stefan Gravesande (personal)')
ON CONFLICT (email) DO NOTHING;

-- Allow anyone authenticated to check their own access
ALTER TABLE authorized_ims_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check their own IMS access"
ON authorized_ims_users FOR SELECT
TO authenticated
USING (email = auth.email());

-- ─── 3. Storage RLS — read: only authorized_ims_users ───────────────────────
CREATE POLICY "IMS docs readable by authorized users only"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ims'
  AND auth.email() IN (SELECT email FROM authorized_ims_users)
);

-- No authenticated user can write — only the service role (sync script) can
CREATE POLICY "IMS docs not writable by authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (false);

