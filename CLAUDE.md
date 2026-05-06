# Preqal.org — Claude Context File

> Last updated: 2026-05-03

## What this project is

**preqal.org** — the public website and tooling platform for Preqal, a quality/safety/compliance consultancy serving poultry, agri-food, and eco-hospitality businesses.

The repo is a **React + Vite + TypeScript** SPA deployed to GitHub Pages via the `master` branch. The domain is `preqal.org`; CI handles deployment automatically on push.

---

## Tech stack

- **Frontend:** React 18, TypeScript, React Router v6, Tailwind CSS, Framer Motion
- **Build:** Vite (`vite.config.ts`), `npm run dev` (port 3000), `npm run build` → `dist/`
- **Deployment:** GitHub Pages (`master` branch → CI deploy). CNAME: `preqal.org`
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Email:** EmailJS (public key `mijyAm1ocwE6qYCiq`, service `service_qziw5dg`)
- **Analytics:** Google Analytics (via `src/analytics/ga.ts` → `initGA()`)
- **Design system:** Neumorphic — background `#e0e5ec`, soft shadows, amber accent

---

## Repo structure

```
preqal.org/
├── App.tsx                    # Root app — BrowserRouter, AuthProvider, AnimatedRoutes
├── index.tsx                  # ReactDOM entry
├── index.html                 # Vite HTML shell
├── vite.config.ts
├── components/
│   ├── AnimatedRoutes.tsx     # All client-side routes (see Routes section below)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MaturityChart.tsx
│   └── ...
├── pages/                     # One file per route
├── contexts/
│   └── AuthContext.tsx        # Supabase auth context
├── src/
│   ├── analytics/ga.ts
│   └── index.css
├── public/
│   ├── admin-dashboard.html   # ⚠️ Standalone HTML — NOT part of the React SPA
│   ├── client-onboarding.html # Token-based onboarding form
│   ├── funnel.html
│   ├── qms.html
│   ├── employee-onboarding.html
│   └── 404.html               # GitHub Pages SPA redirect hack
└── medical-director-scope-tool-(md-st)/  # Separate Vite app (sub-project)
```

---

## Routes

Defined in `components/AnimatedRoutes.tsx`. Transitions animate forward/backward based on route order.

| Path | Component | Notes |
|---|---|---|
| `/` | `Home` | |
| `/services` | `Services` | |
| `/case-studies` | `CaseStudies` | |
| `/resources` | `Resources` | |
| `/e-courses` | `ECourses` | |
| `/e-courses/register` | `ECourseRegister` | |
| `/e-courses/learn` | `ECourseLearn` | Requires auth |
| `/verify` & `/verify/:certKey` | `ECourseVerifyCertificate` | Not in nav |
| `/about` | `About` | |
| `/book` | `BookScan` | |
| `/contact` | `ContactUs` | |
| `/business-growth-assessment` | `BusinessGrowthAssessment` | Formerly `/quote-classifier` (redirects) |
| `/tools/mdst` | `MDST` | Hidden tool, no Navbar/Footer |
| `/preqal-not-prequel` | `PreqalNotPrequel` | |
| `/privacy-policy` | `PrivacyPolicy` | |
| `/terms-of-service` | `TermsOfService` | |
| `/seo-health` | `SEOHealth` | DEV only |

Routes starting with `/tools/` suppress the Navbar and Footer.

---

## Supabase

**Project ID:** `gndcjmxxgtnoidxgcdnx`  
**URL:** `https://gndcjmxxgtnoidxgcdnx.supabase.co`

### Tables

| Table | Purpose |
|---|---|
| `template_leads` | Lead capture submissions (name, email, company, job_title, phone, most_pressing_quality_problem, source_page, country_iso, dial_code) |
| `ecourse_profiles` | Course participant profiles (linked to `auth.users`) |
| `ecourse_certificates` | Issued certs (cert_key, recipient_name, course_id) |
| `ecourse_module_progress` | Per-user module completion |
| `quote_submissions` | Business Growth Assessment form submissions |
| `crm_clients` | Onboarded clients (CRM) |
| `page_views` | Site traffic analytics |

### Auth

Supabase Auth (`onAuthStateChange`). Admin emails: `stefan.gravesande@gmail.com`, `stefan.gravesande@preqal.org`.

---

## Admin dashboard

`public/admin-dashboard.html` — **standalone HTML file**, not part of the React SPA. Served directly by GitHub Pages at `preqal.org/admin-dashboard.html`.

Tabs: Overview | Leads | Quote Submissions | Course | Traffic | CRM

CRM features: add/edit/delete clients, "Invite Qualified Lead" modal (sends via EmailJS or Gmail draft fallback).

---

## EmailJS

| Key | Value |
|---|---|
| Public Key | `mijyAm1ocwE6qYCiq` |
| Service ID | `service_qziw5dg` (Gmail) |
| Invite Lead template | `template_invlead` |
| Client Onboarding template | `template_clonbrd` |

**⚠️ Templates not yet created in EmailJS dashboard** — Gmail draft fallback is active.  
Create at: `dashboard.emailjs.com/admin/templates → New Template`

Template variables:
- Invite: `{{to_name}}`, `{{company}}`, `{{note}}`, `{{quote_url}}`, `{{to_email}}`
- Onboard: `{{to_name}}`, `{{company_name}}`, `{{onboarding_link}}`, `{{contract_url}}`, `{{to_email}}`

---

## e-Course

**Title:** "Build Systems That Actually Work"  
**Module count:** `TOTAL_MODULES = 8` (placeholder — update in admin dashboard)

---

## Git / deploy workflow

Branch `master` → GitHub → CI → preqal.org

**To commit and push, use osascript** (the sandbox shell can't authenticate with GitHub; Mac keychain credentials are available via osascript):

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git add -A && git commit -m 'your message' && git push origin master --no-verify 2>&1"
```

`--no-verify` is required — git-lfs is configured as a pre-push hook but isn't on the PATH in the shell environment.

---

## Standalone HTML pages in `/public`

These are NOT React routes — they're served directly by GitHub Pages:

- `admin-dashboard.html` — internal ops tool
- `client-onboarding.html` — token-based onboarding form
- `funnel.html` — funnel page
- `qms.html` — QMS page
- `employee-onboarding.html` — employee onboarding

When editing these, remember they embed Supabase JS via CDN and EmailJS via CDN — no bundler involved.

---

## Preqal Brand Design System

> Canonical reference for all UI work. Every page should match these patterns.

### Typeface
- **Rubik only** — no font mixing, ever.
- Weight hierarchy: 400 body · 500 labels/UI · 600 semibold · 700 headings · 800–900 display/hero
- Loaded via Google Fonts (`Rubik:wght@400;500;600;700;800`), applied via Tailwind `font-sans`

### Colours
| Role | Value |
|---|---|
| Page background | `#e0e5ec` |
| Primary amber | `amber-500` `#f59e0b` |
| Amber CTA / dark | `amber-600` `#d97706` |
| Amber glow / stats | `amber-400` `#fbbf24` |
| Dark navy band | `#0f172a` |
| Heading text | `slate-900` |
| Strong body | `slate-700` |
| Body / subtext | `slate-500` |
| Muted labels | `slate-400` |
| Shadow dark | `#a3b1c6` |
| Shadow light | `#ffffff` |

### Shadows (Neumorphic)
```
neu-raised:    6px 6px 12px #a3b1c6,  -6px -6px 12px #ffffff
neu-raised-sm: 3px 3px 6px #a3b1c6,   -3px -3px 6px #ffffff
neu-raised-lg: 10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff
neu-pressed:   inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff
neu-pressed-sm:inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff
photo/glass:   12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)
```

### Glass Cards
- `background: rgba(255,255,255,0.68–0.82)` · `backdropFilter: blur(14–18px)`
- `border: 1–2px solid rgba(255,255,255,0.96)` · `border-radius: 18px (rounded-2xl)`

### Dark Navy Bands (`#0f172a`)
- Used for proof/stats moments and final CTAs
- Always include diagonal texture: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)`
- Optional amber radial glow: `radial-gradient(ellipse at 15% 50%, rgba(217,119,6,0.10) 0%, transparent 55%)`
- Text: white headings · `white/55` body · `amber-400` section labels

### Typography Rhythm
- **Section label:** `text-[11px] font-bold uppercase tracking-widest text-slate-400` (amber-400 on dark)
- **Display heading:** `text-3xl sm:text-4xl md:text-5xl font-bold` (or `font-black` for hero)
- **Italic amber emphasis:** `<em style={{ color: '#d97706' }}>word</em>` — never use a class for this
- **Body:** `text-lg text-slate-500 leading-relaxed`
- **Card title:** `text-lg–xl font-bold text-slate-900`

### Animations (Framer Motion)
- **Scroll reveals:** `<ScrollReveal delay={i * 80–120} yFrom={20}>` for all cards/sections
- **Hero entrance:** `initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}` staggered delays 0.05→0.15→0.28→0.42
- **Card hover:** `whileHover={{ scale:1.025, y:-3, boxShadow:'..elevated...' }}` + spring `stiffness:260, damping:22`
- **Button hover:** `whileHover={{ scale:1.04, y:-2 }}` `whileTap={{ scale:0.97 }}` + `springBtn = { type:'spring', stiffness:340, damping:22 }`
- Never use CSS transitions for interactive elements — always Framer Motion

### CTA Buttons
- **Primary:** `background: linear-gradient(135deg, #f59e0b, #d97706)`, white `font-bold`, `rounded-xl`, neu shadow
- **Hover:** spring to darker amber (`#b45309`), scale up
- **Secondary:** `text-amber-600 font-semibold border-b-2 border-amber-300/50 hover:border-amber-500`

### Image Treatment
- **Phase/section banners:** `height:260px object-cover`, dark left-gradient overlay, amber label bottom-left
- **Hero split image:** `4:5` aspect, `rounded-3xl`, amber+dark gradient wash
- **Photo cards:** image top (fixed height, object-cover), glass panel below
- Always set explicit `width`/`height` attrs and `loading="lazy"` (except LCP image)

### Page Structure Pattern
Every page should follow:
1. **Hero** — label + display heading + subtext + CTAs (split layout with image on desktop where relevant)
2. **Content sections** — ScrollReveal cards with neumorphic or glass treatment
3. **Dark navy band** — proof/stats or emotional storytelling moment
4. **Final CTA band** — dark navy, large heading, primary + secondary CTAs

---

## Key conventions

- **Design:** Neumorphic + glass hybrid. Background `#e0e5ec`. Rubik typeface. Amber accent. See "Preqal Brand Design System" section above.
- **No server-side rendering** — pure SPA + static HTML files + Supabase backend.
- **GitHub Pages SPA hack:** `public/404.html` redirects unknown paths to `index.html` via query string; `App.tsx` `GitHubPagesRedirect` component unwraps it.
- **Canonical domain enforcement** in `App.tsx` — redirects IP addresses and non-canonical subdomains to `https://preqal.org`.
- **Recharts** is manually chunked in `vite.config.ts` to control bundle size.
