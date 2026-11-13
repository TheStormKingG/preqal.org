import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
import { routeMeta } from './route-meta.mjs';

import { injectMeta } from './lib/inject-meta.mjs';

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
