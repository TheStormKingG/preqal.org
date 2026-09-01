import { test, expect, type Page } from '@playwright/test';

/* Templates and Contact run as decks on phones and as ordinary scrolling pages
   from lg up. Every slide must own one screen, except a slide marked scrollable
   (the contact form), which scrolls inside itself. */

const PHONES = [
  { name: '375x667', w: 375, h: 667 },
  { name: '390x844', w: 390, h: 844 },
  { name: '768x1024', w: 768, h: 1024 },
];

const readSlides = (page: Page) =>
  page.evaluate(() => {
    const wrap = document.querySelector('main .relative.w-full.overflow-hidden');
    if (!wrap?.firstElementChild) return null;
    const rows: { label: string; over: number; scrollable: boolean }[] = [];
    wrap.firstElementChild.querySelectorAll(':scope > section').forEach((sec) => {
      const sr = sec.getBoundingClientRect();
      let min = Infinity;
      let max = -Infinity;
      sec.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.height === 0 && b.width === 0) return;
        min = Math.min(min, b.top - sr.top);
        max = Math.max(max, b.bottom - sr.top);
      });
      rows.push({
        label: sec.getAttribute('aria-label') ?? '',
        over: Math.round(Math.max(0, max - sr.height) + Math.max(0, -min)),
        scrollable: sec.getAttribute('data-deck-scrollable') === 'true',
      });
    });
    return rows;
  });

async function open(page: Page, path: string) {
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

for (const path of ['/resources', '/contact']) {
  for (const p of PHONES) {
    test(`${path} slides fit one screen — ${p.name}`, async ({ page }) => {
      await page.setViewportSize({ width: p.w, height: p.h });
      await open(page, path);
      const rows = await readSlides(page);
      expect(rows, `${path} should be a deck at ${p.name}`).not.toBeNull();
      expect(rows!.length).toBeGreaterThanOrEqual(4);
      for (const row of rows!) {
        if (row.scrollable) continue; // scrolls inside itself by design
        expect(row.over, `${row.label} overflows by ${row.over}px`).toBeLessThanOrEqual(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1)).toBe(false);
    });
  }

  test(`${path} stays an ordinary scrolling page on desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, path);
    expect(await readSlides(page), `${path} must not be a deck on desktop`).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1)).toBe(true);
  });
}

test('the contact form slide scrolls itself before the deck moves on', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/contact');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1800);

  const label = () =>
    page.evaluate(() => document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '');
  expect(await label()).toContain('Send a message');

  const slide = page.locator('main section[data-deck-scrollable="true"]');
  const before = await slide.evaluate((e) => e.scrollTop);
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(700);

  expect(await slide.evaluate((e) => e.scrollTop), 'the form scrolls inside its slide').toBeGreaterThan(before);
  expect(await label(), 'the deck holds while the form still has room').toContain('Send a message');

  await slide.evaluate((e) => { e.scrollTop = e.scrollHeight; });
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1600);
  expect(await label(), 'once the form is read out, the deck moves on').not.toContain('Send a message');
});
