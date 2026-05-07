# SOP-10: Admin Dashboard Operations

**Document No:** SOP-10
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 7.5 (Documented Information), 9.1 (Monitoring, Measurement, Analysis and Evaluation)
**Related Documents:** DIA-01, REG-01 through REG-07, All SOPs

---

## 1. Purpose

To define how the Preqal Admin Dashboard is used as the operational nerve centre — the single interface through which human and agentic workers monitor pipeline health, manage client records, track invoices, and action the tasks defined in all other SOPs.

---

## 2. Scope

Applies to all users of the Admin Dashboard at `preqal.org/admin-dashboard.html`. Covers: access control, daily operational checks, data entry standards, use by agentic workers, and dashboard maintenance.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Admin Dashboard | The standalone HTML tool at `preqal.org/admin-dashboard.html` — authenticated access only |
| Tab | A section of the dashboard (Overview, Leads, Quote Submissions, CRM, Billing, Course, Traffic) |
| Supabase | The backend database that the dashboard reads from and writes to |
| Agentic Worker | An AI agent (e.g., Claude) with access to Supabase MCP tools or the dashboard API |

---

## 4. Access Control

| User | Access Level |
|------|-------------|
| Dr. Stefan Gravesande (`stefan.gravesande@gmail.com`) | Full admin access |
| Dr. Stefan Gravesande (`stefan.gravesande@preqal.org`) | Full admin access |
| Agentic Workers | Read/write via Supabase MCP tools (NOT direct dashboard login — agents use API) |
| Other staff | View-only access (if granted explicitly) |

**Critical:** The Admin Dashboard password must never be shared via email or stored in plain text. Never grant dashboard access to a client.

---

## 5. Dashboard Tabs & Their SOP Mapping

| Tab | Primary Use | SOP Ref | Key Actions |
|-----|------------|---------|------------|
| Overview | Daily health check — pipeline summary, recent activity | All | Morning check |
| Leads | Review new form submissions | SOP-02 | Review, classify, update status |
| Quote Submissions | Manage proposal pipeline | SOP-02, SOP-03 | Update tier, status, notes |
| CRM | Active client management | SOP-04–SOP-09 | Update pipeline stage, add notes |
| Billing | Invoice tracking (to be built) | SOP-08 | Create invoice, mark paid, view AR |
| Course | e-Learning platform management | — | View enrollments, issue certificates |
| Traffic | Site analytics | SOP-01 | Review weekly traffic trends |

---

## 6. Daily Operating Procedure (Human)

### Morning Check (5–10 minutes)

6.1. Open Admin Dashboard → **Overview tab**.
6.2. Check: any new leads since yesterday? Any overdue follow-ups?
6.3. If new leads: proceed to Leads tab → review → action per SOP-02.
6.4. Check CRM tab: any clients with `onboarding_stage` pending more than 5 days?
6.5. Check Billing tab (once built): any invoices 7+ days past due?
6.6. Any flagged items from agentic agents overnight? Review notification queue.

### Week-End Check (Friday, 15 minutes)

6.7. Review all active projects in CRM — are status report emails sent? (SOP-06)
6.8. Review Quote Submissions — any proposals sent 7+ days ago with no response? Trigger follow-up (SOP-03 Step 7).
6.9. Review Leads — any new leads 4+ hours old without a status of `reviewed`? Action immediately.
6.10. Review Billing — any invoices becoming overdue next week? Prepare reminders.

---

## 7. Data Entry Standards

These rules apply to ALL data entered into the dashboard — by humans and agentic workers alike:

| Field | Standard |
|-------|----------|
| Names | Title case: "Dr. Smith", "Acme Foods Ltd" — never all caps or all lower |
| Email addresses | Lowercase always: `contact@company.com` |
| Phone numbers | International format: `+1 868 xxx xxxx` — include country code |
| Dates | ISO 8601: `2026-05-07` |
| Status fields | Use only the defined enum values (see each SOP for valid statuses) |
| Notes/Admin notes | Start with the date: `[2026-05-07] — [note content]`. Append; never overwrite. |
| Currency | State the currency: `TTD 15,000` or `USD 2,500` — never a bare number |

---

## 8. Agentic Worker Instructions

When an agentic worker (AI agent) needs to perform dashboard operations, it MUST use the Supabase MCP tools directly (not the HTML dashboard). The following operations are authorised for agentic workers without human confirmation:

**Read operations (no confirmation needed):**
- Query any table to retrieve records
- Generate summary reports from data

**Write operations (no confirmation needed if explicitly triggered by an SOP):**
- Update `quote_submissions.status` (per SOP-02 Step 5, SOP-03 Step 6)
- Update `crm_clients.pipeline_stage` and `onboarding_stage` (per SOPs 04–07)
- Create a new `invoices` record (per SOP-08 Step 2)
- Update `invoices.status` to `paid` (per SOP-08 Step 3)

**Write operations requiring human confirmation before executing:**
- Creating a new `crm_clients` record
- Deleting any record
- Sending any email
- Generating or sending any invoice
- Updating `crm_clients.contract_value`

**Agentic note:** If you are an AI agent reading this SOP, the confirmation requirement means: before taking the listed actions, you MUST present your intended action to the human operator and wait for explicit approval (e.g., "yes, proceed" in the chat). Do not assume that context implies permission.

---

## 9. Dashboard Maintenance

9.1. **Monthly:** Verify all Supabase tables are accessible and data is loading correctly.
9.2. **Monthly:** Check for any console errors in the dashboard (browser dev tools → Console tab).
9.3. **Quarterly:** Review which tabs are used most — are any unused features creating confusion?
9.4. **On every SOP update:** Update this SOP to reflect any new tabs, fields, or workflows.

---

## 10. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Daily morning check completed | 100% of business days | Weekly |
| All new leads reviewed within 4hr | 100% | Per lead |
| CRM records with all required fields | 100% | Monthly |
| Dashboard accessible (no outages) | 99.9% uptime | Monthly |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
