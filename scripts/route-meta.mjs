/* The title, description, canonical and social image of every prerendered
   route. The build stamps these into each page's static HTML; at runtime
   seo/seo.ts (via Helmet) writes the same values — the unit test in
   tests/unit/seoCopy.test.ts holds the two to each other. */
const BASE_URL = 'https://preqal.org';
const DEFAULT_OG = `${BASE_URL}/og/home.png`;

export const routeMeta = {
  '/': {
    title: 'Preqal | ISO 9001 System Setup for SMEs in Guyana',
    description: 'Preqal sets up ISO 9001 systems for SMEs in Guyana: process improvement and strategic direction for top management. An accredited body certifies it.',
    canonical: `${BASE_URL}/`,
    ogImage: `${BASE_URL}/og/home.png`,
    ogType: 'website',
  },
  '/services': {
    title: 'Services | ISO, HACCP & Export Certification Consulting | Preqal',
    description: 'Five fixed-scope services that take a Guyanese business from idea to export. Business plans, risk scans, ISO systems, certification care and export readiness.',
    canonical: `${BASE_URL}/services/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/services/business-plan': {
    title: 'Business Plan Writers in Guyana | Preqal Business Plan',
    description: 'Bank-ready business plans for Guyanese entrepreneurs with compliance built in from day one. Fixed price, investor-ready, written in Guyana.',
    canonical: `${BASE_URL}/services/business-plan/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/services/risk-scan': {
    title: 'Quality & Compliance Risk Scan Guyana | Preqal Risk Scan',
    description: 'A 7-day quality, safety and compliance diagnostic for Guyanese businesses. Red Flag Report, ISO gap check and a plain-language action roadmap.',
    canonical: `${BASE_URL}/services/risk-scan/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/services/systems-builder': {
    title: 'ISO 9001 Certification Consultants Guyana | Systems Builder',
    description: 'ISO 9001, ISO 14001 and ISO 45001 management systems built with your team in 9 months, including training, internal audits and a mock certification audit.',
    canonical: `${BASE_URL}/services/systems-builder/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/services/certified-care': {
    title: 'ISO Certification Maintenance Guyana | Preqal Certified Care',
    description: 'Monthly support that keeps your ISO or HACCP certification valid. System upkeep, annual internal audits and surveillance-visit support in Guyana.',
    canonical: `${BASE_URL}/services/certified-care/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/services/export-ready': {
    title: 'HACCP & Export Certification for Guyana Agro-Processors',
    description: 'Preqal Export-Ready takes agro-processors from unregulated to export certified through HACCP, ISO 22000 and GFSI readiness. Made in Guyana, trusted abroad.',
    canonical: `${BASE_URL}/services/export-ready/`,
    ogImage: `${BASE_URL}/og/services.png`,
    ogType: 'website',
  },
  '/guides': {
    title: 'Guides | HACCP, ISO & Export Answers for Guyana | Preqal',
    description: 'Plain-language guides for Guyanese businesses. HACCP certification, ISO 9001 costs, and how to export food from Guyana, written by Preqal.',
    canonical: `${BASE_URL}/guides/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    ogType: 'website',
  },
  '/guides/haccp-certification-guyana': {
    title: 'How to Get HACCP Certified in Guyana (2026 Guide) | Preqal',
    description: 'A plain-language guide to HACCP certification for Guyanese food businesses. What it is, who needs it, the seven steps, realistic timelines and costs.',
    canonical: `${BASE_URL}/guides/haccp-certification-guyana/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    ogType: 'article',
  },
  '/guides/iso-9001-cost-guyana': {
    title: 'What ISO 9001 Certification Costs in Guyana (Honest Guide) | Preqal',
    description: 'The real cost of ISO 9001 certification for a Guyanese business. The three costs to separate, what drives price, and how to avoid paying for paper.',
    canonical: `${BASE_URL}/guides/iso-9001-cost-guyana/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    ogType: 'article',
  },
  '/guides/export-food-from-guyana': {
    title: 'How to Export Food From Guyana, Step by Step | Preqal',
    description: 'The road from a Guyanese kitchen to foreign shelves. Registrations, food safety certification, what CARICOM buyers ask for, and realistic timelines.',
    canonical: `${BASE_URL}/guides/export-food-from-guyana/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    ogType: 'article',
  },
  '/resources': {
    title: 'Free Templates | Preqal Quality Management Downloads',
    description: 'Download five professional quality management templates free — QHSE policy, document control procedure, and IMS registers. No forms, instant download.',
    canonical: `${BASE_URL}/resources/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    ogType: 'website',
  },
  '/e-courses': {
    title: 'E-Course | Preqal — Practical QMS Learning',
    description: 'Nine-module QMS e-course covering process thinking, risk, documentation, audits, CAPA, and improvement—practical and built for real operations.',
    canonical: `${BASE_URL}/e-courses/`,
    ogImage: `${BASE_URL}/og/e-courses.png`,
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact Preqal | Get in Touch',
    description: 'Contact Preqal to discuss your quality, safety, and compliance needs. We help businesses move from chaos to compliance with evidence-driven management systems.',
    canonical: `${BASE_URL}/contact/`,
    ogImage: `${BASE_URL}/og/contact.png`,
    ogType: 'website',
  },
  '/business-growth-assessment': {
    title: 'Business Growth Investment Assessment | Preqal',
    description: 'Help Preqal understand your organisation to get the right level of support. Request a tailored quote via our Business Growth Investment Assessment.',
    canonical: `${BASE_URL}/business-growth-assessment/`,
    ogImage: `${BASE_URL}/og/bga.png`,
    ogType: 'website',
  },
  '/preqal-not-prequel': {
    title: 'Preqal (Not Prequel) | Brand Clarification',
    description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is an ISO system setup consultancy for small and medium businesses in Guyana.',
    canonical: `${BASE_URL}/preqal-not-prequel/`,
    ogImage: `${BASE_URL}/og/preqal-not-prequel.png`,
    ogType: 'article',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Preqal',
    description: "Read Preqal's GDPR-compliant Privacy Policy. We collect and protect your personal data under the Guyana Data Protection Act 2023 and international standards.",
    canonical: `${BASE_URL}/privacy-policy/`,
    ogImage: DEFAULT_OG,
    ogType: 'article',
  },
  '/terms-of-service': {
    title: 'Terms of Service | Preqal',
    description: 'Terms of Service for Preqal Inc. Read our terms governing use of preqal.org and our quality, safety, and ESG consulting services.',
    canonical: `${BASE_URL}/terms-of-service/`,
    ogImage: DEFAULT_OG,
    ogType: 'article',
  },
};
