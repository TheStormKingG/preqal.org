import { test, expect, type Page } from '@playwright/test';

/* The phase wick burns in the direction the reader is travelling. These run
   against the local dev server, since the deck only exists at desktop widths. */

const LOCAL = 'http://localhost:3000/';

interface WickState {
  phase: number;
  /** y of the path's first point: 0 = the stretch above the badge, badge-y = the stretch below it. */
  startY: number;
  offset: string;
  badge: string;
}
interface Snap {
  active: string;
  phases: WickState[];
}

const readWicks = (page: Page): Promise<Snap> =>
  page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('main .relative.h-full'));
    const secs = Array.from(document.querySelectorAll('main section[aria-label]'));
    const activeSec = secs.find((s) => s.getAttribute('aria-hidden') === 'false');
    return {
      active: activeSec?.getAttribute('aria-label') ?? '',
      phases: slides.map((s, i) => {
        const p = s.querySelector('path[stroke^="url(#wick"]');
        const d = p?.getAttribute('d') ?? '';
        const badge = s.querySelector('.relative.h-14.w-14 > div') as HTMLElement | null;
        return {
          phase: i + 1,
          startY: Math.round(parseFloat(d.split(' ')[2] ?? '-1')),
          offset: p ? getComputedStyle(p).strokeDashoffset : '',
          badge: badge?.style.transform ?? '',
        };
      }),
    };
  });

const ABOVE = 0; // the stretch above the badge starts at the top edge

test.describe('phase wick', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCAL, { waitUntil: 'networkidle' });
    await page.waitForSelector('main .relative.h-full', { timeout: 10_000 });
  });

  test('burns into the badge from above when travelling down', async ({ page }) => {
    await page.keyboard.press('ArrowDown'); // Phase 01
    await page.keyboard.press('ArrowDown'); // Phase 02
    await page.waitForTimeout(1800);

    const snap = await readWicks(page);
    expect(snap.active).toContain('Phase 02');
    const p2 = snap.phases[1];
    expect(p2.startY).toBe(ABOVE);
    expect(p2.offset).toBe('0px'); // fully lit
    expect(p2.badge).toBe('scale(1)'); // popped
  });

  test('burns into the badge from below when travelling back up', async ({ page }) => {
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown'); // Phase 03
    await page.waitForTimeout(1800);
    await page.keyboard.press('ArrowUp'); // back to Phase 02
    await page.waitForTimeout(1800);

    const snap = await readWicks(page);
    expect(snap.active).toContain('Phase 02');
    const p2 = snap.phases[1];
    expect(p2.startY).toBeGreaterThan(ABOVE); // the stretch below the badge
    expect(p2.offset).toBe('0px');
    expect(p2.badge).toBe('scale(1)');
  });

  test('a slide being left keeps the half it lit when the direction flips', async ({ page }) => {
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown'); // Phase 03
    await page.waitForTimeout(1800);

    const before = await readWicks(page);
    expect(before.phases[2].startY).toBe(ABOVE);
    expect(before.phases[2].offset).toBe('0px');

    await page.keyboard.press('ArrowUp'); // direction change, Phase 03 slides away
    await page.waitForTimeout(400); // mid-flight, still on screen

    const during = await readWicks(page);
    // Phase 03 must still show the half it burnt, still lit — not swapped to
    // the other half, and not visibly un-drawing while it is on screen.
    expect(during.phases[2].startY).toBe(ABOVE);
    expect(during.phases[2].offset).toBe('0px');
  });

  test('phase 01 originates its own wick going forward, and is reached from below coming back', async ({ page }) => {
    await page.keyboard.press('ArrowDown'); // Phase 01, forward
    await page.waitForTimeout(1800);
    const forward = await readWicks(page);
    expect(forward.active).toContain('Phase 01');
    expect(forward.phases[0].startY).toBeGreaterThan(ABOVE); // runs down out of the badge
    expect(forward.phases[0].offset).toBe('0px');

    await page.keyboard.press('ArrowDown'); // Phase 02
    await page.waitForTimeout(1800);
    await page.keyboard.press('ArrowUp'); // back up into Phase 01
    await page.waitForTimeout(1800);

    const back = await readWicks(page);
    expect(back.active).toContain('Phase 01');
    expect(back.phases[0].startY).toBeGreaterThan(ABOVE); // same half, arriving from below
    expect(back.phases[0].offset).toBe('0px');
  });
});
