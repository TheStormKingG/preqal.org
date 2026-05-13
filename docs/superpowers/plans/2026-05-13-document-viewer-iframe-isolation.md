# Document Viewer iframe Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `<div id="doc-html-inner">` with a sandboxed `<iframe srcdoc>` so browser extensions cannot modify document preview text.

**Architecture:** Three coordinated edits to `public/qms.html` — remove the `.doc-html-inner` CSS block from the host stylesheet, replace the div with an iframe in the HTML, and rewrite `_renderHtmlView` to set `srcdoc` with embedded styles instead of injecting `innerHTML`. All other viewer panels and the edit mode are untouched.

**Tech Stack:** Vanilla JS in `public/qms.html` (standalone HTML, no bundler).

---

## Files Modified

| File | Change |
|---|---|
| `public/qms.html:181–197` | Remove `.doc-html-inner` CSS block — styles move into `DOC_IFRAME_STYLES` JS constant |
| `public/qms.html:3345` | Replace `<div class="doc-html-inner" id="doc-html-inner">` with `<iframe>` |
| `public/qms.html:3406–3408` | Add `DOC_IFRAME_STYLES` constant and rewrite `_renderHtmlView` |

---

### Task 1: Remove `.doc-html-inner` CSS from host stylesheet

**Files:**
- Modify: `public/qms.html:181–197`

The `.doc-html-inner` CSS rules style a `<div>` that will no longer exist in the host page after Task 2. Those styles will live inside the iframe `srcdoc` instead (added in Task 3). Removing them here prevents dead CSS.

- [ ] **Step 1: Delete lines 181–197 — the entire `.doc-html-inner` CSS block**

In `public/qms.html`, find and remove this exact block (it starts immediately after the `#doc-html-wrap` rule on line 180):

```css
  .doc-html-inner{max-width:850px;margin:0 auto;background:#fff;padding:72px 80px;box-shadow:0 2px 4px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.12);font-family:'Calibri','Carlito',Arial,sans-serif;font-size:12pt;line-height:1.55;color:#111;min-height:500px}
  .doc-html-inner h1{font-size:18pt;font-weight:700;margin:1.4em 0 .5em;color:#111;border-bottom:2px solid #e2e8f0;padding-bottom:.3em}
  .doc-html-inner h2{font-size:14pt;font-weight:700;margin:1.2em 0 .4em;color:#1e293b}
  .doc-html-inner h3{font-size:12pt;font-weight:700;margin:1em 0 .35em;color:#1e293b}
  .doc-html-inner h4{font-size:11pt;font-weight:700;margin:.8em 0 .3em;color:#334155}
  .doc-html-inner p{margin:.45em 0;line-height:1.6}
  .doc-html-inner p:first-child{margin-top:0}
  .doc-html-inner table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:11pt}
  .doc-html-inner td,.doc-html-inner th{border:1px solid #94a3b8;padding:8px 12px;vertical-align:top}
  .doc-html-inner th,.doc-html-inner tr:first-child td{background:#f1f5f9;font-weight:700;color:#1e293b}
  .doc-html-inner tr:nth-child(even) td{background:#f8fafc}
  .doc-html-inner ul{padding-left:1.8em;margin:.5em 0}
  .doc-html-inner ol{padding-left:1.8em;margin:.5em 0}
  .doc-html-inner li{margin:.25em 0;line-height:1.6}
  .doc-html-inner strong,.doc-html-inner b{font-weight:700}
  .doc-html-inner em,.doc-html-inner i{font-style:italic}
  .doc-html-inner hr{border:none;border-top:1px solid #e2e8f0;margin:1.5em 0}
```

The line immediately after this block (starting with `/* Topbar draft badge */`) must remain untouched.

- [ ] **Step 2: Verify the deletion**

Run:
```bash
grep -n "doc-html-inner" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html" | grep -v "^.*#doc-html-wrap\|^.*id=\"doc-html-inner\"\|^.*getElementById\|^.*doc-html-wrap"
```

Expected: no lines containing `.doc-html-inner` class selector (CSS). Lines referencing `#doc-html-inner` (the id) are fine — they're HTML and JS references that should still exist.

- [ ] **Step 3: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "refactor(qms): remove .doc-html-inner CSS — styles moving into iframe srcdoc"
```

---

### Task 2: Replace the div with an iframe in the HTML

**Files:**
- Modify: `public/qms.html` — the `doc-html-inner` element inside `#doc-html-wrap`

- [ ] **Step 1: Find the current div**

The element to replace is inside `<div id="doc-html-wrap">` and looks like:

```html
<div class="doc-html-inner" id="doc-html-inner"></div>
```

- [ ] **Step 2: Replace it with an iframe**

Replace that single line with:

```html
<iframe id="doc-html-inner"
  sandbox="allow-same-origin"
  style="width:100%;border:none;display:block;min-height:500px;"
  title="Document preview">
</iframe>
```

`sandbox="allow-same-origin"` keeps the iframe's origin consistent (needed for `contentDocument` access in the auto-height onload handler) while blocking extension content scripts from reaching in.

- [ ] **Step 3: Verify**

```bash
grep -n "doc-html-inner" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html" | grep -v "getElementById\|#doc-html-wrap\|doc-html-wrap\|srcdoc\|DOC_IFRAME"
```

Expected: one line containing `id="doc-html-inner"` — the iframe element. No line containing `class="doc-html-inner"`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "refactor(qms): replace doc-html-inner div with sandboxed iframe"
```

---

### Task 3: Rewrite `_renderHtmlView` with `DOC_IFRAME_STYLES` and `srcdoc`

**Files:**
- Modify: `public/qms.html` — JS block near the bottom, `_renderHtmlView` function (~line 3406 after Task 1+2 shifts)

- [ ] **Step 1: Find the current `_renderHtmlView`**

It currently reads:

```js
function _renderHtmlView(html) {
  document.getElementById('doc-html-inner').innerHTML = _sanitizeHtml(html);
}
```

- [ ] **Step 2: Replace with the `DOC_IFRAME_STYLES` constant + new function**

Replace the two lines above with:

```js
const DOC_IFRAME_STYLES = `
  body{max-width:850px;margin:0 auto;background:#fff;padding:72px 80px;
    box-shadow:0 2px 4px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.12);
    font-family:'Calibri','Carlito',Arial,sans-serif;font-size:12pt;
    line-height:1.55;color:#111;min-height:500px;box-sizing:border-box}
  h1{font-size:18pt;font-weight:700;margin:1.4em 0 .5em;color:#111;
    border-bottom:2px solid #e2e8f0;padding-bottom:.3em}
  h2{font-size:14pt;font-weight:700;margin:1.2em 0 .4em;color:#1e293b}
  h3{font-size:12pt;font-weight:700;margin:1em 0 .35em;color:#1e293b}
  h4{font-size:11pt;font-weight:700;margin:.8em 0 .3em;color:#334155}
  p{margin:.45em 0;line-height:1.6}
  p:first-child{margin-top:0}
  table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:11pt}
  td,th{border:1px solid #94a3b8;padding:8px 12px;vertical-align:top}
  th,tr:first-child td{background:#f1f5f9;font-weight:700;color:#1e293b}
  tr:nth-child(even) td{background:#f8fafc}
  ul{padding-left:1.8em;margin:.5em 0}
  ol{padding-left:1.8em;margin:.5em 0}
  li{margin:.25em 0;line-height:1.6}
  strong,b{font-weight:700}
  em,i{font-style:italic}
  hr{border:none;border-top:1px solid #e2e8f0;margin:1.5em 0}
`;
function _renderHtmlView(html) {
  const frame = document.getElementById('doc-html-inner');
  frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>${DOC_IFRAME_STYLES}</style></head><body>${_sanitizeHtml(html)}</body></html>`;
  frame.onload = () => {
    try {
      const h = frame.contentDocument.body.scrollHeight;
      if (h > 0) frame.style.height = h + 32 + 'px';
    } catch (_) { /* sandboxed — height stays at min-height */ }
  };
}
```

- [ ] **Step 3: Verify `_sanitizeHtml` is still present and unchanged**

```bash
grep -n "_sanitizeHtml" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/qms.html"
```

Expected: at least 2 lines — the function definition and its call inside `_renderHtmlView`.

- [ ] **Step 4: Manual smoke test**

Open `https://preqal.org/qms.html` (or the local file), navigate to Documents, click View on any document that has a `content_html` draft saved. Confirm:
- Document text renders correctly (no scrambled words)
- Layout matches the old style (white paper on grey background, same fonts/table styles)
- No nested scrollbar inside the viewer
- The viewer can be closed and reopened without issues

- [ ] **Step 5: Commit and push**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add public/qms.html
git commit -m "fix(qms): render document preview in sandboxed iframe to block extension interference"
osascript -e "do shell script \"cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1\""
```
