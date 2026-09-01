import { test, expect, type Page } from '@playwright/test';

/* Templates and Contact run as decks on phones and as ordinary scrolling pages
   from lg up. Every slide must own one screen, except a slide marked scrollable
   (the contact form), which scrolls inside itself. */

const PHONES = [
  { name: '375x667', w: 375, h: 667 },
  { name: '375x812', w: 375, h: 812 },
  { name: '390x844', w: 390, h: 844 },
  { name: '390x760', w: 390, h: 760 },
  { name: '375x620', w: 375, h: 620 },
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
        /* Decorative washes (radial glows, texture overlays) are pointer-events-none
           and clipped by their section's overflow-hidden, so running past the slide
           edge is by design — only content the reader must see counts here. */
        if (getComputedStyle(el).pointerEvents === 'none') return;
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

/* 375x667 is the case that bites: the second half is taller than that screen,
   so unless each half is pinned to exactly one slide the form becomes three
   views and costs a dead gesture. */
for (const [w, h] of [[390, 844], [375, 667]] as const) {
test(`the contact form reads as two exact halves before the deck moves on — ${w}x${h}`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h });
  await open(page, '/contact');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1800);

  const label = () =>
    page.evaluate(() => document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '');
  expect(await label()).toContain('Send a message');

  const slide = page.locator('main section[data-deck-scrollable="true"]');
  const geom = await slide.evaluate((e) => {
    const b = e.querySelector('[data-deck-break]') as HTMLElement;
    return {
      top: e.scrollTop,
      client: e.clientHeight,
      scroll: e.scrollHeight,
      breakAt: Math.round(b.getBoundingClientRect().top - e.getBoundingClientRect().top + e.scrollTop),
    };
  });

  expect(geom.top, 'the form opens on its first half').toBe(0);
  expect(
    Math.abs(geom.scroll - geom.client * 2),
    `the form is exactly two screenfuls (${geom.scroll} vs ${geom.client * 2})`,
  ).toBeLessThanOrEqual(2);
  expect(Math.abs(geom.breakAt - geom.client), 'the second half starts one screenful down').toBeLessThanOrEqual(2);

  await page.mouse.move(w / 2, h / 2);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(900);

  const after = await slide.evaluate((e) => e.scrollTop);
  expect(Math.abs(after - geom.client), 'one gesture lands exactly on the second half').toBeLessThanOrEqual(2);
  expect(await label(), 'the deck holds while the form has a half left').toContain('Send a message');

  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1600);
  expect(await label(), 'once both halves are read, the deck moves on').not.toContain('Send a message');
});
}

test('the form slide is escapable even where the reCAPTCHA swallows swipes', async ({ page }) => {
  /* The reCAPTCHA is a cross-origin iframe, so a swipe starting on it never
     reaches this page and the deck cannot read it. The cue button below it is the
     guaranteed way onward from that slide. */
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/contact');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1800);

  const label = () =>
    page.evaluate(() => document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '');
  expect(await label()).toContain('Send a message');

  const cue = page.getByRole('button', { name: /Who you.ll be talking to/i });
  await cue.scrollIntoViewIfNeeded();
  await expect(cue).toBeVisible();
  await cue.click();
  await page.waitForTimeout(1600);
  expect(await label(), 'the cue must leave the form slide').toContain("Who you'll be talking to");
});
