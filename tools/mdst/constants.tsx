import { Question, BandDetails } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    category: 'Authority & Risk Ownership',
    text: 'Medical decision authority:',
    clarification: 'This question asks about who makes the final medical decisions. Think about whether you give advice only, share decisions with others, or make the final call yourself.',
    options: [
      { id: 'A', label: 'Advisory only', description: 'You give recommendations and advice, but someone else makes the final decision. You provide guidance but do not have the final say.' },
      { id: 'B', label: 'Shared with operations/HSE', description: 'You share the decision-making with operations and health, safety, and environment teams. You work together to make decisions about medical matters.' },
      { id: 'C', label: 'Final medical authority', description: 'You make the final decision on all medical and clinical matters. When it comes to medical decisions, the final responsibility is yours.' }
    ]
  },
  {
    id: 'Q2',
    category: 'Authority & Risk Ownership',
    text: '2 a.m. incident expectation:',
    clarification: 'This question asks what happens if there is a medical emergency at 2 a.m. (very early morning). Think about whether you would be called, give advice over the phone, or need to go to the scene.',
    options: [
      { id: 'A', label: 'Be informed later', description: 'You are told about the incident later during normal working hours. You find out about emergencies after they happen, not immediately.' },
      { id: 'B', label: 'Remote decision support', description: 'You can be called by phone to give advice and help make decisions. You provide guidance from wherever you are, without going to the scene.' },
      { id: 'C', label: 'Lead/attend response', description: 'You must go to the incident site or lead the response immediately. You are directly involved in handling the crisis when it happens.' }
    ]
  },
  {
    id: 'Q3',
    category: 'Clinical Load',
    text: 'Clinical time requirement:',
    clarification: 'This question asks how much time you spend doing hands-on medical work with patients. Think about what percentage of your time is spent treating patients versus doing administrative or management work.',
    options: [
      { id: 'A', label: 'None / purely director', description: 'You do no hands-on patient care. All your time (100%) is spent on administration, management, and planning work. You are a director only, not a practicing doctor.' },
      { id: 'B', label: '<=10-15% routine', description: 'You spend a small amount of time (10-15%) doing routine patient care. Most of your time is administrative, but you occasionally see patients or review cases.' },
      { id: 'C', label: '>=20% or emergency care', description: 'You spend a significant amount of time (20% or more) doing hands-on patient care, or you handle emergency cases. You actively treat patients as a regular part of your job.' }
    ]
  },
  {
    id: 'Q4',
    category: 'Clinical Load',
    text: 'Clinical cover depth:',
    clarification: 'This question asks if there are other doctors who can cover for you when you are not available. Think about whether the clinic or service can operate without you, or if your specific license is required.',
    options: [
      { id: 'A', label: 'Yes, strong team', description: 'There are other doctors who can fully cover your clinical duties. If you are not available, someone else can do your patient care work. You are replaceable for clinical shifts.' },
      { id: 'B', label: 'Partial cover', description: 'There is some backup, but not always complete. Sometimes other doctors can cover, but some shifts require you to be there. You are partially replaceable.' },
      { id: 'C', label: "I'm essential clinician", description: 'The clinic or service cannot operate without you. Your specific medical license is required, and there is no one else who can cover your clinical duties. You are essential.' }
    ]
  },
  {
    id: 'Q5',
    category: 'Scale & Governance Exposure',
    text: 'Project footprint:',
    clarification: 'This question asks about the size and location of the projects you manage. Think about whether you work at one location, multiple nearby locations, or sites that are far away or difficult to reach.',
    options: [
      { id: 'A', label: 'Single site, stable access', description: 'You work at one location that is easy to reach. You are responsible for one local site with simple travel and access. Everything is in one place.' },
      { id: 'B', label: 'Multi-site, moderate travel', description: 'You work at multiple locations within the same region. You travel regularly to coordinate between different sites, but travel is manageable.' },
      { id: 'C', label: 'Multi-site, remote/high logistics', description: 'You work at multiple locations that are far apart, possibly in different countries. Travel is complex, frequent, or to remote areas that are difficult to reach.' }
    ]
  },
  {
    id: 'Q6',
    category: 'Scale & Governance Exposure',
    text: 'Governance & audit exposure:',
    clarification: 'This question asks about how much you are involved in quality reviews and audits. Think about whether audits are handled by others, you do internal audits, or you lead audits from external regulators or clients.',
    options: [
      { id: 'A', label: 'Minimal / shared', description: 'You have little involvement in audits. Quality reviews are mostly handled by a central quality team. You share this responsibility with others.' },
      { id: 'B', label: 'Accountable internally', description: 'You are responsible for internal quality checks and reports within your organization. You ensure quality standards are met inside the company.' },
      { id: 'C', label: 'Accountable incl. external/client audits', description: 'You lead responses to audits from external regulators or major clients. You are the main person responsible when outside parties come to review your organization.' }
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
