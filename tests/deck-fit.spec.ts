import { test, expect, type Page } from '@playwright/test';

/* Every slide has to own exactly one screen at every size the deck runs at,
   with nothing clipped at either edge. Measured against the local dev server. */

const SIZES = [
  { name: 'phone 375x667', w: 375, h: 667 },
  { name: 'phone 390x844', w: 390, h: 844 },
  { name: 'phone 375x812', w: 375, h: 812 },
  { name: 'tablet 768x1024', w: 768, h: 1024 },
  { name: 'laptop 1280x800', w: 1280, h: 800 },
  { name: 'desktop 1440x900', w: 1440, h: 900 },
];

interface Row { label: string; over: number }

const overflows = (page: Page) =>
  page.evaluate(() => {
    const wrap = document.querySelector('main .relative.w-full.overflow-hidden');
    if (!wrap?.firstElementChild) return null;
    const rows: { label: string; over: number }[] = [];
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
      });
    });
    return rows;
  });

for (const s of SIZES) {
  test(`every slide fits one screen — ${s.name}`, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const rows = (await overflows(page)) as Row[] | null;
    expect(rows, 'the deck should render at every width').not.toBeNull();
    expect(rows!.length).toBe(8);
    for (const row of rows!) {
      expect(row.over, `${row.label} overflows its slide by ${row.over}px`).toBeLessThanOrEqual(1);
    }

    // the deck replaces page scrolling everywhere, phones included
    const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1);
    expect(scrolls, 'the page itself must not scroll').toBe(false);
  });
}

test('phones keep the straight edge wick, desktop keeps the gutter curve', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(2200);

  const mobile = await page.evaluate(() => {
    const active = document.querySelector('main section[aria-hidden="false"]');
    const path = active?.querySelector('.lg\\:hidden path[stroke^="url(#wick"]');
    const box = path?.getBoundingClientRect();
    return { d: path?.getAttribute('d') ?? '', h: Math.round(box?.height ?? 0) };
  });
  // a straight line hugging the left edge, running the full slide
  expect(mobile.d).toMatch(/^M 10 0 L 10 /);
  expect(mobile.h).toBeGreaterThan(400);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1200);
  const desktopCurved = await page.evaluate(() => {
    const p = document.querySelector('main .hidden.lg\\:block path[stroke^="url(#wick"]');
    return (p?.getAttribute('d') ?? '').includes('C'); // the spline through the gutter
  });
  expect(desktopCurved).toBe(true);
});
