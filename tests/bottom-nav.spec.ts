import { test, expect, chromium, devices, type Page, type CDPSession } from '@playwright/test';

/* On a phone the three destinations live in a bottom tab bar and a sideways
   swipe moves between them in the same order. The burger menu is gone. */

const BASE = 'http://localhost:3000';

async function open(page: Page, path = '/') {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(900);
}

test('the phone carries a bottom tab bar and no burger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);

  const bar = page.locator('nav[aria-label="Primary"]');
  await expect(bar, 'the tab bar is on screen').toBeVisible();
  await expect(bar.getByRole('link'), 'one tab per destination').toHaveCount(3);
  await expect(page.getByRole('button', { name: /toggle menu/i }), 'the burger is gone').toHaveCount(0);

  // It sits at the bottom, and the deck stops above it rather than running under.
  const [barBox, deckBox] = await Promise.all([
    bar.boundingBox(),
    page.locator('main .relative.w-full.overflow-hidden').boundingBox(),
  ]);
  expect(barBox!.y + barBox!.height).toBeGreaterThanOrEqual(844 - 1);
  expect(deckBox!.y + deckBox!.height, 'the deck ends where the tab bar starts').toBeLessThanOrEqual(
    barBox!.y + 1,
  );

  await expect(bar.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
});

test('the phone bar carries a working WhatsApp button beside the mark', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);

  const topBar = page.locator('nav').first();
  const wa = topBar.getByRole('button', { name: /whatsapp/i });
  await expect(wa).toBeVisible();

  // Far right of the bar, and clear of the mark on the left.
  const [waBox, barBox, mark] = await Promise.all([
    wa.boundingBox(),
    topBar.boundingBox(),
    topBar.getByRole('img', { name: /preqal logo/i }).boundingBox(),
  ]);
  expect(waBox!.x, 'it sits in the right-hand half').toBeGreaterThan(barBox!.width / 2);
  expect(waBox!.x, 'and never overlaps the mark').toBeGreaterThan(mark!.x + mark!.width);
  expect(waBox!.height, 'the tap target clears 44px').toBeGreaterThanOrEqual(44);

  await wa.click();
  await expect(page.getByRole('dialog', { name: /whatsapp/i }), 'it opens the contact sheet').toBeVisible();
});

test('the tab bar navigates and follows the route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const bar = page.locator('nav[aria-label="Primary"]');

  await bar.getByRole('link', { name: 'Templates' }).click();
  await page.waitForTimeout(900);
  expect(new URL(page.url()).pathname).toBe('/resources');
  await expect(bar.getByRole('link', { name: 'Templates' })).toHaveAttribute('aria-current', 'page');

  await bar.getByRole('link', { name: 'Contact' }).click();
  await page.waitForTimeout(900);
  expect(new URL(page.url()).pathname).toBe('/contact');
});

test('desktop keeps the top nav and shows no tab bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  await expect(page.locator('nav[aria-label="Primary"]')).toBeHidden();
  await expect(page.locator('nav').first().getByRole('button', { name: 'Contact us on WhatsApp' }),
    'the phone-only button stays off desktop').toBeHidden();
  await expect(page.getByRole('link', { name: 'Templates', exact: true }).first()).toBeVisible();
});

/* The two bars are meant to be the same control in two places, so these
   compare them against each other rather than against colours written down
   here — the point is that they match, whatever the palette says. The phone
   bar wears the top bar's treatment: a plain label, underlined in amber where
   you are. */
const tabLook = async (page: Page, width: number, bar: string) => {
  await page.setViewportSize({ width, height: 844 });
  await open(page, '/resources');
  const active = page.locator(bar).getByRole('link', { name: 'Templates' });
  await expect(active).toHaveAttribute('aria-current', 'page');
  return active.evaluate((el) => {
    const label = (el.querySelector('span:not([data-nav-underline])') ?? el) as HTMLElement;
    const cs = getComputedStyle(label);
    const rule = el.querySelector('[data-nav-underline]');
    return {
      color: cs.color,
      weight: cs.fontWeight,
      size: cs.fontSize,
      icons: el.querySelectorAll('svg').length,
      underline: rule ? getComputedStyle(rule).backgroundColor : null,
    };
  });
};

test('the phone bar wears the top bar treatment', async ({ page }) => {
  test.setTimeout(90_000);
  const desktop = await tabLook(page, 1280, 'nav:not([aria-label="Primary"])');
  const phone = await tabLook(page, 390, 'nav[aria-label="Primary"]');

  expect(phone.icons, 'labels only, no icons').toBe(0);
  expect(phone.underline, 'the active label is underlined').not.toBeNull();
  expect(phone.underline, 'in the same amber the top bar uses').toBe(desktop.underline);
  expect(phone.color, 'same colour').toBe(desktop.color);
  expect(phone.weight, 'same weight').toBe(desktop.weight);
  expect(phone.size, 'same size').toBe(desktop.size);
  expect(desktop.icons, 'and the top bar is unchanged — still labels only').toBe(0);
});

test('both WhatsApp buttons are the same amber pill', async ({ page }) => {
  test.setTimeout(90_000);
  const pill = async (width: number) => {
    await page.setViewportSize({ width, height: 844 });
    await open(page);
    return page
      .locator('nav')
      .first()
      .getByRole('button', { name: /whatsapp/i })
      .evaluate((el) => {
        const target = (el.querySelector('span') ?? el) as HTMLElement;
        const cs = getComputedStyle(target);
        return { bg: cs.backgroundColor, color: cs.color, radius: parseFloat(cs.borderRadius) };
      });
  };
  const phone = await pill(390);
  const desktop = await pill(1280);

  expect(phone.bg, 'the phone button is filled, not the neumorphic surface it was')
    .not.toBe('rgb(224, 229, 236)');
  expect(phone.bg, 'and is the desktop button').toBe(desktop.bg);
  expect(phone.color).toBe(desktop.color);
  expect(phone.radius, 'both fully rounded').toBeGreaterThan(20);
});

test('a sideways swipe moves between the three pages', async () => {
  test.setTimeout(120_000);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ ...devices['Galaxy S9+'] });
    const page = await ctx.newPage();
    const cdp: CDPSession = await ctx.newCDPSession(page);
    const { width, height } = devices['Galaxy S9+'].viewport;
    const y = height * 0.45;

    /* Sideways, and far enough from either edge that the OS back-swipe is
       left alone. */
    const swipe = async (fromFrac: number, toFrac: number) => {
      const from = width * fromFrac;
      const to = width * toFrac;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y, id: 1 }] });
      for (let i = 1; i <= 6; i++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: from + ((to - from) * i) / 6, y, id: 1 }],
        });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(1100);
    };
    const path = () => new URL(page.url()).pathname;

    await open(page);
    expect(path()).toBe('/');

    await swipe(0.8, 0.2);
    expect(path(), 'swiping left goes to the next tab').toBe('/resources');

    await swipe(0.8, 0.2);
    expect(path()).toBe('/contact');

    await swipe(0.8, 0.2);
    expect(path(), 'the last tab does not wrap around').toBe('/contact');

    await swipe(0.2, 0.8);
    expect(path(), 'swiping right goes back').toBe('/resources');

    await swipe(0.2, 0.8);
    expect(path()).toBe('/');

    await swipe(0.2, 0.8);
    expect(path(), 'the first tab does not wrap around').toBe('/');
  } finally {
    await browser.close();
  }
});

test('a diagonal swipe moves the page or the deck, never both', async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ ...devices['Galaxy S9+'] });
    const page = await ctx.newPage();
    const cdp: CDPSession = await ctx.newCDPSession(page);
    const { width, height } = devices['Galaxy S9+'].viewport;
    await open(page);

    // Mostly sideways with a healthy vertical drift — the kind of swipe a real
    // thumb makes. The router should take it and the deck should stay put.
    const x0 = width * 0.8;
    const y0 = height * 0.6;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x0 - i * 26, y: y0 - i * 9, id: 1 }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(1200);

    expect(new URL(page.url()).pathname, 'the sideways intent wins').toBe('/resources');
    expect(
      await page.evaluate(() =>
        document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
      ),
      'and the deck it left behind did not also advance',
    ).toContain('Free templates');
  } finally {
    await browser.close();
  }
});

test('a vertical swipe still drives the deck, not the router', async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ ...devices['Galaxy S9+'] });
    const page = await ctx.newPage();
    const cdp: CDPSession = await ctx.newCDPSession(page);
    const { width, height } = devices['Galaxy S9+'].viewport;
    await open(page);

    const x = width / 2;
    const from = height * 0.7;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from, id: 1 }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: from - i * 30, id: 1 }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(1200);

    expect(new URL(page.url()).pathname, 'a vertical swipe must not change page').toBe('/');
    expect(
      await page.evaluate(() =>
        document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
      ),
      'it advances the deck instead',
    ).toContain('Phase 01');
  } finally {
    await browser.close();
  }
});
