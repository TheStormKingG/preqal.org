#!/usr/bin/env node
'use strict';

/**
 * Generate SOP-01 Document Control Procedure
 * Outputs to QMS folder + public/ims/
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, TabStopType, TabStopPosition
} = require('docx');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/02 - SOPs';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const C = {
  NAVY: '0F172A', NAVY_MID: '1E293B', AMBER: 'D97706', AMBER_LIGHT: 'FEF3C7',
  GRAY_BG: 'F8FAFC', GRAY_BORDER: 'CBD5E1', GRAY_TEXT: '64748B',
  SLATE: '334155', WHITE: 'FFFFFF',
};
const PAGE_W = 12240, PAGE_H = 15840, MAR = 1080, CW = PAGE_W - 2 * MAR;

function sb(color = C.GRAY_BORDER, size = 1) { return { style: BorderStyle.SINGLE, size, color }; }
function ab(color = C.GRAY_BORDER) { const b = sb(color); return { top:b, bottom:b, left:b, right:b }; }
function tr(text, opts = {}) { return new TextRun({ text, font:'Arial', size:22, ...opts }); }
function p(children, opts = {}) { return new Paragraph({ children, spacing:{ after:140 }, ...opts }); }

function cell(children, w, extra = {}) {
  return new TableCell({
    children, width:{ size:w, type:WidthType.DXA }, borders:ab(),
    margins:{ top:80, bottom:80, left:120, right:120 }, ...extra
  });
}
function navyCell(children, w) {
  return new TableCell({
    children, width:{ size:w, type:WidthType.DXA }, borders:ab(C.NAVY),
    shading:{ fill:C.NAVY, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
  });
}
function amberCell(children, w) {
  return new TableCell({
    children, width:{ size:w, type:WidthType.DXA }, borders:ab(C.AMBER),
    shading:{ fill:C.AMBER_LIGHT, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
  });
}

function headerBanner(docNum, title) {
  return new Table({
    width:{ size:CW, type:WidthType.DXA }, columnWidths:[2000, CW - 2000],
    rows:[new TableRow({ children:[
      navyCell([p([tr('PREQAL', { bold:true, color:C.AMBER, size:32 })])], 2000),
      navyCell([
        p([tr(docNum, { color:C.AMBER, size:18, bold:true })]),
        p([tr(title, { color:C.WHITE, size:28, bold:true })]),
      ], CW - 2000),
    ]})]
  });
}

function metaTable(meta) {
  const rows = Object.entries(meta).map(([k, v]) =>
    new TableRow({ children:[
      navyCell([p([tr(k, { bold:true, color:C.WHITE, size:20 })])], 2500),
      cell([p([tr(v, { size:20 })])], CW - 2500),
    ]})
  );
  return new Table({ width:{ size:CW, type:WidthType.DXA }, columnWidths:[2500, CW - 2500], rows });
}

function sH(num, title) {
  return p([
    tr(num + '. ', { bold:true, color:C.AMBER, size:24 }),
    tr(title, { bold:true, color:C.NAVY, size:24 }),
  ]);
}

function bullet(text) {
  return p([tr('•  ' + text)]);
}

function docxFooter() {
  return new Footer({ children:[
    new Paragraph({
      tabStops:[{ type:TabStopType.RIGHT, position:TabStopPosition.MAX }],
      children:[
        tr('Preqal | Confidential | Internal Use', { color:C.GRAY_TEXT, size:18 }),
        tr('\t', { size:18 }),
        tr('Page ', { color:C.GRAY_TEXT, size:18 }),
        new TextRun({ children:[PageNumber.CURRENT], font:'Arial', size:18, color:C.GRAY_TEXT }),
      ]
    })
  ]});
}

// ─── Location Table ───────────────────────────────────────────────────────────
function locationTable() {
  const colW = [800, 2200, 3400, 3680];
  const hdr = new TableRow({ children:[
    navyCell([p([tr('#', { bold:true, color:C.WHITE, size:20 })])], colW[0]),
    navyCell([p([tr('Location', { bold:true, color:C.WHITE, size:20 })])], colW[1]),
    navyCell([p([tr('Full Address / Path', { bold:true, color:C.WHITE, size:20 })])], colW[2]),
    navyCell([p([tr('Notes', { bold:true, color:C.WHITE, size:20 })])], colW[3]),
  ]});

  const rows = [
    ['1', 'Mac (Primary)', '/Users/stefangravesande/Documents/Projects/Preqal QMS/', 'Master working copy. Organised in 6 subfolders. Changes here are pushed to the website via git.'],
    ['2', 'Website (GitHub Pages)', 'https://preqal.org/ims/', 'Auto-published on every git push to master. Public-facing document library. Accessible at preqal.org/ims/.'],
    ['3', 'Google Drive (Cloud Backup)', 'https://drive.google.com/drive/folders/1wIA1LapOeWvCScjh37AMNgawEQizGRfF', 'Restricted to stefan.gravesande@preqal.org and stefan.gravesande@gmail.com. Provides off-site redundancy and audit access.'],
  ];

  const dataRows = rows.map(([n, loc, addr, note]) =>
    new TableRow({ children:[
      cell([p([tr(n)])], colW[0]),
      cell([p([tr(loc, { bold:true })])], colW[1]),
      cell([p([tr(addr, { size:18 })])], colW[2]),
      cell([p([tr(note, { size:18 })])], colW[3]),
    ]})
  );

  return new Table({
    width:{ size:CW, type:WidthType.DXA },
    columnWidths: colW,
    rows:[hdr, ...dataRows],
  });
}

// ─── Numbering Table ──────────────────────────────────────────────────────────
function numberingTable() {
  const colW = [1600, 1800, CW - 3400];
  const hdr = new TableRow({ children:[
    navyCell([p([tr('Prefix', { bold:true, color:C.WHITE, size:20 })])], colW[0]),
    navyCell([p([tr('Category', { bold:true, color:C.WHITE, size:20 })])], colW[1]),
    navyCell([p([tr('Examples', { bold:true, color:C.WHITE, size:20 })])], colW[2]),
  ]});

  const rows = [
    ['SOP-XX', 'Standard Operating Procedure', 'SOP-01 Document Control, SOP-02 Marketing'],
    ['POL-XX', 'Policy', 'POL-01 Quality Policy, POL-02 Data Protection'],
    ['TPL-XX', 'Template / Form', 'TPL-01 Quote Template, TPL-03 Service Agreement'],
    ['REG-XX', 'Register / Record', 'REG-01 Document Master, REG-04 Employee Register'],
    ['DIA-XX', 'Diagram / Process Map', 'DIA-01 Preqal Process Flow'],
  ];

  const dataRows = rows.map(([pfx, cat, ex]) =>
    new TableRow({ children:[
      amberCell([p([tr(pfx, { bold:true, size:20 })])], colW[0]),
      cell([p([tr(cat)])], colW[1]),
      cell([p([tr(ex, { size:20 })])], colW[2]),
    ]})
  );

  return new Table({
    width:{ size:CW, type:WidthType.DXA },
    columnWidths: colW,
    rows:[hdr, ...dataRows],
  });
}

// ─── Revision History Table ───────────────────────────────────────────────────
function revisionTable() {
  const colW = [1400, 1600, 2600, CW - 5600];
  const hdr = new TableRow({ children:[
    navyCell([p([tr('Version', { bold:true, color:C.WHITE, size:20 })])], colW[0]),
    navyCell([p([tr('Date', { bold:true, color:C.WHITE, size:20 })])], colW[1]),
    navyCell([p([tr('Author', { bold:true, color:C.WHITE, size:20 })])], colW[2]),
    navyCell([p([tr('Description', { bold:true, color:C.WHITE, size:20 })])], colW[3]),
  ]});
  const row1 = new TableRow({ children:[
    cell([p([tr('1.0')])], colW[0]),
    cell([p([tr('2026-05-08')])], colW[1]),
    cell([p([tr('Dr. Stefan Gravesande')])], colW[2]),
    cell([p([tr('Initial issue')])], colW[3]),
  ]});
  return new Table({
    width:{ size:CW, type:WidthType.DXA },
    columnWidths: colW,
    rows:[hdr, row1],
  });
}

async function main() {
  const meta = {
    'Document No':    'SOP-01',
    'Version':        '1.0',
    'Effective Date': '2026-05-08',
    'Owner':          'Dr. Stefan Gravesande',
    'Review Date':    '2027-05-08',
    'ISO Reference':  'ISO 9001:2015 §7.5',
  };

  const doc = new Document({
    sections:[{
      properties:{ page:{ size:{ width:PAGE_W, height:PAGE_H }, margin:{ top:MAR, right:MAR, bottom:MAR, left:MAR } } },
      footers:{ default:docxFooter() },
      children:[
        headerBanner('SOP-01', 'Document Control Procedure'),
        p([]),
        metaTable(meta),
        p([]),

        // 1. Purpose
        sH('1', 'Purpose'),
        p([tr('This procedure establishes how all Preqal Integrated Management System (IMS) documents are created, reviewed, approved, stored, distributed, and controlled. It ensures that documents are available at the point of use, are current and authorised, and that obsolete versions are prevented from unintended use.')]),
        p([]),

        // 2. Scope
        sH('2', 'Scope'),
        p([tr('This procedure applies to all controlled documents in the Preqal IMS, including Standard Operating Procedures (SOPs), Policies, Forms & Templates, Registers, and Diagrams. It applies to all personnel — human and agentic — operating within the Preqal management system.')]),
        p([]),

        // 3. Document Storage Locations
        sH('3', 'Authorised Document Storage Locations'),
        p([tr('All controlled IMS documents must be stored in the following three redundant locations simultaneously. This tri-location strategy ensures availability during audits, business continuity, and off-site backup.')]),
        p([]),
        locationTable(),
        p([]),
        p([tr('Synchronisation protocol: The Mac copy is the working master. When a document is created or updated, the author copies the file to ', { size:20 }), tr('public/ims/', { bold:true, size:20 }), tr(' in the GitHub repository and pushes to the ', { size:20 }), tr('master', { bold:true, size:20 }), tr(' branch. This triggers automatic deployment to the website. The Google Drive folder is updated manually at the same time.', { size:20 })]),
        p([]),

        // 4. Document Numbering
        sH('4', 'Document Numbering Convention'),
        p([tr('All IMS documents use a fixed prefix + two-digit sequential number format. New documents are added to the next available number within their category. The Document Master Register (REG-01) is the authoritative list of all document numbers.')]),
        p([]),
        numberingTable(),
        p([]),

        // 5. Document Creation and Approval
        sH('5', 'Document Creation and Approval'),
        bullet('Any Preqal team member may draft a new document.'),
        bullet('Draft documents are saved with status: Draft and stored only on the Mac until approved.'),
        bullet('The document owner reviews the draft for accuracy, completeness, and alignment with Preqal processes.'),
        bullet('Dr. Stefan Gravesande (Management Representative) approves all new and revised documents.'),
        bullet('Upon approval, the effective date is set, the version is set to the next increment (e.g. 1.0 → 2.0 for major, 1.0 → 1.1 for minor), and the document is distributed to all three authorised locations.'),
        bullet('REG-01 (Document Master Register) is updated to reflect the new or revised document.'),
        p([]),

        // 6. Document Review
        sH('6', 'Periodic Review'),
        p([tr('All documents are reviewed annually on or before their Review Date (typically one year from Effective Date). The review must determine whether the document:')]),
        bullet('Remains accurate and fit for purpose;'),
        bullet('Reflects current Preqal processes, applicable standards, and regulatory requirements;'),
        bullet('Should be revised, superseded, or withdrawn.'),
        p([tr('If no changes are required, the review date is extended by 12 months and this is recorded in REG-01. If changes are required, the document enters the revision workflow (Section 7).')]),
        p([]),

        // 7. Document Revision
        sH('7', 'Document Revision'),
        bullet('All substantive changes to a document require a version increment.'),
        bullet('The revised document replaces the previous version in all three storage locations simultaneously.'),
        bullet('The previous version is retained as a read-only archived copy in a subfolder named /archive/ within the Mac storage location.'),
        bullet('Superseded documents are updated in REG-01 with status: Superseded and the date of supersession.'),
        bullet('Staff are notified of revised documents via the Admin Dashboard operations notice (SOP-11).'),
        p([]),

        // 8. Document Withdrawal
        sH('8', 'Document Withdrawal'),
        p([tr('A document is withdrawn when a process it describes is discontinued. Withdrawn documents are:')]),
        bullet('Removed from all three active storage locations;'),
        bullet('Archived in /archive/ on the Mac with filename suffix _WITHDRAWN_YYYY-MM-DD;'),
        bullet('Updated in REG-01 with status: Superseded.'),
        p([]),

        // 9. Access and Security
        sH('9', 'Access and Security'),
        p([tr('Google Drive documents are restricted to authorised personnel only:')]),
        bullet('stefan.gravesande@preqal.org (primary)'),
        bullet('stefan.gravesande@gmail.com (backup)'),
        p([tr('Website documents at preqal.org/ims/ are accessible to any user with the URL. Documents do not contain client PII or confidential pricing. Refer to POL-02 (Data Protection & Privacy Policy) for data handling rules.')]),
        p([tr('The Admin Dashboard (SOP-11) provides authenticated access to document management functions for internal staff.')]),
        p([]),

        // 10. Roles and Responsibilities
        sH('10', 'Roles and Responsibilities'),
        new Table({
          width:{ size:CW, type:WidthType.DXA },
          columnWidths:[2800, CW - 2800],
          rows:[
            new TableRow({ children:[
              navyCell([p([tr('Role', { bold:true, color:C.WHITE, size:20 })])], 2800),
              navyCell([p([tr('Responsibilities', { bold:true, color:C.WHITE, size:20 })])], CW - 2800),
            ]}),
            new TableRow({ children:[
              amberCell([p([tr('Management Representative\n(Dr. Stefan Gravesande)', { bold:true, size:20 })])], 2800),
              cell([p([tr('Document approval, periodic system review, final authority on document changes')])], CW - 2800),
            ]}),
            new TableRow({ children:[
              cell([p([tr('Document Owner', { bold:true })])], 2800),
              cell([p([tr('Drafting, maintaining, and reviewing assigned documents; ensuring all three locations are updated')])], CW - 2800),
            ]}),
            new TableRow({ children:[
              cell([p([tr('All Staff (Human & Agentic)', { bold:true })])], 2800),
              cell([p([tr('Using only the current approved version; reporting obsolete copies or errors to the document owner')])], CW - 2800),
            ]}),
          ]
        }),
        p([]),

        // 11. Related Documents
        sH('11', 'Related Documents'),
        bullet('REG-01 — Document Master Register (master index of all IMS documents)'),
        bullet('POL-01 — Quality Policy'),
        bullet('POL-02 — Data Protection & Privacy Policy'),
        bullet('SOP-11 — Admin Dashboard Operations'),
        p([]),

        // 12. Revision History
        sH('12', 'Revision History'),
        revisionTable(),
        p([]),
      ]
    }]
  });

  const filename = 'SOP-01-DOCUMENT-CONTROL.docx';
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, filename), buf);
  fs.writeFileSync(path.join(PUB_DIR, filename), buf);
  console.log(`✓ ${filename} written to both locations.`);
}

main().catch(err => { console.error(err); process.exit(1); });
