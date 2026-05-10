#!/usr/bin/env node
'use strict';

/**
 * sync-from-supabase.cjs — Download a single file from Supabase Storage to a local path.
 * This is the Supabase→Local direction of the bidirectional IMS/client sync system.
 * Called by EMP-007 (preqal-ims-doc-manager) and EMP-008 (preqal-client-qms-manager).
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/sync-from-supabase.cjs \
 *     <prefix> <filename> <local-destination-path>
 *
 * Examples (IMS docs — prefix is "ims", object sits at bucket root):
 *   SUPABASE_SERVICE_KEY=xxx node scripts/sync-from-supabase.cjs \
 *     "ims" "SOP-01.docx" \
 *     "/Users/stefangravesande/Documents/Projects/Preqal QMS/02 - SOPs/SOP-01.docx"
 *
 * Examples (client docs — prefix is "clients/<slug>", object nested inside bucket):
 *   SUPABASE_SERVICE_KEY=xxx node scripts/sync-from-supabase.cjs \
 *     "clients/bounty-farm" "SOP-01.docx" \
 *     "/Users/stefangravesande/Documents/Projects/Preqal QMS/CLIENTS/Bounty Farm/02 - SOPs/SOP-01.docx"
 *
 * Bucket layout (all files live in the "ims" Supabase Storage bucket):
 *   prefix "ims"              → object path within bucket = <filename>          (root level)
 *   prefix "clients/<slug>"   → object path within bucket = clients/<slug>/<filename>
 *
 * The file is written atomically: downloaded to <dest>.tmp then renamed to <dest>.
 *
 * Get the service role key from:
 *   Supabase dashboard → Project gndcjmxxgtnoidxgcdnx → Settings → API → service_role
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const BUCKET       = 'ims';

// ─── Argument validation ──────────────────────────────────────────────────────

const key    = process.env.SUPABASE_SERVICE_KEY;
const prefix = process.argv[2];
const file   = process.argv[3];
const dest   = process.argv[4];

if (!key) {
  console.error('\nERROR: SUPABASE_SERVICE_KEY is not set.');
  console.error('Usage: SUPABASE_SERVICE_KEY=<service_role_key> node scripts/sync-from-supabase.cjs <prefix> <filename> <local-dest>\n');
  process.exit(1);
}

if (!prefix || !file || !dest) {
  console.error('\nERROR: Missing required arguments.');
  console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-supabase.cjs <prefix> <filename> <local-dest>');
  console.error('');
  console.error('  prefix      — "ims" for IMS docs, "clients/<slug>" for client docs');
  console.error('  filename    — e.g. "SOP-01.docx"');
  console.error('  local-dest  — absolute local path to write the downloaded file\n');
  process.exit(1);
}

if (!path.isAbsolute(dest)) {
  console.error('\nERROR: destination path must be absolute. Got: ' + dest + '\n');
  process.exit(1);
}

// ─── Derive storage object path within bucket ─────────────────────────────────
// When prefix === "ims", the file sits at the root of the bucket (no folder prefix).
// For all other prefixes (e.g. "clients/bounty-farm"), the object lives at
// <prefix>/<filename> within the bucket.

const objectPath = prefix === BUCKET ? file : `${prefix}/${file}`;

// Full REST URL: /storage/v1/object/<bucket>/<object-path>
const storageUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`;

// ─── Ensure destination directory exists ─────────────────────────────────────

const destDir = path.dirname(dest);
try {
  fs.mkdirSync(destDir, { recursive: true });
} catch (mkdirErr) {
  console.error(`\n✗  Download failed: could not create destination directory "${destDir}": ${mkdirErr.message}\n`);
  process.exit(1);
}

const tmpDest = `${dest}.${process.pid}.tmp`;

// ─── Download from Supabase Storage ──────────────────────────────────────────

const options = {
  headers: {
    'Authorization': `Bearer ${key}`,
  },
};

const req = https.get(storageUrl, options, (res) => {
  if (res.statusCode !== 200) {
    // Collect response body for the error message
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.error(`\n✗  Download failed: HTTP ${res.statusCode} — ${body.trim()}\n`);
      process.exit(1);
    });
    res.on('error', (e) => {
      console.error(`\n✗  Download failed: HTTP ${res.statusCode} — (error reading body: ${e.message})\n`);
      process.exit(1);
    });
    return;
  }

  const out = fs.createWriteStream(tmpDest);

  res.pipe(out);

  out.on('finish', () => {
    out.close(() => {
      try {
        fs.renameSync(tmpDest, dest);
      } catch (renameErr) {
        console.error(`\n✗  Download failed: could not rename tmp file to destination: ${renameErr.message}\n`);
        // Clean up orphaned tmp file
        try { fs.unlinkSync(tmpDest); } catch (_) {}
        process.exit(1);
      }
      console.log(`✓  Downloaded from storage: ${BUCKET}/${objectPath} → ${dest}`);
    });
  });

  out.on('error', (writeErr) => {
    console.error(`\n✗  Download failed: error writing to "${tmpDest}": ${writeErr.message}\n`);
    try { fs.unlinkSync(tmpDest); } catch (_) {}
    process.exit(1);
  });
});

req.on('error', (reqErr) => {
  console.error(`\n✗  Download failed: ${reqErr.message}\n`);
  process.exit(1);
});
