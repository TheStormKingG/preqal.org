import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SERVICE_PAGES } from '../../pages/ServiceLanding';
import { WHATSAPP_OPTIONS } from '../../components/WhatsAppContact';
import { routeMeta } from '../../scripts/route-meta.mjs';

/* Every hand-written list that enumerates services and fails silently when one
   is missing. None of them derives from SERVICE_PAGES. Each is asserted
   separately: a combined assertion stops at the first failure, so the later
   authorities would never be exercised. */
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

/* Boundary match, not containment. `toContain('/services/risk')` is satisfied
   by the existing `/services/risk-scan`, so a slug that is a prefix of another
   passes every authority while appearing in none of them. The delimiter after
   the slug differs per file (`'` in the TS/JS lists, `)` in the markdown
   links), so the assertion is "not followed by a slug character". */
const mentions = (src: string, slug: string) =>
  new RegExp(`/services/${slug}(?![a-z0-9-])`).test(src);

describe('every service slug reaches every authority', () => {
  const slugs = SERVICE_PAGES.map((p) => p.slug);

  it('SERVICE_PAGES is non-empty', () => {
    // Guards the assertions below: each iterates `slugs`, and all of them pass
    // vacuously over an empty array.
    expect(slugs.length).toBeGreaterThan(0);
  });

  it('each waKey has a WHATSAPP_OPTIONS row', () => {
    const keys = WHATSAPP_OPTIONS.map((o) => o.key);
    for (const p of SERVICE_PAGES) {
      expect(keys, `${p.slug}: waKey '${p.waKey}' has no WHATSAPP_OPTIONS row, so whatsAppLink falls back to the first option`).toContain(p.waKey);
    }
  });

  it('each slug is in the vite prerender list', () => {
    const src = read('vite.config.ts');
    for (const slug of slugs) {
      expect(mentions(src, slug), `${slug}: absent from vite.config.ts prerender paths`).toBe(true);
    }
  });

  it('each slug is in generate-sitemap.js', () => {
    const src = read('scripts/generate-sitemap.js');
    for (const slug of slugs) {
      expect(mentions(src, slug), `${slug}: absent from scripts/generate-sitemap.js`).toBe(true);
    }
  });

  it('each slug has a route-meta entry', () => {
    /* Read structurally, not as text. `/services/<slug>` occurs twice per entry
       — once as the key, once inside `canonical` — so an entry filed under a
       mistyped key but with a correct canonical satisfies a text search while
       being invisible to every real consumer, all of which iterate the keys. */
    const keys = Object.keys(routeMeta);
    for (const slug of slugs) {
      expect(keys, `${slug}: absent from scripts/route-meta.mjs, so it is never prerendered and gets no a11y test`).toContain(`/services/${slug}`);
    }
  });

  it('each slug is linked from the footer journey list', () => {
    const src = read('components/Footer.tsx');
    for (const slug of slugs) {
      expect(mentions(src, slug), `${slug}: absent from the Footer journey array, so it has no site-wide link — /services is in neither nav bar`).toBe(true);
    }
  });

  it('each slug is listed in public/llms.txt', () => {
    const src = read('public/llms.txt');
    for (const slug of slugs) {
      expect(mentions(src, slug), `${slug}: absent from public/llms.txt, so the machine-readable service catalogue omits it`).toBe(true);
    }
  });

  it('each slug is listed in public/llms-full.txt', () => {
    const src = read('public/llms-full.txt');
    for (const slug of slugs) {
      expect(mentions(src, slug), `${slug}: absent from public/llms-full.txt, so the machine-readable service catalogue omits it`).toBe(true);
    }
  });
});
