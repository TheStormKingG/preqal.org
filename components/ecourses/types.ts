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
  /** Public URL path to original quiz document for download (optional). */
  quizDocxSrc?: string;
}
