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
  ink:      [ 25,  35,  60] as [number, number, number],  // #19233c — signature ink
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

/**
 * Convert a JPG-on-white-background (e.g. a signature scan) to a transparent
 * PNG so it can sit cleanly on the cream certificate background.
 * Pixels brighter than `threshold` (0–255) become fully transparent.
 */
function imageToTransparentPng(img: HTMLImageElement, threshold = 235): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0);
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // White-ish pixel → transparent
      if (r > threshold && g > threshold && b > threshold) {
        d[i + 3] = 0;
      } else {
        // Boost contrast on remaining ink
        const dark = (r + g + b) / 3 < 100;
        if (dark) {
          d[i]     = 25;
          d[i + 1] = 35;
          d[i + 2] = 60;
          d[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  } catch {
    /* canvas tainted — return as-is */
  }
  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------
function fill(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(...c); }
function stroke(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(...c); }
function textColor(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(...c); }

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
  const issuedStr  = formatCertDate(issuedAt);
  const verifyUrl  = certVerifyUrl(certKey);

  const W = 297;  // landscape A4 width  (mm)
  const H = 210;  // landscape A4 height (mm)

  // Safe right edge: inner border sits at W-11=286; we pad 22mm from page edge
  // (= 275mm) so all right-anchored elements have comfortable clearance.
  const sigRightEdge = W - 22;  // 275 mm

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Background ────────────────────────────────────────────────────────────
  fill(doc, C.cream);
  doc.rect(0, 0, W, H, 'F');

  // ── Decorative rosette watermark (faded, centred behind text) ────────────
  try {
    const rosette    = await loadImage(`${import.meta.env.BASE_URL}certlayers/Preqal%20E-Course%20Certificate.png`);
    const rosetteData = imageToDataUrl(rosette, 0.10);
    const rH = 165;
    const rW = (rosette.naturalWidth / rosette.naturalHeight) * rH;
    doc.addImage(rosetteData, 'PNG', (W - rW) / 2, (H - rH) / 2, rW, rH);
  } catch {
    /* asset not reachable — skip watermark gracefully */
  }

  // ── Borders (double thin teal frame) ──────────────────────────────────────
  stroke(doc, C.border);
  doc.setLineWidth(0.6);
  doc.rect(8,  8,  W - 16, H - 16, 'S');
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

  // ── TOP-RIGHT: Preqal hex icon — right-anchored at sigRightEdge ──────────
  try {
    const hex     = await loadImage(`${import.meta.env.BASE_URL}certlayers/Preqal%20Logo%20Sep25-7.png`);
    const hexData = imageToDataUrl(hex);
    const hH = 30;
    const hW = (hex.naturalWidth / hex.naturalHeight) * hH;
    // Right-edge of image lands exactly at sigRightEdge — no bleed possible.
    doc.addImage(hexData, 'PNG', sigRightEdge - hW, 22, hW, hH);
  } catch {
    /* fallback — draw amber hex placeholder */
    fill(doc, C.amber);
    doc.circle(sigRightEdge - 12, 35, 12, 'F');
  }

  // ── RIGHT MIDDLE: Real handwritten signature (white background removed) ──
  let sigImgBottomY = 100;
  try {
    const sig    = await loadImage(`${import.meta.env.BASE_URL}certlayers/Stefan%20Signature%20new.jpg`);
    const sigPng = imageToTransparentPng(sig);
    const sH     = 26;
    // Cap width so the image can never extend past sigRightEdge.
    const naturalW = (sig.naturalWidth / sig.naturalHeight) * sH;
    const sW       = Math.min(naturalW, 64);  // max 64 mm wide
    doc.addImage(sigPng, 'PNG', sigRightEdge - sW, 78, sW, sH);
    sigImgBottomY = 78 + sH;
  } catch {
    /* fallback — italic name as signature substitute */
    doc.setFont('times', 'italic');
    doc.setFontSize(20);
    textColor(doc, C.ink);
    doc.text('Stefan Gravesande', sigRightEdge, 95, { align: 'right' });
    sigImgBottomY = 100;
  }

  // Divider line beneath signature — right-anchored, 60 mm wide
  stroke(doc, C.subtle);
  doc.setLineWidth(0.3);
  doc.line(sigRightEdge - 60, sigImgBottomY + 1, sigRightEdge, sigImgBottomY + 1);

  // Signatory name + title (printed) — right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  textColor(doc, C.text);
  doc.text(CERT_SIGNATORY_NAME.toUpperCase(), sigRightEdge, sigImgBottomY + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(CERT_SIGNATORY_TITLE.toUpperCase(), sigRightEdge, sigImgBottomY + 12, { align: 'right' });
  doc.text(CERT_SIGNATORY_ORG.toUpperCase(),   sigRightEdge, sigImgBottomY + 16, { align: 'right' });

  // ── LEFT MIDDLE: Recipient body block ────────────────────────────────────
  const leftX        = 22;
  const leftMaxWidth = 175; // keep body text well clear of right-side signature block

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  textColor(doc, C.subtle);
  doc.text('THIS IS TO CERTIFY THAT', leftX, 85, { charSpace: 1.2 });

  // Recipient name — Times italic
  const nameLen  = recipientName.length;
  const nameSize = nameLen > 32 ? 26 : nameLen > 22 ? 32 : 38;
  doc.setFont('times', 'italic');
  doc.setFontSize(nameSize);
  textColor(doc, C.text);
  doc.text(recipientName, leftX, 105, { maxWidth: leftMaxWidth });

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
  doc.text(CERT_COURSE_TITLE.toUpperCase(), leftX, 132, { maxWidth: leftMaxWidth });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  textColor(doc, C.text);
  doc.text(CERT_COURSE_SUBTITLE.toUpperCase(), leftX, 139, { charSpace: 0.5, maxWidth: leftMaxWidth });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(CERT_COURSE_LEGAL.toUpperCase(), leftX, 145, { charSpace: 0.5, maxWidth: leftMaxWidth });

  // ── BOTTOM-LEFT: Single Preqal logo (Sep25-10) — 3× size + verified label ─
  // Logo is 36mm tall; starts at y=152 so it ends at 188, leaving room for text.
  const footLogoY = 152;
  const logoH     = 36;
  try {
    const logo = await loadImage(`${import.meta.env.BASE_URL}certlayers/Preqal%20Logo%20Sep25-10.png`);
    const lW   = (logo.naturalWidth / logo.naturalHeight) * logoH;
    doc.addImage(imageToDataUrl(logo), 'PNG', leftX, footLogoY, lW, logoH);
  } catch {
    /* no-op */
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  textColor(doc, C.text);
  // Inner border bottom edge = H - 11 = 199mm. All footer text must sit ≤ 197.
  // Offsets from (footLogoY + logoH) = 188:  +1=189, +5=193, +9=197  ✓
  doc.text('VERIFIED CERTIFICATE', leftX, footLogoY + logoH + 5, { charSpace: 1.2 });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text(`ISSUED: ${issuedStr}`, leftX, footLogoY + logoH + 9);

  // ── BOTTOM-RIGHT: Cert ID block — right-anchored at sigRightEdge ─────────
  // charSpace intentionally omitted — jsPDF adds trailing spacing after the
  // last glyph when charSpace > 0, pushing the right edge past the anchor.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  textColor(doc, C.subtle);
  doc.text('VALID CERTIFICATE ID', sigRightEdge, footLogoY + logoH + 1, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  textColor(doc, C.navy);
  doc.text(certKey, sigRightEdge, footLogoY + logoH + 6, { align: 'right' });

  // Verify URL — very small, sits at y=197 — comfortably inside inner border
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  textColor(doc, C.subtle);
  doc.text(`Verify at ${verifyUrl}`, sigRightEdge, footLogoY + logoH + 9, { align: 'right' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = recipientName.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const filename = `Preqal_Certificate_${safeName}_${certKey}.pdf`;
  doc.save(filename);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
