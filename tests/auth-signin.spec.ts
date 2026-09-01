import { test, expect } from '@playwright/test';

/* Sign-in hands the whole tab to the auth host with a full-page redirect. When
   that host cannot be answered, the reader used to land on the browser's own
   DNS error page with no way back into the site. The network is stubbed here so
   these hold whatever state the real backend is in. */

const REGISTER = 'http://localhost:3000/e-courses/register';

test.describe('e-course sign-in', () => {
  test('keeps the reader on the page and explains when the auth host is unreachable', async ({ page }) => {
    await page.route('**/auth/v1/health*', (route) => route.abort('namenotresolved'));

    let redirected = false;
    await page.route('**/auth/v1/authorize*', (route) => {
      redirected = true;
      return route.abort('namenotresolved');
    });

    await page.goto(REGISTER, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Continue with Google/i }).click();

    const error = page.locator('p.text-red-600');
    await expect(error).toBeVisible({ timeout: 15_000 });
    await expect(error).toContainText(/unavailable/i);

    // The tab must not have been handed to the dead host at all.
    expect(redirected).toBe(false);
    expect(page.url()).toContain('/e-courses/register');

    // And the reader can try again rather than being stranded.
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeEnabled();
  });

  test('proceeds to the provider when the auth host answers', async ({ page }) => {
    await page.route('**/auth/v1/health*', (route) => route.fulfill({ status: 200, body: '{}' }));

    let authorizeAttempted = false;
    await page.route('**/auth/v1/authorize*', (route) => {
      authorizeAttempted = true;
      return route.abort('aborted'); // stop the real hand-off to Google
    });

    await page.goto(REGISTER, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Continue with Google/i }).click();
    await page.waitForTimeout(2500);

    // A reachable host must not be blocked by the pre-flight.
    expect(authorizeAttempted).toBe(true);
    await expect(page.locator('p.text-red-600')).toHaveCount(0);
  });
});
