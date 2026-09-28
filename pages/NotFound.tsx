import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useWhatsApp, WhatsAppIcon } from '../components/WhatsAppContact';
import { href } from '../lib/paths';

/* Until this existed there was no catch-all route, so an unknown path rendered
   the navbar, the footer, and nothing between them — measured as zero
   characters of main content and no <h1> at all. A blank page tells a visitor
   nothing and offers no way out, which is worse than an error, because an
   error at least says something happened. */

const DESTINATIONS = [
  { to: '/',          label: 'Home',      note: 'The five steps, start to finish' },
  { to: '/services',  label: 'Services',  note: 'Business plan, Risk Scan, systems, certification' },
  { to: '/resources', label: 'Templates', note: 'Free downloads, no form' },
  { to: '/guides',    label: 'Guides',    note: 'ISO cost, HACCP, exporting from Guyana' },
  { to: '/contact',   label: 'Contact',   note: 'Reach Dr. Gravesande directly' },
];

const NotFound: React.FC = () => {
  const { openWhatsApp } = useWhatsApp();

  return (
    <>
      <SEO pageKey="notFound" />
      <div className="min-h-screen pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Error 404
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
              That page isn&rsquo;t here — but{' '}
              <em style={{ color: '#b45309' }}>what you came for probably is.</em>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10">
              The address may be mistyped, or the page may have moved. Nothing is broken on
              your end. Here is everything on the site.
            </p>
          </motion.div>

          <nav aria-label="Main destinations" className="flex flex-col gap-3 mb-12">
            {DESTINATIONS.map((d, i) => (
              <motion.div
                key={d.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
              >
                <Link
                  to={href(d.to)}
                  className="group flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{
                    background: '#e0e5ec',
                    boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)',
                  }}
                >
                  <span className="flex-grow min-w-0">
                    <span className="block text-base font-bold text-slate-900">{d.label}</span>
                    <span className="block text-sm text-slate-500">{d.note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div
            className="rounded-2xl p-6 sm:p-7"
            style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 12px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.8)' }}
          >
            <p className="text-base font-bold text-slate-900 mb-1">Looking for something specific?</p>
            <p className="text-sm text-slate-500 mb-5">
              Tell Dr. Gravesande what you were trying to find and he will point you at it.
            </p>
            <button
              type="button"
              onClick={() => openWhatsApp('not_found')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-900 font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.6)',
              }}
            >
              <WhatsAppIcon className="h-4 w-4" /> Message Dr. Gravesande
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default NotFound;
