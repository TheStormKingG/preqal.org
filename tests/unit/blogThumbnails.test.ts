import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { GUIDES } from '../../data/guides';
import { SERVICE_PAGES } from '../../pages/ServiceLanding';

/* Every post carries a photograph, and the index shows it. Both halves of that
   can fail quietly: a manifest row can be written without a thumbnail, and a
   thumbnail can name a path that was never generated. The first renders a card
   with a hole in it, the second renders a blank box, and neither breaks a
   build or trips a type. So they are checked here instead. */

const manifest = JSON.parse(
  readFileSync(new URL('../../content/blog/index.json', import.meta.url), 'utf8'),
) as {
  posts: Array<{
    slug: string;
    status: string;
    ogImage?: string;
    thumbnail?: { src: string; alt: string };
  }>;
};

const PUBLIC = new URL('../../public/', import.meta.url);
const onDisk = (p: string) => existsSync(new URL(p.replace(/^\//, ''), PUBLIC));

/* The widths and formats the index and the article actually request. Asking for
   a file nobody builds is the failure this is here to catch, so the list has to
   mirror the markup rather than the generator. */
const REQUIRED = [
  '-800.avif',
  '-800.webp',
  '-800.jpg',
  '-1200.avif',
  '-1200.webp',
  '-1200.jpg',
  '-og.jpg',
];

describe('every blog post has a thumbnail that resolves', () => {
  it('finds posts to check at all', () => {
    /* A manifest that failed to parse, or an empty one, would make every
       assertion below vacuously true. */
    expect(manifest.posts.length).toBeGreaterThan(0);
  });

  it.each(manifest.posts)('$slug declares a thumbnail', (post) => {
    expect(post.thumbnail, `${post.slug} has no thumbnail`).toBeDefined();
    expect(post.thumbnail!.src, `${post.slug} thumbnail has no src`).toBeTruthy();
    /* Alt text is what a reader using a screen reader gets instead of the
       picture, so "photo" or "" is a failure rather than a value. */
    expect(
      post.thumbnail!.alt.trim().length,
      `${post.slug} thumbnail alt is too short to describe anything`,
    ).toBeGreaterThan(20);
  });

  it.each(manifest.posts)('$slug thumbnail files all exist', (post) => {
    const missing = REQUIRED.filter((suffix) => !onDisk(`${post.thumbnail!.src}${suffix}`));
    expect(missing, `${post.slug} is missing ${missing.join(', ')}`).toEqual([]);
  });

  it.each(manifest.posts)('$slug share card points at a real file', (post) => {
    expect(post.ogImage, `${post.slug} has no ogImage`).toBeTruthy();
    expect(onDisk(post.ogImage!), `${post.slug} ogImage ${post.ogImage} is not on disk`).toBe(true);
  });
});

/* The guides index carries the same cards as the Journal, so it carries the
   same promise: a thumbnail that exists, at every width the markup asks for. */
describe('every guide has a thumbnail that resolves', () => {
  it('finds guides to check at all', () => {
    expect(GUIDES.length).toBeGreaterThan(0);
  });

  it.each(GUIDES.map((g) => ({ slug: g.slug, thumbnail: g.thumbnail })))(
    '$slug declares a thumbnail with usable alt text',
    ({ slug, thumbnail }) => {
      expect(thumbnail, `${slug} has no thumbnail`).toBeDefined();
      expect(thumbnail.src, `${slug} thumbnail has no src`).toBeTruthy();
      expect(
        thumbnail.alt.trim().length,
        `${slug} thumbnail alt is too short to describe anything`,
      ).toBeGreaterThan(20);
    },
  );

  it.each(GUIDES.map((g) => ({ slug: g.slug, src: g.thumbnail.src })))(
    '$slug thumbnail files all exist',
    ({ slug, src }) => {
      const missing = REQUIRED.filter((suffix) => !onDisk(`${src}${suffix}`));
      expect(missing, `${slug} is missing ${missing.join(', ')}`).toEqual([]);
    },
  );

  it.each(GUIDES.map((g) => ({ slug: g.slug, src: g.thumbnail.src })))(
    '$slug picture name carries a content hash',
    ({ slug, src }) => {
      /* Without it, replacing the picture keeps the URL and caches go on
         serving the old one. That has already happened once. */
      expect(src, `${slug} thumbnail is not content-hashed`).toMatch(/\.[0-9a-f]{8}$/);
    },
  );
});

/* The services index carries the same cards again, so the same promise holds. */
describe('every service has a thumbnail that resolves', () => {
  it('finds services to check at all', () => {
    expect(SERVICE_PAGES.length).toBeGreaterThan(0);
  });

  it.each(SERVICE_PAGES.map((p) => ({ slug: p.slug, thumbnail: p.thumbnail })))(
    '$slug declares a thumbnail with usable alt text',
    ({ slug, thumbnail }) => {
      expect(thumbnail, `${slug} has no thumbnail`).toBeDefined();
      expect(thumbnail.src, `${slug} thumbnail has no src`).toBeTruthy();
      expect(
        thumbnail.alt.trim().length,
        `${slug} thumbnail alt is too short to describe anything`,
      ).toBeGreaterThan(20);
    },
  );

  it.each(SERVICE_PAGES.map((p) => ({ slug: p.slug, src: p.thumbnail.src })))(
    '$slug thumbnail files all exist',
    ({ slug, src }) => {
      const missing = REQUIRED.filter((suffix) => !onDisk(`${src}${suffix}`));
      expect(missing, `${slug} is missing ${missing.join(', ')}`).toEqual([]);
    },
  );

  it.each(SERVICE_PAGES.map((p) => ({ slug: p.slug, src: p.thumbnail.src })))(
    '$slug picture name carries a content hash',
    ({ slug, src }) => {
      expect(src, `${slug} thumbnail is not content-hashed`).toMatch(/\.[0-9a-f]{8}$/);
    },
  );
});
