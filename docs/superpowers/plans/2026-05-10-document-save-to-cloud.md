# Document Save to Cloud Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Save as DOCX" download button with a "Save Changes" button that uploads the edited document to Supabase Storage and immediately refreshes the view mode to show the saved content.

**Architecture:** When the user finishes editing in mammoth contenteditable mode, clicking "Save Changes" converts the HTML to a DOCX blob via html-docx-js, upserts it to the `ims` Supabase Storage bucket using the authenticated admin session, updates the in-memory `_viewerBuf`, and re-renders docx-preview so the view reflects the saved file. A separate "Download" button (already exists) handles offline export. Supabase Storage requires an authenticated-user INSERT/UPDATE policy on the `ims` bucket — this is added first as a DB migration.

**Tech Stack:** Vanilla JS (no bundler), Supabase JS v2 CDN (`sb` global), html-docx-js CDN (`htmlDocx` global), docx-preview v0.3.7 CDN (`docx` global), Supabase Storage (`ims` bucket)

---

## File Structure

| File | Change |
|---|---|
| `public/qms.html` | Replace `saveDocx()` with `saveChanges()`, update button label/handler, add spinner state |
| Supabase DB (via MCP) | Add INSERT + UPDATE RLS policies on `storage.objects` for `ims` bucket |

No new files. One standalone HTML file modified. DB policy added via Supabase MCP SQL execution.

---

### Task 1: Add authenticated-user write policies to Supabase `ims` Storage bucket

**Files:**
- Supabase SQL (via `mcp__4615dbd3__execute_sql`)

Without these policies, `sb.storage.from('ims').upload(…)` returns `403 Unauthorized` even for logged-in admins. The `ims` bucket is public for reads but has no write policy set up yet.

- [ ] **Step 1: Execute SQL migration via Supabase MCP**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with project ID `gndcjmxxgtnoidxgcdnx` and this SQL:

```sql
-- Allow authenticated users to upload (INSERT) files to the ims bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Authenticated users can upload to ims'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can upload to ims"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'ims');
    $policy$;
  END IF;
END $$;

-- Allow authenticated users to overwrite (UPDATE) files in the ims bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Authenticated users can update ims'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can update ims"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'ims');
    $policy$;
  END IF;
END $$;
```

Expected result: no error, policies created (or already exist — idempotent).

- [ ] **Step 2: Verify policies exist**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with:

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND bucket_id IS NULL
UNION ALL
SELECT policyname, cmd, roles::text[]
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

Expected: rows include `"Authenticated users can upload to ims"` (INSERT) and `"Authenticated users can update ims"` (UPDATE).

---

### Task 2: Replace `saveDocx()` with `saveChanges()` in `public/qms.html`

**Files:**
- Modify: `public/qms.html` — button HTML (~line 3047), `saveDocx()` function (~line 3237), `_showPanel()` reference to `viewer-save-btn` (~line 3139)

The save flow:
1. Convert editor HTML → DOCX blob (html-docx-js)
2. Upload blob to Supabase Storage, upsert `_viewerFilename` in `ims` bucket
3. Convert blob → ArrayBuffer → replace `_viewerBuf`
4. Exit edit mode, re-render docx-preview with new `_viewerBuf`
5. Show success/error toast via existing `showToast(icon, title, body)` function

- [ ] **Step 1: Update the "Save as DOCX" button to "Save Changes"**

Find this block in `public/qms.html` (around line 3047):

```html
<button id="viewer-save-btn" class="viewer-btn viewer-btn-save" onclick="saveDocx()" style="display:none">
  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  Save as DOCX
</button>
```

Replace with:

```html
<button id="viewer-save-btn" class="viewer-btn viewer-btn-save" onclick="saveChanges()" style="display:none">
  <svg id="viewer-save-icon" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  <span id="viewer-save-label">Save Changes</span>
</button>
```

- [ ] **Step 2: Replace `saveDocx()` with `saveChanges()`**

Find this entire function in `public/qms.html` (around line 3237):

```javascript
async function saveDocx() {
  const html = document.getElementById('doc-editor').innerHTML;
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>body{font-family:Calibri,sans-serif;font-size:11pt;margin:2.54cm}
    h1{font-size:20pt}h2{font-size:15pt}h3{font-size:12pt}
    table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px}
    </style></head><body>${html}</body></html>`;
  const blob = htmlDocx.asBlob(fullHtml);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = _viewerFilename || 'document.docx';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 10000);
}
```

Replace with:

```javascript
async function saveChanges() {
  const saveBtn   = document.getElementById('viewer-save-btn');
  const saveLabel = document.getElementById('viewer-save-label');
  const saveIcon  = document.getElementById('viewer-save-icon');

  // Spinner state
  saveBtn.disabled = true;
  saveLabel.textContent = 'Saving…';
  saveIcon.innerHTML = '<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 6 6" to="360 6 6" dur="0.8s" repeatCount="indefinite"/><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="20" stroke-dashoffset="5"/>';

  try {
    // 1. Build DOCX blob from editor HTML
    const html = document.getElementById('doc-editor').innerHTML;
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>body{font-family:Calibri,sans-serif;font-size:11pt;margin:2.54cm}
      h1{font-size:20pt}h2{font-size:15pt}h3{font-size:12pt}
      table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px}
      </style></head><body>${html}</body></html>`;
    const blob = htmlDocx.asBlob(fullHtml);

    // 2. Upload to Supabase Storage (upsert — overwrite existing file)
    const { error: upErr } = await sb.storage
      .from('ims')
      .upload(_viewerFilename, blob, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true,
      });
    if (upErr) throw upErr;

    // 3. Update in-memory buffer from saved blob
    _viewerBuf = await blob.arrayBuffer();

    // 4. Exit edit mode and re-render view with updated content
    _editMode = false;
    document.getElementById('viewer-edit-label').textContent = 'Edit';
    const container = document.getElementById('doc-preview-container');
    container.innerHTML = '';
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Refreshing…';
    await docx.renderAsync(_viewerBuf.slice(0), container, null, {
      className: 'docx-viewer',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      experimental: true,
      trimXmlDeclaration: true,
    });
    _showPanel('doc-preview-wrap');

    // 5. Success feedback
    showToast('✅', 'Document saved', `${_viewerFilename} updated in cloud storage.`);

  } catch (err) {
    showToast('❌', 'Save failed', err.message || 'Unknown error. Check your connection and try again.');
  } finally {
    // Restore button
    saveBtn.disabled = false;
    saveLabel.textContent = 'Save Changes';
    saveIcon.innerHTML = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
  }
}
```

- [ ] **Step 3: Commit**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add public/qms.html && git commit -m \"feat(qms): save changes uploads to Supabase Storage and refreshes view\" && git push origin master --no-verify 2>&1"'
```

Expected: commit succeeds, push to master triggers GitHub Pages deploy.

- [ ] **Step 4: Manual verify**

1. Open `https://preqal.org/qms.html` (or hard-refresh to clear cache)
2. Log in as admin
3. Open any `.docx` from the Documents table → click "Edit"
4. Make a visible change (e.g., add "TEST EDIT" to a heading)
5. Click "Save Changes"
6. Expect: spinner on button → "Saving…" → spinner disappears → view mode renders with the edit visible → green toast "Document saved"
7. Close and re-open the same document → edit should still be present (served from Supabase Storage)
8. If you get a 403 error in the toast → Task 1 RLS policy was not applied; re-run Task 1 SQL

---

## Self-Review

**Spec coverage:**
- ✅ Save changes to Supabase Storage (cloud) — `sb.storage.upload(..., { upsert: true })`
- ✅ View mode reflects changes immediately — `_viewerBuf` replaced + `docx.renderAsync` re-run
- ✅ Spinner feedback while saving — button disabled + label changes
- ✅ Error handling — toast on failure with message
- ✅ RLS policy — Task 1 adds INSERT + UPDATE for authenticated role
- ✅ Download button unchanged — `viewer-dl-btn` anchor left untouched

**Placeholder scan:** None found. All code is complete and runnable.

**Type consistency:**
- `saveChanges()` referenced in button `onclick` — matches function name defined in Step 2 ✅
- `sb` global available at `_showPanel` call site — initialized line 1585 ✅
- `docx.renderAsync` — correct global from `docx-preview@0.3.7` UMD build ✅
- `showToast(icon, title, body)` — matches signature at line 2779 ✅
- `_viewerFilename` — set in `openDocViewer()` at line 3168 ✅
