import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/* The ISO 9001 cost guide quotes the programme's prices in prose. The prices
   themselves live in STEP_RATES in pages/BusinessGrowthAssessment.tsx, which is
   what a visitor is actually quoted. Two copies of a price drift, and the one
   in an article is the one nobody remembers to change — so a guide promising
   GY$50,000 a month beside a tool quoting something else is a matter of time.

   This reads the rates from the tool and requires the guide to state every
   one of them, and every nine-month total, exactly. Change a rate and this
   fails until the guide says the new figure. */

const read = (rel: string) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');

const tool = read('pages/BusinessGrowthAssessment.tsx');
const guides = read('data/guides.tsx');
const routeMeta = read('scripts/route-meta.mjs');

const MONTHS = 9;

const ratesBlock = tool.match(/const STEP_RATES[^=]*=\s*\{([^}]*)\}/);
const rates = [...(ratesBlock?.[1] ?? '').matchAll(/(\d+):\s*(\d+)/g)].map((m) => Number(m[2]));

const start = guides.indexOf("slug: 'iso-9001-cost-guyana'");
const end = guides.indexOf("slug: 'export-food-from-guyana'");
const costGuide = guides.slice(start, end);

const gy = (n: number) => `GY$${n.toLocaleString('en-US')}`;

describe('the cost guide quotes the prices the assessment actually charges', () => {
  it('finds the rates and the guide at all', () => {
    // Guard the instrument: an empty parse would make every loop below pass.
    expect(rates.length, 'STEP_RATES parsed').toBe(6);
    expect(start, 'cost guide located').toBeGreaterThan(-1);
    expect(end, 'next guide located').toBeGreaterThan(start);
    expect(costGuide.length).toBeGreaterThan(1000);
  });

  it('states every monthly rate', () => {
    for (const r of rates) expect(costGuide, `monthly ${gy(r)}`).toContain(`${gy(r)} a month`);
  });

  it('states every nine-month total, or rounds only the one it says it rounds', () => {
    for (const r of rates) {
      const total = r * MONTHS;
      /* 233,333 x 9 is 2,099,997, which the guide gives as "about GY$2.1
         million". Every other total is a round number and must be exact. */
      if (total % 1000 === 0) expect(costGuide, `total ${gy(total)}`).toContain(gy(total));
      else expect(costGuide, 'the rounded top tier').toContain('about GY$2.1 million');
    }
  });

  it('opens and closes the range with the smallest and largest programme', () => {
    const lowest = Math.min(...rates) * MONTHS;
    expect(costGuide).toContain(`between ${gy(lowest)} and about GY$2.1 million`);
    expect(Math.round((Math.max(...rates) * MONTHS) / 100_000) / 10, 'top tier still rounds to 2.1M').toBe(2.1);
  });

  it('carries the same title and description as the prerendered head', () => {
    /* The guide data feeds the runtime head and route-meta feeds the
       prerendered one. A one-sided edit ships two different snippets. */
    const title = costGuide.match(/title: '([^']+)'/)?.[1];
    const description = costGuide.match(/description:\s*\n?\s*'([^']+)'/)?.[1];
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(routeMeta).toContain(`title: '${title}'`);
    expect(routeMeta).toContain(`'${description}'`);
    expect(description!.length, 'inside the snippet cap').toBeLessThanOrEqual(158);
    expect(title, 'the title answers the query with a figure').toMatch(/GY\$[\d,.]+/);
  });
});
