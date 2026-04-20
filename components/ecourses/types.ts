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
  /** Public URL path to slides (served from `public/`), e.g. `/e-courses/modules/{moduleId}/slides.pptx` */
  slidesPptx?: string;
}
