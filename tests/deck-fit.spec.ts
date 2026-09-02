import { test, expect, type Page } from '@playwright/test';

/* Every slide has to own exactly one screen at every size the deck runs at,
   with nothing clipped at either edge. Measured against the local dev server. */

const SIZES = [
  { name: 'phone 375x667', w: 375, h: 667 },
  { name: 'phone 390x844', w: 390, h: 844 },
  { name: 'phone 375x812', w: 375, h: 812 },
  /* The short bands the scale ladder steps down for — untested, they drifted. */
  { name: 'short phone 390x760', w: 390, h: 760 },
  { name: 'small phone 375x620', w: 375, h: 620 },
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
      /* Measured against the slide's content box, not its border box: the
         gutter above and below is reserved space, and content reaching into
         it is exactly the "jammed against the bars" look we are ruling out. */
      const pad = getComputedStyle(sec);
      const top = sr.top + (parseFloat(pad.paddingTop) || 0);
      const room = sr.height - (parseFloat(pad.paddingTop) || 0) - (parseFloat(pad.paddingBottom) || 0);
      let min = Infinity;
      let max = -Infinity;
      sec.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.height === 0 && b.width === 0) return;
        /* Decorative washes (radial glows, texture overlays) are pointer-events-none
           and clipped by their section's overflow-hidden, so running past the slide
           edge is by design — only content the reader must see counts here. */
        if (getComputedStyle(el).pointerEvents === 'none') return;
        min = Math.min(min, b.top - top);
        max = Math.max(max, b.bottom - top);
      });
      rows.push({
        label: sec.getAttribute('aria-label') ?? '',
        over: Math.round(Math.max(0, max - room) + Math.max(0, -min)),
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

/* The fit checks above measure against each slide's content box, so a slide
   scaled too large fails by reaching into the gutter rather than by visibly
   spilling. This is the gutter itself: without it those checks would pass on
   a layout jammed against the bars top and bottom. */
test('every slide reserves a gutter above and below its content', async ({ page }) => {
  for (const [w, h] of [[390, 844], [375, 667]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const rows = await page.evaluate(() => {
      const wrap = document.querySelector('main .relative.w-full.overflow-hidden');
      const out: { label: string; pad: number; slack: number; scrollable: boolean }[] = [];
      wrap?.firstElementChild?.querySelectorAll(':scope > section').forEach((sec) => {
        const cs = getComputedStyle(sec);
        const fit = sec.querySelector('.deck-fit') as HTMLElement | null;
        out.push({
          label: sec.getAttribute('aria-label') ?? '',
          pad: parseFloat(cs.paddingTop) || 0,
          slack: fit ? Math.round(sec.getBoundingClientRect().height - fit.getBoundingClientRect().height) : -1,
          scrollable: sec.getAttribute('data-deck-scrollable') === 'true',
        });
      });
      return out;
    });

    for (const row of rows) {
      if (row.scrollable) {
        // It sizes its own halves from the full height, so a gutter would
        // break the arithmetic that makes them exact.
        expect(row.pad, `${row.label} opts out of the gutter`).toBe(0);
        continue;
      }
      expect(row.pad, `${row.label} reserves a gutter`).toBeGreaterThan(8);
      if (row.slack >= 0) {
        expect(row.slack, `${row.label} is not jammed against the bars`).toBeGreaterThanOrEqual(2 * row.pad);
      }
    }
  }
});
