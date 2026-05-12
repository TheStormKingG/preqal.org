#!/usr/bin/env node
'use strict';

/**
 * sync-registers-local.cjs — Mirror Excel register files from Supabase Storage
 * to the local filesystem.
 *
 * Storage layout:
 *   registers/preqal/{filename}.xlsx           → PREQAL_REGISTERS_DIR/{filename}.xlsx
 *   registers/clients/{uuid}/{filename}.xlsx   → CLIENTS_ROOT/{companyName}/06 - Registers/{filename}.xlsx
 *
 * Called from run-sync.sh every 5 minutes via launchd (org.preqal.sync-ims).
 * Also safe to run manually:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/sync-registers-local.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

const SUPABASE_URL         = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const PREQAL_REGISTERS_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers';
const CLIENTS_ROOT         = '/Users/stefangravesande/Documents/Projects/Preqal QMS/CLIENTS';
const XLSX_RE              = /^[A-Za-z0-9._-]+\.xlsx$/;

async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('ERROR: SUPABASE_SERVICE_KEY not set.');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);
  const ts = new Date().toISOString();

  // 1. Build client id → company_name map (one query, avoids N+1)
  const { data: clients, error: cErr } = await sb
    .from('crm_clients')
    .select('id, company_name');
  if (cErr) throw cErr;
  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c.company_name]));

  // 2. List all files in registers bucket
  const { data: preqalFiles, error: lErr1 } = await sb.storage
    .from('registers')
    .list('preqal', { limit: 200 });
  if (lErr1) throw lErr1;

  const { data: clientDirs, error: lErr2 } = await sb.storage
    .from('registers')
    .list('clients', { limit: 200 });
  if (lErr2) throw lErr2;

  // Build a flat list of { storagePath, localDir, filename }
  const jobs = [];

  // Preqal files: registers/preqal/*.xlsx
  for (const f of (preqalFiles || [])) {
    if (!XLSX_RE.test(f.name)) continue;
    jobs.push({
      storagePath: `preqal/${f.name}`,
      localDir:    PREQAL_REGISTERS_DIR,
      filename:    f.name,
    });
  }

  // Client files: registers/clients/{uuid}/*.xlsx
  for (const dir of (clientDirs || [])) {
    const clientId = dir.name;
    const companyName = clientMap[clientId];
    if (!companyName) {
      console.log(`  SKIP unknown clientId ${clientId} — not in crm_clients`);
      continue;
    }
    const { data: clientFiles, error: lErr3 } = await sb.storage
      .from('registers')
      .list(`clients/${clientId}`, { limit: 200 });
    if (lErr3) { console.log(`  WARN ${clientId} — list error: ${lErr3.message}`); continue; }

    const localDir = path.join(CLIENTS_ROOT, companyName, '06 - Registers');
    for (const f of (clientFiles || [])) {
      if (!XLSX_RE.test(f.name)) continue;
      jobs.push({
        storagePath: `clients/${clientId}/${f.name}`,
        localDir,
        filename: f.name,
      });
    }
  }

  if (!jobs.length) {
    console.log(ts, '— no register files in Storage');
    return;
  }

  console.log(ts, `— ${jobs.length} register file(s) to sync`);

  for (const { storagePath, localDir, filename } of jobs) {
    // Ensure local directory exists
    fs.mkdirSync(localDir, { recursive: true });

    const localPath = path.join(localDir, filename);

    // Guard: path must stay inside expected directory
    if (!localPath.startsWith(localDir + path.sep) && localPath !== path.join(localDir, filename)) {
      console.log(`  SKIP ${storagePath} — path escape rejected`);
      continue;
    }

    const { data: blob, error: dlErr } = await sb.storage
      .from('registers')
      .download(storagePath);

    if (dlErr) {
      console.log(`  FAIL ${storagePath} — download error: ${dlErr.message}`);
      continue;
    }

    const buf = Buffer.from(await blob.arrayBuffer());
    const tmp = localPath + '.sync.tmp';
    try {
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, localPath);
      console.log(`  OK   ${storagePath} → ${localPath}`);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ }
      console.log(`  FAIL ${storagePath} — write error: ${e.message}`);
    }
  }
}

main().catch(err => {
  console.error(new Date().toISOString(), 'FATAL:', err.message ?? err);
  process.exit(1);
});
