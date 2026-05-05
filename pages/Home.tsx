import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, AlertTriangle, FileText, BarChart3, Users, Settings, Leaf, Download } from 'lucide-react';
const MaturityChart = React.lazy(() => import('../components/MaturityChart').then(module => ({ default: module.default })));
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';
import { GLOBAL_STANDARDS_DATA, type StandardChipIcon, type StandardChipItem } from '../data/globalStandards';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import SaturnStage from '../components/ui/SaturnStage';

const data = [
  { name: 'Month 1', score: 45 },
  { name: 'Month 2', score: 55 },
  { name: 'Month 3', score: 70 },
  { name: 'Month 4', score: 85 },
  { name: 'Month 5', score: 92 },
  { name: 'Month 6', score: 98 },
];

const ProcessStep: React.FC<{ title: string; desc: string; longDesc: string; icon: React.ReactNode; delay: string }> = ({ title, desc, longDesc, icon, delay }) => (
  <div className={`flex flex-col items-center text-center p-5 group cursor-pointer rounded-2xl transition-all duration-300 animate-fade-in-up ${delay} neu-card hover:neu-raised`}>
    <div className="p-4 rounded-full mb-4 text-amber-600 neu-pressed">
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
    <p className="text-xs text-slate-500 mb-2">{desc}</p>
    <p className="text-xs text-slate-600 leading-relaxed">{longDesc}</p>
  </div>
);

function standardIcon(kind: StandardChipIcon) {
  const cls =
    'text-amber-500 shrink-0 h-3.5 w-3.5 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4';
  return kind === 'leaf' ? <Leaf className={cls} /> : <CheckCircle2 className={cls} />;
}

const GLOBAL_STANDARDS_PANEL_ID = 'global-standards-def-panel';

const StandardChipButton: React.FC<{
  item: StandardChipItem;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => {
  const buttonId = `global-standard-btn-${item.id}`;

  return (
    <div className="flex min-w-0 w-full flex-col">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={GLOBAL_STANDARDS_PANEL_ID}
        onClick={onToggle}
        className={`flex w-full min-w-0 items-center justify-center overflow-hidden rounded-xl px-1 py-2 font-bold leading-tight tracking-tight text-slate-700 transition-all duration-300 min-h-[5.5rem] text-[clamp(0.5rem,0.3rem+1.1vw,0.8125rem)] sm:min-h-0 sm:h-[2.75rem] sm:px-1 sm:py-0 md:px-1.5 sm:text-[clamp(0.42rem,0.26rem+1.35vw,0.8125rem)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
          isOpen ? 'neu-raised-sm' : 'neu-pressed-sm hover:bg-white/30'
        }`}
      >
        <span className="flex min-w-0 w-full max-w-full flex-col items-center justify-center gap-1 sm:inline-flex sm:flex-row sm:gap-[1ch]">
          {standardIcon(item.icon)}
          <span className="min-w-0 w-full text-center text-balance whitespace-normal sm:w-auto sm:truncate sm:whitespace-nowrap sm:text-left">
            {item.label}
          </span>
        </span>
      </button>
    </div>
  );
};

const GlobalStandardsTrust: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const [panelMaxHeight, setPanelMaxHeight] = useState<string>('0px');

  const expandedItem = expandedId ? GLOBAL_STANDARDS_DATA.find((i) => i.id === expandedId) : undefined;

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!expandedItem) {
      setPanelMaxHeight('0px');
      return;
    }
    const el = panelContentRef.current;
    if (el) {
      setPanelMaxHeight(`${el.scrollHeight}px`);
    }
  }, [expandedItem]);

  useEffect(() => {
    if (!expandedItem) return;
    const el = panelContentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPanelMaxHeight(`${el.scrollHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expandedItem]);

  return (
    <div className="w-full min-w-0">
      <div className="grid w-full min-w-0 grid-cols-5 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
        {GLOBAL_STANDARDS_DATA.map((item) => (
          <StandardChipButton
            key={item.id}
            item={item}
            isOpen={expandedId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
      <div
        id={GLOBAL_STANDARDS_PANEL_ID}
        role="region"
        aria-label={expandedItem ? `Definition: ${expandedItem.label}` : undefined}
        className="collapsible-content overflow-hidden"
        data-open={expandedItem ? 'true' : 'false'}
        style={{ maxHeight: expandedItem ? panelMaxHeight : '0px' }}
      >
        <div ref={panelContentRef} className="mt-2 w-full min-w-0">
          {expandedItem ? (
            <div className="neu-pressed-sm rounded-xl px-3 py-3 text-sm text-slate-600 leading-relaxed text-left w-full">
              {expandedItem.definition}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <>
      <SEO pageKey="home" />
      <div className="w-full overflow-x-hidden">

      {/* ── Hero v7 ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-7 pb-12 lg:pt-10 lg:pb-16">
        <div
          className="relative max-w-7xl mx-auto rounded-[20px] overflow-hidden"
          style={{
            background: '#e0e5ec',
            boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -10px -10px 28px rgba(255,255,255,0.92)',
          }}
        >
          {/* ── Mobile layout (< md) — side-by-side compact ── */}
          <div
            className="flex flex-row items-center gap-2 md:hidden"
            style={{ minHeight: '260px', padding: '14px' }}
          >
            {/* Compact glass card */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <GlassCard>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0 }}
                >
                  <span
                    className="glow-tag"
                    style={{ fontSize: '7px', letterSpacing: '1.5px' }}
                  >
                    Quality · Safety · Compliance
                  </span>
                </motion.div>
                <motion.h1
                  className="font-bold leading-[1.2] text-slate-900 mt-1.5 mb-1.5"
                  style={{ fontSize: '0.78rem' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.07 }}
                >
                  Systems that<br />
                  <span className="text-amber-600">actually work.</span>
                </motion.h1>
                <motion.p
                  className="text-slate-500 leading-relaxed mb-3"
                  style={{ fontSize: '0.55rem' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                >
                  Compliance frameworks that hold up in the real world.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.21 }}
                >
                  <Link
                    to="/book"
                    className="inline-block px-3 py-1.5 rounded-[8px] text-white font-semibold"
                    style={{
                      fontSize: '0.6rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      boxShadow: '3px 3px 8px rgba(217,119,6,0.3)',
                    }}
                  >
                    Book a Scan
                  </Link>
                </motion.div>
              </GlassCard>
            </div>

            {/* Compact Saturn */}
            <motion.div
              style={{ flexShrink: 0, width: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <SaturnStage
                imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`}
                imageAlt="Stabroek Market Clock Tower"
                size="sm"
              />
            </motion.div>
          </div>

          {/* ── Desktop layout (≥ md) ── */}
          <div
            className="hidden md:block relative"
            style={{ height: 'calc(100dvh - 200px)' }}
          >
          {/* Ambient amber glows */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', width: '380px', height: '380px',
              right: 0, top: '50%', marginTop: '-190px',
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(245,158,11,0.13), transparent 68%)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', width: '200px', height: '200px',
              bottom: '-60px', left: '36%',
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(245,158,11,0.13), transparent 68%)',
            }}
          />

          {/* Left 50%: Glass content card */}
          <div
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '50%',
              display: 'flex', alignItems: 'center',
              padding: '32px 40px 32px 36px',
              zIndex: 4,
            }}
          >
            <GlassCard>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <span className="glow-tag">Quality · Safety · Compliance</span>
              </motion.div>
              <motion.h1
                className="text-[2.2rem] font-bold leading-[1.18] text-slate-900 mt-3 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                Systems that<br />
                <span className="text-amber-600">actually work.</span>
              </motion.h1>
              <motion.p
                className="text-[1rem] text-slate-500 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
              >
                Preqal helps agri-food and eco-hospitality businesses build compliance frameworks that hold up in the real world.
              </motion.p>
              <motion.div
                className="flex gap-2.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
              >
                <Link
                  to="/book"
                  className="px-5 py-2.5 rounded-[10px] text-white text-[0.82rem] font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 6px rgba(255,200,80,0.15)',
                  }}
                >
                  Book a Scan
                </Link>
                <Link
                  to="/case-studies"
                  className="px-5 py-2.5 rounded-[10px] text-[0.82rem] text-slate-500 font-medium"
                  style={{
                    background: '#e0e5ec',
                    boxShadow: '3px 3px 8px rgba(163,177,198,0.5), -2px -2px 6px rgba(255,255,255,0.8)',
                  }}
                >
                  See Case Studies
                </Link>
              </motion.div>
            </GlassCard>
          </div>

          {/* Right 50%: Saturn Stage — top:50% + translateY(-50%) centres regardless of parent height definition */}
          <div
            style={{
              position: 'absolute', right: 0, top: '50%',
              width: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              <SaturnStage
                imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`}
                imageAlt="Stabroek Market Clock Tower — Preqal's compliance systems built for the real world"
                size="md"
              />
            </motion.div>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              position: 'absolute', bottom: '14px', left: '50%',
              transform: 'translateX(-50%)', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 4,
            }}
          >
            <div style={{ width: '1px', height: '22px', background: 'linear-gradient(to bottom, rgba(245,158,11,0.45), transparent)' }} />
            <div className="animate-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', opacity: 0.6 }} />
          </div>
          </div>{/* end desktop layout */}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6 -mt-2">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal yFrom={12}>
            <GlassCard>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                {[
                  { value: '12+',  label: 'clients served'  },
                  { value: '98%',  label: 'audit pass rate' },
                  { value: '3',    label: 'industries'       },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center text-center">
                    <span
                      className="font-bold text-amber-600"
                      style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Quality, Safety & ESG ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fade-in-up">
            <picture>
              <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w`} sizes="(max-width: 640px) 200px, 400px" />
              <img src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp`} alt="Preqal logo - Quality, Safety & ESG Systems" width="400" height="160" className="mx-auto mb-6 h-20 w-auto" loading="eager" decoding="async" />
            </picture>
            <div className="max-w-3xl mx-auto text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Quality, Safety & ESG Management Systems</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                <strong className="text-slate-800">The strongest businesses aren't lucky. They're built that way.</strong><br /><br />
                You deserve a foundation that holds — no matter what comes. With Preqal beside you, your quality, safety, and environmental systems come together in one clear, unified structure designed around the way you actually work. No confusion. No overwhelm. Just the world-class standards that leading organisations across the globe rely on — including principles recognised by the <a href="https://asq.org/quality-resources/quality-management-system" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">American Society for Quality</a> — working quietly in the background, so you can lead with confidence.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="ISO-ready documentation" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">You'll never have to wonder if your team knows what to do.</strong><br /><br />
                  With Preqal's guidance, your business gets the clear policies, procedures, and registers that keep everyone — from the office to the frontline — moving in the same direction. Simple. Visual. Practical. Your people will feel confident in their roles, take pride in their work, and carry your standards forward every single day.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Risk-based controls & legal compliance" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">You'll see what's coming — before it becomes a problem.</strong><br /><br />
                  The leaders who build lasting businesses aren't the ones who never face risk. They're the ones who face it prepared. With Preqal's guidance, you'll have the controls in place to stay covered, stay compliant, and stay focused on growth — because you'll know that every vulnerability has already been found and handled.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Audits, CAPA, and continual improvement" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">You'll keep getting better — long after the work is done.</strong><br /><br />
                  The best version of your business isn't a destination. It's a direction. With Preqal walking alongside you, every gap gets closed, every lesson gets built into the system, and every year your organisation becomes sharper, stronger, and more resilient. This chapter of your story doesn't have a ceiling.
                </p>
              </CollapsibleSection>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Explore Our Services</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/about" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Learn About Preqal</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Contact Us</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/preqal-not-prequel" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Preqal (Not Prequel)</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <a href="https://www.iso.org/iso-9001-quality-management.html" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">ISO 9001 Standards</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Indicators ── */}
      <section className="py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neu-raised rounded-3xl py-8 px-4 sm:px-6">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8 text-center">Aligned with Global Standards</p>
            <GlobalStandardsTrust />
          </div>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 animate-fade-in-up">
            <div className="max-w-3xl mx-auto text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How We Work</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                <strong className="text-slate-800">You don't have to figure this out alone.</strong><br /><br />
                Every business that reaches the next level does it with the right support at the right time. The Preqal System gives you a proven, six-phase path that starts exactly where you are today — and takes your quality, safety, and environmental programme somewhere most organisations only aspire to reach. You'll feel the difference from day one.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="Rapid diagnostic" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Your journey begins with you knowing exactly where you stand.</strong><br /><br />
                  Within seven days, you'll have a clear, prioritised <Link to="/book" className="text-amber-600 hover:text-amber-500 font-semibold underline">Red Flag Report</Link> — a simple, honest picture of what's working, what's missing, and what to fix first. No jargon. No guesswork. Just the clarity you need to move forward with complete confidence, knowing you haven't missed a thing.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Build and implement in phases" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">You'll watch your system take shape — step by step, without overwhelm.</strong><br /><br />
                  At a pace that works for your team, you'll build out the structures, documents, and training that turn your vision into operational reality. Every phase is guided. Every step is designed to leave your people feeling capable and your business feeling ready — for whatever comes next.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Verify effectiveness" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">You'll always know your system is working.</strong><br /><br />
                  As your business grows, you'll have the audits, the tracking, and the expert reviews that keep everything performing at its best. You'll walk into every inspection with your head held high — not because you passed a test, but because you built something you're genuinely proud of.
                </p>
              </CollapsibleSection>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <ProcessStep title="Assess" desc="Risk Scan" longDesc="Comprehensive diagnostic to identify critical gaps." icon={<AlertTriangle size={36} />} delay="delay-0" />
            <ProcessStep title="Design" desc="IMS Architecture" longDesc="Unified framework for quality, safety, and environmental processes." icon={<Settings size={36} />} delay="delay-100" />
            <ProcessStep title="Implement" desc="SOPs & Docs" longDesc="Clear, actionable documentation for frontline teams." icon={<FileText size={36} />} delay="delay-200" />
            <ProcessStep title="Train" desc="Competency" longDesc="Targeted training at all organizational levels." icon={<Users size={36} />} delay="delay-300" />
            <ProcessStep title="Monitor" desc="Audit Prep" longDesc="Continuous monitoring and external audit preparation." icon={<BarChart3 size={36} />} delay="delay-300" />
            <ProcessStep title="Improve" desc="Optimization" longDesc="Data-driven continuous improvement initiatives." icon={<ArrowRight size={36} />} delay="delay-500" />
          </div>
        </div>
      </section>

      {/* ── Core Services ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Core Services</h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                You shouldn't have to search for pieces of a puzzle you're not sure how to assemble. Every service you need to build, certify, and continuously improve your systems is available through Preqal — so you can focus on leading, knowing the compliance side is handled.
              </p>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="max-w-3xl space-y-2 mb-8">
            <CollapsibleSection title="Integrated management system design" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                No more juggling separate systems or worrying about gaps between them. With Preqal's guidance, your quality, safety, and environmental processes come together into a single structure that's efficient, consistent, and built to grow with you.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Training for frontline teams" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                With practical, role-specific training designed around your team's real work, every person in your organisation will have the knowledge and the confidence to operate at the highest standard. Your people are your greatest asset — Preqal helps them shine.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Audit readiness and certification support" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                Through mock inspections, evidence trail strengthening, and performance tracking, you'll be thoroughly prepared before the day ever arrives. When it comes, you won't just pass. You'll prove exactly the kind of organisation you've built.
              </p>
            </CollapsibleSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Quality Risk Scan™", icon: <AlertTriangle />, desc: "Not sure where the gaps are? In seven days, you will be. Your prioritised Red Flag Report and clear roadmap will show you exactly where you stand — and exactly what to do next.", link: "/book", linkText: "Book Scan" },
              { title: "IMS Design & Setup", icon: <Settings />, desc: "Policy, process, and digital infrastructure — all designed around your business, so you run on a foundation you can trust completely.", link: "/services", linkText: "Learn More" },
              { title: "SOP & Procedure Development", icon: <FileText />, desc: "Clear, visual, mobile-friendly — in plain language that makes doing things right feel natural, not complicated.", link: "/services", linkText: "Learn More" }
            ].map((card, i) => (
              <div key={i} className="neu-card rounded-2xl p-8 group hover:neu-raised transition-all duration-300">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-6 text-amber-600 neu-pressed">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{card.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{card.desc}</p>
                <Link to={card.link} className="text-amber-600 font-bold hover:text-amber-500 flex items-center text-sm uppercase tracking-wide">{card.linkText} <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/services" className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-500">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who We Help / Maturity ── */}
      <section className="py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neu-raised-lg rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1 neu-pressed-sm text-amber-600 rounded-full text-xs font-semibold mb-4 tracking-wider">PROVEN OUTCOMES</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">Who We Help</h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  <strong className="text-slate-800">You're in good company.</strong><br /><br />
                  Business owners across Guyana and the Caribbean — in every sector — have taken this same step. And within 12 weeks, they were audit-ready, running tighter systems, leading safer teams, and opening doors they didn't know were available to them. You can too.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Audit-readiness typically achieved in 12 weeks', 'Sustainable reduction in non-conformances', 'Enhanced traceability & risk visibility'].map((item) => (
                    <li key={item} className="flex items-center space-x-3 text-slate-700">
                      <CheckCircle2 className="text-amber-500 h-5 w-5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/case-studies" className="inline-flex items-center bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors neu-raised-sm">
                  See Industry Examples
                </Link>
              </div>
              <div className="neu-pressed rounded-2xl p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">Average Maturity Growth</h3>
                  <span className="text-amber-500 font-mono text-xs animate-pulse">● Live Projection</span>
                </div>
                <div className="h-64 w-full min-h-[256px]">
                  <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-400">Loading chart...</div>}>
                    <MaturityChart data={data} />
                  </React.Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Free Resource Package ── */}
      <section className="py-16 relative text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto neu-raised-lg rounded-3xl overflow-visible animate-fade-in-up p-6 md:p-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full mb-6 neu-pressed">
              <Download className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Free Resource Package</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">5 ready-to-use compliance templates — download instantly after a quick form.</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs mb-8">
              {['Document Masterlist', 'QHSE Policy', 'Document Control', 'Risk Register', 'Training Register'].map((t) => (
                <span key={t} className="neu-pressed-sm px-3 py-1.5 rounded-lg text-slate-600">{t}</span>
              ))}
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center justify-center px-4 py-3 md:px-8 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm md:text-lg rounded-xl transition-all duration-300 neu-raised-sm w-full md:w-auto"
            >
              Download Free Templates <Download className="ml-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Get a Risk Scan ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get a Risk Scan</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              <strong className="text-slate-800">This is where your story changes.</strong><br /><br />
              If you've ever lain awake wondering whether your systems are truly protecting everything you've built — this is how you find out. Within seven days, you'll have a clear, expert picture of every gap in your quality, safety, and ESG systems. No pressure. No jargon. Just the honest answers and the practical path forward that you deserve.
            </p>

            <div className="max-w-3xl mx-auto space-y-2 text-left mb-8">
              <CollapsibleSection title="What you receive" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  You'll receive a prioritised Red Flag Report that names your critical gaps clearly, a strategic roadmap built around your next steps, and recommendations shaped specifically around your risks. If systems thinking is new to your team, a short <a href="https://www.youtube.com/watch?v=O5T4H8K_rwQ" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">explainer video</a> helps everyone get on the same page quickly.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Who it's for" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  You — if you're preparing for ISO certification, a regulatory inspection, or a client audit. Whether you're starting from scratch or strengthening what you already have, this scan is designed for leaders who want to run a tighter, safer, more confident business.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="How to start" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Book your Risk Scan today. Within seven days, you'll have your diagnostic — on-site or virtually, wherever you are across Guyana and the Caribbean. Your next chapter starts here.
                </p>
              </CollapsibleSection>
            </div>

            <Link to="/book" className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all duration-300 neu-raised-sm">
              Book Your Risk Scan Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              Learn more about our <Link to="/services" className="text-amber-600 hover:text-amber-500 underline">comprehensive services</Link> or explore <Link to="/case-studies" className="text-amber-600 hover:text-amber-500 underline">real success stories</Link>.
            </p>
          </div>
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
