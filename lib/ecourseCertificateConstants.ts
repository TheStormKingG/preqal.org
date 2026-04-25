// ---------------------------------------------------------------------------
// Certificate constants & helpers
// ---------------------------------------------------------------------------

export const CERT_COURSE_ID = 'build-systems-that-actually-work';
export const CERT_COURSE_TITLE = 'E-Course: Build Systems That Actually Work';
export const CERT_COURSE_SUBTITLE = 'An online Quality Management course offered by Preqal Inc';
export const CERT_COURSE_LEGAL = 'A legally registered Quality Management company';

export const CERT_SIGNATORY_NAME = 'Dr. Stefan Gravesande';
export const CERT_SIGNATORY_TITLE = 'Principal Director';
export const CERT_SIGNATORY_ORG = 'Preqal Inc';

/** Public base URL — used in verification links on the certificate PDF */
export const CERT_VERIFY_BASE_URL = 'https://preqal.org/verify/';

/**
 * Generate a unique, human-readable certificate key.
 *
 * Format: PREQAL-YYYYMM-XXXXXX
 *   YYYYMM  — calendar year + zero-padded month (encodes approximate issue period)
 *   XXXXXX  — 6 random base-36 uppercase characters (≈ 2.18 billion combinations per month)
 *
 * Example: PREQAL-202604-K8M3XN
 *
 * The key is stored with a UNIQUE constraint in Supabase, so any (extremely unlikely)
 * collision will surface as a DB error and the caller can retry.
 */
export function generateCertKey(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `PREQAL-${ym}-${rand}`;
}

/** Format a Date (or ISO string) as DD/MM/YYYY for display on the certificate */
export function formatCertDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Full verification URL for a given cert key */
export function certVerifyUrl(certKey: string): string {
  return `${CERT_VERIFY_BASE_URL}${certKey}`;
}
