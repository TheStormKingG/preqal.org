import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'public', 'og');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const W = 1200;
const H = 630;
const BG = '#e0e5ec';
const AMBER = '#f59e0b';
const DARK = '#1e293b';
const MID = '#64748b';

const escapeSvg = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const makeSvg = (title, subtitle, tag = 'preqal.org') => `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Soft shadow card -->
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}"
        rx="32" ry="32" fill="${BG}"
        filter="url(#neu)"/>

  <defs>
    <filter id="neu" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="-6" dy="-6" stdDeviation="10" flood-color="#ffffff" flood-opacity="0.85"/>
      <feDropShadow dx="6" dy="6" stdDeviation="10" flood-color="#a3b1c6" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Amber accent bar -->
  <rect x="100" y="200" width="80" height="8" rx="4" fill="${AMBER}"/>

  <!-- Tag line -->
  <text x="100" y="185"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="22" font-weight="600" fill="${AMBER}" letter-spacing="2">
    ${escapeSvg(tag.toUpperCase())}
  </text>

  <!-- Title — split into two lines if needed (max ~34 chars per line) -->
  <text x="100" y="270"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="52" font-weight="800" fill="${DARK}">
    ${escapeSvg(title)}
  </text>

  <!-- Subtitle -->
  <text x="100" y="335"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="28" font-weight="400" fill="${MID}">
    ${escapeSvg(subtitle)}
  </text>

  <!-- Bottom logo text -->
  <text x="100" y="${H - 70}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="26" font-weight="700" fill="${AMBER}" letter-spacing="1">
    PREQAL
  </text>
  <text x="214" y="${H - 70}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="26" font-weight="400" fill="${MID}">
    Quality · Safety · ESG
  </text>
</svg>
`;

const cards = [
  {
    file: 'home.webp',
    title: 'Evidence-Driven QMS',
    subtitle: 'ISO Quality, Safety & ESG Systems',
  },
  {
    file: 'services.webp',
    title: 'Services & Solutions',
    subtitle: 'Risk Scans · IMS Design · Training · Audits',
  },
  {
    file: 'about.webp',
    title: 'About Preqal',
    subtitle: 'Clinic on Quality™  ·  Dr. Stefan Gravesande',
  },
  {
    file: 'book.webp',
    title: 'Book a Risk Scan',
    subtitle: 'Find your top compliance risks in 7 days',
  },
  {
    file: 'case-studies.webp',
    title: 'Case Studies',
    subtitle: 'Real Impact · Real Results',
  },
  {
    file: 'resources.webp',
    title: 'Free Resources',
    subtitle: 'Templates, Tools & Guides',
  },
  {
    file: 'e-courses.webp',
    title: 'QMS E-Course',
    subtitle: 'Build Systems That Actually Work',
  },
  {
    file: 'bga.webp',
    title: 'Business Growth Assessment',
    subtitle: 'Get a tailored quote',
  },
];

for (const card of cards) {
  const svg = makeSvg(card.title, card.subtitle);
  const outPath = path.join(outputDir, card.file);
  await sharp(Buffer.from(svg))
    .resize(W, H)
    .webp({ quality: 90 })
    .toFile(outPath);
  console.log(`✓ ${card.file}`);
}

console.log(`\nOG images written to public/og/`);
