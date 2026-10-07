# Preqal Blog — Design and Development Protocol

> Save to `docs/guides/blog-protocol.md`. Every agent in the weekly blog team follows this document. It is the contract, not advice. Where a rule can be checked by a command, the command is named and the command is the authority. Where a rule cannot be, it is expressed as a REQUIRED FIELD an agent must fill and a gate must find non-empty, so its absence is visible.
>
> Version 1.0 · 2026-10-06

---

## 0. Scope and non-negotiables

The system publishes one article per week to `https://preqal.org/blog/<slug>/`.

Five rules override everything else in this document.

1. **Agents write JSON and SVG only.** Never TypeScript, never build configuration, never a test file. `eslint.config.js` ignores `dist/**`, `node_modules/**`, `scripts/**`, `public/**`, the MD-ST sub-app and five config files. It does **not** ignore `tests/**` or `data/**`. `npm run lint` is `eslint . --max-warnings 0` and it is the second step of `deploy.yml`, before the build. A JSON file is never linted, so generated prose cannot fail the gate that deploys the whole site.
2. **No agent edits `vite.config.ts`, `scripts/route-meta.mjs` or `scripts/generate-sitemap.js`.** All three derive their blog entries from `scripts/blog-posts.mjs`. If a post needs a build-config edit, the design is broken, not the post.
3. **Every verdict is an exit code or a named JSON field.** The orchestrator never reads prose and decides it is good enough. That is the step that silently degrades when nobody is watching, which is the whole point of a weekly automation.
4. **A check that did not run is reported as UNVERIFIED, never as a pass.** Different field, different string, every time.
5. **`status: "draft"` is the universal hold.** Any stage may set it. `scripts/blog-posts.mjs` filters on it, so a held post reaches neither the prerender list, nor the meta map, nor the sitemap. Holding costs one field.

---

## 1. Data contract

### 1.1 Files

```
content/blog/
├── index.json                  # the manifest — the single source of truth for the route surface
├── posts/<slug>.json           # one body per post
├── runs/<iso-week>/run.json    # the run ledger, committed
├── runs/<iso-week>/0N-*.json   # numbered stage artefacts, committed
├── runs/.browser.lock          # the browser lease, gitignored
├── knowledge-base/claims.jsonl # every verified claim, append-only
└── knowledge-base/said-already.json
public/images/blog/<slug>/*.svg # figures
.blog-workspace/<slug>/         # scratch drafts, gitignored, deleted on success
```

### 1.2 `content/blog/index.json`

```jsonc
{
  "posts": [
    {
      "slug": "what-an-iso-9001-auditor-checks-first",
      "title": "What an ISO 9001 Auditor Checks First in Guyana (2026) | Preqal",
      "description": "A plain-language walk through the first hour of an ISO 9001 audit, and the four records that decide how the rest of it goes.",
      "h1": "What an ISO 9001 auditor checks first",
      "h1Emphasis": "checks first",
      "excerpt": "The first hour decides the week. Here is what the auditor opens, in the order they open it.",
      "published": "2026-10-12",
      "updated": "2026-10-12",
      "isoWeek": "2026-W42",
      "status": "draft",
      "ogImage": "https://preqal.org/og/resources.png",
      "serviceSlug": "systems-builder",
      "serviceName": "Systems Builder™",
      "waKey": "systems-builder",
      "targetQuery": "iso 9001 audit guyana",
      "topicEvidence": {
        "query": "iso 9001 audit guyana",
        "impressions": 31,
        "clicks": 0,
        "position": 15.1,
        "source": "content/seo/search-console-2026-10-01.csv",
        "freshness": "current"
      },
      "aiCheck": { "bestScore": 0, "reachedZero": true, "verified": true, "path": "zerogpt-playwright", "iterations": 3 }
    }
  ]
}
```

Field rules, all enforced by `scripts/blog-validate.mjs`:

| Field | Rule |
|---|---|
| `slug` | `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–72 chars, unique across the manifest and not equal to any guide slug |
| `title` | Ends exactly `" \| Preqal"`. The part before it is ≤ 60 chars. Contains no `<`, `>`, `&`, or curly quote — `scripts/inject-seo-meta.mjs:9` escapes only `&` and `"`, so anything else is written raw into the `<head>` |
| `description` | 150–160 chars inclusive. Same character ban |
| `h1` | Plain string, no JSX. 20–70 chars |
| `h1Emphasis` | A **suffix substring** of `h1`. The renderer emits `h1.slice(0, -h1Emphasis.length)` then `<em style={{ color: '#b45309' }}>{h1Emphasis}</em>`. CLAUDE.md forbids a Tailwind class for that emphasis — `amber-700` is the large-text contrast floor and `#d97706` reads 2.52:1 |
| `excerpt` | 80–180 chars. Must differ from `description` by at least 30 Levenshtein. The index card shows this, not the meta description |
| `published` / `updated` | `YYYY-MM-DD`. `published <= updated`. These, not git, supply the sitemap `lastmod` |
| `status` | `"published"` or `"draft"`. Default `"draft"` |
| `ogImage` | **`https://preqal.org/og/resources.png`, exactly.** `tests/unit/ogCards.test.ts` collects every `routeMeta[*].ogImage` and asserts the PNG exists under `public/`. `public/og/` holds eleven cards and **no `blog.png`**. Inventing one freezes every deploy of the whole site until someone runs `npm run og:cards`, which needs python3 and Pillow and is deliberately out of the build |
| `waKey` | One of the five literals in the `WhatsAppServiceKey` union at `components/WhatsAppContact.tsx:15-20`. `whatsAppLink()` silently falls back to `business-plan` on an unknown key rather than erroring |

### 1.3 `content/blog/posts/<slug>.json`

```jsonc
{
  "slug": "what-an-iso-9001-auditor-checks-first",
  "intro": "Two to three sentences that state the stake.",
  "sections": [
    {
      "id": "s1",
      "h2": "What the auditor opens first",
      "blocks": [
        { "id": "s1b1", "kind": "p", "text": "…" },
        { "id": "s1b2", "kind": "list", "items": ["…", "…"] },
        {
          "id": "s1b3", "kind": "figure",
          "src": "images/blog/<slug>/fig-1.svg",
          "alt": "A full sentence stating what the figure shows.",
          "caption": "Optional one line.",
          "width": 640, "height": 360,
          "placement": "inline",
          "claimIds": ["c3"]
        },
        { "id": "s1b4", "kind": "pullquote", "text": "…" }
      ]
    }
  ],
  "faqs": [{ "id": "f1", "q": "…", "a": "…" }],
  "closing": { "id": "cl1", "serviceSlug": "systems-builder", "text": "…" },
  "sources": [{ "claimId": "c3", "institution": "Guyana National Bureau of Standards", "url": "https://…", "quote": "…", "retrievedAt": "2026-10-07T13:02:11Z" }]
}
```

- **Every block, section and FAQ carries a unique `id`.** The renderer keys off it. `pages/GuideArticle.tsx:98` keys paragraphs on `p.slice(0, 24)`, and two machine-written paragraphs sharing their first 24 characters produce duplicate React keys and dropped nodes. `blog-validate.mjs` asserts global id uniqueness.
- `type` is one of `p | list | figure | pullquote`. No other value renders.

### 1.4 The derived route surface

`scripts/blog-posts.mjs` is the only reader of the manifest on the Node side:

```js
// scripts/blog-posts.mjs
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '..');
const BASE_URL = 'https://preqal.org';

export const allPosts = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/blog/index.json'), 'utf8')
).posts;

export const posts = allPosts.filter((p) => p.status === 'published');

export const blogPaths = ['/blog', ...posts.map((p) => `/blog/${p.slug}`)];

export const blogRouteMeta = Object.fromEntries([
  ['/blog', { title: 'Blog | Practical Notes on ISO Systems in Guyana | Preqal',
              description: '…', canonical: `${BASE_URL}/blog/`,
              ogImage: `${BASE_URL}/og/resources.png`, ogType: 'website' }],
  ...posts.map((p) => [`/blog/${p.slug}`, {
    title: p.title, description: p.description,
    canonical: `${BASE_URL}/blog/${p.slug}/`,
    ogImage: p.ogImage, ogType: 'article',
  }]),
]);

export const blogSitemapRoutes = [
  { url: '/blog', changefreq: 'weekly', priority: 0.8,
    lastmod: posts[0]?.updated ?? new Date().toISOString().slice(0, 10) },
  ...posts.map((p) => ({ url: `/blog/${p.slug}`, changefreq: 'monthly',
                         priority: 0.75, lastmod: p.updated ?? p.published })),
];
```

Three one-line spreads consume it. Note the sitemap `lastmod` comes from the post's own `updated`, **not** from `lastChanged()` on a component path — `scripts/generate-sitemap.js:24` derives all three guides' dates from `pages/GuideArticle.tsx` plus a `pages/GuidesIndex.tsx` that does not exist on disk, so a data-only edit moves no date and a component edit moves all three. Do not replicate that for a `pages/BlogIndex.tsx` branch.

### 1.5 The React side

`data/blog.ts`:

```ts
import manifest from '../content/blog/index.json';   // see note below
const bodies = import.meta.glob<BlogPostBody>(
  '../content/blog/posts/*.json', { eager: true, import: 'default' }
);
```

**`eager: true` is mandatory and not an optimisation.** `components/SEO.tsx:39` calls `signalPrerender(4 + (extraSchemas?.length ?? 0))`, polling for `script[type="application/ld+json"][data-rh]` nodes with `PRERENDER_DEADLINE_MS = 3000` and dispatching `prerender-ready` on `document`. Helmet writes those on first render; a dynamically imported body resolves after. A lazily loaded body therefore prerenders a page with correct meta and **no article text** — the clone defect through a different door. An eagerly globbed body is in the route chunk, which React Suspense resolves before `SEO` renders at all.

`import.meta.glob` typechecks here because `vite-env.d.ts` carries `/// <reference types="vite/client" />`. The glob argument is a string literal, not a module specifier, so **`resolveJsonModule` is not required and `tsconfig.json` needs no change**. The manifest is a single static JSON import — if `tsc --noEmit` objects, replace it with a second one-file glob rather than touching `tsconfig.json`.

**Two page files, not one.** `pages/BlogIndex.tsx` imports the manifest only; `pages/BlogArticle.tsx` holds the eager body glob. The guides share one file because their data is a three-item array; the blog's body volume makes the split load-bearing, or the index page downloads every article ever written. `tests/unit/blogContent.test.ts` asserts the total bytes of `content/blog/posts/*.json` is under **400 KB**, failing with `"the blog body bundle has outgrown eager loading — move to per-post prerender injection"`. That turns an invisible decay into a dated, loud failure around post 50.

---

## 2. SEO contract

### 2.1 The four authorities must agree, and a test says so

A route indexes only if it appears in all four of: `components/AnimatedRoutes.tsx`, `PRERENDER_ROUTES` in `vite.config.ts`, `routeMeta` in `scripts/route-meta.mjs`, and the `routes` array in `scripts/generate-sitemap.js`. Deriving three of them from one manifest makes them identical by construction. `tests/unit/routeSurface.test.ts` proves it.

**The cardinality guard runs first, before any set comparison.** Set equality over two empty sets is TRUE and is the cleanest pass the suite can emit — and an empty set is exactly what a broken manifest reader produces. Deriving the lists removed the disagreement that used to be the only observable symptom of a missing entry, so the fault relocated into the reader where no comparison reaches it.

```ts
// tests/unit/routeSurface.test.ts — the opening guard
const dir = '/Users/…/preqal.org/content/blog/posts';          // literal, not derived from cwd
const onDisk = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
expect(onDisk.length).toBeGreaterThan(0);
expect(allPosts.length).toBe(onDisk.length);                    // loader saw every file
expect(posts.length).toBeGreaterThan(0);                        // at least one is published
// only now:
expect(new Set(Object.keys(routeMeta))).toEqual(new Set(PRERENDER_ROUTES));
expect(new Set(sitemapRoutes.map(r => r.url))).toEqual(new Set(PRERENDER_ROUTES));
// and, parsed from AnimatedRoutes.tsx source:
expect(PRERENDER_ROUTES.filter(p => navigateRedirectPaths.includes(p))).toEqual([]);
```

That last assertion closes the whole-site defect: a path may be prerendered, or client-side redirected, never both.

### 2.2 PREREQUISITE — delete `/e-courses` from `routeMeta`

Measured on this checkout: `routeMeta` has **18** keys, `PRERENDER_ROUTES` has **17**, `components/AnimatedRoutes.tsx:81` routes `/e-courses` to `<Navigate to="/" replace />`, and `scripts/inject-seo-meta.mjs:43-52` reads `dist/index.html` as a `template` and writes it as the body of any `routeMeta` key with no prerendered file, then prints `✓`. Result: `dist/e-courses/index.html` is 81,526 bytes against 81,520 for the home page and 41,284 for a real guide — HTTP 200, the e-course title, its own self-canonical, the home page's content, no Article schema, and a JS redirect. The only thing keeping it quiet is its absence from the sitemap.

`tests/unit/routeSurface.test.ts` fails on it. Remove the key before the test ships, or the new gate blocks every deploy of every unrelated change. Also correct `public/llms.txt`, which still advertises `https://preqal.org/e-courses` as a live nine-module course with a certificate.

### 2.3 Per-post head and JSON-LD

`pages/BlogArticle.tsx` copies the guides' escape hatch verbatim:

```tsx
<SEO
  pageKey="home"
  customData={{ title: post.title, description: post.description,
                canonical: `${BASE_URL}/blog/${post.slug}/`, ogType: 'article' }}
  extraSchemas={[blogPostingSchema(post), faqSchema(post)]}
/>
```

- `pageKey="home"` is deliberate; every field is overridden. No `seo/seo.ts` entry is needed. Be aware `seo.ts:116` is `seoMap[pageKey] || seoMap.home`, so a typo'd key silently inherits the home metadata rather than erroring.
- **Exactly two `extraSchemas`, always, as a fixed-length literal array.** `pages/GuideArticle.tsx:69` passes two and prerenders correctly today. A conditionally included third schema changes the expected count and costs 3000 ms per route; a schema rendered outside the prop is not counted at all.
- **Never render JSON-LD outside the `extraSchemas` prop.**
- `blogPostingSchema` uses `'@type': 'BlogPosting'`, `'@id': ${BASE_URL}/blog/${slug}#article`, `headline: title.split('|')[0].trim()`, `datePublished: published`, **`dateModified: updated`** (the guides set both to one field, so an edited guide never signals freshness), `author` from a post field, `publisher: { '@id': ${BASE_URL}/#organization }`, `inLanguage: 'en'`.

### 2.4 Writing rules that the gates check

| Rule | Check |
|---|---|
| `targetQuery` appears in `h1`, in `intro`, and in at least one `h2` | `blog-validate.mjs` |
| 4–5 sections, each 2–3 `p` blocks, no section over 4 blocks of type `p` | `blog-validate.mjs` |
| Every `h2` is a claim, not a label — no bare noun phrase, no heading of one word | advisory, reported |
| Exactly 4 FAQs, each answered in 1–3 sentences | `blog-validate.mjs` |
| Exactly one link to `/services/<slug>/` and one to `/guides/<slug>/`, both via `href()` from `lib/paths.ts` | `blog-validate.mjs` |
| Anchor text over 15 characters and not containing `"\| Preqal"` | mirrors `tests/canonical-urls.spec.ts:70-89` |
| Internal links carry the trailing slash | `tests/smoke.spec.ts` and `tests/canonical-urls.spec.ts` already fail the build otherwise |
| No new `routeMeta` key outside the derived blog set | `routeSurface.test.ts` |

`tests/unit/seoCopy.test.ts` reads only `routeMeta['/']` plus a fixed ten-file list for its identity and `Georgetown` bans. Derived blog entries are outside its blast radius. Do not over-constrain the drafter for a test that never reads its output.

---

## 3. Tone contract — `scripts/blog-voice-lint.mjs`

The voice is quantified from the corpus, not described. Every number below was counted over the 118 sentences of existing guide prose. The script is the authority; an agent's opinion of the prose is not. `npm run blog:lint <slug>` exposes it, and `tests/unit/blogVoice.test.ts` runs it over every committed post so a drifted post physically cannot deploy.

### 3.1 Two registers, and bleeding between them is the main failure mode

**BODY** = every `p.text`, every `list.items[]` entry, every `faq.a`, `closing.text`.
**HERO** = `h1`, `h1Emphasis`, `intro`, `excerpt`, every `pullquote.text`.

The hero register's permissions do not transfer to the body, and the body's formality does not transfer to a headline. A humanizer optimising one score across a whole post flattens the two into one and scores 0% on prose that is no longer Preqal's.

### 3.2 BODY — hard fails

| Rule | Allowed | Corpus |
|---|---|---|
| Semicolons | 0 | 0 |
| Em dashes `—` and en dashes `–` | 0 | 0 |
| Mid-sentence colons | 0 | 0 |
| Parentheses | 0 | 0 |
| Exclamation marks | 0 | 0 |
| Double-quote characters | 0 | 0 |
| Contractions (`/\w'(s\|t\|re\|ve\|ll\|d\|m)\b/i`) | 0 | 0 |
| Mean sentence length | 14–17 words | 15.6 |
| Sentences ≤ 8 words | ≥ 15% | 18% |
| Sentences > 45 words | ≤ 1 | 1 (the enumerating sentence, 71) |
| Sentences > 72 words | 0 | 0 |
| Sentences per paragraph | 2–4 | — |
| American spelling `/organiz\|analyz\|recogniz\|\bprogram\b\|\bcolor\b\|\bcenter\b\|\blabor\b\|\bfavor\b/i` | 0 | 0 |
| Banned vocabulary (below) | 0 | 0 site-wide |
| `actually` / `really` | ≤ 1 per post, and only inside an `h2` | 2 in 118 sentences |
| `™` on `Risk Scan`, `Systems Builder`, `Certified Care`, `Export-Ready` | every occurrence | — |
| `™` on `Business Plan` | 0 | — |
| `Guyana` or `Guyanese` | ≥ 1 | 15 / 7 |
| Institution from the whitelist, named in full | ≥ 1 | — |
| A figure written in digits | ≥ 1 | — |
| Blocks tagged `reversal`, `concession`, `named-warning`, `metaphoric-close` | exactly 1 each | — |
| A percentage other than `98%`, or any client count, without a block-level `source` | 0 | — |
| `Preqal` as the grammatical subject of a certifying verb (`certify`, `certifies`, `issue the certificate`, `award`) | 0 | — |

**The spelling check masks the institution whitelist first.** "International Organization for Standardization" is the body's legal name and the voice rule requires institutions in full, so an unmasked `/organiz/i` test fails a correct post and trains the tone-matcher to misspell a proper noun. Mask every whitelist string, then run the regex on what is left.

**Whitelist**: Guyana Food Safety Authority · Guyana National Bureau of Standards · Guyana Marketing Corporation · Guyana Revenue Authority · Caribbean Community · CARICOM · Global Food Safety Initiative · International Organization for Standardization · Food and Agriculture Organization of the United Nations · Codex Alimentarius Commission. Markets are named in full: the United States, Canada, the United Kingdom and the European Union. Never US, UK, EU or GFSA.

**Banned vocabulary**, each verified at zero occurrences across `pages/`, `data/` and `components/`: leverage · cutting-edge · world-class · best-in-class · state-of-the-art · bespoke · seamless · robust · holistic · synergy · empower · elevate · transformative · game-changing · passionate · excellence · delve · furthermore · moreover · "in today's" · solutions · streamline · unlock · dive into.

### 3.3 BODY — advisory, reported and never failed

- **Oxford comma.** The corpus has none ("biological, chemical and physical hazards"), but the reliable regex does not exist. A hard fail makes the tone-matcher rewrite correct sentences to clear a false positive — a quality regression caused by the quality gate. Report the candidates; let a human read them.
- Numbers in prose should be words ("four to eight months"); digits are for prices, percentages and standard numbers ("GY$100,000", "98%", "ISO 22000").
- Headline capitalisation inside prose.

### 3.4 HERO — permissions

Exactly one em dash and exactly one contraction are permitted **per post**, in the hero register only. Fragments, second-person imperatives and two-beat pairs are permitted. `h1Emphasis` is one word or one short phrase.

### 3.5 The structural moves a post must make

1. **A reversal pair.** A fact, then a short sentence that flips it. *"You will find offers online for ISO certificates at prices that look too good to be true. They are."*
2. **A concession.** Tell the reader they could do this without Preqal, then state the real trade in one sentence. *"Yes, and some businesses do. A consultant mainly buys you speed and a much lower risk of failing the audit…"*
3. **A named adversary**, not vague caution. Certificate mills. Paperwork written for the auditor instead of the team. The tender committee that remembers the company that submitted a mill certificate.
4. **A metaphoric close** to one argument. *"Your HACCP or FSSC certificate is your plant, as far as they are concerned."*
5. **One sustained plain metaphor per section**, never mixed. The ladder and its rungs. House papers. Gate one of three.
6. **Every timeframe is a range with a stated reason for the spread.** *"Four to eight months. The spread depends on how far your prerequisite programmes are from where they need to be."*

### 3.6 Positioning — non-negotiable

Preqal is **ISO system setup for small and medium businesses**: process improvement plus strategic top management. It is **never a certifier**. Any post touching cost or certification states the split explicitly: *a consultant cannot sell you the certificate, and a certification body cannot build your system.* HACCP and food safety are service **topics**, not identity. The founder is **Dr. Gravesande** in a call to action, never Stefan. The only two sanctioned proof numbers are the **98% client pass rate at the certification-body audit** and the **nine-month build**, quoted with their existing attribution. The corpus contains no named client and no testimonial, so a fabricated one is both off-voice and an unbackable factual claim.

### 3.7 Do not use as a voice sample

`pages/PreqalNotPrequel.tsx:107` is the only off-voice block on the site — American spelling, "compliance solutions", an Oxford comma, corporate-mission phrasing. `pages/Home.tsx`'s proof band contains the grammatical slip "Each one setup international standards". Neither belongs in a voice average.

---

## 4. Factual contract

Every number, date, institution and claim in a post traces to one of exactly three places:

1. A `sources[]` entry with a resolving URL and a `quote` that is a verbatim substring of what was fetched.
2. The two sanctioned house figures (98%, nine months).
3. Nowhere — in which case it is deleted, not hedged.

`scripts/blog-verify-sources.mjs` **independently re-fetches every `sourceUrl`** and asserts the recorded `quote` still appears in the response. A 404 or a quote miss strikes that claim. Struck claims are removed before the drafter sees the file, so the drafter cannot cite a dead source. This is the only parallel step in the pipeline — N independent URLs touching no shared singleton.

Minimum density per post: **8 surviving claims, of which 3 carry a figure and 1 names a Guyanese institution in full.**

`content/blog/knowledge-base/claims.jsonl` is append-only: `{claimId, claim, institution, url, quote, retrievedAt, citedBy: [slug]}`. A claim older than 180 days is re-verified before reuse. `said-already.json` holds every published `h2`, every FAQ question and every reversal pair. The researcher reads both before searching, and the editor rejects a draft that re-argues an earlier post. Without this, the pipeline goes blind to its own back catalogue around week eight — the failure that actually loses a reader, and one no counter catches.

---

## 5. Figure contract

### 5.1 Format

**Hand-authored inline SVG, never raster.** It is kilobytes against 2.8 GiB of free disk at 99% capacity, it is diffable in git, it renders crisply at every density, it needs no image service, and it is the only figure format an agent can author deterministically and a reviewer can audit.

### 5.2 Colour — literal hex only, never a class name

An SVG file is **not** inside the bundled build, so `src/index.css`'s `@theme` overrides do not apply to it. `text-slate-500`, `text-slate-400` and `text-amber-600` are AA-compliant only because that file redefines them; `amber-600` measures 2.52:1 on a non-bundled surface.

Permitted palette, and nothing else: `#e0e5ec` ground · `#0f172a` navy · `#475569` body text · `#55657a` muted · `#f59e0b` amber fill · `#d97706` amber mid · `#b45309` amber dark · `#a3b1c6` shadow · `#ffffff`. Font is `Rubik, sans-serif`.

### 5.3 Geometry — arithmetic, not judgement

The reading column is `max-w-3xl` = 48rem = **768px**, minus `lg:px-8` = **704px of content**. Two placements only:

| `placement` | max `width` |
|---|---|
| `inline` | 640 |
| `column` | 704 |

- `width` and `height` attributes on the `<svg>` equal the `viewBox` dimensions exactly, and both equal the block's declared `width`/`height`.
- Aspect ratio between 1.2 and 2.4.
- `<title>` matches `alt`.
- File ≤ 40 KB. All figures for one post ≤ 80 KB.
- Max 3 figures per post, max 1 per section, at least 1 per post.
- **`alt` is a full sentence stating what the figure shows**, ≥ 40 characters, and must not open with "Image of", "Chart of" or "Diagram".
- Rendered with explicit `width`/`height` attributes and `loading="lazy"`.

### 5.4 Placement

- A figure goes **after** the paragraph it illustrates. Never first in a section, never immediately after an `h2` with no prose between, never in the closing paragraph.
- The first figure sits after `intro`, so it is never the LCP element on a cold load.

### 5.5 A figure may not introduce a fact

Every number appearing as a text node in the SVG must already appear in the post body or in a surviving `sources[]` claim. `scripts/blog-verify-figures.mjs` greps for it, and also greps for `class=` and for any hex not on the palette list.

---

## 6. The AI-detection stage

> AI-detection scores are unstable and measure nothing about writing quality. This stage is implemented because it was asked for. It is bounded, every reading is recorded, it cannot be satisfied by damaging the voice, and it reports honestly when it cannot do what was asked.

### 6.1 What is scored

**Body prose only, one section at a time.** `h1`, `h1Emphasis`, `intro`, `excerpt`, every `pullquote`, every FAQ and every figure are excluded. The hero register permits a contraction and an em dash the body forbids; scoring them together is precisely what makes a humanizer flatten the two registers while reporting 0%.

### 6.2 Concurrency — one owner, one context, one lease

`content/blog/runs/.browser.lock` holds `{runId, pid, acquiredAt}`. The orchestrator acquires it before dispatching this stage and releases it after, and refuses to dispatch any browser-touching stage while another `runId` holds it. A lock older than 30 minutes is breakable, and the break is recorded in the ledger.

Inside the stage, **one fresh `browser.newContext()` per probe**, created and closed inside `scripts/blog-ai-detect.mjs`. Never fanned out across sections.

Care inside your own calls cannot protect a resource a peer can take between them (observation 0364). The expensive failure is not a crash — it is a reading that is internally consistent and describes different text, which then corroborates whatever hypothesis prompted the probe. Serialising your own loop protects nothing when a manual catch-up run fires into the scheduled one, which is why the lease exists as well.

### 6.3 Ordered execution paths, and the disclosure branch

Tried in order. The path actually used is recorded by name beside every score.

1. **`node scripts/blog-ai-detect.mjs <file>`** — Playwright with the repo's own `chromium-1217` (verified present in `~/Library/Caches/ms-playwright`, `@playwright/test ^1.59.1` in package.json). Navigate `https://www.zerogpt.com/`, paste the section text, read the percentage. **The page's own identity is asserted in the same expression that reads the score** — host is `www.zerogpt.com`, the result element is present, and the character count the page reports is within 2% of the text submitted. Print `{score, raw, charsSubmitted, charsSeen, path, at}` as JSON. 60 s timeout.
2. **The same script, fresh context**, once more, for a transient navigation or selector miss.
3. **The second detector configured in `scripts/lib/detectors.mjs`** — a genuinely different mechanism, so a selector change at one vendor does not take the check with it.
4. **DISCLOSURE BRANCH.** Write `{"score": null, "path": "none", "verified": false, "verdict": "UNVERIFIED", "reason": "<measured failure>"}`, set the manifest `status` to `"draft"`, and state in the report, verbatim: **`AI-DETECTION: UNVERIFIED — post held.`**

Never skip. Never assume. Never report a check that did not run as a pass. A rule enforced by an embedded mechanism degrades silently on a surface lacking that mechanism, so the check names its paths and owns a failure branch (observation 0374).

### 6.4 Controls — because 0 is also the broken value

Every run submits two controls through the same path and records both beside every score:

- **Known-human**: a paragraph from `data/guides.tsx`, written before this system existed.
- **Known-machine**: a deliberately flat generated paragraph, committed at `content/blog/knowledge-base/control-machine.txt`.

If the human control also reads 0%, the path is broken: the branch is **UNVERIFIED**, not a pass. The success value and the scraper's failure value are both zero, and without a control they are byte-identical in the log (observation 0409).

### 6.5 Loop bounds

- **5 iterations per section. 18 probes per post. 25 minutes wall clock on the stage.** Whichever binds first, binds.
- After every rewrite, **re-run `blog-voice-lint.mjs` on that section.** A rewrite that lowers the score while breaking a counter is **rejected**, the previous state is restored, and the round still counts. Report the violated counter by name. A document-wide scalar objective trades away every per-section constraint and its log shows monotone progress the whole way down (observation 0408).
- Rewrites are **per section**, so a score is attributable to a span of text rather than to a post.

### 6.6 Honest exits

| Outcome | Action |
|---|---|
| Score 0, voice clean | Publish. `aiCheck.reachedZero: true`, `verified: true` |
| Bound hit, best voice-passing score ≤ 10% | Publish. `reachedZero: false`, `bestScore: <n>`, and the report says so in plain words |
| Bound hit, best score > 10% | `status: "draft"`. Nothing published. The report names the stage and the score |
| Every rewrite fails the voice linter | `status: "draft"`. The report names the counter |
| No path returned a verified score | `status: "draft"`. `AI-DETECTION: UNVERIFIED` |

---

## 7. The gate chain

`npm run blog:gate -- <slug>` runs these in CI's own order, stopping at the first failure, recording each result in the ledger. All of it runs **locally, before any push**, because a tripped gate in CI fails the entire site's deploy rather than just the post.

| # | Gate | Command | Owner on failure |
|---|---|---|---|
| G1 | Topic | `brief.chosen.impressions >= 20 && clicks === 0 && !cannibalises` | topic-scout |
| G2 | Sources | `node scripts/blog-verify-sources.mjs <slug>` | researcher (claim deleted, not softened) |
| G3 | Structure | `node scripts/blog-validate.mjs <slug>` | editor |
| G4 | Voice | `node scripts/blog-voice-lint.mjs <slug>` | tone-matcher |
| G5 | AI detection | §6 | humanizer |
| G6 | Figures | `node scripts/blog-verify-figures.mjs <slug>` | figure-author |
| G7 | Layout | `npx playwright test tests/blog-local.spec.ts` | figure-author (sizing) / drafter (placement) |
| G8 | Build | `npm run lint && npx tsc --noEmit && npm run test:unit && npm run build` | orchestrator |
| G9 | Dist | `node scripts/blog-verify-dist.mjs <slug>` | orchestrator |
| G10 | Live | §9 | orchestrator |

### G7 — layout is measured, not asserted

Against `npm run dev` on port 3000, in its own Playwright context, at 375 / 768 / 1280:

- `scrollWidth === clientWidth` at 375px — no horizontal overflow.
- Every figure's rendered box is inside the reading column, and its rendered aspect matches its declared `width`/`height` within 1%.
- No figure immediately after an `h2`, none in the closing paragraph.
- Body-text contrast ≥ 4.5:1, **computed from `getComputedStyle` resolved values, never from a class name** — the class is only correct inside the bundle.
- The `prefers-reduced-motion` render still shows all content (`ScrollReveal` degrades to opacity-only).
- Exactly **6** `application/ld+json` blocks in the live DOM: 4 site-wide plus `BlogPosting` plus `FAQPage`.

### G9 — the fabricated-clone detector, and it runs BEFORE the push

`scripts/inject-seo-meta.mjs` reads `dist/index.html` as a template and writes it as the body of any `routeMeta` key with no prerendered file, then prints `✓` and reports it as "prerendered files created". So a post missing from `PRERENDER_ROUTES` ships a 200 page with the post's own title, description and self-canonical over the **home page's body**, sitemapped and crawlable, indistinguishable from a real post in the build log.

`blog-verify-dist.mjs <slug>` asserts, on `dist/blog/<slug>/index.html`:

- The post's `h1` text is present.
- **Byte similarity against `dist/index.html` is below 0.6.** Measured values: `dist/index.html` 81,520 bytes; `dist/e-courses/index.html` 81,526; a real guide 41,284. A byte floor can be tuned wrong; a comparison against the actual clone source cannot.
- Exactly one `<title>`, exactly one `<link rel="canonical">`, and the canonical equals `https://preqal.org/blog/<slug>/`.
- Exactly 6 `ld+json` blocks, including `BlogPosting` and `FAQPage`.
- A distinctive sentence from the post **body** is present. A title check cannot tell a clone from a post; a body check can.

### Correction routing

One violation class, one owning agent. The orchestrator sends the failing rows **verbatim**, with no paraphrase and no added instruction, and re-runs only that gate. **Two rounds per agent per run.** The third failure from the same agent sets `status: "draft"`, records the reason, and reports. It does not keep trying — an unbounded correction loop converts a failure into a cost with no terminal report.

The correction message carries the violation list and the artefact path, never a rewritten passage. The orchestrator judges; it does not author.

---

## 8. Publishing

### 8.1 One commit per post. Not one per file.

`deploy.yml` triggers on every push to master, and its concurrency block is `group: pages, cancel-in-progress: false`, so every commit runs to completion. N separate `gh api .../contents/<path>` PUTs produce N full builds, N Pages deployments, and intermediate live states where the post JSON is published and its figure SVGs 404.

The post JSON, the manifest, the SVGs and `public/sitemap.xml` land in a **single commit**.

`public/sitemap.xml` is git-tracked and rewritten by every build. Stage it deliberately by path; never `git add -A`. Its diff goes in the weekly report. Clean the working tree once before the first automated run — `public/sitemap.xml` and `supabase/.temp/cli-latest` are modified and two `public/` assets are untracked right now.

### 8.2 Ordered push paths

Each must be proven once by hand before the weekly task depends on it, including a check that the resulting commit actually fired `deploy.yml`.

1. **`osascript`** `do shell script "cd '<repo>' && git add <paths> && git commit -m '…' && git push origin master --no-verify 2>&1"`. `--no-verify` is required: git-lfs is a `pre-push` hook not on PATH.
2. **`git push origin master --no-verify`** from the sandbox after `gh auth setup-git`. **Flag the side effect**: `setup-git` rewrites global git config persistently. `gh` 2.91.0 is authenticated here as TheStormKingG via keyring with `delete_repo, gist, read:org, repo, workflow` scopes, so CLAUDE.md's "the sandbox shell can't authenticate with GitHub" is mis-scoped — it binds git-over-HTTPS through osxkeychain, not GitHub access (observation 0406). Reads are proven; the write is not.
3. **`gh api` against the Git blobs / trees / commits / refs endpoints**, which makes **one** commit object and is a real push event that fires `deploy.yml` because the token is a user token, not the ambient `GITHUB_TOKEN`.
4. **DISCLOSURE BRANCH.** Leave the commit local, set `publish.status = "COMMITTED_NOT_PUSHED"`, report it. Never claim published.

`gh workflow run deploy.yml` is **not** a push path — it rebuilds what is already on master and cannot publish an unpushed commit. It is the "republish" handle only.

Do not cite `scripts/run-sync.sh` as evidence that a scheduled job pushes from here. The installed launch agent points at a different 405-byte script with no git stage, and `git log --grep='[auto]' -i` returns nothing (observation 0405).

### 8.3 Human approval gate

The system ships with `AUTO_PUBLISH = false`. A completed post is committed as `status: "draft"` — invisible to the route surface by construction — and the report carries a local preview path. `node scripts/blog-approve.mjs <slug>` flips the status, regenerates the sitemap and commits.

A post can be lint-clean, voice-clean, source-verified and 0%-scored and still be editorially wrong in a way no counter can see, and this one goes out under a named consultant's byline. Nothing about the pipeline changes when the flag flips, so the cadence decision stays with the owner.

---

## 9. Verification and reporting

### 9.1 Live check

After the push: `gh run watch` on the deploy, then `smoke.yml` fires automatically on its success. Then one direct fetch of `https://preqal.org/blog/<slug>/` asserting HTTP 200, the `h1` text present in the served HTML, `"@type":"BlogPosting"` and `"FAQPage"` in the `ld+json`, exactly one `<title>` and one canonical. Then `https://preqal.org/blog/` asserting the new post is listed.

### 9.2 The smoke spec is edited once, ever

`tests/smoke.spec.ts` is a linted, typechecked TypeScript file with an `as const` expectation table. **No agent edits it weekly.** The one-time blog row reads `content/blog/index.json` with `fs` at spec load and derives the newest `status: "published"` slug:

```ts
const newest = JSON.parse(fs.readFileSync('content/blog/index.json', 'utf8'))
  .posts.filter((p) => p.status === 'published')
  .sort((a, b) => b.published.localeCompare(a.published))[0];
```

Then asserts `['BlogPosting', 'FAQPage']` for `/blog/${newest.slug}/`, and that the served HTML carries a sentence from that post's body.

### 9.3 Always report, pass or fail

The report states: the chosen query with its impressions, clicks and position; every AI-detection score in order with its path and its two control readings; the final score and whether it was **verified**; the voice-lint metrics; which agents received corrections and how many; the measured prerender wall time; the push path used; the sitemap diff; the live-check result; and the terminal status.

If the check could not run, the report says `AI-DETECTION: UNVERIFIED` and gives the measured reason. If the post is held, it says held and why. A report that cannot distinguish a verified 0% from an unmeasured one is the defect itself.

`org.preqal.sync-ims` has exited 1 every five minutes for days, writing `FATAL: Legacy API keys are disabled` into an unrotated 10.7 MB log that nothing reads, and its plist carries a world-readable Supabase service_role JWT that Supabase has since disabled. A routine with no success signal is indistinguishable from a routine that is not running. **A missing weekly report is defined as a failure.**

### 9.4 Two independent absence detectors

1. **Stage 0 catch-up**, on the Mac: compare the current ISO week against the manifest and write any missing week first.
2. **`.github/workflows/blog-watchdog.yml`**, `schedule: '0 14 * * 3'` plus `workflow_dispatch`: fetch the live sitemap, open a GitHub issue if no `/blog/` URL carries a `lastmod` inside 10 days.

A counter bound to a single mechanism is silently inert in every period that mechanism does not fire. A Mac-side check cannot report the week the Mac never woke — and a scheduled hardware wake cannot fire on a flat battery, so the remedy's precondition is the condition it was installed to prevent (observation 0381). Authoring stays off GitHub cron: no interactive agent on a runner, and GitHub cron auto-disables after 60 days of repo inactivity.

---

## 10. Topic selection

The only real signal: **640 impressions, 26 clicks in 90 days, average position 15.3, and the only query earning a click is the brand name "preqal".** The ISO-9001-cost cluster sits at roughly 99 impressions, position ~15, and **zero clicks**.

That is not a content gap. It is demand the site already appears for and captures none of — a rank-and-snippet gap. So the selection rule, in priority order:

1. Queries with **impressions ≥ 20, clicks = 0, average position 11–30**.
2. Queries the three guides rank for but do not answer directly.
3. The standing seed list derived from the five service promises, used only when the queue is empty.

Rejects any slug or query already covered, within 2 normalised tokens. Rejects a query that a guide already owns — that splits the signal.

`topicEvidence.freshness` is `current | stale | absent` and must match the actual file date of the newest `content/seo/search-console-*.csv` on disk. A topic chosen with no data is allowed and visible. A topic that **claims** evidence it does not have is a hard fail.

The first four weeks deepen the ISO-cost cluster: what an auditor checks first, what a tender committee checks, what the three bills actually are, how long each stage really takes. Each answers one sub-question the existing guide answers only generally, and each links back to that guide.

Every post records the query, impressions, clicks and position it was chosen against, so in a quarter there is a **measurement** of whether the blog moved anything rather than an opinion about it.

---

## 11. Brand rendering reference

Copy these verbatim. The blog must be indistinguishable from `/guides`.

| Element | Spec |
|---|---|
| Page ground | `#e0e5ec`, Rubik only, weights 400/500/600/700/800 |
| Page wrapper | `min-h-screen pb-20` |
| Reading column | `max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20` |
| Eyebrow | `text-xs font-bold uppercase tracking-widest text-slate-400 mb-4` |
| H1 | `text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-6` |
| H2 | `text-2xl font-bold text-slate-900 mb-4` |
| Body `<p>` | `text-base text-slate-600 leading-relaxed mb-4` |
| Lead | `text-lg text-slate-500 leading-relaxed mb-10` |
| Italic amber emphasis | `<em style={{ color: '#b45309' }}>…</em>` — **inline style, never a class** |
| Glass card | `background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)', border: '1.5px solid rgba(255,255,255,0.92)'` with `className="rounded-2xl p-6"` |
| Pressed icon tile | `w-11 h-11 rounded-xl` + `background: '#e0e5ec', boxShadow: 'inset 3px 3px 8px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)'`, icon `h-5 w-5 text-amber-600` |
| Section reveal | `<ScrollReveal key={s.id} yFrom={14}>` · card lists `yFrom={12} delay={i * 60}` |
| Card hover | `whileHover={{ y: -3, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}`, spring `stiffness: 260, damping: 22` |
| Button hover | `whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}`, spring `stiffness: 340, damping: 22` |
| End-of-article CTA | `rounded-3xl p-9 text-center mb-12` + `background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)', boxShadow: '10px 10px 28px rgba(180,83,9,0.3)'`; heading `text-2xl font-bold text-slate-900`; button `background: 'rgba(255,255,255,0.95)'` with `font-bold text-amber-700 text-sm` |
| Primary CTA text | `text-slate-900` — 8.5:1. White reads 2.15:1 on the light stop |

**`<main>` in `App.tsx` carries `overflow-hidden`**, which makes it a scrollport. Any `position: sticky` descendant — a sticky table of contents, a sticky share rail — sticks to a non-scrolling box and appears not to work at all. Do not add one.

**Declare every Framer Motion entrance wrapper at module scope.** A motion component defined inside another component's body is a new type every render, so React remounts and the entrance never plays. `pages/Resources.tsx` carries the measurement: cards travelled 600px in under 117ms against a configured 780ms.

A card gets **exactly one** entrance animation. Stacking `ScrollReveal` under another wrapper reads as a stutter.

All internal links go through `href()` from `lib/paths.ts`. A slashless link is a 301 on every crawl, and two specs fail on it.

The blog is **archetype (a), a long-scroll article**. Do not add `/blog` to `DECK_ROUTES` in `App.tsx`.

Navigation: **footer only.** `components/Footer.tsx` lists Guides under COMPANY; add Blog beside it. `components/BottomNav.tsx` `NAV_ITEMS` feeds both the desktop Navbar and a `flex justify-around` bar of three items on phones, so a fourth is a layout change for no gain.

---

## 12. Reference — the canonical post shape

Inherited from the guides, which work:

1. SEO title: `<Question or claim> in Guyana (<year>) | Preqal`
2. A plain-language 150–160 char meta description
3. An `h1` whose last phrase is italic amber
4. A 2–3 sentence intro stating the stake
5. **4–5 `h2` sections** of 2–3 paragraphs each, every heading a claim rather than a label
6. One figure per section at most, after the paragraph it illustrates
7. **4 FAQs**, each answered in 1–3 sentences
8. A closing section naming the one Preqal service that covers the topic, with its `™`, a WhatsApp CTA via `whatsAppLink(waKey)` and `trackWhatsAppClick(waKey, 'blog_article')`, and a `Link` to `/services/<serviceSlug>/`
9. A "More reading" list of the two newest other posts plus the related guide

---

## 13. Agent quick card

| Agent | Writes | Gate |
|---|---|---|
| `blog-orchestrator` | the ledger, the commit | runs every gate; judges nothing by reading |
| `blog-topic-scout` | `01-topic.json` | G1 |
| `blog-researcher` | `02-research.json` | G2 |
| `blog-drafter` | `03-draft.json` | G3 |
| `blog-editor` | `04-edited.json`, `04-notes.json` | G3 + claim trace |
| `blog-tone-matcher` | `05-toned.json` | G4 |
| `blog-humanizer` | `06-humanized.json`, `06-ai-log.json` | G5 |
| `blog-figure-author` | `07-figures/*.svg`, `07-figures.json` | G6 |
| `blog-layout-integrator` | `08-post.json` | G7 |

The editor's gate is **the claim trace, not a net word count**. An editor that correctly adds a required concession sentence to a too-short draft cannot clear a falling-word-count gate, so that gate forces the wrong edit.

The ledger records `next`, and each stage's `{status, artefact}`, **written before the transition, not after**. `node scripts/blog-status.mjs --week current` emits exactly one of `ALREADY_PUBLISHED`, `RESUME_AT <stage>`, `START_NEW`. A run killed at the humanize stage resumes at the humanize stage. At 55% measured slot availability that is the common case, not the edge case, and one lost run at a weekly cadence is a quarter of the month.