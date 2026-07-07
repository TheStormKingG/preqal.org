import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://preqal.org';
const DEFAULT_OG = `${BASE_URL}/Preqal%20Logo%20Sep25-9.webp`;

const routeMeta = {
  '/': {
    title: 'Preqal | ISO Quality, Safety & ESG Management Systems',
    description: 'Preqal delivers quality, safety & ESG management systems—audits, SOPs, risk tools and training—so teams stay compliant, capable, and always ready now.',
    canonical: `${BASE_URL}/`,
    ogImage: `${BASE_URL}/og/home.webp`,
    ogType: 'website',
  },
  '/services': {
    title: 'Services | ISO, HACCP & Export Certification Consulting | Preqal',
    description: 'Five fixed-scope services that take a Guyanese business from idea to export. Business plans, risk scans, ISO systems, certification care and export readiness.',
    canonical: `${BASE_URL}/services/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/services/business-plan': {
    title: 'Business Plan Writers in Guyana | Preqal Business Plan',
    description: 'Bank-ready business plans for Guyanese entrepreneurs with compliance built in from day one. Fixed price, investor-ready, written in Georgetown.',
    canonical: `${BASE_URL}/services/business-plan/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/services/risk-scan': {
    title: 'Quality & Compliance Risk Scan Guyana | Preqal Risk Scan',
    description: 'A 7-day quality, safety and compliance diagnostic for Guyanese businesses. Red Flag Report, ISO gap check and a plain-language action roadmap.',
    canonical: `${BASE_URL}/services/risk-scan/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/services/systems-builder': {
    title: 'ISO 9001 Certification Consultants Guyana | Systems Builder',
    description: 'ISO 9001, ISO 14001 and ISO 45001 management systems built with your team in 9 months, including training, internal audits and a mock certification audit.',
    canonical: `${BASE_URL}/services/systems-builder/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/services/certified-care': {
    title: 'ISO Certification Maintenance Guyana | Preqal Certified Care',
    description: 'Monthly support that keeps your ISO or HACCP certification valid. System upkeep, annual internal audits and surveillance-visit support in Guyana.',
    canonical: `${BASE_URL}/services/certified-care/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/services/export-ready': {
    title: 'HACCP & Export Certification for Guyana Agro-Processors',
    description: 'Preqal Export-Ready takes agro-processors from unregulated to export certified through HACCP, ISO 22000 and GFSI readiness. Made in Guyana, trusted abroad.',
    canonical: `${BASE_URL}/services/export-ready/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/resources': {
    title: 'Free Templates | Preqal Quality Management Downloads',
    description: 'Download five professional quality management templates free — QHSE policy, document control procedure, and IMS registers. No forms, instant download.',
    canonical: `${BASE_URL}/resources/`,
    ogImage: `${BASE_URL}/og/resources.webp`,
    ogType: 'website',
  },
  '/e-courses': {
    title: 'E-Course | Preqal — Practical QMS Learning',
    description: 'Nine-module QMS e-course covering process thinking, risk, documentation, audits, CAPA, and improvement—practical and built for real operations.',
    canonical: `${BASE_URL}/e-courses/`,
    ogImage: `${BASE_URL}/og/e-courses.webp`,
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact Preqal | Get in Touch',
    description: 'Contact Preqal to discuss your quality, safety, and compliance needs. We help businesses move from chaos to compliance with evidence-driven management systems.',
    canonical: `${BASE_URL}/contact/`,
    ogImage: `${BASE_URL}/og/contact.webp`,
    ogType: 'website',
  },
  '/business-growth-assessment': {
    title: 'Business Growth Investment Assessment | Preqal',
    description: 'Help Preqal understand your organisation to get the right level of support. Request a tailored quote via our Business Growth Investment Assessment.',
    canonical: `${BASE_URL}/business-growth-assessment/`,
    ogImage: `${BASE_URL}/og/bga.webp`,
    ogType: 'website',
  },
  '/preqal-not-prequel': {
    title: 'Preqal (Not Prequel) | Brand Clarification',
    description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is a quality, safety, ESG, and integrated management systems company.',
    canonical: `${BASE_URL}/preqal-not-prequel/`,
    ogImage: `${BASE_URL}/og/preqal-not-prequel.webp`,
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

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function injectMeta(html, { title, description, canonical, ogImage, ogType }) {
  const t = esc(title), d = esc(description), img = esc(ogImage), c = esc(canonical), type = esc(ogType);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,         `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,               `$1${c}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/,         `$1${type}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,          `$1${c}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,        `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${d}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,        `$1${img}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/,         `$1${c}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,       `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${d}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/,       `$1${img}$2`);
}

let ok = 0, warn = 0;
for (const [route, meta] of Object.entries(routeMeta)) {
  const filePath = path.join(distDir, route === '/' ? '' : route, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  Missing prerendered file: ${filePath}`);
    warn++;
    continue;
  }
  const updated = injectMeta(fs.readFileSync(filePath, 'utf8'), meta);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`✓ ${route}`);
  ok++;
}
console.log(`\n${ok} pages updated${warn ? `, ${warn} warnings` : ''}.`);
