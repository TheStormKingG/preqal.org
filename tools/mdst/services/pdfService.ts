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

  // 1 inch margins (25.4mm) on all sides
  const marginInch = 25.4;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const usableWidth = pageWidth - (marginInch * 2); // 159.2mm for A4
  const usableHeight = pageHeight - (marginInch * 2); // 246.2mm for A4
  
  // Footer height
  const footerHeight = 12;
  const contentEndY = pageHeight - marginInch - footerHeight;

  // Header with logo (top left) - maintain aspect ratio, 1 inch from top
  const headerY = marginInch;
  if (logoData && logoWidth > 0 && logoHeight > 0) {
    try {
      // Larger logo for better use of space
      const logoHeightSize = 18;
      const logoWidthSize = logoHeightSize * (logoWidth / logoHeight);
      doc.addImage(logoData, 'PNG', marginInch, headerY, logoWidthSize, logoHeightSize);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }

  // Title - positioned to the right of logo or start position, respecting right margin
  const titleStartX = logoData && logoWidth > 0 ? marginInch + 18 + 10 : marginInch;
  const titleMaxWidth = usableWidth - (titleStartX - marginInch) - 10; // Account for logo space
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  const titleText = doc.splitTextToSize('MD-ST Salary Band Assessment', titleMaxWidth);
  doc.text(titleText, titleStartX, headerY + 12);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateText = doc.splitTextToSize(`Generated: ${date}`, titleMaxWidth);
  doc.text(dateText, titleStartX, headerY + 20);

  // Result Section - starting after header with 1 inch margins
  const contentStartY = headerY + 28;
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Result:', marginInch, contentStartY);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(marginInch, contentStartY + 3, usableWidth, 22, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`Band ${details.band}`, marginInch + 5, contentStartY + 14);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(details.range, marginInch + 5, contentStartY + 22);

  // Description with better spacing
  const descY = contentStartY + 30;
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(details.description, usableWidth);
  doc.text(splitDesc, marginInch, descY);
  const descHeight = splitDesc.length * 5.5;

  // Responsibilities with better spacing
  const respY = descY + descHeight + 6;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Responsibilities:', marginInch, respY);
  
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  let yPos = respY + 7;
  details.responsibilities.forEach((item) => {
    // Split long responsibilities to fit within usable width
    const splitItem = doc.splitTextToSize(item, usableWidth - 5);
    splitItem.forEach((line: string) => {
      doc.text(`• ${line}`, marginInch + 3, yPos);
      yPos += 5.5;
    });
  });

  // Table of Answers - start after responsibilities with proper spacing
  const tableStartY = yPos + 7;
  
  // Calculate column widths to fit within usable width (159.2mm)
  // ID: 15mm, Question: 75mm, Opt: 15mm, Selection: remaining (~54mm)
  // Account for borders between columns (3 borders * 0.1mm = 0.3mm)
  const idColWidth = 15;
  const optColWidth = 15;
  const questionColWidth = 75;
  const selectionColWidth = usableWidth - idColWidth - questionColWidth - optColWidth - 0.3; // ~53.9mm (account for borders)
  
  // Prepare table data with properly wrapped text
  // Split long text to ensure cells fit within column widths
  const tableData = QUESTIONS.map((q) => {
    const ansKey = result.answers[q.id];
    const opt = q.options.find(o => o.id === ansKey);
    
    // Split question text to fit within question column width
    // Account for: left padding (4mm) + right padding (4mm) + border (0.1mm) + safety margin (2mm) = 10mm
    const questionTextWidth = questionColWidth - 10;
    const questionText = doc.splitTextToSize(q.text.replace(':', ''), questionTextWidth);
    
    // Split option label to fit within selection column width
    // Account for: left padding (4mm) + right padding (4mm) + border (0.2mm) + safety margin (4mm) = 12mm
    // Using larger safety margin for Selection column to prevent text overflow
    const optionLabel = opt?.label || '';
    const selectionTextWidth = selectionColWidth - 12; // Extra conservative to prevent overflow
    const optionText = doc.splitTextToSize(optionLabel, selectionTextWidth);
    
    // autoTable accepts arrays of strings for multi-line cells
    return [
      q.id,
      questionText,
      ansKey,
      optionText
    ];
  });

  // Reserve space for footer and scoring notes (1 inch from bottom)
  const footerReservedSpace = footerHeight + marginInch;
  // Reserve space for scoring notes
  const notesReservedSpace = 28;
  
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
      fontSize: 10,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      overflow: 'linebreak',
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { 
        // ID column - 15mm
        cellWidth: idColWidth,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        overflow: 'visible'
      },
      1: { 
        // Question column - 75mm, respects right margin
        cellWidth: questionColWidth,
        halign: 'left',
        valign: 'top',
        overflow: 'linebreak',
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 }
      },
      2: { 
        // Opt column - 15mm
        cellWidth: optColWidth, 
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        overflow: 'visible'
      },
      3: { 
        // Selection column - remaining space (~54mm), respects right margin
        cellWidth: selectionColWidth,
        halign: 'left',
        valign: 'top',
        overflow: 'linebreak',
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 }
      }
    },
    // Single page - don't show header on every page
    showHead: 'firstPage',
    // Set margins - 1 inch (25.4mm) on all sides
    margin: { 
      top: tableStartY, 
      left: marginInch, 
      right: marginInch, 
      bottom: tableBottomMargin 
    },
    // Ensure proper wrapping
    styles: {
      overflow: 'linebreak',
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    // Allow table to use full width
    tableWidth: 'auto'
  });

  // Scoring Notes - positioned above footer with 1 inch margins
  const finalY = (doc as any).lastAutoTable?.finalY || (tableStartY + 60);
  const notesY = finalY + 6;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Scoring Notes:', marginInch, notesY);
  
  const notes = [
    "- 'Mostly' rule: Highest count of A/B/C determines primary band.",
    "- Tie-break: In event of equal counts, higher band is selected.",
    "- Incident/Clinical Rule: Any 'C' in Q2 or Q3 mandates minimum Band B.",
    "- Escalation: 3+ 'C' selections results in Band C."
  ];
  
  // Notes with better spacing, respecting right margin
  let currentNoteY = notesY + 6;
  notes.forEach((note) => {
    doc.setFontSize(9);
    const splitNote = doc.splitTextToSize(note, usableWidth);
    doc.text(splitNote, marginInch, currentNoteY);
    currentNoteY += 5 * splitNote.length; // Account for multi-line notes
  });

  // Footer text at bottom of page (single page only) - 1 inch from bottom
  doc.setPage(1);
  const footerY = pageHeight - marginInch - (footerHeight / 2);
  
  // Add subtle divider line above footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(marginInch, footerY - 5, pageWidth - marginInch, footerY - 5);
  
  // Footer text - centered
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Medical Director Scoping Tool © 2026 Preqal Inc. All rights reserved.', pageWidth / 2, footerY, { align: 'center' });

  doc.save(`MD-ST_Report_${timestamp}.pdf`);
}
