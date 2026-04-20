/**
 * Re-crops existing slide-NN.webp under public/…/slides (bottom strip only).
 * Use after changing CROP_BOTTOM_PX without re-syncing from PNGs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cropExistingWebpBottom, cropBottomPx } from './lib/slideImageCrop.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public/e-courses/modules/ms-really/slides');

async function main() {
  const strip = cropBottomPx();
  console.log('[crop-module1-watermark] CROP_BOTTOM_PX =', strip);
  const names = fs.readdirSync(OUT_DIR).filter((n) => /^slide-\d{2}\.webp$/i.test(n));
  names.sort();
  for (const n of names) {
    const p = path.join(OUT_DIR, n);
    await cropExistingWebpBottom(p);
    console.log('[crop-module1-watermark]', n);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
