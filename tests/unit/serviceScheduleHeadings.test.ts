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

  /* The other direction. Finding the `??` proves the fallback survives; it
     says nothing about whether any record supplies an override. Without that,
     dropping scheduleEyebrow from the qhse-control record leaves the five
     journey pages byte-identical, keeps the assertions above green, and
     silently reverts the one page the feature exists for to "How the week
     runs" — wrong for a build sequence that is not a week. */
  it('exactly the non-journey service supplies the overrides', () => {
    /* Bounded to the SERVICE_PAGES array, not to end-of-file. The last record
       would otherwise absorb the whole component below it, so a stray match in
       the JSX would be credited to whichever service happens to be last — and
       qhse-control IS last, so the test would pass for the wrong reason. */
    const open = src.indexOf('const SERVICE_PAGES');
    /* After the `=`, not after the declaration: the type annotation is
       `ServicePage[]`, so the first bracket past the name is an empty pair
       that closes immediately and yields a zero-record parse. */
    const start = src.indexOf('[', src.indexOf('=', open));
    let depth = 0;
    let end = start;
    while (end < src.length) {
      if (src[end] === '[') depth += 1;
      else if (src[end] === ']') {
        depth -= 1;
        if (depth === 0) break;
      }
      end += 1;
    }
    const array = src.slice(start, end + 1);
    expect(open, 'SERVICE_PAGES is where this test thinks it is').toBeGreaterThan(-1);

    const records = [...array.matchAll(/slug: '([a-z-]+)'/g)]
      .map((m) => ({ slug: m[1], at: m.index ?? 0 }))
      .map((r, i, all) => ({
        slug: r.slug,
        body: array.slice(r.at, all[i + 1]?.at ?? array.length),
      }));

    /* Guard the instrument, not the subject. If this asserted on the number of
       overriders instead, removing the only override would fire here and the
       failure would read as a broken parse rather than the missing override
       the next assertion is for. */
    expect(records.map((r) => r.slug), 'the parse sees every service').toEqual([
      'business-plan',
      'risk-scan',
      'systems-builder',
      'certified-care',
      'export-ready',
      'qhse-control',
    ]);

    const overriders = records
      .filter((r) => r.body.includes('scheduleEyebrow:') && r.body.includes('scheduleHeading:'))
      .map((r) => r.slug);

    expect(overriders, 'the override reaches a record at all').toContain('qhse-control');
    expect(overriders, 'and no journey service overrides the week wording').toEqual(['qhse-control']);
  });
});
