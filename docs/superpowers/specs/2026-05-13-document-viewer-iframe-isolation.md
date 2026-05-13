# Document Viewer iframe Isolation

**Goal:** Prevent browser extensions (translators, AI rewriters, grammar tools) from corrupting the document preview in `qms.html` by rendering `content_html` inside a sandboxed `<iframe>` instead of directly into the host DOM.

**Root cause:** `_renderHtmlView` injects sanitised HTML into `<div id="doc-html-inner">` via `innerHTML`. This makes the content a normal DOM node visible to every browser extension content script. Extensions freely substitute text nodes — e.g. "Quality Policy" → "jurisdictions Policy".

**Fix:** Replace the `<div>` with an `<iframe sandbox="allow-same-origin" srcdoc="…">`. Extension content scripts inject into the top-level document only and cannot reach inside iframes, completely isolating the preview from extension interference. Text remains selectable and copyable. No external libraries needed.

**Tech stack:** Vanilla JS, standalone HTML (`public/qms.html`), no bundler.

---

## What Changes

### `public/qms.html` — HTML

**Replace** the `doc-html-inner` div (line ~3345):

```html
<!-- REMOVE -->
<div class="doc-html-inner" id="doc-html-inner"></div>

<!-- ADD -->
<iframe id="doc-html-inner"
  sandbox="allow-same-origin"
  style="width:100%;border:none;display:block;min-height:500px;"
  title="Document preview">
</iframe>
```

### `public/qms.html` — CSS

The `.doc-html-inner` class rules (lines ~181–197) style the div that is being replaced. Those styles must move **inside** the iframe `srcdoc` so layout is preserved. Remove the `.doc-html-inner` CSS block from the host page stylesheet.

### `public/qms.html` — JS: `_renderHtmlView`

**Replace** the current implementation:

```js
// REMOVE
function _renderHtmlView(html) {
  document.getElementById('doc-html-inner').innerHTML = _sanitizeHtml(html);
}
```

**With:**

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

---

## What Does NOT Change

- `_sanitizeHtml` — still called before injecting into srcdoc
- `doc-html-wrap` container div and its CSS — unchanged
- `_showPanel` / `PANEL_SHOW` — `doc-html-wrap` key stays as `'block'`
- Edit mode (`doc-editor` contenteditable) — completely unaffected
- DOCX preview panel (`doc-preview-wrap`) — unaffected
- All other viewer panels — unaffected

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `frame.contentDocument` access denied (sandbox) | `try/catch` swallows — iframe stays at `min-height: 500px` |
| Empty `content_html` | `_sanitizeHtml('')` returns `''` — iframe renders blank white page, same as before |
| Very long document | `scrollHeight` auto-sizes iframe — no nested scrollbar |

---

## Files Modified

| File | Change |
|---|---|
| `public/qms.html` | Replace `div#doc-html-inner` with `iframe`; move `.doc-html-inner` styles into `DOC_IFRAME_STYLES` constant; rewrite `_renderHtmlView` |
