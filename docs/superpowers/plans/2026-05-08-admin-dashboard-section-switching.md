# Admin Dashboard — Section Switching Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken scroll-based navigation with tab-style section switching so only one section is visible at a time — exactly like `switchTab()` in `qms.html`.

**Architecture:** Root cause is `#section-overview` acting as the outer container for all sections. Fix: (1) restructure so each section is a sibling div, (2) add `display:none` to non-default sections, (3) replace `scrollTo()+setNavActive()` with a single `switchSection()` function that mirrors QMS's `switchTab()`, (4) update every nav item and stat card onclick to call it, (5) update topbar title on switch.

**Tech Stack:** Vanilla JS, HTML/CSS — standalone file `public/admin-dashboard.html`. No build step — edits go live on deploy.

---

## File Map

| File | Change |
|---|---|
| `public/admin-dashboard.html` | Restructure section HTML, add `display:none` defaults, replace nav functions, update topbar title |

---

### Task 1: Restructure the section HTML — fix the container/section confusion

**Files:**
- Modify: `public/admin-dashboard.html` (around line 260)

**Context:**  
Currently `#section-overview` wraps ALL sections:
```html
<div id="section-overview" class="max-w-6xl mx-auto space-y-14">
  <!-- stats cards -->
  <div id="section-leads" class="section-anchor fade-in">...</div>
  <div id="section-quotes" class="section-anchor fade-in">...</div>
  <div id="section-course" class="section-anchor fade-in">...</div>
  <div id="section-traffic" class="section-anchor fade-in">...</div>
  <div id="section-crm" class="section-anchor fade-in pb-16">...</div>
</div>
```

The container needs to become a plain wrapper div, and the stats need their own `#section-overview`.

- [ ] **Step 1: Replace the outer `#section-overview` opening tag with a plain container + wrap stats in their own section div**

Find (line ~260):
```html
      <div id="section-overview" class="max-w-6xl mx-auto space-y-14">

      <!-- ── OVERVIEW STATS ── -->
      <div class="fade-in">
```

Replace with:
```html
      <div class="max-w-6xl mx-auto">

      <!-- ── OVERVIEW STATS ── -->
      <div id="section-overview" class="fade-in">
```

- [ ] **Step 2: Close the overview stats section before `section-leads` begins**

Find (line ~276 — the blank line just before `<!-- ── LEADS ──`):
```html
        </div>
      </div>

      <!-- ── LEADS ── -->
      <div id="section-leads" class="section-anchor fade-in">
```

Replace with:
```html
        </div>
      </div><!-- /section-overview -->

      <!-- ── LEADS ── -->
      <div id="section-leads" class="section-anchor fade-in" style="display:none">
```

- [ ] **Step 3: Add `display:none` to the remaining hidden sections**

Find:
```html
      <div id="section-quotes" class="section-anchor fade-in">
```
Replace with:
```html
      <div id="section-quotes" class="section-anchor fade-in" style="display:none">
```

Find:
```html
      <div id="section-course" class="section-anchor fade-in">
```
Replace with:
```html
      <div id="section-course" class="section-anchor fade-in" style="display:none">
```

Find:
```html
      <div id="section-traffic" class="section-anchor fade-in">
```
Replace with:
```html
      <div id="section-traffic" class="section-anchor fade-in" style="display:none">
```

Find:
```html
      <div id="section-crm" class="section-anchor fade-in pb-16">
```
Replace with:
```html
      <div id="section-crm" class="section-anchor fade-in pb-16" style="display:none">
```

- [ ] **Step 4: Verify the HTML structure is correct**

```bash
grep -n "id=\"section-" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html | head -10
```

Expected: 6 lines — `section-overview`, `section-leads`, `section-quotes`, `section-course`, `section-traffic`, `section-crm` — all present.

---

### Task 2: Replace `scrollTo` + `setNavActive` with `switchSection()` and wire up all handlers

**Files:**
- Modify: `public/admin-dashboard.html` (JS section, nav item buttons, stat card buttons)

**Context:**  
The current JS has two separate functions that must be called together (`scrollTo()+setNavActive(this)`), doesn't update the topbar title, and doesn't hide/show sections. Replace with a single `switchSection()` that mirrors QMS's `switchTab()`.

- [ ] **Step 1: Replace `scrollTo()` and `setNavActive()` with `switchSection()`**

Find (line ~764):
```javascript
// ── SCROLL TO SECTION ──────────────────────────────────────────────────────
function scrollTo(section) {
  const el=document.getElementById('section-'+section);
  if(el)el.scrollIntoView({behavior:'smooth'});
}
function setNavActive(btn){
  document.querySelectorAll('#sidebar .nav-item').forEach(n=>n.classList.remove('active'));
  if(btn)btn.classList.add('active');
}
```

Replace with:
```javascript
// ── SECTION SWITCHING ──────────────────────────────────────────────────────
const SECTIONS=['overview','leads','quotes','course','traffic','crm'];
const SECTION_TITLES={overview:'Admin Dashboard',leads:'Lead Submissions',quotes:'Client Pipeline',course:'E-Course',traffic:'Traffic',crm:'CRM Clients'};
function switchSection(section){
  SECTIONS.forEach(s=>{
    const el=document.getElementById('section-'+s);
    if(el)el.style.display=s===section?'block':'none';
  });
  document.querySelectorAll('#sidebar button.nav-item').forEach(n=>{
    n.classList.toggle('active',n.dataset.section===section);
  });
  const tt=document.getElementById('topbar-title');
  if(tt)tt.textContent=SECTION_TITLES[section]||'Admin Dashboard';
  const mw=document.getElementById('main-wrapper');
  if(mw)mw.scrollTop=0;
}
```

- [ ] **Step 2: Add `data-section` attributes to sidebar nav buttons and update their `onclick`**

Find all 6 nav item buttons (lines ~195–218). Replace each `onclick` to use `switchSection()` and add `data-section`:

```html
<!-- Overview -->
<button class="nav-item active" data-section="overview" onclick="switchSection('overview')">
```
```html
<!-- Lead Submissions -->
<button class="nav-item" data-section="leads" onclick="switchSection('leads')">
```
```html
<!-- Client Pipeline -->
<button class="nav-item" data-section="quotes" onclick="switchSection('quotes')">
```
```html
<!-- E-Course -->
<button class="nav-item" data-section="course" onclick="switchSection('course')">
```
```html
<!-- Traffic -->
<button class="nav-item" data-section="traffic" onclick="switchSection('traffic')">
```
```html
<!-- CRM Clients -->
<button class="nav-item" data-section="crm" onclick="switchSection('crm')">
```

The exact old strings to find and replace one by one:

Find:
```html
      <button class="nav-item active" onclick="scrollTo('overview');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item active" data-section="overview" onclick="switchSection('overview')">
```

Find:
```html
      <button class="nav-item" onclick="scrollTo('leads');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item" data-section="leads" onclick="switchSection('leads')">
```

Find:
```html
      <button class="nav-item" onclick="scrollTo('quotes');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item" data-section="quotes" onclick="switchSection('quotes')">
```

Find:
```html
      <button class="nav-item" onclick="scrollTo('course');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item" data-section="course" onclick="switchSection('course')">
```

Find:
```html
      <button class="nav-item" onclick="scrollTo('traffic');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item" data-section="traffic" onclick="switchSection('traffic')">
```

Find:
```html
      <button class="nav-item" onclick="scrollTo('crm');setNavActive(this)">
```
Replace:
```html
      <button class="nav-item" data-section="crm" onclick="switchSection('crm')">
```

- [ ] **Step 3: Update stat card `onclick` handlers to call `switchSection()` instead of `scrollTo()`**

The stat cards are on lines ~268–273. Each one has `onclick="scrollTo('X')"`. Replace all 6:

Find:
```html
onclick="scrollTo('leads')"
```
Replace (first occurrence — Leads card):
```html
onclick="switchSection('leads')"
```

Find:
```html
onclick="scrollTo('quotes')"
```
Replace:
```html
onclick="switchSection('quotes')"
```

Find (first occurrence):
```html
onclick="scrollTo('course')"
```
Replace with `replace_all: false` — only the Enrolled card (first):
```html
onclick="switchSection('course')"
```

The second `onclick="scrollTo('course')"` (Certified card) also needs replacing. Since both should navigate to E-Course, after the first replacement find the remaining one:

Find:
```html
<div class="neu-card rounded-2xl p-4 stat-card" onclick="switchSection('course')"><svg width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="1.8" viewBox="0 0 24 24" style="margin-bottom:6px"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg><div class="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Certified</div>
```

Wait — looking again at the HTML, both Enrolled and Certified call `scrollTo('course')`. After step 3's first replacement, only one will have `scrollTo` and the other will already have `switchSection`. Let me use `replace_all: true` on `onclick="scrollTo('course')"` since both should go to `switchSection('course')`:

Use `replace_all: true` for:
```
onclick="scrollTo('course')"
```
→
```
onclick="switchSection('course')"
```

Then individually fix `scrollTo('crm')` and `scrollTo('traffic')`:

Find:
```html
onclick="scrollTo('crm')"
```
Replace:
```html
onclick="switchSection('crm')"
```

Find:
```html
onclick="scrollTo('traffic')"
```
Replace:
```html
onclick="switchSection('traffic')"
```

- [ ] **Step 4: Verify no `scrollTo` or `setNavActive` calls remain in nav/stat-card HTML**

```bash
grep -n "scrollTo\|setNavActive" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html | grep -v "function scrollTo\|function setNavActive\|\/\/"
```

Expected: no output (all onclick uses replaced; the old functions are gone).

- [ ] **Step 5: Verify `switchSection` and `SECTIONS` exist**

```bash
grep -n "switchSection\|SECTION_TITLES\|data-section" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html | head -15
```

Expected: `switchSection` defined once in JS, referenced 6× in nav items and 6× in stat cards; `SECTION_TITLES` defined once; `data-section` on all 6 nav buttons.

- [ ] **Step 6: Commit**

```bash
osascript -e 'do shell script "cd '"'"'/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org'"'"' && git add public/admin-dashboard.html && git commit -m \"fix(admin): implement tab-style section switching — one section visible at a time\" && git push origin master --no-verify 2>&1"'
```

Expected output: `master -> master` push confirmed.

---

### Task 3: Smoke test — verify section switching works

**Files:** (no changes — verification only)

- [ ] **Step 1: Confirm all 6 section IDs exist and 5 have `display:none`**

```bash
grep -n "id=\"section-" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html
```

Expected:
- `section-overview` — no `display:none` (visible by default)
- `section-leads` — has `display:none`
- `section-quotes` — has `display:none`
- `section-course` — has `display:none`
- `section-traffic` — has `display:none`
- `section-crm` — has `display:none`

- [ ] **Step 2: Confirm `switchSection` in JS has all 6 sections in the SECTIONS array**

```bash
grep -A2 "const SECTIONS=" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html
```

Expected: `['overview','leads','quotes','course','traffic','crm']`

- [ ] **Step 3: Confirm all 6 nav buttons have `data-section` attribute**

```bash
grep "data-section" /Users/stefangravesande/Documents/Projects/Preqal\ 2027/Apps/preqal.org/public/admin-dashboard.html
```

Expected: 6 lines with `data-section="overview"`, `data-section="leads"`, etc.
