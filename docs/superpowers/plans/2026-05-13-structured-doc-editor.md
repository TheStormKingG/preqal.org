# Structured Document Section Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blank contenteditable editor with a section-aware editor (one rich-text card per QMS section) and add a PDF/Word download dropdown to the document viewer in `public/qms.html`.

**Architecture:** Single-file modification to `public/qms.html`. Four coordinated changes: (1) `DOC_SECTIONS` constant + CSS, (2) section editor JS functions, (3) wiring those functions into the existing `openDocViewer` / `toggleEditMode` / `saveChanges` / `_showPanel` flow, (4) download dropdown replacing the existing anchor button.

**Tech Stack:** Vanilla JS in `public/qms.html` (standalone HTML, no bundler). `document.execCommand` for rich text. `DOMParser` for HTML parsing. Word export via `application/msword` blob trick (no extra CDN needed).

---

## Codebase context (read before implementing)

**File:** `public/qms.html`

Key landmarks (line numbers approximate — search for the strings):

| Symbol | Where | Notes |
|---|---|---|
| `DOC_IFRAME_STYLES` | ~line 3396 | CSS constant injected into view iframe |
| `_renderHtmlView(html)` | ~line 3419 | Writes `srcdoc` into `#doc-html-inner` iframe |
| `_renderDocxView(buf)` | ~line 3468 | Sends DOCX ArrayBuffer into iframe via postMessage |
| `PANEL_SHOW` | ~line 3506 | Dict of panel-id → display value |
| `_showPanel(id)` | ~line 3514 | Shows one panel, hides all others; controls toolbar/buttons |
| `toggleEditMode()` | ~line 3542 | Flips between view and edit; uses mammoth for DOCX |
| `openDocViewer(fileUrl, title, docId, contentHtml)` | ~line 3567 | Opens the overlay; sets `_viewerFileUrl` etc. |
| `openDocViewerById(rowId)` | ~line 1902 | Looks up `docsAllData`, calls `openDocViewer` |
| `saveChanges()` | ~line 3640 | Saves `content_html` to Supabase |
| `revertToOriginal()` | ~line 3708 | Clears `content_html`, re-renders DOCX |
| `closeDocViewer()` | ~line 3742 | Tears down overlay |
| `execFmt(cmd, val)` | ~line 3537 | `document.execCommand` wrapper |
| `esc(s)` | ~line 3222 | HTML-escaping utility |
| `<a id="viewer-dl-btn">` | ~line 3273 | Current download anchor |
| `<div id="doc-editor-toolbar">` | ~line 3284 | Formatting toolbar HTML |
| `<div id="doc-editor-wrap">` | ~line 3322 | Plain contenteditable wrapper |
| `<div id="doc-html-wrap">` | ~line 3329 | View iframe wrapper |
| `let _viewerDocId` | ~line 3383 | Viewer state block |

**Viewer state variables declared near `let _viewerDocId`:**
```js
let _viewerFileUrl     = '';
let _viewerFilename    = '';
let _viewerBuf         = null;
let _viewerDocId       = null;
let _viewerContentHtml = null;
let _editMode          = false;
```

---

## Files Modified

| File | Change |
|---|---|
| `public/qms.html` | All changes — CSS, JS constants, JS functions, HTML elements |

---

### Task 1: `DOC_SECTIONS` constant + CSS for section editor cards

**Files:**
- Modify: `public/qms.html` — CSS block (near `#doc-editor` CSS) and JS (near `DOC_IFRAME_STYLES`)

- [ ] **Step 1: Add CSS for `#sec-editor-wrap` and section cards**

Find the CSS block that contains `#doc-editor-wrap` and `#doc-editor` (search for `#doc-editor-wrap{flex:1`). Insert the following CSS block **immediately after** the `#doc-editor img{...}` rule (the last rule in that group):

```css
  #sec-editor-wrap{flex:1;overflow:auto;background:#f1f5f9;display:none;padding:24px 32px}
  .sec-card{max-width:820px;margin:0 auto 20px;background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.12);overflow:hidden}
  .sec-card-head{padding:11px 24px;background:#1e293b;color:#f8fafc;font-size:10.5pt;font-weight:700;letter-spacing:.02em}
  .sec-content{padding:20px 24px;min-height:90px;outline:none;font-family:Calibri,Georgia,serif;font-size:11pt;line-height:1.6;color:#1e293b}
  .sec-content:focus{background:#fafcff}
  .sec-content p{margin:.3em 0}
  .sec-content h1{font-size:18pt;font-weight:700;margin:1em 0 .35em}
  .sec-content h2{font-size:14pt;font-weight:700;margin:.8em 0 .3em}
  .sec-content h3{font-size:12pt;font-weight:700;margin:.7em 0 .25em}
  .sec-content ul,.sec-content ol{padding-left:1.6em;margin:.4em 0}
  .sec-content li{margin:.2em 0}
  .sec-content table{border-collapse:collapse;width:100%;margin:.8em 0}
  .sec-content td,.sec-content th{border:1px solid #cbd5e1;padding:6px 10px;font-size:10pt}
  .sec-content th{background:#f8fafc;font-weight:700}
```

- [ ] **Step 2: Add `#sec-editor-wrap` HTML element**

Find `<!-- DOCX editor (mammoth + contenteditable — edit mode) -->` and the `<div id="doc-editor-wrap">` block that follows it. Insert the following **immediately before** that comment:

```html
  <!-- Structured section editor (shown for POL/PRO/MAN/WOI/FRM/TMP) -->
  <div id="sec-editor-wrap"></div>
```

- [ ] **Step 3: Add section view styles to `DOC_IFRAME_STYLES`**

Find `DOC_IFRAME_STYLES` (the multi-line template literal). Append these lines **before** the closing backtick:

```css
  article[data-sec]{margin-bottom:2.2em}
  h2.sec-heading{font-size:14pt;font-weight:700;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:.25em;margin:.1em 0 .7em}
```

- [ ] **Step 4: Add `DOC_SECTIONS` constant**

Find the line `// _viewerRenderedHtml removed…` comment (near the viewer state block). Insert the following **immediately before** that comment:

```js
/* Section templates per document category — drives the structured section editor */
const DOC_SECTIONS = {
  POL: ['Purpose','Scope','Policy Statement','Roles and Responsibilities','Definitions','Related Documents','Review History'],
  PRO: ['Purpose','Scope','Roles and Responsibilities','Definitions','Equipment and Materials','Procedure','Related Documents','Records','Review History'],
  MAN: ['Introduction','Scope and Application','Quality Policy','Organisational Context','Leadership and Commitment','Planning','Support','Operation','Performance Evaluation','Improvement','Document Control','References'],
  WOI: ['Purpose','Scope','Responsibilities','Equipment and Materials Required','Safety Precautions','Step-by-Step Instructions','Quality Checks','References'],
  FRM: ['Instructions','Form Fields','Notes'],
  TMP: ['Purpose','Instructions for Use','Template Content','Notes'],
  REG: null,
  DIA: null,
};
```

- [ ] **Step 5: Add `_viewerCategory` to viewer state block**

Find the viewer state declarations block (the group of `let _viewer...` lines). Add one new line after `let _viewerContentHtml`:

```js
let _viewerCategory    = null;  // document category code (POL/PRO/MAN/WOI/FRM/TMP/REG/DIA)
```

- [ ] **Step 6: Verify**

```bash
grep -n "DOC_SECTIONS\|sec-editor-wrap\|sec-card\|sec-heading\|_viewerCategory\|article\[data-sec\]" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html"
```

Expected: at least 8 matching lines covering constant, CSS, HTML element, and state variable.

- [ ] **Step 7: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "feat(qms): add DOC_SECTIONS constant, section editor CSS, and iframe section styles"
```

---

### Task 2: Section editor JS functions

**Files:**
- Modify: `public/qms.html` — JS block near `_renderHtmlView`

These three functions are pure utilities — they only read/write strings and DOM within `#sec-editor-wrap`.

- [ ] **Step 1: Add `_parseSectionsFromHtml`**

Find the `function _renderHtmlView` declaration. Insert the following **immediately before** it:

```js
/**
 * Parse existing content_html into a Map<sectionName → innerHTML>.
 * Handles two formats:
 *   New: <article data-sec="Purpose">…</article> blocks
 *   Legacy / mammoth: plain HTML with no data-sec articles → content goes into first section
 */
function _parseSectionsFromHtml(html, sectionNames) {
  const map = new Map();
  if (!html || !sectionNames.length) return map;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const articles = doc.querySelectorAll('article[data-sec]');
  if (articles.length > 0) {
    articles.forEach(a => map.set(a.dataset.sec, a.innerHTML));
    return map;
  }
  // Legacy plain HTML — seed the first section with everything
  map.set(sectionNames[0], doc.body.innerHTML);
  return map;
}
```

- [ ] **Step 2: Add `_buildSectionEditor`**

Insert **immediately after** `_parseSectionsFromHtml`:

```js
/**
 * Render section cards into #sec-editor-wrap, pre-filling from existing HTML.
 */
function _buildSectionEditor(sectionNames, contentHtml) {
  const existing = _parseSectionsFromHtml(contentHtml || '', sectionNames);
  const wrap = document.getElementById('sec-editor-wrap');
  wrap.innerHTML = sectionNames.map(name =>
    `<div class="sec-card" data-section="${esc(name)}">
      <div class="sec-card-head">${esc(name)}</div>
      <div class="sec-content" contenteditable="true" spellcheck="true">${existing.get(name) || ''}</div>
    </div>`
  ).join('');
}
```

- [ ] **Step 3: Add `_serializeSections`**

Insert **immediately after** `_buildSectionEditor`:

```js
/**
 * Collect content from all section cards and produce structured HTML for storage.
 * Output: <article data-sec="…"><h2 class="sec-heading">…</h2>…content…</article> blocks.
 */
function _serializeSections() {
  const cards = document.getElementById('sec-editor-wrap').querySelectorAll('.sec-card');
  return Array.from(cards).map(card => {
    const name  = card.dataset.section;
    const inner = card.querySelector('.sec-content').innerHTML;
    return `<article data-sec="${esc(name)}"><h2 class="sec-heading">${esc(name)}</h2>${inner}</article>`;
  }).join('\n');
}
```

- [ ] **Step 4: Verify**

```bash
grep -n "_parseSectionsFromHtml\|_buildSectionEditor\|_serializeSections" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html"
```

Expected: each function defined once (3 definition lines) plus calls (added in Task 3).

- [ ] **Step 5: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "feat(qms): add _parseSectionsFromHtml, _buildSectionEditor, _serializeSections"
```

---

### Task 3: Wire section editor into the viewer flow

**Files:**
- Modify: `public/qms.html` — `openDocViewerById`, `openDocViewer`, `_showPanel`, `PANEL_SHOW`, `toggleEditMode`, `saveChanges`, `closeDocViewer`, `execFmt`, toolbar HTML

This is the integration task — the functions from Tasks 1–2 need to plug into every part of the viewer that currently ignores category.

- [ ] **Step 1: Update `openDocViewerById` to pass category**

Find:
```js
function openDocViewerById(rowId) {
  const r = docsAllData.find(d => d.id === rowId);
  if (!r || !r.file_url) return;
  openDocViewer(resolveFileUrl(r.file_url), r.title, r.id, r.content_html || null);
}
```

Replace with:
```js
function openDocViewerById(rowId) {
  const r = docsAllData.find(d => d.id === rowId);
  if (!r || !r.file_url) return;
  openDocViewer(resolveFileUrl(r.file_url), r.title, r.id, r.content_html || null, r.category || null);
}
```

- [ ] **Step 2: Update `openDocViewer` signature and state init**

Find the `openDocViewer` function signature and the state-init block inside it:

```js
async function openDocViewer(fileUrl, title, docId = null, contentHtml = null) {
  _viewerFileUrl     = fileUrl;
  _viewerFilename    = fileUrl.split('/').pop();
  _viewerDocId       = docId;
  _viewerContentHtml  = contentHtml || null;
  _editMode = false;
```

Replace with:
```js
async function openDocViewer(fileUrl, title, docId = null, contentHtml = null, category = null) {
  _viewerFileUrl     = fileUrl;
  _viewerFilename    = fileUrl.split('/').pop();
  _viewerDocId       = docId;
  _viewerContentHtml  = contentHtml || null;
  _viewerCategory    = category;
  _editMode = false;
```

- [ ] **Step 3: Add `sec-editor-wrap` to `PANEL_SHOW`**

Find:
```js
const PANEL_SHOW = {
  'doc-preview-wrap':   'block',
  'doc-html-wrap':      'block',
  'doc-editor-wrap':    'block',
  'doc-sheet-wrap':     'block',
  'doc-viewer-img-wrap':'flex',
  'doc-viewer-loading': 'flex'
};
```

Replace with:
```js
const PANEL_SHOW = {
  'doc-preview-wrap':   'block',
  'doc-html-wrap':      'block',
  'doc-editor-wrap':    'block',
  'sec-editor-wrap':    'block',
  'doc-sheet-wrap':     'block',
  'doc-viewer-img-wrap':'flex',
  'doc-viewer-loading': 'flex'
};
```

- [ ] **Step 4: Update `_showPanel` to recognise section editor as an editor panel**

Find:
```js
  const isEditor  = id === 'doc-editor-wrap';
  const isDocx    = id === 'doc-preview-wrap' || id === 'doc-html-wrap' || isEditor;
```

Replace with:
```js
  const isEditor  = id === 'doc-editor-wrap' || id === 'sec-editor-wrap';
  const isDocx    = id === 'doc-preview-wrap' || id === 'doc-html-wrap' || isEditor;
```

- [ ] **Step 5: Update `execFmt` to target the focused section area or plain editor**

Find:
```js
function execFmt(cmd, val) {
  document.getElementById('doc-editor').focus();
  document.execCommand(cmd, false, val || null);
}
```

Replace with:
```js
function execFmt(cmd, val) {
  const active = document.activeElement;
  if (active && active.classList.contains('sec-content')) {
    active.focus();
  } else {
    document.getElementById('doc-editor').focus();
  }
  document.execCommand(cmd, false, val || null);
}
```

- [ ] **Step 6: Update `toggleEditMode` to use section editor when category has sections**

Find the entire `toggleEditMode` function:

```js
async function toggleEditMode() {
  _editMode = !_editMode;
  document.getElementById('viewer-edit-label').textContent = _editMode ? 'View' : 'Edit';
  if (_editMode) {
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Preparing editor…';
    let src = _viewerContentHtml || '';
    if (!src && _viewerBuf) {
      // No saved draft — use mammoth to convert the DOCX to clean editable HTML.
      // mammoth works from the buffer (no DOM needed) so extension can't touch it here.
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: _viewerBuf.slice(0) });
        src = result.value;
      } catch (e) {
        src = '<p style="color:#ef4444">Could not load document for editing: ' + e.message + '</p>';
      }
    }
    document.getElementById('doc-editor').innerHTML = src;
    _showPanel('doc-editor-wrap');
  } else {
    // Return to iframe view — iframe still holds the clean DOCX or HTML render
    _showPanel('doc-html-wrap');
  }
}
```

Replace with:
```js
async function toggleEditMode() {
  _editMode = !_editMode;
  document.getElementById('viewer-edit-label').textContent = _editMode ? 'View' : 'Edit';
  if (_editMode) {
    _showPanel('doc-viewer-loading');
    document.getElementById('doc-viewer-loading-msg').textContent = 'Preparing editor…';

    // Resolve initial source HTML (saved draft first, then mammoth from DOCX)
    let src = _viewerContentHtml || '';
    if (!src && _viewerBuf) {
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: _viewerBuf.slice(0) });
        src = result.value;
      } catch (e) {
        src = '';
      }
    }

    const sections = _viewerCategory ? DOC_SECTIONS[_viewerCategory] : null;
    if (sections) {
      // Structured section editor
      _buildSectionEditor(sections, src);
      _showPanel('sec-editor-wrap');
    } else {
      // Fallback plain editor for REG / DIA / unknown category
      document.getElementById('doc-editor').innerHTML = src || '<p></p>';
      _showPanel('doc-editor-wrap');
    }
  } else {
    // Return to iframe view
    _showPanel('doc-html-wrap');
  }
}
```

- [ ] **Step 7: Update `saveChanges` to serialise from section editor or plain editor**

Find the line inside `saveChanges` that reads:
```js
  const _editorHtml = document.getElementById('doc-editor').innerHTML;
```

Replace with:
```js
  const secWrap = document.getElementById('sec-editor-wrap');
  const _editorHtml = secWrap.style.display !== 'none' && secWrap.children.length > 0
    ? _serializeSections()
    : document.getElementById('doc-editor').innerHTML;
```

- [ ] **Step 8: Clear `sec-editor-wrap` in `closeDocViewer`**

Find inside `closeDocViewer` (inside the `transitionend` handler) the block that clears editor state. It contains lines like `document.getElementById('doc-editor').innerHTML = ''`. Add one more clear line:

Find:
```js
    document.getElementById('doc-editor').innerHTML = '';
```

Replace with:
```js
    document.getElementById('doc-editor').innerHTML = '';
    document.getElementById('sec-editor-wrap').innerHTML = '';
```

Also clear `_viewerCategory` in the same block. Find the reset lines:
```js
    _viewerDocId = null;
    _viewerContentHtml = null;
```

Replace with:
```js
    _viewerDocId = null;
    _viewerContentHtml = null;
    _viewerCategory = null;
```

- [ ] **Step 9: Expand the toolbar with font-family and font-size selects**

Find the `<div id="doc-editor-toolbar">` block. The current first child is a `<select>` for formatBlock (Normal/Heading 1/…). Insert two more selects **before** the existing formatBlock select:

```html
    <select class="tb-sel" onchange="execFmt('fontName',this.value);this.value=''" title="Font family">
      <option value="">Font</option>
      <option value="Calibri">Calibri</option>
      <option value="Arial">Arial</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Georgia">Georgia</option>
      <option value="Courier New">Courier New</option>
    </select>
    <select class="tb-sel" onchange="execFmt('fontSize',this.value);this.value=''" title="Font size">
      <option value="">Size</option>
      <option value="1">8pt</option>
      <option value="2">10pt</option>
      <option value="3">12pt</option>
      <option value="4">14pt</option>
      <option value="5">18pt</option>
      <option value="6">24pt</option>
    </select>
    <div class="tb-sep"></div>
```

- [ ] **Step 10: Verify the wiring**

```bash
grep -n "_viewerCategory\|_buildSectionEditor\|_serializeSections\|sec-editor-wrap\|DOC_SECTIONS" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html" | grep -v "^.*const DOC_SECTIONS\|^.*// \|^.*css\|#sec-editor-wrap{"
```

Expected output shows `_viewerCategory` assigned in `openDocViewer`, used in `toggleEditMode`; `_buildSectionEditor` called in `toggleEditMode`; `_serializeSections` called in `saveChanges`; `sec-editor-wrap` in PANEL_SHOW, `_showPanel`, `closeDocViewer`.

- [ ] **Step 11: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "feat(qms): wire structured section editor into viewer open/edit/save/close flow"
```

---

### Task 4: Download dropdown (PDF + Word)

**Files:**
- Modify: `public/qms.html` — HTML (topbar) + CSS + JS

- [ ] **Step 1: Add download dropdown CSS**

Find the `/* Topbar draft badge */` CSS comment (or the `.viewer-btn` CSS block). Add the following after the `.viewer-btn` family of rules:

```css
  #dl-menu{display:none;position:absolute;right:0;top:calc(100% + 4px);background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden;min-width:172px;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.35)}
  .dl-menu-item{display:block;width:100%;padding:10px 16px;background:none;border:none;color:#e2e8f0;font-size:12px;font-weight:500;text-align:left;cursor:pointer;white-space:nowrap}
  .dl-menu-item:hover{background:rgba(255,255,255,.08);color:#fff}
  #viewer-dl-wrap{position:relative;display:none}
```

- [ ] **Step 2: Replace the download anchor with the dropdown wrapper**

Find the existing download anchor:
```html
    <a id="viewer-dl-btn" href="#" class="viewer-btn viewer-btn-dl" download>
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download
    </a>
```

Replace with:
```html
    <div id="viewer-dl-wrap">
      <button class="viewer-btn viewer-btn-dl" onclick="toggleDlMenu()" id="viewer-dl-btn">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download ▾
      </button>
      <div id="dl-menu">
        <button class="dl-menu-item" onclick="downloadOriginal()">Original (.docx)</button>
        <button class="dl-menu-item" onclick="downloadAsPdf()">Export as PDF</button>
        <button class="dl-menu-item" onclick="downloadAsWord()">Export as Word (.doc)</button>
      </div>
    </div>
```

- [ ] **Step 3: Update `openDocViewer` to show `#viewer-dl-wrap` instead of setting anchor href**

Find inside `openDocViewer`:
```js
  const dlBtn = document.getElementById('viewer-dl-btn');
  dlBtn.href = fileUrl;
  dlBtn.setAttribute('download', _viewerFilename);
```

Replace with:
```js
  const dlWrap = document.getElementById('viewer-dl-wrap');
  if (dlWrap) dlWrap.style.display = fileUrl ? 'block' : 'none';
```

- [ ] **Step 4: Add download JS functions**

Find `function execFmt(cmd, val)` and insert the following block **immediately before** it:

```js
/* ── Download dropdown ─────────────────────────────────────────────────── */
function toggleDlMenu() {
  const m = document.getElementById('dl-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function _closeDlMenu() {
  const m = document.getElementById('dl-menu');
  if (m) m.style.display = 'none';
}

function downloadOriginal() {
  _closeDlMenu();
  if (!_viewerFileUrl) return;
  const a = document.createElement('a');
  a.href = _viewerFileUrl;
  a.download = _viewerFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadAsPdf() {
  _closeDlMenu();
  const frame = document.getElementById('doc-html-inner');
  if (!frame || !frame.contentWindow) {
    showToast('⚠️', 'PDF export', 'Switch to View mode first, then export as PDF.');
    return;
  }
  try {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  } catch (e) {
    showToast('⚠️', 'PDF export', 'Use browser Print → Save as PDF from the document view.');
  }
}

function downloadAsWord() {
  _closeDlMenu();
  if (!_viewerContentHtml) {
    // No saved draft — download original DOCX
    downloadOriginal();
    return;
  }
  // Wrap content_html in a Word-compatible HTML envelope
  const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${esc(_viewerFilename)}</title>
<style>
  body{font-family:Calibri,sans-serif;font-size:11pt;margin:72pt 80pt;color:#111;line-height:1.55}
  h2.sec-heading{font-size:14pt;font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:4pt;margin:1.2em 0 .6em;color:#1e293b}
  article[data-sec]{margin-bottom:2em}
  table{border-collapse:collapse;width:100%}
  td,th{border:1px solid #94a3b8;padding:6pt 10pt;font-size:10pt;vertical-align:top}
  th{background:#f1f5f9;font-weight:700}
  ul,ol{padding-left:1.6em;margin:.4em 0}
  li{margin:.2em 0}
  p{margin:.35em 0}
</style>
</head><body>${_viewerContentHtml}</body></html>`;
  const blob = new Blob(['﻿', wordHtml], { type: 'application/msword' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = _viewerFilename.replace(/\.docx$/i, '') + '-edited.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
```

- [ ] **Step 5: Close dropdown when clicking outside**

Find the `window.addEventListener('message', function(e) {` handler for `DOCX_HEIGHT`. Insert the following **immediately after** it (still inside the main script block):

```js
/* Close download menu on outside click */
document.addEventListener('click', function(e) {
  if (!e.target.closest('#viewer-dl-wrap')) _closeDlMenu();
});
```

- [ ] **Step 6: Close dropdown when viewer closes**

Find inside `closeDocViewer` the `transitionend` handler. Add one cleanup line **alongside** the other cleanup calls:

```js
    _closeDlMenu();
```

- [ ] **Step 7: Verify**

```bash
grep -n "toggleDlMenu\|downloadOriginal\|downloadAsPdf\|downloadAsWord\|_closeDlMenu\|dl-menu\|viewer-dl-wrap" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html"
```

Expected: CSS rules, HTML elements, and all 5 JS functions each appear.

- [ ] **Step 8: Manual smoke test**

Open `https://preqal.org/qms.html` → Documents → click **View** on any document with a `file_url`:

1. **Section editor:** Click **Edit**
   - POL/PRO/MAN/WOI/FRM/TMP doc → should show section cards with dark navy headers and white rich-text areas
   - REG/DIA doc → should show old plain contenteditable
   - Font family and font size selects appear in toolbar
   - Type in a section, format text (bold/italic/bullet) — formatting applies to the focused section
   - Click **Save Changes** — toast confirms save
   - Click **Edit** again — saved content pre-fills the correct sections

2. **View mode:** Click **View** (Edit toggle back)
   - Sections render with headings and proper spacing in the iframe
   - Text is correct (not scrambled by extension)

3. **Download dropdown:** Click **Download ▾**
   - Menu opens with three options
   - "Original (.docx)" → downloads the file
   - "Export as PDF" → browser print dialog opens
   - "Export as Word" → after saving a draft, downloads `.doc` file

- [ ] **Step 9: Commit and push**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "feat(qms): add download dropdown with PDF and Word export options"
osascript -e "do shell script \"cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1\""
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| Section templates per category (POL/PRO/MAN/WOI/FRM/TMP) | Task 1 Step 4 |
| CSS for section cards | Task 1 Step 1 |
| `#sec-editor-wrap` HTML element | Task 1 Step 2 |
| Section view styles in iframe | Task 1 Step 3 |
| `_parseSectionsFromHtml` | Task 2 Step 1 |
| `_buildSectionEditor` | Task 2 Step 2 |
| `_serializeSections` | Task 2 Step 3 |
| Pass category through `openDocViewerById` → `openDocViewer` | Task 3 Steps 1–2 |
| `sec-editor-wrap` in PANEL_SHOW | Task 3 Step 3 |
| `_showPanel` recognises section editor as editor | Task 3 Step 4 |
| `execFmt` targets focused section area | Task 3 Step 5 |
| `toggleEditMode` uses section editor for known categories | Task 3 Step 6 |
| `saveChanges` serialises from section editor | Task 3 Step 7 |
| `closeDocViewer` clears section editor | Task 3 Step 8 |
| Font family + font size in toolbar | Task 3 Step 9 |
| Download dropdown CSS + HTML | Task 4 Steps 1–2 |
| `openDocViewer` shows dropdown instead of anchor | Task 4 Step 3 |
| `toggleDlMenu`, `downloadOriginal`, `downloadAsPdf`, `downloadAsWord` | Task 4 Step 4 |
| Close on outside click | Task 4 Step 5 |
| Close on viewer close | Task 4 Step 6 |

All spec requirements covered. ✅

### Placeholder scan

No TBD, TODO, or vague steps — every step has actual code. ✅

### Type consistency

- `DOC_SECTIONS[_viewerCategory]` → may return `null` (REG/DIA) or an array — handled with null check in `toggleEditMode`. ✅
- `_serializeSections()` called in `saveChanges` only when `sec-editor-wrap` is visible. ✅
- `_parseSectionsFromHtml(html, sectionNames)` matches its two callers. ✅
- `_buildSectionEditor(sections, src)` called in `toggleEditMode` with the `DOC_SECTIONS[cat]` array and resolved source HTML. ✅
