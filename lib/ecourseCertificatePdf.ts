export type EcourseCertificatePdfPayload = {
  holderName: string;
  publicId: string;
  completedAt: Date;
  verifyUrl: string;
  courseTitle?: string;
};

/**
 * Builds a branded completion PDF in the browser (no server).
 * To use your static InDesign/PDF template later, add pdf-lib and merge fields over
 * `public/e-courses/certificate/template.pdf` once that asset is in the repo.
 */
export async function buildPreqalEcourseCertificatePdf(payload: EcourseCertificatePdfPayload): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const courseTitle = payload.courseTitle ?? 'Build Systems That Actually Work — QMS E-Course';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 22;

  doc.setFillColor(224, 229, 236);
  doc.rect(0, 0, pageW, 90, 'F');
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, 28, pageW - margin * 2, 210, 3, 3, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PREQAL', margin + 8, 48);

  doc.setFontSize(20);
  doc.text('Certificate of completion', margin + 8, 66);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(courseTitle, margin + 8, 78, { maxWidth: pageW - margin * 2 - 16 });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text('This certifies that', margin + 8, 102);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(payload.holderName, margin + 8, 116, { maxWidth: pageW - margin * 2 - 16 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const completedStr = payload.completedAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Completed on ${completedStr}`, margin + 8, 132);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate ID', margin + 8, 152);
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.text(payload.publicId, margin + 8, 160);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Validate this certificate at:', margin + 8, 176);
  doc.setTextColor(30, 64, 175);
  const lines = doc.splitTextToSize(payload.verifyUrl, pageW - margin * 2 - 16);
  doc.text(lines, margin + 8, 182);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Issued by Preqal Inc. · preqal.org', margin + 8, 268);

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
