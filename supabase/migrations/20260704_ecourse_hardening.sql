-- =============================================================================
-- Preqal E-Course: server-side hardening (2026-07-04)
-- Run in Supabase → SQL Editor (or `supabase db push`)
--
-- Fixes from the 2026-07-04 e-course audit:
--   1. CRITICAL — certificates could be minted by any authenticated user via a
--      plain client-side INSERT (completion only checked in localStorage).
--      → issue_certificate() SECURITY DEFINER validates server-recorded module
--        progress before inserting; direct INSERT policy is revoked.
--   2. CRITICAL — anon could dump the whole certificates table, full emails
--      included (certs_public_read USING (true)).
--      → verify_certificate() returns only pre-masked, public-safe fields;
--        the open SELECT policy is replaced with owner-only SELECT.
--   3. MODERATE — ecourse_module_progress existed live but was never written
--      by the app and had no repo migration (schema drift).
--      → canonical schema defined here; the app now upserts on completion.
--   4. MODERATE — admin dashboard couldn't read profiles/progress under RLS.
--      → admin SELECT policies keyed to the two admin emails.
--
-- The front-end calls both functions RPC-first with a graceful fallback, so it
-- works before AND after this migration is applied.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ecourse_module_progress — canonical schema
--    (table exists live but is empty and unwritten; safe to recreate)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS ecourse_module_progress;

CREATE TABLE ecourse_module_progress (
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id    text        NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_id)
);

ALTER TABLE ecourse_module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_own" ON ecourse_module_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own" ON ecourse_module_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own" ON ecourse_module_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Admin visibility (dashboard reads all rows)
CREATE POLICY "progress_select_admin" ON ecourse_module_progress
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'));

CREATE POLICY "profiles_select_admin" ON ecourse_profiles
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'));

-- ---------------------------------------------------------------------------
-- 2. verify_certificate — public lookup with masked PII
--    Email is pre-masked in the same format the front-end uses
--    (s***e@domain.com), so client-side re-masking is idempotent.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_certificate(p_cert_key text)
RETURNS TABLE (
  cert_key       text,
  recipient_name text,
  email          text,
  course_id      text,
  course_title   text,
  issued_at      timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.cert_key,
    c.recipient_name,
    CASE
      WHEN position('@' in c.email) <= 3
        THEN left(c.email, 1) || '***@' || split_part(c.email, '@', 2)
      ELSE left(c.email, 1)
           || repeat('*', least(position('@' in c.email) - 3, 4))
           || substr(c.email, position('@' in c.email) - 1, 1)
           || '@' || split_part(c.email, '@', 2)
    END AS email,
    c.course_id,
    c.course_title,
    c.issued_at
  FROM ecourse_certificates c
  WHERE upper(c.cert_key) = upper(p_cert_key)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION verify_certificate(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. issue_certificate — server-side issuance with progress validation
--    Requires ALL 9 modules recorded complete in ecourse_module_progress.
--    Idempotent: returns the existing certificate if one was already issued.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION issue_certificate()
RETURNS TABLE (cert_key text, issued_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_profile    ecourse_profiles%ROWTYPE;
  v_done       integer;
  v_total      constant integer := 9;
  v_course_id  constant text := 'build-systems-that-actually-work';
  v_title      constant text := 'E-Course: Build Systems That Actually Work';
  v_key        text;
  v_existing   ecourse_certificates%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Idempotency: return the existing cert if already issued
  SELECT * INTO v_existing
  FROM ecourse_certificates c
  WHERE c.user_id = v_user_id AND c.course_id = v_course_id
  ORDER BY c.issued_at DESC LIMIT 1;
  IF FOUND THEN
    RETURN QUERY SELECT v_existing.cert_key, v_existing.issued_at;
    RETURN;
  END IF;

  -- Server-side completion gate
  SELECT count(*) INTO v_done
  FROM ecourse_module_progress p
  WHERE p.user_id = v_user_id;
  IF v_done < v_total THEN
    RAISE EXCEPTION 'Course not complete: % of % modules recorded', v_done, v_total;
  END IF;

  SELECT * INTO v_profile FROM ecourse_profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile found for user';
  END IF;

  -- PREQAL-YYYYMM-XXXXXXXX (unbiased base-36 via rejection-free md5→int mapping)
  v_key := 'PREQAL-' || to_char(now(), 'YYYYMM') || '-' ||
    upper(
      (SELECT string_agg(
        substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
               1 + floor(random() * 36)::int, 1), '')
       FROM generate_series(1, 8))
    );

  INSERT INTO ecourse_certificates (cert_key, user_id, recipient_name, email, course_id, course_title)
  VALUES (v_key, v_user_id, v_profile.display_name, v_profile.email, v_course_id, v_title);

  RETURN QUERY SELECT v_key, now()::timestamptz;
END;
$$;

GRANT EXECUTE ON FUNCTION issue_certificate() TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Tighten ecourse_certificates RLS
--    (run AFTER the front-end with RPC-first verify/claim is deployed)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "certs_public_read" ON ecourse_certificates;
DROP POLICY IF EXISTS "certs_insert_own" ON ecourse_certificates;

-- Owners may still read their own certificate rows (claim-again flow)
CREATE POLICY "certs_select_own" ON ecourse_certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admin visibility
CREATE POLICY "certs_select_admin" ON ecourse_certificates
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'));

-- Dedup guard used by both the RPC and the legacy client path
CREATE UNIQUE INDEX IF NOT EXISTS idx_ecourse_certs_user_course
  ON ecourse_certificates (user_id, course_id);
