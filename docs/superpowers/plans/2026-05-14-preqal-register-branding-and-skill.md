# Preqal Register Branding + `preqal-register-creator` Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicate the BFF Document Masterlist's branded metadata header (logo + cream-yellow info block + stats panel) for every Preqal Excel register, fill in the missing register generators, wire the sheets to be regenerated live as the site adds rows, and ship a `preqal-register-creator` skill so future registers stay consistent.

**Architecture:** A single reusable `applyPreqalHeader()` builder in `scripts/lib/register-branding.cjs` renders the 11-row metadata block, embeds the favicon, and freezes panes at row 13. `scripts/generate-excel-registers.cjs` becomes a thin driver that pulls live data from Supabase (where applicable) and calls the builder per register. A Postgres trigger on the tracked tables fires an Edge Function that re-runs the matching generator and uploads the result to `storage://registers/preqal/`. The existing `sync-registers-local.cjs` (already cron'd every 5 min) keeps the local QMS folder in sync. A new skill at `~/.claude/skills/preqal-register-creator/SKILL.md` documents the contract.

**Tech Stack:** Node 20 · ExcelJS 4 · `@supabase/supabase-js` · Supabase Storage + Postgres triggers + Edge Functions · openpyxl (verification only) · existing launchd job `org.preqal.sync-ims`.

---

## File Structure

**New files**
- `scripts/lib/register-branding.cjs` — exports `applyPreqalHeader(ws, meta)`, `applyDataHeader(ws, cols)`, `applyDataRow(ws, values, altRow)`, `loadLogoBuf()`. ~180 lines.
- `scripts/lib/register-defs.cjs` — canonical list of every REG-XX (id, title, dcn, scope, supabase table, column map, file name). ~120 lines.
- `scripts/regenerate-register.cjs` — `node scripts/regenerate-register.cjs REG-02` style one-shot regenerator used by the trigger and CLI. ~80 lines.
- `supabase/functions/regen-register/index.ts` — Edge Function invoked by the DB trigger. Calls the equivalent of `regenerate-register.cjs` against current rows, uploads to Storage. ~120 lines.
- `supabase/migrations/20260514_register_triggers.sql` — `AFTER INSERT/UPDATE/DELETE` triggers on `qms_documents`, `qualified_leads`, `crm_clients`, plus a `pg_net` call to invoke the Edge Function. ~80 lines.
- `~/.claude/skills/preqal-register-creator/SKILL.md` — skill manifest + process docs. ~250 lines.

**Existing files modified**
- `scripts/generate-excel-registers.cjs` — strip inline branding code, import from `lib/register-branding.cjs`, switch each `generateREGxx` to read from Supabase where the register tracks a live table.
- `CLAUDE.md` — add "Preqal Register Branding" subsection to the Brand Design System (mirrors the IMS Document Branding block I added today).
- `scripts/sync-registers-local.cjs` — no code change, but add a `--once` flag to allow manual ad-hoc re-pulls.

**No test infra exists in this repo** (one-off CLI scripts only). For each TDD step below the "test" is a `node` invocation that asserts on the produced XLSX via openpyxl. The full file structure for tests goes under `scripts/tests/`.

---

## Branding Spec (referenced by every task)

Mimic BFF Document Masterlist with Preqal colours/typography:

| Region | Rows | Style |
|---|---|---|
| Logo cell | A2:B10 (merged) | `public/favicon.png` inset, white fill, thin grey border |
| Field labels | C2:C9 | `#FEF3C7` fill, Arial 10pt regular, value labels right-aligned |
| Field values | D2:D9 | `#FFFBEB` fill, Arial 10pt regular |
| Big number panel | E2:E9 (merged) | `#FEF3C7` fill, Arial 36pt bold centered — shows live row count |
| Breakdown labels | F2:F5 | `#FEF3C7` fill, Arial 9pt regular |
| Breakdown values | G2:G5 | `#FEF3C7` fill, Arial 10pt bold |
| Status (Created/Revised/Approved) labels | H2:J2 | navy fill, white Arial 9pt bold |
| Status counts | H3:J5 | `#FEF3C7` fill, Arial 18pt bold |
| Status percentages | H6:J9 | `#FEF3C7` fill, Arial 10pt bold |
| Section separator | row 10 | navy fill, height 6pt — visual divider |
| Spacer | row 11 | white fill, height 6pt |
| Data header | row 12 | navy fill, white Arial 11pt bold, wrap, height 28 |
| Data rows | row 13+ | alternate white / `#F8FAFC`, Arial 10pt slate |

Field labels (rows 2–9): `TITLE` · `DCN` · `SCOPE` · `CREATION DATE` · `APPROVAL DATE` · `VERSION NUMBER` · `CURRENT REVISION DATE` · `SCHEDULED REVISION DATE`.

Freeze panes at `B13` so the metadata block and the data header both stay visible.

---

## Tasks

### Task 1: Create the branding library

**Files:**
- Create: `scripts/lib/register-branding.cjs`
- Create: `scripts/tests/test-register-branding.cjs`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/tests/test-register-branding.cjs
'use strict';
const ExcelJS = require('exceljs');
const fs = require('fs');
const { applyPreqalHeader, applyDataHeader, applyDataRow } = require('../lib/register-branding');

(async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  applyPreqalHeader(ws, {
    title: 'TEST REGISTER',
    dcn: 'PQL-REG-99',
    scope: 'TEST SCOPE',
    creationDate: '2026-05-14',
    versionNumber: '1.0',
    bigNumber: 42,
    bigNumberLabel: 'TOTAL ROWS',
    breakdown: [['Type A', 20], ['Type B', 22]],
    status: { created: 42, revised: 0, approved: 0 },
    dataColCount: 6,
  });
  applyDataHeader(ws, ['A','B','C','D','E','F'], [10,20,15,15,15,15]);
  applyDataRow(ws, ['1','2','3','4','5','6'], false);

  await wb.xlsx.writeFile('/tmp/test-register.xlsx');

  // Verify with openpyxl-style spot checks via direct XML
  const buf = fs.readFileSync('/tmp/test-register.xlsx');
  if (buf.length < 5000) throw new Error('Output too small');
  console.log('PASS basic write — size:', buf.length);
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
```

- [ ] **Step 2: Verify the test fails**

Run: `node scripts/tests/test-register-branding.cjs`
Expected: error — module `../lib/register-branding` not found.

- [ ] **Step 3: Implement the branding library**

Create `scripts/lib/register-branding.cjs` with:

```javascript
'use strict';
const fs   = require('fs');
const path = require('path');

const FAVICON = path.resolve(__dirname, '../../public/favicon.png');

// Preqal palette
const NAVY        = 'FF0F172A';
const AMBER_50    = 'FFFFFBEB';
const AMBER_100   = 'FFFEF3C7';
const SLATE_BG    = 'FFF8FAFC';
const WHITE       = 'FFFFFFFF';
const BORDER      = 'FFCBD5E1';
const SLATE_TEXT  = 'FF334155';

const fill = (argb) => ({ type:'pattern', pattern:'solid', fgColor:{ argb } });
const thin = () => {
  const s = { style:'thin', color:{ argb: BORDER } };
  return { top:s, left:s, bottom:s, right:s };
};

function loadLogoBuf() {
  return fs.existsSync(FAVICON) ? fs.readFileSync(FAVICON) : null;
}

/**
 * Renders the 11-row branded metadata header on a sheet.
 * meta: { title, dcn, scope, creationDate, approvalDate, versionNumber,
 *         currentRevisionDate, scheduledRevisionDate, bigNumber, bigNumberLabel,
 *         breakdown: [[label, count], ...], status: {created, revised, approved},
 *         dataColCount }
 */
function applyPreqalHeader(ws, meta) {
  const m = meta || {};
  // Set fixed column widths so the layout reproduces consistently
  const widths = [4, 18, 18, 26, 18, 14, 10, 12, 12, 12];
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // Logo cell A2:B10
  ws.mergeCells('A2:B10');
  const logoCell = ws.getCell('A2');
  logoCell.fill = fill(WHITE);
  logoCell.border = thin();

  const logoBuf = loadLogoBuf();
  if (logoBuf) {
    const imgId = ws.workbook.addImage({ buffer: logoBuf, extension: 'png' });
    ws.addImage(imgId, {
      tl: { col: 0.4, row: 1.4 },
      ext: { width: 90, height: 100 },
      editAs: 'absolute',
    });
  }

  // Field labels (C2..C9) + values (D2..D9)
  const fields = [
    ['TITLE',                  m.title          || ''],
    ['DCN',                    m.dcn            || ''],
    ['SCOPE',                  m.scope          || ''],
    ['CREATION DATE',          m.creationDate   || ''],
    ['APPROVAL DATE',          m.approvalDate   || ''],
    ['VERSION NUMBER',         m.versionNumber  || ''],
    ['CURRENT REVISION DATE',  m.currentRevisionDate  || ''],
    ['SCHEDULED REVISION DATE',m.scheduledRevisionDate|| ''],
  ];
  fields.forEach(([label, value], i) => {
    const row = i + 2;
    const lc = ws.getCell(row, 3);
    lc.value = label;
    lc.fill = fill(AMBER_100);
    lc.font = { name:'Arial', size:10, bold:false };
    lc.alignment = { vertical:'middle', horizontal:'left', indent:1 };
    lc.border = thin();

    const vc = ws.getCell(row, 4);
    vc.value = value;
    vc.fill = fill(AMBER_50);
    vc.font = { name:'Arial', size:10, bold:false };
    vc.alignment = { vertical:'middle', horizontal:'left', indent:1 };
    vc.border = thin();
  });

  // Big number panel E2:E9
  ws.mergeCells('E2:E9');
  const big = ws.getCell('E2');
  big.value = m.bigNumber || 0;
  big.fill = fill(AMBER_100);
  big.font = { name:'Arial', size:36, bold:true, color:{ argb:NAVY } };
  big.alignment = { vertical:'middle', horizontal:'center' };
  big.border = thin();

  // Breakdown table (F2:G5) — up to 4 rows
  const breakdown = (m.breakdown || []).slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const row = i + 2;
    const lc = ws.getCell(row, 6);
    const vc = ws.getCell(row, 7);
    const entry = breakdown[i] || ['', ''];
    lc.value = entry[0];
    vc.value = entry[1];
    [lc, vc].forEach(c => {
      c.fill = fill(AMBER_100);
      c.font = { name:'Arial', size:10, bold: c === vc };
      c.alignment = { vertical:'middle', horizontal: c === lc ? 'left' : 'center', indent: c === lc ? 1 : 0 };
      c.border = thin();
    });
  }

  // Status panel (H2:J2 labels, H3:J5 counts, H6:J9 percentages)
  const statusLabels = ['CREATED','REVISED','APPROVED'];
  const counts = m.status || { created:0, revised:0, approved:0 };
  const totals = [counts.created || 0, counts.revised || 0, counts.approved || 0];
  const total  = (m.bigNumber || 0) || 1;
  statusLabels.forEach((label, i) => {
    const col = 8 + i;
    const lc = ws.getCell(2, col);
    lc.value = label;
    lc.fill = fill(NAVY);
    lc.font = { name:'Arial', size:9, bold:true, color:{ argb:WHITE } };
    lc.alignment = { vertical:'middle', horizontal:'center' };
    lc.border = thin();
    ws.mergeCells(3, col, 5, col);
    const cc = ws.getCell(3, col);
    cc.value = totals[i];
    cc.fill = fill(AMBER_100);
    cc.font = { name:'Arial', size:18, bold:true, color:{ argb:NAVY } };
    cc.alignment = { vertical:'middle', horizontal:'center' };
    cc.border = thin();
    ws.mergeCells(6, col, 9, col);
    const pc = ws.getCell(6, col);
    pc.value = total > 0 ? (totals[i] / total) : 0;
    pc.numFmt = '0.0%';
    pc.fill = fill(AMBER_100);
    pc.font = { name:'Arial', size:10, bold:true, color:{ argb:NAVY } };
    pc.alignment = { vertical:'middle', horizontal:'center' };
    pc.border = thin();
  });

  // Row 10 navy divider
  ws.getRow(10).height = 6;
  for (let c = 1; c <= (m.dataColCount || 10); c++) {
    ws.getCell(10, c).fill = fill(NAVY);
  }
  // Row 11 spacer
  ws.getRow(11).height = 6;

  // Heights
  for (let r = 2; r <= 9; r++) ws.getRow(r).height = 22;

  ws.views = [{ state:'frozen', xSplit:0, ySplit:12 }];
}

function applyDataHeader(ws, headers, widths) {
  const row = ws.getRow(12);
  headers.forEach((h, i) => {
    const c = row.getCell(i + 1);
    c.value = h;
    c.fill = fill(NAVY);
    c.font = { name:'Arial', size:11, bold:true, color:{ argb:WHITE } };
    c.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    c.border = thin();
  });
  row.height = 28;
  if (widths) widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function applyDataRow(ws, values, altRow) {
  const row = ws.addRow(values);
  row.eachCell((c) => {
    c.fill = fill(altRow ? SLATE_BG : WHITE);
    c.font = { name:'Arial', size:10, color:{ argb:SLATE_TEXT } };
    c.alignment = { vertical:'middle', wrapText:true };
    c.border = thin();
  });
  row.height = 18;
  return row;
}

module.exports = { applyPreqalHeader, applyDataHeader, applyDataRow, loadLogoBuf };
```

- [ ] **Step 4: Verify the test passes**

Run: `node scripts/tests/test-register-branding.cjs`
Expected: `PASS basic write — size: NNNN`.

Then open `/tmp/test-register.xlsx` in `qlmanage -t -s 1400 -o /tmp/ /tmp/test-register.xlsx` and visually confirm the metadata block + favicon render. Discard if layout is broken.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/register-branding.cjs scripts/tests/test-register-branding.cjs
git commit -m "feat(registers): add Preqal-branded header library (BFF-style metadata block)"
```

---

### Task 2: Canonical register definitions

**Files:**
- Create: `scripts/lib/register-defs.cjs`

- [ ] **Step 1: Write the definitions module**

```javascript
'use strict';

// Single source of truth: every Preqal register, its branded metadata, the
// Supabase table it tracks (if any), and the data-column mapping (xlsx column
// header → SQL column or static derivation).
//
// `liveTable` null means the register is hand-curated (no live sync).
// `columns`   array of { header, width, source } — source is either a string
//             (column name in the Supabase row) or a function(row) => value.

module.exports = [
  {
    id: 'REG-01',
    file: 'REG-01-Document-Master-Register.xlsx',
    title: 'PREQAL DOCUMENT MASTER REGISTER',
    dcn: 'PQL-REG-01',
    scope: 'PREQAL INTEGRATED MANAGEMENT SYSTEM',
    liveTable: 'qms_documents',
    liveFilter: { client_id: null },        // Preqal's own docs only
    breakdownBy: 'doc_type',                // grouping field for breakdown panel
    columns: [
      { header:'TYPE',                width:10, source:'doc_type' },
      { header:'CONTROL NUMBER',      width:14, source:'doc_id' },
      { header:'TITLE',               width:42, source:'title' },
      { header:'VERSION',             width:10, source:'version' },
      { header:'STATUS',              width:12, source:'status' },
      { header:'OWNER',               width:24, source:'owner' },
      { header:'CREATION DATE',       width:14, source:'issue_date' },
      { header:'CURRENT REVISION DATE',width:16, source:'updated_at' },
      { header:'SCHEDULED REVISION DATE',width:18, source:'review_date' },
      { header:'DIGITAL ID',          width:38, source:'id' },
      { header:'ACCESS LINK',         width:30, source:'file_url' },
    ],
  },
  {
    id: 'REG-02',
    file: 'REG-02-Lead-Register.xlsx',
    title: 'PREQAL LEAD REGISTER',
    dcn: 'PQL-REG-02',
    scope: 'COMMERCIAL — LEAD CAPTURE TO QUALIFIED',
    liveTable: 'qualified_leads',
    breakdownBy: 'status',
    columns: [
      { header:'LEAD ID',            width:38, source:'id' },
      { header:'COMPANY',            width:28, source:'company' },
      { header:'CONTACT',            width:24, source:'name' },
      { header:'EMAIL',              width:28, source:'email' },
      { header:'PHONE',              width:18, source:(r) => `${r.dial_code||''} ${r.phone||''}`.trim() },
      { header:'COUNTRY',            width:12, source:'country_iso' },
      { header:'JOB TITLE',          width:24, source:'job_title' },
      { header:'PRESSING PROBLEM',   width:40, source:'most_pressing_quality_problem' },
      { header:'RECOMMENDED TIER',   width:14, source:'recommended_tier' },
      { header:'STATUS',             width:14, source:'status' },
      { header:'SUBMITTED',          width:18, source:'created_at' },
    ],
  },
  {
    id: 'REG-03',
    file: 'REG-03-Context-Register.xlsx',
    title: 'PREQAL CONTEXT OF THE ORGANISATION',
    dcn: 'PQL-REG-03',
    scope: 'ISO 9001:2015 §4.1 + §4.2',
    liveTable: null,
    // hand-curated — keep existing tabs
  },
  {
    id: 'REG-04',
    file: 'REG-04-Employee-Register.xlsx',
    title: 'PREQAL EMPLOYEE REGISTER',
    dcn: 'PQL-REG-04',
    scope: 'HUMAN RESOURCES',
    liveTable: null,
  },
  {
    id: 'REG-05',
    file: 'REG-05-HSE-Risk-Register.xlsx',
    title: 'PREQAL HSE RISK REGISTER',
    dcn: 'PQL-REG-05',
    scope: 'HEALTH, SAFETY & ENVIRONMENT',
    liveTable: null,
  },
  {
    id: 'REG-06',
    file: 'REG-06-Internal-Audit-Register.xlsx',
    title: 'PREQAL INTERNAL AUDIT REGISTER',
    dcn: 'PQL-REG-06',
    scope: 'ISO 9001:2015 §9.2',
    liveTable: null,
  },
  {
    id: 'REG-07',
    file: 'REG-07-NCR-CAPA-Register.xlsx',
    title: 'PREQAL NCR & CAPA REGISTER',
    dcn: 'PQL-REG-07',
    scope: 'NON-CONFORMANCE TO CORRECTIVE ACTION',
    liveTable: null,
  },
  {
    id: 'REG-08',
    file: 'REG-08-Quality-Risk-Register.xlsx',
    title: 'PREQAL QUALITY RISK REGISTER',
    dcn: 'PQL-REG-08',
    scope: 'ISO 9001:2015 §6.1',
    liveTable: null,
  },
  {
    id: 'REG-09',
    file: 'REG-09-Legal-Register.xlsx',
    title: 'PREQAL LEGAL & COMPLIANCE REGISTER',
    dcn: 'PQL-REG-09',
    scope: 'LEGAL OBLIGATIONS',
    liveTable: null,
  },
  {
    id: 'REG-10',
    file: 'REG-10-CRM-Client-Register.xlsx',
    title: 'PREQAL CRM CLIENT REGISTER',
    dcn: 'PQL-REG-10',
    scope: 'CLIENT LIFECYCLE',
    liveTable: 'crm_clients',
    breakdownBy: 'pipeline_stage',
    columns: [
      { header:'CLIENT ID',          width:38, source:'id' },
      { header:'COMPANY',            width:30, source:'company_name' },
      { header:'CONTACT',            width:24, source:'contact_name' },
      { header:'EMAIL',              width:28, source:'contact_email' },
      { header:'PIPELINE STAGE',     width:18, source:'pipeline_stage' },
      { header:'ONBOARDING STAGE',   width:18, source:'onboarding_stage' },
      { header:'TIER',               width:12, source:'tier' },
      { header:'QMS ACTIVE',         width:12, source:'qms_active' },
      { header:'CREATED',            width:18, source:'created_at' },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/register-defs.cjs
git commit -m "feat(registers): canonical register definitions with Supabase column maps"
```

---

### Task 3: Refactor `generate-excel-registers.cjs` to use the library

**Files:**
- Modify: `scripts/generate-excel-registers.cjs`

- [ ] **Step 1: Replace inline branding helpers with imports**

At the top of `scripts/generate-excel-registers.cjs`, replace the local `navyFill()`, `applyHeader()`, `applyData()`, `titleBlock()`, and palette constants with:

```javascript
const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { applyPreqalHeader, applyDataHeader, applyDataRow } = require('./lib/register-branding');
const REG_DEFS = require('./lib/register-defs');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const OUT_DIR      = '/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers';
const PUB_DIR      = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';
```

Delete every `function navyFill() …`, `function amberFill() …`, `function thinBorder() …`, `function applyHeader(…)`, `function applyData(…)`, `function titleBlock(…)` block (lines 14–74 of the current file).

- [ ] **Step 2: Write a generic live-register builder**

Add right above `generateREG01`:

```javascript
async function buildLiveRegister(sb, def) {
  const q = sb.from(def.liveTable).select('*');
  if (def.liveFilter) {
    for (const [k, v] of Object.entries(def.liveFilter)) {
      q[v === null ? 'is' : 'eq'](k, v);
    }
  }
  const { data: rows, error } = await q;
  if (error) throw new Error(`${def.id} fetch failed: ${error.message}`);

  // Group for breakdown panel
  const breakdownMap = {};
  if (def.breakdownBy) {
    rows.forEach(r => {
      const k = String(r[def.breakdownBy] ?? '—').toUpperCase();
      breakdownMap[k] = (breakdownMap[k] || 0) + 1;
    });
  }
  const breakdown = Object.entries(breakdownMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();
  const ws = wb.addWorksheet('Register');
  applyPreqalHeader(ws, {
    title: def.title,
    dcn:   def.dcn,
    scope: def.scope,
    creationDate: new Date().toISOString().slice(0,10),
    versionNumber: '1.0',
    bigNumber: rows.length,
    bigNumberLabel: 'TOTAL ROWS',
    breakdown,
    status: { created: rows.length, revised: 0, approved: 0 },
    dataColCount: def.columns.length,
  });
  applyDataHeader(ws, def.columns.map(c => c.header), def.columns.map(c => c.width));
  rows.forEach((row, i) => {
    const values = def.columns.map(c =>
      typeof c.source === 'function' ? c.source(row) : (row[c.source] ?? '')
    );
    applyDataRow(ws, values, i % 2 === 1);
  });

  return wb;
}

async function saveWorkbook(wb, filename) {
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  fs.copyFileSync(outPath, pubPath);
  console.log(`✓ ${filename}`);
}
```

- [ ] **Step 3: Replace `generateREG01`, `generateREG02`, `generateREG10` with live-register driver calls**

```javascript
async function generateLive(sb, regId) {
  const def = REG_DEFS.find(d => d.id === regId);
  if (!def || !def.liveTable) throw new Error(`${regId} is not a live register`);
  const wb = await buildLiveRegister(sb, def);
  await saveWorkbook(wb, def.file);
}
```

Leave `generateREG03/04/05/06/07` (hand-curated) as-is — but rewrite each one's call site from the old `titleBlock()` to `applyPreqalHeader()` with hand-supplied counts.

- [ ] **Step 4: Update `main()` to take CLI arg and to authenticate**

```javascript
async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.error('SUPABASE_SERVICE_KEY required'); process.exit(1); }
  const sb = createClient(SUPABASE_URL, key);

  const only = process.argv[2];  // e.g. "REG-02" or empty for all
  const live  = ['REG-01','REG-02','REG-10'];
  const hand  = ['REG-03','REG-04','REG-05','REG-06','REG-07','REG-08','REG-09'];

  for (const id of live)  if (!only || only === id) await generateLive(sb, id);
  for (const id of hand)  if (!only || only === id) await generateHand(id);
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 5: Verify locally**

```bash
source .env.secrets
node scripts/generate-excel-registers.cjs REG-01
qlmanage -t -s 1400 -o /tmp/ public/ims/REG-01-Document-Master-Register.xlsx
open /tmp/REG-01-Document-Master-Register.xlsx.png
```

Expected: branded header with favicon top-left, metadata fields, big row count, breakdown by SOP/POL/PRO/FOR, navy data header below.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-excel-registers.cjs
git commit -m "refactor(registers): use shared branding lib + live Supabase data"
```

---

### Task 4: One-shot regenerator script

**Files:**
- Create: `scripts/regenerate-register.cjs`

- [ ] **Step 1: Implement the wrapper**

```javascript
#!/usr/bin/env node
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const REG_DEFS = require('./lib/register-defs');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const SUPABASE_BUCKET = 'registers';

async function main() {
  const regId = process.argv[2];
  if (!regId) { console.error('Usage: regenerate-register.cjs REG-XX'); process.exit(1); }
  const def = REG_DEFS.find(d => d.id === regId);
  if (!def) { console.error(`Unknown register: ${regId}`); process.exit(1); }

  // Delegate to generate-excel-registers.cjs for the actual build
  execSync(`node ${path.join(__dirname, 'generate-excel-registers.cjs')} ${regId}`, { stdio:'inherit' });

  // Upload the produced file to Supabase Storage
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) { console.error('SUPABASE_SERVICE_KEY required'); process.exit(1); }
  const sb = createClient(SUPABASE_URL, key);

  const pubPath = path.join(__dirname, '../public/ims', def.file);
  const buf = fs.readFileSync(pubPath);
  const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(
    `preqal/${def.file}`, buf,
    { upsert:true, contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
  if (error) throw error;
  console.log(`✓ uploaded ${def.file} to storage://${SUPABASE_BUCKET}/preqal/${def.file}`);
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Verify**

```bash
source .env.secrets
node scripts/regenerate-register.cjs REG-02
```

Expected output: `✓ REG-02-Lead-Register.xlsx` then `✓ uploaded ...`. Confirm the file appears in Supabase Storage → `registers/preqal/` bucket.

- [ ] **Step 3: Commit**

```bash
git add scripts/regenerate-register.cjs
git commit -m "feat(registers): one-shot regenerator with Supabase Storage upload"
```

---

### Task 5: Database triggers for live-sync

**Files:**
- Create: `supabase/migrations/20260514_register_triggers.sql`
- Create: `supabase/functions/regen-register/index.ts`

- [ ] **Step 1: Edge Function — fetch + rebuild**

```typescript
// supabase/functions/regen-register/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'https://esm.sh/xlsx-js-style@1.2.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Minimal port of the Node branding library — re-use the same palette / layout.
// (see scripts/lib/register-branding.cjs for the canonical version)
function build(def: any, rows: any[]) { /* equivalent of buildLiveRegister */ }

serve(async (req) => {
  const { reg_id } = await req.json();
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  // Look up the def (hard-coded here mirroring scripts/lib/register-defs.cjs)
  const def = REG_DEFS_LITE[reg_id];
  if (!def) return new Response(`Unknown ${reg_id}`, { status: 400 });

  let query = sb.from(def.table).select('*');
  if (def.filter) {
    for (const [k, v] of Object.entries(def.filter)) {
      query = v === null ? query.is(k, v as null) : query.eq(k, v);
    }
  }
  const { data: rows, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const buf = build(def, rows || []);
  const { error: upErr } = await sb.storage.from('registers').upload(
    `preqal/${def.file}`, buf,
    { upsert:true, contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
  if (upErr) return new Response(upErr.message, { status: 500 });
  return new Response(JSON.stringify({ ok:true, rows: rows.length }), {
    headers: { 'Content-Type':'application/json' },
  });
});
```

- [ ] **Step 2: Migration with triggers**

```sql
-- supabase/migrations/20260514_register_triggers.sql

-- Enable pg_net so triggers can call the Edge Function (no-op if already on)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Helper: fire-and-forget POST to the regen function
CREATE OR REPLACE FUNCTION regen_register_async(p_reg_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  url text := current_setting('app.regen_url', true);  -- set per environment
BEGIN
  IF url IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url     := url,
    headers := jsonb_build_object('Content-Type','application/json'),
    body    := jsonb_build_object('reg_id', p_reg_id)
  );
END;
$$;

-- qms_documents → REG-01
CREATE OR REPLACE FUNCTION on_qms_documents_change() RETURNS trigger AS $$
BEGIN
  PERFORM regen_register_async('REG-01');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_qms_documents_regen ON qms_documents;
CREATE TRIGGER tr_qms_documents_regen
AFTER INSERT OR UPDATE OR DELETE ON qms_documents
FOR EACH STATEMENT EXECUTE FUNCTION on_qms_documents_change();

-- qualified_leads → REG-02
CREATE OR REPLACE FUNCTION on_qualified_leads_change() RETURNS trigger AS $$
BEGIN PERFORM regen_register_async('REG-02'); RETURN NULL; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_qualified_leads_regen ON qualified_leads;
CREATE TRIGGER tr_qualified_leads_regen
AFTER INSERT OR UPDATE OR DELETE ON qualified_leads
FOR EACH STATEMENT EXECUTE FUNCTION on_qualified_leads_change();

-- crm_clients → REG-10
CREATE OR REPLACE FUNCTION on_crm_clients_change() RETURNS trigger AS $$
BEGIN PERFORM regen_register_async('REG-10'); RETURN NULL; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_crm_clients_regen ON crm_clients;
CREATE TRIGGER tr_crm_clients_regen
AFTER INSERT OR UPDATE OR DELETE ON crm_clients
FOR EACH STATEMENT EXECUTE FUNCTION on_crm_clients_change();
```

- [ ] **Step 3: Deploy and configure**

```bash
# 1. Push the migration
SUPABASE_ACCESS_TOKEN=… supabase db push

# 2. Deploy the edge function
supabase functions deploy regen-register --no-verify-jwt

# 3. Set the URL setting so triggers know where to POST
psql "$DATABASE_URL" -c "ALTER DATABASE postgres SET app.regen_url = 'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/regen-register';"
```

- [ ] **Step 4: Test end-to-end**

```bash
# Make any qualified_leads insert, then 10s later check storage
psql "$DATABASE_URL" -c "INSERT INTO qualified_leads (name,email,company) VALUES ('Test','test@example.com','Test Co');"
sleep 12
curl -fsSL "https://gndcjmxxgtnoidxgcdnx.supabase.co/storage/v1/object/public/registers/preqal/REG-02-Lead-Register.xlsx" -o /tmp/reg02.xlsx
qlmanage -t -s 1400 -o /tmp/ /tmp/reg02.xlsx
```

Expected: thumbnail shows the new row included and `bigNumber` increased by 1.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260514_register_triggers.sql supabase/functions/regen-register
git commit -m "feat(registers): Supabase triggers + Edge Function for live regen on row change"
```

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append a new "Preqal Register Branding" subsection just after "IMS Document Branding"**

Insert verbatim:

```markdown
## Preqal Register Branding (REG-XX Excel files)

Every Excel register published to `public/ims/REG-*.xlsx` (and to Supabase `storage://registers/preqal/`) follows the same branded metadata header. Generators must call `scripts/lib/register-branding.cjs` — never write inline styling.

### Layout
| Region | Cells | Style |
|---|---|---|
| Favicon | A2:B10 (merged) | `public/favicon.png` inset, white fill |
| Field labels (TITLE / DCN / SCOPE / DATES / VERSION) | C2:C9 | `#FEF3C7` fill, Arial 10pt |
| Field values | D2:D9 | `#FFFBEB` fill, Arial 10pt |
| Big row count | E2:E9 (merged) | `#FEF3C7` fill, Arial 36pt bold navy |
| Breakdown labels / counts | F2:G5 | `#FEF3C7` fill, Arial 10pt |
| Status labels (CREATED / REVISED / APPROVED) | H2:J2 | navy fill, white Arial 9pt bold |
| Status counts | H3:J5 (merged per col) | `#FEF3C7`, Arial 18pt bold |
| Status percentages | H6:J9 (merged per col) | `#FEF3C7`, Arial 10pt bold, format `0.0%` |
| Navy divider | row 10 | `#0F172A`, height 6pt |
| Spacer | row 11 | white, height 6pt |
| Data header | row 12 | navy fill, white Arial 11pt bold, wrap |
| Data rows | row 13+ | alternate white / `#F8FAFC`, Arial 10pt |

Freeze panes: `B13` (metadata block + data header always visible).

### Live registers vs hand-curated
- **Live** (auto-regenerated on every row change via Supabase triggers): REG-01 (qms_documents), REG-02 (qualified_leads), REG-10 (crm_clients)
- **Hand-curated** (regenerated only via `node scripts/generate-excel-registers.cjs REG-XX`): REG-03, 04, 05, 06, 07, 08, 09

The single source of truth for "which register tracks which table" is `scripts/lib/register-defs.cjs`. Adding a new register = one entry there + (if live) a trigger in `supabase/migrations/`.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: register branding spec + live-sync overview"
```

---

### Task 7: Create the `preqal-register-creator` skill

**Files:**
- Create: `~/.claude/skills/preqal-register-creator/SKILL.md`

- [ ] **Step 1: Write the skill manifest**

The skill should:
- Announce its use at start
- Document the branding rules (link to CLAUDE.md and `scripts/lib/register-branding.cjs`)
- Provide a step-by-step process for adding a NEW register:
  1. Add an entry to `scripts/lib/register-defs.cjs`
  2. If live → add a trigger in a new migration + extend the Edge Function's `REG_DEFS_LITE` map
  3. Run `node scripts/regenerate-register.cjs REG-XX` to produce the first XLSX
  4. Verify with `qlmanage -t -s 1400 -o /tmp/ public/ims/REG-XX-*.xlsx`
  5. Commit
- Provide a process for editing branding on ALL registers:
  1. Modify `scripts/lib/register-branding.cjs`
  2. Run `node scripts/generate-excel-registers.cjs` (no arg = all)
  3. Diff a representative file (REG-01) visually
  4. Commit
- Provide a process for switching a hand-curated register to live:
  1. Add `liveTable`/`columns` to the def
  2. Add the trigger
  3. Delete the hand-curated `generateREGxx` function
- List the input fields the skill collects when a user asks for a new register: id, file name, title, dcn, scope, optional `liveTable` + filter + breakdown field + columns array.

Content body (~250 lines) should mirror the structure used by `preqal-sop-creator` and `preqal-policy-creator`.

- [ ] **Step 2: Verify the skill loads**

In a fresh Claude Code session, type `/preqal-register-creator` and confirm it activates. If it doesn't appear, check that the manifest's frontmatter has a `name:` field matching the directory name.

- [ ] **Step 3: Commit** (skill lives in `~/.claude/`, not the repo — note its path in the project commit as a sibling reference)

```bash
echo "Skill created at ~/.claude/skills/preqal-register-creator/SKILL.md" >> docs/skills.md
git add docs/skills.md
git commit -m "docs: reference the preqal-register-creator skill"
```

---

### Task 8: Regenerate all registers and ship

- [ ] **Step 1: Full regenerate**

```bash
source .env.secrets
node scripts/generate-excel-registers.cjs
```

Expected: every REG-XX appears in `public/ims/` and `Preqal QMS/06 - Registers/`.

- [ ] **Step 2: Spot-check thumbnails**

```bash
for f in public/ims/REG-*.xlsx; do
  qlmanage -t -s 1200 -o /tmp/ "$f" >/dev/null 2>&1
done
open /tmp/REG-01-*.png /tmp/REG-02-*.png /tmp/REG-10-*.png
```

Verify each shows: favicon top-left, populated metadata block, populated big number, navy data header, alternating rows.

- [ ] **Step 3: Commit + push**

```bash
git add public/ims/REG-*.xlsx
git commit -m "chore(registers): regenerate all REG-XX with branded header"
```

Push via osascript as usual (per CLAUDE.md, the sandbox shell can't authenticate with GitHub):

```bash
osascript -e 'do shell script "cd \"…/preqal.org\" && git push origin master --no-verify"'
```

---

## Self-Review Checklist (run before handing off)

1. **Spec coverage:** Every register the user pointed at (qms_documents, qualified_leads, crm_clients, plus the hand-curated 7) has either a live driver or a hand generator. ✓ verify by reading `register-defs.cjs`.
2. **Placeholders:** Search the plan for "TBD"/"TODO" — none allowed.
3. **Type consistency:** Field names in `register-defs.cjs` (`liveTable`, `liveFilter`, `breakdownBy`, `columns`, `source`) must match exactly in the generator and Edge Function.
4. **Branding consistency:** The Edge Function build code MUST produce the same XLSX as the Node generator. The cheapest enforcement: render the same REG-XX from both paths and `cmp -l` the bytes.
5. **Migration safety:** Triggers fire on every row change — the Edge Function must be idempotent and return fast (under 30s) to avoid backing up `pg_net`.
6. **Path safety:** The OUT_DIR and PUB_DIR constants are absolute. Anyone running this on a different machine must override via env or the script will fail loudly (not silently write to `~`).
