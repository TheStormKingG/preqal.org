import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { routeMeta } from '../../scripts/route-meta.mjs';

/* The social share card. A link pasted into WhatsApp, LinkedIn or iMessage
   shows og:image, and each has its rules: WhatsApp drops to a small thumbnail
   over 300KB, LinkedIn will not render WebP, and all of them show the middle
   square of the picture in the compose box. The cards are committed PNGs drawn
   by scripts/generate-og-cards.py rather than built in CI — the build used to
   draw them with whatever font Ubuntu had — so they have to be in the repo. */

const root = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const local = (url: string) => path.join(root, 'public', decodeURIComponent(new URL(url).pathname));

/* Every card URL the site hands out, wherever it hands it out. */
const referenced = new Set<string>(Object.values(routeMeta).map((m) => m.ogImage));
for (const file of ['seo/seo.ts', 'scripts/route-meta.mjs', 'index.html', 'components/SEO.tsx', 'seo/organizationSchema.ts']) {
  for (const m of read(file).matchAll(/https:\/\/preqal\.org\/og\/[a-z-]+\.[a-z]+|\$\{BASE_URL\}\/og\/[a-z-]+\.[a-z]+/g)) {
    referenced.add(m[0].replace('${BASE_URL}', 'https://preqal.org'));
  }
}

describe('the share cards', () => {
  it('every card the site references is a PNG that exists', () => {
    expect(referenced.size).toBeGreaterThan(0);
    for (const url of referenced) {
      expect(url, url).toMatch(/\.png$/);
      expect(fs.existsSync(local(url)), `${url} is in public/`).toBe(true);
    }
  });

  it('the home card is 1200×630 and under the 300KB WhatsApp limit', async () => {
    const file = local('https://preqal.org/og/home.png');
    const meta = await sharp(file).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
    expect(meta.format).toBe('png');
    expect(fs.statSync(file).size).toBeLessThan(300 * 1024);
  });

  it('the home page, the fallback and the Organization all share the home card', () => {
    expect(read('index.html')).toContain('content="https://preqal.org/og/home.png"');
    expect(read('components/SEO.tsx')).toContain("'https://preqal.org/og/home.png'");
    expect(read('seo/organizationSchema.ts')).toContain("image: 'https://preqal.org/og/home.png'");
  });

  it('no WebP card is left for an old link to find', () => {
    expect(fs.readdirSync(path.join(root, 'public/og')).filter((f) => f.endsWith('.webp'))).toEqual([]);
  });

  it('the build no longer redraws the cards', () => {
    expect(JSON.parse(read('package.json')).scripts.build).not.toMatch(/generate-og/);
  });
});

describe('the favicon badge', () => {
  // Previews fetch /favicon.ico by name; a site with only <link rel="icon"> PNGs shows no badge.
  it('favicon.ico exists and is linked', () => {
    expect(fs.existsSync(path.join(root, 'public/favicon.ico'))).toBe(true);
    expect(read('index.html')).toMatch(/<link rel="(shortcut )?icon" href="\/favicon\.ico"/);
  });
});
