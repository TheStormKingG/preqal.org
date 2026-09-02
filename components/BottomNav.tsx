import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/* The phone's primary navigation. With only three destinations a bottom bar
   beats a menu behind a button: every route is one thumb-reach away and always
   visible, so nothing has to be opened to find out where the site goes. */
export const BOTTOM_NAV_ROUTES = ['/', '/resources', '/contact'] as const;

/* One list, one look. The top bar renders these same items from md up, so the
   two never drift apart. */
export const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Templates', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

/** A destination's own styling, shared by both bars. */
export const navLinkClass = (active: boolean) =>
  `whitespace-nowrap text-sm font-medium transition-all duration-200 relative ${
    active ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
  }`;

/** The amber rule that marks where you are. */
export const NavUnderline: React.FC = () => (
  <span
    data-nav-underline
    className="absolute -bottom-2 left-0 w-full h-0.5 bg-amber-500 rounded-full"
  />
);

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#e0e5ec]/95 backdrop-blur-xl shadow-[0_-4px_10px_#a3b1c6]"
      /* Sits above the home indicator on phones that have one. */
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ name, path }) => {
          const active = pathname === path;
          return (
            <li key={path} className="flex-1">
              {/* h-12 keeps the tap target at the 48px minimum, while the label
                  inside it carries the same treatment the top bar gives it. */}
              <Link
                to={path}
                aria-current={active ? 'page' : undefined}
                className="flex h-12 items-center justify-center"
              >
                <span className={navLinkClass(active)}>
                  {name}
                  {active && <NavUnderline />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
