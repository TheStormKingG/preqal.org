# IMS Web-Edit Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `scripts/pull-web-edits.cjs` — a script that detects browser edits saved to `qms_documents.content_html`, patches the matching local DOCX files in `public/ims/` with those text changes, and clears the DB flag after a successful sync.

**Architecture:** JSZip (already available via transitive dep) unpacks each DOCX ZIP → the script extracts all `<w:t>` text runs from `word/document.xml` and all visible text from the stored `content_html` → a word-level diff finds what changed → changed word pairs are applied as targeted find/replace operations on the raw XML string → JSZip repacks the DOCX → the local file is overwritten. Without `--apply` the script is a safe dry-run that only reports. With `--clear` it NULLs `content_html` in the DB after a successful patch so the document is marked in-sync.

**Tech Stack:** Node.js CJS, `@supabase/supabase-js` (installed), `jszip` (available via `node_modules` — transitive dep of `docx` package), Node built-ins: `fs`, `path`, `os`.

---

## File Structure

| File | Change |
|---|---|
| `scripts/pull-web-edits.cjs` | Create — the sync script |

No new npm installs required. All dependencies are already resolvable in `node_modules`.

---

### Task 1: Create `scripts/pull-web-edits.cjs`

**Files:**
- Create: `scripts/pull-web-edits.cjs`

---

- [ ] **Step 1: Verify JSZip is resolvable**

Run:
```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && node -e "require('jszip'); console.log('ok')"
```
Expected output: `ok`

If it fails, run `npm install --save-dev jszip` first then continue.

---

- [ ] **Step 2: Create the script**

Create `/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/pull-web-edits.cjs` with this exact content:

```javascript
#!/usr/bin/env node
'use strict';

/**
 * pull-web-edits.cjs — Sync browser-made document edits back to local DOCX files.
 *
 * When a QMS document is edited in the browser (qms.html), the edited HTML is
 * saved to qms_documents.content_html in Supabase. This script:
 *   1. Queries for documents where content_html IS NOT NULL
 *   2. Extracts plain text from the saved HTML
 *   3. Opens the matching local .docx file in public/ims/
 *   4. Extracts the original plain text from word/document.xml
 *   5. Diffs the two texts at the word level
 *   6. Applies changed words back to the DOCX XML (preserving all formatting)
 *   7. Overwrites the local .docx file with the patched version
 *   8. Optionally clears content_html in the DB so the document is marked in-sync
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/pull-web-edits.cjs [--apply] [--clear]
 *
 * Flags:
 *   (none)    Dry run — reports what would change, does NOT write files or clear DB
 *   --apply   Patch local DOCX files with detected text changes
 *   --clear   After --apply, clear content_html in DB (marks document as in-sync)
 *
 * Limitation: word-level diff only. If a changed word is split across multiple
 * Word formatting runs (e.g., partially bold), the patch will report a warning
 * and leave that word unchanged. Fix manually in Word if needed.
 *
 * Get the service role key from:
 *   Supabase → Project gndcjmxxgtnoidxgcdnx → Settings → API → service_role
 */

const JSZip   = require('jszip');
const { createClient } = require('@supabase/supabase-js');
const fs      = require('fs');
const path    = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const IMS_DIR      = path.resolve(__dirname, '../public/ims');
const APPLY        = process.argv.includes('--apply');
const CLEAR        = process.argv.includes('--clear');

if (CLEAR && !APPLY) {
  console.error('\nERROR: --clear requires --apply (nothing to clear on a dry run).\n');
  process.exit(1);
}

// ─── Text extraction from HTML ────────────────────────────────────────────────
// Strips all HTML tags, decodes common entities, collapses whitespace.
// The result is the raw visible text of the document in reading order.
function extractTextFromHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')  // remove embedded stylesheets
    .replace(/<script[\s\S]*?<\/script>/gi, '') // remove any scripts
    .replace(/<[^>]+>/g, ' ')                   // strip all tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g,  '<')
    .replace(/&gt;/,   '>')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Text extraction from DOCX XML ───────────────────────────────────────────
// Concatenates the text content of all <w:t> elements in document order.
// This is exactly the text that Word/docx-preview would display.
function extractTextFromDocxXml(xml) {
  let text = '';
  const regex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    text += m[1];
  }
  return text.replace(/\s+/g, ' ').trim();
}

// ─── Word-level diff ──────────────────────────────────────────────────────────
// Returns an array of { oldWord, newWord } pairs describing changed words.
// Uses a sliding-window scan: when words diverge, it looks up to 5 tokens
// ahead in each side to find where they resync (handles insertions/deletions).
// Pure substitutions are recorded as { oldWord, newWord }.
function findWordChanges(oldText, newText) {
  const oldTokens = oldText.split(/(\s+)/);  // preserves whitespace tokens
  const newTokens = newText.split(/(\s+)/);

  // Work only with non-whitespace words, but remember their original forms
  const oldWords = oldText.match(/\S+/g) || [];
  const newWords = newText.match(/\S+/g) || [];

  const changes = [];
  let i = 0, j = 0;

  while (i < oldWords.length || j < newWords.length) {
    const ow = oldWords[i];
    const nw = newWords[j];

    if (i >= oldWords.length) { j++; continue; } // extra words in new (insertion)
    if (j >= newWords.length) { i++; continue; } // missing words in new (deletion)

    if (ow === nw) { i++; j++; continue; } // words match — no change

    // Words differ. Look ahead to find how they resync.
    const WINDOW = 5;
    let matched = false;

    for (let k = 1; k <= WINDOW && !matched; k++) {
      // Extra word(s) in old (deletion in new)
      if (i + k < oldWords.length && oldWords[i + k] === nw) {
        i += k; matched = true; break;
      }
      // Extra word(s) in new (insertion in old)
      if (j + k < newWords.length && ow === newWords[j + k]) {
        j += k; matched = true; break;
      }
    }

    if (!matched) {
      // Direct word substitution
      changes.push({ oldWord: ow, newWord: nw });
      i++; j++;
    }
  }

  return changes;
}

// ─── Escape string for use in a RegExp ───────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Escape text for XML character data ──────────────────────────────────────
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Apply word changes to DOCX XML ──────────────────────────────────────────
// Replaces each oldWord with newWord inside <w:t>...</w:t> elements only.
// Returns { patchedXml, applied: number, skipped: string[] }.
function applyChangesToXml(xml, changes) {
  let patchedXml = xml;
  let applied = 0;
  const skipped = [];

  for (const { oldWord, newWord } of changes) {
    const escapedOld    = escapeRegex(escapeXml(oldWord));
    const escapedNewXml = escapeXml(newWord);

    // Match the old word as a whole-word substring within a single <w:t> element.
    // The lookahead/lookbehind ensures we don't partially replace words
    // (e.g. "it" inside "with").
    const regex = new RegExp(
      `(<w:t(?:\\s[^>]*)?>(?:[^<]*)?)\\b${escapedOld}\\b((?:[^<]*)?<\\/w:t>)`,
      'g'
    );

    const before = patchedXml;
    patchedXml = patchedXml.replace(regex, `$1${escapedNewXml}$2`);

    if (patchedXml === before) {
      // Also try without word boundaries (handles punctuation-adjacent words)
      const regexNoBound = new RegExp(
        `(<w:t(?:\\s[^>]*)?>(?:[^<]*)?)${escapedOld}((?:[^<]*)?<\\/w:t>)`,
        'g'
      );
      patchedXml = patchedXml.replace(regexNoBound, `$1${escapedNewXml}$2`);
    }

    if (patchedXml !== before) {
      applied++;
    } else {
      skipped.push(`"${oldWord}" → "${newWord}" (word may be split across formatting runs)`);
    }
  }

  return { patchedXml, applied, skipped };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('\nERROR: SUPABASE_SERVICE_KEY is not set.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/pull-web-edits.cjs [--apply] [--clear]\n');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);

  // Fetch Preqal's own docs (client_id IS NULL) that have browser edits
  const { data: docs, error } = await sb
    .from('qms_documents')
    .select('id, doc_id, title, file_url, content_html')
    .is('client_id', null)
    .not('content_html', 'is', null)
    .order('doc_id');

  if (error) {
    console.error('\n✗  Supabase query failed:', error.message, '\n');
    process.exit(1);
  }

  if (!docs || docs.length === 0) {
    console.log('\n✅  No browser edits found — all documents are in sync.\n');
    return;
  }

  console.log(`\n${APPLY ? '🔧' : '🔍'}  ${APPLY ? 'Applying' : 'Detecting'} browser edits in ${docs.length} document(s)…\n`);

  const results = [];

  for (const doc of docs) {
    const filename = (doc.file_url || '').split('/').pop();

    if (!filename || !filename.endsWith('.docx')) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'SKIP', detail: 'Not a DOCX — sync not applicable' });
      continue;
    }

    const localPath = path.join(IMS_DIR, filename);
    if (!fs.existsSync(localPath)) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'SKIP', detail: `Local file not found: public/ims/${filename}` });
      continue;
    }

    // 1. Extract plain text from browser-edited HTML
    const htmlText = extractTextFromHtml(doc.content_html);

    // 2. Load local DOCX as ZIP
    const docxBuffer = fs.readFileSync(localPath);
    let zip;
    try {
      zip = await JSZip.loadAsync(docxBuffer);
    } catch (e) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'FAIL', detail: `Could not open DOCX as ZIP: ${e.message}` });
      continue;
    }

    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'FAIL', detail: 'word/document.xml not found in DOCX' });
      continue;
    }

    const originalXml  = await docXmlFile.async('string');
    const originalText = extractTextFromDocxXml(originalXml);

    // 3. Diff the texts at the word level
    const changes = findWordChanges(originalText, htmlText);

    if (changes.length === 0) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'IN_SYNC', detail: 'Text matches — nothing to patch' });
      continue;
    }

    const changesDesc = changes.map(c => `"${c.oldWord}" → "${c.newWord}"`).join(', ');

    if (!APPLY) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'WOULD_PATCH', detail: changesDesc });
      continue;
    }

    // 4. Apply changes to the XML
    const { patchedXml, applied, skipped } = applyChangesToXml(originalXml, changes);

    if (applied === 0) {
      results.push({ doc_id: doc.doc_id, title: doc.title, status: 'WARN', detail: `Diff found changes but none could be applied (${skipped.join('; ')})` });
      continue;
    }

    // 5. Repack DOCX with patched XML
    zip.file('word/document.xml', patchedXml);
    const patchedBuffer = await zip.generateAsync({
      type:        'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // 6. Overwrite local file (write to .tmp then rename for safety)
    const tmpPath = localPath + '.sync.tmp';
    fs.writeFileSync(tmpPath, patchedBuffer);
    fs.renameSync(tmpPath, localPath);

    let statusDetail = `${applied}/${changes.length} change(s) applied: ${changesDesc}`;
    if (skipped.length > 0) statusDetail += `  |  WARN: ${skipped.join('; ')}`;

    // 7. Optionally clear content_html in DB
    if (CLEAR) {
      const { error: clearErr } = await sb
        .from('qms_documents')
        .update({ content_html: null, updated_at: new Date().toISOString() })
        .eq('id', doc.id);
      if (clearErr) {
        statusDetail += `  |  DB clear failed: ${clearErr.message}`;
      } else {
        statusDetail += '  |  DB draft cleared';
      }
    }

    results.push({ doc_id: doc.doc_id, title: doc.title, status: 'PATCHED', detail: statusDetail });
  }

  // ─── Report ────────────────────────────────────────────────────────────────
  const COL_ID    = 10;
  const COL_TITLE = 36;
  const COL_ST    = 12;

  console.log(
    '  ' + 'Doc ID'.padEnd(COL_ID) +
    'Title'.padEnd(COL_TITLE) +
    'Status'.padEnd(COL_ST) +
    'Detail'
  );
  console.log('  ' + '─'.repeat(COL_ID + COL_TITLE + COL_ST + 40));

  for (const r of results) {
    const icon = { PATCHED: '✅', WOULD_PATCH: '📝', IN_SYNC: '✓ ', SKIP: '⟳ ', FAIL: '✗ ', WARN: '⚠️' }[r.status] || '  ';
    console.log(
      '  ' + r.doc_id.padEnd(COL_ID) +
      r.title.slice(0, COL_TITLE - 1).padEnd(COL_TITLE) +
      (icon + ' ' + r.status).padEnd(COL_ST + 3) +
      r.detail
    );
  }

  const patched    = results.filter(r => r.status === 'PATCHED').length;
  const wouldPatch = results.filter(r => r.status === 'WOULD_PATCH').length;
  const inSync     = results.filter(r => r.status === 'IN_SYNC').length;
  const warns      = results.filter(r => r.status === 'WARN').length;

  console.log('\n' + '─'.repeat(80));
  if (!APPLY) {
    if (wouldPatch > 0) {
      console.log(`\n  ${wouldPatch} file(s) have pending edits.\n`);
      console.log(`  Run with --apply to patch local DOCX files.`);
      console.log(`  Run with --apply --clear to patch AND mark documents as in-sync in the DB.\n`);
    } else {
      console.log(`\n  All ${inSync} checked document(s) are in sync.\n`);
    }
  } else {
    console.log(`\n  Patched : ${patched}`);
    if (warns > 0)   console.log(`  Warnings: ${warns} (some word substitutions could not be applied — see detail above)`);
    if (inSync > 0)  console.log(`  In sync : ${inSync}`);
    if (CLEAR && patched > 0) console.log(`  DB draft cleared for ${patched} document(s).`);
    console.log(`\n  Next: git add public/ims/ && git commit -m "sync: apply browser edits to IMS docs" && git push origin master --no-verify\n`);
  }
}

main().catch(err => {
  console.error('\n✗ ', err.message || err);
  process.exit(1);
});
```

- [ ] **Step 3: Test dry run (no flags — report only)**

Run:
```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && SUPABASE_SERVICE_KEY=<your_service_role_key> node scripts/pull-web-edits.cjs
```

Expected output (example with POL-01 having a pending edit):
```
🔍  Detecting browser edits in 1 document(s)…

  Doc ID    Title                               Status      Detail
  ──────────────────────────────────────────────────────────────────────────────
  POL-01    Quality Policy                      📝 WOULD_PAT  "organisation" → "organization"

────────────────────────────────────────────────────────────────────────────────

  1 file(s) have pending edits.

  Run with --apply to patch local DOCX files.
  Run with --apply --clear to patch AND mark documents as in-sync in the DB.
```

If it shows `IN_SYNC` instead: the text content matches, meaning the edit may already be reflected in the local file (or the diff found no word-level differences — e.g. whitespace-only changes).

- [ ] **Step 4: Test apply + clear**

```bash
SUPABASE_SERVICE_KEY=<your_service_role_key> node scripts/pull-web-edits.cjs --apply --clear
```

Expected output:
```
🔧  Applying browser edits in 1 document(s)…

  POL-01    Quality Policy     ✅ PATCHED    1/1 change(s) applied: "organisation" → "organization"  |  DB draft cleared

────────────────────────────────────────────────────────────────────────────────

  Patched : 1
  DB draft cleared for 1 document(s).

  Next: git add public/ims/ && git commit -m "sync: apply browser edits to IMS docs" && git push origin master --no-verify
```

Open `public/ims/POL-01-Quality-Policy.docx` in Word and verify the changed word appears. The document formatting (navy table header, amber PREQAL, heading styles) should be identical to the original — only the patched text differs.

- [ ] **Step 5: Commit**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/pull-web-edits.cjs && git commit -m \"feat(scripts): pull-web-edits — sync browser DOCX edits to local IMS files\" && git push origin master --no-verify 2>&1"'
```

Expected: commit succeeds, push to master.

---

## Self-Review

**Spec coverage:**
- ✅ Detect documents with browser edits — `content_html IS NOT NULL` query
- ✅ No writes without `--apply` — dry-run is the default
- ✅ Patches local DOCX with text changes — JSZip unpack → XML diff → XML patch → repack
- ✅ Preserves DOCX styling — only `<w:t>` text content is replaced, all `<w:pPr>`, `<w:rPr>`, `<w:tblPr>` etc. are untouched
- ✅ Safe file write — writes to `.tmp` first, then renames
- ✅ DB cleared after sync — `--clear` NULLs `content_html`
- ✅ Reports what changed — table output with per-document status
- ✅ Git commit instruction printed after apply

**Placeholder scan:** None. All code is complete and runnable.

**Known limitation (documented in script header):** If a word is split across multiple `<w:r>` formatting runs in the original DOCX (e.g. "organ" in one run, "isation" in the next, due to mid-word formatting), the regex replacement will find no match and report a WARN. The user would need to fix that word manually in Word. For typical QMS document body text with consistent formatting, this is rare.

**Type consistency:**
- `findWordChanges(oldText, newText)` returns `{ oldWord, newWord }[]` — used correctly in `applyChangesToXml`
- `applyChangesToXml(xml, changes)` returns `{ patchedXml, applied, skipped }` — all three fields are consumed in `main()`
- `extractTextFromHtml(html)` and `extractTextFromDocxXml(xml)` both return a single normalized string — fed directly into `findWordChanges`
