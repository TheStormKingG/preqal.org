import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAV_ITEMS, BOTTOM_NAV_ROUTES } from '../../components/BottomNav';
import { routeOrder } from '../../components/AnimatedRoutes';

/* The Journal shipped into both nav bars and was unreachable by swipe or arrow
   for a week. Nothing was broken in any one file: the page rendered, the link
   worked, lint and the build passed. Three lists simply disagreed about which
   routes exist, and no test compared them. These do. */

const SOURCE = readFileSync(
  new URL('../../components/AnimatedRoutes.tsx', import.meta.url),
  'utf8',
);

/** Every `<Route path="x" element={y} />` in the router, as a path -> element map. */
const declaredRoutes = (): Map<string, string> => {
  const found = new Map<string, string>();
  const re = /<Route\s+path="([^"]+)"\s+element=\{([^}]*)\}/g;
  for (const m of SOURCE.matchAll(re)) found.set(m[1], m[2].trim());
  return found;
};

describe('the nav bars and the router agree on which routes exist', () => {
  /* A regex over source is only as trustworthy as its yield. If a refactor
     changes how routes are written, this fails loudly instead of quietly
     matching nothing and passing every assertion below. */
  it('finds the whole route table, not a handful of it', () => {
    const routes = declaredRoutes();
    expect(routes.size, 'route extraction looks broken, not the routes').toBeGreaterThan(20);
    expect(routes.has('/'), 'the home route should be among them').toBe(true);
  });

  /* Deliberately a written-out list, which the rest of this file avoids on
     purpose. Everything above derives from NAV_ITEMS, so it proves a tab in the
     bar is reachable — but it cannot notice a tab LEAVING the bar, because the
     assertions leave with it. This one names the destinations so a removal
     fails loudly here instead of silently orphaning a page that is still
     built, still sitemapped and still linked to from elsewhere. Changing the
     bar should mean changing this line on purpose. */
  it('carries exactly the destinations we expect', () => {
    expect(BOTTOM_NAV_ROUTES).toEqual(['/', '/blog', '/resources', '/contact']);
  });

  it('keeps the swipe/arrow list derived from the nav items', () => {
    /* RouteSwipe walks BOTTOM_NAV_ROUTES. When this was a second hand-written
       literal it lost /blog. Written out again, it can drift again. */
    expect(BOTTOM_NAV_ROUTES).toEqual(NAV_ITEMS.map((i) => i.path));
  });

  it.each(NAV_ITEMS)('$name ($path) is a real page, not a redirect', ({ path }) => {
    const element = declaredRoutes().get(path);
    expect(element, `${path} is in a nav bar but has no <Route>`).toBeDefined();
    /* A nav destination that resolves to <Navigate> bounces the visitor
       somewhere else, which looks identical to a dead tab. */
    expect(element, `${path} is a nav destination but redirects away`).not.toMatch(/<Navigate/);
  });

  it.each(NAV_ITEMS)('$name ($path) has a place in the transition order', ({ path }) => {
    /* AnimatedRoutes animates on indexOf. A path missing here is -1, so the
       page slides the wrong way rather than failing outright. */
    expect(routeOrder, `${path} is in a nav bar but not in routeOrder`).toContain(path);
  });

  it('orders the nav items the same way the page transitions do', () => {
    const asOrdered = [...BOTTOM_NAV_ROUTES].sort(
      (a, b) => routeOrder.indexOf(a) - routeOrder.indexOf(b),
    );
    expect(asOrdered, 'arrowing right should move forward, never backward').toEqual([
      ...BOTTOM_NAV_ROUTES,
    ]);
  });
});
