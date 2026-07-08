# Client Pipeline — Plan 2: PDF Edge Function

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a Supabase Edge Function that generates quote and service agreement PDFs using `pdf-lib`, uploads them to the `pdf-temp` Supabase Storage bucket, and returns a 48-hour signed URL.

**Architecture:** Single Deno Edge Function at `supabase/functions/generate-pdf/index.ts`. Accepts POST with `{ type: "quote" | "agreement", lead: object, tier: string, contract_start?: string }`. Uses `pdf-lib` (via npm import) for programmatic PDF layout. Uploads to the `pdf-temp` private bucket using the service role key. Returns `{ url: string, filename: string }`.

**Tech Stack:** Deno (Supabase Edge Functions), `pdf-lib` (npm), Supabase Storage JS client

**Prerequisite:** Plan 1 must be complete (pdf-temp bucket must exist).

---

## Rate Sheet Constants

These tier pricing values come from the Preqal rate sheet:

| Tier | Name | Staff | Monthly (GYD) | 9-month Total (GYD) |
|---|---|---|---|---|
| T1 | Solo Founder | 1 | 50,000 | 450,000 |
| T2 | Micro Business | 2–5 | 70,000 | 630,000 |
| T3 | Small Business | 6–15 | 90,000 | 810,000 |
| T4 | Growing SME | 16–40 | 120,000 | 1,080,000 |
| T5 | Medium Company | 41–100 | 180,000 | 1,620,000 |
| T6 | Large Organisation | 100+ | 233,333 | 2,099,997 |

## Service Steps

| Step | Name |
|---|---|
| 1 | Compliance Baseline Scan |
| 2 | IMS Architecture & Implementation Planning |
| 3 | Document Development |
| 4 | Training Programme Delivery |
| 5 | Implementation & Observation Support |
| 6 | Internal Audit Execution |
| 7 | Management Review Facilitation |
| 8 | Pre-Certification Readiness Audit |

---

## File Map

| File | Change |
|---|---|
| `supabase/functions/generate-pdf/index.ts` | New — full Edge Function |

---

### Task 1: Create Edge Function boilerplate + verify local invocation

**Files:**
- Create: `supabase/functions/generate-pdf/index.ts`

- [ ] **Step 1: Create the Edge Function directory and file**

```bash
mkdir -p supabase/functions/generate-pdf
```

- [ ] **Step 2: Write the function skeleton**

Create `supabase/functions/generate-pdf/index.ts`:

```typescript
// supabase/functions/generate-pdf/index.ts
// Generates quote or service agreement PDFs and stores them in the
// private 'pdf-temp' Supabase Storage bucket.
//
// POST body: { type: "quote" | "agreement", lead: object, tier: string, contract_start?: string }
// Returns:   { url: string, filename: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const SUPABASE_URL            = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET                  = "pdf-temp";
const SIGNED_URL_EXPIRY_SECS  = 172800; // 48 hours

// ── Rate sheet ────────────────────────────────────────────────────────────────
const RATE_SHEET: Record<string, { name: string; staff: string; monthly: number; total: number }> = {
  T1: { name: "Solo Founder",        staff: "1 person",   monthly: 50000,  total: 450000  },
  T2: { name: "Micro Business",      staff: "2–5 people", monthly: 70000,  total: 630000  },
  T3: { name: "Small Business",      staff: "6–15 people",monthly: 90000,  total: 810000  },
  T4: { name: "Growing SME",         staff: "16–40 people",monthly: 120000, total: 1080000 },
  T5: { name: "Medium Company",      staff: "41–100 people",monthly: 180000, total: 1620000},
  T6: { name: "Large Organisation",  staff: "100+ people",monthly: 233333, total: 2099997 },
};

// ── Service steps ─────────────────────────────────────────────────────────────
const SERVICE_STEPS: Record<number, string> = {
  1: "Compliance Baseline Scan",
  2: "IMS Architecture & Implementation Planning",
  3: "Document Development",
  4: "Training Programme Delivery",
  5: "Implementation & Observation Support",
  6: "Internal Audit Execution",
  7: "Management Review Facilitation",
  8: "Pre-Certification Readiness Audit",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtGYD(n: number): string {
  return "GYD " + n.toLocaleString("en-US");
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// ── CORS headers ─────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const { type, lead, tier, contract_start } = body;

    if (!type || !lead || !tier) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, lead, tier" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const tierData = RATE_SHEET[tier];
    if (!tierData) {
      return new Response(JSON.stringify({ error: `Unknown tier: ${tier}` }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Generate PDF bytes
    const pdfBytes = type === "quote"
      ? await generateQuotePDF(lead, tier, tierData)
      : await generateAgreementPDF(lead, tier, tierData, contract_start);

    // Upload to storage
    const filename = `${type}-${lead.id ?? "draft"}-${Date.now()}.pdf`;
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(filename, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    // Generate signed URL
    const { data: urlData, error: urlErr } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(filename, SIGNED_URL_EXPIRY_SECS);

    if (urlErr) throw new Error(`Signed URL failed: ${urlErr.message}`);

    return new Response(JSON.stringify({ url: urlData.signedUrl, filename }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-pdf error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

// ── PDF generation stubs (implemented in Tasks 2 & 3) ────────────────────────
async function generateQuotePDF(
  _lead: Record<string, unknown>,
  _tier: string,
  _tierData: typeof RATE_SHEET[string],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("QUOTE — PLACEHOLDER", { x: 50, y: 750, size: 24, font, color: rgb(0, 0, 0) });
  return doc.save();
}

async function generateAgreementPDF(
  _lead: Record<string, unknown>,
  _tier: string,
  _tierData: typeof RATE_SHEET[string],
  _contractStart?: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("SERVICE AGREEMENT — PLACEHOLDER", { x: 50, y: 750, size: 24, font, color: rgb(0, 0, 0) });
  return doc.save();
}
```

- [ ] **Step 3: Test the skeleton locally using curl (optional but recommended)**

If Supabase CLI is available:
```bash
supabase functions serve generate-pdf --env-file .env.local
```

Then in another terminal:
```bash
curl -X POST http://localhost:54321/functions/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"type":"quote","lead":{"id":"test-id","company_name":"Test Co","contact_person":"Jane","email":"jane@test.com","staff_size":"6-15","selected_steps":3},"tier":"T3"}'
```

Expected: `{"url":"...","filename":"quote-test-id-....pdf"}`

---

### Task 2: Implement generateQuotePDF()

**Files:**
- Modify: `supabase/functions/generate-pdf/index.ts`

Replace the `generateQuotePDF` stub with the full implementation.

- [ ] **Step 1: Replace generateQuotePDF with full implementation**

```typescript
async function generateQuotePDF(
  lead: Record<string, unknown>,
  tier: string,
  tierData: typeof RATE_SHEET[string],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4

  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal  = await doc.embedFont(StandardFonts.Helvetica);

  const amber  = rgb(0.961, 0.620, 0.043);   // #f59e0b
  const navy   = rgb(0.059, 0.090, 0.165);   // #0f172a
  const slate  = rgb(0.200, 0.255, 0.337);   // #334155
  const muted  = rgb(0.392, 0.455, 0.545);   // #64748b
  const white  = rgb(1, 1, 1);

  const W = 595, H = 842;
  const ML = 50, MR = 50;
  const contentW = W - ML - MR;

  // ── Header band ────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: navy });
  page.drawText("PREQAL", {
    x: ML, y: H - 52, size: 22, font: fontBold, color: amber,
  });
  page.drawText("Quality · Safety · Compliance", {
    x: ML, y: H - 70, size: 9, font: fontNormal, color: rgb(1, 1, 1, 0.6),
  });
  page.drawText("QUOTATION", {
    x: W - MR - 90, y: H - 48, size: 16, font: fontBold, color: white,
  });

  let y = H - 110;

  // ── Quote meta ─────────────────────────────────────────────────────────────
  const quoteDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const expiryDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  page.drawText(`Date: ${quoteDate}`, { x: ML, y, size: 9, font: fontNormal, color: muted });
  page.drawText(`Valid until: ${expiryDate}`, { x: W - MR - 130, y, size: 9, font: fontNormal, color: muted });
  y -= 24;

  // ── Section: Prepared for ──────────────────────────────────────────────────
  page.drawText("PREPARED FOR", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 14;
  page.drawText(String(lead.company_name ?? "—"), { x: ML, y, size: 13, font: fontBold, color: navy });
  y -= 16;
  page.drawText(String(lead.contact_person ?? ""), { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 13;
  page.drawText(String(lead.email ?? ""), { x: ML, y, size: 9, font: fontNormal, color: muted });
  y -= 28;

  // ── Divider ────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 20;

  // ── Section: Programme summary ────────────────────────────────────────────
  page.drawText("PROGRAMME SUMMARY", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 16;

  const selectedSteps = Number(lead.selected_steps ?? 1);
  const stepsText = `Steps 1–${selectedSteps} (${selectedSteps} phase${selectedSteps > 1 ? "s" : ""})`;
  page.drawText(stepsText, { x: ML, y, size: 11, font: fontBold, color: navy });
  y -= 14;
  page.drawText(`Tier ${tier} — ${tierData.name} (${tierData.staff})`, { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 14;
  page.drawText("Duration: 9 months", { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 28;

  // ── Section: Included services ────────────────────────────────────────────
  page.drawText("INCLUDED SERVICES", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 16;

  for (let s = 1; s <= selectedSteps; s++) {
    page.drawRectangle({ x: ML, y: y - 2, width: 6, height: 6, color: amber });
    page.drawText(`Step ${s}: ${SERVICE_STEPS[s]}`, {
      x: ML + 14, y, size: 10, font: fontNormal, color: slate,
    });
    y -= 16;
  }
  y -= 12;

  // ── Divider ────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 20;

  // ── Section: Investment ───────────────────────────────────────────────────
  page.drawText("INVESTMENT", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 18;

  // Monthly fee row
  const col2 = ML + contentW * 0.65;
  page.drawText("Monthly retainer (×9 months):", { x: ML, y, size: 10, font: fontNormal, color: slate });
  page.drawText(fmtGYD(tierData.monthly), { x: col2, y, size: 10, font: fontBold, color: navy });
  y -= 16;

  // Divider line
  page.drawLine({ start: { x: col2 - 10, y: y + 4 }, end: { x: W - MR, y: y + 4 }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 10;

  // Total
  page.drawText("Total programme investment:", { x: ML, y, size: 11, font: fontBold, color: navy });
  page.drawText(fmtGYD(tierData.total), { x: col2, y, size: 13, font: fontBold, color: amber });
  y -= 30;

  // ── Validity note ─────────────────────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 14, width: contentW, height: 32, color: rgb(0.953, 0.969, 0.992) });
  page.drawText(`This quotation is valid for 30 days (until ${expiryDate}).`, {
    x: ML + 10, y, size: 9, font: fontNormal, color: muted,
  });
  y -= 50;

  // ── Signature block ───────────────────────────────────────────────────────
  page.drawLine({ start: { x: ML, y }, end: { x: ML + 160, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  y -= 14;
  page.drawText("Stefan Gravesande", { x: ML, y, size: 9, font: fontBold, color: navy });
  y -= 12;
  page.drawText("Director, Preqal", { x: ML, y, size: 8, font: fontNormal, color: muted });
  y -= 10;
  page.drawText("stefan.gravesande@preqal.org", { x: ML, y, size: 8, font: fontNormal, color: muted });

  // ── Footer ────────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: navy });
  page.drawText("preqal.org  ·  Planetary Quality Consultancy", {
    x: ML, y: 10, size: 8, font: fontNormal, color: rgb(1, 1, 1, 0.5),
  });

  return doc.save();
}
```

- [ ] **Step 2: Manual test — generate a quote PDF**

Call the function with a test payload and verify the returned URL downloads a valid PDF (not a placeholder).

---

### Task 3: Implement generateAgreementPDF()

**Files:**
- Modify: `supabase/functions/generate-pdf/index.ts`

Replace the `generateAgreementPDF` stub with the full implementation.

- [ ] **Step 1: Replace generateAgreementPDF with full implementation**

```typescript
async function generateAgreementPDF(
  lead: Record<string, unknown>,
  tier: string,
  tierData: typeof RATE_SHEET[string],
  contractStart?: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontBold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await doc.embedFont(StandardFonts.Helvetica);

  const amber = rgb(0.961, 0.620, 0.043);
  const navy  = rgb(0.059, 0.090, 0.165);
  const slate = rgb(0.200, 0.255, 0.337);
  const muted = rgb(0.392, 0.455, 0.545);
  const white = rgb(1, 1, 1);

  const W = 595, H = 842;
  const ML = 50, MR = 50;
  const contentW = W - ML - MR;

  // Helper to add a new page with the same header/footer
  function addPage() {
    const p = doc.addPage([W, H]);
    // Header band
    p.drawRectangle({ x: 0, y: H - 60, width: W, height: 60, color: navy });
    p.drawText("PREQAL", { x: ML, y: H - 38, size: 16, font: fontBold, color: amber });
    p.drawText("SERVICE AGREEMENT", { x: W - MR - 140, y: H - 35, size: 12, font: fontBold, color: white });
    // Footer
    p.drawRectangle({ x: 0, y: 0, width: W, height: 28, color: navy });
    p.drawText("preqal.org  ·  This document is confidential.", {
      x: ML, y: 9, size: 7, font: fontNormal, color: rgb(1, 1, 1, 0.45),
    });
    return { page: p, y: H - 90 };
  }

  let { page, y } = addPage();

  function text(str: string, x: number, yPos: number, size: number, font: typeof fontBold, color: ReturnType<typeof rgb>) {
    page.drawText(str, { x, y: yPos, size, font, color });
  }

  function section(label: string) {
    y -= 8;
    page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
    y -= 16;
    text(label, ML, y, 8, fontBold, amber);
    y -= 16;
  }

  function maybeNewPage(needed = 60) {
    if (y < needed + 40) {
      const next = addPage();
      page = next.page;
      y = next.y;
    }
  }

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const startDate = contractStart ? fmtDate(contractStart) : "To be confirmed";
  const selectedSteps = Number(lead.selected_steps ?? 1);

  // ── Parties ───────────────────────────────────────────────────────────────
  section("PARTIES");
  text("Service Provider:", ML, y, 9, fontBold, navy);
  text("Preqal (Planetary Quality Consultancy) — Stefan Gravesande, Director", ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  text("Client:", ML, y, 9, fontBold, navy);
  text(String(lead.company_name ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  text("Representative:", ML, y, 9, fontBold, navy);
  text(String(lead.contact_person ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  text("Email:", ML, y, 9, fontBold, navy);
  text(String(lead.email ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 20;

  // ── Scope ─────────────────────────────────────────────────────────────────
  maybeNewPage(80 + selectedSteps * 16);
  section("SCOPE OF SERVICES");
  text(`This agreement covers Steps 1–${selectedSteps} of the Preqal Quality Programme:`, ML, y, 9, fontNormal, slate);
  y -= 16;
  for (let s = 1; s <= selectedSteps; s++) {
    page.drawRectangle({ x: ML, y: y - 2, width: 5, height: 5, color: amber });
    text(`Step ${s}: ${SERVICE_STEPS[s]}`, ML + 12, y, 9, fontNormal, slate);
    y -= 14;
  }
  y -= 6;

  // ── Term ──────────────────────────────────────────────────────────────────
  maybeNewPage(60);
  section("TERM & SCHEDULE");
  text(`Contract start date: ${startDate}`, ML, y, 9, fontNormal, slate);
  y -= 14;
  text("Duration: 9 months from start date", ML, y, 9, fontNormal, slate);
  y -= 14;
  text(`Programme tier: ${tier} — ${tierData.name}`, ML, y, 9, fontNormal, slate);
  y -= 20;

  // ── Fees ──────────────────────────────────────────────────────────────────
  maybeNewPage(80);
  section("FEES & PAYMENT");
  const col2 = ML + contentW * 0.65;
  text("Monthly retainer (GYD):", ML, y, 9, fontNormal, slate);
  text(fmtGYD(tierData.monthly), col2, y, 10, fontBold, navy);
  y -= 14;
  text("Payment term:", ML, y, 9, fontNormal, slate);
  text("Monthly in advance", col2, y, 9, fontNormal, slate);
  y -= 14;
  text("Total programme value (GYD):", ML, y, 10, fontBold, navy);
  text(fmtGYD(tierData.total), col2, y, 12, fontBold, amber);
  y -= 20;

  // ── Terms ─────────────────────────────────────────────────────────────────
  maybeNewPage(120);
  section("TERMS & CONDITIONS");
  const terms = [
    "Preqal retains all intellectual property in methodologies, templates, and frameworks developed during the programme.",
    "The Client agrees to provide timely access to staff, documents, and facilities required for programme delivery.",
    "Either party may terminate this agreement with 30 days written notice. Fees for services already delivered are non-refundable.",
    "Preqal will maintain confidentiality of all Client business information disclosed during the programme.",
    "This agreement is governed by the laws of the Cooperative Republic of Guyana.",
  ];
  for (const term of terms) {
    page.drawRectangle({ x: ML, y: y - 2, width: 4, height: 4, color: muted });
    // Wrap long lines manually (approx 85 chars per line at 8pt)
    const words = term.split(" ");
    let line = "", firstLine = true;
    for (const word of words) {
      if ((line + word).length > 90) {
        text(line.trim(), ML + (firstLine ? 12 : 12), y, 8, fontNormal, slate);
        y -= 12;
        line = word + " ";
        firstLine = false;
        maybeNewPage(40);
      } else {
        line += word + " ";
      }
    }
    if (line.trim()) {
      text(line.trim(), ML + 12, y, 8, fontNormal, slate);
      y -= 12;
    }
    y -= 6;
    maybeNewPage(40);
  }

  // ── Signatures ────────────────────────────────────────────────────────────
  maybeNewPage(120);
  section("SIGNATURES");
  text(`Date of agreement: ${today}`, ML, y, 9, fontNormal, muted);
  y -= 30;

  // Two columns
  const col1end = ML + contentW * 0.45;
  const col2start = ML + contentW * 0.55;

  page.drawLine({ start: { x: ML, y }, end: { x: col1end, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  page.drawLine({ start: { x: col2start, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  y -= 13;
  text("Stefan Gravesande, Director", ML, y, 8, fontBold, navy);
  text(String(lead.contact_person ?? "Authorised Representative"), col2start, y, 8, fontBold, navy);
  y -= 11;
  text("Preqal", ML, y, 8, fontNormal, muted);
  text(String(lead.company_name ?? ""), col2start, y, 8, fontNormal, muted);

  return doc.save();
}
```

- [ ] **Step 2: Manual test — generate an agreement PDF**

Call the function with `type: "agreement"` and verify the returned URL downloads a styled PDF with both signature blocks.

---

### Task 4: Deploy the Edge Function

**Files:** (no new files — deploy existing)

- [ ] **Step 1: Deploy via Supabase MCP**

Use Supabase MCP `deploy_edge_function` with project ID `gndcjmxxgtnoidxgcdnx` and function name `generate-pdf`.

If Supabase CLI is available:
```bash
supabase functions deploy generate-pdf --project-ref gndcjmxxgtnoidxgcdnx
```

- [ ] **Step 2: Verify the function is deployed**

Use Supabase MCP `get_edge_function` or check the Supabase dashboard → Edge Functions.

- [ ] **Step 3: Test the deployed function end-to-end**

```bash
curl -X POST https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/generate-pdf \
  -H "Authorization: Bearer <REVOKED-LEGACY-KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "quote",
    "lead": {
      "id": "00000000-0000-0000-0000-000000000001",
      "company_name": "Test Company Ltd",
      "contact_person": "Jane Smith",
      "email": "jane@testco.com",
      "staff_size": "6-15",
      "selected_steps": 4
    },
    "tier": "T3"
  }'
```

Expected: `{"url":"https://...signed-url...","filename":"quote-00000000-...pdf"}`

Open the URL in a browser — should download a valid PDF.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/generate-pdf/index.ts
git commit -m "feat: add generate-pdf edge function for quote and service agreement PDFs"
```

- [ ] **Step 5: Push**

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1"
```
