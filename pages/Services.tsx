import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, CheckSquare, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';

const springBtn = { type: 'spring', stiffness: 340, damping: 22 } as const;

/* ─── Types ─── */
interface ServiceData {
  step: number;
  phase: 1 | 2 | 3;
  id: string;
  plainName: string;
  title: string;
  tagline: string;
  story: React.ReactNode;
  deliverables: string[];
  ctaLabel: string;
  bookService: string;
  isEntryPoint?: boolean;
  isFinal?: boolean;
}

/* ─── Service data ─── */
const services: ServiceData[] = [
  {
    step: 1,
    phase: 1,
    id: 'step-1',
    isEntryPoint: true,
    plainName: 'Compliance Baseline Scan · Entry Point',
    title: 'We look at your business — honestly.',
    tagline: 'Mandatory First Step · Your Clarity Starts Here',
    story: (
      <>
        <p>
          Before you can fix anything, you need to{' '}
          <span className="text-amber-600 font-semibold">see it clearly</span>. Most
          business owners are so close to their operations, they can't spot the gaps —
          like trying to read a book pressed against your nose. That's why we walk in
          as fresh eyes.
        </p>
        <p>
          We examine every corner of your operation against the international standards
          that matter — your processes, your records, your workplace conditions, your
          systems. Within days, you'll have something most businesses never get:{' '}
          <strong className="text-slate-700">total clarity.</strong> A precise map of
          what's working, what isn't, and — most importantly — what to do next.
        </p>
        <p>
          <em className="text-amber-600 not-italic font-semibold">
            Notice how different it feels to know exactly where you stand.
          </em>{' '}
          That's not an accident. That's what happens when you stop guessing and start
          leading.
        </p>
      </>
    ),
    deliverables: [
      'Compliance Baseline Report',
      'Prioritised Red Flag List',
      'Gap Analysis Against ISO Standards',
      'Your Personalised Action Roadmap',
    ],
    ctaLabel: 'Start with the Scan',
    bookService: 'Compliance Baseline Scan',
  },
  {
    step: 2,
    phase: 1,
    id: 'step-2',
    plainName: 'IMS Architecture & Implementation Planning',
    title: 'We design your system — built for your business.',
    tagline: 'Phase 1 · Includes Step 1',
    story: (
      <>
        <p>
          You wouldn't build a house without a blueprint. But most businesses try to
          run compliance by guessing — copying templates from the internet, hoping
          they'll stick. That's like trying to fit someone else's key into your front
          door. It doesn't work. It was never going to work.
        </p>
        <p>
          Your business is unique. Your management system should be too. We sit down
          together and design an{' '}
          <span className="text-amber-600 font-semibold">
            Integrated Management System
          </span>{' '}
          that fits the way your business actually works. We map your processes. We
          identify what standard applies to each one. We build your master document list
          and a Gantt chart that turns your certification goal into achievable weekly
          steps.
        </p>
        <p>
          <strong className="text-slate-700">
            When you see the blueprint for the first time, something shifts.
          </strong>{' '}
          You stop seeing certification as a distant, overwhelming idea — and you begin
          to see it as a plan you already know how to execute.
        </p>
      </>
    ),
    deliverables: [
      'Your IMS Blueprint',
      'Master Document Register',
      '9-Month Implementation Gantt',
      'ISO Scope & Applicability Register',
    ],
    ctaLabel: 'Get Your Blueprint',
    bookService: 'IMS Architecture & Implementation Planning',
  },
  {
    step: 3,
    phase: 2,
    id: 'step-3',
    plainName: 'Document Development',
    title: 'We write the playbook your team can actually use.',
    tagline: 'Phase 2 · Includes Steps 1–2',
    story: (
      <>
        <p>
          Imagine handing a new team member on their first day a 200-page manual
          written in legal language. That's what most SOPs look like. Nobody reads them.
          Nobody follows them. And when an auditor asks your staff to demonstrate the
          procedure — nobody can.
        </p>
        <p>
          We create something completely different. Clear. Visual. Written in plain
          language.{' '}
          <span className="text-amber-600 font-semibold">
            The kind of procedure a 12-year-old could follow.
          </span>{' '}
          Not because your team isn't smart — but because clear instructions set smart
          people free to do their best work.
        </p>
        <p>
          When your procedures are this clear,{' '}
          <strong className="text-slate-700">
            something changes in your team's behaviour.
          </strong>{' '}
          People stop making mistakes not because they're scared to — but because they
          know exactly what right looks like. That's the difference between compliance
          and culture.
        </p>
      </>
    ),
    deliverables: [
      'IMS Manual',
      'Full SOP Library',
      'Work Instructions & Flowcharts',
      'Forms, Registers & Templates',
    ],
    ctaLabel: 'Build Your Playbook',
    bookService: 'Document Development',
  },
  {
    step: 4,
    phase: 2,
    id: 'step-4',
    plainName: 'Training Programme Delivery',
    title: 'Your team learns to own the system — not just follow it.',
    tagline: 'Phase 2 · Includes Steps 1–3',
    story: (
      <>
        <p>
          Knowledge is power — but only when it lives inside the people who matter most.
          Your system is only as strong as the team running it. And a team that
          understands <em className="text-amber-600 not-italic font-semibold">why</em>{' '}
          they do what they do is ten times more powerful than a team that's just
          following orders.
        </p>
        <p>
          We train your team in a way that makes them feel{' '}
          <strong className="text-slate-700">proud, not overwhelmed.</strong> They learn
          what the standards mean, why they matter, and how their daily work connects to
          the bigger picture of your business's success. Watch a team member's face when
          they genuinely understand why quality matters — it's the moment a job becomes
          a calling.
        </p>
        <p>
          Your people will become{' '}
          <span className="text-amber-600 font-semibold">
            the strongest defenders of the system you built together.
          </span>{' '}
          And that's a competitive advantage no competitor can copy.
        </p>
      </>
    ),
    deliverables: [
      'Completed Training Schedule',
      'Attendance Records & Certificates',
      'Internal Auditor Certification',
      'Role-Based Competency Assessment',
    ],
    ctaLabel: 'Train Your Team',
    bookService: 'Training Programme Delivery',
  },
  {
    step: 5,
    phase: 3,
    id: 'step-5',
    plainName: 'Implementation & Observation Support',
    title: 'We walk beside you when the system goes live.',
    tagline: 'Phase 3 · Includes Steps 1–4',
    story: (
      <>
        <p>
          This is where most consulting firms disappear. They design your system. They
          document your procedures. Then they hand you a binder and wish you luck.
          You're on your own with a manual and a deadline.
        </p>
        <p>
          We don't do that.{' '}
          <strong className="text-slate-700">
            When your system goes live, we're there with you
          </strong>{' '}
          — on-site and virtually — watching, adjusting, and coaching in real time.
          There will be moments of friction. That's normal. That's growth. Every
          business that has ever implemented a management system hit a wall somewhere in
          this phase. The ones who succeeded had someone there to help them push through
          it.
        </p>
        <p>
          <span className="text-amber-600 font-semibold">
            Every single business that pushed through this phase came out the other side
            with something they didn't expect: confidence.
          </span>{' '}
          Not just compliance — confidence. The quiet, powerful knowing that your
          business can handle whatever comes next.
        </p>
      </>
    ),
    deliverables: [
      'Weekly Site Visit Reports',
      'Real-Time Adjustment Log',
      'Implementation Progress Tracker',
      'Virtual Review Session Records',
    ],
    ctaLabel: 'Go Live Together',
    bookService: 'Implementation & Observation Support',
  },
  {
    step: 6,
    phase: 3,
    id: 'step-6',
    plainName: 'Internal Audit Execution',
    title: 'We test the system — before anyone else does.',
    tagline: 'Phase 3 · Includes Steps 1–5',
    story: (
      <>
        <p>
          Before the regulators walk in. Before the certification body arrives. Before
          the moment that counts —{' '}
          <span className="text-amber-600 font-semibold">
            we run the test ourselves.
          </span>
        </p>
        <p>
          A full internal audit, run with the same rigour as the real thing. Opening
          meeting. Structured audit days. Findings documented. Corrective actions
          assigned. Closing meeting. Report presented to management. Every single step —
          because that's the only way to know you're actually ready.
        </p>
        <p>
          <strong className="text-slate-700">Our findings become your advantage.</strong>{' '}
          By the time the real audit happens, you've already been through it. You know
          the questions they'll ask. You know where your evidence is. You know how it
          ends — because you've already seen the ending.{' '}
          <span className="text-amber-600 font-semibold">
            That's a completely different relationship with pressure.
          </span>
        </p>
      </>
    ),
    deliverables: [
      'Internal Audit Report',
      'Corrective Action Register (CAPA)',
      'Nonconformance Findings Report',
      'Audit Opening & Closing Minutes',
    ],
    ctaLabel: 'Run the Audit',
    bookService: 'Internal Audit Execution',
  },
  {
    step: 7,
    phase: 3,
    id: 'step-7',
    plainName: 'Management Review Facilitation',
    title: 'You sit at the table with all the answers.',
    tagline: 'Phase 3 · Includes Steps 1–6',
    story: (
      <>
        <p>
          This is the meeting that separates businesses that manage by gut feeling from
          businesses that{' '}
          <span className="text-amber-600 font-semibold">lead with data.</span>
        </p>
        <p>
          We facilitate your formal Management Review — bringing every piece of
          evidence, every metric, every insight to the table. You look at your business
          the way a CEO of a world-class organisation looks at theirs. You see patterns
          you couldn't see before. You spot opportunities your competitors are missing.
          You make decisions from a position of{' '}
          <strong className="text-slate-700">complete clarity.</strong>
        </p>
        <p>
          This is what it feels like to actually lead your business — not just run it.
          And once you've experienced this level of clarity, you'll wonder how you ever
          operated without it.
        </p>
      </>
    ),
    deliverables: [
      'Management Review Minutes',
      'KPI Performance Data Pack',
      'Strategic Decision Register',
      'Continual Improvement Actions',
    ],
    ctaLabel: 'Lead with Data',
    bookService: 'Management Review Facilitation',
  },
  {
    step: 8,
    phase: 3,
    id: 'step-8',
    isFinal: true,
    plainName: 'Pre-Certification Readiness Audit · Final Step',
    title: 'We run the real thing — as a practice.',
    tagline: '★ Full Pre-Certification Programme · Includes Steps 1–7',
    story: (
      <>
        <p>
          Imagine sitting in the certification audit —{' '}
          <span className="text-amber-600 font-semibold">calm.</span> Completely
          prepared. Knowing that whatever they ask, you have the answer. Knowing that
          your team knows what to say. Knowing that your records are where they need to
          be. Knowing that you've already been through this exact moment once before —
          and you passed.
        </p>
        <p>
          That's what this step creates. We simulate the entire third-party
          certification audit — same structure, same standard, same scrutiny. Then we
          give you a precise readiness report: what you've achieved, what needs final
          attention, and exactly what to do about it.
        </p>
        <p>
          <strong className="text-slate-700">
            The difference between fear and confidence is experience.
          </strong>{' '}
          By the time the real auditors arrive, you won't be experiencing this for the
          first time.{' '}
          <span className="text-amber-600 font-semibold">
            And that changes everything.
          </span>
        </p>
      </>
    ),
    deliverables: [
      'Pre-Certification Readiness Report',
      'Final Punch List & Priority Actions',
      'Certification Readiness Declaration',
      'Formal Project Sign-off & Handover',
    ],
    ctaLabel: 'Complete the Journey',
    bookService: 'Pre-Certification Readiness Audit',
  },
];

/* ─── Phase metadata ─── */
const phaseInfo: Record<1 | 2 | 3, { label: string; subtitle: string; months: string }> = {
  1: { label: 'Phase 1', subtitle: 'Diagnose & Design', months: 'Months 1–3' },
  2: { label: 'Phase 2', subtitle: 'Document & Train', months: 'Months 4–6' },
  3: { label: 'Phase 3', subtitle: 'Operate & Audit', months: 'Months 7–9' },
};

/* ─── Pull quotes ─── */
const pullQuotes = [
  {
    afterPhase: 1,
    text: (
      <>
        "Most businesses stop at the idea of getting certified. The ones that{' '}
        <em style={{ color: '#d97706', fontStyle: 'italic' }}>actually do it</em> are
        the ones who found out exactly what they needed to do — and then did it, step by
        step."
      </>
    ),
    sub: 'The difference between those two businesses is a decision made right here.',
  },
  {
    afterPhase: 2,
    text: (
      <>
        "You're halfway through a transformation{' '}
        <em style={{ color: '#d97706', fontStyle: 'italic' }}>
          your competition hasn't even started.
        </em>
        "
      </>
    ),
    sub: "The businesses that reach certification aren't more capable than yours. They simply didn't stop.",
  },
  {
    afterPhase: 3,
    text: (
      <>
        "This is the moment. The auditors are coming.{' '}
        <em style={{ color: '#d97706', fontStyle: 'italic' }}>And you're ready.</em>"
      </>
    ),
    sub: "You've built the system. Trained the team. Tested every corner. Now you step forward.",
  },
];

/* ─── Accordion item ─── */
const ServiceAccordionItem: React.FC<{
  service: ServiceData;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ service, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMaxHeight(`${el.scrollHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  const cardStyle = isOpen
    ? {
        background: 'rgba(255,255,255,0.52)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.82)',
        boxShadow:
          '6px 6px 18px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.9)',
      }
    : {
        background: '#e0e5ec',
        boxShadow:
          '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.85)',
      };

  const badgeStyle = isOpen
    ? {
        background: '#d97706',
        boxShadow: '3px 3px 8px rgba(217,119,6,0.3), -1px -1px 4px rgba(255,255,255,0.8)',
      }
    : {
        background: '#e0e5ec',
        boxShadow:
          'inset 3px 3px 8px rgba(163,177,198,0.6), inset -3px -3px 8px rgba(255,255,255,0.9)',
      };

  return (
    <div
      className="rounded-2xl transition-all duration-300"
      style={cardStyle}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full p-6 sm:p-8 flex items-start sm:items-center gap-5 cursor-pointer text-left"
      >
        {/* Step badge */}
        <div
          className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300"
          style={badgeStyle}
        >
          <span
            className="text-lg font-extrabold transition-colors duration-300"
            style={{ color: isOpen ? 'white' : '#d97706' }}
          >
            {service.step}
          </span>
        </div>

        {/* Text */}
        <div className="flex-grow min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {service.plainName}
          </p>
          <p
            className="text-xl font-bold text-slate-900 leading-snug"
          >
            {service.title}
          </p>
          <span className="inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
            {service.tagline}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`h-5 w-5 text-amber-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable body */}
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.45s ease-in-out, opacity 0.3s ease-in-out',
        }}
      >
        <div className="px-6 sm:px-8 pb-8 sm:pl-[6.5rem]">
          {/* Story */}
          <div className="text-slate-500 text-base leading-relaxed space-y-4 mb-7">
            {service.story}
          </div>

          {/* Deliverables */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
            You walk away with
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
            {service.deliverables.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-slate-500 px-3 py-2 rounded-xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow:
                    'inset 2px 2px 6px rgba(163,177,198,0.5), inset -2px -2px 6px rgba(255,255,255,0.85)',
                }}
              >
                <CheckSquare className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-5 flex-wrap">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
              <Link
                to={`/book?service=${encodeURIComponent(service.bookService)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                style={{
                  boxShadow: '4px 4px 10px rgba(217,119,6,0.3), -2px -2px 6px rgba(255,255,255,0.7)',
                }}
              >
                {service.ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
              <Link
                to="/case-studies"
                className="text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors border-b border-amber-300/50 hover:border-amber-500 pb-px"
              >
                See success stories
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Phase header ─── */
const PhaseHeader: React.FC<{ phase: 1 | 2 | 3 }> = ({ phase }) => {
  const info = phaseInfo[phase];
  return (
    <div className="flex items-center gap-4 mt-16 mb-5 px-1">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-full whitespace-nowrap">
        {info.label} · {info.months}
      </span>
      <span className="text-lg font-bold text-slate-900">{info.subtitle}</span>
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, rgba(217,119,6,0.25), transparent)' }}
      />
    </div>
  );
};

/* ─── Pull quote ─── */
const PullQuote: React.FC<{ text: React.ReactNode; sub: string }> = ({ text, sub }) => (
  <div
    className="my-12 px-8 sm:px-12 py-8 rounded-2xl border-l-4 border-amber-500"
    style={{
      background: 'rgba(255,255,255,0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.7)',
      borderRight: '1px solid rgba(255,255,255,0.5)',
      borderBottom: '1px solid rgba(255,255,255,0.5)',
    }}
  >
    <p
      className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3"
    >
      {text}
    </p>
    <p className="text-sm text-slate-400 font-medium">{sub}</p>
  </div>
);

/* ─── Main component ─── */
const Services: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const phase1 = services.filter(s => s.phase === 1);
  const phase2 = services.filter(s => s.phase === 2);
  const phase3 = services.filter(s => s.phase === 3);

  return (
    <>
      <SEO pageKey="services" />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="py-24 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-7"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              <span style={{ fontSize: '8px' }}>◆</span> Services &amp; The Journey
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.08] mb-7 max-w-[680px]"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              You worked too hard
              <br />
              to leave your business
              <br />
              <em style={{ color: '#d97706' }}>unprotected.</em>
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 max-w-[580px] leading-relaxed mb-10"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
            >
              Right now, somewhere in your business, there's a gap. A missed procedure. An
              undocumented process. A risk hiding in plain sight.{' '}
              <strong className="text-slate-700 font-semibold">
                You know it. You feel it.
              </strong>{' '}
              And you've been meaning to deal with it — but the day never comes.{' '}
              <strong className="text-slate-700 font-semibold">Until now.</strong>
            </motion.p>
            <motion.div
              className="flex items-center gap-5 flex-wrap"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.42 }}
            >
                <motion.a
                  href="#step-1"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold text-white rounded-xl"
                  style={{
                    background: '#d97706',
                    boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.8)',
                  }}
                  whileHover={{ scale: 1.04, y: -2, background: '#b45309' }}
                  whileTap={{ scale: 0.97 }}
                  transition={springBtn}
                >
                  See the path forward →
                </motion.a>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                  <Link
                    to="/contact"
                    className="text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors border-b-2 border-amber-300/50 hover:border-amber-500 pb-0.5"
                  >
                    Talk to Dr. Gravesande first
                  </Link>
                </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── JOURNEY BAND ── */}
        <div
          className="relative overflow-hidden py-14"
          style={{ background: '#0f172a' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-3">
              The 9-Month Transformation
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white leading-snug max-w-[580px] mb-4"
            >
              From where you are now, to where you deserve to be.
            </h2>
            <p className="text-base text-white/50 max-w-[520px] leading-relaxed">
              Every business that has ever achieved ISO certification followed a path. There
              were eight steps. Here they are — and every single one moves you closer to the
              business you know you're capable of running.
            </p>

            {/* Phase tracker */}
            <div className="flex mt-10 rounded-xl overflow-hidden max-w-[560px]">
              {([1, 2, 3] as const).map((ph, i) => {
                const info = phaseInfo[ph];
                return (
                  <div
                    key={ph}
                    className="flex-1 px-4 py-3.5 text-center"
                    style={{
                      background: i === 0 ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.055)',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                      style={{ color: i === 0 ? '#d97706' : 'rgba(255,255,255,0.3)' }}
                    >
                      {info.label}
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.65)' }}
                    >
                      {info.subtitle}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {info.months}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SERVICE CARDS ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Phase 1 */}
          <ScrollReveal delay={0} xFrom={-16} yFrom={0}>
            <PhaseHeader phase={1} />
          </ScrollReveal>
          {phase1.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 80} xFrom={-14} yFrom={0}>
              <div id={s.id} className="mb-3">
                <ServiceAccordionItem
                  service={s}
                  isOpen={openId === s.id}
                  onToggle={() => handleToggle(s.id)}
                />
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0} yFrom={20} xFrom={0}>
            <PullQuote text={pullQuotes[0].text} sub={pullQuotes[0].sub} />
          </ScrollReveal>

          {/* Phase 2 */}
          <ScrollReveal delay={0} xFrom={-16} yFrom={0}>
            <PhaseHeader phase={2} />
          </ScrollReveal>
          {phase2.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 80} xFrom={-14} yFrom={0}>
              <div className="mb-3">
                <ServiceAccordionItem
                  service={s}
                  isOpen={openId === s.id}
                  onToggle={() => handleToggle(s.id)}
                />
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0} yFrom={20} xFrom={0}>
            <PullQuote text={pullQuotes[1].text} sub={pullQuotes[1].sub} />
          </ScrollReveal>

          {/* Phase 3 */}
          <ScrollReveal delay={0} xFrom={-16} yFrom={0}>
            <PhaseHeader phase={3} />
          </ScrollReveal>
          {phase3.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 80} xFrom={-14} yFrom={0}>
              <div className="mb-3">
                <ServiceAccordionItem
                  service={s}
                  isOpen={openId === s.id}
                  onToggle={() => handleToggle(s.id)}
                />
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0} yFrom={20} xFrom={0}>
            <PullQuote text={pullQuotes[2].text} sub={pullQuotes[2].sub} />
          </ScrollReveal>

          {/* ── ONGOING SERVICES ── */}
          <ScrollReveal delay={0} yFrom={20} xFrom={0}>
            <div className="mt-8 mb-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-full whitespace-nowrap">
                  After Certification
                </span>
                <span className="text-lg font-bold text-slate-900">Stay certified. Keep growing.</span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(217,119,6,0.25), transparent)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    icon: '🔄',
                    title: 'Retention & Maintenance Programme',
                    desc: 'Getting certified was the milestone. Staying certified is the standard. Monthly retainer support — surveillance visits, document updates, annual internal audit, continual improvement facilitation. Your system stays sharp. Your certification stays valid.',
                  },
                  {
                    icon: '⚙️',
                    title: 'Operational Web App Development',
                    desc: "You shouldn't be running a world-class management system on paper and spreadsheets. We build custom digital tools designed around how your business actually operates — dashboards, digital forms, automated workflows, real-time visibility.",
                  },
                  {
                    icon: '🧭',
                    title: 'Specialised Advisory & Crisis Support',
                    desc: "Some challenges don't come with a standard solution. Regulatory crisis. Failed audit. Compliance dispute. Whatever the situation, we design a custom response built around your specific context. You won't be facing it alone.",
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-7"
                    style={{
                      background: '#e0e5ec',
                      boxShadow:
                        '6px 6px 16px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.85)',
                    }}
                  >
                    <div className="text-2xl mb-3">{card.icon}</div>
                    <p className="text-base font-bold text-slate-900 mb-2">{card.title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── DECISION CTA ── */}
        <ScrollReveal delay={0} yFrom={24} xFrom={0}>
          <div
            id="decision"
            className="mt-20 py-20 relative overflow-hidden"
            style={{ background: '#0f172a' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 20% 50%, rgba(217,119,6,0.11) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 50%)',
              }}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-5">
                The Moment That Changes Everything
              </p>
              <h2
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-7 max-w-[620px]"
              >
                The only thing standing
                <br />between where you are
                <br />and where you{' '}
                <em style={{ color: '#f59e0b', fontStyle: 'italic' }}>know</em>
                <br />you should be
                <br />is a decision.
              </h2>
              <p className="text-base leading-relaxed max-w-[580px] mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                You've read this far.{' '}
                <strong style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                  Something inside you already knows this is the path.
                </strong>{' '}
                The question isn't whether you need this — you do. The question is: how much
                longer are you willing to wait?
              </p>
              <p className="text-base leading-relaxed max-w-[580px] mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Every month without a system is a month of risk you're carrying alone. A
                near-miss waiting to happen. A contract you didn't win because you couldn't
                prove your credentials.{' '}
                <span style={{ color: '#f59e0b' }}>
                  An audit you might not survive because no one told you what to fix.
                </span>
              </p>
              <p className="text-base leading-relaxed max-w-[580px] mb-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
                The businesses you admire — the ones that win the contracts, hold the
                certifications, and operate with quiet confidence — didn't get there by
                accident.{' '}
                <strong style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                  They made a decision. On a day that felt exactly like today.
                </strong>
              </p>
              <p
                className="text-lg font-bold mb-10 max-w-[480px] leading-snug"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                You're still reading. That tells you everything you need to know.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                  <Link
                    to="/book?service=Compliance+Baseline+Scan"
                    className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-extrabold text-white rounded-2xl hover:bg-amber-700 transition-colors"
                    style={{
                      background: '#d97706',
                      boxShadow: '0 6px 24px rgba(217,119,6,0.4)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Start with the Compliance Scan <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                  <Link
                    to="/contact"
                    className="text-[15px] font-semibold pb-0.5 transition-all text-white/55 hover:text-white border-b border-white/20 hover:border-white/55"
                  >
                    Talk to Dr. Gravesande first
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

export default Services;
