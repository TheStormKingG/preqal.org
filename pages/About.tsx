import React, { useState, useRef, useEffect } from 'react';
import { Microscope, Activity, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';
import { getFounderPersonSchema, getAboutPageSchema } from '../seo/pageSchemas';
import TiltCard from '../components/ui/TiltCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import ParallaxGlow from '../components/ui/ParallaxGlow';

const SPACE_Y_12 = 48;

const PHILOSOPHY = [
  {
    icon: <Microscope className="text-amber-600 h-5 w-5" />,
    title: 'Evidence-Driven',
    desc: "You'll never be asked to act on guesswork. Every recommendation Preqal makes is grounded in data, risk assessments, and verifiable facts — so every decision you make is one you can stand behind with confidence.",
  },
  {
    icon: <Activity className="text-amber-600 h-5 w-5" />,
    title: 'Systems Thinking',
    desc: "Your business isn't a collection of separate problems. It's a living system. Preqal looks at the whole picture — finding the root causes that others miss — so the solutions you get actually hold.",
  },
  {
    icon: <Globe className="text-amber-600 h-5 w-5" />,
    title: 'Planetary Value',
    desc: "The standards you build today protect more than your bottom line. They protect your people, your community, and the world your business operates in. Compliance, done right, is an act of leadership.",
  },
  {
    icon: <Heart className="text-amber-600 h-5 w-5" />,
    title: 'Risk-Based',
    desc: "Your time and resources are valuable. Preqal helps you focus them exactly where they matter most — on the risks that could affect the safety of your product and the future of everything you've built.",
  },
];

const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
  border: '1.5px solid rgba(255,255,255,0.92)',
} as React.CSSProperties;

const About: React.FC = () => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const philosophyRef = useRef<HTMLDivElement>(null);
  const clinicRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const ph = philosophyRef.current;
    const cl = clinicRef.current;
    if (!ph || !cl) return;
    const measure = () => {
      setCardHeight(bioExpanded ? ph.offsetHeight + SPACE_Y_12 + cl.offsetHeight : ph.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ph);
    observer.observe(cl);
    return () => observer.disconnect();
  }, [bioExpanded]);

  return (
    <>
      <SEO pageKey="about" extraSchemas={[getFounderPersonSchema(), getAboutPageSchema()]} />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="pt-20 pb-14 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', transform: 'translate(25%, -30%)' }}
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.p
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              About Preqal
            </motion.p>
            <motion.h1
              className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Clinic on Quality™ —<br />
              <em style={{ color: '#d97706' }}>we care for businesses.</em>
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-3"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
            >
              You deserve more than a template. Preqal works with businesses of every size to build quality and compliance systems designed specifically around you, your risks, and your goals.
            </motion.p>
            <motion.p
              className="text-sm text-slate-400 font-medium"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
            >
              Founded and led by Dr. Stefan Gravesande, MBBS.
            </motion.p>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ParallaxGlow top={0} left={-60} />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* ── Founder card ── */}
            <div className="md:col-span-4 flex flex-col min-w-0">
              <TiltCard mode="static" perspective={800} className="w-full">
                <div
                  className="rounded-2xl p-8 overflow-hidden"
                  style={{
                    ...glassCard,
                    ...(cardHeight ? { height: `${cardHeight}px`, transition: 'height 0.5s ease-in-out' } : {}),
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden p-1"
                    style={{ boxShadow: 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85), 0 0 0 3px rgba(245,158,11,0.2)' }}
                  >
                    <picture>
                      <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.avif 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.avif 256w`} sizes="128px" />
                      <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.webp 256w`} sizes="128px" />
                      <img src={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp`} alt="Preqal founder Dr. Gravesande" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" decoding="async" width="128" height="128" />
                    </picture>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-1 text-slate-900">Dr. Gravesande</h2>
                  <p className="text-amber-600 text-center text-xs font-bold mb-6 uppercase tracking-wider whitespace-nowrap">
                    Medical Leadership → Systems Engineer
                  </p>

                  <div style={{ borderTop: '1px solid rgba(163,177,198,0.25)' }} className="pt-6">
                    <CollapsibleSection title="Background & Experience" headingLevel="h3" onToggle={(open) => setBioExpanded(open)}>
                      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p>Transitioning from a strong medical foundation into industrial quality and systems engineering, Dr. Gravesande applies a diagnostic, evidence-based mindset to operational excellence.</p>
                        <p>He currently leads the development of Integrated Management Systems (IMS) from the ground up for multiple firms, aligning operations with ISO 9001, ISO 14001, and ISO 45001.</p>
                        <p>He is also the architect of national-scale quality frameworks across agriculture, food production, and environmental systems — building institutional infrastructure that protects businesses, communities, ecosystems, and the long-term health of an entire nation.</p>
                      </div>
                    </CollapsibleSection>
                  </div>
                </div>
              </TiltCard>

              {/* Hexagon watermark */}
              <div
                className={`hidden md:flex flex-1 items-center justify-center pointer-events-none transition-all duration-700 ease-in-out min-h-0 ${
                  bioExpanded ? 'opacity-0 -translate-y-12 scale-90' : 'opacity-100 translate-y-0 scale-100'
                }`}
                aria-hidden="true"
              >
                <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="w-44 h-44 opacity-[0.07] select-none" draggable="false" />
              </div>
            </div>

            {/* ── Philosophy + Clinic ── */}
            <div className="md:col-span-8 space-y-12">

              {/* Philosophy section */}
              <div ref={philosophyRef}>
                {/* Section header */}
                <ScrollReveal yFrom={12}>
                  <div className="flex items-center gap-3 mb-7">
                    <div style={{ width: '4px', height: '36px', background: 'linear-gradient(to bottom, #f59e0b, #d97706)', borderRadius: '2px', flexShrink: 0 }} />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">Our approach</p>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">Our Philosophy</h2>
                    </div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PHILOSOPHY.map((item, i) => (
                    <ScrollReveal key={item.title} delay={i * 80} yFrom={16}>
                      <motion.div
                        whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="flex gap-4 p-5 rounded-2xl"
                        style={glassCard}
                      >
                        <div
                          className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 7px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.85), 0 0 14px rgba(245,158,11,0.12)' }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Clinic on Quality — dark navy band */}
              <div ref={clinicRef}>
                <ScrollReveal yFrom={16}>
                  <div
                    className="rounded-2xl overflow-hidden relative"
                    style={{ background: '#0f172a', boxShadow: '8px 10px 24px rgba(15,23,42,0.35), -4px -4px 14px rgba(255,255,255,0.7)' }}
                  >
                    {/* Diagonal texture */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
                    }} />
                    {/* Amber glow */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: 'radial-gradient(ellipse at 10% 50%, rgba(217,119,6,0.12) 0%, transparent 55%)',
                    }} />
                    {/* Amber left bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(to bottom, #f59e0b, #d97706)' }} />

                    <div className="relative z-10 p-8">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">Our name explained</p>
                      <h3 className="text-xl font-bold text-white mb-5">Why "Clinic on Quality"?</h3>
                      <CollapsibleSection title="Our diagnostic approach" headingLevel="h3" defaultOpen={true}>
                        <div className="space-y-4 text-white/65 leading-relaxed text-sm">
                          <p>Just as the best doctors listen before they prescribe, Preqal examines your business before recommending a single solution. Your operational health — your processes, your patterns, your vulnerabilities — is assessed with clinical precision before anything is built.</p>
                          <p>Most consultants hand you a template and walk away. You get something different. You get a prescription written specifically for your business — targeted, restorative, and designed to make your organisation stronger from the inside out.</p>
                        </div>
                      </CollapsibleSection>
                      <p className="font-bold italic text-amber-400 text-right mt-5 text-sm">
                        Because at Preqal, we don't just improve systems. We care for businesses.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </div>

        {/* ── Final CTA band ── */}
        <div className="relative overflow-hidden py-16 mt-20" style={{ background: '#0f172a' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%)',
          }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <ScrollReveal yFrom={16}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4">Ready to start?</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                Your business deserves a system<br />
                <em style={{ color: '#f59e0b' }}>as strong as your vision.</em>
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-xl mx-auto mb-8">
                Book a free Risk Scan and find out exactly where your business stands — every gap mapped, every risk named, in 7 days.
              </p>
              <motion.a
                href="/book"
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '5px 5px 14px rgba(217,119,6,0.4)' }}
              >
                Book a Free Risk Scan
              </motion.a>
            </ScrollReveal>
          </div>
        </div>

      </div>
    </>
  );
};

export default About;
