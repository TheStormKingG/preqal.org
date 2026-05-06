import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Shield, Heart, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SaturnStage from '../components/ui/SaturnStage';
import SEO from '../components/SEO';

/* ─── Spring preset ─────────────────────────────────── */
const spring = { type: 'spring', stiffness: 300, damping: 24 } as const;

/* ─── Data ──────────────────────────────────────────── */
const PAIN_POINTS = [
  'Processes your team follows differently every day',
  'Documentation gaps your next auditor will find first',
  'Regulations you didn't know applied to you',
];

const QUALITY_CARDS = [
  {
    img: 'testimonial-dionne.jpg',
    imgPos: '50% 12%',
    icon: <Shield className="h-5 w-5" />,
    title: 'Lead with complete confidence',
    body: 'Walk into your next audit knowing every document, procedure, and control is exactly where it should be. You stop hoping — you know.',
  },
  {
    img: 'business-team.jpg',
    imgPos: '50% 18%',
    icon: <Heart className="h-5 w-5" />,
    title: 'Your staff will love showing up',
    body: 'When the system is clear, every person knows their role and takes pride in it. That clarity turns a team into a culture people stay for.',
  },
  {
    img: 'testimonial-priya.jpg',
    imgPos: '50% 35%',
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Your business keeps getting stronger',
    body: 'Every gap closes. Every system tightens. Every year you\'re more capable than the last — and the clients you want start noticing.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Scan',
    desc: 'In 7 days you\'ll have a Red Flag Report — every gap named, prioritised, and mapped.',
  },
  {
    number: '02',
    title: 'Build',
    desc: 'Preqal designs your quality, safety, and compliance system around how you actually work.',
  },
  {
    number: '03',
    title: 'Lead',
    desc: 'Your team is trained. Your audits are passed. Your story becomes one you\'re proud to tell.',
  },
];

const STANDARDS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'FSSC 22000', 'GMP+', 'HACCP'];

/* ──────────────────────────────────────────────────── */

const Home: React.FC = () => {
  return (
    <>
      <SEO pageKey="home" />
      <div className="w-full overflow-x-hidden">

        {/* ══ Section 1: Hero — full viewport ══════════════════ */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-7 pb-12 lg:pt-10 lg:pb-16">

          {/* Headline above the hero container */}
          <div className="max-w-7xl mx-auto mb-4 px-1">
            <motion.h1
              className="text-3xl md:text-5xl lg:text-[3.4rem] font-bold text-slate-900 leading-tight"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              The leaders who sleep soundly...
            </motion.h1>
          </div>

          <div
            className="relative max-w-7xl mx-auto rounded-[20px] overflow-hidden"
            style={{ boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -10px -10px 28px rgba(255,255,255,0.92)' }}
          >
            {/* Background image */}
            <img
              src={`${import.meta.env.BASE_URL}images/hero-bg.jpg`}
              alt="" aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-right-top md:object-center"
            />

            {/* ── Mobile layout ── */}
            <div className="flex flex-col items-stretch md:hidden relative" style={{ padding: '16px', zIndex: 2 }}>
              <div style={{
                borderRadius: '16px', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.96)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 6px 6px 20px rgba(0,0,0,0.22)',
              }}>
                {/* Saturn */}
                <motion.div
                  style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '24px 16px 20px', minHeight: '260px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                    borderBottom: '2px solid rgba(255,255,255,0.90)',
                  }}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55 }}
                >
                  <div style={{ transform: 'scale(0.87)', transformOrigin: 'center center' }}>
                    <SaturnStage imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`} imageAlt="Stabroek Market Clock Tower" size="md" />
                  </div>
                </motion.div>
                {/* Text */}
                <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '16px 20px 20px' }}>
                  <motion.p
                    className="font-bold text-amber-600 leading-tight mb-2"
                    style={{ fontSize: '1.15rem' }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.07 }}
                  >
                    ...build things right.
                  </motion.p>
                  <motion.p
                    className="text-slate-700 leading-relaxed mb-3 text-sm"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.14 }}
                  >
                    Preqal builds the quality, safety, and compliance systems that make your business bulletproof — and your team proud.
                  </motion.p>
                  <motion.div
                    className="flex gap-2.5"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.21 }}
                  >
                    <Link
                      to="/book"
                      className="inline-block px-4 py-2 rounded-[8px] text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '3px 3px 8px rgba(217,119,6,0.3)' }}
                    >
                      Book a Risk Scan
                    </Link>
                    <Link
                      to="/case-studies"
                      className="inline-block px-4 py-2 rounded-[8px] text-slate-700 font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}
                    >
                      See Results
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* ── Desktop layout ── */}
            <div
              className="hidden md:flex md:flex-row"
              style={{ height: 'calc(100dvh - 200px)', position: 'relative', zIndex: 2 }}
            >
              <div style={{ flex: '0 0 50%', minWidth: 0, display: 'flex', alignItems: 'center', padding: '32px 40px 32px 36px', zIndex: 4, position: 'relative' }}>
                <div style={{
                  width: '100%', borderRadius: '18px', overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.96)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 8px 8px 28px rgba(0,0,0,0.28), -2px -2px 8px rgba(255,255,255,0.2)',
                }}>
                  {/* Saturn */}
                  <motion.div
                    style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      padding: '28px 24px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                      borderBottom: '2px solid rgba(255,255,255,0.90)',
                    }}
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                  >
                    <div style={{ transform: 'scale(0.74)', transformOrigin: 'center center' }}>
                      <SaturnStage imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`} imageAlt="Stabroek Market Clock Tower — Preqal's compliance systems built for the real world" size="md" />
                    </div>
                  </motion.div>
                  {/* Text */}
                  <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '24px 28px 28px' }}>
                    <motion.p
                      className="text-[2.5rem] font-bold text-amber-600 leading-tight mb-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      ...build things right.
                    </motion.p>
                    <motion.p
                      className="text-[0.95rem] text-slate-700 mb-2 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.16 }}
                    >
                      Preqal builds the quality, safety, and compliance systems that make your business bulletproof, your audits smooth, and your people proud of where they work.
                    </motion.p>
                    <motion.p
                      className="text-[0.78rem] text-slate-500 mb-6 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.21 }}
                    >
                      ISO 9001 · ISO 14001 · ISO 45001 · FSSC 22000 · HACCP · GMP+
                    </motion.p>
                    <motion.div
                      className="flex gap-2.5"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.26 }}
                    >
                      <Link
                        to="/book"
                        className="px-5 py-2.5 rounded-[10px] text-white text-[0.82rem] font-semibold"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(217,119,6,0.35)' }}
                      >
                        Book a Risk Scan
                      </Link>
                      <Link
                        to="/case-studies"
                        className="px-5 py-2.5 rounded-[10px] text-[0.82rem] text-slate-800 font-semibold"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '2px 2px 8px rgba(0,0,0,0.08)' }}
                      >
                        See What's Possible
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
              <div style={{ flex: '0 0 50%' }} />
              {/* Scroll cue */}
              <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 4 }}>
                <div style={{ width: '1px', height: '22px', background: 'linear-gradient(to bottom, rgba(245,158,11,0.45), transparent)' }} />
                <div className="animate-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </section>

        {/* ══ Section 2: Recognition — the hidden threat ════════ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-14">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal yFrom={16}>
              <div className="rounded-3xl overflow-hidden" style={{ background: '#d8dde6', boxShadow: '8px 8px 22px rgba(150,165,190,0.6), -6px -6px 18px rgba(255,255,255,0.7)' }}>
                <div className="p-8 md:p-12">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">The honest picture</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    Most businesses are one audit away<br className="hidden md:block" />
                    <span className="text-slate-500"> from a very expensive wake-up call.</span>
                  </h2>
                  <p className="text-slate-500 text-sm mb-7 max-w-xl leading-relaxed">
                    The risk is already there. It's silent, invisible, and compounding — until it isn't.
                  </p>

                  {/* Pain point chips — horizontal on desktop, stacked on mobile */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {PAIN_POINTS.map((point, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, boxShadow: '4px 4px 12px rgba(150,165,190,0.5), -3px -3px 8px rgba(255,255,255,0.85)', background: '#e8ecf2' }}
                        transition={spring}
                        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm text-slate-600 leading-relaxed cursor-default flex-1"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(150,165,190,0.5), inset -2px -2px 6px rgba(255,255,255,0.8)' }}
                      >
                        <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">·</span>
                        <span>{point}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bridge: stat + promise */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6" style={{ borderTop: '1px solid rgba(163,177,198,0.3)' }}>
                    <p className="text-xl font-semibold text-slate-800 leading-relaxed flex-1">
                      You've built something real —<br />
                      <span className="text-amber-600">you deserve to know it's protected.</span>
                    </p>
                    <div className="flex gap-10 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-600">98%</div>
                        <div className="text-xs text-slate-500 font-medium mt-1 leading-snug">audit pass rate<br />across Preqal clients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-600">9mo</div>
                        <div className="text-xs text-slate-500 font-medium mt-1 leading-snug">average time to<br />full certification</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══ Section 3: What quality gives you ════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-10">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Why it matters</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Quality isn't paperwork.<br />
                  <span className="text-amber-600">It's the system that sets your people free.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {QUALITY_CARDS.map((card, i) => (
                <ScrollReveal key={i} delay={i * 100} yFrom={20}>
                  <div style={{ perspective: '900px', height: '100%' }}>
                    <motion.div
                      whileHover={{
                        rotateX: -4,
                        rotateY: i === 0 ? 5 : i === 2 ? -5 : 0,
                        scale: 1.025,
                        boxShadow: '14px 16px 32px rgba(163,177,198,0.52), -6px -6px 20px rgba(255,255,255,0.98)',
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className="h-full flex flex-col overflow-hidden cursor-default"
                      style={{
                        background: 'rgba(255,255,255,0.68)',
                        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                        borderRadius: '18px',
                        boxShadow: '6px 6px 18px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.95)',
                        border: '1px solid rgba(255,255,255,0.82)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Card image — 180px (was 352px) */}
                      <div className="flex-shrink-0 overflow-hidden relative" style={{ height: '180px' }}>
                        <img
                          src={`${import.meta.env.BASE_URL}images/${card.img}`}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ objectPosition: card.imgPos }}
                          loading="lazy"
                        />
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.82))',
                          }}
                        />
                      </div>
                      {/* Card body */}
                      <div className="flex flex-col flex-1 p-6 pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0"
                            style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -2px -2px 6px rgba(255,255,255,0.85), 0 0 14px rgba(245,158,11,0.12)' }}
                          >
                            {card.icon}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{card.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
                      </div>
                    </motion.div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Dark band: proof bridge ══════════════════════════ */}
        <div className="relative overflow-hidden py-16 sm:py-20" style={{ background: '#0f172a' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(245,158,11,0.05) 0%, transparent 50%)',
          }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal yFrom={16}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4">The Preqal result</p>
              <div className="flex flex-col md:flex-row md:items-end gap-10 md:gap-20">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-5">
                    The businesses that sleep soundly<br />
                    <em style={{ color: '#f59e0b' }}>didn't get lucky.</em>
                  </h2>
                  <p className="text-white/55 text-base leading-relaxed max-w-[480px] mb-6">
                    They stopped guessing and started leading — with a system built for their
                    business, trained into their team, and tested against the standards that matter.
                  </p>
                  {/* Outcome list */}
                  <div className="flex flex-col gap-2.5">
                    {[
                      'Audits passed — first time, every time',
                      'Staff who follow the system because it makes sense',
                      'A business that keeps getting better on its own',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span className="text-white/70 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
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

        {/* ══ Section 4: The path — 3 steps ════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-14">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">The process</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Three steps to a business<br />
                  <span className="text-amber-600">that runs right.</span>
                </h2>
              </div>

              <div className="relative">
                {/* Connecting line — desktop */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute top-9 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
                  style={{ background: 'linear-gradient(to right, rgba(245,158,11,0.25), rgba(245,158,11,0.55), rgba(245,158,11,0.25))' }}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {STEPS.map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ scale: 1.12, y: -8, boxShadow: '10px 12px 24px rgba(163,177,198,0.6), -8px -8px 20px rgba(255,255,255,0.9), 0 0 22px rgba(245,158,11,0.18)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        className="relative z-10 h-[72px] w-[72px] rounded-full flex flex-col items-center justify-center mb-6 flex-shrink-0 cursor-default"
                        style={{ background: '#e0e5ec', boxShadow: '6px 6px 16px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.85)' }}
                      >
                        <span className="text-[10px] font-bold text-amber-500 tracking-widest leading-none">{step.number}</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">{step.title}</span>
                      </motion.div>
                      <p className="text-slate-600 leading-relaxed text-sm max-w-[220px]">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standards — inline strip, compact */}
              <div className="mt-12 flex flex-wrap justify-center gap-2">
                <span className="text-xs text-slate-400 font-medium self-center mr-2">Aligned with:</span>
                {STANDARDS.map((std) => (
                  <span
                    key={std}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600"
                    style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px rgba(163,177,198,0.5), -2px -2px 6px rgba(255,255,255,0.85)' }}
                  >
                    {std}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══ Section 5: CTA ════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 pb-24">
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
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
                >
                  Your next chapter starts here
                </motion.p>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
                >
                  This is where your<br />story changes.
                </motion.h2>
                <motion.p
                  className="text-amber-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }}
                >
                  In seven days you'll know exactly where you stand — every gap, every risk, every opportunity. No jargon. No pressure. Just the clarity you've been looking for.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                    <Link
                      to="/book"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-amber-700 text-base w-full sm:w-auto"
                      style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '4px 4px 14px rgba(0,0,0,0.12), -2px -2px 8px rgba(255,255,255,0.15)' }}
                    >
                      Book Your Risk Scan <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                    <Link
                      to="/resources"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white text-base w-full sm:w-auto"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Free Templates
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.p
                  className="text-amber-200 text-sm mt-6 opacity-75"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 0.75 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.55 }}
                >
                  5 ready-to-use compliance templates — no commitment required
                </motion.p>
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
