import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AssessmentResult, BandDetails } from '../types';
import { QUESTIONS } from '../constants';

export async function generatePDFReport(result: AssessmentResult, details: BandDetails) {
  const doc = new jsPDF();
  const date = new Date().toLocaleString();
  const timestamp = new Date().toISOString().split('T')[0];

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('MD-ST Salary Band Assessment', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${date}`, 20, 40);

  // Result Section
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Assessment Result:', 20, 55);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 60, 170, 35, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`Band ${details.band}`, 30, 75);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(details.range, 30, 88);

  // Description
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(details.description, 170);
  doc.text(splitDesc, 20, 110);

  // Responsibilities
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Responsibilities:', 20, 135);
  
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  let yPos = 145;
  details.responsibilities.forEach((item) => {
    doc.text(`• ${item}`, 25, yPos);
    yPos += 8;
  });

  // Table of Answers
  const tableData = QUESTIONS.map((q) => {
    const ansKey = result.answers[q.id];
    const opt = q.options.find(o => o.id === ansKey);
    return [q.id, q.text.replace(':', ''), ansKey, opt?.label || ''];
  });

  (doc as any).autoTable({
    startY: yPos + 10,
    head: [['ID', 'Question', 'Opt', 'Selection']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 65 }
    }
  });

  // Footer / Scoring Notes
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Scoring Notes:', 20, finalY + 15);
  const notes = [
    "- 'Mostly' rule: Highest count of A/B/C determines primary band.",
    "- Tie-break: In event of equal counts, the higher band is selected.",
    "- Incident/Clinical Rule: Any 'C' selection in Q2 or Q3 mandates a minimum of Band B.",
    "- Escalation: 3 or more 'C' selections across all categories results in Band C."
  ];
  notes.forEach((note, i) => {
    doc.text(note, 20, finalY + 22 + (i * 6));
  });

  doc.save(`MD-ST_Report_${timestamp}.pdf`);
}
