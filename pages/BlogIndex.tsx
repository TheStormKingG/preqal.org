import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';
import { POSTS, TOPIC_LABEL } from '../data/blog';
import { blogIndexSchema } from '../seo/blogSchemas';
import { href } from '../lib/paths';

const BASE_URL = 'https://preqal.org';

/* The index reads the MANIFEST only — never a post body. Bodies are an eager
   glob, so importing one here would pull every post's full text into this
   chunk and grow it by a post a week forever. */
const BlogIndex: React.FC = () => (
  <>
    <SEO
      pageKey="home"
      customData={{
        title: 'The Preqal Journal | Quality systems, written plainly',
        description:
          'Working notes on quality management, business performance and HSE for Guyanese businesses, written by Dr. Stefan Gravesande.',
        canonical: `${BASE_URL}/blog/`,
      }}
      extraSchemas={[blogIndexSchema(POSTS)]}
    />
    <div className="min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.p
          className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          The Preqal Journal
        </motion.p>
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          What actually happens <em style={{ color: '#b45309' }}>after the plan is written.</em>
        </motion.h1>
        <motion.p
          className="text-lg text-slate-500 leading-relaxed mb-12 max-w-[560px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          Notes on quality management, business performance and safety, for people running
          real businesses in Guyana. One a week.
        </motion.p>

        {POSTS.length === 0 ? (
          /* An empty state that says what it means. A blank page and a broken
             loader look identical, and only one of them is fine. */
          <div
            className="rounded-2xl p-7 text-slate-500"
            style={{
              background: '#e0e5ec',
              boxShadow: 'inset 4px 4px 12px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.8)',
            }}
          >
            <p className="font-bold text-slate-900 mb-1">No posts published yet.</p>
            <p className="text-sm">The first one is being written. Check back shortly.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {POSTS.map((p, i) => (
              <ScrollReveal key={p.slug} delay={i * 70} yFrom={16}>
                <Link
                  to={href(`/blog/${p.slug}`)}
                  className="group block rounded-2xl p-6 sm:p-7"
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.92)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="text-amber-700">{TOPIC_LABEL[p.topic]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium normal-case tracking-normal">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <time dateTime={p.published}>
                        {new Date(`${p.published}T00:00:00Z`).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
                        })}
                      </time>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium normal-case tracking-normal">{p.readMinutes} min</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-2">
                    {p.title.split('|')[0].trim()}
                  </h2>
                  <p className="text-slate-500 leading-relaxed mb-3">{p.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                    Read it
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);

export default BlogIndex;
