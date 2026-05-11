/**
 * Module 2 → public/e-courses/modules/quality-iso-simplified/slides/
 * Default: ./Module-2-Understanding-Quality if present, else ~/Downloads/…
 * Override: MODULE2_SLIDES_DIR=/path npm run sync-module2-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/quality-iso-simplified/slides');
const PUBLIC_PREFIX = '/e-courses/modules/quality-iso-simplified/slides';
const WORKSPACE = 'docs/course-content/Module-2-Understanding-Quality';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE2_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module2-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
