export type SkillLevel = 'Beginner' | 'Intermediate';

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  tagline: string;
  outcomes: string[];
  estimatedMinutes: number;
  skillLevel: SkillLevel;
  comingSoon?: boolean;
  /** Public URL path to slide `manifest.json` (raster URLs and/or per-slide layer JSON). */
  slidesManifest?: string;
  /** Public URL path to module intro video (e.g. `/e-courses/modules/{id}/video.mp4`). */
  videoSrc?: string;
  /** Present when the module has a quiz (source .docx in public for generators; no download in UI). */
  quizDocxSrc?: string;
}
