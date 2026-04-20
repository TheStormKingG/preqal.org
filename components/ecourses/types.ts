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
  /** Public URL path to `manifest.json` from `build-native-slides` (WebP deck + dwell rules). */
  slidesManifest?: string;
}
