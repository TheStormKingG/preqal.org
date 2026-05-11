/**
 * Module 5 → public/e-courses/modules/documentation-works/slides/
 * Default: ./Module-5-Documentation-That-Works (repo root), else ~/Downloads/Module-5-Documentation-That-Works
 * Override: MODULE5_SLIDES_DIR=/path npm run sync-module5-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/documentation-works/slides');
const PUBLIC_PREFIX = '/e-courses/modules/documentation-works/slides';
const WORKSPACE = 'docs/course-content/Module-5-Documentation-That-Works';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE5_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module5-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
