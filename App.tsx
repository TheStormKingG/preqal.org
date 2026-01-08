import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import { initGA } from './src/analytics/ga';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Component to handle GitHub Pages 404 redirect
const GitHubPagesRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Handle GitHub Pages SPA redirect pattern: /?/path
    // The URL format is: domain.com/?/tools/mdst
    const search = window.location.search;
    
    // Check if search string starts with ?/ (GitHub Pages redirect pattern)
    if (search.startsWith('?/')) {
      // Extract the path from ?/tools/mdst
      const redirectPath = '/' + search.slice(2).replace(/~and~/g, '&');
      
      console.log('GitHub Pages redirect detected:', {
        search,
        redirectPath,
        currentPath: location.pathname
      });
      
      // Clean up the URL and navigate to the actual path
      window.history.replaceState({}, '', redirectPath);
      // Navigate to the actual path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);
  
  return null;
};

const App: React.FC = () => {
  const patternRef = useRef<HTMLDivElement>(null);

  // IP Canonicalization: Redirect IP address access to canonical domain
  useEffect(() => {
    const hostname = window.location.hostname;
    const canonicalDomain = 'preqal.org';
    
    // Check if hostname is an IP address (IPv4 or IPv6)
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(hostname);
    
    // If accessed via IP address, redirect to canonical domain
    if (isIPAddress && hostname !== canonicalDomain) {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      window.location.replace(`https://${canonicalDomain}${currentPath}`);
      return;
    }
    
    // Also redirect non-canonical domains (www, etc.) to canonical
    if (hostname !== canonicalDomain && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      // Only redirect if it's a known variant (www, etc.)
      if (hostname.includes('preqal.org')) {
        window.location.replace(`https://${canonicalDomain}${currentPath}`);
        return;
      }
    }
  }, []);

  // Initialize Google Analytics
  useEffect(() => {
    initGA();
  }, []);

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
        <GitHubPagesRedirect />
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