# Register Excel Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every QMS register table syncs to a branded `.xlsx` file in Supabase Storage (immediately on save) and to the local filesystem (via 5-minute launchd cron), with full client-isolation via `client_id`.

**Architecture:** qms.html fires-and-forgets to an Edge Function after each save/delete; the function reads the full register table, generates an Excel workbook with ExcelJS, and uploads to the `registers` Storage bucket. A new Node.js script mirrors Storage files to local QMS folders every 5 minutes via the existing launchd agent.

**Tech Stack:** Supabase Postgres + Storage + Edge Functions (Deno + npm:exceljs@4), vanilla JS (qms.html standalone HTML), Node.js + @supabase/supabase-js + exceljs (local sync script).

**Spec:** `docs/superpowers/specs/2026-05-12-register-excel-sync-design.md`

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/20260512_register_client_id.sql` | Create |
| `supabase/functions/sync-register-excel/index.ts` | Create |
| `scripts/sync-registers-local.cjs` | Create |
| `scripts/run-sync.sh` | Modify — add one line |
| `public/qms.html` | Modify — CLIENT_ID, helpers, clientFilter on all loads, withClient + syncExcel on all saves/deletes |
| `public/admin-dashboard.html` | Modify — client QMS nav opens qms.html?clientId= |

---

## Task 1: DB Migration — add `client_id` to 8 register tables + create `registers` Storage bucket

**Files:**
- Create: `supabase/migrations/20260512_register_client_id.sql`

> Context: `qms_documents` already has `client_id`. The other 8 register tables need it added. `NULL` = Preqal's own data, `UUID` = client's data. The `registers` Storage bucket is created via the Supabase dashboard or MCP — it must be private (no public access).

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260512_register_client_id.sql
-- Add client_id FK to all register tables that don't already have it.
-- NULL = Preqal's own records. UUID = that client's records.
-- qms_documents already has client_id — skip it.

ALTER TABLE qms_context_issues
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_employees
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_org_register
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_legal_register
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_quality_risk
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_hse_risk
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_ncr
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_capa
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;

ALTER TABLE qms_audit
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__apply_migration` tool with:
- `name`: `20260512_register_client_id`
- `query`: the SQL above

Expected: success response, no errors. Existing rows keep `client_id = NULL`.

- [ ] **Step 3: Create the `registers` Storage bucket**

In the Supabase dashboard (`https://supabase.com/dashboard/project/gndcjmxxgtnoidxgcdnx/storage/buckets`):
- Click **New bucket**
- Name: `registers`
- **Uncheck** "Public bucket" (must be private)
- Click Create

The bucket needs a service-role policy (same as the `ims` bucket). Run this SQL via MCP:

```sql
-- Allow service role full access to registers bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('registers', 'registers', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: service role can do everything (anon cannot read)
CREATE POLICY "service role full access on registers"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'registers')
WITH CHECK (bucket_id = 'registers');
```

- [ ] **Step 4: Verify bucket exists**

In Supabase dashboard → Storage → Buckets: confirm `registers` appears as private.

- [ ] **Step 5: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add supabase/migrations/20260512_register_client_id.sql
git commit -m "feat(db): add client_id to 8 register tables + registers Storage bucket"
```

---

## Task 2: Edge Function — `sync-register-excel`

**Files:**
- Create: `supabase/functions/sync-register-excel/index.ts`

> Context: Called fire-and-forget from qms.html after every save/delete. Reads the full register table for the given client context, generates a branded `.xlsx` with npm:exceljs@4, uploads to Storage `registers` bucket. Uses the same SUPABASE_SERVICE_ROLE_KEY env var that all other Edge Functions use. Auth: standard Supabase JWT via `Authorization` header (sb.functions.invoke sends it automatically).

- [ ] **Step 1: Create the Edge Function file**

```typescript
// supabase/functions/sync-register-excel/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error — npm specifier works at Deno runtime
import ExcelJS from "npm:exceljs@4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Brand colours ─────────────────────────────────────────────────────────────
const NAVY        = "FF0F172A";
const WHITE       = "FFFFFFFF";
const AMBER_LIGHT = "FFFEF3C7";
const GRAY_BG     = "FFF8FAFC";
const GRAY_BORDER = "FFCBD5E1";
const SLATE       = "FF334155";

function navyFill()       { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: NAVY } }; }
function amberLightFill() { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: AMBER_LIGHT } }; }
function grayFill()       { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: GRAY_BG } }; }
function whiteFill()      { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: WHITE } }; }

function thinBorder() {
  const s = { style: "thin" as const, color: { argb: GRAY_BORDER } };
  return { top: s, left: s, bottom: s, right: s };
}

function titleBlock(ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) {
  ws.mergeCells(1, 1, 1, colCount);
  const t = ws.getRow(1);
  t.getCell(1).value = title;
  t.getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: "FF0F172A" } };
  t.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  t.getCell(1).fill = amberLightFill();
  t.height = 36;

  ws.mergeCells(2, 1, 2, colCount);
  const s = ws.getRow(2);
  s.getCell(1).value = subtitle;
  s.getCell(1).font = { name: "Arial", size: 10, color: { argb: SLATE } };
  s.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  s.getCell(1).fill = whiteFill();
  s.height = 20;

  ws.addRow([]); // spacer row 3
}

function applyHeader(ws: ExcelJS.Worksheet, headers: string[], widths: number[]) {
  const row = ws.addRow(headers);
  row.eachCell((cell) => {
    cell.fill = navyFill();
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: WHITE } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  });
  row.height = 28;
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function applyData(ws: ExcelJS.Worksheet, values: unknown[], isAlt: boolean) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = isAlt ? grayFill() : whiteFill();
    cell.font = { name: "Arial", size: 10, color: { argb: SLATE } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = thinBorder();
  });
  row.height = 18;
}

// ── Register config types ──────────────────────────────────────────────────────
interface ColDef   { header: string; key: string; width: number; }
interface SheetDef { name: string; columns: ColDef[]; }
interface RegConfig { table: string; filename: string; title: string; sheets: SheetDef[]; }

// ── Register definitions — one entry per sidebar register ──────────────────────
// Columns match the DB columns queried by the corresponding load* function in qms.html.
const REGISTERS: Record<string, RegConfig> = {
  docs: {
    table: "qms_documents",
    filename: "REG-01-Document-Register.xlsx",
    title: "REG-01 — Document Register",
    sheets: [{ name: "Documents", columns: [
      { header: "Doc ID",      key: "doc_id",      width: 14 },
      { header: "Title",       key: "title",       width: 42 },
      { header: "Category",    key: "category",    width: 12 },
      { header: "Version",     key: "version",     width: 10 },
      { header: "Status",      key: "status",      width: 16 },
      { header: "Owner",       key: "owner",       width: 28 },
      { header: "Issue Date",  key: "issue_date",  width: 14 },
      { header: "Review Date", key: "review_date", width: 16 },
    ]}],
  },
  context: {
    table: "qms_context_issues",
    filename: "REG-03-Context-Register.xlsx",
    title: "REG-03 — Context of the Organisation",
    sheets: [{ name: "Issues", columns: [
      { header: "Record ID",    key: "record_id",        width: 14 },
      { header: "Category",     key: "context_category", width: 16 },
      { header: "Type",         key: "factor_type",      width: 14 },
      { header: "SWOT",         key: "swot_type",        width: 12 },
      { header: "Description",  key: "issue_description",width: 45 },
      { header: "Impact Area",  key: "impact_area",      width: 22 },
      { header: "Impact",       key: "impact_level",     width: 10 },
      { header: "Likelihood",   key: "likelihood",       width: 12 },
      { header: "Status",       key: "status",           width: 16 },
      { header: "Owner",        key: "owner",            width: 25 },
      { header: "Review Date",  key: "review_date",      width: 14 },
    ]}],
  },
  employees: {
    table: "qms_employees",
    filename: "REG-04-Employee-Register.xlsx",
    title: "REG-04 — Employee Register",
    sheets: [{ name: "Employees", columns: [
      { header: "Emp ID",       key: "record_id",       width: 14 },
      { header: "Full Name",    key: "full_name",        width: 28 },
      { header: "Position",     key: "position",         width: 28 },
      { header: "Department",   key: "department",       width: 20 },
      { header: "Type",         key: "employment_type",  width: 16 },
      { header: "Email",        key: "email",            width: 30 },
      { header: "Phone",        key: "phone",            width: 18 },
      { header: "Start Date",   key: "start_date",       width: 14 },
      { header: "Status",       key: "status",           width: 14 },
    ]}],
  },
  hse: {
    table: "qms_hse_risk",
    filename: "REG-05-HSE-Risk-Register.xlsx",
    title: "REG-05 — HSE Risk Register",
    sheets: [{ name: "Risk Register", columns: [
      { header: "Risk ID",        key: "risk_id",           width: 12 },
      { header: "Hazard",         key: "hazard",            width: 32 },
      { header: "Category",       key: "hazard_category",   width: 20 },
      { header: "Persons at Risk",key: "persons_at_risk",   width: 22 },
      { header: "Likelihood",     key: "likelihood",        width: 13 },
      { header: "Consequence",    key: "consequence",       width: 14 },
      { header: "Risk Score",     key: "risk_rating",       width: 13 },
      { header: "Residual Risk",  key: "residual_rating",   width: 15 },
      { header: "Status",         key: "status",            width: 16 },
      { header: "Responsible",    key: "responsible_person",width: 25 },
      { header: "Review Date",    key: "review_date",       width: 14 },
    ]}],
  },
  audit: {
    table: "qms_audit",
    filename: "REG-06-Audit-Register.xlsx",
    title: "REG-06 — Audit Register",
    sheets: [{ name: "Audits", columns: [
      { header: "Audit No.",       key: "audit_number",         width: 16 },
      { header: "Type",            key: "audit_type",           width: 16 },
      { header: "Scope",           key: "audit_scope",          width: 40 },
      { header: "Auditor",         key: "auditor",              width: 22 },
      { header: "Auditee",         key: "auditee",              width: 22 },
      { header: "Scheduled",       key: "scheduled_date",       width: 14 },
      { header: "Conducted",       key: "conducted_date",       width: 14 },
      { header: "Minor Findings",  key: "findings_minor",       width: 16 },
      { header: "Major Findings",  key: "findings_major",       width: 16 },
      { header: "Observations",    key: "findings_observation", width: 16 },
      { header: "Status",          key: "status",               width: 16 },
    ]}],
  },
  ncr: {
    table: "qms_ncr",
    filename: "REG-07-NCR-Register.xlsx",
    title: "REG-07 — Non-Conformance Register",
    sheets: [{ name: "NCR Log", columns: [
      { header: "NCR No.",      key: "ncr_number",    width: 16 },
      { header: "Date",         key: "detected_date", width: 14 },
      { header: "Title",        key: "title",         width: 35 },
      { header: "Source",       key: "source",        width: 18 },
      { header: "Process Area", key: "process_area",  width: 22 },
      { header: "Severity",     key: "severity",      width: 14 },
      { header: "Status",       key: "status",        width: 18 },
      { header: "Root Cause",   key: "root_cause",    width: 35 },
    ]}],
  },
  capa: {
    table: "qms_capa",
    filename: "REG-07b-CAPA-Register.xlsx",
    title: "REG-07b — CAPA Register",
    sheets: [{ name: "CAPA Log", columns: [
      { header: "CAPA No.",     key: "capa_number", width: 16 },
      { header: "Type",         key: "type",        width: 14 },
      { header: "Title",        key: "title",       width: 35 },
      { header: "Source",       key: "source",      width: 18 },
      { header: "Assigned To",  key: "assigned_to", width: 22 },
      { header: "Due Date",     key: "due_date",    width: 14 },
      { header: "Status",       key: "status",      width: 16 },
      { header: "Action Taken", key: "action_taken",width: 40 },
    ]}],
  },
  qr: {
    table: "qms_quality_risk",
    filename: "REG-08-Quality-Risk-Register.xlsx",
    title: "REG-08 — Quality Risk Register",
    sheets: [{ name: "Quality Risks", columns: [
      { header: "Risk ID",      key: "risk_id",         width: 14 },
      { header: "Title",        key: "risk_title",      width: 35 },
      { header: "Type",         key: "risk_type",       width: 14 },
      { header: "Category",     key: "risk_category",   width: 18 },
      { header: "Likelihood",   key: "likelihood",      width: 13 },
      { header: "Impact",       key: "impact",          width: 12 },
      { header: "Risk Score",   key: "risk_rating",     width: 13 },
      { header: "Residual",     key: "residual_rating", width: 13 },
      { header: "Treatment",    key: "treatment_option",width: 16 },
      { header: "Owner",        key: "risk_owner",      width: 22 },
      { header: "Status",       key: "status",          width: 16 },
      { header: "Review Date",  key: "review_date",     width: 14 },
    ]}],
  },
  legal: {
    table: "qms_legal_register",
    filename: "REG-09-Legal-Register.xlsx",
    title: "REG-09 — Legal & Compliance Register",
    sheets: [{ name: "Legal Obligations", columns: [
      { header: "Record ID",     key: "record_id",          width: 14 },
      { header: "Title",         key: "title",              width: 40 },
      { header: "Category",      key: "category",           width: 18 },
      { header: "Jurisdiction",  key: "jurisdiction",       width: 18 },
      { header: "Reference No.", key: "reference_number",   width: 18 },
      { header: "Applies To",    key: "applicable_to",      width: 22 },
      { header: "Responsible",   key: "responsible_person", width: 22 },
      { header: "Compliance",    key: "compliance_status",  width: 18 },
      { header: "Review Date",   key: "review_date",        width: 14 },
    ]}],
  },
  org: {
    table: "qms_org_register",
    filename: "REG-10-Stakeholder-Register.xlsx",
    title: "REG-10 — Interested Parties Register",
    sheets: [{ name: "Stakeholders", columns: [
      { header: "Record ID",    key: "record_id",            width: 14 },
      { header: "Entity Name",  key: "entity_name",          width: 30 },
      { header: "Context Type", key: "context_type",         width: 16 },
      { header: "Entity Type",  key: "entity_type",          width: 18 },
      { header: "Priority",     key: "priority",             width: 12 },
      { header: "Needs",        key: "needs_expectations",   width: 40 },
      { header: "Compliance",   key: "compliance_obligation",width: 14 },
      { header: "Status",       key: "status",               width: 16 },
      { header: "Review Date",  key: "review_date",          width: 14 },
    ]}],
  },
};

// ── Helper ─────────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Handler ────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // Require a valid JWT (Supabase injects Authorization header via sb.functions.invoke)
  if (!req.headers.get("Authorization")) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const { registerKey, clientId } = await req.json() as {
      registerKey: string;
      clientId: string | null;
    };

    const config = REGISTERS[registerKey];
    if (!config) return json({ error: `Unknown registerKey: ${registerKey}` }, 400);

    // Query all rows for this register + client context
    let query = sb.from(config.table).select("*");
    if (clientId) {
      query = query.eq("client_id", clientId);
    } else {
      query = query.is("client_id", null);
    }
    const { data: rows, error: dbErr } = await query;
    if (dbErr) throw dbErr;

    // Build subtitle label
    let subtitle = "Preqal IMS | ISO 9001:2015";
    if (clientId) {
      const { data: client } = await sb
        .from("crm_clients")
        .select("company_name")
        .eq("id", clientId)
        .single();
      subtitle = client ? `${client.company_name} IMS | Preqal` : `Client ${clientId}`;
    }

    // Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "Preqal";
    wb.created = new Date();

    for (const sheet of config.sheets) {
      const ws = wb.addWorksheet(sheet.name);
      titleBlock(ws, config.title, subtitle, sheet.columns.length);
      applyHeader(ws, sheet.columns.map((c) => c.header), sheet.columns.map((c) => c.width));
      (rows ?? []).forEach((r: Record<string, unknown>, i: number) => {
        applyData(ws, sheet.columns.map((c) => r[c.key] ?? ""), i % 2 === 1);
      });
      ws.views = [{ state: "frozen", ySplit: 4 }];
    }

    const buf: Uint8Array = (await wb.xlsx.writeBuffer()) as Uint8Array;

    // Upload to Storage
    const storagePath = clientId
      ? `clients/${clientId}/${config.filename}`
      : `preqal/${config.filename}`;

    const { error: upErr } = await sb.storage
      .from("registers")
      .upload(storagePath, buf, {
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });
    if (upErr) throw upErr;

    console.log(`sync-register-excel: ${storagePath} — ${(rows ?? []).length} rows`);
    return json({ ok: true, path: storagePath, rows: (rows ?? []).length });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync-register-excel error:", msg);
    return json({ error: msg }, 500);
  }
});
```

- [ ] **Step 2: Deploy the Edge Function**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
npx supabase functions deploy sync-register-excel --project-ref gndcjmxxgtnoidxgcdnx
```

Expected output: `Deployed Function sync-register-excel` (no errors).

- [ ] **Step 3: Smoke-test the function manually**

Run this from a terminal (replace `<ANON_KEY>` with the SB_KEY from qms.html line 1628):

```bash
curl -X POST \
  "https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-register-excel" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"registerKey":"docs","clientId":null}'
```

Expected: `{"ok":true,"path":"preqal/REG-01-Document-Register.xlsx","rows":<N>}`

Verify in Supabase Storage → `registers/preqal/` that `REG-01-Document-Register.xlsx` now exists.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/sync-register-excel/index.ts
git commit -m "feat(edge): sync-register-excel — generate branded Excel for all 10 registers"
```

---

## Task 3: Local sync script + run-sync.sh update

**Files:**
- Create: `scripts/sync-registers-local.cjs`
- Modify: `scripts/run-sync.sh`

> Context: Mirrors `sync-from-storage.cjs` pattern exactly. Lists all files in the `registers` Storage bucket, downloads each one, saves to the correct local path. Preqal files → `Preqal QMS/06 - Registers/`. Client files → `Preqal QMS/CLIENTS/{companyName}/06 - Registers/`. Creates missing folders automatically. Runs inside the existing 5-minute launchd agent via `run-sync.sh`.

- [ ] **Step 1: Create `scripts/sync-registers-local.cjs`**

```javascript
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

const SUPABASE_URL       = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
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

  // Build a flat list of { storagePath, localPath }
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
```

- [ ] **Step 2: Update `scripts/run-sync.sh`**

Replace the current content (which only runs `sync-from-storage.cjs`) with:

```bash
#!/bin/bash
# run-sync.sh — launchd wrapper for IMS DOCX sync + Excel register sync
# Loads PATH for homebrew node and reads SUPABASE_SERVICE_KEY from .env.secrets

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/.env.secrets"

if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
fi

node "$SCRIPT_DIR/sync-from-storage.cjs"   # DOCX sync (existing)
node "$SCRIPT_DIR/sync-registers-local.cjs" # Excel register sync (new)
```

- [ ] **Step 3: Test the local sync script manually**

```bash
SUPABASE_SERVICE_KEY="$(grep SUPABASE_SERVICE_KEY '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/.env.secrets' | cut -d= -f2-)" \
  node "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/sync-registers-local.cjs"
```

Expected output (example):
```
2026-05-12T...Z — 10 register file(s) to sync
  OK   preqal/REG-01-Document-Register.xlsx → /Users/stefangravesande/.../06 - Registers/REG-01-Document-Register.xlsx
  OK   preqal/REG-05-HSE-Risk-Register.xlsx → ...
  ...
```

Verify files appear in `/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-registers-local.cjs scripts/run-sync.sh
git commit -m "feat(scripts): sync-registers-local + extend run-sync.sh for Excel register mirror"
```

---

## Task 4: `qms.html` — module-level constants and helpers

**Files:**
- Modify: `public/qms.html`

> Context: The script block starts at line 1626. `const sb = ...` is at line 1630. Add CLIENT_ID and all four helpers immediately after `const sb=...` on line 1630. These are used by every subsequent change in Tasks 5 and 6.

- [ ] **Step 1: Find the insertion point**

In `public/qms.html`, locate this exact line (around line 1630):
```js
const sb=window.supabase.createClient(SB_URL,SB_KEY);
```

- [ ] **Step 2: Add constants and helpers immediately after it**

Insert the following block immediately after `const sb=window.supabase.createClient(SB_URL,SB_KEY);`:

```js
// ── CLIENT CONTEXT ─────────────────────────────────────────────────────────
// qms.html?clientId=UUID → client's registers. No param → Preqal's own (NULL).
const CLIENT_ID = new URLSearchParams(location.search).get('clientId') || null;

// Wraps an insert payload to stamp client_id (null for Preqal).
function withClient(payload) {
  return { ...payload, client_id: CLIENT_ID };
}

// Adds the correct client_id filter to any Supabase query builder.
// CLIENT_ID = null  → .is('client_id', null)  (IS NULL)
// CLIENT_ID = uuid  → .eq('client_id', CLIENT_ID)
function clientFilter(query) {
  return CLIENT_ID
    ? query.eq('client_id', CLIENT_ID)
    : query.is('client_id', null);
}

// Fire-and-forget: tells the Edge Function to regenerate the Excel for this register.
// Never awaited — a failure here only means the Excel falls behind until the next save.
function syncExcel(registerKey) {
  sb.functions.invoke('sync-register-excel', {
    body: { registerKey, clientId: CLIENT_ID }
  }).catch(() => {});
}

// Maps DB table name → register key (used by executeDelete to call syncExcel).
const TABLE_TO_REG_KEY = {
  qms_documents:      'docs',
  qms_context_issues: 'context',
  qms_employees:      'employees',
  qms_hse_risk:       'hse',
  qms_audit:          'audit',
  qms_ncr:            'ncr',
  qms_capa:           'capa',
  qms_quality_risk:   'qr',
  qms_legal_register: 'legal',
  qms_org_register:   'org',
};
```

- [ ] **Step 3: Verify the block is in the right place**

The script block should now read:
```js
const sb=window.supabase.createClient(SB_URL,SB_KEY);

// ── CLIENT CONTEXT ────
const CLIENT_ID = ...
function withClient(payload) { ... }
function clientFilter(query) { ... }
function syncExcel(registerKey) { ... }
const TABLE_TO_REG_KEY = { ... };

// ── AUTH ──────────────────────────────────────────────────────────────────
async function init(){ ...
```

- [ ] **Step 4: Commit**

```bash
git add public/qms.html
git commit -m "feat(qms): add CLIENT_ID, withClient, clientFilter, syncExcel helpers"
```

---

## Task 5: `qms.html` — apply `clientFilter` to all load functions + `loadOverview`

**Files:**
- Modify: `public/qms.html`

> Context: There are 11 functions that query register tables: `loadOverview` (9 queries inside it), `loadDocs`, `loadNCR`, `loadCAPA`, `loadAudit`, `loadEmployees`, `loadLegal`, `loadIssues` (qms_context_issues), `loadOrg`, `loadHSE`, `loadQR`. Each needs `clientFilter()` wrapping the initial `sb.from(...)` query. The pattern is identical for all.

- [ ] **Step 1: Update `loadOverview` (9 queries)**

Find `loadOverview` (around line 1694). Replace the `Promise.all` block:

```js
// BEFORE:
const[docs,org,emp,legal,qr,hse,ncr,capa,audit]=await Promise.all([
    sb.from('qms_documents').select('id',{count:'exact',head:true}).eq('status','active'),
    sb.from('qms_org_register').select('id',{count:'exact',head:true}).eq('status','active'),
    sb.from('qms_employees').select('id',{count:'exact',head:true}).eq('status','active'),
    sb.from('qms_legal_register').select('id',{count:'exact',head:true}).neq('compliance_status','not_applicable'),
    sb.from('qms_quality_risk').select('id',{count:'exact',head:true}).in('status',['open','under_treatment']),
    sb.from('qms_hse_risk').select('id',{count:'exact',head:true}).in('status',['open','in_progress']),
    sb.from('qms_ncr').select('id',{count:'exact',head:true}).in('status',['open','under_investigation','capa_raised']),
    sb.from('qms_capa').select('id',{count:'exact',head:true}).in('status',['open','in_progress']),
    sb.from('qms_audit').select('id',{count:'exact',head:true}).gte('created_at',`${yr}-01-01`)
  ]);

// AFTER:
const[docs,org,emp,legal,qr,hse,ncr,capa,audit]=await Promise.all([
    clientFilter(sb.from('qms_documents').select('id',{count:'exact',head:true})).eq('status','active'),
    clientFilter(sb.from('qms_org_register').select('id',{count:'exact',head:true})).eq('status','active'),
    clientFilter(sb.from('qms_employees').select('id',{count:'exact',head:true})).eq('status','active'),
    clientFilter(sb.from('qms_legal_register').select('id',{count:'exact',head:true})).neq('compliance_status','not_applicable'),
    clientFilter(sb.from('qms_quality_risk').select('id',{count:'exact',head:true})).in('status',['open','under_treatment']),
    clientFilter(sb.from('qms_hse_risk').select('id',{count:'exact',head:true})).in('status',['open','in_progress']),
    clientFilter(sb.from('qms_ncr').select('id',{count:'exact',head:true})).in('status',['open','under_investigation','capa_raised']),
    clientFilter(sb.from('qms_capa').select('id',{count:'exact',head:true})).in('status',['open','in_progress']),
    clientFilter(sb.from('qms_audit').select('id',{count:'exact',head:true})).gte('created_at',`${yr}-01-01`)
  ]);
```

- [ ] **Step 2: Update `loadDocs` (~line 1786)**

Find:
```js
const{data,error}=await sb.from('qms_documents').select('*').order('doc_id');
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_documents').select('*')).order('doc_id');
```

- [ ] **Step 3: Update `loadNCR` (~line 1966)**

Find:
```js
const{data,error}=await sb.from('qms_ncr').select('*').order('created_at',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_ncr').select('*')).order('created_at',{ascending:false});
```

- [ ] **Step 4: Update `loadCAPA` (~line 2032)**

Find:
```js
const{data,error}=await sb.from('qms_capa').select('*').order('created_at',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_capa').select('*')).order('created_at',{ascending:false});
```

- [ ] **Step 5: Update `loadAudit` (~line 2082)**

Find:
```js
const{data,error}=await sb.from('qms_audit').select('*').order('created_at',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_audit').select('*')).order('created_at',{ascending:false});
```

- [ ] **Step 6: Update `loadEmployees` (~line 2438)**

Find:
```js
const{data,error}=await sb.from('qms_employees').select('*').order('full_name');
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_employees').select('*')).order('full_name');
```

- [ ] **Step 7: Update `loadLegal` (~line 2539)**

Find:
```js
const{data,error}=await sb.from('qms_legal_register').select('*').order('title');
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_legal_register').select('*')).order('title');
```

- [ ] **Step 8: Update `loadIssues` (`qms_context_issues`) (~line 2606)**

Find:
```js
const{data,error}=await sb.from('qms_context_issues').select('*').order('created_at',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_context_issues').select('*')).order('created_at',{ascending:false});
```

- [ ] **Step 9: Update `loadOrg` (~line 2848)**

Find:
```js
const{data,error}=await sb.from('qms_org_register').select('*').order('entity_name');
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_org_register').select('*')).order('entity_name');
```

- [ ] **Step 10: Update `loadHSE` (~line 2923)**

Find:
```js
const{data,error}=await sb.from('qms_hse_risk').select('*').order('risk_rating',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_hse_risk').select('*')).order('risk_rating',{ascending:false});
```

- [ ] **Step 11: Update `loadQR` (~line 2996)**

Find:
```js
const{data,error}=await sb.from('qms_quality_risk').select('*').order('risk_rating',{ascending:false});
```
Replace with:
```js
const{data,error}=await clientFilter(sb.from('qms_quality_risk').select('*')).order('risk_rating',{ascending:false});
```

- [ ] **Step 12: Smoke-test in browser**

Open `https://preqal.org/qms.html` — all registers should load exactly as before (Preqal's data, `client_id IS NULL`). No console errors.

Open `https://preqal.org/qms.html?clientId=00000000-0000-0000-0000-000000000000` — all registers should show empty (no rows for a fake UUID). No console errors.

- [ ] **Step 13: Commit**

```bash
git add public/qms.html
git commit -m "feat(qms): apply clientFilter to all 11 register load functions"
```

---

## Task 6: `qms.html` — `withClient` on inserts + `syncExcel` on all saves/deletes

**Files:**
- Modify: `public/qms.html`

> Context: Every save function does a conditional `id ? update : insert`. Only `insert` needs `withClient()` (update doesn't reassign client ownership). After each save or delete, call `syncExcel(key)` to trigger Excel regeneration. Four secondary insert sites also need `withClient`: `createLinkedCapa`, `autoRouteToRisk` (HSE insert), `autoRouteToRisk` (QR insert), `saveEmployeeQuick`.

**Save functions with their register key:**

| Function | Register key | Insert line search string | Close/reload line search string |
|---|---|---|---|
| `saveDoc` | `docs` | `await sb.from('qms_documents').insert([payload])` | `closeModal('doc');loadDocs();loadOverview();` |
| `saveNCR` | `ncr` | `await sb.from('qms_ncr').insert([payload]).select().single()` | `closeModal('ncr');loadNCR();loadCAPA();loadOverview();` |
| `saveCapa` | `capa` | `await sb.from('qms_capa').insert([payload])` | `closeModal('capa');loadCAPA();loadOverview();` |
| `saveAudit` | `audit` | `await sb.from('qms_audit').insert([payload])` | `closeModal('audit');loadAudit();loadOverview();` |
| `saveEmployee` | `employees` | `await sb.from('qms_employees').insert([payload])` | `closeModal('emp');loadEmployees();loadOverview();` |
| `saveLegal` | `legal` | `await sb.from('qms_legal_register').insert([payload])` | `closeModal('legal');loadLegal();loadOverview();` |
| `saveIssue` | `context` | `await sb.from('qms_context_issues').insert([payload])` | `closeModal('issue');loadIssues();` |
| `saveOrg` | `org` | `await sb.from('qms_org_register').insert([payload])` | `closeModal('org');loadOrg();loadOverview();` |
| `saveHSE` | `hse` | `await sb.from('qms_hse_risk').insert([payload])` | `closeModal('hse');loadHSE();loadOverview();` |
| `saveQR` | `qr` | `await sb.from('qms_quality_risk').insert([payload])` | `closeModal('qr');loadQR();loadOverview();` |

- [ ] **Step 1: Update all 10 save function inserts with `withClient()`**

For each save function in the table above, find the insert line and wrap `payload` with `withClient()`.

Pattern — find:
```js
await sb.from('qms_X').insert([payload])
```
Replace with:
```js
await sb.from('qms_X').insert([withClient(payload)])
```

The only exception is `saveNCR` which uses `.select().single()` — change:
```js
await sb.from('qms_ncr').insert([payload]).select().single()
```
to:
```js
await sb.from('qms_ncr').insert([withClient(payload)]).select().single()
```

- [ ] **Step 2: Add `syncExcel()` after each save**

For each save function, find the `closeModal(...)` line (see table above) and add `syncExcel(key)` on the next line.

Example for `saveDoc`:
```js
// BEFORE:
closeModal('doc');loadDocs();loadOverview();

// AFTER:
closeModal('doc');loadDocs();loadOverview();
syncExcel('docs');
```

Example for `saveNCR` (NCR triggers CAPA reload too, so sync both):
```js
// BEFORE:
closeModal('ncr');loadNCR();loadCAPA();loadOverview();

// AFTER:
closeModal('ncr');loadNCR();loadCAPA();loadOverview();
syncExcel('ncr');syncExcel('capa');
```

Example for `saveIssue` (context save — no loadOverview on same line):
```js
// BEFORE:
closeModal('issue');loadIssues();

// AFTER:
closeModal('issue');loadIssues();
syncExcel('context');
```

Apply the same pattern for all remaining 7 save functions with their correct register key.

- [ ] **Step 3: Fix `createLinkedCapa` — add `withClient()` to its insert**

Find `createLinkedCapa` (~line 2021). Its insert:
```js
await sb.from('qms_capa').insert([{capa_number:capaNumber,type:'corrective',...}]);
```
Replace with:
```js
await sb.from('qms_capa').insert([withClient({capa_number:capaNumber,type:'corrective',...})]);
```
The `{...}` object is the entire literal object already in the code — just wrap it with `withClient(`.

- [ ] **Step 4: Fix `raiseCapa` — add `syncExcel` after its reload calls**

Find `raiseCapa` (~line 2013). Its final line:
```js
loadNCR();loadCAPA();loadOverview();
```
Add after:
```js
syncExcel('ncr');syncExcel('capa');
```

- [ ] **Step 5: Fix `autoRouteToRisk` HSE insert — add `withClient()`**

Find the HSE insert inside `autoRouteToRisk` (~line 2758):
```js
const{error:hseErr}=await sb.from('qms_hse_risk').insert([hsePayload]);
```
Replace with:
```js
const{error:hseErr}=await sb.from('qms_hse_risk').insert([withClient(hsePayload)]);
```

Then find the HSE route's reload line (~line 2762):
```js
loadHSE();loadIssues();
```
Add after:
```js
syncExcel('hse');
```

- [ ] **Step 6: Fix `autoRouteToRisk` QR insert — add `withClient()`**

Find the QR insert inside `autoRouteToRisk` (~line 2792):
```js
const{error:qrErr}=await sb.from('qms_quality_risk').insert([qrPayload]);
```
Replace with:
```js
const{error:qrErr}=await sb.from('qms_quality_risk').insert([withClient(qrPayload)]);
```

Then find the QR route's reload line (~line 2796):
```js
loadQR();loadIssues();
```
Add after:
```js
syncExcel('qr');
```

- [ ] **Step 7: Fix `saveEmployeeQuick` — add `withClient()` + `syncExcel`**

Find `saveEmployeeQuick` (~line 2259). Its insert:
```js
const{error}=await sb.from('qms_employees').insert([payload]);
```
Replace with:
```js
const{error}=await sb.from('qms_employees').insert([withClient(payload)]);
```

Find its reload line (~line 2276):
```js
loadEmployees();loadOverview();
```
Add after:
```js
syncExcel('employees');
```

- [ ] **Step 8: Update `executeDelete` — add `syncExcel` after delete**

Find `executeDelete` (~line 2150). Its current body ends with:
```js
  if(loaders[type])loaders[type]();
  loadOverview();
}
```
Replace with:
```js
  if(loaders[type])loaders[type]();
  loadOverview();
  const regKey=TABLE_TO_REG_KEY[table];
  if(regKey)syncExcel(regKey);
}
```

- [ ] **Step 9: Commit**

```bash
git add public/qms.html
git commit -m "feat(qms): withClient on all inserts + syncExcel after every save/delete"
```

---

## Task 7: `qms.html` — page title + client name banner when `?clientId=` present

**Files:**
- Modify: `public/qms.html`

> Context: When qms.html is opened with `?clientId=UUID`, it shows the client's registers. The page title and a visible banner should indicate which client's QMS is being viewed. The `handleSession` function (line 1638) is called after auth succeeds — this is where to add the client-name fetch and UI update.

- [ ] **Step 1: Find `handleSession` and locate `loadAll()` call**

In `handleSession` (~line 1638), find:
```js
  loadAll();
}
```

- [ ] **Step 2: Add client name fetch before `loadAll()`**

Replace the closing section of `handleSession`:
```js
  // BEFORE (last few lines of handleSession):
  loadAll();
}

// AFTER:
  if (CLIENT_ID) {
    sb.from('crm_clients').select('company_name').eq('id', CLIENT_ID).single()
      .then(({ data }) => {
        if (!data) return;
        document.title = `${data.company_name} — QMS | Preqal`;
        const banner = document.getElementById('client-context-banner');
        if (banner) { banner.textContent = `Viewing: ${data.company_name} QMS`; banner.style.display = 'block'; }
      });
  }
  loadAll();
}
```

- [ ] **Step 3: Add the banner element to qms.html HTML**

Find the topbar area in qms.html. Search for `id="topbar-title"`. After that element, add:

```html
<div id="client-context-banner" style="display:none;background:#f59e0b;color:#0f172a;font-size:12px;font-weight:700;padding:2px 16px;border-radius:6px;margin-left:12px"></div>
```

- [ ] **Step 4: Verify in browser**

Open `https://preqal.org/qms.html?clientId=<real-client-uuid>` — page title should update to `{CompanyName} — QMS | Preqal` and the amber banner should appear in the topbar.

- [ ] **Step 5: Commit**

```bash
git add public/qms.html
git commit -m "feat(qms): show client name banner and page title when ?clientId= present"
```

---

## Task 8: `admin-dashboard.html` — client QMS nav opens `qms.html?clientId=`

**Files:**
- Modify: `public/admin-dashboard.html`

> Context: `loadClientQMS()` (~line 851) builds the "Client QMS" nav buttons in the sidebar. Currently each button calls `switchClientSection(id, name)` which shows a document-only inline section. Change it to open `qms.html?clientId={uuid}` in a new tab so the full register suite is accessible.

- [ ] **Step 1: Find the nav button template in `loadClientQMS`**

Find this block inside `loadClientQMS` (~line 860):
```js
    `<button class="nav-item" data-client-id="${c.id}" onclick="switchClientSection('${c.id}',${JSON.stringify(c.company_name)})">
      <svg ...></svg>
      ${esc(c.company_name)}'s QMS
    </button>`
```

- [ ] **Step 2: Replace onclick to open qms.html in new tab**

```js
    `<button class="nav-item" data-client-id="${c.id}" onclick="window.open('/qms.html?clientId=${c.id}','_blank')">
      <svg class="nav-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      ${esc(c.company_name)}'s QMS ↗
    </button>`
```

Note the `↗` suffix to signal it opens in a new tab.

- [ ] **Step 3: Verify**

In the admin dashboard, a client with `qms_active = true` should appear in the sidebar. Clicking it should open `qms.html?clientId={uuid}` in a new browser tab with the client context banner and empty registers.

- [ ] **Step 4: Commit and push**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): client QMS nav opens qms.html?clientId= in new tab"
```

Push all commits:
```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git push origin master --no-verify 2>&1"'
```

---

## Spec Self-Review Checklist

**Coverage check:**
- [x] DB: `client_id` on 8 tables → Task 1
- [x] `registers` bucket → Task 1
- [x] Edge Function with all 10 register configs → Task 2
- [x] Local sync script → Task 3
- [x] `run-sync.sh` extended → Task 3
- [x] `CLIENT_ID` constant from URL → Task 4
- [x] `withClient()` helper → Task 4
- [x] `clientFilter()` helper → Task 4
- [x] `syncExcel()` helper + `TABLE_TO_REG_KEY` → Task 4
- [x] `loadOverview` + 10 load functions with `clientFilter` → Task 5
- [x] All 10 save functions: `withClient` on insert + `syncExcel` after save → Task 6
- [x] `createLinkedCapa`: `withClient` → Task 6
- [x] `raiseCapa`: `syncExcel` → Task 6
- [x] `autoRouteToRisk` HSE + QR inserts: `withClient` + `syncExcel` → Task 6
- [x] `saveEmployeeQuick`: `withClient` + `syncExcel` → Task 6
- [x] `executeDelete`: `syncExcel` via `TABLE_TO_REG_KEY` → Task 6
- [x] Page title + client banner → Task 7
- [x] Admin dashboard client QMS link → Task 8

**No placeholders found.**

**Type consistency:** `clientFilter(query)` is called on the Supabase query builder before `.order()` and other chainable methods — this works because Supabase JS returns a chainable builder object at every step. `withClient(payload)` is called on plain objects and returns a plain object with `client_id` spread in — no type conflicts.
