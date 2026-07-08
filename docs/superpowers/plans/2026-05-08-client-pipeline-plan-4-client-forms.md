# Client Pipeline — Plan 4: BGA Step Selector + Client Onboarding Form + REG-02 Script

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the service step selector to the Business Growth Assessment form, completely rebuild `client-onboarding.html` for the pipeline token flow, extend `crm_clients` with onboarding columns, and write the `generate-reg02.cjs` script.

**Architecture:** Four independent pieces — (1) a React state + UI addition to the existing BGA modal, (2) a full replacement of the standalone HTML onboarding form, (3) a single Supabase migration to add onboarding columns to `crm_clients`, and (4) a new Node.js/ExcelJS script modelled on `generate-excel-registers.cjs`. No new routes, no new dependencies beyond ExcelJS (already installed).

**Tech Stack:** React 18 + TypeScript (BGA form), vanilla JS + Tailwind CDN + Supabase CDN + EmailJS CDN (client-onboarding.html), Node.js + ExcelJS + @supabase/supabase-js (REG-02 script), Supabase MCP (migration)

---

## File Map

| File | Change |
|---|---|
| `pages/BusinessGrowthAssessment.tsx` | Add `selectedSteps` state + `STEP_NAMES`/`STEP_RATES` constants + step selector UI + update DB insert |
| `public/client-onboarding.html` | Complete rebuild — token validation via `get_lead_by_token` RPC, form, crm_clients upsert |
| `supabase/migrations/20260508_crm_clients_onboarding.sql` | New — add onboarding columns to `crm_clients` |
| `scripts/generate-reg02.cjs` | New — generates REG-02-QUALIFIED-LEADS-REGISTER.xlsx from `qualified_leads` table |

---

### Task 1: Extend crm_clients with onboarding columns

**Files:**
- Create: `supabase/migrations/20260508_crm_clients_onboarding.sql`

The client-onboarding form collects legal/contract details not yet present in `crm_clients`. This migration adds them.

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260508_crm_clients_onboarding.sql
-- Adds onboarding-specific columns to crm_clients so the client form
-- can capture legal entity details and contract dates.

ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS legal_name          text,
  ADD COLUMN IF NOT EXISTS company_reg         text,
  ADD COLUMN IF NOT EXISTS vat_number          text,
  ADD COLUMN IF NOT EXISTS address             text,
  ADD COLUMN IF NOT EXISTS rep_id_passport     text,
  ADD COLUMN IF NOT EXISTS phone               text,
  ADD COLUMN IF NOT EXISTS contract_start      date,
  ADD COLUMN IF NOT EXISTS kickoff_meeting_date date,
  ADD COLUMN IF NOT EXISTS pipeline_stage      text DEFAULT 'onboarded',
  ADD COLUMN IF NOT EXISTS onboarding_stage    text DEFAULT 'complete';
```

- [ ] **Step 2: Apply via Supabase MCP**

Use Supabase MCP `apply_migration` with project ID `gndcjmxxgtnoidxgcdnx` and the SQL from Step 1.

- [ ] **Step 3: Verify**

Use Supabase MCP `execute_sql`:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'crm_clients'
  AND column_name IN ('legal_name','company_reg','vat_number','address','rep_id_passport','phone','contract_start','kickoff_meeting_date','pipeline_stage','onboarding_stage')
ORDER BY column_name;
```

Expected: 10 rows returned.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260508_crm_clients_onboarding.sql
git commit -m "feat(db): add onboarding columns to crm_clients"
```

---

### Task 2: Add step selector to BusinessGrowthAssessment.tsx

**Files:**
- Modify: `pages/BusinessGrowthAssessment.tsx`

The step selector goes inside the modal form, between the staff size select (line ~837) and the Number of Services / Avg Processes grid (line ~839). It shows 8 steps as clickable buttons; selecting step N highlights steps 1–N in amber and shows the tier's monthly rate.

- [ ] **Step 1: Add `STEP_NAMES` and `STEP_RATES` constants**

Find the line just above `// ─── Internal Classification Engine`:
```typescript
// ─── Internal Classification Engine (not exposed in UI) ───────────────────────
```

Insert before it:
```typescript
// ─── Service Step Selector constants ────────────────────────────────────────

const STEP_NAMES: string[] = [
  'Compliance Baseline Scan',
  'IMS Architecture & Implementation Planning',
  'Document Development',
  'Training Programme Delivery',
  'Implementation & Observation Support',
  'Internal Audit Execution',
  'Management Review Facilitation',
  'Pre-Certification Readiness Audit',
];

// Monthly fee (GYD) for the 9-month programme, indexed by tier number 1–6
const STEP_RATES: Record<number, number> = {
  1: 50000,
  2: 70000,
  3: 90000,
  4: 120000,
  5: 180000,
  6: 233333,
};

```

- [ ] **Step 2: Add `selectedSteps` to component state**

Find inside the component:
```typescript
  const [submitError, setSubmitError]   = useState('');
```

Add after it:
```typescript
  const [selectedSteps, setSelectedSteps] = useState<number | null>(null);
```

- [ ] **Step 3: Reset `selectedSteps` when modal opens**

Find inside `openModal`:
```typescript
      businessDescription: '',
    });
  }, []);
```

Replace with:
```typescript
      businessDescription: '',
    });
    setSelectedSteps(null);
  }, []);
```

- [ ] **Step 4: Reset `selectedSteps` when staff size changes**

Find inside `handleChange`:
```typescript
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
```

Replace with:
```typescript
    if (name === 'staffSize') setSelectedSteps(null);
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
```

- [ ] **Step 5: Add the step selector UI after staff size, before the services grid**

Find in the form JSX (inside the modal):
```tsx
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Number of Services */}
```

Insert before it:
```tsx
                    {/* Service Step Selector */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Which service steps interest you?{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        Each step builds on the previous. Selecting a step includes all prior steps.
                        {!formData.staffSize && ' Select your team size above to see pricing.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Service step selector">
                        {STEP_NAMES.map((name, idx) => {
                          const stepNum = idx + 1;
                          const isActive = selectedSteps !== null && stepNum <= selectedSteps;
                          const isDisabled = !formData.staffSize;
                          return (
                            <button
                              key={stepNum}
                              type="button"
                              disabled={isDisabled}
                              aria-pressed={isActive}
                              aria-label={`Step ${stepNum}: ${name}`}
                              title={name}
                              onClick={() => setSelectedSteps(prev => prev === stepNum ? null : stepNum)}
                              className={[
                                'w-9 h-9 rounded-lg font-bold text-sm transition-all',
                                isDisabled
                                  ? 'neu-raised-sm text-slate-300 cursor-not-allowed'
                                  : isActive
                                  ? 'text-white shadow-inner cursor-pointer'
                                  : 'neu-raised-sm text-slate-500 hover:text-amber-600 cursor-pointer',
                              ].join(' ')}
                              style={isActive ? {
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.15)',
                              } : undefined}
                            >
                              {stepNum}
                            </button>
                          );
                        })}
                      </div>
                      {selectedSteps && formData.staffSize && (
                        <div className="mt-3 px-4 py-2.5 rounded-xl bg-amber-50/60 neu-pressed-sm text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-amber-700">Steps 1–{selectedSteps}</span>
                          {' '}· {STEP_NAMES[selectedSteps - 1]}
                          {' '}· <span className="font-bold text-amber-600">
                            GYD {STEP_RATES[getBaseTier(formData.staffSize)].toLocaleString()}/month
                          </span>
                          <span className="text-slate-400"> (9-month programme)</span>
                        </div>
                      )}
                    </div>

```

- [ ] **Step 6: Update the DB insert to include `selected_steps`**

Find:
```typescript
      business_description: submission.businessDescription,
      status:               'new',
    }]);
```

Replace with:
```typescript
      business_description: submission.businessDescription,
      selected_steps:       selectedSteps,
      status:               'new',
    }]);
```

- [ ] **Step 7: Add `selected_steps` to EmailJS `formatted_data`**

Find:
```typescript
            `Recommended Tier:      Tier ${submission.recommendedTier} — ${submission.recommendedTierName}`,
            '',
            `Submitted:
```

Replace with:
```typescript
            `Recommended Tier:      Tier ${submission.recommendedTier} — ${submission.recommendedTierName}`,
            `Selected Steps:        ${selectedSteps ? `Steps 1–${selectedSteps} (${STEP_NAMES[selectedSteps - 1]})` : 'Not selected'}`,
            '',
            `Submitted:
```

- [ ] **Step 8: Verify no TypeScript errors**

```bash
cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && npm run build 2>&1 | tail -20
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add pages/BusinessGrowthAssessment.tsx
git commit -m "feat: add service step selector to BGA form"
```

---

### Task 3: Rebuild client-onboarding.html for pipeline token flow

**Files:**
- Replace entire: `public/client-onboarding.html`

The existing file validates tokens against a different table (`client_onboarding`). This task replaces it completely with the pipeline flow: token validation via `get_lead_by_token` RPC → pre-filled form → upsert to `crm_clients` → update `qualified_leads.status = 'onboarded'` → EmailJS → confirmation.

- [ ] **Step 1: Write the new client-onboarding.html**

Replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preqal · Client Onboarding</title>
<link rel="icon" type="image/png" href="/favicon.png">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>tailwind.config={theme:{extend:{fontFamily:{sans:['Rubik','system-ui','sans-serif']}}}}</script>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Rubik',system-ui,sans-serif;background:#e0e5ec;color:#334155;min-height:100vh}
  .neu-card{background:rgba(255,255,255,0.75);backdrop-filter:blur(14px);box-shadow:6px 6px 12px #a3b1c6,-6px -6px 12px #ffffff;border:1px solid rgba(255,255,255,0.96);border-radius:18px}
  .field{width:100%;background:rgba(255,255,255,.55);box-shadow:inset 2px 2px 4px #a3b1c6,inset -2px -2px 4px #ffffff;border:none;border-radius:.75rem;padding:10px 14px;font-size:14px;color:#334155;font-family:inherit;outline:none;transition:box-shadow .2s}
  .field:focus{box-shadow:inset 2px 2px 6px #a3b1c6,inset -2px -2px 6px #ffffff,0 0 0 3px rgba(245,158,11,.18)}
  .field::placeholder{color:#94a3b8}
  .field-err{box-shadow:inset 2px 2px 4px #fca5a5,inset -2px -2px 4px #fee2e2;border:1px solid #fca5a5}
  .field-err:focus{box-shadow:inset 2px 2px 6px #fca5a5,inset -2px -2px 6px #fee2e2,0 0 0 3px rgba(239,68,68,.12)}
  .btn-amber{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:.875rem;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;box-shadow:4px 4px 8px #a3b1c6,-2px -2px 6px #ffffff;transition:all .18s;width:100%}
  .btn-amber:hover{background:linear-gradient(135deg,#fbbf24,#b45309)}
  .btn-amber:disabled{opacity:.55;cursor:not-allowed}
  .section-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#b45309;padding:4px 0 8px;margin-top:4px}
  .divider{height:1px;background:rgba(163,177,198,.3);margin:4px 0 12px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp .4s ease-out forwards}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite}
  ::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#e0e5ec}::-webkit-scrollbar-thumb{background:#a3b1c6;border-radius:5px}
</style>
</head>
<body>

<!-- ── App Shell ──────────────────────────────────────────────────────────── -->
<div id="app" class="min-h-screen flex flex-col">

  <!-- Header -->
  <header class="px-6 py-5 flex items-center gap-3">
    <a href="/" aria-label="Preqal home">
      <img src="/logo.png" alt="Preqal" class="h-8" onerror="this.style.display='none'">
    </a>
    <span class="text-xs font-bold uppercase tracking-widest text-amber-600 ml-1">Client Onboarding</span>
  </header>

  <!-- Content -->
  <main class="flex-1 flex items-start justify-center px-4 pb-16 pt-4">
    <div class="w-full max-w-2xl">

      <!-- Loading screen -->
      <div id="screen-loading" class="text-center py-24">
        <div class="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 spin mx-auto mb-4"></div>
        <p class="text-slate-500 text-sm">Verifying your link…</p>
      </div>

      <!-- Error screen -->
      <div id="screen-error" class="hidden neu-card p-10 text-center fade-up">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background:rgba(239,68,68,.08);box-shadow:3px 3px 6px #a3b1c6,-3px -3px 6px #ffffff">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h1 class="text-xl font-bold text-slate-900 mb-3">Link Not Valid</h1>
        <p class="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">This onboarding link is no longer valid or has already been used. Please contact Stefan if you believe this is an error.</p>
        <a href="mailto:stefan.gravesande@preqal.org" class="text-amber-600 font-semibold text-sm hover:text-amber-700">stefan.gravesande@preqal.org</a>
      </div>

      <!-- Form screen -->
      <div id="screen-form" class="hidden fade-up space-y-6">

        <!-- Intro card -->
        <div class="neu-card overflow-hidden">
          <div class="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div class="p-8">
            <p class="section-label">Welcome to Preqal</p>
            <h1 class="text-2xl font-bold text-slate-900 mb-2">Complete Your Onboarding</h1>
            <p class="text-slate-500 text-sm leading-relaxed">
              Please confirm or correct the details below. This information will be used for your
              Service Agreement and to set up your client record. All fields marked
              <span class="text-amber-500 font-bold">*</span> are required.
            </p>
          </div>
        </div>

        <!-- Main form card -->
        <div class="neu-card p-8 space-y-5">
          <form id="onboarding-form" novalidate>

            <!-- Company Details -->
            <p class="section-label">Company Details</p>
            <div class="divider"></div>

            <div class="space-y-4">
              <div>
                <label for="f-legal-name" class="block text-sm font-medium text-slate-600 mb-1">Legal Company Name <span class="text-amber-500">*</span></label>
                <input id="f-legal-name" name="legal_name" type="text" class="field" placeholder="As registered with the relevant authority" autocomplete="organization" required>
                <p id="f-legal-name-err" class="text-xs text-red-600 mt-1 hidden"></p>
              </div>

              <div>
                <label for="f-address" class="block text-sm font-medium text-slate-600 mb-1">Registered Address <span class="text-amber-500">*</span></label>
                <textarea id="f-address" name="address" class="field" rows="2" placeholder="Full registered business address" required></textarea>
                <p id="f-address-err" class="text-xs text-red-600 mt-1 hidden"></p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="f-company-reg" class="block text-sm font-medium text-slate-600 mb-1">Company Registration No. <span class="text-amber-500">*</span></label>
                  <input id="f-company-reg" name="company_reg" type="text" class="field" placeholder="e.g. 123456789" required>
                  <p id="f-company-reg-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
                <div>
                  <label for="f-vat" class="block text-sm font-medium text-slate-600 mb-1">VAT Number <span class="text-slate-400 font-normal">(optional)</span></label>
                  <input id="f-vat" name="vat_number" type="text" class="field" placeholder="If registered for VAT">
                </div>
              </div>
            </div>

            <!-- Representative Details -->
            <p class="section-label mt-6">Authorised Representative</p>
            <div class="divider"></div>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="f-rep-name" class="block text-sm font-medium text-slate-600 mb-1">Full Legal Name <span class="text-amber-500">*</span></label>
                  <input id="f-rep-name" name="rep_name" type="text" class="field" placeholder="As on ID or passport" autocomplete="name" required>
                  <p id="f-rep-name-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
                <div>
                  <label for="f-rep-id" class="block text-sm font-medium text-slate-600 mb-1">ID / Passport Number <span class="text-amber-500">*</span></label>
                  <input id="f-rep-id" name="rep_id_passport" type="text" class="field" placeholder="ID or passport number" required>
                  <p id="f-rep-id-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="f-email" class="block text-sm font-medium text-slate-600 mb-1">Email Address <span class="text-amber-500">*</span></label>
                  <input id="f-email" name="email" type="email" class="field" placeholder="you@company.com" autocomplete="email" required>
                  <p id="f-email-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
                <div>
                  <label for="f-phone" class="block text-sm font-medium text-slate-600 mb-1">Phone Number <span class="text-amber-500">*</span></label>
                  <input id="f-phone" name="phone" type="tel" class="field" placeholder="+1 868 000 0000" autocomplete="tel" required>
                  <p id="f-phone-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
              </div>
            </div>

            <!-- Contract Dates -->
            <p class="section-label mt-6">Contract Dates</p>
            <div class="divider"></div>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="f-contract-start" class="block text-sm font-medium text-slate-600 mb-1">Contract Start Date <span class="text-amber-500">*</span></label>
                  <input id="f-contract-start" name="contract_start" type="date" class="field" required>
                  <p class="text-xs text-slate-400 mt-1">You can adjust this by up to 7 days from the proposed date.</p>
                  <p id="f-contract-start-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
                <div>
                  <label for="f-kickoff" class="block text-sm font-medium text-slate-600 mb-1">Preferred Kickoff Date <span class="text-amber-500">*</span></label>
                  <input id="f-kickoff" name="kickoff_meeting_date" type="date" class="field" required>
                  <p class="text-xs text-slate-400 mt-1">When would you like to start your first session?</p>
                  <p id="f-kickoff-err" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
              </div>
            </div>

            <!-- Submit error -->
            <div id="submit-err" class="hidden p-3 rounded-xl text-red-600 text-sm mt-4" style="box-shadow:inset 2px 2px 4px #fca5a5,inset -2px -2px 4px #fee2e2"></div>

            <!-- Submit button -->
            <button type="submit" id="btn-submit" class="btn-amber mt-6">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Complete Onboarding
            </button>

            <p class="text-xs text-slate-400 text-center leading-relaxed mt-3">
              Your information is kept confidential and used solely for your Preqal service agreement and client record.
            </p>

          </form>
        </div>
      </div>

      <!-- Success screen -->
      <div id="screen-success" class="hidden neu-card p-10 text-center fade-up">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background:rgba(16,185,129,.08);box-shadow:4px 4px 8px #a3b1c6,-4px -4px 8px #ffffff">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-3">Welcome to Preqal</h1>
        <p class="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          Your onboarding is complete. Stefan will be in touch shortly to confirm your
          kickoff meeting and next steps. Thank you for choosing Preqal.
        </p>
      </div>

    </div>
  </main>

</div>

<script>
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  const SUPABASE_URL  = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
  const SUPABASE_ANON = '<REVOKED-LEGACY-KEY>';
  const EJS_PUBLIC    = 'mijyAm1ocwE6qYCiq';
  const EJS_SERVICE   = 'service_qziw5dg';
  const EJS_TMPL      = 'template_clonbrd';
  const STEFAN_EMAIL  = 'stefan.gravesande@preqal.org';

  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  emailjs.init({ publicKey: EJS_PUBLIC });

  // ── Screens ─────────────────────────────────────────────────────────────────
  const screens = {
    loading: document.getElementById('screen-loading'),
    error:   document.getElementById('screen-error'),
    form:    document.getElementById('screen-form'),
    success: document.getElementById('screen-success'),
  };

  function show(name) {
    Object.keys(screens).forEach(k => {
      screens[k].classList.toggle('hidden', k !== name);
    });
  }

  // ── Token validation ─────────────────────────────────────────────────────────
  let leadData = null;
  let baseContractDate = null;

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      show('error');
      return;
    }

    const { data, error } = await sb.rpc('get_lead_by_token', { p_token: token });

    if (error || !data || data.length === 0) {
      show('error');
      return;
    }

    leadData = data[0];

    // Pre-fill form fields
    prefill();
    show('form');
  }

  function prefill() {
    const f = document.getElementById('onboarding-form');

    // Company name → legal name
    setVal(f, 'legal_name', leadData.company_name || '');
    // Email
    setVal(f, 'email', leadData.email || '');
    // Contract start: use agreement_sent_at + 7 days, or today + 7 days
    const base = leadData.agreement_sent_at
      ? new Date(leadData.agreement_sent_at)
      : new Date();
    base.setDate(base.getDate() + 7);
    baseContractDate = base;
    const iso = base.toISOString().split('T')[0];
    setVal(f, 'contract_start', iso);
    // Set min/max for contract_start (±7 days from base)
    const cField = document.getElementById('f-contract-start');
    const minD = new Date(base); minD.setDate(minD.getDate() - 7);
    const maxD = new Date(base); maxD.setDate(maxD.getDate() + 7);
    cField.min = minD.toISOString().split('T')[0];
    cField.max = maxD.toISOString().split('T')[0];
  }

  function setVal(form, name, val) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = val;
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validateForm(fd) {
    const errs = {};
    if (!fd.get('legal_name').trim()) errs.legal_name = 'Legal company name is required.';
    if (!fd.get('address').trim())    errs.address    = 'Registered address is required.';
    if (!fd.get('company_reg').trim()) errs.company_reg = 'Company registration number is required.';
    if (!fd.get('rep_name').trim())   errs.rep_name   = 'Full legal name is required.';
    if (!fd.get('rep_id_passport').trim()) errs.rep_id_passport = 'ID / Passport number is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.get('email').trim())) errs.email = 'Please enter a valid email address.';
    if (!fd.get('phone').trim())      errs.phone      = 'Phone number is required.';
    if (!fd.get('contract_start'))    errs.contract_start = 'Contract start date is required.';
    if (!fd.get('kickoff_meeting_date')) errs.kickoff_meeting_date = 'Preferred kickoff date is required.';
    return errs;
  }

  function showErrors(errs) {
    // Clear previous
    document.querySelectorAll('[id$="-err"]').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
      const name = el.id.replace('f-','').replace('-err','').replace(/-/g,'_');
      const field = document.querySelector(`[name="${name}"]`);
      if (field) field.classList.remove('field-err');
    });

    Object.keys(errs).forEach(name => {
      const errId = 'f-' + name.replace(/_/g, '-') + '-err';
      const errEl = document.getElementById(errId);
      if (errEl) { errEl.textContent = errs[name]; errEl.classList.remove('hidden'); }
      const field = document.querySelector(`[name="${name}"]`);
      if (field) field.classList.add('field-err');
    });
  }

  // ── Form submit ──────────────────────────────────────────────────────────────
  document.getElementById('onboarding-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fd = new FormData(this);

    const errs = validateForm(fd);
    if (Object.keys(errs).length > 0) {
      showErrors(errs);
      return;
    }

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent spin"></div> Saving…';

    const submitErr = document.getElementById('submit-err');
    submitErr.classList.add('hidden');

    try {
      // 1. Upsert to crm_clients
      const clientPayload = {
        company_name:          fd.get('legal_name').trim(),
        legal_name:            fd.get('legal_name').trim(),
        contact_person:        leadData.contact_person || fd.get('rep_name').trim(),
        email:                 fd.get('email').trim().toLowerCase(),
        phone:                 fd.get('phone').trim(),
        address:               fd.get('address').trim(),
        company_reg:           fd.get('company_reg').trim(),
        vat_number:            fd.get('vat_number').trim() || null,
        rep_id_passport:       fd.get('rep_id_passport').trim(),
        contract_start:        fd.get('contract_start'),
        kickoff_meeting_date:  fd.get('kickoff_meeting_date'),
        pipeline_stage:        'onboarded',
        onboarding_stage:      'complete',
        lead_id:               leadData.id,
      };

      const { error: crmErr } = await sb
        .from('crm_clients')
        .upsert([clientPayload], { onConflict: 'lead_id' });

      if (crmErr) throw new Error('CRM save failed: ' + crmErr.message);

      // 2. Update qualified_leads status to 'onboarded'
      const { error: leadErr } = await sb
        .from('qualified_leads')
        .update({ status: 'onboarded' })
        .eq('id', leadData.id);

      if (leadErr) throw new Error('Lead update failed: ' + leadErr.message);

      // 3. EmailJS notification to Stefan
      try {
        await emailjs.send(EJS_SERVICE, EJS_TMPL, {
          to_email:         STEFAN_EMAIL,
          to_name:          'Stefan',
          company_name:     clientPayload.company_name,
          onboarding_link:  window.location.href,
          contract_url:     '',
          message:          [
            'New client onboarding completed:',
            '',
            `Company:        ${clientPayload.company_name}`,
            `Contact:        ${clientPayload.contact_person}`,
            `Email:          ${clientPayload.email}`,
            `Phone:          ${clientPayload.phone}`,
            `Company Reg:    ${clientPayload.company_reg}`,
            `Contract Start: ${clientPayload.contract_start}`,
            `Kickoff Date:   ${clientPayload.kickoff_meeting_date}`,
          ].join('\n'),
        });
      } catch (ejsErr) {
        console.warn('[client-onboarding] EmailJS failed:', ejsErr);
        // Non-fatal — client data already saved
      }

      show('success');

    } catch (err) {
      console.error('[client-onboarding] Submit error:', err);
      submitErr.textContent = err.message || 'Something went wrong. Please try again or contact Stefan.';
      submitErr.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Complete Onboarding';
    }
  });

  // ── Boot ─────────────────────────────────────────────────────────────────────
  init();
})();
</script>

</body>
</html>
```

- [ ] **Step 2: Verify the anon key matches the dashboard**

The SUPABASE_ANON key used in the file is:
```
<REVOKED-LEGACY-KEY>
```

Verify this matches `public/admin-dashboard.html`:
```bash
grep -m1 "SUPABASE_KEY" '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/admin-dashboard.html' | head -c 200
```

If it doesn't match, update the SUPABASE_ANON value in `client-onboarding.html` to match.

- [ ] **Step 3: Test the error state locally**

Navigate to `http://localhost:5173/client-onboarding.html` (no `?token=` param). Expected: error screen with "Link Not Valid" message.

Navigate to `http://localhost:5173/client-onboarding.html?token=00000000-0000-0000-0000-000000000000`. Expected: error screen (no matching lead).

- [ ] **Step 4: Commit**

```bash
git add public/client-onboarding.html
git commit -m "feat: rebuild client-onboarding.html for pipeline token flow"
```

---

### Task 4: Write generate-reg02.cjs

**Files:**
- Create: `scripts/generate-reg02.cjs`

Modelled on `scripts/generate-excel-registers.cjs`. Queries `qualified_leads` via service role, generates `REG-02-QUALIFIED-LEADS-REGISTER.xlsx`, saves to `public/ims/`.

- [ ] **Step 1: Create the script**

```javascript
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

  console.log(`Retrieved ${leads.length} lead(s).`);

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
  subtitleRow.getCell(1).value = `Preqal · Generated: ${new Date().toLocaleDateString('en-GB', { dateStyle:'long' })} · Total leads: ${leads.length}`;
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
      lead.selected_steps  ? `Step ${lead.selected_steps}` : '',
      lead.recommended_tier ? `T${lead.recommended_tier}` : '',
      lead.tier            ? `T${lead.tier}` : '',
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

  console.log(`\n✓ Saved: ${outPath}`);
  console.log('\nNext step — sync to Supabase Storage:');
  console.log(`  SUPABASE_SERVICE_KEY=<key> node scripts/sync-ims-file.cjs public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/generate-reg02.cjs'
```

- [ ] **Step 3: Verify the script parses without errors**

```bash
node --check '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/generate-reg02.cjs'
```

Expected: no output (no syntax errors).

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-reg02.cjs
git commit -m "feat: add generate-reg02.cjs — qualified leads register XLSX"
```

---

### Task 5: Push to GitHub

- [ ] **Step 1: Push all commits**

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1"
```

- [ ] **Step 2: Verify CI passes**

Check GitHub Actions. Expected: green build.

- [ ] **Step 3: Smoke test client-onboarding with an invalid token**

Navigate to `https://preqal.org/client-onboarding.html` (no token param). Expected: "Link Not Valid" error screen loads correctly.

---

## Usage: Running generate-reg02.cjs

After Plan 1 and Plan 4 are implemented, generate the register:

```bash
SUPABASE_SERVICE_KEY=<service_role_key> node scripts/generate-reg02.cjs
# Then sync to Supabase Storage so it appears in the QMS:
SUPABASE_SERVICE_KEY=<service_role_key> node scripts/sync-ims-file.cjs public/ims/REG-02-QUALIFIED-LEADS-REGISTER.xlsx
```

The service role key is in: Supabase Dashboard → Project `gndcjmxxgtnoidxgcdnx` → Settings → API → `service_role`.
