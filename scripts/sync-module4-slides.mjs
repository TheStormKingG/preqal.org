/**
 * Module 4 → public/e-courses/modules/risk-based-thinking/slides/
 * Default: ./Module-4-Risk-Based-Thinking (repo root), else ~/Downloads/Module-4-Risk-Based-Thinking
 * Override: MODULE4_SLIDES_DIR=/path npm run sync-module4-slides
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';
import { resolveSlideSourceDir } from './lib/resolveSlideSourceDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/risk-based-thinking/slides');
const PUBLIC_PREFIX = '/e-courses/modules/risk-based-thinking/slides';
const WORKSPACE = 'docs/course-content/Module-4-Risk-Based-Thinking';
const srcDir = resolveSlideSourceDir({
  root,
  envValue: process.env.MODULE4_SLIDES_DIR,
  workspaceDirName: WORKSPACE,
  downloadsDirName: WORKSPACE,
});

syncRasterSlidesFromDir({
  logTag: 'sync-module4-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
