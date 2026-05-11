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
    // @ts-expect-error — JSZip default export works at runtime
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

    console.warn(`sync-doc-edits: patched and uploaded ${filename}`);
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

// ── HTML paragraph extraction ──────────────────────────────────────────────
// Returns one string per visible paragraph; skips blank lines.

function extractParagraphsFromHtml(html: string): string[] {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi,      "\n")
    .replace(/<\/div>/gi,    "\n")
    .replace(/<\/li>/gi,     "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g,       "&")
    .replace(/&lt;/g,        "<")
    .replace(/&gt;/g,        ">")
    .replace(/&quot;/g,      '"')
    .replace(/&#39;/g,       "'")
    .replace(/&nbsp;|&#160;/g, " ")
    .split("\n")
    .map(s => s.replace(/\s+/g, " ").trim())
    .filter(s => s.length > 0);
}

// ── DOCX paragraph text extraction ────────────────────────────────────────

function extractTextFromPara(paraContent: string): string {
  let text = "";
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(paraContent)) !== null) text += m[1];
  return text.replace(/\s+/g, " ").trim();
}

// ── XML escaping ───────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Paragraph-level text replacement ──────────────────────────────────────
// Puts newText into the FIRST <w:t> run, empties the rest.
// Preserves all run formatting (<w:rPr>: bold, size, colour, etc.).

function replaceParaText(paraContent: string, newText: string): string {
  let first = true;
  return paraContent.replace(
    /(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g,
    (_match: string, open: string, _old: string, close: string): string => {
      if (first) {
        first = false;
        // Ensure xml:space="preserve" so leading/trailing spaces survive
        const safeOpen = open.includes("xml:space")
          ? open
          : open.replace("<w:t", '<w:t xml:space="preserve"');
        return safeOpen + escapeXml(newText) + close;
      }
      return open + close; // clear subsequent runs
    }
  );
}

// ── Main patch function ────────────────────────────────────────────────────
// Paragraph-level alignment: each non-empty DOCX <w:p> maps to the
// corresponding HTML paragraph in document order.
// Never crosses paragraph boundaries → no cross-paragraph word corruption.

function patchDocxXml(xml: string, contentHtml: string): string {
  const htmlParas = extractParagraphsFromHtml(contentHtml);
  if (htmlParas.length === 0) return xml;

  let htmlIdx = 0;

  return xml.replace(
    /(<w:p(?:[ \t][^>]*)?>)([\s\S]*?)(<\/w:p>)/g,
    (match: string, open: string, content: string, close: string): string => {
      if (htmlIdx >= htmlParas.length) return match;

      const docxText = extractTextFromPara(content);
      if (!docxText) return match; // skip empty/structural paragraphs

      const htmlText = htmlParas[htmlIdx];
      htmlIdx++;

      if (docxText === htmlText) return match; // unchanged

      return open + replaceParaText(content, htmlText) + close;
    }
  );
}
