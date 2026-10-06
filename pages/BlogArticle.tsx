import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ui/ScrollReveal';
import { getPost, POSTS, TOPIC_LABEL, type BlogBlock } from '../data/blog';
import { blogPostingSchema, blogFaqSchema } from '../seo/blogSchemas';
import { href } from '../lib/paths';

const BASE_URL = 'https://preqal.org';

/* One renderer per block kind. The union in data/blog.ts is the entire
   vocabulary an agent may emit, so a post can never introduce markup this
   switch has not been written for — an unknown kind is dropped rather than
   rendered as something it is not. */
const Block: React.FC<{ block: BlogBlock }> = ({ block }) => {
  switch (block.kind) {
    case 'p':
      return <p className="text-lg text-slate-500 leading-relaxed mb-5">{block.text}</p>;
    case 'list':
      return block.ordered ? (
        <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-slate-500 leading-relaxed marker:text-amber-700 marker:font-bold">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-slate-500 leading-relaxed marker:text-amber-700">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case 'quote':
      return (
        <blockquote
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.55), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
        >
          <p className="text-lg text-slate-700 leading-relaxed italic">{block.text}</p>
          {block.attribution && (
            <footer className="mt-2 text-sm text-slate-400 not-italic">— {block.attribution}</footer>
          )}
        </blockquote>
      );
    case 'callout':
      return (
        <aside
          className="rounded-2xl p-5 mb-6 border-l-4"
          style={{
            background: 'rgba(255,255,255,0.72)',
            borderLeftColor: block.tone === 'warning' ? '#b45309' : '#94a3b8',
            boxShadow: '5px 6px 16px rgba(163,177,198,0.4), -3px -3px 10px rgba(255,255,255,0.9)',
          }}
        >
          <p className="text-base text-slate-700 leading-relaxed">{block.text}</p>
        </aside>
      );
    case 'figure':
      /* width is declared in the data and checked by the layout gate against
         the reading column, so sizing is arithmetic rather than a judgement. */
      return (
        <figure className={`mb-7 ${block.placement === 'wide' ? 'sm:-mx-8 lg:-mx-16' : ''}`}>
          <img
            src={`${import.meta.env.BASE_URL}${block.src.replace(/^\//, '')}`}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-2xl"
            style={{ boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)' }}
          />
          <figcaption className="mt-2 text-sm text-slate-400 leading-relaxed">{block.caption}</figcaption>
        </figure>
      );
    default:
      return null;
  }
};

const BlogArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? '');
  /* A draft, or a slug that never existed, is the same answer to a reader. */
  if (!post) return <Navigate to={href('/blog')} replace />;

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  const faq = blogFaqSchema(post);
  const schemas = faq ? [blogPostingSchema(post), faq] : [blogPostingSchema(post)];

  return (
    <>
      <SEO
        pageKey="home"
        customData={{
          title: post.title,
          description: post.description,
          canonical: `${BASE_URL}/blog/${post.slug}/`,
          ogType: 'article',
          ogImage: `${BASE_URL}${post.ogImage ?? '/og/resources.png'}`,
        }}
        extraSchemas={schemas}
      />
      <div className="min-h-screen pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.p
            className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {post.body.hero.kicker}
          </motion.p>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            {post.body.hero.h1}
          </motion.h1>

          {/* A dated, attributed article is what earns the click from page two. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 mb-7">
            <span className="font-semibold text-slate-700">Dr. Stefan Gravesande</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.published}>
                {new Date(`${post.published}T00:00:00Z`).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
                })}
              </time>
            </span>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-semibold">{TOPIC_LABEL[post.topic]}</span>
          </div>

          <p className="text-xl text-slate-700 leading-relaxed mb-10">{post.body.hero.standfirst}</p>

          {post.body.sections.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 50} yFrom={14}>
              <section className="mb-9">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug mb-4">{s.heading}</h2>
                {s.blocks.map((b) => <Block key={b.id} block={b} />)}
              </section>
            </ScrollReveal>
          ))}

          {post.body.faqs?.length ? (
            <section className="mb-9">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Common questions</h2>
              {post.body.faqs.map((f) => (
                <div key={f.id} className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{f.q}</h3>
                  <p className="text-lg text-slate-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </section>
          ) : null}

          <div
            className="rounded-2xl p-6 sm:p-7 mb-10"
            style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 12px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.8)' }}
          >
            <p className="text-lg text-slate-700 leading-relaxed mb-4">{post.body.closing.text}</p>
            <Link
              to={href(post.body.closing.ctaHref)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-900 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '4px 4px 12px rgba(217,119,6,0.35), -2px -2px 8px rgba(255,255,255,0.6)' }}
            >
              {post.body.closing.ctaLabel}
            </Link>
          </div>

          {post.body.sources.length > 0 && (
            <section className="mb-10">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Sources</h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-400">
                {post.body.sources.map((s) => (
                  <li key={s.claimId}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-amber-700 underline decoration-slate-300 underline-offset-2">
                      {s.publisher}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Link to={href('/blog')} className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>

          {others.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-300/50">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Also worth reading</h2>
              <div className="flex flex-col gap-3">
                {others.map((o) => (
                  <Link key={o.slug} to={href(`/blog/${o.slug}`)} className="text-lg font-bold text-slate-900 hover:text-amber-700">
                    {o.title.split('|')[0].trim()}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
};

export default BlogArticle;
