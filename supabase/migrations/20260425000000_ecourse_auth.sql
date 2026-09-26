-- =============================================================================
-- Preqal E-Course: Auth profiles + certificates
-- Run this in your Supabase project → SQL Editor
-- =============================================================================
--
-- BEFORE RUNNING:
--   1. Enable Google Auth in Supabase Dashboard → Authentication → Providers → Google
--   2. Add your Google OAuth client ID + secret (from Google Cloud Console)
--   3. Add Site URL: https://preqal.org
--   4. Add Redirect URL: https://preqal.org/e-courses/register
--
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ecourse_profiles: one row per registered user
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecourse_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text        NOT NULL,
  email        text        NOT NULL,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ecourse_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON ecourse_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON ecourse_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON ecourse_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- ecourse_certificates: one row per issued certificate
--   cert_key  — human-readable unique key, shown on PDF & used for verification
--               format: PREQAL-YYYYMM-XXXXXX  e.g. PREQAL-202604-K8M3XN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecourse_certificates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_key      text        NOT NULL UNIQUE,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name text       NOT NULL,
  email         text        NOT NULL,
  course_id     text        NOT NULL DEFAULT 'build-systems-that-actually-work',
  course_title  text        NOT NULL DEFAULT 'E-Course: Build Systems That Actually Work',
  issued_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ecourse_certificates ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can look up a certificate by cert_key
CREATE POLICY "certs_public_read" ON ecourse_certificates
  FOR SELECT TO anon, authenticated USING (true);

-- Only the certificate owner can insert their own certificate
CREATE POLICY "certs_insert_own" ON ecourse_certificates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Useful indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_ecourse_certs_cert_key  ON ecourse_certificates (cert_key);
CREATE INDEX        IF NOT EXISTS idx_ecourse_certs_user_id   ON ecourse_certificates (user_id);
CREATE INDEX        IF NOT EXISTS idx_ecourse_certs_issued_at ON ecourse_certificates (issued_at DESC);
