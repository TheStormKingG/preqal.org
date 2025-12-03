import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Services from '../pages/Services';
import CaseStudies from '../pages/CaseStudies';
import Resources from '../pages/Resources';
import About from '../pages/About';
import BookScan from '../pages/BookScan';
import ContactUs from '../pages/ContactUs';

const routeOrder = ['/', '/services', '/case-studies', '/resources', '/about', '/contact', '/book'];

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Determine direction
      const currentIndex = routeOrder.indexOf(displayLocation.pathname);
      const nextIndex = routeOrder.indexOf(location.pathname);
      
      if (nextIndex > currentIndex) {
        setDirection('forward');
      } else {
        setDirection('backward');
      }

      setTransitionStage('exit');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 300); // Match animation duration
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
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/about" element={<About />} />
        <Route path="/book" element={<BookScan />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </div>
  );
};

export default AnimatedRoutes;

