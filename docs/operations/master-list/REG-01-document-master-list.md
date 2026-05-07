# REG-01: Document Master List

**Document No:** REG-01
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**Classification:** Internal — Controlled Document
**ISO Reference:** ISO 9001:2015 Clause 7.5 (Documented Information)

---

## Purpose

This register is the single source of truth for all documented information within Preqal's Integrated Management System (IMS). It lists every document, template, form, register, policy, SOP, and diagram that governs how Preqal operates — both for human staff and agentic (AI) workers.

Every document listed here must be:
- Stored in a defined, retrievable location
- Versioned with an effective date
- Reviewed at least annually or upon process change
- Accessible to all relevant personnel (human or agentic)

---

## Document Categories

### 1. PROCESS FLOW DIAGRAMS (DIA)

| Doc No | Title | Version | Location | Status |
|--------|-------|---------|----------|--------|
| DIA-01 | Preqal Client Journey Process Flow | 1.0 | `docs/operations/process-flow/` | Active |

---

### 2. STANDARD OPERATING PROCEDURES (SOP)

| Doc No | Title | ISO Clause | Version | Owner | Status |
|--------|-------|-----------|---------|-------|--------|
| SOP-01 | Marketing & Lead Generation | 8.2.1 | 1.0 | Dr. Gravesande | Active |
| SOP-02 | Lead Capture & Classification (Form 1) | 8.2.2 | 1.0 | Dr. Gravesande | Active |
| SOP-03 | Quote Generation & Proposal | 8.2.3 | 1.0 | Dr. Gravesande | Active |
| SOP-04 | Contract Execution & Sign-off | 8.4 | 1.0 | Dr. Gravesande | Active |
| SOP-05 | Client Onboarding (Form 2) | 8.5.1 | 1.0 | Dr. Gravesande | Active |
| SOP-06 | Project Scoping & Delivery | 8.5.1 | 1.0 | Dr. Gravesande | Active |
| SOP-07 | Project Closure & Handover | 8.5.5 | 1.0 | Dr. Gravesande | Active |
| SOP-08 | Billing & Accounts Receivable | 8.5.5 | 1.0 | Dr. Gravesande | Active |
| SOP-09 | Renewal, Upsell & Client Retention | 9.1.2 | 1.0 | Dr. Gravesande | Active |
| SOP-10 | Admin Dashboard Operations | 7.5 | 1.0 | Dr. Gravesande | Active |

---

### 3. FORMS (FORM)

| Doc No | Title | Delivery | System Record | Status |
|--------|-------|----------|---------------|--------|
| FORM-01 | Business Growth Assessment (Lead Capture + Classification + Quote) | Web page: `/business-growth-assessment` | Supabase: `template_leads`, `quote_submissions` | Active |
| FORM-02 | Client Onboarding & Context Capture | Token-gated: `/client-onboarding.html?token=` | Supabase: `client_onboarding`, `crm_clients` | Active |

---

### 4. TEMPLATES (TPL)

| Doc No | Title | Format | Used In | Status |
|--------|-------|--------|---------|--------|
| TPL-01 | Quote Template | Google Docs / PDF | SOP-03 | Pending creation |
| TPL-02 | Service Proposal Template | Google Docs / PDF | SOP-03 | Pending creation |
| TPL-03 | Service Agreement / Contract Template | Google Docs / PDF | SOP-04 | Pending creation |
| TPL-04 | Invoice Template | Google Docs / PDF | SOP-08 | Pending creation |
| TPL-05 | Lead Notification Email | EmailJS template_lead | SOP-02 | Pending creation |
| TPL-06 | Proposal Cover Email | EmailJS template_proposal | SOP-03 | Pending creation |
| TPL-07 | Contract Welcome Email | EmailJS template_contract | SOP-04 | Pending creation |
| TPL-08 | Onboarding Invitation Email | EmailJS template_clonbrd | SOP-05 | Active (partial) |
| TPL-09 | Project Kickoff Agenda | Google Docs | SOP-06 | Pending creation |
| TPL-10 | Weekly Status Report | Google Docs / Email | SOP-06 | Pending creation |
| TPL-11 | Project Closure Report | Google Docs / PDF | SOP-07 | Pending creation |
| TPL-12 | Invoice Cover Email | EmailJS template_invoice | SOP-08 | Pending creation |
| TPL-13 | Payment Reminder Email (T+7, T+14, T+30) | EmailJS template_reminder | SOP-08 | Pending creation |
| TPL-14 | Renewal Reminder Email (T-30) | EmailJS template_renewal | SOP-09 | Pending creation |

---

### 5. REGISTERS (REG)

| Doc No | Title | Format | Updated By | Frequency | Status |
|--------|-------|--------|-----------|-----------|--------|
| REG-01 | Document Master List (this document) | Markdown / Admin Dashboard | Document Owner | On change | Active |
| REG-02 | Lead Register | Supabase: `template_leads` | Automated (Form 1) | Continuous | Active |
| REG-03 | Client Register | Supabase: `crm_clients` | Admin / Agentic | On change | Active |
| REG-04 | Project Register | Supabase: `crm_clients` (pipeline fields) | Admin | Weekly | Active |
| REG-05 | Invoice & Payment Register | Supabase: `invoices` (to be created) | Admin | On invoice event | Pending |
| REG-06 | Non-Conformance & CAPA Register | Supabase: `ncr_register` (to be created) | Admin | On NC event | Pending |
| REG-07 | Risk Register | Markdown / Notion | Dr. Gravesande | Quarterly | Pending |

---

### 6. POLICIES (POL)

| Doc No | Title | ISO Clause | Version | Status |
|--------|-------|-----------|---------|--------|
| POL-01 | Quality Policy | 5.2 | 1.0 | Pending creation |
| POL-02 | Data Protection & Privacy Policy | 7.5 / GDPR | 1.0 | Pending creation |
| POL-03 | Service Delivery & Scope Policy | 8.5 | 1.0 | Pending creation |
| POL-04 | Payment Terms & Credit Policy | 8.5.5 | 1.0 | Pending creation |
| POL-05 | Confidentiality & NDA Policy | 7.5 | 1.0 | Pending creation |

---

## How Documents Work Together

```
[Marketing — SOP-01]
        ↓
[Prospect visits preqal.org]
        ↓
[Submits FORM-01 → REG-02 (Lead Register)]
        ↓
[Admin reviews in Dashboard → SOP-02]
        ↓
[TPL-01 Quote + TPL-02 Proposal → SOP-03]
        ↓
[TPL-03 Contract signed → REG-03 (Client Register)]
        ↓
[Admin sends FORM-02 link → SOP-05]
        ↓
[Client completes FORM-02 → REG-03 updated]
        ↓
[Kickoff TPL-09 → Project delivery → SOP-06]
        ↓
[TPL-11 Closure + TPL-04 Invoice → SOP-07 + SOP-08]
        ↓
[REG-05 Payment tracked → TPL-13 if overdue]
        ↓
[T-30 → TPL-14 Renewal → SOP-09]
```

---

## Document Control Rules

1. **Every document has a unique number** — prefix-##-kebab-title format
2. **Version numbering** — 1.0 on release, 1.1 for minor edits, 2.0 for major revisions
3. **Only the Document Owner may approve version changes**
4. **Superseded versions are archived** — never deleted
5. **"Pending creation" documents** must be created before the relevant SOP can be considered fully implemented

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
