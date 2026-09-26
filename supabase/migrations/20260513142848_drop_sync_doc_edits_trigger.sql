-- 20260513142848  drop_sync_doc_edits_trigger
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.

-- Drop the trigger that fires sync-doc-edits edge function on content_html updates.
-- The edge function's paragraph-alignment patch corrupts DOCX files; content_html
-- in the DB is now the canonical display source and does not need to be synced back
-- to DOCX. Dropped 2026-05-13.
DROP TRIGGER IF EXISTS sync_doc_edits_trigger ON public.qms_documents;
DROP FUNCTION IF EXISTS public.trigger_sync_doc_edits();
