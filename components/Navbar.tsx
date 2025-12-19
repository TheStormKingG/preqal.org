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
              <img 
                src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.png`}
                alt="PREQAL Logo"
                className="h-40 w-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95"
              />
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
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-amber-600 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop Blur Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      {/* Mobile Menu with Glass Effect */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 top-20 z-50 overflow-y-auto"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div 
            className="bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-4 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-amber-50/80 text-amber-600 border-l-4 border-amber-500 shadow-sm'
                      : 'text-neutral-600 hover:bg-white/60 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/book"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-4 px-5 py-3 rounded-md bg-orange-600 text-white font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
              >
                Book a Diagnostic
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;