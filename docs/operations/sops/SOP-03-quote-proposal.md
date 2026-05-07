# SOP-03: Quote Generation & Proposal

**Document No:** SOP-03
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.2.3 (Review of Requirements for Products and Services)
**Related Documents:** DIA-01, TPL-01 (Quote), TPL-02 (Proposal), TPL-06 (Proposal Email), SOP-02, SOP-04

---

## 1. Purpose

To ensure every qualified lead receives a tailored, accurate, and professional quote and proposal within 48 hours of lead review completion. The proposal must clearly define scope, deliverables, timeline, investment, and terms — eliminating ambiguity before contract execution.

---

## 2. Scope

Applies from the moment `quote_submissions.status = reviewed` (handoff from SOP-02) through to the prospect receiving the proposal. Includes quote calculation, proposal drafting, internal approval, and delivery.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Quote | A structured document stating the scope of work and investment (TPL-01) |
| Proposal | A full professional document combining the quote with Preqal's approach, credentials, and terms (TPL-02) |
| Scope | The specific deliverables and boundaries of the engagement |
| T0 | The moment `quote_submissions.status` is set to `reviewed` — the 48-hour clock starts here |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Sole approver of all quotes and proposals; tailors scope to client context; signs all proposals |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Proposal Agent | Drafts the proposal narrative sections using TPL-02 template and lead data; flags for human review |

> **Agentic note:** Agents may DRAFT proposals but may NOT send them. All proposals require Dr. Gravesande's review and explicit send command.

---

## 5. Process Overview

Upon receiving the reviewed lead (from SOP-02), Dr. Gravesande reviews the full submission context, selects the service package, calculates the investment using current pricing guidelines, drafts the quote (TPL-01), assembles the proposal (TPL-02), conducts a final review, and sends via email using TPL-06. The 48-hour SLA runs from T0.

---

## 6. Inputs

- `quote_submissions` record with `status = reviewed` and confirmed tier
- `template_leads` record (contact + company info)
- Current service pricing schedule (internal document, held by Dr. Gravesande)
- TPL-01 (Quote Template)
- TPL-02 (Service Proposal Template)

---

## 7. Procedure

### Step 1 — Review Full Lead Context (T0 → T0+30min)

1.1. Open Admin Dashboard → Quote Submissions tab.
1.2. Read all fields: `most_pressing_quality_problem`, `service_category`, `industry`, `company_size`, `budget_range`, `timeline`.
1.3. If `budget_range` is significantly below the appropriate tier's pricing floor, note this in `admin_notes`. Do not discount without a conscious decision — see Step 3.
1.4. If any critical information is missing (e.g., no clarity on company size or location), send a brief clarifying email before proceeding: *"Before I prepare your proposal, I have one quick question: [specific question]. This helps me tailor the scope precisely."*

---

### Step 2 — Define Scope of Work (T0+30min → T0+2hr)

2.1. Based on `service_category` and tier, select the appropriate base service package:
   - **Starter:** Gap Analysis (single standard) + Basic Report
   - **Growth:** Full QMS/IMS Development + Implementation Support + Training
   - **Enterprise:** Multi-standard IMS + National Framework + Ongoing Advisory

2.2. Write 3–5 specific deliverables tailored to the client's industry and pressing problem.
   - Example: "For a poultry processor citing 'food safety audit failures', include HACCP plan review as a specific deliverable."
2.3. Define what is explicitly OUT of scope (this protects both parties).
2.4. Set timeline milestones: kickoff, first deliverable, completion date — based on `timeline` field preference.

---

### Step 3 — Calculate Investment

3.1. Apply current pricing schedule to selected scope.
3.2. State investment as a flat project fee (preferred) or phased payment schedule.
3.3. If `budget_range` is below the calculated investment:
   - Option A: Reduce scope to fit budget (create a Starter version).
   - Option B: Proceed with full proposal and address budget in the cover email: *"I've prepared this based on the full scope needed. Happy to discuss a phased approach."*
   - Never send a quote that misrepresents what can be delivered at the stated price.
3.4. State payment terms: deposit percentage (typically 30–50%) due on contract execution; balance on project milestones.

---

### Step 4 — Draft the Proposal Document (T0+2hr → T0+8hr)

4.1. Open TPL-02 (Service Proposal Template) — make a copy titled: `[CompanyName]-Proposal-[YYYY-MM-DD]`.
4.2. Complete all sections:
   - **Executive Summary:** 1 paragraph — who they are, what problem Preqal will solve, what the outcome looks like.
   - **Understanding of Your Situation:** Reference the specific pain points from the BGA form. Show you listened.
   - **Proposed Scope & Deliverables:** The list from Step 2.
   - **Our Approach:** Briefly explain the Clinic on Quality™ diagnostic method.
   - **Timeline:** Milestones from Step 2.4.
   - **Investment:** From Step 3. Include payment schedule.
   - **About Preqal / Dr. Gravesande:** Standard bio section (pre-populated in TPL-02).
   - **Terms & Conditions Summary:** Reference POL-03 (Service Delivery Policy).
   - **Next Steps:** Clear instruction — *"To proceed, sign and return the attached Service Agreement."*
4.3. Proof-read: no client's name should appear misspelled. Verify the industry and company name match the form submission.

---

### Step 5 — Internal Review (Human)

5.1. Re-read the full proposal cold — pretend you are the client reading it for the first time.
5.2. Verify:
   - [ ] Scope matches budget and timeline
   - [ ] No deliverables promised that cannot be fulfilled
   - [ ] Payment terms are clearly stated
   - [ ] All client name/company references are correct
   - [ ] Next steps are clear
5.3. If any item fails: revise and re-check before sending.

---

### Step 6 — Send Proposal (Must complete by T0+48hr)

6.1. Export the proposal as PDF.
6.2. Draft email using TPL-06 (Proposal Cover Email template).
6.3. Attach the PDF proposal.
6.4. Send from `stefan.gravesande@preqal.org`.
6.5. Immediately update in Admin Dashboard:
   - `quote_submissions.status` → `proposal-sent`
   - `quote_submissions.proposal_sent_at` → current timestamp
6.6. Update CRM (`crm_clients`): if client does not yet exist, create record with `pipeline_stage = Proposal Sent`.

---

### Step 7 — Follow-Up (if no response)

7.1. T0+72hr (3 days after proposal sent): If no response, send a brief follow-up: *"Just checking in — did you have a chance to review the proposal? Happy to jump on a call."*
7.2. T0+7 days: Second follow-up if still no response: *"I'll keep this open for another week. Let me know if you have questions or if priorities have shifted."*
7.3. T0+14 days: If still no response, update status to `stale`. Log in `admin_notes`: "2× follow-up sent, no response."

---

## 8. Outputs

- Tailored proposal PDF sent to prospect
- `quote_submissions.status = proposal-sent`
- CRM record created or updated with `pipeline_stage = Proposal Sent`

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Proposal sent within 48hr of T0 | 100% | Per lead |
| Proposal-to-contract conversion rate | ≥ 40% | Monthly |
| Follow-up compliance (T+3 and T+7) | 100% | Weekly |
| Proposal stale rate (no response at 14 days) | < 30% | Monthly |

---

## 10. Non-Conformance Handling

If a proposal is sent with incorrect pricing or scope, issue a corrected version within 24 hours with a note: *"Please disregard the previous version — I've updated the proposal to [brief description of change]."* Log the error in REG-06 (Non-Conformance Register).

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
