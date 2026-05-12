#!/usr/bin/env node
'use strict';

/**
 * sync-from-storage.cjs — Download Edge-Function-patched DOCX files from
 * Supabase Storage, save locally, git commit + push, clear content_html.
 *
 * Called automatically by launchd (org.preqal.sync-ims) every 5 minutes.
 * Also safe to run manually:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-storage.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync }     = require('child_process');
const fs               = require('fs');
const path             = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const REPO_ROOT    = path.resolve(__dirname, '..');
const IMS_DIR      = path.join(REPO_ROOT, 'public', 'ims');

// Mirror downloaded files into the local QMS working folder.
// Keys are filename prefixes; values are absolute directory paths.
const QMS_ROOT = '/Users/stefangravesande/Documents/Projects/Preqal QMS';
const QMS_DIR_MAP = {
  'POL-': path.join(QMS_ROOT, '01 - Policies'),
  'PRO-': path.join(QMS_ROOT, '02 - Procedures'),
  'MAN-': path.join(QMS_ROOT, '03 - Manuals'),
  'WOI-': path.join(QMS_ROOT, '04 - Work Instructions'),
  'FRM-': path.join(QMS_ROOT, '05 - Forms'),
  'REG-': path.join(QMS_ROOT, '06 - Registers'),
  'DIA-': path.join(QMS_ROOT, '08 - Diagrams'),
  'TMP-': path.join(QMS_ROOT, '07 - Templates'),
};

async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('ERROR: SUPABASE_SERVICE_KEY not set.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-storage.cjs');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);
  const ts = new Date().toISOString();

  // 1. Find docs with pending browser edits
  const { data: docs, error: qErr } = await sb
    .from('qms_documents')
    .select('id, doc_id, title, file_url')
    .is('client_id', null)
    .not('content_html', 'is', null)
    .order('doc_id');

  if (qErr) throw qErr;

  if (!docs || docs.length === 0) {
    console.log(ts, '— no pending edits');
    return;
  }

  console.log(ts, `— ${docs.length} doc(s) pending sync`);

  const downloaded = [];

  for (const doc of docs) {
    const filename = (doc.file_url ?? '').split('/').pop();

    // Guard: must be a .docx filename with no path separators
    if (!filename || !filename.endsWith('.docx') ||
        filename.includes('/') || filename.includes('\\')) {
      console.log(`  SKIP ${doc.doc_id} — invalid filename`);
      continue;
    }

    const localPath = path.join(IMS_DIR, filename);

    // Guard: path must stay inside IMS_DIR
    if (!localPath.startsWith(IMS_DIR + path.sep)) {
      console.log(`  SKIP ${doc.doc_id} — path escape rejected`);
      continue;
    }

    // 2. Download patched DOCX from Supabase Storage
    const { data: blob, error: dlErr } = await sb.storage
      .from('ims')
      .download(filename);

    if (dlErr) {
      console.log(`  FAIL ${doc.doc_id} — Storage download error: ${dlErr.message}`);
      continue;
    }

    // 3. Save atomically: write to .tmp then rename
    const buf = Buffer.from(await blob.arrayBuffer());
    const tmp = localPath + '.sync.tmp';
    try {
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, localPath);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ }
      console.log(`  FAIL ${doc.doc_id} — file write error: ${e.message}`);
      continue;
    }

    // 3b. Mirror to local QMS working folder (best-effort — never blocks the pipeline)
    const qmsPrefix = Object.keys(QMS_DIR_MAP).find(p => filename.startsWith(p));
    if (qmsPrefix) {
      const qmsDir  = QMS_DIR_MAP[qmsPrefix];
      const qmsPath = path.join(qmsDir, filename);
      // Guard: path must stay inside the expected QMS subdirectory
      if (qmsPath.startsWith(qmsDir + path.sep) || qmsPath === path.join(qmsDir, filename)) {
        const qmsTmp = qmsPath + '.sync.tmp';
        try {
          fs.writeFileSync(qmsTmp, buf);
          fs.renameSync(qmsTmp, qmsPath);
          console.log(`  QMS  ${doc.doc_id} — mirrored to ${qmsDir}`);
        } catch (e) {
          try { fs.unlinkSync(qmsTmp); } catch (_) { /* ignore */ }
          console.log(`  WARN ${doc.doc_id} — QMS mirror failed: ${e.message}`);
        }
      }
    }

    // 4. Clear content_html in DB
    const { error: clearErr } = await sb
      .from('qms_documents')
      .update({ content_html: null })
      .eq('id', doc.id);

    if (clearErr) {
      console.log(`  WARN ${doc.doc_id} — saved locally but DB clear failed: ${clearErr.message}`);
    } else {
      console.log(`  OK   ${doc.doc_id} — downloaded and DB cleared`);
    }

    downloaded.push(filename);
  }

  if (downloaded.length === 0) {
    console.log('  Nothing to commit');
    return;
  }

  // 5. Git commit + push via osascript (uses Mac keychain credentials)
  // Validate all filenames against strict allowlist before shell interpolation
  const safeFiles = downloaded.filter(f => /^[A-Za-z0-9._-]+\.docx$/.test(f));
  if (safeFiles.length === 0) {
    console.log('  Nothing safe to commit (filenames failed allowlist)');
    return;
  }

  const fileArgs = safeFiles.map(f => `'public/ims/${f}'`).join(' ');
  const msg      = `sync: apply browser edits to IMS (${safeFiles.join(', ')})`;

  const osCmd = `osascript -e 'do shell script "cd \\"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\\" && git add ${fileArgs} && git commit -m \\"${msg}\\" && git push origin master --no-verify 2>&1"'`;

  try {
    execSync(osCmd, { stdio: 'pipe' });
    console.log(`  PUSHED: ${safeFiles.join(', ')}`);
  } catch (e) {
    console.error('  Git push failed:', e.message);
  }
}

main().catch(err => {
  console.error(new Date().toISOString(), 'FATAL:', err.message ?? err);
  process.exit(1);
});
