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

/* Read the raw served HTML rather than the DOM after consent is dismissed: the
   cookie banner's own link is part of what a crawler sees. */
for (const path of ['/', '/contact/', '/resources/', '/preqal-not-prequel/', '/privacy-policy/']) {
  test(`internal links on ${path} are written the way the site serves them`, async ({ request }) => {
    const html = await (await request.get('http://localhost:3000' + path)).text();
    const bad = [...html.matchAll(/href="(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*)"/g)]
      .map((m) => m[1])
      .filter((h) => !h.startsWith('/tools/') && !/\.[a-z0-9]+$/.test(h) && !h.endsWith('/'));
    expect(bad, 'no page link without its trailing slash — each one is a 301 for a crawler').toEqual([]);
  });
}
