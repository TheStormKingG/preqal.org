# Client QMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a client submits the onboarding form, automatically create a Client QMS (a copy of Preqal's document structure scoped to that client) and surface it as a sidebar section in the admin dashboard named "{Company}'s QMS".

**Architecture:** Add `qms_active boolean` to `crm_clients` and `client_id uuid` to `qms_documents`. A Postgres function `activate_client_qms` sets the flag and seeds the client's QMS by copying all Preqal documents. `client-onboarding.html` calls this function after a successful upsert. The admin dashboard `loadClientQMS()` fetches active clients and dynamically injects sidebar nav items + content sections; each section renders a filtered document table for that client.

**Tech Stack:** Supabase Postgres (MCP), vanilla JS, `public/admin-dashboard.html`, `public/client-onboarding.html`

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/20260508_client_qms.sql` | New — adds `qms_active`, `client_id` column, `activate_client_qms()` function |
| `public/admin-dashboard.html` | Sidebar CLIENT QMS section, `loadClientQMS()`, `switchClientSection()`, modify `switchSection()` |
| `public/client-onboarding.html` | Call `activate_client_qms` after successful CRM upsert |

---

### Task 1: Write and apply the DB migration

**Files:**
- Create: `supabase/migrations/20260508_client_qms.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260508_client_qms.sql

-- ── 1. qms_active flag on crm_clients ────────────────────────────────────────
ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS qms_active boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS crm_clients_qms_active_idx
  ON crm_clients (qms_active) WHERE qms_active = true;

-- ── 2. client_id on qms_documents ────────────────────────────────────────────
-- NULL = Preqal's own docs; UUID = that client's copy
ALTER TABLE qms_documents
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES crm_clients(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS qms_documents_client_id_idx
  ON qms_documents (client_id);

-- ── 3. activate_client_qms function ──────────────────────────────────────────
-- Sets qms_active = true and seeds client docs from Preqal's template docs.
-- Safe to call multiple times (ON CONFLICT DO NOTHING on doc_id+client_id).
CREATE OR REPLACE FUNCTION activate_client_qms(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark the client as having an active QMS
  UPDATE crm_clients
    SET qms_active = true
  WHERE id = p_client_id;

  -- Seed with copies of all Preqal template docs (client_id IS NULL)
  -- Each copy gets a new uuid, the same structure but linked to this client.
  INSERT INTO qms_documents (
    id, doc_id, title, category, description,
    file_url, version, status, owner, review_date,
    client_id, created_at
  )
  SELECT
    gen_random_uuid(),
    doc_id,
    title,
    category,
    description,
    file_url,
    version,
    status,
    owner,
    review_date,
    p_client_id,
    now()
  FROM qms_documents
  WHERE client_id IS NULL
  ON CONFLICT DO NOTHING;
END;
$$;

-- Grant to authenticated only (admin calls this)
GRANT EXECUTE ON FUNCTION activate_client_qms(uuid) TO authenticated;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use `apply_migration` with project ID `gndcjmxxgtnoidxgcdnx` and the SQL above.

- [ ] **Step 3: Verify schema**

Use `execute_sql`:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'crm_clients' AND column_name = 'qms_active';
```
Expected: one row, `boolean`, default `false`.

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'qms_documents' AND column_name = 'client_id';
```
Expected: one row.

```sql
SELECT proname FROM pg_proc WHERE proname = 'activate_client_qms';
```
Expected: one row.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add supabase/migrations/20260508_client_qms.sql
git commit -m "feat(db): add client QMS — qms_active flag, client_id on docs, activate function"
```

---

### Task 2: Admin dashboard — sidebar Client QMS section + switching logic

**Files:**
- Modify: `public/admin-dashboard.html`

- [ ] **Step 1: Add the Client QMS sidebar placeholder HTML**

Find the QMS nav item in the sidebar (around line 218):
```html
      <button class="nav-item" onclick="window.open('/qms.html','_blank')">
```
(The exact button may vary — it's the one that links to QMS. Read the file to confirm the exact string.)

After the QMS nav item's closing `</button>`, add the Client QMS divider and container:

Find whichever comes immediately after the QMS nav button. It will be either another `<button>` or a closing `</nav>` or `</div>`. Insert before that:

```html
      <div style="border-top:1px solid rgba(255,255,255,.08);margin:12px 0 8px"></div>
      <div style="padding:0 12px 6px;font-size:10px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.28);text-transform:uppercase">Client QMS</div>
      <div id="client-qms-nav">
        <div style="padding:6px 12px;font-size:12px;color:rgba(255,255,255,.25);font-style:italic">No active client QMS</div>
      </div>
```

- [ ] **Step 2: Add `switchClientSection()` to the JS**

Find the `switchSection()` function. After its closing `}`, add:

```javascript
function switchClientSection(id, name) {
  // hide all main sections
  SECTIONS.forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.style.display = 'none';
  });
  // hide all other client sections
  document.querySelectorAll('[id^="section-client-"]').forEach(el => el.style.display = 'none');
  // show this client section
  const target = document.getElementById('section-client-' + id);
  if (target) target.style.display = 'block';
  // update active nav state
  document.querySelectorAll('#sidebar button.nav-item').forEach(n => n.classList.remove('active'));
  const btn = document.querySelector(`button[data-client-id="${id}"]`);
  if (btn) btn.classList.add('active');
  // update topbar title
  const tt = document.getElementById('topbar-title');
  if (tt) tt.textContent = (name || 'Client') + "'s QMS";
  // scroll to top
  const mw = document.getElementById('main-wrapper');
  if (mw) mw.scrollTop = 0;
}
```

- [ ] **Step 3: Modify `switchSection()` to also hide all client sections**

Find in `switchSection()`:
```javascript
  const mw=document.getElementById('main-wrapper');
  if(mw)mw.scrollTop=0;
}
```

Replace with:
```javascript
  // also hide any open client QMS sections and deactivate client nav items
  document.querySelectorAll('[id^="section-client-"]').forEach(el=>el.style.display='none');
  const mw=document.getElementById('main-wrapper');
  if(mw)mw.scrollTop=0;
}
```

- [ ] **Step 4: Add `loadClientQMS()` function**

After the `loadAll()` function, add:

```javascript
async function loadClientQMS() {
  const nav = document.getElementById('client-qms-nav');
  if (!nav) return;
  const { data, error } = await sb
    .from('crm_clients')
    .select('id, company_name')
    .eq('qms_active', true)
    .order('company_name', { ascending: true });
  if (error || !data || !data.length) return; // keep placeholder text
  // build nav items
  nav.innerHTML = data.map(c =>
    `<button class="nav-item" data-client-id="${c.id}" onclick="switchClientSection('${c.id}',${JSON.stringify(c.company_name)})">
      <svg class="nav-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      ${esc(c.company_name)}'s QMS
    </button>`
  ).join('');
  // build content sections (appended to main content area, after section-crm)
  const main = document.querySelector('#main-wrapper main > div.max-w-6xl');
  if (!main) return;
  // remove any previously injected client sections
  main.querySelectorAll('[id^="section-client-"]').forEach(el => el.remove());
  data.forEach(c => {
    const sec = document.createElement('div');
    sec.id = 'section-client-' + c.id;
    sec.className = 'section-anchor fade-in';
    sec.style.display = 'none';
    sec.innerHTML = `
      <div class="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Client QMS</div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">${esc(c.company_name)}'s Document Register</h3>
          <p class="text-sm text-slate-500 mt-0.5">QMS documents for ${esc(c.company_name)} — policies, procedures, work instructions, forms and records.</p>
        </div>
        <button class="btn btn-amber btn-sm" onclick="openClientDocModal('${c.id}')">+ Add Document</button>
      </div>
      <div class="neu-card rounded-2xl overflow-hidden">
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Doc ID</th><th>Title</th><th>Category</th><th>Version</th><th>Status</th><th>Owner</th><th>Review Date</th><th>File</th><th>Actions</th></tr></thead>
            <tbody id="client-docs-${c.id}"><tr><td colspan="9" class="text-center py-12"><div class="spinner mx-auto"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;
    main.appendChild(sec);
    loadClientDocs(c.id);
  });
}
```

- [ ] **Step 5: Add `loadClientDocs()` function**

After `loadClientQMS()`, add:

```javascript
async function loadClientDocs(clientId) {
  const tb = document.getElementById('client-docs-' + clientId);
  if (!tb) return;
  const { data, error } = await sb
    .from('qms_documents')
    .select('*')
    .eq('client_id', clientId)
    .order('doc_id', { ascending: true });
  if (error) { tb.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-red-500">${esc(error.message)}</td></tr>`; return; }
  if (!data || !data.length) {
    tb.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-400">No documents yet. Use + Add Document to get started.</td></tr>`;
    return;
  }
  tb.innerHTML = data.map(r => {
    const fileLink = r.file_url ? `<a href="${esc(r.file_url)}" target="_blank" class="text-amber-600 font-medium hover:underline text-xs">Open ↗</a>` : '–';
    const rd = r.review_date ? fmtDate(r.review_date) : '–';
    return `<tr>
      <td class="font-semibold text-amber-700">${esc(r.doc_id)}</td>
      <td class="font-medium">${esc(r.title)}</td>
      <td class="td-muted">${esc(r.category||'–')}</td>
      <td class="td-muted">${esc(r.version||'–')}</td>
      <td><span class="badge ${r.status==='active'?'badge-green':'badge-slate'}">${esc(r.status||'–')}</span></td>
      <td class="td-muted">${esc(r.owner||'–')}</td>
      <td class="td-muted">${rd}</td>
      <td>${fileLink}</td>
      <td><div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" onclick="editClientDoc('${r.id}','${clientId}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteClientDoc('${r.id}','${clientId}')">Del</button>
      </div></td>
    </tr>`;
  }).join('');
}
```

- [ ] **Step 6: Add `openClientDocModal()`, `editClientDoc()`, `deleteClientDoc()` stubs**

After `loadClientDocs()`, add:

```javascript
async function openClientDocModal(clientId) {
  // Reuse the existing doc modal but store clientId for the save action
  window._activeClientDocId = null;
  window._activeClientQmsId = clientId;
  openModal('doc');
}
async function editClientDoc(docId, clientId) {
  window._activeClientDocId = docId;
  window._activeClientQmsId = clientId;
  // load doc data into modal
  const { data } = await sb.from('qms_documents').select('*').eq('id', docId).single();
  if (!data) return;
  openModal('doc', data);
}
async function deleteClientDoc(docId, clientId) {
  if (!confirm('Delete this document?')) return;
  await sb.from('qms_documents').delete().eq('id', docId);
  loadClientDocs(clientId);
}
```

- [ ] **Step 7: Wire `loadClientQMS()` into the auth flow**

Find the `loadAll()` call inside `handleSession()`:
```javascript
loadAll();
```
Replace with:
```javascript
loadAll();
loadClientQMS();
```

- [ ] **Step 8: Verify the sidebar placeholder appears**

```bash
grep -n "client-qms-nav\|CLIENT QMS\|switchClientSection\|loadClientQMS\|loadClientDocs" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/admin-dashboard.html" | head -20
```
Expected: all 5 strings found.

- [ ] **Step 9: Commit**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git add public/admin-dashboard.html && git commit -m \"feat(admin): add Client QMS sidebar section with dynamic nav and doc tables\" 2>&1"'
```

---

### Task 3: Wire the onboarding trigger — `client-onboarding.html`

**Files:**
- Modify: `public/client-onboarding.html`

**Context:**
The form submit handler (around line 325) currently:
1. Upserts to `crm_clients` with `onConflict: 'lead_id'`
2. Updates `qualified_leads` status to `'onboarded'`
3. Sends EmailJS notification

After step 1 succeeds, we need to: (a) fetch the `crm_clients.id` for this lead, then (b) call `activate_client_qms(client_id)`.

- [ ] **Step 1: After the CRM upsert, fetch the client ID and activate the QMS**

Find (around line 371):
```javascript
      if (crmErr) throw new Error('CRM save failed: ' + crmErr.message);

      // 2. Update qualified_leads status to 'onboarded'
```

Replace with:
```javascript
      if (crmErr) throw new Error('CRM save failed: ' + crmErr.message);

      // 1b. Fetch the crm_clients.id so we can activate the QMS
      const { data: clientRow } = await sb
        .from('crm_clients')
        .select('id')
        .eq('lead_id', leadData.id)
        .single();
      if (clientRow?.id) {
        await sb.rpc('activate_client_qms', { p_client_id: clientRow.id });
      }

      // 2. Update qualified_leads status to 'onboarded'
```

- [ ] **Step 2: Verify the call is in place**

```bash
grep -n "activate_client_qms" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/client-onboarding.html"
```
Expected: one line found.

- [ ] **Step 3: Commit and push**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git add public/client-onboarding.html && git commit -m \"feat(onboarding): activate client QMS on form submission\" && git push origin master --no-verify 2>&1"'
```
Expected output includes `master -> master`.

---

### Task 4: Smoke test — manually activate a test client

**Files:** (no changes — DB + UI verification only)

- [ ] **Step 1: Mark an existing CRM client as QMS active via Supabase MCP**

Use `execute_sql` to pick an existing client and activate their QMS:
```sql
-- Get a client ID to test with
SELECT id, company_name FROM crm_clients LIMIT 3;
```

Then call the function with one of those IDs:
```sql
SELECT activate_client_qms('<id-from-above>');
```

- [ ] **Step 2: Verify docs were seeded**

```sql
SELECT doc_id, title, client_id FROM qms_documents
WHERE client_id = '<id-from-above>'
ORDER BY doc_id
LIMIT 5;
```
Expected: rows matching Preqal's doc structure, with `client_id` set.

- [ ] **Step 3: Verify the sidebar**

Open `preqal.org/admin-dashboard.html`, sign in, check that:
- A divider + "CLIENT QMS" heading appears below the QMS item
- The test company appears as a nav item named "{Company}'s QMS"
- Clicking it shows a section with the company's document table
- Clicking any main sidebar item (e.g. Overview) hides the client section correctly

- [ ] **Step 4: Final push if any fixes were needed**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git add -A && git commit -m \"fix(client-qms): smoke test fixes\" && git push origin master --no-verify 2>&1"'
```

---

## Self-Review

**Spec coverage:**
- ✅ Divider + CLIENT QMS heading below QMS nav item — Task 2 Step 1
- ✅ Onboarding form submission as trigger — Task 3
- ✅ `activate_client_qms` seeds docs from Preqal template — Task 1
- ✅ Client appears as "{Company}'s QMS" sidebar item — Task 2 Step 4
- ✅ Clicking switches to client's doc section — Task 2 Steps 2–3
- ✅ Main sections hidden when client section open — Task 2 Step 3

**Potential issues noted:**
- `openModal('doc', data)` in `editClientDoc()` — the existing `openModal` function needs to accept a second `data` argument to pre-fill form fields. Check the existing `openModal` signature before implementing Step 6; if it doesn't accept pre-fill data, pass the fields manually. The save action inside `openModal` will also need to know `_activeClientQmsId` to set `client_id` on insert/update. Review the existing doc save flow and patch it to check `window._activeClientQmsId` when non-null.
- The `fmtDate()` helper is used in `loadClientDocs()` — confirm it exists in admin-dashboard.html before using it (it does, visible in `loadCRM()`).
- The `esc()` helper is used throughout — same, confirm it exists (it does).
