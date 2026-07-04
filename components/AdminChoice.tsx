import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutDashboard, X, ArrowRight } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
   Admin destination chooser.
   When an admin signs in (or clicks "My course"), instead of hard-redirecting
   to the admin dashboard, ask: audit the e-course as a student, or go to the
   dashboard. Replaces the old auto-redirects, which made it impossible for an
   admin to ever see the course.
   ──────────────────────────────────────────────────────────────────────────── */

export const ADMIN_EMAILS = ['stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'];

export const isAdminEmail = (email?: string | null): boolean =>
  ADMIN_EMAILS.includes((email ?? '').toLowerCase());

interface AdminChoiceContextValue {
  openAdminChoice: () => void;
}
const AdminChoiceContext = createContext<AdminChoiceContextValue>({ openAdminChoice: () => {} });
export const useAdminChoice = () => useContext(AdminChoiceContext);

export const AdminChoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openAdminChoice = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, close]);

  const goCourse = () => {
    close();
    navigate('/e-courses/learn');
  };
  const goDashboard = () => {
    close();
    window.location.href = '/admin-dashboard.html';
  };

  return (
    <AdminChoiceContext.Provider value={{ openAdminChoice }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Scrim */}
              <div
                className="absolute inset-0"
                style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                onClick={close}
                aria-hidden="true"
              />

              {/* Card */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Choose where to go"
                className="relative w-full max-w-md rounded-3xl overflow-hidden"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '14px 16px 40px rgba(15,23,42,0.35), -6px -6px 20px rgba(255,255,255,0.25)',
                }}
                initial={{ y: 40, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              >
                {/* Amber top bar */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />

                <div className="p-7 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-1">Admin account</p>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">Welcome back, Dr. Gravesande.</h2>
                      <p className="text-sm text-slate-500 mt-1">Where would you like to go?</p>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
                      style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px rgba(163,177,198,0.5), -3px -3px 8px rgba(255,255,255,0.85)' }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <motion.button
                      type="button"
                      onClick={goCourse}
                      whileHover={{ y: -2, boxShadow: '6px 6px 16px rgba(163,177,198,0.6), -4px -4px 12px rgba(255,255,255,0.95)' }}
                      whileTap={{ scale: 0.985 }}
                      className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
                      style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)' }}
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                      >
                        <GraduationCap className="h-5 w-5 text-amber-600" />
                      </span>
                      <span className="flex-grow min-w-0">
                        <span className="block text-sm font-bold text-slate-900">Audit the E-Course</span>
                        <span className="block text-xs text-slate-500 leading-snug">Experience it exactly as a student — slides, videos, quizzes.</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={goDashboard}
                      whileHover={{ y: -2, boxShadow: '6px 6px 16px rgba(217,119,6,0.45), -4px -4px 12px rgba(255,255,255,0.7)' }}
                      whileTap={{ scale: 0.985 }}
                      className="group flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(217,119,6,0.4), -2px -2px 8px rgba(255,255,255,0.6)' }}
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.18)' }}
                      >
                        <LayoutDashboard className="h-5 w-5 text-white" />
                      </span>
                      <span className="flex-grow min-w-0">
                        <span className="block text-sm font-bold text-white">Admin Dashboard</span>
                        <span className="block text-xs text-amber-100 leading-snug">Leads, pipeline, CRM, e-course enrolments, traffic, QMS.</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-white flex-shrink-0 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </AdminChoiceContext.Provider>
  );
};
