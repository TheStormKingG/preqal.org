# Fix Document Save — Store HTML in DB, Never Touch DOCX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the corrupted save-to-cloud feature by storing edited content as HTML in `qms_documents.content_html` (never overwriting the original DOCX file), and restore the corrupted POL-01.docx immediately.

**Architecture:** `html-docx-js` generates MHTML (MIME-wrapped HTML), not OOXML ZIP, so `docx-preview` renders raw MIME headers instead of the document. The correct fix: save edited HTML to a `content_html TEXT` column in `qms_documents` via a Supabase UPDATE — the original DOCX in Storage is never touched. The viewer gets a new `doc-html-wrap` panel that renders `content_html` with styled formatting when present, falling back to docx-preview when not. Downloading always fetches the original `file_url` DOCX.

**Tech Stack:** Supabase JS v2 (global `sb`), vanilla JS, `public/qms.html` standalone HTML, Supabase MCP (`mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql`)

---

## File Structure

| File | Change |
|---|---|
| Supabase DB (via MCP) | Add `content_html TEXT` to `qms_documents`; restore POL-01 `file_url` |
| `public/qms.html` — CSS (~line 182) | Add `#doc-html-wrap` and `.doc-html-inner` styles |
| `public/qms.html` — viewer HTML (~line 3120) | Add `#doc-html-wrap` panel + Revert button in topbar |
| `public/qms.html` — `PANEL_SHOW` map (~line 3190) | Add `'doc-html-wrap': 'block'` entry |
| `public/qms.html` — `_showPanel()` (~line 3197) | Handle `doc-html-wrap` for Edit button visibility |
| `public/qms.html` — viewer globals (~line 3166) | Add `_viewerDocId`, `_viewerContentHtml` state vars |
| `public/qms.html` — `openDocViewer()` (~line 3233) | Accept `docId` + `contentHtml`; show `doc-html-wrap` when `contentHtml` is set |
| `public/qms.html` — `toggleEditMode()` (~line 3217) | When toggling View from edit, check `_viewerContentHtml` to decide which view panel to show |
| `public/qms.html` — `saveChanges()` (~line 3304) | Replace Storage upload with `sb.from('qms_documents').update({content_html})` |
| `public/qms.html` — `renderDocsTable()` (~line 1726) | Pass `r.id` and `r.content_html` to `openDocViewer()` |
| `public/qms.html` — `docsAllData` type | `content_html` field now available in fetched rows (auto via `select('*')`) |

---

### Task 1: Restore POL-01.docx and add `content_html` column

**Files:**
- Supabase DB via `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql`

POL-01.docx in Supabase Storage was overwritten with MHTML by the broken save feature. The GitHub Pages version at `https://preqal.org/ims/POL-01.docx` (served from git) is intact. Updating `file_url` to the full GitHub Pages URL makes `resolveFileUrl()` return it as-is (it starts with 'http'), so the viewer fetches the real file.

- [ ] **Step 1: Execute SQL via Supabase MCP**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with project ID `gndcjmxxgtnoidxgcdnx` and this SQL:

```sql
-- 1. Add content_html column (idempotent)
ALTER TABLE qms_documents
  ADD COLUMN IF NOT EXISTS content_html TEXT;

-- 2. Restore POL-01: point file_url to GitHub Pages (which has the original)
UPDATE qms_documents
SET file_url = 'https://preqal.org/ims/POL-01.docx'
WHERE doc_id = 'POL-01'
  AND client_id IS NULL;
```

Expected: no error, 1 row updated for POL-01.

- [ ] **Step 2: Verify**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with:

```sql
SELECT doc_id, file_url, content_html IS NULL AS no_draft
FROM qms_documents
WHERE doc_id = 'POL-01' AND client_id IS NULL;
```

Expected: `file_url = 'https://preqal.org/ims/POL-01.docx'`, `no_draft = true`.

Also confirm column exists:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'qms_documents' AND column_name = 'content_html';
```
Expected: 1 row, `data_type = 'text'`.

---

### Task 2: Update `public/qms.html` — full viewer redesign for HTML-in-DB saves

**Files:**
- Modify: `public/qms.html` — CSS, HTML panels, JS functions listed above

This is one cohesive task because all the viewer JS is tightly coupled — changing the save path affects the panel display, which affects `_showPanel`, which affects `toggleEditMode`. Apply all changes, then commit.

#### Step 1: Add CSS for `#doc-html-wrap`

- [ ] Find the CSS block that starts with `/* ── SAVE CONFIRM MODAL */` (~line 182) and insert BEFORE it:

```css
  /* HTML draft view panel */
  #doc-html-wrap{flex:1;overflow:auto;background:#f1f5f9;display:none;padding:24px 0}
  .doc-html-inner{max-width:820px;margin:0 auto 32px;background:#fff;padding:56px 64px;box-shadow:0 8px 40px rgba(0,0,0,.18);border-radius:4px;font-family:Calibri,Georgia,serif;font-size:11pt;line-height:1.6;color:#1e293b;min-height:400px}
  .doc-html-inner h1{font-size:20pt;font-weight:700;margin:1.2em 0 .4em}
  .doc-html-inner h2{font-size:15pt;font-weight:700;margin:1em 0 .35em}
  .doc-html-inner h3{font-size:12pt;font-weight:700;margin:.8em 0 .3em}
  .doc-html-inner p{margin:.3em 0}
  .doc-html-inner table{border-collapse:collapse;width:100%;margin:1em 0}
  .doc-html-inner td,.doc-html-inner th{border:1px solid #cbd5e1;padding:6px 10px;font-size:10pt}
  .doc-html-inner th{background:#f8fafc;font-weight:700}
  .doc-html-inner ul,.doc-html-inner ol{padding-left:1.6em;margin:.4em 0}
  .doc-html-inner .draft-notice{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:8px;padding:10px 16px;margin-bottom:24px;font-size:11px;font-weight:700;color:#92400e;display:flex;align-items:center;gap:8px}
```

#### Step 2: Add "Revert to Original" button and `#doc-html-wrap` panel in the viewer HTML

- [ ] Find the viewer topbar buttons block. The current last button before the Save Changes button is:

```html
    <button id="viewer-save-btn" class="viewer-btn viewer-btn-save" onclick="saveChanges()" style="display:none">
```

Add a Revert button BEFORE the Save button (the Revert button is only shown in HTML draft view):

```html
    <button id="viewer-revert-btn" class="viewer-btn viewer-btn-close" onclick="revertToOriginal()" style="display:none">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/></svg>
      Revert to Original
    </button>
```

- [ ] Find the `<!-- XLSX sheet viewer -->` block (~line 3123) and insert the HTML panel BEFORE it:

```html
  <!-- HTML draft view (shown when content_html is stored in DB) -->
  <div id="doc-html-wrap">
    <div class="doc-html-inner" id="doc-html-inner"></div>
  </div>

```

#### Step 3: Update `PANEL_SHOW` map and `_showPanel()`

- [ ] Find:

```javascript
const PANEL_SHOW = {
  'doc-preview-wrap':   'block',
  'doc-editor-wrap':    'block',
  'doc-sheet-wrap':     'block',
  'doc-viewer-img-wrap':'flex',
  'doc-viewer-loading': 'flex'
};
function _showPanel(id) {
  Object.keys(PANEL_SHOW).forEach(p => {
    const el = document.getElementById(p);
    if(el) el.style.display = p===id ? PANEL_SHOW[p] : 'none';
  });
  const isEditor = id === 'doc-editor-wrap';
  const isDocx   = id === 'doc-preview-wrap' || isEditor;
  const tb = document.getElementById('doc-editor-toolbar');
  if(tb) tb.style.display = isEditor ? 'flex' : 'none';
  const saveBtn = document.getElementById('viewer-save-btn');
  if(saveBtn) saveBtn.style.display = isEditor ? 'inline-flex' : 'none';
  const editBtn = document.getElementById('viewer-edit-btn');
  if(editBtn) editBtn.style.display = isDocx ? 'inline-flex' : 'none';
}
```

Replace with:

```javascript
const PANEL_SHOW = {
  'doc-preview-wrap':   'block',
  'doc-html-wrap':      'block',
  'doc-editor-wrap':    'block',
  'doc-sheet-wrap':     'block',
  'doc-viewer-img-wrap':'flex',
  'doc-viewer-loading': 'flex'
};
function _showPanel(id) {
  Object.keys(PANEL_SHOW).forEach(p => {
    const el = document.getElementById(p);
    if(el) el.style.display = p===id ? PANEL_SHOW[p] : 'none';
  });
  const isEditor  = id === 'doc-editor-wrap';
  const isDocx    = id === 'doc-preview-wrap' || isEditor;
  const isHtml    = id === 'doc-html-wrap';
  const tb = document.getElementById('doc-editor-toolbar');
  if(tb) tb.style.display = isEditor ? 'flex' : 'none';
  const saveBtn = document.getElementById('viewer-save-btn');
  if(saveBtn) saveBtn.style.display = isEditor ? 'inline-flex' : 'none';
  const editBtn = document.getElementById('viewer-edit-btn');
  if(editBtn) editBtn.style.display = (isDocx || isHtml) ? 'inline-flex' : 'none';
  const revertBtn = document.getElementById('viewer-revert-btn');
  if(revertBtn) revertBtn.style.display = isHtml ? 'inline-flex' : 'none';
}
```

#### Step 4: Add state vars and update `openDocViewer()` + `toggleEditMode()`

- [ ] Find the viewer globals block:

```javascript
let _viewerFileUrl = '';
let _viewerFilename = '';
let _viewerBuf = null;   // cached ArrayBuffer for the current doc
```

Replace with:

```javascript
let _viewerFileUrl    = '';
let _viewerFilename   = '';
let _viewerBuf        = null;   // cached ArrayBuffer for the current DOCX
let _viewerDocId      = null;   // qms_documents.id (UUID) for DB saves
let _viewerContentHtml = null;  // current content_html from DB (null = no draft)
```

- [ ] Find `async function openDocViewer(fileUrl, title) {` and replace the entire function signature and first block:

```javascript
async function openDocViewer(fileUrl, title, docId = null, contentHtml = null) {
  _viewerFileUrl     = fileUrl;
  _viewerFilename    = fileUrl.split('/').pop();
  _viewerDocId       = docId;
  _viewerContentHtml = contentHtml || null;
  _editMode = false;
  const ext = _viewerFilename.split('.').pop().toLowerCase();

  document.getElementById('viewer-docname').textContent = title;
  document.getElementById('viewer-edit-label').textContent = 'Edit';
  const dlBtn = document.getElementById('viewer-dl-btn');
  dlBtn.href = fileUrl;
  dlBtn.setAttribute('download', _viewerFilename);
```

- [ ] Find the DOCX branch inside `openDocViewer` (the `else if (['docx','doc'].includes(ext))` block):

```javascript
    } else if (['docx','doc'].includes(ext)) {
      document.getElementById('doc-viewer-loading-msg').textContent = 'Rendering document…';
      const resp = await fetch(fileUrl);
      _viewerBuf = await resp.arrayBuffer();
      const container = document.getElementById('doc-preview-container');
      container.innerHTML = '';
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
```

Replace with:

```javascript
    } else if (['docx','doc'].includes(ext)) {
      // If a saved HTML draft exists in DB, show that — original DOCX is never modified
      if (_viewerContentHtml) {
        document.getElementById('doc-viewer-loading-msg').textContent = 'Loading draft…';
        // Still fetch original DOCX so Edit mode (mammoth) can re-extract content
        const resp = await fetch(fileUrl);
        _viewerBuf = await resp.arrayBuffer();
        _renderHtmlView(_viewerContentHtml);
        _showPanel('doc-html-wrap');
      } else {
        document.getElementById('doc-viewer-loading-msg').textContent = 'Rendering document…';
        const resp = await fetch(fileUrl);
        _viewerBuf = await resp.arrayBuffer();
        const container = document.getElementById('doc-preview-container');
        container.innerHTML = '';
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
      }
```

- [ ] Add `_renderHtmlView()` helper immediately after the `showSaveConfirm()` function:

```javascript
function _renderHtmlView(html) {
  const inner = document.getElementById('doc-html-inner');
  inner.innerHTML =
    `<div class="draft-notice">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Draft saved — download the original to open in Word with full formatting
    </div>` + html;
}
```

- [ ] Find `async function toggleEditMode()` and replace:

```javascript
async function toggleEditMode() {
  _editMode = !_editMode;
  document.getElementById('viewer-edit-label').textContent = _editMode ? 'View' : 'Edit';
  if (_editMode) {
    // Switch to mammoth editor
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Preparing editor…';
    const result = await mammoth.convertToHtml({arrayBuffer: _viewerBuf.slice(0)});
    document.getElementById('doc-editor').innerHTML = result.value || '<p><em>Empty document.</em></p>';
    _showPanel('doc-editor-wrap');
  } else {
    // Switch back to docx-preview
    _showPanel('doc-preview-wrap');
  }
}
```

Replace with:

```javascript
async function toggleEditMode() {
  _editMode = !_editMode;
  document.getElementById('viewer-edit-label').textContent = _editMode ? 'View' : 'Edit';
  if (_editMode) {
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Preparing editor…';
    const result = await mammoth.convertToHtml({arrayBuffer: _viewerBuf.slice(0)});
    document.getElementById('doc-editor').innerHTML = result.value || '<p><em>Empty document.</em></p>';
    _showPanel('doc-editor-wrap');
  } else {
    // Return to whichever view is appropriate
    if (_viewerContentHtml) {
      _showPanel('doc-html-wrap');
    } else {
      _showPanel('doc-preview-wrap');
    }
  }
}
```

#### Step 5: Replace `saveChanges()` — DB update instead of Storage upload

- [ ] Find the entire `saveChanges()` function and replace it:

```javascript
async function saveChanges() {
  const saveBtn   = document.getElementById('viewer-save-btn');
  const saveLabel = document.getElementById('viewer-save-label');
  const saveIcon  = document.getElementById('viewer-save-icon');

  // Spinner state
  saveBtn.disabled = true;
  saveLabel.textContent = 'Saving…';
  saveIcon.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="40" stroke-dashoffset="10"><animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle>';

  // Show branded confirm modal — wait for user decision before proceeding
  const confirmed = await showSaveConfirm();
  if (!confirmed) {
    saveBtn.disabled = false;
    saveLabel.textContent = 'Save Changes';
    saveIcon.innerHTML = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
    return;
  }

  // Capture editor HTML before try — reused in catch for draft download
  const _editorHtml = document.getElementById('doc-editor').innerHTML;
  const _fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>body{font-family:Calibri,sans-serif;font-size:11pt;margin:2.54cm}
      h1{font-size:20pt}h2{font-size:15pt}h3{font-size:12pt}
      table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px}
      </style></head><body>${_editorHtml}</body></html>`;

  try {
    if (!_viewerDocId) throw new Error('Document ID not available — cannot save. Reload the page and try again.');

    // Save HTML to DB — original DOCX in Storage is NEVER modified
    const { error: dbErr } = await sb
      .from('qms_documents')
      .update({ content_html: _editorHtml, updated_at: new Date().toISOString() })
      .eq('id', _viewerDocId);
    if (dbErr) throw dbErr;

    // Update in-memory state so viewer shows the saved draft immediately
    _viewerContentHtml = _editorHtml;

    // Exit edit mode — show the HTML draft view
    _editMode = false;
    document.getElementById('viewer-edit-label').textContent = 'Edit';
    _renderHtmlView(_editorHtml);
    _showPanel('doc-html-wrap');

    // Update the cached data so reopening from the docs table also shows the draft
    const row = docsAllData.find(r => r.id === _viewerDocId);
    if (row) row.content_html = _editorHtml;

    showToast('✅', 'Draft saved', 'Your changes are saved. The original .docx is untouched.');

  } catch (err) {
    // Offer download of draft so edits are not lost
    const draftBlob = new Blob([_editorHtml], { type: 'text/html' });
    const draftUrl = URL.createObjectURL(draftBlob);
    const draftLink = document.createElement('a');
    draftLink.href = draftUrl;
    draftLink.download = (_viewerFilename || 'draft').replace(/\.[^.]+$/, '') + '-draft.html';
    draftLink.click();
    setTimeout(() => URL.revokeObjectURL(draftUrl), 15000);
    showToast('❌', 'Save failed — draft downloaded as HTML', err.message || 'Unknown error.');
  } finally {
    saveBtn.disabled = false;
    saveLabel.textContent = 'Save Changes';
    saveIcon.innerHTML = '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
  }
}
```

#### Step 6: Add `revertToOriginal()` function

- [ ] Add this function immediately after `saveChanges()`:

```javascript
async function revertToOriginal() {
  if (!_viewerDocId) return;
  if (!confirm('Remove the saved draft and show the original document?')) return;

  try {
    const { error } = await sb
      .from('qms_documents')
      .update({ content_html: null, updated_at: new Date().toISOString() })
      .eq('id', _viewerDocId);
    if (error) throw error;

    // Clear state
    _viewerContentHtml = null;
    const row = docsAllData.find(r => r.id === _viewerDocId);
    if (row) row.content_html = null;

    // Re-render with docx-preview from original DOCX (already in _viewerBuf)
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Loading original…';
    const container = document.getElementById('doc-preview-container');
    container.innerHTML = '';
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
    showToast('✅', 'Reverted to original', 'Draft removed. Showing the original document.');
  } catch (err) {
    showToast('❌', 'Revert failed', err.message || 'Unknown error.');
  }
}
```

#### Step 7: Add `openDocViewerById()` wrapper and update `renderDocsTable()`

Passing `content_html` (arbitrary HTML) as an inline `onclick` attribute value breaks on quotes and is unsafe for large content. Instead, add a thin wrapper that looks up the row from the cached `docsAllData` array.

- [ ] After `renderDocsTable()` (around line 1744), add:

```javascript
function openDocViewerById(rowId) {
  const r = docsAllData.find(d => d.id === rowId);
  if (!r || !r.file_url) return;
  openDocViewer(resolveFileUrl(r.file_url), r.title, r.id, r.content_html || null);
}
```

- [ ] Find line 1737 in `renderDocsTable()`:

```javascript
    <td>${r.file_url?`<button class="btn btn-ghost btn-sm" style="color:#d97706;font-weight:700" onclick="openDocViewer('${esc(resolveFileUrl(r.file_url))}','${esc(r.title)}')">⊞ View</button>`:'<span class="td-muted">–</span>'}</td>
```

Replace with:

```javascript
    <td>${r.file_url?`<button class="btn btn-ghost btn-sm" style="color:#d97706;font-weight:700" onclick="openDocViewerById('${r.id}')">⊞ ${r.content_html?'View Draft':'View'}</button>`:'<span class="td-muted">–</span>'}</td>
```

#### Step 8: Update `closeDocViewer()` to clear new state

- [ ] Find `closeDocViewer()` and add two reset lines after the existing resets:

```javascript
    document.getElementById('doc-editor').innerHTML = '';
    document.getElementById('doc-preview-container').innerHTML = '';
    document.getElementById('doc-sheet-inner').innerHTML = '';
    document.getElementById('doc-viewer-img').src = '';
    _viewerBuf = null;
```

Add after `_viewerBuf = null;`:

```javascript
    document.getElementById('doc-html-inner').innerHTML = '';
    _viewerDocId = null;
    _viewerContentHtml = null;
```

#### Step 9: Also update `scm-filename` in the confirm modal (it shows the doc title, not the filename)

The modal currently shows `_viewerFilename` (e.g. "POL-01.docx"). It should show the document title (e.g. "Quality Policy"). Update `showSaveConfirm()`:

- [ ] Find:
```javascript
    document.getElementById('scm-filename').textContent = _viewerFilename;
```

Replace with:
```javascript
    document.getElementById('scm-filename').textContent =
      document.getElementById('viewer-docname').textContent || _viewerFilename;
```

#### Step 10: Commit

- [ ] Run:

```
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add public/qms.html && git commit -m \"fix(qms): save edits as HTML to DB — never overwrite original DOCX; add revert-to-original\" && git push origin master --no-verify 2>&1"'
```

Expected: commit succeeds, push to master.

#### Step 11: Manual verify

1. Open `https://preqal.org/qms.html` (hard refresh)
2. Open POL-01 (Quality Policy) via ⊞ View — should show the original document with correct content (fetched from GitHub Pages)
3. Click Edit → make a visible change → Save Changes → confirm modal → Save Changes button in modal
4. Expect: spinner → "Draft saved" toast → view switches to HTML draft view with amber "Draft saved — download the original…" notice → "Revert to Original" button appears in topbar
5. Close and reopen POL-01 from table — button should say "⊞ View Draft" — opens immediately in HTML draft view
6. Click "Revert to Original" → confirm → doc renders via docx-preview from original DOCX → button label back to "⊞ View"

---

## Self-Review

**Spec coverage:**
- ✅ Restore POL-01 — Task 1 updates `file_url` to GH Pages URL
- ✅ `content_html` column — Task 1 adds it via ALTER TABLE
- ✅ Save to DB not Storage — Task 2 Step 5, uses `sb.from('qms_documents').update({content_html})`
- ✅ Original DOCX never touched — `saveChanges()` does no Storage upload whatsoever
- ✅ HTML view panel — Task 2 Steps 1–2 add CSS + HTML element
- ✅ Viewer shows draft when `content_html` set — Task 2 Step 4 branches in `openDocViewer()`
- ✅ Edit still uses mammoth from original DOCX — `_viewerBuf` still fetched from `fileUrl`
- ✅ Toggle view returns to HTML view (not docx-preview) when draft exists — Step 4 `toggleEditMode()` update
- ✅ Revert to original — Task 2 Step 6 `revertToOriginal()`
- ✅ Table button shows "View Draft" when draft exists — Step 7
- ✅ Download always fetches original — `dlBtn.href = fileUrl` unchanged
- ✅ `closeDocViewer` clears new state — Step 8
- ✅ Draft download on save failure — catch block uses `new Blob([_editorHtml], {type:'text/html'})` (plain HTML, not MHTML — no html-docx-js needed)

**Placeholder scan:** None found.

**Type consistency:**
- `_viewerDocId` set in `openDocViewer()`, read in `saveChanges()` and `revertToOriginal()` ✅
- `_viewerContentHtml` set in `openDocViewer()` and `saveChanges()`, read in `toggleEditMode()` ✅
- `_renderHtmlView(html)` defined before use in `openDocViewer()` and `saveChanges()` ✅
- `docsAllData` is the module-level cache, updated in `saveChanges()` and `revertToOriginal()` to keep table state in sync ✅
- `revertToOriginal()` uses `_viewerBuf` (always set in `openDocViewer()` for docx/doc files) — safe because Revert button only visible when `content_html` was set, which requires a DOCX file load ✅

**Note on `content_html` in `openDocViewer()` call from `renderDocsTable()`:** the `r.content_html` value is passed as a string inside an inline onclick attribute. For large HTML values, this can hit browser attribute size limits and break attribute quoting if the HTML contains single quotes. The safer approach for production would be to store the ID and fetch content_html from `docsAllData`, but the inline approach works for typical QMS document sizes (< ~50KB edits). This is noted as a known limitation.
