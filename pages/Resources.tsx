import React from 'react';
import { Download, FileText, ShieldCheck, ClipboardList, AlertTriangle, GraduationCap, FolderDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';
import { useWhatsApp } from '../components/WhatsAppContact';

/* ─── Free template library — direct downloads, no form ─── */
interface TemplateDoc {
  icon: React.ReactNode;
  docId: string;
  title: string;
  desc: string;
  file: string;
  type: 'Word' | 'Excel';
  size: string;
}

const TEMPLATES: TemplateDoc[] = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
    docId: 'POL-01',
    title: 'IMS QHSE Policy',
    desc: 'Your top-level quality, health, safety & environment policy — the document every management system starts with.',
    file: 'YOUR-POL-01-IMS QHSE Policy.docx',
    type: 'Word',
    size: '29 KB',
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-amber-600" />,
    docId: 'PRO-01',
    title: 'IMS Document Control Procedure',
    desc: 'How documents get created, approved, updated, and retired — the backbone procedure auditors always check first.',
    file: 'YOUR-PRO-01-IMS Document Control Procedure.docx',
    type: 'Word',
    size: '2 MB',
  },
  {
    icon: <FileText className="h-5 w-5 text-amber-600" />,
    docId: 'RGS-01',
    title: 'IMS Document Master Register',
    desc: 'One register that tracks every document in your system — number, version, owner, and review date.',
    file: 'YOUR-RGS-01-IMS Document Master Register.xlsx',
    type: 'Excel',
    size: '77 KB',
  },
  {
    icon: <GraduationCap className="h-5 w-5 text-amber-600" />,
    docId: 'RGS-05',
    title: 'IMS Competency Register',
    desc: 'Track who is trained on what, when they were assessed, and when refreshers are due.',
    file: 'YOUR-RGS-05-IMS Competency Register.xlsx',
    type: 'Excel',
    size: '36 KB',
  },
  {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    docId: 'RGS-08',
    title: 'IMS Risk Assessment Register',
    desc: 'Name your risks, score them, assign controls — the register that turns worry into a plan.',
    file: 'YOUR-RGS-08-IMS Risk Assessment Register.xlsx',
    type: 'Excel',
    size: '86 KB',
  },
];

const Resources: React.FC = () => {
  const base = import.meta.env.BASE_URL;
  const { openWhatsApp } = useWhatsApp();

  return (
    <>
      <SEO pageKey="resources" />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="pt-20 pb-14 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', transform: 'translate(25%, -30%)' }}
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.p
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              Free templates · No forms, no strings
            </motion.p>
            <motion.h1
              className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Start building before<br />
              <em style={{ color: '#d97706' }}>you spend a penny.</em>
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
            >
              Five professional templates — the same foundation our consultants install on
              day one. Click, download, use. That's it.
            </motion.p>
          </div>
        </section>

        {/* ── TEMPLATE LIST ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {TEMPLATES.map((t, i) => (
              <ScrollReveal key={t.docId} delay={i * 70} yFrom={16}>
                <motion.div
                  whileHover={{ y: -3, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-2xl p-5 sm:p-6 flex items-start sm:items-center gap-4 flex-col sm:flex-row"
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.92)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                        {t.docId}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{t.title}</h2>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{t.type} · {t.size}</p>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                    href={`${base}templates/${encodeURIComponent(t.file)}`}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.6)' }}
                  >
                    <Download className="h-4 w-4" /> Download
                  </motion.a>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Download all */}
          <ScrollReveal yFrom={16} delay={120}>
            <div
              className="mt-8 rounded-2xl p-6 sm:p-7 flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left"
              style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 12px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.8)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px rgba(163,177,198,0.55), -4px -4px 10px rgba(255,255,255,0.85)' }}
              >
                <FolderDown className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-grow">
                <p className="text-base font-bold text-slate-900">Want everything at once?</p>
                <p className="text-sm text-slate-500">All five templates in one ZIP — 2.2 MB.</p>
              </div>
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                href={`${base}premium-templates.zip`}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-amber-600 font-bold text-sm flex-shrink-0"
                style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px #a3b1c6, -4px -4px 10px #ffffff', border: '1.5px solid rgba(245,158,11,0.35)' }}
              >
                <Download className="h-4 w-4" /> Download all (ZIP)
              </motion.a>
            </div>
          </ScrollReveal>

          {/* Next step */}
          <ScrollReveal yFrom={16} delay={160}>
            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-4">
                Templates are the starting point. A system built around <em className="text-amber-600 not-italic font-semibold">your</em> business
                is the destination.
              </p>
              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors border-b-2 border-amber-300/50 hover:border-amber-500 pb-0.5"
              >
                Message Dr. Gravesande on WhatsApp <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </>
  );
};

export default Resources;
