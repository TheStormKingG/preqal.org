#!/usr/bin/env node
'use strict';
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const REG_DEFS = require('./lib/register-defs.cjs');

const SUPABASE_URL    = process.env.SUPABASE_URL    ?? 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const SUPABASE_BUCKET = 'registers';

async function main() {
  const regId = process.argv[2];
  if (!regId) {
    console.error('Usage: regenerate-register.cjs REG-XX');
    process.exit(1);
  }
  const def = REG_DEFS.find(d => d.id === regId);
  if (!def) {
    console.error(`Unknown register: ${regId}`);
    process.exit(1);
  }

  // Delegate the actual XLSX build to generate-excel-registers.cjs.
  // It honours SUPABASE_SERVICE_KEY from the environment and writes to
  // PUB_DIR (public/ims/) AND OUT_DIR (Preqal QMS folder).
  execSync(`node "${path.join(__dirname, 'generate-excel-registers.cjs')}" ${regId}`, { stdio: 'inherit' });

  // Upload the produced file to Supabase Storage.
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('SUPABASE_SERVICE_KEY required for upload');
    process.exit(1);
  }
  const sb = createClient(SUPABASE_URL, key);

  const pubPath = path.resolve(__dirname, '../public/ims', def.file);
  if (!fs.existsSync(pubPath)) {
    console.error(`Expected file not found after build: ${pubPath}`);
    process.exit(1);
  }
  const buf = fs.readFileSync(pubPath);
  const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(
    `preqal/${def.file}`,
    buf,
    {
      upsert: true,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  );
  if (error) throw error;
  console.log(`✓ uploaded ${def.file} to storage://${SUPABASE_BUCKET}/preqal/${def.file}`);
}

main().catch(e => { console.error(e); process.exit(1); });
