import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Third-party scripts that fail to load in CI are not app bugs — filter them out.
const EXPECTED_EXTERNAL_ERRORS = [
  // react-google-recaptcha / react-async-script: fires when Google's CDN script
  // can't load in a sandboxed CI environment. The app gracefully guards renders
  // with `{RECAPTCHA_SITE_KEY && ...}` — this is not a functional regression.
  'Script is not loaded.',
];

/** Fail fast if any uncaught JS error fires on the page */
function watchForErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    if (!EXPECTED_EXTERNAL_ERRORS.some((msg) => err.message.includes(msg))) {
      errors.push(err.message);
    }
  });
  return () => {
    if (errors.length > 0) {
      throw new Error(`Uncaught JS error(s) on page:\n${errors.join('\n')}`);
    }
  };
}

// ─────────────────────────────────────────────
// Core pages — load + visible headline
// ─────────────────────────────────────────────

test('homepage loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Preqal/i);
  // Single h1 sits above the hero container, visible at all viewports.
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

// Retired routes now redirect — services & case studies live on the home journey
test('/services redirects to home', async ({ page }) => {
  await page.goto('/services');
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('/case-studies redirects to home', async ({ page }) => {
  await page.goto('/case-studies');
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('/about redirects to contact', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveURL(/contact/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('resources page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/resources');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

// ─────────────────────────────────────────────
// Forms — render check only (no submission)
// ─────────────────────────────────────────────

test('contact form renders', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/contact');
  await expect(page).toHaveTitle(/Preqal/i);
  // At least one text input must be present
  await expect(page.locator('input[type="text"], input[type="email"]').first()).toBeVisible();
  // Submit button is present
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  check();
});

test('business growth assessment loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/business-growth-assessment');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1, h2').first()).toBeVisible();
  check();
});

// Old URL redirects to new one
test('/quote-classifier redirects to /business-growth-assessment', async ({ page }) => {
  await page.goto('/quote-classifier');
  await expect(page).toHaveURL(/business-growth-assessment/);
});

// ─────────────────────────────────────────────
// Retired routes (E-Course removed 2026-09-01)
// ─────────────────────────────────────────────

for (const path of ['/e-courses', '/e-courses/register', '/e-courses/learn', '/verify']) {
  test(`retired route ${path} sends the reader home`, async ({ page }) => {
    const check = watchForErrors(page);
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/Preqal/i);
    check();
  });
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────

test('navbar links are present on homepage', async ({ page }) => {
  await page.goto('/');
  // At least 3 nav links should exist
  const navLinks = page.locator('nav a');
  await expect(navLinks).toHaveCount(await navLinks.count());
  expect(await navLinks.count()).toBeGreaterThanOrEqual(3);
});

test('404 page is handled gracefully', async ({ page }) => {
  await page.goto('/this-page-does-not-exist-at-all');
  // GitHub Pages serves 404.html — it should still be a Preqal-branded page, not a raw server error
  await expect(page.locator('body')).toBeVisible();
  // Should not show an empty white screen
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});

/* Structured data has to be in the HTML as served, not only in the DOM after
   hydration: Google reads the former. The build prerenders every route and
   snapshots once <SEO> reports the head complete; before that it snapshotted
   on a timer and the guides and services shipped with no schema at all.
   Read the raw response, so hydration cannot paper over a regression. */
const schemaTypes = (html: string): string[] => {
  const out: string[] = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      for (const x of Array.isArray(d) ? d : [d]) out.push(String(x['@type']));
    } catch {
      out.push('UNPARSEABLE');
    }
  }
  return out;
};

for (const [path, expected] of [
  ['/', ['Organization', 'WebSite', 'ProfessionalService']],
  ['/guides/haccp-certification-guyana/', ['Article', 'FAQPage']],
  ['/services/systems-builder/', ['ProfessionalService', 'Service', 'FAQPage']],
  ['/contact/', ['Person', 'AboutPage']],
] as const) {
  test(`${path} ships its structured data in the served HTML`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const types = schemaTypes(await res.text());
    expect(types, 'every block parses').not.toContain('UNPARSEABLE');
    for (const t of expected) expect(types, `${path} carries ${t}`).toContain(t);
  });
}

/* Internal links in the served HTML must be the canonical trailing-slash form.
   Written without it, every internal link a crawler follows is a 301 first,
   and Search Console credited this site with three internal links in total. */
test('the served home page links to its pages without a redirect in the way', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const hrefs = [...html.matchAll(/href="(\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/?)"/g)].map((m) => m[1]);
  const pages = hrefs.filter((h) => !h.startsWith('/tools/') && !/\.[a-z0-9]+$/.test(h));
  expect(pages.length, 'the home page links to other pages at all').toBeGreaterThan(5);
  expect(pages.filter((h) => !h.endsWith('/')), 'none of them slash-less').toEqual([]);
});
