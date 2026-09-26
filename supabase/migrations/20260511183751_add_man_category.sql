-- 20260511183751  add_man_category
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


ALTER TABLE qms_documents DROP CONSTRAINT qms_documents_category_check;
ALTER TABLE qms_documents ADD CONSTRAINT qms_documents_category_check
  CHECK (category = ANY (ARRAY['POL','PRO','WOI','FRM','REG','DIA','TMP','MAN']));

