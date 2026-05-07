# SOP-07: Project Closure & Handover

**Document No:** SOP-07
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.5.5 (Post-Delivery Activities), 9.1.2 (Customer Satisfaction)
**Related Documents:** DIA-01, TPL-11 (Closure Report), SOP-06, SOP-08, SOP-09

---

## 1. Purpose

To formally close each project with a structured handover, capture lessons learned for continual improvement, collect client satisfaction data, issue the final invoice, and automatically schedule the renewal follow-up — ensuring no client relationship is abandoned after delivery.

---

## 2. Scope

Applies when all contracted deliverables have been submitted and confirmed (CRM: `pipeline_stage = Review`), through to formal project close and CRM update to `Closed`.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Project Closure | The formal end of the contracted scope — all deliverables submitted and accepted |
| Handover | The process of transferring ownership of the delivered system to the client |
| NPS | Net Promoter Score — a 0–10 rating of how likely the client is to recommend Preqal |
| Lessons Learned | Documented reflection on what went well, what could be improved, and what to do differently next time |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Confirms final deliverable acceptance; presents closure report; requests NPS/testimonial; signs off project |
| Client Authorised Signatory | Signs the final acceptance/handover declaration |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Closure Report Agent | Drafts TPL-11 (Closure Report) from project records; submits for Dr. Gravesande review |
| Billing Agent | Triggers final invoice (SOP-08) upon receipt of closure sign-off signal |
| Renewal Scheduler Agent | Sets a calendar reminder at T-30 before `crm_clients.renewal_date` to trigger SOP-09 |

---

## 5. Process Overview

When all deliverables are submitted, Dr. Gravesande confirms with the client that all contracted outputs are complete and accepted. A formal Closure Report (TPL-11) is issued, covering what was built, what changed, and what the client should do next. The client signs a simple handover acceptance. The final invoice is issued. Lessons learned are logged. The renewal reminder is scheduled.

---

## 6. Inputs

- All contracted deliverables (confirmed submitted in SOP-06)
- Project notes and status reports from SOP-06
- CRM record with `pipeline_stage = Review`

---

## 7. Procedure

### Step 1 — Confirm All Deliverables Submitted

1.1. Review the contracted scope (from TPL-03) item by item.
1.2. For each deliverable: confirm it was submitted, confirm client received it, confirm no outstanding revisions.
1.3. If any item is outstanding: resolve it before proceeding. Do NOT issue a Closure Report while deliverables are pending.

---

### Step 2 — Draft Closure Report (TPL-11)

2.1. Draft the Closure Report using TPL-11 (Project Closure Report Template).
2.2. The report must include:
   - **Executive Summary:** What was built and why it matters.
   - **Deliverables Completed:** Full list matching the contract scope, with file locations.
   - **Key Changes Made:** What changed in the client's operations as a result of this project.
   - **Outstanding Recommendations:** Work identified during the project that was NOT in scope — plant the seed for future engagement.
   - **Maintenance Instructions:** How the client maintains the system going forward (audit schedule, document review dates, record-keeping requirements).
   - **Your Next Milestones:** 3–5 specific actions the client should take in the next 90 days.
   - **Acknowledgements:** Thank the client's Project Champion specifically by name.
2.3. Dr. Gravesande reviews and approves the draft before sending.

---

### Step 3 — Closure Meeting (or Email if small engagement)

3.1. For Growth and Enterprise tier projects: schedule a 1-hour closure meeting.
3.2. For Starter tier: a closure email with the report attached is acceptable.
3.3. Closure meeting agenda:
   - Walk through the Closure Report
   - Confirm the client's Project Champion understands maintenance requirements
   - Discuss next steps (from the Outstanding Recommendations section)
   - Ask: *"On a scale of 0–10, how likely are you to recommend Preqal to a colleague?"* — record NPS
   - Ask: *"Would you be willing to share a short testimonial about your experience?"*
   - Ask for referrals: *"If you know anyone who would benefit from what we've built, I'd be grateful for an introduction."*

---

### Step 4 — Obtain Handover Acceptance

4.1. Request the client to confirm acceptance in writing (email is sufficient): *"Please confirm you've received all deliverables as outlined in the Closure Report and are satisfied with the outcomes."*
4.2. Save the client's written acceptance in Google Drive: `Clients / [CompanyName] / Project 1 / Contracts / Handover-Acceptance-[date].pdf`

---

### Step 5 — Issue Final Invoice

5.1. Upon receipt of handover acceptance: trigger SOP-08 (Billing) for the final invoice.
5.2. Update `quote_submissions.status` → `project-complete`.
5.3. Update CRM: `pipeline_stage` → `Closed`.

---

### Step 6 — Capture Lessons Learned (Internal)

6.1. Within 5 business days of project close, write a brief internal lessons learned note (1 page max):
   - What went well (repeat this)
   - What was harder than expected (improve this)
   - Any scope management issues (prevent next time)
   - Client feedback (NPS and any qualitative comments)
6.2. Save in Google Drive: `Internal / Lessons Learned / [CompanyName]-[YYYY-MM-DD].md`
6.3. If NPS is 6 or below: log in REG-06 (Non-Conformance Register) as a quality event and conduct root cause analysis.

---

### Step 7 — Schedule Renewal Reminder

7.1. Verify `crm_clients.renewal_date` is set correctly (project end date + 1 year, or per contract).
7.2. Confirm the Renewal Scheduler Agent has set the T-30 reminder (30 days before `renewal_date`).
7.3. If no automated reminder system: manually add a calendar event titled: `RENEWAL FOLLOW-UP — [CompanyName]` on the `renewal_date - 30 days`.
7.4. Proceed to SOP-09 when the renewal reminder fires.

---

## 8. Outputs

- Signed Closure Report sent to client
- Written handover acceptance filed
- Final invoice issued (triggers SOP-08)
- Lessons learned logged internally
- CRM: `pipeline_stage = Closed`
- Renewal reminder scheduled

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Closure Report issued within 5 days of final deliverable | 100% | Per project |
| NPS collected | 100% of projects | Per project |
| Average NPS | ≥ 8 | Quarterly |
| Referral requests made | 100% of projects | Per project |
| Renewal reminder scheduled | 100% of projects | Per project |
| Lessons learned documented | 100% of projects | Per project |

---

## 10. Non-Conformance Handling

**Client refuses to sign handover acceptance:** Investigate — are there outstanding concerns? Address them. If client is satisfied but simply won't sign, send a closing email summarising all delivered work and note: "Your silence within 5 business days will be taken as acceptance of the deliverables as described."

**NPS of 6 or below:** Mandatory root cause analysis within 7 days. Follow up with client to understand specific dissatisfaction. Log corrective action in REG-06.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
