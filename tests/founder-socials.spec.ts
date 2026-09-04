import { test, expect, type Page } from '@playwright/test';

/* The founder's own accounts, under his bio. These are the company footer's
   counterpart, not a copy of it: different person, different set. */

const ACCOUNTS = [
  { name: 'Facebook', href: 'https://www.facebook.com/p/Stefan-Gravesande-100069496188271/' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@stefan.gravesande' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/drgravesande/' },
  { name: 'Instagram', href: 'https://www.instagram.com/stefangravesande/' },
];

async function openContact(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1300);

  /* The page is a deck at every width and every slide but the open one is
     aria-hidden, so the founder has to be brought on screen first. */
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(700);
}

for (const [name, w, h] of [['phone', 390, 844], ['desktop', 1440, 900]] as const) {
  test(`every account is linked and opens away from the site — ${name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await openContact(page, w, h);

    for (const account of ACCOUNTS) {
      const link = page.getByRole('link', { name: `Dr. Stefan Gravesande on ${account.name}` });
      await expect(link, `${account.name} is there`).toHaveCount(1);
      await expect(link).toHaveAttribute('href', account.href);
      await expect(link).toHaveAttribute('target', '_blank');
      // Without noopener the opened tab can reach back through window.opener.
      await expect(link).toHaveAttribute('rel', /noopener/);

      /* What matters is the size on the glass. The deck scales its content to
         fit one screen, so a button sized 44px in the markup would land at 40. */
      const box = await link.boundingBox();
      expect(box!.height, `${account.name} clears a 44px target`).toBeGreaterThanOrEqual(43);
      expect(box!.width).toBeGreaterThanOrEqual(43);
    }
  });
}

test('the row sits under the bio, not beside it', async ({ page }) => {
  test.setTimeout(90_000);
  await openContact(page, 1440, 900);
  const [bio, first] = await Promise.all([
    page.getByText('Dr. Stefan Gravesande trained in medicine').boundingBox(),
    // Exact: the footer carries a "Preqal on Facebook" link too.
    page.getByRole('link', { name: 'Dr. Stefan Gravesande on Facebook' }).boundingBox(),
  ]);
  expect(first!.y, 'below the last line of the bio').toBeGreaterThanOrEqual(bio!.y + bio!.height - 4);
  expect(first!.x, 'and aligned with its left edge').toBeCloseTo(bio!.x, -1);
});

test('each mark actually draws something', async ({ page }) => {
  test.setTimeout(90_000);
  await openContact(page, 1440, 900);
  // The TikTok glyph is hand-drawn here rather than taken from the icon set,
  // so this guards against it silently rendering as an empty box.
  for (const account of ACCOUNTS) {
    const box = await page
      .getByRole('link', { name: `Dr. Stefan Gravesande on ${account.name}` })
      .locator('svg')
      .boundingBox();
    expect(box!.width, `${account.name} mark has width`).toBeGreaterThan(8);
    expect(box!.height, `${account.name} mark has height`).toBeGreaterThan(8);
  }
});
