# Frontend Beauty — Design Spec
**Date:** 2026-05-04  
**Scope:** Progressive visual enhancement of Home, About, Services, and Case Studies pages  
**Approach:** Hero-first cascade — implement hero, then replicate motion/glass patterns down through each page  
**Palette:** Existing neumorphic system — background `#e0e5ec`, amber accent `#f59e0b / #d97706`, soft shadows

---

## 1. Shared Design System

### 1.1 Motion tokens
| Token | Value | Usage |
|---|---|---|
| `--ease-smooth` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | All transitions |
| `--float-duration` | `6s` | Float animation on stage |
| `--stagger-base` | `80ms` | Framer Motion stagger increment |
| `--tilt-perspective` | `600–800px` | CSS 3D card scenes |

### 1.2 Shared components to build
These are new reusable components extracted from the designs:

| Component | Description |
|---|---|
| `<SaturnStage>` | Container with 3 animated orbital rings + centre slot (image or content) |
| `<TiltCard>` | CSS 3D perspective wrapper; `mode="static"` (pre-tilted at rest, flattens on hover) or `mode="dynamic"` (tracks mouse position); accepts `children` |
| `<GlassCard>` | Frosted neumorphic card with `backdrop-filter: blur(16px)`, used in hero and CTA |
| `<ScrollReveal>` | Framer Motion wrapper — fades + slides children in on viewport entry |
| `<ParallaxGlow>` | Absolutely positioned radial amber gradient that shifts at 0.15× scroll speed |

All components live in `components/ui/`.

### 1.3 `prefers-reduced-motion`
Every animation (float, orbit, tilt, parallax) must check `prefers-reduced-motion: reduce` and disable itself. Rings render statically; cards do not tilt; scroll reveals are instant.

---

## 2. Home — Hero

### 2.1 Layout
Two-column layout inside a `420px` tall neumorphic container (existing `hero-v7` structure, approved).

- **Left:** `<GlassCard>` with tag, headline, subtitle, two CTAs
- **Right:** `<SaturnStage>` with `stabroek3d.png` (1024×1024 RGBA, transparent background)

### 2.2 Saturn rings
Three concentric orbital rings at z-index 1 (back halves) and z-index 3 (front halves) around the building image at z-index 2. Ring specs:

| Ring | Width | Height | Border | Speed |
|---|---|---|---|---|
| r1 (inner) | 310px | 78px | 3.5px, amber 70% | 8s |
| r2 (mid) | 430px | 108px | 2px, amber 40% | 14s |
| r3 (outer) | 540px | 136px | 1.5px, amber 20% | 22s |

Orbit keyframe: `rotate(0°) scaleY(1)` → `rotate(90°) scaleY(0.12)` → `rotate(180°) scaleY(1)` → full cycle. The scaleY collapse simulates edge-on perspective.

Back/front split via `clip-path: inset(0 0 50% 0)` (back = upper arc) and `clip-path: inset(50% 0 0 0)` (front = lower arc).

### 2.3 Float animation
The entire `<SaturnStage>` bobs: `translateY(-50%)` → `translateY(calc(-50% - 14px))` over 6s ease-in-out infinite.

### 2.4 Asset
`stabroek3d.png` moves from project root to `public/stabroek3d.png`. Reference as `/stabroek3d.png` in the component.

### 2.5 Entrance animation
On page load, Framer Motion animates:
- Tag: `opacity 0→1, y 10→0`, delay 0ms
- Headline: delay 80ms
- Subtitle: delay 160ms
- CTAs: delay 240ms
- Stage: `opacity 0→1, scale 0.92→1`, delay 120ms

---

## 3. About Page — Enhancement

### 3.1 Profile card (CSS 3D tilt)
The existing `neu-card` wrapping Dr. Gravesande's photo and bio gets a `<TiltCard mode="static">` wrapper:
- Initial resting state: `rotateY(-8deg) rotateX(3deg)` — appears angled
- On hover: `rotateY(0deg) rotateX(0deg)` — settles flat, 200ms ease
- Perspective: 800px on the parent scene element
- Amber drop-shadow strengthens on hover

### 3.2 Philosophy items (scroll reveal)
Each of the 4 philosophy grid items wraps in `<ScrollReveal>` with stagger: item 0 at 0ms, item 1 at 80ms, item 2 at 160ms, item 3 at 240ms. Animation: `opacity 0→1, y 20→0` over 500ms.

### 3.3 Parallax glow
A `<ParallaxGlow>` (radial amber gradient, 320×320px, opacity 0.12) is absolutely positioned behind the left (profile) column. Shifts at 0.15× scroll speed using a scroll listener + `transform: translateY`.

### 3.4 No layout changes
The existing grid (`md:col-span-4` + `md:col-span-8`) is preserved exactly. Only motion and depth are added.

---

## 4. Services Page — Enhancement

### 4.1 Accordion behaviour (unchanged)
Existing expand/collapse logic is kept. The visual treatment of the expanded state is enhanced.

### 4.2 Expanded card glass treatment
When a service accordion opens:
- Card shadow upgrades from `neu-card` → `neu-raised` (existing utility)
- Icon wrapper gets `box-shadow: 0 0 14px rgba(245,158,11,0.25)` amber glow (added via CSS class toggle)
- Feature grid chips use a subtle glass pill: `background: rgba(255,255,255,0.4)`, small inset shadow

### 4.3 Flagship badge
The first/primary service item (Compliance Scan) gets an amber `glow-tag` badge with the text "Flagship Service" above the title — `font-size: 9px`, amber tint background.

### 4.4 Scroll reveal
Each accordion item wraps in `<ScrollReveal>` with 80ms stagger. Animation: `opacity 0→1, x -16→0` (slides in from left) over 450ms.

### 4.5 No structural changes
Accordion DOM structure, routing, and state management unchanged.

---

## 5. Case Studies Page — Enhancement

### 5.1 Case study cards (CSS 3D tilt)
Each case study card wraps in `<TiltCard mode="dynamic">`:
- Perspective: 600px
- On mouse-enter: track mouse position and apply `rotateX` (±6°) + `rotateY` (±8°) dynamically
- On mouse-leave: smoothly return to `rotateX(0) rotateY(0)`
- Shadow deepens on hover: raised shadow variant
- Implementation: `onMouseMove` handler calculates offset from card centre, maps to rotation values

### 5.2 CTA card (glass morphism)
The "Ready to be our next success story?" card gets `<GlassCard>` treatment:
- `background: rgba(224,229,236,0.78)`
- `backdrop-filter: blur(16px)`
- Inset highlight border: `1px solid rgba(255,255,255,0.55)`
- Matches hero glass card visually

### 5.3 Industries row (horizontal scroll)
The existing 6-column grid of industry icons converts to a horizontal scroll carousel:
- `overflow-x: auto`, `scroll-snap-type: x mandatory`
- Each icon: `scroll-snap-align: start`, `min-width: 140px`
- Scrollbar hidden via `::-webkit-scrollbar { display: none }`
- On desktop with enough width, all icons are visible without scrolling (no regression)

### 5.4 Scroll reveal
Grid cards stagger in: `opacity 0→1, y 24→0` over 500ms, 80ms between each card.

---

## 6. 3D Technique Distribution

| Page | Technique | Library |
|---|---|---|
| Home hero | Saturn rings (CSS), float (CSS), `stabroek3d.png` transparent PNG | CSS only |
| About | Profile card tilt | CSS 3D (`perspective` + `rotateX/Y`) |
| Services | Glass chips, shadow upgrades | CSS only |
| Case Studies | Mouse-tracking card tilt | CSS 3D + `onMouseMove` |
| Future (About/Services) | Spline 3D accent (optional, lazy-loaded) | Spline runtime |
| Future (Home) | Three.js ambient particles (optional, lazy-loaded) | Three.js |

Spline and Three.js are deferred — not in this implementation plan. The current spec delivers meaningful 3D depth with zero new heavy dependencies.

---

## 7. File changes summary

| File | Change |
|---|---|
| `public/stabroek3d.png` | Move from root (new location) |
| `components/ui/SaturnStage.tsx` | New — rings + float + centre slot |
| `components/ui/TiltCard.tsx` | New — CSS 3D perspective wrapper |
| `components/ui/GlassCard.tsx` | New — frosted neumorphic card |
| `components/ui/ScrollReveal.tsx` | New — Framer Motion scroll-triggered reveal |
| `components/ui/ParallaxGlow.tsx` | New — amber radial parallax accent |
| `pages/Home.tsx` | Replace hero section with new components |
| `pages/About.tsx` | Add `TiltCard`, `ScrollReveal`, `ParallaxGlow` |
| `pages/Services.tsx` | Add glass chip styles, scroll reveal, flagship badge |
| `pages/CaseStudies.tsx` | Add `TiltCard`, `GlassCard` CTA, horizontal scroll industries |
| `src/index.css` | Add `.glow-tag`, `.glass-chip`, `.orbit` keyframe if not inlined |

---

## 8. Out of scope

- Three.js particle field (deferred)
- Spline 3D scenes (deferred)
- Mobile-specific layout changes (responsive polish is follow-up)
- Any page not listed above (Resources, BookScan, Contact, ECourses)
- Backend / Supabase changes
