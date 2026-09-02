import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWhatsApp, WhatsAppIcon } from './WhatsAppContact';

/* From md up this is the whole navigation. Below md it carries the mark only —
   the three destinations live in BottomNav, within thumb reach. */
const Navbar: React.FC = () => {
  const location = useLocation();
  const { openWhatsApp } = useWhatsApp();

  const navLinks = [
    { name: 'Home',      path: '/' },
    { name: 'Templates', path: '/resources' },
    { name: 'Contact',   path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 bg-[#e0e5ec]/90 backdrop-blur-xl shadow-[0_4px_8px_#a3b1c6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <picture>
                <source
                  type="image/avif"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.avif 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.avif 400w`}
                  sizes="165px"
                />
                <source
                  type="image/webp"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w`}
                  sizes="165px"
                />
                <img
                  src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp`}
                  alt="Preqal logo"
                  width="165"
                  height="40"
                  className="h-7 md:h-10 w-auto transition-transform duration-300 hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </Link>
          </div>

          {/* Phone: the one action worth keeping in the chrome. The button fills
              the bar's height so the tap target clears 44px, while the pill it
              draws stays small enough not to crowd the mark. */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={openWhatsApp}
              aria-label="Contact us on WhatsApp"
              className="flex h-12 items-center"
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-amber-600 font-bold text-xs whitespace-nowrap"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '3px 3px 8px #a3b1c6, -3px -3px 8px #ffffff',
                  border: '1.5px solid rgba(245,158,11,0.35)',
                }}
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366] shrink-0" />
                WhatsApp
              </span>
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-[30px]">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`whitespace-nowrap text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={openWhatsApp}
              className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-all neu-raised-sm"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
