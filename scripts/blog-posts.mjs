/* The single Node-side reader of the blog manifest.
   vite.config.ts, scripts/route-meta.mjs and the sitemap all derive their
   blog entries from here, so the four authorities cannot drift apart — a
   post added to the manifest appears in every one of them, and a post held
   as a draft appears in none. That is a mechanism, not a convention. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://preqal.org';

const manifest = JSON.parse(
  readFileSync(join(here, '..', 'content', 'blog', 'index.json'), 'utf8'),
);

/** Everything, drafts included. Gates and local review only. */
export const allBlogPosts = manifest.posts;

/** What the site publishes. Newest first. */
export const blogPosts = manifest.posts
  .filter((p) => p.status === 'published')
  .sort((a, b) => (a.published < b.published ? 1 : -1));

/** Prerender paths: the index, plus one per published post. */
export const blogPaths = ['/blog', ...blogPosts.map((p) => `/blog/${p.slug}`)];

/** routeMeta rows, spread into scripts/route-meta.mjs. */
export const blogRouteMeta = {
  '/blog': {
    title: 'The Preqal Journal | Quality systems, written plainly',
    description:
      'Working notes on quality management, business performance and safety for Guyanese businesses, written by Dr. Stefan Gravesande.',
    canonical: `${BASE_URL}/blog/`,
    ogImage: `${BASE_URL}/og/resources.png`,
    /* scripts/inject-seo-meta.mjs destructures ogType and escapes it
       unconditionally, so an entry without it throws at build time rather
       than defaulting. Every routeMeta row carries all five fields. */
    ogType: 'website',
  },
  ...Object.fromEntries(
    blogPosts.map((p) => [
      `/blog/${p.slug}`,
      {
        title: p.title,
        description: p.description,
        canonical: `${BASE_URL}/blog/${p.slug}/`,
        ogImage: `${BASE_URL}${p.ogImage ?? '/og/resources.png'}`,
        ogType: 'article',
      },
    ]),
  ),
};
