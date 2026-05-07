# SOP-04: Contract Execution & Sign-off

**Document No:** SOP-04
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.2.4 (Changes to Requirements), 8.4
**Related Documents:** DIA-01, TPL-03 (Contract), TPL-07 (Contract Welcome Email), SOP-03, SOP-05

---

## 1. Purpose

To ensure that every client engagement is formalised with a signed Service Agreement before any work commences, that both parties' obligations are clearly documented, and that the CRM is updated to reflect the confirmed client relationship.

---

## 2. Scope

Applies from the moment a prospect verbally or in writing accepts the proposal (output of SOP-03) through to the signed contract being filed and the client being set up in the CRM as an active client.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Service Agreement | The binding contract between Preqal and the client (TPL-03) |
| Deposit | The advance payment (% of total project fee) required before work begins |
| Effective Date | The date both parties have signed the agreement — this is the contract start date |
| CRM | The `crm_clients` Supabase table, managed via the Admin Dashboard |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Issues contract; signs on behalf of Preqal; confirms receipt of deposit; triggers onboarding |
| Client (Authorised Signatory) | Signs the Service Agreement; pays deposit |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| CRM Update Agent | On instruction from Dr. Gravesande: updates `crm_clients` record with contract details, sets `pipeline_stage = Contracted`, sets `contract_value` and `renewal_date` |

---

## 5. Process Overview

Prospect confirms acceptance of the proposal. Dr. Gravesande prepares TPL-03 (Service Agreement), customised for the agreed scope and investment. The contract is sent for signature. Upon receipt of signed contract AND deposit payment, the client record is created/updated in the CRM, and onboarding is triggered (SOP-05).

**Critical rule: No work begins until (a) contract is fully signed by both parties AND (b) deposit is confirmed received.**

---

## 6. Inputs

- Accepted proposal (from SOP-03)
- Agreed scope, investment amount, and payment schedule
- TPL-03 (Service Agreement Template)

---

## 7. Procedure

### Step 1 — Prospect Accepts Proposal

1.1. Acceptance may be communicated via: email reply, phone call, or signing the proposal document.
1.2. If verbal (phone): send an email confirming: *"Great to hear — I'll prepare the Service Agreement and send it across today."* This creates a written record.
1.3. Update `quote_submissions.status` → `accepted`.

---

### Step 2 — Prepare Service Agreement

2.1. Open TPL-03 (Service Agreement Template) — make a copy titled: `[CompanyName]-ServiceAgreement-[YYYY-MM-DD]`.
2.2. Complete all variable fields:
   - Client full legal name and registered address
   - Effective date (leave blank until both parties sign)
   - Scope of work (copy from the accepted proposal — verbatim)
   - Total investment and payment schedule
   - Timeline and milestone dates
   - Governing law (confirm jurisdiction — Trinidad & Tobago or as applicable)
2.3. Review: does every deliverable in the scope match what was quoted? Are payment dates and amounts correct?
2.4. Do NOT alter standard clauses (limitation of liability, confidentiality, dispute resolution) without legal review.

---

### Step 3 — Send Contract for Signature

3.1. Export as PDF.
3.2. Send via email using TPL-07 (Contract Welcome Email template).
3.3. Email subject line: `Service Agreement — Preqal × [Client Company Name]`.
3.4. The email must state: *"Please sign and return a copy at your earliest convenience. Work will commence upon receipt of the signed agreement and deposit."*
3.5. Record send date in `crm_clients.contract_sent_at` (or `admin_notes` if field not yet created).

---

### Step 4 — Receive Signed Contract

4.1. Upon receipt of signed contract from client:
   - Save the signed PDF to Google Drive: `Clients / [CompanyName] / Contracts / [filename]`.
   - Note the effective date (date of client's signature, or later date if specified).
4.2. Sign the contract on behalf of Preqal (Dr. Gravesande).
4.3. Send the fully countersigned copy to the client: *"Please find the fully executed agreement attached for your records."*

---

### Step 5 — Confirm Deposit Payment

5.1. Issue the deposit invoice immediately using TPL-04 (Invoice Template).
5.2. Deposit is due within [X] days as stated in the contract (typically 5 business days).
5.3. When deposit is received:
   - Mark the deposit invoice as paid in REG-05 (Invoice & Payment Register).
   - Update `crm_clients.pipeline_stage` → `Contracted`.
   - Update `crm_clients.contract_value` with the total project value.
   - Update `crm_clients.renewal_date` with the expected project end date + 1 year (for renewal scheduling).

---

### Step 6 — Set Up Client Record in CRM

6.1. In Admin Dashboard → CRM tab, create or update the client record:
   - `client_name`, `company`, `email`, `phone` (ensure phone is captured here)
   - `pipeline_stage` = `Contracted`
   - `contract_value` = total agreed fee
   - `onboarding_stage` = `not-started`
   - `renewal_date` = project end + 365 days
   - `industry`, `country`
6.2. Verify all fields are populated — no blanks on required fields.

---

### Step 7 — Trigger Onboarding

7.1. Proceed to SOP-05 (Client Onboarding).
7.2. The trigger for SOP-05 is: signed contract + deposit received + CRM record updated.

---

## 8. Outputs

- Fully signed Service Agreement filed in Google Drive
- Deposit invoice issued and marked paid
- CRM record with `pipeline_stage = Contracted`
- Handoff to SOP-05

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Time from acceptance to contract sent | ≤ 24 hours | Per contract |
| Contracts with all fields completed | 100% | Per contract |
| Deposit received before work commences | 100% (no exceptions) | Per contract |
| CRM completeness at this stage | 100% required fields | Per contract |

---

## 10. Non-Conformance Handling

**Work started before contract signed:** This is a critical non-conformance. Log in REG-06 immediately. Issue the contract retroactively and obtain signatures. Review root cause — was there external pressure to begin? Add to risk register if pattern repeats.

**Client requests changes to standard terms:** Escalate to legal review. Do not accept changes unilaterally. Document all negotiated changes as a written amendment to TPL-03.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
