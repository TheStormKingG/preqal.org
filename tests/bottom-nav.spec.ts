import { test, expect, chromium, devices, type Page, type CDPSession } from '@playwright/test';
import { NAV_ITEMS } from '../components/BottomNav';

/* On a phone every NAV_ITEMS destination lives in a bottom tab bar and a
   sideways swipe moves between them in the same order. Both walks below take
   their destinations from NAV_ITEMS, so a tab added to the bar is a tab these
   tests require to be reachable. */

const BASE = 'http://localhost:3000';
/* The tab bar links to the canonical, trailing-slash URL; the router accepts
   either. Compare the form the app compares. */
const where = (page: Page) => new URL(page.url()).pathname.replace(/(.)\/$/, '$1');

/* Press/swipe, then wait for the router to actually arrive. A fixed delay
   raced the first gesture after load: the key landed before RouteSwipe was
   listening, the URL never changed, and the test failed for a reason that had
   nothing to do with the behaviour under test. A real wait still fails if the
   page genuinely never gets there — it just stops failing when it does. */
async function settle(page: Page, want: string, ms = 6000) {
  await page
    .waitForURL((u) => new URL(u).pathname.replace(/(.)\/$/, '$1') === want, { timeout: ms })
    .catch(() => {});
  await page.waitForTimeout(250);
}

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
  await expect(bar.getByRole('link'), 'one tab per destination').toHaveCount(NAV_ITEMS.length);
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
  expect(where(page)).toBe('/resources');
  await expect(bar.getByRole('link', { name: 'Templates' })).toHaveAttribute('aria-current', 'page');

  await bar.getByRole('link', { name: 'Contact' }).click();
  await page.waitForTimeout(900);
  expect(where(page)).toBe('/contact');
});

test('desktop keeps the top nav and shows no tab bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  await expect(page.locator('nav[aria-label="Primary"]')).toBeHidden();
  await expect(page.locator('nav').first().getByRole('button', { name: 'WhatsApp Us — message Preqal' }),
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

test('a sideways swipe walks every tab in the bar', async () => {
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
    const path = () => where(page);

    await open(page);
    const tabs = NAV_ITEMS.map((t) => t.path);
    expect(path(), 'the walk starts at the first tab').toBe(tabs[0]);

    for (let n = 1; n < tabs.length; n++) {
      await swipe(0.8, 0.2);
      await settle(page, tabs[n]);
      expect(path(), `swiping left should reach ${tabs[n]}`).toBe(tabs[n]);
    }

    await swipe(0.8, 0.2);
    expect(path(), 'the last tab does not wrap around').toBe(tabs[tabs.length - 1]);

    for (let n = tabs.length - 2; n >= 0; n--) {
      await swipe(0.2, 0.8);
      await settle(page, tabs[n]);
      expect(path(), `swiping right should reach ${tabs[n]}`).toBe(tabs[n]);
    }

    await swipe(0.2, 0.8);
    expect(path(), 'the first tab does not wrap around').toBe(tabs[0]);
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
    /* Deliberately not starting at home: this test needs the DESTINATION to run
       as a deck so it can also prove the deck did not advance, and the tab after
       home (/blog) is an ordinary scrolling page with no deck at all. */
    const tabs = NAV_ITEMS.map((t) => t.path);
    const start = '/resources';
    const dest = tabs[tabs.indexOf(start) + 1];
    await open(page, start);

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
    /* Same wait the two walks use. A flat delay here let a dropped first
       gesture read as 'the router ignored a sideways swipe', which is a claim
       about the behaviour rather than about the timing. */
    await settle(page, dest);

    /* Derived, not named: the old version froze this to a three-tab era and
       went red the day a fourth tab was added. */
    expect(where(page), 'the sideways intent wins').toBe(dest);

    /* By position, not by slide title. Asking "is the active slide still the
       first one" says exactly what this test means, and keeps saying it when a
       slide is retitled or reordered. */
    const deck = await page.evaluate(() => {
      const secs = Array.from(document.querySelectorAll('main section'));
      return {
        count: secs.length,
        active: secs.findIndex((x) => x.getAttribute('aria-hidden') === 'false'),
      };
    });
    expect(deck.count, `${dest} must run as a deck for this to mean anything`).toBeGreaterThan(1);
    expect(deck.active, 'and the deck it arrived on did not also advance').toBe(0);
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

    expect(where(page), 'a vertical swipe must not change page').toBe('/');
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

/* All three pages run as a deck at every width, so the footer is the last
   slide everywhere and must sit identically on each. */
/* Every deck page, which is not every nav destination: /blog is an ordinary
   scrolling article with no deck and no footer slide, so it has nothing to
   compare here. */
test('the footer slide is the same on every deck page', async ({ page }) => {
  test.setTimeout(180_000);
  /* No step count: the footer is the LAST slide, so walk until the deck says it
     is there. The old version pressed a hardcoded 7/5/3 times with a flat 620ms
     wait, which froze the counts to one era of the decks and lost a slide
     whenever a press landed slow — the failure read 'Send a message' instead of
     'Contact & info', which looks like a footer bug and is really a dropped
     keystroke. */
  const readFooter = async (path: string) => {
    await open(page, path);
    const slides = await page.evaluate(() => document.querySelectorAll('main section').length);
    expect(slides, `${path} should run as a deck`).toBeGreaterThan(1);
    for (let i = 1; i < slides; i++) {
      await page.keyboard.press('ArrowDown');
      await page
        .waitForFunction(
          (want) =>
            Array.from(document.querySelectorAll('main section')).findIndex(
              (s) => s.getAttribute('aria-hidden') === 'false',
            ) >= want,
          i,
          { timeout: 6000 },
        )
        .catch(() => {});
    }
    /* Wait for the slide to stop moving, rather than for a fixed stretch and
       hope. These numbers are compared across pages down to the pixel, and the
       deck arrives on a spring: sampled mid-settle, home read a scale of 1 and
       the next page 0.999868 — the same layout caught at two different
       instants. */
    await page
      .waitForFunction(
        () => {
          const fit = document.querySelector('main section[aria-hidden="false"] .deck-fit');
          if (!fit) return false;
          const now = getComputedStyle(fit).transform;
          const w = window as unknown as { __lastFit?: string; __fitStill?: number };
          w.__fitStill = now === w.__lastFit ? (w.__fitStill ?? 0) + 1 : 0;
          w.__lastFit = now;
          return (w.__fitStill ?? 0) >= 3;
        },
        undefined,
        { timeout: 8000, polling: 120 },
      )
      .catch(() => {});
    await page.waitForTimeout(250);
    return page.evaluate(() => {
      const sec = document.querySelector('main section[aria-hidden="false"]')!;
      const sr = sec.getBoundingClientRect();
      const fit = sec.querySelector('.deck-fit') as HTMLElement;
      const fr = fit.getBoundingClientRect();
      return {
        label: sec.getAttribute('aria-label'),
        slide: Math.round(sr.height),
        content: Math.round(fr.height),
        top: Math.round(fr.top - sr.top),
        scale: Math.round(new DOMMatrixReadOnly(getComputedStyle(fit).transform).a * 1000) / 1000,
      };
    });
  };

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width > 1024 ? 900 : 844 });
    const home = await readFooter('/');
    const templates = await readFooter('/resources');
    const contact = await readFooter('/contact');

    for (const [name, got] of [['templates', templates], ['contact', contact]] as const) {
      expect(got.label, `${name} ends on the footer at ${width}px`).toBe('Contact & info');
      expect(got.slide, `${name} slide height matches home`).toBe(home.slide);
      expect(got.content, `${name} footer height matches home`).toBe(home.content);
      expect(got.top, `${name} footer sits where home's does`).toBe(home.top);
      expect(got.scale, `${name} is scaled like home`).toBe(home.scale);
    }
  }
});

test('desktop runs the same deck as the phone, footer slide and all', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ['/resources', '/contact']) {
    await open(page, path);
    // A deck, not an ordinary scrolling page.
    await expect(page.locator('main .relative.w-full.overflow-hidden')).toHaveCount(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1),
      `${path} does not scroll as a page`,
    ).toBe(false);
    // And exactly one footer — the slide's, not a second global one.
    await expect(page.locator('footer'), `${path} carries one footer`).toHaveCount(1);
  }
});

test('the arrow keys walk every tab in the bar, in order', async ({ page }) => {
  /* Derived from NAV_ITEMS, deliberately. The previous version of this test
     named /, /resources and /contact by hand, so when the Journal joined the
     bar the test kept passing while the tab itself could not be reached by
     arrow or swipe. A test that hardcodes the destinations cannot notice a new
     one going missing. */
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const at = () => where(page);

  const forward = NAV_ITEMS.map((i) => i.path);
  expect(forward.length, 'the bar should carry more than one tab').toBeGreaterThan(1);
  expect(at(), 'the walk starts at the first tab').toBe(forward[0]);

  for (let i = 1; i < forward.length; i++) {
    await page.keyboard.press('ArrowRight');
    await settle(page, forward[i]);
    expect(at(), `right from ${forward[i - 1]} should reach ${forward[i]}`).toBe(forward[i]);
  }

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  expect(at(), 'the last tab does not wrap').toBe(forward[forward.length - 1]);

  for (let i = forward.length - 2; i >= 0; i--) {
    await page.keyboard.press('ArrowLeft');
    await settle(page, forward[i]);
    expect(at(), `left from ${forward[i + 1]} should reach ${forward[i]}`).toBe(forward[i]);
  }

  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(900);
  expect(at(), 'the first tab does not wrap').toBe(forward[0]);
});

test('arrow keys inside a field are left to the field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/contact');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1500);

  const first = page.locator('input[name="first_name"]');
  await first.fill('Stefan');
  await first.press('ArrowLeft');
  await page.waitForTimeout(700);
  expect(where(page), 'the caret moved, not the page').toBe('/contact');
});
