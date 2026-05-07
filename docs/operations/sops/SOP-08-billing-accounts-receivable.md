# SOP-08: Billing & Accounts Receivable

**Document No:** SOP-08
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.5.5 (Post-Delivery Activities)
**Related Documents:** DIA-01, TPL-04 (Invoice), TPL-12 (Invoice Email), TPL-13 (Payment Reminder), REG-05 (Invoice & Payment Register), SOP-04, SOP-07

---

## 1. Purpose

To ensure all Preqal invoices are issued promptly, tracked systematically, and collected within agreed payment terms — maintaining healthy cash flow and zero tolerance for untracked receivables.

---

## 2. Scope

Applies to all invoices issued by Preqal: deposit invoices (triggered by SOP-04), milestone invoices (triggered during SOP-06), and final invoices (triggered by SOP-07). Includes payment tracking, reminders, and overdue handling.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Invoice | A formal request for payment issued to the client (TPL-04) |
| Accounts Receivable (AR) | The total of all invoices issued but not yet paid |
| Payment Terms | The number of days within which payment is due after invoice date (default: 14 days) |
| Overdue | An invoice where payment terms have been exceeded |
| REG-05 | The Invoice & Payment Register — the live record of all invoices, amounts, and payment status |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Issues all invoices; approves write-offs; handles escalated overdue accounts |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| AR Monitor Agent | Checks REG-05 daily; flags invoices approaching due date (T-2 days); sends automated payment reminders at T+7, T+14; escalates to Dr. Gravesande at T+30 |
| Invoice Agent | Drafts invoices using TPL-04 from project data; submits for Dr. Gravesande review before sending |

> **Agentic note:** Agents monitor and remind — they do NOT negotiate payment terms, extend deadlines, or write off balances. These decisions are human-only.

---

## 5. Invoice Schedule

Every project generates the following invoices in sequence:

| Invoice Type | Trigger | % of Total | Due |
|-------------|---------|-----------|-----|
| Deposit Invoice | Contract execution (SOP-04) | 30–50% | 5 business days |
| Milestone Invoice(s) | Defined in contract (e.g., phase completion) | As per contract | 14 days |
| Final Invoice | Handover acceptance (SOP-07) | Remaining balance | 14 days |

---

## 6. Procedure

### Step 1 — Issue Invoice

1.1. Prepare invoice using TPL-04 (Invoice Template). Each invoice must include:
   - Invoice number (format: PRQ-[YEAR]-[###] e.g., PRQ-2026-001)
   - Invoice date
   - Client company name and billing address
   - Preqal name, address, and contact details
   - Description of services (reference the project phase or milestone)
   - Amount (excluding and including applicable taxes)
   - Payment terms: "Payment due within [X] days of invoice date"
   - Bank/payment details (account name, account number, bank name, branch)
1.2. Dr. Gravesande reviews draft invoice before sending.
1.3. Send via email using TPL-12 (Invoice Cover Email template).
1.4. Attach invoice as PDF.

---

### Step 2 — Record in REG-05

2.1. Immediately upon sending, record in REG-05 (Invoice & Payment Register):
   - `invoice_number`
   - `client_name`
   - `project_name`
   - `invoice_date`
   - `due_date` (invoice_date + payment terms)
   - `amount`
   - `status` → `sent`
2.2. If REG-05 is in Supabase (`invoices` table — to be created): write record via Admin Dashboard Billing tab.
2.3. If REG-05 is in a spreadsheet: update the spreadsheet immediately.

---

### Step 3 — Monitor Payment

3.1. AR Monitor Agent (or admin manually) checks REG-05 daily.
3.2. When payment is received: update `status` → `paid`, record `payment_date` and `payment_method`.
3.3. Send a brief confirmation to the client: *"Thank you — payment received. Receipt attached."*

---

### Step 4 — Payment Reminders

Send automated (or manual) reminders at:

| Trigger | Action | Template |
|---------|--------|----------|
| T+7 (7 days after invoice date, no payment) | Friendly reminder | TPL-13 (Reminder — Friendly) |
| T+14 (14 days after invoice date, no payment) | Firm reminder — payment due | TPL-13 (Reminder — Due) |
| T+21 (7 days past due on 14-day terms) | Overdue notice | TPL-13 (Reminder — Overdue) |
| T+30 (escalation point) | Escalate to Dr. Gravesande for personal follow-up | Internal escalation |

**Reminder tone progression:** Each reminder is slightly firmer in tone. The T+7 reminder is warm and assumes the invoice may have been missed. The T+21 reminder is clear and businesslike. The T+30 escalation is a personal call from Dr. Gravesande.

---

### Step 5 — Overdue Escalation (T+30)

5.1. Dr. Gravesande makes a personal phone call to the client's primary contact.
5.2. Goal: understand the reason for non-payment (oversight, cash flow issue, dispute).
5.3. If payment dispute: investigate immediately. Was work completed as agreed? Is the invoice amount correct? Resolve the dispute and reissue if necessary.
5.4. If cash flow issue: offer a structured payment plan (written agreement required before agreeing). Log in `admin_notes` on the CRM record.
5.5. If no response after 30 days beyond due date: log in REG-06 (Non-Conformance Register). Assess whether to engage a collections process.

---

### Step 6 — Aged Receivables Review

6.1. Monthly: Dr. Gravesande reviews REG-05 to confirm no invoices are 30+ days overdue without a resolution plan.
6.2. Any invoice 60+ days overdue with no payment arrangement: assess write-off vs. collections.
6.3. Write-offs require Dr. Gravesande's explicit decision and are logged in REG-05 and REG-06.

---

## 7. Outputs

- Invoice sent and recorded in REG-05
- Payment confirmation sent on receipt
- Overdue invoices escalated and resolved
- Monthly AR review completed

---

## 8. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Invoice issued within 24hr of trigger event | 100% | Per invoice |
| Days Sales Outstanding (DSO) | ≤ 21 days | Monthly |
| Invoices paid within terms | ≥ 85% | Monthly |
| Overdue invoices (30+ days) | 0 unmanaged | Monthly |
| Invoice recording completeness | 100% in REG-05 | Per invoice |

---

## 9. Non-Conformance Handling

**Invoice sent with wrong amount:** Issue a credit note for the original invoice and reissue with the correct amount. Log in REG-06. Never simply send a "corrected" version without voiding the original.

**Client disputes a charge:** Investigate within 2 business days. If error is Preqal's: correct and reissue. If dispute is unfounded: provide written evidence of services rendered and request payment.

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
