import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
import { routeMeta } from './route-meta.mjs';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Remove react-helmet's runtime copies of tags we set statically — otherwise every
// prerendered page ships duplicate meta descriptions / og / twitter / canonical tags.
function stripHelmetDuplicates(html) {
  const kill = [
    /<meta(?=[^>]*data-rh="true")(?=[^>]*name="description")[^>]*>/g,
    /<meta(?=[^>]*data-rh="true")(?=[^>]*property="og:(?:type|url|title|description|image)")[^>]*>/g,
    /<meta(?=[^>]*data-rh="true")(?=[^>]*name="twitter:(?:url|title|description|image)")[^>]*>/g,
    /<link(?=[^>]*data-rh="true")(?=[^>]*rel="canonical")[^>]*>/g,
  ];
  return kill.reduce((h, re) => h.replace(re, ''), html);
}

function injectMeta(html, { title, description, canonical, ogImage, ogType }) {
  const t = esc(title), d = esc(description), img = esc(ogImage), c = esc(canonical), type = esc(ogType);
  html = stripHelmetDuplicates(html);
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

// Pristine built shell — used as the template for every prerendered route so
// GitHub Pages serves a real 200 (not the 404.html JS-redirect Googlebot can't index).
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

let ok = 0, created = 0;
for (const [route, meta] of Object.entries(routeMeta)) {
  const filePath = path.join(distDir, route === '/' ? '' : route, 'index.html');
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, template, 'utf8');
    created++;
  }
  const updated = injectMeta(fs.readFileSync(filePath, 'utf8'), meta);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`✓ ${route}`);
  ok++;
}
console.log(`\n${ok} pages updated (${created} prerendered files created).`);
