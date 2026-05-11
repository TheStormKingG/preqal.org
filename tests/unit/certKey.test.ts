import { describe, it, expect } from 'vitest';
import { generateCertKey } from '../../lib/ecourseCertificateConstants';

describe('generateCertKey()', () => {
  it('matches PREQAL-YYYYMM-XXXXXXXX format', () => {
    const key = generateCertKey();
    expect(key).toMatch(/^PREQAL-\d{6}-[A-Z0-9]{8}$/);
  });

  it('is exactly 22 characters long', () => {
    const key = generateCertKey();
    expect(key).toHaveLength(22);
  });

  it('generates unique keys across 1000 calls', () => {
    const keys = new Set(Array.from({ length: 1000 }, () => generateCertKey()));
    expect(keys.size).toBe(1000);
  });
});
