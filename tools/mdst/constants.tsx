import { Question, BandDetails } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    category: 'Authority & Risk Ownership',
    text: 'Medical decision authority:',
    clarification: 'This question asks about who makes the final medical decisions. Think about whether the Medical Director gives advice only, shares decisions with others, or makes the final call.',
    options: [
      { id: 'A', label: 'Advisory only', description: 'The Medical Director gives recommendations and advice, but someone else makes the final decision. The role provides guidance but does not have the final say.' },
      { id: 'B', label: 'Shared with operations/HSE', description: 'The Medical Director shares the decision-making with operations and health, safety, and environment teams. The role works together with others to make decisions about medical matters.' },
      { id: 'C', label: 'Final medical authority', description: 'The Medical Director makes the final decision on all medical and clinical matters. When it comes to medical decisions, the final responsibility lies with this role.' }
    ]
  },
  {
    id: 'Q2',
    category: 'Authority & Risk Ownership',
    text: '2 a.m. incident expectation:',
    clarification: 'This question asks what happens if there is a medical emergency at 2 a.m. (very early morning). Think about whether the Medical Director would be called, give advice over the phone, or need to go to the scene.',
    options: [
      { id: 'A', label: 'Be informed later', description: 'The Medical Director is told about the incident later during normal working hours. The role finds out about emergencies after they happen, not immediately.' },
      { id: 'B', label: 'Remote decision support', description: 'The Medical Director can be called by phone to give advice and help make decisions. The role provides guidance from wherever they are, without going to the scene.' },
      { id: 'C', label: 'Lead/attend response', description: 'The Medical Director must go to the incident site or lead the response immediately. The role is directly involved in handling the crisis when it happens.' }
    ]
  },
  {
    id: 'Q3',
    category: 'Clinical Load',
    text: 'Clinical time requirement:',
    clarification: 'This question asks how much time the Medical Director spends doing hands-on medical work with patients. Think about what percentage of the role\'s time is spent treating patients versus doing administrative or management work.',
    options: [
      { id: 'A', label: 'None / purely director', description: 'The Medical Director does no hands-on patient care. All the role\'s time (100%) is spent on administration, management, and planning work. This is a director-only role, not a practicing doctor position.' },
      { id: 'B', label: '<=10-15% routine', description: 'The Medical Director spends a small amount of time (10-15%) doing routine patient care. Most of the role\'s time is administrative, but the Medical Director occasionally sees patients or reviews cases.' },
      { id: 'C', label: '>=20% or emergency care', description: 'The Medical Director spends a significant amount of time (20% or more) doing hands-on patient care, or handles emergency cases. The role actively treats patients as a regular part of the job.' }
    ]
  },
  {
    id: 'Q4',
    category: 'Clinical Load',
    text: 'Clinical cover depth:',
    clarification: 'This question asks if there are other doctors who can cover for the Medical Director when they are not available. Think about whether the clinic or service can operate without the Medical Director, or if their specific license is required.',
    options: [
      { id: 'A', label: 'Yes, strong team', description: 'There are other doctors who can fully cover the Medical Director\'s clinical duties. If the Medical Director is not available, someone else can do the patient care work. The role is replaceable for clinical shifts.' },
      { id: 'B', label: 'Partial cover', description: 'There is some backup, but not always complete. Sometimes other doctors can cover, but some shifts require the Medical Director to be there. The role is partially replaceable.' },
      { id: 'C', label: "I'm essential clinician", description: 'The clinic or service cannot operate without the Medical Director. Their specific medical license is required, and there is no one else who can cover their clinical duties. The Medical Director is essential to operations.' }
    ]
  },
  {
    id: 'Q5',
    category: 'Scale & Governance Exposure',
    text: 'Project footprint:',
    clarification: 'This question asks about the size and location of the projects the Medical Director manages. Think about whether the role works at one location, multiple nearby locations, or sites that are far away or difficult to reach.',
    options: [
      { id: 'A', label: 'Single site, stable access', description: 'The Medical Director works at one location that is easy to reach. The role is responsible for one local site with simple travel and access. Everything is in one place.' },
      { id: 'B', label: 'Multi-site, moderate travel', description: 'The Medical Director works at multiple locations within the same region. The role travels regularly to coordinate between different sites, but travel is manageable.' },
      { id: 'C', label: 'Multi-site, remote/high logistics', description: 'The Medical Director works at multiple locations that are far apart, possibly in different countries. Travel is complex, frequent, or to remote areas that are difficult to reach.' }
    ]
  },
  {
    id: 'Q6',
    category: 'Scale & Governance Exposure',
    text: 'Governance & audit exposure:',
    clarification: 'This question asks about how much the Medical Director is involved in quality reviews and audits. Think about whether audits are handled by others, the Medical Director does internal audits, or leads audits from external regulators or clients.',
    options: [
      { id: 'A', label: 'Minimal / shared', description: 'The Medical Director has little involvement in audits. Quality reviews are mostly handled by a central quality team. The role shares this responsibility with others.' },
      { id: 'B', label: 'Accountable internally', description: 'The Medical Director is responsible for internal quality checks and reports within the organization. The role ensures quality standards are met inside the company.' },
      { id: 'C', label: 'Accountable incl. external/client audits', description: 'The Medical Director leads responses to audits from external regulators or major clients. The role is the main person responsible when outside parties come to review the organization.' }
    ]
  }
];

export const BAND_MAP: Record<string, BandDetails> = {
  A: {
    band: 'A',
    range: 'GYD 1.5M – 1.8M',
    title: 'Advisory Medical Director',
    description: 'Focuses on strategic advisory and clinical quality standards within a stable environment. Low operational risk and minimal hands-on clinical burden.',
    responsibilities: [
      'Provide medical oversight for a single site or localized operation.',
      'Advise on healthcare policy and clinical standard operating procedures.',
      'Monitor clinical outcomes and participate in internal quality reviews.',
      'Maintain strategic alignment with organizational health goals.'
    ]
  },
  B: {
    band: 'B',
    range: 'GYD 1.8M – 2.2M',
    title: 'Operational Medical Director',
    description: 'An active leadership role balancing governance with operational support. Requires readiness for remote crisis support and multi-site oversight.',
    responsibilities: [
      'Share accountability for operational safety and medical outcomes.',
      'Lead clinical response for multi-site regional projects.',
      'Manage complex internal governance and performance audits.',
      'Coordinate remote medical support and triage for mid-level incidents.'
    ]
  },
  C: {
    band: 'C',
    range: 'GYD 2.2M – 2.5M',
    title: 'Executive Medical Director',
    description: 'High-stakes leadership with final clinical authority. Manages significant risk, high-intensity logistics, and direct external accountability.',
    responsibilities: [
      'Hold final accountability for all clinical decisions and medical liability.',
      'Lead on-site crisis response for high-gravity medical incidents.',
      'Manage high-complexity remote or multi-national project footprints.',
      'Act as the primary interface for external regulatory bodies and client audits.'
    ]
  }
};
