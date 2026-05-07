# SOP-01: Marketing & Lead Generation

**Document No:** SOP-01
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.2.1 (Customer Communication)
**Related Documents:** DIA-01, FORM-01, SOP-02

---

## 1. Purpose

To define how Preqal attracts, engages, and directs qualified prospects toward the lead capture entry point (FORM-01). This SOP ensures all marketing activity is consistent with the Preqal brand, produces measurable results, and feeds a healthy, qualified pipeline.

---

## 2. Scope

Applies to all inbound and outbound marketing activities including: website content, blog posts, resource downloads, social media, SEO, referrals, and direct outreach. Applies to human staff and any agentic worker executing marketing tasks.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Prospect | Any individual or organisation that has not yet submitted FORM-01 |
| Lead | A prospect who has submitted FORM-01 |
| MQL (Marketing Qualified Lead) | A lead whose form responses indicate a genuine service need and budget potential |
| Inbound | Prospect contacts Preqal first (via website, referral, search) |
| Outbound | Preqal contacts the prospect first (direct outreach, networking) |
| CTA | Call to Action — a button, link, or phrase directing the prospect to take the next step |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande (Principal) | Approves all published content; leads outbound outreach; owns brand voice |
| Marketing Staff (if applicable) | Drafts content, manages social media scheduling, monitors analytics |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Content Agent | Drafts blog posts, social media captions, resource descriptions on instruction |
| SEO Agent | Audits on-page SEO, suggests metadata improvements, identifies keyword gaps |
| Analytics Agent | Pulls GA4 traffic data weekly; flags pages with high bounce or declining traffic |

> **Agentic note:** No content may be published without explicit approval from Dr. Gravesande. Agents DRAFT and SURFACE — they do not publish autonomously.

---

## 5. Process Overview

Marketing at Preqal operates on three parallel tracks:

**Track A — Organic / Content:** Website pages, blog posts on `/resources`, downloadable templates, and SEO optimisation drive search-engine-led discovery. The Resources page template download form doubles as a soft lead capture.

**Track B — Referral & Network:** Satisfied clients and professional contacts refer prospects directly. Every project closure (SOP-07) includes an explicit ask for referrals.

**Track C — Direct Outreach:** Targeted outreach to businesses in Preqal's core sectors (poultry, agri-food, eco-hospitality, oil & gas, construction) via LinkedIn and professional networks.

All three tracks have a single destination: the **Business Growth Assessment (FORM-01)** at `preqal.org/business-growth-assessment`.

---

## 6. Procedure

### Step 1 — Maintain Website as Primary Marketing Asset

1.1. Verify all CTAs on every page link to `/business-growth-assessment` or `/book`.
1.2. Confirm the homepage hero CTA reads "Get a Free Risk Scan" or equivalent.
1.3. Confirm the Navbar CTA button is visible and links to `/book`.
1.4. Review Google Analytics monthly (or use Analytics Agent): check traffic sources, top pages, and conversion events.

**Quality check:** At least one primary CTA must appear above the fold on every service-related page.

---

### Step 2 — Publish Resources to Build Trust

2.1. Target: minimum 1 new resource (template, guide, or checklist) per month.
2.2. Each resource page must include the template download form (which captures email and company).
2.3. Blog posts on `/resources` must target at least one long-tail keyword relevant to Preqal's sectors.
2.4. Every resource must end with a CTA linking to FORM-01.

**Agentic instruction:** When drafting a resource, the final paragraph must always include the sentence: *"Ready to take the next step? Complete a free Business Growth Assessment at preqal.org."*

---

### Step 3 — Manage Referral Requests

3.1. At project closure (see SOP-07 Step 7), Dr. Gravesande sends a personal message to the client asking: *"If you know anyone who would benefit from what we've built together, I'd be grateful for an introduction."*
3.2. All referred prospects are directed to FORM-01.
3.3. Log the referring client's name in the lead's Supabase record (field: `referral_source`).

---

### Step 4 — Execute Direct Outreach (Optional / Seasonal)

4.1. Identify target companies via LinkedIn (sectors: poultry, agri-food, eco-hospitality, construction, oil & gas).
4.2. Connection request → 3-day wait → personalised message referencing a specific pain point.
4.3. Outreach message must not pitch services directly — it must invite the prospect to the free Business Growth Assessment.
4.4. Log all outreach contacts in the Lead Register (REG-02) with status: `outreach-sent`.

---

### Step 5 — Monitor and Adjust Monthly

5.1. Pull monthly report from Google Analytics: sessions, bounce rate, form completions on `/business-growth-assessment`.
5.2. If form completion rate drops below 2% of page visitors, review the page copy and CTA placement.
5.3. Review the Resources page: identify highest-download templates and prioritise similar content.

---

## 7. Inputs

- Preqal brand guidelines (CLAUDE.md design system)
- Google Analytics data
- Client feedback and testimonials (from SOP-09)

## 8. Outputs

- Qualified prospects directed to FORM-01
- Published content on preqal.org
- Monthly marketing performance summary

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Monthly website sessions | Growth MoM | Monthly |
| Form 1 completion rate | ≥ 2% of BGA page visitors | Monthly |
| Time from lead submission to first contact | ≤ 4 hours | Per lead |
| New resources published | ≥ 1 per month | Monthly |
| Referral leads as % of total | ≥ 20% | Quarterly |

---

## 10. Non-Conformance Handling

If a marketing channel is producing zero qualified leads for 2+ consecutive months:
1. Flag in the Non-Conformance Register (REG-06) as a quality event.
2. Conduct root cause analysis — is the problem: messaging, targeting, CTA placement, or content quality?
3. Implement corrective action within 14 days.
4. Review effectiveness at next monthly report.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
