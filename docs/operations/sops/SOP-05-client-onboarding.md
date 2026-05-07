# SOP-05: Client Onboarding

**Document No:** SOP-05
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.5.1 (Control of Production and Service Provision)
**Related Documents:** DIA-01, FORM-02, TPL-08 (Onboarding Invitation Email), SOP-04, SOP-06

---

## 1. Purpose

To systematically collect the business context, documentation, and stakeholder information needed to begin project delivery — ensuring the project team (human and agentic) has everything required to commence work without delays or avoidable back-and-forth.

---

## 2. Scope

Applies from contract execution and deposit receipt (output of SOP-04) through to the client completing FORM-02 and the admin confirming all required information is received, triggering project kickoff (SOP-06).

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| FORM-02 | The Client Onboarding & Context Capture form — a token-gated digital form at `/client-onboarding.html?token=[token]` |
| Token | A unique, single-use URL parameter generated for each client that gates access to their onboarding form |
| Onboarding Complete | The state where FORM-02 is submitted, admin has reviewed the submission, and the project file is ready |
| Project File | The organised collection of client documents and context that the delivery team works from |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Sends onboarding invitation; reviews completed form; confirms project readiness |
| Client (Primary Contact) | Completes FORM-02; uploads requested documents; designates internal project champion |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Onboarding Monitor Agent | Monitors `client_onboarding` table for new submissions; sends admin notification immediately on completion; updates `crm_clients.onboarding_stage` → `complete` |

---

## 5. Process Overview

Within 24 hours of contract execution, admin sends the client the onboarding invitation (TPL-08) containing their unique FORM-02 link. The client completes the form — providing business background, existing documentation, key contacts, and service-specific context. On submission, admin is automatically notified, reviews the submission for completeness, and either requests missing information or declares onboarding complete and proceeds to SOP-06.

---

## 6. Inputs

- Signed contract and confirmed deposit (from SOP-04)
- CRM record with `pipeline_stage = Contracted`
- Client's primary email address
- Generated onboarding token (from Admin Dashboard)

---

## 7. Procedure

### Step 1 — Generate Onboarding Token & Link

1.1. In Admin Dashboard → CRM tab, locate the client record.
1.2. Click "Send Onboarding Invitation" — this generates a unique token and constructs the URL: `preqal.org/client-onboarding.html?token=[token]`.
1.3. The token is stored in `crm_clients.onboarding_token`. It is single-use and expires after 30 days.
1.4. If the token expires before the client completes the form, generate a new one and re-send.

---

### Step 2 — Send Onboarding Invitation

2.1. Draft email using TPL-08 (Onboarding Invitation Email template).
2.2. Email must include:
   - Warm welcome personalised to the client's name and company.
   - Clear explanation of what the form is for: *"This helps me build the full picture of your business before we begin — the more detail you provide, the more precisely we can tailor the work."*
   - The unique FORM-02 link (the token URL from Step 1).
   - Deadline suggestion: *"Please complete this within 5 business days so we can schedule your kickoff."*
   - Dr. Gravesande's direct contact details in case of questions.
2.3. Send from `stefan.gravesande@preqal.org`.
2.4. Update CRM: `onboarding_stage` → `invitation-sent`, record send date.

---

### Step 3 — Client Completes FORM-02

**The client experience:** The client opens their unique link, sees a clean branded form, and provides:
- Company legal name and trading name
- Physical address and main operating site
- Key contact details (internal project champion name, email, phone)
- Business description (what they do, how many staff, shift patterns if relevant)
- Existing documentation (upload: any existing quality manuals, procedures, certificates)
- Current challenges (open text — describe what prompted them to engage Preqal)
- Regulatory context (which standards, regulations, or audit bodies apply to their business)
- Previous audit history (any non-conformances, corrective actions in progress)
- Preferred communication method and availability for kickoff

**System action on submit:**
- Write all fields to `client_onboarding` table.
- Update `crm_clients.onboarding_stage` → `complete`.
- Send immediate notification to `stefan.gravesande@preqal.org` via EmailJS.
- Display confirmation message to client: *"Thank you — we've received everything and will be in touch within 24 hours to schedule your kickoff."*

---

### Step 4 — Admin Reviews Submission (within 24 hours)

4.1. Open Admin Dashboard notification OR check CRM for `onboarding_stage = complete`.
4.2. Open the `client_onboarding` record.
4.3. Verify completeness against this checklist:
   - [ ] Company legal name populated
   - [ ] Key contact (internal champion) name, email, and phone provided
   - [ ] Business description is sufficient to understand operations
   - [ ] At least 1 document uploaded OR explicit statement that no documents exist yet
   - [ ] Regulatory context and applicable standards identified
   - [ ] Current challenges described
4.4. If any item is missing:
   - Email the client directly: *"Just one thing — [specific missing item]. Could you send that across? It'll help me hit the ground running at kickoff."*
   - Update CRM: `onboarding_stage` → `pending-info`.
   - Await response before proceeding.
4.5. If all items present: update CRM `onboarding_stage` → `complete-verified`.

---

### Step 5 — Build Project File

5.1. Create a Google Drive folder: `Clients / [CompanyName] / Project 1 /`
5.2. Sub-folders: `Contracts`, `Onboarding`, `Deliverables`, `Correspondence`, `Evidence`
5.3. Download all uploaded documents from Supabase Storage (`client-documents` bucket) and file in `Onboarding/`.
5.4. Save the onboarding form data as a PDF summary in `Onboarding/`.

---

### Step 6 — Proceed to Kickoff

6.1. Update CRM: `pipeline_stage` → `Scoping`.
6.2. Proceed to SOP-06 (Project Scoping & Delivery).
6.3. Within 24 hours of declaring onboarding complete: schedule kickoff meeting.

---

## 8. Outputs

- Completed and verified FORM-02 record in Supabase
- Client project file in Google Drive
- CRM: `onboarding_stage = complete-verified`, `pipeline_stage = Scoping`
- Kickoff scheduled

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Onboarding invitation sent within 24hr of contract | 100% | Per client |
| Client completes FORM-02 within 5 business days | ≥ 80% (follow up if not) | Per client |
| Admin review of submission within 24hr | 100% | Per client |
| Project file created before kickoff | 100% | Per client |

---

## 10. Non-Conformance Handling

**Client does not complete FORM-02 after 7 days:** Follow up with a direct phone call. If still unresponsive after 14 days, flag in REG-06 and consider delaying project start (per POL-03 Service Delivery Policy).

**Documents uploaded are unreadable or corrupt:** Notify the client immediately via email with the specific file name(s) and request a re-upload.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
