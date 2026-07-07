import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://preqal.org';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const routes = [
  { url: '/',                            changefreq: 'weekly',  priority: 1.0,  lastmod: TODAY },
  { url: '/services',                    changefreq: 'monthly', priority: 0.9,  lastmod: TODAY },
  { url: '/services/business-plan',      changefreq: 'monthly', priority: 0.85, lastmod: TODAY },
  { url: '/services/risk-scan',          changefreq: 'monthly', priority: 0.85, lastmod: TODAY },
  { url: '/services/systems-builder',    changefreq: 'monthly', priority: 0.9,  lastmod: TODAY },
  { url: '/services/certified-care',     changefreq: 'monthly', priority: 0.85, lastmod: TODAY },
  { url: '/services/export-ready',       changefreq: 'monthly', priority: 0.9,  lastmod: TODAY },
  { url: '/guides',                      changefreq: 'weekly',  priority: 0.8,  lastmod: TODAY },
  { url: '/guides/haccp-certification-guyana', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { url: '/guides/iso-9001-cost-guyana', changefreq: 'monthly', priority: 0.8,  lastmod: TODAY },
  { url: '/guides/export-food-from-guyana', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { url: '/contact',                     changefreq: 'monthly', priority: 0.8,  lastmod: TODAY },
  { url: '/business-growth-assessment',  changefreq: 'monthly', priority: 0.8,  lastmod: TODAY },
  { url: '/e-courses',                   changefreq: 'monthly', priority: 0.75, lastmod: TODAY },
  { url: '/resources',                   changefreq: 'monthly', priority: 0.7,  lastmod: TODAY },
  { url: '/preqal-not-prequel',          changefreq: 'yearly',  priority: 0.75, lastmod: TODAY },
  { url: '/privacy-policy',              changefreq: 'yearly',  priority: 0.3,  lastmod: TODAY },
  { url: '/terms-of-service',            changefreq: 'yearly',  priority: 0.3,  lastmod: TODAY },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
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
console.log(`✓ Sitemap generated with ${routes.length} URLs → public/sitemap.xml`);
