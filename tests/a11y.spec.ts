import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

/* The accessibility contract, measured in a browser against the dev server.
   Each test is one finding from the 2026-09-08 audit of the live site, kept
   here so the fix cannot quietly come undone: contrast is computed from the
   rendered styles, the Tab order is walked, the form is submitted empty, and
   the text is enlarged to 200% — never inferred from class names. */

/* Installed into the page by CONTRAST_HELPERS below; declared here for the type-checker. */
declare function __rgb(color: string): number[];
declare function __ratio(a: number[], b: number[]): number;

const AXE = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const PAGES = ['/', '/resources/', '/contact/'] as const;
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;

async function open(page: Page, path: string, vp: { width: number; height: number }) {
  await page.setViewportSize(vp);
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: /Decline/i });
  await decline.click({ timeout: 2500 }).catch(() => {});
  await decline.waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

/* Contrast the way WCAG defines it, from colours the browser has already
   resolved — a canvas parses any syntax Tailwind emits, oklch included. */
const CONTRAST_HELPERS = `
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  window.__rgb = (s) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  window.__ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
`;

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  for (const path of PAGES) {
    test(`axe finds no WCAG 2.1 AA violation — ${path} @${vpName}`, async ({ page }) => {
      test.setTimeout(90_000);
      await open(page, path, vp);
      await page.addScriptTag({ content: AXE });
      const result = await page.evaluate(() =>
        // @ts-expect-error axe is injected above
        axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }),
      );
      const violations = (result.violations as { id: string; impact: string; nodes: { target: string[] }[] }[]).map(
        (v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`,
      );
      expect(violations, 'violations').toEqual([]);
    });

    test(`nothing tabbable hides inside an aria-hidden slide — ${path} @${vpName}`, async ({ page }) => {
      test.setTimeout(90_000);
      await open(page, path, vp);
      /* Inactive slides are inert, so a screen reader and the Tab key agree
         about what is on the page. */
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')].filter(
          (e) => e.tabIndex >= 0 && e.closest('[aria-hidden="true"]') && !e.closest('[inert]'),
        ).length,
      );
      expect(hidden, 'focusable elements inside aria-hidden without inert').toBe(0);

      // And a Tab walk never lands in one.
      await page.evaluate(() => document.body.focus());
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        const inHidden = await page.evaluate(() => {
          const e = document.activeElement;
          return !!(e && e !== document.body && e.closest('[aria-hidden="true"]'));
        });
        expect(inHidden, `Tab stop ${i} landed inside aria-hidden`).toBe(false);
        if (await page.evaluate(() => document.activeElement === document.body)) break;
      }
    });
  }
}

test('text on the page ground clears 4.5:1, and CTA labels clear it on the lighter end of the amber', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/', VIEWPORTS.desktop);
  await page.addScriptTag({ content: CONTRAST_HELPERS });
  const fails = await page.evaluate(() => {
    const out: string[] = [];
    const ground = __rgb(getComputedStyle(document.body).backgroundColor);
    // Body copy and the small labels, as rendered.
    for (const el of document.querySelectorAll<HTMLElement>('main p, main span, main label, footer p, footer a, nav a span')) {
      if (!el.getClientRects().length || !el.textContent?.trim()) continue;
      const cs = getComputedStyle(el);
      let e: HTMLElement | null = el; let bg: string | null = null;
      while (e && e !== document.documentElement) { const b = getComputedStyle(e).backgroundColor; const bi = getComputedStyle(e).backgroundImage; if (/gradient/.test(bi)) { bg = 'gradient'; break; } if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) { bg = b; break; } e = e.parentElement; }
      if (bg === 'gradient') continue; // handled below
      const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      const r = __ratio(__rgb(cs.color), bg ? __rgb(bg) : ground);
      if (r < need) out.push(`${r.toFixed(2)}:1 (${Math.round(size)}px) "${el.textContent!.trim().slice(0, 40)}"`);
    }
    // Labels on the amber gradient, against its lighter stop.
    for (const el of document.querySelectorAll<HTMLElement>('button, a')) {
      const bi = getComputedStyle(el).backgroundImage; if (!/gradient/.test(bi)) continue;
      const stops = [...bi.matchAll(/rgba?\([^)]+\)|#[0-9a-f]{3,8}|oklch\([^)]+\)/gi)].map((m) => __rgb(m[0]));
      const label = el.querySelector('span') ?? el;
      const r = Math.min(...stops.map((s) => __ratio(__rgb(getComputedStyle(label).color), s)));
      if (r < 4.5) out.push(`${r.toFixed(2)}:1 on amber "${el.textContent!.trim().slice(0, 30)}"`);
    }
    return [...new Set(out)];
  });
  expect(fails, 'text below the AA ratio').toEqual([]);
});

test('every focus ring reads at least 3:1 against what it sits on', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/', VIEWPORTS.desktop);
  await page.addScriptTag({ content: CONTRAST_HELPERS });
  await page.evaluate(() => document.body.focus());
  const weak: string[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      if (cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) < 2) return { what: e.textContent?.trim().slice(0, 30), ratio: 0 };
      // The ring sits on the element's own fill (offset inside its shadow halo) and on the page ground.
      const ground = __rgb(getComputedStyle(document.body).backgroundColor);
      const own = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)/.test(cs.backgroundColor) ? __rgb(cs.backgroundColor) : ground;
      const ring = __rgb(cs.outlineColor);
      return { what: e.textContent?.trim().slice(0, 30), ratio: Math.min(__ratio(ring, own), __ratio(ring, ground)) };
    });
    if (!r) break;
    if (r.ratio < 3) weak.push(`${r.what}: ${r.ratio.toFixed(2)}:1`);
  }
  expect(weak, 'focus rings under 3:1').toEqual([]);
});

test('the contact form labels every control and names each problem on an empty submit', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/contact/', VIEWPORTS.desktop);
  for (let i = 0; i < 3; i++) {
    if (await page.evaluate(() => !!document.querySelector('main section[aria-hidden="false"] form'))) break;
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(800);
  }
  const unlabelled = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>('form input:not([type=hidden]):not([type=checkbox]), form select, form textarea')]
      .filter((f) => f.getClientRects().length > 0)
      .filter((f) => !(f.labels && f.labels.length) && !f.getAttribute('aria-label') && !f.getAttribute('aria-labelledby'))
      .map((f) => f.name || f.id || f.type),
  );
  expect(unlabelled, 'controls with no accessible label').toEqual([]);

  await page.getByRole('button', { name: /Send Message/i }).click();
  await page.waitForTimeout(600);
  const errors = await page.evaluate(() => {
    const invalid = [...document.querySelectorAll<HTMLElement>('form [aria-invalid="true"]')];
    const described = invalid.filter((f) => {
      const id = f.getAttribute('aria-describedby');
      return id && document.getElementById(id)?.textContent?.trim();
    });
    const live = [...document.querySelectorAll('[aria-live], [role=alert], [role=status]')].map((e) => e.textContent?.trim()).filter(Boolean);
    return { invalid: invalid.length, described: described.length, live };
  });
  expect(errors.invalid, 'fields marked aria-invalid').toBeGreaterThanOrEqual(6);
  expect(errors.described, 'invalid fields with a linked error message').toBe(errors.invalid);
  expect(errors.live.join(' '), 'an announced summary').toMatch(/\d|field|fill|check/i);
  // Focus goes to the first problem, so a keyboard user is taken to it.
  const focused = await page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute('name'));
  expect(focused).toBe('first_name');
});

test('at 200% text every slide can still be read to the end', async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of PAGES) {
    await open(page, path, VIEWPORTS.desktop);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await page.waitForTimeout(1200);
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main section.deck-slide')]
        .filter((s) => s.scrollHeight > s.clientHeight + 4 && !/auto|scroll/.test(getComputedStyle(s).overflowY))
        .map((s) => s.getAttribute('aria-label')),
    );
    expect(clipped, `${path}: slides that overflow with no way to scroll`).toEqual([]);
  }
});

test('a skip link is the first Tab stop and lands on the main content', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/', VIEWPORTS.desktop);
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.trim())).toMatch(/skip to content/i);
  await page.keyboard.press('Enter');
  const landed = await page.evaluate(() => { const e = document.activeElement; return !!e && (e.tagName === 'MAIN' || !!e.closest('main')); });
  expect(landed, 'focus moved into main').toBe(true);
});

test('a slide change is announced, and moves keyboard focus with it', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/', VIEWPORTS.desktop);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(1000);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('[aria-live]')].map((e) => e.textContent).join(' '))).toMatch(/2 of \d/);
  const inActive = await page.evaluate(() => !!document.activeElement?.closest('main section[aria-hidden="false"]'));
  expect(inActive, 'focus is inside the slide that just opened').toBe(true);
});

test('landmarks: one header, uniquely named navs, buttons with a type', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, '/contact/', VIEWPORTS.desktop);
  const l = await page.evaluate(() => ({
    header: document.querySelectorAll('header').length,
    navNames: [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label') || ''),
    untyped: [...document.querySelectorAll('button:not([type])')].length,
  }));
  expect(l.header).toBe(1);
  expect(l.navNames.every(Boolean) && new Set(l.navNames).size === l.navNames.length, `nav labels ${JSON.stringify(l.navNames)}`).toBe(true);
  expect(l.untyped, 'buttons without an explicit type').toBe(0);
});
