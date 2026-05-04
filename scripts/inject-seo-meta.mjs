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
    title: 'Services | Preqal Quality & Compliance Solutions',
    description: 'Quality, safety & ESG compliance services: Quality Risk Scans, IMS Design, Documentation Systems, Training, and Audit Support from Preqal.',
    canonical: `${BASE_URL}/services/`,
    ogImage: `${BASE_URL}/og/services.webp`,
    ogType: 'website',
  },
  '/about': {
    title: 'About Preqal | Quality & Compliance Systems',
    description: 'Preqal builds quality, safety & ESG management systems for all sectors—from small shops to large corporations. Evidence-driven compliance for every scale.',
    canonical: `${BASE_URL}/about/`,
    ogImage: `${BASE_URL}/og/about.webp`,
    ogType: 'website',
  },
  '/case-studies': {
    title: 'Case Studies | Preqal Success Stories',
    description: 'Explore real case studies from Preqal clients across poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations.',
    canonical: `${BASE_URL}/case-studies/`,
    ogImage: `${BASE_URL}/og/case-studies.webp`,
    ogType: 'website',
  },
  '/resources': {
    title: 'Resources | Preqal Quality Templates & Tools',
    description: "Access Preqal's library of quality management templates, tools, and resources to support your compliance journey.",
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
  '/book': {
    title: 'Book a Risk Scan | Preqal',
    description: 'Book a Quality Risk Scan with Preqal. Our rapid diagnostic service finds your top compliance risks in 7 days—so you know exactly where to focus first.',
    canonical: `${BASE_URL}/book/`,
    ogImage: `${BASE_URL}/og/book.webp`,
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact Preqal | Get in Touch',
    description: 'Contact Preqal to discuss your quality, safety, and compliance needs. We help businesses move from chaos to compliance with evidence-driven management systems.',
    canonical: `${BASE_URL}/contact/`,
    ogImage: DEFAULT_OG,
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
    ogImage: DEFAULT_OG,
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
