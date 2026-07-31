import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';
import { useWhatsApp, whatsAppLink, WhatsAppIcon, type WhatsAppServiceKey } from '../components/WhatsAppContact';

/* ────────────────────────────────────────────────────────────────────────────
   SEO landing pages for the five productized services.
   Linked from the footer and the home journey. Each page targets one keyword
   cluster for Guyana and the Caribbean and carries Service, FAQPage and
   ProfessionalService structured data.
   ──────────────────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://preqal.org';

interface Faq {
  q: string;
  a: string;
}

interface ScheduleDay {
  day: string;
  title: string;
  desc: string;
}

interface PricingBlock {
  amount: string;
  unit: string;
  priceValue: string;
  priceCurrency: string;
  terms: { label: string; desc: string }[];
  note: string;
}

interface ServicePage {
  slug: string;
  waKey: WhatsAppServiceKey;
  name: string;
  metaKey: string;
  title: string;
  description: string;
  h1: React.ReactNode;
  intro: string;
  body: string[];
  deliverables: string[];
  audience: string;
  cta: string;
  img: string;
  imgAlt: string;
  schedule?: ScheduleDay[];
  pricing?: PricingBlock;
  onePagerHref?: string;
  faqs: Faq[];
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'business-plan',
    waKey: 'business-plan',
    name: 'Preqal Business Plan',
    metaKey: 'servicesBusinessPlan',
    title: 'Business Plan Writers in Guyana | Preqal Business Plan',
    description:
      'Bank-ready business plans for Guyanese entrepreneurs with compliance built in from day one. Fixed price, investor-ready, written in Georgetown.',
    h1: <>Business plans that banks in Guyana <em style={{ color: '#d97706' }}>say yes to.</em></>,
    intro:
      'A good idea deserves a plan a lender can approve. Preqal writes bank-ready business plans for Guyanese entrepreneurs, and we build compliance in from the first page so you never have to undo bad habits later.',
    body: [
      'Most business plans fail at the bank because they read like dreams instead of numbers. We sit with you, put your idea on paper the way lenders and investors need to see it, and map the licences, permits and standards your business will meet along the way.',
      'Because Preqal also builds ISO and HACCP systems, your plan is written by people who know exactly what regulators and certifiers will ask of you in year one. That is what makes a Preqal plan different from a template.',
    ],
    deliverables: ['Bank-ready business plan', 'Cash-flow map', 'Compliance roadmap', 'A planning session with Dr. Gravesande'],
    audience: 'Idea-stage founders, informal businesses ready to formalise, and owners applying for loans or grants in Guyana.',
    cta: 'Get your Business Plan',
    img: 'images/business-team.jpg',
    imgAlt: 'A Guyanese business team planning at a table',
    faqs: [
      {
        q: 'How much does a business plan cost in Guyana?',
        a: 'Preqal prices business plans as a fixed package, so you know the full cost before we start. Message us on WhatsApp at +592 633 5874 and we will quote you within one business day.',
      },
      {
        q: 'How long does it take to write?',
        a: 'Most plans are ready within two to three weeks, including your planning session, the financial projections and one round of revisions.',
      },
      {
        q: 'Will the plan work for bank loans and grant applications?',
        a: 'Yes. We write to the format Guyanese lenders and agencies such as the Small Business Bureau expect, with realistic cash-flow projections and a compliance roadmap they can verify.',
      },
    ],
  },
  {
    slug: 'risk-scan',
    waKey: 'risk-scan',
    name: 'Preqal Risk Scan™',
    metaKey: 'servicesRiskScan',
    title: 'Virtual Quality Audit in Guyana | Preqal Risk Scan™',
    description:
      'A 5-day virtual quality audit for small businesses in Guyana and the Caribbean. ISO 9001 gap analysis, quality policy and document plan — GY$100,000 flat.',
    h1: <>Every gap in your business, found <em style={{ color: '#d97706' }}>in five days — online.</em></>,
    intro:
      'You are too close to your own business to see its gaps. The Risk Scan is a five-day audit delivered fully online: we study your documents, talk with your people and hand you a clear picture of where you stand — for one flat fee of GY$100,000.',
    body: [
      'Everything happens over video calls and shared files, so there is no site visit to host and no travel cost hidden in the price. Your team keeps working while we audit around them. We need about one hour of your time on the first day, one hour on the last, and access to your documents in between.',
      'We measure what we find against ISO 9001, the international standard for how well-run businesses operate. You do not need any system in place before we start — most of our clients begin with almost nothing written down. The audit shows what you already do well, what is missing and what to fix first, ranked by what can hurt your business soonest.',
      'The Risk Scan is the first step before our larger programmes because we never prescribe before we diagnose. It also stands alone: many businesses book it before a tender, a big contract or a certification push, or simply to know where they stand.',
    ],
    deliverables: [
      'Organisation chart',
      'Quality policy — written for you, or revised',
      'ISO 9001 gap analysis',
      'Plain-language compliance recommendations',
      'Proposed document master list',
    ],
    audience: 'Small and medium businesses in Guyana and the Caribbean — from a one-person operation to about fifty staff — that want clarity before an audit, a tender or a certification project.',
    cta: 'Book the Risk Scan',
    img: 'images/services/phase1-diagnose.jpg',
    imgAlt: 'Consultant reviewing business documents with a client in Guyana',
    schedule: [
      {
        day: 'Day 1',
        title: 'Opening meeting',
        desc: 'A one-hour video call to meet your team, walk through the week and agree what documents we need. You get a checklist and a secure way to share files.',
      },
      {
        day: 'Day 2',
        title: 'Document review',
        desc: 'We read everything you shared — licences, records and any policies you have — and measure it all against ISO 9001.',
      },
      {
        day: 'Day 3',
        title: 'Staff interviews',
        desc: 'Short video calls with a few staff members, picked at random. Not a test — honest conversations about how the work really gets done.',
      },
      {
        day: 'Day 4',
        title: 'Report writing',
        desc: 'We write your report: every finding, every gap and every recommendation in plain language, ranked by what matters most.',
      },
      {
        day: 'Day 5',
        title: 'Closing meeting',
        desc: 'A one-hour video call to present the full report, hand over your five deliverables and answer every question.',
      },
    ],
    pricing: {
      amount: 'GY$100,000',
      unit: 'flat — everything included',
      priceValue: '100000',
      priceCurrency: 'GYD',
      terms: [
        { label: '50% books your week', desc: 'GY$50,000 confirms your audit dates and starts your document checklist.' },
        { label: '50% on delivery', desc: 'GY$50,000 is due on Day 5, when your report and all five deliverables are handed over.' },
      ],
      note: 'No travel costs. No hidden extras. Delivered fully online.',
    },
    onePagerHref: '/risk-scan-one-pager.pdf',
    faqs: [
      {
        q: 'How much does the Risk Scan cost?',
        a: 'GY$100,000 flat, paid in two equal parts: GY$50,000 books your audit week and GY$50,000 is due on Day 5 when your report and documents are delivered. Because the audit is virtual, there are no travel costs on top.',
      },
      {
        q: 'How can you audit my business without visiting it?',
        a: 'The whole audit runs on video calls and shared documents. We assess your operation through your records, your paperwork and your people — the same evidence a certification auditor examines first. If you want an on-site walk-through as well, we can add one as a separate service.',
      },
      {
        q: 'Is this a certification audit?',
        a: 'No. Certificates only come from independent certification bodies. The Risk Scan tells you how ready you are and what to fix first, so nothing surprises you when you go for certification or face a customer audit.',
      },
      {
        q: 'What if I have no documents or system at all?',
        a: 'Then this was built for you. Most clients start with little or nothing written down. You still walk away with a quality policy, an organisation chart and a clear list of the documents your business needs — that is your starting system.',
      },
    ],
  },
  {
    slug: 'systems-builder',
    waKey: 'systems-builder',
    name: 'Preqal Systems Builder™',
    metaKey: 'servicesSystemsBuilder',
    title: 'ISO 9001 Certification Consultants Guyana | Systems Builder',
    description:
      'ISO 9001, ISO 14001 and ISO 45001 management systems built with your team in 9 months, including training, internal audits and a mock certification audit.',
    h1: <>ISO certification consultants for <em style={{ color: '#d97706' }}>Guyanese businesses.</em></>,
    intro:
      'Preqal Systems Builder takes your business from gaps to certification ready in nine months. We design your management system around how your business really works, train your team to own it and test everything before the real audit.',
    body: [
      'The programme covers ISO 9001 quality management, ISO 14001 environmental management and ISO 45001 occupational health and safety, alone or as one integrated system. Your documents are written in plain language your team can actually use, and your own staff are trained as internal auditors.',
      'The final step is a mock certification audit run with the same rigour as the real thing. By the time your certification body arrives, you have already been through the questions, the evidence checks and the closing meeting. Preqal clients hold a 98% pass rate at certification audits.',
    ],
    deliverables: ['Integrated management system design', 'Plain-language SOPs', 'Internal auditor training', 'Internal audit and management review', 'Mock certification audit'],
    audience: 'Guyanese and Caribbean businesses from five to five hundred staff that want ISO 9001, ISO 14001 or ISO 45001 certification.',
    cta: 'Start the 9-month build',
    img: 'images/services/phase2-train.jpg',
    imgAlt: 'Quality management training workshop in Guyana',
    faqs: [
      {
        q: 'How long does ISO 9001 certification take in Guyana?',
        a: 'With Preqal the build takes nine months from Risk Scan to certification readiness. The certification body audit itself is scheduled separately and usually follows within weeks.',
      },
      {
        q: 'How much does ISO certification cost in Guyana?',
        a: 'Preqal prices the programme by the size of your team, paid monthly over nine months, so a five-person shop pays far less than a hundred-person plant. Message us for your tier.',
      },
      {
        q: 'Do you also handle the certification audit?',
        a: 'Certification must come from an independent certification body, and we help you choose one. Our job is to make sure you walk into that audit already knowing how it ends.',
      },
    ],
  },
  {
    slug: 'certified-care',
    waKey: 'certified-care',
    name: 'Preqal Certified Care™',
    metaKey: 'servicesCertifiedCare',
    title: 'ISO Certification Maintenance Guyana | Preqal Certified Care',
    description:
      'Monthly support that keeps your ISO or HACCP certification valid. System upkeep, annual internal audits and surveillance-visit support in Guyana.',
    h1: <>Keep your certification, <em style={{ color: '#d97706' }}>year after year.</em></>,
    intro:
      'Getting certified was the milestone. Staying certified is the standard. Certified Care is a monthly programme that keeps your management system sharp, so every surveillance audit feels like an ordinary day.',
    body: [
      'Systems drift when businesses grow, staff change and standards update. Under Certified Care we keep your documents current, run your annual internal audit and sit beside you during every surveillance visit from your certification body.',
      'The programme also includes priority support when something goes wrong, from a failed audit finding to a customer complaint that needs a formal corrective action. You never carry the system alone.',
    ],
    deliverables: ['Monthly system upkeep', 'Annual internal audit', 'Surveillance-visit support', 'Priority support line'],
    audience: 'Businesses in Guyana and the Caribbean holding ISO 9001, ISO 14001, ISO 45001, HACCP or FSSC 22000 certification.',
    cta: 'Stay certified',
    img: 'images/services/phase3-audit.jpg',
    imgAlt: 'Internal audit under way at a certified Guyanese business',
    faqs: [
      {
        q: 'What happens if I skip maintenance after certification?',
        a: 'Certificates are checked at surveillance audits every year. Businesses that let their systems drift fail those visits and can lose the certificate they worked nine months to earn.',
      },
      {
        q: 'Is there a contract lock-in?',
        a: 'No. Certified Care is a monthly retainer sized to your business, and the management system remains yours forever.',
      },
      {
        q: 'Can you take over a system another consultant built?',
        a: 'Yes. We start with a short review of your existing system, bring the documents up to date and continue from there.',
      },
    ],
  },
  {
    slug: 'export-ready',
    waKey: 'export-ready',
    name: 'Preqal Export-Ready™',
    metaKey: 'servicesExportReady',
    title: 'HACCP & Export Certification for Guyana Agro-Processors',
    description:
      'Preqal Export-Ready takes agro-processors from unregulated to export certified through HACCP, ISO 22000 and GFSI readiness. Made in Guyana, trusted abroad.',
    h1: <>HACCP and export certification for <em style={{ color: '#d97706' }}>Guyanese agro-processors.</em></>,
    intro:
      'CARICOM buyers and international shelves gate on one thing, a food safety certificate they trust. Export-Ready is a fixed-scope programme that takes a small agro-processor from unregulated to export certified through three staged gates.',
    body: [
      'Gate one builds your foundation with prerequisite programmes and HACCP, the ground floor of food safety. Gate two installs a full ISO 22000 food safety management system in your daily operations. Gate three prepares you for a GFSI-recognised scheme such as FSSC 22000, BRCGS or SQF, the certificates international buyers require.',
      'Every gate delivers a gap assessment, the documented system, staff training, an internal audit and a mock certification audit. The programme is productized rather than open-ended, which means it repeats across a whole cluster of producers. One certified processor becomes a delivery model for a nation of them.',
    ],
    deliverables: ['HACCP foundation', 'ISO 22000 food safety system', 'GFSI scheme readiness', 'Staff training at every gate', 'Mock certification audits'],
    audience: 'Agro-processors, poultry operations and food manufacturers in Guyana and the Caribbean with export ambition.',
    cta: 'Start Export-Ready™',
    img: 'images/case-studies/poultry.jpg',
    imgAlt: 'Guyanese agro-processing operation preparing food products for export',
    faqs: [
      {
        q: 'Do I need HACCP certification to export food from Guyana?',
        a: 'Yes in practice. HACCP is required by regulators in the United States, Canada, the United Kingdom and the European Union, and most CARICOM buyers ask for it as a minimum.',
      },
      {
        q: 'What is the difference between HACCP, ISO 22000 and GFSI?',
        a: 'HACCP is the foundation method for controlling food safety hazards. ISO 22000 wraps HACCP inside a full management system. GFSI-recognised schemes such as FSSC 22000, BRCGS and SQF sit on top and are the certificates large international buyers accept.',
      },
      {
        q: 'How does this fit the Made in Guyana certification from GNBS?',
        a: 'They complement each other. The GNBS mark tells buyers where your product comes from, while Export-Ready builds the food safety certification that lets the product cross borders.',
      },
    ],
  },
];

/* ── shared bits ─────────────────────────────────────────────────────────── */

const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
  border: '1.5px solid rgba(255,255,255,0.92)',
} as React.CSSProperties;

const professionalServiceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${BASE_URL}/#localbusiness`,
  name: 'Preqal Inc',
  description:
    'Quality, safety and compliance consultancy in Georgetown, Guyana. ISO 9001, HACCP and export certification consultants for Guyana and the Caribbean.',
  url: BASE_URL,
  telephone: '+5926335874',
  email: 'info@preqal.org',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Georgetown',
    addressRegion: 'Demerara-Mahaica',
    addressCountry: 'GY',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 6.8013, longitude: -58.1551 },
  areaServed: [
    { '@type': 'Country', name: 'Guyana' },
    { '@type': 'Place', name: 'Caribbean' },
  ],
  priceRange: '$$',
});

const serviceSchema = (p: ServicePage) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE_URL}/services/${p.slug}#service`,
  name: p.name,
  serviceType: p.title.split('|')[0].trim(),
  description: p.description,
  provider: { '@id': `${BASE_URL}/#organization` },
  areaServed: [
    { '@type': 'Country', name: 'Guyana' },
    { '@type': 'Place', name: 'Caribbean' },
  ],
  offers: {
    '@type': 'Offer',
    url: `${BASE_URL}/services/${p.slug}`,
    ...(p.pricing ? { price: p.pricing.priceValue, priceCurrency: p.pricing.priceCurrency } : {}),
  },
});

const faqSchema = (p: ServicePage) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: p.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/* ── landing page ────────────────────────────────────────────────────────── */

const ServiceLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openWhatsApp } = useWhatsApp();
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  if (!page) return <Navigate to="/services" replace />;

  const others = SERVICE_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <>
      <SEO
        pageKey="home"
        customData={{
          title: page.title,
          description: page.description,
          canonical: `${BASE_URL}/services/${page.slug}/`,
        }}
        extraSchemas={[professionalServiceSchema(), serviceSchema(page), faqSchema(page)]}
      />
      <div className="min-h-screen pb-20">

        {/* Hero */}
        <section className="pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14">
              <div className="flex-1 lg:max-w-[600px]">
                <motion.p
                  className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                >
                  {page.name}
                </motion.p>
                <motion.h1
                  className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5"
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {page.h1}
                </motion.h1>
                <motion.p
                  className="text-lg text-slate-500 leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.22 }}
                >
                  {page.intro}
                </motion.p>
                <motion.div
                  className="flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.34 }}
                >
                  <a
                    href={whatsAppLink(page.waKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '5px 5px 14px rgba(217,119,6,0.38), -2px -2px 8px rgba(255,255,255,0.6)' }}
                  >
                    <WhatsAppIcon className="h-4 w-4" /> {page.cta}
                  </a>
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors border-b-2 border-amber-300/50 hover:border-amber-500 pb-0.5"
                  >
                    Ask a question first
                  </button>
                </motion.div>
              </div>
              <motion.div
                className="hidden lg:block flex-shrink-0 w-[440px]"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="overflow-hidden rounded-3xl relative" style={{ aspectRatio: '4 / 3', boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)' }}>
                  <img
                    src={`${import.meta.env.BASE_URL}${page.img}`}
                    alt={page.imgAlt}
                    className="w-full h-full object-cover"
                    width="440"
                    height="330"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.10) 0%, transparent 50%, rgba(15,23,42,0.20) 100%)' }} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Body + deliverables */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <ScrollReveal yFrom={16}>
                {page.body.map((para) => (
                  <p key={para.slice(0, 24)} className="text-base text-slate-600 leading-relaxed mb-5 max-w-[620px]">{para}</p>
                ))}
                <p className="text-sm text-slate-500 leading-relaxed max-w-[620px]">
                  <strong className="text-slate-700">Who this is for.</strong> {page.audience}
                </p>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-2">
              <ScrollReveal yFrom={20} delay={100}>
                <div className="rounded-2xl p-7" style={glassCard}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 mb-4">You walk away with</p>
                  <div className="flex flex-col gap-2.5">
                    {page.deliverables.map((d) => (
                      <div
                        key={d}
                        className="flex items-center gap-2.5 text-sm text-slate-600 px-3 py-2.5 rounded-xl"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 5-day schedule (services that define one) */}
        {page.schedule && (
          <section className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal yFrom={14}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">How the week runs</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                  Five days, <em style={{ color: '#d97706' }}>start to finish.</em>
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {page.schedule.map((s, i) => (
                  <ScrollReveal key={s.day} yFrom={18} delay={i * 80}>
                    <div className="rounded-2xl p-5 h-full" style={glassCard}>
                      <span
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-amber-600 mb-3"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                      >
                        {s.day}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mb-1.5">{s.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Transparent pricing (services that publish one) */}
        {page.pricing && (
          <div className="relative overflow-hidden py-14 sm:py-16 my-10" style={{ background: '#0f172a' }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%)' }}
            />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <ScrollReveal yFrom={16}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-5">One flat fee</p>
                <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16">
                  <div className="flex-shrink-0">
                    <div className="text-5xl sm:text-6xl font-bold text-amber-400 leading-none">{page.pricing.amount}</div>
                    <div className="text-sm text-white/55 font-medium mt-3">{page.pricing.unit}</div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    {page.pricing.terms.map((t) => (
                      <div
                        key={t.label}
                        className="rounded-2xl px-5 py-4"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                      >
                        <p className="text-sm font-bold text-white mb-0.5">{t.label}</p>
                        <p className="text-sm text-white/55 leading-relaxed">{t.desc}</p>
                      </div>
                    ))}
                    <p className="text-xs text-white/40">{page.pricing.note}</p>
                    {page.onePagerHref && (
                      <a
                        href={page.onePagerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors border-b border-amber-400/40 hover:border-amber-300 pb-0.5"
                      >
                        Download this as a one-page PDF
                      </a>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* FAQs */}
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal yFrom={14}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Common questions</h2>
            </ScrollReveal>
            <div className="flex flex-col gap-4">
              {page.faqs.map((f, i) => (
                <ScrollReveal key={f.q} yFrom={14} delay={i * 70}>
                  <div className="rounded-2xl p-6" style={glassCard}>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{f.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Related + CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal yFrom={14}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">The other steps on the journey</p>
              <div className="flex flex-wrap gap-3 mb-12">
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    to={`/services/${o.slug}`}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors"
                    style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px #a3b1c6, -3px -3px 8px #ffffff' }}
                  >
                    {o.name} <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
                  </Link>
                ))}
                <Link
                  to="/"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-600"
                  style={{ background: '#e0e5ec', boxShadow: '3px 3px 8px #a3b1c6, -3px -3px 8px #ffffff', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  See the full journey
                </Link>
              </div>
              <div
                className="rounded-3xl p-10 text-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)', boxShadow: '10px 10px 28px rgba(180,83,9,0.3)' }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">One message starts everything.</h2>
                <p className="text-amber-100 mb-7 max-w-md mx-auto">Expect no pressure and no jargon. Tell Dr. Gravesande where you are and he will show you your next move.</p>
                <a
                  href={whatsAppLink(page.waKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-amber-700 text-base"
                  style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '4px 4px 14px rgba(0,0,0,0.12)' }}
                >
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {page.cta}
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
};

/* ── /services index ─────────────────────────────────────────────────────── */

export const ServicesIndex: React.FC = () => (
  <>
    <SEO
      pageKey="home"
      customData={{
        title: 'Services | ISO, HACCP & Export Certification Consulting | Preqal',
        description:
          'Five fixed-scope services that take a Guyanese business from idea to export. Business plans, risk scans, ISO systems, certification care and export readiness.',
        canonical: `${BASE_URL}/services/`,
      }}
      extraSchemas={[professionalServiceSchema()]}
    />
    <div className="min-h-screen pb-20">
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Services</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5">
            Five services. <em style={{ color: '#d97706' }}>One journey.</em>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Each service is fixed in scope and price, and each one takes you to the next step
            on the road from idea to export.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {SERVICE_PAGES.map((p, i) => (
            <ScrollReveal key={p.slug} yFrom={16} delay={i * 60}>
              <Link
                to={`/services/${p.slug}`}
                className="flex items-center gap-4 rounded-2xl p-6 group"
                style={glassCard}
              >
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-amber-600 flex-shrink-0"
                  style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                >
                  0{i + 1}
                </span>
                <span className="flex-grow">
                  <span className="block text-base font-bold text-slate-900">{p.name}</span>
                  <span className="block text-sm text-slate-500 leading-snug">{p.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  </>
);

export default ServiceLanding;
