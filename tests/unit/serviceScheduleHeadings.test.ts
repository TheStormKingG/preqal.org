import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../pages/ServiceLanding.tsx', import.meta.url), 'utf8');

describe('schedule headings', () => {
  it('the interface accepts optional heading overrides', () => {
    expect(src).toContain('scheduleEyebrow?: string;');
    expect(src).toContain('scheduleHeading?: React.ReactNode;');
  });

  it('the render falls back to the week wording when no override is given', () => {
    // Both halves of the cardinality clause: the default must still be
    // emitted, or the five existing pages change.
    expect(src).toContain("page.scheduleEyebrow ?? 'How the week runs'");
    expect(src).toContain('page.scheduleHeading ?? (');
  });
});
