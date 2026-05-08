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
  T1: { name: "Solo Founder",        staff: "1 person",    monthly: 50000,  total: 450000  },
  T2: { name: "Micro Business",      staff: "2–5 people",  monthly: 70000,  total: 630000  },
  T3: { name: "Small Business",      staff: "6–15 people", monthly: 90000,  total: 810000  },
  T4: { name: "Growing SME",         staff: "16–40 people",monthly: 120000, total: 1080000 },
  T5: { name: "Medium Company",      staff: "41–100 people",monthly: 180000, total: 1620000 },
  T6: { name: "Large Organisation",  staff: "100+ people", monthly: 233333, total: 2099997 },
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

// ── generateQuotePDF ──────────────────────────────────────────────────────────
async function generateQuotePDF(
  lead: Record<string, unknown>,
  tier: string,
  tierData: typeof RATE_SHEET[string],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4

  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal  = await doc.embedFont(StandardFonts.Helvetica);

  const amber  = rgb(0.961, 0.620, 0.043);
  const navy   = rgb(0.059, 0.090, 0.165);
  const slate  = rgb(0.200, 0.255, 0.337);
  const muted  = rgb(0.392, 0.455, 0.545);
  const white  = rgb(1, 1, 1);

  const W = 595, H = 842;
  const ML = 50, MR = 50;
  const contentW = W - ML - MR;

  // Header band
  page.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: navy });
  page.drawText("PREQAL", {
    x: ML, y: H - 52, size: 22, font: fontBold, color: amber,
  });
  page.drawText("Quality · Safety · Compliance", {
    x: ML, y: H - 70, size: 9, font: fontNormal, color: rgb(1, 1, 1),
  });
  page.drawText("QUOTATION", {
    x: W - MR - 90, y: H - 48, size: 16, font: fontBold, color: white,
  });

  let y = H - 110;

  // Quote meta
  const quoteDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const expiryDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  page.drawText(`Date: ${quoteDate}`, { x: ML, y, size: 9, font: fontNormal, color: muted });
  page.drawText(`Valid until: ${expiryDate}`, { x: W - MR - 130, y, size: 9, font: fontNormal, color: muted });
  y -= 24;

  // Prepared for
  page.drawText("PREPARED FOR", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 14;
  page.drawText(String(lead.company_name ?? "—"), { x: ML, y, size: 13, font: fontBold, color: navy });
  y -= 16;
  page.drawText(String(lead.contact_person ?? ""), { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 13;
  page.drawText(String(lead.email ?? ""), { x: ML, y, size: 9, font: fontNormal, color: muted });
  y -= 28;

  // Divider
  page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 20;

  // Programme summary
  page.drawText("PROGRAMME SUMMARY", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 16;

  const selectedSteps = Number(lead.selected_steps ?? 1);
  const stepsText = `Steps 1-${selectedSteps} (${selectedSteps} phase${selectedSteps > 1 ? "s" : ""})`;
  page.drawText(stepsText, { x: ML, y, size: 11, font: fontBold, color: navy });
  y -= 14;
  page.drawText(`Tier ${tier} - ${tierData.name} (${tierData.staff})`, { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 14;
  page.drawText("Duration: 9 months", { x: ML, y, size: 10, font: fontNormal, color: slate });
  y -= 28;

  // Included services
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

  // Divider
  page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 20;

  // Investment
  page.drawText("INVESTMENT", { x: ML, y, size: 8, font: fontBold, color: amber });
  y -= 18;

  const col2 = ML + contentW * 0.65;
  page.drawText("Monthly retainer (x9 months):", { x: ML, y, size: 10, font: fontNormal, color: slate });
  page.drawText(fmtGYD(tierData.monthly), { x: col2, y, size: 10, font: fontBold, color: navy });
  y -= 16;

  page.drawLine({ start: { x: col2 - 10, y: y + 4 }, end: { x: W - MR, y: y + 4 }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
  y -= 10;

  page.drawText("Total programme investment:", { x: ML, y, size: 11, font: fontBold, color: navy });
  page.drawText(fmtGYD(tierData.total), { x: col2, y, size: 13, font: fontBold, color: amber });
  y -= 30;

  // Validity note
  page.drawRectangle({ x: ML, y: y - 14, width: contentW, height: 32, color: rgb(0.953, 0.969, 0.992) });
  page.drawText(`This quotation is valid for 30 days (until ${expiryDate}).`, {
    x: ML + 10, y, size: 9, font: fontNormal, color: muted,
  });
  y -= 50;

  // Signature block
  page.drawLine({ start: { x: ML, y }, end: { x: ML + 160, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  y -= 14;
  page.drawText("Stefan Gravesande", { x: ML, y, size: 9, font: fontBold, color: navy });
  y -= 12;
  page.drawText("Director, Preqal", { x: ML, y, size: 8, font: fontNormal, color: muted });
  y -= 10;
  page.drawText("stefan.gravesande@preqal.org", { x: ML, y, size: 8, font: fontNormal, color: muted });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: navy });
  page.drawText("preqal.org  -  Planetary Quality Consultancy", {
    x: ML, y: 10, size: 8, font: fontNormal, color: rgb(1, 1, 1),
  });

  return doc.save();
}

// ── generateAgreementPDF ──────────────────────────────────────────────────────
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

  function addPage() {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: H - 60, width: W, height: 60, color: navy });
    p.drawText("PREQAL", { x: ML, y: H - 38, size: 16, font: fontBold, color: amber });
    p.drawText("SERVICE AGREEMENT", { x: W - MR - 140, y: H - 35, size: 12, font: fontBold, color: white });
    p.drawRectangle({ x: 0, y: 0, width: W, height: 28, color: navy });
    p.drawText("preqal.org  -  This document is confidential.", {
      x: ML, y: 9, size: 7, font: fontNormal, color: rgb(1, 1, 1),
    });
    return { page: p, y: H - 90 };
  }

  let { page, y } = addPage();

  function drawText(str: string, x: number, yPos: number, size: number, font: typeof fontBold, color: ReturnType<typeof rgb>) {
    page.drawText(str, { x, y: yPos, size, font, color });
  }

  function section(label: string) {
    y -= 8;
    page.drawLine({ start: { x: ML, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.9) });
    y -= 16;
    drawText(label, ML, y, 8, fontBold, amber);
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

  // Parties
  section("PARTIES");
  drawText("Service Provider:", ML, y, 9, fontBold, navy);
  drawText("Preqal (Planetary Quality Consultancy) - Stefan Gravesande, Director", ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  drawText("Client:", ML, y, 9, fontBold, navy);
  drawText(String(lead.company_name ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  drawText("Representative:", ML, y, 9, fontBold, navy);
  drawText(String(lead.contact_person ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 14;
  drawText("Email:", ML, y, 9, fontBold, navy);
  drawText(String(lead.email ?? "—"), ML + 110, y, 9, fontNormal, slate);
  y -= 20;

  // Scope
  maybeNewPage(80 + selectedSteps * 16);
  section("SCOPE OF SERVICES");
  drawText(`This agreement covers Steps 1-${selectedSteps} of the Preqal Quality Programme:`, ML, y, 9, fontNormal, slate);
  y -= 16;
  for (let s = 1; s <= selectedSteps; s++) {
    page.drawRectangle({ x: ML, y: y - 2, width: 5, height: 5, color: amber });
    drawText(`Step ${s}: ${SERVICE_STEPS[s]}`, ML + 12, y, 9, fontNormal, slate);
    y -= 14;
  }
  y -= 6;

  // Term
  maybeNewPage(60);
  section("TERM & SCHEDULE");
  drawText(`Contract start date: ${startDate}`, ML, y, 9, fontNormal, slate);
  y -= 14;
  drawText("Duration: 9 months from start date", ML, y, 9, fontNormal, slate);
  y -= 14;
  drawText(`Programme tier: ${tier} - ${tierData.name}`, ML, y, 9, fontNormal, slate);
  y -= 20;

  // Fees
  maybeNewPage(80);
  section("FEES & PAYMENT");
  const col2 = ML + contentW * 0.65;
  drawText("Monthly retainer (GYD):", ML, y, 9, fontNormal, slate);
  drawText(fmtGYD(tierData.monthly), col2, y, 10, fontBold, navy);
  y -= 14;
  drawText("Payment term:", ML, y, 9, fontNormal, slate);
  drawText("Monthly in advance", col2, y, 9, fontNormal, slate);
  y -= 14;
  drawText("Total programme value (GYD):", ML, y, 10, fontBold, navy);
  drawText(fmtGYD(tierData.total), col2, y, 12, fontBold, amber);
  y -= 20;

  // Terms
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
    const words = term.split(" ");
    let line = "", firstLine = true;
    for (const word of words) {
      if ((line + word).length > 90) {
        drawText(line.trim(), ML + 12, y, 8, fontNormal, slate);
        y -= 12;
        line = word + " ";
        firstLine = false;
        maybeNewPage(40);
      } else {
        line += word + " ";
      }
    }
    if (line.trim()) {
      drawText(line.trim(), ML + 12, y, 8, fontNormal, slate);
      y -= 12;
    }
    y -= 6;
    maybeNewPage(40);
    void firstLine;
  }

  // Signatures
  maybeNewPage(120);
  section("SIGNATURES");
  drawText(`Date of agreement: ${today}`, ML, y, 9, fontNormal, muted);
  y -= 30;

  const col1end = ML + contentW * 0.45;
  const col2start = ML + contentW * 0.55;

  page.drawLine({ start: { x: ML, y }, end: { x: col1end, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  page.drawLine({ start: { x: col2start, y }, end: { x: W - MR, y }, thickness: 0.5, color: rgb(0.7, 0.75, 0.8) });
  y -= 13;
  drawText("Stefan Gravesande, Director", ML, y, 8, fontBold, navy);
  drawText(String(lead.contact_person ?? "Authorised Representative"), col2start, y, 8, fontBold, navy);
  y -= 11;
  drawText("Preqal", ML, y, 8, fontNormal, muted);
  drawText(String(lead.company_name ?? ""), col2start, y, 8, fontNormal, muted);

  return doc.save();
}
