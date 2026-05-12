# Register Excel Sync — Implementation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Every QMS register table in Supabase is mirrored as a branded `.xlsx` file in Supabase Storage and on the local filesystem — updated immediately after each on-site save.

**Architecture:** On every insert/update/delete in `qms.html`, a fire-and-forget call hits a new Edge Function that reads the full register from DB, generates an Excel workbook with ExcelJS, and uploads it to the `registers` Storage bucket. A launchd cron (extended from the existing DOCX sync) pulls the file to the correct local folder every 5 minutes.

**Tech Stack:** Supabase Postgres + Storage + Edge Functions (Deno + npm:exceljs@4), vanilla JS (qms.html), Node.js + ExcelJS (local sync script), existing launchd plist.

---

## Register Map

Ten registers. Each is one `.xlsx` workbook in Storage.

| Register key | DB table | Storage filename | Sidebar label |
|---|---|---|---|
| `docs` | `qms_documents` | `REG-01-Document-Register.xlsx` | Documents |
| `context` | `qms_context_issues` | `REG-03-Context-Register.xlsx` | Context |
| `employees` | `qms_employees` | `REG-04-Employee-Register.xlsx` | Employees |
| `hse` | `qms_hse_risk` | `REG-05-HSE-Risk-Register.xlsx` | HSE Risks |
| `audit` | `qms_audit` | `REG-06-Audit-Register.xlsx` | Audits |
| `ncr` | `qms_ncr` | `REG-07-NCR-Register.xlsx` | Non-Conformances |
| `capa` | `qms_capa` | `REG-07b-CAPA-Register.xlsx` | CAPA |
| `qr` | `qms_quality_risk` | `REG-08-Quality-Risk-Register.xlsx` | Quality Risks |
| `legal` | `qms_legal_register` | `REG-09-Legal-Register.xlsx` | Legal |
| `org` | `qms_org_register` | `REG-10-Stakeholder-Register.xlsx` | Org / Stakeholders |

Org Chart is explicitly out of scope — to be developed as a diagram (DIA category) separately.

---

## Data Flow

```
qms.html (browser)
  1. saveRecord() / delRecord() → Supabase DB insert/update/delete  (existing)
  2. syncExcel(registerKey)     → fire-and-forget, no await

Edge Function: sync-register-excel
  3. Validates registerKey (400 on unknown key)
  4. Queries: SELECT * FROM {table} WHERE client_id IS NULL (or = clientId)
  5. Builds .xlsx workbook with npm:exceljs@4 (navy/amber brand style)
  6. Uploads to Storage 'registers' bucket with upsert:true
     - Preqal:  preqal/{filename}.xlsx
     - Client:  clients/{clientId}/{filename}.xlsx
  7. Returns { ok, path, rows }  (caller ignores — fire-and-forget)

Storage bucket: registers (private, service-role write)

launchd cron (every 5 min, extended from existing run-sync.sh)
  sync-registers-local.cjs:
  8. Lists all files in 'registers' bucket
  9. Fetches { id, company_name } map from crm_clients (one query)
  10. For each file:
      - preqal/*.xlsx  → Preqal QMS/06 - Registers/
      - clients/{uuid}/*.xlsx → Preqal QMS/CLIENTS/{companyName}/06 - Registers/
  11. Downloads atomically (.tmp → renameSync)
  12. Creates 06 - Registers/ subfolder if not present (mkdirSync recursive)
```

---

## DB Schema Changes

### Migration: `20260512_register_client_id.sql`

Add nullable `client_id` FK to the 8 register tables that don't already have it (`qms_documents` already has it):

```sql
ALTER TABLE qms_context_issues  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_employees        ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_org_register     ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_legal_register   ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_quality_risk     ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_hse_risk         ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_ncr              ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_capa             ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
ALTER TABLE qms_audit            ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES crm_clients(id) ON DELETE CASCADE;
```

Convention: `client_id IS NULL` = Preqal's own data. `client_id = UUID` = that client's data. Existing rows keep `NULL` — no data migration needed.

### New Storage bucket: `registers`

- Private bucket (no public URLs)
- Service-role write only
- Anon read blocked
- Same policy pattern as existing `ims` bucket

Storage path structure:
```
registers/
  preqal/
    REG-01-Document-Register.xlsx
    REG-03-Context-Register.xlsx
    ... (one per register)
  clients/
    {clientId}/
      REG-01-Document-Register.xlsx
      REG-03-Context-Register.xlsx
      ...
```

---

## Edge Function: `sync-register-excel`

**File:** `supabase/functions/sync-register-excel/index.ts`

**Auth:** Called via `sb.functions.invoke()` which sends the user's Supabase JWT. Function validates the JWT is present (Supabase handles this automatically for Edge Functions with `Authorization` header). No additional webhook secret needed.

**Request:**
```json
{ "registerKey": "hse", "clientId": null }
```

**Register config map** (static, inside the function — one entry per register key):

```ts
const REGISTERS: Record<string, RegisterConfig> = {
  docs: {
    table: 'qms_documents',
    filename: 'REG-01-Document-Register.xlsx',
    title: 'REG-01 — Document Register',
    sheets: [{
      name: 'Documents',
      columns: [
        { header: 'Doc ID',      key: 'doc_id',      width: 14 },
        { header: 'Title',       key: 'title',       width: 42 },
        { header: 'Category',    key: 'category',    width: 12 },
        { header: 'Version',     key: 'version',     width: 10 },
        { header: 'Status',      key: 'status',      width: 16 },
        { header: 'Owner',       key: 'owner',       width: 28 },
        { header: 'Review Date', key: 'review_date', width: 16 },
      ]
    }]
  },
  hse: {
    table: 'qms_hse_risk',
    filename: 'REG-05-HSE-Risk-Register.xlsx',
    title: 'REG-05 — HSE Risk Register',
    sheets: [{
      name: 'Risk Register',
      columns: [
        { header: 'Risk ID',       key: 'risk_id',      width: 12 },
        { header: 'Hazard',        key: 'hazard',       width: 32 },
        { header: 'Category',      key: 'hazard_category', width: 20 },
        { header: 'Who Affected',  key: 'who_affected', width: 22 },
        { header: 'Likelihood',    key: 'likelihood',   width: 13 },
        { header: 'Severity',      key: 'severity',     width: 12 },
        { header: 'Risk Score',    key: 'risk_rating',  width: 13 },
        { header: 'Controls',      key: 'control_measures', width: 45 },
        { header: 'Residual Risk', key: 'residual_rating',  width: 15 },
        { header: 'Status',        key: 'status',       width: 16 },
        { header: 'Owner',         key: 'owner',        width: 25 },
      ]
    }]
  },
  // ... remaining 8 registers follow the same shape
};
```

All remaining register configs (context, employees, audit, ncr, capa, qr, legal, org) follow the identical `{ table, filename, title, sheets: [{ name, columns }] }` shape, with columns matching the existing table columns queried in `qms.html`.

**Generation loop** (generic — works for all registers):
```ts
const wb = new ExcelJS.Workbook();
for (const sheet of config.sheets) {
  const ws = wb.addWorksheet(sheet.name);
  titleBlock(ws, config.title, clientLabel, sheet.columns.length);
  applyHeader(ws, sheet.columns.map(c => c.header), sheet.columns.map(c => c.width));
  rows.forEach((r, i) => applyData(ws, sheet.columns.map(c => r[c.key] ?? ''), i % 2 === 1));
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}
```

Brand helpers (`navyFill`, `amberLightFill`, `applyHeader`, `applyData`, `titleBlock`) are ported directly from `scripts/generate-excel-registers.cjs`.

**Error handling:**
- Unknown `registerKey` → 400
- DB query error → 500 + `{ error: message }`
- Storage upload error → 500 + `{ error: message }`
- All errors logged with `console.error` (visible in Supabase Edge Function logs)
- Caller (`qms.html`) ignores all responses — data is already in DB

---

## `qms.html` Changes

### 1. Client context constant (top of script block)

```js
const CLIENT_ID = new URLSearchParams(location.search).get('clientId') || null;
```

### 2. `withClient()` helper

```js
function withClient(payload) {
  return { ...payload, client_id: CLIENT_ID };
}
```

Applied to every `insert` payload across all 10 register save handlers.

### 3. Load function filter

Every register load function (`loadHSE`, `loadNCR`, etc.) adds one filter:

```js
// Preqal context (CLIENT_ID = null): .is('client_id', null)
// Client context (CLIENT_ID = uuid): .eq('client_id', CLIENT_ID)
sb.from('qms_hse_risk').select('*').is('client_id', CLIENT_ID)
// Note: Supabase JS .is() accepts null → generates IS NULL; for uuid use .eq()
```

Use a helper:
```js
function clientFilter(query) {
  return CLIENT_ID ? query.eq('client_id', CLIENT_ID) : query.is('client_id', null);
}
// Usage:
clientFilter(sb.from('qms_hse_risk').select('*')).order('risk_rating', { ascending: false })
```

### 4. `syncExcel()` fire-and-forget

```js
function syncExcel(registerKey) {
  // fire-and-forget — no await, silent on error
  sb.functions.invoke('sync-register-excel', {
    body: { registerKey, clientId: CLIENT_ID }
  }).catch(() => {});
}
```

Added to every register save and delete callback (~20 call sites):

```js
// Example — HSE save
closeModal('hse'); loadHSE(); loadOverview();
syncExcel('hse');  // ← added

// Example — HSE delete (inside delRecord success handler)
loadHSE(); loadOverview();
syncExcel('hse');  // ← added
```

Register key → call site mapping:
| Key | Save handler | Delete handler |
|---|---|---|
| `docs` | `saveDoc()` | `delRecord('qms_documents',...)` |
| `context` | `saveIssue()` | `delRecord('qms_context_issues',...)` |
| `employees` | `saveEmp()` | `delRecord('qms_employees',...)` |
| `hse` | `saveHSE()` | `delRecord('qms_hse_risk',...)` |
| `audit` | `saveAudit()` | `delRecord('qms_audit',...)` |
| `ncr` | `saveNCR()` | `delRecord('qms_ncr',...)` |
| `capa` | `saveCAPA()` | `delRecord('qms_capa',...)` |
| `qr` | `saveQR()` | `delRecord('qms_quality_risk',...)` |
| `legal` | `saveLegal()` | `delRecord('qms_legal_register',...)` |
| `org` | `saveOrg()` | `delRecord('qms_org_register',...)` |

### 5. Page title / header (minor)

When `CLIENT_ID` is present, update the page header to show the client name. Fetch from `crm_clients` on load:

```js
if (CLIENT_ID) {
  const { data } = await sb.from('crm_clients').select('company_name').eq('id', CLIENT_ID).single();
  if (data) document.title = `${data.company_name} — QMS | Preqal`;
}
```

---

## Local Sync Script: `scripts/sync-registers-local.cjs`

**Pattern:** Mirrors `sync-from-storage.cjs` — same structure, same error handling.

```
PREQAL_REGISTERS_DIR = /Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers
CLIENTS_ROOT         = /Users/stefangravesande/Documents/Projects/Preqal QMS/CLIENTS
```

**Algorithm:**
1. Fetch `crm_clients` → build `{ [id]: company_name }` map
2. List all files in Storage `registers/` bucket
3. For each file path:
   - `preqal/{file}` → `PREQAL_REGISTERS_DIR/{file}`
   - `clients/{uuid}/{file}` → `CLIENTS_ROOT/{companyName}/06 - Registers/{file}`
4. `fs.mkdirSync(dir, { recursive: true })` — creates folder if missing
5. Download from Storage → write atomically via `.sync.tmp` → `renameSync`
6. Log: `OK {path} → {localPath}`

**Guard:** Filename validated against `/^[A-Za-z0-9._-]+\.xlsx$/` before shell interpolation (same pattern as existing script).

---

## `run-sync.sh` Change

```sh
#!/bin/bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"

node scripts/sync-from-storage.cjs   # existing — DOCX sync
node scripts/sync-registers-local.cjs # new — Excel register sync
```

No new launchd plist needed — runs inside the existing 5-minute agent.

---

## `admin-dashboard.html` Change

Any "Open QMS" link or button for a client appends the client ID:

```js
// before
window.open('/qms.html', '_blank');

// after
window.open(`/qms.html?clientId=${clientId}`, '_blank');
```

---

## Client Onboarding Behaviour

- No seeding on `activate_client_qms()` — registers start empty
- First row added for a client → Edge Function fires → Storage file created → cron picks it up → local folder created automatically
- `CLIENTS/{companyName}/06 - Registers/` folder bootstraps itself on first sync

---

## Error States & Resilience

| Scenario | Behaviour |
|---|---|
| Edge Function unreachable | Silent fail in browser. Row is in DB. Excel falls behind until next successful save triggers sync. |
| ExcelJS error in Edge Function | 500 logged in Supabase logs. Caller ignores. Same resilience as above. |
| Unknown `registerKey` | 400 returned, logged. Indicates a code bug — developer alert. |
| Storage upload fails | 500 logged. Same resilience — DB row is safe. |
| Local path write fails | Warning logged by sync script. Does not block Storage sync. |
| Client folder missing | `mkdirSync` creates it on first sync. |

---

## Files Created / Modified

| File | Action |
|---|---|
| `supabase/migrations/20260512_register_client_id.sql` | Create |
| `supabase/functions/sync-register-excel/index.ts` | Create |
| `scripts/sync-registers-local.cjs` | Create |
| `public/qms.html` | Modify (CLIENT_ID, withClient, clientFilter, syncExcel) |
| `public/admin-dashboard.html` | Modify (append ?clientId to QMS open links) |
| `scripts/run-sync.sh` | Modify (add one line) |
