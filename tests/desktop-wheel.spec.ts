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
