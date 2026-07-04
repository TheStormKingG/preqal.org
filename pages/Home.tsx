import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, CheckSquare } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';
import { useWhatsApp, whatsAppLink, WhatsAppIcon, type WhatsAppServiceKey } from '../components/WhatsAppContact';

const springBtn = { type: 'spring', stiffness: 340, damping: 22 } as const;

/* ─── The journey: one Guyanese entrepreneur, five phases, five services ─── */
interface Phase {
  number: string;
  chapter: string;
  headline: React.ReactNode;
  story: string;
  serviceName: string;
  servicePromise: string;
  deliverables: string[];
  ctaLabel: string;
  waKey: WhatsAppServiceKey;
  img: string;
  imgAlt: string;
  imgPos?: string;
}

const PHASES: Phase[] = [
  {
    number: '01',
    chapter: 'The Idea',
    headline: <>It starts at a <em style={{ color: '#d97706' }}>kitchen table.</em></>,
    story:
      'One recipe. One skill. One dream. Banks say no to dreams — they say yes to plans. We put your idea on paper the way lenders need to see it, with compliance built in from day one.',
    serviceName: 'Business Plan',
    servicePromise: 'Your idea, turned into a bankable plan.',
    deliverables: ['Investor-ready business plan', 'Startup cost & cash map', 'Compliance roadmap'],
    ctaLabel: 'Get your Business Plan',
    waKey: 'business-plan',
    img: 'images/business-team.jpg',
    imgAlt: 'A small Guyanese business team planning at a table',
    imgPos: '50% 18%',
  },
  {
    number: '02',
    chapter: 'The Look',
    headline: <>Now, see it <em style={{ color: '#d97706' }}>clearly.</em></>,
    story:
      "You're too close to your own business to see the gaps. We walk in as fresh eyes. Seven days later you hold a precise map: what's working, what isn't, and what to do next.",
    serviceName: 'Risk Scan™',
    servicePromise: 'See your whole business clearly — in one week.',
    deliverables: ['Red Flag Report', 'Gap check against ISO standards', 'Your action roadmap'],
    ctaLabel: 'Book the Risk Scan',
    waKey: 'risk-scan',
    img: 'images/services/phase1-diagnose.jpg',
    imgAlt: 'Consultant reviewing operations with a client',
  },
  {
    number: '03',
    chapter: 'The Build',
    headline: <>Then we build — <em style={{ color: '#d97706' }}>together.</em></>,
    story:
      'Nine months. One system. Your documents, your training, your audits — built around how your business really works. When the real auditors arrive, you\'ve already passed once.',
    serviceName: 'Systems Builder™',
    servicePromise: 'Walk into your certification audit already knowing how it ends.',
    deliverables: ['Plain-language SOPs your team can use', 'Team training & internal auditors', 'Mock certification audit'],
    ctaLabel: 'Start the 9-month build',
    waKey: 'systems-builder',
    img: 'images/services/phase2-train.jpg',
    imgAlt: 'Team in a quality management training workshop',
  },
  {
    number: '04',
    chapter: 'The Standard',
    headline: <>Pass the audit. <em style={{ color: '#d97706' }}>Keep the standard.</em></>,
    story:
      "Certification isn't a trophy — it's a habit. Systems drift. Staff change. Standards update. We stay beside you so every surveillance visit is just another good day.",
    serviceName: 'Certified Care™',
    servicePromise: 'Stay certified. Keep growing.',
    deliverables: ['Monthly system upkeep', 'Annual internal audit', 'Surveillance-visit support'],
    ctaLabel: 'Stay certified',
    waKey: 'certified-care',
    img: 'images/services/phase3-audit.jpg',
    imgAlt: 'Quality supervisor conducting an audit on the facility floor',
  },
  {
    number: '05',
    chapter: 'The Export',
    headline: <>Your label. On shelves <em style={{ color: '#d97706' }}>abroad.</em></>,
    story:
      'Three gates stand between a small agro-processor and the world: HACCP. ISO 22000. A GFSI certificate buyers trust. Export-Ready™ takes you through all three — and you become a Caribbean export company and international supplier.',
    serviceName: 'Export-Ready™',
    servicePromise: 'From unregulated to export-certified. Made in Guyana, trusted everywhere.',
    deliverables: ['Gate 1 · PRPs + HACCP', 'Gate 2 · ISO 22000 system', 'Gate 3 · GFSI readiness (FSSC 22000 · BRCGS · SQF)'],
    ctaLabel: 'Start Export-Ready™',
    waKey: 'export-ready',
    img: 'images/case-studies/poultry.jpg',
    imgAlt: 'Guyanese agro-processing operation preparing product for export',
  },
];

/* ─── Subtle scroll-parallax image frame ─── */
const ParallaxImage: React.FC<{ src: string; alt: string; pos?: string }> = ({ src, alt, pos }) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.04, 1.1]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl"
      style={{
        aspectRatio: '4 / 3',
        boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
      }}
    >
      <motion.img
        src={`${import.meta.env.BASE_URL}${src}`}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={prefersReduced ? { objectPosition: pos } : { y, scale, objectPosition: pos }}
        loading="lazy"
        width="560"
        height="420"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.08) 0%, transparent 50%, rgba(15,23,42,0.16) 100%)' }}
      />
    </div>
  );
};

/* ─── One phase of the journey ───
   Skiper-style scroll ignition (vertical): each phase starts ghosted and
   "lights up" as the amber journey line reaches it — badge ignites, image
   saturates, copy fades to full. Scrubbed to scroll position, so it plays
   identically on every browser (and degrades to opacity-only under
   reduced-motion settings like Samsung's "remove animations"). */
const PhaseSection: React.FC<{ phase: Phase; index: number }> = ({ phase, index }) => {
  const flip = index % 2 === 1;
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [lit, setLit] = useState(false);

  // 0 → 1 as the section travels from below the fold to mid-viewport
  const { scrollYProgress: ignite } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.42'],
  });

  const contentOpacity = useTransform(ignite, [0, 1], [0.25, 1]);
  const contentY = useTransform(ignite, [0, 1], [36, 0]);
  const imgFilter = useTransform(ignite, (v) => `grayscale(${Math.round((1 - v) * 85)}%) brightness(${0.96 + v * 0.04})`);
  const imgOpacity = useTransform(ignite, [0, 1], [0.45, 1]);

  useMotionValueEvent(ignite, 'change', (v) => setLit(v > 0.66));

  return (
    <section ref={ref} id={`phase-${index + 1}`} className="relative py-14 sm:py-16">
      <div className={`flex flex-col lg:items-center gap-10 lg:gap-16 ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

        {/* Copy — scroll-scrubbed ignition */}
        <motion.div
          className="flex-1 min-w-0"
          style={prefersReduced ? { opacity: contentOpacity } : { opacity: contentOpacity, y: contentY }}
        >
          <div>
            <div className="flex items-center gap-4 mb-5">
              <motion.div
                animate={lit ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                style={
                  lit
                    ? {
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '4px 4px 14px rgba(217,119,6,0.45), -3px -3px 10px rgba(255,255,255,0.7), 0 0 24px rgba(245,158,11,0.35)',
                        transition: 'background 0.4s ease, box-shadow 0.4s ease',
                      }
                    : {
                        background: '#e0e5ec',
                        boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.55), inset -3px -3px 8px rgba(255,255,255,0.85)',
                        transition: 'background 0.4s ease, box-shadow 0.4s ease',
                      }
                }
              >
                <span
                  className="text-base font-extrabold leading-none"
                  style={{ color: lit ? '#ffffff' : '#94a3b8', transition: 'color 0.4s ease' }}
                >
                  {phase.number}
                </span>
              </motion.div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: lit ? '#d97706' : '#94a3b8', transition: 'color 0.4s ease' }}
              >
                Phase {phase.number} · {phase.chapter}
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] mb-4">
              {phase.headline}
            </h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-[480px] mb-6">{phase.story}</p>

            {/* Service card */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="rounded-2xl p-6 max-w-[520px]"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(255,255,255,0.92)',
              }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 mb-1.5">
                The service for this phase
              </p>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Preqal {phase.serviceName}</h3>
              <p className="text-sm text-slate-500 italic mb-4">"{phase.servicePromise}"</p>
              <div className="flex flex-col gap-2 mb-5">
                {phase.deliverables.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-2.5 text-sm text-slate-600 px-3 py-2 rounded-xl"
                    style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn} className="inline-block">
                <a
                  href={whatsAppLink(phase.waKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.6)' }}
                >
                  <WhatsAppIcon className="h-4 w-4" /> {phase.ctaLabel}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Image — desaturated until the journey line reaches it */}
        <motion.div
          className="flex-1 min-w-0 w-full lg:max-w-[520px]"
          style={{ filter: imgFilter, opacity: imgOpacity }}
        >
          <ParallaxImage src={phase.img} alt={phase.imgAlt} pos={phase.imgPos} />
        </motion.div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const { openWhatsApp } = useWhatsApp();
  const journeyRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ['start 0.7', 'end 0.75'] });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(heroProgress, [0, 1], ['0%', '12%']);

  return (
    <>
      <SEO pageKey="home" />
      <div className="w-full overflow-x-hidden">

        {/* ── Hero ── */}
        <section ref={heroRef} className="px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14">

              <div className="flex-1 lg:max-w-[580px] mb-10 lg:mb-0">
                <motion.div
                  className="inline-flex items-center gap-2 text-amber-600 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-8"
                  style={{ background: '#e0e5ec', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <span className="text-amber-500">◆</span>
                  <span>From idea to export · The Preqal journey</span>
                </motion.div>

                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-slate-900 leading-[1.05] mb-3"
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  Every big brand<br />started small.
                </motion.h1>
                <motion.p
                  className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-[1.05] mb-7"
                  style={{ fontStyle: 'italic', color: '#f59e0b' }}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  Yours is next.
                </motion.p>

                <motion.p
                  className="text-base text-slate-600 leading-relaxed mb-9 max-w-[480px]"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 }}
                >
                  We take Guyanese businesses from one good idea to Caribbean export brand —
                  five phases, one service for each, step by step. Scroll and watch the journey.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.4 }}
                >
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                    <a
                      href="#phase-1"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '5px 5px 14px rgba(217,119,6,0.38), -2px -2px 8px rgba(255,255,255,0.6)' }}
                    >
                      Start the journey ↓
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-amber-600 font-bold text-sm"
                      style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px #a3b1c6, -4px -4px 10px #ffffff', border: '1.5px solid rgba(245,158,11,0.35)' }}
                    >
                      <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp Dr. Gravesande
                    </button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Hero image — gentle parallax on scroll */}
              <motion.div
                className="flex-shrink-0 w-full lg:w-[520px]"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative overflow-hidden rounded-3xl"
                  style={{
                    aspectRatio: '4 / 3.2',
                    boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
                  }}
                >
                  <motion.img
                    src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
                    alt="Business leader relaxed and confident at their desk"
                    className="w-full h-full object-cover"
                    style={prefersReduced ? { objectPosition: 'center top' } : { objectPosition: 'center top', y: heroImgY, scale: 1.08 }}
                    width="520"
                    height="416"
                  />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── The Journey ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal yFrom={14}>
              <div className="text-center mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">One journey · Five phases</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Picture a Guyanese entrepreneur<br />
                  <span className="text-amber-600">with one good idea.</span>
                </h2>
                <p className="text-base text-slate-500 mt-4 max-w-[520px] mx-auto leading-relaxed">
                  Here's how that idea becomes an international supplier — and the exact service
                  that carries it through each phase.
                </p>
              </div>
            </ScrollReveal>

            {/* Journey line + phases */}
            <div ref={journeyRef} className="relative">
              {/* progress line — draws as you scroll (desktop) */}
              <div aria-hidden="true" className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
                <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(163,177,198,0.35)' }} />
                <motion.div
                  className="absolute inset-x-0 top-0 rounded-full origin-top"
                  style={{
                    background: 'linear-gradient(to bottom, #f59e0b, #d97706)',
                    height: '100%',
                    scaleY: prefersReduced ? 1 : scrollYProgress,
                  }}
                />
              </div>

              {PHASES.map((phase, i) => (
                <PhaseSection key={phase.number} phase={phase} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Proof band ── */}
        <div className="relative overflow-hidden py-16 sm:py-20" style={{ background: '#0f172a' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(245,158,11,0.05) 0%, transparent 50%)',
          }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal yFrom={16}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4">This road has been walked before</p>
              <div className="flex flex-col md:flex-row md:items-end gap-10 md:gap-20">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-5">
                    The businesses that made it<br />
                    <em style={{ color: '#f59e0b' }}>didn't get lucky.</em>
                  </h2>
                  <p className="text-white/55 text-base leading-relaxed max-w-[480px]">
                    They took the journey one phase at a time — with a system built for their
                    business, trained into their team, and tested against ISO 9001, ISO 14001,
                    ISO 45001, FSSC 22000, GMP+, and HACCP.
                  </p>
                </div>
                <div className="flex gap-12 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-400">98%</div>
                    <div className="text-xs text-white/40 font-medium mt-1 leading-snug">audit pass rate<br />across Preqal clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-400">9mo</div>
                    <div className="text-xs text-white/40 font-medium mt-1 leading-snug">average time to<br />full certification</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ── Final CTA ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 pb-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
                boxShadow: '10px 10px 28px rgba(180,83,9,0.3), -6px -6px 20px rgba(255,200,80,0.18)',
              }}
            >
              <div className="p-8 md:p-14 text-center">
                <motion.p
                  className="text-amber-200 text-xs font-semibold uppercase tracking-widest mb-4"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  Your Phase 01 starts here
                </motion.p>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  Wherever you are on the journey,<br />there's one next step.
                </motion.h2>
                <motion.p
                  className="text-amber-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  Message Dr. Gravesande on WhatsApp. No pressure. No jargon. Tell him where
                  you are — he'll tell you your next move, whatever you decide.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-amber-700 text-base w-full sm:w-auto"
                      style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '4px 4px 14px rgba(0,0,0,0.12), -2px -2px 8px rgba(255,255,255,0.15)' }}
                    >
                      <WhatsAppIcon className="mr-2 h-5 w-5 text-[#25D366]" /> Message Dr. Gravesande
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                    <Link
                      to="/resources"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white text-base w-full sm:w-auto"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Free Templates
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Disambiguation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-slate-400">Preqal is a brand name and not the word "prequel".</p>
        </div>

      </div>
    </>
  );
};

export default Home;
