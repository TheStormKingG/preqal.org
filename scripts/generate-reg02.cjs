#!/usr/bin/env node
'use strict';

/**
 * Preqal — Generate REG-02 Qualified Leads Register
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/generate-reg02.cjs
 *
 * Then sync to Supabase Storage:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/sync-ims-file.cjs public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx
 */

const ExcelJS  = require('exceljs');
const path     = require('path');
const fs       = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('\nERROR: SUPABASE_SERVICE_KEY environment variable is not set.');
  console.error('Usage: SUPABASE_SERVICE_KEY=<service_role_key> node scripts/generate-reg02.cjs\n');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const OUT_DIR = path.join(__dirname, '..', 'public', 'ims');

// Brand colours
const NAVY        = '0F172A';
const AMBER       = 'D97706';
const AMBER_LIGHT = 'FEF3C7';
const GRAY_BG     = 'F8FAFC';
const WHITE       = 'FFFFFF';
const GRAY_BORDER = 'CBD5E1';
const SLATE       = '334155';

function navyFill()       { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+NAVY } }; }
function amberFill()      { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER } }; }
function amberLightFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER_LIGHT } }; }
function grayFill()       { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+GRAY_BG } }; }
function whiteFill()      { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+WHITE } }; }

function thinBorder() {
  const s = { style:'thin', color:{ argb:'FF'+GRAY_BORDER } };
  return { top:s, left:s, bottom:s, right:s };
}

function fmtDate(val) {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtStatus(s) {
  const map = {
    new:              'New',
    quote_sent:       'Quote Sent',
    quote_accepted:   'Quote Accepted',
    onboarding_sent:  'Onboarding Sent',
    onboarded:        'Onboarded',
  };
  return map[s] || s || '';
}

function statusFill(s) {
  switch (s) {
    case 'new':             return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFEF3C7' } };
    case 'quote_sent':      return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE0F2FE' } };
    case 'quote_accepted':  return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE0E7FF' } };
    case 'onboarding_sent': return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF3E8FF' } };
    case 'onboarded':       return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFD1FAE5' } };
    default:                return whiteFill();
  }
}

async function main() {
  console.log('Fetching qualified_leads from Supabase…');

  const { data: leads, error } = await sb
    .from('qualified_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error.message);
    process.exit(1);
  }

  console.log('Retrieved ' + leads.length + ' lead(s).');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal';
  wb.created = new Date();

  const ws = wb.addWorksheet('Qualified Leads Register', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  // ── Title block ─────────────────────────────────────────────────────────────
  const COL_COUNT = 13;
  ws.mergeCells(1, 1, 1, COL_COUNT);
  const titleRow = ws.getRow(1);
  titleRow.getCell(1).value = 'REG-02 — Qualified Leads Register';
  titleRow.getCell(1).font  = { name:'Arial', size:14, bold:true, color:{ argb:'FF'+NAVY } };
  titleRow.getCell(1).alignment = { horizontal:'left', vertical:'middle', indent:1 };
  titleRow.height = 30;

  ws.mergeCells(2, 1, 2, COL_COUNT);
  const subtitleRow = ws.getRow(2);
  subtitleRow.getCell(1).value = 'Preqal · Generated: ' + new Date().toLocaleDateString('en-GB', { dateStyle:'long' }) + ' · Total leads: ' + leads.length;
  subtitleRow.getCell(1).font  = { name:'Arial', size:10, color:{ argb:'FF'+SLATE }, italic:true };
  subtitleRow.getCell(1).alignment = { horizontal:'left', vertical:'middle', indent:1 };
  subtitleRow.height = 20;

  // ── Header row ───────────────────────────────────────────────────────────────
  const HEADERS = [
    'Lead ID', 'Company', 'Contact', 'Email',
    'Steps', 'Rec. Tier', 'Conf. Tier', 'Status',
    'Submitted', 'Quote Sent', 'Quote Accepted', 'Onboarding Sent', 'Onboarded',
  ];
  const COL_WIDTHS = [12, 28, 22, 30, 8, 10, 10, 16, 14, 14, 16, 18, 14];

  const headerRow = ws.addRow(HEADERS); // row 3
  headerRow.eachCell((cell, colIdx) => {
    cell.fill      = navyFill();
    cell.font      = { name:'Arial', size:10, bold:true, color:{ argb:'FF'+WHITE } };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.border    = thinBorder();
    ws.getColumn(colIdx).width = COL_WIDTHS[colIdx - 1] || 14;
  });
  headerRow.height = 24;

  // ── Data rows ────────────────────────────────────────────────────────────────
  leads.forEach((lead, idx) => {
    const isAlt = idx % 2 === 1;
    const row = ws.addRow([
      lead.id ? lead.id.slice(0, 8) + '…' : '',
      lead.company_name    || '',
      lead.contact_person  || '',
      lead.email           || '',
      lead.selected_steps  ? 'Step ' + lead.selected_steps : '',
      lead.recommended_tier ? 'T' + lead.recommended_tier : '',
      lead.tier            ? 'T' + lead.tier : '',
      fmtStatus(lead.status),
      fmtDate(lead.created_at),
      fmtDate(lead.quote_sent_at),
      fmtDate(lead.quote_accepted_at),
      fmtDate(lead.agreement_sent_at),
      lead.status === 'onboarded' ? fmtDate(lead.agreement_sent_at) : '',
    ]);

    row.eachCell((cell, colIdx) => {
      cell.font      = { name:'Arial', size:10, color:{ argb:'FF'+SLATE } };
      cell.alignment = { vertical:'middle', wrapText:false };
      cell.border    = thinBorder();
      // Status column gets colour coding
      if (colIdx === 8) {
        cell.fill = statusFill(lead.status);
        cell.font = { name:'Arial', size:10, bold:true, color:{ argb:'FF'+SLATE } };
      } else {
        cell.fill = isAlt ? grayFill() : whiteFill();
      }
    });
    row.height = 18;
  });

  // ── Save ─────────────────────────────────────────────────────────────────────
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive:true });

  const outPath = path.join(OUT_DIR, 'REG-02-QUALIFIED-LEADS-REGISTER.xlsx');
  await wb.xlsx.writeFile(outPath);

  console.log('\n✓ Saved: ' + outPath);
  console.log('\nNext step — sync to Supabase Storage:');
  console.log('  SUPABASE_SERVICE_KEY=<key> node scripts/sync-ims-file.cjs public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
