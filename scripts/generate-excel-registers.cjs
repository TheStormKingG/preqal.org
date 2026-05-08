#!/usr/bin/env node
'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const OUT_DIR = '/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers';
const PUB_DIR = '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/public/ims';

// Brand colours
const NAVY        = '0F172A';
const AMBER       = 'D97706';
const AMBER_LIGHT = 'FEF3C7';
const GRAY_BG     = 'F8FAFC';
const WHITE       = 'FFFFFF';
const GRAY_BORDER = 'CBD5E1';
const SLATE       = '334155';

function navyFill()       { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+NAVY } }; }
function amberFill()      { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER } }; }
function amberLightFill() { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+AMBER_LIGHT } }; }
function grayFill()       { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+GRAY_BG } }; }
function whiteFill()      { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+WHITE } }; }

function thinBorder() {
  const s = { style:'thin', color:{ argb:'FF'+GRAY_BORDER } };
  return { top:s, left:s, bottom:s, right:s };
}

function applyHeader(ws, values, colWidths) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = navyFill();
    cell.font = { name:'Arial', size:11, bold:true, color:{ argb:'FF'+WHITE } };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    cell.border = thinBorder();
  });
  row.height = 28;
  if (colWidths) colWidths.forEach((w,i) => { ws.getColumn(i+1).width = w; });
}

function applyData(ws, values, isAlt) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = isAlt ? grayFill() : whiteFill();
    cell.font = { name:'Arial', size:10, color:{ argb:'FF'+SLATE } };
    cell.alignment = { vertical:'middle', wrapText:true };
    cell.border = thinBorder();
  });
  row.height = 18;
  return row;
}

function titleBlock(ws, title, subtitle, colCount) {
  ws.mergeCells(1, 1, 1, colCount);
  const t = ws.getRow(1);
  t.getCell(1).value = title;
  t.getCell(1).font = { name:'Arial', size:14, bold:true, color:{ argb:'FF'+NAVY } };
  t.getCell(1).alignment = { horizontal:'left', vertical:'middle' };
  t.getCell(1).fill = amberLightFill();
  t.height = 36;

  ws.mergeCells(2, 1, 2, colCount);
  const s = ws.getRow(2);
  s.getCell(1).value = subtitle;
  s.getCell(1).font = { name:'Arial', size:10, color:{ argb:'FF'+SLATE } };
  s.getCell(1).alignment = { horizontal:'left', vertical:'middle' };
  s.getCell(1).fill = whiteFill();
  s.height = 20;

  ws.addRow([]); // spacer
}

async function saveWorkbook(wb, filename) {
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  fs.copyFileSync(outPath, pubPath);
  console.log(`✓ ${filename}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-01: Document Master Register
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG01() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  const categories = {
    'SOPs': [
      ['SOP-01','Document Control Procedure','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['SOP-02','Marketing & Lead Generation','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-03','Lead Capture & Classification','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-04','Quote & Proposal','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-05','Contract Execution & Onboarding Setup','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-06','Client Onboarding','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-07','Project Delivery','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-08','Project Closure & Handover','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-09','Billing & Accounts Receivable','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-10','Renewal, Upsell & Client Retention','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
      ['SOP-11','Admin Dashboard Operations','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
    ],
    'Registers': [
      ['REG-01','Document Master Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-02','Lead Register (Supabase)','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-03','Context of the Organization','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-04','Employee Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-05','HSE Risk Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-06','Internal Audit Register','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['REG-07','Non-Conformance & CAPA Register (Supabase)','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Forms & Templates': [
      ['TPL-01','Quote Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-02','Service Proposal Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-03','Service Agreement','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-04','Invoice Template','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-05','Lead Acknowledgement Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-06','Discovery Call Invite Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-07','Proposal Cover Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-08','Contract Sent Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-09','Project Kickoff Agenda','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-10','Weekly Status Report','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-11','Project Closure Report','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-12','Invoice Cover Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-13','Payment Reminder Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['TPL-14','Renewal Reminder Email','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Policies': [
      ['POL-01','Quality Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-02','Data Protection & Privacy Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-03','Service Delivery & Scope Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-04','Payment Terms & Credit Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
      ['POL-05','Confidentiality & NDA Policy','1.0','Active','Dr. Stefan Gravesande','2026-05-08','2027-05-08'],
    ],
    'Diagrams': [
      ['DIA-01','Preqal End-to-End Process Flow','1.0','Active','Dr. Stefan Gravesande','2026-05-07','2027-05-07'],
    ],
  };

  const headers   = ['Doc ID','Title','Version','Status','Owner','Issue Date','Review Date'];
  const colWidths = [12, 42, 10, 12, 28, 14, 14];

  for (const [cat, rows] of Object.entries(categories)) {
    const ws = wb.addWorksheet(cat);
    titleBlock(ws,
      `REG-01 — Document Master Register: ${cat}`,
      `Preqal IMS | Version 1.0 | Owner: Dr. Stefan Gravesande | ISO 9001:2015 §7.5`,
      headers.length
    );
    applyHeader(ws, headers, colWidths);
    rows.forEach((r, i) => applyData(ws, r, i % 2 === 1));
    ws.views = [{ state:'frozen', ySplit:4 }];
  }

  await saveWorkbook(wb, 'REG-01-Document-Master-Register.xlsx');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-03: Context of the Organization
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG03() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Internal Issues
  const ws1 = wb.addWorksheet('Internal Issues');
  titleBlock(ws1, 'REG-03 — Context: Internal Issues',
    'ISO 9001:2015 §4.1 | Factors inside the organisation that can affect quality outcomes', 6);
  applyHeader(ws1, ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'],
    [10, 20, 45, 18, 30, 25]);
  [
    ['INT-01','People','Small team — Dr. Gravesande is primary delivery resource','Active','High — capacity risk','Dr. Stefan Gravesande'],
    ['INT-02','Systems','Admin dashboard and SOPs recently formalised (2026)','Active','Medium — learning curve','Dr. Stefan Gravesande'],
    ['INT-03','Financial','Cash flow dependent on project conversion rate','Active','High — affects investment in tools','Dr. Stefan Gravesande'],
    ['INT-04','Knowledge','Deep ISO expertise held by one person','Active','High — succession risk','Dr. Stefan Gravesande'],
    ['INT-05','Technology','Agentic worker tools under active development','Active','Medium — process automation maturing','Dr. Stefan Gravesande'],
  ].forEach((r,i) => applyData(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: External Issues
  const ws2 = wb.addWorksheet('External Issues');
  titleBlock(ws2, 'REG-03 — Context: External Issues',
    'ISO 9001:2015 §4.1 | Factors in the external environment that can affect quality outcomes', 6);
  applyHeader(ws2, ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'],
    [10, 20, 45, 18, 30, 25]);
  [
    ['EXT-01','Market','Caribbean SME market has variable ISO awareness','Active','Medium — affects sales cycle length','Dr. Stefan Gravesande'],
    ['EXT-02','Regulatory','National standards bodies (TTBS, BSJ) evolving standards','Active','Medium — requires monitoring','Dr. Stefan Gravesande'],
    ['EXT-03','Economic','Post-COVID recovery affects client budgets','Active','High — affects project size/tier','Dr. Stefan Gravesande'],
    ['EXT-04','Technology','AI tools disrupting consulting delivery models','Active','High — creates opportunity and threat','Dr. Stefan Gravesande'],
    ['EXT-05','Competition','Larger regional consultancies may enter market','Low','Medium — differentiation required','Dr. Stefan Gravesande'],
  ].forEach((r,i) => applyData(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Interested Parties
  const ws3 = wb.addWorksheet('Interested Parties');
  titleBlock(ws3, 'REG-03 — Context: Interested Parties',
    "ISO 9001:2015 §4.2 | Parties with a stake in Preqal's quality management system", 7);
  applyHeader(ws3,
    ['Party ID','Stakeholder','Relationship','Key Needs & Expectations','How Needs Are Met','Review Date','Owner'],
    [10, 25, 18, 45, 35, 14, 25]);
  [
    ['IP-01','Clients','Customers','Accurate scope, on-time delivery, value for money','SOPs 03–07, status reports, closure report','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-02','Regulatory Bodies (TTBS, BSJ)','Regulator','Standards compliance, accurate certification advice','CPD, standards monitoring, SOP updates','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-03','ISO (via certification bodies)','Standards body','Correct application of ISO standards','Training, SOP alignment, audit trails','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-04','Agentic Workers (AI)','Service provider','Clear task definitions, structured data','SOPs with agentic instructions, Supabase data','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-05','Subcontractors','Service provider','Clear briefs, timely payment','Contracts, SOP-04, SOP-08','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-06','Dr. Stefan Gravesande','Owner/operator','Profitability, professional fulfilment','Dashboard KPIs, SOP-08, SOP-09','2027-05-08','Dr. Stefan Gravesande'],
  ].forEach((r,i) => applyData(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-03-Context-of-Organization.xlsx');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-04: Employee Register
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG04() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Active Employees
  const ws1 = wb.addWorksheet('Active Employees');
  titleBlock(ws1, 'REG-04 — Employee Register: Active Employees',
    'ISO 9001:2015 §7.1.2 | All current human and agentic workers', 9);
  applyHeader(ws1,
    ['Emp ID','Name','Type','Role','Email','Phone','Start Date','Status','Qualifications'],
    [10, 25, 18, 25, 30, 18, 14, 12, 35]);
  [
    ['EMP-01','Dr. Stefan Gravesande','Human Employee','Managing Director / Lead Consultant','stefan.gravesande@preqal.org','+1 868 xxx xxxx','2024-01-01','Active','PhD, ISO 9001 Lead Auditor, ISO 45001 Lead Auditor'],
    ['AGT-01','Lead Capture Agent','Agentic Employee','Automated lead classification and routing','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-02 authorised'],
    ['AGT-02','Quote Generation Agent','Agentic Employee','Proposal drafting and tier classification','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-03 authorised'],
    ['AGT-03','Onboarding Agent','Agentic Employee','Client onboarding document prep','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-05 authorised'],
    ['AGT-04','Project Delivery Agent','Agentic Employee','Status report drafting, deliverable tracking','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-06 authorised'],
    ['AGT-05','Billing Agent','Agentic Employee','Invoice drafting, AR monitoring','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-08 authorised'],
    ['AGT-06','Renewal Trigger Agent','Agentic Employee','T-30 renewal outreach drafting','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-09 authorised'],
  ].forEach((r,i) => applyData(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Training Log
  const ws2 = wb.addWorksheet('Training Log');
  titleBlock(ws2, 'REG-04 — Employee Register: Training Log',
    'ISO 9001:2015 §7.2 | Competence and training records', 7);
  applyHeader(ws2,
    ['Log ID','Employee ID','Training Title','Provider','Date Completed','Expiry Date','Certificate Ref'],
    [10, 12, 40, 25, 16, 16, 20]);
  [
    ['TRN-001','EMP-01','ISO 9001:2015 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-002','EMP-01','ISO 45001:2018 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-003','EMP-01','ISO 22000 FSMS Awareness','[Provider]','[DATE]','N/A','[CERT REF]'],
  ].forEach((r,i) => applyData(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Role Descriptions
  const ws3 = wb.addWorksheet('Role Descriptions');
  titleBlock(ws3, 'REG-04 — Employee Register: Role Descriptions',
    'ISO 9001:2015 §7.1.2, §7.2 | Defined responsibilities per role', 5);
  applyHeader(ws3,
    ['Role ID','Role Title','Type','Key Responsibilities','SOP References'],
    [10, 25, 18, 55, 20]);
  [
    ['ROLE-01','Managing Director / Lead Consultant','Human Employee','Client relationship management, proposal writing, project delivery, final sign-off on all documents, financial management','SOP-01 to SOP-10'],
    ['ROLE-02','Lead Capture Agent','Agentic Employee','Classify incoming leads, update status in Supabase, draft acknowledgement emails for human review','SOP-02'],
    ['ROLE-03','Quote Generation Agent','Agentic Employee','Generate proposal drafts from quote submission data, apply tier logic, flag for human review','SOP-03'],
    ['ROLE-04','Onboarding Agent','Agentic Employee','Generate onboarding documents, populate templates, send onboarding links after human approval','SOP-05'],
    ['ROLE-05','Project Delivery Agent','Agentic Employee','Draft weekly status reports, track deliverable completion, flag overdue items','SOP-06'],
    ['ROLE-06','Billing Agent','Agentic Employee','Draft invoices, monitor AR register, send automated payment reminders at T+7, T+14, T+21','SOP-08'],
    ['ROLE-07','Renewal Trigger Agent','Agentic Employee','Fire at T-30 before renewal_date, draft renewal email from CRM data, flag for human review','SOP-09'],
  ].forEach((r,i) => applyData(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-04-Employee-Register.xlsx');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-05: HSE Risk Register
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG05() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Risk Register
  const ws1 = wb.addWorksheet('Risk Register');
  titleBlock(ws1, 'REG-05 — HSE Risk Register',
    'ISO 45001:2018 §6.1.2 | Hazard identification and risk assessment', 10);
  applyHeader(ws1,
    ['Risk ID','Hazard','Activity','Who is Affected','Likelihood (1-5)','Severity (1-5)','Risk Score','Control Measures','Residual Risk','Owner'],
    [10, 30, 25, 20, 16, 14, 12, 45, 14, 25]);
  [
    ['HSE-001','Ergonomic strain — prolonged desk work','Office/remote desk work','Dr. Gravesande','2','3','6','Ergonomic chair, standing desk option, scheduled breaks every 90min','Low','Dr. Stefan Gravesande'],
    ['HSE-002','Eye strain — screen use','Client site visits and reporting','Dr. Gravesande','3','2','6','Screen filters, annual eye test, blue-light glasses','Low','Dr. Stefan Gravesande'],
    ['HSE-003','Road traffic accident during site visits','Travel to client sites','Dr. Gravesande','2','5','10','Defensive driving training, avoid fatigue driving, use GPS','Medium','Dr. Stefan Gravesande'],
    ['HSE-004','Slip/trip hazard on client premises','Client site inspections','Dr. Gravesande','2','3','6','PPE (safety boots), conduct pre-visit site risk check','Low','Dr. Stefan Gravesande'],
    ['HSE-005','Exposure to industrial chemicals (food processing clients)','IMS gap analysis on-site','Dr. Gravesande','1','4','4','Liaise with client HSE officer, obtain SDS, wear appropriate PPE','Low','Dr. Stefan Gravesande'],
    ['HSE-006','Psychosocial stress — sole operator workload','All activities','Dr. Gravesande','3','3','9','Scheduled days off, delegation to agentic workers, workload monitoring','Medium','Dr. Stefan Gravesande'],
    ['HSE-007','Data breach — client confidential information','All digital work','Clients + Preqal','2','5','10','Encrypted storage, Supabase RLS, access controls per SOP-10','Medium','Dr. Stefan Gravesande'],
  ].forEach((r,i) => applyData(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Risk Matrix
  const ws2 = wb.addWorksheet('Risk Matrix');
  titleBlock(ws2, 'REG-05 — HSE Risk Matrix',
    'Likelihood × Severity = Risk Score | Low: 1-4 | Medium: 5-9 | High: 10-25', 3);
  applyHeader(ws2, ['Score Range','Rating','Action Required'], [15, 15, 50]);
  [
    ['1 – 4','Low','Monitor; review annually or if circumstances change'],
    ['5 – 9','Medium','Implement additional controls; review quarterly'],
    ['10 – 16','High','Immediate action required; escalate to senior management'],
    ['17 – 25','Critical','Stop activity immediately; implement controls before resuming'],
  ].forEach((r,i) => applyData(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Incident Log
  const ws3 = wb.addWorksheet('Incident Log');
  titleBlock(ws3, 'REG-05 — HSE Incident Log',
    'ISO 45001:2018 §10.2 | Record all near-misses, incidents, and accidents', 8);
  applyHeader(ws3,
    ['Log ID','Date','Incident Type','Description','Persons Involved','Immediate Action Taken','Root Cause','Corrective Action'],
    [10, 14, 18, 40, 20, 35, 25, 35]);
  applyData(ws3,
    ['INC-001','[YYYY-MM-DD]','Near-Miss / Incident / Accident','[Description]','[Names]','[Immediate action]','[Root cause]','[Corrective action / REG-07 ref]'],
    false);
  ws3.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-05-HSE-Risk-Register.xlsx');
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-06: Internal Audit Register
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG06() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();

  // Tab 1: Audit Plan
  const ws1 = wb.addWorksheet('Plan');
  titleBlock(ws1, 'REG-06 — Internal Audit Register: Annual Plan',
    'ISO 9001:2015 §9.2 | Annual audit programme for the QMS', 7);
  applyHeader(ws1,
    ['Audit ID','Process / Clause','ISO Clause','Planned Date','Lead Auditor','Status','Notes'],
    [14, 38, 15, 16, 25, 14, 30]);
  [
    ['AUD-2026-01','Marketing & Lead Generation (SOP-01, SOP-02)','8.2.1','2026-08-01','Dr. Stefan Gravesande','Planned','First internal audit cycle'],
    ['AUD-2026-02','Quote, Proposal & Contract (SOP-03, SOP-04)','8.1, 8.4','2026-08-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-03','Project Delivery & Closure (SOP-05–SOP-07)','8.5, 8.6','2026-09-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-04','Billing & AR (SOP-08)','8.5.5','2026-09-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-05','Renewal & Retention (SOP-09)','9.1.2','2026-10-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-06','Admin Dashboard & Records (SOP-10)','7.5, 9.1','2026-10-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-07','HSE Risk Review (REG-05)','6.1.2','2026-11-01','Dr. Stefan Gravesande','Planned','ISO 45001 alignment'],
    ['AUD-2026-08','Annual Management Review','9.3','2026-12-01','Dr. Stefan Gravesande','Planned','Annual management review'],
  ].forEach((r,i) => applyData(ws1, r, i % 2 === 1));
  ws1.views = [{ state:'frozen', ySplit:4 }];

  // Tab 2: Schedule
  const ws2 = wb.addWorksheet('Schedule');
  titleBlock(ws2, 'REG-06 — Internal Audit Register: Schedule',
    'Confirmed audit dates, auditors, and scope', 6);
  applyHeader(ws2,
    ['Audit ID','Audit Title','Date','Duration','Auditor','Location'],
    [14, 42, 16, 12, 25, 20]);
  [
    ['AUD-2026-01','SOP-01/02 — Marketing & Lead Gen Audit','2026-08-01','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-02','SOP-03/04 — Quote & Contract Audit','2026-08-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-03','SOP-05–07 — Delivery & Closure Audit','2026-09-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-04','SOP-08 — Billing & AR Audit','2026-09-15','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-05','SOP-09 — Renewal & Retention Audit','2026-10-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-06','SOP-10 — Admin Dashboard Audit','2026-10-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-07','REG-05 — HSE Risk Review','2026-11-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-08','Annual Management Review','2026-12-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
  ].forEach((r,i) => applyData(ws2, r, i % 2 === 1));
  ws2.views = [{ state:'frozen', ySplit:4 }];

  // Tab 3: Checklist
  const ws3 = wb.addWorksheet('Checklist');
  titleBlock(ws3, 'REG-06 — Internal Audit Register: Checklist',
    'Standard audit questions for each SOP and clause', 6);
  applyHeader(ws3,
    ['Audit ID','Checklist Item','ISO Clause','Finding','Evidence Ref','Compliant? (Y/N/Partial)'],
    [14, 55, 14, 35, 20, 22]);
  [
    ['AUD-2026-01','Are all leads captured in the Supabase template_leads table?','8.2.1','','',''],
    ['AUD-2026-01','Are leads reviewed within 4 hours per SOP-02?','8.2.1','','',''],
    ['AUD-2026-02','Are all quote submissions recorded in quote_submissions?','8.1','','',''],
    ['AUD-2026-02','Is a proposal sent within 48 hours of qualification?','8.1','','',''],
    ['AUD-2026-03','Are client records created in crm_clients upon contract execution?','8.5','','',''],
    ['AUD-2026-03','Is a deposit invoice issued within 24 hours of contract signing?','8.5.5','','',''],
    ['AUD-2026-04','Are invoices issued within 24 hours of trigger event?','8.5.5','','',''],
    ['AUD-2026-04','Are all invoices recorded in REG-05 (invoices table)?','8.5.5','','',''],
    ['AUD-2026-05','Is renewal outreach sent at T-30 for all closed clients?','9.1.2','','',''],
    ['AUD-2026-06','Is the admin dashboard accessible and all tabs loading correctly?','7.5, 9.1','','',''],
    ['AUD-2026-07','Has every hazard in REG-05 been reviewed this period?','6.1.2','','',''],
    ['AUD-2026-08','Have all KPIs from all SOPs been reviewed?','9.3','','',''],
    ['AUD-2026-08','Have lessons learned from the previous year been reviewed?','10.3','','',''],
  ].forEach((r,i) => applyData(ws3, r, i % 2 === 1));
  ws3.views = [{ state:'frozen', ySplit:4 }];

  // Tab 4: Log
  const ws4 = wb.addWorksheet('Log');
  titleBlock(ws4, 'REG-06 — Internal Audit Register: Audit Log',
    'Results and findings from completed audits', 8);
  applyHeader(ws4,
    ['Log ID','Audit ID','Date Completed','Auditor','No. of Findings','No. of NCs','Overall Result','Report Ref'],
    [12, 14, 16, 25, 16, 12, 22, 20]);
  applyData(ws4,
    ['LOG-001','[AUD-ID]','[YYYY-MM-DD]','[Auditor]','[N]','[N]','Satisfactory / Needs Improvement / Unsatisfactory','[REG-07 ref]'],
    false);
  ws4.views = [{ state:'frozen', ySplit:4 }];

  await saveWorkbook(wb, 'REG-06-Internal-Audit-Register.xlsx');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('Generating Excel registers...\n');
  await generateREG01();
  await generateREG03();
  await generateREG04();
  await generateREG05();
  await generateREG06();
  console.log('\n✅ All Excel registers generated.');
})();
