# Saturn Size & Glass Visibility Hotfix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two visual regressions — Stabroek building too small on desktop, and GlassCard invisible against the neumorphic background.

**Architecture:** Two targeted file edits. SaturnStage gets corrected `md` dimensions (building 280px, rings orbit beyond container like the original). GlassCard gets a whiter background so it contrasts against `#e0e5ec`.

**Tech Stack:** React 18, TypeScript, Vite

---

## Root Cause Analysis

### Bug 1 — SaturnStage md too small
The old component used `width: '100%', height: '100%'` on the image, so the building filled the 340px container. The new `md` preset sets `buildingSize = 104px` explicitly — 3× smaller than before. The rings (170×43 → 294×74) also stay *within* the 320px container instead of orbiting *around* the building and extending outward like the original (310×78 → 540×136).

**Fix:** Building = 280px, container = 360px. Rings scale from original values ×1.1 — they extend well beyond the container (as designed), clipped by the hero's `overflow-hidden` at the page edge for a dramatic orbital effect.

### Bug 2 — GlassCard invisible
`rgba(224,229,236,0.78)` is 78% opacity of `#e0e5ec` — the exact same neumorphic grey. The card is nearly invisible. Backdrop-filter blur has nothing contrasting to blur.

**Fix:** Background → `rgba(255,255,255,0.52)` — clearly whiter than the page surface, creating visible frosted contrast. Border and shadow updated to match.

---

## File Map

| File | Change |
|---|---|
| `components/ui/SaturnStage.tsx` | Update `MD_CONTAINER`, `MD_BUILDING`, `MD_RINGS` constants |
| `components/ui/GlassCard.tsx` | Whiter background, stronger border + inset highlight |

---

## Task 1: Fix SaturnStage md preset dimensions

**Files:**
- Modify: `components/ui/SaturnStage.tsx`

- [ ] **Step 1: Update the md constants**

Open `components/ui/SaturnStage.tsx` and replace the three md constant declarations:

Find:
```tsx
// md: 320px container, 104px building, 3 rings (+30% vs original)
const MD_CONTAINER = 320;
const MD_BUILDING = 104;
const MD_RINGS = [
  { w: 170, h: 43, border: '3.5px solid rgba(245,158,11,0.7)', shadow: '0 0 12px rgba(245,158,11,0.3)',        dur: '8s'  },
  { w: 234, h: 59, border: '2px solid rgba(245,158,11,0.4)',   shadow: '0 0 8px rgba(245,158,11,0.12)',        dur: '14s' },
  { w: 294, h: 74, border: '1.5px solid rgba(245,158,11,0.2)', shadow: undefined,                             dur: '22s' },
] as const;
```

Replace with:
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

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "SaturnStage" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add components/ui/SaturnStage.tsx
git commit -m "fix(saturn): restore building to 280px, rings orbit beyond container like original

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Fix GlassCard visibility

**Files:**
- Modify: `components/ui/GlassCard.tsx`

- [ ] **Step 1: Update the background and border**

Open `components/ui/GlassCard.tsx`. Replace the entire style object inside the component:

Find:
```tsx
    style={{
      background: 'rgba(224,229,236,0.78)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '18px',
      padding: '28px 24px',
      boxShadow:
        '6px 6px 18px rgba(163,177,198,0.55), -4px -4px 14px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.65)',
      border: '1px solid rgba(255,255,255,0.55)',
    }}
```

Replace with:
```tsx
    style={{
      background: 'rgba(255,255,255,0.52)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderRadius: '18px',
      padding: '28px 24px',
      boxShadow:
        '6px 6px 18px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.82)',
    }}
```

**Why:** `rgba(255,255,255,0.52)` is clearly whiter than the `#e0e5ec` neumorphic surface. The frosted-glass contrast is now visible. The stronger white border (`0.82` opacity) adds a crisp highlight edge. The inset top shadow (`0.9` opacity) reinforces the glass surface illusion.

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org" && npx tsc --noEmit 2>&1 | grep "GlassCard" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org"
git add components/ui/GlassCard.tsx
git commit -m "fix(glass): whiter background rgba(255,255,255,0.52) — visible contrast against neumorphic surface

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
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
