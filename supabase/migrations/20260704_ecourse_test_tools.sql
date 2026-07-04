-- =============================================================================
-- E-course admin test tools (2026-07-04)
-- Supports the admin-only "Simulate complete" / "Reset course" panel on
-- /e-courses/learn:
--   • learners may delete their own progress rows (reset)
--   • ONLY admins may delete certificate rows (so issuance can be re-tested;
--     student certificates remain immutable)
-- =============================================================================

DROP POLICY IF EXISTS "progress_delete_own" ON ecourse_module_progress;
CREATE POLICY "progress_delete_own" ON ecourse_module_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "certs_delete_admin" ON ecourse_certificates;
CREATE POLICY "certs_delete_admin" ON ecourse_certificates
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND (auth.jwt() ->> 'email') IN ('stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org')
  );
