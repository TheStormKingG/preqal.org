import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-fade-in-up shadow-lg">
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
    </nav>
  );
};

export default Navbar;