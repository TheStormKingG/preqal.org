/** Single-course slug for registration + certificate rows (extend when you add more courses). */
export const PREQAL_QMS_E_COURSE_SLUG = 'preqal-qms-e-course';

export const ECOURSE_CERT_VERIFY_PATH = '/e-courses/certificate/verify';

export function certificateVerifyUrl(publicId: string, origin?: string): string {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://preqal.org')).replace(/\/$/, '');
  const q = new URLSearchParams({ id: publicId });
  return `${base}${ECOURSE_CERT_VERIFY_PATH}?${q.toString()}`;
}
