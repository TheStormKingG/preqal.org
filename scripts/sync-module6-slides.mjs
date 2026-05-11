/**
 * Module 6 → public/e-courses/modules/people-drive-quality/slides/
 * Default: ./Module-6-People-Drive-Quality (repo root), else ~/Downloads/Module-6-People-Drive-Quality
 * Override: MODULE6_SLIDES_DIR=/path npm run sync-module6-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/people-drive-quality/slides');
const PUBLIC_PREFIX = '/e-courses/modules/people-drive-quality/slides';
const WORKSPACE = 'docs/course-content/Module-6-People-Drive-Quality';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE6_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module6-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
