import type { BlogPost } from '../data/blog';

const BASE_URL = 'https://preqal.org';

/* BlogPosting rather than Article: the guides are evergreen reference pages,
   a post is dated and attributed. The author block matches the one the guides
   already emit, so the two content types agree about who wrote the site. */
export const blogPostingSchema = (post: BlogPost) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${BASE_URL}/blog/${post.slug}#article`,
  headline: post.title.split('|')[0].trim(),
  description: post.description,
  datePublished: post.published,
  dateModified: post.updated ?? post.published,
  inLanguage: 'en',
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}/` },
  author: { '@type': 'Person', name: 'Dr. Stefan Gravesande', url: `${BASE_URL}/contact/` },
  publisher: {
    '@type': 'Organization',
    name: 'Preqal',
    url: BASE_URL,
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.png` },
  },
  image: `${BASE_URL}${post.ogImage ?? '/og/resources.png'}`,
  /* Every source the post cites, so the citation trail is machine-readable
     rather than only rendered. */
  citation: post.body.sources.map((s) => ({
    '@type': 'CreativeWork',
    name: s.publisher,
    url: s.url,
  })),
});

export const blogFaqSchema = (post: BlogPost) =>
  post.body.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/blog/${post.slug}#faq`,
        mainEntity: post.body.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

export const blogIndexSchema = (posts: BlogPost[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${BASE_URL}/blog/#blog`,
  name: 'The Preqal Journal',
  url: `${BASE_URL}/blog/`,
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title.split('|')[0].trim(),
    url: `${BASE_URL}/blog/${p.slug}/`,
    datePublished: p.published,
  })),
});
