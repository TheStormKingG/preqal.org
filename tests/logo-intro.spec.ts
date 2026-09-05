/* Clicking any Preqal mark goes home and plays the mark's intro in the top bar
   — the Q rolls in, the letters slide up — before it settles back into the
   wordmark. The video carries an alpha plane (VP9 for Chromium and Firefox,
   HEVC for Safari), keyed from a source whose star is the same white as its
   background, so the compositing check below is the one that matters. */
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

  const video = topbar(page).locator('video');
  await expect(video, 'a video stands where the wordmark was').toHaveCount(1);
  await expect(topbar(page).locator('picture'), 'and the picture is gone for now').toHaveCount(0);
  const state = await video.evaluate((v: HTMLVideoElement) => ({
    playing: !v.paused && !v.ended && v.currentTime > 0, muted: v.muted, src: v.currentSrc,
    w: v.getBoundingClientRect().width, h: v.getBoundingClientRect().height,
  }));
  expect(state.playing, 'it is actually playing').toBe(true);
  expect(state.muted, 'silently, or autoplay would be refused').toBe(true);
  expect(state.src, 'chromium takes the webm').toContain('logo-intro.webm');
  expect(Math.abs(state.h - before!.height), 'same height as the wordmark, so nothing jumps').toBeLessThan(2);
  expect(Math.abs(state.w - before!.width), 'and near enough the same width').toBeLessThan(12);
  await page.screenshot({ path: `${S}/intro-mid.png`, clip: { x: 80, y: 0, width: 360, height: 80 } });

  await page.waitForTimeout(2200);
  await expect(topbar(page).locator('video'), 'once it ends the video is gone').toHaveCount(0);
  await expect(topbar(page).locator('picture'), 'and the wordmark is back').toHaveCount(1);
});

test('the intro composites onto the bar, not onto a white slab', async ({ page }) => {
  await open(page, '/');
  await mark(page).click();
  await page.waitForTimeout(400);
  // Sample the bar just outside the mark's box while the video is up. The
  // source frames are white there; with alpha the bar's own grey shows through.
  const box = (await topbar(page).locator('video').boundingBox())!;
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
  await expect(topbar(page).locator('video'), 'the top bar is playing the intro').toHaveCount(1);
});

test('a reader who prefers reduced motion just gets the wordmark', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/resources');
  await mark(page).click();
  await page.waitForTimeout(400);
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(topbar(page).locator('video')).toHaveCount(0);
  await expect(topbar(page).locator('picture')).toHaveCount(1);
});

test('on a phone the mark plays at its phone size', async ({ page }) => {
  await open(page, '/resources', 390, 844);
  const before = await mark(page).boundingBox();
  await mark(page).click();
  await page.waitForTimeout(300);
  const v = await topbar(page).locator('video').boundingBox();
  expect(Math.abs(v!.height - before!.height)).toBeLessThan(2);
});
