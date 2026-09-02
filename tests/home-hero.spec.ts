import { test, expect, type Page } from '@playwright/test';

/* Slide one reads: the headline, the picture, the promise the picture makes,
   and the one move it asks for. The call to action closes the headline from lg
   up and follows the promise on a phone, because that is where each layout
   leaves the eye. */

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

const promise = (page: Page) => page.getByText('Picture your business wins a big contract.');
const heroImage = (page: Page) => page.getByRole('img', { name: /Business leader/i });
const cta = (page: Page) => page.getByRole('button', { name: /Start the journey/i });
const yoursIsNext = (page: Page) => page.getByText('Yours is next.');

for (const [name, w, h] of [['phone', 390, 844], ['desktop', 1440, 900]] as const) {
  test(`the promise sits directly under the hero image — ${name}`, async ({ page }) => {
    await open(page, w, h);
    await expect(promise(page)).toBeVisible();

    const [line, image] = await Promise.all([promise(page).boundingBox(), heroImage(page).boundingBox()]);
    expect(line!.y, 'below the image, not beside it').toBeGreaterThanOrEqual(image!.y + image!.height - 2);
    expect(line!.y - (image!.y + image!.height), 'and directly under it, not adrift').toBeLessThan(60);

    // Centred on the same column the image occupies.
    const lineMid = line!.x + line!.width / 2;
    const imageMid = image!.x + image!.width / 2;
    expect(Math.abs(lineMid - imageMid)).toBeLessThan(40);
  });
}

test('the journey button closes the headline on desktop', async ({ page }) => {
  await open(page, 1440, 900);
  const [button, next, image] = await Promise.all([
    cta(page).boundingBox(),
    yoursIsNext(page).boundingBox(),
    heroImage(page).boundingBox(),
  ]);
  expect(button!.y, 'under "Yours is next."').toBeGreaterThanOrEqual(next!.y + next!.height - 2);
  expect(button!.x, 'in the copy column, left of the image').toBeLessThan(image!.x);
});

test('the journey button follows the promise on a phone', async ({ page }) => {
  await open(page, 390, 844);
  const [button, line] = await Promise.all([cta(page).boundingBox(), promise(page).boundingBox()]);
  expect(button!.y, 'below the promise').toBeGreaterThanOrEqual(line!.y + line!.height - 2);
});

test('the journey button still opens the journey', async ({ page }) => {
  await open(page, 390, 844);
  await cta(page).click();
  await page.waitForTimeout(1400);
  expect(
    await page.evaluate(() =>
      document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
    ),
  ).toContain('Phase 01');
});

test('the retired story heading is gone from both views', async ({ page }) => {
  for (const [w, h] of [[390, 844], [1440, 900]] as const) {
    await open(page, w, h);
    await expect(page.getByText('This story is')).toHaveCount(0);
    await expect(page.getByText('about you.')).toHaveCount(0);
    await expect(page.getByText('Picture your product on a shelf')).toHaveCount(0);
  }
});
