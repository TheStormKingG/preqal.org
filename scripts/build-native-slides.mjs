/**
 * From PPTX: exports per-slide layer JSON (text, images, rects positioned like the deck)
 * plus WebP assets for embedded pictures. Writes manifest.json for the e-course player.
 * Requires: unzip, sharp, fast-xml-parser (devDependencies).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSlideLayersAsync, readSlideSizeEmu } from './lib/pptxSlideLayers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PPTX = path.join(root, 'slide-source/ms-really/slides.pptx');
const OUT_DIR = path.join(root, 'public/e-courses/modules/ms-really/slides');
const TMP = path.join(root, 'node_modules/.cache/extract-slides-ms-really');
const PUBLIC_URL_DIR = '/e-courses/modules/ms-really/slides';

function cleanGeneratedAssets() {
  if (!fs.existsSync(OUT_DIR)) return;
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (/^slide-\d{2}(\.layers\.json|\.webp|-rId\d+\.webp)$/.test(name)) {
      fs.rmSync(path.join(OUT_DIR, name), { force: true });
    }
  }
}

async function mainAsync() {
  if (!fs.existsSync(PPTX)) {
    console.warn('[build-native-slides] Skip: PPTX not found at', PPTX);
    return;
  }

  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  cleanGeneratedAssets();

  execSync(`unzip -q -o "${PPTX}" -d "${TMP}"`, { stdio: 'inherit' });

  const presXml = path.join(TMP, 'ppt', 'presentation.xml');
  const { cx: slideCx, cy: slideCy } = readSlideSizeEmu(presXml);

  const slideEntries = [];
  let n = 1;
  for (;;) {
    const slideXml = path.join(TMP, 'ppt', 'slides', `slide${n}.xml`);
    const relsPath = path.join(TMP, 'ppt', 'slides', '_rels', `slide${n}.xml.rels`);
    if (!fs.existsSync(slideXml) || !fs.existsSync(relsPath)) break;

    const stem = `slide-${String(n).padStart(2, '0')}`;
    const layersPath = path.join(OUT_DIR, `${stem}.layers.json`);

    const layerDoc = await extractSlideLayersAsync({
      slideXmlPath: slideXml,
      relsPath,
      slideCx,
      slideCy,
      outDir: OUT_DIR,
      slideStem: stem,
      publicUrlDir: PUBLIC_URL_DIR,
    });

    fs.writeFileSync(layersPath, JSON.stringify(layerDoc, null, 2));
    slideEntries.push({ layers: `${PUBLIC_URL_DIR}/${stem}.layers.json` });
    console.log('[build-native-slides]', `${stem}.layers.json`, '—', layerDoc.layers.length, 'layers');
    n += 1;
  }

  if (slideEntries.length === 0) {
    console.error('[build-native-slides] No slides extracted');
    process.exit(1);
  }

  const manifest = {
    minDwellSeconds: 18,
    slideSize: { cx: slideCx, cy: slideCy },
    slides: slideEntries,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('[build-native-slides] Wrote manifest.json with', slideEntries.length, 'slides');
}

mainAsync().catch((e) => {
  console.error(e);
  process.exit(1);
});
