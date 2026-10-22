import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';

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
