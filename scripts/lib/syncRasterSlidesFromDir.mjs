/**
 * Builds a raster-only slide manifest from numbered PNGs in a folder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { resizeWebpCropBottom, cropBottomPx } from './slideImageCrop.mjs';

export function naturalPngOrder(files) {
  return files
    .filter((f) => /\.png$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(String(a.match(/^(\d+)/)?.[1] ?? '0'), 10);
      const nb = parseInt(String(b.match(/^(\d+)/)?.[1] ?? '0'), 10);
      return na - nb;
    });
}

/**
 * @param {{ logTag: string; srcDir: string; outDir: string; publicUrlPrefix: string; minDwellSeconds?: number }} opts
 */
export async function syncRasterSlidesFromDir(opts) {
  const { logTag, srcDir, outDir, publicUrlPrefix, minDwellSeconds = 18 } = opts;

  if (!fs.existsSync(srcDir)) {
    console.error(`[${logTag}] Source folder not found:`, srcDir);
    process.exit(1);
  }

  const files = naturalPngOrder(fs.readdirSync(srcDir));
  if (files.length === 0) {
    console.error(`[${logTag}] No PNG files in`, srcDir);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const old of fs.readdirSync(outDir)) {
    if (/\.layers\.json$/.test(old) || /-rId\d+\.webp$/.test(old) || /^slide-\d{2}\.(webp|png)$/i.test(old)) {
      fs.rmSync(path.join(outDir, old), { force: true });
    }
  }

  console.log(`[${logTag}] Cropping bottom strip (px):`, cropBottomPx());

  const urls = [];
  let i = 1;
  for (const f of files) {
    const stem = `slide-${String(i).padStart(2, '0')}`;
    const outPath = path.join(outDir, `${stem}.webp`);
    await resizeWebpCropBottom(path.join(srcDir, f), outPath);
    urls.push(`${publicUrlPrefix}/${stem}.webp`);
    console.log(`[${logTag}]`, stem, '<-', f);
    i += 1;
  }

  const manifest = { minDwellSeconds, slides: urls };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`[${logTag}] Wrote manifest.json with`, urls.length, 'slides');
}
