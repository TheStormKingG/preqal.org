#!/usr/bin/env node
'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

// Data fetched via Supabase MCP
const leads = [
  {
    id: '2ad90bfd-63b3-4977-bfc6-c12e9a00beea',
    created_at: '2026-05-01 15:43:50.305932+00',
    company_name: 'NA',
    contact_person: 'Stefan Gravesande',
    email: 'stefan.gravesande@gmail.com',
    staff_size: '—',
    num_services: 0,
    avg_processes: '—',
    base_tier: null,
    complexity_score: null,
    recommended_tier: null,
    status: 'invited',
    invited_at: '2026-05-01 15:43:50.12+00',
    invited_by: 'Preqal Team',
    business_description: null,
    selected_steps: null,
    tier: null,
    quote_sent_at: null,
    quote_accepted_at: null,
    agreement_sent_at: null,
    onboarding_token: null,
    notes: null,
  },
  {
    id: 'eb6aff51-457b-4682-a708-fe3adbef388d',
    created_at: '2026-05-01 15:42:28.808885+00',
    company_name: 'NA',
    contact_person: 'Stefan Gravesande',
    email: 'stefan.gravesande@gmail.com',
    staff_size: '—',
    num_services: 0,
    avg_processes: '—',
    base_tier: null,
    complexity_score: null,
    recommended_tier: null,
    status: 'invited',
    invited_at: '2026-05-01 15:42:28.621+00',
    invited_by: 'Preqal Team',
    business_description: null,
    selected_steps: null,
    tier: null,
    quote_sent_at: null,
    quote_accepted_at: null,
    agreement_sent_at: null,
    onboarding_token: null,
    notes: null,
  },
  {
    id: '051a50b7-477d-4a6b-b173-bc1810d52d54',
    created_at: '2026-05-01 15:08:49.227208+00',
    company_name: 'NA',
    contact_person: 'Stefan Gravesande',
    email: 'stefan.gravesande@gmail.com',
    staff_size: '—',
    num_services: 0,
    avg_processes: '—',
    base_tier: null,
    complexity_score: null,
    recommended_tier: null,
    status: 'invited',
    invited_at: '2026-05-01 15:08:48.934+00',
    invited_by: 'Preqal Team',
    business_description: null,
    selected_steps: null,
    tier: null,
    quote_sent_at: null,
    quote_accepted_at: null,
    agreement_sent_at: null,
    onboarding_token: null,
    notes: null,
  },
];

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const NAVY        = '0F172A';
const AMBER       = 'D97706';
const AMBER_LIGHT = 'FEF3C7';
const GRAY_BG     = 'F8FAFC';
const WHITE       = 'FFFFFF';
const GRAY_BORDER = 'CBD5E1';
const SLATE       = '334155';

function navyFill()   { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+NAVY } }; }
function grayFill()   { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+GRAY_BG } }; }
function whiteFill()  { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+WHITE } }; }

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
    invited:          'Invited',
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
    case 'invited':         return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE0F2FE' } };
    case 'quote_sent':      return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE0F2FE' } };
    case 'quote_accepted':  return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFE0E7FF' } };
    case 'onboarding_sent': return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF3E8FF' } };
    case 'onboarded':       return { type:'pattern', pattern:'solid', fgColor:{ argb:'FFD1FAE5' } };
    default:                return whiteFill();
  }
}

async function main() {
  console.log('Generating REG-02 with ' + leads.length + ' lead(s)…');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal';
  wb.created = new Date();

  const ws = wb.addWorksheet('Qualified Leads Register', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'frozen', ySplit: 3 }],
  });

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

  const HEADERS = [
    'Lead ID', 'Company', 'Contact', 'Email',
    'Steps', 'Rec. Tier', 'Conf. Tier', 'Status',
    'Submitted', 'Quote Sent', 'Quote Accepted', 'Onboarding Sent', 'Onboarded',
  ];
  const COL_WIDTHS = [12, 28, 22, 30, 8, 10, 10, 16, 14, 14, 16, 18, 14];

  const headerRow = ws.addRow(HEADERS);
  headerRow.eachCell((cell, colIdx) => {
    cell.fill      = navyFill();
    cell.font      = { name:'Arial', size:10, bold:true, color:{ argb:'FF'+WHITE } };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.border    = thinBorder();
    ws.getColumn(colIdx).width = COL_WIDTHS[colIdx - 1] || 14;
  });
  headerRow.height = 24;

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
      if (colIdx === 8) {
        cell.fill = statusFill(lead.status);
        cell.font = { name:'Arial', size:10, bold:true, color:{ argb:'FF'+SLATE } };
      } else {
        cell.fill = isAlt ? grayFill() : whiteFill();
      }
    });
    row.height = 18;
  });

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive:true });

  const outPath = path.join(OUT_DIR, 'REG-02-QUALIFIED-LEADS-REGISTER.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('✓ Saved: ' + outPath);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
