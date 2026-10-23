# Imagery contract

What every Journal post must carry, and what the pictures in it must show.
Read this alongside `voice.md`. The voice contract governs the words; this one
governs everything the reader looks at.

## 1. Every post carries photographs

Two to three photographs per post, plus zero to three SVG figures.

Photographs and figures do different jobs and neither replaces the other. A
figure argues: it is built from verified `claimId` data and it is diffable in
review. A photograph carries the reader through the piece and gives it a face.
A post of pure diagrams reads like a standards document.

## 2. Every post carries a thumbnail

The manifest row has a required `thumbnail` with `src` and `alt`, and an
`ogImage` pointing at a generated `-og.jpg`. The index card and the share card
both come from it.

Pick the strongest of the post's own photographs. Do not source a separate one.
`tests/unit/blogThumbnails.test.ts` fails the build if a post has no thumbnail
or if any file behind it is missing, so this is a mechanism rather than a note.

## 3. Who is in the pictures

**Preqal's clients are Guyanese and Caribbean businesses. The people in the
photographs must look like them.**

Guyana is roughly two fifths Indo-Guyanese and a third Afro-Guyanese, with
Indigenous, mixed and Chinese communities alongside. Photographs should show
Black, South Asian, Indo-Caribbean, East Asian, Indigenous or mixed subjects.

**Do not publish a photograph with white or Caucasian subjects.** This is a
standing brand rule, not a per-post preference. A consultancy whose website
shows a boardroom of white executives is telling a Guyanese SME that it was not
built for them, and that is the opposite of what these posts are for.

This applies to anyone visible enough to read, including people out of focus in
the background. Where a frame is genuinely ambiguous, such as a wide factory
shot where no face resolves, prefer a clearer alternative rather than reasoning
about whether it passes.

## 4. The pictures must be real and relevant

- Real photographs. No illustration, no 3D render, no AI-generated imagery.
- Relevant to the argument on the page, not decorative. A photograph that could
  sit on any post is a photograph that belongs on none.
- Prefer the sectors Preqal actually serves: poultry, agri-food processing,
  manufacturing, eco-hospitality, and the offices where buyers decide.
- Avoid dated corporate stock. Suits around a laptop looked like 2015 in 2015.

## 5. Sourcing and licence

Free for commercial use, and recorded. Unsplash is the default source and its
licence does not require attribution, but the photographer, source, URL and
licence go into the `credit` object anyway and render under the picture. A year
from now "is this ours to use?" should be answerable from the repo.

## 6. How to fetch one

    node scripts/fetch-blog-photo.mjs --slug <post-slug> --id photo-<id> \
      --name <basename> --credit "<Photographer>" --page "<unsplash path>"

The script refuses a source under 1920px wide, crops to 3:2, and writes avif
and webp at 800/1200/1600 with jpg fallbacks. Then, for the thumbnail only:

    node scripts/make-og-crops.mjs <slug>/<basename>

## 7. Never replace a picture in place

Filenames carry a hash of the picture itself, like
`checking.379481c6-800.avif`. `fetch-blog-photo.mjs` puts it there; do not
hand-write a name without one.

The reason is a failure that has already happened. A photograph was pulled for
breaking the rule in section 3 and replaced with a compliant one under the same
filename. The bytes on the server changed, the URL did not, and so every
browser and CDN edge that already had a copy went on serving the rejected
picture for hours. The replacement was correct and invisible. The owner saw the
old image and reasonably concluded nothing had been fixed.

A different picture must be a different address. Never swap the bytes behind an
existing name, and never reuse a name with a stale hash on it.

## 8. Look at the picture before you ship it

Alt text from a search result is not a description of the photograph. In the
run that produced this contract, four images were chosen from their alt text
and three of them had to be replaced after somebody actually looked: one was a
boardroom of white men, one was a smallholder holding a hen on a post written
for certified exporters, and one was a sepia shot so distant no subject
resolved at all.

Download the candidates, build a contact sheet, and look at it. Every time.
