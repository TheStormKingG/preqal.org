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
 * Format: PREQAL-YYYYMM-XXXXXXXX
 *   YYYYMM    — calendar year + zero-padded month (encodes issue period)
 *   XXXXXXXX  — 8 cryptographically random base-36 uppercase characters
 *               (~2.82 trillion combinations per month; guessing probability < 1/trillion)
 *
 * Example: PREQAL-202604-K8M3XN2A
 *
 * Uses crypto.getRandomValues() for true randomness (not Math.random()).
 * The key is stored with a UNIQUE constraint in Supabase, so any (astronomically unlikely)
 * collision will surface as a DB error and the caller can retry.
 */
export function generateCertKey(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  const rand = Array.from(buf)
    .map((b) => b.toString(36))
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
    .padEnd(8, '0');
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
