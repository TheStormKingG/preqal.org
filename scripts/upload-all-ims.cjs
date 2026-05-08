#!/usr/bin/env node
'use strict';

/**
 * upload-all-ims.cjs — Bulk upload all IMS documents to Supabase Storage
 * and update qms_documents.file_url for each matched record.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/upload-all-ims.cjs
 *
 * Scans public/ims/ for all .docx / .xlsx / .png files, uploads each to the
 * Supabase Storage "ims" bucket, and updates the corresponding qms_documents row.
 *
 * Get the service role key from:
 *   Supabase dashboard → Project gndcjmxxgtnoidxgcdnx → Settings → API → service_role
 */

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const BUCKET       = 'ims';
const IMS_DIR      = path.resolve(__dirname, '../public/ims');
const EXTENSIONS   = new Set(['.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.pdf']);

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
    console.error('Usage: SUPABASE_SERVICE_KEY=<service_role_key> node scripts/upload-all-ims.cjs\n');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);

  // Collect all document files (skip index.html and other non-doc files)
  const files = fs.readdirSync(IMS_DIR)
    .filter(f => EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log('\nNo document files found in public/ims/\n');
    process.exit(0);
  }

  console.log(`\nUploading ${files.length} files to Supabase Storage bucket "${BUCKET}"…\n`);

  let uploaded = 0;
  let dbUpdated = 0;
  let errors = 0;

  for (const filename of files) {
    const filePath   = path.join(IMS_DIR, filename);
    const ext        = path.extname(filename).toLowerCase();
    const mimeType   = MIME_MAP[ext] || 'application/octet-stream';
    const fileData   = fs.readFileSync(filePath);
    const storageKey = filename;
    const sizeKB     = (fileData.length / 1024).toFixed(1);

    process.stdout.write(`  ↑  ${filename.padEnd(52)} ${sizeKB.padStart(7)} KB  `);

    // Upload
    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(storageKey, fileData, { contentType: mimeType, upsert: true });

    if (upErr) {
      console.log(`FAIL — ${upErr.message}`);
      errors++;
      continue;
    }

    uploaded++;

    // Derive doc_id from filename prefix (e.g. "SOP-01", "REG-01", "TPL-05-14")
    const docIdMatch = filename.match(/^([A-Z]+-\d+(?:-\d+)?)/);
    if (!docIdMatch) {
      console.log(`✓ (no doc_id match)`);
      continue;
    }

    const docId = docIdMatch[1];

    const { error: dbErr, data } = await sb
      .from('qms_documents')
      .update({ file_url: storageKey })
      .eq('doc_id', docId)
      .select('doc_id');

    if (dbErr) {
      console.log(`✓ upload / DB ERR — ${dbErr.message}`);
    } else if (!data || data.length === 0) {
      console.log(`✓ upload / no DB row for ${docId}`);
    } else {
      console.log(`✓`);
      dbUpdated++;
    }
  }

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`  Uploaded : ${uploaded} / ${files.length}`);
  console.log(`  DB rows  : ${dbUpdated} updated`);
  if (errors) console.log(`  Errors   : ${errors}`);
  console.log(`─────────────────────────────────────────────\n`);

  if (errors > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
