/* The site's pages live at trailing-slash URLs — that is what GitHub Pages
   serves directly, what the sitemap lists, and what every canonical tag
   names. Client-side the router accepts either form, but two things go wrong
   when the two forms are mixed:

   - A link written without the slash makes the crawler hit a 301 on every
     internal link, and Google credits the site with almost no internal links.
   - A reader who arrives from Google at the slashed URL matches none of the
     `pathname === '/resources'` checks: no active tab, a second footer under
     the deck, sideways swipe dead.

   `href` writes links the canonical way; `normalizePath` compares either way. */

/** A route path in the form the site serves it: trailing slash, root as "/". */
export const href = (path: string): string => {
  if (path === '/' || path.startsWith('http') || path.startsWith('#') || path.includes('.')) return path;
  const [p, rest = ''] = path.split(/(?=[?#])/, 2);
  return (p.endsWith('/') ? p : `${p}/`) + rest;
};

/** A pathname reduced to the form the app compares against: no trailing slash, root as "/". */
export const normalizePath = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
};
