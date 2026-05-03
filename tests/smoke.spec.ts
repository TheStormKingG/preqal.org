import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Fail fast if any uncaught JS error fires on the page */
function watchForErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
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
  // Hero section should be visible
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

test('services page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/services');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

test('about page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/about');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

test('case studies page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/case-studies');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1').first()).toBeVisible();
  check();
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
// Course platform
// ─────────────────────────────────────────────

test('e-courses listing page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/e-courses');
  await expect(page).toHaveTitle(/Preqal/i);
  await expect(page.locator('h1').first()).toBeVisible();
  check();
});

test('certificate verification page loads', async ({ page }) => {
  const check = watchForErrors(page);
  await page.goto('/verify');
  await expect(page).toHaveTitle(/Preqal/i);
  // Should show an input for the cert key
  await expect(page.locator('input').first()).toBeVisible({ timeout: 10_000 });
  check();
});

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
  const response = await page.goto('/this-page-does-not-exist-at-all');
  // GitHub Pages serves 404.html — it should still be a Preqal-branded page, not a raw server error
  await expect(page.locator('body')).toBeVisible();
  // Should not show an empty white screen
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});
