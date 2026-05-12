# Register Export Button Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the redundant View + Download button pair on every QMS register with a single "Export Excel" button that reliably generates and downloads the current branded register.

**Architecture:** Remove `viewRegister` and `ensureRegisterReady`. Rewrite `downloadRegister` as `exportRegister` — it awaits `sb.functions.invoke` (synchronous from the client, resolves when the Edge Function finishes), then calls `getRegisterSignedUrl` once (file is guaranteed to exist at that point), then triggers the download.

**Tech Stack:** Vanilla JS in `public/qms.html` (standalone HTML, no bundler).

---

## What Changes

### `public/qms.html` — JS helpers block

**Remove entirely:**
- `ensureRegisterReady(registerKey, setBtnText)` — polling loop, no longer needed
- `viewRegister(registerKey)` — opens Office Online, redundant since the table IS the viewer

**Rewrite:**
- `downloadRegister(registerKey)` → rename to `exportRegister(registerKey)` with this exact flow:

```js
async function exportRegister(registerKey) {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${SPIN_SVG} Exporting…`;
  try {
    // Wait for Edge Function to generate + upload the file
    const { error: fnErr } = await sb.functions.invoke('sync-register-excel', {
      body: { registerKey, clientId: CLIENT_ID }
    });
    if (fnErr) throw fnErr;

    // File is now in Storage — get signed URL and download
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

**Keep unchanged:**
- `getRegisterSignedUrl(registerKey)` — no changes needed
- `syncExcel(registerKey)` — still fire-and-forget on every save/delete
- `SPIN_SVG`, `REG_FILENAMES` — unchanged

### `public/qms.html` — button HTML (10 register sections)

Each register section currently has:
```html
<div class="flex gap-2 flex-wrap items-center">
  <button ... onclick="viewRegister('KEY')">... View</button>
  <button ... onclick="downloadRegister('KEY')">... Download</button>
  <button ... onclick="openModal(...)">+ Add ...</button>
</div>
```

Replace with:
```html
<div class="flex gap-2 flex-wrap items-center">
  <button class="btn btn-ghost btn-sm" onclick="exportRegister('KEY')">
    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Export Excel
  </button>
  <button ... onclick="openModal(...)">+ Add ...</button>
</div>
```

The 10 register keys and their `openModal` calls are: `docs`, `context` (`org`), `employees` (`emp`), `hse`, `audit`, `ncr`, `capa`, `qr`, `legal`, `org`.

---

## What Does NOT Change

- `syncExcel(registerKey)` fire-and-forget on every save/delete — unchanged
- `sync-register-excel` Edge Function — unchanged
- `sync-registers-local.cjs` cron — unchanged
- All load functions, save handlers, delete handlers — unchanged

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Edge Function returns error | `alert('Export failed — please try again.')` |
| `getRegisterSignedUrl` returns null after successful invoke | Same alert |
| Network timeout | `functions.invoke` rejects → caught → same alert |
| User clicks while already exporting | Button is `disabled` during export — click ignored |

---

## Files Modified

| File | Change |
|---|---|
| `public/qms.html` | Remove `viewRegister`, `ensureRegisterReady`; rewrite `downloadRegister` → `exportRegister`; update all 10 button groups |
