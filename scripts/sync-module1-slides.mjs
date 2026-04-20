/**
 * Copies Module 1 slide images into public/ and writes manifest.json (raster-only deck).
 * Default source: ~/Downloads/Module-1-What-is-a-Management-System-Really
 * Override: MODULE1_SLIDES_DIR=/path/to/folder npm run sync-module1-slides
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/ms-really/slides');
const PUBLIC_PREFIX = '/e-courses/modules/ms-really/slides';

const DEFAULT_SRC = path.join(
  os.homedir(),
  'Downloads',
  'Module-1-What-is-a-Management-System-Really'
);

const srcDir = process.env.MODULE1_SLIDES_DIR || DEFAULT_SRC;

function naturalPngOrder(files) {
  return files
    .filter((f) => /\.png$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(String(a.match(/^(\d+)/)?.[1] ?? '0'), 10);
      const nb = parseInt(String(b.match(/^(\d+)/)?.[1] ?? '0'), 10);
      return na - nb;
    });
}

async function main() {
  if (!fs.existsSync(srcDir)) {
    console.error('[sync-module1-slides] Source folder not found:', srcDir);
    console.error('Set MODULE1_SLIDES_DIR to a folder of numbered PNGs (e.g. 1_Title.png … 10_Outro.png).');
    process.exit(1);
  }

  const files = naturalPngOrder(fs.readdirSync(srcDir));
  if (files.length === 0) {
    console.error('[sync-module1-slides] No PNG files in', srcDir);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const old of fs.readdirSync(OUT_DIR)) {
    if (/\.layers\.json$/.test(old) || /-rId\d+\.webp$/.test(old) || /^slide-\d{2}\.(webp|png)$/i.test(old)) {
      fs.rmSync(path.join(OUT_DIR, old), { force: true });
    }
  }

  const urls = [];
  let i = 1;
  for (const f of files) {
    const stem = `slide-${String(i).padStart(2, '0')}`;
    const outPath = path.join(OUT_DIR, `${stem}.webp`);
    await sharp(path.join(srcDir, f))
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(outPath);
    urls.push(`${PUBLIC_PREFIX}/${stem}.webp`);
    console.log('[sync-module1-slides]', stem, '<-', f);
    i += 1;
  }

  const manifest = { minDwellSeconds: 18, slides: urls };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[sync-module1-slides] Wrote manifest.json with', urls.length, 'slides');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
