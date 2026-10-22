#!/usr/bin/env node
/*
  Pull one free-to-use photograph for a blog post and write the responsive set
  the article renderer expects.

  The blog shipped with SVG diagrams only, and data/blog.ts said why: raster is
  heavy and this volume has repeatedly hit 100%. Photographs are now wanted on
  every post, so the weight has to be managed rather than avoided. A 2400px
  Unsplash JPEG is about 900KB; the avif set below carries the same picture at
  roughly a tenth of that, and nothing full-size is ever committed.

  Usage:
    node scripts/fetch-blog-photo.mjs --slug <post-slug> --id photo-<unsplash-id> \
         --name <basename> [--credit "Name"] [--page "/photos/..."]

  Writes public/blog-photos/<slug>/<basename>-<w>.{avif,webp} plus a jpg
  fallback, and prints the JSON photo block to paste into the post.
*/
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/* The article column is 768px (max-w-3xl); 'wide' breaks out to roughly 1024.
   Two-times those, capped where the source stops being sharp. */
const WIDTHS = [800, 1200, 1600];
const SOURCE_WIDTH = 2400;
const JPEG_FALLBACK_WIDTH = 1200;

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};

const slug = arg('--slug');
const id = arg('--id');
const name = arg('--name');
const credit = arg('--credit', '');
const page = arg('--page', '');

if (!slug || !id || !name) {
  console.error('need --slug, --id and --name');
  process.exit(1);
}

const outDir = join('public', 'blog-photos', slug);
await mkdir(outDir, { recursive: true });

/* Crop to landscape at the source rather than accepting whatever shape the
   photographer shot. A portrait photo in a 768px reading column runs well over
   a thousand pixels tall, pushing the argument off the screen, and the sets are
   half as heavy again for pixels the layout never wanted. 3:2 is the shape the
   rest of the site's photography already uses. */
const ar = arg('--ar', '3:2');
const src =
  `https://images.unsplash.com/${id}` +
  `?w=${SOURCE_WIDTH}&ar=${ar}&fit=crop&crop=entropy&q=85&fm=jpg`;
const res = await fetch(src, { headers: { 'User-Agent': 'PreqalBot/1.0 (+https://preqal.org)' } });
if (!res.ok) {
  console.error(`fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());

const meta = await sharp(buf).metadata();
if (meta.width < 1920) {
  /* "HD and high resolution" is the requirement, so a source that cannot fill
     the largest variant is a failure rather than something to silently upscale. */
  console.error(`source is only ${meta.width}x${meta.height}; need >=1920 wide`);
  process.exit(1);
}

let total = 0;
const written = [];
for (const w of WIDTHS) {
  if (w > meta.width) continue;
  for (const [fmt, opts] of [
    ['avif', { quality: 55, effort: 6 }],
    ['webp', { quality: 78 }],
  ]) {
    const file = join(outDir, `${name}-${w}.${fmt}`);
    await sharp(buf).resize({ width: w, withoutEnlargement: true })[fmt](opts).toFile(file);
    const { size } = await stat(file);
    total += size;
    written.push(`${name}-${w}.${fmt} ${(size / 1024).toFixed(0)}KB`);
  }
}

/* One jpg so the picture still resolves anywhere the modern formats do not. */
const jpg = join(outDir, `${name}-${JPEG_FALLBACK_WIDTH}.jpg`);
await sharp(buf)
  .resize({ width: JPEG_FALLBACK_WIDTH, withoutEnlargement: true })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(jpg);
const { size: jpgSize } = await stat(jpg);
total += jpgSize;
written.push(`${name}-${JPEG_FALLBACK_WIDTH}.jpg ${(jpgSize / 1024).toFixed(0)}KB`);

const ratio = await sharp(buf).metadata();
const block = {
  kind: 'photo',
  id: `${name}-photo`,
  src: `blog-photos/${slug}/${name}`,
  alt: 'TODO: describe what the photograph shows, for a reader who cannot see it',
  caption: 'TODO: one line tying the picture to the argument on the page',
  placement: 'inline',
  width: ratio.width,
  height: ratio.height,
  credit: {
    photographer: credit || 'TODO',
    source: 'Unsplash',
    sourceUrl: page ? `https://unsplash.com${page}` : `https://unsplash.com/photos/${id}`,
    license: 'Unsplash License',
  },
};

console.log(`\nsource ${meta.width}x${meta.height}`);
for (const w of written) console.log('  ' + w);
console.log(`  total ${(total / 1024).toFixed(0)}KB for the set`);
console.log('\n' + JSON.stringify(block, null, 2));

await writeFile(join(outDir, `${name}.credit.json`), JSON.stringify(block.credit, null, 2) + '\n');
