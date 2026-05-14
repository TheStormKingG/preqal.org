'use strict';

// Single source of truth: every Preqal register, its branded metadata, the
// Supabase table it tracks (if any), and the data-column mapping (xlsx column
// header → SQL column or static derivation).
//
// `liveTable` null means the register is hand-curated (no live sync).
// `columns`   array of { header, width, source } — source is either a string
//             (column name in the Supabase row) or a function(row) => value.

module.exports = [
  {
    id: 'REG-01',
    file: 'REG-01-Document-Master-Register.xlsx',
    title: 'PREQAL DOCUMENT MASTER REGISTER',
    dcn: 'PQL-REG-01',
    scope: 'PREQAL INTEGRATED MANAGEMENT SYSTEM',
    subtitle: 'Quality Management System  —  Controlled Document — Internal Use Only',
    liveTable: 'qms_documents',
    liveFilter: { client_id: null },        // Preqal's own docs only
    breakdownBy: 'category',                // grouping field for breakdown panel
    columns: [
      { header:'CATEGORY',            width:14, source:'category' },
      { header:'CONTROL NUMBER',      width:14, source:'doc_id' },
      { header:'TITLE',               width:42, source:'title' },
      { header:'VERSION',             width:10, source:'version' },
      { header:'STATUS',              width:12, source:'status' },
      { header:'OWNER',               width:24, source:'owner' },
      { header:'CREATION DATE',       width:14, source:'issue_date' },
      { header:'CURRENT REVISION DATE',width:16, source:'updated_at' },
      { header:'SCHEDULED REVISION DATE',width:18, source:'review_date' },
      { header:'DIGITAL ID',          width:38, source:'id' },
      { header:'ACCESS LINK',         width:30, source:'file_url' },
    ],
  },
  {
    id: 'REG-02',
    file: 'REG-02-Lead-Register.xlsx',
    title: 'PREQAL LEAD REGISTER',
    dcn: 'PQL-REG-02',
    scope: 'COMMERCIAL — LEAD CAPTURE TO QUALIFIED',
    subtitle: 'Marketing & Lead Generation  —  Confidential — Internal Use Only',
    liveTable: 'qualified_leads',
    breakdownBy: 'status',
    columns: [
      { header:'LEAD ID',            width:38, source:'id' },
      { header:'COMPANY',            width:28, source:'company_name' },
      { header:'CONTACT',            width:24, source:'contact_person' },
      { header:'EMAIL',              width:28, source:'email' },
      { header:'STAFF SIZE',         width:12, source:'staff_size' },
      { header:'SERVICES',           width:12, source:'num_services' },
      { header:'BUSINESS DESCRIPTION',width:40, source:'business_description' },
      { header:'BASE TIER',          width:12, source:'base_tier' },
      { header:'RECOMMENDED TIER',   width:14, source:'recommended_tier' },
      { header:'STATUS',             width:14, source:'status' },
      { header:'SUBMITTED',          width:18, source:'created_at' },
    ],
  },
  {
    id: 'REG-03',
    file: 'REG-03-Context-Register.xlsx',
    title: 'PREQAL CONTEXT OF THE ORGANISATION',
    dcn: 'PQL-REG-03',
    scope: 'ISO 9001:2015 §4.1 + §4.2',
    subtitle: 'Strategic Context & Interested Parties  —  Controlled Document — Internal Use Only',
    liveTable: null,
    // hand-curated — keep existing tabs
  },
  {
    id: 'REG-04',
    file: 'REG-04-Employee-Register.xlsx',
    title: 'PREQAL EMPLOYEE REGISTER',
    dcn: 'PQL-REG-04',
    scope: 'HUMAN RESOURCES',
    subtitle: 'Human Resources  —  Confidential — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-05',
    file: 'REG-05-HSE-Risk-Register.xlsx',
    title: 'PREQAL HSE RISK REGISTER',
    dcn: 'PQL-REG-05',
    scope: 'HEALTH, SAFETY & ENVIRONMENT',
    subtitle: 'Health, Safety & Environment  —  Controlled Document — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-06',
    file: 'REG-06-Internal-Audit-Register.xlsx',
    title: 'PREQAL INTERNAL AUDIT REGISTER',
    dcn: 'PQL-REG-06',
    scope: 'ISO 9001:2015 §9.2',
    subtitle: 'Internal Audit  —  Controlled Document — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-07',
    file: 'REG-07-NCR-CAPA-Register.xlsx',
    title: 'PREQAL NCR & CAPA REGISTER',
    dcn: 'PQL-REG-07',
    scope: 'NON-CONFORMANCE TO CORRECTIVE ACTION',
    subtitle: 'Non-Conformances & Corrective Actions  —  Controlled Document — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-08',
    file: 'REG-08-Quality-Risk-Register.xlsx',
    title: 'PREQAL QUALITY RISK REGISTER',
    dcn: 'PQL-REG-08',
    scope: 'ISO 9001:2015 §6.1',
    subtitle: 'Quality Risk Management  —  Controlled Document — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-09',
    file: 'REG-09-Legal-Register.xlsx',
    title: 'PREQAL LEGAL & COMPLIANCE REGISTER',
    dcn: 'PQL-REG-09',
    scope: 'LEGAL OBLIGATIONS',
    subtitle: 'Legal & Regulatory Compliance  —  Controlled Document — Internal Use Only',
    liveTable: null,
  },
  {
    id: 'REG-10',
    file: 'REG-10-CRM-Client-Register.xlsx',
    title: 'PREQAL CRM CLIENT REGISTER',
    dcn: 'PQL-REG-10',
    scope: 'CLIENT LIFECYCLE',
    subtitle: 'Commercial & Client Management  —  Confidential — Internal Use Only',
    liveTable: 'crm_clients',
    breakdownBy: 'pipeline_stage',
    columns: [
      { header:'CLIENT ID',          width:38, source:'id' },
      { header:'COMPANY',            width:30, source:'company_name' },
      { header:'CONTACT',            width:24, source:'contact_name' },
      { header:'EMAIL',              width:28, source:'contact_email' },
      { header:'PIPELINE STAGE',     width:18, source:'pipeline_stage' },
      { header:'ONBOARDING STAGE',   width:18, source:'onboarding_stage' },
      { header:'TIER',               width:12, source:'tier' },
      { header:'QMS ACTIVE',         width:12, source:'qms_active' },
      { header:'CREATED',            width:18, source:'created_at' },
    ],
  },
];
