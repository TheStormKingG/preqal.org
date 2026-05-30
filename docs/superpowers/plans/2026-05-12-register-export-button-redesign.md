# Register Export Button Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the View + Download button pair on every QMS register with a single "Export Excel" button that awaits the Edge Function, then downloads the generated file immediately — no polling loop.

**Architecture:** Two edits to `public/qms.html` only. Task 1 rewrites the JS helper block (~lines 1744–1802). Task 2 updates the 10 button groups in HTML (~lines 409–663). No other files change.

**Tech Stack:** Vanilla JS, standalone HTML (no bundler, no test framework). Manual browser verification.

---

### Task 1: Rewrite JS helpers — remove View/polling, add exportRegister

**Files:**
- Modify: `public/qms.html:1744–1802`

- [ ] **Step 1: Replace the three functions (ensureRegisterReady, downloadRegister, viewRegister) with exportRegister**

Find this block in `public/qms.html` (starts at line 1744):

```js
async function ensureRegisterReady(registerKey, setBtnText) {
  let url = await getRegisterSignedUrl(registerKey);
  if (url) return url;

  // File not in Storage yet — trigger the Edge Function to build it
  setBtnText('Generating…');
  await sb.functions.invoke('sync-register-excel', {
    body: { registerKey, clientId: CLIENT_ID }
  });

  // Poll up to 20 s (10 × 2 s) for the file to appear
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    setBtnText(`Generating… (${(i + 1) * 2}s)`);
    url = await getRegisterSignedUrl(registerKey);
    if (url) return url;
  }
  return null;
}

const SPIN_SVG = '<svg class="animate-spin" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

// Triggers a browser download of the register's Excel file.
async function downloadRegister(registerKey) {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.disabled = true;
  const set = t => { btn.innerHTML = `${SPIN_SVG} ${t}`; };
  set('…');
  try {
    const url = await ensureRegisterReady(registerKey, set);
    if (!url) { alert('Could not generate Excel file — please try again.'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.download = REG_FILENAMES[registerKey];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}

// Opens the register's Excel file in Microsoft Office Online viewer (new tab).
async function viewRegister(registerKey) {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.disabled = true;
  const set = t => { btn.innerHTML = `${SPIN_SVG} ${t}`; };
  set('…');
  try {
    const url = await ensureRegisterReady(registerKey, set);
    if (!url) { alert('Could not generate Excel file — please try again.'); return; }
    window.open('https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(url), '_blank');
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}
```

Replace the entire block with:

```js
const SPIN_SVG = '<svg class="animate-spin" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

// Generates the current register Excel via Edge Function, then downloads it.
async function exportRegister(registerKey) {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${SPIN_SVG} Exporting…`;
  try {
    const { error: fnErr } = await sb.functions.invoke('sync-register-excel', {
      body: { registerKey, clientId: CLIENT_ID }
    });
    if (fnErr) throw fnErr;
    const url = await getRegisterSignedUrl(registerKey);
    if (!url) throw new Error('File not found after generation');
    const a = document.createElement('a');
    a.href = url;
    a.download = REG_FILENAMES[registerKey];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    alert('Export failed — please try again.');
    console.error('exportRegister:', e);
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
}
```

- [ ] **Step 2: Verify the edit — confirm old functions are gone and exportRegister is present**

```bash
grep -n "ensureRegisterReady\|viewRegister\|downloadRegister\|exportRegister" public/qms.html
```

Expected output — only `exportRegister` references remain:
```
<line>:async function exportRegister(registerKey) {
<line>:    exportRegister('docs')
... (one per register key, added in Task 2)
```
`ensureRegisterReady`, `viewRegister`, and `downloadRegister` must NOT appear.

- [ ] **Step 3: Commit**

```bash
git add public/qms.html
git commit -m "refactor(qms): replace view/download with exportRegister, remove polling loop"
```

---

### Task 2: Update all 10 register button groups in HTML

**Files:**
- Modify: `public/qms.html` — lines 409–410, 437–438, 464–465, 491–492, 532–533, 553–554, 581–582, 608–609, 635–636, 662–663

Each register section has a View button followed by a Download button. Both must be replaced with a single Export Excel button.

The download SVG icon (already used on the Download button) is kept — it communicates "save file":
```
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
```

- [ ] **Step 1: Replace docs button pair (line 409–410)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('docs')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('docs')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('docs')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 2: Replace ncr button pair (line 437–438)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('ncr')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('ncr')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('ncr')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 3: Replace capa button pair (line 464–465)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('capa')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('capa')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('capa')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 4: Replace audit button pair (line 491–492)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('audit')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('audit')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('audit')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 5: Replace context button pair (line 532–533)**

Find:
```html
              <button class="btn btn-ghost btn-sm" onclick="viewRegister('context')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
              <button class="btn btn-ghost btn-sm" onclick="downloadRegister('context')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
              <button class="btn btn-ghost btn-sm" onclick="exportRegister('context')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 6: Replace org button pair (line 553–554)**

Find:
```html
              <button class="btn btn-ghost btn-sm" onclick="viewRegister('org')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
              <button class="btn btn-ghost btn-sm" onclick="downloadRegister('org')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
              <button class="btn btn-ghost btn-sm" onclick="exportRegister('org')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 7: Replace hse button pair (line 581–582)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('hse')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('hse')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('hse')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 8: Replace employees button pair (line 608–609)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('employees')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('employees')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('employees')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 9: Replace legal button pair (line 635–636)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('legal')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('legal')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('legal')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 10: Replace qr button pair (line 662–663)**

Find:
```html
            <button class="btn btn-ghost btn-sm" onclick="viewRegister('qr')" title="View in browser"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> View</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadRegister('qr')" title="Download Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>
```

Replace with:
```html
            <button class="btn btn-ghost btn-sm" onclick="exportRegister('qr')" title="Export Excel"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Excel</button>
```

- [ ] **Step 11: Verify — no View or Download buttons remain**

```bash
grep -n "viewRegister\|downloadRegister\|View</button>\|Download</button>" public/qms.html
```

Expected: no output (zero matches).

- [ ] **Step 12: Commit and push**

```bash
git add public/qms.html
git commit -m "feat(qms): replace view/download buttons with single Export Excel button on all 10 registers"
```

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git push origin master --no-verify 2>&1"'
```

- [ ] **Step 13: Manual verification**

1. Open `https://preqal.org/qms.html` and log in
2. Navigate to Documents register
3. Confirm: only one button "Export Excel" (no "View" button)
4. Click "Export Excel" — button shows spinner + "Exporting…"
5. After ~5–10 seconds, browser downloads `REG-01-Document-Register.xlsx`
6. Open the file — confirm branded header (Preqal navy/amber), document rows present
7. Repeat spot-check on one other register (e.g. HSE Risks)
