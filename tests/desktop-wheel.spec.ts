import { test, expect, type Page } from '@playwright/test';

/* Desktop drives the deck entirely from the wheel, and the two devices that
   produce wheel events could not be less alike:

     a mouse    — big discrete notches, arriving for as long as it is turned
     a trackpad — a burst that ramps up and then coasts, decaying, for a second
                  or more after the fingers have left

   One slide per deliberate push, and a coast must never buy a second slide.
   Telling them apart by waiting for silence does not work: neither a held
   mouse nor a second flick ever goes quiet, and the deck used to sit dead
   through both — every one of these streams moved exactly one slide and then
   stopped answering. */

const FLICK_STEP_MS = 16;

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1400);
}

/** Runs a wheel stream against the deck and answers how many slides it moved. */
async function slidesMovedBy(page: Page, stream: { delta: number; lines?: boolean }[]) {
  await open(page);
  return page.evaluate(
    async ({ frames, stepMs }) => {
      const deck = document.querySelector('main .relative.w-full.overflow-hidden')!;
      const at = () =>
        document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '';
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      let moves = 0;
      let last = at();
      const mark = () => {
        const now = at();
        if (now !== last) {
          moves += 1;
          last = now;
        }
      };

      for (const f of frames) {
        deck.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: f.delta,
            deltaMode: f.lines ? 1 : 0,
            bubbles: true,
            cancelable: true,
          }),
        );
        mark();
        await sleep(f.gap ?? stepMs);
      }
      await sleep(1700); // let the last slide land
      mark();
      return moves;
    },
    { frames: stream as { delta: number; lines?: boolean; gap?: number }[], stepMs: FLICK_STEP_MS },
  );
}

/** A trackpad burst: a short ramp to `peak`, then the coast decaying away. */
const flick = (peak: number, decay: number) => {
  const frames = [0.04, 0.12, 0.3, 0.55, 0.8, 1].map((f) => ({ delta: Math.round(peak * f) }));
  let v = peak;
  while (v > 1) {
    v *= decay;
    frames.push({ delta: Math.max(1, Math.round(v)) });
  }
  return frames;
};

const held = (delta: number, count: number, gap: number, lines = false) =>
  Array.from({ length: count }, () => ({ delta, lines, gap }));

test('one trackpad flick moves exactly one slide', async ({ page }) => {
  test.setTimeout(90_000);
  expect(await slidesMovedBy(page, flick(96, 0.93))).toBe(1);
});

test('even a hard flick with a long coast moves exactly one slide', async ({ page }) => {
  test.setTimeout(90_000);
  // The coast here is still throwing deltas of ~90 a second in — none of it
  // may be mistaken for the reader asking for another slide.
  expect(await slidesMovedBy(page, flick(220, 0.97))).toBe(1);
});

test('a second flick is answered, not swallowed by the first slide', async ({ page }) => {
  test.setTimeout(90_000);
  const two = [...flick(96, 0.9), ...Array.from({ length: 8 }, () => ({ delta: 0 })), ...flick(96, 0.9)];
  expect(await slidesMovedBy(page, two)).toBe(2);
});

test('a held mouse wheel keeps the deck moving', async ({ page }) => {
  test.setTimeout(90_000);
  // 20 notches over 1.2s. This used to move one slide and then go dead.
  expect(await slidesMovedBy(page, held(100, 20, 60))).toBeGreaterThanOrEqual(2);
});

test('a wheel that reports lines rather than pixels is understood', async ({ page }) => {
  test.setTimeout(90_000);
  // Firefox sends deltaY 3 in line mode; unnormalised that is a tenth of a
  // notch and the deck would barely stir.
  expect(await slidesMovedBy(page, held(3, 12, 60, true))).toBeGreaterThanOrEqual(2);
});

test('a slow steady drag keeps the deck moving', async ({ page }) => {
  test.setTimeout(90_000);
  expect(await slidesMovedBy(page, held(30, 60, 32))).toBeGreaterThanOrEqual(2);
});

/* Sideways on a desktop trackpad moves between the three pages, the same order
   the tab bar lists them. */
async function sideways(page: Page, frames: { dx: number; dy?: number }[]) {
  return page.evaluate(async (fs) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    /* Dispatch where the pointer would be — on the deck. The event bubbles from
       there to the document, so both the deck and the router get their say and
       the axis rule is what decides between them. */
    const target = document.querySelector('main .relative.w-full.overflow-hidden') ?? document.body;
    for (const f of fs) {
      target.dispatchEvent(
        new WheelEvent('wheel', { deltaX: f.dx, deltaY: f.dy ?? 0, bubbles: true, cancelable: true }),
      );
      await sleep(16);
    }
    await sleep(1200);
    return window.location.pathname;
  }, frames);
}

const sideFlick = (peak: number) => {
  const frames = [0.1, 0.35, 0.7, 1, 1, 0.8, 0.5, 0.3, 0.2, 0.1].map((f) => ({ dx: Math.round(peak * f) }));
  return frames;
};

test('a sideways trackpad swipe moves one page, and only one', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  expect(await sideways(page, sideFlick(40)), 'swiping left goes to the next tab').toBe('/resources');
  expect(await sideways(page, sideFlick(40)), 'and again').toBe('/contact');
  expect(await sideways(page, sideFlick(40)), 'the last tab does not wrap').toBe('/contact');
  expect(await sideways(page, sideFlick(-40)), 'swiping right goes back').toBe('/resources');
});

test('a long sideways swipe with a coast still moves only one page', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  const long = [...sideFlick(60), ...Array.from({ length: 40 }, (_, i) => ({ dx: Math.max(1, 40 - i) }))];
  expect(await sideways(page, long)).toBe('/resources');
});

test('a mostly vertical wheel is left to the deck, not the router', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  const where = await sideways(page, Array.from({ length: 10 }, () => ({ dx: 12, dy: 100 })));
  expect(where, 'the page must not change').toBe('/');
  expect(
    await page.evaluate(() =>
      document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
    ),
    'the deck took it instead',
  ).toContain('Phase');
});
