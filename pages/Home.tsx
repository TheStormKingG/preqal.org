import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Shield, Heart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import SaturnStage from '../components/ui/SaturnStage';
import SEO from '../components/SEO';

const PAIN_POINTS = [
  'Documentation gaps your next auditor will find',
  'Processes your team follows differently every day',
  'Regulations you didn\'t know applied to you',
];

const QUALITY_CARDS = [
  {
    img: 'testimonial-dionne.jpg',
    imgPos: '50% 12%',
    icon: <Shield className="h-7 w-7" />,
    title: 'Lead with complete confidence',
    before: 'Right now: bracing for the next audit, inspection, or client demand.',
    after: 'With Preqal: you walk in ready — every time, for anything.',
  },
  {
    img: 'business-team.jpg',
    imgPos: '50% 18%',
    icon: <Heart className="h-7 w-7" />,
    title: 'Your staff will love coming to work',
    before: 'Right now: your team improvises because the system isn\'t clear.',
    after: 'With Preqal: every person knows their role, feels valued, and takes pride in it.',
  },
  {
    img: 'testimonial-priya.jpg',
    imgPos: '50% 35%',
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'Your business keeps getting better',
    before: 'Right now: the same problems resurface, year after year.',
    after: 'With Preqal: every gap closes. Every year you\'re stronger than the last.',
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
    desc: 'Preqal designs your quality, safety, and environmental system around how you actually work.',
  },
  {
    number: '03',
    title: 'Lead',
    desc: 'Your team is trained. Your audits are passed. Your story is one you\'re proud to tell.',
  },
];

const STANDARDS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'FSSC 22000', 'GMP+', 'HACCP'];


const Home: React.FC = () => {
  return (
    <>
      <SEO pageKey="home" />
      <div className="w-full overflow-x-hidden">

        {/* ── Section 1: Hero ── */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-7 pb-12 lg:pt-10 lg:pb-16">

          {/* Headline above the container */}
          <div className="max-w-7xl mx-auto mb-4 px-1">
            <motion.h1
              className="text-3xl md:text-5xl lg:text-[3.4rem] font-bold text-slate-900 leading-tight"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              The leaders who sleep soundly...
            </motion.h1>
          </div>

          <div
            className="relative max-w-7xl mx-auto rounded-[20px] overflow-hidden"
            style={{
              boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -10px -10px 28px rgba(255,255,255,0.92)',
            }}
          >
            {/* Background image — 100% visible, no overlay */}
            <img
              src={`${import.meta.env.BASE_URL}images/hero-bg.jpg`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-right-top md:object-center"
            />

            {/* Mobile layout */}
            <div
              className="flex flex-col items-stretch md:hidden relative"
              style={{ padding: '16px', zIndex: 2 }}
            >
              {/* Same split-card as desktop, adapted for mobile */}
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.96)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 6px 6px 20px rgba(0,0,0,0.22)',
              }}>
                {/* Top 2/3 — Saturn, 95% transparent */}
                <motion.div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '24px 16px 20px',
                    minHeight: '260px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    borderBottom: '2px solid rgba(255,255,255,0.90)',
                  }}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
                >
                  <div style={{ transform: 'scale(0.87)', transformOrigin: 'center center' }}>
                    <SaturnStage imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`} imageAlt="Stabroek Market Clock Tower" size="md" />
                  </div>
                </motion.div>
                {/* Bottom 1/3 — text, 82% white */}
                <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '16px 20px 20px' }}>
                  <motion.p
                    className="font-bold text-amber-600 leading-tight mb-2"
                    style={{ fontSize: '1.15rem' }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.07 }}
                  >
                    ...build things right.
                  </motion.p>
                  <motion.p
                    className="text-slate-900 leading-relaxed mb-3 text-sm"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }}
                  >
                    Preqal gives businesses the quality, safety, and compliance systems that protect everything you've built.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.21 }}>
                    <Link
                      to="/book"
                      className="inline-block px-4 py-2 rounded-[8px] text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '3px 3px 8px rgba(217,119,6,0.3)' }}
                    >
                      Book a Risk Scan
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Desktop layout */}
            <div
              className="hidden md:flex md:flex-row"
              style={{ height: 'calc(100dvh - 200px)', position: 'relative', zIndex: 2 }}
            >
              <div style={{ flex: '0 0 50%', minWidth: 0, display: 'flex', alignItems: 'center', padding: '32px 40px 32px 36px', zIndex: 4, position: 'relative' }}>
                {/* Split card: top = Saturn (90% transparent), bottom = text (70% transparent) */}
                <div style={{
                  width: '100%',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.96)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 8px 8px 28px rgba(0,0,0,0.28), -2px -2px 8px rgba(255,255,255,0.2)',
                }}>
                  {/* Top half — Saturn, 95% transparent, minimal blur */}
                  <motion.div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '28px 24px 20px',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      borderBottom: '2px solid rgba(255,255,255,0.90)',
                    }}
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.05 }}
                  >
                    <div style={{ transform: 'scale(0.74)', transformOrigin: 'center center' }}>
                      <SaturnStage imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`} imageAlt="Stabroek Market Clock Tower — Preqal's compliance systems built for the real world" size="md" />
                    </div>
                  </motion.div>

                  {/* Bottom half — 50% transparent, 30% more white for text legibility */}
                  <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '24px 28px 28px' }}>
                    <motion.p
                      className="text-[2.5rem] font-bold text-amber-600 leading-tight mb-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      ...build things right.
                    </motion.p>
                    <motion.p
                      className="text-[1rem] text-slate-900 mb-6 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
                    >
                      Preqal gives businesses the quality, safety, and compliance systems that protect everything you've built — and make your team proud to show up.
                    </motion.p>
                    <motion.div
                      className="flex gap-2.5"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
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

              {/* Right side — background image fills freely */}
              <div style={{ flex: '0 0 50%' }} />

              {/* Scroll indicator */}
              <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 4 }}>
                <div style={{ width: '1px', height: '22px', background: 'linear-gradient(to bottom, rgba(245,158,11,0.45), transparent)' }} />
                <div className="animate-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: The Problem ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal yFrom={16}>
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: '#d8dde6',
                  boxShadow: '8px 8px 22px rgba(150,165,190,0.6), -6px -6px 18px rgba(255,255,255,0.7)',
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left: text content */}
                  <div className="flex-1 p-8 md:p-12">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">The honest picture</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                      Most businesses are running on<br className="hidden md:block" />
                      <span className="text-slate-500"> invisible risk right now.</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {PAIN_POINTS.map((point, i) => (
                        <motion.div
                          key={i}
                          whileHover={{
                            y: -3,
                            boxShadow: '4px 4px 12px rgba(150,165,190,0.5), -3px -3px 8px rgba(255,255,255,0.85)',
                            background: '#e8ecf2',
                          }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm text-slate-600 leading-relaxed cursor-default"
                          style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(150,165,190,0.5), inset -2px -2px 6px rgba(255,255,255,0.8)' }}
                        >
                          <span className="text-amber-500 font-bold text-base mt-0.5 flex-shrink-0">{i + 1}.</span>
                          <span>{point}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <p className="text-xl font-semibold text-slate-800 leading-relaxed">
                        You've built something real —<br />
                        <span className="text-amber-600">you deserve to know it's protected.</span>
                      </p>
                      <div className="flex-shrink-0 text-center">
                        <div className="text-5xl font-bold text-amber-600">98%</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">audit pass rate<br />across Preqal clients</div>
                      </div>
                    </div>
                  </div>
                  {/* Right: contextual image — real business, real stakes */}
                  <div className="hidden md:block md:w-64 lg:w-80 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={`${import.meta.env.BASE_URL}images/invisible-risk.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* fade into the dark background on the left edge */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute', inset: 0, left: 0,
                        background: 'linear-gradient(to right, #d8dde6 0%, rgba(216,221,230,0.6) 35%, transparent 70%)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Section 3: What Quality Actually Does ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-12">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Why it matters</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Quality isn't paperwork.<br />
                  <span className="text-amber-600">It's the system that sets your people free.</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {QUALITY_CARDS.map((card, i) => (
                <ScrollReveal key={i} delay={i * 120} yFrom={20}>
                  <div style={{ perspective: '900px', height: '100%' }}>
                    <motion.div
                      whileHover={{
                        rotateX: -4,
                        rotateY: i === 0 ? 5 : i === 2 ? -5 : 0,
                        scale: 1.025,
                        boxShadow: '14px 16px 32px rgba(163,177,198,0.52), -6px -6px 20px rgba(255,255,255,0.98), inset 0 1px 0 rgba(255,255,255,0.95)',
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className="h-full flex flex-col overflow-hidden cursor-default"
                      style={{
                        background: 'rgba(255,255,255,0.68)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderRadius: '18px',
                        boxShadow: '6px 6px 18px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.9)',
                        border: '1px solid rgba(255,255,255,0.82)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Card header image */}
                      <div className="h-[352px] flex-shrink-0 overflow-hidden relative">
                        <img
                          src={`${import.meta.env.BASE_URL}images/${card.img}`}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ objectPosition: card.imgPos }}
                          loading="lazy"
                        />
                        {/* fade into card background at bottom */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px',
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.85))',
                          }}
                        />
                      </div>
                      {/* Card body */}
                      <div className="flex flex-col flex-1 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0"
                            style={{
                              background: '#e0e5ec',
                              boxShadow: 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85), 0 0 20px rgba(245,158,11,0.14)',
                            }}
                          >
                            {card.icon}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">{card.title}</h3>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                          <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-300">{card.before}</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed pl-3 border-l-2 border-amber-400">{card.after}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: How Preqal Works ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-16">
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
                        whileHover={{
                          scale: 1.12,
                          y: -8,
                          boxShadow: '10px 12px 24px rgba(163,177,198,0.6), -8px -8px 20px rgba(255,255,255,0.9), 0 0 22px rgba(245,158,11,0.18)',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        className="relative z-10 h-[72px] w-[72px] rounded-full flex flex-col items-center justify-center mb-6 flex-shrink-0 cursor-default"
                        style={{
                          background: '#e0e5ec',
                          boxShadow: '6px 6px 16px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.85)',
                        }}
                      >
                        <span className="text-[10px] font-bold text-amber-500 tracking-widest leading-none">{step.number}</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">{step.title}</span>
                      </motion.div>
                      <p className="text-slate-600 leading-relaxed text-sm max-w-[220px]">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standards strip */}
              <div
                className="mt-16 rounded-2xl px-6 py-5"
                style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 12px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.8)' }}
              >
                <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Aligned with global standards</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {STANDARDS.map((std) => (
                    <span
                      key={std}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600"
                      style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px rgba(163,177,198,0.5), -2px -2px 6px rgba(255,255,255,0.85)' }}
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Section 5: CTA ── */}
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
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  Your next chapter starts here
                </motion.p>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  This is where your<br />story changes.
                </motion.h2>
                <motion.p
                  className="text-amber-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  In seven days you'll know exactly where you stand — every gap, every risk, every opportunity. No jargon. No pressure. Just the clarity you've been looking for.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                    <Link
                      to="/book"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-amber-700 text-base w-full sm:w-auto"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        boxShadow: '4px 4px 14px rgba(0,0,0,0.12), -2px -2px 8px rgba(255,255,255,0.15)',
                      }}
                    >
                      Book Your Risk Scan <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                    <Link
                      to="/resources"
                      className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white text-base w-full sm:w-auto"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Free Templates
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.p
                  className="text-amber-200 text-sm mt-6 opacity-75"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.75 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.55 }}
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
