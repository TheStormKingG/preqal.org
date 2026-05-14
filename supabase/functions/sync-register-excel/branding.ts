// supabase/functions/sync-register-excel/branding.ts
//
// Deno port of scripts/lib/register-branding.cjs — renders the BFF-style
// 11-row branded metadata header on a worksheet, plus the data-header and
// data-row helpers. Keep this in sync with the Node lib.

// @ts-expect-error — npm specifier works at Deno runtime
import ExcelJS from "npm:exceljs@4";

// ── Preqal palette ─────────────────────────────────────────────────────────────
const NAVY       = "FF0F172A";
const AMBER_50   = "FFFFFBEB";
const AMBER_100  = "FFFEF3C7";
const SLATE_BG   = "FFF8FAFC";
const WHITE      = "FFFFFFFF";
const BORDER     = "FFCBD5E1";
const SLATE_TEXT = "FF334155";

const fill = (argb: string) => ({
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb },
});
const thin = () => {
  const s = { style: "thin" as const, color: { argb: BORDER } };
  return { top: s, left: s, bottom: s, right: s };
};

// ── Favicon loader ─────────────────────────────────────────────────────────────
// The Edge Function has no filesystem access to the repo, so we fetch
// favicon.png from the live site. If the fetch fails (offline, 404, etc.)
// we gracefully skip the logo — mirrors loadLogoBuf's null fallback.
const FAVICON_URL = "https://preqal.org/favicon.png";
let _faviconCache: Uint8Array | null | undefined; // undefined = not fetched yet

export async function loadLogoBuf(): Promise<Uint8Array | null> {
  if (_faviconCache !== undefined) return _faviconCache;
  try {
    const res = await fetch(FAVICON_URL);
    if (!res.ok) {
      _faviconCache = null;
      return null;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    _faviconCache = buf;
    return buf;
  } catch {
    _faviconCache = null;
    return null;
  }
}

// ── Borders on merged ranges ───────────────────────────────────────────────────
// ExcelJS only writes a border on the merge anchor; we paint every underlying
// cell first so the full panel renders with visible edges in all viewers.
export function applyBorderToRange(ws: ExcelJS.Worksheet, range: string): void {
  const [start, end] = range.split(":");
  const colLetterToNum = (s: string): number => {
    let n = 0;
    for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n;
  };
  const parse = (ref: string) => {
    const m = ref.match(/^([A-Z]+)(\d+)$/)!;
    return { col: colLetterToNum(m[1]), row: parseInt(m[2], 10) };
  };
  const s = parse(start);
  const e = parse(end);
  for (let r = s.row; r <= e.row; r++) {
    for (let c = s.col; c <= e.col; c++) {
      ws.getCell(r, c).border = thin();
    }
  }
}

// ── Meta header (rows 1-11) ────────────────────────────────────────────────────
export interface BrandedMeta {
  title?: string;
  dcn?: string;
  scope?: string;
  creationDate?: string;
  approvalDate?: string;
  versionNumber?: string;
  currentRevisionDate?: string;
  scheduledRevisionDate?: string;
  bigNumber?: number;
  breakdown?: Array<[string, number]>;
  status?: { created: number; revised: number; approved: number };
  dataColCount?: number;
}

export async function applyPreqalHeader(
  ws: ExcelJS.Worksheet,
  meta: BrandedMeta,
): Promise<void> {
  const m = meta || {};
  const widths = [4, 18, 18, 26, 18, 14, 10, 12, 12, 12];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // Logo cell A2:B10 — paint borders BEFORE merging.
  applyBorderToRange(ws, "A2:B10");
  ws.mergeCells("A2:B10");
  const logoCell = ws.getCell("A2");
  logoCell.fill = fill(WHITE);
  logoCell.border = thin();

  const logoBuf = await loadLogoBuf();
  if (logoBuf) {
    const imgId = ws.workbook.addImage({ buffer: logoBuf, extension: "png" });
    ws.addImage(imgId, {
      tl: { col: 0.4, row: 1.4 },
      ext: { width: 90, height: 100 },
      editAs: "absolute",
    });
  }

  // Field labels (C2..C9) + values (D2..D9)
  const fields: Array<[string, string | number]> = [
    ["TITLE",                   m.title || ""],
    ["DCN",                     m.dcn || ""],
    ["SCOPE",                   m.scope || ""],
    ["CREATION DATE",           m.creationDate || ""],
    ["APPROVAL DATE",           m.approvalDate || ""],
    ["VERSION NUMBER",          m.versionNumber || ""],
    ["CURRENT REVISION DATE",   m.currentRevisionDate || ""],
    ["SCHEDULED REVISION DATE", m.scheduledRevisionDate || ""],
  ];
  fields.forEach(([label, value], i) => {
    const row = i + 2;
    const lc = ws.getCell(row, 3);
    lc.value = label;
    lc.fill = fill(AMBER_100);
    lc.font = { name: "Arial", size: 10, bold: false };
    lc.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    lc.border = thin();

    const vc = ws.getCell(row, 4);
    vc.value = value;
    vc.fill = fill(AMBER_50);
    vc.font = { name: "Arial", size: 10, bold: false };
    vc.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    vc.border = thin();
  });

  // Big number panel E2:E9
  applyBorderToRange(ws, "E2:E9");
  ws.mergeCells("E2:E9");
  const big = ws.getCell("E2");
  big.value = m.bigNumber ?? 0;
  big.fill = fill(AMBER_100);
  big.font = { name: "Arial", size: 36, bold: true, color: { argb: NAVY } };
  big.alignment = { vertical: "middle", horizontal: "center" };
  big.border = thin();

  // Breakdown table (F2:G5) — up to 4 rows
  const breakdown = (m.breakdown || []).slice(0, 4);
  for (let i = 0; i < 4; i++) {
    const row = i + 2;
    const lc = ws.getCell(row, 6);
    const vc = ws.getCell(row, 7);
    const entry = breakdown[i] || ["", ""];
    lc.value = entry[0];
    vc.value = entry[1];
    [lc, vc].forEach((c) => {
      c.fill = fill(AMBER_100);
      c.font = { name: "Arial", size: 10, bold: c === vc };
      c.alignment = {
        vertical: "middle",
        horizontal: c === lc ? "left" : "center",
        indent: c === lc ? 1 : 0,
      };
      c.border = thin();
    });
  }

  // Status panel (H2:J2 labels, H3:J5 counts, H6:J9 percentages)
  const statusLabels = ["CREATED", "REVISED", "APPROVED"];
  const counts = m.status || { created: 0, revised: 0, approved: 0 };
  const totals = [counts.created || 0, counts.revised || 0, counts.approved || 0];
  const total = totals.reduce((a, b) => a + b, 0);
  const colLetter = (n: number) => String.fromCharCode(64 + n);
  statusLabels.forEach((label, i) => {
    const col = 8 + i;
    const L = colLetter(col);
    const lc = ws.getCell(2, col);
    lc.value = label;
    lc.fill = fill(NAVY);
    lc.font = { name: "Arial", size: 9, bold: true, color: { argb: WHITE } };
    lc.alignment = { vertical: "middle", horizontal: "center" };
    lc.border = thin();

    applyBorderToRange(ws, `${L}3:${L}5`);
    ws.mergeCells(3, col, 5, col);
    const cc = ws.getCell(3, col);
    cc.value = totals[i];
    cc.fill = fill(AMBER_100);
    cc.font = { name: "Arial", size: 18, bold: true, color: { argb: NAVY } };
    cc.alignment = { vertical: "middle", horizontal: "center" };
    cc.border = thin();

    applyBorderToRange(ws, `${L}6:${L}9`);
    ws.mergeCells(6, col, 9, col);
    const pc = ws.getCell(6, col);
    pc.value = total > 0 ? totals[i] / total : 0;
    pc.numFmt = "0.0%";
    pc.fill = fill(AMBER_100);
    pc.font = { name: "Arial", size: 10, bold: true, color: { argb: NAVY } };
    pc.alignment = { vertical: "middle", horizontal: "center" };
    pc.border = thin();
  });

  // Row 10 navy divider
  ws.getRow(10).height = 6;
  for (let c = 1; c <= (m.dataColCount || 10); c++) {
    ws.getCell(10, c).fill = fill(NAVY);
  }
  // Row 11 spacer
  ws.getRow(11).height = 6;

  // Heights
  for (let r = 2; r <= 9; r++) ws.getRow(r).height = 22;

  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 12 }];
}

export function applyDataHeader(
  ws: ExcelJS.Worksheet,
  headers: string[],
  widths?: number[],
): void {
  const row = ws.getRow(12);
  headers.forEach((h, i) => {
    const c = row.getCell(i + 1);
    c.value = h;
    c.fill = fill(NAVY);
    c.font = { name: "Arial", size: 11, bold: true, color: { argb: WHITE } };
    c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    c.border = thin();
  });
  row.height = 28;
  if (widths) {
    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
  }
}

export function applyDataRow(
  ws: ExcelJS.Worksheet,
  values: unknown[],
  altRow: boolean,
): ExcelJS.Row {
  const row = ws.addRow(values);
  row.eachCell((c) => {
    c.fill = fill(altRow ? SLATE_BG : WHITE);
    c.font = { name: "Arial", size: 10, color: { argb: SLATE_TEXT } };
    c.alignment = { vertical: "middle", wrapText: true };
    c.border = thin();
  });
  row.height = 18;
  return row;
}
