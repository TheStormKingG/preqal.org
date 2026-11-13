import { describe, it, expect } from 'vitest';
import { injectMeta, esc } from '../../scripts/lib/inject-meta.mjs';
import { routeMeta } from '../../scripts/route-meta.mjs';

/* The injector wrote each value with a string replacement of the form
   `$1${value}$2`. String.prototype.replace interprets `$1`, `$2`, `$&`,
   `` $` `` and `$'` in a replacement string — wherever they come from. So the
   first meta description to mention a price, "GY$2.1 million", had its own
   `$2` turned into the closing quote, and the tag ended at "GY". The build
   passed. Only og:title, twitter:title and the three descriptions were cut;
   <title> looked right, which is what made the page look correct at a glance.

   These tests read the value back out of the produced HTML and require it to
   be the value that went in. */

const SHELL = `<!doctype html><html><head>
<title>shell</title>
<meta name="description" content="shell">
<link rel="canonical" href="https://preqal.org/">
<meta property="og:type" content="website">
<meta property="og:url" content="https://preqal.org/">
<meta property="og:title" content="shell">
<meta property="og:description" content="shell">
<meta property="og:image" content="https://preqal.org/og/home.png">
<meta name="twitter:url" content="https://preqal.org/">
<meta name="twitter:title" content="shell">
<meta name="twitter:description" content="shell">
<meta name="twitter:image" content="https://preqal.org/og/home.png">
</head><body></body></html>`;

const attr = (html: string, tag: string) => {
  const m = html.match(new RegExp(`<meta (?:name|property)="${tag}" content="([^"]*)"`));
  return m ? m[1] : null;
};
const titleOf = (html: string) => html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null;

const base = {
  canonical: 'https://preqal.org/x/',
  ogImage: 'https://preqal.org/og/home.png',
  ogType: 'article',
};

describe('meta injection writes values literally', () => {
  const hostile: Array<[string, string]> = [
    ['a price that looks like group 2', 'ISO 9001 in Guyana costs GY$450,000 to GY$2.1 million to build'],
    ['a price that looks like group 1', 'A flat fee of GY$100,000 for the Risk Scan'],
    ['the whole-match token', 'Save $& on every audit'],
    ['the before-match token', 'Costs $` less than you think'],
    ['the after-match token', "Costs $' less than you think"],
    ['an escaped dollar', 'Priced in $$ not in pounds'],
  ];

  for (const [name, value] of hostile) {
    it(`survives ${name}`, () => {
      const out = injectMeta(SHELL, { ...base, title: value, description: value });
      for (const tag of ['description', 'og:description', 'twitter:description', 'og:title', 'twitter:title']) {
        expect(attr(out, tag), tag).toBe(esc(value));
      }
      expect(titleOf(out)).toBe(esc(value));
    });
  }

  it('still escapes the characters that would break the attribute', () => {
    const out = injectMeta(SHELL, { ...base, title: 'A "quoted" & joined title', description: 'x' });
    expect(attr(out, 'og:title')).toBe('A &quot;quoted&quot; &amp; joined title');
  });
});

describe('every real route survives injection intact', () => {
  /* The property that matters, over the data that actually ships: whatever
     route-meta says is what the page says. This is the check that would have
     caught the truncation the day a price was first written into a
     description, without anybody thinking to test for dollar signs. */
  const routes = Object.entries(routeMeta) as Array<[string, Record<string, string>]>;

  it('has routes to check', () => {
    expect(routes.length).toBeGreaterThan(15);
  });

  for (const [route, meta] of routes) {
    it(`${route}`, () => {
      const out = injectMeta(SHELL, meta as never);
      expect(titleOf(out)).toBe(esc(meta.title));
      expect(attr(out, 'description')).toBe(esc(meta.description));
      expect(attr(out, 'og:title')).toBe(esc(meta.title));
      expect(attr(out, 'og:description')).toBe(esc(meta.description));
      expect(attr(out, 'twitter:title')).toBe(esc(meta.title));
      expect(attr(out, 'twitter:description')).toBe(esc(meta.description));
    });
  }
});
