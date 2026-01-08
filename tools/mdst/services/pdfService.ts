import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult, BandDetails } from '../types';
import { QUESTIONS } from '../constants';

// Helper function to load image as base64
function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

export async function generatePDFReport(result: AssessmentResult, details: BandDetails) {
  const doc = new jsPDF();
  const date = new Date().toLocaleString();
  const timestamp = new Date().toISOString().split('T')[0];

  // Load Preqal logo
  let logoData: string | null = null;
  let logoWidth = 0;
  let logoHeight = 0;
  
  try {
    const logoUrl = `${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.png`;
    logoData = await loadImageAsBase64(logoUrl);
    
    // Get actual image dimensions to maintain aspect ratio
    const img = new Image();
    img.src = logoData;
    await new Promise((resolve) => {
      img.onload = () => {
        // Maintain aspect ratio - set max height to 20mm and calculate width proportionally
        const maxHeight = 20;
        const aspectRatio = img.width / img.height;
        logoHeight = maxHeight;
        logoWidth = maxHeight * aspectRatio;
        resolve(null);
      };
    });
  } catch (error) {
    console.warn('Could not load logo for PDF:', error);
  }

  // Footer height and bottom margin
  const footerHeight = 15;
  const bottomMargin = 20;
  const pageHeight = doc.internal.pageSize.height;
  const contentEndY = pageHeight - bottomMargin - footerHeight;

  // Header with logo (top left) - maintain aspect ratio
  const headerY = 15;
  if (logoData && logoWidth > 0 && logoHeight > 0) {
    try {
      // Add logo maintaining aspect ratio, positioned at top left
      doc.addImage(logoData, 'PNG', 20, headerY, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }

  // Title - positioned to the right of logo or start position
  const titleStartX = logoData && logoWidth > 0 ? 20 + logoWidth + 10 : 20;
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('MD-ST Salary Band Assessment', titleStartX, headerY + 10);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${date}`, titleStartX, headerY + 18);

  // Result Section - starting after header
  const contentStartY = headerY + logoHeight + 15;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Assessment Result:', 20, contentStartY);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(20, contentStartY + 5, 170, 35, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`Band ${details.band}`, 30, contentStartY + 20);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(details.range, 30, contentStartY + 32);

  // Description
  const descY = contentStartY + 50;
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(details.description, 170);
  doc.text(splitDesc, 20, descY);

  // Calculate description height
  const descHeight = splitDesc.length * 5; // Approximate line height

  // Responsibilities
  const respY = descY + descHeight + 10;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Responsibilities:', 20, respY);
  
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  let yPos = respY + 10;
  details.responsibilities.forEach((item) => {
    // Check if we need a new page before adding responsibility
    if (yPos > contentEndY - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`• ${item}`, 25, yPos);
    yPos += 8;
  });

  // Table of Answers - ensure it doesn't overlap with footer
  const tableStartY = yPos + 10;
  // Reserve space for scoring notes and footer
  const maxTableHeight = contentEndY - tableStartY - 50; // Reserve 50mm for scoring notes

  const tableData = QUESTIONS.map((q) => {
    const ansKey = result.answers[q.id];
    const opt = q.options.find(o => o.id === ansKey);
    return [q.id, q.text.replace(':', ''), ansKey, opt?.label || ''];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['ID', 'Question', 'Opt', 'Selection']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 65 }
    },
    // Ensure table respects page margins
    margin: { top: tableStartY, left: 20, right: 20, bottom: contentEndY }
  });

  // Footer / Scoring Notes - positioned above footer space
  const finalY = (doc as any).lastAutoTable?.finalY || (tableStartY + 60);
  
  // Check if we need a new page for scoring notes
  let notesY = finalY + 15;
  if (notesY > contentEndY - 40) {
    doc.addPage();
    notesY = 20;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Scoring Notes:', 20, notesY);
  const notes = [
    "- 'Mostly' rule: Highest count of A/B/C determines primary band.",
    "- Tie-break: In event of equal counts, the higher band is selected.",
    "- Incident/Clinical Rule: Any 'C' selection in Q2 or Q3 mandates a minimum of Band B.",
    "- Escalation: 3 or more 'C' selections across all categories results in Band C."
  ];
  
  // Ensure notes fit above footer
  let currentNoteY = notesY + 7;
  notes.forEach((note) => {
    if (currentNoteY > contentEndY - 10) {
      doc.addPage();
      currentNoteY = 20;
    }
    doc.text(note, 20, currentNoteY);
    currentNoteY += 6;
  });

  // Footer text at bottom of every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - footerHeight / 2;
    
    // Add subtle divider line above footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(20, footerY - 5, 190, footerY - 5);
    
    // Footer text - centered
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Medical Director Scoping Tool © 2026 Preqal Inc. All rights reserved.', 105, footerY, { align: 'center' });
  }

  doc.save(`MD-ST_Report_${timestamp}.pdf`);
}
