import { Question, BandDetails } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    category: 'Authority & Risk Ownership',
    text: 'Medical decision authority:',
    options: [
      { id: 'A', label: 'Advisory only', description: 'Recommendations are shared but final sign-off lies elsewhere.' },
      { id: 'B', label: 'Shared with operations/HSE', description: 'Co-accountable for medical outcomes with operational leads.' },
      { id: 'C', label: 'Final medical authority', description: 'The buck stops with you for all clinical and medical standards.' }
    ]
  },
  {
    id: 'Q2',
    category: 'Authority & Risk Ownership',
    text: '2 a.m. incident expectation:',
    options: [
      { id: 'A', label: 'Be informed later', description: 'Notification provided during business hours.' },
      { id: 'B', label: 'Remote decision support', description: 'Available for call-in guidance and triage management.' },
      { id: 'C', label: 'Lead/attend response', description: 'Directly responsible for immediate crisis management.' }
    ]
  },
  {
    id: 'Q3',
    category: 'Clinical Load',
    text: 'Clinical time requirement:',
    options: [
      { id: 'A', label: 'None / purely director', description: '100% administrative and strategic focus.' },
      { id: 'B', label: '≤10–15% routine', description: 'Occasional clinic presence or standard reviews.' },
      { id: 'C', label: '≥20% or emergency care', description: 'Significant hands-on clinical duties or acute response.' }
    ]
  },
  {
    id: 'Q4',
    category: 'Clinical Load',
    text: 'Clinical cover depth:',
    options: [
      { id: 'A', label: 'Yes, strong team', description: 'Full redundant cover; role is largely replaceable for clinical shifts.' },
      { id: 'B', label: 'Partial cover', description: 'Limited backup; some shifts require your specific presence.' },
      { id: 'C', label: "I'm essential clinician", description: 'The service cannot operate without your specific clinical license.' }
    ]
  },
  {
    id: 'Q5',
    category: 'Scale & Governance Exposure',
    text: 'Project footprint:',
    options: [
      { id: 'A', label: 'Single site, stable access', description: 'Local responsibility with straightforward logistics.' },
      { id: 'B', label: 'Multi-site, moderate travel', description: 'Regional scope requiring regular coordination across hubs.' },
      { id: 'C', label: 'Multi-site, remote/high logistics', description: 'International or complex remote sites with high travel.' }
    ]
  },
  {
    id: 'Q6',
    category: 'Scale & Governance Exposure',
    text: 'Governance & audit exposure:',
    options: [
      { id: 'A', label: 'Minimal / shared', description: 'Internal reviews handled by a centralized quality team.' },
      { id: 'B', label: 'Accountable internally', description: 'Responsible for internal quality assurance and reporting.' },
      { id: 'C', label: 'Accountable incl. external/client audits', description: 'Lead responder for regulatory and top-tier client audits.' }
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
