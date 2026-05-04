# Hero & Glass Refinement — Design Spec

**Date:** 2026-05-04  
**Status:** Approved  
**Scope:** Follow-up to the frontend beauty enhancement. Fixes mobile hero visibility, makes the desktop hero full-viewport, resizes Stabroek, and spreads the glass style to accent/active elements sitewide.

---

## Decisions

| Question | Decision |
|---|---|
| Mobile hero layout | **C — Scaled side-by-side**: both glass card and Saturn stage shrink to fit, layout stays horizontal |
| Desktop hero height | **A — Full viewport**: `min-height: calc(100dvh - 64px)` (64px = navbar height) |
| Stabroek size & margin | **B — +30%**: building 104px × 104px, outer ring ~294px, right edge at 56px from container |
| Glass spread system | **Merged**: neumorphic = base/resting surfaces · glass = elevated/active/accent moments |

---

## Glass System Rules

**One principle:** neumorphic is the ground; glass is what floats above it.

| Surface type | Material | Why |
|---|---|---|
| Cards at rest, closed accordions, body content, profile card | Neumorphic | Embedded in page surface |
| Hero overlays, open accordion, CTA blocks, stat callouts, tag pills, section accent intros | Glass | Lifted, active, or accent moments |

### Element-by-element map

**Home**
- Hero left panel → Glass (already done, floats over Saturn)
- Stats bar ("12+ clients, 98% pass rate…") → Glass (new — accent callout)
- Trust panels, service previews below fold → Neumorphic

**Services**
- Open accordion header + body → Glass (new — active = elevated)
- Feature chips inside open accordion → Glass (new — inside elevated state)
- Closed accordion cards → Neumorphic (resting)

**Case Studies**
- Case content cards → Neumorphic (content, not accent)
- Industry tag pills (scrolling row) → Glass (new — accent labels)
- CTA block → Glass (already done)

**About**
- Profile card → Neumorphic (grounded, authoritative)
- "Our approach" section intro block → Glass (new — section accent callout)
- Philosophy items → Neumorphic (body content)

---

## Hero Changes

### Mobile (< 768px) — scaled side-by-side

- Container: `min-height: 260px`, flex row, `align-items: center`, `padding: 14px`
- Glass card: `flex: 1`, `min-width: 0`, compact typography (tag 7px, heading 0.78rem, subtitle 0.55rem, single CTA button)
- Saturn stage: `flex-shrink: 0`, `width: 96px`, building `52px × 52px`, 2 rings only (inner 72×18px, outer 98×25px), no animation on `prefers-reduced-motion`
- Scroll hint: hidden on mobile (space too tight)

### Desktop (≥ 768px) — full viewport

- Container: `min-height: calc(100dvh - 64px)` (64px = navbar height)
- Content centred vertically within container
- Glass card: unchanged at `max-width: 355px`, `left: 36px`
- Saturn stage: building `104px × 104px` (+30%), right edge at `56px` from container edge
  - Ring 1: `170px × 43px`, 8s orbit
  - Ring 2: `234px × 59px`, 14s orbit  
  - Ring 3: `294px × 74px`, 22s orbit
- Scroll hint (amber line + pulsing dot) remains at bottom centre

---

## Component Constraints

- **SaturnStage**: add `size` prop (`'sm' | 'md'`) to support mobile compact variant. `sm` = 52px building, 2 rings. `md` = 104px building, 3 rings (default).
- **GlassCard**: no changes needed — already supports arbitrary children.
- **ScrollReveal, TiltCard, ParallaxGlow**: no changes needed.

---

## Stats Bar (new Home section)

A new row below the hero (above the services section), showing 3 key proof points in a GlassCard:
- "12+ clients served"
- "98% audit pass rate"  
- "3 industries"

Rendered as a flex row of 3 stat items, each with a large amber number and a small label. Animates in via ScrollReveal on scroll.

---

## Non-Goals

- No changes to Navbar, Footer, or pages not listed (ECourses, BookScan, Contact, Resources)
- No new animations beyond what's already implemented
- No changes to backend, routing, or Supabase
- No changes to the existing GlassCard, ScrollReveal, TiltCard, or ParallaxGlow APIs (except SaturnStage `size` prop)

---

## Implementation Tasks (outline)

1. **SaturnStage**: add `size` prop, expose `sm` compact variant (52px building, 2 rings, no float label)
2. **Home hero**: change container height to `calc(100dvh - 64px)`, add responsive mobile layout, update Saturn to size `md` with new dimensions (104px, 56px margin)
3. **Home stats bar**: new GlassCard section with 3 proof-point stats + ScrollReveal
4. **Services**: open accordion state transitions to GlassCard; feature chips use glass chip style
5. **Case Studies**: industry tag pills → glass chip style
6. **About**: "Our approach" intro block → GlassCard wrapper
7. **Build verification**: `npm run build` passes, no TypeScript errors
