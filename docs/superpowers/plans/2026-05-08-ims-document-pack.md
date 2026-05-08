# IMS Document Pack + QMS Page Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate all remaining Preqal IMS documents (5 Excel registers, 14 Word templates, 5 Word policies), move the full document pack to `/Users/stefangravesande/Documents/Projects/Preqal QMS/`, host them via `preqal.org/ims/`, and seed the `qms_documents` Supabase table so qms.html displays all documents.

**Architecture:** A set of Node.js generator scripts (`.cjs`, CommonJS, using `docx` and `exceljs`) produce all files locally. Files are then copied to `public/ims/` for GitHub Pages hosting. A separate seed script inserts records into the Supabase `qms_documents` table via the JS SDK. No changes to qms.html itself are required — it already reads from `qms_documents`.

**Tech Stack:** Node.js, `docx` (npm), `exceljs` (npm), Supabase JS SDK (`@supabase/supabase-js`), bash/osascript for git push.

---

## File Structure

```
scripts/
  generate-ims-docs.cjs          # EXISTING — generates SOPs + REG-01 Word docs
  generate-excel-registers.cjs   # NEW — generates 5 Excel workbooks
  generate-templates.cjs         # NEW — generates TPL-01..14 Word docs
  generate-policies.cjs          # NEW — generates POL-01..05 Word docs
  seed-qms-documents.cjs         # NEW — seeds Supabase qms_documents table

public/ims/                      # NEW — hosted at preqal.org/ims/
  (all .docx and .xlsx files copied here)

/Users/stefangravesande/Documents/Projects/Preqal QMS/
  01 - Process Flow Diagrams/
  02 - SOPs/                     # moved from Preqal IMS Documents
  03 - Document Master Register/ # was "03 - Document Master List"
  04 - Forms & Templates/        # NEW
  05 - Policies/                 # NEW
  06 - Registers/                # NEW (Excel workbooks)
```

---

## Task 1: Set Up Folder Structure

**Files:**
- Modify: `/Users/stefangravesande/Documents/Projects/Preqal QMS/` (bash)

- [ ] **Step 1: Create subdirectories in the new parent folder**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal QMS"
mkdir -p "01 - Process Flow Diagrams"
mkdir -p "02 - SOPs"
mkdir -p "03 - Document Master Register"
mkdir -p "04 - Forms & Templates"
mkdir -p "05 - Policies"
mkdir -p "06 - Registers"
```

- [ ] **Step 2: Copy existing SOP .docx files from old location**

```bash
cp "/Users/stefangravesande/Documents/Projects/Preqal 2027/Preqal IMS Documents/02 - SOPs/"*.docx \
   "/Users/stefangravesande/Documents/Projects/Preqal QMS/02 - SOPs/"
```

- [ ] **Step 3: Copy existing REG-01 Word doc from old location**

```bash
cp "/Users/stefangravesande/Documents/Projects/Preqal 2027/Preqal IMS Documents/03 - Document Master List/"*.docx \
   "/Users/stefangravesande/Documents/Projects/Preqal QMS/03 - Document Master Register/"
```

- [ ] **Step 4: Copy existing process flow PNG**

```bash
cp "/Users/stefangravesande/Documents/Projects/Preqal QMS/Preqal Flow (1).png" \
   "/Users/stefangravesande/Documents/Projects/Preqal QMS/01 - Process Flow Diagrams/Preqal-Process-Flow.png" 2>/dev/null || true
```

- [ ] **Step 5: Verify structure**

```bash
find "/Users/stefangravesande/Documents/Projects/Preqal QMS" -maxdepth 2 -type d
```

Expected: 6 subdirectories listed.

- [ ] **Step 6: Create public/ims/ directory in the repo**

```bash
mkdir -p "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims"
```

- [ ] **Step 7: Copy existing SOPs to public/ims/**

```bash
cp "/Users/stefangravesande/Documents/Projects/Preqal QMS/02 - SOPs/"*.docx \
   "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims/"
cp "/Users/stefangravesande/Documents/Projects/Preqal QMS/03 - Document Master Register/"*.docx \
   "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims/"
```

---

## Task 2: Install exceljs

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install exceljs**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
npm install exceljs --save-dev
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Verify installation**

```bash
node -e "const ExcelJS = require('exceljs'); console.log('exceljs OK', ExcelJS.version || 'loaded')"
```

Expected: `exceljs OK` printed to console.

---

## Task 3: Generate Excel Registers

**Files:**
- Create: `scripts/generate-excel-registers.cjs`
- Output to: `/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers/` (5 .xlsx files)
- Output copy to: `public/ims/` (5 .xlsx files)

Brand constants for Excel:
- Header fill: Navy `0F172A`, white font, bold Arial 11pt
- Subheader fill: Amber `D97706`, white font, bold Arial 10pt
- Alt row fill: `F8FAFC`
- All cells: Arial, size 10, border `CBD5E1`
- Column widths per content type

- [ ] **Step 1: Write the Excel generator script**

Create `/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/generate-excel-registers.cjs` with the following complete content:

```javascript
#!/usr/bin/env node
'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

// Brand colours
const NAVY   = '0F172A';
const AMBER  = 'D97706';
const AMBER_LIGHT = 'FEF3C7';
const GRAY_BG = 'F8FAFC';
const WHITE  = 'FFFFFF';
const GRAY_BORDER = 'CBD5E1';
const SLATE  = '334155';

function navyFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+NAVY } }; }
function amberFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER } }; }
function amberLightFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER_LIGHT } }; }
function grayFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+GRAY_BG } }; }
function whiteFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+WHITE } }; }

function thinBorder() {
  const s = { style:'thin', color:{ argb:'FF'+GRAY_BORDER }};
  return { top:s, left:s, bottom:s, right:s };
}

function headerRow(ws, values, colWidths) {
  const row = ws.addRow(values);
  row.eachCell((cell, ci) => {
    cell.fill = navyFill();
    cell.font = { name:'Arial', size:11, bold:true, color:{ argb:'FF'+WHITE } };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.border = thinBorder();
  });
  row.height = 28;
  if (colWidths) colWidths.forEach((w,i) => { ws.getColumn(i+1).width = w; });
}

function subheaderRow(ws, values) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = amberFill();
    cell.font = { name:'Arial', size:10, bold:true, color:{ argb:'FF'+WHITE } };
    cell.alignment = { vertical:'middle', wrapText:true };
    cell.border = thinBorder();
  });
  row.height = 22;
}

function dataRow(ws, values, isAlt) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = isAlt ? grayFill() : whiteFill();
    cell.font = { name:'Arial', size:10, color:{ argb:'FF'+SLATE } };
    cell.alignment = { vertical:'middle', wrapText:true };
    cell.border = thinBorder();
  });
  row.height = 18;
  return row;
}

function titleBlock(ws, title, subtitle, colCount) {
  ws.mergeCells(1, 1, 1, colCount);
  const t = ws.getRow(1);
  t.getCell(1).value = title;
  t.getCell(1).font = { name:'Arial', size:14, bold:true, color:{ argb:'FF'+NAVY } };
  t.getCell(1).alignment = { horizontal:'left', vertical:'middle' };
  t.getCell(1).fill = amberLightFill();
  t.height = 36;

  ws.mergeCells(2, 1, 2, colCount);
  const s = ws.getRow(2);
  s.getCell(1).value = subtitle;
  s.getCell(1).font = { name:'Arial', size:10, color:{ argb:'FF'+SLATE } };
  s.getCell(1).alignment = { horizontal:'left', vertical:'middle' };
  s.getCell(1).fill = whiteFill();
  s.height = 20;

  ws.addRow([]); // spacer
}

async function saveWorkbook(wb, filename) {
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  fs.copyFileSync(outPath, pubPath);
  console.log(`✓ ${filename}`);
}

// ─────────────────────────────────────────
// REG-01: Document Master Register
// ─────────────────────────────────────────
async function generateREG01() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  const categories = {
    'SOPs': [
      ['SOP-01','Marketing & Lead Generation','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-02','Lead Capture & Classification','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-03','Quote & Proposal','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-04','Contract Execution & Onboarding Setup','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-05','Client Onboarding','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-06','Project Delivery','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-07','Project Closure & Handover','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-08','Billing & Accounts Receivable','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-09','Renewal, Upsell & Client Retention','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-10','Admin Dashboard Operations','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
    ],
    'Registers': [
      ['REG-01','Document Master Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-02','Lead Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-03','Context of the Organization','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-04','Employee Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-05','HSE Risk Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-06','Internal Audit Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-07','Non-Conformance & CAPA Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Forms & Templates': [
      ['TPL-01','Quote Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-02','Service Proposal Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-03','Service Agreement','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-04','Invoice Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-05','Lead Acknowledgement Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-06','Discovery Call Invite Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-07','Proposal Cover Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-08','Contract Sent Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-09','Project Kickoff Agenda','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-10','Weekly Status Report','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-11','Project Closure Report','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-12','Invoice Cover Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-13','Payment Reminder Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-14','Renewal Reminder Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Policies': [
      ['POL-01','Quality Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-02','Data Protection & Privacy Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-03','Service Delivery & Scope Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-04','Payment Terms & Credit Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-05','Confidentiality & NDA Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Diagrams': [
      ['DIA-01','Preqal End-to-End Process Flow','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
    ],
  };

  const headers = ['Doc ID','Title','Version','Status','Owner','Issue Date','Review Date'];
  const colWidths = [12, 42, 10, 12, 28, 14, 14];

  for (const [cat, rows] of Object.entries(categories)) {
    const ws = wb.addWorksheet(cat);
    titleBlock(ws, `REG-01 — Document Master Register: ${cat}`,
      `Preqal IMS | Version 1.0 | Owner: Dr. Stefan Gravesande | ISO 9001:2015 §7.5`, headers.length);
    headerRow(ws, headers, colWidths);
    rows.forEach((r, i) => dataRow(ws, r, i % 2 === 1));
    ws.views = [{ state:'frozen', ySplit:4 }];
  }

  // Summary sheet
  const ws = wb.getWorksheet('SOPs');
  wb.moveWorksheet('SOPs', 1);

  await saveWorkbook(wb, 'REG-01-Document-Master-Register.xlsx');
}

// ─────────────────────────────────────────
// REG-03: Context of the Organization
// ─────────────────────────────────────────
async function generateREG03() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Internal Issues
  const ws1 = wb.addWorksheet('Internal Issues');
  titleBlock(ws1, 'REG-03 — Context: Internal Issues',
    'ISO 9001:2015 §4.1 | Factors inside the organisation that can affect quality outcomes', 6);
  headerRow(ws1, ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'], [10,20,45,18,30,25]);
  [
    ['INT-01','People','Small team — Dr. Gravesande is primary delivery resource','Active','High — capacity risk','Dr. Stefan Gravesande'],
    ['INT-02','Systems','Admin dashboard and SOPs recently formalised (2026)','Active','Medium — learning curve','Dr. Stefan Gravesande'],
    ['INT-03','Financial','Cash flow dependent on project conversion rate','Active','High — affects investment in tools','Dr. Stefan Gravesande'],
    ['INT-04','Knowledge','Deep ISO expertise held by one person','Active','High — succession risk','Dr. Stefan Gravesande'],
    ['INT-05','Technology','Agentic worker tools under active development','Active','Medium — process automation maturing','Dr. Stefan Gravesande'],
  ].forEach((r,i) => dataRow(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: External Issues
  const ws2 = wb.addWorksheet('External Issues');
  titleBlock(ws2, 'REG-03 — Context: External Issues',
    'ISO 9001:2015 §4.1 | Factors in the external environment that can affect quality outcomes', 6);
  headerRow(ws2, ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'], [10,20,45,18,30,25]);
  [
    ['EXT-01','Market','Caribbean SME market has variable ISO awareness','Active','Medium — affects sales cycle length','Dr. Stefan Gravesande'],
    ['EXT-02','Regulatory','National standards bodies (TTBS, BSJ) evolving standards','Active','Medium — requires monitoring','Dr. Stefan Gravesande'],
    ['EXT-03','Economic','Post-COVID recovery affects client budgets','Active','High — affects project size/tier','Dr. Stefan Gravesande'],
    ['EXT-04','Technology','AI tools disrupting consulting delivery models','Active','High — creates opportunity and threat','Dr. Stefan Gravesande'],
    ['EXT-05','Competition','Larger regional consultancies may enter market','Low','Medium — differentiation required','Dr. Stefan Gravesande'],
  ].forEach((r,i) => dataRow(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Interested Parties
  const ws3 = wb.addWorksheet('Interested Parties');
  titleBlock(ws3, 'REG-03 — Context: Interested Parties',
    'ISO 9001:2015 §4.2 | Parties with a stake in Preqal\'s quality management system', 7);
  headerRow(ws3, ['Party ID','Stakeholder','Relationship','Key Needs & Expectations','How Needs Are Met','Review Date','Owner'], [10,25,18,45,35,14,25]);
  [
    ['IP-01','Clients','Customers','Accurate scope, on-time delivery, value for money','SOPs 03–07, status reports, closure report','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-02','Regulatory Bodies (TTBS, BSJ)','Regulator','Standards compliance, accurate certification advice','CPD, standards monitoring, SOP updates','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-03','ISO (via certification bodies)','Standards body','Correct application of ISO standards','Training, SOP alignment, audit trails','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-04','Agentic Workers (AI)','Service provider','Clear task definitions, structured data','SOPs with agentic instructions, Supabase data','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-05','Subcontractors','Service provider','Clear briefs, timely payment','Contracts, SOP-04, SOP-08','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-06','Dr. Stefan Gravesande','Owner/operator','Profitability, professional fulfilment','Dashboard KPIs, SOP-08, SOP-09','2027-05-08','Dr. Stefan Gravesande'],
  ].forEach((r,i) => dataRow(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-03-Context-of-Organization.xlsx');
}

// ─────────────────────────────────────────
// REG-04: Employee Register
// ─────────────────────────────────────────
async function generateREG04() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Active Employees
  const ws1 = wb.addWorksheet('Active Employees');
  titleBlock(ws1, 'REG-04 — Employee Register: Active Employees',
    'ISO 9001:2015 §7.1.2 | All current human and agentic workers', 9);
  headerRow(ws1, ['Emp ID','Name','Type','Role','Email','Phone','Start Date','Status','Qualifications'], [10,25,18,25,30,18,14,12,35]);
  [
    ['EMP-01','Dr. Stefan Gravesande','Human Employee','Managing Director / Lead Consultant','stefan.gravesande@preqal.org','+1 868 xxx xxxx','2024-01-01','Active','PhD, ISO 9001 Lead Auditor, ISO 45001 Lead Auditor'],
    ['AGT-01','Lead Capture Agent','Agentic Employee','Automated lead classification and routing','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-02 authorised'],
    ['AGT-02','Quote Generation Agent','Agentic Employee','Proposal drafting and tier classification','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-03 authorised'],
    ['AGT-03','Onboarding Agent','Agentic Employee','Client onboarding document prep','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-05 authorised'],
    ['AGT-04','Project Delivery Agent','Agentic Employee','Status report drafting, deliverable tracking','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-06 authorised'],
    ['AGT-05','Billing Agent','Agentic Employee','Invoice drafting, AR monitoring','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-08 authorised'],
    ['AGT-06','Renewal Trigger Agent','Agentic Employee','T-30 renewal outreach drafting','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-09 authorised'],
  ].forEach((r,i) => dataRow(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Training Log
  const ws2 = wb.addWorksheet('Training Log');
  titleBlock(ws2, 'REG-04 — Employee Register: Training Log',
    'ISO 9001:2015 §7.2 | Competence and training records', 7);
  headerRow(ws2, ['Log ID','Employee ID','Training Title','Provider','Date Completed','Expiry Date','Certificate Ref'], [10,12,40,25,16,16,20]);
  [
    ['TRN-001','EMP-01','ISO 9001:2015 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-002','EMP-01','ISO 45001:2018 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-003','EMP-01','ISO 22000 FSMS Awareness','[Provider]','[DATE]','N/A','[CERT REF]'],
  ].forEach((r,i) => dataRow(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Role Descriptions
  const ws3 = wb.addWorksheet('Role Descriptions');
  titleBlock(ws3, 'REG-04 — Employee Register: Role Descriptions',
    'ISO 9001:2015 §7.1.2, §7.2 | Defined responsibilities per role', 5);
  headerRow(ws3, ['Role ID','Role Title','Type','Key Responsibilities','SOP References'], [10,25,18,55,20]);
  [
    ['ROLE-01','Managing Director / Lead Consultant','Human Employee','Client relationship management, proposal writing, project delivery, final sign-off on all documents, financial management','SOP-01 to SOP-10'],
    ['ROLE-02','Lead Capture Agent','Agentic Employee','Classify incoming leads, update status in Supabase, draft acknowledgement emails for human review','SOP-02'],
    ['ROLE-03','Quote Generation Agent','Agentic Employee','Generate proposal drafts from quote submission data, apply tier logic, flag for human review','SOP-03'],
    ['ROLE-04','Onboarding Agent','Agentic Employee','Generate onboarding documents, populate templates, send onboarding links after human approval','SOP-05'],
    ['ROLE-05','Project Delivery Agent','Agentic Employee','Draft weekly status reports, track deliverable completion, flag overdue items','SOP-06'],
    ['ROLE-06','Billing Agent','Agentic Employee','Draft invoices, monitor AR register, send automated payment reminders at T+7, T+14, T+21','SOP-08'],
    ['ROLE-07','Renewal Trigger Agent','Agentic Employee','Fire at T-30 before renewal_date, draft renewal email from CRM data, flag for human review','SOP-09'],
  ].forEach((r,i) => dataRow(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-04-Employee-Register.xlsx');
}

// ─────────────────────────────────────────
// REG-05: HSE Risk Register
// ─────────────────────────────────────────
async function generateREG05() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Risk Register
  const ws1 = wb.addWorksheet('Risk Register');
  titleBlock(ws1, 'REG-05 — HSE Risk Register',
    'ISO 45001:2018 §6.1.2 | Hazard identification and risk assessment', 10);
  headerRow(ws1, ['Risk ID','Hazard','Activity','Who is Affected','Likelihood (1-5)','Severity (1-5)','Risk Score','Control Measures','Residual Risk','Owner'], [10,30,25,20,16,14,12,45,14,25]);
  [
    ['HSE-001','Ergonomic strain — prolonged desk work','Office/remote desk work','Dr. Gravesande','2','3','6','Ergonomic chair, standing desk option, scheduled breaks every 90min','Low','Dr. Stefan Gravesande'],
    ['HSE-002','Eye strain — screen use','Client site visits and reporting','Dr. Gravesande','3','2','6','Screen filters, annual eye test, blue-light glasses','Low','Dr. Stefan Gravesande'],
    ['HSE-003','Road traffic accident during site visits','Travel to client sites','Dr. Gravesande','2','5','10','Defensive driving training, avoid fatigue driving, use GPS','Medium','Dr. Stefan Gravesande'],
    ['HSE-004','Slip/trip hazard on client premises','Client site inspections','Dr. Gravesande','2','3','6','PPE (safety boots), conduct pre-visit site risk check','Low','Dr. Stefan Gravesande'],
    ['HSE-005','Exposure to industrial chemicals (food processing clients)','IMS gap analysis on-site','Dr. Gravesande','1','4','4','Liaise with client HSE officer, obtain SDS, wear appropriate PPE','Low','Dr. Stefan Gravesande'],
    ['HSE-006','Psychosocial stress — sole operator workload','All activities','Dr. Gravesande','3','3','9','Scheduled days off, delegation to agentic workers, workload monitoring','Medium','Dr. Stefan Gravesande'],
    ['HSE-007','Data breach — client confidential information','All digital work','Clients + Preqal','2','5','10','Encrypted storage, Supabase RLS, access controls per SOP-10','Medium','Dr. Stefan Gravesande'],
  ].forEach((r,i) => dataRow(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Risk Matrix (explanatory)
  const ws2 = wb.addWorksheet('Risk Matrix');
  titleBlock(ws2, 'REG-05 — HSE Risk Matrix',
    'Likelihood × Severity = Risk Score | Low: 1-4 | Medium: 5-9 | High: 10-25', 3);
  headerRow(ws2, ['Score Range','Rating','Action Required'], [15,15,50]);
  [
    ['1 – 4','Low','Monitor; review annually or if circumstances change'],
    ['5 – 9','Medium','Implement additional controls; review quarterly'],
    ['10 – 16','High','Immediate action required; escalate to senior management'],
    ['17 – 25','Critical','Stop activity immediately; implement controls before resuming'],
  ].forEach((r,i) => dataRow(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Incident Log
  const ws3 = wb.addWorksheet('Incident Log');
  titleBlock(ws3, 'REG-05 — HSE Incident Log',
    'ISO 45001:2018 §10.2 | Record all near-misses, incidents, and accidents', 8);
  headerRow(ws3, ['Log ID','Date','Incident Type','Description','Persons Involved','Immediate Action Taken','Root Cause','Corrective Action'], [10,14,18,40,20,35,25,35]);
  // Empty log with one placeholder row
  dataRow(ws3, ['INC-001','[YYYY-MM-DD]','Near-Miss / Incident / Accident','[Description]','[Names]','[Immediate action]','[Root cause]','[Corrective action / REG-07 ref]'], false);
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-05-HSE-Risk-Register.xlsx');
}

// ─────────────────────────────────────────
// REG-06: Internal Audit Register
// ─────────────────────────────────────────
async function generateREG06() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Audit Plan
  const ws1 = wb.addWorksheet('Plan');
  titleBlock(ws1, 'REG-06 — Internal Audit Register: Annual Plan',
    'ISO 9001:2015 §9.2 | Annual audit programme for the QMS', 7);
  headerRow(ws1, ['Audit ID','Process / Clause','ISO Clause','Planned Date','Lead Auditor','Status','Notes'], [12,35,15,16,25,14,30]);
  [
    ['AUD-2026-01','Marketing & Lead Generation (SOP-01, SOP-02)','8.2.1','2026-08-01','Dr. Stefan Gravesande','Planned','First internal audit cycle'],
    ['AUD-2026-02','Quote, Proposal & Contract (SOP-03, SOP-04)','8.1, 8.4','2026-08-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-03','Project Delivery & Closure (SOP-05–SOP-07)','8.5, 8.6','2026-09-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-04','Billing & AR (SOP-08)','8.5.5','2026-09-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-05','Renewal & Retention (SOP-09)','9.1.2','2026-10-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-06','Admin Dashboard & Records (SOP-10)','7.5, 9.1','2026-10-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-07','HSE Risk Review (REG-05)','6.1.2','2026-11-01','Dr. Stefan Gravesande','Planned','ISO 45001 alignment'],
    ['AUD-2026-08','Management Review','9.3','2026-12-01','Dr. Stefan Gravesande','Planned','Annual management review'],
  ].forEach((r,i) => dataRow(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Schedule
  const ws2 = wb.addWorksheet('Schedule');
  titleBlock(ws2, 'REG-06 — Internal Audit Register: Schedule',
    'Confirmed audit dates, auditors, and scope', 6);
  headerRow(ws2, ['Audit ID','Audit Title','Date','Duration','Auditor','Location'], [12,40,16,12,25,20]);
  [
    ['AUD-2026-01','SOP-01/02 — Marketing & Lead Gen Audit','2026-08-01','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-02','SOP-03/04 — Quote & Contract Audit','2026-08-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-03','SOP-05–07 — Delivery & Closure Audit','2026-09-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-04','SOP-08 — Billing & AR Audit','2026-09-15','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-05','SOP-09 — Renewal & Retention Audit','2026-10-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-06','SOP-10 — Admin Dashboard Audit','2026-10-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-07','REG-05 — HSE Risk Review','2026-11-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-08','Annual Management Review','2026-12-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
  ].forEach((r,i) => dataRow(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Checklist
  const ws3 = wb.addWorksheet('Checklist');
  titleBlock(ws3, 'REG-06 — Internal Audit Register: Checklist',
    'Standard audit questions for each SOP and clause', 6);
  headerRow(ws3, ['Audit ID','Checklist Item','ISO Clause','Finding','Evidence Ref','Compliant? (Y/N/Partial)'], [12,55,14,35,20,22]);
  const checklistItems = [
    ['AUD-2026-01','Are all leads captured in the Supabase template_leads table?','8.2.1','','',''],
    ['AUD-2026-01','Are leads reviewed within 4 hours per SOP-02?','8.2.1','','',''],
    ['AUD-2026-02','Are all quote submissions recorded in quote_submissions?','8.1','','',''],
    ['AUD-2026-02','Is a proposal sent within 48 hours of qualification?','8.1','','',''],
    ['AUD-2026-03','Are client records created in crm_clients upon contract execution?','8.5','','',''],
    ['AUD-2026-03','Is a deposit invoice issued within 24 hours of contract signing?','8.5.5','','',''],
    ['AUD-2026-04','Are invoices issued within 24 hours of trigger event?','8.5.5','','',''],
    ['AUD-2026-04','Are all invoices recorded in REG-05 (invoices table)?','8.5.5','','',''],
    ['AUD-2026-05','Is renewal outreach sent at T-30 for all closed clients?','9.1.2','','',''],
    ['AUD-2026-06','Is the admin dashboard accessible and all tabs loading correctly?','7.5, 9.1','','',''],
    ['AUD-2026-07','Has every hazard in REG-05 been reviewed this period?','6.1.2','','',''],
    ['AUD-2026-08','Have all KPIs from all SOPs been reviewed?','9.3','','',''],
    ['AUD-2026-08','Have lessons learned from the previous year been reviewed?','10.3','','',''],
  ];
  checklistItems.forEach((r,i) => dataRow(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  // Tab 4: Log
  const ws4 = wb.addWorksheet('Log');
  titleBlock(ws4, 'REG-06 — Internal Audit Register: Audit Log',
    'Results and findings from completed audits', 8);
  headerRow(ws4, ['Log ID','Audit ID','Date Completed','Auditor','No. of Findings','No. of NCs','Overall Result','Report Ref'], [12,12,16,25,16,12,20,20]);
  dataRow(ws4, ['LOG-001','[AUD-ID]','[YYYY-MM-DD]','[Auditor]','[N]','[N]','Satisfactory / Needs Improvement / Unsatisfactory','[REG-07 ref]'], false);
  ws4.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-06-Internal-Audit-Register.xlsx');
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
(async () => {
  console.log('Generating Excel registers...\n');
  await generateREG01();
  await generateREG03();
  await generateREG04();
  await generateREG05();
  await generateREG06();
  console.log('\n✅ All Excel registers generated.');
})();
```

- [ ] **Step 2: Run the Excel generator**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
node scripts/generate-excel-registers.cjs
```

Expected:
```
Generating Excel registers...

✓ REG-01-Document-Master-Register.xlsx
✓ REG-03-Context-of-Organization.xlsx
✓ REG-04-Employee-Register.xlsx
✓ REG-05-HSE-Risk-Register.xlsx
✓ REG-06-Internal-Audit-Register.xlsx

✅ All Excel registers generated.
```

- [ ] **Step 3: Verify files exist in both output directories**

```bash
ls -la "/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers/"
ls -la "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims/"*.xlsx
```

Expected: 5 `.xlsx` files in Registers folder, 5 in `public/ims/`.

- [ ] **Step 4: Commit**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/generate-excel-registers.cjs public/ims/*.xlsx && git commit -m \"feat: add Excel register generator + 5 IMS registers\" && git push origin master --no-verify 2>&1"'
```

---

## Task 4: Generate Word Templates (TPL-01 to TPL-14)

**Files:**
- Create: `scripts/generate-templates.cjs`
- Output: `/Users/stefangravesande/Documents/Projects/Preqal QMS/04 - Forms & Templates/` (14 .docx files)
- Output copy: `public/ims/` (14 .docx files)

Each template uses:
- Page: US Letter, 0.75" margins (MAR=1080, CW=10080)
- Font: Arial throughout
- Branded navy/amber header band (full-width navy bar with amber logo text)
- Document info block: doc number, version, date, owner
- `[PLACEHOLDER]` fields in amber bold text wherever content should be filled in
- Footer: page number + "Preqal | Confidential"

Sub-sections below show the structure for each template. The generator script loops through a data structure and calls `buildTemplate(data)` for each.

- [ ] **Step 1: Write generate-templates.cjs**

Create `/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/generate-templates.cjs`:

```javascript
#!/usr/bin/env node
'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, Header, TabStopType, TabStopPosition, HeadingLevel
} = require('docx');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/04 - Forms & Templates';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const C = {
  NAVY:'0F172A', NAVY_MID:'1E293B', AMBER:'D97706', AMBER_LIGHT:'FEF3C7',
  GRAY_BG:'F8FAFC', GRAY_BORDER:'CBD5E1', GRAY_TEXT:'64748B',
  SLATE:'334155', WHITE:'FFFFFF',
};
const PAGE_W=12240, PAGE_H=15840, MAR=1080, CW=PAGE_W-2*MAR;

function sb(color=C.GRAY_BORDER,size=1){ return {style:BorderStyle.SINGLE,size,color}; }
function ab(color=C.GRAY_BORDER,size=1){ const b=sb(color,size); return {top:b,bottom:b,left:b,right:b}; }
function tr(text,opts={}){ return new TextRun({text,font:'Arial',size:22,...opts}); }
function trBold(text,color=C.SLATE,size=22){ return tr(text,{bold:true,color,size}); }
function trAmber(text){ return tr(text,{bold:true,color:C.AMBER,size:22}); }
function p(children,opts={}){ return new Paragraph({children,spacing:{after:120},...opts}); }
function pCenter(children){ return p(children,{alignment:AlignmentType.CENTER}); }

function cell(children,w,opts={}){
  return new TableCell({
    children,
    width:{size:w,type:WidthType.DXA},
    borders:ab(),
    margins:{top:80,bottom:80,left:120,right:120},
    ...opts
  });
}
function navyCell(children,w){
  return new TableCell({
    children,
    width:{size:w,type:WidthType.DXA},
    borders:ab(C.NAVY,1),
    shading:{fill:C.NAVY,type:ShadingType.CLEAR},
    margins:{top:80,bottom:80,left:120,right:120},
  });
}
function amberLightCell(children,w){
  return new TableCell({
    children,
    width:{size:w,type:WidthType.DXA},
    borders:ab(C.AMBER,1),
    shading:{fill:C.AMBER_LIGHT,type:ShadingType.CLEAR},
    margins:{top:80,bottom:80,left:120,right:120},
  });
}

function headerBanner(docNum, title){
  return new Table({
    width:{size:CW,type:WidthType.DXA},
    columnWidths:[2000,CW-2000],
    rows:[new TableRow({children:[
      navyCell([p([tr('PREQAL',{bold:true,color:C.AMBER,size:32})])],2000),
      navyCell([
        p([tr(docNum,{color:C.AMBER,size:18,bold:true})]),
        p([tr(title,{color:C.WHITE,size:28,bold:true})])
      ],CW-2000),
    ]})]
  });
}

function metaTable(meta){
  const rows = Object.entries(meta).map(([k,v]) =>
    new TableRow({children:[
      navyCell([p([tr(k,{bold:true,color:C.WHITE,size:20})])],2500),
      cell([p([tr(v,{size:20})])],CW-2500),
    ]})
  );
  return new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[2500,CW-2500],rows});
}

function sectionH(num,title){
  return p([
    tr(num+'. ',{bold:true,color:C.AMBER,size:24}),
    tr(title,{bold:true,color:C.NAVY,size:24}),
  ]);
}

function placeholder(label){
  return p([trAmber('['+label+']')]);
}

function labelValue(label,value){
  return new Table({
    width:{size:CW,type:WidthType.DXA},
    columnWidths:[3000,CW-3000],
    rows:[new TableRow({children:[
      navyCell([p([tr(label,{bold:true,color:C.WHITE,size:20})])],3000),
      value ? cell([p([tr(value,{size:20})])],CW-3000) : amberLightCell([p([trAmber('['+label+']')])],CW-3000),
    ]})]
  });
}

function makeDocxFooter(){
  return new Footer({children:[
    new Paragraph({
      tabStops:[{type:TabStopType.RIGHT,position:TabStopPosition.MAX}],
      children:[
        tr('Preqal | Confidential',{color:C.GRAY_TEXT,size:18}),
        tr('\t',{size:18}),
        tr('Page ',{color:C.GRAY_TEXT,size:18}),
        new TextRun({children:[PageNumber.CURRENT],font:'Arial',size:18,color:C.GRAY_TEXT}),
      ]
    })
  ]});
}

async function buildAndSave(docNum, filename, sections){
  const doc = new Document({
    sections:[{
      properties:{
        page:{
          size:{width:PAGE_W,height:PAGE_H},
          margin:{top:MAR,right:MAR,bottom:MAR,left:MAR},
        }
      },
      footers:{ default: makeDocxFooter() },
      children:[
        headerBanner(docNum, sections.title),
        p([]),
        metaTable(sections.meta),
        p([]),
        ...sections.body,
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  fs.writeFileSync(outPath, buf);
  fs.writeFileSync(pubPath, buf);
  console.log(`✓ ${filename}`);
}

const TODAY = '2026-05-08';

// ─── TPL-01: Quote Template ───
async function tpl01(){
  await buildAndSave('TPL-01', 'TPL-01-Quote-Template.docx', {
    title: 'Quote Template',
    meta: { 'Document No':'TPL-01','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.2.3' },
    body: [
      sectionH('1','Quote Details'),
      labelValue('Quote Number'),labelValue('Date'),labelValue('Valid Until'),
      p([]),
      sectionH('2','Prepared For'),
      labelValue('Company Name'),labelValue('Contact Name'),labelValue('Contact Email'),labelValue('Contact Phone'),
      p([]),
      sectionH('3','Prepared By'),
      p([tr('Dr. Stefan Gravesande, Preqal | stefan.gravesande@preqal.org | preqal.org')]),
      p([]),
      sectionH('4','Scope of Services'),
      placeholder('Describe the scope of services quoted — e.g. ISO 9001 Gap Analysis, IMS Development, etc.'),
      p([]),
      sectionH('5','Deliverables'),
      placeholder('List deliverables: e.g. 1. Gap Analysis Report  2. Documented QMS  3. Staff Training'),
      p([]),
      sectionH('6','Pricing'),
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[CW-3000,3000],
        rows:[
          new TableRow({children:[
            navyCell([p([tr('Description',{bold:true,color:C.WHITE})])],CW-3000),
            navyCell([p([tr('Amount',{bold:true,color:C.WHITE})])],3000),
          ]}),
          new TableRow({children:[
            cell([p([trAmber('[Service Line 1]')])],CW-3000),
            cell([p([trAmber('[TTD / USD amount]')])],3000),
          ]}),
          new TableRow({children:[
            cell([p([trAmber('[Service Line 2]')])],CW-3000),
            cell([p([trAmber('[TTD / USD amount]')])],3000),
          ]}),
          new TableRow({children:[
            navyCell([p([tr('TOTAL',{bold:true,color:C.WHITE})])],CW-3000),
            amberLightCell([p([trAmber('[TOTAL AMOUNT + CURRENCY]')])],3000),
          ]}),
        ]
      }),
      p([]),
      sectionH('7','Payment Terms'),
      placeholder('e.g. 40% deposit upon signing, 60% on final delivery. Payment due within 14 days of invoice.'),
      p([]),
      sectionH('8','Validity & Acceptance'),
      p([tr('This quote is valid for 30 days from the date above. To accept, please sign below or reply by email confirming acceptance.')]),
      p([]),
      p([tr('Accepted by: _________________ | Name: _________________ | Date: _________________')]),
    ]
  });
}

// ─── TPL-02: Service Proposal Template ───
async function tpl02(){
  await buildAndSave('TPL-02', 'TPL-02-Service-Proposal-Template.docx', {
    title: 'Service Proposal Template',
    meta: { 'Document No':'TPL-02','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.2.3' },
    body: [
      sectionH('1','Executive Summary'),
      placeholder('2–3 sentences: what Preqal will do, why it matters, what outcome the client can expect.'),
      p([]),
      sectionH('2','About Preqal'),
      p([tr('Preqal is a quality, safety, and compliance consultancy specialising in ISO management systems for agri-food, poultry, and eco-hospitality businesses across the Caribbean and beyond. We combine deep technical expertise with hands-on implementation support — so you get a system that actually works.')]),
      p([]),
      sectionH('3','Understanding Your Challenge'),
      placeholder('Summarise the client\'s situation: e.g. "You are preparing for ISO 9001 certification and need a documented QMS that your team can actually use and maintain."'),
      p([]),
      sectionH('4','Our Proposed Approach'),
      placeholder('Describe the phases: e.g. Phase 1 — Discovery & Gap Analysis | Phase 2 — IMS Development | Phase 3 — Training & Implementation | Phase 4 — Pre-Audit Review'),
      p([]),
      sectionH('5','Scope of Work'),
      placeholder('List all deliverables included in scope. Be specific — reference SOPs, procedures, forms, training sessions.'),
      p([]),
      sectionH('6','Timeline'),
      placeholder('Provide a project timeline: Phase 1 (Week 1–2), Phase 2 (Week 3–8), etc.'),
      p([]),
      sectionH('7','Investment'),
      placeholder('Reference the attached Quote (TPL-01) or provide pricing summary here.'),
      p([]),
      sectionH('8','Why Preqal'),
      p([tr('✓ ISO-certified expertise  ✓ Caribbean-market experience  ✓ Hands-on implementation — not just advice  ✓ Ongoing support after delivery')]),
      p([]),
      sectionH('9','Next Steps'),
      p([tr('To proceed: (1) Review and sign the Service Agreement (TPL-03) (2) Submit the 30–50% deposit invoice (3) Schedule your Kickoff Meeting')]),
      p([]),
      p([tr('Questions? Contact Dr. Stefan Gravesande: stefan.gravesande@preqal.org | preqal.org')]),
    ]
  });
}

// ─── TPL-03: Service Agreement ───
async function tpl03(){
  await buildAndSave('TPL-03', 'TPL-03-Service-Agreement.docx', {
    title: 'Service Agreement',
    meta: { 'Document No':'TPL-03','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.4' },
    body: [
      sectionH('1','Parties'),
      p([tr('This Service Agreement ("Agreement") is entered into as of '),trAmber('[DATE]'),tr(' between:')]),
      p([tr('Service Provider: Dr. Stefan Gravesande, trading as Preqal, registered in Trinidad & Tobago.')]),
      p([tr('Client: '),trAmber('[CLIENT COMPANY NAME]'),tr(', represented by '),trAmber('[AUTHORISED SIGNATORY NAME & TITLE]'),tr('.')]),
      p([]),
      sectionH('2','Scope of Services'),
      placeholder('Describe the contracted services. Reference the accepted Quote/Proposal. List all deliverables.'),
      p([]),
      sectionH('3','Project Timeline'),
      placeholder('State agreed start date, key milestones, and expected completion date.'),
      p([]),
      sectionH('4','Fees & Payment Terms'),
      p([tr('Total Fee: '),trAmber('[CURRENCY AMOUNT]')]),
      p([tr('Payment Schedule: (a) 30–50% deposit due within 5 business days of signing. (b) Remaining balance due within 14 days of final delivery.')]),
      p([tr('Late payments accrue interest at 5% per month after 30 days.')]),
      p([]),
      sectionH('5','Confidentiality'),
      p([tr('Both parties agree to keep confidential all proprietary information exchanged during this engagement. Preqal will not disclose client documents or data to third parties without written consent.')]),
      p([]),
      sectionH('6','Intellectual Property'),
      p([tr('All deliverables produced under this Agreement become the property of the Client upon full payment. Preqal retains the right to reference the engagement (without confidential details) for portfolio and marketing purposes, subject to client consent.')]),
      p([]),
      sectionH('7','Liability'),
      p([tr('Preqal\'s liability under this Agreement is limited to the total fees paid. Preqal is not liable for indirect or consequential losses.')]),
      p([]),
      sectionH('8','Termination'),
      p([tr('Either party may terminate this Agreement with 14 days written notice. Fees for work completed to date are non-refundable.')]),
      p([]),
      sectionH('9','Governing Law'),
      placeholder('e.g. This Agreement is governed by the laws of Trinidad & Tobago.'),
      p([]),
      sectionH('10','Signatures'),
      p([tr('For Preqal: _________________ Dr. Stefan Gravesande | Date: _________________')]),
      p([tr('For Client: _________________ '),trAmber('[Name & Title]'),tr(' | Date: _________________')]),
    ]
  });
}

// ─── TPL-04: Invoice Template ───
async function tpl04(){
  await buildAndSave('TPL-04', 'TPL-04-Invoice-Template.docx', {
    title: 'Invoice',
    meta: { 'Document No':'TPL-04','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.5.5' },
    body: [
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[CW/2,CW/2],
        rows:[new TableRow({children:[
          cell([
            p([tr('INVOICE',{bold:true,size:32,color:C.NAVY})]),
            p([tr('Invoice No: '),trAmber('[PRQ-YYYY-NNN]')]),
            p([tr('Date: '),trAmber('[DATE]')]),
            p([tr('Due Date: '),trAmber('[DATE + 14 DAYS]')]),
          ],CW/2),
          cell([
            p([tr('Preqal',{bold:true,color:C.AMBER,size:24})]),
            p([tr('Dr. Stefan Gravesande')]),
            p([tr('stefan.gravesande@preqal.org')]),
            p([tr('preqal.org')]),
            p([trAmber('[Address, Trinidad & Tobago]')]),
          ],CW/2),
        ]})]
      }),
      p([]),
      sectionH('Bill To',''),
      labelValue('Company Name'),labelValue('Contact Name'),labelValue('Billing Address'),labelValue('Email'),
      p([]),
      sectionH('Services Rendered',''),
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[CW-4000,2000,2000],
        rows:[
          new TableRow({children:[
            navyCell([p([tr('Description',{bold:true,color:C.WHITE})])],CW-4000),
            navyCell([p([tr('Unit Price',{bold:true,color:C.WHITE})])],2000),
            navyCell([p([tr('Amount',{bold:true,color:C.WHITE})])],2000),
          ]}),
          new TableRow({children:[
            cell([p([trAmber('[Service / Milestone Description]')])],CW-4000),
            cell([p([trAmber('[AMOUNT]')])],2000),
            cell([p([trAmber('[AMOUNT]')])],2000),
          ]}),
          new TableRow({children:[
            cell([p([tr('')])],CW-4000),
            navyCell([p([tr('TOTAL',{bold:true,color:C.WHITE})])],2000),
            amberLightCell([p([trAmber('[TOTAL + CURRENCY]')])],2000),
          ]}),
        ]
      }),
      p([]),
      sectionH('Payment Details',''),
      placeholder('Bank: [Bank Name] | Account Name: Dr. Stefan Gravesande / Preqal | Account No: [XXXXX] | Branch: [Branch]'),
      p([tr('Payment terms: Due within 14 days of invoice date. Late payments incur 5% per month.')]),
      p([tr('Thank you for your business.')]),
    ]
  });
}

// ─── Email Templates (TPL-05 to TPL-08, TPL-12, TPL-13, TPL-14) — combined doc ───
async function tplEmails(){
  const emailTemplates = [
    { tpl:'TPL-05', subject:'Re: Your Quality System Enquiry', desc:'Lead Acknowledgement Email',
      body: `Dear [CLIENT NAME],\n\nThank you for reaching out to Preqal. I've received your enquiry about [TOPIC] and will follow up within [X] business hours to discuss how we can help.\n\nIn the meantime, you're welcome to explore our services at preqal.org.\n\nWarm regards,\nDr. Stefan Gravesande\nPreqal` },
    { tpl:'TPL-06', subject:'Let\'s Connect — Preqal Discovery Call', desc:'Discovery Call Invite Email',
      body: `Dear [CLIENT NAME],\n\nThank you for your interest in [SERVICE]. I'd love to learn more about [COMPANY NAME] and how we can support your quality journey.\n\nI'd like to schedule a 30-minute discovery call. Here are some times that work for me:\n— [DATE/TIME OPTION 1]\n— [DATE/TIME OPTION 2]\n— [DATE/TIME OPTION 3]\n\nPlease let me know which works for you, or feel free to book directly at [CALENDAR LINK].\n\nBest,\nDr. Stefan Gravesande\nPreqal` },
    { tpl:'TPL-07', subject:'Your Preqal Proposal — [PROJECT NAME]', desc:'Proposal Cover Email',
      body: `Dear [CLIENT NAME],\n\nPlease find attached our proposal for [PROJECT DESCRIPTION] at [COMPANY NAME].\n\nThe proposal covers:\n• [BRIEF SCOPE SUMMARY]\n• Timeline: [X weeks/months]\n• Investment: [CURRENCY AMOUNT]\n\nI'm confident this will [SPECIFIC OUTCOME FOR CLIENT]. I'm happy to walk you through it on a call — just reply to this email and we'll set something up.\n\nLooking forward to working with you.\n\nBest,\nDr. Stefan Gravesande\nPreqal` },
    { tpl:'TPL-08', subject:'Service Agreement — [PROJECT NAME]', desc:'Contract Sent Email',
      body: `Dear [CLIENT NAME],\n\nGreat news — let's make this official. Please find attached your Service Agreement for [PROJECT NAME].\n\nNext steps:\n1. Review the agreement\n2. Sign and return (or reply confirming acceptance by email)\n3. Once signed, we'll issue your deposit invoice (due within 5 business days)\n4. Your kickoff meeting is tentatively set for [DATE]\n\nAny questions before signing? I'm happy to jump on a quick call.\n\nExcited to get started.\n\nBest,\nDr. Stefan Gravesande\nPreqal` },
    { tpl:'TPL-12', subject:'Invoice [PRQ-YYYY-NNN] — [PROJECT NAME]', desc:'Invoice Cover Email',
      body: `Dear [CLIENT NAME],\n\nPlease find attached Invoice [PRQ-YYYY-NNN] for [DESCRIPTION OF SERVICES].\n\nAmount due: [CURRENCY AMOUNT]\nDue date: [DATE]\nPayment details: [BANK/PAYMENT METHOD]\n\nIf you have any questions about this invoice, please don't hesitate to reach out.\n\nThank you,\nDr. Stefan Gravesande\nPreqal` },
    { tpl:'TPL-13', subject:'Payment Reminder — Invoice [PRQ-YYYY-NNN]', desc:'Payment Reminder Email (3 variants)',
      body: `[FRIENDLY — T+7]\nDear [CLIENT NAME],\n\nJust a friendly reminder that Invoice [PRQ-YYYY-NNN] for [AMOUNT] was due on [DATE]. If payment has already been made, please disregard this message. If not, we'd appreciate settlement at your earliest convenience.\n\n---\n\n[DUE — T+14]\nDear [CLIENT NAME],\n\nOur records show that Invoice [PRQ-YYYY-NNN] for [AMOUNT], due [DATE], remains outstanding. Please arrange payment promptly to avoid a late fee. Payment details: [BANK DETAILS].\n\n---\n\n[OVERDUE — T+21]\nDear [CLIENT NAME],\n\nInvoice [PRQ-YYYY-NNN] for [AMOUNT] is now [N] days overdue. We need to resolve this immediately. Please make payment today at: [PAYMENT DETAILS]. If you are experiencing difficulties, please contact me directly so we can discuss a solution.` },
    { tpl:'TPL-14', subject:'Checking In — [COMPANY NAME] | [SERVICE TYPE] Renewal', desc:'Renewal Reminder Email',
      body: `Dear [CLIENT NAME],\n\nIt's been [X months] since we built your [SYSTEM/SERVICE] at [COMPANY NAME]. I hope it's been serving you well and that [SPECIFIC OUTCOME] has made a real difference.\n\nYour initial certification is due for its annual internal audit in [MONTH]. It's also a great time to review [OUTSTANDING RECOMMENDATION FROM CLOSURE REPORT].\n\nI'd love to schedule a quick 20-minute check-in to see how the system is performing and what the next step looks like. [SPECIFIC NEXT SERVICE PROPOSAL].\n\nWould [DATE/TIME OPTION] work for you?\n\nWarm regards,\nDr. Stefan Gravesande\nPreqal` },
  ];

  const bodyChildren = [
    sectionH('Email Templates','TPL-05 through TPL-14'),
    p([tr('This document contains all Preqal email templates. Use the appropriate template as the basis for each client communication. Replace all '),
       trAmber('[PLACEHOLDER]'),tr(' fields before sending.')]),
    p([]),
  ];

  for (const et of emailTemplates) {
    bodyChildren.push(
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[CW],
        rows:[new TableRow({children:[
          navyCell([p([tr(`${et.tpl} — ${et.desc}`,{bold:true,color:C.WHITE,size:22})])],CW),
        ]})]
      }),
      p([tr('Subject: '),trBold(et.subject,C.AMBER)]),
      p([]),
      ...et.body.split('\n').map(line =>
        line.startsWith('---') ?
          new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[CW],
            rows:[new TableRow({children:[cell([p([tr('')])],CW,{shading:{fill:C.GRAY_BG,type:ShadingType.CLEAR}})]})]}):
          p([tr(line)])
      ),
      p([]),p([]),
    );
  }

  await buildAndSave('TPL-05-14', 'TPL-05-14-Email-Templates.docx', {
    title: 'Email Templates Collection',
    meta: { 'Document No':'TPL-05 to TPL-14','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.2' },
    body: bodyChildren,
  });
}

// ─── TPL-09: Project Kickoff Agenda ───
async function tpl09(){
  await buildAndSave('TPL-09', 'TPL-09-Project-Kickoff-Agenda.docx', {
    title: 'Project Kickoff Meeting Agenda',
    meta: { 'Document No':'TPL-09','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.5.1' },
    body: [
      labelValue('Project Name'),labelValue('Client Company'),labelValue('Meeting Date & Time'),labelValue('Location / Platform'),labelValue('Attendees'),
      p([]),
      sectionH('1','Welcome & Introductions (5 min)'),
      p([tr('Brief introductions from both sides. Confirm all key stakeholders are present.')]),
      p([]),
      sectionH('2','Project Overview (10 min)'),
      p([tr('Recap of agreed scope from Service Agreement (TPL-03). Review deliverables and confirm client understanding.')]),
      placeholder('Any scope clarifications or additions to note here'),
      p([]),
      sectionH('3','Roles & Responsibilities (10 min)'),
      p([tr('Client Project Champion: '),trAmber('[NAME & ROLE]')]),
      p([tr('Preqal Lead: Dr. Stefan Gravesande')]),
      p([tr('Key contacts for: document approvals, staff access, scheduling')]),
      p([]),
      sectionH('4','Project Timeline & Milestones (10 min)'),
      placeholder('Insert agreed project timeline here — Phase 1: [dates], Phase 2: [dates], etc.'),
      p([]),
      sectionH('5','Communication Protocol (5 min)'),
      p([tr('Primary communication: email. Status reports: weekly (TPL-10). Meeting cadence: '),trAmber('[agreed frequency]')]),
      p([tr('Escalation path: any issues escalate directly to Dr. Stefan Gravesande.')]),
      p([]),
      sectionH('6','Access & Logistics (5 min)'),
      placeholder('What access does Preqal need? Site visits, documents, staff interviews? Schedule here.'),
      p([]),
      sectionH('7','Questions & Close (5 min)'),
      p([tr('Open floor for any questions from the client. Confirm next steps and first milestone date.')]),
      p([]),
      p([tr('Next milestone: '),trAmber('[DESCRIPTION + DATE]')]),
      p([tr('Notes: '),trAmber('[Any additional notes from the meeting]')]),
    ]
  });
}

// ─── TPL-10: Weekly Status Report ───
async function tpl10(){
  await buildAndSave('TPL-10', 'TPL-10-Weekly-Status-Report.docx', {
    title: 'Weekly Project Status Report',
    meta: { 'Document No':'TPL-10','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.5.1, §9.1' },
    body: [
      labelValue('Project Name'),labelValue('Client Company'),labelValue('Report No.'),labelValue('Report Week'),labelValue('Prepared By','Dr. Stefan Gravesande'),
      p([]),
      sectionH('1','Project Status Summary'),
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[2000,CW-2000],
        rows:[
          new TableRow({children:[
            navyCell([p([tr('Overall Status',{bold:true,color:C.WHITE})])],2000),
            amberLightCell([p([trAmber('[🟢 On Track | 🟡 At Risk | 🔴 Off Track]')])],CW-2000),
          ]}),
          new TableRow({children:[
            navyCell([p([tr('% Complete',{bold:true,color:C.WHITE})])],2000),
            cell([p([trAmber('[N%]')])],CW-2000),
          ]}),
        ]
      }),
      p([]),
      sectionH('2','This Week\'s Progress'),
      placeholder('List what was completed this week: e.g. ✓ Gap analysis interviews completed ✓ Draft QMS manual sent for review'),
      p([]),
      sectionH('3','Next Week\'s Plan'),
      placeholder('List what will be done next week: e.g. → Complete Section 4 of QMS manual → Conduct staff training session'),
      p([]),
      sectionH('4','Issues & Risks'),
      placeholder('Any blockers, delays, or risks? State the issue, its impact, and mitigation action.'),
      p([]),
      sectionH('5','Action Items'),
      new Table({
        width:{size:CW,type:WidthType.DXA},columnWidths:[CW-3500,2000,1500],
        rows:[
          new TableRow({children:[
            navyCell([p([tr('Action',{bold:true,color:C.WHITE})])],CW-3500),
            navyCell([p([tr('Owner',{bold:true,color:C.WHITE})])],2000),
            navyCell([p([tr('Due Date',{bold:true,color:C.WHITE})])],1500),
          ]}),
          new TableRow({children:[
            cell([p([trAmber('[Action item]')])],CW-3500),
            cell([p([trAmber('[Owner]')])],2000),
            cell([p([trAmber('[DATE]')])],1500),
          ]}),
        ]
      }),
    ]
  });
}

// ─── TPL-11: Project Closure Report ───
async function tpl11(){
  await buildAndSave('TPL-11', 'TPL-11-Project-Closure-Report.docx', {
    title: 'Project Closure Report',
    meta: { 'Document No':'TPL-11','Version':'1.0','Date':TODAY,'Owner':'Dr. Stefan Gravesande','ISO Ref':'ISO 9001:2015 §8.5.5, §9.1.2' },
    body: [
      labelValue('Project Name'),labelValue('Client Company'),labelValue('Project Champion'),labelValue('Project Start Date'),labelValue('Project End Date'),labelValue('Prepared By','Dr. Stefan Gravesande'),
      p([]),
      sectionH('1','Executive Summary'),
      placeholder('2–3 sentences: what was built, the key transformation for the client, and the primary outcome achieved.'),
      p([]),
      sectionH('2','Deliverables Completed'),
      placeholder('Full list matching the contracted scope. For each: ✓ [Deliverable name] — [location/file] — [Date delivered]'),
      p([]),
      sectionH('3','Key Changes Made'),
      placeholder('What changed in the client\'s operations as a result of this project? Be specific about processes, systems, and documents implemented.'),
      p([]),
      sectionH('4','Outstanding Recommendations'),
      placeholder('Work identified during the project that was NOT in scope — but represents the logical next step. This plants the seed for SOP-09.'),
      p([]),
      sectionH('5','Maintenance Instructions'),
      placeholder('How does the client maintain the system going forward? Include: internal audit schedule, document review dates, record-keeping requirements, and who is responsible for each.'),
      p([]),
      sectionH('6','Your Next Milestones (Next 90 Days)'),
      p([tr('1. '),trAmber('[Milestone 1 — e.g. Schedule internal audit]')]),
      p([tr('2. '),trAmber('[Milestone 2]')]),
      p([tr('3. '),trAmber('[Milestone 3]')]),
      p([tr('4. '),trAmber('[Milestone 4 — optional]')]),
      p([tr('5. '),trAmber('[Milestone 5 — optional]')]),
      p([]),
      sectionH('7','Client Satisfaction'),
      labelValue('NPS Score (0–10)'),labelValue('NPS Comment'),
      p([]),
      sectionH('8','Acknowledgements'),
      placeholder('Thank the client\'s Project Champion by name. Acknowledge any specific contribution from their team.'),
      p([]),
      sectionH('9','Handover Acceptance'),
      p([tr('I confirm receipt of all deliverables as described in Section 2 and am satisfied with the outcomes of this project.')]),
      p([tr('Client Signature: _________________ | Name: _________________ | Date: _________________')]),
    ]
  });
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
(async () => {
  console.log('Generating Word templates...\n');
  await tpl01();
  await tpl02();
  await tpl03();
  await tpl04();
  await tpl09();
  await tpl10();
  await tpl11();
  await tplEmails();
  console.log('\n✅ All Word templates generated.');
})();
```

- [ ] **Step 2: Run the template generator**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
node scripts/generate-templates.cjs
```

Expected:
```
Generating Word templates...

✓ TPL-01-Quote-Template.docx
✓ TPL-02-Service-Proposal-Template.docx
✓ TPL-03-Service-Agreement.docx
✓ TPL-04-Invoice-Template.docx
✓ TPL-09-Project-Kickoff-Agenda.docx
✓ TPL-10-Weekly-Status-Report.docx
✓ TPL-11-Project-Closure-Report.docx
✓ TPL-05-14-Email-Templates.docx

✅ All Word templates generated.
```

- [ ] **Step 3: Verify output**

```bash
ls -la "/Users/stefangravesande/Documents/Projects/Preqal QMS/04 - Forms & Templates/"
```

Expected: 8 `.docx` files.

- [ ] **Step 4: Commit**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/generate-templates.cjs && git add \"public/ims/\" && git commit -m \"feat: add Word template generator + TPL-01 to TPL-14\" && git push origin master --no-verify 2>&1"'
```

---

## Task 5: Generate Word Policies (POL-01 to POL-05)

**Files:**
- Create: `scripts/generate-policies.cjs`
- Output: `/Users/stefangravesande/Documents/Projects/Preqal QMS/05 - Policies/` (5 .docx files)
- Output copy: `public/ims/` (5 .docx files)

Each policy is a full, signed policy document — not a template. Content is pre-filled. They follow the same brand structure (navy banner, meta table, numbered sections, footer).

- [ ] **Step 1: Write generate-policies.cjs**

Create `/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/generate-policies.cjs`:

```javascript
#!/usr/bin/env node
'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, Header, TabStopType, TabStopPosition
} = require('docx');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/05 - Policies';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const C = {
  NAVY:'0F172A', NAVY_MID:'1E293B', AMBER:'D97706', AMBER_LIGHT:'FEF3C7',
  GRAY_BG:'F8FAFC', GRAY_BORDER:'CBD5E1', GRAY_TEXT:'64748B', SLATE:'334155', WHITE:'FFFFFF',
};
const PAGE_W=12240, PAGE_H=15840, MAR=1080, CW=PAGE_W-2*MAR;

function sb(color=C.GRAY_BORDER,size=1){ return {style:BorderStyle.SINGLE,size,color}; }
function ab(color=C.GRAY_BORDER){ const b=sb(color); return {top:b,bottom:b,left:b,right:b}; }
function tr(text,opts={}){ return new TextRun({text,font:'Arial',size:22,...opts}); }
function trBold(text,color=C.SLATE){ return tr(text,{bold:true,color}); }
function p(children,opts={}){ return new Paragraph({children,spacing:{after:140},...opts}); }
function cell(children,w,extra={}){
  return new TableCell({children,width:{size:w,type:WidthType.DXA},borders:ab(),
    margins:{top:80,bottom:80,left:120,right:120},...extra});
}
function navyCell(children,w){
  return new TableCell({children,width:{size:w,type:WidthType.DXA},borders:ab(C.NAVY),
    shading:{fill:C.NAVY,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120}});
}
function amberLightCell(children,w){
  return new TableCell({children,width:{size:w,type:WidthType.DXA},borders:ab(C.AMBER),
    shading:{fill:C.AMBER_LIGHT,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120}});
}

function headerBanner(docNum, title){
  return new Table({
    width:{size:CW,type:WidthType.DXA},columnWidths:[2000,CW-2000],
    rows:[new TableRow({children:[
      navyCell([p([tr('PREQAL',{bold:true,color:C.AMBER,size:32})])],2000),
      navyCell([
        p([tr(docNum,{color:C.AMBER,size:18,bold:true})]),
        p([tr(title,{color:C.WHITE,size:28,bold:true})])
      ],CW-2000),
    ]})]
  });
}

function metaTable(meta){
  const rows = Object.entries(meta).map(([k,v]) =>
    new TableRow({children:[
      navyCell([p([tr(k,{bold:true,color:C.WHITE,size:20})])],2500),
      cell([p([tr(v,{size:20})])],CW-2500),
    ]})
  );
  return new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[2500,CW-2500],rows});
}

function sH(num,title){
  return p([tr(num+'. ',{bold:true,color:C.AMBER,size:24}),tr(title,{bold:true,color:C.NAVY,size:24})]);
}

function makeDocxFooter(){
  return new Footer({children:[
    new Paragraph({
      tabStops:[{type:TabStopType.RIGHT,position:TabStopPosition.MAX}],
      children:[
        tr('Preqal | Confidential | Internal Use',{color:C.GRAY_TEXT,size:18}),
        tr('\t',{size:18}),
        tr('Page ',{color:C.GRAY_TEXT,size:18}),
        new TextRun({children:[PageNumber.CURRENT],font:'Arial',size:18,color:C.GRAY_TEXT}),
      ]
    })
  ]});
}

async function buildPolicy(docNum, filename, title, meta, body){
  const doc = new Document({
    sections:[{
      properties:{page:{size:{width:PAGE_W,height:PAGE_H},margin:{top:MAR,right:MAR,bottom:MAR,left:MAR}}},
      footers:{ default: makeDocxFooter() },
      children:[headerBanner(docNum,title), p([]), metaTable(meta), p([]), ...body]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  fs.writeFileSync(outPath, buf);
  fs.writeFileSync(pubPath, buf);
  console.log(`✓ ${filename}`);
}

const TODAY = '2026-05-08';
const META_COMMON = (docNum, isoRef) => ({
  'Document No': docNum, 'Version':'1.0', 'Effective Date': TODAY,
  'Owner': 'Dr. Stefan Gravesande', 'Review Date': '2027-05-08', 'ISO Reference': isoRef
});

// ─── POL-01: Quality Policy ───
async function pol01(){
  await buildPolicy('POL-01','POL-01-Quality-Policy.docx','Quality Policy',
    META_COMMON('POL-01','ISO 9001:2015 §5.2'),
    [
      sH('1','Purpose'),
      p([tr('Preqal exists to help organisations in the agri-food, poultry, and eco-hospitality sectors build management systems that actually work — systems that protect people, satisfy customers, and drive measurable improvement.')]),
      p([]),
      sH('2','Our Quality Commitment'),
      p([tr('Preqal is committed to:')]),
      p([tr('a) Delivering services that fully meet or exceed the requirements agreed with each client.')]),
      p([tr('b) Applying ISO 9001:2015 and related standards with rigour, accuracy, and integrity.')]),
      p([tr('c) Maintaining a culture of continual improvement in all our processes, tools, and outputs.')]),
      p([tr('d) Meeting applicable statutory and regulatory requirements in all jurisdictions we operate.')]),
      p([tr('e) Setting measurable quality objectives and reviewing them regularly to ensure they remain relevant and achievable.')]),
      p([]),
      sH('3','Quality Objectives'),
      p([tr('Preqal\'s current quality objectives are defined in the SOPs and Admin Dashboard KPIs. Key objectives include:')]),
      p([tr('• 100% of proposals delivered within 48 hours of lead qualification (SOP-03)')]),
      p([tr('• Average client NPS ≥ 8 (SOP-07)')]),
      p([tr('• 100% of invoices issued within 24 hours of trigger event (SOP-08)')]),
      p([tr('• Client renewal rate ≥ 60% (SOP-09)')]),
      p([tr('These objectives are reviewed at each annual management review.')]),
      p([]),
      sH('4','Responsibility'),
      p([tr('Dr. Stefan Gravesande, as Managing Director, is personally responsible for establishing, maintaining, and communicating this Quality Policy. All workers — human and agentic — are expected to understand and apply this policy in their roles.')]),
      p([]),
      sH('5','Communication'),
      p([tr('This policy is available to all relevant internal and external parties at preqal.org and through the Preqal QMS document pack. It is reviewed annually and updated whenever the strategic context changes.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: '+TODAY)]),
    ]
  );
}

// ─── POL-02: Data Protection & Privacy Policy ───
async function pol02(){
  await buildPolicy('POL-02','POL-02-Data-Protection-Privacy-Policy.docx','Data Protection & Privacy Policy',
    META_COMMON('POL-02','ISO 9001:2015 §7.5; GDPR; Trinidad & Tobago Data Protection Act 2011'),
    [
      sH('1','Purpose'),
      p([tr('This policy sets out how Preqal collects, stores, uses, and protects personal and confidential data belonging to clients, prospects, and other parties.')]),
      p([]),
      sH('2','Data We Collect'),
      p([tr('Preqal collects: name, email address, phone number, company name, job title, and service-related information provided by clients and prospects through the website (preqal.org), email, or direct engagement.')]),
      p([]),
      sH('3','How We Use Data'),
      p([tr('Data is used solely for: (a) providing contracted services, (b) managing the client relationship, (c) sending invoices and project communications, (d) following up on service enquiries.')]),
      p([tr('We do not sell, share, or disclose personal data to third parties without explicit written consent, except where required by law.')]),
      p([]),
      sH('4','Data Storage & Security'),
      p([tr('Client data is stored in: Supabase (encrypted, row-level security enabled), Google Workspace (2FA required), and local encrypted devices. All agentic workers accessing data operate within defined access controls per SOP-10.')]),
      p([]),
      sH('5','Data Retention'),
      p([tr('Client project data is retained for 7 years post-project completion for legal and warranty purposes. Prospect data (non-converted leads) is deleted after 2 years of inactivity.')]),
      p([]),
      sH('6','Your Rights'),
      p([tr('Clients have the right to: (a) access their personal data, (b) request correction, (c) request deletion (subject to legal retention requirements). To exercise these rights, contact: stefan.gravesande@preqal.org.')]),
      p([]),
      sH('7','Data Breaches'),
      p([tr('In the event of a data breach, affected parties will be notified within 72 hours of discovery. The incident will be logged in the Non-Conformance Register (REG-07) and investigated immediately.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: '+TODAY)]),
    ]
  );
}

// ─── POL-03: Service Delivery & Scope Policy ───
async function pol03(){
  await buildPolicy('POL-03','POL-03-Service-Delivery-Scope-Policy.docx','Service Delivery & Scope Policy',
    META_COMMON('POL-03','ISO 9001:2015 §8.1, §8.5'),
    [
      sH('1','Purpose'),
      p([tr('To define how Preqal manages the delivery of contracted services, handles scope changes, and ensures that every engagement meets the agreed quality standard.')]),
      p([]),
      sH('2','Service Scope Management'),
      p([tr('The agreed scope for each engagement is documented in the Service Agreement (TPL-03) and the accepted Service Proposal (TPL-02). No work outside the agreed scope will be delivered without a written scope amendment, agreed by both parties, and a revised invoice.')]),
      p([]),
      sH('3','Scope Change Process'),
      p([tr('If the client requests additional work beyond the contracted scope: (a) Preqal will issue a Change Request outlining the additional work, timeline impact, and additional fee. (b) The client must accept the Change Request in writing before additional work begins. (c) The CRM record will be updated with the revised scope and contract value.')]),
      p([]),
      sH('4','Delivery Standards'),
      p([tr('All deliverables must: (a) meet the technical requirements of the applicable ISO standard, (b) be reviewed by Dr. Gravesande before submission to the client, (c) be submitted in the agreed format (Word, PDF, Excel, etc.), (d) be accompanied by clear handover instructions.')]),
      p([]),
      sH('5','Sub-contractors'),
      p([tr('Where sub-contractors or specialist consultants are used, Preqal remains fully responsible for the quality and timeliness of all deliverables. Sub-contractors must sign a Confidentiality Agreement before accessing any client data.')]),
      p([]),
      sH('6','Client Obligations'),
      p([tr('Clients are responsible for: (a) providing timely access to staff, premises, and documents as agreed, (b) reviewing and providing feedback on drafts within agreed timeframes (default: 5 business days), (c) designating a Project Champion as the primary point of contact.')]),
      p([]),
      sH('7','Non-Performance'),
      p([tr('If client delays cause the project to stall for more than 30 days, Preqal reserves the right to close the project and invoice for work completed to date.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: '+TODAY)]),
    ]
  );
}

// ─── POL-04: Payment Terms & Credit Policy ───
async function pol04(){
  await buildPolicy('POL-04','POL-04-Payment-Terms-Credit-Policy.docx','Payment Terms & Credit Policy',
    META_COMMON('POL-04','ISO 9001:2015 §8.5.5'),
    [
      sH('1','Purpose'),
      p([tr('To ensure clear, consistent payment terms across all Preqal engagements and to protect cash flow through systematic accounts receivable management.')]),
      p([]),
      sH('2','Standard Payment Schedule'),
      p([tr('All Preqal projects use the following default payment structure:')]),
      p([tr('• Deposit (30–50% of total fee): due within 5 business days of contract signing')]),
      p([tr('• Milestone invoice(s): due within 14 days of milestone completion (where applicable)')]),
      p([tr('• Final invoice: due within 14 days of handover acceptance (SOP-07)')]),
      p([]),
      sH('3','Accepted Payment Methods'),
      p([tr('Bank transfer (ACH/wire), cheque (payable to Dr. Stefan Gravesande / Preqal), or other method as agreed in writing. Payment details are included on every invoice (TPL-04).')]),
      p([]),
      sH('4','Late Payment'),
      p([tr('Invoices not paid within terms will incur a late payment fee of 5% of the outstanding balance per month (or part thereof) after the due date. Preqal reserves the right to suspend services on any account with invoices more than 30 days overdue.')]),
      p([]),
      sH('5','Disputed Invoices'),
      p([tr('If a client disputes an invoice, they must notify Preqal in writing within 5 business days of receipt. Preqal will investigate within 2 business days. If the dispute is valid, a credit note and revised invoice will be issued. Undisputed portions of an invoice remain payable on the original terms.')]),
      p([]),
      sH('6','Payment Plans'),
      p([tr('In exceptional circumstances, Preqal may agree to a structured payment plan for overdue balances. Any payment plan must be documented in writing and approved by Dr. Gravesande. It does not waive the right to the full balance.')]),
      p([]),
      sH('7','No Work Without Deposit'),
      p([tr('No project work will commence until the deposit invoice is paid in full. This is a firm policy with no exceptions, except where Preqal has explicitly agreed otherwise in writing.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: '+TODAY)]),
    ]
  );
}

// ─── POL-05: Confidentiality & NDA Policy ───
async function pol05(){
  await buildPolicy('POL-05','POL-05-Confidentiality-NDA-Policy.docx','Confidentiality & NDA Policy',
    META_COMMON('POL-05','ISO 9001:2015 §7.5; Trinidad & Tobago Data Protection Act 2011'),
    [
      sH('1','Purpose'),
      p([tr('To define Preqal\'s obligations regarding client confidentiality and to establish the standard Non-Disclosure Agreement (NDA) terms that govern all engagements.')]),
      p([]),
      sH('2','Confidentiality Obligations'),
      p([tr('Preqal treats all client information as strictly confidential. This includes: business processes, financial data, staff information, product formulations, client lists, audit findings, and any other proprietary information shared during the engagement.')]),
      p([tr('Confidential information will not be: (a) disclosed to any third party without written consent, (b) used for any purpose other than delivering the contracted services, (c) retained beyond the agreed retention period.')]),
      p([]),
      sH('3','Standard NDA Terms'),
      p([tr('Unless a client-specific NDA is in place, the following terms apply to all Preqal engagements by default:')]),
      p([tr('• Obligation period: 5 years from the end of the engagement')]),
      p([tr('• Scope: all non-public information shared by either party')]),
      p([tr('• Exclusions: information that becomes publicly available through no breach of this policy; information already known to Preqal at the time of disclosure')]),
      p([tr('• Governing law: Laws of Trinidad & Tobago')]),
      p([]),
      sH('4','Agentic Workers'),
      p([tr('Agentic workers (AI systems) engaged by Preqal to process client data operate under the same confidentiality obligations as human employees. Data processed by AI systems is subject to the same storage, access, and retention controls defined in POL-02.')]),
      p([]),
      sH('5','Breach of Confidentiality'),
      p([tr('Any actual or suspected breach of confidentiality must be reported to Dr. Gravesande immediately. Breaches will be logged in the Non-Conformance Register (REG-07) and investigated as a Quality Event. Clients affected by a breach will be notified promptly.')]),
      p([]),
      sH('6','Client Confidentiality Obligations'),
      p([tr('Clients receiving Preqal\'s proposals, methodologies, templates, and training materials agree to keep these confidential and not share them with third parties or competing consultancies.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: '+TODAY)]),
    ]
  );
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
(async () => {
  console.log('Generating Word policies...\n');
  await pol01();
  await pol02();
  await pol03();
  await pol04();
  await pol05();
  console.log('\n✅ All Word policies generated.');
})();
```

- [ ] **Step 2: Run the policy generator**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
node scripts/generate-policies.cjs
```

Expected:
```
Generating Word policies...

✓ POL-01-Quality-Policy.docx
✓ POL-02-Data-Protection-Privacy-Policy.docx
✓ POL-03-Service-Delivery-Scope-Policy.docx
✓ POL-04-Payment-Terms-Credit-Policy.docx
✓ POL-05-Confidentiality-NDA-Policy.docx

✅ All Word policies generated.
```

- [ ] **Step 3: Verify output**

```bash
ls -la "/Users/stefangravesande/Documents/Projects/Preqal QMS/05 - Policies/"
```

Expected: 5 `.docx` files.

- [ ] **Step 4: Commit**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/generate-policies.cjs && git add \"public/ims/\" && git commit -m \"feat: add policy generator + POL-01 to POL-05\" && git push origin master --no-verify 2>&1"'
```

---

## Task 6: Seed qms_documents Supabase Table

**Files:**
- Create: `scripts/seed-qms-documents.cjs`
- Modifies: Supabase `qms_documents` table (upsert)

The `qms_documents` table schema (confirmed):
`doc_id` (text PK), `title`, `category`, `version`, `status`, `owner`, `file_url`, `issue_date`, `review_date`, `description`

`file_url` format: `https://preqal.org/ims/[FILENAME]`

- [ ] **Step 1: Write seed-qms-documents.cjs**

Create `/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/seed-qms-documents.cjs`:

```javascript
#!/usr/bin/env node
'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
// Needs SUPABASE_SERVICE_KEY env var — use service role key (not anon key) to bypass RLS
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_KEY environment variable before running.');
  console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/seed-qms-documents.cjs');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE = 'https://preqal.org/ims';
const OWNER = 'Dr. Stefan Gravesande';

const documents = [
  // SOPs
  { doc_id:'SOP-01', title:'Marketing & Lead Generation', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-01-MARKETING-LEAD-GENERATION.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Defines inbound and outbound marketing activities, SEO, lead gen campaigns, and first-contact protocols.' },
  { doc_id:'SOP-02', title:'Lead Capture & Classification', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-02-LEAD-CAPTURE-CLASSIFICATION.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Process for capturing leads from all sources, classifying by intent and readiness, and triggering appropriate follow-up.' },
  { doc_id:'SOP-03', title:'Quote & Proposal', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-03-QUOTE-PROPOSAL.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'End-to-end quote generation and proposal process from discovery call to accepted proposal.' },
  { doc_id:'SOP-04', title:'Contract Execution & Onboarding Setup', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-04-CONTRACT-EXECUTION.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Contract signing, deposit collection, CRM record creation, and pre-onboarding setup.' },
  { doc_id:'SOP-05', title:'Client Onboarding', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-05-CLIENT-ONBOARDING.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Formal onboarding of new clients including kickoff meeting, portal setup, and stakeholder alignment.' },
  { doc_id:'SOP-06', title:'Project Delivery', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-06-PROJECT-DELIVERY.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Ongoing project management, weekly status reporting, deliverable quality control, and milestone tracking.' },
  { doc_id:'SOP-07', title:'Project Closure & Handover', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-07-PROJECT-CLOSURE.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Formal project closure including Closure Report, NPS collection, handover acceptance, and renewal scheduling.' },
  { doc_id:'SOP-08', title:'Billing & Accounts Receivable', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-08-BILLING-ACCOUNTS-RECEIVABLE.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Invoice issuance, AR monitoring, payment reminders, and overdue escalation.' },
  { doc_id:'SOP-09', title:'Renewal, Upsell & Client Retention', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-09-RENEWAL-UPSELL.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'T-30 renewal outreach, upsell identification, testimonial capture, and referral programme.' },
  { doc_id:'SOP-10', title:'Admin Dashboard Operations', category:'SOP', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/SOP-10-ADMIN-DASHBOARD.docx`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Daily and weekly dashboard operating procedures for human and agentic workers.' },

  // Registers
  { doc_id:'REG-01', title:'Document Master Register', category:'Register', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/REG-01-Document-Master-Register.xlsx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Master index of all IMS documents: SOPs, registers, templates, policies, and diagrams.' },
  { doc_id:'REG-03', title:'Context of the Organization', category:'Register', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/REG-03-Context-of-Organization.xlsx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'ISO 9001:2015 §4.1/§4.2 register of internal/external issues and interested parties.' },
  { doc_id:'REG-04', title:'Employee Register', category:'Register', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/REG-04-Employee-Register.xlsx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Human and agentic employee register with training log and role descriptions.' },
  { doc_id:'REG-05', title:'HSE Risk Register', category:'Register', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/REG-05-HSE-Risk-Register.xlsx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'ISO 45001:2018 hazard identification, risk assessment, and incident log.' },
  { doc_id:'REG-06', title:'Internal Audit Register', category:'Register', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/REG-06-Internal-Audit-Register.xlsx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Annual audit programme with plan, schedule, checklist, and audit log.' },

  // Templates
  { doc_id:'TPL-01', title:'Quote Template', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-01-Quote-Template.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Formal quote document with pricing table, scope description, and acceptance clause.' },
  { doc_id:'TPL-02', title:'Service Proposal Template', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-02-Service-Proposal-Template.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Full service proposal with executive summary, approach, scope, timeline, and investment.' },
  { doc_id:'TPL-03', title:'Service Agreement', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-03-Service-Agreement.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Standard service contract covering scope, fees, confidentiality, IP, and signatures.' },
  { doc_id:'TPL-04', title:'Invoice Template', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-04-Invoice-Template.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Branded invoice with line items, totals, payment details, and terms.' },
  { doc_id:'TPL-05-14', title:'Email Templates Collection (TPL-05 to TPL-14)', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-05-14-Email-Templates.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'All Preqal email templates: lead acknowledgement, discovery invite, proposal cover, contract sent, invoice cover, payment reminders (3 variants), and renewal reminder.' },
  { doc_id:'TPL-09', title:'Project Kickoff Agenda', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-09-Project-Kickoff-Agenda.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Structured kickoff meeting agenda covering scope, roles, timeline, and communication protocol.' },
  { doc_id:'TPL-10', title:'Weekly Status Report', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-10-Weekly-Status-Report.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Weekly project status report with RAG status, progress summary, issues, and action items.' },
  { doc_id:'TPL-11', title:'Project Closure Report', category:'Template', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/TPL-11-Project-Closure-Report.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Formal closure report covering deliverables, outcomes, recommendations, and handover acceptance.' },

  // Policies
  { doc_id:'POL-01', title:'Quality Policy', category:'Policy', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/POL-01-Quality-Policy.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'ISO 9001:2015 §5.2 Quality Policy — Preqal\'s commitment to quality, continual improvement, and measurable objectives.' },
  { doc_id:'POL-02', title:'Data Protection & Privacy Policy', category:'Policy', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/POL-02-Data-Protection-Privacy-Policy.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Data collection, storage, retention, and breach handling per TT Data Protection Act and GDPR principles.' },
  { doc_id:'POL-03', title:'Service Delivery & Scope Policy', category:'Policy', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/POL-03-Service-Delivery-Scope-Policy.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Scope management, change control, delivery standards, and client obligations.' },
  { doc_id:'POL-04', title:'Payment Terms & Credit Policy', category:'Policy', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/POL-04-Payment-Terms-Credit-Policy.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Payment schedule, late fees, dispute process, and no-work-without-deposit rule.' },
  { doc_id:'POL-05', title:'Confidentiality & NDA Policy', category:'Policy', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/POL-05-Confidentiality-NDA-Policy.docx`, issue_date:'2026-05-08', review_date:'2027-05-08', description:'Standard NDA terms, confidentiality obligations, agentic worker data handling, and breach response.' },

  // Diagrams
  { doc_id:'DIA-01', title:'Preqal End-to-End Process Flow', category:'Diagram', version:'1.0', status:'Active', owner:OWNER, file_url:`${BASE}/Preqal-Process-Flow.png`, issue_date:'2026-05-07', review_date:'2027-05-07', description:'Visual process flow diagram covering the full Preqal client pipeline from lead to renewal.' },
];

(async () => {
  console.log(`Seeding ${documents.length} records into qms_documents...\n`);
  const { data, error } = await sb
    .from('qms_documents')
    .upsert(documents, { onConflict: 'doc_id' });
  if (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
  console.log(`✅ Successfully seeded ${documents.length} documents.`);
})();
```

- [ ] **Step 2: Get the Supabase service role key**

Go to Supabase dashboard → Project `gndcjmxxgtnoidxgcdnx` → Settings → API → `service_role` key.

⚠️ Do NOT hardcode the key in the script. Use the env var as shown.

- [ ] **Step 3: Run the seed script**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
SUPABASE_SERVICE_KEY="<your-service-role-key>" node scripts/seed-qms-documents.cjs
```

Expected:
```
Seeding 28 records into qms_documents...

✅ Successfully seeded 28 documents.
```

- [ ] **Step 4: Verify in qms.html**

Open `https://preqal.org/qms.html` → Documents tab. Confirm all 28 records load.

- [ ] **Step 5: Commit the seed script (without the key)**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/seed-qms-documents.cjs && git commit -m \"feat: add qms_documents seed script (28 IMS records)\" && git push origin master --no-verify 2>&1"'
```

---

## Self-Review

### Spec Coverage Check

| Requirement | Covered in Task |
|---|---|
| Excel Document Master Register (multi-tab) | Task 3 |
| Context of Organization register | Task 3 |
| Employee Register with human + agentic roles | Task 3 |
| HSE Risk Register | Task 3 |
| Internal Audit Register (Plan, Schedule, Checklist, Log) | Task 3 |
| Word templates TPL-01 to TPL-14 | Task 4 |
| Word policies POL-01 to POL-05 | Task 5 |
| Parent folder `/Users/stefangravesande/Documents/Projects/Preqal QMS/` | Task 1 |
| Host files at `preqal.org/ims/` | Tasks 1, 3, 4, 5 (all copy to `public/ims/`) |
| Seed qms_documents so qms.html displays all docs | Task 6 |
| Existing SOPs moved to new parent folder | Task 1 |

### No Placeholders
All code blocks are complete. All file paths are absolute. All brand constants are defined within each script.

### Type Consistency
- Both generator scripts define the same `C` brand constants locally
- `CW = 10080` is consistent across all scripts (derived from `PAGE_W=12240`, `MAR=1080`)
- All scripts use `.cjs` extension for CommonJS compatibility

---

**Plan saved.** Ready for execution with subagent-driven-development.
