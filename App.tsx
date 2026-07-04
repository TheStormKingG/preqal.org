import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { WhatsAppProvider } from './components/WhatsAppContact';
import CookieConsent from './components/CookieConsent';
import { initGA } from './src/analytics/ga';

const ConditionalNavbar: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/tools/')) return null;
  return <Navbar />;
};

const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/tools/')) return null;
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
        <AuthProvider>
        <WhatsAppProvider>
        <GitHubPagesRedirect />
        <ScrollToTop />

        {/* Clean neumorphic background */}
        <div className="fixed inset-0 z-[-1] bg-[#e0e5ec] pointer-events-none" />

        <div className="flex flex-col min-h-screen text-slate-800 font-sans selection:bg-amber-500/30">
          <ConditionalNavbar />
          <main className="flex-grow pt-20 overflow-hidden">
            <AnimatedRoutes />
          </main>
          <ConditionalFooter />
        </div>
        <CookieConsent />
        </WhatsAppProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
