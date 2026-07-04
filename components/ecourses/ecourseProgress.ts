import type { CourseModule } from './types';
import { supabase } from '../../lib/supabaseClient';
import { COURSE_MODULES } from './courseModules';

/** At least 70% correct answers required to mark the module quiz passed (integer-safe for any N). */
export const QUIZ_PASS_NUMERATOR = 7;
export const QUIZ_PASS_DENOMINATOR = 10;

export function quizScoreMeetsPassMark(correct: number, total: number): boolean {
  if (total <= 0) return false;
  return correct * QUIZ_PASS_DENOMINATOR >= QUIZ_PASS_NUMERATOR * total;
}

const LS_SLIDES = 'ecourse-slides-read:';
const LS_VIDEO_COMPLETE = 'ecourse-video-complete:';
const LS_QUIZ_ACK = 'ecourse-quiz-ack:';

/** Mark every slide in the module as read (used after slides completion modal + ribbon fly). */
export function setSlidesAllComplete(moduleId: string, slideCount: number) {
  if (typeof window === 'undefined' || slideCount <= 0) return;
  try {
    window.localStorage.setItem(`${LS_SLIDES}${moduleId}`, JSON.stringify(Array.from({ length: slideCount }, () => true)));
  } catch {
    /* ignore */
  }
}

export function slidesAllReadFromStorage(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(`${LS_SLIDES}${moduleId}`);
    if (!raw) return false;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.every(Boolean);
  } catch {
    return false;
  }
}

export function videoCompleteFromStorage(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(`${LS_VIDEO_COMPLETE}${moduleId}`) === '1';
}

export function quizAckFromStorage(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(`${LS_QUIZ_ACK}${moduleId}`) === '1';
}

export function slidesDone(mod: CourseModule): boolean {
  if (!mod.slidesManifest) return true;
  return slidesAllReadFromStorage(mod.id);
}

export function videoDone(mod: CourseModule): boolean {
  if (!mod.videoSrc) return true;
  return videoCompleteFromStorage(mod.id);
}

export function quizDone(mod: CourseModule): boolean {
  if (!mod.quizDocxSrc) return true;
  return quizAckFromStorage(mod.id);
}

/** All gated steps satisfied for this module (reads browser localStorage). */
export function moduleGateComplete(mod: CourseModule): boolean {
  return slidesDone(mod) && videoDone(mod) && quizDone(mod);
}

export function setQuizAck(moduleId: string) {
  try {
    window.localStorage.setItem(`${LS_QUIZ_ACK}${moduleId}`, '1');
  } catch {
    /* ignore */
  }
}

export function setVideoComplete(moduleId: string) {
  try {
    window.localStorage.setItem(`${LS_VIDEO_COMPLETE}${moduleId}`, '1');
  } catch {
    /* ignore */
  }
}

/** True if the learner may open `modules[targetIndex]` (all prior modules pass the gate). */
export function canOpenModuleIndex(modules: CourseModule[], targetIndex: number): boolean {
  for (let i = 0; i < targetIndex; i++) {
    if (!moduleGateComplete(modules[i])) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Server-side progress sync (ecourse_module_progress)
//
// localStorage remains the fast source of truth for gating; Supabase is the
// durable record — it powers the admin dashboard, cross-device resume, and
// server-side certificate validation. All calls are best-effort: a failed
// sync must never block the learner.
// ---------------------------------------------------------------------------

/** Push every locally-completed module up to Supabase (idempotent upsert). */
export async function syncProgressToDb(userId: string): Promise<void> {
  try {
    const rows = COURSE_MODULES.filter((m) => moduleGateComplete(m)).map((m) => ({
      user_id: userId,
      module_id: m.id,
      completed_at: new Date().toISOString(),
    }));
    if (rows.length === 0) return;
    await supabase
      .from('ecourse_module_progress')
      .upsert(rows, { onConflict: 'user_id,module_id', ignoreDuplicates: true });
  } catch {
    /* best-effort — never block the learner on a sync failure */
  }
}

// ---------------------------------------------------------------------------
// TESTING HELPERS (used by the admin-only test panel on the Learn page)
// ---------------------------------------------------------------------------

/** TESTING: mark every module fully complete locally (slides, video, quiz). */
export function completeAllProgressLocal(): void {
  for (const m of COURSE_MODULES) {
    setSlidesAllComplete(m.id, 1);
    setVideoComplete(m.id);
    setQuizAck(m.id);
  }
}

/** TESTING: wipe all local module progress. */
export function resetAllProgressLocal(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const m of COURSE_MODULES) {
      window.localStorage.removeItem(`${LS_SLIDES}${m.id}`);
      window.localStorage.removeItem(`${LS_VIDEO_COMPLETE}${m.id}`);
      window.localStorage.removeItem(`${LS_QUIZ_ACK}${m.id}`);
    }
  } catch {
    /* ignore */
  }
}

/** TESTING: delete this user's server-side progress rows (RLS: own rows only). */
export async function deleteProgressFromDb(userId: string): Promise<void> {
  try {
    await supabase.from('ecourse_module_progress').delete().eq('user_id', userId);
  } catch {
    /* best-effort */
  }
}

/**
 * Pull completed modules from Supabase and mark them complete locally.
 * Returns true if any local gate changed (caller should re-render gating).
 */
export async function hydrateProgressFromDb(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ecourse_module_progress')
      .select('module_id')
      .eq('user_id', userId);
    if (error || !data) return false;
    const completedIds = new Set((data as { module_id: string }[]).map((r) => r.module_id));
    let changed = false;
    for (const m of COURSE_MODULES) {
      if (!completedIds.has(m.id) || moduleGateComplete(m)) continue;
      // Mark all three gates complete locally ([true] satisfies the slides check)
      setSlidesAllComplete(m.id, 1);
      setVideoComplete(m.id);
      setQuizAck(m.id);
      changed = true;
    }
    return changed;
  } catch {
    return false;
  }
}
