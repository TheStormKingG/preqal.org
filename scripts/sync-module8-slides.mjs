/**
 * Module 8 → public/e-courses/modules/audits-capa/slides/
 * Default: ./Module-8-Audits-and-Corrective-Action-CAPA (repo root), else ~/Downloads/Module-8-Audits-and-Corrective-Action-CAPA
 * Override: MODULE8_SLIDES_DIR=/path npm run sync-module8-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/audits-capa/slides');
const PUBLIC_PREFIX = '/e-courses/modules/audits-capa/slides';
const WORKSPACE = 'docs/course-content/Module-8-Audits-and-Corrective-Action-CAPA';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE8_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module8-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
