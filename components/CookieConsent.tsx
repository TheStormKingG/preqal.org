import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalyticsConsent, setAnalyticsConsent } from '../src/analytics/ga';

/**
 * GDPR/ePrivacy cookie-consent banner.
 * Google Analytics only loads after explicit opt-in; declining stores the
 * choice and never loads GA. Essential functionality never depends on this.
 */
const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only when no choice has been recorded yet
    const t = setTimeout(() => setVisible(getAnalyticsConsent() === null), 1200);
    return () => clearTimeout(t);
  }, []);

  const choose = (value: 'granted' | 'denied') => {
    setAnalyticsConsent(value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[150] rounded-2xl p-5"
          style={{
            background: '#e0e5ec',
            boxShadow: '10px 12px 30px rgba(15,23,42,0.25), -6px -6px 18px rgba(255,255,255,0.8)',
            border: '1.5px solid rgba(255,255,255,0.9)',
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <p className="text-sm font-bold text-slate-900 mb-1.5">Cookies — your choice</p>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            We'd like to use Google Analytics to understand how visitors use this site.
            No analytics run unless you say yes. See our{' '}
            <Link to="/privacy-policy" className="text-amber-600 font-semibold hover:text-amber-500 underline">
              Privacy Policy
            </Link>.
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => choose('granted')}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '3px 3px 10px rgba(217,119,6,0.35)' }}
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => choose('denied')}
              className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 text-sm font-semibold"
              style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px #a3b1c6, -3px -3px 8px #ffffff' }}
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
