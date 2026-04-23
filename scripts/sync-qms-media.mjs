/**
 * Copies QMS module MP4 + quiz docx from repo-root folders into public/e-courses/modules/{id}/.
 * Invoked automatically before `npm run build` (see package.json).
 *
 * Source defaults:
 *   ./QMS Module Videos/Module {n}.mp4
 *   ./QMS Module Quizzes/Module {n} Quiz.docx
 *
 * Env:
 *   SKIP_QMS_MEDIA=1 — skip entirely (not recommended; site will lack videos unless public files exist).
 *   QMS_VIDEOS_DIR / QMS_QUIZZES_DIR — override source directories.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MAP = [
  { n: 1, id: 'ms-really' },
  { n: 2, id: 'quality-iso-simplified' },
  { n: 3, id: 'process-thinking' },
  { n: 4, id: 'risk-based-thinking' },
  { n: 5, id: 'documentation-works' },
  { n: 6, id: 'people-drive-quality' },
  { n: 7, id: 'monitoring-measurement' },
  { n: 8, id: 'audits-capa' },
  { n: 9, id: 'continual-improvement' },
];

const videosDir = process.env.QMS_VIDEOS_DIR || path.join(root, 'QMS Module Videos');
const quizzesDir = process.env.QMS_QUIZZES_DIR || path.join(root, 'QMS Module Quizzes');

if (process.env.SKIP_QMS_MEDIA === '1') {
  console.warn('[sync-qms-media] Skipped (SKIP_QMS_MEDIA=1).');
  process.exit(0);
}

if (!fs.existsSync(videosDir)) {
  console.error('[sync-qms-media] Missing folder:', videosDir);
  console.error(
    'Add "QMS Module Videos" at the repo root with Module 1.mp4 … Module 9.mp4, then rebuild. Use Git LFS for these files: git lfs track "QMS Module Videos/*.mp4"',
  );
  process.exit(1);
}

if (!fs.existsSync(quizzesDir)) {
  console.error('[sync-qms-media] Missing folder:', quizzesDir);
  console.error('Add "QMS Module Quizzes" at the repo root with Module 1 Quiz.docx … Module 9 Quiz.docx.');
  process.exit(1);
}

for (const { n, id } of MAP) {
  const outDir = path.join(root, 'public/e-courses/modules', id);
  fs.mkdirSync(outDir, { recursive: true });
  const vSrc = path.join(videosDir, `Module ${n}.mp4`);
  const vDest = path.join(outDir, 'video.mp4');
  const qSrc = path.join(quizzesDir, `Module ${n} Quiz.docx`);
  const qDest = path.join(outDir, 'quiz.docx');
  if (!fs.existsSync(vSrc)) {
    console.error('[sync-qms-media] Missing video:', vSrc);
    process.exit(1);
  }
  if (!fs.existsSync(qSrc)) {
    console.error('[sync-qms-media] Missing quiz:', qSrc);
    process.exit(1);
  }
  fs.copyFileSync(vSrc, vDest);
  fs.copyFileSync(qSrc, qDest);
  console.log(`[sync-qms-media] Module ${n} (${id}) -> video.mp4, quiz.docx`);
}
console.log('[sync-qms-media] Done.');
