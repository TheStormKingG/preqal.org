#!/usr/bin/env node
'use strict';

/**
 * sync-from-storage.cjs — Previously downloaded Edge-Function-patched DOCX files
 * from Supabase Storage and mirrored them to the local QMS working folder.
 *
 * NOTE (2026-05-13): The sync-doc-edits edge function and its Postgres trigger
 * (sync_doc_edits_trigger) have been disabled because the paragraph-alignment
 * patch algorithm corrupted DOCX files. content_html in the DB is now the
 * canonical display source for browser-edited documents; the DOCX files in
 * public/ims/ are the archival source and are only updated via deliberate manual
 * upload (sync-ims-file.cjs).
 *
 * This script is now a no-op. It is kept so launchd does not error, and so the
 * history of what it did is preserved. Re-enable if the edge function is fixed.
 *
 * Called automatically by launchd (org.preqal.sync-ims) every 5 minutes.
 */

const ts = new Date().toISOString();
console.log(ts, '— sync-from-storage: disabled (sync-doc-edits trigger removed 2026-05-13)');
