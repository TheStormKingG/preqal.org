import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, CheckSquare } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import SlideDeck, { useDeck, type DeckSlide } from '../components/SlideDeck';
import { wickRun } from '../lib/wickRun';
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
    headline: <>It starts at your <em style={{ color: '#d97706' }}>kitchen table.</em></>,
    story:
      'Great businesses begin with a skill nobody can copy. Everything changes when a banker reads your plan and nods.',
    serviceName: 'Business Plan',
    servicePromise: 'A plan your bank can say yes to.',
    deliverables: ['Bank-ready business plan', 'Cash-flow map', 'Compliance roadmap'],
    ctaLabel: 'Get your Business Plan',
    waKey: 'business-plan',
    img: 'images/business-team.webp',
    imgAlt: 'A small Guyanese business team planning at a table',
    imgPos: '50% 18%',
  },
  {
    number: '02',
    chapter: 'The Look',
    headline: <>Now, see it <em style={{ color: '#d97706' }}>clearly.</em></>,
    story:
      'You are too close to your business to see its gaps. Five days with us — fully online — shows you everything.',
    serviceName: 'Risk Scan™',
    servicePromise: 'A full virtual audit in five days. GY$100,000 flat.',
    deliverables: ['ISO 9001 gap analysis', 'Quality policy + organisation chart', 'Plain-language recommendations'],
    ctaLabel: 'Book the Risk Scan',
    waKey: 'risk-scan',
    img: 'images/services/phase1-diagnose.webp',
    imgAlt: 'Consultant reviewing operations with a client',
  },
  {
    number: '03',
    chapter: 'The Build',
    headline: <>Then we build it <em style={{ color: '#d97706' }}>together.</em></>,
    story:
      'Imagine greeting your auditors calmly because you already passed a practice run.',
    serviceName: 'Systems Builder™',
    servicePromise: 'Walk in knowing how your audit ends.',
    deliverables: ['Plain-language SOPs', 'Internal auditor training', 'Mock certification audit'],
    ctaLabel: 'Start the 9-month build',
    waKey: 'systems-builder',
    img: 'images/services/phase2-train.webp',
    imgAlt: 'Team in a quality management training workshop',
  },
  {
    number: '04',
    chapter: 'The Standard',
    headline: <>Pass the audit. <em style={{ color: '#d97706' }}>Keep the standard.</em></>,
    story:
      'Systems drift and standards change. We stay beside you so every audit feels ordinary.',
    serviceName: 'Certified Care™',
    servicePromise: 'Stay certified and keep growing.',
    deliverables: ['Monthly system upkeep', 'Annual internal audit', 'Surveillance-visit support'],
    ctaLabel: 'Stay certified',
    waKey: 'certified-care',
    img: 'images/services/phase3-audit.webp',
    imgAlt: 'Quality supervisor conducting an audit on the facility floor',
  },
  {
    number: '05',
    chapter: 'The Export',
    headline: <>Your label <em style={{ color: '#d97706' }}>crosses the sea.</em></>,
    story:
      'Three gates stand between you and the world. Beyond them, buyers trust a label that says Made in Guyana.',
    serviceName: 'Export-Ready™',
    servicePromise: 'From unregulated to export certified.',
    deliverables: ['HACCP foundation', 'ISO 22000 system', 'GFSI certificate'],
    ctaLabel: 'Start Export-Ready™',
    waKey: 'export-ready',
    img: 'images/case-studies/poultry.webp',
    imgAlt: 'Guyanese agro-processing operation preparing product for export',
  },
];

/* ─── Subtle scroll-parallax image frame ─── */
const ParallaxImage: React.FC<{ src: string; alt: string; pos?: string; deck?: boolean }> = ({ src, alt, pos, deck }) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.04, 1.1]);
  const still = deck || prefersReduced;

  return (
    <div
      ref={ref}
      className="phase-media relative overflow-hidden rounded-3xl"
      style={{
        boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
      }}
    >
      <motion.img
        src={`${import.meta.env.BASE_URL}${src}`}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={still ? { objectPosition: pos } : { y, scale, objectPosition: pos }}
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
   Scroll mode (mobile/tablet): Skiper-style scroll ignition — each phase
   starts ghosted and "lights up" as the amber journey line reaches it,
   scrubbed to scroll position.
   Deck mode (desktop slides): there is no page scroll to scrub, so the phase
   renders lit and plays a simple entrance when its slide arrives. */
const PhaseSection: React.FC<{
  phase: Phase;
  index: number;
  deck?: boolean;
  /* Deck only — the wick measures the badge and pops it on arrival. */
  badgeRef?: React.Ref<HTMLDivElement>;
  pop?: 'hidden' | 'shown';
  burst?: boolean;
}> = ({ phase, index, deck, badgeRef, pop = 'shown', burst }) => {
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

  // Haptic tick the moment the wick reaches this node (Android/Samsung
  // Internet support navigator.vibrate; iOS silently ignores it).
  const wasLitRef = useRef(false);
  useMotionValueEvent(ignite, 'change', (v) => {
    if (deck) return;
    const nowLit = v > 0.66;
    if (nowLit && !wasLitRef.current) {
      try {
        navigator.vibrate?.(18);
      } catch {
        /* no haptics available */
      }
    }
    wasLitRef.current = nowLit;
    setLit(nowLit);
  });

  const isLit = deck || lit;
  const copyStyle = deck
    ? undefined
    : prefersReduced
      ? { opacity: contentOpacity }
      : { opacity: contentOpacity, y: contentY };
  const imgStyle = deck ? undefined : { filter: imgFilter, opacity: imgOpacity };

  return (
    <section ref={ref} id={`phase-${index + 1}`} className={`relative ${deck ? '' : 'py-14 sm:py-16'}`}>
      <div className={`flex flex-col lg:items-center gap-4 lg:gap-16 ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

        {/* Copy — scroll-scrubbed ignition.
            Desktop: both columns hug the centre line (left column right-aligned,
            right column left-aligned). Mobile: everything left-aligned. */}
        <motion.div
          data-phase-col="copy"
          className={`flex-1 min-w-0 ${flip ? '' : 'lg:text-right'}`}
          style={copyStyle}
          {...(deck
            ? {
                initial: { opacity: 0, y: prefersReduced ? 0 : 26 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
              }
            : {})}
        >
          <div>
            <div className={`flex items-center gap-3 mb-3 lg:gap-4 lg:mb-5 ${flip ? '' : 'lg:flex-row-reverse'}`}>
              {deck ? (
                /* Deck: the badge is popped into place by the wick when the
                   burn reaches it (see PhaseSlide). Its resting style is the
                   visible one, so it still shows if the pop never plays. */
                <div ref={badgeRef} data-phase-badge className="relative h-12 w-12 lg:h-14 lg:w-14 flex-shrink-0">
                  {burst && (
                    <span
                      aria-hidden="true"
                      className="wick-burst absolute rounded-2xl"
                      style={{ inset: -4, border: '2px solid rgba(245,158,11,0.8)' }}
                    />
                  )}
                  <div
                    className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      boxShadow: '4px 4px 14px rgba(217,119,6,0.45), -3px -3px 10px rgba(255,255,255,0.7), 0 0 24px rgba(245,158,11,0.35)',
                      transform: pop === 'hidden' ? 'scale(0.18)' : 'scale(1)',
                      opacity: pop === 'hidden' ? 0 : 1,
                      transition: prefersReduced
                        ? 'none'
                        : 'transform .5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .22s ease-out',
                    }}
                  >
                    <span className="text-base font-extrabold leading-none text-white">{phase.number}</span>
                  </div>
                </div>
              ) : (
                <motion.div
                  animate={isLit ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                  style={
                    isLit
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
                    style={{ color: isLit ? '#ffffff' : '#94a3b8', transition: 'color 0.4s ease' }}
                  >
                    {phase.number}
                  </span>
                </motion.div>
              )}
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: isLit ? '#d97706' : '#94a3b8', transition: 'color 0.4s ease' }}
              >
                Phase {phase.number} · {phase.chapter}
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-[1.15] lg:leading-[1.1] mb-2 lg:mb-4">
              {phase.headline}
            </h2>
            <p className={`text-sm lg:text-base text-slate-500 leading-relaxed max-w-[480px] mb-4 lg:mb-6 ${flip ? '' : 'lg:ml-auto'}`}>{phase.story}</p>

            {/* Service card — interior stays left-aligned for readability */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`rounded-2xl p-4 lg:p-6 max-w-[520px] text-left ${flip ? '' : 'lg:ml-auto'}`}
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(255,255,255,0.92)',
              }}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Preqal {phase.serviceName}</h3>
              <p className="text-sm text-slate-500 italic mb-3 lg:mb-4">"{phase.servicePromise}"</p>
              <div className="flex flex-col gap-1.5 lg:gap-2 mb-4 lg:mb-5">
                {phase.deliverables.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-2.5 text-sm text-slate-600 px-3 py-1.5 lg:py-2 rounded-xl"
                    style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
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
                <Link
                  to={`/services/${phase.waKey}`}
                  aria-label={`Learn more about Preqal ${phase.serviceName}`}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors border-b border-amber-300/50 hover:border-amber-500 pb-0.5"
                >
                  Learn more
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Image — desaturated until the journey line reaches it */}
        <motion.div
          data-phase-col="media"
          className="flex-1 min-w-0 w-full lg:max-w-[520px]"
          style={imgStyle}
          {...(deck
            ? {
                initial: { opacity: 0, y: prefersReduced ? 0 : 26 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const },
              }
            : {})}
        >
          <ParallaxImage src={phase.img} alt={phase.imgAlt} pos={phase.imgPos} deck={deck} />
        </motion.div>
      </div>
    </section>
  );
};

const PHASE_SLIDE_OFFSET = 1; // slide 0 is the hero; Phase 01 is slide 1

/* ─── The wick ───
   One continuous fuse threaded through the numbered badges. Nothing is drawn
   until the slide arrives; then the lit wick runs in, amber, until it reaches
   the number block, which pops into place as the flame hits it.

   Phase 01 is where the wick originates, so its badge lights first and the
   burn then runs downward out of it, towards 02. Every later phase is the
   other half of that move: the burn arrives from above and sets off the badge.

   The path is built in device pixels from the badge's measured position, so
   the line genuinely passes through the number rather than near it. */
const WICK_AMPLITUDE = 22; // px either side of the badge's axis — stays in the column gutter
const MOBILE_WICK_X = 10;  // px from the left edge — where the phone's wick has always run
const BURN_IN_MS = 780;    // flame travelling towards a badge
const BURN_OUT_MS = 900;   // flame leaving Phase 01 towards Phase 02

/** A smooth hand-drawn line running through every anchor point. */
const spline = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  const n = (v: number) => v.toFixed(1);
  let d = `M ${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
};

interface Geom { w: number; h: number; gx: number; bx: number; by: number }

const PhaseSlide: React.FC<{ phase: Phase; index: number }> = ({ phase, index }) => {
  const deck = useDeck();
  const prefersReduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState<Geom | null>(null);
  const [seq, setSeq] = useState({ burning: false, popped: false, bursting: false, down: true });

  const isOrigin = index === 0;
  const active = deck ? deck.index === PHASE_SLIDE_OFFSET + index : true;
  /* The flame travels the way the reader is moving: down the deck it arrives
     from above, back up the deck it arrives from below. Phase 01 keeps its
     origin behaviour only when it is reached going forward. */
  const goingDown = deck ? deck.dir === 1 : true;
  const { originEntry } = wickRun(isOrigin, goingDown);
  /* While the wick is lit, draw it with the direction it was lit in — a later
     direction change must not swap the half being shown on a slide that is
     already on its way out. */
  const { segment, hiddenOffset } = wickRun(isOrigin, seq.burning ? seq.down : goingDown);

  /* Where the badge sits and where the gutter runs, in slide pixels.
     The gutter is measured from the two columns rather than assumed to be the
     slide's midpoint: the copy and media columns are different widths, so the
     gap between them sits off-centre and the wick would otherwise hug the edge
     of the service card instead of running down the middle of the space. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const b = badgeRef.current;
      if (!b) return;
      const er = el.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (er.height === 0 || er.width === 0) return;
      const cols = Array.from(el.querySelectorAll('[data-phase-col]'))
        .map((c) => c.getBoundingClientRect())
        .sort((p, q) => p.left - q.left);
      const gutter =
        cols.length === 2 && cols[1].left > cols[0].right
          ? (cols[0].right + cols[1].left) / 2 - er.left
          : er.width / 2;
      setGeom({
        w: er.width,
        h: er.height,
        gx: gutter,
        bx: br.left + br.width / 2 - er.left,
        by: br.top + br.height / 2 - er.top,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll('[data-phase-col]').forEach((c) => ro.observe(c));
    window.addEventListener('resize', measure);
    // Web fonts and images land after first paint and move the badge — the
    // wick has to follow it, so re-measure once things have settled.
    const late = [window.setTimeout(measure, 200), window.setTimeout(measure, 900)];
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      late.forEach(clearTimeout);
    };
  }, []);

  /* Run the fuse whenever this slide becomes the current one. Timers rather
     than animation callbacks, so the sequence still completes if the browser
     throttles animations mid-transition. */
  useEffect(() => {
    if (prefersReduced) return;
    const t: number[] = [];
    const down = goingDown; // the direction this slide was entered with
    if (active) {
      // Clear anything held over from the last visit before the fuse re-runs.
      t.push(window.setTimeout(() => setSeq({ burning: false, popped: false, bursting: false, down }), 0));
      if (originEntry) {
        // 01 lights first, then the wick runs out of it towards 02.
        t.push(window.setTimeout(() => setSeq({ burning: false, popped: true, bursting: true, down }), 160));
        t.push(window.setTimeout(() => setSeq({ burning: true, popped: true, bursting: true, down }), 460));
        t.push(window.setTimeout(() => setSeq({ burning: true, popped: true, bursting: false, down }), 900));
      } else {
        // The flame arrives — from above going down, from below coming back up —
        // and sets the number block off when it lands.
        t.push(window.setTimeout(() => setSeq({ burning: true, popped: false, bursting: false, down }), 150));
        t.push(window.setTimeout(() => setSeq({ burning: true, popped: true, bursting: true, down }), 150 + BURN_IN_MS));
        t.push(window.setTimeout(() => setSeq({ burning: true, popped: true, bursting: false, down }), 150 + BURN_IN_MS + 700));
      }
    } else {
      // Leaving: hold the burnt wick exactly as it is while the slide travels
      // off-screen, then rewind so the fuse runs again on the way back. Reset
      // any earlier lets the outgoing slide visibly un-draw — and if the
      // direction just flipped, un-draw the wrong half.
      t.push(window.setTimeout(() => setSeq({ burning: false, popped: false, bursting: false, down }), 950));
    }
    return () => t.forEach(clearTimeout);
  }, [active, originEntry, goingDown, prefersReduced]);

  const burnt = prefersReduced || seq.burning;
  const pop: 'hidden' | 'shown' = prefersReduced || seq.popped ? 'shown' : 'hidden';
  const burst = seq.bursting;

  const gradId = `wick-flame-${index}`;
  /* The wick runs down the middle of the slide — the gutter between the copy
     on one side and the image on the other — and bows across to meet that
     slide's numbered badge on the way past. */
  let above = '';
  let below = '';
  if (geom) {
    const cx = geom.gx;
    const A = WICK_AMPLITUDE;
    const lean = geom.bx < cx ? -1 : 1; // which side of the gutter the badge is on
    above = spline([
      [cx, 0],
      [cx + A * lean, geom.by * 0.34],
      [cx - A * 0.55 * lean, geom.by * 0.68],
      [geom.bx, geom.by],
    ]);
    const drop = geom.h - geom.by;
    below = spline([
      [geom.bx, geom.by],
      [cx - A * 0.55 * lean, geom.by + drop * 0.26],
      [cx + A * lean, geom.by + drop * 0.62],
      [cx, geom.h],
    ]);
  }
  /* Phones keep the wick the phone already had: a straight amber line hugging
     the left edge rather than the desktop curve through the middle gutter. It
     burns with the same direction and timing, so only the shape differs. */
  /* On a phone the badge sits at the top of the slide, so splitting the line at
     it would leave a stub. The phone keeps the continuous edge-to-edge line it
     has always had; only the end it fills from follows the direction. */
  const mobileLine = geom
    ? `M ${MOBILE_WICK_X} 0 L ${MOBILE_WICK_X} ${geom.h.toFixed(1)}`
    : '';
  const burning = segment === 'above' ? above : below;

  return (
    <div ref={wrapRef} className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
      {geom && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          width={geom.w}
          height={geom.h}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* the lit wick — nothing is drawn until the flame runs */}
          <path
            d={burning}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: burnt ? 0 : hiddenOffset,
              filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.65))',
              /* Only the run towards 0 animates. Everything else — arming the
                 wick at the end the flame will start from, and rewinding a
                 slide that has been left — happens instantly. Without that the
                 transition would animate away from whichever end the last
                 visit finished on, and a return visit would draw backwards. */
              transition: prefersReduced || !active || !seq.burning
                ? 'none'
                : `stroke-dashoffset ${originEntry ? BURN_OUT_MS : BURN_IN_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
            }}
          />
        </svg>
      )}
      {geom && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 lg:hidden"
          width={geom.w}
          height={geom.h}
        >
          <defs>
            <linearGradient id={`${gradId}-m`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <path
            d={mobileLine}
            fill="none"
            stroke={`url(#${gradId}-m)`}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: burnt ? 0 : hiddenOffset,
              filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.65))',
              transition: prefersReduced || !active || !seq.burning
                ? 'none'
                : `stroke-dashoffset ${originEntry ? BURN_OUT_MS : BURN_IN_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
            }}
          />
        </svg>
      )}
      <div className="relative z-10 max-w-6xl mx-auto w-full deck-fit">
        <PhaseSection phase={phase} index={index} deck badgeRef={badgeRef} pop={pop} burst={burst} />
      </div>
    </div>
  );
};

/* ─── Hero ─── */
const JOURNEY_CTA =
  'inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl text-white font-bold text-sm whitespace-nowrap';
const JOURNEY_CTA_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  boxShadow: '5px 5px 14px rgba(217,119,6,0.38), -2px -2px 8px rgba(255,255,255,0.6)',
};

const HeroSection: React.FC<{ deck?: boolean }> = ({ deck }) => {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(heroProgress, [0, 1], ['0%', '12%']);
  const deckApi = useDeck();

  const startJourney = deck ? (
    <button type="button" onClick={() => deckApi?.goTo(1)} className={JOURNEY_CTA} style={JOURNEY_CTA_STYLE}>
      Start the journey ↓
    </button>
  ) : (
    <a href="#phase-1" className={JOURNEY_CTA} style={JOURNEY_CTA_STYLE}>
      Start the journey ↓
    </a>
  );

  return (
    <section
      ref={heroRef}
      className={deck ? '' : 'px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20'}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14">

          <div className={`flex-1 lg:max-w-[580px] lg:mb-0 ${deck ? 'mb-4' : 'mb-10'}`}>
            <motion.div
              className={`inline-flex items-center gap-2 text-amber-600 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full ${deck ? 'py-1.5 mb-2 lg:mb-5' : 'mb-8'}`}
              style={{ background: '#e0e5ec', boxShadow: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              <span className="text-amber-500">◆</span>
              <span>From Idea to Bank</span>
            </motion.div>

            <motion.h1
              className={`text-3xl sm:text-5xl font-black text-slate-900 leading-[1.05] mb-1 lg:mb-3 ${deck ? 'lg:text-[3.1rem]' : 'lg:text-[3.6rem]'}`}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              Every big brand<br />started small.
            </motion.h1>
            <motion.p
              className={`text-3xl sm:text-5xl font-black leading-[1.05] ${deck ? 'mb-2.5 lg:text-[3.1rem] lg:mb-5' : 'lg:text-[3.6rem] mb-7'}`}
              style={{ fontStyle: 'italic', color: '#f59e0b' }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Yours is next.
            </motion.p>

            {/* From lg up the call to action closes the headline. On a phone the
                columns stack, so it waits below the image where the eye lands. */}
            <motion.div
              className="hidden lg:flex"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
                {startJourney}
              </motion.div>
            </motion.div>

          </div>

          {/* Hero image — a shallow banner on phones, the tall frame from lg up */}
          <motion.div
            className={`flex-shrink-0 w-full ${deck ? 'mt-4 lg:mt-0 lg:w-[460px]' : 'lg:w-[520px]'}`}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="hero-media relative overflow-hidden rounded-3xl"
              style={{
                boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
              }}
            >
              <motion.img
                src={`${import.meta.env.BASE_URL}images/hero-bg-1040.webp`}
                alt="Business leader relaxed and confident at their desk"
                className="w-full h-full object-cover"
                style={deck || prefersReduced ? undefined : { objectPosition: 'center top', y: heroImgY, scale: 1.08 }}
                width="520"
                height="416"
                decoding="async"
                {...({ fetchpriority: 'high' } as Record<string, string>)}
              />
            </div>

            <motion.p
              className={`text-sm lg:text-base text-slate-600 leading-relaxed text-center ${deck ? 'mt-3' : 'mt-4'}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
            >
              Picture your business wins a big contract.
            </motion.p>

            <motion.div
              className={`flex justify-center lg:hidden ${deck ? 'mt-4' : 'mt-6'}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.42 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {startJourney}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};


/* ─── Proof band ─── */
const ProofSection: React.FC<{ deck?: boolean }> = ({ deck }) => (
  <div
    /* Deck: the band claims a fixed share of the slide and centres its copy,
       so the band + CTA always add up to exactly one screen. (A transform
       scale can't do this — it shrinks the paint, not the reserved height.) */
    className={`relative overflow-hidden ${deck ? 'py-3 sm:py-5 flex-shrink-0 flex items-center lg:py-0 lg:h-[40%]' : 'py-16 sm:py-20'}`}
    style={{ background: '#0f172a' }}
  >
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
    }} />
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(245,158,11,0.05) 0%, transparent 50%)',
    }} />
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full ${deck ? 'deck-fit' : ''}`}>
      <ScrollReveal yFrom={16}>
        {/* On a phone the claim and the numbers stand side by side, split by a
            hairline rule, with the numbers stacked — the band reads as one
            statement rather than a paragraph with a footnote under it. From md
            up the original arrangement is untouched. */}
        <div className="flex flex-row items-center gap-5 md:items-end md:gap-20">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-3 lg:mb-5">
              The businesses that made it<br />
              <em style={{ color: '#f59e0b' }}>didn't get lucky.</em>
            </h2>
            <p className="text-white/55 text-sm lg:text-base leading-relaxed max-w-[480px]">
              Each one setup international standards.
            </p>
          </div>
          <div className="flex flex-col gap-5 border-l border-white/15 pl-5 flex-shrink-0 md:flex-row md:gap-8 lg:gap-12 md:border-0 md:pl-0">
            <div className="text-center">
              <div className="text-[2.8rem] lg:text-[4.5rem] font-bold text-amber-400 leading-none">98%</div>
              <div className="text-lg text-white/40 font-medium mt-1 md:mt-2 leading-snug">pass rate</div>
            </div>
            <div className="text-center">
              <div className="text-[2.8rem] lg:text-[4.5rem] font-bold text-amber-400 leading-none">9</div>
              <div className="text-lg text-white/40 font-medium mt-1 md:mt-2 leading-snug">months to<br />certification</div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </div>
);

/* ─── Final CTA ─── */
const CTASection: React.FC<{ deck?: boolean; openWhatsApp: () => void }> = ({ deck, openWhatsApp }) => (
  <section className={`px-4 sm:px-6 lg:px-8 ${deck ? 'flex-1 min-h-0 flex flex-col justify-center py-[clamp(0.5rem,2vh,1.5rem)]' : 'py-16 pb-24'}`}>
    <div className={`max-w-4xl mx-auto w-full ${deck ? 'deck-fit' : ''}`}>
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
        <div className={`text-center ${deck ? 'p-4 sm:p-8 md:p-10' : 'p-8 md:p-14'}`}>
          <motion.h2
            className={`text-3xl md:text-4xl font-bold text-white leading-tight ${deck ? 'mb-5 lg:mb-8' : 'mb-10'}`}
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            One message starts everything.
          </motion.h2>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center px-8 py-3 lg:py-4 rounded-xl font-bold text-amber-700 text-base w-full sm:w-auto"
                style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '4px 4px 14px rgba(0,0,0,0.12), -2px -2px 8px rgba(255,255,255,0.15)' }}
              >
                <WhatsAppIcon className="mr-2 h-5 w-5 text-[#25D366]" /> Message Dr. Gravesande
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={springBtn}>
              <Link
                to="/resources"
                className="inline-flex items-center justify-center px-8 py-3 lg:py-4 rounded-xl font-semibold text-white text-base w-full sm:w-auto"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <Download className="mr-2 h-5 w-5" />
                Free Templates
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Disambiguation */}
      <p className={`text-xs text-slate-400 text-center ${deck ? 'mt-3 lg:mt-6' : 'mt-10'}`}>
        Preqal is a brand name and not the word "prequel".
      </p>
    </div>
  </section>
);

const Home: React.FC = () => {
  const { openWhatsApp } = useWhatsApp();
  const slides: DeckSlide[] = [
    {
      label: 'Welcome',
        node: (
          <div className="h-full flex items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto w-full deck-fit">
              <HeroSection deck />
            </div>
          </div>
        ),
      },
      ...PHASES.map((phase, i) => ({
        label: `Phase ${phase.number} · ${phase.chapter}`,
        node: <PhaseSlide phase={phase} index={i} />,
      })),
    {
      label: 'Proof & next step',
        node: (
          <div className="h-full flex flex-col">
            <ProofSection deck />
            <CTASection deck openWhatsApp={openWhatsApp} />
          </div>
        ),
      },
    {
      label: 'Contact & info',
        node: (
          <div className="h-full flex items-center overflow-hidden">
            <div className="w-full deck-fit">
              <Footer compact />
            </div>
          </div>
        ),
      },
    ];

  return (
    <>
      <SEO pageKey="home" />
      <SlideDeck slides={slides} />
    </>
  );
};

export default Home;
