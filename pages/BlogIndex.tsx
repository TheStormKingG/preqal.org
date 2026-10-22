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

/* The card picture is never wider than 256px on a desktop and full width on a
   phone, so there is no reason to let the browser reach for the 1600px file. */
/* The picture is half the card, and the card is the 768px reading column, so
   384px on a desktop and the full width of a phone. */
const THUMB_SIZES = '(max-width: 640px) 100vw, 384px';
const thumbBase = (p: { thumbnail: { src: string } }) =>
  `${import.meta.env.BASE_URL}${p.thumbnail.src.replace(/^\//, '')}`;

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
    {/* The deck pages set touch-action: none so Chrome cannot claim a drag and
    cancel the pointer stream (SlideDeck.tsx:451, and the comment above it).
    The Journal is the only nav destination that is NOT a deck, so it kept
    the browser default and inherited exactly the bug that comment warns
    about: Chrome took the horizontal drag, fired pointercancel, RouteSwipe
    dropped its start point, and a swipe could get INTO the Journal but
    never out of it. pan-y keeps vertical scrolling, which a long article
    needs, while leaving sideways gestures to the router. */}
    <div className="min-h-screen pb-24" style={{ touchAction: 'pan-y' }}>
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
                  className="group block rounded-2xl overflow-hidden sm:flex sm:items-stretch"
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
                    border: '1.5px solid rgba(255,255,255,0.92)',
                  }}
                >
                  {/* The picture carries the card on a phone, where it sits above
                      the words, and anchors the row on a wider screen. width and
                      height are the rendered box rather than the file, so the
                      column does not jump as each one arrives. */}
                  {/* The first card's picture is the largest thing on a phone
                      screen and almost certainly the LCP element, so it is
                      fetched straight away while the rest stay lazy. That
                      matters more here than it looks: the router wraps the page
                      in .page-transition, which starts a full viewport width to
                      the right, and while that is running the thumbnails are
                      off-screen, so a lazy one cannot begin until the transition
                      settles and the reader watches empty boxes fill in after.

                      The sizing lives on the <picture>, because that is the flex
                      item. Put it on the <img> and the picture collapses around
                      it: the thumbnails rendered at half their width that way.

                      The <img> fills the picture absolutely rather than with
                      h-full. A percentage height needs a parent with a definite
                      one, and a flex item stretched by align-items does not give
                      the child something to resolve against: the picture was the
                      right height and the image inside it still sized itself from
                      its own 3:2 ratio, stopping about 60% down the card. */}
                  <picture className="relative block w-full h-52 sm:h-auto sm:w-1/2 shrink-0 self-stretch">
                    <source
                      type="image/avif"
                      srcSet={`${thumbBase(p)}-800.avif 800w, ${thumbBase(p)}-1200.avif 1200w`}
                      sizes={THUMB_SIZES}
                    />
                    <source
                      type="image/webp"
                      srcSet={`${thumbBase(p)}-800.webp 800w, ${thumbBase(p)}-1200.webp 1200w`}
                      sizes={THUMB_SIZES}
                    />
                    <img
                      src={`${thumbBase(p)}-800.jpg`}
                      alt={p.thumbnail.alt}
                      width={1200}
                      height={800}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      {...(i === 0 ? ({ fetchpriority: 'high' } as Record<string, string>) : {})}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </picture>

                  <div className="min-w-0 p-6 sm:p-7 sm:w-1/2 sm:flex sm:flex-col sm:justify-center">
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
                  </div>
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
