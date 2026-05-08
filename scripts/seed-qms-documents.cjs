#!/usr/bin/env node
'use strict';

/**
 * Preqal IMS — Seed qms_documents Supabase Table
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/seed-qms-documents.cjs
 *
 * Get the service role key from:
 *   Supabase dashboard → Project gndcjmxxgtnoidxgcdnx → Settings → API → service_role
 *
 * This script uses UPSERT on doc_id, so it is safe to run multiple times.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gndcjmxxgtnoidxgcdnx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('\nERROR: SUPABASE_SERVICE_KEY environment variable is not set.');
  console.error('Usage: SUPABASE_SERVICE_KEY=<service_role_key> node scripts/seed-qms-documents.cjs\n');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE  = 'https://preqal.org/ims';
const OWNER = 'Dr. Stefan Gravesande';

const documents = [
  // ─── SOPs (category = 'Procedure') ───────────────────────────────────────
  {
    doc_id: 'SOP-01', title: 'Marketing & Lead Generation', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-01-MARKETING-LEAD-GENERATION.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Defines inbound and outbound marketing activities, SEO, lead gen campaigns, and first-contact protocols.',
  },
  {
    doc_id: 'SOP-02', title: 'Lead Capture & Classification', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-02-LEAD-CAPTURE-CLASSIFICATION.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Process for capturing leads from all sources, classifying by intent and readiness, and triggering follow-up.',
  },
  {
    doc_id: 'SOP-03', title: 'Quote & Proposal', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-03-QUOTE-PROPOSAL.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'End-to-end quote generation and proposal process from discovery call to accepted proposal.',
  },
  {
    doc_id: 'SOP-04', title: 'Contract Execution & Onboarding Setup', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-04-CONTRACT-EXECUTION.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Contract signing, deposit collection, CRM record creation, and pre-onboarding setup.',
  },
  {
    doc_id: 'SOP-05', title: 'Client Onboarding', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-05-CLIENT-ONBOARDING.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Formal onboarding of new clients including kickoff meeting, portal setup, and stakeholder alignment.',
  },
  {
    doc_id: 'SOP-06', title: 'Project Delivery', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-06-PROJECT-DELIVERY.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Ongoing project management, weekly status reporting, deliverable quality control, and milestone tracking.',
  },
  {
    doc_id: 'SOP-07', title: 'Project Closure & Handover', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-07-PROJECT-CLOSURE.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Formal project closure including Closure Report, NPS collection, handover acceptance, and renewal scheduling.',
  },
  {
    doc_id: 'SOP-08', title: 'Billing & Accounts Receivable', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-08-BILLING-ACCOUNTS-RECEIVABLE.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Invoice issuance, AR monitoring, payment reminders, and overdue escalation.',
  },
  {
    doc_id: 'SOP-09', title: 'Renewal, Upsell & Client Retention', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-09-RENEWAL-UPSELL.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'T-30 renewal outreach, upsell identification, testimonial capture, and referral programme.',
  },
  {
    doc_id: 'SOP-10', title: 'Admin Dashboard Operations', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/SOP-10-ADMIN-DASHBOARD.docx`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Daily and weekly admin dashboard operating procedures for human and agentic workers.',
  },

  // ─── Registers ────────────────────────────────────────────────────────────
  {
    doc_id: 'REG-01', title: 'Document Master Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/REG-01-Document-Master-Register.xlsx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Master index of all IMS documents: SOPs, registers, templates, policies, and diagrams.',
  },
  {
    doc_id: 'REG-03', title: 'Context of the Organization', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/REG-03-Context-of-Organization.xlsx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'ISO 9001:2015 §4.1/§4.2 register of internal/external issues and interested parties.',
  },
  {
    doc_id: 'REG-04', title: 'Employee Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/REG-04-Employee-Register.xlsx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Human and agentic employee register with training log and role descriptions.',
  },
  {
    doc_id: 'REG-05', title: 'HSE Risk Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/REG-05-HSE-Risk-Register.xlsx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'ISO 45001:2018 hazard identification, risk assessment, and incident log.',
  },
  {
    doc_id: 'REG-06', title: 'Internal Audit Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/REG-06-Internal-Audit-Register.xlsx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Annual audit programme with plan, schedule, checklist, and audit log.',
  },

  // ─── Templates ────────────────────────────────────────────────────────────
  {
    doc_id: 'TPL-01', title: 'Quote Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-01-Quote-Template.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Formal quote document with pricing table, scope description, and acceptance clause.',
  },
  {
    doc_id: 'TPL-02', title: 'Service Proposal Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-02-Service-Proposal-Template.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Full service proposal with executive summary, approach, scope, timeline, and investment.',
  },
  {
    doc_id: 'TPL-03', title: 'Service Agreement', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-03-Service-Agreement.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Standard service contract covering scope, fees, confidentiality, IP, and signatures.',
  },
  {
    doc_id: 'TPL-04', title: 'Invoice Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-04-Invoice-Template.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Branded invoice with line items, totals, payment details, and terms.',
  },
  {
    doc_id: 'TPL-05-14', title: 'Email Templates Collection (TPL-05 to TPL-14)', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-05-14-Email-Templates.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'All Preqal email templates: lead acknowledgement, discovery invite, proposal cover, contract sent, invoice cover, payment reminders (3 variants), and renewal reminder.',
  },
  {
    doc_id: 'TPL-09', title: 'Project Kickoff Agenda', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-09-Project-Kickoff-Agenda.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Structured kickoff meeting agenda covering scope, roles, timeline, and communication protocol.',
  },
  {
    doc_id: 'TPL-10', title: 'Weekly Status Report', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-10-Weekly-Status-Report.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Weekly project status report with RAG status, progress summary, issues, and action items.',
  },
  {
    doc_id: 'TPL-11', title: 'Project Closure Report', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/TPL-11-Project-Closure-Report.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Formal closure report covering deliverables, outcomes, recommendations, and handover acceptance.',
  },

  // ─── Policies ─────────────────────────────────────────────────────────────
  {
    doc_id: 'POL-01', title: 'Quality Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/POL-01-Quality-Policy.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: "ISO 9001:2015 §5.2 Quality Policy — Preqal's commitment to quality, continual improvement, and measurable objectives.",
  },
  {
    doc_id: 'POL-02', title: 'Data Protection & Privacy Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/POL-02-Data-Protection-Privacy-Policy.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Data collection, storage, retention, and breach handling per TT Data Protection Act and GDPR principles.',
  },
  {
    doc_id: 'POL-03', title: 'Service Delivery & Scope Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/POL-03-Service-Delivery-Scope-Policy.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Scope management, change control, delivery standards, sub-contractor rules, and client obligations.',
  },
  {
    doc_id: 'POL-04', title: 'Payment Terms & Credit Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/POL-04-Payment-Terms-Credit-Policy.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Payment schedule, late fees, dispute process, payment plans, and no-work-without-deposit rule.',
  },
  {
    doc_id: 'POL-05', title: 'Confidentiality & NDA Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/POL-05-Confidentiality-NDA-Policy.docx`,
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Standard NDA terms, confidentiality obligations, agentic worker data handling, and breach response.',
  },

  // ─── Diagrams ─────────────────────────────────────────────────────────────
  {
    doc_id: 'DIA-01', title: 'Preqal End-to-End Process Flow', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: `${BASE}/Preqal-Process-Flow.png`,
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Visual process flow diagram covering the full Preqal client pipeline from lead to renewal.',
  },
];

(async () => {
  console.log(`Seeding ${documents.length} records into qms_documents...\n`);

  const { data, error } = await sb
    .from('qms_documents')
    .upsert(documents, { onConflict: 'doc_id' });

  if (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${documents.length} documents into qms_documents.`);
  console.log('\nVerify at: https://preqal.org/qms.html → Documents tab');
})();
