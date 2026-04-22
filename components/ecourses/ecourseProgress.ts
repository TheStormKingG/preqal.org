import type { CourseModule } from './types';

const LS_SLIDES = 'ecourse-slides-read:';
const LS_VIDEO_COMPLETE = 'ecourse-video-complete:';
const LS_QUIZ_ACK = 'ecourse-quiz-ack:';

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
