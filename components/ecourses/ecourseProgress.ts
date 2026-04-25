import type { CourseModule } from './types';

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

/** True when every module in the catalog passes the local slide/video/quiz gate (browser storage). */
export function entireCourseComplete(modules: CourseModule[]): boolean {
  return modules.length > 0 && modules.every(moduleGateComplete);
}
