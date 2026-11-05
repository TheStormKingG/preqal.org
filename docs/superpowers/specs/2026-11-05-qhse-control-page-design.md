# Preqal QHSE Control — service page design

**Date:** 2026-11-05
**Route:** `/services/qhse-control/`
**Status:** design approved, ready for an implementation plan

---

## 1. What is being sold

Bespoke QHSE software. Preqal runs a discovery process with the client, then designs and
builds a system around how that business actually operates: documents, risk and hazard
analysis, nonconformities and corrective actions, and internal audits.

It is **not** a product, not a subscription platform, and not a sixth step on the
idea-to-export journey. It is a new commercial offer that converts on a **free discovery
call**, taken through WhatsApp like every other conversion on the site.

The name is **Preqal QHSE Control**, with no ™. The five existing services carry ™; this one
deliberately does not, because the mark is not registered. `docs/guides/blog-protocol.md`
records the ™ convention per service name and needs a row saying this one takes zero.

### Why the page is shaped the way it is

Run through Hormozi's value equation — outcome and likelihood over time and effort — three of
the four levers are against this offer:

| Lever | Position |
|---|---|
| Dream outcome | Strong. The QHSE system stops being a second job. |
| Perceived likelihood | **Weak.** Nothing is built. There is no reference system to show. |
| Time delay | **Weak.** A bespoke build is inherently slower than buying a licence. |
| Effort and sacrifice | **Weak.** Discovery, migration and training all land on the client. |

So the page cannot sell on features: the features do not exist yet and will differ per
client. It sells on **method, staging and proof**, and each section exists to repair one of
the three weak levers.

- **Time delay** is attacked by visible staging: a named first milestone — one working
  control loop — rather than "we will build your system".
- **Likelihood** is attacked by showing the method end to end instead of a screenshot.
- **Effort** is attacked by stating plainly that discovery, configuration, migration and
  training are Preqal's work, not the client's.
- **Risk** is attacked with a scope guarantee, never an outcome guarantee: if the agreed
  workflows are not working at acceptance, Preqal fixes them at no further configuration
  charge. The page must never imply ISO certification, which a certification body issues and
  Preqal does not.

The page must also **disqualify**. The call is free, so copy is the only filter; `audience`
carries both who it suits and who it does not.

---

## 2. Structure — a sixth entry in `SERVICE_PAGES`

The page is one record in `SERVICE_PAGES` (`pages/ServiceLanding.tsx:71`), rendered by the
existing dynamic route `/services/:slug` (`components/AnimatedRoutes.tsx:76`). No new page
component, no new route, no nav change.

This was chosen over a separate `/software/` section because the offer behaves like a
service — consultative, discovery-led, quoted after scoping — and because `ServicePage`
already expresses everything it needs. A `/software/` section would also have meant adding a
fifth item to `NAV_ITEMS`, which is shared with the phone bottom bar and covered by 17 tests,
and would have placed an unbuilt offer above the five services that earn today.

### Field mapping

| Field | Content |
|---|---|
| `slug` | `qhse-control` |
| `waKey` | `qhse-control` — requires a new union member and options row, see §5 |
| `name` | `Preqal QHSE Control` |
| `metaKey` | `servicesQhseControl` — required by the interface but **dead**; nothing reads it |
| `title` | `Custom QHSE Software in Guyana \| Preqal QHSE Control` |
| `description` | Meta description. Must not contain the word "Georgetown". |
| `h1` | "Your QHSE system, built around *how you actually work*" — amber `<em>` at `#b45309` |
| `intro`, `body[]` | Problem first, then why generic software fails, then the method |
| `deliverables[]` | The staged build, first control loop first |
| `audience` | Broad across industries, written to qualify and disqualify |
| `schedule` | **Used** — carries the five-stage control loop, see §3 |
| `faqs[]` | Required and non-empty. Carries the objections. |
| `cta` | `Book a free discovery call` |
| `pricing` | **Omitted** — price follows discovery |
| `onePagerHref` | **Omitted**, and must stay omitted while `pricing` is |

`title` **must** contain a pipe: JSON-LD `serviceType` is derived as
`title.split('|')[0].trim()` (`ServiceLanding.tsx:325`). A title without one puts the whole
string into `serviceType` — valid JSON-LD carrying the wrong value, and nothing catches it.

`onePagerHref` renders **inside** the `pricing` block. Setting it without `pricing` commits a
PDF that no link ever points at. There is already a latent instance of this in the codebase.

### The navy band, deliberately absent

The dark navy proof band renders only from `pricing` (`ServiceLanding.tsx:527`). With no
published price there is no band, so this page reads flatter than its five siblings, against
the page pattern in `CLAUDE.md`.

**Decision: accept it.** The page carries its weight through the control loop and the FAQs.
Giving `pricing` a non-price payload would abuse a field named for money, and a component
change to render a band without pricing was judged not worth it for a visual beat.

---

## 3. The control loop — what replaces the demo

The page's centrepiece, and the reason it can convert without a product to show: one real
QHSE failure travelling end to end.

| Stage | Content |
|---|---|
| Define | The limit, the specification, the responsible person |
| Capture | The result recorded as work actually happens |
| Detect | Out of specification, flagged rather than buried in a spreadsheet |
| Act | Contained, investigated, action assigned and tracked |
| Verify | Did it work? Recurrence feeds the next cycle |

This is honest in a way a mockup would not be: it is Preqal's method, which exists, rather
than a picture of software that does not.

It renders through the existing `schedule` slot (`ServiceLanding.tsx:496-523`), which draws a
row of glass cards each carrying a badge, title and description in a five-column grid at `lg`.
Five stages fill it exactly.

### The one component change

`schedule`'s two headings are hardcoded: the eyebrow reads "How the week runs" and the h2
"Five days, **start to finish.**" Neither is true of a control loop.

Add two optional fields to `ServicePage`, defaulting to the current literals:

```ts
scheduleEyebrow?: string;   // default: 'How the week runs'
scheduleHeading?: React.ReactNode;  // default: the existing 'Five days, start to finish.'
```

All five existing pages must emit byte-identical output, since they set neither. This is the
only component change in the whole design, and it is additive.

---

## 4. Imagery

`content/blog/knowledge-base/imagery.md` §4 forbids a render or screenshot, so the card cannot
show software. It must be a photograph of QHSE work happening — a result being recorded on a
plant floor, an inspector mid-check. Source at least 1920px wide.

Generated through the existing pipeline, never hand-named, because the filename must carry a
content hash:

```bash
node scripts/fetch-blog-photo.mjs --base service-photos --slug qhse-control \
  --credit "<photographer>" --page "<source url>"
PHOTO_BASE=service-photos node scripts/make-og-crops.mjs qhse-control/<name>.<hash>
```

That produces `public/service-photos/qhse-control/` with ten files: `-800`, `-1200` and
`-1600` derivatives, `-og.jpg`, and a `credit.json`. Pass real `--credit` and `--page` values —
the question "is this ours to use?" should be answerable from the repository a year from now.

`thumbnail.src` is stored **relative with no leading slash**
(`service-photos/qhse-control/<name>.<hash>`) and `thumbnail.alt` must exceed 20 characters
after trimming, both enforced by `tests/unit/blogThumbnails.test.ts`.

The share card reuses `${BASE_URL}/og/services.png`. Do not invent `/og/qhse-control.png` —
`tests/unit/ogCards.test.ts` asserts every referenced card exists on disk.

That card's caption is baked as "Five fixed-scope services for SMEs"
(`scripts/generate-og-cards.py:44`), which a sixth service makes false. It must be reworded
and the card redrawn with `npm run og:cards`, then **committed**. Brand artefacts are never
generated during the build: CI runs on Ubuntu and would ship a different font.

---

## 5. Every surface the change touches

Mapped by five parallel agents over 112 integration points. The brief's framing of this as
"one entry in `SERVICE_PAGES`" is wrong, and most of what can go wrong fails silently.

### Compile-time — loud, safe

| Surface | Change |
|---|---|
| `components/WhatsAppContact.tsx:15` | `WhatsAppServiceKey` is a closed union. Add `\| 'qhse-control'`. |
| `pages/ServiceLanding.tsx:71` | The record itself, with all 14 required fields. |

### Silent — ships wrong and green

| Surface | Change | Symptom if missed |
|---|---|---|
| `components/WhatsAppContact.tsx:29` | Add a sixth `WHATSAPP_OPTIONS` row | `whatsAppLink` does `find(…) ?? OPTIONS[0]`, so every CTA opens WhatsApp with the **Business Plan** message while analytics reports `qhse-control` converting |
| `vite.config.ts:15` | Add `/services/qhse-control` to the prerender list | `inject-seo-meta.mjs` still writes an `index.html` from the bare shell, carrying the **home page's** title, description and canonical |
| `scripts/route-meta.mjs:26` | Add an entry, `ogImage: ${BASE_URL}/og/services.png` | No meta injection, no prerender — **and no a11y test is generated**, since that suite derives from route-meta |
| `scripts/generate-sitemap.js:38` | Add one row (no `DATES` entry needed) | Absent from sitemap.xml; nothing reads this file in any test |
| `components/Footer.tsx:89` | Add a hand-written row using the `href()` helper | The page is an orphan: `/services` is not in either nav bar, so the footer is its only site-wide link |

The WhatsApp options row is the highest-risk item in the change: the type union and the
options table are separate, so adding the first without the second compiles, passes every
test, and ships a page whose buttons ask about business plans.

### The "Five services" literals

Six cards under a heading that says five. The count appears in five places, and no test
compares them:

- `pages/ServiceLanding.tsx:702` — the index h1, "Five services. **One journey.**"
- `pages/ServiceLanding.tsx:692` — the index meta description
- `scripts/route-meta.mjs:21` — a byte-identical copy of that description
- `public/llms.txt:3` and `public/llms-full.txt:3` — the `>` opener paragraph

`tests/unit/seoCopy.test.ts:110-112` asserts the two `llms*.txt` openers are **identical**, so
editing one and not the other fails the build. Edit them in lockstep.

Two further literals state or imply the journey framing and need rewording so they stay true
of a six-item set that is not a single sequence: the index sub-paragraph at
`ServiceLanding.tsx:704-707` ("fixed in scope and price", which this offer is not) and the
related-services pills at `:638`, which currently present every sibling as "the other steps on
the journey".

### Automatic — confirmed, no action

- `components/AnimatedRoutes.tsx:76` — the route is dynamic; no router change.
- `pages/Home.tsx:33` — the five-phase journey is a separate array. A sixth service does
  **not** become a sixth phase, which is the intended outcome.
- `pages/ServiceLanding.tsx:712` — the services index derives its cards from
  `SERVICE_PAGES`; the sixth card appears with no markup edit. Append at the end: index 0
  carries eager/high LCP treatment.
- `seo/seo.ts` — not consulted for service pages. Do not add an entry.
- JSON-LD `ProfessionalService`, `Service` and `FAQPage` are all derived from the record.
- `relatedGuides` and related posts match nothing and are guarded; both blocks simply omit.

---

## 6. Verification

### Gates that fire automatically

| Gate | Covers |
|---|---|
| TypeScript | The union member and all 14 required fields |
| `tests/unit/blogThumbnails.test.ts` | Parameterised over `SERVICE_PAGES`: the image set, the content hash, alt length |
| `tests/unit/ogCards.test.ts` | That the referenced share card exists |
| `tests/unit/seoCopy.test.ts` | The `llms*.txt` opener parity; no "Georgetown" in route-meta |
| `tests/a11y.spec.ts` | Zero WCAG 2.1 A/AA violations — **only if** the route-meta entry exists |

### Gates this change must add

1. **A `smoke.spec.ts` case** at `:152` — append
   `['/services/qhse-control/', ['ProfessionalService', 'Service', 'FAQPage']]`. That array is
   a hardcoded page list, so without this row the page can ship with no JSON-LD at all and the
   suite stays green.

2. **A reconciliation unit test** — the highest-value item in this change. It derives from
   `SERVICE_PAGES` and asserts that every slug appears in each of the four hand-maintained
   lists:

   - every `waKey` has a matching `WHATSAPP_OPTIONS` row
   - every slug is in `vite.config.ts`'s prerender paths
   - every slug is in `scripts/generate-sitemap.js`
   - every slug has a `scripts/route-meta.mjs` entry

   This converts the silent failures above into loud ones, and protects whoever adds service
   number seven. It would have caught most of what the mapping found. A sweep must derive its
   inputs rather than list them, or it silently stops covering what is added after it.

### Manual checks

- The rendered page must match the neumorphic system by **reusing** `glassCard` by reference
  rather than authoring a second glass value, and wrapping new sections in `ScrollReveal` at
  the page's existing rhythm (`yFrom={14}` for headings, `yFrom={18}` with an `i * 80` stagger
  for cards). A hand-rolled `motion.div` loses the reduced-motion branch, which no test checks.
- Body, muted and link text use `text-slate-500`, `text-slate-400` and `text-amber-600`, never
  an inline hex — the tokens are re-tuned in `src/index.css` and an inline value silently falls
  below AA.
- The CTA keeps navy-on-amber. White on the gradient's light stop reads 2.15:1.
- Open the chosen photograph and confirm what is in frame at every aspect ratio the markup
  applies, before it ships.

---

## 7. Out of scope

- Any `/software/` section, nav change, or second product line.
- Adding the offer to the home five-phase journey.
- Published pricing, a one-pager PDF, or a booking-calendar integration.
- Building any part of the QHSE software itself.
