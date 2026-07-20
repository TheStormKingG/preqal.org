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
    const res = await fetch(FAVICON_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      _faviconCache = null;
      return null;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    // Size sanity check — guard against a giant or empty/error response body.
    if (buf.byteLength < 512 || buf.byteLength > 100_000) {
      _faviconCache = null;
      return null;
    }
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

// ── Module-level helpers ───────────────────────────────────────────────────────
const colLetter = (n: number): string => String.fromCharCode(64 + n);

// Center an image within a merged cell area.
// Returns { col, row } for the ExcelJS addImage tl parameter.
// colWidths: array of column widths in chars (index 0 = col A)
function centerImage(
  imgW: number, imgH: number,
  startCol: number, startRow: number,
  colWidths: number[], rowHPt: number,
  spanCols: number, spanRows: number,
): { col: number; row: number } {
  const COL_PX = 7;
  const ROW_PX = 96 / 72;
  const cellW = colWidths.slice(startCol, startCol + spanCols).reduce((a, w) => a + (w || 14) * COL_PX, 0);
  const cellH = spanRows * rowHPt * ROW_PX;
  const offX = Math.max(0, (cellW - imgW) / 2);
  const offY = Math.max(0, (cellH - imgH) / 2);
  let colFrac = startCol;
  let rem = offX;
  for (let i = startCol; i < startCol + spanCols; i++) {
    const w = (colWidths[i] ?? 14) * COL_PX;
    if (rem <= w) { colFrac = i + rem / w; break; }
    rem -= w;
  }
  return { col: colFrac, row: startRow + offY / (rowHPt * ROW_PX) };
}

// ── Meta header (rows 1-13) ────────────────────────────────────────────────────
export interface BrandedMeta {
  title?: string;
  dcn?: string;
  scope?: string;
  creationDate?: string;
  approvalDate?: string;
  versionNumber?: string;
  currentRevisionDate?: string;
  scheduledRevisionDate?: string;
  subtitle?: string;
  dataColCount?: number;
  colWidths?: number[];
}

export async function applyPreqalHeader(
  ws: ExcelJS.Worksheet,
  meta: BrandedMeta,
): Promise<void> {
  const m = meta || {};
  const dataColCount = m.dataColCount || 10;
  const colWidths = m.colWidths || Array(dataColCount).fill(14);

  // Row 1: small logo (A1) + subtitle (B1:end merged)
  ws.getRow(1).height = 20;
  ws.getCell("A1").fill = fill(WHITE);
  ws.getCell("A1").border = thin();

  applyBorderToRange(ws, `B1:${colLetter(dataColCount)}1`);
  ws.mergeCells(1, 2, 1, dataColCount);
  const subCell = ws.getCell("B1");
  subCell.value = m.subtitle || "Controlled Document — Internal Use Only";
  subCell.fill = fill(WHITE);
  subCell.font = { name: "Arial", size: 9, color: { argb: SLATE_TEXT } };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  subCell.border = thin();

  // Row 2: navy title banner
  ws.getRow(2).height = 24;
  applyBorderToRange(ws, `A2:${colLetter(dataColCount)}2`);
  ws.mergeCells(2, 1, 2, dataColCount);
  const bannerCell = ws.getCell("A2");
  bannerCell.value =
    "PREQAL INTEGRATED MANAGEMENT SYSTEM  •  Controlled Document — Internal Use Only";
  bannerCell.fill = fill(NAVY);
  bannerCell.font = { name: "Arial", size: 11, bold: true, color: { argb: WHITE } };
  bannerCell.alignment = { vertical: "middle", horizontal: "center" };
  bannerCell.border = thin();

  // Rows 3–10: large logo (A3:B10) + labels (C) + merged values (D:end per row)
  applyBorderToRange(ws, "A3:B10");
  ws.mergeCells("A3:B10");
  ws.getCell("A3").fill = fill(WHITE);
  ws.getCell("A3").border = thin();

  const logoBuf = await loadLogoBuf();
  if (logoBuf) {
    const smallId = ws.workbook.addImage({ buffer: logoBuf, extension: "png" });
    ws.addImage(smallId, {
      tl: centerImage(22, 22, 0, 0, colWidths, 20, 1, 1),
      ext: { width: 22, height: 22 },
      editAs: "absolute",
    });
    const bigId = ws.workbook.addImage({ buffer: logoBuf, extension: "png" });
    ws.addImage(bigId, {
      tl: centerImage(96, 96, 0, 2, colWidths, 22, 2, 8),
      ext: { width: 96, height: 96 },
      editAs: "absolute",
    });
  }

  const fields: Array<[string, string | number]> = [
    ["TITLE",                   m.title                 || ""],
    ["DCN",                     m.dcn                   || ""],
    ["SCOPE",                   m.scope                 || ""],
    ["CREATION DATE",           m.creationDate          || ""],
    ["APPROVAL DATE",           m.approvalDate          || ""],
    ["VERSION NUMBER",          m.versionNumber         || ""],
    ["CURRENT REVISION DATE",   m.currentRevisionDate   || ""],
    ["SCHEDULED REVISION DATE", m.scheduledRevisionDate || ""],
  ];

  fields.forEach(([label, value], i) => {
    const row = i + 3;
    const lc = ws.getCell(row, 3);
    lc.value = label;
    lc.fill = fill(AMBER_100);
    lc.font = { name: "Arial", size: 10, bold: false };
    lc.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    lc.border = thin();

    applyBorderToRange(ws, `D${row}:${colLetter(dataColCount)}${row}`);
    ws.mergeCells(row, 4, row, dataColCount);
    const vc = ws.getCell(row, 4);
    vc.value = value;
    vc.fill = fill(AMBER_50);
    vc.font = { name: "Arial", size: 10, bold: false };
    vc.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    vc.border = thin();
  });

  for (let r = 3; r <= 10; r++) ws.getRow(r).height = 22;

  // Row 11 navy divider
  ws.getRow(11).height = 6;
  for (let c = 1; c <= dataColCount; c++) ws.getCell(11, c).fill = fill(NAVY);
  // Row 12 spacer
  ws.getRow(12).height = 6;

  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 13 }];
}

export function applyDataHeader(
  ws: ExcelJS.Worksheet,
  headers: string[],
  widths?: number[],
): void {
  const row = ws.getRow(13);
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
