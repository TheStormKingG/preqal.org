import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <picture>
                <source 
                  type="image/avif" 
                  srcSet={`
                    ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.avif 200w,
                    ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.avif 400w
                  `}
                  sizes="160px"
                />
                <source 
                  type="image/webp" 
                  srcSet={`
                    ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w,
                    ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w
                  `}
                  sizes="160px"
                />
                <img 
                  src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp`}
                  alt="Preqal logo"
                  width="200"
                  height="80"
                  className="h-40 w-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 relative ${
                  isActive(link.path)
                    ? 'text-neutral-900 font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-amber-500 rounded-full"></span>
                )}
              </Link>
            ))}
            <Link
              to="/book"
              className="px-6 py-2.5 rounded-full bg-orange-600 text-white text-sm font-bold hover:bg-orange-500 transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-600/30 transform hover:-translate-y-0.5"
            >
              Book a Diagnostic
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-neutral-600 hover:text-amber-600 focus:outline-none transition-colors min-w-[48px] min-h-[48px]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Clear, no blur */}
      {isOpen && (
        <div 
          className="md:hidden bg-white border-t border-neutral-200 shadow-lg relative z-50"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-4 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-neutral-50 text-amber-600 border-l-4 border-amber-500'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-5 py-3 rounded-md bg-orange-600 text-white font-bold hover:bg-orange-500 transition-colors"
            >
              Book a Diagnostic
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop Blur Overlay - Covers all page content below navbar with Glass Animation */}
      {isOpen && (
        <div 
          className="fixed top-20 left-0 right-0 bottom-0 z-[45] md:hidden glass-backdrop"
          onClick={() => setIsOpen(false)}
          style={{
            animation: 'fadeIn 0.3s ease-out',
            position: 'fixed',
            top: '80px', // 20 * 4 = 80px (h-20)
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100vh - 80px)',
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;