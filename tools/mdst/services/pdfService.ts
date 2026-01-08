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

  // Compact header with logo (top left) - maintain aspect ratio
  const headerY = 10;
  if (logoData && logoWidth > 0 && logoHeight > 0) {
    try {
      // Smaller logo for compact layout
      const compactLogoHeight = 12;
      const compactLogoWidth = compactLogoHeight * (logoWidth / logoHeight);
      doc.addImage(logoData, 'PNG', 20, headerY, compactLogoWidth, compactLogoHeight);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }

  // Title - positioned to the right of logo or start position
  const titleStartX = logoData && logoWidth > 0 ? 20 + 12 + 8 : 20;
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('MD-ST Salary Band Assessment', titleStartX, headerY + 8);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated: ${date}`, titleStartX, headerY + 14);

  // Compact Result Section - starting after header
  const contentStartY = headerY + 20;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Result:', 20, contentStartY);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(20, contentStartY + 2, 170, 16, 'F');
  
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`Band ${details.band}`, 25, contentStartY + 10);
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(details.range, 25, contentStartY + 16);

  // Compact description
  const descY = contentStartY + 22;
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(details.description, 170);
  doc.text(splitDesc, 20, descY);
  const descHeight = splitDesc.length * 4;

  // Compact Responsibilities
  const respY = descY + descHeight + 4;
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Responsibilities:', 20, respY);
  
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  let yPos = respY + 5;
  details.responsibilities.forEach((item) => {
    // Split long responsibilities to fit on one line or wrap
    const splitItem = doc.splitTextToSize(item, 165);
    splitItem.forEach((line: string) => {
      doc.text(`• ${line}`, 23, yPos);
      yPos += 4;
    });
  });

  // Table of Answers - start after responsibilities with minimal spacing
  const tableStartY = yPos + 5;
  
  // Prepare table data with properly wrapped text
  // Split long text to ensure cells fit within column widths
  const tableData = QUESTIONS.map((q) => {
    const ansKey = result.answers[q.id];
    const opt = q.options.find(o => o.id === ansKey);
    
    // Split question text to fit within 85mm column width
    // Account for padding: 85mm - 8mm padding = 77mm usable width
    const questionText = doc.splitTextToSize(q.text.replace(':', ''), 77);
    
    // Split option label to fit within 55mm column width
    // Account for padding: 55mm - 8mm padding = 47mm usable width
    const optionLabel = opt?.label || '';
    const optionText = doc.splitTextToSize(optionLabel, 47);
    
    // autoTable accepts arrays of strings for multi-line cells
    return [
      q.id,
      questionText,
      ansKey,
      optionText
    ];
  });

  // Reserve space for footer and scoring notes
  const footerReservedSpace = footerHeight + bottomMargin;
  // Reserve minimal space for scoring notes (4 lines + header + spacing)
  const notesReservedSpace = 25;
  
  // Calculate bottom margin: ensure footer space + notes
  const tableBottomMargin = footerReservedSpace + notesReservedSpace;

  autoTable(doc, {
    startY: tableStartY,
    head: [['ID', 'Question', 'Opt', 'Selection']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 },
      overflow: 'linebreak',
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { 
        cellWidth: 15,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        overflow: 'visible'
      },
      1: { 
        cellWidth: 85,
        halign: 'left',
        valign: 'top',
        overflow: 'linebreak',
        cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 }
      },
      2: { 
        cellWidth: 15, 
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        overflow: 'visible'
      },
      3: { 
        cellWidth: 55,
        halign: 'left',
        valign: 'top',
        overflow: 'linebreak',
        cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 }
      }
    },
    // Single page - don't show header on every page
    showHead: 'firstPage',
    // Set margins - bottom margin reserves space for footer
    margin: { 
      top: tableStartY, 
      left: 20, 
      right: 20, 
      bottom: tableBottomMargin 
    },
    // Ensure proper wrapping
    styles: {
      overflow: 'linebreak',
      cellPadding: 1.5,
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    // Allow table to use full width
    tableWidth: 'auto'
  });

  // Scoring Notes - positioned above footer with minimal spacing
  const finalY = (doc as any).lastAutoTable?.finalY || (tableStartY + 60);
  const notesY = finalY + 4;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Scoring Notes:', 20, notesY);
  
  const notes = [
    "- 'Mostly' rule: Highest count of A/B/C determines primary band.",
    "- Tie-break: In event of equal counts, higher band is selected.",
    "- Incident/Clinical Rule: Any 'C' in Q2 or Q3 mandates minimum Band B.",
    "- Escalation: 3+ 'C' selections results in Band C."
  ];
  
  // Compact notes with minimal line spacing
  let currentNoteY = notesY + 4;
  notes.forEach((note) => {
    doc.setFontSize(7);
    doc.text(note, 20, currentNoteY);
    currentNoteY += 3.5;
  });

  // Footer text at bottom of page (single page only)
  doc.setPage(1);
  const footerY = pageHeight - footerHeight / 2;
  
  // Add subtle divider line above footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(20, footerY - 5, 190, footerY - 5);
  
  // Footer text - centered
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Medical Director Scoping Tool © 2026 Preqal Inc. All rights reserved.', 105, footerY, { align: 'center' });

  doc.save(`MD-ST_Report_${timestamp}.pdf`);
}
