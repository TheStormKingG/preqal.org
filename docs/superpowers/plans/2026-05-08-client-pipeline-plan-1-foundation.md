# Client Pipeline — Plan 1: DB Foundation & Reference Updates

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the database migration (rename `quote_submissions` → `qualified_leads`, add pipeline columns, create helper function, create pdf-temp bucket, insert REG-02 doc entry) and update all existing code references so the app continues working.

**Architecture:** Single SQL migration applied via Supabase MCP. Surgical find-replace in `admin-dashboard.html` and `BusinessGrowthAssessment.tsx` to swap the table name. No new UI yet — this plan makes the foundation ready for Plans 2–4.

**Tech Stack:** Supabase Postgres (MCP), vanilla JS (`admin-dashboard.html`), React + TypeScript (`pages/BusinessGrowthAssessment.tsx`)

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/20260508_qualified_leads.sql` | New — full migration SQL |
| `public/admin-dashboard.html` | Rename all `quote_submissions` refs → `qualified_leads`, update status badge map |
| `pages/BusinessGrowthAssessment.tsx` | Update `.from('quote_submissions')` → `.from('qualified_leads')`, add `selected_steps: null` |

---

### Task 1: Write the migration SQL file

**Files:**
- Create: `supabase/migrations/20260508_qualified_leads.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260508_qualified_leads.sql
-- Renames quote_submissions → qualified_leads, adds pipeline columns,
-- creates helper function and storage bucket, inserts REG-02 doc entry.

-- ── 1. Rename table ──────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS quote_submissions RENAME TO qualified_leads;

-- ── 2. Add pipeline columns ──────────────────────────────────────────────────
ALTER TABLE qualified_leads
  ADD COLUMN IF NOT EXISTS selected_steps    int2,
  ADD COLUMN IF NOT EXISTS tier              text,
  ADD COLUMN IF NOT EXISTS quote_sent_at     timestamptz,
  ADD COLUMN IF NOT EXISTS quote_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS agreement_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_token  uuid,
  ADD COLUMN IF NOT EXISTS notes             text;

-- Ensure status column exists with correct default
ALTER TABLE qualified_leads
  ALTER COLUMN status SET DEFAULT 'new';

-- ── 3. Unique index on onboarding_token ──────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS qualified_leads_onboarding_token_idx
  ON qualified_leads (onboarding_token)
  WHERE onboarding_token IS NOT NULL;

-- ── 4. Helper function for client-facing token lookup ────────────────────────
-- Returns only the fields the client-onboarding form needs.
-- SECURITY DEFINER so anonymous callers can query without touching other rows.
CREATE OR REPLACE FUNCTION get_lead_by_token(p_token uuid)
RETURNS TABLE (
  id                uuid,
  company_name      text,
  contact_person    text,
  email             text,
  staff_size        text,
  selected_steps    int2,
  recommended_tier  text,
  tier              text,
  status            text,
  agreement_sent_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ql.id,
    ql.company_name,
    ql.contact_person,
    ql.email,
    ql.staff_size,
    ql.selected_steps,
    ql.recommended_tier,
    ql.tier,
    ql.status,
    ql.agreement_sent_at
  FROM qualified_leads ql
  WHERE ql.onboarding_token = p_token
    AND ql.status = 'onboarding_sent';
END;
$$;

-- Grant execute to anon so the client-facing form can call it without auth
GRANT EXECUTE ON FUNCTION get_lead_by_token(uuid) TO anon;

-- ── 5. pdf-temp storage bucket ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-temp',
  'pdf-temp',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: only authenticated users (admin) can read/write pdf-temp
CREATE POLICY IF NOT EXISTS "pdf-temp admin access"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'pdf-temp')
  WITH CHECK (bucket_id = 'pdf-temp');

-- ── 6. Add lead_id foreign key to crm_clients ─────────────────────────────────
ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES qualified_leads(id) ON DELETE SET NULL;

-- ── 7. Insert REG-02 into qms_documents ──────────────────────────────────────
INSERT INTO qms_documents (doc_id, title, category, description, file_url, version, status)
VALUES (
  'REG-02',
  'Qualified Leads Register',
  'Registers',
  'Live register of all qualified leads from the Business Growth Assessment form, tracking pipeline status from quote through to onboarding.',
  'REG-02-QUALIFIED-LEADS-REGISTER.xlsx',
  '1.0',
  'Active'
)
ON CONFLICT (doc_id) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  file_url    = EXCLUDED.file_url;
```

- [ ] **Step 2: Verify the file was created**

```bash
cat supabase/migrations/20260508_qualified_leads.sql | head -5
```

Expected: first line is `-- supabase/migrations/20260508_qualified_leads.sql`

---

### Task 2: Apply the migration via Supabase MCP

**Files:** (no file changes — this is a DB operation)

- [ ] **Step 1: Apply the migration**

Use the Supabase MCP tool `apply_migration` with project ID `gndcjmxxgtnoidxgcdnx` and the SQL from the file above.

- [ ] **Step 2: Verify the table rename**

Use Supabase MCP `execute_sql`:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'qualified_leads'
ORDER BY ordinal_position;
```

Expected: columns include `selected_steps`, `tier`, `quote_sent_at`, `quote_accepted_at`, `agreement_sent_at`, `onboarding_token`, `notes`.

- [ ] **Step 3: Verify the function was created**

```sql
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'get_lead_by_token';
```

Expected: one row, `prosecdef = true`.

- [ ] **Step 4: Verify REG-02 was inserted**

```sql
SELECT doc_id, title, category FROM qms_documents WHERE doc_id = 'REG-02';
```

Expected: one row returned.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260508_qualified_leads.sql
git commit -m "feat(db): rename quote_submissions to qualified_leads, add pipeline columns"
```

---

### Task 3: Update admin-dashboard.html — table name references

**Files:**
- Modify: `public/admin-dashboard.html`

The dashboard references `quote_submissions` in 4 places. Replace all of them with `qualified_leads`.

- [ ] **Step 1: Update loadOverview()**

Find (line ~617):
```javascript
    sb.from('quote_submissions').select('id',{count:'exact',head:true}),
```

Replace with:
```javascript
    sb.from('qualified_leads').select('id',{count:'exact',head:true}),
```

- [ ] **Step 2: Update loadQuotes()**

Find (line ~654):
```javascript
  const{data,error}=await sb.from('quote_submissions').select('*').order('created_at',{ascending:false});
```

Replace with:
```javascript
  const{data,error}=await sb.from('qualified_leads').select('*').order('created_at',{ascending:false});
```

- [ ] **Step 3: Update markLeadQualified()**

Find (line ~677):
```javascript
  await sb.from('quote_submissions').update({status:'qualified'}).eq('id',id);
```

Replace with:
```javascript
  await sb.from('qualified_leads').update({status:'qualified'}).eq('id',id);
```

- [ ] **Step 4: Update sendLeadInvite()**

Find (line ~719):
```javascript
  const{error:dbErr}=await sb.from('quote_submissions').insert([{
```

Replace with:
```javascript
  const{error:dbErr}=await sb.from('qualified_leads').insert([{
```

- [ ] **Step 5: Update prefillFromLead() CRM select**

Find (line ~840–850) inside the CRM section where it reads from `leadsCache`:
```javascript
      opt.textContent=`${r.company_name||r.email} — ${r.contact_person||''}`;
```

This reads from `leadsCache` which is populated by `loadQuotes()` — already fixed in Step 2. No change needed here.

- [ ] **Step 6: Verify no remaining references to quote_submissions**

```bash
grep -n "quote_submissions" public/admin-dashboard.html
```

Expected: no output.

- [ ] **Step 7: Manual smoke test**

Open `http://localhost:5173/admin-dashboard.html` (or GitHub Pages preview). Sign in. Verify the "Qualified Leads" section still loads without JS errors.

- [ ] **Step 8: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "fix: update admin-dashboard to use qualified_leads table"
```

---

### Task 4: Update BusinessGrowthAssessment.tsx — table name + selected_steps

**Files:**
- Modify: `pages/BusinessGrowthAssessment.tsx`

- [ ] **Step 1: Update the Supabase insert table name**

Find (line ~303):
```typescript
    const { error: dbError } = await supabase.from('quote_submissions').insert([{
```

Replace with:
```typescript
    const { error: dbError } = await supabase.from('qualified_leads').insert([{
```

- [ ] **Step 2: Add selected_steps to the insert payload**

The BGA form doesn't have the step selector UI yet (that comes in Plan 4). For now, add it as `null` so the column gets included without breaking anything.

Find the insert payload block (lines ~304–315):
```typescript
      company_name:         submission.companyName,
      contact_person:       submission.contactPersonName,
      email:                submission.email,
      staff_size:           submission.staffSize,
      num_services:         submission.numberOfServices,
      avg_processes:        submission.avgProcessesPerService,
      base_tier:            submission.baseTier,
      complexity_score:     submission.complexityScore,
      recommended_tier:     submission.recommendedTier,
      business_description: submission.businessDescription,
      status:               'new',
```

Replace with:
```typescript
      company_name:         submission.companyName,
      contact_person:       submission.contactPersonName,
      email:                submission.email,
      staff_size:           submission.staffSize,
      num_services:         submission.numberOfServices,
      avg_processes:        submission.avgProcessesPerService,
      base_tier:            submission.baseTier,
      complexity_score:     submission.complexityScore,
      recommended_tier:     submission.recommendedTier,
      business_description: submission.businessDescription,
      selected_steps:       null,   // populated by step selector — added in Plan 4
      status:               'new',
```

- [ ] **Step 3: Verify no remaining references to quote_submissions**

```bash
grep -n "quote_submissions" pages/BusinessGrowthAssessment.tsx
```

Expected: no output.

- [ ] **Step 4: Build the React app to verify no TypeScript errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add pages/BusinessGrowthAssessment.tsx
git commit -m "fix: update BGA form to use qualified_leads table"
```

---

### Task 5: Push to GitHub

- [ ] **Step 1: Push**

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1"
```

- [ ] **Step 2: Verify CI passes**

Check GitHub Actions. Expected: green build.
