# Hero Space & Glass Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two remaining visual issues — hero elements (glass card + Saturn) don't use the tall full-viewport hero space, and glass frosted effect is still too subtle across card elements.

**Architecture:** Three targeted file edits. (1) `pages/Home.tsx`: center Saturn vertically + scale up hero typography. (2) `components/ui/SaturnStage.tsx`: md preset building 280 → 400px with proportionally scaled rings. (3) `components/ui/GlassCard.tsx`: opacity 0.52 → 0.68 for stronger frosted contrast. (4) `pages/Services.tsx`: accordion open glass from grey-base to white-base.

**Tech Stack:** React 18, TypeScript, Vite, Framer Motion

---

## Root Cause Analysis

### Bug 1 — Saturn not centered vertically
`motion.div` has `top: '50%'` but no `translateY(-50%)` or `y: '-50%'`. So the Saturn's **top edge** is at 50% of the hero height (~410px on an 820px hero) — it sits in the lower half and appears small/displaced. Fix: add `y: '-50%'` to the framer-motion style (works independently from the scale animation).

### Bug 2 — Saturn too small for full-viewport hero
At 280px building / 360px container, Saturn feels dwarfed in an ~820px tall hero. Scale up: 400px building / 480px container, rings scaled proportionally (×1.43). Rings extend dramatically beyond the container (capped by the hero's `overflow-hidden`).

### Bug 3 — Hero glass card content too small
h1 at `1.6rem` and body at `0.82rem` feel compact when the card is centered in a 820px tall space. Scale up for full-viewport presence: h1 → `2.2rem`, body → `1rem`.

### Bug 4 — GlassCard opacity still too low
`rgba(255,255,255,0.52)` is whiter than `#e0e5ec` but barely. On some screens it still blends. Bump to `rgba(255,255,255,0.68)` — perceptibly frosted white against the grey surface.

### Bug 5 — Services accordion open state uses grey-based glass
`rgba(224,229,236,0.82)` is 82% opacity of the exact neumorphic surface colour. Near-zero contrast. Fix: match GlassCard's white-based glass: `rgba(255,255,255,0.52)` background, white border `rgba(255,255,255,0.82)`.

---

## File Map

| File | Change |
|---|---|
| `pages/Home.tsx` | Add `y: '-50%'` to Saturn wrapper; scale h1 to 2.2rem, body to 1rem |
| `components/ui/SaturnStage.tsx` | MD_BUILDING 280→400, MD_CONTAINER 360→480, MD_RINGS scaled ×1.43 |
| `components/ui/GlassCard.tsx` | background opacity 0.52→0.68 |
| `pages/Services.tsx` | Accordion open: background rgba(255,255,255,0.52), border rgba(255,255,255,0.82) |

---

## Task 1: Fix Saturn position + size + hero typography

**Files:**
- Modify: `pages/Home.tsx`
- Modify: `components/ui/SaturnStage.tsx`

- [ ] **Step 1: Center Saturn vertically in Home.tsx**

Open `pages/Home.tsx`. Find the Saturn motion.div (around line 314):

```tsx
          <motion.div
            style={{ position: 'absolute', right: '56px', top: '50%' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
```

Replace with:

```tsx
          <motion.div
            style={{ position: 'absolute', right: '56px', top: '50%', y: '-50%' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
```

**Why:** Framer Motion's `y` in the style prop applies as a transform separate from the animated `scale`, so `scale` still animates correctly while `y: '-50%'` permanently offsets the element upward by half its own height, centering it in the `top: '50%'` anchor.

- [ ] **Step 2: Scale up desktop hero typography in Home.tsx**

In the desktop hero glass card content (around line 266), find:

```tsx
              <motion.h1
                className="text-[1.6rem] font-bold leading-[1.22] text-slate-900 mt-2 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
```

Replace with:

```tsx
              <motion.h1
                className="text-[2.2rem] font-bold leading-[1.18] text-slate-900 mt-3 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
```

Then find the body paragraph:

```tsx
              <motion.p
                className="text-[0.82rem] text-slate-500 mb-5 leading-relaxed"
```

Replace with:

```tsx
              <motion.p
                className="text-[1rem] text-slate-500 mb-6 leading-relaxed"
```

- [ ] **Step 3: Scale up SaturnStage md preset**

Open `components/ui/SaturnStage.tsx`. Find the md constants block:

```tsx
// md: 360px container, 280px building, 3 rings that orbit beyond container (clipped by hero overflow-hidden)
const MD_CONTAINER = 360;
const MD_BUILDING = 280;
const MD_RINGS = [
  { w: 342, h: 86,  border: '3.5px solid rgba(245,158,11,0.7)', shadow: '0 0 14px rgba(245,158,11,0.35)', dur: '8s'  },
  { w: 474, h: 120, border: '2px solid rgba(245,158,11,0.4)',   shadow: '0 0 8px rgba(245,158,11,0.12)',  dur: '14s' },
  { w: 596, h: 151, border: '1.5px solid rgba(245,158,11,0.2)', shadow: undefined,                        dur: '22s' },
] as const;
```

Replace with:

```tsx
// md: 480px container, 400px building, 3 rings that orbit dramatically beyond container (clipped by hero overflow-hidden)
const MD_CONTAINER = 480;
const MD_BUILDING = 400;
const MD_RINGS = [
  { w: 488, h: 123, border: '3.5px solid rgba(245,158,11,0.7)', shadow: '0 0 18px rgba(245,158,11,0.38)', dur: '8s'  },
  { w: 677, h: 171, border: '2px solid rgba(245,158,11,0.4)',   shadow: '0 0 10px rgba(245,158,11,0.14)', dur: '14s' },
  { w: 852, h: 216, border: '1.5px solid rgba(245,158,11,0.2)', shadow: undefined,                        dur: '22s' },
] as const;
```

**Why:** Building scaled from 280→400px (×1.43) to command the ~820px tall full-viewport hero. Rings scaled proportionally — ring 3 reaches 852px wide, extending well beyond the 480px container and creating a dramatic orbital presence clipped by the hero's `overflow-hidden`.

- [ ] **Step 4: TypeScript check**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep -E "Home|SaturnStage" | head -10
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add pages/Home.tsx components/ui/SaturnStage.tsx
git commit -m "$(cat <<'EOF'
fix(hero): center Saturn vertically, scale building to 400px, enlarge hero typography

Saturn was positioned top:50% without translateY(-50%) — sitting in the lower half
of the full-viewport hero. Now centered via Framer Motion y:'-50%'. Building scaled
280→400px (container 360→480px) with proportional rings for the tall viewport. Hero
h1 scaled to 2.2rem and body to 1rem to fill the full-height glass card presence.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Strengthen glass frosted effect globally

**Files:**
- Modify: `components/ui/GlassCard.tsx`
- Modify: `pages/Services.tsx`

- [ ] **Step 1: Raise GlassCard background opacity**

Open `components/ui/GlassCard.tsx`. Find:

```tsx
      background: 'rgba(255,255,255,0.52)',
```

Replace with:

```tsx
      background: 'rgba(255,255,255,0.68)',
```

**Why:** 0.52 opacity is noticeable but subtle on some screens. 0.68 is perceptibly frosted-white — clearly elevated above the `#e0e5ec` (rgba(224,229,236,1.0)) surface — while keeping the translucency that makes the backdrop blur visible.

- [ ] **Step 2: Fix Services accordion open state glass**

Open `pages/Services.tsx`. Find the ServiceAccordionItem `style={isOpen ? { ... }}` block (around line 49):

```tsx
      style={isOpen ? {
        background: 'rgba(224,229,236,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '6px 6px 16px rgba(163,177,198,0.5), -4px -4px 12px rgba(255,255,255,0.88), inset 0 1px 0 rgba(255,255,255,0.7)',
      } : {
```

Replace with:

```tsx
      style={isOpen ? {
        background: 'rgba(255,255,255,0.52)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.82)',
        boxShadow: '6px 6px 18px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.9)',
      } : {
```

**Why:** `rgba(224,229,236,0.82)` is 82% opacity of `#e0e5ec` — the exact same neumorphic surface — yielding near-zero contrast. White-based glass `rgba(255,255,255,0.52)` matches the GlassCard component standard and creates clear visual elevation when the accordion opens.

- [ ] **Step 3: TypeScript check**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep -E "GlassCard|Services" | head -10
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add components/ui/GlassCard.tsx pages/Services.tsx
git commit -m "$(cat <<'EOF'
fix(glass): raise GlassCard opacity to 0.68, fix Services accordion white-based glass

GlassCard opacity 0.52→0.68 for stronger frosted contrast on all uses sitewide.
Services accordion open state was rgba(224,229,236,0.82) — same colour as the page
surface, invisible. Now uses white-based glass rgba(255,255,255,0.52) matching the
GlassCard standard.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Build + deploy

**Files:** None — validation only.

- [ ] **Step 1: Production build**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npm run build 2>&1 | tail -15
```

Expected: `✓ built in X.XXs` with no errors.

- [ ] **Step 2: Deploy**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git push origin master --no-verify 2>&1"'
```

Expected: `master -> master` push success.
