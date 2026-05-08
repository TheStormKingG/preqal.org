# Client Pipeline — Plan 3: Admin Pipeline UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full client pipeline UI to `admin-dashboard.html`: upgrade the existing "Qualified Leads" section to a pipeline register with status badges and action buttons, add the 3-step Quote Creation Wizard modal, and add the 2-step Onboarding Wizard modal.

**Architecture:** All changes are in `public/admin-dashboard.html` (standalone HTML, no build step). The Quote Wizard calls the deployed `generate-pdf` Edge Function. The Onboarding Wizard generates an `onboarding_token` (UUID v4) and emails the client via EmailJS template `template_clonbrd`. All DB writes use the Supabase JS CDN client already on the page.

**Tech Stack:** Vanilla JS, Tailwind CDN, Supabase JS CDN, EmailJS CDN

**Prerequisites:** Plans 1 and 2 must be complete (`qualified_leads` table exists, `generate-pdf` Edge Function is deployed).

---

## Context — Existing Structure

Key IDs and functions already in `admin-dashboard.html`:

| Element | What it is |
|---|---|
| `#section-quotes` | The existing "Qualified Leads" section div |
| `#quotes-tbody` | The table body that `loadQuotes()` populates |
| `leadsCache` | Array holding the current `qualified_leads` rows |
| `loadQuotes()` | Fetches and renders the qualified leads table |
| `LEAD_STATUS_BADGE` | Status → badge CSS class map |
| `LEAD_STATUS_LABEL` | Status → display label map |
| `EJS_SERVICE_ID`, `EJS_ONBOARD_TMPL` | EmailJS constants already defined |
| `sb` | Supabase client |
| `.modal-overlay` | Existing CSS class for modal overlays |
| `.btn-amber`, `.btn-ghost`, `.btn-sm` | Existing button CSS classes |
| `fmtDate()`, `esc()`, `row()`, `empty()` | Existing utility functions |

The `SUPABASE_URL` constant on the page is `'https://gndcjmxxgtnoidxgcdnx.supabase.co'`.

---

## File Map

| File | Change |
|---|---|
| `public/admin-dashboard.html` | Update pipeline section HTML + JS, add Quote Wizard modal HTML + JS, add Onboarding Wizard modal HTML + JS |

---

### Task 1: Add RATE_SHEET constants and update pipeline status maps

**Files:**
- Modify: `public/admin-dashboard.html` (script section, around line 649 where `LEAD_STATUS_BADGE` is defined)

- [ ] **Step 1: Replace the existing LEAD_STATUS_BADGE/LABEL constants and add RATE_SHEET**

Find (around line 649):
```javascript
const LEAD_STATUS_BADGE={submitted:'badge-blue',invited:'badge-amber',qualified:'badge-green',added_to_crm:'badge-slate'};
const LEAD_STATUS_LABEL={submitted:'Submitted',invited:'Invited',qualified:'Qualified',added_to_crm:'In CRM'};
```

Replace with:
```javascript
// Pipeline status → badge CSS class
const LEAD_STATUS_BADGE={
  new:'badge-amber',
  quote_sent:'badge-blue',
  quote_accepted:'badge-indigo',
  onboarding_sent:'badge-purple',
  onboarded:'badge-green',
  invited:'badge-amber',  // legacy
};
const LEAD_STATUS_LABEL={
  new:'New',
  quote_sent:'Quote Sent',
  quote_accepted:'Accepted',
  onboarding_sent:'Onboarding Sent',
  onboarded:'Onboarded ✓',
  invited:'Invited',  // legacy
};

// Rate sheet — tier pricing in GYD
const RATE_SHEET={
  T1:{name:'Solo Founder',     staff:'1 person',    monthly:50000,  total:450000 },
  T2:{name:'Micro Business',   staff:'2–5 people',  monthly:70000,  total:630000 },
  T3:{name:'Small Business',   staff:'6–15 people', monthly:90000,  total:810000 },
  T4:{name:'Growing SME',      staff:'16–40 people',monthly:120000, total:1080000},
  T5:{name:'Medium Company',   staff:'41–100 people',monthly:180000,total:1620000},
  T6:{name:'Large Organisation',staff:'100+ people',monthly:233333,total:2099997},
};

// Edge Function URL for PDF generation
const PDF_EDGE_FN = 'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/generate-pdf';
```

- [ ] **Step 2: Add badge-indigo and badge-purple CSS**

Find the existing badge CSS in the `<style>` block (around line 58–63):
```css
  .badge-amber{background:rgba(245,158,11,.12);color:#b45309}
  .badge-green{background:rgba(16,185,129,.12);color:#065f46}
  .badge-blue{background:rgba(99,102,241,.1);color:#4338ca}
  .badge-slate{background:rgba(100,116,139,.1);color:#475569}
```

Replace with:
```css
  .badge-amber{background:rgba(245,158,11,.12);color:#b45309}
  .badge-green{background:rgba(16,185,129,.12);color:#065f46}
  .badge-blue{background:rgba(99,102,241,.1);color:#4338ca}
  .badge-indigo{background:rgba(67,56,202,.12);color:#3730a3}
  .badge-purple{background:rgba(126,34,206,.1);color:#6b21a8}
  .badge-slate{background:rgba(100,116,139,.1);color:#475569}
```

- [ ] **Step 3: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): add pipeline status constants, rate sheet, and badge styles"
```

---

### Task 2: Upgrade the Qualified Leads section HTML

**Files:**
- Modify: `public/admin-dashboard.html` (section-quotes div, lines ~272–289)

- [ ] **Step 1: Replace the section-quotes HTML**

Find the entire `<!-- ── QUALIFIED LEADS ── -->` block (lines ~271–289):
```html
      <!-- ── QUALIFIED LEADS ── -->
      <div id="section-quotes" class="section-anchor fade-in">
        <div class="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">Qualified Leads</h3>
            <p class="text-sm text-slate-500 mt-0.5">Companies that have filled the Quote Classifier or been directly invited.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" onclick="loadQuotes()">↻ Refresh</button>
            <button class="btn btn-amber btn-sm" onclick="openInviteLeadModal()">+ Invite Qualified Lead</button>
          </div>
        </div>
        <div class="neu-card rounded-2xl overflow-hidden"><div class="tbl-wrap">
          <table>
            <thead><tr><th>Date</th><th>Company</th><th>Contact</th><th>Email</th><th>Staff</th><th>Services</th><th>Tier</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="quotes-tbody"><tr><td colspan="9" class="text-center py-12"><div class="spinner mx-auto"></div></td></tr></tbody>
          </table>
        </div></div>
      </div>
```

Replace with:
```html
      <!-- ── QUALIFIED LEADS PIPELINE ── -->
      <div id="section-quotes" class="section-anchor fade-in">
        <div class="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">Client Pipeline</h3>
            <p class="text-sm text-slate-500 mt-0.5">Qualified leads — track each company from quote to onboarding.</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn btn-ghost btn-sm" onclick="loadQuotes()">↻ Refresh</button>
            <button class="btn btn-amber btn-sm" onclick="openInviteLeadModal()">+ Invite Lead</button>
          </div>
        </div>
        <!-- Filter bar -->
        <div class="flex gap-2 flex-wrap mb-4">
          <div class="neu-pressed-sm flex rounded-xl p-1 gap-1 flex-wrap">
            <button class="pipeline-filter-tab filter-active px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('all',this)">All</button>
            <button class="pipeline-filter-tab filter-inactive px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('new',this)">New</button>
            <button class="pipeline-filter-tab filter-inactive px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('quote_sent',this)">Quote Sent</button>
            <button class="pipeline-filter-tab filter-inactive px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('quote_accepted',this)">Accepted</button>
            <button class="pipeline-filter-tab filter-inactive px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('onboarding_sent',this)">Onboarding</button>
            <button class="pipeline-filter-tab filter-inactive px-3 py-1.5 rounded-lg text-xs transition-all" onclick="filterPipeline('onboarded',this)">Onboarded</button>
          </div>
          <input id="pipeline-search" class="field text-xs py-2 px-3 rounded-xl" style="max-width:200px" type="search" placeholder="Search company / contact…" oninput="renderPipelineTable()">
        </div>
        <div class="neu-card rounded-2xl overflow-hidden"><div class="tbl-wrap">
          <table>
            <thead><tr><th>Date</th><th>Company</th><th>Contact</th><th>Steps</th><th>Tier</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="quotes-tbody"><tr><td colspan="7" class="text-center py-12"><div class="spinner mx-auto"></div></td></tr></tbody>
          </table>
        </div></div>
      </div>
```

- [ ] **Step 2: Add filter tab CSS to the style block**

After the existing `.period-active`/`.period-inactive` styles (around line 87):
```css
  .filter-active{background:rgba(255,255,255,.7);box-shadow:inset 2px 2px 4px #a3b1c6,inset -2px -2px 4px #ffffff;color:#b45309;font-weight:700}
  .filter-inactive{color:#64748b;font-weight:500}
```

- [ ] **Step 3: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): upgrade qualified leads section to pipeline register"
```

---

### Task 3: Replace loadQuotes() with pipeline render logic

**Files:**
- Modify: `public/admin-dashboard.html` (script section, the `loadQuotes()` function and helpers around lines 648–684)

- [ ] **Step 1: Replace the loadQuotes, markLeadQualified, openClientModalFromLead functions and add pipeline helpers**

Find and replace the entire block from `const LEAD_STATUS_BADGE` down through `async function openClientModalFromLead`:

```javascript
// ── QUALIFIED LEADS PIPELINE ──────────────────────────────────────────────
// (LEAD_STATUS_BADGE, LEAD_STATUS_LABEL, RATE_SHEET, PDF_EDGE_FN already defined above)

let leadsCache = [];
let pipelineFilter = 'all';

async function loadQuotes() {
  const tb = document.getElementById('quotes-tbody');
  tb.innerHTML = row(7);
  const { data, error } = await sb.from('qualified_leads').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) { tb.innerHTML = empty(7, error?.message); return; }
  leadsCache = data;
  set('ov-quotes', data.length);
  renderPipelineTable();
}

function renderPipelineTable() {
  const tb = document.getElementById('quotes-tbody');
  const search = (document.getElementById('pipeline-search')?.value || '').toLowerCase();
  let rows = leadsCache;

  if (pipelineFilter !== 'all') {
    rows = rows.filter(r => (r.status || 'new') === pipelineFilter);
  }
  if (search) {
    rows = rows.filter(r =>
      (r.company_name || '').toLowerCase().includes(search) ||
      (r.contact_person || '').toLowerCase().includes(search)
    );
  }

  if (!rows.length) { tb.innerHTML = empty(7, 'No leads match this filter.'); return; }

  tb.innerHTML = rows.map(r => {
    const st = r.status || 'new';
    const recTier = r.recommended_tier ? `T${r.recommended_tier}` : '–';
    const confTier = r.tier || '';
    const tierDisplay = confTier ? `${recTier} → ${confTier}` : recTier;
    const stepLabel = r.selected_steps ? `Step ${r.selected_steps}` : '–';
    return `<tr>
      <td class="td-muted">${fmtDate(r.created_at)}</td>
      <td class="font-semibold">${esc(r.company_name || '—')}</td>
      <td><div class="text-sm">${esc(r.contact_person || '—')}</div><div class="text-xs td-muted">${esc(r.email || '')}</div></td>
      <td><span class="badge badge-slate">${esc(stepLabel)}</span></td>
      <td class="text-xs">${esc(tierDisplay)}</td>
      <td><span class="badge ${LEAD_STATUS_BADGE[st] || 'badge-slate'}">${LEAD_STATUS_LABEL[st] || esc(st)}</span></td>
      <td>${pipelineActions(r)}</td>
    </tr>`;
  }).join('');
}

function pipelineActions(r) {
  const st = r.status || 'new';
  const id = r.id;
  const parts = [];
  if (st === 'new' || st === 'invited' || st === 'submitted') {
    parts.push(`<button class="btn btn-amber btn-sm" onclick="openQuoteWizard('${id}')">Prepare Quote</button>`);
  }
  if (st === 'quote_sent') {
    parts.push(`<button class="btn btn-ghost btn-sm" disabled style="opacity:.5;cursor:default">Quote Sent</button>`);
    parts.push(`<button class="btn btn-ghost btn-sm" onclick="markQuoteAccepted('${id}')">Mark Accepted</button>`);
  }
  if (st === 'quote_accepted') {
    parts.push(`<button class="btn btn-sm" style="background:#6366f1;color:#fff;box-shadow:3px 3px 6px #a3b1c6,-3px -3px 6px #fff" onclick="openOnboardWizard('${id}')">Onboard</button>`);
  }
  if (st === 'onboarding_sent') {
    parts.push(`<button class="btn btn-ghost btn-sm" disabled style="opacity:.5;cursor:default">Onboarding Sent</button>`);
  }
  if (st === 'onboarded') {
    parts.push(`<span class="badge badge-green">Onboarded ✓</span>`);
  }
  return `<div class="flex gap-1 flex-wrap">${parts.join('')}</div>`;
}

function filterPipeline(status, btn) {
  pipelineFilter = status;
  document.querySelectorAll('.pipeline-filter-tab').forEach(b => {
    b.classList.remove('filter-active'); b.classList.add('filter-inactive');
  });
  btn.classList.remove('filter-inactive'); btn.classList.add('filter-active');
  renderPipelineTable();
}

async function markQuoteAccepted(id) {
  const { error } = await sb.from('qualified_leads')
    .update({ status: 'quote_accepted', quote_accepted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { alert('Error: ' + error.message); return; }
  loadQuotes();
}
```

- [ ] **Step 2: Verify the pipeline section renders correctly**

Open the admin dashboard, go to the "Qualified Leads" section. Confirm:
- Filter tabs work
- Search input filters the table
- Status badges display correctly with new colours

- [ ] **Step 3: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): add pipeline register with filter, search, and state-driven action buttons"
```

---

### Task 4: Add Quote Creation Wizard modal HTML

**Files:**
- Modify: `public/admin-dashboard.html` (after the closing `</div>` of the existing INVITE QUALIFIED LEAD MODAL, around line 379)

- [ ] **Step 1: Insert Quote Wizard modal HTML after the invite lead modal**

Add after the `<!-- ══ INVITE QUALIFIED LEAD MODAL ══ -->` closing `</div>`:

```html
<!-- ══ QUOTE WIZARD MODAL ══ -->
<div class="modal-overlay" id="quote-wizard-overlay" onclick="if(event.target===this)closeQuoteWizard()">
  <div class="neu-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 flex-shrink-0" style="background:rgba(255,255,255,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(163,177,198,.3);border-radius:16px 16px 0 0">
      <div>
        <h3 class="text-base font-bold text-slate-900">📄 Quote Creation Wizard</h3>
        <div class="flex gap-2 mt-2">
          <span id="qw-step-1-pill" class="text-xs font-bold px-3 py-0.5 rounded-full" style="background:#f59e0b;color:#fff">1 · Review</span>
          <span id="qw-step-2-pill" class="text-xs font-bold px-3 py-0.5 rounded-full" style="background:rgba(163,177,198,.3);color:#64748b">2 · Tier</span>
          <span id="qw-step-3-pill" class="text-xs font-bold px-3 py-0.5 rounded-full" style="background:rgba(163,177,198,.3);color:#64748b">3 · Send</span>
        </div>
      </div>
      <button class="neu-raised-sm w-8 h-8 rounded-lg text-slate-500 text-xl flex items-center justify-center" onclick="closeQuoteWizard()">×</button>
    </div>
    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4" id="qw-body">
      <!-- Step 1 content -->
      <div id="qw-step-1">
        <p class="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">Step 1 — Review Lead Info</p>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Company Name</label><input id="qw-company" class="field" type="text"></div>
          <div><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contact Person</label><input id="qw-contact" class="field" type="text"></div>
          <div><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label><input id="qw-email" class="field" type="email"></div>
          <div><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Staff Size</label><input id="qw-staff" class="field" type="text" readonly></div>
          <div class="col-span-2"><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Services Selected</label><div id="qw-steps-display" class="field text-sm" style="pointer-events:none;opacity:.8"></div></div>
          <div class="col-span-2"><label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Internal Notes <span class="font-normal text-slate-400">(not on quote)</span></label><textarea id="qw-notes" class="field" rows="2" placeholder="Optional admin notes…"></textarea></div>
        </div>
      </div>
      <!-- Step 2 content -->
      <div id="qw-step-2" style="display:none">
        <p class="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">Step 2 — Tier & Pricing</p>
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Tier</label>
          <div class="flex gap-2 flex-wrap" id="qw-tier-selector">
            <button onclick="selectQuoteTier('T1',this)" class="qw-tier-btn btn btn-ghost btn-sm">T1</button>
            <button onclick="selectQuoteTier('T2',this)" class="qw-tier-btn btn btn-ghost btn-sm">T2</button>
            <button onclick="selectQuoteTier('T3',this)" class="qw-tier-btn btn btn-ghost btn-sm">T3</button>
            <button onclick="selectQuoteTier('T4',this)" class="qw-tier-btn btn btn-ghost btn-sm">T4</button>
            <button onclick="selectQuoteTier('T5',this)" class="qw-tier-btn btn btn-ghost btn-sm">T5</button>
            <button onclick="selectQuoteTier('T6',this)" class="qw-tier-btn btn btn-ghost btn-sm">T6</button>
          </div>
        </div>
        <div id="qw-pricing-display" class="neu-pressed-sm rounded-xl p-4 space-y-2 text-sm">
          <p class="text-slate-400 text-sm">Select a tier to see pricing.</p>
        </div>
      </div>
      <!-- Step 3 content -->
      <div id="qw-step-3" style="display:none">
        <p class="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">Step 3 — Review & Send</p>
        <div class="mb-4">
          <button id="qw-gen-pdf-btn" class="btn btn-ghost" onclick="generateQuotePDF()">⚡ Generate Quote PDF</button>
          <span id="qw-pdf-status" class="text-xs text-slate-500 ml-3"></span>
        </div>
        <div id="qw-pdf-preview" style="display:none;margin-bottom:16px">
          <iframe id="qw-pdf-iframe" style="width:100%;height:400px;border-radius:12px;border:1px solid rgba(163,177,198,.3)" src=""></iframe>
        </div>
        <div id="qw-pdf-link-row" style="display:none" class="neu-pressed-sm rounded-xl p-3 text-sm flex items-center gap-3">
          <span class="text-slate-500">PDF ready:</span>
          <a id="qw-pdf-link" href="#" target="_blank" class="text-amber-700 font-semibold underline">Open PDF ↗</a>
        </div>
        <p id="qw-send-error" class="text-sm text-red-600 mt-2 min-h-4"></p>
      </div>
    </div>
    <!-- Footer -->
    <div class="px-6 py-4 flex justify-between items-center flex-shrink-0" style="border-top:1px solid rgba(163,177,198,.3)">
      <button id="qw-back-btn" class="btn btn-ghost" onclick="qwBack()" style="display:none">← Back</button>
      <div class="flex gap-3 ml-auto">
        <button class="btn btn-ghost" onclick="closeQuoteWizard()">Cancel</button>
        <button id="qw-next-btn" class="btn btn-amber" onclick="qwNext()">Next →</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): add quote wizard modal HTML"
```

---

### Task 5: Add Quote Wizard JavaScript

**Files:**
- Modify: `public/admin-dashboard.html` (script section, after the `loadQuotes` block)

- [ ] **Step 1: Add the Quote Wizard JS functions**

Add after the `markQuoteAccepted` function:

```javascript
// ── QUOTE WIZARD ──────────────────────────────────────────────────────────────
let qwLeadId = null;
let qwStep = 1;
let qwTier = null;
let qwPdfUrl = null;

const QW_STEPS = ['qw-step-1','qw-step-2','qw-step-3'];
const QW_PILLS = ['qw-step-1-pill','qw-step-2-pill','qw-step-3-pill'];

function openQuoteWizard(leadId) {
  const lead = leadsCache.find(r => r.id === leadId);
  if (!lead) return;
  qwLeadId = leadId;
  qwStep = 1;
  qwTier = null;
  qwPdfUrl = null;

  // Pre-fill step 1
  document.getElementById('qw-company').value = lead.company_name || '';
  document.getElementById('qw-contact').value = lead.contact_person || '';
  document.getElementById('qw-email').value   = lead.email || '';
  document.getElementById('qw-staff').value   = lead.staff_size || '';
  document.getElementById('qw-notes').value   = lead.notes || '';
  const steps = lead.selected_steps;
  const SERVICE_STEPS_LABELS = ['Compliance Baseline Scan','IMS Architecture & Implementation Planning',
    'Document Development','Training Programme Delivery','Implementation & Observation Support',
    'Internal Audit Execution','Management Review Facilitation','Pre-Certification Readiness Audit'];
  document.getElementById('qw-steps-display').textContent = steps
    ? `Step ${steps}: ${SERVICE_STEPS_LABELS.slice(0,steps).join(' · ')}`
    : 'Not specified';

  // Pre-select recommended tier
  const rec = lead.recommended_tier ? `T${lead.recommended_tier}` : 'T1';
  qwTier = rec;

  // Reset step 3 state
  document.getElementById('qw-pdf-preview').style.display = 'none';
  document.getElementById('qw-pdf-link-row').style.display = 'none';
  document.getElementById('qw-send-error').textContent = '';
  document.getElementById('qw-pdf-status').textContent = '';
  document.getElementById('qw-next-btn').textContent = 'Next →';
  document.getElementById('qw-next-btn').disabled = false;

  qwRenderStep();
  document.getElementById('quote-wizard-overlay').classList.add('open');
}

function closeQuoteWizard() {
  document.getElementById('quote-wizard-overlay').classList.remove('open');
}

function qwRenderStep() {
  QW_STEPS.forEach((id,i) => {
    document.getElementById(id).style.display = (i === qwStep-1) ? '' : 'none';
  });
  QW_PILLS.forEach((id,i) => {
    const el = document.getElementById(id);
    if (i < qwStep-1) {
      el.style.background = 'rgba(16,185,129,.15)'; el.style.color = '#065f46';
    } else if (i === qwStep-1) {
      el.style.background = '#f59e0b'; el.style.color = '#fff';
    } else {
      el.style.background = 'rgba(163,177,198,.3)'; el.style.color = '#64748b';
    }
  });
  document.getElementById('qw-back-btn').style.display = qwStep > 1 ? '' : 'none';
  if (qwStep === 2) { qwRenderPricing(); selectQuoteTierHighlight(qwTier); }
  if (qwStep === 3) { document.getElementById('qw-next-btn').textContent = 'Approve & Send'; }
  else { document.getElementById('qw-next-btn').textContent = 'Next →'; }
}

function qwBack() { if (qwStep > 1) { qwStep--; qwRenderStep(); } }

async function qwNext() {
  if (qwStep === 1) {
    // Save any edits back (notes only — name/email are cosmetic in the wizard)
    qwStep = 2; qwRenderStep();
  } else if (qwStep === 2) {
    if (!qwTier) { alert('Please select a tier.'); return; }
    qwStep = 3; qwRenderStep();
  } else if (qwStep === 3) {
    await sendQuote();
  }
}

function selectQuoteTier(tier, btn) {
  qwTier = tier;
  selectQuoteTierHighlight(tier);
  qwRenderPricing();
  // Reset PDF if tier changed
  qwPdfUrl = null;
  document.getElementById('qw-pdf-preview').style.display = 'none';
  document.getElementById('qw-pdf-link-row').style.display = 'none';
  document.getElementById('qw-pdf-status').textContent = '';
}

function selectQuoteTierHighlight(tier) {
  document.querySelectorAll('.qw-tier-btn').forEach(b => {
    b.style.background = '';
    b.style.color = '';
    b.classList.remove('btn-amber');
    b.classList.add('btn-ghost');
  });
  document.querySelectorAll('.qw-tier-btn').forEach(b => {
    if (b.textContent.trim() === tier) {
      b.classList.remove('btn-ghost');
      b.classList.add('btn-amber');
    }
  });
}

function qwRenderPricing() {
  const el = document.getElementById('qw-pricing-display');
  if (!qwTier || !RATE_SHEET[qwTier]) { el.innerHTML = '<p class="text-slate-400 text-sm">Select a tier to see pricing.</p>'; return; }
  const t = RATE_SHEET[qwTier];
  el.innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      <div><div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Tier</div><div class="font-bold text-slate-900">${qwTier} — ${t.name}</div></div>
      <div><div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Staff</div><div class="font-medium text-slate-700">${t.staff}</div></div>
      <div><div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Monthly Retainer</div><div class="font-bold text-amber-700">GYD ${t.monthly.toLocaleString()}</div></div>
      <div><div class="text-xs text-slate-400 uppercase tracking-wide mb-1">9-Month Total</div><div class="font-bold text-slate-900">GYD ${t.total.toLocaleString()}</div></div>
    </div>`;
}

async function generateQuotePDF() {
  if (!qwTier) { alert('Select a tier first.'); return; }
  const lead = leadsCache.find(r => r.id === qwLeadId);
  if (!lead) return;

  const btn = document.getElementById('qw-gen-pdf-btn');
  const status = document.getElementById('qw-pdf-status');
  btn.disabled = true; btn.textContent = '⏳ Generating…';
  status.textContent = '';

  try {
    const res = await fetch(PDF_EDGE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ type: 'quote', lead, tier: qwTier }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'PDF generation failed');

    qwPdfUrl = data.url;
    document.getElementById('qw-pdf-iframe').src = qwPdfUrl;
    document.getElementById('qw-pdf-preview').style.display = '';
    document.getElementById('qw-pdf-link').href = qwPdfUrl;
    document.getElementById('qw-pdf-link-row').style.display = '';
    status.textContent = '✓ PDF ready — review above';
    status.style.color = '#059669';
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    status.style.color = '#b91c1c';
  } finally {
    btn.disabled = false; btn.textContent = '⚡ Generate Quote PDF';
  }
}

async function sendQuote() {
  const errEl = document.getElementById('qw-send-error');
  errEl.textContent = '';
  if (!qwPdfUrl) { errEl.textContent = 'Please generate the PDF first.'; return; }

  const lead = leadsCache.find(r => r.id === qwLeadId);
  if (!lead) return;

  const btn = document.getElementById('qw-next-btn');
  btn.disabled = true; btn.textContent = 'Sending…';

  try {
    // Update DB first
    const { error: dbErr } = await sb.from('qualified_leads').update({
      tier: qwTier,
      status: 'quote_sent',
      quote_sent_at: new Date().toISOString(),
      notes: document.getElementById('qw-notes').value.trim() || null,
    }).eq('id', qwLeadId);
    if (dbErr) throw new Error('DB error: ' + dbErr.message);

    // Send email via EmailJS (or open Gmail draft as fallback)
    const toName = document.getElementById('qw-contact').value.trim() || lead.contact_person;
    const toEmail = document.getElementById('qw-email').value.trim() || lead.email;
    const company = document.getElementById('qw-company').value.trim() || lead.company_name;

    if (typeof emailjs !== 'undefined') {
      await emailjs.send(EJS_SERVICE_ID, EJS_ONBOARD_TMPL, {
        to_name: toName,
        company_name: company,
        onboarding_link: qwPdfUrl,
        contract_url: qwPdfUrl,
        to_email: toEmail,
      });
    } else {
      const subject = encodeURIComponent(`Your Preqal Quote — ${company}`);
      const body = encodeURIComponent(`Hi ${toName},\n\nPlease find your Preqal quotation here:\n${qwPdfUrl}\n\nThis link is valid for 48 hours.\n\nBest regards,\nStefan Gravesande\nPreqal`);
      window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(toEmail)}&su=${subject}&body=${body}`, '_blank');
    }

    closeQuoteWizard();
    loadQuotes();
  } catch (err) {
    errEl.textContent = 'Error: ' + err.message;
    btn.disabled = false; btn.textContent = 'Approve & Send';
  }
}
```

- [ ] **Step 2: Test the Quote Wizard end-to-end**

1. Open admin dashboard
2. Click "Prepare Quote" on a New lead
3. Wizard opens, lead info pre-filled → click Next
4. Select a tier, pricing updates → click Next
5. Click "Generate Quote PDF" — spinner shows, PDF iframe loads
6. Click "Approve & Send" — DB updates, modal closes, lead status changes to "Quote Sent"

- [ ] **Step 3: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): add quote creation wizard with PDF generation and send"
```

---

### Task 6: Add Onboarding Wizard modal HTML + JS

**Files:**
- Modify: `public/admin-dashboard.html` (after the Quote Wizard modal)

- [ ] **Step 1: Insert Onboarding Wizard modal HTML after the Quote Wizard modal**

```html
<!-- ══ ONBOARDING WIZARD MODAL ══ -->
<div class="modal-overlay" id="onboard-wizard-overlay" onclick="if(event.target===this)closeOnboardWizard()">
  <div class="neu-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
    <div class="flex items-center justify-between px-6 py-4 flex-shrink-0" style="background:rgba(255,255,255,.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(163,177,198,.3);border-radius:16px 16px 0 0">
      <div>
        <h3 class="text-base font-bold text-slate-900">🤝 Onboarding Wizard</h3>
        <div class="flex gap-2 mt-2">
          <span id="ow-step-1-pill" class="text-xs font-bold px-3 py-0.5 rounded-full" style="background:#6366f1;color:#fff">1 · Agreement</span>
          <span id="ow-step-2-pill" class="text-xs font-bold px-3 py-0.5 rounded-full" style="background:rgba(163,177,198,.3);color:#64748b">2 · Send</span>
        </div>
      </div>
      <button class="neu-raised-sm w-8 h-8 rounded-lg text-slate-500 text-xl flex items-center justify-center" onclick="closeOnboardWizard()">×</button>
    </div>
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <!-- Step 1 -->
      <div id="ow-step-1">
        <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Step 1 — Service Agreement</p>
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contract Start Date</label>
          <input id="ow-contract-start" class="field" type="date" onchange="owPdfUrl=null;document.getElementById('ow-pdf-preview').style.display='none';document.getElementById('ow-pdf-link-row').style.display='none'">
        </div>
        <div class="mb-4">
          <button id="ow-gen-pdf-btn" class="btn btn-ghost" onclick="generateAgreementPDF()">⚡ Generate Service Agreement PDF</button>
          <span id="ow-pdf-status" class="text-xs text-slate-500 ml-3"></span>
        </div>
        <div id="ow-pdf-preview" style="display:none;margin-bottom:12px">
          <iframe id="ow-pdf-iframe" style="width:100%;height:400px;border-radius:12px;border:1px solid rgba(163,177,198,.3)" src=""></iframe>
        </div>
        <div id="ow-pdf-link-row" style="display:none" class="neu-pressed-sm rounded-xl p-3 text-sm flex items-center gap-3">
          <span class="text-slate-500">Agreement ready:</span>
          <a id="ow-pdf-link" href="#" target="_blank" class="text-indigo-700 font-semibold underline">Open PDF ↗</a>
        </div>
      </div>
      <!-- Step 2 -->
      <div id="ow-step-2" style="display:none">
        <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Step 2 — Approve & Send</p>
        <div class="neu-pressed-sm rounded-xl p-4 space-y-2 text-sm">
          <div class="flex gap-2"><span class="text-slate-400">Sending to:</span><span id="ow-send-summary" class="font-semibold text-slate-900"></span></div>
          <div class="flex gap-2"><span class="text-slate-400">Agreement PDF:</span><a id="ow-send-link" href="#" target="_blank" class="text-indigo-700 font-semibold underline text-xs">View PDF ↗</a></div>
          <div class="flex gap-2"><span class="text-slate-400">Onboarding form link:</span><code id="ow-token-preview" class="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">will be generated on send</code></div>
        </div>
        <p id="ow-send-error" class="text-sm text-red-600 mt-3 min-h-4"></p>
      </div>
    </div>
    <div class="px-6 py-4 flex justify-between items-center flex-shrink-0" style="border-top:1px solid rgba(163,177,198,.3)">
      <button id="ow-back-btn" class="btn btn-ghost" onclick="owBack()" style="display:none">← Back</button>
      <div class="flex gap-3 ml-auto">
        <button class="btn btn-ghost" onclick="closeOnboardWizard()">Cancel</button>
        <button id="ow-next-btn" class="btn btn-sm" style="background:#6366f1;color:#fff;box-shadow:3px 3px 6px #a3b1c6,-3px -3px 6px #fff" onclick="owNext()">Next →</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add Onboarding Wizard JS after the Quote Wizard JS block**

```javascript
// ── ONBOARDING WIZARD ─────────────────────────────────────────────────────────
let owLeadId = null;
let owStep = 1;
let owPdfUrl = null;

function openOnboardWizard(leadId) {
  const lead = leadsCache.find(r => r.id === leadId);
  if (!lead) return;
  owLeadId = leadId;
  owStep = 1;
  owPdfUrl = null;

  // Set default contract start to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('ow-contract-start').value = today;

  // Reset state
  document.getElementById('ow-pdf-preview').style.display = 'none';
  document.getElementById('ow-pdf-link-row').style.display = 'none';
  document.getElementById('ow-pdf-status').textContent = '';
  document.getElementById('ow-send-error').textContent = '';

  owRenderStep();
  document.getElementById('onboard-wizard-overlay').classList.add('open');
}

function closeOnboardWizard() {
  document.getElementById('onboard-wizard-overlay').classList.remove('open');
}

function owRenderStep() {
  document.getElementById('ow-step-1').style.display = owStep === 1 ? '' : 'none';
  document.getElementById('ow-step-2').style.display = owStep === 2 ? '' : 'none';
  document.getElementById('ow-back-btn').style.display = owStep > 1 ? '' : 'none';

  const p1 = document.getElementById('ow-step-1-pill');
  const p2 = document.getElementById('ow-step-2-pill');
  if (owStep === 1) {
    p1.style.background = '#6366f1'; p1.style.color = '#fff';
    p2.style.background = 'rgba(163,177,198,.3)'; p2.style.color = '#64748b';
  } else {
    p1.style.background = 'rgba(16,185,129,.15)'; p1.style.color = '#065f46';
    p2.style.background = '#6366f1'; p2.style.color = '#fff';
  }

  document.getElementById('ow-next-btn').textContent = owStep === 2 ? 'Approve & Send' : 'Next →';
}

function owBack() { if (owStep > 1) { owStep--; owRenderStep(); } }

async function owNext() {
  if (owStep === 1) {
    if (!owPdfUrl) { alert('Please generate the Service Agreement PDF first.'); return; }
    // Populate step 2 summary
    const lead = leadsCache.find(r => r.id === owLeadId);
    document.getElementById('ow-send-summary').textContent = `${lead?.contact_person || ''} <${lead?.email || ''}>`;
    document.getElementById('ow-send-link').href = owPdfUrl;
    document.getElementById('ow-token-preview').textContent = 'preqal.org/client-onboarding?token=<generated on send>';
    owStep = 2; owRenderStep();
  } else if (owStep === 2) {
    await sendOnboarding();
  }
}

async function generateAgreementPDF() {
  const lead = leadsCache.find(r => r.id === owLeadId);
  if (!lead) return;

  const btn = document.getElementById('ow-gen-pdf-btn');
  const status = document.getElementById('ow-pdf-status');
  btn.disabled = true; btn.textContent = '⏳ Generating…';
  status.textContent = '';

  try {
    const contractStart = document.getElementById('ow-contract-start').value;
    const res = await fetch(PDF_EDGE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ type: 'agreement', lead, tier: lead.tier || lead.recommended_tier, contract_start: contractStart }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || 'PDF generation failed');

    owPdfUrl = data.url;
    document.getElementById('ow-pdf-iframe').src = owPdfUrl;
    document.getElementById('ow-pdf-preview').style.display = '';
    document.getElementById('ow-pdf-link').href = owPdfUrl;
    document.getElementById('ow-pdf-link-row').style.display = '';
    status.textContent = '✓ Agreement ready';
    status.style.color = '#059669';
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    status.style.color = '#b91c1c';
  } finally {
    btn.disabled = false; btn.textContent = '⚡ Generate Service Agreement PDF';
  }
}

function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>
    (c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
}

async function sendOnboarding() {
  const errEl = document.getElementById('ow-send-error');
  errEl.textContent = '';
  const lead = leadsCache.find(r => r.id === owLeadId);
  if (!lead) return;

  const btn = document.getElementById('ow-next-btn');
  btn.disabled = true; btn.textContent = 'Sending…';

  try {
    // Generate onboarding token
    const token = generateUUID();
    const onboardingLink = `https://preqal.org/client-onboarding?token=${token}`;

    // Save token to DB
    const { error: dbErr } = await sb.from('qualified_leads').update({
      onboarding_token: token,
      status: 'onboarding_sent',
      agreement_sent_at: new Date().toISOString(),
    }).eq('id', owLeadId);
    if (dbErr) throw new Error('DB error: ' + dbErr.message);

    // Send email via EmailJS or Gmail fallback
    const toName = lead.contact_person || '';
    const toEmail = lead.email || '';
    const company = lead.company_name || '';

    if (typeof emailjs !== 'undefined') {
      await emailjs.send(EJS_SERVICE_ID, EJS_ONBOARD_TMPL, {
        to_name: toName,
        company_name: company,
        onboarding_link: onboardingLink,
        contract_url: owPdfUrl,
        to_email: toEmail,
      });
    } else {
      const subject = encodeURIComponent(`Welcome to Preqal — Your Onboarding Link, ${company}`);
      const body = encodeURIComponent(`Hi ${toName},\n\nWelcome to Preqal! Please complete your onboarding here:\n${onboardingLink}\n\nYour Service Agreement is attached here:\n${owPdfUrl}\n\nBest regards,\nStefan Gravesande\nPreqal`);
      window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(toEmail)}&su=${subject}&body=${body}`, '_blank');
    }

    closeOnboardWizard();
    loadQuotes();
  } catch (err) {
    errEl.textContent = 'Error: ' + err.message;
    btn.disabled = false; btn.textContent = 'Approve & Send';
  }
}
```

- [ ] **Step 3: Test the Onboarding Wizard end-to-end**

1. Mark a lead as "Accepted" using "Mark Accepted" button
2. Click "Onboard" button on the accepted lead
3. Wizard opens → set contract start date → click "Generate Service Agreement PDF"
4. PDF iframe loads → click Next
5. Summary shows correct client details → click "Approve & Send"
6. DB: `qualified_leads` row has `status = 'onboarding_sent'`, `onboarding_token` is a valid UUID
7. Email or Gmail draft opens with the onboarding link and PDF URL

- [ ] **Step 4: Commit**

```bash
git add public/admin-dashboard.html
git commit -m "feat(admin): add onboarding wizard with agreement PDF and token generation"
```

---

### Task 7: Push and verify

- [ ] **Step 1: Push to GitHub**

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1"
```

- [ ] **Step 2: Full pipeline smoke test on production**

1. Open `preqal.org/admin-dashboard.html`
2. Sign in
3. Locate a `new` lead in the pipeline
4. Run through the full flow: Prepare Quote → Generate PDF → Approve & Send → Mark Accepted → Onboard → Generate Agreement → Approve & Send
5. Verify DB state in Supabase after each step
