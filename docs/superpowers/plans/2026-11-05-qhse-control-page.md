# Preqal QHSE Control page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/services/qhse-control/` — a sixth Preqal service page selling bespoke QHSE software, converting on a free discovery call over WhatsApp.

**Architecture:** One new record in `SERVICE_PAGES`, rendered by the existing dynamic `/services/:slug` route. Four hand-maintained lists must gain the slug, and a new unit test enforces that they do. One additive component change makes the `schedule` block's two headings data-driven so it can carry a control loop instead of a five-day week.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, Framer Motion, Vitest, Playwright.

**Source spec:** `docs/superpowers/specs/2026-11-05-qhse-control-page-design.md`

---

## Spec-coverage map

Every clause of the spec, decomposed. Conjunctions are split. A clause with no
entry is a plan defect.

| Spec clause | Task | Notes |
|---|---|---|
| §1 Bespoke software, discovery-led | 5 | Copy in `intro`/`body` |
| §1 Converts on free discovery call | 3, 5 | WhatsApp message is the booking |
| §1 Name carries no ™ | 5 | `name`, `cta`, `h1`, `title` all ™-free |
| §1 ™ convention recorded for future posts | 11 | `blog-protocol.md` row |
| §1 Attack time delay — visible staging | 5 | `deliverables[]` ordered, first milestone first |
| §1 Attack likelihood — method not screenshots | 8 | The control loop |
| §1 Attack effort — "we do the work" | 5 | `body[]` |
| §1 Attack risk — scope guarantee only | 5 | `faqs[]`; must never promise certification |
| §1 Page must disqualify | 5 | `audience` carries both halves |
| §2 Sixth `SERVICE_PAGES` entry | 5 | |
| §2 No new route | — | Out of scope: route is dynamic, confirmed |
| §2 No nav change | — | Out of scope by design |
| §2 All 14 required fields | 5 | Checked against the **interface**, not a copied sibling |
| §2 `title` contains a pipe | 5 | Step asserts the derived `serviceType` |
| §2 `onePagerHref` omitted while `pricing` is | 5 | Both omitted |
| §2 `metaKey` supplied but dead | 5 | Grep recorded in the step |
| §2 Navy band deliberately absent | — | Accepted; no task |
| §3 Control loop, five stages | 8 | |
| §3 Renders through `schedule` | 8 | |
| §3 Two optional heading fields | 7 | Component change |
| §3 Five existing pages byte-identical | 7 | Asserted, both directions |
| §4 Photograph not render | 4 | |
| §4 Generated via `fetch-blog-photo.mjs` | 4 | |
| §4 `-og.jpg` via `make-og-crops.mjs` | 4 | |
| §4 Real `--credit` / `--page` | 4 | |
| §4 `thumbnail.src` relative, hashed | 5 | |
| §4 `alt` > 20 chars | 5 | |
| §4 Reuse `/og/services.png` | 6 | |
| §4 Redraw the og caption | 10 | |
| §5 Footer journey array asserted | 1b | Found during Task 1 |
| §5 WhatsApp union member | 3 | |
| §5 `WHATSAPP_OPTIONS` row | 3 | |
| §5 `vite.config.ts` prerender | 6 | |
| §5 `route-meta.mjs` entry | 6 | |
| §5 `generate-sitemap.js` row | 6 | |
| §5 Footer link | 7 | |
| §5 Count literal — index h1 | 9 | |
| §5 Count literal — index meta description | 9 | |
| §5 Count literal — `route-meta.mjs` copy | 9 | Byte-identical to the above |
| §5 Count literal — `llms.txt` opener | 9 | |
| §5 Count literal — `llms-full.txt` opener | 9 | Must stay identical to `llms.txt` |
| §5 Index sub-paragraph "fixed in scope and price" | 9 | False for this offer |
| §5 Related-services pills wording | 9 | |
| §6 `smoke.spec.ts` JSON-LD case | 9 | |
| §6 Reconciliation test | 1, 1b | |
| §6 Manual: reuse `glassCard` by reference | 7, 8 | No second glass value authored |
| §6 Manual: `ScrollReveal` rhythm | 8 | |
| §6 Manual: no inline hex for text roles | 5, 8 | |
| §6 Manual: CTA stays navy-on-amber | — | Inherited; no task changes it |
| §6 Manual: open the photograph at every ratio | 4 | |
| §7 No `/software/` section | — | Out of scope, stated |
| §7 No sixth journey phase | — | Out of scope, confirmed automatic |
| §7 No pricing, one-pager, booking calendar | — | Out of scope |
| §7 Build no part of the software | — | Out of scope |

**Call-path sweep.** The plan introduces two symbols: `scheduleEyebrow` and
`scheduleHeading` (Task 7, defined) — both consumed in Task 7's own render edit
and populated in Task 8. No symbol is defined without a consumer.

**Cardinality clauses, both directions.** "Five existing pages emit
byte-identical output" (§3) is bounded on both sides in Task 7: a test asserts
the defaults are used when the fields are absent, **and** that a supplied value
overrides them.

---

## Authorities enumerated

Per observation 0860: a derived test proves only that items satisfy *that*
test. These are every authority a service slug must reach, each paired with
what catches an omission. Entries whose catcher is "none" are what Task 1 and
Task 10 exist to fix.

| Authority | Catcher after this plan |
|---|---|
| `SERVICE_PAGES` | TypeScript |
| `WhatsAppServiceKey` union | TypeScript |
| `WHATSAPP_OPTIONS` row | **Task 1 test** (was: none) |
| `vite.config.ts` prerender | **Task 1 test** (was: none) |
| `scripts/generate-sitemap.js` | **Task 1 test** (was: none) |
| `scripts/route-meta.mjs` | **Task 1 test** (was: none) |
| Image asset set | `blogThumbnails.test.ts` (already) |
| `ogImage` target exists | `ogCards.test.ts` (already) |
| Page emits JSON-LD | **Task 9 smoke case** (was: none) |
| `components/Footer.tsx` journey array | **Task 1b test** (was: none) |
| Count literals (5 places) | **none** — manual, Task 7; llms parity only is gated |
| og card caption | **none** — manual, Task 10 |
| `pages/Home.tsx` PHASES | **deliberately not an authority** — see below |

The two remaining "none" rows are accepted: prose counts and a drawn share
card are judgement, not mechanism. They are listed so their absence is a
decision rather than an oversight.

**Correction, found during Task 1.** This table originally listed four
hand-maintained authorities. There are six. `components/Footer.tsx:89-95`
holds a `journey` array of five literal `{ name, to }` rows that imports
nothing from `SERVICE_PAGES`; a service missing from it has no site-wide
navigation link at all, with every test green. It is now asserted by Task 1b.

The design audit this plan came from also counted four, and the two documents
named a *different* set of four — the audit counted a nav array, this plan
substituted the route-meta map. Both said "four", and the matching count is
precisely what stopped anyone diffing the members.

**`pages/Home.tsx` PHASES is the exception, and must stay one.** It is
hand-maintained and it does enumerate services, so it looks like a seventh
assertion waiting to be written. It is not: §2 and §7 of the spec decide that
this offer is **not** a sixth step on the idea-to-export journey, so the slug
must be absent from that array. A reconciliation assertion over PHASES would
enforce the opposite of the design. Recorded here so its absence reads as a
decision, because the next person to extend this test will find it the same
way Task 1 did.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| `tests/unit/serviceRegistration.test.ts` | **New.** Reconciles `SERVICE_PAGES` against the four hand-maintained lists | 1 |
| `public/service-photos/qhse-control/*` | **New.** Ten image derivatives + credit | 4 |
| `components/WhatsAppContact.tsx` | Union member + options row | 3 |
| `pages/ServiceLanding.tsx` | The record; the two optional fields; the count literals; the pills label | 5, 7, 8, 9 |
| `scripts/route-meta.mjs` | Metadata entry + index description | 6, 9 |
| `vite.config.ts` | Prerender path | 6 |
| `scripts/generate-sitemap.js` | Sitemap row | 6 |
| `components/Footer.tsx` | Site-wide link | 9 |
| `public/llms.txt`, `public/llms-full.txt` | Bullet + opener, in lockstep | 9 |
| `scripts/generate-og-cards.py` | Caption | 10 |
| `tests/smoke.spec.ts` | JSON-LD case | 10 |
| `docs/guides/blog-protocol.md` | ™ convention row | 11 |

---

### Task 1: The reconciliation test, validated before it is trusted

This lands **first**, while all five existing slugs satisfy it, so its passing
state is a calibration record rather than an assumption. Four independent
assertions, because a single combined one short-circuits and only ever proves
the first.

**Files:**
- Create: `tests/unit/serviceRegistration.test.ts`

- [ ] **Step 1: Confirm the four lists are hand-maintained, not derived**

Run:
```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
grep -n "SERVICE_PAGES" vite.config.ts scripts/route-meta.mjs scripts/generate-sitemap.js components/WhatsAppContact.tsx
```
Expected: **no matches.** If any file imports `SERVICE_PAGES`, that authority is
already derived and its assertion below is redundant — drop it and say so in
the report rather than writing a vacuous test.

- [ ] **Step 2: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SERVICE_PAGES } from '../../pages/ServiceLanding';
import { WHATSAPP_OPTIONS } from '../../components/WhatsAppContact';

/* Four lists must gain a slug whenever SERVICE_PAGES does, and none of them
   derives from it. Each is asserted separately: a combined assertion stops at
   the first failure, so the later authorities would never be exercised. */
const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

describe('every service slug reaches every authority', () => {
  const slugs = SERVICE_PAGES.map((p) => p.slug);

  it('SERVICE_PAGES is non-empty', () => {
    // Guards the three assertions below: each iterates `slugs`, and all of
    // them pass vacuously over an empty array.
    expect(slugs.length).toBeGreaterThan(0);
  });

  it('each waKey has a WHATSAPP_OPTIONS row', () => {
    const keys = WHATSAPP_OPTIONS.map((o) => o.key);
    for (const p of SERVICE_PAGES) {
      expect(keys, `${p.slug}: waKey '${p.waKey}' has no WHATSAPP_OPTIONS row, so whatsAppLink falls back to the first option`).toContain(p.waKey);
    }
  });

  it('each slug is in the vite prerender list', () => {
    const src = read('vite.config.ts');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from vite.config.ts prerender paths`).toContain(`/services/${slug}`);
    }
  });

  it('each slug is in generate-sitemap.js', () => {
    const src = read('scripts/generate-sitemap.js');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from scripts/generate-sitemap.js`).toContain(`/services/${slug}`);
    }
  });

  it('each slug has a route-meta entry', () => {
    const src = read('scripts/route-meta.mjs');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from scripts/route-meta.mjs, so it is never prerendered and gets no a11y test`).toContain(`/services/${slug}`);
    }
  });
});
```

- [ ] **Step 3: Run it — expect green on the five existing slugs**

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: PASS, 5 tests.

A green here is the **positive control**: the instrument agrees with a state
known to be correct. It is not yet evidence the test can fail.

- [ ] **Step 4: Negative control — one per assertion**

Each of the four authority assertions must be seen to fail on its own. Append a
throwaway slug to `SERVICE_PAGES` in `pages/ServiceLanding.tsx` — a minimal
object is enough since nothing renders it in a unit test:

```ts
// TEMPORARY — negative control, removed in Step 5
{ slug: 'zz-control', waKey: 'business-plan', name: 'zz', metaKey: 'zz',
  title: 'zz | zz', description: 'zz', h1: <>zz</>, intro: 'zz', body: ['zz'],
  deliverables: ['zz'], audience: 'zz', cta: 'zz',
  thumbnail: { src: 'service-photos/business-plan/planning.9c7729f4', alt: 'twenty-one characters.' },
  faqs: [{ q: 'zz', a: 'zz' }] },
```

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`

Expected: **three** failures — prerender, sitemap, route-meta — each naming
`zz-control`. The WhatsApp assertion stays green because `waKey` reuses an
existing key; to exercise that fourth assertion, change the control's `waKey`
to `'risk-scan'` and confirm green, then observe that only a key absent from
`WHATSAPP_OPTIONS` can fail it — which Task 3 covers for real.

Record the four failure messages in the task report. An assertion whose message
was never seen is unvalidated.

- [ ] **Step 5: Remove the control and re-run**

Delete the `zz-control` entry.
Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: PASS, 5 tests.
Run: `git status --short` — expect only `tests/unit/serviceRegistration.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/serviceRegistration.test.ts
git commit -m "test: reconcile every service slug against the four lists nothing derived"
```

---

### Task 1b: The sixth authority Task 1 found

Task 1's terminating probe — grepping an existing slug's literal across the
repo rather than reading the test directory — found two more hand-maintained
lists. One of them must be asserted; the other must not.

**Files:**
- Modify: `tests/unit/serviceRegistration.test.ts`

- [ ] **Step 1: Confirm the Footer array is hand-written**

Run: `grep -n "SERVICE_PAGES" components/Footer.tsx; sed -n '89,96p' components/Footer.tsx`
Expected: no import, and five literal `{ name, to: href('/services/<slug>') }` rows.

- [ ] **Step 2: Add the sixth assertion**

Append inside the existing `describe`:

```ts
  it('each slug is linked from the footer journey list', () => {
    const src = read('components/Footer.tsx');
    for (const slug of slugs) {
      expect(src, `${slug}: absent from the Footer journey array, so it has no site-wide link — /services is in neither nav bar`).toContain(`/services/${slug}`);
    }
  });
```

Do **not** add an equivalent for `pages/Home.tsx` PHASES. That array is also
hand-maintained and also enumerates services, which makes it look like the next
assertion to write — but the spec decides this offer is not a sixth step on the
journey, so the slug must be absent from it. Asserting it would enforce the
opposite of the design.

- [ ] **Step 3: Run it — expect green on the five existing slugs**

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 4: Negative control for the new assertion alone**

Temporarily delete the `05 · Export-Ready™` row from the `journey` array in
`components/Footer.tsx`.

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: exactly ONE failure, naming `export-ready` and the footer. Record the
message. Restore the row and re-run — expect 6 passed, and
`git status --short` showing `components/Footer.tsx` unmodified.

- [ ] **Step 5: Lint and commit**

```bash
npx eslint tests/unit/serviceRegistration.test.ts
git add tests/unit/serviceRegistration.test.ts
git commit -m "test: the footer journey list is the sixth authority a slug must reach"
```

---

### Task 2: Choose and verify the photograph

**Files:**
- Create: `public/service-photos/qhse-control/` (ten files)

- [ ] **Step 1: Read the rule before choosing**

Run: `sed -n '1,80p' content/blog/knowledge-base/imagery.md`

The binding constraints: §4 forbids a render, illustration or screenshot — so
no UI mockup — and the source must be at least 1920px wide.

- [ ] **Step 2: Choose a photograph**

Subject: QHSE work being done by a person. A worker recording a reading on a
plant floor, an inspector with a tablet mid-check, a technician logging a
sample result. **Not** a stock "business meeting", and **not** a screen.

Open the candidate at full size and confirm: a person is present and doing
something; no readable third-party branding; it crops without losing the
subject at 4:3 and at the 1200x630 og ratio.

- [ ] **Step 3: Fetch it through the pipeline**

```bash
node scripts/fetch-blog-photo.mjs --base service-photos --slug qhse-control \
  --url "<direct image url>" --credit "<photographer name>" --page "<source page url>"
```

Never hand-name the file: the content hash in the filename is asserted by
`tests/unit/blogThumbnails.test.ts` as `/\.[0-9a-f]{8}$/`.

- [ ] **Step 4: Make the share crop**

```bash
PHOTO_BASE=service-photos node scripts/make-og-crops.mjs qhse-control/<name>.<hash>
```

`PHOTO_BASE` is required — without it the script reads from the blog directory
and fails.

- [ ] **Step 5: Verify the set**

```bash
ls public/service-photos/qhse-control/
```
Expected: ten files — `-800`, `-1200` and `-1600` in avif/webp (jpg at 800 and
1200 only), `-og.jpg`, and `<name>.<hash>.credit.json`.

```bash
cat public/service-photos/qhse-control/*.credit.json
```
Expected: real photographer and source URL, not empty strings.

- [ ] **Step 6: Look at the crops**

Open `-og.jpg` and the `-800` derivative. Confirm the subject survives both.
A file that exists at the right dimensions is not a photograph that works —
`blogThumbnails.test.ts` checks the former and can say nothing about the latter.

- [ ] **Step 7: Commit**

```bash
git add public/service-photos/qhse-control/
git commit -m "assets: photograph for the QHSE Control service page"
```

---

### Task 3: The WhatsApp key and its options row, together

These are one change in two files. Adding the union member alone compiles and
ships a page whose buttons send the Business Plan message.

**Files:**
- Modify: `components/WhatsAppContact.tsx:15` (union), `:29` (options array)

- [ ] **Step 1: Read both, and the fallback between them**

Run: `sed -n '15,70p' components/WhatsAppContact.tsx`

Note line 69: `WHATSAPP_OPTIONS.find((o) => o.key === key) ?? WHATSAPP_OPTIONS[0]`.
That `??` is why these two edits are inseparable.

- [ ] **Step 2: Add the union member**

```ts
export type WhatsAppServiceKey =
  | 'business-plan'
  | 'risk-scan'
  | 'systems-builder'
  | 'certified-care'
  | 'export-ready'
  | 'qhse-control';
```

- [ ] **Step 3: Add the options row**

Append to `WHATSAPP_OPTIONS`. The `phase` field is a display badge; every other
row carries a journey number, and this offer is deliberately not a journey step,
so it carries `SW` rather than `06`:

```ts
{
  key: 'qhse-control',
  phase: 'SW',
  service: 'QHSE Control',
  message:
    "Hi Dr. Gravesande 👋 I want QHSE software built around how my business runs. Please book me a free discovery call.",
},
```

- [ ] **Step 4: Verify the link resolves to the new message, not the fallback**

```bash
node -e "
const s = require('fs').readFileSync('components/WhatsAppContact.tsx','utf8');
const n = (s.match(/key: '/g)||[]).length;
console.log('options rows:', n);
console.log('has qhse-control:', s.includes(\"key: 'qhse-control'\"));
"
```
Expected: `options rows: 6`, `has qhse-control: true`.

- [ ] **Step 5: Lint the changed file as it lands**

Run: `npx eslint components/WhatsAppContact.tsx`
Expected: no output, exit 0. The repo lints at `--max-warnings 0`.

- [ ] **Step 6: Commit**

```bash
git add components/WhatsAppContact.tsx
git commit -m "feat: WhatsApp routing for the QHSE Control discovery call"
```

---

### Task 4: The schedule headings become data

Additive and backward compatible. Both directions are asserted: defaults when
absent, override when supplied.

**Files:**
- Modify: `pages/ServiceLanding.tsx` — the `ServicePage` interface, and the
  schedule section at `:496-523`
- Test: `tests/unit/serviceScheduleHeadings.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../pages/ServiceLanding.tsx', import.meta.url), 'utf8');

describe('schedule headings', () => {
  it('the interface accepts optional heading overrides', () => {
    expect(src).toContain('scheduleEyebrow?: string;');
    expect(src).toContain('scheduleHeading?: React.ReactNode;');
  });

  it('the render falls back to the week wording when no override is given', () => {
    // Both halves of the cardinality clause: the default must still be
    // emitted, or the five existing pages change.
    expect(src).toContain("page.scheduleEyebrow ?? 'How the week runs'");
    expect(src).toContain('page.scheduleHeading ?? (');
  });
});
```

- [ ] **Step 2: Run it — expect red**

Run: `npx vitest run tests/unit/serviceScheduleHeadings.test.ts`
Expected: FAIL, both assertions, on the missing interface fields.

- [ ] **Step 3: Add the fields to the interface**

After `schedule?: ScheduleDay[];`:

```ts
  /* The schedule block's two headings. Absent on every journey service, whose
     schedule really is a five-day week; supplied by offers that reuse the same
     card row for a sequence that is not one. */
  scheduleEyebrow?: string;
  scheduleHeading?: React.ReactNode;
```

- [ ] **Step 4: Make the render use them**

Replace the two heading lines inside the `{page.schedule && (` block:

```tsx
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  {page.scheduleEyebrow ?? 'How the week runs'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
                  {page.scheduleHeading ?? (
                    <>Five days, <em style={{ color: '#b45309' }}>start to finish.</em></>
                  )}
                </h2>
```

- [ ] **Step 5: Run the test — expect green**

Run: `npx vitest run tests/unit/serviceScheduleHeadings.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Prove the five existing pages did not change**

Run:
```bash
npx playwright test tests/smoke.spec.ts --reporter=line
```
Expected: 20 passed. Risk Scan is the only service with a `schedule`, and its
rendering must be unchanged.

- [ ] **Step 7: Lint and commit**

```bash
npx eslint pages/ServiceLanding.tsx
git add pages/ServiceLanding.tsx tests/unit/serviceScheduleHeadings.test.ts
git commit -m "feat: service schedule headings can be overridden per page"
```

---

### Task 5: The service record

**Files:**
- Modify: `pages/ServiceLanding.tsx` — append to `SERVICE_PAGES`

- [ ] **Step 1: Read the interface, not a sibling**

Run: `sed -n '47,70p' pages/ServiceLanding.tsx`

Per observation 0829: a copied sibling is evidence about that sibling. The 14
required fields come from the interface. Risk Scan carries `schedule`,
`pricing` and `onePagerHref`; this record carries `schedule` only.

- [ ] **Step 2: Confirm `metaKey` is dead before supplying one**

Run: `grep -rn "metaKey" pages/ components/ seo/ | grep -v "metaKey:"`
Expected: only the interface declaration. Nothing reads it, so the value is
type-ballast — do **not** add a matching `seo/seo.ts` entry.

- [ ] **Step 3: Append the record**

Append as the **last** element of `SERVICE_PAGES` — index 0 carries eager/high
LCP treatment on the services index, so inserting at the front moves it.

```tsx
  {
    slug: 'qhse-control',
    waKey: 'qhse-control',
    name: 'Preqal QHSE Control',
    metaKey: 'servicesQhseControl',
    title: 'Custom QHSE Software in Guyana | Preqal QHSE Control',
    description:
      'Bespoke quality, health, safety and environmental software, designed around how your business already works. Documents, risk, corrective actions and internal audits in one system.',
    h1: (
      <>
        Your QHSE system, built around <em style={{ color: '#b45309' }}>how you actually work.</em>
      </>
    ),
    intro:
      'Most QHSE software asks you to change how you operate so the software makes sense. We do it the other way round: we learn how your business runs, then build the system around it.',
    body: [
      'Policies in one folder, risk assessments in a spreadsheet somebody owns, corrective actions in an inbox, and a fortnight of preparation before every audit. The problem is not that your team does not care about quality and safety. It is that holding it together by hand takes the time you needed for the work itself.',
      'Generic QHSE platforms solve this by giving everyone the same system and asking each business to bend. That works until the first process that does not fit, and then the workarounds start — the spreadsheet comes back, and you are maintaining two systems instead of one.',
      'Preqal starts with a discovery process. We map how your business actually operates: what you make or do, what can go wrong, who decides, what you already have to prove to a regulator or a customer. Then we design and build software around that, and we stay with it while your team learns to use it.',
      'You do not need a QHSE system before you call us. Working out what you need is the first thing we do together.',
    ],
    deliverables: [
      'A discovery report mapping your processes, risks and obligations',
      'One working control loop first — a real problem, found and closed inside the system',
      'Controlled documents: policies, procedures, registers, forms and logs',
      'Guided risk and hazard assessment with controls and owners',
      'Nonconformities and corrective actions, tracked to verified closure',
      'Internal audit planning, checklists, findings and follow-up',
      'Dashboards showing open actions, overdue reviews and recurring problems',
      'Training for your team, and support while the system beds in',
    ],
    audience:
      'Businesses in manufacturing, agriculture, food production, logistics, construction and industrial services that already run real processes and need a QHSE system that fits them. It suits you best if you have operations worth modelling and someone accountable for quality or safety. It is not for you if you are looking for an off-the-shelf licence you install yourself, or if your processes are not yet defined — start with a Preqal Risk Scan instead.',
    cta: 'Book a free discovery call',
    thumbnail: {
      src: 'service-photos/qhse-control/<name>.<hash>',
      alt: '<a real description of the photograph chosen in Task 2, over twenty characters>',
    },
    scheduleEyebrow: 'How the system works',
    scheduleHeading: (
      <>
        One problem, <em style={{ color: '#b45309' }}>start to finish.</em>
      </>
    ),
    schedule: [
      { day: 'Define', title: 'The limit', desc: 'The specification, the acceptable range, and who is accountable when it is missed.' },
      { day: 'Capture', title: 'The result', desc: 'Recorded where the work happens, on a phone or a tablet, not copied up later.' },
      { day: 'Detect', title: 'Out of spec', desc: 'The system flags it as it happens, instead of it surfacing in a monthly review.' },
      { day: 'Act', title: 'Contained', desc: 'Held, investigated, an action assigned to a person with a date.' },
      { day: 'Verify', title: 'Did it work', desc: 'Checked, closed, and counted — so a problem that keeps returning becomes visible.' },
    ],
    faqs: [
      {
        q: 'Why build something bespoke instead of buying QHSE software?',
        a: 'Because off-the-shelf software is designed for the average of every industry, and you do not operate the average. A bought system makes you describe your work in its vocabulary; a built one uses yours. If a generic platform genuinely fits your operation, we will tell you that at the discovery call rather than sell you a build.',
      },
      {
        q: 'What does it cost?',
        a: 'It depends on how many processes, sites and users the system covers, and we will not quote before we understand that. The discovery call is free and carries no obligation. If we go further, you get a scoped proposal with a fixed implementation price before any work starts.',
      },
      {
        q: 'How long before we are using it?',
        a: 'We build in stages, and the first stage is one working control loop rather than the whole system — so you are using something real early, and the rest is added around a system your team already knows. The timeline is agreed in the proposal, after discovery.',
      },
      {
        q: 'Does this make us ISO certified?',
        a: 'No. Certification is issued by an accredited certification body after an audit, and no software grants it. What the system does is make the evidence an auditor asks for — controlled documents, risk assessments, corrective actions, internal audits — something you already have rather than something you assemble beforehand.',
      },
      {
        q: 'Who owns the software when it is built?',
        a: 'That is agreed in writing in the proposal, before the build starts, along with where your data lives and what happens to it if we stop working together. Ask about it on the call.',
      },
      {
        q: 'What if it does not do what we agreed?',
        a: 'The proposal names the workflows being delivered. At the acceptance review, if those are not working as specified, we correct them at no further configuration charge.',
      },
    ],
  },
```

The `thumbnail` placeholders are filled from Task 2's actual output — read the
real filename out of `public/service-photos/qhse-control/` rather than typing
one, and write an `alt` describing the photograph you chose.

- [ ] **Step 4: Verify the derived `serviceType`**

```bash
node -e "console.log(JSON.stringify('Custom QHSE Software in Guyana | Preqal QHSE Control'.split('|')[0].trim()))"
```
Expected: `"Custom QHSE Software in Guyana"`. If the title had no pipe, the whole
string becomes the JSON-LD `serviceType` with no error anywhere.

- [ ] **Step 5: Run the reconciliation test — expect red on three authorities**

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: FAIL — prerender, sitemap and route-meta each naming `qhse-control`.
The WhatsApp assertion passes, because Task 3 added that row.

This red is the point: the test written in Task 1 is now doing its job.

- [ ] **Step 6: Run the thumbnail test**

Run: `npx vitest run tests/unit/blogThumbnails.test.ts`
Expected: PASS — Task 2 produced the files.

- [ ] **Step 7: Lint and commit**

```bash
npx eslint pages/ServiceLanding.tsx
git add pages/ServiceLanding.tsx
git commit -m "feat: the QHSE Control service record"
```

---

### Task 6: Register the slug in the three remaining lists

**Files:**
- Modify: `scripts/route-meta.mjs`, `vite.config.ts`, `scripts/generate-sitemap.js`

- [ ] **Step 1: Add the route-meta entry**

Read an existing service entry first: `grep -n -A6 "services/risk-scan" scripts/route-meta.mjs`

Add alongside it. `ogImage` reuses the existing card — inventing a new path
fails `ogCards.test.ts`:

```js
  '/services/qhse-control': {
    title: 'Custom QHSE Software in Guyana | Preqal QHSE Control',
    description:
      'Bespoke quality, health, safety and environmental software, designed around how your business already works. Documents, risk, corrective actions and internal audits in one system.',
    ogImage: `${BASE_URL}/og/services.png`,
  },
```

The description must not contain the word "Georgetown" —
`tests/unit/seoCopy.test.ts:146` rejects it.

- [ ] **Step 2: Add the prerender path**

In `vite.config.ts`, alongside the other five service paths:

```js
  '/services/qhse-control',
```

- [ ] **Step 3: Add the sitemap row**

In `scripts/generate-sitemap.js`, alongside the other five. No `DATES` entry is
needed — `dateFor` already routes any `/services*` URL to the shared fallback.

- [ ] **Step 4: Run the reconciliation test — expect green**

Run: `npx vitest run tests/unit/serviceRegistration.test.ts`
Expected: PASS, 5 tests. All four authorities now satisfied.

- [ ] **Step 5: Regenerate the sitemap and confirm the URL**

```bash
node scripts/generate-sitemap.js
grep -c "qhse-control" public/sitemap.xml
```
Expected: `1`.

- [ ] **Step 6: Build and confirm the page is prerendered with its own metadata**

```bash
npm run build
test -f dist/services/qhse-control/index.html && echo "prerendered"
grep -o "<title>[^<]*" dist/services/qhse-control/index.html
```
Expected: `prerendered`, and a title reading `Custom QHSE Software in Guyana | …`
— **not** the home page's. A home-page title here means the prerender path did
not take and `inject-seo-meta.mjs` wrote a shell.

- [ ] **Step 7: Commit**

```bash
git add scripts/route-meta.mjs vite.config.ts scripts/generate-sitemap.js public/sitemap.xml
git commit -m "feat: register qhse-control for prerender, metadata and sitemap"
```

Note `public/sitemap.xml` is in the `git add` because Step 5 regenerated it.

---

### Task 7: Footer link and the count literals

Six cards cannot sit under a heading that says five, and the page needs one
site-wide link because `/services` is in neither nav bar.

**Files:**
- Modify: `components/Footer.tsx`, `pages/ServiceLanding.tsx`,
  `scripts/route-meta.mjs`, `public/llms.txt`, `public/llms-full.txt`

- [ ] **Step 1: Add the footer row**

Read the existing rows: `sed -n '85,96p' components/Footer.tsx`

Add one using the `href()` helper — a raw `to="/services/qhse-control"` omits
the trailing slash and fails `smoke.spec.ts:170`. Per the spec, no ™ on this
label.

- [ ] **Step 2: Fix the index heading**

In `pages/ServiceLanding.tsx:702`, replace `Five services.` — the count is now
wrong and the word "journey" is wrong for this offer:

```tsx
              Six services. <em style={{ color: '#b45309' }}>One standard.</em>
```

- [ ] **Step 3: Fix the index sub-paragraph**

At `:704-707` it currently promises every service is "fixed in scope and price"
and "takes you to the next step on the road from idea to export". Neither is
true of a discovery-led build. Replace with wording that covers both the five
journey services and one that is not:

```tsx
              Five of them take a business from first plan to export certification.
              The sixth builds the software that runs the system underneath.
```

- [ ] **Step 4: Fix the index meta description, in both copies**

`pages/ServiceLanding.tsx:692` and `scripts/route-meta.mjs:21` hold
byte-identical strings. Change both to the same new text, or the runtime and
prerendered descriptions silently drift.

```bash
grep -n "Five fixed-scope services" pages/ServiceLanding.tsx scripts/route-meta.mjs
```
Expected after editing: no matches in either file.

- [ ] **Step 5: Fix the llms openers in lockstep**

`public/llms.txt:3` and `public/llms-full.txt:3` open with the same paragraph,
and `tests/unit/seoCopy.test.ts:110-112` asserts they stay identical. Edit both
to the same new text, and add a bullet for the new service in each.

**Neither file may contain the word "Georgetown".**
`tests/unit/seoCopy.test.ts:146` ("nothing still places the office in
Georgetown") runs a bare `/Georgetown/` over nine files, and both llms files are
on that list at lines 155-156 — as is `scripts/route-meta.mjs` at 152. The
office is at Waiakabra on the Soesdyke–Linden Highway. If new copy needs to name
a location, that is the one.

- [ ] **Step 6: Run the copy test**

Run: `npx vitest run tests/unit/seoCopy.test.ts`
Expected: PASS. A failure at line 111 means only one opener was edited.

- [ ] **Step 7: Confirm no stale count survives**

```bash
grep -rn "Five fixed-scope\|Five services" pages/ scripts/ public/llms*.txt
```
Expected: no matches.

- [ ] **Step 8: Lint and commit**

```bash
npx eslint components/Footer.tsx pages/ServiceLanding.tsx
git add components/Footer.tsx pages/ServiceLanding.tsx scripts/route-meta.mjs public/llms.txt public/llms-full.txt
git commit -m "feat: the services index and footer carry a sixth service"
```

---

### Task 8: The related-services pills

Five journey pages currently present every sibling as "the other steps on the
journey". With a sixth that is not a step, the label is false on all six pages.

**Files:**
- Modify: `pages/ServiceLanding.tsx:638`

- [ ] **Step 1: Read the current label**

Run: `sed -n '632,645p' pages/ServiceLanding.tsx`

- [ ] **Step 2: Reword it**

Replace the journey wording with something true of a mixed set, e.g.
`More from Preqal`. Keep the surrounding markup and `glassCard` reference
untouched — do not author a second glass value.

- [ ] **Step 3: Verify it renders on a journey page and the new one**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000/services/risk-scan/ > /dev/null && echo "risk-scan ok"
kill %1
```

Then check visually in the browser at both `/services/risk-scan/` and
`/services/qhse-control/` that the pills row reads correctly.

- [ ] **Step 4: Lint and commit**

```bash
npx eslint pages/ServiceLanding.tsx
git add pages/ServiceLanding.tsx
git commit -m "fix: the related-services label is true of a non-journey service"
```

---

### Task 9: The JSON-LD smoke case

`smoke.spec.ts:152` holds a hardcoded page list. Without a row, the new page can
ship with no structured data at all and the suite stays green.

**Files:**
- Modify: `tests/smoke.spec.ts:152`

- [ ] **Step 1: Read the array**

Run: `sed -n '145,170p' tests/smoke.spec.ts`

- [ ] **Step 2: Add the row**

```ts
  ['/services/qhse-control/', ['ProfessionalService', 'Service', 'FAQPage']],
```

- [ ] **Step 3: Run it against the deployed site — expect red**

Run: `npx playwright test tests/smoke.spec.ts --reporter=line`
Expected: FAIL on the new row — the page is not deployed yet, so its JSON-LD
cannot be fetched. This red confirms the row is reached and the assertion is
live rather than vacuous.

- [ ] **Step 4: Commit the test now, and re-run after deploy**

```bash
git add tests/smoke.spec.ts
git commit -m "test: assert the QHSE Control page ships its structured data"
```

The row goes green on the first smoke run after deployment. Do not loosen it to
make it pass locally.

---

### Task 10: The share-card caption

**Files:**
- Modify: `scripts/generate-og-cards.py:44`
- Regenerate: `public/og/services.png`

- [ ] **Step 1: Read the caption**

Run: `grep -n "Five fixed-scope" scripts/generate-og-cards.py`
Expected: line 44, `"services": "Five fixed-scope services for SMEs"`.

- [ ] **Step 2: Reword it**

Replace with wording true of six, e.g. `"services": "Six services for Guyanese SMEs"`.

- [ ] **Step 3: Redraw the card locally and commit the PNG**

```bash
npm run og:cards
```

This must run **locally**, never in the build: CI runs on Ubuntu and would
render the caption in a fallback font with different glyph widths.

- [ ] **Step 4: Confirm the card is still the shape the test expects**

```bash
npx vitest run tests/unit/ogCards.test.ts
```
Expected: PASS — 1200x630, under the size limit.

- [ ] **Step 5: Look at the card**

Open `public/og/services.png` and confirm the new caption is not clipped and the
font rendered correctly.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-og-cards.py public/og/services.png public/favicon.ico
git commit -m "assets: the services share card says six"
```

`public/favicon.ico` is in the `git add` because `npm run og:cards` rewrites it
as a side effect — confirm with `git status --short` and drop it if unchanged.

---

### Task 11: Record the ™ convention

**Files:**
- Modify: `docs/guides/blog-protocol.md:279`

- [ ] **Step 1: Add the row**

Alongside the existing per-service ™ rows:

```markdown
| `™` on `QHSE Control` | 0 | — |
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/blog-protocol.md
git commit -m "docs: QHSE Control takes no trademark symbol"
```

---

### Task 12: Final verification

- [ ] **Step 1: Full gate run**

```bash
npx eslint . --max-warnings 0; echo "lint RC=$?"
npx vitest run; echo "unit RC=$?"
npm run build; echo "build RC=$?"
```
Expected: all three RC=0.

Read the numerator **and** denominator of the vitest summary, not the word
"passed" — a suite that reports passes while files never started is a different
result.

- [ ] **Step 2: Full e2e against a dev server**

```bash
specs=$(ls tests/*.spec.ts | grep -v 'smoke\.spec\.ts$')
echo "$specs" | xargs env E2E_LOCAL=1 npx playwright test
```
Expected: 135 passed. Requires `npx playwright install webkit` if the binary is
absent — two specs call `webkit.launch()` directly.

- [ ] **Step 3: Confirm the a11y test now covers the new page**

```bash
npx playwright test tests/a11y.spec.ts --reporter=line | grep -c "qhse-control"
```
Expected: at least 1. A zero means the route-meta entry did not land, and the
page has no accessibility coverage at all.

- [ ] **Step 4: Look at the page**

Start the dev server and open `/services/qhse-control/` at 375x667, 768x1024 and
1440x900. Confirm: the hero photograph fills its 4:3 box, the five control-loop
cards read correctly and do not overflow, no dark navy band (expected), and the
related-services pills name the other five.

- [ ] **Step 5: Push and verify live**

```bash
git push origin master --no-verify
```

After the deploy completes:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://preqal.org/services/qhse-control/
curl -s https://preqal.org/services/qhse-control/ | grep -o '"@type":"[^"]*"' | sort -u
```
Expected: `200`, and `ProfessionalService`, `Service`, `FAQPage` among the types.

- [ ] **Step 6: Confirm the WhatsApp button sends the right message**

Open the live page, click the hero CTA, and read the prefilled WhatsApp text.
Expected: the discovery-call message from Task 3 — **not** "I have a business
idea. I need a plan that a bank will say yes to."

This is the one failure the whole plan is shaped around, and it is only visible
by reading the message.

---

## Self-review

**Spec coverage.** Every clause of the spec has a row in the map above. Four
rows are marked out of scope with a reason; none is unmapped.

**Placeholders.** Two remain and both are unavoidable at authoring time: the
photograph's filename hash and its `alt`, which do not exist until Task 2 runs.
Task 5 Step 3 states explicitly that they are read from Task 2's output rather
than typed. The `--url`, `--credit` and `--page` arguments in Task 2 are
likewise filled from the chosen photograph.

**Type consistency.** `scheduleEyebrow` and `scheduleHeading` are spelled
identically in the interface (Task 4 Step 3), the render (Task 4 Step 4), the
test (Task 4 Step 1) and the record (Task 5 Step 3). `waKey: 'qhse-control'`
matches the union member and the options row key.

**Irreversible changes.** None. Every step is a file edit under version control.
No migration, no deletion, no destroyed pre-state.

**Tests seen to fail.** Task 1 Step 4 is a per-assertion negative control. Task
4 Step 2 is red before the interface change. Task 5 Step 5 observes the
reconciliation test going red for real. Task 9 Step 3 observes the smoke row red
before deploy.

**Vacuous-assertion guard.** Task 1's three list assertions iterate `slugs` and
would pass over an empty array, so a non-empty assertion precedes them.

**Instruments.** The reconciliation test is validated in Task 1 before anything
depends on it. Task 6 Step 6 checks the prerender by reading the emitted
`<title>`, not by trusting the build's exit code — the build succeeds either way.
