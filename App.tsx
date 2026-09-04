import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import RouteSwipe from './components/RouteSwipe';
import AnimatedRoutes from './components/AnimatedRoutes';
import { WhatsAppProvider } from './components/WhatsAppContact';
import CookieConsent from './components/CookieConsent';
import { initGA } from './src/analytics/ga';

const ConditionalNavbar: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/tools/')) return null;
  return <Navbar />;
};

const ConditionalBottomNav: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/tools/')) return null;
  return <BottomNav />;
};

/* All three run as a slide deck at every width, and each carries the footer as
   its last slide. A global footer would be a second copy below the deck — and
   would make the page itself scroll, which is exactly what a deck replaces. */
const DECK_ROUTES = ['/', '/resources', '/contact'];

const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/tools/')) return null;
  if (DECK_ROUTES.includes(location.pathname)) return null;
  return <Footer />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    // Give react-helmet-async a tick to flush head updates before signalling prerender
    const t = setTimeout(() => window.dispatchEvent(new Event('prerender-ready')), 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
};

const GitHubPagesRedirect: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    if (search.startsWith('?/')) {
      const redirectPath = '/' + search.slice(2).replace(/~and~/g, '&');
      window.history.replaceState({}, '', redirectPath + (hash || ''));
      navigate(redirectPath + (hash || ''), { replace: true });
    }
  }, [navigate]);
  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    const hostname = window.location.hostname;
    const canonicalDomain = 'preqal.org';
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(hostname);
    if (isIPAddress && hostname !== canonicalDomain) {
      window.location.replace(`https://${canonicalDomain}${window.location.pathname + window.location.search + window.location.hash}`);
      return;
    }
    if (hostname !== canonicalDomain && hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('preqal.org')) {
      window.location.replace(`https://${canonicalDomain}${window.location.pathname + window.location.search + window.location.hash}`);
    }
  }, []);

  // GA only loads if the visitor previously opted in (see CookieConsent)
  useEffect(() => { initGA(); }, []);

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('NavigationPreloadManager')) return;
      originalWarn.apply(console, args);
    };
    return () => { console.warn = originalWarn; };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <WhatsAppProvider>
        <GitHubPagesRedirect />
        <ScrollToTop />
        <RouteSwipe />

        {/* Clean neumorphic background */}
        <div className="fixed inset-0 z-[-1] bg-[#e0e5ec] pointer-events-none" />

        {/* Below md the bottom bar is fixed over the page, so the shell reserves
            its height; from md up the top bar is the only chrome. */}
        <div className="flex flex-col min-h-screen text-slate-800 font-sans selection:bg-amber-500/30 pb-[var(--chrome-bottom)] md:pb-0">
          <ConditionalNavbar />
          <main className="flex-grow pt-[var(--chrome-top)] overflow-hidden">
            <AnimatedRoutes />
          </main>
          <ConditionalFooter />
        </div>
        <ConditionalBottomNav />
        <CookieConsent />
        </WhatsAppProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
