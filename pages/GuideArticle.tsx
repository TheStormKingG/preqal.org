import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';
import { whatsAppLink, WhatsAppIcon } from '../components/WhatsAppContact';
import { GUIDES, type Guide } from '../data/guides';
import { href } from '../lib/paths';

/* ────────────────────────────────────────────────────────────────────────────
   Cornerstone guides — long-form informational content targeting the
   questions Guyanese businesses actually ask Google and AI assistants.
   Each guide carries Article + FAQPage schema and funnels to one service.
   ──────────────────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://preqal.org';


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
                  to={href(`/services/${guide.serviceSlug}`)}
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
                  to={href(`/guides/${o.slug}`)}
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
                to={href(`/guides/${g.slug}`)}
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
