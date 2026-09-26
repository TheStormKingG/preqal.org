-- 20260511182542  migrate_categories_and_doc_ids_to_new_taxonomy
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Step 1: Drop old constraint so we can freely update
ALTER TABLE qms_documents DROP CONSTRAINT qms_documents_category_check;

-- Step 2: Update category values to new 3-letter codes
UPDATE qms_documents SET category = 'POL' WHERE category = 'Policy';
UPDATE qms_documents SET category = 'PRO' WHERE category = 'Procedure';
UPDATE qms_documents SET category = 'WOI' WHERE category = 'Work Instruction';
UPDATE qms_documents SET category = 'FRM' WHERE category = 'Form';
UPDATE qms_documents SET category = 'TMP' WHERE category = 'Template';
-- 'Record' splits by doc_id prefix
UPDATE qms_documents SET category = 'DIA' WHERE category = 'Record' AND doc_id LIKE 'DIA-%';
UPDATE qms_documents SET category = 'REG' WHERE category = 'Record' AND doc_id LIKE 'REG-%';
-- catch any remaining Record rows
UPDATE qms_documents SET category = 'REG' WHERE category = 'Record';
UPDATE qms_documents SET category = 'REG' WHERE category = 'External';

-- Step 3: Rename SOP-xx doc_ids → PRO-xx and update file_url
UPDATE qms_documents
SET
  doc_id   = regexp_replace(doc_id,   '^SOP-', 'PRO-'),
  file_url = regexp_replace(file_url, '/SOP-', '/PRO-')
WHERE doc_id LIKE 'SOP-%';

-- Step 4: Rename TPL-xx doc_ids → TMP-xx and update file_url
UPDATE qms_documents
SET
  doc_id   = regexp_replace(doc_id,   '^TPL-', 'TMP-'),
  file_url = regexp_replace(file_url, '/TPL-', '/TMP-')
WHERE doc_id LIKE 'TPL-%';

-- Step 5: Restore new constraint with updated values
ALTER TABLE qms_documents
  ADD CONSTRAINT qms_documents_category_check
  CHECK (category = ANY (ARRAY[
    'POL',
    'PRO',
    'WOI',
    'FRM',
    'REG',
    'DIA',
    'TMP'
  ]));

