import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, UserCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home',      path: '/' },
    { name: 'E-Course',  path: '/e-courses' },
    { name: 'Templates', path: '/resources' },
    { name: 'Contact',   path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/e-courses') {
      return location.pathname === '/e-courses' || location.pathname.startsWith('/e-courses/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed w-full z-50 bg-[#e0e5ec]/90 backdrop-blur-xl shadow-[0_4px_8px_#a3b1c6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <picture>
                <source
                  type="image/avif"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.avif 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.avif 400w`}
                  sizes="160px"
                />
                <source
                  type="image/webp"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w`}
                  sizes="160px"
                />
                <img
                  src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp`}
                  alt="Preqal logo"
                  width="200"
                  height="80"
                  className="h-40 w-auto transition-transform duration-300 hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </Link>
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

            <Link
              to="/book"
              className="whitespace-nowrap px-5 py-2.5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-all neu-raised-sm"
            >
              Free 1hr Consult
            </Link>

            {/* Auth */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  className="flex items-center gap-2 neu-raised-sm px-3 py-2 rounded-xl transition-all hover:neu-pressed-sm"
                >
                  {(user.user_metadata?.avatar_url as string | undefined) ? (
                    <img
                      src={user.user_metadata.avatar_url as string}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover border border-amber-400/40"
                    />
                  ) : (
                    <UserCircle2 className="h-6 w-6 text-slate-600" aria-hidden />
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {profile?.display_name ?? user.email?.split('@')[0] ?? 'Account'}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 neu-card rounded-xl border border-white/60 bg-[#e8ecf2] shadow-neu py-1 z-[200]">
                    <div className="px-4 py-2 border-b border-slate-200/60">
                      <p className="text-xs font-bold text-slate-800 truncate">{profile?.display_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        const adminEmails = ['stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'];
                        if (adminEmails.includes((user.email ?? '').toLowerCase())) {
                          window.location.href = '/admin-dashboard.html';
                        } else {
                          window.location.href = '/e-courses/learn';
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white/60 transition-colors"
                    >
                      My course
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); void signOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white/60 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-slate-600 hover:text-amber-600 transition-colors min-w-[48px] min-h-[48px] neu-raised-sm"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden bg-[#e0e5ec] shadow-[0_6px_12px_#a3b1c6] relative z-50"
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    active
                      ? 'neu-pressed-sm text-amber-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 neu-raised-sm'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-3 px-5 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors neu-raised-sm"
            >
              Free 1hr Consult
            </Link>

            {/* Auth — mobile */}
            {user ? (
              <div className="mt-1 pt-3 border-t border-slate-200/60 space-y-1">
                <p className="px-4 py-1 text-xs font-bold text-slate-500 truncate">
                  {profile?.display_name ?? user.email}
                </p>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); void signOut(); }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed top-20 left-0 right-0 bottom-0 z-[45] md:hidden glass-backdrop"
          onClick={() => setIsOpen(false)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}
    </nav>
  );
};

export default Navbar;
