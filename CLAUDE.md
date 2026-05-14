# Preqal.org — Claude Context File

> Last updated: 2026-05-08

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

**Docs layout:**
- `docs/guides/` — setup, migration, and configuration reference docs
- `docs/course-content/` — Module-1 through Module-9 slide source folders (used by `scripts/sync-module*.mjs`)
- `docs/superpowers/` — AI design specs and implementation plans

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
| `qualified_leads` | Business Growth Assessment form submissions — **renamed from `quote_submissions` on 2026-05-08**. Added pipeline columns: `selected_steps`, `recommended_tier`, `tier`, `quote_sent_at`, `quote_accepted_at`, `agreement_sent_at`, `onboarding_token`, `notes`, `status`. |
| `crm_clients` | Onboarded clients (CRM). Key columns: `company_name`, `contact_name`, `contact_email`, `pipeline_stage` (enum: prospect/qualified/proposal_sent/negotiating/closed_won/closed_lost), `onboarding_stage` (enum: not_started/welcome/discovery/design/implementation/sign_off/retention/complete), `tier`, `lead_id` (FK → qualified_leads), `qms_active` (boolean, triggers client QMS in admin sidebar). |
| `qms_documents` | QMS document register. `client_id IS NULL` = Preqal's own docs. `client_id = UUID` = that client's IMS docs. Unique on `(doc_id, client_id) NULLS NOT DISTINCT`. |
| `page_views` | Site traffic analytics |

### Key DB functions

| Function | Purpose |
|---|---|
| `get_lead_by_token(p_token uuid)` | SECURITY DEFINER — returns lead data for client-onboarding form (anon-callable) |
| `activate_client_qms(p_client_id uuid)` | Sets `crm_clients.qms_active = true`. Called by client-onboarding.html on submission. Does NOT seed documents — client's IMS is built through a separate process. |

### Auth

Supabase Auth (`onAuthStateChange`). Admin emails: `stefan.gravesande@gmail.com`, `stefan.gravesande@preqal.org`.

---

## Admin dashboard

`public/admin-dashboard.html` — **standalone HTML file**, not part of the React SPA. Served directly by GitHub Pages at `preqal.org/admin-dashboard.html`.

### Layout

Dark navy sidebar (240px, `#0f172a`, sticky) + main content area. Rebuilt 2026-05-08 — NOT a horizontal tab bar.

### Sidebar sections (tab-style — one visible at a time)

| Nav item | `switchSection()` key | Content |
|---|---|---|
| Overview | `overview` | Stat cards (click to jump to section) |
| Lead Submissions | `leads` | `qualified_leads` table |
| Client Pipeline | `quotes` | Pipeline view of qualified leads |
| E-Course | `course` | Course enrolments |
| Traffic | `traffic` | `page_views` analytics |
| CRM Clients | `crm` | Full CRM — add/edit/delete clients |
| Funnel | `funnel` | `/funnel.html` embedded in iframe |
| QMS | — | Opens `/qms.html` in new tab |

### Client QMS (dynamic sidebar section)

Below the main nav items, a **CLIENT QMS** section heading appears. For every `crm_clients` row where `qms_active = true`, a "{Company}'s QMS" nav item is injected dynamically by `loadClientQMS()`. Each item shows a `#section-client-{uuid}` with that client's own `qms_documents` (filtered by `client_id`).

**Key JS functions:**
- `switchSection(section)` — shows/hides main sections + hides all `[id^="section-client-"]`
- `switchClientSection(id, name)` — shows a client QMS section, hides all main sections
- `loadClientQMS()` — fetches `crm_clients WHERE qms_active=true`, injects nav + sections
- `loadClientDocs(clientId)` — renders doc table for a client
- Called after `loadAll()` in `handleSession()`

### CRM features

Add/edit/delete clients, "Invite Qualified Lead" modal (sends via EmailJS or Gmail draft fallback). Client pipeline stages and onboarding stages tracked per client.

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

## Build commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (port 3000) |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | ESLint strict check — must pass before committing |
| `npm run test:unit` | Vitest unit tests |
| `npx playwright test` | E2e smoke tests (runs against live preqal.org) |

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

## IMS Document Branding (POL / PRO DOCX files)

Every POL and PRO document published to `public/ims/` follows the same branded cover + header treatment. These rules are enforced by `scripts/pull-web-edits.cjs` and must be mirrored by any other generator (SOP / Policy skills, manual docs).

### Logo assets
| Asset | File | Used for |
|---|---|---|
| Favicon (hexagon-with-star) | `public/favicon.png` (254×286 px) | Cover page large mark + small mark in page header |
| Wordmark (`PREQAL` text) | `public/ims/assets/preqal-wordmark.png` (240×105 px) | Below the favicon on the cover page |

The wordmark is cropped from `public/Preqal Logo Sep25-9.png`. **Never** stretch — `noChangeAspect="1"` is set on every inline drawing.

### Page header (recurring on every page)
Single paragraph, bottom-border `#E2E8F0`:
- **Top-left:** favicon image, ~22 px wide (~0.23")
- Two spaces, then `PREQAL` (Arial 12pt bold, color `#D97706`)
- Two spaces, dot separator, two spaces, then `— [Doc Title]` (Arial 10pt, color `#64748B`)
- Right-aligned tab + `Confidential — Internal Use Only` (Arial 8pt italic, color `#94A3B8`)

### Cover page (page 1)
In order, all paragraphs in Arial:
1. **Dark navy band** — full-width `#0F172A` paragraph, white bold 11pt: `PREQAL INTEGRATED MANAGEMENT SYSTEM  ·  Controlled Document — Internal Use Only`
2. **Spacer** (24pt)
3. **Favicon image** — centered, ~130 px wide (~1.35")
4. **Wordmark image** — centered, ~220 px wide (~2.29"), 20pt space after
5. **Title** — centered, 22pt Arial bold, color `#0F172A`, format: `<DOC-ID>: <Title>` (e.g. `PRO-06: Client Onboarding`, `POL-01: Quality Policy`)
6. **Subtitle** — centered, 12pt Arial, color `#64748B`. Use `Policy` for POL docs, `Standard Operating Procedure` for PRO docs.
7. **Metadata table** (two columns, dark-navy label cells, white value cells): Document No · Version · Effective Date · Document Owner · ISO Reference · Related Documents · Classification

**Doc ID** on the cover must match the filename prefix (`PRO-XX:` / `POL-XX:`) — **never** `SOP-XX`.

### Body sections (every PRO doc)
Eight canonical sections, in this order: Purpose · Scope · Responsibilities · Definitions · Overview · Procedure · Communication (of this procedure) · Related Documents. Page layout:
- **Page 2** = Purpose + Scope + Responsibilities + Definitions (compact 1.15× line spacing — must all fit on one page)
- **Page 3** = Overview
- **Pages 4+** = Procedure
- **Last page** = Communication + Related Documents

### Body formatting
- Times New Roman 12pt throughout body
- 1.5× line spacing (compact 1.15× for the page-2 sections)
- `<w:keepLines/>` on every paragraph — no paragraph or bullet may split across pages
- Tables: thin grey borders (`#94A3B8`); header rows shaded `#F1F5F9`

---

## Preqal Register Branding (REG-XX Excel files)

Every Excel register published to `public/ims/REG-*.xlsx` (and to Supabase `storage://registers/preqal/`) follows the same branded metadata header. Generators must call `scripts/lib/register-branding.cjs` (Node) or `supabase/functions/sync-register-excel/branding.ts` (Deno) — never inline styling.

### Layout
| Region | Cells | Style |
|---|---|---|
| Favicon | A2:B10 (merged) | `public/favicon.png` inset, white fill |
| Field labels (TITLE / DCN / SCOPE / DATES / VERSION) | C2:C9 | `#FEF3C7` fill, Arial 10pt |
| Field values | D2:D9 | `#FFFBEB` fill, Arial 10pt |
| Big row count | E2:E9 (merged) | `#FEF3C7` fill, Arial 36pt bold navy |
| Breakdown labels / counts | F2:G5 | `#FEF3C7` fill, Arial 10pt |
| Status labels (CREATED / REVISED / APPROVED) | H2:J2 | navy fill, white Arial 9pt bold |
| Status counts | H3:J5 (merged per col) | `#FEF3C7`, Arial 18pt bold |
| Status percentages | H6:J9 (merged per col) | `#FEF3C7`, Arial 10pt bold, format `0.0%` |
| Navy divider | row 10 | `#0F172A`, height 6pt |
| Spacer | row 11 | white, height 6pt |
| Data header | row 12 | navy fill, white Arial 11pt bold, wrap |
| Data rows | row 13+ | alternate white / `#F8FAFC`, Arial 10pt |

Freeze panes: `B13` (metadata block + data header always visible).

### Live registers vs hand-curated
- **Live** (auto-regenerated on every row change via Supabase triggers — see `supabase/migrations/20260514_register_triggers.sql`): REG-01 (qms_documents, filtered to `client_id IS NULL`), REG-02 (qualified_leads), REG-10 (crm_clients)
- **Hand-curated** (regenerated only via `node scripts/generate-excel-registers.cjs REG-XX`): REG-03 (Context), REG-04 (Employee), REG-05 (HSE Risk), REG-06 (Internal Audit), REG-07 (NCR & CAPA), REG-08 (Quality Risk), REG-09 (Legal)

### Single source of truth
`scripts/lib/register-defs.cjs` lists every REG-XX with its DCN, scope, Supabase table (if live), breakdown grouping column, and complete column→source map. Adding a new register = one entry there + (if live) a trigger in `supabase/migrations/`. The Deno Edge Function mirrors the same metadata in `supabase/functions/sync-register-excel/index.ts` (legacy short keys like `docs`, `context` still work for the existing `qms.html` front-end; new REG-XX keys added as aliases).

### Live-sync pipeline (push)
1. Row INSERT/UPDATE/DELETE on `qms_documents` / `qualified_leads` / `crm_clients` fires `regen_register_async('REG-XX')` via Postgres trigger.
2. `regen_register_async` POSTs to the `sync-register-excel` Edge Function via `pg_net.http_post`, including the service-role JWT in the Authorization header.
3. The function fetches current rows, renders the branded XLSX, uploads to `storage://registers/preqal/REG-XX-*.xlsx` (`upsert: true`).

### Local-sync pipeline (pull)
`scripts/sync-registers-local.cjs` (cron'd every 5 min via `org.preqal.sync-ims` launchd job → `scripts/run-sync.sh`) mirrors Supabase Storage into `Preqal QMS/06 - Registers/`. No code change needed for new registers — the script lists all `registers/preqal/*.xlsx` and downloads them.

### Manual regeneration
```bash
# Rebuild + upload one register to Storage
source .env.secrets
node scripts/regenerate-register.cjs REG-02

# Rebuild ALL registers locally (no Storage upload, no Supabase auth needed for hand-curated)
node scripts/generate-excel-registers.cjs

# Rebuild just one local register
node scripts/generate-excel-registers.cjs REG-05
```

### Deploy guide
See `docs/guides/register-live-sync-deploy.md` for the one-time setup (migration push, function deploy, GUC settings for `app.regen_url` + `app.regen_auth_token`, storage bucket precondition).

---

## QMS (`public/qms.html`)

Standalone HTML served at `preqal.org/qms.html`. Rebuilt 2026-05-08 with dark navy sidebar layout matching admin dashboard.

### Sidebar sections (tab-style)

| Nav item | `switchTab()` key | Notes |
|---|---|---|
| Dashboard | `dashboard` | **Default on load.** 9 stat cards + Organisation Chart |
| Documents | `docs` | Document register |
| Context | `org` | Context of the Organisation |
| Employees | `emp` | Employee register |
| Legal | `legal` | Legal & Compliance obligations |
| Quality Risks | `qr` | Quality Risk Register |
| HSE Risks | `hse` | HSE Risk Register |
| Non-Conformances | `ncr` | NCR register |
| CAPA | `capa` | CAPA register |
| Audits | `audit` | Audit schedule |

**Key pattern:** `switchTab(tab)` iterates `TABS` array, shows `#section-{tab}`, hides all others, updates topbar title via `TAB_TITLES` map. Nav buttons use `id="tab-{key}"`.

The stat cards (on the Dashboard section) each call `switchTab('X')` to navigate to the relevant section.

---

## Key conventions

- **Design:** Neumorphic + glass hybrid. Background `#e0e5ec`. Rubik typeface. Amber accent. See "Preqal Brand Design System" section above.
- **Standalone HTML pages** (`admin-dashboard.html`, `qms.html`, etc.) use dark navy sidebar layout — NOT the old horizontal tab bar. Both use the same sidebar CSS pattern.
- **No server-side rendering** — pure SPA + static HTML files + Supabase backend.
- **GitHub Pages SPA hack:** `public/404.html` redirects unknown paths to `index.html` via query string; `App.tsx` `GitHubPagesRedirect` component unwraps it.
- **Canonical domain enforcement** in `App.tsx` — redirects IP addresses and non-canonical subdomains to `https://preqal.org`.
- **Recharts** is manually chunked in `vite.config.ts` to control bundle size.
- **`quote_submissions` is gone** — always use `qualified_leads`. Any old references to `quote_submissions` in code are bugs.

---

## Migration history (2026-05-08)

| Migration file | What it does |
|---|---|
| `supabase/migrations/20260508_qualified_leads.sql` | Renames `quote_submissions` → `qualified_leads`, adds pipeline columns, creates `get_lead_by_token()`, creates `pdf-temp` storage bucket, inserts REG-02 doc, adds `lead_id` FK to `crm_clients` |
| `supabase/migrations/20260508_client_qms.sql` | Adds `qms_active boolean` to `crm_clients`, adds `client_id uuid` to `qms_documents`, creates `activate_client_qms()` |
| `supabase/migrations/20260508_client_qms_fix_doc_id_constraint.sql` | Replaces `UNIQUE(doc_id)` on `qms_documents` with `UNIQUE NULLS NOT DISTINCT (doc_id, client_id)` — allows each client to have their own IMS docs with the same doc IDs |
| `supabase/migrations/20260508_client_qms_no_seed.sql` | Simplifies `activate_client_qms()` to only set the flag — no doc seeding |
