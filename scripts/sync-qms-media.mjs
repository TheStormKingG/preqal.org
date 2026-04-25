/**
 * Copies QMS module MP4 + quiz docx from repo-root folders into public/e-courses/modules/{id}/.
 * Invoked automatically before `npm run build` (see package.json).
 *
 * Source defaults:
 *   ./QMS Module Videos/Module {n}.mp4
 *   ./QMS Module Quizzes/Module {n} Quiz.docx
 *
 * Env:
 *   SKIP_QMS_MEDIA=1        — skip entirely.
 *   VITE_VIDEO_BASE_URL     — when set, videos are served from a CDN/Supabase Storage so
 *                             local video files are not required; the copy step is skipped.
 *   QMS_VIDEOS_DIR          — override the source videos directory.
 *   QMS_QUIZZES_DIR         — override the source quizzes directory.
 *
 * LFS-aware: if a source video is an LFS pointer file (i.e. LFS objects were not fetched),
 * the copy is skipped with a warning rather than aborting the build.  Quizzes and slides that
 * are already committed to public/ will still be present and built correctly.
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

if (process.env.SKIP_QMS_MEDIA === '1') {
  console.warn('[sync-qms-media] Skipped (SKIP_QMS_MEDIA=1).');
  process.exit(0);
}

const videosDir  = process.env.QMS_VIDEOS_DIR  || path.join(root, 'QMS Module Videos');
const quizzesDir = process.env.QMS_QUIZZES_DIR || path.join(root, 'QMS Module Quizzes');

/** Returns true when the file is a Git LFS pointer stub (not the real object). */
function isLfsPointer(filePath) {
  try {
    const stat = fs.statSync(filePath);
    // LFS pointer files are tiny text files (< 200 bytes)
    if (stat.size > 512) return false;
    const head = fs.readFileSync(filePath, 'utf8');
    return head.startsWith('version https://git-lfs.github.com');
  } catch {
    return false;
  }
}

// ── Video sync (graceful — skipped when LFS objects are not available) ──────

const videoBaseUrl = process.env.VITE_VIDEO_BASE_URL?.trim();
const videosAvailable = fs.existsSync(videosDir);

if (videoBaseUrl) {
  console.log('[sync-qms-media] VITE_VIDEO_BASE_URL is set — videos will be served from CDN; skipping local video copy.');
} else if (!videosAvailable) {
  console.warn('[sync-qms-media] WARNING: "QMS Module Videos" folder not found — video files will not be included in this build.');
  console.warn('[sync-qms-media]          Set VITE_VIDEO_BASE_URL (GitHub secret) to serve videos from Supabase Storage instead.');
}

// ── Quiz sync (required — docx files must be committed or present) ───────────

if (!fs.existsSync(quizzesDir)) {
  console.error('[sync-qms-media] Missing folder:', quizzesDir);
  console.error('Add "QMS Module Quizzes" at the repo root with Module 1 Quiz.docx … Module 9 Quiz.docx.');
  process.exit(1);
}

// ── Copy loop ────────────────────────────────────────────────────────────────

for (const { n, id } of MAP) {
  const outDir = path.join(root, 'public/e-courses/modules', id);
  fs.mkdirSync(outDir, { recursive: true });

  // Video ──────────────────────────────────────────────────────────────────
  if (!videoBaseUrl && videosAvailable) {
    const vSrc  = path.join(videosDir, `Module ${n}.mp4`);
    const vDest = path.join(outDir, 'video.mp4');

    if (!fs.existsSync(vSrc)) {
      console.warn(`[sync-qms-media] WARNING: Missing video source for Module ${n} (${id}) — skipping video copy.`);
    } else if (isLfsPointer(vSrc)) {
      console.warn(`[sync-qms-media] WARNING: Module ${n} video is an LFS pointer stub (LFS objects not fetched) — skipping video copy.`);
      console.warn('[sync-qms-media]          Set VITE_VIDEO_BASE_URL in GitHub Secrets to serve videos from Supabase Storage.');
    } else {
      fs.copyFileSync(vSrc, vDest);
      console.log(`[sync-qms-media] Module ${n} (${id}) -> video.mp4`);
    }
  }

  // Quiz ───────────────────────────────────────────────────────────────────
  const qSrc  = path.join(quizzesDir, `Module ${n} Quiz.docx`);
  const qDest = path.join(outDir, 'quiz.docx');

  if (!fs.existsSync(qSrc)) {
    console.error(`[sync-qms-media] Missing quiz: ${qSrc}`);
    process.exit(1);
  }
  fs.copyFileSync(qSrc, qDest);
  console.log(`[sync-qms-media] Module ${n} (${id}) -> quiz.docx`);
}

console.log('[sync-qms-media] Done.');
