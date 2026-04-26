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
  cream:    [253, 246, 232] as [number, number, number],  // #fdf6e8 — warm cream bg
  border:   [142, 181, 179] as [number, number, number],  // #8eb5b3 — light teal border
  green:    [ 74, 141, 126] as [number, number, number],  // #4a8d7e — sage VERIFIED
  greenDk:  [ 53, 110,  98] as [number, number, number],  // #356e62 — slightly darker
  text:     [ 51,  51,  51] as [number, number, number],  // #333    — body
  subtle:   [120, 120, 120] as [number, number, number],  // #787878 — small caps
  navy:     [ 30,  58, 122] as [number, number, number],  // #1e3a7a — cert ID accent
  amber:    [245, 158,  11] as [number, number, number],  // #f59e0b — Preqal orange
};

// ---------------------------------------------------------------------------
// Asset loader (browser-only) — returns HTMLImageElement once decoded
// ---------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Convert an HTMLImageElement to a data URL via canvas (works for non-CORS too) */
function imageToDataUrl(img: HTMLImageElement, opacity = 1): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  if (opacity < 1) ctx.globalAlpha = opacity;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// Drawing helpers
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CertPdfParams {
  recipientName: string;
  /** Google account email — printed on the certificate to bind it to the account */
  recipientEmail: string;
  certKey: string;
  /** Date the certificate was issued (or "now" if generating fresh) */
  issuedAt: Date | string;
}

/**
 * Generate the Preqal E-Course certificate PDF and trigger a browser download.
 *
 * Layout: A4 LANDSCAPE (297 × 210 mm), light cream background, sage-green
 * "VERIFIED" header, Preqal hex logo top-right, signature mid-right, recipient
 * details mid-left, footer corners with cert ID and issue date.
 *
 * Returns the blob URL for optional additional handling (preview, etc.).
 */
export async function downloadCertificatePdf(params: CertPdfParams): Promise<string> {
  const { recipientName, recipientEmail, certKey, issuedAt } = params;
  const issuedStr = formatCertDate(issuedAt);
  const verifyUrl = certVerifyUrl(certKey);

  const W = 297;  // landscape A4 width  (mm)
  const H = 210;  // landscape A4 height (mm)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Background ────────────────────────────────────────────────────────────
  fill(doc, C.cream);
  doc.rect(0, 0, W, H, 'F');

  // ── Decorative ribbon watermark (faded, centred behind text) ─────────────
  try {
    const ribbon = await loadImage(`${import.meta.env.BASE_URL}e-courses/ui/star-ribbon.png`);
    const ribbonData = imageToDataUrl(ribbon, 0.08); // very faded
    const rH = 150;
    const rW = (ribbon.naturalWidth / ribbon.naturalHeight) * rH;
    doc.addImage(ribbonData, 'PNG', (W - rW) / 2, (H - rH) / 2, rW, rH);
  } catch {
    /* asset not reachable — skip watermark gracefully */
  }

  // ── Borders (double thin teal frame) ──────────────────────────────────────
  stroke(doc, C.border);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, W - 16, H - 16, 'S');
  doc.setLineWidth(0.25);
  doc.rect(11, 11, W - 22, H - 22, 'S');

  // ── TOP-LEFT: VERIFIED + CERTIFICATE OF ACHIEVEMENT ──────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(44);
  textColor(doc, C.green);
  doc.text('VERIFIED', 22, 38, { charSpace: 4 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  textColor(doc, C.greenDk);
  doc.text('CERTIFICATE OF ACHIEVEMENT', 22, 47, { charSpace: 2.5 });

  // ── TOP-RIGHT: Preqal hex logo (orange star) ─────────────────────────────
  try {
    const logo = await loadImage(`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.png`);
    const logoData = imageToDataUrl(logo);
    // Hex-only crop: the logo file is wide (logo + word). Place the whole thing
    // in the top-right at moderate height; design tolerance is fine.
    const lH = 22;
    const lW = (logo.naturalWidth / logo.naturalHeight) * lH;
    doc.addImage(logoData, 'PNG', W - 22 - lW, 22, lW, lH);
  } catch {
    /* fallback — draw amber hex placeholder */
    fill(doc, C.amber);
    doc.circle(W - 30, 33, 9, 'F');
  }

  // ── RIGHT MIDDLE: Signature block ────────────────────────────────────────
  let sigBottomY = 100;
  try {
    const sig = await loadImage(`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5).png`);
    const sigData = imageToDataUrl(sig);
    const sH = 18;
    const sW = (sig.naturalWidth / sig.naturalHeight) * sH;
    const sX = W - 30 - sW / 2;
    doc.addImage(sigData, 'PNG', sX, 80, sW, sH);
    sigBottomY = 80 + sH + 2;
  } catch {
    /* fallback — draw a simple ink-style line */
    stroke(doc, C.text);
    doc.setLineWidth(0.4);
    doc.line(W - 65, 95, W - 35, 95);
    sigBottomY = 100;
  }

  // Signatory name + title under signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  textColor(doc, C.text);
  doc.text(CERT_SIGNATORY_NAME.toUpperCase(), W - 30, sigBottomY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(CERT_SIGNATORY_TITLE.toUpperCase(), W - 30, sigBottomY + 9, { align: 'center' });
  doc.text(CERT_SIGNATORY_ORG.toUpperCase(), W - 30, sigBottomY + 13, { align: 'center' });

  // ── LEFT MIDDLE: Recipient body block ────────────────────────────────────
  const leftX = 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  textColor(doc, C.subtle);
  doc.text('THIS IS TO CERTIFY THAT', leftX, 85, { charSpace: 1.2 });

  // Recipient name — use Times italic as elegant substitute for cursive
  doc.setFont('times', 'italic');
  const nameLen = recipientName.length;
  const nameSize = nameLen > 32 ? 28 : nameLen > 22 ? 34 : 40;
  doc.setFontSize(nameSize);
  textColor(doc, C.text);
  doc.text(recipientName, leftX, 105);

  // Email binding (small, under name)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  textColor(doc, C.subtle);
  doc.text(recipientEmail.toLowerCase(), leftX, 111);

  // Body lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  textColor(doc, C.subtle);
  doc.text('SUCCESSFULLY COMPLETED AND RECEIVED A PASSING GRADE IN', leftX, 122, { charSpace: 1 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  textColor(doc, C.text);
  doc.text(CERT_COURSE_TITLE.toUpperCase(), leftX, 132);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  textColor(doc, C.text);
  doc.text(CERT_COURSE_SUBTITLE.toUpperCase(), leftX, 139, { charSpace: 0.5 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(CERT_COURSE_LEGAL.toUpperCase(), leftX, 145, { charSpace: 0.5 });

  // ── BOTTOM-LEFT: small Preqal logo + verified label + issue date ────────
  const footY = 175;
  try {
    const logoSm = await loadImage(`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.png`);
    const logoSmData = imageToDataUrl(logoSm);
    const slH = 11;
    const slW = (logoSm.naturalWidth / logoSm.naturalHeight) * slH;
    doc.addImage(logoSmData, 'PNG', leftX, footY - 1, slW, slH);
  } catch {
    /* no-op */
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  textColor(doc, C.text);
  doc.text('VERIFIED CERTIFICATE', leftX, footY + 14, { charSpace: 1.2 });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(`ISSUED: ${issuedStr}`, leftX, footY + 19);

  // ── BOTTOM-RIGHT: Cert ID block ──────────────────────────────────────────
  const rightEdge = W - 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  textColor(doc, C.subtle);
  doc.text('VALID CERTIFICATE ID', rightEdge, footY + 9, { align: 'right', charSpace: 1.2 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  textColor(doc, C.navy);
  doc.text(certKey, rightEdge, footY + 15, { align: 'right' });

  // Verify URL — very small, below cert ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  textColor(doc, C.subtle);
  doc.text(`Verify at ${verifyUrl}`, rightEdge, footY + 19, { align: 'right' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = recipientName.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const filename = `Preqal_Certificate_${safeName}_${certKey}.pdf`;
  doc.save(filename);

  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
