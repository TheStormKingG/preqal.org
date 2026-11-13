/* Writes a route's title, description, canonical and share tags into a built
   HTML shell. Split out of inject-seo-meta.mjs so it can be tested: that file
   runs against dist/ at import time, and this is the part with the logic.

   Every replacement below is a FUNCTION, and has to stay one. With a string
   replacement, String.prototype.replace reads `$1`, `$2`, `$&`, `` $` `` and
   `$'` inside the replacement as references to the match — including when they
   arrive inside the value being written. A description saying "GY$2.1 million"
   was written as `$1${d}$2`, so its own `$2` became the closing quote and the
   attribute ended at "GY". The page shipped a truncated description and a
   truncated og:title, as malformed HTML, and nothing failed: the build passed
   and the <title> tag, whose pattern has no groups, looked right.

   It had been latent since the file was written, waiting for the first price
   in a meta description. A function's return value is inserted literally. */

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Remove react-helmet's runtime copies of tags we set statically — otherwise every
// prerendered page ships duplicate meta descriptions / og / twitter / canonical tags.
export function stripHelmetDuplicates(html) {
  const kill = [
    /<meta(?=[^>]*data-rh="true")(?=[^>]*name="description")[^>]*>/g,
    /<meta(?=[^>]*data-rh="true")(?=[^>]*property="og:(?:type|url|title|description|image)")[^>]*>/g,
    /<meta(?=[^>]*data-rh="true")(?=[^>]*name="twitter:(?:url|title|description|image)")[^>]*>/g,
    /<link(?=[^>]*data-rh="true")(?=[^>]*rel="canonical")[^>]*>/g,
  ];
  return kill.reduce((h, re) => h.replace(re, ''), html);
}

const setAttr = (html, pattern, value) => html.replace(pattern, (_m, open, close) => open + value + close);

export function injectMeta(html, { title, description, canonical, ogImage, ogType }) {
  const t = esc(title), d = esc(description), img = esc(ogImage), c = esc(canonical), type = esc(ogType);
  let out = stripHelmetDuplicates(html).replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`);
  const tags = [
    [/(<meta name="description" content=")[^"]*(")/, d],
    [/(<link rel="canonical" href=")[^"]*(")/, c],
    [/(<meta property="og:type" content=")[^"]*(")/, type],
    [/(<meta property="og:url" content=")[^"]*(")/, c],
    [/(<meta property="og:title" content=")[^"]*(")/, t],
    [/(<meta property="og:description" content=")[^"]*(")/, d],
    [/(<meta property="og:image" content=")[^"]*(")/, img],
    [/(<meta name="twitter:url" content=")[^"]*(")/, c],
    [/(<meta name="twitter:title" content=")[^"]*(")/, t],
    [/(<meta name="twitter:description" content=")[^"]*(")/, d],
    [/(<meta name="twitter:image" content=")[^"]*(")/, img],
  ];
  for (const [pattern, value] of tags) out = setAttr(out, pattern, value);
  return out;
}
