#!/usr/bin/env node
'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Footer, TabStopType, TabStopPosition
} = require('docx');
const fs   = require('fs');
const path = require('path');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/05 - Policies';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

const C = {
  NAVY: '0F172A', NAVY_MID: '1E293B', AMBER: 'D97706', AMBER_LIGHT: 'FEF3C7',
  GRAY_BG: 'F8FAFC', GRAY_BORDER: 'CBD5E1', GRAY_TEXT: '64748B',
  SLATE: '334155', WHITE: 'FFFFFF',
};
const PAGE_W = 12240, PAGE_H = 15840, MAR = 1080, CW = PAGE_W - 2 * MAR;

function sb(color = C.GRAY_BORDER, size = 1) { return { style: BorderStyle.SINGLE, size, color }; }
function ab(color = C.GRAY_BORDER) { const b = sb(color); return { top:b, bottom:b, left:b, right:b }; }
function tr(text, opts = {}) { return new TextRun({ text, font:'Arial', size:22, ...opts }); }
function p(children, opts = {}) { return new Paragraph({ children, spacing:{ after:140 }, ...opts }); }

function cell(children, w, extra = {}) {
  return new TableCell({
    children, width:{ size:w, type:WidthType.DXA }, borders:ab(),
    margins:{ top:80, bottom:80, left:120, right:120 }, ...extra
  });
}
function navyCell(children, w) {
  return new TableCell({
    children, width:{ size:w, type:WidthType.DXA }, borders:ab(C.NAVY),
    shading:{ fill:C.NAVY, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
  });
}

function headerBanner(docNum, title) {
  return new Table({
    width:{ size:CW, type:WidthType.DXA }, columnWidths:[2000, CW - 2000],
    rows:[new TableRow({ children:[
      navyCell([p([tr('PREQAL', { bold:true, color:C.AMBER, size:32 })])], 2000),
      navyCell([
        p([tr(docNum, { color:C.AMBER, size:18, bold:true })]),
        p([tr(title, { color:C.WHITE, size:28, bold:true })]),
      ], CW - 2000),
    ]})]
  });
}

function metaTable(meta) {
  const rows = Object.entries(meta).map(([k, v]) =>
    new TableRow({ children:[
      navyCell([p([tr(k, { bold:true, color:C.WHITE, size:20 })])], 2500),
      cell([p([tr(v, { size:20 })])], CW - 2500),
    ]})
  );
  return new Table({ width:{ size:CW, type:WidthType.DXA }, columnWidths:[2500, CW - 2500], rows });
}

function sH(num, title) {
  return p([
    tr(num + '. ', { bold:true, color:C.AMBER, size:24 }),
    tr(title, { bold:true, color:C.NAVY, size:24 }),
  ]);
}

function docxFooter() {
  return new Footer({ children:[
    new Paragraph({
      tabStops:[{ type:TabStopType.RIGHT, position:TabStopPosition.MAX }],
      children:[
        tr('Preqal | Confidential | Internal Use', { color:C.GRAY_TEXT, size:18 }),
        tr('\t', { size:18 }),
        tr('Page ', { color:C.GRAY_TEXT, size:18 }),
        new TextRun({ children:[PageNumber.CURRENT], font:'Arial', size:18, color:C.GRAY_TEXT }),
      ]
    })
  ]});
}

async function buildPolicy(docNum, filename, title, isoRef, bodyChildren) {
  const meta = {
    'Document No': docNum, 'Version': '1.0', 'Effective Date': '2026-05-08',
    'Owner': 'Dr. Stefan Gravesande', 'Review Date': '2027-05-08', 'ISO Reference': isoRef,
  };
  const doc = new Document({
    sections:[{
      properties:{ page:{ size:{ width:PAGE_W, height:PAGE_H }, margin:{ top:MAR, right:MAR, bottom:MAR, left:MAR } } },
      footers:{ default:docxFooter() },
      children:[
        headerBanner(docNum, title),
        p([]),
        metaTable(meta),
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

// ─── POL-01: Quality Policy ───────────────────────────────────────────────────
async function pol01() {
  await buildPolicy('POL-01', 'POL-01-Quality-Policy.docx', 'Quality Policy',
    'ISO 9001:2015 §5.2', [
      sH('1', 'Purpose'),
      p([tr('Preqal exists to help organisations in the agri-food, poultry, and eco-hospitality sectors build management systems that actually work — systems that protect people, satisfy customers, and drive measurable improvement.')]),
      p([]),
      sH('2', 'Our Quality Commitment'),
      p([tr('Preqal is committed to:')]),
      p([tr('a) Delivering services that fully meet or exceed the requirements agreed with each client.')]),
      p([tr('b) Applying ISO 9001:2015 and related standards with rigour, accuracy, and integrity.')]),
      p([tr('c) Maintaining a culture of continual improvement in all our processes, tools, and outputs.')]),
      p([tr('d) Meeting applicable statutory and regulatory requirements in all jurisdictions we operate.')]),
      p([tr('e) Setting measurable quality objectives and reviewing them regularly to ensure they remain relevant and achievable.')]),
      p([]),
      sH('3', 'Quality Objectives'),
      p([tr('Preqal\'s current quality objectives include:')]),
      p([tr('  • 100% of proposals delivered within 48 hours of lead qualification (SOP-03)')]),
      p([tr('  • Average client NPS score ≥ 8 (SOP-07)')]),
      p([tr('  • 100% of invoices issued within 24 hours of trigger event (SOP-08)')]),
      p([tr('  • Client renewal rate ≥ 60% (SOP-09)')]),
      p([tr('These objectives are reviewed at each annual management review.')]),
      p([]),
      sH('4', 'Responsibility'),
      p([tr('Dr. Stefan Gravesande, as Managing Director, is personally responsible for establishing, maintaining, and communicating this Quality Policy. All workers — human and agentic — are expected to understand and apply this policy in their roles.')]),
      p([]),
      sH('5', 'Communication'),
      p([tr('This policy is available to all relevant parties at preqal.org and through the Preqal QMS document pack. It is reviewed annually and updated whenever the strategic context changes.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: ' + TODAY)]),
    ]
  );
}

// ─── POL-02: Data Protection & Privacy Policy ─────────────────────────────────
async function pol02() {
  await buildPolicy('POL-02', 'POL-02-Data-Protection-Privacy-Policy.docx',
    'Data Protection & Privacy Policy',
    'ISO 9001:2015 §7.5; TT Data Protection Act 2011', [
      sH('1', 'Purpose'),
      p([tr('This policy sets out how Preqal collects, stores, uses, and protects personal and confidential data belonging to clients, prospects, and other parties.')]),
      p([]),
      sH('2', 'Data We Collect'),
      p([tr('Preqal collects: name, email address, phone number, company name, job title, and service-related information provided through the website (preqal.org), email, or direct engagement.')]),
      p([]),
      sH('3', 'How We Use Data'),
      p([tr('Data is used solely for: (a) providing contracted services, (b) managing the client relationship, (c) sending invoices and project communications, (d) following up on service enquiries.')]),
      p([tr('We do not sell, share, or disclose personal data to third parties without explicit written consent, except where required by law.')]),
      p([]),
      sH('4', 'Data Storage & Security'),
      p([tr('Client data is stored in: Supabase (encrypted, row-level security enabled), Google Workspace (2FA required), and local encrypted devices. All agentic workers accessing data operate within defined access controls per SOP-10.')]),
      p([]),
      sH('5', 'Data Retention'),
      p([tr('Client project data is retained for 7 years post-project completion for legal and warranty purposes. Prospect data (non-converted leads) is deleted after 2 years of inactivity.')]),
      p([]),
      sH('6', 'Your Rights'),
      p([tr('Clients have the right to: (a) access their personal data, (b) request correction, (c) request deletion (subject to legal retention requirements). Contact: stefan.gravesande@preqal.org.')]),
      p([]),
      sH('7', 'Data Breaches'),
      p([tr('In the event of a data breach, affected parties will be notified within 72 hours of discovery. The incident will be logged in REG-07 (Non-Conformance Register) and investigated immediately.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: ' + TODAY)]),
    ]
  );
}

// ─── POL-03: Service Delivery & Scope Policy ──────────────────────────────────
async function pol03() {
  await buildPolicy('POL-03', 'POL-03-Service-Delivery-Scope-Policy.docx',
    'Service Delivery & Scope Policy',
    'ISO 9001:2015 §8.1, §8.5', [
      sH('1', 'Purpose'),
      p([tr('To define how Preqal manages the delivery of contracted services, handles scope changes, and ensures that every engagement meets the agreed quality standard.')]),
      p([]),
      sH('2', 'Service Scope Management'),
      p([tr('The agreed scope for each engagement is documented in the Service Agreement (TPL-03) and the accepted Service Proposal (TPL-02). No work outside the agreed scope will be delivered without a written scope amendment, agreed by both parties, and a revised invoice.')]),
      p([]),
      sH('3', 'Scope Change Process'),
      p([tr('If the client requests additional work beyond the contracted scope:')]),
      p([tr('  (a) Preqal will issue a Change Request outlining the additional work, timeline impact, and additional fee.')]),
      p([tr('  (b) The client must accept the Change Request in writing before additional work begins.')]),
      p([tr('  (c) The CRM record will be updated with the revised scope and contract value.')]),
      p([]),
      sH('4', 'Delivery Standards'),
      p([tr('All deliverables must: (a) meet the technical requirements of the applicable ISO standard, (b) be reviewed by Dr. Gravesande before submission to the client, (c) be submitted in the agreed format (Word, PDF, Excel), (d) be accompanied by clear handover instructions.')]),
      p([]),
      sH('5', 'Sub-contractors'),
      p([tr('Where sub-contractors or specialist consultants are used, Preqal remains fully responsible for the quality and timeliness of all deliverables. Sub-contractors must sign a Confidentiality Agreement before accessing any client data.')]),
      p([]),
      sH('6', 'Client Obligations'),
      p([tr('Clients are responsible for: (a) providing timely access to staff, premises, and documents as agreed, (b) reviewing and providing feedback on drafts within 5 business days, (c) designating a Project Champion as the primary point of contact.')]),
      p([]),
      sH('7', 'Non-Performance'),
      p([tr('If client delays cause the project to stall for more than 30 days, Preqal reserves the right to close the project and invoice for work completed to date.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: ' + TODAY)]),
    ]
  );
}

// ─── POL-04: Payment Terms & Credit Policy ───────────────────────────────────
async function pol04() {
  await buildPolicy('POL-04', 'POL-04-Payment-Terms-Credit-Policy.docx',
    'Payment Terms & Credit Policy',
    'ISO 9001:2015 §8.5.5', [
      sH('1', 'Purpose'),
      p([tr('To ensure clear, consistent payment terms across all Preqal engagements and to protect cash flow through systematic accounts receivable management.')]),
      p([]),
      sH('2', 'Standard Payment Schedule'),
      p([tr('All Preqal projects use the following default payment structure:')]),
      p([tr('  • Deposit (30–50% of total fee): due within 5 business days of contract signing')]),
      p([tr('  • Milestone invoice(s): due within 14 days of milestone completion (where applicable)')]),
      p([tr('  • Final invoice: due within 14 days of handover acceptance (SOP-07)')]),
      p([]),
      sH('3', 'Accepted Payment Methods'),
      p([tr('Bank transfer (ACH/wire), cheque (payable to Dr. Stefan Gravesande / Preqal), or other method as agreed in writing. Payment details are included on every invoice (TPL-04).')]),
      p([]),
      sH('4', 'Late Payment'),
      p([tr('Invoices not paid within terms will incur a late payment fee of 5% of the outstanding balance per month (or part thereof) after the due date. Preqal reserves the right to suspend services on any account with invoices more than 30 days overdue.')]),
      p([]),
      sH('5', 'Disputed Invoices'),
      p([tr('If a client disputes an invoice, they must notify Preqal in writing within 5 business days of receipt. Preqal will investigate within 2 business days. If the dispute is valid, a credit note and revised invoice will be issued. Undisputed portions remain payable on the original terms.')]),
      p([]),
      sH('6', 'Payment Plans'),
      p([tr('In exceptional circumstances, Preqal may agree to a structured payment plan for overdue balances. Any payment plan must be documented in writing and approved by Dr. Gravesande. It does not waive the right to the full balance.')]),
      p([]),
      sH('7', 'No Work Without Deposit'),
      p([tr('No project work will commence until the deposit invoice is paid in full. This is a firm policy with no exceptions, except where Preqal has explicitly agreed otherwise in writing.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: ' + TODAY)]),
    ]
  );
}

// ─── POL-05: Confidentiality & NDA Policy ────────────────────────────────────
async function pol05() {
  await buildPolicy('POL-05', 'POL-05-Confidentiality-NDA-Policy.docx',
    'Confidentiality & NDA Policy',
    'ISO 9001:2015 §7.5; TT Data Protection Act 2011', [
      sH('1', 'Purpose'),
      p([tr('To define Preqal\'s obligations regarding client confidentiality and to establish the standard Non-Disclosure Agreement (NDA) terms that govern all engagements.')]),
      p([]),
      sH('2', 'Confidentiality Obligations'),
      p([tr('Preqal treats all client information as strictly confidential. This includes: business processes, financial data, staff information, product formulations, client lists, audit findings, and any other proprietary information shared during the engagement.')]),
      p([tr('Confidential information will not be: (a) disclosed to any third party without written consent, (b) used for any purpose other than delivering the contracted services, (c) retained beyond the agreed retention period.')]),
      p([]),
      sH('3', 'Standard NDA Terms'),
      p([tr('Unless a client-specific NDA is in place, the following terms apply to all Preqal engagements by default:')]),
      p([tr('  • Obligation period: 5 years from the end of the engagement')]),
      p([tr('  • Scope: all non-public information shared by either party')]),
      p([tr('  • Exclusions: information that becomes publicly available through no breach of this policy; information already known to Preqal at the time of disclosure')]),
      p([tr('  • Governing law: Laws of Trinidad & Tobago')]),
      p([]),
      sH('4', 'Agentic Workers'),
      p([tr('Agentic workers (AI systems) engaged by Preqal to process client data operate under the same confidentiality obligations as human employees. Data processed by AI systems is subject to the same storage, access, and retention controls defined in POL-02.')]),
      p([]),
      sH('5', 'Breach of Confidentiality'),
      p([tr('Any actual or suspected breach of confidentiality must be reported to Dr. Gravesande immediately. Breaches will be logged in REG-07 (Non-Conformance Register) and investigated as a Quality Event. Clients affected by a breach will be notified promptly.')]),
      p([]),
      sH('6', 'Client Confidentiality Obligations'),
      p([tr('Clients receiving Preqal\'s proposals, methodologies, templates, and training materials agree to keep these confidential and not share them with third parties or competing consultancies.')]),
      p([]),
      p([tr('Signed: _________________  |  Name: Dr. Stefan Gravesande  |  Date: ' + TODAY)]),
    ]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Generating Word policies...\n');
  await pol01();
  await pol02();
  await pol03();
  await pol04();
  await pol05();
  console.log('\n✅ All Word policies generated.');
})();
