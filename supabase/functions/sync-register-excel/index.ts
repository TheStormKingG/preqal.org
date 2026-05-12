// supabase/functions/sync-register-excel/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error — npm specifier works at Deno runtime
import ExcelJS from "npm:exceljs@4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Brand colours ─────────────────────────────────────────────────────────────
const NAVY        = "FF0F172A";
const WHITE       = "FFFFFFFF";
const AMBER_LIGHT = "FFFEF3C7";
const GRAY_BG     = "FFF8FAFC";
const GRAY_BORDER = "FFCBD5E1";
const SLATE       = "FF334155";

function navyFill()       { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: NAVY } }; }
function amberLightFill() { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: AMBER_LIGHT } }; }
function grayFill()       { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: GRAY_BG } }; }
function whiteFill()      { return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: WHITE } }; }

function thinBorder() {
  const s = { style: "thin" as const, color: { argb: GRAY_BORDER } };
  return { top: s, left: s, bottom: s, right: s };
}

function titleBlock(ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) {
  ws.mergeCells(1, 1, 1, colCount);
  const t = ws.getRow(1);
  t.getCell(1).value = title;
  t.getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: "FF0F172A" } };
  t.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  t.getCell(1).fill = amberLightFill();
  t.height = 36;

  ws.mergeCells(2, 1, 2, colCount);
  const s = ws.getRow(2);
  s.getCell(1).value = subtitle;
  s.getCell(1).font = { name: "Arial", size: 10, color: { argb: SLATE } };
  s.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  s.getCell(1).fill = whiteFill();
  s.height = 20;

  ws.addRow([]); // spacer row 3
}

function applyHeader(ws: ExcelJS.Worksheet, headers: string[], widths: number[]) {
  const row = ws.addRow(headers);
  row.eachCell((cell) => {
    cell.fill = navyFill();
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: WHITE } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  });
  row.height = 28;
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function applyData(ws: ExcelJS.Worksheet, values: unknown[], isAlt: boolean) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = isAlt ? grayFill() : whiteFill();
    cell.font = { name: "Arial", size: 10, color: { argb: SLATE } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = thinBorder();
  });
  row.height = 18;
}

// ── Register config types ──────────────────────────────────────────────────────
interface ColDef   { header: string; key: string; width: number; }
interface SheetDef { name: string; columns: ColDef[]; }
interface RegConfig { table: string; filename: string; title: string; sheets: SheetDef[]; }

// ── Register definitions — one entry per sidebar register ──────────────────────
const REGISTERS: Record<string, RegConfig> = {
  docs: {
    table: "qms_documents",
    filename: "REG-01-Document-Register.xlsx",
    title: "REG-01 — Document Register",
    sheets: [{ name: "Documents", columns: [
      { header: "Doc ID",      key: "doc_id",      width: 14 },
      { header: "Title",       key: "title",       width: 42 },
      { header: "Category",    key: "category",    width: 12 },
      { header: "Version",     key: "version",     width: 10 },
      { header: "Status",      key: "status",      width: 16 },
      { header: "Owner",       key: "owner",       width: 28 },
      { header: "Issue Date",  key: "issue_date",  width: 14 },
      { header: "Review Date", key: "review_date", width: 16 },
    ]}],
  },
  context: {
    table: "qms_context_issues",
    filename: "REG-03-Context-Register.xlsx",
    title: "REG-03 — Context of the Organisation",
    sheets: [{ name: "Issues", columns: [
      { header: "Record ID",    key: "record_id",        width: 14 },
      { header: "Category",     key: "context_category", width: 16 },
      { header: "Type",         key: "factor_type",      width: 14 },
      { header: "SWOT",         key: "swot_type",        width: 12 },
      { header: "Description",  key: "issue_description",width: 45 },
      { header: "Impact Area",  key: "impact_area",      width: 22 },
      { header: "Impact",       key: "impact_level",     width: 10 },
      { header: "Likelihood",   key: "likelihood",       width: 12 },
      { header: "Status",       key: "status",           width: 16 },
      { header: "Owner",        key: "owner",            width: 25 },
      { header: "Review Date",  key: "review_date",      width: 14 },
    ]}],
  },
  employees: {
    table: "qms_employees",
    filename: "REG-04-Employee-Register.xlsx",
    title: "REG-04 — Employee Register",
    sheets: [{ name: "Employees", columns: [
      { header: "Emp ID",       key: "record_id",       width: 14 },
      { header: "Full Name",    key: "full_name",        width: 28 },
      { header: "Position",     key: "position",         width: 28 },
      { header: "Department",   key: "department",       width: 20 },
      { header: "Type",         key: "employment_type",  width: 16 },
      { header: "Email",        key: "email",            width: 30 },
      { header: "Phone",        key: "phone",            width: 18 },
      { header: "Start Date",   key: "start_date",       width: 14 },
      { header: "Status",       key: "status",           width: 14 },
    ]}],
  },
  hse: {
    table: "qms_hse_risk",
    filename: "REG-05-HSE-Risk-Register.xlsx",
    title: "REG-05 — HSE Risk Register",
    sheets: [{ name: "Risk Register", columns: [
      { header: "Risk ID",        key: "risk_id",           width: 12 },
      { header: "Hazard",         key: "hazard",            width: 32 },
      { header: "Category",       key: "hazard_category",   width: 20 },
      { header: "Persons at Risk",key: "persons_at_risk",   width: 22 },
      { header: "Likelihood",     key: "likelihood",        width: 13 },
      { header: "Consequence",    key: "consequence",       width: 14 },
      { header: "Risk Score",     key: "risk_rating",       width: 13 },
      { header: "Residual Risk",  key: "residual_rating",   width: 15 },
      { header: "Status",         key: "status",            width: 16 },
      { header: "Responsible",    key: "responsible_person",width: 25 },
      { header: "Review Date",    key: "review_date",       width: 14 },
    ]}],
  },
  audit: {
    table: "qms_audit",
    filename: "REG-06-Audit-Register.xlsx",
    title: "REG-06 — Audit Register",
    sheets: [{ name: "Audits", columns: [
      { header: "Audit No.",       key: "audit_number",         width: 16 },
      { header: "Type",            key: "audit_type",           width: 16 },
      { header: "Scope",           key: "audit_scope",          width: 40 },
      { header: "Auditor",         key: "auditor",              width: 22 },
      { header: "Auditee",         key: "auditee",              width: 22 },
      { header: "Scheduled",       key: "scheduled_date",       width: 14 },
      { header: "Conducted",       key: "conducted_date",       width: 14 },
      { header: "Minor Findings",  key: "findings_minor",       width: 16 },
      { header: "Major Findings",  key: "findings_major",       width: 16 },
      { header: "Observations",    key: "findings_observation", width: 16 },
      { header: "Status",          key: "status",               width: 16 },
    ]}],
  },
  ncr: {
    table: "qms_ncr",
    filename: "REG-07-NCR-Register.xlsx",
    title: "REG-07 — Non-Conformance Register",
    sheets: [{ name: "NCR Log", columns: [
      { header: "NCR No.",      key: "ncr_number",    width: 16 },
      { header: "Date",         key: "detected_date", width: 14 },
      { header: "Title",        key: "title",         width: 35 },
      { header: "Source",       key: "source",        width: 18 },
      { header: "Process Area", key: "process_area",  width: 22 },
      { header: "Severity",     key: "severity",      width: 14 },
      { header: "Status",       key: "status",        width: 18 },
      { header: "Root Cause",   key: "root_cause",    width: 35 },
    ]}],
  },
  capa: {
    table: "qms_capa",
    filename: "REG-07b-CAPA-Register.xlsx",
    title: "REG-07b — CAPA Register",
    sheets: [{ name: "CAPA Log", columns: [
      { header: "CAPA No.",     key: "capa_number", width: 16 },
      { header: "Type",         key: "type",        width: 14 },
      { header: "Title",        key: "title",       width: 35 },
      { header: "Source",       key: "source",      width: 18 },
      { header: "Assigned To",  key: "assigned_to", width: 22 },
      { header: "Due Date",     key: "due_date",    width: 14 },
      { header: "Status",       key: "status",      width: 16 },
      { header: "Action Taken", key: "action_taken",width: 40 },
    ]}],
  },
  qr: {
    table: "qms_quality_risk",
    filename: "REG-08-Quality-Risk-Register.xlsx",
    title: "REG-08 — Quality Risk Register",
    sheets: [{ name: "Quality Risks", columns: [
      { header: "Risk ID",      key: "risk_id",         width: 14 },
      { header: "Title",        key: "risk_title",      width: 35 },
      { header: "Type",         key: "risk_type",       width: 14 },
      { header: "Category",     key: "risk_category",   width: 18 },
      { header: "Likelihood",   key: "likelihood",      width: 13 },
      { header: "Impact",       key: "impact",          width: 12 },
      { header: "Risk Score",   key: "risk_rating",     width: 13 },
      { header: "Residual",     key: "residual_rating", width: 13 },
      { header: "Treatment",    key: "treatment_option",width: 16 },
      { header: "Owner",        key: "risk_owner",      width: 22 },
      { header: "Status",       key: "status",          width: 16 },
      { header: "Review Date",  key: "review_date",     width: 14 },
    ]}],
  },
  legal: {
    table: "qms_legal_register",
    filename: "REG-09-Legal-Register.xlsx",
    title: "REG-09 — Legal & Compliance Register",
    sheets: [{ name: "Legal Obligations", columns: [
      { header: "Record ID",     key: "record_id",          width: 14 },
      { header: "Title",         key: "title",              width: 40 },
      { header: "Category",      key: "category",           width: 18 },
      { header: "Jurisdiction",  key: "jurisdiction",       width: 18 },
      { header: "Reference No.", key: "reference_number",   width: 18 },
      { header: "Applies To",    key: "applicable_to",      width: 22 },
      { header: "Responsible",   key: "responsible_person", width: 22 },
      { header: "Compliance",    key: "compliance_status",  width: 18 },
      { header: "Review Date",   key: "review_date",        width: 14 },
    ]}],
  },
  org: {
    table: "qms_org_register",
    filename: "REG-10-Stakeholder-Register.xlsx",
    title: "REG-10 — Interested Parties Register",
    sheets: [{ name: "Stakeholders", columns: [
      { header: "Record ID",    key: "record_id",            width: 14 },
      { header: "Entity Name",  key: "entity_name",          width: 30 },
      { header: "Context Type", key: "context_type",         width: 16 },
      { header: "Entity Type",  key: "entity_type",          width: 18 },
      { header: "Priority",     key: "priority",             width: 12 },
      { header: "Needs",        key: "needs_expectations",   width: 40 },
      { header: "Compliance",   key: "compliance_obligation",width: 14 },
      { header: "Status",       key: "status",               width: 16 },
      { header: "Review Date",  key: "review_date",          width: 14 },
    ]}],
  },
};

// ── Helper ─────────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ── CORS ───────────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Handler ────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight — must come before any auth check
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Require a valid JWT (Supabase injects Authorization header via sb.functions.invoke)
  if (!req.headers.get("Authorization")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { registerKey, clientId } = await req.json() as {
      registerKey: string;
      clientId: string | null;
    };

    const config = REGISTERS[registerKey];
    if (!config) return json({ error: `Unknown registerKey: ${registerKey}` }, 400);

    // Query all rows for this register + client context
    let query = sb.from(config.table).select("*");
    if (clientId) {
      query = query.eq("client_id", clientId);
    } else {
      query = query.is("client_id", null);
    }
    const { data: rows, error: dbErr } = await query;
    if (dbErr) throw dbErr;

    // Build subtitle label
    let subtitle = "Preqal IMS | ISO 9001:2015";
    if (clientId) {
      const { data: client } = await sb
        .from("crm_clients")
        .select("company_name")
        .eq("id", clientId)
        .single();
      subtitle = client ? `${client.company_name} IMS | Preqal` : `Client ${clientId}`;
    }

    // Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "Preqal";
    wb.created = new Date();

    for (const sheet of config.sheets) {
      const ws = wb.addWorksheet(sheet.name);
      titleBlock(ws, config.title, subtitle, sheet.columns.length);
      applyHeader(ws, sheet.columns.map((c) => c.header), sheet.columns.map((c) => c.width));
      (rows ?? []).forEach((r: Record<string, unknown>, i: number) => {
        applyData(ws, sheet.columns.map((c) => r[c.key] ?? ""), i % 2 === 1);
      });
      ws.views = [{ state: "frozen", ySplit: 4 }];
    }

    const buf: Uint8Array = (await wb.xlsx.writeBuffer()) as Uint8Array;

    // Upload to Storage
    const storagePath = clientId
      ? `clients/${clientId}/${config.filename}`
      : `preqal/${config.filename}`;

    const { error: upErr } = await sb.storage
      .from("registers")
      .upload(storagePath, buf, {
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });
    if (upErr) throw upErr;

    console.warn(`sync-register-excel: ${storagePath} — ${(rows ?? []).length} rows`);
    return json({ ok: true, path: storagePath, rows: (rows ?? []).length });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync-register-excel error:", msg);
    return json({ error: msg }, 500);
  }
});
