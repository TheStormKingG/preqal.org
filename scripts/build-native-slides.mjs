/**
 * Extracts one raster image per PPTX slide (largest PNG/JPEG in each slide's rels),
 * writes WebP under public/e-courses/modules/{moduleId}/slides/ and manifest.json.
 * Requires: unzip (system), sharp (devDependency).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PPTX = path.join(root, 'public/e-courses/modules/ms-really/slides.pptx');
const OUT_DIR = path.join(root, 'public/e-courses/modules/ms-really/slides');
const TMP = path.join(root, 'node_modules/.cache/extract-slides-ms-really');

async function mainAsync() {
  if (!fs.existsSync(PPTX)) {
    console.warn('[build-native-slides] Skip: PPTX not found at', PPTX);
    return;
  }

  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  execSync(`unzip -q -o "${PPTX}" -d "${TMP}"`, { stdio: 'inherit' });

  const slides = [];
  let n = 1;
  for (;;) {
    const relFile = path.join(TMP, 'ppt', 'slides', '_rels', `slide${n}.xml.rels`);
    if (!fs.existsSync(relFile)) break;

    const xml = fs.readFileSync(relFile, 'utf8');
    const targets = [...xml.matchAll(/Target="\.\.\/media\/([^"]+)"/g)].map((m) => m[1]);
    let bestPath = null;
    let bestSize = 0;
    for (const name of targets) {
      if (!/\.(png|jpe?g)$/i.test(name)) continue;
      const full = path.join(TMP, 'ppt', 'media', path.basename(name));
      if (!fs.existsSync(full)) continue;
      const st = fs.statSync(full);
      if (st.size > bestSize) {
        bestSize = st.size;
        bestPath = full;
      }
    }

    if (!bestPath) {
      console.warn(`[build-native-slides] Slide ${n}: no raster image in rels, skipping`);
      n += 1;
      continue;
    }

    const outName = `slide-${String(n).padStart(2, '0')}.webp`;
    const outPath = path.join(OUT_DIR, outName);
    await sharp(bestPath)
      .resize({ width: 1680, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    console.log('[build-native-slides]', outName, '<-', path.basename(bestPath), `(${bestSize} bytes)`);
    slides.push(`/e-courses/modules/ms-really/slides/${outName}`);
    n += 1;
  }

  if (slides.length === 0) {
    console.error('[build-native-slides] No slides extracted');
    process.exit(1);
  }

  const manifest = { slides, minDwellSeconds: 9 };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[build-native-slides] Wrote manifest.json with', slides.length, 'slides');
}

mainAsync().catch((e) => {
  console.error(e);
  process.exit(1);
});
