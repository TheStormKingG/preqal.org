import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Resources', path: '/resources' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

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

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 relative ${
                  isActive(link.path)
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
                )}
              </Link>
            ))}
            <Link
              to="/book"
              className="px-6 py-2.5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-all neu-raised-sm"
            >
              Book a Diagnostic
            </Link>
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

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div
          className="md:hidden bg-[#e0e5ec] shadow-[0_6px_12px_#a3b1c6] relative z-50"
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(link.path)
                    ? 'neu-pressed-sm text-amber-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 neu-raised-sm'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-3 px-5 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors neu-raised-sm"
            >
              Book a Diagnostic
            </Link>
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
