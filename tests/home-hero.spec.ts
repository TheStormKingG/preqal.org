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

/* The proof band and the closing card were each carrying a label that only
   announced what the reader could already see. The two numbers now do the
   work, so they are half again as large as the body around them. */
const toProof = async (page: Page) => {
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
  }
  await page.waitForTimeout(900);
  expect(
    await page.evaluate(() =>
      document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
    ),
  ).toContain('Proof');
};

test('the proof band is down to its claim and its numbers', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, 1440, 900);
  await toProof(page);

  await expect(page.getByText('Others have walked this road')).toHaveCount(0);
  await expect(page.getByText('Your Phase 01 starts here')).toHaveCount(0);
  await expect(page.getByText('Expect no pressure')).toHaveCount(0);
  await expect(page.getByText('passed audits against ISO 9001')).toHaveCount(0);
  await expect(page.getByText('Each one setup international standards.')).toBeVisible();

  // The numbers stand half again as tall as the line they sit beside.
  const stat = await page.getByText('98%').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const body = await page
    .getByText('Each one setup international standards.')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(stat / body, 'the stat dwarfs the body copy').toBeGreaterThan(3);
  expect(stat, 'and is 1.5x what it was (48px)').toBeCloseTo(72, 0);

  const label = await page.getByText('pass rate').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(label, 'its caption grew with it (was 12px)').toBeCloseTo(18, 0);
});
