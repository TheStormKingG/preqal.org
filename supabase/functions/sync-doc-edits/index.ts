// supabase/functions/sync-doc-edits/index.ts
// Triggered by Postgres pg_net when qms_documents.content_html IS NOT NULL.
// Downloads the DOCX from file_url, patches changed text, uploads to Storage.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "npm:jszip@3";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET       = Deno.env.get("WEBHOOK_SECRET") ?? "";

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (req: Request): Promise<Response> => {
  // ── Auth ─────────────────────────────────────────────────────────────────
  if (!WEBHOOK_SECRET || req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();
    const record  = payload?.record;

    if (!record?.content_html) {
      return json({ skipped: "no content_html" });
    }
    if (!record?.file_url) {
      return json({ skipped: "no file_url" });
    }

    const filename = (record.file_url as string).split("/").pop() ?? "";
    if (!filename.endsWith(".docx")) {
      return json({ skipped: "not a DOCX" });
    }

    // ── 1. Download source DOCX ─────────────────────────────────────────────
    if (!isSafeUrl(record.file_url as string)) {
      throw new Error(`Rejected file_url with disallowed hostname: ${record.file_url}`);
    }
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

const ALLOWED_HOSTS = new Set([
  "preqal.org",
  "gndcjmxxgtnoidxgcdnx.supabase.co",
]);

function isSafeUrl(urlStr: string): boolean {
  try {
    const { hostname } = new URL(urlStr);
    return ALLOWED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

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
        // escape special regex chars in oldWord
        const escaped = oldWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, "g");
        if (re.test(patched)) {
          re.lastIndex = 0; // reset after .test()
          patched = patched.replace(re, newWord);
        }
      }
      return open + patched + close;
    },
  );
}
