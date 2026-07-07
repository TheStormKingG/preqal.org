import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';
import { whatsAppLink, WhatsAppIcon, type WhatsAppServiceKey } from '../components/WhatsAppContact';

/* ────────────────────────────────────────────────────────────────────────────
   Cornerstone guides — long-form informational content targeting the
   questions Guyanese businesses actually ask Google and AI assistants.
   Each guide carries Article + FAQPage schema and funnels to one service.
   ──────────────────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://preqal.org';

interface GuideSection {
  h2: string;
  paras: string[];
}

interface Guide {
  slug: string;
  title: string;
  description: string;
  h1: React.ReactNode;
  intro: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  serviceSlug: string;
  serviceName: string;
  waKey: WhatsAppServiceKey;
  published: string;
}

export const GUIDES: Guide[] = [
  {
    slug: 'haccp-certification-guyana',
    title: 'How to Get HACCP Certified in Guyana (2026 Guide) | Preqal',
    description:
      'A plain-language guide to HACCP certification for Guyanese food businesses. What it is, who needs it, the seven steps, realistic timelines and costs.',
    h1: <>How to get HACCP certified in <em style={{ color: '#d97706' }}>Guyana</em></>,
    intro:
      'HACCP is the certificate that opens doors for Guyanese food businesses. Buyers ask for it, regulators expect it, and export markets require it. This guide explains what it is and how to get it, in plain language.',
    published: '2026-07-07',
    serviceSlug: 'export-ready',
    serviceName: 'Export-Ready™',
    waKey: 'export-ready',
    sections: [
      {
        h2: 'What HACCP actually is',
        paras: [
          'HACCP stands for Hazard Analysis and Critical Control Points. Behind the long name sits a simple idea. You look at every step where your food is made, you find the points where something could make it unsafe, and you put a control at each of those points with a record to prove the control worked.',
          'It is not a piece of paper you buy. It is a way of running your kitchen, plant or processing room that an independent auditor then certifies. That distinction matters, because auditors can tell quickly whether a system lives in the business or only in a binder.',
        ],
      },
      {
        h2: 'Who needs it in Guyana',
        paras: [
          'If you process, package or handle food commercially in Guyana, HACCP is either already expected of you or soon will be. The Guyana Food Safety Authority oversees food safety locally, and buyers in CARICOM and further abroad ask for HACCP as their minimum before they will stock your product.',
          'Exporters feel it first. The United States, Canada, the United Kingdom and the European Union all build HACCP requirements into their food import rules. A Guyanese agro-processor without HACCP is effectively locked out of those shelves regardless of how good the product tastes.',
        ],
      },
      {
        h2: 'The seven steps, in order',
        paras: [
          'First, get your prerequisite programmes right. These are the basics that make everything else possible, such as clean premises, pest control, safe water, staff hygiene and proper storage. Auditors check these before they look at anything clever.',
          'Second, map your process from raw material to finished product. Third, analyse each step for biological, chemical and physical hazards. Fourth, decide which steps are critical control points, the places where a failure would actually make food unsafe. Fifth, set measurable limits at each of those points, such as cooking temperatures or pH levels.',
          'Sixth, build monitoring and record keeping so you can prove each control worked on each production day. Seventh, verify the whole system with an internal audit and then invite a certification body to audit you for the certificate.',
        ],
      },
      {
        h2: 'How long it takes and what it costs',
        paras: [
          'A small processor with committed management can be certification ready in four to eight months. The spread depends on how far your prerequisite programmes are from where they need to be, and how quickly your team absorbs the new records and habits.',
          'Costs come in two parts. The consultant who builds the system with you, and the certification body that audits it. Beware of anyone selling a cheap certificate without an on-site audit, because buyers and regulators check the issuing body, and a certificate from a mill is worse than none.',
        ],
      },
      {
        h2: 'The mistakes that sink first attempts',
        paras: [
          'The most common failure we see in Guyana is paperwork written for the auditor instead of the team. If your staff cannot explain the records they sign, the audit fails no matter how thick the manual is. The second is skipping prerequisite programmes and jumping straight to HACCP charts. The third is treating certification as the finish line and letting the system decay the week after the certificate arrives.',
          'Preqal builds HACCP through our Export-Ready programme, where HACCP is gate one of three on the road to full export certification. Your team gets trained, your documents get written in plain language, and you sit a mock audit before the real one.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is HACCP mandatory to export food from Guyana?',
        a: 'In practice yes. The major import markets including the United States, Canada, the United Kingdom and the European Union require it, and most CARICOM buyers ask for it as their minimum standard.',
      },
      {
        q: 'How long does HACCP certification take in Guyana?',
        a: 'A focused small processor typically reaches certification readiness in four to eight months, depending on the state of their premises and prerequisite programmes when they start.',
      },
      {
        q: 'What is the difference between HACCP and ISO 22000?',
        a: 'HACCP is the core method for controlling food safety hazards. ISO 22000 wraps that method inside a full management system with leadership, planning and improvement requirements. Most export journeys do HACCP first and ISO 22000 second.',
      },
      {
        q: 'Can I do HACCP without a consultant?',
        a: 'Yes, and some businesses do. A consultant mainly buys you speed and a much lower risk of failing the audit, because they know what auditors check and where first attempts usually go wrong.',
      },
    ],
  },
  {
    slug: 'iso-9001-cost-guyana',
    title: 'What ISO 9001 Certification Costs in Guyana (Honest Guide) | Preqal',
    description:
      'The real cost of ISO 9001 certification for a Guyanese business. The three costs to separate, what drives price, and how to avoid paying for paper.',
    h1: <>What ISO 9001 certification really costs in <em style={{ color: '#d97706' }}>Guyana</em></>,
    intro:
      'Everyone asks the price first and the answer is usually vague. Here is an honest breakdown of what a Guyanese business actually pays for ISO 9001 certification, and where the money goes.',
    published: '2026-07-07',
    serviceSlug: 'systems-builder',
    serviceName: 'Systems Builder™',
    waKey: 'systems-builder',
    sections: [
      {
        h2: 'Separate the three costs first',
        paras: [
          'Most confusion about ISO pricing comes from mixing three different bills into one number. The first is the consultant who designs and builds the management system with your team. The second is the certification body, the independent auditor who checks the system and issues the certificate. The third is your own staff time, which is real money even though no invoice arrives for it.',
          'Any quote that does not tell you which of these it covers is hiding something. A consultant cannot sell you the certificate, and a certification body cannot build your system. You will always deal with both.',
        ],
      },
      {
        h2: 'What actually drives the price',
        paras: [
          'Size matters most. A five-person workshop needs far fewer documented processes, less training and a shorter audit than a hundred-person plant, so every honest provider prices by headcount and complexity. The number of standards matters too. Adding ISO 14001 for environment or ISO 45001 for safety to your ISO 9001 project raises the work, though an integrated system costs far less than three separate ones.',
          'The state of your business today is the third driver. A company that already keeps good records climbs faster than one starting from scratch. This is why Preqal begins every engagement with a Risk Scan, because pricing a nine-month build without diagnosing the starting point is guesswork.',
        ],
      },
      {
        h2: 'How Preqal prices it',
        paras: [
          'Preqal prices the full nine-month Systems Builder programme by the size of your team, paid monthly, with the tier confirmed before you commit. A solo founder pays a fraction of what a large organisation pays, and the price includes the system design, plain-language documents, staff training, internal audit, management review and a full mock certification audit.',
          'The certification body fee sits outside that and is paid to the auditor you choose. We help you pick a reputable body and prepare you so thoroughly that our clients hold a 98% pass rate at that final audit.',
        ],
      },
      {
        h2: 'Cheap paper versus a working system',
        paras: [
          'You will find offers online for ISO certificates at prices that look too good to be true. They are. Certificate mills sell paper without building anything, and serious buyers check the issuing body in seconds. A tender committee that discovers a mill certificate does not just reject the bid, it remembers the company that submitted it.',
          'The return on a genuine system shows up in won tenders, fewer repeated mistakes, smoother audits from your own customers, and a business that runs on process instead of memory. That is what the money buys.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does ISO 9001 cost for a small business in Guyana?',
        a: 'Preqal prices by team size with monthly payments over nine months, so a small business pays a small-business price. Message us on WhatsApp at +592 633 5874 and we will confirm your tier within a day.',
      },
      {
        q: 'How long does ISO 9001 certification take?',
        a: 'With Preqal the build takes nine months from Risk Scan to certification readiness. The certification body audit is scheduled after that and usually follows within weeks.',
      },
      {
        q: 'Are there ongoing costs after certification?',
        a: 'Yes. Certification bodies run surveillance audits yearly, and your system needs upkeep as staff and standards change. Our Certified Care retainer covers that upkeep, the annual internal audit and support during every surveillance visit.',
      },
      {
        q: 'Can I get certified without a consultant?',
        a: 'It is possible if someone in your team knows the standard well and has time to build the system. Most businesses find the consultant pays for itself in avoided rework and a passed first audit.',
      },
    ],
  },
  {
    slug: 'export-food-from-guyana',
    title: 'How to Export Food From Guyana, Step by Step | Preqal',
    description:
      'The road from a Guyanese kitchen to foreign shelves. Registrations, food safety certification, what CARICOM buyers ask for, and realistic timelines.',
    h1: <>How to export food from Guyana, <em style={{ color: '#d97706' }}>step by step</em></>,
    intro:
      'Guyanese food sells wherever it lands. The diaspora wants it, CARICOM wants it, and the world is discovering it. What stands between a great product and a foreign shelf is paperwork and certification, and both are beatable. Here is the road.',
    published: '2026-07-07',
    serviceSlug: 'export-ready',
    serviceName: 'Export-Ready™',
    waKey: 'export-ready',
    sections: [
      {
        h2: 'Get your house papers first',
        paras: [
          'Before any border matters, your business needs to stand properly at home. That means business registration, tax registration, and the food safety basics for your premises under the Guyana Food Safety Authority. The Guyana Marketing Corporation publishes requirements for agro-processor certification and supports new exporters, and the Guyana National Bureau of Standards runs the Made in Guyana mark that tells buyers where your product comes from.',
          'None of this is difficult, but buyers and border agencies check it, and missing basics stall deals that took months to win.',
        ],
      },
      {
        h2: 'Climb the certification ladder',
        paras: [
          'Food safety certification works like a ladder, and each rung opens a bigger market. Good manufacturing practices and prerequisite programmes are the ground floor. HACCP sits above them and is the minimum for most cross-border trade. ISO 22000 wraps HACCP inside a full management system. At the top sit the GFSI-recognised schemes such as FSSC 22000, BRCGS and SQF, which the largest international buyers treat as their entry ticket.',
          'You do not need the top rung to start exporting. Many CARICOM deals close with HACCP alone. But every rung you climb widens who will buy from you and strengthens your price.',
        ],
      },
      {
        h2: 'What buyers actually ask for',
        paras: [
          'A serious buyer will ask for your certification, a sample of your labels with correct ingredient and allergen declarations, shelf-life evidence, and traceability, meaning you can show which batch of raw material went into which carton. Exporters who can answer those four questions quickly get taken seriously. Exporters who cannot get polite silence.',
          'The certificate matters most because it stands in for everything the buyer cannot see. They will never visit your plant. Your HACCP or FSSC certificate is your plant, as far as they are concerned.',
        ],
      },
      {
        h2: 'Timelines, costs and the cluster advantage',
        paras: [
          'From informal kitchen to HACCP-certified exporter typically takes six to twelve months of real work. The cost splits between upgrading premises where needed, the consultant who builds your system, and the certification audit itself.',
          'There is also strength in numbers. Preqal built Export-Ready as a fixed-scope programme that repeats across a whole cluster of producers, which lowers the cost per business and matches the national push to get Guyanese agro-processed food meeting global standards. One certified processor becomes a path that neighbours can follow.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need HACCP to export food to Trinidad or Barbados?',
        a: 'Most commercial buyers in CARICOM ask for HACCP as their minimum, and import authorities expect food from certified facilities. Treat it as required.',
      },
      {
        q: 'What is GFSI and do I need it?',
        a: 'GFSI is a global benchmark that recognises top food safety schemes such as FSSC 22000, BRCGS and SQF. You need one of those certificates when you target large international retailers. For regional trade HACCP usually opens the door.',
      },
      {
        q: 'I cook from home. Where do I start?',
        a: 'Start with business registration and the food safety basics for your space, then a gap assessment so you know exactly what stands between you and certification. Preqal\'s Risk Scan does that in seven days.',
      },
      {
        q: 'How does the Made in Guyana mark fit in?',
        a: 'The GNBS Made in Guyana certification tells buyers your product is genuinely local, which helps marketing. Food safety certification like HACCP is what lets the product legally and commercially cross borders. Strong exporters carry both.',
      },
    ],
  },
];

const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
  border: '1.5px solid rgba(255,255,255,0.92)',
} as React.CSSProperties;

const articleSchema = (g: Guide) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${BASE_URL}/guides/${g.slug}#article`,
  headline: g.title.split('|')[0].trim(),
  description: g.description,
  datePublished: g.published,
  dateModified: g.published,
  inLanguage: 'en',
  author: { '@type': 'Person', name: 'Dr. Stefan Gravesande', url: `${BASE_URL}/contact` },
  publisher: { '@id': `${BASE_URL}/#organization` },
  mainEntityOfPage: `${BASE_URL}/guides/${g.slug}`,
});

const faqSchema = (g: Guide) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: g.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const GuideArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return <Navigate to="/guides" replace />;

  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <SEO
        pageKey="home"
        customData={{
          title: guide.title,
          description: guide.description,
          canonical: `${BASE_URL}/guides/${guide.slug}/`,
          ogType: 'article',
        }}
        extraSchemas={[articleSchema(guide), faqSchema(guide)]}
      />
      <div className="min-h-screen pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.p
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          >
            Preqal Guides · Plain-language answers
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {guide.h1}
          </motion.h1>
          <motion.p
            className="text-lg text-slate-500 leading-relaxed mb-10"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
          >
            {guide.intro}
          </motion.p>

          {guide.sections.map((s) => (
            <ScrollReveal key={s.h2} yFrom={14}>
              <section className="mb-9">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{s.h2}</h2>
                {s.paras.map((p) => (
                  <p key={p.slice(0, 24)} className="text-base text-slate-600 leading-relaxed mb-4">{p}</p>
                ))}
              </section>
            </ScrollReveal>
          ))}

          {/* FAQ */}
          <ScrollReveal yFrom={14}>
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Quick answers</h2>
          </ScrollReveal>
          <div className="flex flex-col gap-4 mb-12">
            {guide.faqs.map((f, i) => (
              <ScrollReveal key={f.q} yFrom={12} delay={i * 60}>
                <div className="rounded-2xl p-6" style={glassCard}>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal yFrom={16}>
            <div
              className="rounded-3xl p-9 text-center mb-12"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)', boxShadow: '10px 10px 28px rgba(180,83,9,0.3)' }}
            >
              <h2 className="text-2xl font-bold text-white mb-3">Ready to walk this road with help?</h2>
              <p className="text-amber-100 mb-6 max-w-md mx-auto">
                Preqal {guide.serviceName} was built for exactly this journey. One message starts everything.
              </p>
              <div className="flex items-center justify-center gap-5 flex-wrap">
                <a
                  href={whatsAppLink(guide.waKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-amber-700 text-sm"
                  style={{ background: 'rgba(255,255,255,0.95)' }}
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Message Dr. Gravesande
                </a>
                <Link
                  to={`/services/${guide.serviceSlug}`}
                  className="text-sm font-semibold text-white/90 hover:text-white border-b border-white/40 pb-0.5"
                >
                  About {guide.serviceName} <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Other guides */}
          <ScrollReveal yFrom={12}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">More guides</p>
            <div className="flex flex-col gap-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={`/guides/${o.slug}`}
                  className="flex items-center gap-3 rounded-2xl p-5 group"
                  style={glassCard}
                >
                  <BookOpen className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="flex-grow text-sm font-semibold text-slate-700">{o.title.split('|')[0].trim()}</span>
                  <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </article>
      </div>
    </>
  );
};

export const GuidesIndex: React.FC = () => (
  <>
    <SEO
      pageKey="home"
      customData={{
        title: 'Guides | HACCP, ISO & Export Answers for Guyana | Preqal',
        description:
          'Plain-language guides for Guyanese businesses. HACCP certification, ISO 9001 costs, and how to export food from Guyana, written by Preqal.',
        canonical: `${BASE_URL}/guides/`,
      }}
    />
    <div className="min-h-screen pb-20">
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Preqal Guides</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5">
            Plain answers to the questions<br />
            <em style={{ color: '#d97706' }}>everyone asks us.</em>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            No jargon and no gatekeeping. These guides give you the whole road map, whether
            you work with Preqal or walk it alone.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {GUIDES.map((g, i) => (
            <ScrollReveal key={g.slug} yFrom={16} delay={i * 60}>
              <Link
                to={`/guides/${g.slug}`}
                className="flex items-center gap-4 rounded-2xl p-6 group"
                style={glassCard}
              >
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                >
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </span>
                <span className="flex-grow">
                  <span className="block text-base font-bold text-slate-900">{g.title.split('|')[0].trim()}</span>
                  <span className="block text-sm text-slate-500 leading-snug">{g.description}</span>
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

export default GuideArticle;
