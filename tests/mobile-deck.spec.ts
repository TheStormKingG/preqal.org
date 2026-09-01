import { test, expect, chromium, webkit, devices, type Page, type CDPSession } from '@playwright/test';

/* The deck must answer real touch on both phone engines. Android Chrome is
   driven with native CDP touch (the browser's full gesture pipeline — this is
   what caught touch-action:auto letting Chrome cancel our touches); iOS Safari
   is the real WebKit engine driven with the pointer events it fires natively. */

const URL = 'http://localhost:3000/';

const activeSlide = (page: Page) =>
  page.evaluate(() => document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '');

const settle = (page: Page) => page.waitForTimeout(1500);

async function openDeck(page: Page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 3000 }).catch(() => {});
  // wait until the consent card has actually left the tree — mid-exit it still
  // sits over the deck and eats the first swipe
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => {
    const wrap = document.querySelector('main .relative.w-full.overflow-hidden');
    return wrap ? getComputedStyle(wrap).touchAction : null;
  })).toBe('none'); // without this, Android claims the drag and cancels our touches
}

async function expectJourney(page: Page, swipe: (fromFrac: number, toFrac: number) => Promise<void>) {
  expect(await activeSlide(page)).toContain('Welcome');

  await swipe(0.7, 0.3);
  await settle(page);
  expect(await activeSlide(page), 'swipe up advances one slide').toContain('Phase 01');

  await swipe(0.7, 0.3);
  await settle(page);
  expect(await activeSlide(page)).toContain('Phase 02');

  await swipe(0.3, 0.7);
  await settle(page);
  expect(await activeSlide(page), 'swipe down goes back one slide').toContain('Phase 01');

  await swipe(0.7, 0.3);
  await swipe(0.7, 0.3); // rapid second swipe inside the lock window
  await page.waitForTimeout(1800);
  expect(await activeSlide(page), 'a rapid double swipe advances exactly one').toContain('Phase 02');

  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1),
    'the page itself must not scroll').toBe(false);
}

test('Samsung (Android Chrome engine) swipes the deck slide by slide', async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ ...devices['Galaxy S9+'] });
    const page = await ctx.newPage();
    const cdp: CDPSession = await ctx.newCDPSession(page);
    const { width, height } = devices['Galaxy S9+'].viewport;

    const swipe = async (fromFrac: number, toFrac: number) => {
      const x = width / 2;
      const from = height * fromFrac;
      const to = height * toFrac;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from, id: 1 }] });
      for (let i = 1; i <= 8; i++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y: from + ((to - from) * i) / 8, id: 1 }],
        });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };

    await openDeck(page);
    await expectJourney(page, swipe);
  } finally {
    await browser.close();
  }
});

test('Apple (WebKit engine) swipes the deck slide by slide', async () => {
  test.setTimeout(90_000);
  const browser = await webkit.launch();
  try {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    const { width, height } = devices['iPhone 13'].viewport;

    const swipe = (fromFrac: number, toFrac: number) =>
      page.evaluate(({ x, from, to }) => {
        const el = document.elementFromPoint(x, from) || document.body;
        const fire = (type: string, y: number) =>
          el.dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch',
            isPrimary: true, clientX: x, clientY: y,
          }));
        fire('pointerdown', from);
        for (let i = 1; i <= 6; i++) fire('pointermove', from + ((to - from) * i) / 6);
        fire('pointerup', to);
      }, { x: width / 2, from: height * fromFrac, to: height * toFrac });

    await openDeck(page);
    await expectJourney(page, swipe);
  } finally {
    await browser.close();
  }
});
