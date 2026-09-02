import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Mail } from 'lucide-react';

/* The phone's primary navigation. With only three destinations a bottom bar
   beats a menu behind a button: every route is one thumb-reach away and always
   visible, so nothing has to be opened to find out where the site goes. */
export const BOTTOM_NAV_ROUTES = ['/', '/resources', '/contact'] as const;

/* One list, one look. The top bar renders these same items from md up, so the
   two never drift apart. */
export const NAV_ITEMS = [
  { name: 'Home', path: '/', Icon: Home },
  { name: 'Templates', path: '/resources', Icon: FileText },
  { name: 'Contact', path: '/contact', Icon: Mail },
];

/** The tab's own styling, shared by both bars. */
export const navTabClass = (active: boolean) =>
  `flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
    active ? 'text-amber-600 neu-pressed-sm font-bold' : 'text-slate-500 hover:text-slate-700'
  }`;

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
        {NAV_ITEMS.map(({ name, path, Icon }) => {
          const active = pathname === path;
          return (
            <li key={path} className="flex-1">
              <Link
                to={path}
                aria-current={active ? 'page' : undefined}
                /* h-12 keeps the tap target at the 48px minimum. */
                className={`${navTabClass(active)} mx-1 my-0.5`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                <span className="text-[11px] leading-none font-semibold">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
