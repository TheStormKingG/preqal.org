/**
 * Copies QMS module MP4 + quiz docx from repo-root folders into public/e-courses/modules/{id}/.
 * Run before local preview/deploy when video.mp4 is gitignored (large files).
 *
 * Source defaults:
 *   ./QMS Module Videos/Module {n}.mp4
 *   ./QMS Module Quizzes/Module {n} Quiz.docx
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

for (const { n, id } of MAP) {
  const outDir = path.join(root, 'public/e-courses/modules', id);
  fs.mkdirSync(outDir, { recursive: true });
  const vSrc = path.join(videosDir, `Module ${n}.mp4`);
  const vDest = path.join(outDir, 'video.mp4');
  const qSrc = path.join(quizzesDir, `Module ${n} Quiz.docx`);
  const qDest = path.join(outDir, 'quiz.docx');
  if (!fs.existsSync(vSrc)) {
    console.error(`[sync-qms-media] Missing video:`, vSrc);
    process.exit(1);
  }
  if (!fs.existsSync(qSrc)) {
    console.error(`[sync-qms-media] Missing quiz:`, qSrc);
    process.exit(1);
  }
  fs.copyFileSync(vSrc, vDest);
  fs.copyFileSync(qSrc, qDest);
  console.log(`[sync-qms-media] Module ${n} (${id}) -> video.mp4, quiz.docx`);
}
console.log('[sync-qms-media] Done.');
