#!/usr/bin/env node
'use strict';

/**
 * sync-ims-file.cjs — Upload a single IMS document to Supabase Storage
 * and update the corresponding qms_documents.file_url record.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/sync-ims-file.cjs <filepath>
 *
 * Examples:
 *   SUPABASE_SERVICE_KEY=xxx node scripts/sync-ims-file.cjs \
 *     "/Users/stefangravesande/Documents/Projects/Preqal QMS/02 - SOPs/SOP-01-DOCUMENT-CONTROL.docx"
 *
 *   SUPABASE_SERVICE_KEY=xxx node scripts/sync-ims-file.cjs public/ims/SOP-01-DOCUMENT-CONTROL.docx
 *
 * The script:
 *   1. Reads the file from the given path
 *   2. Uploads it to Supabase Storage bucket "ims" using the filename as the storage key
 *   3. Updates qms_documents.file_url to the storage object path for the matching doc
 *
 * Get the service role key from:
 *   Supabase dashboard → Project gndcjmxxgtnoidxgcdnx → Settings → API → service_role
 */

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const BUCKET = 'ims';

const MIME_MAP = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf':  'application/pdf',
};

async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('\nERROR: SUPABASE_SERVICE_KEY is not set.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<service_role_key> node scripts/sync-ims-file.cjs <filepath>\n');
    process.exit(1);
  }

  const filePath = process.argv[2];
  if (!filePath) {
    console.error('\nERROR: No file path provided.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/sync-ims-file.cjs <filepath>\n');
    process.exit(1);
  }

  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`\nERROR: File not found: ${absPath}\n`);
    process.exit(1);
  }

  const filename  = path.basename(absPath);
  const ext       = path.extname(filename).toLowerCase();
  const mimeType  = MIME_MAP[ext] || 'application/octet-stream';
  const fileData  = fs.readFileSync(absPath);
  const storageKey = filename;   // flat namespace — all files at root of bucket

  const sb = createClient(SUPABASE_URL, key);

  // ─── Upload to Supabase Storage ─────────────────────────────────────────────
  console.log(`\n↑  Uploading  ${filename} (${(fileData.length / 1024).toFixed(1)} KB)…`);

  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(storageKey, fileData, {
      contentType: mimeType,
      upsert: true,   // overwrite if already exists
    });

  if (upErr) {
    console.error(`\n✗  Upload failed: ${upErr.message}\n`);
    process.exit(1);
  }

  console.log(`✓  Uploaded to storage bucket "${BUCKET}/${storageKey}"`);

  // ─── Derive doc_id from filename ────────────────────────────────────────────
  // E.g. "SOP-01-DOCUMENT-CONTROL.docx" → "SOP-01"
  //      "POL-02-Data-Protection.docx"  → "POL-02"
  //      "REG-01-Document-Master-Register.xlsx" → "REG-01"
  //      "TPL-05-14-Email-Templates.docx" → "TPL-05-14"
  const docIdMatch = filename.match(/^([A-Z]+-\d+(?:-\d+)?)/);
  if (!docIdMatch) {
    console.warn(`⚠  Could not derive doc_id from filename "${filename}" — skipping DB update.`);
    process.exit(0);
  }

  const docId = docIdMatch[1];
  const fileUrl = storageKey;   // store just the storage key; UI generates signed URLs

  // ─── Update qms_documents.file_url ──────────────────────────────────────────
  const { error: dbErr, data } = await sb
    .from('qms_documents')
    .update({ file_url: fileUrl })
    .eq('doc_id', docId)
    .select('doc_id, title');

  if (dbErr) {
    console.error(`\n✗  DB update failed: ${dbErr.message}\n`);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.warn(`⚠  No qms_documents row found for doc_id "${docId}" — storage upload succeeded but DB not updated.`);
  } else {
    console.log(`✓  DB updated: ${docId} — "${data[0].title}" → file_url = "${fileUrl}"`);
  }

  console.log('\n✅  Done.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
