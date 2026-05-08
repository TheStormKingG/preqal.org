# Client Pipeline System — Design Spec

> Date: 2026-05-08
> Status: Approved

## Overview

A full client pipeline system for Preqal — from public quote/lead submission through to client onboarding. Covers: the Qualified Leads Register (new QMS document REG-02), Quote Creation Wizard, Onboarding Wizard, and client-facing Onboarding Form. All admin workflows live inside the existing standalone `public/admin-dashboard.html`. Stack: Supabase Postgres + Auth + Edge Functions, EmailJS, vanilla JS.

---

## Architecture

**Approach selected:** Expand the existing `admin-dashboard.html` with a new "Leads" tab and modal wizards. All pipeline work stays in the existing standalone HTML pattern — no new pages, no React changes. The client-facing form uses the existing `public/client-onboarding.html` stub. PDF generation is handled by a new Supabase Edge Function.

---

## Section 1 — Database Schema

### Rename + extend `quote_submissions` → `qualified_leads`

The existing `quote_submissions` table is renamed to `qualified_leads`. All Business Growth Assessment form submissions are qualified leads by definition. The following columns are added:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `selected_steps` | `int2` | — | Steps 1–8 selected by the client on the form |
| `recommended_tier` | `text` | — | System-suggested tier (T1–T6) based on staff size |
| `tier` | `text` | — | Admin-confirmed tier (may differ from recommended) |
| `status` | `text` | `'new'` | Pipeline status (see state machine below) |
| `quote_sent_at` | `timestamptz` | — | When admin sent the quote |
| `quote_accepted_at` | `timestamptz` | — | When admin marks quote as accepted |
| `agreement_sent_at` | `timestamptz` | — | When admin sent the service agreement |
| `onboarding_token` | `uuid` | — | Unique token for client-facing onboarding form URL |
| `notes` | `text` | — | Internal admin notes (never shown to client) |

**Status state machine:**
```
new → quote_sent → quote_accepted → onboarding_sent → onboarded
```

**Tier recommendation formula (based on staff size):**
- 1–10 staff → T1
- 11–25 → T2
- 26–50 → T3
- 51–100 → T4
- 101–200 → T5
- 201+ → T6

### New QMS document: REG-02

Insert into `qms_documents`:

| Field | Value |
|---|---|
| `doc_id` | `REG-02` |
| `title` | `Qualified Leads Register` |
| `category` | `Registers` |
| `description` | `Live register of all qualified leads from the Business Growth Assessment form, tracking pipeline status from quote through to onboarding.` |
| `file_url` | `REG-02-QUALIFIED-LEADS-REGISTER.xlsx` |

---

## Section 2 — Public Quote/Lead Form

**File:** `src/pages/BusinessGrowthAssessment.tsx` (or equivalent React component)

### New field: Service step selector

Added after the staff size field. Requires staff size to be entered first (step selector is disabled until staff size is filled).

- Displays all 8 cumulative service steps with names matching the Services page
- Client clicks a step to select steps 1 through N (cumulative — selecting Step 5 means steps 1–5)
- Each step shows the cumulative monthly price for the client's staff size band (T1–T6 derived from staff size)
- Visual: horizontal step progression, amber highlight on selected step and all preceding steps

**On submit, saves to `qualified_leads`:**
- `selected_steps` — the step number selected (1–8)
- `recommended_tier` — derived from staff size at submission time
- `status` — set to `'new'`
- Auto-email to Stefan fires as before

No changes to form URL, routing, or any other existing field.

---

## Section 3 — Admin Dashboard: Leads Tab

**File:** `public/admin-dashboard.html`

### New tab: "Leads"

Inserted between existing "Quote Submissions" and "Course" tabs.

### Table columns

| Column | Notes |
|---|---|
| Company | Business name |
| Contact | Name + email |
| Steps | e.g. "Step 5" |
| Tier | Recommended → confirmed (e.g. "T2 → T3") |
| Status | Pill badge with colour per status |
| Submitted | Date |
| Actions | State-driven buttons |

### Status pill colours
- `new` — amber
- `quote_sent` — blue
- `quote_accepted` — indigo
- `onboarding_sent` — purple
- `onboarded` — green

### Action buttons (state-driven)

| Status | Buttons shown |
|---|---|
| `new` | **"Prepare Quote"** (amber, active) |
| `quote_sent` | "Quote Sent" (green, disabled) + **"Mark Accepted"** (active — clicking sets `status → 'quote_accepted'`, `quote_accepted_at = now()`) |
| `quote_accepted` | **"Onboard"** (indigo, active) |
| `onboarding_sent` | "Onboarding Sent" (green, disabled) |
| `onboarded` | "Onboarded ✓" (grey, disabled) |

### Filter bar
- Filter by status: All / New / Quote Sent / Accepted / Onboarding / Onboarded
- Search by company name or contact name

### Existing "Quote Submissions" tab
Retained as a read-only historical view of the same `qualified_leads` table. No action buttons. No changes required.

---

## Section 4 — Quote Creation Wizard

**File:** `public/admin-dashboard.html` — modal overlay triggered by "Prepare Quote" button

3-step modal wizard. Lead data is passed into the modal from the row when the button is clicked.

### Step 1 — Review Lead Info

Pre-filled from `qualified_leads`. All fields editable by admin before proceeding:
- Company name, address, registration number
- Contact name + email
- Selected service steps (display-only with step names)
- Staff size (display-only)
- Notes field (internal only, not included on quote document)

### Step 2 — Tier & Pricing

- Recommended tier displayed (from `recommended_tier` column)
- Admin can override to any tier T1–T6 using a segmented control
- Live pricing table updates on tier change:
  - Monthly fee
  - Setup fee
  - Per-step line items
- Rate data sourced from a `RATE_SHEET` constants object in the dashboard JS (same data used on the Services page)

### Step 3 — Review & Send

1. **"Generate Quote PDF"** button → POST to Supabase Edge Function `generate-pdf` with `{ type: "quote", lead: {...}, tier: "T3" }`
2. Edge Function returns `application/pdf` blob
3. PDF displayed in inline `<iframe>` preview within the modal
4. Admin reviews the document
5. Admin clicks **"Approve & Send"**:
   - EmailJS fires (`template_clonbrd` or Gmail draft fallback) with PDF attached
   - `qualified_leads` updated: `tier`, `status → 'quote_sent'`, `quote_sent_at`
   - Modal closes
   - Row action buttons update to "Quote Sent" (disabled) + "Mark Accepted"

### Edge Function: `supabase/functions/generate-pdf/index.ts`

- **Runtime:** Deno (Supabase Edge Functions)
- **Input:** `POST` with JSON body `{ type: "quote" | "agreement", lead: object, tier: string, contract_start?: string }`
- **Output:** `application/pdf` response
- **Approach:** Programmatic PDF layout using `pdf-lib` (pure JS, Deno-compatible — no headless browser required). Build pages, text blocks, tables, and branding elements directly via `pdf-lib` API.
- **Quote document includes:** Preqal logo + branding, client details, selected steps with descriptions, tier pricing table, 30-day validity notice, Stefan's signature block
- **Agreement document includes:** All quote content + legal service terms, contract start date, 9-month programme duration, signature lines for both parties

### PDF delivery via Supabase Storage

EmailJS cannot reliably send binary attachments. Instead:
1. Edge Function generates PDF bytes
2. PDF is uploaded to a private `pdf-temp` bucket in Supabase Storage with a filename like `quote-<lead_id>-<timestamp>.pdf`
3. A 48-hour signed URL is generated for the file
4. EmailJS email template includes the signed URL as a **"Download Quote / Agreement"** button link
5. Admin also sees the signed URL in the modal for their own records

---

## Section 5 — Onboarding Wizard

**File:** `public/admin-dashboard.html` — modal overlay triggered by "Onboard" button

2-step modal. Only enabled when `status = 'quote_accepted'`. Lead + quote data passed in from the row.

### Step 1 — Review Service Agreement

1. **"Generate Agreement PDF"** button → POST to `generate-pdf` Edge Function with `{ type: "agreement", lead: {...}, tier: "T3", contract_start: "YYYY-MM-DD" }`
2. PDF displayed in inline `<iframe>` preview
3. Contract start date field (date picker) — admin can edit, triggers PDF regeneration
4. Admin reviews the full agreement document

### Step 2 — Approve & Send

Admin clicks **"Approve & Send"**:
1. System generates `onboarding_token` (UUID v4) client-side
2. Saves token to `qualified_leads.onboarding_token`
3. EmailJS fires sending to client:
   - Service Agreement PDF as attachment
   - Unique onboarding link: `https://preqal.org/client-onboarding?token=<uuid>`
4. `qualified_leads` updated: `status → 'onboarding_sent'`, `agreement_sent_at`
5. Modal closes, row updates to "Onboarding Sent" (disabled)

---

## Section 6 — Client-Facing Onboarding Form

**File:** `public/client-onboarding.html`
**URL:** `preqal.org/client-onboarding?token=<uuid>`

### Token validation on load

1. Read `?token=` from URL query string
2. Query `qualified_leads` where `onboarding_token = token` AND `status = 'onboarding_sent'`
   - **RLS required:** Add a Supabase RLS policy allowing anonymous reads on `qualified_leads` only where `onboarding_token = current_setting('request.jwt.claims', true)::jsonb->>'token'` — or more simply, expose a Postgres function `get_lead_by_token(token uuid)` with `SECURITY DEFINER` that only returns safe fields (no internal notes, no other leads).
3. If not found or already used → show error screen: "This link is no longer valid. Please contact Stefan at stefan.gravesande@preqal.org."
4. If valid → load form with pre-filled data

### Form fields

**Company details** (pre-filled from lead, client confirms or corrects):
- Legal company name
- Registered address
- Company registration number
- VAT number (optional)

**Representative details:**
- Full legal name
- ID / Passport number
- Email address
- Phone number

**Contract dates:**
- Contract start date (pre-set from agreement, client can adjust ±7 days)
- Preferred kickoff meeting date (date picker)

### On submit

1. Client-side validation of all required fields
2. Upsert row in `crm_clients`:
   - All collected legal + contact details
   - `pipeline_stage = 'onboarded'`
   - `onboarding_stage = 'complete'`
   - `lead_id` = the `id` of the matching `qualified_leads` row (add `lead_id uuid REFERENCES qualified_leads(id)` column to `crm_clients` if not present)
3. Update `qualified_leads`: `status → 'onboarded'`
4. EmailJS notification to Stefan
5. Show confirmation screen: "Welcome to Preqal. Stefan will be in touch shortly to confirm your kickoff meeting."

---

## Section 7 — Supporting Scripts & QMS

### `scripts/generate-reg02.cjs`

Queries all rows from `qualified_leads` via Supabase service role. Generates `REG-02-QUALIFIED-LEADS-REGISTER.xlsx` with columns:

| Lead ID | Company | Contact | Email | Steps | Recommended Tier | Confirmed Tier | Status | Submitted | Quote Sent | Quote Accepted | Onboarding Sent | Onboarded |

Saves file to `public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx`.

**Usage:**
```bash
SUPABASE_SERVICE_KEY=<key> node scripts/generate-reg02.cjs
# Then sync to Supabase Storage:
SUPABASE_SERVICE_KEY=<key> node scripts/sync-ims-file.cjs public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx
```

---

## Files Changed / Created

| File | Change |
|---|---|
| `public/admin-dashboard.html` | New "Leads" tab, Quote Wizard modal, Onboarding Wizard modal, `RATE_SHEET` constants |
| `public/client-onboarding.html` | Full implementation (currently a stub) |
| `supabase/functions/generate-pdf/index.ts` | New Edge Function — quote + agreement PDF generation |
| `scripts/generate-reg02.cjs` | New script — generates REG-02 XLSX from Supabase data |
| DB migration | Rename `quote_submissions` → `qualified_leads`, add pipeline columns, insert REG-02 into `qms_documents`, add `lead_id` to `crm_clients`, create `get_lead_by_token()` function, create `pdf-temp` storage bucket |
| `src/pages/BusinessGrowthAssessment.tsx` | Add `selected_steps` service step selector field |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| PDF generation | Supabase Edge Function | Consistent output regardless of admin's browser; reusable for both quote and agreement |
| Table structure | Rename `quote_submissions` → `qualified_leads` | All BGA form submissions are qualified leads; one clean table |
| Service step selection | Client selects on public form | Captures real intent upfront; admin can override in wizard |
| REG-02 format | Auto-generated XLSX + Mac/Supabase sync | Matches existing IMS document architecture; audit-ready artifact |
| Admin architecture | Expand existing `admin-dashboard.html` | Consistent with current pattern; no new files, no auth duplication |
