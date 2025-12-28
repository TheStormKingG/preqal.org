import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const patternRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial transform with scale
    if (patternRef.current) {
      patternRef.current.style.transform = 'scale(0.75) translateY(0px)';
    }

    const handleScroll = () => {
      if (patternRef.current) {
        const scrollY = window.scrollY;
        // Parallax effect: scroll at 30% speed (0.3 multiplier) for slower movement
        // Combined with scale(0.75) for 25% smaller icons
        const parallaxOffset = scrollY * 0.3;
        patternRef.current.style.transform = `scale(0.75) translateY(${parallaxOffset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
      {/* Global Background Texture */}
      <div className="fixed inset-0 z-[-1] bg-[#f6f8fb] pointer-events-none overflow-hidden">
         {/* Sparse Orange Icons Pattern with Parallax */}
         <div 
           ref={patternRef}
           className="absolute inset-0 bg-scatter-pattern-light opacity-60"
           style={{ willChange: 'transform' }}
         ></div>
         {/* Ambient Blobs */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="flex flex-col min-h-screen text-neutral-900 font-sans selection:bg-amber-500/30">
        <Navbar />
        <main className="flex-grow pt-20 overflow-hidden">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;