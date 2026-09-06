import { test, expect, type Page } from '@playwright/test';

/* Google sends readers to the canonical, trailing-slash URLs — that is what
   the sitemap lists and what GitHub Pages serves directly. The app used to
   compare pathnames against slash-less strings, so a reader arriving that way
   got no active tab, a second footer under the deck, and dead sideways
   navigation. These load the canonical form and expect the same site. */

async function open(page: Page, path: string, width = 390, height = 844) {
  await page.setViewportSize({ width, height });
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(900);
}

for (const [path, tab] of [
  ['/resources/', 'Templates'],
  ['/contact/', 'Contact'],
] as const) {
  test(`arriving at ${path} is the same site as arriving without the slash`, async ({ page }) => {
    await open(page, path);
    await expect(
      page.locator('nav[aria-label="Primary"]').getByRole('link', { name: tab }),
      'the tab is marked current',
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('footer'), 'one footer — the deck slide, not a second below it').toHaveCount(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1),
      'the page itself does not scroll',
    ).toBe(false);
  });
}

test('the arrow keys still walk the pages from a canonical URL', async ({ page }) => {
  await open(page, '/resources/', 1440, 900);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/contact');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/resources');
});

/* Read the prerendered HTML in dist — the file a crawler is actually served —
   rather than the dev server's shell or the DOM after consent is dismissed:
   the cookie banner's own link is part of what a crawler sees. */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

for (const route of ['', 'contact', 'resources', 'preqal-not-prequel', 'privacy-policy', 'guides/haccp-certification-guyana']) {
  test(`built /${route} links to pages the way the site serves them`, async () => {
    const file = join(process.cwd(), 'dist', route, 'index.html');
    test.skip(!existsSync(file), 'run `npm run build` first');
    const html = readFileSync(file, 'utf8');
    const links = [...html.matchAll(/href="(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/?)"/g)]
      .map((m) => m[1])
      .filter((h) => !h.startsWith('/tools/') && !/\.[a-z0-9]+$/.test(h));
    expect(links.length, 'the page links to other pages at all — otherwise this checks nothing').toBeGreaterThan(3);
    const bad = links.filter((h) => !h.endsWith('/'));
    expect(bad, 'no page link without its trailing slash — each one is a 301 for a crawler').toEqual([]);
  });
}

/* The guides were near-orphans: every guide linked to its service, but no
   service linked back, so they were reachable only from their own index and
   Google had barely crawled them. Each guide declares the service it belongs
   to, so this asserts the return leg exists in the built HTML. */
test('each service page links to the guides that belong to it', async () => {
  const read = (p: string) => readFileSync(join(process.cwd(), 'dist', p, 'index.html'), 'utf8');
  test.skip(!existsSync(join(process.cwd(), 'dist', 'index.html')), 'run `npm run build` first');

  for (const [service, guides] of [
    ['services/systems-builder', ['iso-9001-cost-guyana']],
    ['services/export-ready', ['haccp-certification-guyana', 'export-food-from-guyana']],
  ] as const) {
    const html = read(service);
    for (const guide of guides) {
      expect(html, `${service} links to ${guide}`).toContain(`href="/guides/${guide}/"`);
    }
    // The anchor text has to say what the guide is, not "read more".
    const anchors = [...html.matchAll(/<a[^>]+href="\/guides\/([a-z0-9-]+)\/"[^>]*>([\s\S]*?)<\/a>/g)];
    for (const m of anchors) {
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      expect(text.length, `${m[1]} has descriptive anchor text`).toBeGreaterThan(15);
      expect(text, 'and not the Preqal title suffix').not.toContain('| Preqal');
    }
  }
});
