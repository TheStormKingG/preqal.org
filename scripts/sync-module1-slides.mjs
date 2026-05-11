/**
 * Module 1 → public/e-courses/modules/ms-really/slides/
 * Default: ./Module-1-What-is-a-Management-System-Really if present, else ~/Downloads/…
 * Override: MODULE1_SLIDES_DIR=/path npm run sync-module1-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/ms-really/slides');
const PUBLIC_PREFIX = '/e-courses/modules/ms-really/slides';
const WORKSPACE = 'docs/course-content/Module-1-What-is-a-Management-System-Really';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE1_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module1-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
