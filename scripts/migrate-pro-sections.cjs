#!/usr/bin/env node
'use strict';

/**
 * migrate-pro-sections.cjs
 *
 * One-off migration: converts all PRO (procedure) DOCX files to structured
 * content_html using the canonical 8-section layout:
 *   1. Purpose       — no tables
 *   2. Scope         — no tables
 *   3. Responsibilities — no tables
 *   4. Definitions   — no tables
 *   5. Overview
 *   6. Procedure
 *   7. Communication (of this procedure)
 *   8. Related Documents
 *
 * For each PRO document:
 *   1. Reads the local DOCX from public/ims/
 *   2. Converts to HTML with mammoth
 *   3. Parses headings to identify existing sections
 *   4. Remaps content into the 8 canonical sections
 *   5. Strips tables from sections 1–4 (replaces with plain paragraphs)
 *   6. Serialises to <article data-sec="…"> format
 *   7. Saves to qms_documents.content_html in Supabase
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/migrate-pro-sections.cjs [--apply]
 *
 *   (no flag) = dry run — shows what would be saved, writes nothing
 *   --apply   = writes content_html to DB
 */

const mammoth = require('mammoth');
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const IMS_DIR      = path.resolve(__dirname, '../public/ims');
const APPLY        = process.argv.includes('--apply');

// ─── Canonical 8 sections ────────────────────────────────────────────────────
const SECTIONS = [
  'Purpose',
  'Scope',
  'Responsibilities',
  'Definitions',
  'Overview',
  'Procedure',
  'Communication (of this procedure)',
  'Related Documents',
];

// No-table sections (indices 0–3)
const NO_TABLE_SECTIONS = new Set(['Purpose', 'Scope', 'Responsibilities', 'Definitions']);

// ─── Heading normaliser ───────────────────────────────────────────────────────
// Strips leading number prefixes ("1.", "1.0", "1.0 ") and lowercases.
const decodeEntities = s => s
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
  .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
const norm = s => decodeEntities(s).replace(/^\d+[\.\d]*[\.\s]+/, '').trim().toLowerCase();

// Maps normalised heading text → canonical section name
const SECTION_MAP = new Map([
  ['purpose',                           'Purpose'],
  ['scope',                             'Scope'],
  ['responsibilities',                  'Responsibilities'],
  ['roles and responsibilities',        'Responsibilities'],
  ['roles & responsibilities',          'Responsibilities'],
  ['definitions',                       'Definitions'],
  ['definitions and abbreviations',     'Definitions'],
  ['key definitions',                   'Definitions'],
  ['terms and definitions',             'Definitions'],
  ['overview',                          'Overview'],
  ['process overview',                  'Overview'],
  ['procedure',                         'Procedure'],
  ['procedure steps',                   'Procedure'],
  ['process',                           'Procedure'],
  ['communication',                     'Communication (of this procedure)'],
  ['communication of this procedure',   'Communication (of this procedure)'],
  ['communication (of this procedure)', 'Communication (of this procedure)'],
  ['related documents',                 'Related Documents'],
  ['references',                        'Related Documents'],
  ['related documents and references',  'Related Documents'],
  ['records',                           'Related Documents'],
]);

function matchSection(headingText) {
  return SECTION_MAP.get(norm(headingText)) || null;
}

// ─── HTML utilities ───────────────────────────────────────────────────────────
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Returns true if this element is a heading matching one of our sections.
function isHeadingEl(tag) {
  return /^h[1-6]$/.test(tag);
}

// Detects bold-only paragraph: <p> whose only non-empty child is <strong>/<b>
function boldOnlyText(outerHtml) {
  const m = outerHtml.match(/^<p[^>]*>\s*<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>\s*<\/p>$/i);
  return m ? m[1].trim() : null;
}

// Extract the visible text from an HTML string (strips all tags).
function textContent(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,  '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Convert a <table> block to plain paragraphs (term: definition style).
// For 2-column tables: each row → "<p><strong>col1</strong> — col2</p>"
// For other tables:    each row → "<p>cell1 | cell2 | ...</p>"
function tableToParas(tableHtml) {
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm;
  while ((rm = rowRe.exec(tableHtml)) !== null) {
    const cells = [];
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cm;
    while ((cm = cellRe.exec(rm[1])) !== null) {
      cells.push(textContent(cm[1]));
    }
    if (cells.length === 0 || cells.every(c => !c)) continue;
    if (cells.length === 2 && cells[0]) {
      rows.push(`<p><strong>${esc(cells[0])}</strong>${cells[1] ? ' — ' + esc(cells[1]) : ''}</p>`);
    } else {
      rows.push(`<p>${cells.filter(Boolean).map(esc).join(' | ')}</p>`);
    }
  }
  return rows.join('\n');
}

// Strip all <table>…</table> blocks from HTML, replacing each with plain paragraphs.
function stripTables(html) {
  return html.replace(/<table[\s\S]*?<\/table>/gi, match => tableToParas(match));
}

// ─── Section parser ───────────────────────────────────────────────────────────
// Splits mammoth HTML into {sectionName → innerHTML} map.
// Detects H1–H4 headings and bold-only <p> headings.
function parseSections(html) {
  const map     = new Map();
  // Tokenise into block-level elements using a simple tag scanner
  const blocks  = [];
  const blockRe = /<(h[1-6]|p|ul|ol|table|blockquote|div|pre)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<(hr|br)[^>]*\/?>/gi;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    blocks.push(m[0]);
  }

  let current = null;
  let bucket  = [];

  const flush = () => {
    if (current && bucket.length) {
      const existing = map.get(current) || '';
      map.set(current, existing + bucket.join('\n'));
    }
    bucket = [];
  };

  for (const block of blocks) {
    const tagM = block.match(/^<([a-z][a-z0-9]*)/i);
    const tag  = tagM ? tagM[1].toLowerCase() : '';

    let matched = null;

    if (isHeadingEl(tag)) {
      matched = matchSection(textContent(block));
    } else if (tag === 'p') {
      const boldText = boldOnlyText(block);
      if (boldText) matched = matchSection(boldText);
    }

    if (matched) {
      flush();
      current = matched;
    } else if (current) {
      bucket.push(block);
    }
  }
  flush();

  return map;
}

// ─── Serialiser ───────────────────────────────────────────────────────────────
function serialise(sectionMap) {
  return SECTIONS.map(name => {
    let inner = sectionMap.get(name) || '';
    if (NO_TABLE_SECTIONS.has(name)) inner = stripTables(inner);
    // Trim leading/trailing whitespace and empty paragraphs
    inner = inner.replace(/(<p[^>]*>\s*<\/p>\s*)+$/g, '').trim();
    return `<article data-sec="${esc(name)}">${inner}</article>`;
  }).join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('\nERROR: SUPABASE_SERVICE_KEY is not set.\n');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);

  const { data: docs, error } = await sb
    .from('qms_documents')
    .select('id, doc_id, title, file_url')
    .eq('category', 'PRO')
    .is('client_id', null)
    .order('doc_id');

  if (error) { console.error('Supabase error:', error.message); process.exit(1); }
  if (!docs?.length) { console.log('No PRO documents found.'); return; }

  console.log(`\n${APPLY ? '🔧' : '🔍'}  ${APPLY ? 'Migrating' : 'Previewing'} ${docs.length} PRO documents…\n`);

  const results = [];

  for (const doc of docs) {
    const filename = (doc.file_url || '').split('/').pop();
    if (!filename?.endsWith('.docx')) {
      results.push({ id: doc.doc_id, title: doc.title, status: 'SKIP', detail: 'No DOCX file_url' });
      continue;
    }

    const localPath = path.join(IMS_DIR, filename);
    if (!fs.existsSync(localPath)) {
      results.push({ id: doc.doc_id, title: doc.title, status: 'SKIP', detail: `File not found: ${filename}` });
      continue;
    }

    // Convert DOCX → HTML with mammoth
    let html;
    try {
      const result = await mammoth.convertToHtml({ path: localPath });
      html = result.value;
      if (result.messages.length) {
        const warns = result.messages.filter(m => m.type === 'warning').length;
        if (warns) console.log(`  ⚠️  ${doc.doc_id}: ${warns} mammoth warning(s)`);
      }
    } catch (e) {
      results.push({ id: doc.doc_id, title: doc.title, status: 'FAIL', detail: `mammoth error: ${e.message}` });
      continue;
    }

    // Parse into sections
    const sectionMap = parseSections(html);
    const found = SECTIONS.filter(s => sectionMap.has(s));
    const missing = SECTIONS.filter(s => !sectionMap.has(s));

    // Serialise to article format
    const contentHtml = serialise(sectionMap);

    if (!APPLY) {
      results.push({
        id: doc.doc_id, title: doc.title, status: 'WOULD_MIGRATE',
        detail: `Found: [${found.join(', ')}]${missing.length ? `  |  Empty: [${missing.join(', ')}]` : ''}`,
      });
      continue;
    }

    // Save to DB
    const { error: dbErr } = await sb
      .from('qms_documents')
      .update({ content_html: contentHtml, updated_at: new Date().toISOString() })
      .eq('id', doc.id);

    if (dbErr) {
      results.push({ id: doc.doc_id, title: doc.title, status: 'FAIL', detail: `DB error: ${dbErr.message}` });
    } else {
      results.push({
        id: doc.doc_id, title: doc.title, status: 'MIGRATED',
        detail: `${found.length}/8 sections mapped${missing.length ? `  |  Empty: [${missing.join(', ')}]` : ''}`,
      });
    }
  }

  // Report
  const C_ID = 8, C_TIT = 40, C_ST = 14;
  console.log('  ' + 'Doc ID'.padEnd(C_ID) + 'Title'.padEnd(C_TIT) + 'Status'.padEnd(C_ST) + 'Detail');
  console.log('  ' + '─'.repeat(C_ID + C_TIT + C_ST + 60));
  const ICON = { MIGRATED: '✅', WOULD_MIGRATE: '📝', SKIP: '⟳ ', FAIL: '✗ ' };
  for (const r of results) {
    const icon = ICON[r.status] || '  ';
    console.log('  ' + r.id.padEnd(C_ID) + r.title.slice(0, C_TIT - 1).padEnd(C_TIT) + (icon + ' ' + r.status).padEnd(C_ST + 3) + r.detail);
  }

  const done = results.filter(r => r.status === 'MIGRATED').length;
  const would = results.filter(r => r.status === 'WOULD_MIGRATE').length;
  console.log('\n' + '─'.repeat(80));
  if (!APPLY) {
    console.log(`\n  ${would} document(s) ready to migrate.\n  Run with --apply to write content_html to Supabase.\n`);
  } else {
    console.log(`\n  Migrated: ${done}/${docs.length}\n`);
  }
}

main().catch(err => { console.error('\n✗', err.message || err); process.exit(1); });
