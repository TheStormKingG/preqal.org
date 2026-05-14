// supabase/functions/sync-register-excel/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error — npm specifier works at Deno runtime
import ExcelJS from "npm:exceljs@4";
import {
  applyPreqalHeader,
  applyDataHeader,
  applyDataRow,
  type BrandedMeta,
} from "./branding.ts";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Register config types ──────────────────────────────────────────────────────
interface ColDef   { header: string; key: string; width: number; }
interface SheetDef { name: string; columns: ColDef[]; }
interface RegConfig {
  table: string;
  filename: string;
  title: string;       // PREQAL-uppercase title shown in the branded header
  dcn: string;
  scope: string;
  breakdownBy?: string; // column name to group for the breakdown panel
  sheets: SheetDef[];
}

// ── Register definitions — one entry per sidebar register ──────────────────────
// Keyed by legacy short keys (`docs`, `context`, …) used by `public/qms.html`.
// New `REG-XX` keys are added as aliases below so DB triggers can call this
// function with the canonical register id.
const REGISTERS: Record<string, RegConfig> = {
  docs: {
    table: "qms_documents",
    filename: "REG-01-Document-Master-Register.xlsx",
    title: "PREQAL DOCUMENT MASTER REGISTER",
    dcn: "PQL-REG-01",
    scope: "PREQAL INTEGRATED MANAGEMENT SYSTEM",
    breakdownBy: "category",
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
    title: "PREQAL CONTEXT OF THE ORGANISATION",
    dcn: "PQL-REG-03",
    scope: "ISO 9001:2015 §4.1 + §4.2",
    breakdownBy: "context_category",
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
    title: "PREQAL EMPLOYEE REGISTER",
    dcn: "PQL-REG-04",
    scope: "HUMAN RESOURCES",
    breakdownBy: "department",
    sheets: [{ name: "Employees", columns: [
      { header: "Emp ID",       key: "record_id",        width: 14 },
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
    title: "PREQAL HSE RISK REGISTER",
    dcn: "PQL-REG-05",
    scope: "HEALTH, SAFETY & ENVIRONMENT",
    breakdownBy: "hazard_category",
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
    filename: "REG-06-Internal-Audit-Register.xlsx",
    title: "PREQAL INTERNAL AUDIT REGISTER",
    dcn: "PQL-REG-06",
    scope: "ISO 9001:2015 §9.2",
    breakdownBy: "audit_type",
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
    title: "PREQAL NON-CONFORMANCE REGISTER",
    dcn: "PQL-REG-07",
    scope: "NON-CONFORMANCE TO CORRECTIVE ACTION",
    breakdownBy: "severity",
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
    title: "PREQAL CAPA REGISTER",
    dcn: "PQL-REG-07b",
    scope: "CORRECTIVE & PREVENTIVE ACTION",
    breakdownBy: "type",
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
    title: "PREQAL QUALITY RISK REGISTER",
    dcn: "PQL-REG-08",
    scope: "ISO 9001:2015 §6.1",
    breakdownBy: "risk_category",
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
    title: "PREQAL LEGAL & COMPLIANCE REGISTER",
    dcn: "PQL-REG-09",
    scope: "LEGAL OBLIGATIONS",
    breakdownBy: "category",
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
    title: "PREQAL INTERESTED PARTIES REGISTER",
    dcn: "PQL-REG-10",
    scope: "ISO 9001:2015 §4.2",
    breakdownBy: "context_type",
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
  // REG-02 lead register — driven by qualified_leads. New register, no
  // legacy short-key alias in qms.html, but DB triggers POST `REG-02`.
  "REG-02": {
    table: "qualified_leads",
    filename: "REG-02-Lead-Register.xlsx",
    title: "PREQAL LEAD REGISTER",
    dcn: "PQL-REG-02",
    scope: "COMMERCIAL — LEAD CAPTURE TO QUALIFIED",
    breakdownBy: "status",
    sheets: [{ name: "Leads", columns: [
      { header: "Lead ID",             key: "id",                   width: 38 },
      { header: "Company",             key: "company_name",         width: 28 },
      { header: "Contact",             key: "contact_person",       width: 24 },
      { header: "Email",               key: "email",                width: 28 },
      { header: "Staff Size",          key: "staff_size",           width: 12 },
      { header: "Services",            key: "num_services",         width: 12 },
      { header: "Business Description",key: "business_description", width: 40 },
      { header: "Base Tier",           key: "base_tier",            width: 12 },
      { header: "Recommended Tier",    key: "recommended_tier",     width: 14 },
      { header: "Status",              key: "status",               width: 14 },
      { header: "Submitted",           key: "created_at",           width: 18 },
    ]}],
  },
  // REG-10 (CRM) — overrides the legacy `org` key for crm_clients-driven output.
  "REG-10": {
    table: "crm_clients",
    filename: "REG-10-CRM-Client-Register.xlsx",
    title: "PREQAL CRM CLIENT REGISTER",
    dcn: "PQL-REG-10",
    scope: "CLIENT LIFECYCLE",
    breakdownBy: "pipeline_stage",
    sheets: [{ name: "Clients", columns: [
      { header: "Client ID",        key: "id",               width: 38 },
      { header: "Company",          key: "company_name",     width: 30 },
      { header: "Contact",          key: "contact_name",     width: 24 },
      { header: "Email",            key: "contact_email",    width: 28 },
      { header: "Pipeline Stage",   key: "pipeline_stage",   width: 18 },
      { header: "Onboarding Stage", key: "onboarding_stage", width: 18 },
      { header: "Tier",             key: "tier",             width: 12 },
      { header: "QMS Active",       key: "qms_active",       width: 12 },
      { header: "Created",          key: "created_at",       width: 18 },
    ]}],
  },
};

// REG-01 alias points to the same config as the legacy `docs` key.
REGISTERS["REG-01"] = REGISTERS.docs;
// Older `org` short-key callers also map to the new REG-10 layout when the
// triggers fire; qms.html's local cache will pick up the new filename on next
// page load. The legacy `org` entry above stays for backward compat.

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

// ── Breakdown computation ──────────────────────────────────────────────────────
function computeBreakdown(
  rows: Array<Record<string, unknown>>,
  field: string | undefined,
): Array<[string, number]> {
  if (!field) return [];
  const counts = new Map<string, number>();
  for (const r of rows) {
    const raw = r[field];
    const k = raw == null || raw === "" ? "—" : String(raw);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
}

// ── Handler ────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight — must come before any auth check
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Require a valid Authorization header (Supabase JWT or service-role token).
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
    // qualified_leads and crm_clients don't have a client_id column; only
    // qms_* tables do. Scope by client_id only when the table is qms_*.
    if (config.table.startsWith("qms_")) {
      if (clientId) {
        query = query.eq("client_id", clientId);
      } else {
        query = query.is("client_id", null);
      }
    }
    const { data: rows, error: dbErr } = await query;
    if (dbErr) throw dbErr;

    const rowsArr = (rows ?? []) as Array<Record<string, unknown>>;

    // Build workbook with the BFF-style branded metadata header.
    const wb = new ExcelJS.Workbook();
    wb.creator = "Preqal";
    wb.created = new Date();

    for (const sheet of config.sheets) {
      const ws = wb.addWorksheet(sheet.name);

      const meta: BrandedMeta = {
        title: config.title,
        dcn: config.dcn,
        scope: config.scope,
        creationDate: new Date().toISOString().slice(0, 10),
        approvalDate: "",
        versionNumber: "1.0",
        currentRevisionDate: new Date().toISOString().slice(0, 10),
        scheduledRevisionDate: "",
        bigNumber: rowsArr.length,
        breakdown: computeBreakdown(rowsArr, config.breakdownBy),
        status: { created: rowsArr.length, revised: 0, approved: 0 },
        dataColCount: Math.max(sheet.columns.length, 10),
      };
      await applyPreqalHeader(ws, meta);
      applyDataHeader(
        ws,
        sheet.columns.map((c) => c.header),
        sheet.columns.map((c) => c.width),
      );
      rowsArr.forEach((r, i) => {
        applyDataRow(
          ws,
          sheet.columns.map((c) => r[c.key] ?? ""),
          i % 2 === 1,
        );
      });
      // ySplit already set to 12 by applyPreqalHeader; nothing more to do.
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

    console.warn(`sync-register-excel: ${storagePath} — ${rowsArr.length} rows`);
    return json({ ok: true, path: storagePath, rows: rowsArr.length });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync-register-excel error:", msg);
    return json({ error: msg }, 500);
  }
});
