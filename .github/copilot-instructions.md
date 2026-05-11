# Preqal.org — Copilot Context

## Stack
React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Supabase · GitHub Pages

## Commands
- `npm run dev` — local dev server (port 3000)
- `npm run build` — production build → `dist/`
- `npm run lint` — ESLint strict (0 warnings allowed — must pass before committing)
- `npm run test:unit` — Vitest unit tests
- `npx playwright test` — e2e smoke tests (runs against live preqal.org)

## Git / Deploy
Push to `master` triggers GitHub Actions → Deploy to GitHub Pages.

**Use osascript for git push** (sandbox cannot authenticate with GitHub):
```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git add -A && git commit -m 'your message' && git push origin master --no-verify 2>&1"
```
`--no-verify` is required — git-lfs pre-push hook is not on PATH in the shell environment.

## Key source files
- `App.tsx` — root: BrowserRouter, AuthProvider, AnimatedRoutes
- `components/AnimatedRoutes.tsx` — all client-side routes
- `lib/supabaseClient.ts` — Supabase client (requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- `lib/ecourseCertificateConstants.ts` — cert key generation, formatting helpers
- `contexts/AuthContext.tsx` — Supabase auth context

## Standalone HTML pages (NOT React routes)
`public/admin-dashboard.html`, `public/qms.html`, `public/client-onboarding.html`, `public/funnel.html`, `public/employee-onboarding.html`
These embed Supabase JS and EmailJS via CDN — no bundler involved. Edit directly.

## Supabase (project: gndcjmxxgtnoidxgcdnx)
Key tables: `qualified_leads`, `crm_clients`, `qms_documents`, `ecourse_profiles`, `ecourse_certificates`
Admin auth emails: `stefan.gravesande@gmail.com` · `stefan.gravesande@preqal.org`
**Never use** `quote_submissions` — it was renamed to `qualified_leads`.

## Design system (neumorphic)
- Background: `#e0e5ec` · Font: **Rubik only** (never mix) · Accent: amber-500 `#f59e0b`
- Shadows: `6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff`
- Interactive elements: **always Framer Motion** — never CSS transitions
- Dark navy bands: `#0f172a` with diagonal texture overlay

## Docs layout
- `docs/guides/` — setup and configuration reference docs
- `docs/course-content/` — Module-1 through Module-9 slide source (used by `scripts/sync-module*.mjs`)
- `docs/superpowers/` — AI design specs and implementation plans

## Hard rules
- Never restructure `components/` or `pages/` without a design doc
- Never use `quote_submissions` (renamed to `qualified_leads`)
- Never use CSS transitions on interactive elements (Framer Motion only)
- Never mix fonts (Rubik only, ever)
- `npm run lint` must pass (0 warnings) before any commit
