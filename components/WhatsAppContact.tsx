import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { trackEvent } from '../src/analytics/ga';

/* ────────────────────────────────────────────────────────────────────────────
   WhatsApp contact — replaces the retired "Free 1hr Consult" / booking funnel.
   One button, one popup, five predetermined first messages (one per service).
   ──────────────────────────────────────────────────────────────────────────── */

export const WHATSAPP_NUMBER = '5926335874'; // +592 633 5874

export type WhatsAppServiceKey =
  | 'business-plan'
  | 'risk-scan'
  | 'systems-builder'
  | 'certified-care'
  | 'export-ready';

interface WaOption {
  key: WhatsAppServiceKey;
  phase: string;
  service: string;
  message: string;
}

export const WHATSAPP_OPTIONS: WaOption[] = [
  {
    key: 'business-plan',
    phase: '01',
    service: 'Business Plan',
    message:
      "Hi Dr. Gravesande 👋 I have a business idea. I need a plan that a bank will say yes to. Can you help me?",
  },
  {
    key: 'risk-scan',
    phase: '02',
    service: 'Risk Scan™',
    message:
      "Hi Dr. Gravesande 👋 I want the 7-day Risk Scan for my business. I want to see exactly where I stand. What's the next step?",
  },
  {
    key: 'systems-builder',
    phase: '03',
    service: 'Systems Builder™',
    message:
      "Hi Dr. Gravesande 👋 I want to build my management system and get certified. Please tell me about the 9-month programme.",
  },
  {
    key: 'certified-care',
    phase: '04',
    service: 'Certified Care™',
    message:
      "Hi Dr. Gravesande 👋 My business is certified and I want to keep it that way. Please tell me about Certified Care.",
  },
  {
    key: 'export-ready',
    phase: '05',
    service: 'Export-Ready™',
    message:
      "Hi Dr. Gravesande 👋 I make food products and I want to sell them abroad. Please tell me about Export-Ready.",
  },
];

/** Direct wa.me link for a given service's predetermined first message */
export function whatsAppLink(key: WhatsAppServiceKey): string {
  const opt = WHATSAPP_OPTIONS.find((o) => o.key === key) ?? WHATSAPP_OPTIONS[0];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(opt.message)}`;
}

/** Fire a GA4 conversion event for a direct WhatsApp link click */
export function trackWhatsAppClick(key: WhatsAppServiceKey, source: string): void {
  trackEvent('whatsapp_click', { service: key, source });
}

/* WhatsApp glyph (lucide has no brand icons) */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/* ── Context ─────────────────────────────────────────────────────────────── */
interface WaContextValue {
  openWhatsApp: () => void;
}
const WaContext = createContext<WaContextValue>({ openWhatsApp: () => {} });
export const useWhatsApp = () => useContext(WaContext);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const openWhatsApp = useCallback(() => setOpen(true), []);
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

  return (
    <WaContext.Provider value={{ openWhatsApp }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
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
                aria-label="Message Dr. Gravesande on WhatsApp"
                className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '14px 16px 40px rgba(15,23,42,0.35), -6px -6px 20px rgba(255,255,255,0.25)',
                }}
                initial={{ y: 60, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              >
                {/* Amber top bar */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                      >
                        <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Message Dr. Gravesande</h2>
                        <p className="text-xs text-slate-400 font-medium">WhatsApp · +592 633 5874 · replies within 1 business day</p>
                      </div>
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

                  <p className="text-sm text-slate-500 leading-relaxed mt-4 mb-5">
                    Pick the message that fits where you are. It opens in WhatsApp, ready to send —
                    <strong className="text-slate-700"> change it however you like.</strong>
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {WHATSAPP_OPTIONS.map((opt, i) => (
                      <motion.a
                        key={opt.key}
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(opt.message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          trackEvent('whatsapp_click', { service: opt.key, source: 'popup' });
                          close();
                        }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 + i * 0.05 }}
                        whileHover={{ y: -2, boxShadow: '6px 6px 16px rgba(163,177,198,0.6), -4px -4px 12px rgba(255,255,255,0.95)' }}
                        whileTap={{ scale: 0.985 }}
                        className="group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left"
                        style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)' }}
                      >
                        <span
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-extrabold text-amber-600 flex-shrink-0"
                          style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 6px rgba(163,177,198,0.5), inset -2px -2px 6px rgba(255,255,255,0.85)' }}
                        >
                          {opt.phase}
                        </span>
                        <span className="flex-grow min-w-0">
                          <span className="block text-sm font-bold text-slate-900">{opt.service}</span>
                          <span className="block text-xs text-slate-500 leading-snug truncate">{opt.message.replace('Hi Dr. Gravesande 👋 ', '')}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                      </motion.a>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-5">
                    No WhatsApp? Email <a href="mailto:info@preqal.org" className="text-amber-600 font-semibold hover:text-amber-500">info@preqal.org</a> or
                    use the <a href="/contact" className="text-amber-600 font-semibold hover:text-amber-500">contact form</a>.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </WaContext.Provider>
  );
};
