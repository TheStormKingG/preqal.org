/* The blog, as data — mirroring data/guides.tsx, with one deliberate
   difference: a post's BODY is JSON under content/blog/posts/, never TSX.
   The weekly pipeline has agents writing this content, and content that is
   executable is content that can break a build or ship a script. The block
   union below is the whole vocabulary an agent may emit; anything outside it
   fails scripts/blog-validate.mjs before it can be committed.

   Guides keep JSX in their h1 and so live in a .tsx file. Posts cannot, which
   is why this one is .ts. */

import manifest from '../content/blog/index.json';

export type BlogTopic = 'quality-management' | 'business-performance' | 'hse';

export type BlogBlock =
  | { kind: 'p'; id: string; text: string }
  | { kind: 'list'; id: string; ordered?: boolean; items: string[] }
  | { kind: 'quote'; id: string; text: string; attribution?: string }
  | { kind: 'callout'; id: string; tone: 'note' | 'warning'; text: string }
  | {
      kind: 'figure';
      id: string;
      /* An SVG under public/blog-figures/. Raster is disallowed: figures are
         generated weekly, have to be diffable in review, and the volume this
         repo lives on has repeatedly reached 100%. */
      src: string;
      alt: string;
      caption: string;
      /* Declared placement. The layout gate checks the rendered box against
         the reading column, so sizing is arithmetic rather than an agent's
         judgement. */
      placement: 'inline' | 'wide';
      claimIds: string[];
    };

export interface BlogSection {
  id: string;
  heading: string;
  blocks: BlogBlock[];
}

/** A source backing one factual claim. Re-fetched and re-checked by the gate. */
export interface BlogSource {
  claimId: string;
  url: string;
  publisher: string;
  quote: string;
  retrieved: string;
}

/** One row of content/blog/index.json — the single manifest. */
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  /* The gate that keeps an unreviewed post off the live site. Every consumer
     filters on it, so a held post structurally cannot reach routeMeta, the
     prerender list or the sitemap — it is a mechanism, not a promise. */
  status: 'published' | 'draft';
  topic: BlogTopic;
  readMinutes: number;
  ogImage?: string;
}

export interface BlogPostBody {
  slug: string;
  hero: { kicker: string; h1: string; standfirst: string };
  sections: BlogSection[];
  faqs?: { id: string; q: string; a: string }[];
  closing: { text: string; ctaLabel: string; ctaHref: string };
  sources: BlogSource[];
}

export interface BlogPost extends BlogPostMeta {
  body: BlogPostBody;
}

/* Eager, not lazy. A lazy glob returns loader functions, and the prerender
   pass renders to static HTML in one synchronous tick — a body that arrives a
   microtask later is a body that is absent from the emitted file, which looks
   exactly like a correctly built empty page. */
const bodies = import.meta.glob<BlogPostBody>('../content/blog/posts/*.json', {
  eager: true,
  import: 'default',
});

const bySlug = new Map<string, BlogPostBody>(
  Object.entries(bodies).map(([path, body]) => [
    path.replace(/^.*\/(.+)\.json$/, '$1'),
    body,
  ]),
);

const META: BlogPostMeta[] = (manifest as { posts: BlogPostMeta[] }).posts;

/** Every post, draft included. For gates and local review only. */
export const ALL_POSTS: BlogPost[] = META.flatMap((m) => {
  const body = bySlug.get(m.slug);
  return body ? [{ ...m, body }] : [];
});

/** What the site shows. Newest first. A draft is structurally unreachable. */
export const POSTS: BlogPost[] = ALL_POSTS.filter((p) => p.status === 'published').sort(
  (a, b) => (a.published < b.published ? 1 : -1),
);

export const getPost = (slug: string): BlogPost | undefined =>
  POSTS.find((p) => p.slug === slug);

export const TOPIC_LABEL: Record<BlogTopic, string> = {
  'quality-management': 'Quality management',
  'business-performance': 'Business performance',
  hse: 'Health, safety & environment',
};
