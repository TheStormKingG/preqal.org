/* Clicking any Preqal mark goes home and plays the mark's intro in the top bar
   — the Q rolls in, the letters slide up — before it settles back into the
   wordmark. The intro is an APNG with alpha, keyed from a source whose star is
   the same white as its background, so the compositing check is the one that
   matters — and it runs under WebKit too, because the earlier video version
   passed in Chromium and then played on a black slab on a real iPhone. */
import { webkit } from '@playwright/test';
import { test, expect, type Page } from '@playwright/test';
const S = '/tmp/claude-501/-Users-stefangravesande-Documents-Projects-Preqal-2027-Apps-preqal-org/7bb88ded-ac4a-42d1-beee-1443ddc9a6e2/scratchpad';

async function open(page: Page, path: string, w = 1440, h = 900) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  const d = page.getByRole('button', { name: /Decline/i });
  await d.click({ timeout: 2500 }).catch(() => {});
  await d.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(800);
}
const topbar = (page: Page) => page.locator('nav').first();
const mark = (page: Page) => topbar(page).getByRole('link').first();

test('clicking the top-bar mark plays the intro in its place, then is the wordmark again', async ({ page }) => {
  await open(page, '/resources');
  const before = await mark(page).boundingBox();
  await mark(page).click();
  await page.waitForTimeout(250);
  expect(new URL(page.url()).pathname, 'the mark goes home').toBe('/');

  const intro = topbar(page).locator('img[data-logo-intro]');
  await expect(intro, 'the intro stands where the wordmark was').toHaveCount(1);
  await expect(topbar(page).locator('picture'), 'and the picture is gone for now').toHaveCount(0);
  const state = await intro.evaluate((i: HTMLImageElement) => ({
    loaded: i.complete && i.naturalWidth > 0,
    w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height,
  }));
  expect(state.loaded, 'and it decoded').toBe(true);
  expect(Math.abs(state.h - before!.height), 'same height as the wordmark, so nothing jumps').toBeLessThan(2);
  expect(Math.abs(state.w - before!.width), 'and near enough the same width').toBeLessThan(12);
  await page.screenshot({ path: `${S}/intro-mid.png`, clip: { x: 80, y: 0, width: 360, height: 80 } });

  await page.waitForTimeout(2200);
  await expect(topbar(page).locator('img[data-logo-intro]'), 'once it ends the intro is gone').toHaveCount(0);
  await expect(topbar(page).locator('picture'), 'and the wordmark is back').toHaveCount(1);
});

test('the intro composites onto the bar, not onto a white slab', async ({ page }) => {
  await open(page, '/');
  await mark(page).click();
  await page.waitForTimeout(400);
  // Sample the bar just outside the mark's box while the video is up. The
  // source frames are white there; with alpha the bar's own grey shows through.
  const box = (await topbar(page).locator('img[data-logo-intro]').boundingBox())!;
  const shot = await page.screenshot({ clip: { x: box.x + box.width + 6, y: box.y + box.height / 2, width: 4, height: 4 } });
  const png = await page.evaluate(async (bytes) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    const ctx = c.getContext('2d')!; ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, 4, 4).data;
    return [d[0], d[1], d[2]];
  }, Array.from(shot));
  // Inside the video's own box, a pixel that is background in the source.
  const inside = await page.screenshot({ clip: { x: box.x + 2, y: box.y + 2, width: 4, height: 4 } });
  const insidePx = await page.evaluate(async (bytes) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    const ctx = c.getContext('2d')!; ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, 4, 4).data;
    return [d[0], d[1], d[2]];
  }, Array.from(inside));
  expect(Math.max(...insidePx.map((v, i) => Math.abs(v - png[i]))), `inside the box ${insidePx} matches the bar ${png}`).toBeLessThan(14);
  expect(insidePx[0], "and it is not the white of the source").toBeLessThan(245);
});

test('the footer mark goes home and asks for the intro too', async ({ page }) => {
  await open(page, '/contact');
  for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(650); }
  await page.waitForTimeout(700);
  const footerMark = page.locator('footer').getByRole('link', { name: 'Preqal home' });
  await expect(footerMark).toBeVisible();
  await footerMark.click();
  await page.waitForTimeout(300);
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(topbar(page).locator('img[data-logo-intro]'), 'the top bar is playing the intro').toHaveCount(1);
});

test('a reader who prefers reduced motion just gets the wordmark', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/resources');
  await mark(page).click();
  await page.waitForTimeout(400);
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(topbar(page).locator('img[data-logo-intro]')).toHaveCount(0);
  await expect(topbar(page).locator('picture')).toHaveCount(1);
});

test('on a phone the mark plays at its phone size', async ({ page }) => {
  await open(page, '/resources', 390, 844);
  const before = await mark(page).boundingBox();
  await mark(page).click();
  await page.waitForTimeout(300);
  const v = await topbar(page).locator('img[data-logo-intro]').boundingBox();
  expect(Math.abs(v!.height - before!.height), 'same height as the wordmark').toBeLessThan(2);
  // On the phone the video version rendered zoomed and cropped — "RE … A".
  expect(Math.abs(v!.width - before!.width), 'and the same width, not a cropped blow-up').toBeLessThan(10);
});

/* Safari's engine. The bar behind the intro must show through: sample a pixel
   inside the image's box where the source is background, and compare it with
   the bar beside it. A black or white slab fails here. */
test('under WebKit the intro composites onto the bar and then gives way', async () => {
  test.setTimeout(90_000);
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage();
    await open(page, '/resources');
    await mark(page).click();
    await page.waitForTimeout(400);
    const intro = topbar(page).locator('img[data-logo-intro]');
    await expect(intro).toHaveCount(1);
    const box = (await intro.boundingBox())!;
    const read = async (x: number, y: number) => {
      const shot = await page.screenshot({ clip: { x, y, width: 3, height: 3 } });
      return page.evaluate(async (bytes) => {
        const bmp = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
        const c = document.createElement('canvas'); c.width = 3; c.height = 3;
        const ctx = c.getContext('2d')!; ctx.drawImage(bmp, 0, 0);
        const d = ctx.getImageData(1, 1, 1, 1).data; return [d[0], d[1], d[2]];
      }, Array.from(shot));
    };
    const bar = await read(box.x + box.width + 8, box.y + box.height / 2);
    const inside = await read(box.x + 2, box.y + 2);
    expect(Math.max(...inside.map((v, i) => Math.abs(v - bar[i]))), `inside ${inside} vs bar ${bar}`).toBeLessThan(14);
    expect(inside[0], 'not black').toBeGreaterThan(150);
    expect(inside[0], 'not white').toBeLessThan(245);

    await page.waitForTimeout(2200);
    await expect(topbar(page).locator('img[data-logo-intro]'), 'the wordmark is back').toHaveCount(0);
    await expect(topbar(page).locator('picture')).toHaveCount(1);

    /* A second click must replay from the first frame, not show the cached
       final one. Early in the run the letters have not slid in yet, so the
       spot where the P ends up is still bare bar. */
    await mark(page).click();
    await page.waitForTimeout(120);
    const again = topbar(page).locator('img[data-logo-intro]');
    await expect(again, 'the intro plays again').toHaveCount(1);
    const b2 = (await again.boundingBox())!;
    const whereP = await read(b2.x + b2.width * 0.06, b2.y + b2.height * 0.55);
    expect(Math.max(...whereP.map((v, i) => Math.abs(v - bar[i]))), `at 120ms the P's spot ${whereP} is still bar ${bar}`).toBeLessThan(14);
  } finally {
    await browser.close();
  }
});
