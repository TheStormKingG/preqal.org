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
    }
  | {
      /* A photograph, as opposed to a generated diagram. Diagrams argue; these
         carry the reader through the piece and give it a face. Every post is
         expected to have them.

         Raster is allowed here and nowhere else, and only through
         scripts/fetch-blog-photo.mjs, which refuses a source under 1920px wide
         and writes an avif/webp set instead of the original. A 2400px JPEG is
         about 900KB; the whole set is about 330KB and a reader downloads one
         variant of it. That is what keeps "real photographs on every post"
         compatible with a repo on a volume that has hit 100% more than once. */
      kind: 'photo';
      id: string;
      /* Basename without width or extension, e.g. blog-photos/<slug>/<name>.
         The renderer appends -800/-1200/-1600 and the format. */
      src: string;
      alt: string;
      caption: string;
      placement: 'inline' | 'wide';
      /* Intrinsic size of the source, so the box is reserved before the bytes
         land and the text underneath does not jump. */
      width: number;
      height: number;
      /* Where it came from, kept whether or not the licence demands it: a year
         from now "is this ours to use?" should be answerable from the repo. */
      credit: {
        photographer: string;
        source: string;
        sourceUrl: string;
        license: string;
      };
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
  /* The picture the Journal index shows for this post, and the one that goes
     out on a share card. Required rather than optional: every post carries a
     photograph, and a card with a hole where the picture should be is worse
     than a card that was never designed to have one. A unit test checks that
     the files behind it actually exist, because a path that is merely spelled
     correctly still renders as a blank box.

     src is a basename with no width or extension, exactly as a photo block
     uses, so the index can ask for the small variant and the article the
     large one. */
  thumbnail: { src: string; alt: string };
}

export interface BlogPostBody {
  slug: string;
  hero: { kicker: string; h1: string; standfirst: string };
  sections: BlogSection[];
  faqs?: { id: string; q: string; a: string }[];
  closing: { text: string; ctaLabel: string; ctaHref: string };
  sources: BlogSource[];
  /* Cluster membership, declared ONCE here and read in both directions. The
     post renders these as further reading; the guide and service pages derive
     the reverse by asking which posts name them. Declaring each edge twice is
     how half a cluster ends up one-way without anything noticing. */
  relatedGuides?: string[];
  relatedServices?: string[];
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

/** Published posts that name this guide. The reverse of relatedGuides. */
export const postsForGuide = (guideSlug: string): BlogPost[] =>
  POSTS.filter((p) => p.body.relatedGuides?.includes(guideSlug));

/** Published posts that name this service. The reverse of relatedServices. */
export const postsForService = (serviceSlug: string): BlogPost[] =>
  POSTS.filter((p) => p.body.relatedServices?.includes(serviceSlug));

export const TOPIC_LABEL: Record<BlogTopic, string> = {
  'quality-management': 'Quality management',
  'business-performance': 'Business performance',
  hse: 'Health, safety & environment',
};
