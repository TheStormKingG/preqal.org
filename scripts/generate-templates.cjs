#!/usr/bin/env node
'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, TabStopType, TabStopPosition
} = require('docx');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/04 - Forms & Templates';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const C = {
  NAVY:        '0F172A',
  AMBER:       'D97706',
  AMBER_LIGHT: 'FEF3C7',
  GRAY_BG:     'F8FAFC',
  GRAY_BORDER: 'CBD5E1',
  GRAY_TEXT:   '64748B',
  SLATE:       '334155',
  WHITE:       'FFFFFF',
};
const PAGE_W = 12240, PAGE_H = 15840, MAR = 1080, CW = PAGE_W - 2 * MAR; // CW = 10080

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sb(color = C.GRAY_BORDER, size = 1) {
  return { style: BorderStyle.SINGLE, size, color };
}
function ab(color = C.GRAY_BORDER) {
  const b = sb(color);
  return { top: b, bottom: b, left: b, right: b };
}
function tr(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 22, ...opts });
}
function trAmber(text) { return tr(text, { bold: true, color: C.AMBER }); }
function trWhite(text, size = 22) { return tr(text, { bold: true, color: C.WHITE, size }); }
function p(children, opts = {}) {
  return new Paragraph({ children, spacing: { after: 120 }, ...opts });
}

function cell(children, w, extra = {}) {
  return new TableCell({
    children, width: { size: w, type: WidthType.DXA },
    borders: ab(), margins: { top: 80, bottom: 80, left: 120, right: 120 },
    ...extra
  });
}
function navyCell(children, w) {
  return new TableCell({
    children, width: { size: w, type: WidthType.DXA },
    borders: ab(C.NAVY), shading: { fill: C.NAVY, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}
function amberLightCell(children, w) {
  return new TableCell({
    children, width: { size: w, type: WidthType.DXA },
    borders: ab(C.AMBER), shading: { fill: C.AMBER_LIGHT, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

function headerBanner(docNum, title) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [2000, CW - 2000],
    rows: [new TableRow({ children: [
      navyCell([p([tr('PREQAL', { bold: true, color: C.AMBER, size: 32 })])], 2000),
      navyCell([
        p([tr(docNum, { color: C.AMBER, size: 18, bold: true })]),
        p([tr(title, { color: C.WHITE, size: 28, bold: true })]),
      ], CW - 2000),
    ]})]
  });
}

function metaTable(meta) {
  const rows = Object.entries(meta).map(([k, v]) =>
    new TableRow({ children: [
      navyCell([p([tr(k, { bold: true, color: C.WHITE, size: 20 })])], 2500),
      cell([p([tr(v, { size: 20 })])], CW - 2500),
    ]})
  );
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2500, CW - 2500], rows });
}

function sH(num, title) {
  return p([
    tr(num + '. ', { bold: true, color: C.AMBER, size: 24 }),
    tr(title, { bold: true, color: C.NAVY, size: 24 }),
  ]);
}

function placeholder(label) {
  return p([trAmber('[' + label + ']')]);
}

function labelRow(label) {
  return new Table({
    width: { size: CW, type: WidthType.DXA }, columnWidths: [3000, CW - 3000],
    rows: [new TableRow({ children: [
      navyCell([p([tr(label, { bold: true, color: C.WHITE, size: 20 })])], 3000),
      amberLightCell([p([trAmber('[' + label + ']')])], CW - 3000),
    ]})]
  });
}

function docxFooter() {
  return new Footer({ children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        tr('Preqal | Confidential', { color: C.GRAY_TEXT, size: 18 }),
        tr('\t', { size: 18 }),
        tr('Page ', { color: C.GRAY_TEXT, size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: C.GRAY_TEXT }),
      ]
    })
  ]});
}

async function save(docNum, filename, meta, bodyChildren) {
  const doc = new Document({
    sections: [{ properties: {
      page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MAR, right: MAR, bottom: MAR, left: MAR } }
    },
      footers: { default: docxFooter() },
      children: [
        headerBanner(docNum, meta['Title'] || filename),
        p([]),
        metaTable(Object.fromEntries(Object.entries(meta).filter(([k]) => k !== 'Title'))),
        p([]),
        ...bodyChildren,
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, filename), buf);
  fs.writeFileSync(path.join(PUB_DIR, filename), buf);
  console.log(`✓ ${filename}`);
}

const TODAY = '2026-05-08';
const OWNER = 'Dr. Stefan Gravesande';

// ─── TPL-01: Quote Template ───────────────────────────────────────────────────
async function tpl01() {
  await save('TPL-01', 'TPL-01-Quote-Template.docx', {
    Title: 'Quote Template',
    'Document No': 'TPL-01', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.2.3',
  }, [
    sH('1', 'Quote Details'),
    labelRow('Quote Number'), labelRow('Date'), labelRow('Valid Until'),
    p([]),
    sH('2', 'Prepared For'),
    labelRow('Company Name'), labelRow('Contact Name'), labelRow('Contact Email'), labelRow('Contact Phone'),
    p([]),
    sH('3', 'Prepared By'),
    p([tr('Dr. Stefan Gravesande, Preqal | stefan.gravesande@preqal.org | preqal.org')]),
    p([]),
    sH('4', 'Scope of Services'),
    placeholder('Describe the scope of services quoted — e.g. ISO 9001 Gap Analysis, IMS Development, Staff Training'),
    p([]),
    sH('5', 'Deliverables'),
    placeholder('List all deliverables: e.g. 1. Gap Analysis Report  2. Documented QMS  3. Staff Training Session'),
    p([]),
    sH('6', 'Pricing'),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW - 3000, 3000],
      rows: [
        new TableRow({ children: [
          navyCell([p([trWhite('Description')])], CW - 3000),
          navyCell([p([trWhite('Amount')])], 3000),
        ]}),
        new TableRow({ children: [
          cell([p([trAmber('[Service Line 1]')])], CW - 3000),
          cell([p([trAmber('[TTD / USD amount]')])], 3000),
        ]}),
        new TableRow({ children: [
          cell([p([trAmber('[Service Line 2]')])], CW - 3000),
          cell([p([trAmber('[TTD / USD amount]')])], 3000),
        ]}),
        new TableRow({ children: [
          navyCell([p([trWhite('TOTAL')])], CW - 3000),
          amberLightCell([p([trAmber('[TOTAL AMOUNT + CURRENCY]')])], 3000),
        ]}),
      ]
    }),
    p([]),
    sH('7', 'Payment Terms'),
    placeholder('e.g. 40% deposit upon signing, 60% on final delivery. Payment due within 14 days of invoice.'),
    p([]),
    sH('8', 'Validity & Acceptance'),
    p([tr('This quote is valid for 30 days from the date above. To accept, please sign below or reply by email confirming acceptance.')]),
    p([]),
    p([tr('Accepted by: _________________ | Name: _________________ | Date: _________________')]),
  ]);
}

// ─── TPL-02: Service Proposal Template ───────────────────────────────────────
async function tpl02() {
  await save('TPL-02', 'TPL-02-Service-Proposal-Template.docx', {
    Title: 'Service Proposal Template',
    'Document No': 'TPL-02', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.2.3',
  }, [
    sH('1', 'Executive Summary'),
    placeholder('2–3 sentences: what Preqal will do, why it matters, what outcome the client can expect.'),
    p([]),
    sH('2', 'About Preqal'),
    p([tr('Preqal is a quality, safety, and compliance consultancy specialising in ISO management systems for agri-food, poultry, and eco-hospitality businesses across the Caribbean and beyond. We combine deep technical expertise with hands-on implementation support — so you get a system that actually works.')]),
    p([]),
    sH('3', 'Understanding Your Challenge'),
    placeholder('Summarise the client\'s situation: e.g. "You are preparing for ISO 9001 certification and need a documented QMS that your team can actually use and maintain."'),
    p([]),
    sH('4', 'Our Proposed Approach'),
    placeholder('Describe the phases: Phase 1 — Discovery & Gap Analysis | Phase 2 — IMS Development | Phase 3 — Training & Implementation | Phase 4 — Pre-Audit Review'),
    p([]),
    sH('5', 'Scope of Work'),
    placeholder('List all deliverables included in scope. Be specific — reference SOPs, procedures, forms, training sessions.'),
    p([]),
    sH('6', 'Timeline'),
    placeholder('Provide a project timeline: Phase 1 (Week 1–2), Phase 2 (Week 3–8), etc.'),
    p([]),
    sH('7', 'Investment'),
    placeholder('Reference the attached Quote (TPL-01) or provide pricing summary here.'),
    p([]),
    sH('8', 'Why Preqal'),
    p([tr('✓ ISO-certified expertise  ✓ Caribbean-market experience  ✓ Hands-on implementation — not just advice  ✓ Ongoing support after delivery')]),
    p([]),
    sH('9', 'Next Steps'),
    p([tr('To proceed: (1) Review and sign the Service Agreement (TPL-03)  (2) Submit the 30–50% deposit  (3) Schedule your Kickoff Meeting')]),
    p([]),
    p([tr('Questions? Contact Dr. Stefan Gravesande: stefan.gravesande@preqal.org | preqal.org')]),
  ]);
}

// ─── TPL-03: Service Agreement ────────────────────────────────────────────────
async function tpl03() {
  await save('TPL-03', 'TPL-03-Service-Agreement.docx', {
    Title: 'Service Agreement',
    'Document No': 'TPL-03', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.4',
  }, [
    sH('1', 'Parties'),
    p([tr('This Service Agreement is entered into as of '), trAmber('[DATE]'), tr(' between:')]),
    p([tr('Service Provider: Dr. Stefan Gravesande, trading as Preqal, registered in Trinidad & Tobago.')]),
    p([tr('Client: '), trAmber('[CLIENT COMPANY NAME]'), tr(', represented by '), trAmber('[AUTHORISED SIGNATORY NAME & TITLE]'), tr('.')]),
    p([]),
    sH('2', 'Scope of Services'),
    placeholder('Describe the contracted services. Reference the accepted Quote/Proposal. List all deliverables.'),
    p([]),
    sH('3', 'Project Timeline'),
    placeholder('State agreed start date, key milestones, and expected completion date.'),
    p([]),
    sH('4', 'Fees & Payment Terms'),
    p([tr('Total Fee: '), trAmber('[CURRENCY AMOUNT]')]),
    p([tr('Payment Schedule: (a) 30–50% deposit due within 5 business days of signing. (b) Remaining balance due within 14 days of final delivery.')]),
    p([tr('Late payments accrue interest at 5% per month after 30 days.')]),
    p([]),
    sH('5', 'Confidentiality'),
    p([tr('Both parties agree to keep confidential all proprietary information exchanged during this engagement. Preqal will not disclose client documents or data to third parties without written consent.')]),
    p([]),
    sH('6', 'Intellectual Property'),
    p([tr('All deliverables produced under this Agreement become the property of the Client upon full payment. Preqal retains the right to reference the engagement (without confidential details) for portfolio and marketing purposes, subject to client consent.')]),
    p([]),
    sH('7', 'Liability'),
    p([tr('Preqal’s liability under this Agreement is limited to the total fees paid. Preqal is not liable for indirect or consequential losses.')]),
    p([]),
    sH('8', 'Termination'),
    p([tr('Either party may terminate this Agreement with 14 days written notice. Fees for work completed to date are non-refundable.')]),
    p([]),
    sH('9', 'Governing Law'),
    p([tr('This Agreement is governed by the laws of Trinidad & Tobago.')]),
    p([]),
    sH('10', 'Signatures'),
    p([tr('For Preqal: _________________ Dr. Stefan Gravesande | Date: _________________')]),
    p([tr('For Client: _________________ '), trAmber('[Name & Title]'), tr(' | Date: _________________')]),
  ]);
}

// ─── TPL-04: Invoice Template ─────────────────────────────────────────────────
async function tpl04() {
  await save('TPL-04', 'TPL-04-Invoice-Template.docx', {
    Title: 'Invoice',
    'Document No': 'TPL-04', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.5.5',
  }, [
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW / 2, CW / 2],
      rows: [new TableRow({ children: [
        cell([
          p([tr('INVOICE', { bold: true, size: 32, color: C.NAVY })]),
          p([tr('Invoice No: '), trAmber('[PRQ-YYYY-NNN]')]),
          p([tr('Date: '), trAmber('[DATE]')]),
          p([tr('Due Date: '), trAmber('[DATE + 14 DAYS]')]),
        ], CW / 2),
        cell([
          p([tr('Preqal', { bold: true, color: C.AMBER, size: 24 })]),
          p([tr('Dr. Stefan Gravesande')]),
          p([tr('stefan.gravesande@preqal.org | preqal.org')]),
          p([trAmber('[Address, Trinidad & Tobago]')]),
        ], CW / 2),
      ]})]
    }),
    p([]),
    sH('Bill To', ''),
    labelRow('Company Name'), labelRow('Contact Name'), labelRow('Billing Address'), labelRow('Email'),
    p([]),
    sH('Services Rendered', ''),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW - 4000, 2000, 2000],
      rows: [
        new TableRow({ children: [
          navyCell([p([trWhite('Description')])], CW - 4000),
          navyCell([p([trWhite('Unit Price')])], 2000),
          navyCell([p([trWhite('Amount')])], 2000),
        ]}),
        new TableRow({ children: [
          cell([p([trAmber('[Service / Milestone Description]')])], CW - 4000),
          cell([p([trAmber('[AMOUNT]')])], 2000),
          cell([p([trAmber('[AMOUNT]')])], 2000),
        ]}),
        new TableRow({ children: [
          cell([p([tr('')])], CW - 4000),
          navyCell([p([trWhite('TOTAL')])], 2000),
          amberLightCell([p([trAmber('[TOTAL + CURRENCY]')])], 2000),
        ]}),
      ]
    }),
    p([]),
    sH('Payment Details', ''),
    placeholder('Bank: [Bank Name] | Account Name: Dr. Stefan Gravesande / Preqal | Account No: [XXXXX] | Branch: [Branch]'),
    p([tr('Payment terms: Due within 14 days of invoice date. Late payments incur 5% per month.')]),
    p([tr('Thank you for your business.')]),
  ]);
}

// ─── TPL-09: Project Kickoff Agenda ──────────────────────────────────────────
async function tpl09() {
  await save('TPL-09', 'TPL-09-Project-Kickoff-Agenda.docx', {
    Title: 'Project Kickoff Meeting Agenda',
    'Document No': 'TPL-09', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.5.1',
  }, [
    labelRow('Project Name'), labelRow('Client Company'), labelRow('Meeting Date & Time'),
    labelRow('Location / Platform'), labelRow('Attendees'),
    p([]),
    sH('1', 'Welcome & Introductions (5 min)'),
    p([tr('Brief introductions from both sides. Confirm all key stakeholders are present.')]),
    p([]),
    sH('2', 'Project Overview (10 min)'),
    p([tr('Recap of agreed scope from Service Agreement (TPL-03). Review deliverables and confirm client understanding.')]),
    placeholder('Any scope clarifications or additions to note here'),
    p([]),
    sH('3', 'Roles & Responsibilities (10 min)'),
    p([tr('Client Project Champion: '), trAmber('[NAME & ROLE]')]),
    p([tr('Preqal Lead: Dr. Stefan Gravesande')]),
    p([tr('Key contacts for: document approvals, staff access, scheduling')]),
    p([]),
    sH('4', 'Project Timeline & Milestones (10 min)'),
    placeholder('Insert agreed project timeline: Phase 1 [dates], Phase 2 [dates], etc.'),
    p([]),
    sH('5', 'Communication Protocol (5 min)'),
    p([tr('Primary communication: email. Status reports: weekly (TPL-10). Meeting cadence: '), trAmber('[agreed frequency]')]),
    p([tr('Escalation path: any issues escalate directly to Dr. Stefan Gravesande.')]),
    p([]),
    sH('6', 'Access & Logistics (5 min)'),
    placeholder('What access does Preqal need? Site visits, documents, staff interviews? Schedule here.'),
    p([]),
    sH('7', 'Questions & Close (5 min)'),
    p([tr('Open floor for any questions. Confirm next steps and first milestone date.')]),
    p([]),
    p([tr('Next milestone: '), trAmber('[DESCRIPTION + DATE]')]),
    p([tr('Notes: '), trAmber('[Any additional notes from the meeting]')]),
  ]);
}

// ─── TPL-10: Weekly Status Report ────────────────────────────────────────────
async function tpl10() {
  await save('TPL-10', 'TPL-10-Weekly-Status-Report.docx', {
    Title: 'Weekly Project Status Report',
    'Document No': 'TPL-10', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.5.1, §9.1',
  }, [
    labelRow('Project Name'), labelRow('Client Company'), labelRow('Report No.'),
    labelRow('Report Week'),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [2500, CW - 2500],
      rows: [new TableRow({ children: [
        navyCell([p([tr('Prepared By', { bold: true, color: C.WHITE, size: 20 })])], 2500),
        cell([p([tr('Dr. Stefan Gravesande', { size: 20 })])], CW - 2500),
      ]})]
    }),
    p([]),
    sH('1', 'Project Status Summary'),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [2200, CW - 2200],
      rows: [
        new TableRow({ children: [
          navyCell([p([trWhite('Overall Status')])], 2200),
          amberLightCell([p([trAmber('[On Track | At Risk | Off Track]')])], CW - 2200),
        ]}),
        new TableRow({ children: [
          navyCell([p([trWhite('% Complete')])], 2200),
          cell([p([trAmber('[N%]')])], CW - 2200),
        ]}),
      ]
    }),
    p([]),
    sH('2', 'This Week\'s Progress'),
    placeholder('List what was completed this week: e.g. Completed gap analysis interviews | Draft QMS manual sent for review'),
    p([]),
    sH('3', 'Next Week\'s Plan'),
    placeholder('List what will be done next week: e.g. Complete Section 4 of QMS manual | Conduct staff training session'),
    p([]),
    sH('4', 'Issues & Risks'),
    placeholder('Any blockers, delays, or risks? State the issue, impact, and mitigation action.'),
    p([]),
    sH('5', 'Action Items'),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW - 3500, 2000, 1500],
      rows: [
        new TableRow({ children: [
          navyCell([p([trWhite('Action')])], CW - 3500),
          navyCell([p([trWhite('Owner')])], 2000),
          navyCell([p([trWhite('Due Date')])], 1500),
        ]}),
        new TableRow({ children: [
          cell([p([trAmber('[Action item]')])], CW - 3500),
          cell([p([trAmber('[Owner]')])], 2000),
          cell([p([trAmber('[DATE]')])], 1500),
        ]}),
      ]
    }),
  ]);
}

// ─── TPL-11: Project Closure Report ──────────────────────────────────────────
async function tpl11() {
  await save('TPL-11', 'TPL-11-Project-Closure-Report.docx', {
    Title: 'Project Closure Report',
    'Document No': 'TPL-11', Version: '1.0', Date: TODAY, Owner: OWNER, 'ISO Ref': 'ISO 9001:2015 §8.5.5, §9.1.2',
  }, [
    labelRow('Project Name'), labelRow('Client Company'), labelRow('Project Champion'),
    labelRow('Project Start Date'), labelRow('Project End Date'),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [2500, CW - 2500],
      rows: [new TableRow({ children: [
        navyCell([p([tr('Prepared By', { bold: true, color: C.WHITE, size: 20 })])], 2500),
        cell([p([tr('Dr. Stefan Gravesande', { size: 20 })])], CW - 2500),
      ]})]
    }),
    p([]),
    sH('1', 'Executive Summary'),
    placeholder('2–3 sentences: what was built, the key transformation for the client, and the primary outcome achieved.'),
    p([]),
    sH('2', 'Deliverables Completed'),
    placeholder('Full list matching the contracted scope. For each: [Deliverable] — [location/file] — [Date delivered]'),
    p([]),
    sH('3', 'Key Changes Made'),
    placeholder('What changed in the client\'s operations? Be specific about processes, systems, and documents implemented.'),
    p([]),
    sH('4', 'Outstanding Recommendations'),
    placeholder('Work identified during the project that was NOT in scope — the logical next step for future engagement.'),
    p([]),
    sH('5', 'Maintenance Instructions'),
    placeholder('How does the client maintain the system going forward? Include audit schedule, document review dates, record-keeping requirements.'),
    p([]),
    sH('6', 'Your Next Milestones (Next 90 Days)'),
    p([tr('1. '), trAmber('[Milestone 1]')]),
    p([tr('2. '), trAmber('[Milestone 2]')]),
    p([tr('3. '), trAmber('[Milestone 3]')]),
    p([tr('4. '), trAmber('[Milestone 4 — optional]')]),
    p([tr('5. '), trAmber('[Milestone 5 — optional]')]),
    p([]),
    sH('7', 'Client Satisfaction'),
    labelRow('NPS Score (0–10)'), labelRow('NPS Comment'),
    p([]),
    sH('8', 'Acknowledgements'),
    placeholder('Thank the client\'s Project Champion by name. Acknowledge any specific contribution from their team.'),
    p([]),
    sH('9', 'Handover Acceptance'),
    p([tr('I confirm receipt of all deliverables as described in Section 2 and am satisfied with the outcomes of this project.')]),
    p([tr('Client Signature: _________________ | Name: _________________ | Date: _________________')]),
  ]);
}

// ─── TPL-05 to TPL-14: Email Templates (combined document) ───────────────────
async function tplEmails() {
  const templates = [
    {
      id: 'TPL-05', title: 'Lead Acknowledgement Email',
      subject: 'Re: Your Quality System Enquiry',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'Thank you for reaching out to Preqal. I\'ve received your enquiry about [TOPIC] and will follow up within [X] business hours to discuss how we can help.',
        '',
        'In the meantime, feel free to explore our services at preqal.org.',
        '',
        'Warm regards,',
        'Dr. Stefan Gravesande | Preqal | stefan.gravesande@preqal.org',
      ]
    },
    {
      id: 'TPL-06', title: 'Discovery Call Invite Email',
      subject: 'Let\'s Connect — Preqal Discovery Call',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'Thank you for your interest in [SERVICE]. I\'d love to learn more about [COMPANY NAME] and how we can support your quality journey.',
        '',
        'I\'d like to schedule a 30-minute discovery call. Here are some times that work for me:',
        '  — [DATE/TIME OPTION 1]',
        '  — [DATE/TIME OPTION 2]',
        '  — [DATE/TIME OPTION 3]',
        '',
        'Please let me know which works for you, or book directly at [CALENDAR LINK].',
        '',
        'Best,',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
    {
      id: 'TPL-07', title: 'Proposal Cover Email',
      subject: 'Your Preqal Proposal — [PROJECT NAME]',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'Please find attached our proposal for [PROJECT DESCRIPTION] at [COMPANY NAME].',
        '',
        'The proposal covers:',
        '  • [Brief scope summary]',
        '  • Timeline: [X weeks/months]',
        '  • Investment: [CURRENCY AMOUNT]',
        '',
        'I\'m confident this will [SPECIFIC OUTCOME FOR CLIENT]. Happy to walk you through it on a call — just reply to this email.',
        '',
        'Looking forward to working with you.',
        '',
        'Best,',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
    {
      id: 'TPL-08', title: 'Contract Sent Email',
      subject: 'Service Agreement — [PROJECT NAME]',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'Great news — let\'s make this official. Please find attached your Service Agreement for [PROJECT NAME].',
        '',
        'Next steps:',
        '  1. Review the agreement',
        '  2. Sign and return (or reply confirming acceptance by email)',
        '  3. Once signed, we\'ll issue your deposit invoice (due within 5 business days)',
        '  4. Your kickoff meeting is tentatively set for [DATE]',
        '',
        'Any questions before signing? Happy to jump on a quick call.',
        '',
        'Best,',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
    {
      id: 'TPL-12', title: 'Invoice Cover Email',
      subject: 'Invoice [PRQ-YYYY-NNN] — [PROJECT NAME]',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'Please find attached Invoice [PRQ-YYYY-NNN] for [DESCRIPTION OF SERVICES].',
        '',
        'Amount due: [CURRENCY AMOUNT]',
        'Due date: [DATE]',
        'Payment details: [BANK/PAYMENT METHOD]',
        '',
        'If you have any questions, please don\'t hesitate to reach out.',
        '',
        'Thank you,',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
    {
      id: 'TPL-13', title: 'Payment Reminder Email (3 Variants)',
      subject: 'Payment Reminder — Invoice [PRQ-YYYY-NNN]',
      body: [
        '--- VARIANT 1: FRIENDLY (T+7) ---',
        '',
        'Dear [CLIENT NAME],',
        '',
        'Just a friendly reminder that Invoice [PRQ-YYYY-NNN] for [AMOUNT] was due on [DATE]. If payment has already been made, please disregard. If not, we\'d appreciate settlement at your earliest convenience.',
        '',
        'Best, Dr. Stefan Gravesande | Preqal',
        '',
        '--- VARIANT 2: FIRM (T+14 — Due) ---',
        '',
        'Dear [CLIENT NAME],',
        '',
        'Our records show that Invoice [PRQ-YYYY-NNN] for [AMOUNT], due [DATE], remains outstanding. Please arrange payment promptly to avoid a late fee. Payment details: [BANK DETAILS].',
        '',
        'Regards, Dr. Stefan Gravesande | Preqal',
        '',
        '--- VARIANT 3: OVERDUE (T+21) ---',
        '',
        'Dear [CLIENT NAME],',
        '',
        'Invoice [PRQ-YYYY-NNN] for [AMOUNT] is now [N] days overdue. Please make payment today at: [PAYMENT DETAILS]. If you are experiencing difficulties, please contact me directly so we can discuss a solution.',
        '',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
    {
      id: 'TPL-14', title: 'Renewal Reminder Email',
      subject: 'Checking In — [COMPANY NAME] | [SERVICE TYPE] Renewal',
      body: [
        'Dear [CLIENT NAME],',
        '',
        'It\'s been [X months] since we built your [SYSTEM/SERVICE] at [COMPANY NAME]. I hope it\'s been serving you well and that [SPECIFIC OUTCOME] has made a real difference.',
        '',
        'Your initial certification is due for its annual internal audit in [MONTH]. It\'s also a great time to review [OUTSTANDING RECOMMENDATION FROM CLOSURE REPORT].',
        '',
        'I\'d love to schedule a quick 20-minute check-in to see how the system is performing and what the next step looks like. [SPECIFIC NEXT SERVICE PROPOSAL].',
        '',
        'Would [DATE/TIME OPTION] work for you?',
        '',
        'Warm regards,',
        'Dr. Stefan Gravesande | Preqal',
      ]
    },
  ];

  const bodyChildren = [
    p([tr('This document contains all Preqal email templates (TPL-05 through TPL-14). Replace all '),
       trAmber('[PLACEHOLDER]'), tr(' fields before sending.')]),
    p([]),
  ];

  for (const t of templates) {
    bodyChildren.push(
      new Table({
        width: { size: CW, type: WidthType.DXA }, columnWidths: [CW],
        rows: [new TableRow({ children: [
          navyCell([p([trWhite(`${t.id} — ${t.title}`, 22)])], CW),
        ]})]
      }),
      p([tr('Subject: '), tr(t.subject, { bold: true, color: C.AMBER })]),
      p([]),
      ...t.body.map(line => p([tr(line)])),
      p([]), p([]),
    );
  }

  await save('TPL-05-14', 'TPL-05-14-Email-Templates.docx', {
    Title: 'Email Templates Collection (TPL-05 to TPL-14)',
    'Document No': 'TPL-05 to TPL-14', Version: '1.0', Date: TODAY, Owner: OWNER,
    'ISO Ref': 'ISO 9001:2015 §8.2',
  }, bodyChildren);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Generating Word templates...\n');
  await tpl01();
  await tpl02();
  await tpl03();
  await tpl04();
  await tpl09();
  await tpl10();
  await tpl11();
  await tplEmails();
  console.log('\n✅ All Word templates generated.');
})();
