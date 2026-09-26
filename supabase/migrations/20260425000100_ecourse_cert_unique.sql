-- =============================================================================
-- Preqal E-Course: Enforce one certificate per user per course
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================================
--
-- PURPOSE:
--   A user should only ever receive ONE certificate for a given course.
--   Without this constraint, the INSERT in handleClaimCert could succeed
--   multiple times (e.g. if state gets out of sync or the user clicks fast).
--
--   The app already handles the resulting `23505` unique-violation by
--   falling back to loading the existing cert — so this is the DB-level
--   guarantee that backs that logic.
--
-- SAFE TO RE-RUN:
--   CREATE UNIQUE INDEX IF NOT EXISTS … will no-op if the index exists.
-- =============================================================================

-- One certificate per (user, course) — prevents duplicate issuance
CREATE UNIQUE INDEX IF NOT EXISTS idx_ecourse_certs_user_course
  ON ecourse_certificates (user_id, course_id);
