import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SERVICE_PAGES } from '../../pages/ServiceLanding';
import { WHATSAPP_OPTIONS } from '../../components/WhatsAppContact';

/* Four lists must gain a slug whenever SERVICE_PAGES does, and none of them
   derives from it. Each is asserted separately: a combined assertion stops at
   the first failure, so the later authorities would never be exercised. */
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

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
      expect(src, `${slug}: absent from vite.config.ts prerender paths`).toContain(`/services/${slug}`);
    }
  });

  it('each slug is in generate-sitemap.js', () => {
    const src = read('scripts/generate-sitemap.js');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from scripts/generate-sitemap.js`).toContain(`/services/${slug}`);
    }
  });

  it('each slug has a route-meta entry', () => {
    const src = read('scripts/route-meta.mjs');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from scripts/route-meta.mjs, so it is never prerendered and gets no a11y test`).toContain(`/services/${slug}`);
    }
  });
});
