# SOP-02: Lead Capture & Classification

**Document No:** SOP-02
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.2.2 (Determining Requirements), 8.2.3 (Review of Requirements)
**Related Documents:** DIA-01, FORM-01, REG-02, SOP-01, SOP-03

---

## 1. Purpose

To ensure every prospect who expresses interest in Preqal's services is captured in a structured, consistent format, automatically classified into a service tier, and routed to the appropriate follow-up action within 4 hours.

---

## 2. Scope

Applies to all lead submissions via FORM-01 (Business Growth Assessment). Covers the full lifecycle from form submission to admin review and handoff to SOP-03 (Quote Generation).

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| FORM-01 | The Business Growth Assessment — the single digital form at `/business-growth-assessment` that captures all lead and classification data |
| Tier | Service level classification: Starter / Growth / Enterprise |
| Admin Dashboard | The tool at `preqal.org/admin-dashboard.html` used to view and manage all leads |
| Supabase | The backend database where all lead data is stored |
| `template_leads` | Supabase table storing contact and company information |
| `quote_submissions` | Supabase table storing service classification and tier assessment |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Admin (Dr. Gravesande or delegate) | Reviews all incoming leads within 4 hours; confirms or adjusts auto-tier; initiates SOP-03 |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Lead Triage Agent | Monitors `template_leads` table for new entries; reads the `most_pressing_quality_problem` and `service_category` fields; applies tier classification logic (see Step 3); writes result to `quote_submissions.tier`; sends admin notification |

> **Agentic note:** Classification is performed automatically but a human MUST confirm tier before a quote is sent. Never proceed to SOP-03 without human confirmation.

---

## 5. Process Overview

A prospect completes FORM-01 on the Preqal website. The form writes two database records simultaneously. An immediate notification is sent to admin. The Lead Triage Agent (or admin manually) applies the tier classification logic. Admin reviews, confirms or adjusts the tier, and triggers SOP-03.

---

## 6. Inputs

- Completed FORM-01 submission
- `template_leads` Supabase record
- `quote_submissions` Supabase record

---

## 7. Procedure

### Step 1 — Form Submission & Database Write

**Trigger:** Prospect clicks "Submit" on FORM-01 at `/business-growth-assessment`.

**System action (automatic):**
1. Write to `template_leads` table:
   - `name`, `email`, `company`, `job_title`, `phone`, `most_pressing_quality_problem`, `source_page`, `country_iso`, `dial_code`, `created_at`
2. Write to `quote_submissions` table:
   - `name`, `email`, `company`, `industry`, `company_size`, `service_category`, `budget_range`, `timeline`, `tier` (calculated), `submitted_at`
3. If either write fails: log error to console; queue retry; send fallback email to `stefan.gravesande@preqal.org` with all form data.

**Verification:** Admin can confirm receipt by checking the Leads tab in the Admin Dashboard. Row should appear within 30 seconds of submission.

---

### Step 2 — Admin Notification

**System action (automatic):**
- Send EmailJS notification to `stefan.gravesande@preqal.org` using template `template_lead_notify` (TPL-05).
- Notification must include: prospect name, company, industry, service category, and pressing quality problem.
- If EmailJS fails: retry once after 60 seconds. If second attempt fails: log to Supabase `error_log` table and alert via browser notification on next admin dashboard load.

---

### Step 3 — Tier Classification Logic

**Applied by:** Lead Triage Agent OR Admin manually.

Classification rules (apply in order — first match wins):

| If... | Then Tier = |
|-------|------------|
| `company_size` is "50+ employees" OR `budget_range` is "$10,000+" OR `service_category` includes "IMS" or "National Framework" | Enterprise |
| `company_size` is "10–49 employees" OR `budget_range` is "$3,000–$9,999" OR `service_category` includes "ISO certification" or "Full QMS" | Growth |
| `company_size` is "1–9 employees" OR `budget_range` is "Under $3,000" OR `service_category` is "Single standard" or "Gap analysis only" | Starter |
| None of the above match | Growth (default — review manually) |

Write the determined tier to `quote_submissions.tier`.

---

### Step 4 — Admin Review (Human Required)

4.1. Open Admin Dashboard → Leads tab.
4.2. Locate the new submission (sorted by `created_at` descending).
4.3. Review the `most_pressing_quality_problem` field — does the tier classification make sense?
4.4. If yes: confirm tier (no change needed).
4.5. If no: manually update `quote_submissions.tier` to the correct tier. Add a note in `quote_submissions.admin_notes` explaining the override and reason.
4.6. Update `quote_submissions.status` from `new` to `reviewed`.

**Decision gate:** Do NOT proceed to SOP-03 until this step is complete and `status = reviewed`.

---

### Step 5 — Handoff to SOP-03

5.1. Admin updates `quote_submissions.status` to `quote-in-progress`.
5.2. Proceed to SOP-03 (Quote Generation & Proposal).

---

## 8. Outputs

- Confirmed lead record in `template_leads`
- Tier-classified record in `quote_submissions` with `status = reviewed`
- Admin notified and lead reviewed within 4 hours

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Lead-to-first-review time | ≤ 4 hours | Per lead |
| Admin notification delivery rate | 100% | Weekly |
| Tier override rate | < 20% (high override = poor form logic) | Monthly |
| Data completeness (all required fields populated) | 100% | Per submission |

---

## 10. Non-Conformance Handling

**Missing required fields:** If a submission is missing `email` or `company`, flag as incomplete in `quote_submissions.admin_notes`. Attempt to contact via `phone` if provided. Do not proceed to SOP-03 without a valid email.

**Duplicate submission:** If same email submits within 7 days, merge records. Keep the most recent submission data. Log a note: "Duplicate submission — merged."

**Form submission error:** If the form fails to write to Supabase, the user sees an error message and the form data is sent via EmailJS as a backup. Admin manually creates the Supabase record.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
