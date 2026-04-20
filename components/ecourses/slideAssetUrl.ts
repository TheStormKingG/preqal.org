/**
 * Absolute URL for a file under Vite `public/` (path from site root, e.g. `/e-courses/modules/ms-really/slides.pptx`).
 */
export function publicAssetAbsoluteUrl(pathFromRoot: string): string {
  const baseUrl = new URL(import.meta.env.BASE_URL || '/', window.location.origin);
  const clean = pathFromRoot.replace(/^\//, '');
  return new URL(clean, baseUrl).href;
}
