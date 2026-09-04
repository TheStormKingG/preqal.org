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

  test(`${path} runs the same deck on desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, path);
    const rows = await readSlides(page);
    expect(rows, `${path} is a deck at desktop width too`).not.toBeNull();
    expect(rows!.length, 'the same slides the phone gets').toBeGreaterThan(3);
    for (const row of rows!) {
      if (row.scrollable) continue;
      expect(row.over, `${row.label} overflows by ${row.over}px`).toBeLessThanOrEqual(1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1),
      'and the page itself does not scroll',
    ).toBe(false);
  });
}

/* Phones only: from lg up the two halves stand side by side as columns on one
   slide, so there is nothing to scroll. 375x667 is the case that bites — the
   second half is taller than that screen, so unless each half is pinned to
   exactly one slide the form becomes three views and costs a dead gesture. */
for (const [w, h] of [[390, 844], [375, 667]] as const) {
test(`the contact form reads as two exact halves before the deck moves on — ${w}x${h}`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h });
  await open(page, '/contact');
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

/* A desktop slide holds more than a phone one, so Templates falls 1 / 3 / 2
   there — the hero carrying the workbook, the ZIP closing the last run — while
   a phone still takes them two at a time. */
const templateShape = (page: Page) =>
  page.evaluate(() => {
    const wrap = document.querySelector('main .relative.w-full.overflow-hidden')!;
    return Array.from(wrap.firstElementChild!.querySelectorAll(':scope > section')).map((sec) => ({
      label: sec.getAttribute('aria-label') ?? '',
      // Each template is a card with its own download control.
      downloads: sec.querySelectorAll('a[download]').length,
      text: (sec as HTMLElement).innerText,
    }));
  });

test('desktop lays the templates out 1 / 3 / 2 and closes on the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/resources');
  const slides = await templateShape(page);

  expect(slides.map((s) => s.label)).toEqual([
    'Free templates',
    'Templates 2 to 4',
    'Templates 5 and 6',
    'Contact & info',
  ]);
  expect(slides[0].text, 'the hero carries the workbook').toContain('Business Plan Workbook');
  expect(slides[0].downloads, 'one template on the first slide').toBe(1);
  expect(slides[1].downloads, 'three on the second').toBe(3);
  expect(slides[2].downloads, 'two on the third, plus the ZIP').toBe(3);
  expect(slides[2].text).toContain('Want everything at once?');
  expect(slides[3].text, 'and the footer closes it').toContain('All rights reserved');
});

test('a phone still takes the templates two at a time', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/resources');
  const slides = await templateShape(page);

  expect(slides.map((s) => s.label)).toEqual([
    'Free templates',
    'Templates 1 and 2',
    'Templates 3 and 4',
    'Templates 5 and 6',
    'Take it further',
    'Contact & info',
  ]);
  expect(slides[0].downloads, 'the phone hero carries no card').toBe(0);
  for (const i of [1, 2, 3]) expect(slides[i].downloads, `slide ${i} holds two`).toBe(2);
});

test('from lg up the form stands as two columns on one slide', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/contact');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1500);

  const label = await page.evaluate(
    () => document.querySelector('main section[aria-hidden="false"]')?.getAttribute('aria-label') ?? '',
  );
  expect(label).toContain('Send a message');
  await expect(
    page.locator('main section[data-deck-scrollable="true"]'),
    'nothing to scroll — it all fits',
  ).toHaveCount(0);

  // The half that was the first view is now the left column, the second the right.
  const [name, problem, send] = await Promise.all([
    page.locator('input[name="first_name"]').boundingBox(),
    page.locator('select[name="most_pressing_quality_problem"]').boundingBox(),
    page.getByRole('button', { name: /Send Message/i }).boundingBox(),
  ]);
  expect(problem!.x, 'the enquiry sits right of the details').toBeGreaterThan(name!.x + name!.width - 4);
  expect(Math.abs(problem!.y - name!.y), 'both columns start on the same line').toBeLessThan(40);
  expect(send!.y, 'and the whole form is on one screen').toBeLessThan(900);
});

test('the contact details panel is gone from the page', async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await open(page, '/contact');
    const text = await page.evaluate(() => document.querySelector('main')?.textContent ?? '');
    expect(text, `no details panel at ${w}px`).not.toContain('What happens next');
    expect(text).not.toContain('info@preqal.org');
    expect(text).not.toContain('Prefer to jump straight in');
    const labels = await page.evaluate(() => {
      const wrap = document.querySelector('main .relative.w-full.overflow-hidden')!;
      return Array.from(wrap.firstElementChild!.querySelectorAll(':scope > section')).map((s) =>
        s.getAttribute('aria-label'),
      );
    });
    expect(labels).toEqual(['Get in touch', 'Send a message', "Who you'll be talking to", 'Contact & info']);
  }
});
