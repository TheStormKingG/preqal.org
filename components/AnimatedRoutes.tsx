import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Resources from '../pages/Resources';
import ContactUs from '../pages/ContactUs';
import PreqalNotPrequel from '../pages/PreqalNotPrequel';
import SEOHealth from '../pages/SEOHealth';
import MDST from '../pages/MDST';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import ECourses from '../pages/ECourses';
import ECourseLearn from '../pages/ECourseLearn';
import ECourseRegister from '../pages/ECourseRegister';
import ECourseVerifyCertificate from '../pages/ECourseVerifyCertificate';
import BusinessGrowthAssessment from '../pages/BusinessGrowthAssessment';

const routeOrder = [
  '/',
  '/e-courses',
  '/e-courses/register',
  '/e-courses/learn',
  '/resources',
  '/contact',
  '/business-growth-assessment',
  '/preqal-not-prequel',
  '/privacy-policy',
  '/terms-of-service',
];

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  // Derive direction at render time from the two locations — no separate state needed
  const fromIndex = routeOrder.indexOf(displayLocation.pathname);
  const toIndex = routeOrder.indexOf(location.pathname);
  const direction: 'forward' | 'backward' = toIndex >= fromIndex ? 'forward' : 'backward';

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      const raf = requestAnimationFrame(() => setTransitionStage('exit'));
      return () => cancelAnimationFrame(raf);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  const getAnimationClass = () => {
    if (transitionStage === 'exit') {
      return direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
    }
    return direction === 'forward' ? 'slide-in-right' : 'slide-in-left';
  };

  return (
    <div className={`page-transition ${getAnimationClass()}`}>
      <Routes location={displayLocation}>
        <Route path="/"                           element={<Home />} />
        {/* Services & Case Studies retired — journey now lives on the home page */}
        <Route path="/services"                   element={<Navigate to="/" replace />} />
        <Route path="/case-studies"               element={<Navigate to="/" replace />} />
        <Route path="/resources"                  element={<Resources />} />
        <Route path="/templates"                  element={<Navigate to="/resources" replace />} />
        <Route path="/e-courses"                  element={<ECourses />} />
        <Route path="/e-courses/register"         element={<ECourseRegister />} />
        <Route path="/e-courses/learn"            element={<ECourseLearn />} />
        {/* Certificate verification — hidden from nav, accessible via PDF link */}
        <Route path="/verify"                     element={<ECourseVerifyCertificate />} />
        <Route path="/verify/:certKey"            element={<ECourseVerifyCertificate />} />
        {/* About merged into Contact */}
        <Route path="/about"                      element={<Navigate to="/contact" replace />} />
        {/* Booking retired 2026-07-04 — contact is via WhatsApp popup */}
        <Route path="/book"                       element={<Navigate to="/" replace />} />
        <Route path="/contact"                    element={<ContactUs />} />
        <Route path="/business-growth-assessment" element={<BusinessGrowthAssessment />} />
        {/* Redirect old slug to new one */}
        <Route path="/quote-classifier"           element={<Navigate to="/business-growth-assessment" replace />} />
        <Route path="/preqal-not-prequel"         element={<PreqalNotPrequel />} />
        <Route path="/privacy-policy"             element={<PrivacyPolicy />} />
        <Route path="/terms-of-service"           element={<TermsOfService />} />
        {/* Hidden tool route - not in navigation */}
        <Route path="/tools/mdst"                 element={<MDST />} />
        {import.meta.env.DEV && <Route path="/seo-health" element={<SEOHealth />} />}
      </Routes>
    </div>
  );
};

export default AnimatedRoutes;
