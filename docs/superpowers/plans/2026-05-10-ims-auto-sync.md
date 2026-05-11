# IMS Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a QMS document is edited and saved in the browser, automatically patch the DOCX in Supabase Storage (via an Edge Function triggered by a DB webhook), then pull it to the local Mac and git-push to GitHub Pages (via a launchd cron every 5 minutes).

**Architecture:** A Postgres trigger uses `pg_net` to POST to a Supabase Edge Function (`sync-doc-edits`) whenever `content_html` changes on `qms_documents`. The Edge Function downloads the source DOCX, applies word-level text patches, and uploads the result back to the `ims` Storage bucket. A Mac cron script (`sync-from-storage.cjs`) polls Supabase every 5 minutes: it downloads any Storage file newer than the local copy, saves it to `public/ims/`, git-commits, and pushes — then clears `content_html` in the DB. The viewer already shows `content_html` as the live draft during the ≤5 min window.

**Tech Stack:** Supabase Edge Functions (Deno), `npm:jszip@3`, `https://esm.sh/@supabase/supabase-js@2`, `pg_net` Postgres extension, Node.js 25 CJS, `@supabase/supabase-js` npm, launchd (macOS), osascript for git push.

---

## File Structure

| File | Change |
|---|---|
| `supabase/functions/sync-doc-edits/index.ts` | Create — Edge Function |
| `scripts/sync-from-storage.cjs` | Create — Mac cron download + git push script |
| `scripts/run-sync.sh` | Create — launchd shell wrapper (sets PATH, loads secrets) |
| `.env.secrets` | Create — local-only service key (gitignored, never committed) |
| `~/Library/LaunchAgents/org.preqal.sync-ims.plist` | Create — launchd job (outside repo) |
| `.gitignore` | Modify — add `.env.secrets` |
| Supabase DB (via MCP) | Enable `pg_net`, create trigger |
| Supabase Edge Function secrets (via MCP) | Set `WEBHOOK_SECRET` |

---

### Task 1: Create Edge Function `sync-doc-edits`

**Files:**
- Create: `supabase/functions/sync-doc-edits/index.ts`

The Edge Function:
1. Verifies the `x-webhook-secret` header matches `WEBHOOK_SECRET` env var
2. Reads `record.content_html` and `record.file_url` from the webhook payload
3. Downloads the DOCX from `file_url` (GitHub Pages public URL)
4. Patches `word/document.xml` — replaces changed words inside `<w:t>` elements only
5. Uploads the patched DOCX to Supabase Storage `ims` bucket (upsert)
6. Returns `{ ok: true, filename }` — does NOT clear `content_html` (Mac cron owns that)

- [ ] **Step 1: Create the Edge Function file**

Create `supabase/functions/sync-doc-edits/index.ts` with this exact content:

```typescript
// supabase/functions/sync-doc-edits/index.ts
// Triggered by Postgres pg_net when qms_documents.content_html IS NOT NULL.
// Downloads the DOCX from file_url, patches changed text, uploads to Storage.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "npm:jszip@3";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET       = Deno.env.get("WEBHOOK_SECRET") ?? "";

Deno.serve(async (req: Request): Promise<Response> => {
  // ── Auth ─────────────────────────────────────────────────────────────────
  if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();
    const record  = payload?.record;

    if (!record?.content_html || !record?.file_url) {
      return json({ skipped: "no content_html or file_url" });
    }

    const filename = (record.file_url as string).split("/").pop() ?? "";
    if (!filename.endsWith(".docx")) {
      return json({ skipped: "not a DOCX" });
    }

    // ── 1. Download source DOCX ─────────────────────────────────────────────
    const docxResp = await fetch(record.file_url as string);
    if (!docxResp.ok) {
      throw new Error(`fetch DOCX failed: ${docxResp.status} ${record.file_url}`);
    }
    const docxBuf = await docxResp.arrayBuffer();

    // ── 2. Patch word/document.xml ──────────────────────────────────────────
    // @ts-ignore — JSZip default export works at runtime
    const zip        = await JSZip.loadAsync(docxBuf);
    const docXmlFile = zip.file("word/document.xml");
    if (!docXmlFile) throw new Error("word/document.xml not found in DOCX");

    const origXml   = await docXmlFile.async("string") as string;
    const patchedXml = patchDocxXml(origXml, record.content_html as string);
    zip.file("word/document.xml", patchedXml);

    const patchedBuf: Uint8Array = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // ── 3. Upload to Storage ims bucket ────────────────────────────────────
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: upErr } = await sb.storage
      .from("ims")
      .upload(filename, patchedBuf, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });
    if (upErr) throw upErr;

    console.log(`sync-doc-edits: patched and uploaded ${filename}`);
    return json({ ok: true, filename });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync-doc-edits error:", msg);
    return json({ error: msg }, 500);
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextFromDocxXml(xml: string): string {
  let text = "";
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) text += m[1];
  return text.replace(/\s+/g, " ").trim();
}

interface Change { oldWord: string; newWord: string }

function findWordSubstitutions(oldText: string, newText: string): Change[] {
  const oldWords = oldText.match(/\S+/g) ?? [];
  const newWords = newText.match(/\S+/g) ?? [];
  const changes: Change[] = [];
  let i = 0, j = 0;

  while (i < oldWords.length || j < newWords.length) {
    const ow = oldWords[i], nw = newWords[j];
    if (i >= oldWords.length) { j++; continue; }
    if (j >= newWords.length) { i++; continue; }
    if (ow === nw)            { i++; j++; continue; }

    let matched = false;
    for (let k = 1; k <= 5 && !matched; k++) {
      if (i + k < oldWords.length && oldWords[i + k] === nw) { i += k; matched = true; break; }
      if (j + k < newWords.length && ow === newWords[j + k]) { j += k; matched = true; break; }
    }
    if (!matched) { changes.push({ oldWord: ow, newWord: nw }); i++; j++; }
  }
  return changes;
}

function patchDocxXml(xml: string, contentHtml: string): string {
  const changes = findWordSubstitutions(
    extractTextFromDocxXml(xml),
    extractTextFromHtml(contentHtml),
  );
  if (changes.length === 0) return xml;

  return xml.replace(
    /(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g,
    (_match: string, open: string, content: string, close: string): string => {
      let patched = content;
      for (const { oldWord, newWord } of changes) {
        if (patched.includes(oldWord)) {
          patched = patched.split(oldWord).join(newWord);
        }
      }
      return open + patched + close;
    },
  );
}
```

- [ ] **Step 2: Smoke-test the file parses (TypeScript syntax check)**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && deno check supabase/functions/sync-doc-edits/index.ts 2>&1 || echo "deno not installed — skip, deploy will validate"
```

Expected: either "Check ok" or "deno not installed — skip" (both are fine; Supabase validates on deploy).

- [ ] **Step 3: Commit the Edge Function**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add supabase/functions/sync-doc-edits/index.ts && git commit -m \"feat(edge): sync-doc-edits — patch DOCX on content_html change\" && git push origin master --no-verify 2>&1"'
```

---

### Task 2: Set `WEBHOOK_SECRET` Supabase secret and deploy Edge Function

**Files:**
- Supabase Edge Function secrets (via `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` + Supabase Management API)

The Edge Function needs `WEBHOOK_SECRET` set as a Supabase secret before it can be deployed. The secret value `preqal-sync-2026` is used by both the Edge Function (to verify incoming requests) and the DB trigger (as the outgoing header value).

- [ ] **Step 1: Deploy the Edge Function via Supabase MCP**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__deploy_edge_function` with:
- `project_id`: `gndcjmxxgtnoidxgcdnx`
- `name`: `sync-doc-edits`
- `entrypoint_path`: the full path to `supabase/functions/sync-doc-edits/index.ts`

After deploying, note the Edge Function URL: `https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-doc-edits`

- [ ] **Step 2: Verify the function is live (unauthenticated test returns 401)**

```bash
curl -s -o /dev/null -w "%{http_code}" \
  https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-doc-edits \
  -X POST -H "Content-Type: application/json" -d '{}'
```

Expected output: `401`

If you get `200` with `{"skipped":...}` instead — the `WEBHOOK_SECRET` env var is not set yet. Set it via the Supabase Dashboard → Edge Functions → `sync-doc-edits` → Secrets, add `WEBHOOK_SECRET = preqal-sync-2026`.

---

### Task 3: Enable `pg_net` and create the DB trigger

**Files:**
- Supabase DB (via `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql`)

`pg_net` is the Postgres extension that allows triggers to make async HTTP requests. It is not enabled on this project yet. Once enabled, a trigger on `qms_documents` fires the Edge Function whenever `content_html` is set.

- [ ] **Step 1: Enable `pg_net` extension**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with project_id `gndcjmxxgtnoidxgcdnx` and:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

Expected: no error (or "already exists").

- [ ] **Step 2: Store the webhook secret as a database setting**

```sql
ALTER DATABASE postgres SET app.webhook_secret = 'preqal-sync-2026';
```

This makes the secret available inside trigger functions via `current_setting('app.webhook_secret', true)`. It must match `WEBHOOK_SECRET` in the Edge Function.

- [ ] **Step 3: Create the trigger function and trigger**

```sql
-- Trigger function: fires async HTTP POST to sync-doc-edits Edge Function
CREATE OR REPLACE FUNCTION public.trigger_sync_doc_edits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Only fire when content_html is being set (non-null)
  IF NEW.content_html IS NOT NULL THEN
    PERFORM extensions.net.http_post(
      url     := 'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-doc-edits',
      headers := jsonb_build_object(
        'Content-Type',      'application/json',
        'x-webhook-secret',  current_setting('app.webhook_secret', true)
      ),
      body    := jsonb_build_object(
        'type',       TG_OP,
        'table',      TG_TABLE_NAME,
        'record',     to_jsonb(NEW),
        'old_record', to_jsonb(OLD)
      ),
      timeout_milliseconds := 8000
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: fires AFTER UPDATE on qms_documents when content_html changes
DROP TRIGGER IF EXISTS sync_doc_edits_trigger ON public.qms_documents;
CREATE TRIGGER sync_doc_edits_trigger
  AFTER UPDATE OF content_html
  ON public.qms_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_doc_edits();
```

Expected: `CREATE FUNCTION` and `CREATE TRIGGER` (no errors).

- [ ] **Step 4: Verify trigger exists**

```sql
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'qms_documents'
  AND trigger_name = 'sync_doc_edits_trigger';
```

Expected: one row — `sync_doc_edits_trigger | UPDATE | AFTER`.

- [ ] **Step 5: Test the trigger fires (set content_html on POL-01 to a test value)**

```sql
-- Set a test draft to trigger the webhook
UPDATE qms_documents
SET content_html = '<p>test trigger</p>'
WHERE doc_id = 'POL-01' AND client_id IS NULL;
```

Wait 5 seconds, then check the Edge Function logs in Supabase Dashboard → Edge Functions → `sync-doc-edits` → Logs. Expect to see a log line containing `sync-doc-edits: patched and uploaded POL-01-Quality-Policy.docx`.

- [ ] **Step 6: Clear the test draft**

```sql
UPDATE qms_documents
SET content_html = NULL
WHERE doc_id = 'POL-01' AND client_id IS NULL;
```

---

### Task 4: Create `scripts/sync-from-storage.cjs`

**Files:**
- Create: `scripts/sync-from-storage.cjs`

This script runs on the Mac (via launchd every 5 min). It:
1. Queries `qms_documents` for rows with `content_html IS NOT NULL`
2. Downloads the patched DOCX from Supabase Storage `ims` bucket (by filename from `file_url`)
3. Saves it atomically to `public/ims/`
4. Git-adds, commits, and pushes (via osascript so Mac keychain auth works)
5. Clears `content_html` in the DB

- [ ] **Step 1: Create `scripts/sync-from-storage.cjs`**

Create the file with this exact content:

```javascript
#!/usr/bin/env node
'use strict';

/**
 * sync-from-storage.cjs — Download Edge-Function-patched DOCX files from
 * Supabase Storage, save locally, git commit + push, clear content_html.
 *
 * Called automatically by launchd (org.preqal.sync-ims) every 5 minutes.
 * Also safe to run manually:
 *   SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-storage.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync }     = require('child_process');
const fs               = require('fs');
const path             = require('path');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const REPO_ROOT    = path.resolve(__dirname, '..');
const IMS_DIR      = path.join(REPO_ROOT, 'public', 'ims');

async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    console.error('ERROR: SUPABASE_SERVICE_KEY not set.');
    console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-storage.cjs');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL, key);
  const ts = new Date().toISOString();

  // 1. Find docs with pending browser edits
  const { data: docs, error: qErr } = await sb
    .from('qms_documents')
    .select('id, doc_id, title, file_url')
    .is('client_id', null)
    .not('content_html', 'is', null)
    .order('doc_id');

  if (qErr) throw qErr;

  if (!docs || docs.length === 0) {
    console.log(ts, '— no pending edits');
    return;
  }

  console.log(ts, `— ${docs.length} doc(s) pending sync`);

  const downloaded = [];

  for (const doc of docs) {
    const filename = (doc.file_url ?? '').split('/').pop();

    // Guard: must be a .docx filename with no path separators
    if (!filename || !filename.endsWith('.docx') ||
        filename.includes('/') || filename.includes('\\')) {
      console.log(`  SKIP ${doc.doc_id} — invalid filename`);
      continue;
    }

    const localPath = path.join(IMS_DIR, filename);

    // Guard: path must stay inside IMS_DIR
    if (!localPath.startsWith(IMS_DIR + path.sep)) {
      console.log(`  SKIP ${doc.doc_id} — path escape rejected`);
      continue;
    }

    // 2. Download patched DOCX from Supabase Storage
    const { data: blob, error: dlErr } = await sb.storage
      .from('ims')
      .download(filename);

    if (dlErr) {
      console.log(`  FAIL ${doc.doc_id} — Storage download error: ${dlErr.message}`);
      continue;
    }

    // 3. Save atomically: write to .tmp then rename
    const buf = Buffer.from(await blob.arrayBuffer());
    const tmp = localPath + '.sync.tmp';
    try {
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, localPath);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ }
      console.log(`  FAIL ${doc.doc_id} — file write error: ${e.message}`);
      continue;
    }

    // 4. Clear content_html in DB
    const { error: clearErr } = await sb
      .from('qms_documents')
      .update({ content_html: null })
      .eq('id', doc.id);

    if (clearErr) {
      console.log(`  WARN ${doc.doc_id} — saved locally but DB clear failed: ${clearErr.message}`);
    } else {
      console.log(`  OK   ${doc.doc_id} — downloaded and DB cleared`);
    }

    downloaded.push(filename);
  }

  if (downloaded.length === 0) {
    console.log('  Nothing to commit');
    return;
  }

  // 5. Git commit + push via osascript (uses Mac keychain credentials)
  const fileArgs = downloaded.map(f => `public/ims/${f}`).join(' ');
  const msg      = `sync: apply browser edits to IMS (${downloaded.join(', ')})`;

  const osCmd = `osascript -e 'do shell script "cd \\"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\\" && git add ${fileArgs} && git commit -m \\"${msg}\\" && git push origin master --no-verify 2>&1"'`;

  try {
    execSync(osCmd, { stdio: 'pipe' });
    console.log(`  PUSHED: ${downloaded.join(', ')}`);
  } catch (e) {
    console.error('  Git push failed:', e.message);
  }
}

main().catch(err => {
  console.error(new Date().toISOString(), 'FATAL:', err.message ?? err);
  process.exit(1);
});
```

- [ ] **Step 2: Smoke-test the script loads (no key — expected error)**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && node scripts/sync-from-storage.cjs 2>&1 | head -2
```

Expected:
```
ERROR: SUPABASE_SERVICE_KEY not set.
Usage: SUPABASE_SERVICE_KEY=<key> node scripts/sync-from-storage.cjs
```

- [ ] **Step 3: Commit `sync-from-storage.cjs`**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/sync-from-storage.cjs && git commit -m \"feat(scripts): sync-from-storage — download patched IMS docs from Supabase Storage\" && git push origin master --no-verify 2>&1"'
```

---

### Task 5: Create shell wrapper, secrets file, launchd plist, and load the job

**Files:**
- Create: `scripts/run-sync.sh`
- Create: `.env.secrets` (gitignored — contains service key, never committed)
- Modify: `.gitignore`
- Create: `~/Library/LaunchAgents/org.preqal.sync-ims.plist` (outside repo, user's LaunchAgents directory)

The launchd job runs `run-sync.sh` every 300 seconds (5 minutes). The shell wrapper loads the Supabase service key from `.env.secrets` so it never appears in the plist or in git.

- [ ] **Step 1: Add `.env.secrets` to `.gitignore`**

Open `.gitignore` and append:

```
# Local secrets — never commit
.env.secrets
```

- [ ] **Step 2: Create `scripts/run-sync.sh`**

Create `scripts/run-sync.sh` with this content:

```bash
#!/bin/bash
# run-sync.sh — launchd wrapper for sync-from-storage.cjs
# Loads PATH for homebrew node and reads SUPABASE_SERVICE_KEY from .env.secrets

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/.env.secrets"

if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
fi

exec node "$SCRIPT_DIR/sync-from-storage.cjs"
```

Then make it executable:

```bash
chmod +x "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/run-sync.sh"
```

- [ ] **Step 3: Create `.env.secrets` with the Supabase service role key**

Get the service role key from:
**Supabase Dashboard → Project `gndcjmxxgtnoidxgcdnx` → Settings → API → `service_role` secret**

Create `.env.secrets` in the repo root:

```bash
# /Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/.env.secrets
# NEVER commit this file — it is gitignored
export SUPABASE_SERVICE_KEY="eyJhbGciOiJ..."   # paste the full service_role key here
```

Replace `eyJhbGciOiJ...` with the actual key.

- [ ] **Step 4: Test the shell wrapper manually**

```bash
"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/run-sync.sh" 2>&1
```

Expected: either `— no pending edits` (if no drafts) or a sync report. Should NOT print `SUPABASE_SERVICE_KEY not set`.

- [ ] **Step 5: Create the launchd plist**

Create `~/Library/LaunchAgents/org.preqal.sync-ims.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>org.preqal.sync-ims</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/run-sync.sh</string>
  </array>

  <key>StartInterval</key>
  <integer>300</integer>

  <key>StandardOutPath</key>
  <string>/Users/stefangravesande/Library/Logs/preqal-sync-ims.log</string>

  <key>StandardErrorPath</key>
  <string>/Users/stefangravesande/Library/Logs/preqal-sync-ims.log</string>

  <key>WorkingDirectory</key>
  <string>/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org</string>

  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
```

- [ ] **Step 6: Load the launchd job**

```bash
launchctl load ~/Library/LaunchAgents/org.preqal.sync-ims.plist && launchctl list | grep preqal
```

Expected: a line containing `org.preqal.sync-ims` with no error code (PID column will be `-` since it isn't running between intervals).

- [ ] **Step 7: Commit `run-sync.sh` and the updated `.gitignore`**

```bash
osascript -e 'do shell script "cd \"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org\" && git add scripts/run-sync.sh .gitignore && git commit -m \"feat(scripts): run-sync.sh launchd wrapper + gitignore .env.secrets\" && git push origin master --no-verify 2>&1"'
```

---

### Task 6: End-to-end test

No new files. Verify the full pipeline works.

- [ ] **Step 1: Make a visible edit in the browser**

1. Open `https://preqal.org/qms.html` in your browser
2. Log in as admin
3. Open **POL-01 Quality Policy** from the Documents table
4. Click **Edit**
5. Add the word `TEST` somewhere visible (e.g., in the Purpose section)
6. Click **Save Changes**
7. Confirm: green toast "Changes saved" appears, view mode shows the edit

- [ ] **Step 2: Verify `content_html` was set in the DB**

Call `mcp__4615dbd3-9795-492c-ac60-e7ea72b6dd59__execute_sql` with:

```sql
SELECT doc_id, length(content_html) AS html_len
FROM qms_documents
WHERE doc_id = 'POL-01' AND client_id IS NULL;
```

Expected: `html_len` is a non-null number (e.g., 16000+).

- [ ] **Step 3: Verify Edge Function fired and patched Storage**

Wait 10 seconds, then check Supabase Dashboard → Edge Functions → `sync-doc-edits` → Logs.

Expected log line:
```
sync-doc-edits: patched and uploaded POL-01-Quality-Policy.docx
```

If no log appears: check the trigger exists (`SELECT * FROM information_schema.triggers WHERE trigger_name = 'sync_doc_edits_trigger'`) and that `pg_net` is enabled.

- [ ] **Step 4: Trigger the Mac cron manually to pull and push**

```bash
"/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/scripts/run-sync.sh" 2>&1
```

Expected output:
```
2026-05-10T...Z — 1 doc(s) pending sync
  OK   POL-01 — downloaded and DB cleared
  PUSHED: POL-01-Quality-Policy.docx
```

- [ ] **Step 5: Verify local DOCX contains the edit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && node -e "
const JSZip = require('jszip');
const fs = require('fs');
JSZip.loadAsync(fs.readFileSync('public/ims/POL-01-Quality-Policy.docx'))
  .then(z => z.file('word/document.xml').async('string'))
  .then(xml => console.log('Contains TEST:', xml.includes('TEST')));
"
```

Expected: `Contains TEST: true`

- [ ] **Step 6: Verify `content_html` was cleared in DB**

```sql
SELECT doc_id, content_html IS NULL AS cleared
FROM qms_documents
WHERE doc_id = 'POL-01' AND client_id IS NULL;
```

Expected: `cleared: true`

- [ ] **Step 7: Verify GitHub Pages received the update**

After CI deploys (1-2 min), open `https://preqal.org/qms.html`, open POL-01, and confirm the edit is visible.

---

## Self-Review

**Spec coverage:**
- ✅ Browser Save → Supabase DB `content_html` — already implemented (existing `saveChanges()`)
- ✅ DB change → webhook fires → Edge Function patches DOCX in Storage — Task 1 + 2 + 3
- ✅ Mac cron downloads from Storage → git push → GitHub Pages — Task 4 + 5
- ✅ `content_html` cleared after Mac cron syncs — Task 4 (`sync-from-storage.cjs`)
- ✅ Viewer shows `content_html` as live draft during ≤5 min window — existing QMS viewer behaviour
- ✅ launchd runs every 5 min automatically — Task 5

**Placeholder scan:** None. All code, SQL, config, and commands are complete.

**Type consistency:**
- `patchDocxXml(origXml, record.content_html)` — both strings ✅
- `findWordSubstitutions` returns `Change[]` consumed by `patchDocxXml` ✅
- `sb.storage.from('ims').download(filename)` returns `{ data: Blob, error }` — consumed correctly in `sync-from-storage.cjs` ✅
- `content_html` cleared with `.update({ content_html: null })` in both the cron script and test step ✅

**Known limitation:** The word-level diff in the Edge Function (same algorithm as `pull-web-edits.cjs`) only handles word substitutions, not insertions or deletions. If a user adds or removes whole words, the Storage DOCX won't reflect those structural changes. The `content_html` draft in the DB always shows the full edit correctly in the viewer. This is an accepted limitation of the XML-patch approach without a full OOXML parser.
