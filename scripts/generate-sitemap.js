import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://preqal.org';
/* lastmod is the date the page's source last changed, read from git — not the
   build date. Stamping every URL with today on every deploy tells Google the
   whole site changes daily, and it learns to ignore the field. */
import { execSync } from 'child_process';
const ROOT = path.join(__dirname, '..');
const lastChanged = (...files) => {
  try {
    const out = execSync(`git log -1 --format=%cs -- ${files.map((f) => JSON.stringify(f)).join(' ')}`, { cwd: ROOT })
      .toString().trim();
    if (out) return out;
  } catch { /* fall through */ }
  return new Date().toISOString().split('T')[0];
};
const TODAY = lastChanged('pages/Home.tsx');
const SERVICES = lastChanged('pages/ServiceLanding.tsx', 'pages/ServicesIndex.tsx');
const GUIDES = lastChanged('pages/GuideArticle.tsx', 'pages/GuidesIndex.tsx');
const DATES = {
  '/': lastChanged('pages/Home.tsx', 'components/Navbar.tsx', 'components/Footer.tsx'),
  '/contact': lastChanged('pages/ContactUs.tsx'),
  '/resources': lastChanged('pages/Resources.tsx'),
  '/business-growth-assessment': lastChanged('pages/BusinessGrowthAssessment.tsx'),
  '/preqal-not-prequel': lastChanged('pages/PreqalNotPrequel.tsx'),
  '/privacy-policy': lastChanged('pages/PrivacyPolicy.tsx'),
  '/terms-of-service': lastChanged('pages/TermsOfService.tsx'),
};
const dateFor = (url) => DATES[url] ?? (url.startsWith('/services') ? SERVICES : url.startsWith('/guides') ? GUIDES : TODAY);

const routes = [
  { url: '/',                            changefreq: 'weekly',  priority: 1.0, lastmod: dateFor('/') },
  { url: '/services',                    changefreq: 'monthly', priority: 0.9, lastmod: dateFor('/services') },
  { url: '/services/business-plan',      changefreq: 'monthly', priority: 0.85, lastmod: dateFor('/services/business-plan') },
  { url: '/services/risk-scan',          changefreq: 'monthly', priority: 0.85, lastmod: dateFor('/services/risk-scan') },
  { url: '/services/systems-builder',    changefreq: 'monthly', priority: 0.9, lastmod: dateFor('/services/systems-builder') },
  { url: '/services/certified-care',     changefreq: 'monthly', priority: 0.85, lastmod: dateFor('/services/certified-care') },
  { url: '/services/export-ready',       changefreq: 'monthly', priority: 0.9, lastmod: dateFor('/services/export-ready') },
  { url: '/guides',                      changefreq: 'weekly',  priority: 0.8, lastmod: dateFor('/guides') },
  { url: '/guides/haccp-certification-guyana', changefreq: 'monthly', priority: 0.8, lastmod: dateFor('/guides/haccp-certification-guyana') },
  { url: '/guides/iso-9001-cost-guyana', changefreq: 'monthly', priority: 0.8, lastmod: dateFor('/guides/iso-9001-cost-guyana') },
  { url: '/guides/export-food-from-guyana', changefreq: 'monthly', priority: 0.8, lastmod: dateFor('/guides/export-food-from-guyana') },
  { url: '/contact',                     changefreq: 'monthly', priority: 0.8, lastmod: dateFor('/contact') },
  { url: '/business-growth-assessment',  changefreq: 'monthly', priority: 0.8, lastmod: dateFor('/business-growth-assessment') },
  { url: '/resources',                   changefreq: 'monthly', priority: 0.7, lastmod: dateFor('/resources') },
  { url: '/preqal-not-prequel',          changefreq: 'yearly',  priority: 0.75, lastmod: dateFor('/preqal-not-prequel') },
  { url: '/privacy-policy',              changefreq: 'yearly',  priority: 0.3, lastmod: dateFor('/privacy-policy') },
  { url: '/terms-of-service',            changefreq: 'yearly',  priority: 0.3, lastmod: dateFor('/terms-of-service') },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.url === '/' ? '/' : route.url + '/'}</loc>
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
