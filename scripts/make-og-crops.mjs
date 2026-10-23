#!/usr/bin/env node
/*
  Write a 1200x630 share card for each blog photograph that is used as a
  thumbnail. The article variants are 3:2; a share card is closer to 1.91:1,
  and handing a 3:2 image to LinkedIn or WhatsApp lets them crop it wherever
  they like, which is usually through somebody's face.
*/
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/* Accept a base so guide pictures can live beside the guides. */
const BASE = process.env.PHOTO_BASE || 'blog-photos';
const ROOT = `public/${BASE}`;
const wanted = process.argv.slice(2); // slug/name pairs, e.g. my-post/hero

for (const pair of wanted) {
  const [slug, name] = pair.split('/');
  const src = join(ROOT, slug, `${name}-1600.webp`);
  const out = join(ROOT, slug, `${name}-og.jpg`);
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const { size } = await stat(out);
  console.log(`  ${slug}/${name}-og.jpg  ${(size / 1024).toFixed(0)}KB`);
}
