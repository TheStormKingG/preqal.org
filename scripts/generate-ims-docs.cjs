#!/usr/bin/env node
'use strict';

/**
 * Preqal IMS — Branded Word Document Generator
 * Generates SOP-01 through SOP-10 and REG-01 as .docx files
 * with Preqal brand colours, Arial font, and clear Human/Agentic role labelling.
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, Header, TabStopType
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────────────────
const C = {
  NAVY:        '0F172A',
  NAVY_MID:    '1E293B',
  AMBER:       'D97706',
  AMBER_LIGHT: 'FEF3C7',
  AMBER_MID:   'F59E0B',
  GRAY_BG:     'F8FAFC',
  GRAY_BORDER: 'CBD5E1',
  GRAY_TEXT:   '64748B',
  SLATE:       '334155',
  WHITE:       'FFFFFF',
};

// US Letter, 0.75″ margins
const PAGE_W = 12240;
const PAGE_H = 15840;
const MAR    = 1080;
const CW     = PAGE_W - 2 * MAR; // 10080

// ─────────────────────────────────────────────────────────
// BORDER HELPERS
// ─────────────────────────────────────────────────────────
function singleBorder(color = C.GRAY_BORDER, size = 1) {
  return { style: BorderStyle.SINGLE, size, color };
}
function allBorders(color = C.GRAY_BORDER, size = 1) {
  const b = singleBorder(color, size);
  return { top: b, bottom: b, left: b, right: b };
}

// ─────────────────────────────────────────────────────────
// TEXT HELPERS
// ─────────────────────────────────────────────────────────
function tr(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 22, ...opts });
}
function trBold(text, color = C.SLATE, size = 22) {
  return tr(text, { bold: true, color, size });
}

// ─────────────────────────────────────────────────────────
// PARAGRAPH FACTORIES
// ─────────────────────────────────────────────────────────
function blankLine(before = 60, after = 60) {
  return new Paragraph({ children: [], spacing: { before, after } });
}

function headerBanner(left, right) {
  return new Paragraph({
    children: [
      tr('PREQAL', { size: 24, bold: true, color: C.AMBER }),
      tr('  ·  ', { size: 22, color: '475569' }),
      tr(left,   { size: 20, color: 'CBD5E1' }),
      tr('\t',   { size: 18 }),
      tr(right,  { size: 16, color: '94A3B8', italics: true }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: CW - 200 }],
    border: { bottom: singleBorder('E2E8F0', 1) },
    spacing: { before: 80, after: 80 },
  });
}

function footerLine(docNo) {
  return new Paragraph({
    children: [
      tr(docNo + '  ·  v1.0  ·  2026-05-07', { size: 18, color: '94A3B8' }),
      tr('\t', { size: 18 }),
      tr('Page ', { size: 18, color: '94A3B8' }),
      new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '94A3B8' }),
      tr(' / ', { size: 18, color: '94A3B8' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 18, color: '94A3B8' }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: CW - 200 }],
    border: { top: singleBorder('E2E8F0', 1) },
    spacing: { before: 80, after: 60 },
  });
}

function navyBanner(text) {
  return new Paragraph({
    children: [tr(text, { size: 22, bold: true, color: C.WHITE })],
    shading: { fill: C.NAVY, type: ShadingType.CLEAR },
    spacing: { before: 140, after: 140 },
    indent: { left: 200 },
  });
}

function docTitle(text) {
  return new Paragraph({
    children: [tr(text, { size: 44, bold: true, color: C.NAVY })],
    spacing: { before: 240, after: 60 },
  });
}

function docSubtitle(text) {
  return new Paragraph({
    children: [tr(text, { size: 24, color: C.GRAY_TEXT })],
    spacing: { before: 0, after: 200 },
  });
}

function sectionHeading(num, title) {
  return new Paragraph({
    children: [
      tr(num + '. ', { size: 27, bold: true, color: C.AMBER }),
      tr(title,     { size: 27, bold: true, color: C.NAVY }),
    ],
    spacing: { before: 320, after: 100 },
    border: { bottom: singleBorder(C.AMBER, 4) },
  });
}

function subHeading(text) {
  return new Paragraph({
    children: [tr(text, { size: 22, bold: true, color: C.NAVY })],
    spacing: { before: 160, after: 60 },
    shading: { fill: C.GRAY_BG, type: ShadingType.CLEAR },
    indent: { left: 0 },
  });
}

function phaseHeading(text) {
  return new Paragraph({
    children: [tr('◆  ' + text, { size: 24, bold: true, color: C.WHITE })],
    spacing: { before: 200, after: 100 },
    shading: { fill: C.NAVY_MID, type: ShadingType.CLEAR },
    indent: { left: 180, right: 180 },
  });
}

function stepGroupHeading(text) {
  return new Paragraph({
    children: [tr(text, { size: 22, bold: true, color: C.SLATE })],
    spacing: { before: 180, after: 60 },
    border: { left: singleBorder(C.AMBER_MID, 6) },
    indent: { left: 120 },
  });
}

function bodyPara(text, opts = {}) {
  return new Paragraph({
    children: [tr(text)],
    spacing: { before: 40, after: 60 },
    ...opts,
  });
}

function bulletPara(text) {
  return new Paragraph({
    children: [tr(text)],
    spacing: { before: 30, after: 30 },
    indent: { left: 540, hanging: 360 },
    bullet: { level: 0 },
  });
}

function numberedStepPara(stepLabel, text) {
  // stepLabel e.g. "1.1."
  return new Paragraph({
    children: [
      tr(stepLabel + '  ', { bold: true, color: C.AMBER }),
      tr(text),
    ],
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
  });
}

function calloutBox(text) {
  return new Paragraph({
    children: [tr(text, { size: 20, italics: true, color: C.GRAY_TEXT })],
    spacing: { before: 100, after: 100 },
    indent: { left: 360, right: 200 },
    border: { left: singleBorder(C.AMBER, 8) },
    shading: { fill: C.AMBER_LIGHT, type: ShadingType.CLEAR },
  });
}

// ─────────────────────────────────────────────────────────
// TABLE FACTORIES
// ─────────────────────────────────────────────────────────
function makeTableRow(cells, colWidths, isHeader = false, rowShade = C.WHITE) {
  const hdrShade = C.NAVY;
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map((text, i) => new TableCell({
      borders: allBorders(C.GRAY_BORDER, 1),
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: isHeader ? hdrShade : rowShade, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [isHeader
          ? tr(text, { size: 20, bold: true, color: C.WHITE })
          : tr(text, { size: 20 })],
        spacing: { before: 0, after: 0 },
      })],
    })),
  });
}

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const tRows = [
    makeTableRow(headers, colWidths, true),
    ...rows.map((r, i) => makeTableRow(r, colWidths, false, i % 2 === 0 ? C.WHITE : C.GRAY_BG)),
  ];
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tRows,
  });
}

function metadataTable(meta) {
  const colW = [2600, CW - 2600];
  const rows = [
    ['Document No',      meta.docNo],
    ['Version',          meta.version],
    ['Effective Date',   meta.date],
    ['Document Owner',   meta.owner],
    ['ISO Reference',    meta.isoRef],
    ['Related Documents',meta.relatedDocs],
    ['Classification',   'Internal — Controlled Document'],
  ];
  const tRows = rows.map(([label, value], i) => new TableRow({
    children: [
      new TableCell({
        borders: allBorders(C.GRAY_BORDER, 1),
        width: { size: colW[0], type: WidthType.DXA },
        shading: { fill: C.NAVY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [tr(label, { size: 20, bold: true, color: C.WHITE })], spacing: { before: 0, after: 0 } })],
      }),
      new TableCell({
        borders: allBorders(C.GRAY_BORDER, 1),
        width: { size: colW[1], type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? C.WHITE : C.GRAY_BG, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [tr(value, { size: 20 })], spacing: { before: 0, after: 0 } })],
      }),
    ],
  }));
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: colW,
    rows: tRows,
  });
}

// ─────────────────────────────────────────────────────────
// MARKDOWN PARSER
// ─────────────────────────────────────────────────────────
function parseMeta(text) {
  const meta = { docNo: '', version: '1.0', date: '2026-05-07', owner: 'Dr. Stefan Gravesande', isoRef: '', relatedDocs: '' };
  for (const line of text.split('\n').slice(0, 25)) {
    const m = line.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
    if (!m) continue;
    const k = m[1].toLowerCase().trim();
    const v = m[2].trim();
    if (k === 'document no')         meta.docNo       = v;
    else if (k === 'version')        meta.version     = v;
    else if (k === 'effective date') meta.date        = v;
    else if (k === 'owner')          meta.owner       = v;
    else if (k === 'iso reference')  meta.isoRef      = v;
    else if (k === 'related documents') meta.relatedDocs = v;
  }
  return meta;
}

function parseMarkdownTable(text) {
  const lines = text.trim().split('\n').filter(l => l.trim().startsWith('|'));
  const result = [];
  for (const line of lines) {
    if (line.match(/^\|[\s\-:|]+\|/)) continue; // separator
    const cells = line.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*/g, ''));
    if (cells.length > 0) result.push(cells);
  }
  return result; // first row = headers
}

function renderMarkdownTableInline(text) {
  const rows = parseMarkdownTable(text);
  if (rows.length < 2) return null;
  const headers = rows[0];
  const data    = rows.slice(1);
  const base    = Math.floor(CW / headers.length);
  const colW    = headers.map((_, i) => i === headers.length - 1 ? CW - base * (headers.length - 1) : base);
  return makeTable(headers, data, colW);
}

// Render roles section with Human/Agentic sub-tables
function renderRoles(text) {
  const elems = [];

  const humanMatch = text.match(/###\s+Human Roles([\s\S]*?)(?=###\s+Agentic|$)/i);
  const agentMatch = text.match(/###\s+Agentic Roles([\s\S]*?)(?=###|$)/i);
  const noteMatch  = text.match(/>\s*\*\*Agentic note[^:]*:\*\*\s*([\s\S]+?)(?=\n\n|\n---|\n##|$)/i);

  if (humanMatch && humanMatch[1].trim()) {
    elems.push(subHeading('🧑  Human Employee Roles'));
    const rows = parseMarkdownTable(humanMatch[1]);
    if (rows.length >= 2) {
      const headers = rows[0];
      const data    = rows.slice(1).map(r => [...r, 'Human Employee']);
      const nCols   = headers.length + 1;
      const baseW   = Math.floor((CW - 1800) / headers.length);
      const colW    = [...headers.map(() => baseW), 1800];
      elems.push(makeTable([...headers, 'Type'], data, colW));
    }
    elems.push(blankLine(60, 40));
  }

  if (agentMatch && agentMatch[1].trim()) {
    elems.push(subHeading('🤖  Agentic Employee Roles'));
    const rows = parseMarkdownTable(agentMatch[1]);
    if (rows.length >= 2) {
      const headers = rows[0];
      const data    = rows.slice(1).map(r => [...r, 'Agentic Employee']);
      const baseW   = Math.floor((CW - 1800) / headers.length);
      const colW    = [...headers.map(() => baseW), 1800];
      elems.push(makeTable([...headers, 'Type'], data, colW));
    }
    elems.push(blankLine(60, 40));
  }

  if (noteMatch) {
    elems.push(calloutBox('⚠  Agentic Note: ' + noteMatch[1].replace(/\s+/g, ' ').trim()));
  }

  return elems;
}

// Generic section renderer
function renderGenericSection(text) {
  const elems = [];
  const lines = text.split('\n');

  let tableBuffer = [];
  let inTable = false;

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      const t = renderMarkdownTableInline(tableBuffer.join('\n'));
      if (t) { elems.push(t); elems.push(blankLine(40, 60)); }
    }
    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();

    // ── Table
    if (trim.startsWith('|')) {
      inTable = true;
      tableBuffer.push(trim);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trim) continue;

    // ── Phase heading: ### Phase N
    if (trim.match(/^###\s+Phase\s+\d+/i)) {
      elems.push(phaseHeading(trim.replace(/^#+\s+/, '')));
      continue;
    }

    // ── Step group: #### Step N or ### Step N
    if (trim.match(/^#{3,4}\s+Step\s+\d+/i)) {
      elems.push(stepGroupHeading(trim.replace(/^#+\s+/, '')));
      continue;
    }

    // ── Any other ### heading
    if (trim.startsWith('###')) {
      elems.push(subHeading(trim.replace(/^#+\s+/, '')));
      continue;
    }

    // ── Numbered steps: 1.1. / 1.2.1.
    const stepMatch = trim.match(/^(\d+\.\d+(?:\.\d+)?)\.\s+([\s\S]+)/);
    if (stepMatch) {
      elems.push(numberedStepPara(stepMatch[1] + '.', stepMatch[2]));
      continue;
    }

    // ── Checkbox: - [ ]
    if (trim.startsWith('- [ ]')) {
      elems.push(bulletPara('☐  ' + trim.slice(5).trim()));
      continue;
    }

    // ── Bullet
    if (trim.startsWith('- ')) {
      elems.push(bulletPara(trim.slice(2)));
      continue;
    }

    // ── Callout / blockquote
    if (trim.startsWith('>')) {
      elems.push(calloutBox(trim.slice(1).trim().replace(/\*\*/g, '')));
      continue;
    }

    // ── Bold label: **Key:** value
    const boldLabel = trim.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
    if (boldLabel) {
      elems.push(new Paragraph({
        children: [
          trBold(boldLabel[1].replace(/\*\*/g, ''), C.SLATE),
          tr(boldLabel[2] ? ': ' + boldLabel[2] : ''),
        ],
        spacing: { before: 60, after: 40 },
      }));
      continue;
    }

    // ── Plain text
    elems.push(bodyPara(trim));
  }

  if (inTable) flushTable();
  return elems;
}

// ─────────────────────────────────────────────────────────
// SOP DOCUMENT BUILDER
// ─────────────────────────────────────────────────────────
function buildSOPDocument(markdownText) {
  const meta = parseMeta(markdownText);

  // Extract full title
  const titleMatch = markdownText.match(/^#\s+(.+)/m);
  const fullTitle  = titleMatch ? titleMatch[1].trim() : meta.docNo;
  const shortTitle = fullTitle.replace(/^SOP-\d+[: ]+/, '');

  // Extract sections by ## N. Title
  const secRx = /^##\s+(\d+)\.\s+(.+)$([\s\S]*?)(?=^##\s+\d+\.|^---$|\Z)/gm;
  const sections = [];
  let m;
  while ((m = secRx.exec(markdownText)) !== null) {
    sections.push({ num: m[1], title: m[2].trim(), body: m[3].trim() });
  }

  // ── Build children ──────────────────────────────────────
  const children = [];

  children.push(navyBanner('PREQAL INTEGRATED MANAGEMENT SYSTEM  ·  Controlled Document — Internal Use Only'));
  children.push(blankLine(120, 60));
  children.push(docTitle(fullTitle));
  children.push(docSubtitle('Standard Operating Procedure'));
  children.push(blankLine(40, 80));
  children.push(metadataTable(meta));
  children.push(blankLine(120, 40));

  for (const sec of sections) {
    const n = parseInt(sec.num, 10);
    children.push(sectionHeading(sec.num, sec.title));

    let elems;
    if (n === 4) {
      elems = renderRoles(sec.body);
    } else {
      elems = renderGenericSection(sec.body);
    }
    children.push(...elems);
    children.push(blankLine(40, 40));
  }

  // ── Assemble document ───────────────────────────────────
  return new Document({
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE_W, height: PAGE_H },
          margin: { top: MAR, right: MAR, bottom: MAR, left: MAR },
        },
      },
      headers: {
        default: new Header({
          children: [headerBanner(meta.docNo + ' — ' + shortTitle, 'Confidential — Internal Use Only')],
        }),
      },
      footers: {
        default: new Footer({ children: [footerLine(meta.docNo)] }),
      },
      children,
    }],
  });
}

// ─────────────────────────────────────────────────────────
// REG-01 DOCUMENT BUILDER
// ─────────────────────────────────────────────────────────
function buildREGDocument(markdownText) {
  const meta = {
    docNo: 'REG-01',
    version: '1.0',
    date: '2026-05-07',
    owner: 'Dr. Stefan Gravesande',
    isoRef: 'ISO 9001:2015 — Clause 7.5 (Documented Information)',
    relatedDocs: 'All SOPs, All Forms, All Templates',
  };

  const children = [];

  children.push(navyBanner('PREQAL INTEGRATED MANAGEMENT SYSTEM  ·  Controlled Document — Internal Use Only'));
  children.push(blankLine(120, 60));
  children.push(docTitle('REG-01: Document Master List'));
  children.push(docSubtitle('Integrated Management System — Document Register'));
  children.push(blankLine(40, 80));
  children.push(metadataTable(meta));
  children.push(blankLine(120, 40));

  // Purpose
  children.push(sectionHeading('1', 'Purpose'));
  children.push(bodyPara(
    'This register is the single source of truth for all documented information within Preqal\'s Integrated Management System (IMS). It lists every document, template, form, register, policy, SOP, and diagram that governs how Preqal operates — for both human staff and agentic (AI) workers.'
  ));
  children.push(bodyPara('Every document listed here must be:'));
  children.push(bulletPara('Stored in a defined, retrievable location'));
  children.push(bulletPara('Versioned with an effective date'));
  children.push(bulletPara('Reviewed at least annually or upon process change'));
  children.push(bulletPara('Accessible to all relevant personnel (human or agentic)'));
  children.push(blankLine());

  // Categories
  const categories = [
    {
      heading: '2. Process Flow Diagrams (DIA)',
      headers: ['Doc No', 'Title', 'Version', 'Location', 'Status'],
      colW: [1200, 3600, 900, 2880, 1500],
      rows: [
        ['DIA-01', 'Preqal Client Journey Process Flow', '1.0', 'docs/operations/process-flow/', 'Active'],
      ],
    },
    {
      heading: '3. Standard Operating Procedures (SOP)',
      headers: ['Doc No', 'Title', 'ISO Clause', 'Version', 'Owner', 'Status'],
      colW: [1000, 3380, 1200, 800, 2200, 1500],
      rows: [
        ['SOP-01', 'Marketing & Lead Generation', '8.2.1', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-02', 'Lead Capture & Classification', '8.2.2 / 8.2.3', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-03', 'Quote Generation & Proposal', '8.2.3', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-04', 'Contract Execution & Sign-off', '8.4', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-05', 'Client Onboarding (Form 2)', '8.5.1', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-06', 'Project Scoping & Delivery', '8.5.1 / 8.5.2', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-07', 'Project Closure & Handover', '8.5.5 / 9.1.2', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-08', 'Billing & Accounts Receivable', '8.5.5', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-09', 'Renewal, Upsell & Client Retention', '9.1.2 / 10.3', '1.0', 'Dr. Gravesande', 'Active'],
        ['SOP-10', 'Admin Dashboard Operations', '7.5 / 9.1', '1.0', 'Dr. Gravesande', 'Active'],
      ],
    },
    {
      heading: '4. Forms (FORM)',
      headers: ['Doc No', 'Title', 'Delivery', 'System Record', 'Status'],
      colW: [1000, 2400, 2800, 2580, 1300],
      rows: [
        ['FORM-01', 'Business Growth Assessment', 'Web: /business-growth-assessment', 'Supabase: template_leads, quote_submissions', 'Active'],
        ['FORM-02', 'Client Onboarding & Context Capture', 'Token-gated: /client-onboarding.html?token=', 'Supabase: client_onboarding, crm_clients', 'Active'],
      ],
    },
    {
      heading: '5. Templates (TPL)',
      headers: ['Doc No', 'Title', 'Format', 'Used In', 'Status'],
      colW: [1000, 2800, 1600, 1580, 3100],
      rows: [
        ['TPL-01', 'Quote Template', 'Google Docs / PDF', 'SOP-03', 'Pending creation'],
        ['TPL-02', 'Service Proposal Template', 'Google Docs / PDF', 'SOP-03', 'Pending creation'],
        ['TPL-03', 'Service Agreement / Contract Template', 'Google Docs / PDF', 'SOP-04', 'Pending creation'],
        ['TPL-04', 'Invoice Template', 'Google Docs / PDF', 'SOP-08', 'Pending creation'],
        ['TPL-05', 'Lead Notification Email', 'EmailJS', 'SOP-02', 'Pending creation'],
        ['TPL-06', 'Proposal Cover Email', 'EmailJS', 'SOP-03', 'Pending creation'],
        ['TPL-07', 'Contract Welcome Email', 'EmailJS', 'SOP-04', 'Pending creation'],
        ['TPL-08', 'Onboarding Invitation Email', 'EmailJS', 'SOP-05', 'Active (partial)'],
        ['TPL-09', 'Project Kickoff Agenda', 'Google Docs', 'SOP-06', 'Pending creation'],
        ['TPL-10', 'Weekly Status Report', 'Google Docs / Email', 'SOP-06', 'Pending creation'],
        ['TPL-11', 'Project Closure Report', 'Google Docs / PDF', 'SOP-07', 'Pending creation'],
        ['TPL-12', 'Invoice Cover Email', 'EmailJS', 'SOP-08', 'Pending creation'],
        ['TPL-13', 'Payment Reminder Email', 'EmailJS', 'SOP-08', 'Pending creation'],
        ['TPL-14', 'Renewal Reminder Email (T-30)', 'EmailJS', 'SOP-09', 'Pending creation'],
      ],
    },
    {
      heading: '6. Registers (REG)',
      headers: ['Doc No', 'Title', 'Format', 'Updated By', 'Frequency', 'Status'],
      colW: [900, 2700, 1600, 1400, 1380, 1100],
      rows: [
        ['REG-01', 'Document Master List', 'Markdown / Word', 'Document Owner', 'On change', 'Active'],
        ['REG-02', 'Lead Register', 'Supabase: template_leads', 'Automated', 'Continuous', 'Active'],
        ['REG-03', 'Client Register', 'Supabase: crm_clients', 'Admin / Agentic', 'On change', 'Active'],
        ['REG-04', 'Project Register', 'Supabase: crm_clients', 'Admin', 'Weekly', 'Active'],
        ['REG-05', 'Invoice & Payment Register', 'Supabase: invoices', 'Admin', 'On invoice', 'Pending'],
        ['REG-06', 'Non-Conformance & CAPA Register', 'Supabase: ncr_register', 'Admin', 'On NC event', 'Pending'],
        ['REG-07', 'Risk Register', 'Markdown / Notion', 'Dr. Gravesande', 'Quarterly', 'Pending'],
      ],
    },
    {
      heading: '7. Policies (POL)',
      headers: ['Doc No', 'Title', 'ISO Clause', 'Version', 'Status'],
      colW: [1000, 3880, 1600, 900, 2700],
      rows: [
        ['POL-01', 'Quality Policy', '5.2', '1.0', 'Pending creation'],
        ['POL-02', 'Data Protection & Privacy Policy', '7.5 / GDPR', '1.0', 'Pending creation'],
        ['POL-03', 'Service Delivery & Scope Policy', '8.5', '1.0', 'Pending creation'],
        ['POL-04', 'Payment Terms & Credit Policy', '8.5.5', '1.0', 'Pending creation'],
        ['POL-05', 'Confidentiality & NDA Policy', '7.5', '1.0', 'Pending creation'],
      ],
    },
  ];

  for (const cat of categories) {
    const [num, ...titleParts] = cat.heading.split('. ');
    children.push(sectionHeading(num, titleParts.join('. ')));
    children.push(makeTable(cat.headers, cat.rows, cat.colW));
    children.push(blankLine(60, 40));
  }

  // How documents work together
  children.push(sectionHeading('8', 'How Documents Work Together'));
  children.push(bodyPara('The documents in this register form an interconnected system. The flow below shows how each document type links to the pipeline:'));
  children.push(blankLine(40, 20));

  const flow = [
    ['1', 'Marketing',      'SOP-01 drives traffic to FORM-01'],
    ['2', 'Lead Capture',   'FORM-01 writes to REG-02 (Lead Register); SOP-02 classifies the lead'],
    ['3', 'Quote',          'TPL-01 + TPL-02 used to build proposal per SOP-03'],
    ['4', 'Contract',       'TPL-03 signed per SOP-04; client enters REG-03 (Client Register)'],
    ['5', 'Onboarding',     'FORM-02 sent via TPL-08 per SOP-05; project file created'],
    ['6', 'Delivery',       'TPL-09 kickoff, TPL-10 status reports per SOP-06; tracked in REG-04'],
    ['7', 'Closure',        'TPL-11 closure report per SOP-07; final invoice triggered'],
    ['8', 'Billing',        'TPL-04 invoice per SOP-08; tracked in REG-05'],
    ['9', 'Renewal',        'TPL-14 renewal email at T-30 per SOP-09; non-conformances → REG-06'],
  ];
  children.push(makeTable(['Step', 'Stage', 'Documents & SOPs in Use'], flow, [600, 2000, 7480]));
  children.push(blankLine(80, 40));

  // Document control rules
  children.push(sectionHeading('9', 'Document Control Rules'));
  const rules = [
    'Every document has a unique number — prefix-##-kebab-title format.',
    'Version numbering: 1.0 on release, 1.1 for minor edits, 2.0 for major revisions.',
    'Only the Document Owner may approve version changes.',
    'Superseded versions are archived — never deleted.',
    '"Pending creation" documents must be created before the relevant SOP can be considered fully implemented.',
    'This master list must be updated whenever a document is created, revised, or retired.',
  ];
  for (const rule of rules) {
    children.push(bulletPara(rule));
  }
  children.push(blankLine(80, 40));

  // Revision history
  children.push(sectionHeading('10', 'Revision History'));
  children.push(makeTable(
    ['Version', 'Date', 'Author', 'Changes'],
    [['1.0', '2026-05-07', 'Dr. Stefan Gravesande', 'Initial release']],
    [1200, 1800, 3200, 3880],
  ));

  return new Document({
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE_W, height: PAGE_H },
          margin: { top: MAR, right: MAR, bottom: MAR, left: MAR },
        },
      },
      headers: {
        default: new Header({
          children: [headerBanner('REG-01 — Document Master List', 'Confidential — Internal Use Only')],
        }),
      },
      footers: {
        default: new Footer({ children: [footerLine('REG-01')] }),
      },
      children,
    }],
  });
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
async function main() {
  const sopDir    = path.join(__dirname, '..', 'docs', 'operations', 'sops');
  const regDir    = path.join(__dirname, '..', 'docs', 'operations', 'master-list');
  const outSopDir = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Preqal IMS Documents/02 - SOPs';
  const outRegDir = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Preqal IMS Documents/03 - Document Master List';

  // ── SOPs ─────────────────────────────────────────────────
  const sopFiles = fs.readdirSync(sopDir).filter(f => f.endsWith('.md')).sort();
  for (const file of sopFiles) {
    const markdown = fs.readFileSync(path.join(sopDir, file), 'utf8');
    const baseName = file.replace('.md', '').toUpperCase();
    console.log(`Generating ${baseName}.docx ...`);
    try {
      const doc    = buildSOPDocument(markdown);
      const buf    = await Packer.toBuffer(doc);
      fs.writeFileSync(path.join(outSopDir, baseName + '.docx'), buf);
      console.log(`  ✓ Saved`);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
  }

  // ── REG-01 ───────────────────────────────────────────────
  const regMd = fs.readFileSync(path.join(regDir, 'REG-01-document-master-list.md'), 'utf8');
  console.log('Generating REG-01-DOCUMENT-MASTER-LIST.docx ...');
  try {
    const doc = buildREGDocument(regMd);
    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outRegDir, 'REG-01-DOCUMENT-MASTER-LIST.docx'), buf);
    console.log('  ✓ Saved');
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
  }

  console.log('\n✅  All documents generated.');
  console.log(`\n📁 SOPs:     ${outSopDir}`);
  console.log(`📁 Register: ${outRegDir}`);
}

main().catch(console.error);
