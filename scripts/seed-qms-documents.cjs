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
 * This script DELETES all existing SOP records and re-seeds the full document list
 * with correct doc_ids (SOP-01 Document Control through SOP-11) and Google Drive URLs.
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
const GD  = 'https://drive.google.com/file/d';
const OWNER = 'Dr. Stefan Gravesande';

// Google Drive file IDs for each document
// All files are in folder 1EgyXN41_EtT1jiOZO_tN9BqJHY18LoK5
const driveUrl = (id) => `${GD}/${id}/view`;

const documents = [
  // ─── SOPs (category = 'Procedure') ───────────────────────────────────────
  {
    doc_id: 'SOP-01', title: 'Document Control Procedure', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1-q1t1KEo-DebAzYm9-F7XOqgtp96QP1v'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Defines how all IMS documents are created, reviewed, approved, stored in three locations (Mac, preqal.org/ims/, Google Drive), and controlled.',
  },
  {
    doc_id: 'SOP-02', title: 'Marketing & Lead Generation', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('13fnZ8VB8cAc04tr3KKWdzIUcTYH05Vbx'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Defines inbound and outbound marketing activities, SEO, lead gen campaigns, and first-contact protocols.',
  },
  {
    doc_id: 'SOP-03', title: 'Lead Capture & Classification', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1bP7CSb3HSuxLlB4PT2iEmvJlq3BdYqWM'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Process for capturing leads from all sources, classifying by intent and readiness, and triggering follow-up.',
  },
  {
    doc_id: 'SOP-04', title: 'Quote & Proposal', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1GYDTwykdxuhZa4dEXEqTkwsc0s_jUc6i'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'End-to-end quote generation and proposal process from discovery call to accepted proposal.',
  },
  {
    doc_id: 'SOP-05', title: 'Contract Execution & Onboarding Setup', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1K2p1wP96Jx_sRF0NNQo2QTAaO9U8rQeP'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Contract signing, deposit collection, CRM record creation, and pre-onboarding setup.',
  },
  {
    doc_id: 'SOP-06', title: 'Client Onboarding', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1kdvCG2-x5JFksdloAo48HKXp6dir6GEM'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Formal onboarding of new clients including kickoff meeting, portal setup, and stakeholder alignment.',
  },
  {
    doc_id: 'SOP-07', title: 'Project Delivery', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1RGMay4htekZiC5KX-8Sz3V0NcQ2ar9zX'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Ongoing project management, weekly status reporting, deliverable quality control, and milestone tracking.',
  },
  {
    doc_id: 'SOP-08', title: 'Project Closure & Handover', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1ySuAaRG5dwMe7xgF2cJUIK5W74gQf5Jh'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Formal project closure including Closure Report, NPS collection, handover acceptance, and renewal scheduling.',
  },
  {
    doc_id: 'SOP-09', title: 'Billing & Accounts Receivable', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('18ycblMxkaDdodLTFl9iS3liQfHaes_an'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Invoice issuance, AR monitoring, payment reminders, and overdue escalation.',
  },
  {
    doc_id: 'SOP-10', title: 'Renewal, Upsell & Client Retention', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1WD-QIXHyeGDdJtMG9a8Xy__9wnp1egus'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'T-30 renewal outreach, upsell identification, testimonial capture, and referral programme.',
  },
  {
    doc_id: 'SOP-11', title: 'Admin Dashboard Operations', category: 'Procedure',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1bv0uxFwxb4ybt4yrkxR1EfeABlRkUJo9'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Daily and weekly admin dashboard operating procedures for human and agentic workers.',
  },

  // ─── Registers ────────────────────────────────────────────────────────────
  {
    doc_id: 'REG-01', title: 'Document Master Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('13fr6nIHglylrJpxKNg0p34lDuKR3qoKL'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Master index of all IMS documents: SOPs, registers, templates, policies, and diagrams.',
  },
  {
    doc_id: 'REG-03', title: 'Context of the Organization', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1HuQGu2YarrCI4ovreIyErJWFOcNa8otx'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'ISO 9001:2015 §4.1/§4.2 register of internal/external issues and interested parties.',
  },
  {
    doc_id: 'REG-04', title: 'Employee Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1T3OXvzJ4ajRR_L8lf0hTIjdPBQjYkH_V'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Human and agentic employee register with training log and role descriptions.',
  },
  {
    doc_id: 'REG-05', title: 'HSE Risk Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1nk9XczKm1WLsZHPIWw-QttGnm_Oo8VrY'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'ISO 45001:2018 hazard identification, risk assessment, and incident log.',
  },
  {
    doc_id: 'REG-06', title: 'Internal Audit Register', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1Tnby65KxPXMR-uw4K_4PfOwNQ8lwK1Tn'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Annual audit programme with plan, schedule, checklist, and audit log.',
  },

  // ─── Templates ────────────────────────────────────────────────────────────
  {
    doc_id: 'TPL-01', title: 'Quote Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1DlzhKJIgOjk5TU7H1EZnZAYVMpKzTaK1'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Formal quote document with pricing table, scope description, and acceptance clause.',
  },
  {
    doc_id: 'TPL-02', title: 'Service Proposal Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1blXKvSU8WRAghxVP-1GZ4HfkVA52aIip'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Full service proposal with executive summary, approach, scope, timeline, and investment.',
  },
  {
    doc_id: 'TPL-03', title: 'Service Agreement', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1g1FmwYP5-DeGjYO8uAM178qncWfcVFti'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Standard service contract covering scope, fees, confidentiality, IP, and signatures.',
  },
  {
    doc_id: 'TPL-04', title: 'Invoice Template', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1JYi33PREz4KEwuKHK4dBHchQPVJlZabl'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Branded invoice with line items, totals, payment details, and terms.',
  },
  {
    doc_id: 'TPL-05-14', title: 'Email Templates Collection (TPL-05 to TPL-14)', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1C35a2KXzZzMsMtKPUO3L7qwAQiNj0LuU'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'All Preqal email templates: lead acknowledgement, discovery invite, proposal cover, contract sent, invoice cover, payment reminders (3 variants), and renewal reminder.',
  },
  {
    doc_id: 'TPL-09', title: 'Project Kickoff Agenda', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1qoGgyOEyguXkpMtPNE2627puug9MXy9n'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Structured kickoff meeting agenda covering scope, roles, timeline, and communication protocol.',
  },
  {
    doc_id: 'TPL-10', title: 'Weekly Status Report', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1hJSyKSbqnaj26wDmqMVQ0pbUUd5H6_s0'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Weekly project status report with RAG status, progress summary, issues, and action items.',
  },
  {
    doc_id: 'TPL-11', title: 'Project Closure Report', category: 'Form',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1X7NTKDWg4ZaRnYGnFGCkyoVQt_NVkb41'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Formal closure report covering deliverables, outcomes, recommendations, and handover acceptance.',
  },

  // ─── Policies ─────────────────────────────────────────────────────────────
  {
    doc_id: 'POL-01', title: 'Quality Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1TtVe1YZjvcbB8Q-cAoyeWOhkhp6tHITs'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: "ISO 9001:2015 §5.2 Quality Policy — Preqal's commitment to quality, continual improvement, and measurable objectives.",
  },
  {
    doc_id: 'POL-02', title: 'Data Protection & Privacy Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('100yBWFe16FJpWIZ3cTx1dktSFY1XfaOY'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Data collection, storage, retention, and breach handling per TT Data Protection Act and GDPR principles.',
  },
  {
    doc_id: 'POL-03', title: 'Service Delivery & Scope Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1JNeqOjPAjy3o8LVMvzIvkqghjlvMUYb8'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Scope management, change control, delivery standards, sub-contractor rules, and client obligations.',
  },
  {
    doc_id: 'POL-04', title: 'Payment Terms & Credit Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1QIM-dFxGj63JV83DCI98b6F5bE776Ojg'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Payment schedule, late fees, dispute process, payment plans, and no-work-without-deposit rule.',
  },
  {
    doc_id: 'POL-05', title: 'Confidentiality & NDA Policy', category: 'Policy',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1sTzaP3nauFHCR4rGQvw8aq7rBy-eYKin'),
    issue_date: '2026-05-08', review_date: '2027-05-08',
    description: 'Standard NDA terms, confidentiality obligations, agentic worker data handling, and breach response.',
  },

  // ─── Diagrams ─────────────────────────────────────────────────────────────
  {
    doc_id: 'DIA-01', title: 'Preqal End-to-End Process Flow', category: 'Record',
    version: '1.0', status: 'active', owner: OWNER,
    file_url: driveUrl('1yOWD3dxNfFTgxjsJZ-af783oPFt-1Jhd'),
    issue_date: '2026-05-07', review_date: '2027-05-07',
    description: 'Visual process flow diagram covering the full Preqal client pipeline from lead to renewal.',
  },
];

(async () => {
  console.log('Cleaning up old SOP records with outdated numbering...\n');

  // Delete old SOP-01 (was Marketing — now SOP-02) if it still has the old title
  const { error: delErr } = await sb
    .from('qms_documents')
    .delete()
    .eq('doc_id', 'SOP-01')
    .neq('title', 'Document Control Procedure'); // only delete if it's the old Marketing one

  if (delErr) {
    console.warn('Note: Old SOP-01 delete:', delErr.message);
  }

  console.log(`Upserting ${documents.length} records into qms_documents...\n`);

  const { data, error } = await sb
    .from('qms_documents')
    .upsert(documents, { onConflict: 'doc_id' });

  if (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${documents.length} documents.`);
  console.log('\nGoogle Drive folder: https://drive.google.com/drive/folders/1EgyXN41_EtT1jiOZO_tN9BqJHY18LoK5');
  console.log('Website: https://preqal.org/ims/');
  console.log('Mac: /Users/stefangravesande/Documents/Projects/Preqal QMS/');
})();
