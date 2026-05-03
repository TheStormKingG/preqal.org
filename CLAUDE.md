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

## Key conventions

- **Design:** Neumorphic. Background `#e0e5ec`. Soft inset/raised shadows. Amber accent (`amber-500`). Font: Inter (self-hosted).
- **No server-side rendering** — pure SPA + static HTML files + Supabase backend.
- **GitHub Pages SPA hack:** `public/404.html` redirects unknown paths to `index.html` via query string; `App.tsx` `GitHubPagesRedirect` component unwraps it.
- **Canonical domain enforcement** in `App.tsx` — redirects IP addresses and non-canonical subdomains to `https://preqal.org`.
- **Recharts** is manually chunked in `vite.config.ts` to control bundle size.
