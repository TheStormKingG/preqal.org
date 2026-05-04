# Hero & Glass Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mobile hero overlap, make the hero full-viewport on desktop, resize Stabroek +30%, and spread glass to elevated/active moments sitewide.

**Architecture:** The existing 5 shared UI components (SaturnStage, GlassCard, TiltCard, ScrollReveal, ParallaxGlow) in `components/ui/` handle all visual primitives. Page files (Home, Services, CaseStudies, About) are modified to use these components per the neumorphic/glass material system: neumorphic = resting base, glass = elevated/active/accent moments. SaturnStage gets a `size` prop (`'sm' | 'md'`) to support the mobile compact variant.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Vite

**Spec:** `docs/superpowers/specs/2026-05-04-hero-glass-refinement-design.md`

**Correction from spec:** Navbar uses `h-20` (80px, not 64px). Hero height = `calc(100dvh - 80px)`.

---

## File Map

| File | Action | Change |
|---|---|---|
| `components/ui/SaturnStage.tsx` | Modify | Add `size: 'sm' \| 'md'` prop; expose compact 2-ring variant |
| `pages/Home.tsx` | Modify | Full-viewport hero, responsive mobile layout, Stabroek 104px/56px, stats bar |
| `pages/Services.tsx` | Modify | Open accordion card → glass background; chips already glass |
| `pages/CaseStudies.tsx` | Modify | Industry items container → GlassCard |
| `pages/About.tsx` | Modify | "Our Philosophy" section header → GlassCard accent block |

---

## Task 1: SaturnStage — add `size` prop

**Files:**
- Modify: `components/ui/SaturnStage.tsx`

The current component has a single numeric `size` prop that scales everything uniformly. We need two named presets: `'sm'` (mobile, 52px building, 2 rings) and `'md'` (desktop, 104px building, 3 rings at the new +30% dimensions).

- [ ] **Step 1: Replace the component entirely**

Open `components/ui/SaturnStage.tsx` and replace all content with:

```tsx
import React from 'react';

type SaturnSize = 'sm' | 'md';

interface SaturnStageProps {
  imageSrc: string;
  imageAlt: string;
  size?: SaturnSize;
}

const ringStyle = (
  w: number,
  h: number,
  border: string,
  shadow: string | undefined,
  duration: string
): React.CSSProperties => ({
  width: `${w}px`,
  height: `${h}px`,
  border,
  boxShadow: shadow,
  marginLeft: `${-w / 2}px`,
  marginTop: `${-h / 2}px`,
  animation: `orbit ${duration} linear infinite`,
});

// sm: 96px container, 52px building, 2 rings
const SM_CONTAINER = 96;
const SM_BUILDING = 52;
const SM_RINGS = [
  { w: 72,  h: 18, border: '1.5px solid rgba(245,158,11,0.6)', shadow: undefined,                              dur: '8s'  },
  { w: 98,  h: 25, border: '1px solid rgba(245,158,11,0.35)',  shadow: undefined,                              dur: '14s' },
] as const;

// md: 320px container, 104px building, 3 rings (+30% vs original)
const MD_CONTAINER = 320;
const MD_BUILDING = 104;
const MD_RINGS = [
  { w: 170, h: 43, border: '3.5px solid rgba(245,158,11,0.7)', shadow: '0 0 12px rgba(245,158,11,0.3)',        dur: '8s'  },
  { w: 234, h: 59, border: '2px solid rgba(245,158,11,0.4)',   shadow: '0 0 8px rgba(245,158,11,0.12)',        dur: '14s' },
  { w: 294, h: 74, border: '1.5px solid rgba(245,158,11,0.2)', shadow: undefined,                             dur: '22s' },
] as const;

const SaturnStage: React.FC<SaturnStageProps> = ({
  imageSrc,
  imageAlt,
  size = 'md',
}) => {
  const containerSize = size === 'sm' ? SM_CONTAINER : MD_CONTAINER;
  const buildingSize  = size === 'sm' ? SM_BUILDING  : MD_BUILDING;
  const rings         = size === 'sm' ? SM_RINGS      : MD_RINGS;

  return (
    <div
      className="saturn-stage-float"
      style={{
        position: 'relative',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        animation: 'saturn-float 6s ease-in-out infinite',
      }}
    >
      {/* Back halves — z-index 1, behind image */}
      {rings.map((r, i) => (
        <div
          key={`back-${i}`}
          className="orbit-ring ring-back"
          style={ringStyle(r.w, r.h, r.border, r.shadow, r.dur)}
        />
      ))}

      {/* Building image — z-index 2 */}
      <img
        src={imageSrc}
        alt={imageAlt}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${buildingSize}px`,
          height: `${buildingSize}px`,
          transform: 'translate(-50%, -50%)',
          objectFit: 'contain',
          zIndex: 2,
        }}
        loading="eager"
      />

      {/* Front halves — z-index 3, in front of image */}
      {rings.map((r, i) => (
        <div
          key={`front-${i}`}
          className="orbit-ring ring-front"
          style={ringStyle(r.w, r.h, r.border, r.shadow, r.dur)}
        />
      ))}
    </div>
  );
};

export default SaturnStage;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to SaturnStage. (Existing errors in other files are acceptable — we'll fix them in their tasks.)

- [ ] **Step 3: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add components/ui/SaturnStage.tsx
git commit -m "feat(saturn): add size sm/md prop — 104px building at +30%, compact 2-ring sm variant"
```

---

## Task 2: Home hero — full viewport + responsive mobile layout + Stabroek repositioning

**Files:**
- Modify: `pages/Home.tsx` (hero section only, lines ~140–268)

The hero container changes from a fixed `height: '420px'` to a two-layout structure:
- **Mobile** (`md:hidden`): horizontal flex, compact glass card + `size="sm"` Saturn, `minHeight: 260px`
- **Desktop** (`hidden md:flex`): full viewport, glass card left, `size="md"` Saturn at `right: 56px`

- [ ] **Step 1: Locate the hero section in Home.tsx**

The hero section starts at the `<section>` with `pt-7 pb-12 lg:pt-10`. Inside it, there's a single `<div>` with `height: '420px'`. We replace that div's contents with two layout variants.

- [ ] **Step 2: Replace the hero container div**

Find this opening tag in `pages/Home.tsx`:
```tsx
        <div
          className="relative max-w-7xl mx-auto rounded-[20px] overflow-hidden"
          style={{
            height: '420px',
            background: '#e0e5ec',
            boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -10px -10px 28px rgba(255,255,255,0.92)',
          }}
        >
```

Replace it with:
```tsx
        <div
          className="relative max-w-7xl mx-auto rounded-[20px] overflow-hidden"
          style={{
            background: '#e0e5ec',
            boxShadow: '10px 10px 28px rgba(163,177,198,0.65), -10px -10px 28px rgba(255,255,255,0.92)',
          }}
        >
```

(The height is now controlled per-layout below.)

- [ ] **Step 3: Add the mobile layout (before the ambient glows)**

After the `<div>` you just modified (the container open tag), insert the mobile layout block **before** the existing `{/* Ambient amber glows */}` comment. The mobile block is `md:hidden`:

```tsx
          {/* ── Mobile layout (< md) — side-by-side compact ── */}
          <div
            className="flex flex-row items-center gap-2 md:hidden"
            style={{ minHeight: '260px', padding: '14px' }}
          >
            {/* Compact glass card */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <GlassCard>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0 }}
                >
                  <span
                    className="glow-tag"
                    style={{ fontSize: '7px', letterSpacing: '1.5px' }}
                  >
                    Quality · Safety · Compliance
                  </span>
                </motion.div>
                <motion.h1
                  className="font-bold leading-[1.2] text-slate-900 mt-1.5 mb-1.5"
                  style={{ fontSize: '0.78rem' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.07 }}
                >
                  Systems that<br />
                  <span className="text-amber-600">actually work.</span>
                </motion.h1>
                <motion.p
                  className="text-slate-500 leading-relaxed mb-3"
                  style={{ fontSize: '0.55rem' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                >
                  Compliance frameworks that hold up in the real world.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.21 }}
                >
                  <Link
                    to="/book"
                    className="inline-block px-3 py-1.5 rounded-[8px] text-white font-semibold"
                    style={{
                      fontSize: '0.6rem',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      boxShadow: '3px 3px 8px rgba(217,119,6,0.3)',
                    }}
                  >
                    Book a Scan
                  </Link>
                </motion.div>
              </GlassCard>
            </div>

            {/* Compact Saturn */}
            <motion.div
              style={{ flexShrink: 0, width: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <SaturnStage
                imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`}
                imageAlt="Stabroek Market Clock Tower"
                size="sm"
              />
            </motion.div>
          </div>
```

- [ ] **Step 4: Wrap the existing desktop content in `hidden md:block` + fix height**

Find the `{/* Ambient amber glows */}` comment. Everything from there down to (and including) the scroll hint `</div>` belongs to the desktop layout. Wrap it:

Add **before** `{/* Ambient amber glows */}`:
```tsx
          {/* ── Desktop layout (≥ md) ── */}
          <div
            className="hidden md:block relative"
            style={{ minHeight: 'calc(100dvh - 80px)' }}
          >
```

Add **after** the scroll hint closing `</div>` (the one that closes the scroll hint flex container):
```tsx
          </div>{/* end desktop layout */}
```

- [ ] **Step 5: Update the desktop Saturn — new size and position**

Find inside the desktop layout:
```tsx
          <motion.div
            style={{ position: 'absolute', right: '20px', top: '50%' }}
```

Replace with:
```tsx
          <motion.div
            style={{ position: 'absolute', right: '56px', top: '50%' }}
```

And update the `<SaturnStage>` call from (no explicit size prop, or old numeric):
```tsx
              <SaturnStage
                imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`}
                imageAlt="Stabroek Market Clock Tower — Preqal's compliance systems built for the real world"
              />
```

To:
```tsx
              <SaturnStage
                imageSrc={`${import.meta.env.BASE_URL}stabroek3d.png`}
                imageAlt="Stabroek Market Clock Tower — Preqal's compliance systems built for the real world"
                size="md"
              />
```

- [ ] **Step 6: Centre the desktop glass card vertically**

The glass card currently uses `top: 0, bottom: 0` with `justifyContent: 'center'` to fill the full container height. This still works with `min-height`. No change needed — verify it still renders correctly.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "Home\|SaturnStage" | head -20
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/Home.tsx
git commit -m "feat(home): full-viewport hero, mobile side-by-side layout, Stabroek +30% at 56px margin"
```

---

## Task 3: Home stats bar

**Files:**
- Modify: `pages/Home.tsx` (add new section after the hero `</section>`)

A new GlassCard row with 3 proof-point stats sits between the hero and the existing "Quality, Safety & ESG" section.

- [ ] **Step 1: Insert the stats bar section**

In `pages/Home.tsx`, find the closing tag of the hero section:
```tsx
      </section>

      {/* ── Quality, Safety & ESG ── */}
```

Insert the stats bar between them:
```tsx
      </section>

      {/* ── Stats bar ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6 -mt-2">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal yFrom={12}>
            <GlassCard>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                {[
                  { value: '12+',  label: 'clients served'      },
                  { value: '98%',  label: 'audit pass rate'     },
                  { value: '3',    label: 'industries'           },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center text-center">
                    <span
                      className="font-bold text-amber-600"
                      style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Quality, Safety & ESG ── */}
```

- [ ] **Step 2: Verify ScrollReveal and GlassCard are already imported in Home.tsx**

```bash
grep "import.*ScrollReveal\|import.*GlassCard" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/pages/Home.tsx"
```

Expected output shows both imports. If either is missing, add at the top of the file with the other component imports.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "Home" | head -10
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/Home.tsx
git commit -m "feat(home): add glass stats bar — 12+ clients, 98% pass rate, 3 industries"
```

---

## Task 4: Services — open accordion card gets glass background

**Files:**
- Modify: `pages/Services.tsx` (the `ServiceCard` component, lines ~20–100)

When a service is open, the entire card should feel elevated (glass). When closed, it stays neumorphic. The feature chips already switch to `glass-chip` when open — we only need to change the card container.

- [ ] **Step 1: Import GlassCard at top of Services.tsx**

```bash
grep "import.*GlassCard" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/pages/Services.tsx"
```

If not present, add after the existing imports:
```tsx
import GlassCard from '../components/ui/GlassCard';
```

- [ ] **Step 2: Update the ServiceCard outer div to use glass styles when open**

Find in the `ServiceCard` component:
```tsx
    <div className={`neu-card rounded-2xl transition-all duration-300 animate-fade-in-up ${isOpen ? 'neu-raised' : ''}`}>
```

Replace with:
```tsx
    <div
      className="rounded-2xl transition-all duration-300 animate-fade-in-up"
      style={isOpen ? {
        background: 'rgba(224,229,236,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '6px 6px 16px rgba(163,177,198,0.5), -4px -4px 12px rgba(255,255,255,0.88), inset 0 1px 0 rgba(255,255,255,0.7)',
      } : {
        background: '#e0e5ec',
        boxShadow: '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.85)',
      }}
    >
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "Services" | head -10
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/Services.tsx
git commit -m "feat(services): open accordion card uses glass background (active = elevated)"
```

---

## Task 5: Case Studies — industries container → GlassCard

**Files:**
- Modify: `pages/CaseStudies.tsx` (the "Industries We Serve" section)

The outer `neu-raised rounded-2xl p-10` container wrapping the scrolling industry icons becomes a GlassCard, signalling this row as an accent/callout moment rather than a body content card.

- [ ] **Step 1: Verify GlassCard is imported in CaseStudies.tsx**

```bash
grep "import.*GlassCard" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/pages/CaseStudies.tsx"
```

Expected: import is already present (added in previous session).

- [ ] **Step 2: Replace the industries container**

Find in `pages/CaseStudies.tsx`:
```tsx
            <div className="neu-raised rounded-2xl p-10">
              <div className="industries-scroll flex gap-8 items-center overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
```

Replace with:
```tsx
            <GlassCard>
              <div className="industries-scroll flex gap-8 items-center overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
```

And find the closing `</div>` that closes the `neu-raised` div (it's after the `{industries.map(...)}` block closing tag `</div>`):
```tsx
              </div>
            </div>
```

Replace with:
```tsx
              </div>
            </GlassCard>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "CaseStudies" | head -10
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/CaseStudies.tsx
git commit -m "feat(case-studies): industries row container → GlassCard (accent, not body content)"
```

---

## Task 6: About — "Our Philosophy" section header → GlassCard accent

**Files:**
- Modify: `pages/About.tsx` (the philosophy section header `h2`)

The `h2 "Our Philosophy"` currently uses `border-l-4 border-amber-500 pl-4`. We replace it with a GlassCard accent block containing the heading — making the section intro feel elevated and intentional.

- [ ] **Step 1: Verify GlassCard is imported in About.tsx**

```bash
grep "import.*GlassCard" "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org/pages/About.tsx"
```

If not present, add:
```tsx
import GlassCard from '../components/ui/GlassCard';
```

- [ ] **Step 2: Wrap the philosophy section header in a GlassCard**

Find in `pages/About.tsx`:
```tsx
                <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-amber-500 pl-4">Our Philosophy</h2>
```

Replace with:
```tsx
                <GlassCard className="mb-8">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ width: '4px', alignSelf: 'stretch', background: 'linear-gradient(to bottom, #f59e0b, #d97706)', borderRadius: '2px', flexShrink: 0 }}
                    />
                    <div>
                      <span
                        className="block font-bold text-amber-600 mb-0.5"
                        style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}
                      >
                        Our approach
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">Our Philosophy</h2>
                    </div>
                  </div>
                </GlassCard>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "About" | head -10
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/About.tsx
git commit -m "feat(about): Our Philosophy section header → GlassCard accent block"
```

---

## Task 7: Build verification + deploy

**Files:** None created; validates all changes together.

- [ ] **Step 1: Full TypeScript check**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1
```

Expected: zero errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Production build**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npm run build 2>&1 | tail -20
```

Expected: `✓ built in X.XXs` with no errors. Bundle size should be similar to before (no new heavy dependencies added).

- [ ] **Step 3: Deploy via osascript**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git push origin master --no-verify 2>&1"'
```

Expected: `master -> master` success message.

- [ ] **Step 4: Commit plan file**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add docs/superpowers/plans/2026-05-04-hero-glass-refinement.md
git commit -m "docs: add hero & glass refinement implementation plan"
```
