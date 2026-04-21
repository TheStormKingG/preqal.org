/**
 * Module 1 → public/e-courses/modules/ms-really/slides/
 * Default: ~/Downloads/Module-1-What-is-a-Management-System-Really
 * Override: MODULE1_SLIDES_DIR=/path npm run sync-module1-slides
 */
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { syncRasterSlidesFromDir } from './lib/syncRasterSlidesFromDir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT_DIR = path.join(root, 'public/e-courses/modules/ms-really/slides');
const PUBLIC_PREFIX = '/e-courses/modules/ms-really/slides';
const DEFAULT_SRC = path.join(os.homedir(), 'Downloads', 'Module-1-What-is-a-Management-System-Really');
const srcDir = process.env.MODULE1_SLIDES_DIR || DEFAULT_SRC;

syncRasterSlidesFromDir({
  logTag: 'sync-module1-slides',
  srcDir,
  outDir: OUT_DIR,
  publicUrlPrefix: PUBLIC_PREFIX,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
