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
  for (let i = 0; i < 2; i++) {
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

/* The heading introduces the man, so it belongs with his portrait rather than
   centred over both columns. On desktop that means it shares the portrait's
   column; on a phone the two stack the same way either side of the change, so
   the column test is what actually pins it. */
for (const [name, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]] as const) {
  test(`the heading sits directly above the portrait — ${name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await openContact(page, w, h);

    const [heading, portrait, bio] = await Promise.all([
      page.getByRole('heading', { name: /Who you'll be/ }).boundingBox(),
      page.getByRole('img', { name: /Dr. Stefan Gravesande, founder/ }).boundingBox(),
      page.getByRole('heading', { name: 'Dr. Stefan Gravesande' }).boundingBox(),
    ]);

    expect(portrait!.y, 'the portrait follows the heading').toBeGreaterThanOrEqual(
      heading!.y + heading!.height - 2,
    );
    expect(portrait!.y - (heading!.y + heading!.height), 'and directly, not adrift').toBeLessThan(40);

    // Centred on the portrait's column, never spilling past its edges.
    const headingMid = heading!.x + heading!.width / 2;
    const portraitMid = portrait!.x + portrait!.width / 2;
    expect(Math.abs(headingMid - portraitMid), 'centred over the portrait').toBeLessThan(30);

    if (w >= 1024) {
      expect(heading!.x, 'and left of the bio, in the portrait column').toBeLessThan(bio!.x);
    }
  });
}
