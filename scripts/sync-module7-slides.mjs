/**
 * Module 7 → public/e-courses/modules/monitoring-measurement/slides/
 * Default: ./Module-7-Monitoring-Measurement-and-Data (repo root), else ~/Downloads/Module-7-Monitoring-Measurement-and-Data
 * Override: MODULE7_SLIDES_DIR=/path npm run sync-module7-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/monitoring-measurement/slides');
const PUBLIC_PREFIX = '/e-courses/modules/monitoring-measurement/slides';
const WORKSPACE = 'Module-7-Monitoring-Measurement-and-Data';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE7_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module7-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
