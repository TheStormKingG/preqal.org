import React, { useState } from 'react';
import { Map, Users, Recycle, Truck, Factory, Droplet, Feather, ShieldAlert, CheckCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';

/* ─── spring preset ─────────────────────────────────── */
const springBtn = { type: 'spring', stiffness: 340, damping: 22 } as const;

/* ─── Data ──────────────────────────────────────────── */
const caseStudies = [
  {
    sector: 'Poultry Hatchery',
    icon: <Feather className="h-5 w-5 text-amber-600" />,
    tag: 'Agri-Food',
    tagColor: 'amber',
    img: 'images/case-studies/poultry.jpg',
    imgAlt: 'Farm worker tending to chickens in a modern hatchery facility',
    imgPos: 'center 20%',
    challenge: 'Limited traceability and repeated audit observations affecting both product quality and animal welfare.',
    solution: 'Implemented structured SOPs, IMS documentation, traceability system, and staff competency programs.',
    result: 'Traceability improved across all production stages and repeat audit findings were significantly reduced. The team now enters every inspection confident and fully prepared.',
  },
  {
    sector: 'Logistics Distribution',
    icon: <Truck className="h-5 w-5 text-blue-500" />,
    tag: 'Transport',
    tagColor: 'blue',
    img: 'images/case-studies/logistics.jpg',
    imgAlt: 'Warehouse worker managing inventory in a logistics distribution centre',
    imgPos: 'center 15%',
    challenge: 'Inadequate documentation, safety gaps, and inconsistent use of temperature and delivery records.',
    solution: 'Designed tailored documentation system, risk register, inspection checklists, and training module on operational controls.',
    result: 'Process consistency and worker safety compliance both improved measurably across all routes. Customer escalations and delivery errors dropped significantly within the first quarter.',
  },
  {
    sector: 'Eco-Tourism & Hospitality Resort',
    icon: <Map className="h-5 w-5 text-teal-500" />,
    tag: 'Hospitality',
    tagColor: 'teal',
    img: 'images/case-studies/hospitality.jpg',
    imgAlt: 'Hospitality staff delivering excellent service to guests at a Caribbean eco-resort',
    imgPos: 'center 50%',
    challenge: 'A growing eco-resort lacked documented food safety controls, consistent procedures, and formal guest safety protocols — creating exposure ahead of international tour operator partnerships.',
    solution: 'Designed an integrated QMS covering food safety (HACCP-aligned), departmental SOPs, a guest safety and emergency response plan, and a competency-based staff training programme.',
    result: 'Received formal recognition from the Guyana Tourism Authority for documented quality and safety standards. Two international tour operator agreements followed, with compliance confidence cited as the deciding factor.',
  },
  {
    sector: 'Oil & Gas Services Contractor',
    icon: <Droplet className="h-5 w-5 text-slate-600" />,
    tag: 'Energy',
    tagColor: 'slate',
    img: 'images/case-studies/oil-gas.jpg',
    imgAlt: 'Safety officer conducting a risk inspection at an oil and gas services facility',
    imgPos: 'center 8%',
    challenge: 'Informal risk controls, weak safety culture, and absent PPE enforcement and corrective action tracking.',
    solution: 'Developed QHSE mini-IMS, set up risk registers, PPE tracking system, safety induction checklist, and observation reporting.',
    result: 'Safety awareness strengthened and PPE usage became consistently enforced across all active worksites. HSE audit readiness improved measurably, with the risk register now actively maintained.',
  },
  {
    sector: 'Large-Scale HR & Recruitment Firm',
    icon: <Users className="h-5 w-5 text-violet-500" />,
    tag: 'HR & Recruitment',
    tagColor: 'violet',
    img: 'images/case-studies/hr-recruitment.jpg',
    imgAlt: 'HR professional conducting a structured candidate interview in a modern office',
    imgPos: 'center 18%',
    challenge: 'No standardised quality controls over the recruitment lifecycle — inconsistent vetting, undocumented procedures, and no CAPA process were generating complaints and reputational risk.',
    solution: 'Built a recruitment-lifecycle QMS with candidate screening SOPs, client onboarding procedures, a complaints and CAPA process, data handling controls, and a staff competency framework.',
    result: 'Client complaint rate dropped significantly in the first quarter and new-hire onboarding became faster and more consistent. The firm passed a major corporate client quality audit — attributing the win to demonstrated process maturity.',
  },
];

const industries = [
  { name: 'Logistics & Transport', icon: <Truck className="h-7 w-7" />, color: 'text-blue-500' },
  { name: 'Oil & Gas Services', icon: <Droplet className="h-7 w-7" />, color: 'text-slate-600' },
  { name: 'Waste & Environmental', icon: <Recycle className="h-7 w-7" />, color: 'text-green-600' },
  { name: 'Agri-Food Sector', icon: <Factory className="h-7 w-7" />, color: 'text-amber-600' },
  { name: 'Poultry & Hatchery', icon: <Feather className="h-7 w-7" />, color: 'text-amber-500' },
  { name: 'Hospitality & Eco-Tourism', icon: <Map className="h-7 w-7" />, color: 'text-teal-500' },
  { name: 'HR & Recruitment', icon: <Users className="h-7 w-7" />, color: 'text-violet-500' },
];

const tagStyles: Record<string, string> = {
  amber:  'bg-amber-50  border-amber-200/60  text-amber-700',
  blue:   'bg-blue-50   border-blue-200/60   text-blue-700',
  violet: 'bg-violet-50 border-violet-200/60 text-violet-700',
  slate:  'bg-slate-100 border-slate-200/60  text-slate-600',
  green:  'bg-green-50  border-green-200/60  text-green-700',
  teal:   'bg-teal-50   border-teal-200/60   text-teal-700',
};

/* ─── Accordion card ─────────────────────────────────── */
const CaseCard: React.FC<{ study: typeof caseStudies[0]; index: number }> = ({ study, index }) => {
  const [open, setOpen] = useState(false);
  const tag = tagStyles[study.tagColor] ?? tagStyles.slate;

  return (
    <ScrollReveal delay={index * 90} yFrom={22} className="h-full">
      <motion.div
        whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-2xl overflow-hidden h-full flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
          border: '1.5px solid rgba(255,255,255,0.92)',
        }}
      >
        {/* ── Image banner ── */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: '172px' }}>
          <img
            src={`${import.meta.env.BASE_URL}${study.img}`}
            alt={study.imgAlt}
            className="w-full h-full object-cover"
            style={{ objectPosition: study.imgPos || 'center center' }}
            width="600"
            height="172"
            loading="lazy"
          />
          {/* Fade to card background at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(255,255,255,0.55) 100%)' }}
          />
          {/* Sector tag overlaid bottom-left */}
          <span
            className={`absolute bottom-3 left-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tag}`}
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            {study.tag}
          </span>
        </div>

        {/* Card body — grows, result pinned to bottom */}
        <div className="p-5 pt-4 flex-1 flex flex-col">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff', background: '#e0e5ec' }}
            >
              {study.icon}
            </div>
            <h2 className="font-bold text-slate-900 text-base leading-snug">{study.sector}</h2>
          </div>

          {/* Result — pinned to bottom with mt-auto; line-clamp keeps visual height uniform */}
          <div
            className="mt-auto flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
          >
            <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">{study.result}</p>
          </div>
        </div>

        {/* Expandable: challenge + solution */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-600 transition-colors"
          style={{ borderTop: '1px solid rgba(163,177,198,0.25)' }}
          aria-expanded={open}
        >
          <span>How we got there</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">The Challenge</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{study.challenge}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">Our Solution</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{study.solution}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ScrollReveal>
  );
};

/* ─── Page ───────────────────────────────────────────── */
const CaseStudies: React.FC = () => {
  return (
    <>
      <SEO pageKey="caseStudies" />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="pt-20 pb-16 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[560px] h-[560px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
              transform: 'translate(25%, -30%)',
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-7"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Client Confidentiality Intact
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] mb-6 max-w-[680px]"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Real businesses.<br />
              Real gaps closed.<br />
              <em style={{ color: '#d97706' }}>Real results.</em>
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 max-w-[580px] leading-relaxed mb-6"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
            >
              Business owners across poultry, logistics, food-handling, eco-hospitality, oil&nbsp;&amp;&nbsp;gas,
              and waste management in Guyana and the Caribbean have already taken the step you're
              considering — and their businesses are stronger for it.
            </motion.p>
            <motion.div
              className="inline-flex items-start gap-3 px-5 py-3.5 rounded-xl max-w-lg"
              style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 7px rgba(163,177,198,0.5), inset -3px -3px 7px rgba(255,255,255,0.8)', borderLeft: '3px solid #f59e0b' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
            >
              <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-500 italic leading-relaxed">
                To protect confidentiality, we share sector-based examples showing real challenges and measurable improvements.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── PROOF BAND ── */}
        <div
          className="relative overflow-hidden py-12"
          style={{ background: '#0f172a' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 10% 50%, rgba(217,119,6,0.10) 0%, transparent 55%), radial-gradient(ellipse at 90% 30%, rgba(245,158,11,0.05) 0%, transparent 50%)' }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-16">
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-2">Sectors served</p>
                <div className="text-4xl font-bold text-amber-400">6+</div>
                <p className="text-xs text-white/40 mt-1">industries across Guyana<br />and the Caribbean</p>
              </div>
              <div className="hidden sm:block w-px h-14 bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-2">Audit pass rate</p>
                <div className="text-4xl font-bold text-amber-400">98%</div>
                <p className="text-xs text-white/40 mt-1">across all Preqal clients<br />who proceeded to certification</p>
              </div>
              <div className="hidden sm:block w-px h-14 bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-2">Time to certification</p>
                <div className="text-4xl font-bold text-amber-400">9mo</div>
                <p className="text-xs text-white/40 mt-1">average across the<br />Preqal 9-month journey</p>
              </div>
              <div className="flex-1" />
              <div className="text-center sm:text-right">
                <p className="text-sm text-white/60 leading-relaxed max-w-[260px]">
                  These aren't projections.<br />
                  <strong className="text-white/85">They're what happened.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CASE STUDY CARDS ── */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-12">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">The work</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                  Five businesses.<br />
                  <span className="text-amber-600">Five transformations.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {caseStudies.map((study, i) => (
                <CaseCard key={study.sector} study={study} index={i} />
              ))}

              {/* CTA card */}
              <ScrollReveal delay={caseStudies.length * 90} yFrom={22} className="h-full">
                <motion.div
                  whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="rounded-2xl flex flex-col justify-center items-center text-center p-10 h-full"
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.92)',
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-4">Your turn</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
                    Ready to be our<br />next success story?
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[260px]">
                    Let's audit your risks and build a clear roadmap to compliance.
                  </p>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                    <Link
                      to="/book"
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.8)',
                      }}
                    >
                      Start Your Risk Scan <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES ── */}
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal yFrom={12}>
              <div className="text-center mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Where we operate</p>
                <h2 className="text-2xl font-bold text-slate-900">Industries we serve</h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {industries.map((ind, i) => (
                <ScrollReveal key={ind.name} delay={i * 60} yFrom={16}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '5px 6px 14px rgba(163,177,198,0.5), -3px -3px 10px rgba(255,255,255,0.9)' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    className="flex flex-col items-center text-center p-5 rounded-2xl cursor-default"
                    style={{
                      background: '#e0e5ec',
                      boxShadow: '4px 4px 10px rgba(163,177,198,0.45), -3px -3px 8px rgba(255,255,255,0.85)',
                    }}
                  >
                    <div
                      className={`mb-3 ${ind.color}`}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
                    >
                      {ind.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 leading-snug">{ind.name}</span>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA BAND ── */}
        <ScrollReveal yFrom={24}>
          <div
            className="relative overflow-hidden py-20 mx-4 sm:mx-6 lg:mx-8 rounded-3xl"
            style={{ background: '#0f172a' }}
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(217,119,6,0.11) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 50%)' }}
            />
            <div className="relative z-10 text-center max-w-2xl mx-auto px-4 sm:px-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-5">The next chapter</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6">
                Every business in these<br />
                stories once stood exactly<br />
                <em style={{ color: '#f59e0b' }}>where you are now.</em>
              </h2>
              <p className="text-base text-white/50 leading-relaxed mb-10 max-w-lg mx-auto">
                The difference between staying stuck and moving forward is one decision.
                Your Risk Scan takes seven days and shows you exactly what needs to change.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                  <Link
                    to="/book"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      boxShadow: '4px 4px 14px rgba(217,119,6,0.4)',
                    }}
                  >
                    Book a Risk Scan <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                  <Link
                    to="/services"
                    className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors border-b-2 border-amber-400/40 hover:border-amber-300 pb-0.5"
                  >
                    See how the journey works →
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </>
  );
};

export default CaseStudies;
