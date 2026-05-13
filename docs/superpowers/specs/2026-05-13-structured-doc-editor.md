# Structured Document Section Editor

**Goal:** Replace the monolithic contenteditable editor with a section-aware editor that shows each document section as a labelled rich-text card, and add a download dropdown (PDF + Word) to the viewer.

**Root cause / motivation:** The current editor is a single blank `contenteditable` div — authors have no guidance on what sections a document should contain. Policies, procedures, work instructions, etc., each have a standard structure defined by ISO 9001 / ISO 45001 QMS conventions. The section editor scaffolds that structure automatically based on the document category.

---

## Document Category → Sections

| Category | Sections (in order) |
|---|---|
| **POL** — Policy | Purpose · Scope · Policy Statement · Roles and Responsibilities · Definitions · Related Documents · Review History |
| **PRO** — Procedure | Purpose · Scope · Roles and Responsibilities · Definitions · Equipment and Materials · Procedure · Related Documents · Records · Review History |
| **MAN** — Manual | Introduction · Scope and Application · Quality Policy · Organisational Context · Leadership and Commitment · Planning · Support · Operation · Performance Evaluation · Improvement · Document Control · References |
| **WOI** — Work Instruction | Purpose · Scope · Responsibilities · Equipment and Materials Required · Safety Precautions · Step-by-Step Instructions · Quality Checks · References |
| **FRM** — Form | Instructions · Form Fields · Notes |
| **TMP** — Template | Purpose · Instructions for Use · Template Content · Notes |
| **REG** — Register | *(no section editor — registers are tabular)* |
| **DIA** — Diagram | *(no section editor — diagrams are visual)* |

---

## What Changes

### Edit mode — section editor

When Edit is clicked on a DOCX/HTML document with a known category (POL, PRO, MAN, WOI, FRM, TMP):

- Hide the single `#doc-editor` contenteditable
- Show `#sec-editor-wrap` — a scrollable panel containing one **section card** per section name
- Each card: dark navy heading bar (read-only) + white `contenteditable` rich-text area below
- The existing formatting toolbar (bold, italic, underline, lists, etc.) still works — it applies to whichever section content area is focused
- Add font-family and font-size selects to the toolbar

For REG and DIA (or unknown category), fall back to the existing plain `#doc-editor` contenteditable.

**Pre-filling section content:**

- If `content_html` exists in DB: parse `article[data-sec="..."]` blocks → fill matching section content areas
- If no `content_html`: convert the DOCX buffer via mammoth → put the full HTML into the first section (backward compat)

**Backward compatibility with plain HTML:** If `content_html` has no `article[data-sec]` wrapper elements (old format or mammoth output), the full HTML goes into the first section only.

### Save — serialise sections to HTML

`saveChanges()` reads all `.sec-content` elements and produces:

```html
<article data-sec="Purpose"><h2 class="sec-heading">Purpose</h2>...user content...</article>
<article data-sec="Scope"><h2 class="sec-heading">Scope</h2>...user content...</article>
...
```

This HTML is stored in `qms_documents.content_html` (exactly as today).

### View mode — read-only iframe

No change to the rendering pipeline. The `article[data-sec]` HTML from the DB passes through `_renderHtmlView` into the sandboxed iframe. Add `article[data-sec]` + `.sec-heading` styles to `DOC_IFRAME_STYLES` so each section renders with a clear heading and spacing.

### Download dropdown

Replace the `<a id="viewer-dl-btn">` anchor with a dropdown button:

| Option | Behaviour |
|---|---|
| **Original (.docx)** | Download the original DOCX from Supabase Storage (always available) |
| **Export as PDF** | Call `frame.contentWindow.print()` on the view iframe — browser print dialog → Save as PDF |
| **Export as Word** | If `content_html` exists: generate a Word-compatible `.doc` blob from the HTML; else: download original DOCX |

---

## What Does NOT Change

- `_renderHtmlView` / `_renderDocxView` — unchanged
- Supabase save/revert/load logic — unchanged
- All other QMS sections (employees, risk, audit, etc.) — unchanged
- XLSX sheet viewer, image viewer — unchanged

---

## Data Shape

Saved `content_html` (new format):

```html
<article data-sec="Purpose"><h2 class="sec-heading">Purpose</h2><p>This policy...</p></article>
<article data-sec="Scope"><h2 class="sec-heading">Scope</h2><p>Applies to all...</p></article>
```

Backward-compat old format (plain HTML, no `article` wrappers) → still renders correctly in view mode; on re-edit it fills the first section.

---

## Files Modified

| File | Change |
|---|---|
| `public/qms.html` | Add `DOC_SECTIONS`, CSS for section cards, `_buildSectionEditor`, `_parseSectionsFromHtml`, `_serializeSections` functions; update `openDocViewer`/`openDocViewerById` to pass category; update `toggleEditMode`, `saveChanges`, `_showPanel`, `execFmt`; add download dropdown HTML + JS; update `DOC_IFRAME_STYLES` with section view styles |
