import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://preqal.org';
const routes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/#/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/#/services', changefreq: 'monthly', priority: 0.9 },
  { url: '/#/contact', changefreq: 'monthly', priority: 0.8 },
  { url: '/#/case-studies', changefreq: 'monthly', priority: 0.7 },
  { url: '/#/resources', changefreq: 'monthly', priority: 0.7 },
  { url: '/#/book', changefreq: 'monthly', priority: 0.8 },
  { url: '/#/preqal-not-prequel', changefreq: 'yearly', priority: 0.6 },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('✓ Sitemap generated successfully at public/sitemap.xml');

