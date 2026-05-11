/**
 * Module 9 → public/e-courses/modules/continual-improvement/slides/
 * Default: ./Module-9-Continual-Improvement-and-Business-Performance (repo root), else ~/Downloads/Module-9-Continual-Improvement-and-Business-Performance
 * Override: MODULE9_SLIDES_DIR=/path npm run sync-module9-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/continual-improvement/slides');
const PUBLIC_PREFIX = '/e-courses/modules/continual-improvement/slides';
const WORKSPACE = 'docs/course-content/Module-9-Continual-Improvement-and-Business-Performance';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE9_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module9-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
