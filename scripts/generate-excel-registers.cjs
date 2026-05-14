#!/usr/bin/env node
'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { applyPreqalHeader, applyDataHeader, applyDataRow } = require('./lib/register-branding.cjs');
const REG_DEFS = require('./lib/register-defs.cjs');

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const OUT_DIR      = process.env.QMS_REGISTERS_DIR ?? '/Users/stefangravesande/Documents/Projects/Preqal QMS/06 - Registers';
const PUB_DIR      = path.resolve(__dirname, '../public/ims');

const TODAY = new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────────────────────
// Shared save helper
// ─────────────────────────────────────────────────────────────────────────────
async function saveWorkbook(wb, filename) {
  const outPath = path.join(OUT_DIR, filename);
  const pubPath = path.join(PUB_DIR, filename);
  await wb.xlsx.writeFile(outPath);
  fs.copyFileSync(outPath, pubPath);
  console.log(`✓ ${filename}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic live-register builder (REG-01, REG-02, REG-10)
// ─────────────────────────────────────────────────────────────────────────────
async function buildLiveRegister(sb, def) {
  let q = sb.from(def.liveTable).select('*');
  if (def.liveFilter) {
    for (const [k, v] of Object.entries(def.liveFilter)) {
      q = v === null ? q.is(k, null) : q.eq(k, v);
    }
  }
  const { data: rows, error } = await q;
  if (error) throw new Error(`${def.id} fetch failed: ${error.message}`);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();
  const ws = wb.addWorksheet('Register');
  applyPreqalHeader(ws, {
    title: def.title,
    dcn:   def.dcn,
    scope: def.scope,
    creationDate: TODAY,
    versionNumber: '1.0',
    subtitle: def.subtitle || '',
    dataColCount: def.columns.length,
  });
  applyDataHeader(ws, def.columns.map(c => c.header), def.columns.map(c => c.width));
  rows.forEach((row, i) => {
    const values = def.columns.map(c => {
      const v = typeof c.source === 'function' ? c.source(row) : (row[c.source] ?? '');
      return v;
    });
    applyDataRow(ws, values, i % 2 === 1);
  });

  return wb;
}

async function generateLive(sb, regId) {
  const def = REG_DEFS.find(d => d.id === regId);
  if (!def || !def.liveTable) throw new Error(`${regId} is not a live register`);
  const wb = await buildLiveRegister(sb, def);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic hand-register builder — each `tab` describes one worksheet as data.
// ─────────────────────────────────────────────────────────────────────────────
function buildHandRegister(def, tabs) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Preqal'; wb.created = new Date();
  for (const tab of tabs) {
    const ws = wb.addWorksheet(tab.name);
    applyPreqalHeader(ws, {
      title: tab.title ?? (def.title + (tab.titleSuffix ? ' — ' + tab.titleSuffix : '')),
      dcn: def.dcn,
      scope: tab.scope ?? def.scope,
      creationDate: tab.creationDate ?? TODAY,
      versionNumber: tab.versionNumber ?? '1.0',
      subtitle: def.subtitle || '',
      dataColCount: tab.headers.length,
    });
    applyDataHeader(ws, tab.headers, tab.widths);
    tab.rows.forEach((r, i) => applyDataRow(ws, r, i % 2 === 1));
  }
  return wb;
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-03: Context of the Organization (hand-curated, 3 tabs)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG03() {
  const def = REG_DEFS.find(d => d.id === 'REG-03');
  const internal = [
    ['INT-01','People','Small team — Dr. Gravesande is primary delivery resource','Active','High — capacity risk','Dr. Stefan Gravesande'],
    ['INT-02','Systems','Admin dashboard and SOPs recently formalised (2026)','Active','Medium — learning curve','Dr. Stefan Gravesande'],
    ['INT-03','Financial','Cash flow dependent on project conversion rate','Active','High — affects investment in tools','Dr. Stefan Gravesande'],
    ['INT-04','Knowledge','Deep ISO expertise held by one person','Active','High — succession risk','Dr. Stefan Gravesande'],
    ['INT-05','Technology','Agentic worker tools under active development','Active','Medium — process automation maturing','Dr. Stefan Gravesande'],
  ];
  const external = [
    ['EXT-01','Market','Caribbean SME market has variable ISO awareness','Active','Medium — affects sales cycle length','Dr. Stefan Gravesande'],
    ['EXT-02','Regulatory','National standards bodies (TTBS, BSJ) evolving standards','Active','Medium — requires monitoring','Dr. Stefan Gravesande'],
    ['EXT-03','Economic','Post-COVID recovery affects client budgets','Active','High — affects project size/tier','Dr. Stefan Gravesande'],
    ['EXT-04','Technology','AI tools disrupting consulting delivery models','Active','High — creates opportunity and threat','Dr. Stefan Gravesande'],
    ['EXT-05','Competition','Larger regional consultancies may enter market','Low','Medium — differentiation required','Dr. Stefan Gravesande'],
  ];
  const parties = [
    ['IP-01','Clients','Customers','Accurate scope, on-time delivery, value for money','SOPs 03–07, status reports, closure report','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-02','Regulatory Bodies (TTBS, BSJ)','Regulator','Standards compliance, accurate certification advice','CPD, standards monitoring, SOP updates','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-03','ISO (via certification bodies)','Standards body','Correct application of ISO standards','Training, SOP alignment, audit trails','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-04','Agentic Workers (AI)','Service provider','Clear task definitions, structured data','SOPs with agentic instructions, Supabase data','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-05','Subcontractors','Service provider','Clear briefs, timely payment','Contracts, SOP-04, SOP-08','2027-05-08','Dr. Stefan Gravesande'],
    ['IP-06','Dr. Stefan Gravesande','Owner/operator','Profitability, professional fulfilment','Dashboard KPIs, SOP-08, SOP-09','2027-05-08','Dr. Stefan Gravesande'],
  ];

  const wb = buildHandRegister(def, [
    {
      name: 'Internal Issues',
      titleSuffix: 'INTERNAL ISSUES',
      scope: def.scope + ' | §4.1 INTERNAL',
      breakdown: [['INTERNAL', internal.length]],
      headers: ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'],
      widths:  [10, 20, 45, 18, 30, 25],
      rows: internal,
    },
    {
      name: 'External Issues',
      titleSuffix: 'EXTERNAL ISSUES',
      scope: def.scope + ' | §4.1 EXTERNAL',
      breakdown: [['EXTERNAL', external.length]],
      headers: ['Issue ID','Category','Description','Current Status','Impact on QMS','Owner'],
      widths:  [10, 20, 45, 18, 30, 25],
      rows: external,
    },
    {
      name: 'Interested Parties',
      titleSuffix: 'INTERESTED PARTIES',
      scope: def.scope + ' | §4.2',
      breakdown: [['STAKEHOLDERS', parties.length]],
      headers: ['Party ID','Stakeholder','Relationship','Key Needs & Expectations','How Needs Are Met','Review Date','Owner'],
      widths:  [10, 25, 18, 45, 35, 14, 25],
      rows: parties,
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-04: Employee Register (hand-curated, 3 tabs)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG04() {
  const def = REG_DEFS.find(d => d.id === 'REG-04');
  const active = [
    ['EMP-01','Dr. Stefan Gravesande','Human Employee','Managing Director / Lead Consultant','stefan.gravesande@preqal.org','+1 868 xxx xxxx','2024-01-01','Active','PhD, ISO 9001 Lead Auditor, ISO 45001 Lead Auditor'],
    ['AGT-01','Lead Capture Agent','Agentic Employee','Automated lead classification and routing','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-02 authorised'],
    ['AGT-02','Quote Generation Agent','Agentic Employee','Proposal drafting and tier classification','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-03 authorised'],
    ['AGT-03','Onboarding Agent','Agentic Employee','Client onboarding document prep','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-05 authorised'],
    ['AGT-04','Project Delivery Agent','Agentic Employee','Status report drafting, deliverable tracking','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-06 authorised'],
    ['AGT-05','Billing Agent','Agentic Employee','Invoice drafting, AR monitoring','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-08 authorised'],
    ['AGT-06','Renewal Trigger Agent','Agentic Employee','T-30 renewal outreach drafting','N/A','N/A','2026-05-07','Active','Claude AI (Anthropic) — SOP-09 authorised'],
  ];
  const humans = active.filter(r => r[2] === 'Human Employee').length;
  const agents = active.filter(r => r[2] === 'Agentic Employee').length;

  const training = [
    ['TRN-001','EMP-01','ISO 9001:2015 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-002','EMP-01','ISO 45001:2018 Lead Auditor','IRCA-accredited body','[DATE]','[DATE+3Y]','[CERT REF]'],
    ['TRN-003','EMP-01','ISO 22000 FSMS Awareness','[Provider]','[DATE]','N/A','[CERT REF]'],
  ];

  const roles = [
    ['ROLE-01','Managing Director / Lead Consultant','Human Employee','Client relationship management, proposal writing, project delivery, final sign-off on all documents, financial management','SOP-01 to SOP-10'],
    ['ROLE-02','Lead Capture Agent','Agentic Employee','Classify incoming leads, update status in Supabase, draft acknowledgement emails for human review','SOP-02'],
    ['ROLE-03','Quote Generation Agent','Agentic Employee','Generate proposal drafts from quote submission data, apply tier logic, flag for human review','SOP-03'],
    ['ROLE-04','Onboarding Agent','Agentic Employee','Generate onboarding documents, populate templates, send onboarding links after human approval','SOP-05'],
    ['ROLE-05','Project Delivery Agent','Agentic Employee','Draft weekly status reports, track deliverable completion, flag overdue items','SOP-06'],
    ['ROLE-06','Billing Agent','Agentic Employee','Draft invoices, monitor AR register, send automated payment reminders at T+7, T+14, T+21','SOP-08'],
    ['ROLE-07','Renewal Trigger Agent','Agentic Employee','Fire at T-30 before renewal_date, draft renewal email from CRM data, flag for human review','SOP-09'],
  ];

  const wb = buildHandRegister(def, [
    {
      name: 'Active Employees',
      titleSuffix: 'ACTIVE EMPLOYEES',
      scope: def.scope + ' | ISO 9001:2015 §7.1.2',
      breakdown: [['HUMAN', humans], ['AGENTIC', agents]],
      headers: ['Emp ID','Name','Type','Role','Email','Phone','Start Date','Status','Qualifications'],
      widths:  [10, 25, 18, 25, 30, 18, 14, 12, 35],
      rows: active,
    },
    {
      name: 'Training Log',
      titleSuffix: 'TRAINING LOG',
      scope: def.scope + ' | ISO 9001:2015 §7.2',
      breakdown: [['TRAINING', training.length]],
      headers: ['Log ID','Employee ID','Training Title','Provider','Date Completed','Expiry Date','Certificate Ref'],
      widths:  [10, 12, 40, 25, 16, 16, 20],
      rows: training,
    },
    {
      name: 'Role Descriptions',
      titleSuffix: 'ROLE DESCRIPTIONS',
      scope: def.scope + ' | ISO 9001:2015 §7.1.2, §7.2',
      breakdown: [['ROLES', roles.length]],
      headers: ['Role ID','Role Title','Type','Key Responsibilities','SOP References'],
      widths:  [10, 25, 18, 55, 20],
      rows: roles,
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-05: HSE Risk Register (hand-curated, 3 tabs)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG05() {
  const def = REG_DEFS.find(d => d.id === 'REG-05');
  const risks = [
    ['HSE-001','Ergonomic strain — prolonged desk work','Office/remote desk work','Dr. Gravesande','2','3','6','Ergonomic chair, standing desk option, scheduled breaks every 90min','Low','Dr. Stefan Gravesande'],
    ['HSE-002','Eye strain — screen use','Client site visits and reporting','Dr. Gravesande','3','2','6','Screen filters, annual eye test, blue-light glasses','Low','Dr. Stefan Gravesande'],
    ['HSE-003','Road traffic accident during site visits','Travel to client sites','Dr. Gravesande','2','5','10','Defensive driving training, avoid fatigue driving, use GPS','Medium','Dr. Stefan Gravesande'],
    ['HSE-004','Slip/trip hazard on client premises','Client site inspections','Dr. Gravesande','2','3','6','PPE (safety boots), conduct pre-visit site risk check','Low','Dr. Stefan Gravesande'],
    ['HSE-005','Exposure to industrial chemicals (food processing clients)','IMS gap analysis on-site','Dr. Gravesande','1','4','4','Liaise with client HSE officer, obtain SDS, wear appropriate PPE','Low','Dr. Stefan Gravesande'],
    ['HSE-006','Psychosocial stress — sole operator workload','All activities','Dr. Gravesande','3','3','9','Scheduled days off, delegation to agentic workers, workload monitoring','Medium','Dr. Stefan Gravesande'],
    ['HSE-007','Data breach — client confidential information','All digital work','Clients + Preqal','2','5','10','Encrypted storage, Supabase RLS, access controls per SOP-10','Medium','Dr. Stefan Gravesande'],
  ];
  const bd = {};
  risks.forEach(r => {
    const k = r[8].toUpperCase();
    bd[k] = (bd[k] || 0) + 1;
  });
  const riskBreakdown = Object.entries(bd).sort((a, b) => b[1] - a[1]);

  const matrix = [
    ['1 – 4','Low','Monitor; review annually or if circumstances change'],
    ['5 – 9','Medium','Implement additional controls; review quarterly'],
    ['10 – 16','High','Immediate action required; escalate to senior management'],
    ['17 – 25','Critical','Stop activity immediately; implement controls before resuming'],
  ];

  const incidents = [
    ['INC-001','[YYYY-MM-DD]','Near-Miss / Incident / Accident','[Description]','[Names]','[Immediate action]','[Root cause]','(TEMPLATE — replace before use)'],
  ];

  const wb = buildHandRegister(def, [
    {
      name: 'Risk Register',
      titleSuffix: 'RISK REGISTER',
      scope: def.scope + ' | ISO 45001:2018 §6.1.2',
      breakdown: riskBreakdown,
      headers: ['Risk ID','Hazard','Activity','Who is Affected','Likelihood (1-5)','Severity (1-5)','Risk Score','Control Measures','Residual Risk','Owner'],
      widths:  [10, 30, 25, 20, 16, 14, 12, 45, 14, 25],
      rows: risks,
    },
    {
      name: 'Risk Matrix',
      titleSuffix: 'RISK MATRIX',
      scope: 'Likelihood × Severity = Risk Score',
      breakdown: [['BANDS', matrix.length]],
      headers: ['Score Range','Rating','Action Required'],
      widths:  [15, 15, 50],
      rows: matrix,
    },
    {
      name: 'Incident Log',
      titleSuffix: 'INCIDENT LOG',
      scope: def.scope + ' | ISO 45001:2018 §10.2',
      bigNumber: 0,
      breakdown: [['INCIDENTS', 0]],
      status: { created: 0, revised: 0, approved: 0 },
      headers: ['Log ID','Date','Incident Type','Description','Persons Involved','Immediate Action Taken','Root Cause','Corrective Action'],
      widths:  [10, 14, 18, 40, 20, 35, 25, 35],
      rows: incidents,
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-06: Internal Audit Register (hand-curated, 4 tabs)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG06() {
  const def = REG_DEFS.find(d => d.id === 'REG-06');
  const plan = [
    ['AUD-2026-01','Marketing & Lead Generation (SOP-01, SOP-02)','8.2.1','2026-08-01','Dr. Stefan Gravesande','Planned','First internal audit cycle'],
    ['AUD-2026-02','Quote, Proposal & Contract (SOP-03, SOP-04)','8.1, 8.4','2026-08-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-03','Project Delivery & Closure (SOP-05–SOP-07)','8.5, 8.6','2026-09-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-04','Billing & AR (SOP-08)','8.5.5','2026-09-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-05','Renewal & Retention (SOP-09)','9.1.2','2026-10-01','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-06','Admin Dashboard & Records (SOP-10)','7.5, 9.1','2026-10-15','Dr. Stefan Gravesande','Planned',''],
    ['AUD-2026-07','HSE Risk Review (REG-05)','6.1.2','2026-11-01','Dr. Stefan Gravesande','Planned','ISO 45001 alignment'],
    ['AUD-2026-08','Annual Management Review','9.3','2026-12-01','Dr. Stefan Gravesande','Planned','Annual management review'],
  ];
  const schedule = [
    ['AUD-2026-01','SOP-01/02 — Marketing & Lead Gen Audit','2026-08-01','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-02','SOP-03/04 — Quote & Contract Audit','2026-08-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-03','SOP-05–07 — Delivery & Closure Audit','2026-09-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-04','SOP-08 — Billing & AR Audit','2026-09-15','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-05','SOP-09 — Renewal & Retention Audit','2026-10-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-06','SOP-10 — Admin Dashboard Audit','2026-10-15','2 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-07','REG-05 — HSE Risk Review','2026-11-01','1.5 hours','Dr. Stefan Gravesande','Remote / Office'],
    ['AUD-2026-08','Annual Management Review','2026-12-01','3 hours','Dr. Stefan Gravesande','Remote / Office'],
  ];
  const checklist = [
    ['AUD-2026-01','Are all leads captured in the Supabase template_leads table?','8.2.1','','',''],
    ['AUD-2026-01','Are leads reviewed within 4 hours per SOP-02?','8.2.1','','',''],
    ['AUD-2026-02','Are all quote submissions recorded in qualified_leads?','8.1','','',''],
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
  ];
  const log = [
    ['LOG-001','[AUD-ID]','[YYYY-MM-DD]','[Auditor]','[N]','[N]','(TEMPLATE — replace before use)','[REG-07 ref]'],
  ];

  const wb = buildHandRegister(def, [
    {
      name: 'Plan',
      titleSuffix: 'ANNUAL PLAN',
      breakdown: [['PLANNED', plan.length]],
      headers: ['Audit ID','Process / Clause','ISO Clause','Planned Date','Lead Auditor','Status','Notes'],
      widths:  [14, 38, 15, 16, 25, 14, 30],
      rows: plan,
    },
    {
      name: 'Schedule',
      titleSuffix: 'SCHEDULE',
      breakdown: [['SCHEDULED', schedule.length]],
      headers: ['Audit ID','Audit Title','Date','Duration','Auditor','Location'],
      widths:  [14, 42, 16, 12, 25, 20],
      rows: schedule,
    },
    {
      name: 'Checklist',
      titleSuffix: 'CHECKLIST',
      breakdown: [['QUESTIONS', checklist.length]],
      headers: ['Audit ID','Checklist Item','ISO Clause','Finding','Evidence Ref','Compliant? (Y/N/Partial)'],
      widths:  [14, 55, 14, 35, 20, 22],
      rows: checklist,
    },
    {
      name: 'Log',
      titleSuffix: 'AUDIT LOG',
      bigNumber: 0,
      breakdown: [['COMPLETED', 0]],
      status: { created: 0, revised: 0, approved: 0 },
      headers: ['Log ID','Audit ID','Date Completed','Auditor','No. of Findings','No. of NCs','Overall Result','Report Ref'],
      widths:  [12, 14, 16, 25, 16, 12, 22, 20],
      rows: log,
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-07: NCR & CAPA (placeholder)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG07() {
  const def = REG_DEFS.find(d => d.id === 'REG-07');
  const wb = buildHandRegister(def, [
    {
      name: 'NCR & CAPA',
      title: def.title,
      bigNumber: 0,
      breakdown: [['OPEN', 0], ['CLOSED', 0]],
      status: { created: 0, revised: 0, approved: 0 },
      headers: ['NCR ID','Raised Date','Source','Description','Category','Severity','CAPA Ref','Status'],
      widths:  [10, 14, 18, 40, 14, 12, 14, 12],
      rows: [
        ['NCR-001','[YYYY-MM-DD]','Internal Audit','[Description]','Process','Major','CAPA-001','(TEMPLATE — replace before use)'],
      ],
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-08: Quality Risk (placeholder)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG08() {
  const def = REG_DEFS.find(d => d.id === 'REG-08');
  const wb = buildHandRegister(def, [
    {
      name: 'Quality Risks',
      title: def.title,
      bigNumber: 0,
      breakdown: [['HIGH', 0], ['MEDIUM', 0], ['LOW', 0]],
      status: { created: 0, revised: 0, approved: 0 },
      headers: ['Risk ID','Category','Description','Likelihood','Impact','Score','Mitigation','Owner'],
      widths:  [10, 18, 40, 12, 10, 10, 36, 22],
      rows: [
        ['QR-001','[Category]','[Description]','Medium','High','12','[Mitigation]','(TEMPLATE — replace before use)'],
      ],
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// REG-09: Legal & Compliance (placeholder)
// ─────────────────────────────────────────────────────────────────────────────
async function generateREG09() {
  const def = REG_DEFS.find(d => d.id === 'REG-09');
  const wb = buildHandRegister(def, [
    {
      name: 'Legal & Compliance',
      title: def.title,
      bigNumber: 0,
      breakdown: [['REGULATORY', 0], ['CONTRACTUAL', 0]],
      status: { created: 0, revised: 0, approved: 0 },
      headers: ['Obligation ID','Source','Description','Type','Compliance Status','Next Review','Owner'],
      widths:  [12, 22, 40, 14, 18, 14, 22],
      rows: [
        ['LEG-001','[Regulation/Contract]','[Description]','Regulatory','Compliant','[YYYY-MM-DD]','(TEMPLATE — replace before use)'],
      ],
    },
  ]);
  await saveWorkbook(wb, def.file);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const HAND_GENERATORS = {
  'REG-03': generateREG03,
  'REG-04': generateREG04,
  'REG-05': generateREG05,
  'REG-06': generateREG06,
  'REG-07': generateREG07,
  'REG-08': generateREG08,
  'REG-09': generateREG09,
};

async function main() {
  const key  = process.env.SUPABASE_SERVICE_KEY;
  const only = process.argv[2];

  const live = ['REG-01','REG-02','REG-10'];
  const hand = ['REG-03','REG-04','REG-05','REG-06','REG-07','REG-08','REG-09'];

  if (only && !live.includes(only) && !hand.includes(only)) {
    console.error(`Unknown register: ${only}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUB_DIR, { recursive: true });

  const wantLive = !only || live.includes(only);
  if (wantLive && !key) {
    console.error('SUPABASE_SERVICE_KEY required for live registers (REG-01, REG-02, REG-10).');
    process.exit(1);
  }
  const sb = wantLive ? createClient(SUPABASE_URL, key) : null;

  console.log('Generating Excel registers...\n');
  for (const id of live) {
    if (!only || only === id) await generateLive(sb, id);
  }
  for (const id of hand) {
    if (!only || only === id) await HAND_GENERATORS[id]();
  }
  console.log('\n✅ Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
