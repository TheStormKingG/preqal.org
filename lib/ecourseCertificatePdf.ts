import { jsPDF } from 'jspdf';
import {
  CERT_COURSE_LEGAL,
  CERT_COURSE_SUBTITLE,
  CERT_COURSE_TITLE,
  CERT_SIGNATORY_NAME,
  CERT_SIGNATORY_ORG,
  CERT_SIGNATORY_TITLE,
  certVerifyUrl,
  formatCertDate,
} from './ecourseCertificateConstants';

// ---------------------------------------------------------------------------
// Colour palette  (RGB tuples for jsPDF)
// ---------------------------------------------------------------------------

const C = {
  bg:       [15,  23, 42]  as [number, number, number],  // slate-900  #0f172a
  bgCard:   [22,  34, 58]  as [number, number, number],  // slightly lighter panel
  gold:     [245, 158, 11] as [number, number, number],  // amber-500  #f59e0b
  goldDim:  [180, 115,  8] as [number, number, number],  // amber-700 (borders)
  white:    [248, 250, 252] as [number, number, number], // slate-50
  slate300: [148, 163, 184] as [number, number, number], // slate-300
  slate400: [100, 116, 139] as [number, number, number], // slate-400
  slate500: [ 71,  85, 105] as [number, number, number], // slate-500
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(...c);
}
function stroke(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(...c);
}
function textColor(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(...c);
}
function centered(doc: jsPDF, text: string, y: number, size: number, style: string, color: [number,number,number]) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  textColor(doc, color);
  doc.text(text, 105, y, { align: 'center' });
}
function hline(doc: jsPDF, y: number, x1: number, x2: number, color: [number,number,number], width = 0.5) {
  stroke(doc, color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface CertPdfParams {
  recipientName: string;
  certKey: string;
  /** Date the certificate was issued (or "now" if generating fresh) */
  issuedAt: Date | string;
}

/**
 * Generate the Preqal E-Course certificate PDF and trigger a browser download.
 *
 * Uses jsPDF — A4 portrait (210 × 297 mm), dark neumorphic brand style.
 * Returns the blob URL for optional additional handling (preview, etc.).
 */
export function downloadCertificatePdf(params: CertPdfParams): string {
  const { recipientName, certKey, issuedAt } = params;
  const issuedStr = formatCertDate(issuedAt);
  const verifyUrl = certVerifyUrl(certKey);
  const W = 210; // page width mm

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── Background ────────────────────────────────────────────────────────────
  fill(doc, C.bg);
  doc.rect(0, 0, 210, 297, 'F');

  // ── Outer gold border ─────────────────────────────────────────────────────
  stroke(doc, C.gold);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, 194, 281, 'S');

  // ── Inner thin border ─────────────────────────────────────────────────────
  stroke(doc, C.goldDim);
  doc.setLineWidth(0.3);
  doc.rect(11, 11, 188, 275, 'S');

  // ── Top badge area ────────────────────────────────────────────────────────
  fill(doc, C.bgCard);
  doc.rect(11, 11, 188, 38, 'F');

  // PREQAL INC  (small label)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  textColor(doc, C.slate400);
  doc.text('PREQAL INC', W / 2, 20, { align: 'center', charSpace: 1.5 });

  // CERTIFICATE OF  (line 1)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  textColor(doc, C.white);
  doc.text('CERTIFICATE', W / 2, 31, { align: 'center' });

  // OF ACHIEVEMENT  (line 2, amber)
  doc.setFontSize(11);
  textColor(doc, C.gold);
  doc.text('OF ACHIEVEMENT', W / 2, 39, { align: 'center', charSpace: 1 });

  // ── Divider under badge ───────────────────────────────────────────────────
  hline(doc, 50, 20, 190, C.gold, 0.8);

  // ── "This is to certify that" ─────────────────────────────────────────────
  centered(doc, 'This is to certify that', 62, 9.5, 'italic', C.slate300);

  // ── Recipient Name (large) ────────────────────────────────────────────────
  const nameLen = recipientName.length;
  const nameFontSize = nameLen > 28 ? 18 : nameLen > 20 ? 22 : 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(nameFontSize);
  textColor(doc, C.white);
  doc.text(recipientName.toUpperCase(), W / 2, 80, { align: 'center' });

  // Amber underline under name
  const approxNameW = Math.min(nameLen * (nameFontSize * 0.52), 160);
  const nx = W / 2 - approxNameW / 2;
  hline(doc, 84, nx, nx + approxNameW, C.gold, 0.6);

  // ── Body text ─────────────────────────────────────────────────────────────
  centered(doc, 'has successfully completed and received a passing grade in', 95, 9, 'normal', C.slate300);

  // ── Course title ──────────────────────────────────────────────────────────
  centered(doc, CERT_COURSE_TITLE.toUpperCase(), 111, 13, 'bold', C.gold);
  centered(doc, CERT_COURSE_SUBTITLE, 120, 8.5, 'normal', C.white);
  centered(doc, CERT_COURSE_LEGAL, 128, 7.5, 'normal', C.slate400);

  // ── Mid divider ───────────────────────────────────────────────────────────
  hline(doc, 137, 20, 190, C.goldDim, 0.4);

  // ── V E R I F I E D stamp ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  textColor(doc, C.gold);
  doc.text('V E R I F I E D   C E R T I F I C A T E', W / 2, 147, { align: 'center' });

  // ── Cert ID + Issue date (two-column) ─────────────────────────────────────
  const leftX  = 32;
  const rightX = 148;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  textColor(doc, C.slate400);
  doc.text('VALID CERTIFICATE ID', leftX, 159);
  doc.text('DATE ISSUED', rightX, 159);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  textColor(doc, C.gold);
  doc.text(certKey, leftX, 167);
  doc.text(issuedStr, rightX, 167);

  // ── Verification URL ──────────────────────────────────────────────────────
  hline(doc, 173, 20, 190, C.goldDim, 0.3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  textColor(doc, C.slate400);
  doc.text('Verify this certificate at:', W / 2, 180, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  textColor(doc, C.gold);
  doc.text(verifyUrl, W / 2, 186, { align: 'center' });

  // ── Signature area ────────────────────────────────────────────────────────
  hline(doc, 200, 20, 190, C.goldDim, 0.3);

  // Signature line at ~70mm from left
  const sigX  = 55;
  const sigX2 = 105;
  hline(doc, 220, sigX, sigX2, C.slate500, 0.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  textColor(doc, C.white);
  doc.text(CERT_SIGNATORY_NAME, (sigX + sigX2) / 2, 227, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  textColor(doc, C.slate400);
  doc.text(CERT_SIGNATORY_TITLE, (sigX + sigX2) / 2, 233, { align: 'center' });
  doc.text(CERT_SIGNATORY_ORG, (sigX + sigX2) / 2, 239, { align: 'center' });

  // ── Bottom ornament ───────────────────────────────────────────────────────
  hline(doc, 253, 20, 190, C.gold, 0.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  textColor(doc, C.slate500);
  doc.text(
    'This certificate is issued by Preqal Inc and is digitally verifiable at preqal.org',
    W / 2,
    260,
    { align: 'center' },
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = recipientName.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const filename = `Preqal_Certificate_${safeName}_${certKey}.pdf`;
  doc.save(filename);

  // Return blob URL for potential preview
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
