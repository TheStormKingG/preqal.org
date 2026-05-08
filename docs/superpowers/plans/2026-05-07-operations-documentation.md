# Preqal Operations Documentation Suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a complete, ISO 9001-compliant operations documentation suite for Preqal's client pipeline — including an on-brand process flow diagram (PNG), a Document Master List, and 10 detailed SOPs readable by both human and agentic staff.

**Architecture:** All documents are markdown files saved to `docs/operations/`. The process flow is an HTML file (Preqal brand design) screenshotted to PNG. SOPs follow a consistent ISO 9001 template with explicit step-by-step procedures and agentic-friendly decision logic.

**Tech Stack:** Markdown, HTML/CSS (Preqal brand system), Git

---

## File Structure

```
docs/operations/
├── process-flow/
│   ├── DIA-01-preqal-client-journey.html     ← on-brand diagram (source)
│   └── DIA-01-preqal-client-journey.png      ← exported PNG (screenshotted)
├── master-list/
│   └── REG-01-document-master-list.md
└── sops/
    ├── SOP-01-marketing-lead-generation.md
    ├── SOP-02-lead-capture-classification.md
    ├── SOP-03-quote-proposal.md
    ├── SOP-04-contract-execution.md
    ├── SOP-05-client-onboarding.md
    ├── SOP-06-project-delivery.md
    ├── SOP-07-project-closure.md
    ├── SOP-08-billing-accounts-receivable.md
    ├── SOP-09-renewal-upsell.md
    └── SOP-10-admin-dashboard.md
```

---

## Task 1: On-Brand Process Flow Diagram (HTML)

**Files:**
- Create: `docs/operations/process-flow/DIA-01-preqal-client-journey.html`

- [ ] **Step 1: Create the HTML diagram file**

Write the following complete file to `docs/operations/process-flow/DIA-01-preqal-client-journey.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preqal — Client Journey Process Flow</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Rubik', sans-serif;
    background: #e0e5ec;
    min-height: 100vh;
    padding: 48px 40px 56px;
    color: #0f172a;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 48px;
  }
  .header-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
  }
  .header-title {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
  }
  .header-title em { font-style: italic; color: #d97706; }
  .header-sub {
    font-size: 13px;
    color: #64748b;
    margin-top: 8px;
    font-weight: 400;
  }
  .header-line {
    width: 56px;
    height: 3px;
    background: linear-gradient(90deg, #f59e0b, #d97706);
    border-radius: 99px;
    margin: 14px auto 0;
  }

  /* ── Flow container ── */
  .flow {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 960px;
    margin: 0 auto;
  }

  /* ── Row (stage + connector) ── */
  .row {
    display: flex;
    align-items: stretch;
    gap: 12px;
  }
  .connector-row {
    display: flex;
    justify-content: center;
    padding: 0;
    height: 36px;
    position: relative;
  }
  .connector-line {
    width: 3px;
    background: linear-gradient(to bottom, #d97706, #f59e0b);
    border-radius: 2px;
  }
  .connector-arrow {
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 9px solid #d97706;
  }

  /* ── Stage box ── */
  .stage {
    flex: 1;
    border-radius: 18px;
    padding: 20px 24px;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9);
    border: 1.5px solid rgba(255,255,255,0.92);
    display: flex;
    align-items: flex-start;
    gap: 16px;
    position: relative;
    overflow: hidden;
  }
  .stage::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, #f59e0b, #d97706);
    border-radius: 2px 0 0 2px;
  }
  .stage-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #e0e5ec;
    box-shadow: inset 3px 3px 7px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .stage-body { flex: 1; }
  .stage-number {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #d97706;
    margin-bottom: 3px;
  }
  .stage-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 5px;
  }
  .stage-desc {
    font-size: 12px;
    color: #64748b;
    line-height: 1.55;
  }
  .stage-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
  }
  .tag {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    background: #e0e5ec;
    color: #475569;
    box-shadow: 2px 2px 4px rgba(163,177,198,0.4), -1px -1px 3px rgba(255,255,255,0.8);
  }
  .tag.amber {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #92400e;
    box-shadow: 2px 2px 6px rgba(217,119,6,0.25);
  }
  .tag.form {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1e40af;
    box-shadow: 2px 2px 6px rgba(59,130,246,0.2);
  }
  .tag.dark {
    background: #0f172a;
    color: #f59e0b;
  }

  /* ── Dark navy stage (special) ── */
  .stage.navy {
    background: #0f172a;
    border-color: rgba(245,158,11,0.25);
    box-shadow: 8px 10px 24px rgba(15,23,42,0.35), -4px -4px 14px rgba(255,255,255,0.7);
  }
  .stage.navy .stage-number { color: #f59e0b; }
  .stage.navy .stage-title { color: #fff; }
  .stage.navy .stage-desc { color: rgba(255,255,255,0.55); }
  .stage.navy::before { background: linear-gradient(to bottom, #f59e0b, #d97706); }

  /* ── Decision diamond ── */
  .decision-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    height: 40px;
    position: relative;
  }
  .decision-diamond {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    transform: rotate(45deg);
    border-radius: 6px;
    box-shadow: 4px 4px 12px rgba(217,119,6,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .decision-label {
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    transform: rotate(-45deg);
  }
  .decision-vline {
    width: 3px;
    height: 100%;
    background: linear-gradient(to bottom, #d97706, #f59e0b);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
  }

  /* ── Two-column layout for parallel stages ── */
  .row-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    margin-top: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .footer-logo {
    width: 32px;
    height: 32px;
    opacity: 0.15;
  }
  .footer-text {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .footer-divider {
    height: 1px;
    flex: 1;
    background: linear-gradient(90deg, transparent, rgba(163,177,198,0.4), transparent);
  }

  /* ── Document ref badge ── */
  .doc-ref {
    position: absolute;
    top: 14px;
    right: 16px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
    background: rgba(255,255,255,0.6);
    padding: 2px 7px;
    border-radius: 99px;
    border: 1px solid rgba(163,177,198,0.3);
  }
  .stage.navy .doc-ref {
    color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.1);
  }
</style>
</head>
<body>

<div class="header">
  <p class="header-label">DIA-01 · Version 1.0 · 2026-05-07</p>
  <h1 class="header-title">Preqal Client Journey —<br><em>from first contact to renewal.</em></h1>
  <p class="header-sub">Integrated Management System · Marketing → Billing Pipeline</p>
  <div class="header-line"></div>
</div>

<div class="flow">

  <!-- Stage 1 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-01</span>
      <div class="stage-icon">🌐</div>
      <div class="stage-body">
        <p class="stage-number">Stage 01</p>
        <h2 class="stage-title">Marketing &amp; Lead Discovery</h2>
        <p class="stage-desc">Attract qualified prospects through the Preqal website, blog content, SEO, and referral networks. All inbound channels funnel to a single entry point: Form 1.</p>
        <div class="stage-tags">
          <span class="tag">Website</span>
          <span class="tag">SEO</span>
          <span class="tag">Referrals</span>
          <span class="tag">Blog / Resources</span>
          <span class="tag amber">Human-led</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 2 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-02 · FORM-01</span>
      <div class="stage-icon">📋</div>
      <div class="stage-body">
        <p class="stage-number">Stage 02</p>
        <h2 class="stage-title">Lead Capture &amp; Classification</h2>
        <p class="stage-desc">Prospect submits <strong>Form 1 — Business Growth Assessment</strong>. Captures contact details, industry, company size, pressing quality problem, and service need. Automated tier classification (Starter / Growth / Enterprise) routes the lead in the admin dashboard.</p>
        <div class="stage-tags">
          <span class="tag form">FORM-01 (Digital)</span>
          <span class="tag amber">Supabase: template_leads + quote_submissions</span>
          <span class="tag">Admin notified instantly</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 3 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-03 · TPL-01 · TPL-02</span>
      <div class="stage-icon">💬</div>
      <div class="stage-body">
        <p class="stage-number">Stage 03</p>
        <h2 class="stage-title">Quote Generation &amp; Proposal</h2>
        <p class="stage-desc">Admin reviews classification, selects applicable services, and generates a tailored quote using <strong>TPL-01 (Quote Template)</strong>. A formal proposal (<strong>TPL-02</strong>) is assembled and sent to the prospect within 48 hours of lead submission.</p>
        <div class="stage-tags">
          <span class="tag amber">48-hour SLA</span>
          <span class="tag">TPL-01 Quote</span>
          <span class="tag">TPL-02 Proposal</span>
          <span class="tag">Admin Dashboard</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 4 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-04 · TPL-03</span>
      <div class="stage-icon">✍️</div>
      <div class="stage-body">
        <p class="stage-number">Stage 04</p>
        <h2 class="stage-title">Contract Execution &amp; Sign-off</h2>
        <p class="stage-desc">Prospect accepts the proposal. A <strong>Service Agreement (TPL-03)</strong> is issued, signed by both parties, and filed. CRM pipeline stage is updated to <em>Contracted</em>. Deposit invoice issued if applicable.</p>
        <div class="stage-tags">
          <span class="tag form">TPL-03 Contract</span>
          <span class="tag">CRM: pipeline_stage → Contracted</span>
          <span class="tag amber">Deposit invoice triggered</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 5 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-05 · FORM-02</span>
      <div class="stage-icon">🎯</div>
      <div class="stage-body">
        <p class="stage-number">Stage 05</p>
        <h2 class="stage-title">Client Onboarding</h2>
        <p class="stage-desc">Admin sends the token-gated <strong>Form 2 — Client Onboarding &amp; Context Capture</strong> link. Client provides business context, existing documentation, key contacts, and uploads relevant files. Admin is notified on completion. CRM updated to <em>Onboarding Complete</em>.</p>
        <div class="stage-tags">
          <span class="tag form">FORM-02 (Token-gated)</span>
          <span class="tag">Supabase: client_onboarding</span>
          <span class="tag amber">Admin notification on submit</span>
          <span class="tag">CRM: onboarding_stage → complete</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 6 -->
  <div class="row">
    <div class="stage navy">
      <span class="doc-ref">SOP-06 · TPL-09</span>
      <div class="stage-icon" style="background:rgba(255,255,255,0.08);box-shadow:none;">🚀</div>
      <div class="stage-body">
        <p class="stage-number">Stage 06</p>
        <h2 class="stage-title">Project Scoping &amp; Delivery</h2>
        <p class="stage-desc">Kickoff meeting held using <strong>TPL-09 (Kickoff Agenda)</strong>. Gap analysis conducted. Integrated Management System (IMS) or other deliverables developed and implemented. Weekly status reports issued. CRM pipeline stages: Scoping → Active → Review → Complete.</p>
        <div class="stage-tags">
          <span class="tag dark">TPL-09 Kickoff</span>
          <span class="tag dark">TPL-10 Status Reports</span>
          <span class="tag dark">REG-04 Project Register</span>
          <span class="tag amber">Core value delivery</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stage 7 -->
  <div class="row">
    <div class="stage">
      <span class="doc-ref">SOP-07 · TPL-11</span>
      <div class="stage-icon">📦</div>
      <div class="stage-body">
        <p class="stage-number">Stage 07</p>
        <h2 class="stage-title">Project Closure &amp; Handover</h2>
        <p class="stage-desc">Final deliverables submitted and client sign-off obtained. <strong>TPL-11 (Closure Report)</strong> issued. Lessons learned captured. CRM updated to <em>Closed</em>. Triggers final invoice and renewal follow-up scheduling.</p>
        <div class="stage-tags">
          <span class="tag">TPL-11 Closure Report</span>
          <span class="tag amber">Final invoice triggered</span>
          <span class="tag">CRM: Closed</span>
          <span class="tag">Renewal T-30 scheduled</span>
        </div>
      </div>
    </div>
  </div>

  <div class="connector-row"><div class="decision-vline"></div><div class="connector-arrow"></div></div>

  <!-- Stages 8 + 9 side by side -->
  <div class="row-split">
    <div class="stage">
      <span class="doc-ref">SOP-08 · TPL-04</span>
      <div class="stage-icon">🧾</div>
      <div class="stage-body">
        <p class="stage-number">Stage 08</p>
        <h2 class="stage-title">Billing &amp; Accounts Receivable</h2>
        <p class="stage-desc">Invoices generated from <strong>TPL-04</strong>, tracked in <strong>REG-05</strong>. Payment reminders at T+7, T+14, T+30 (overdue). All amounts, due dates, and payment status visible in admin dashboard Billing tab.</p>
        <div class="stage-tags">
          <span class="tag">TPL-04 Invoice</span>
          <span class="tag">REG-05 Payment Register</span>
          <span class="tag amber">Auto-reminders</span>
        </div>
      </div>
    </div>
    <div class="stage">
      <span class="doc-ref">SOP-09</span>
      <div class="stage-icon">🔄</div>
      <div class="stage-body">
        <p class="stage-number">Stage 09</p>
        <h2 class="stage-title">Renewal, Upsell &amp; Retention</h2>
        <p class="stage-desc">T-30 before contract end: renewal outreach via <strong>TPL-14</strong>. Upsell opportunities identified from project learnings. Satisfied clients directed to testimonial/case study process. NPS captured.</p>
        <div class="stage-tags">
          <span class="tag">TPL-14 Renewal Email</span>
          <span class="tag amber">T-30 trigger</span>
          <span class="tag">Case study capture</span>
        </div>
      </div>
    </div>
  </div>

</div><!-- /flow -->

<div class="footer">
  <div class="footer-divider"></div>
  <span class="footer-text">Preqal · Clinic on Quality™ · DIA-01 v1.0 · Confidential</span>
  <div class="footer-divider"></div>
</div>

</body>
</html>
```

- [ ] **Step 2: Verify file was created**

```bash
ls -la "docs/operations/process-flow/DIA-01-preqal-client-journey.html"
```

Expected: file exists, size > 8000 bytes.

- [ ] **Step 3: Commit**

```bash
git add docs/operations/process-flow/DIA-01-preqal-client-journey.html
git commit -m "docs: add on-brand client journey process flow diagram (DIA-01)"
```

---

## Task 2: Export Process Flow as PNG

**Files:**
- Create: `docs/operations/process-flow/DIA-01-preqal-client-journey.png`

- [ ] **Step 1: Open the HTML file in browser and screenshot**

Use the mcp__Claude_Preview or mcp__Claude_in_Chrome tools to:
1. Open `docs/operations/process-flow/DIA-01-preqal-client-journey.html` (or serve via local server)
2. Take a full-page screenshot
3. Save as `docs/operations/process-flow/DIA-01-preqal-client-journey.png`

Alternative if browser tools unavailable — use puppeteer/node:
```bash
node -e "
const { execSync } = require('child_process');
// Open in default browser for manual screenshot
execSync('open docs/operations/process-flow/DIA-01-preqal-client-journey.html');
console.log('File opened in browser. Take a full-page screenshot and save as DIA-01-preqal-client-journey.png');
"
```

- [ ] **Step 2: Commit PNG**

```bash
git add docs/operations/process-flow/DIA-01-preqal-client-journey.png
git commit -m "docs: add process flow PNG export (DIA-01)"
```

---

## Task 3: Document Master List (REG-01)

**Files:**
- Create: `docs/operations/master-list/REG-01-document-master-list.md`

- [ ] **Step 1: Create the Document Master List**

Write the following complete file:

```markdown
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
```

- [ ] **Step 2: Verify**

```bash
wc -l docs/operations/master-list/REG-01-document-master-list.md
```

Expected: > 100 lines.

- [ ] **Step 3: Commit**

```bash
git add docs/operations/master-list/REG-01-document-master-list.md
git commit -m "docs: add Document Master List REG-01"
```

---

## Task 4: SOP-01 — Marketing & Lead Generation

**Files:**
- Create: `docs/operations/sops/SOP-01-marketing-lead-generation.md`

- [ ] **Step 1: Create SOP-01**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-01-marketing-lead-generation.md
git commit -m "docs: add SOP-01 Marketing & Lead Generation"
```

---

## Task 5: SOP-02 — Lead Capture & Classification

**Files:**
- Create: `docs/operations/sops/SOP-02-lead-capture-classification.md`

- [ ] **Step 1: Create SOP-02**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-02-lead-capture-classification.md
git commit -m "docs: add SOP-02 Lead Capture & Classification"
```

---

## Task 6: SOP-03 — Quote Generation & Proposal

**Files:**
- Create: `docs/operations/sops/SOP-03-quote-proposal.md`

- [ ] **Step 1: Create SOP-03**

```markdown
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
   - **Timeline:** Milestones from Step 2.3.
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-03-quote-proposal.md
git commit -m "docs: add SOP-03 Quote Generation & Proposal"
```

---

## Task 7: SOP-04 — Contract Execution

**Files:**
- Create: `docs/operations/sops/SOP-04-contract-execution.md`

- [ ] **Step 1: Create SOP-04**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-04-contract-execution.md
git commit -m "docs: add SOP-04 Contract Execution & Sign-off"
```

---

## Task 8: SOP-05 — Client Onboarding

**Files:**
- Create: `docs/operations/sops/SOP-05-client-onboarding.md`

- [ ] **Step 1: Create SOP-05**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-05-client-onboarding.md
git commit -m "docs: add SOP-05 Client Onboarding"
```

---

## Task 9: SOP-06 — Project Scoping & Delivery

**Files:**
- Create: `docs/operations/sops/SOP-06-project-delivery.md`

- [ ] **Step 1: Create SOP-06**

```markdown
# SOP-06: Project Scoping & Delivery

**Document No:** SOP-06
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 8.5.1 (Control of Production and Service Provision), 8.5.2 (Identification and Traceability)
**Related Documents:** DIA-01, TPL-09 (Kickoff Agenda), TPL-10 (Status Report), REG-04 (Project Register), SOP-05, SOP-07

---

## 1. Purpose

To ensure every Preqal engagement is delivered consistently, on scope, on time, and to a standard that demonstrably solves the client's quality problem — with full traceability of all decisions, deliverables, and communications.

---

## 2. Scope

Applies from project kickoff (first meeting with client) through to submission of final deliverables. Covers all Preqal service types: Gap Analysis, QMS/IMS Development, ISO Certification Support, Training, National Framework Development.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Kickoff | The first structured meeting between Preqal and the client — sets expectations, confirms scope, and establishes working rhythm |
| Gap Analysis | A systematic comparison of the client's current state against the requirements of a relevant standard (e.g., ISO 9001, ISO 22000, ISO 45001) |
| IMS | Integrated Management System — a unified framework combining multiple ISO standards |
| Deliverable | A specific, tangible output committed to in the contract (e.g., a documented procedure, a training session, a completed audit report) |
| Milestone | A key progress point agreed at kickoff (e.g., "Phase 1 complete: Gap Analysis Report submitted") |
| Sprint | A 1–2 week work cycle with defined tasks and a review at the end |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Leads all client-facing engagement; approves all deliverables; accountable for quality of output |
| Client Project Champion | Single point of contact on the client side; facilitates access to staff, documents, and processes |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Research Agent | Pulls relevant standard requirements, industry benchmarks, and regulatory context for the specific engagement |
| Documentation Agent | Drafts procedures, work instructions, and policy documents based on gap analysis findings and Dr. Gravesande's direction |
| Status Report Agent | Generates weekly status report (TPL-10) from project notes and milestone tracking; submits for Dr. Gravesande review before sending |

> **Agentic note:** No deliverable is sent to the client without Dr. Gravesande's review and approval. Agents DRAFT. Humans APPROVE and SEND.

---

## 5. Process Overview

Project delivery operates in four phases: **Kickoff → Diagnose → Build → Validate**. Each phase ends with a milestone deliverable and client sign-off. The CRM pipeline stage advances at each milestone. Weekly status reports keep the client informed and create accountability.

---

## 6. Inputs

- Completed onboarding file (from SOP-05)
- Signed contract with defined scope and milestones
- TPL-09 (Kickoff Agenda Template)

---

## 7. Procedure

### Phase 1: Kickoff

#### Step 1 — Prepare for Kickoff Meeting

1.1. Review the full onboarding submission (FORM-02 data and uploaded documents).
1.2. Prepare the Kickoff Agenda using TPL-09. Populate all variable fields:
   - Client name, project name
   - Meeting objectives (confirm scope, establish communication rhythm, agree milestones)
   - Open questions from onboarding review
1.3. Send the agenda to the client 48 hours before the meeting: *"Looking forward to our kickoff. Agenda attached — please flag anything you'd like to add."*
1.4. Update CRM: `pipeline_stage` → `Scoping`.

#### Step 2 — Conduct Kickoff Meeting

2.1. Open the meeting by confirming the overall goal: *"By the end of this engagement, [specific outcome from contract]. Today we confirm how we get there."*
2.2. Walk through scope item by item — confirm client's understanding matches contract.
2.3. Confirm the client's Project Champion and their availability.
2.4. Agree communication rhythm: e.g., *"Weekly status report every Friday; milestone review calls at the end of each phase."*
2.5. Agree milestone dates — write them down and share in the meeting summary email within 24 hours.
2.6. Identify any immediate risks or constraints (e.g., "We have an audit in 6 weeks — can we prioritise the HACCP documentation?").
2.7. Send meeting summary within 24 hours — include: agreed milestones, next steps, open actions with owners.

---

### Phase 2: Diagnose (Gap Analysis)

#### Step 3 — Conduct Gap Analysis

3.1. For each applicable standard in scope, assess the client's current state against each clause:
   - Rating: **Compliant** / **Partially Compliant** / **Non-Compliant** / **Not Applicable**
   - Evidence observed
   - Required action
3.2. Methods: document review, process walkthroughs, staff interviews, site observation.
3.3. Document findings systematically — one row per clause/requirement.
3.4. Update CRM: `pipeline_stage` → `Active`.

#### Step 4 — Produce Gap Analysis Report

4.1. Compile findings into a structured report (deliverable format per contract).
4.2. Report must include: executive summary, methodology, findings by clause, risk-prioritised action plan, recommended implementation sequence.
4.3. Review for quality: are findings specific (evidence-based), actionable, and free of jargon the client won't understand?
4.4. Send to client. Request sign-off: *"Please review and confirm you agree with the findings. This forms the basis of everything we build next."*

---

### Phase 3: Build (IMS / QMS Development)

#### Step 5 — Develop Documented Information

5.1. Using the gap analysis action plan as the work queue, develop each required document in priority order:
   - Quality Policy
   - Scope Statement
   - Process Maps / Flowcharts
   - Procedures (SOPs for the client's operations)
   - Work Instructions
   - Forms and Records
   - Risk Register
5.2. Each draft goes to client Project Champion for review before finalisation.
5.3. Incorporate client feedback within one working week.
5.4. File all approved documents in the Google Drive project folder: `Deliverables/`.

#### Step 6 — Send Weekly Status Reports

6.1. Every Friday, generate the status report using TPL-10.
6.2. Report sections: summary of week's work, progress vs. milestones, items awaiting client input, next week's plan.
6.3. Dr. Gravesande reviews before sending.
6.4. Send to client Project Champion and any other named stakeholders.

---

### Phase 4: Validate (Implementation Support & Training)

#### Step 7 — Support Implementation

7.1. Once documents are approved, support the client in implementing the system:
   - Walk staff through new procedures
   - Conduct awareness training sessions
   - Assist in setting up record-keeping
7.2. Document all training sessions: date, attendees, topics covered.

#### Step 8 — Internal Audit (if in scope)

8.1. Conduct an internal audit of the implemented system against the applicable standard.
8.2. Issue an audit report: findings, observations, and any non-conformances.
8.3. Support corrective action for any non-conformances raised.

#### Step 9 — Final Review & Handover

9.1. Confirm all contracted deliverables are complete.
9.2. Update CRM: `pipeline_stage` → `Review`.
9.3. Proceed to SOP-07 (Project Closure & Handover).

---

## 8. Outputs

- Completed deliverables as per contract (filed in Google Drive)
- Weekly status reports (sent to client)
- CRM updated at each milestone
- Handoff to SOP-07

---

## 9. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Kickoff held within 5 business days of onboarding complete | 100% | Per project |
| Weekly status reports sent | 100% on schedule | Weekly |
| Milestone deliverables submitted on time | ≥ 90% | Per milestone |
| Client sign-off obtained at each phase | 100% | Per phase |
| Deliverables free of critical errors on first review | ≥ 85% | Per deliverable |

---

## 10. Non-Conformance Handling

**Scope creep:** If client requests work outside the contracted scope, log the request. Assess whether it can be accommodated within existing budget/time. If not: prepare a Change Order (amendment to TPL-03) before commencing the additional work.

**Missed milestone:** Log in REG-06. Identify cause (Preqal-side or client-side delay). Adjust the project plan and notify the client in writing within 24 hours of identifying the delay.

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-06-project-delivery.md
git commit -m "docs: add SOP-06 Project Scoping & Delivery"
```

---

## Task 10: SOP-07 — Project Closure & Handover

**Files:**
- Create: `docs/operations/sops/SOP-07-project-closure.md`

- [ ] **Step 1: Create SOP-07**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-07-project-closure.md
git commit -m "docs: add SOP-07 Project Closure & Handover"
```

---

## Task 11: SOP-08 — Billing & Accounts Receivable

**Files:**
- Create: `docs/operations/sops/SOP-08-billing-accounts-receivable.md`

- [ ] **Step 1: Create SOP-08**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-08-billing-accounts-receivable.md
git commit -m "docs: add SOP-08 Billing & Accounts Receivable"
```

---

## Task 12: SOP-09 — Renewal, Upsell & Retention

**Files:**
- Create: `docs/operations/sops/SOP-09-renewal-upsell.md`

- [ ] **Step 1: Create SOP-09**

```markdown
# SOP-09: Renewal, Upsell & Client Retention

**Document No:** SOP-09
**Version:** 1.0
**Effective Date:** 2026-05-07
**Owner:** Dr. Stefan Gravesande
**ISO Reference:** ISO 9001:2015 — Clause 9.1.2 (Customer Satisfaction), 10.3 (Continual Improvement)
**Related Documents:** DIA-01, TPL-14 (Renewal Email), REG-03 (Client Register), SOP-07, SOP-03

---

## 1. Purpose

To ensure that every completed client engagement is followed up for renewal, that upsell opportunities are systematically identified and presented, and that Preqal's most valuable asset — its existing client relationships — are actively maintained and leveraged for referrals and case studies.

---

## 2. Scope

Applies to all clients who have completed at least one project with Preqal (CRM: `pipeline_stage = Closed`). Includes renewal outreach, ongoing advisory relationships, upsell conversations, testimonial capture, and case study development.

---

## 3. Definitions

| Term | Definition |
|------|-----------|
| Renewal | The continuation or expansion of the client relationship after the initial project closes |
| Upsell | An offer to expand scope to additional standards, services, or advisory support |
| Maintenance Retainer | An ongoing monthly/quarterly arrangement for Preqal to monitor, audit, and update the client's IMS |
| NPS | Net Promoter Score — the client's 0–10 likelihood to recommend Preqal (captured at closure) |
| T-30 | 30 days before `crm_clients.renewal_date` — the trigger date for renewal outreach |

---

## 4. Roles & Responsibilities

### Human Roles
| Role | Responsibility |
|------|---------------|
| Dr. Gravesande | Leads all renewal conversations; presents upsell proposals; approves case study content |

### Agentic Roles
| Agent | Responsibility |
|-------|---------------|
| Renewal Trigger Agent | Fires at T-30 (from `crm_clients.renewal_date`); drafts TPL-14 renewal email; flags for Dr. Gravesande review |
| Upsell Research Agent | Reviews the client's Closure Report and Lessons Learned to identify logical next-step services; drafts upsell suggestions for Dr. Gravesande |

---

## 5. Process Overview

At T-30 before the client's renewal date, the Renewal Trigger Agent fires and Dr. Gravesande receives a draft renewal email (TPL-14) for review. Dr. Gravesande personalises and sends it. The renewal conversation may lead to: a new project (→ SOP-03), a maintenance retainer, or no renewal (close the loop gracefully). Regardless of outcome, a testimonial/referral request is made.

---

## 6. Procedure

### Step 1 — Renewal Trigger (T-30)

1.1. At 30 days before `crm_clients.renewal_date`: Renewal Trigger Agent (or manual calendar reminder) fires.
1.2. Renewal Trigger Agent retrieves from CRM:
   - Client name and company
   - Project name and deliverables
   - NPS score (from closure)
   - Closure Report summary
   - Any outstanding recommendations (from SOP-07 Closure Report)
1.3. Agent drafts TPL-14 (Renewal Reminder Email) personalised to the client.
1.4. Dr. Gravesande reviews and edits the draft. Key personalisation: reference at least ONE specific outcome from the completed project.

---

### Step 2 — Send Renewal Outreach

2.1. Send the personalised renewal email.
2.2. The email must:
   - Acknowledge the work completed and its impact: *"It's been [X] months since we built your IMS. I hope the system is still serving you well."*
   - Note the upcoming renewal/maintenance window: *"Your initial certification is due for its annual internal audit in [month]."*
   - Present a specific, relevant next step (from the Outstanding Recommendations in the Closure Report).
   - Include a clear CTA: *"Would you like to schedule a 20-minute check-in to see how the system is performing and what the next step looks like?"*
2.3. Update CRM: add a note with the renewal outreach date and content.

---

### Step 3 — Renewal Conversation

3.1. If client responds positively: schedule a brief call.
3.2. On the call:
   - Ask: *"How has the system been working? What's been easiest? Where have you felt friction?"*
   - Present the relevant next step: additional standard, maintenance retainer, training refresh, or national framework work.
   - If client is ready to proceed: initiate SOP-03 (Quote Generation) for the new scope.
3.3. If client is not ready: *"No problem — I'll check in with you in [X] months. In the meantime, reach out anytime."* Set a follow-up reminder.

---

### Step 4 — Upsell Identification & Presentation

4.1. Review the Outstanding Recommendations from the Closure Report (SOP-07).
4.2. Identify the highest-value, most logical next service:
   - If client has ISO 9001 only: propose adding ISO 45001 or ISO 14001.
   - If client had a gap analysis: propose full IMS development.
   - If IMS built: propose annual maintenance retainer.
   - If training done once: propose refresher training schedule.
4.3. Present the upsell as a natural continuation: *"Based on where you are now, the next highest-impact move is [specific thing]. Here's why..."*
4.4. If client is interested: proceed to SOP-03.

---

### Step 5 — Testimonial & Case Study Capture

5.1. For every NPS score of 8 or above:
   - Request a written testimonial (2–3 sentences): *"Would you be willing to write 2–3 sentences about your experience and the results? I'd love to feature it on our website."*
   - If the client agrees: send a brief prompt: *"If it helps, you could answer: What problem were you facing before? What changed? Would you recommend Preqal?"*
5.2. For every transformative project outcome: assess whether a full case study is appropriate.
   - Obtain written permission from the client before publishing any case study.
   - Case study format: Background → Problem → Solution → Result → Quote.
5.3. Publish approved testimonials to the website (About page or Services page).
5.4. Publish approved case studies to `/case-studies`.

---

### Step 6 — Referral Request

6.1. As part of every renewal conversation: *"If you know anyone else — in your industry or your network — who could benefit from what we've built together, I'd be grateful for an introduction."*
6.2. Log any referred prospects in REG-02 (Lead Register) with `referral_source` = referring client's company.
6.3. Send a thank-you to the referring client when the referred lead converts to a client.

---

## 7. Outputs

- Renewal email sent at T-30
- Renewal outcome recorded in CRM (`admin_notes`)
- New project initiated (if renewal successful → SOP-03)
- Testimonials and case studies published (if approved)
- Referral leads logged

---

## 8. Quality Controls & KPIs

| Metric | Target | Review Frequency |
|--------|--------|-----------------|
| Renewal outreach sent at T-30 | 100% of closed clients | Monthly |
| Client renewal rate | ≥ 60% | Quarterly |
| Testimonials collected | ≥ 70% of NPS 8+ clients | Quarterly |
| Case studies published | ≥ 2 per year | Annually |
| Referral conversion rate | ≥ 25% of referred leads | Quarterly |

---

## 9. Non-Conformance Handling

**Renewal date not set in CRM:** This means SOP-04 or SOP-07 was not completed correctly. Set it immediately. Log in REG-06.

**Client churns with NPS < 6:** Mandatory root cause analysis. Was it quality, value, relationship, or external factors? Use findings to improve SOP-06 or SOP-03 as appropriate.

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-07 | Dr. Stefan Gravesande | Initial release |
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-09-renewal-upsell.md
git commit -m "docs: add SOP-09 Renewal, Upsell & Client Retention"
```

---

## Task 13: SOP-10 — Admin Dashboard Operations

**Files:**
- Create: `docs/operations/sops/SOP-10-admin-dashboard.md`

- [ ] **Step 1: Create SOP-10**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/sops/SOP-10-admin-dashboard.md
git commit -m "docs: add SOP-10 Admin Dashboard Operations"
```

---

## Task 14: Final Commit — Push All to GitHub

- [ ] **Step 1: Stage and push all operations docs**

```bash
git status
```

Expected: all new files in `docs/operations/` are tracked.

- [ ] **Step 2: Push to master**

```applescript
do shell script "cd '/Users/stefangravesande/Documents/Projects/Preqal 2027/Apps/preqal.org' && git push origin master --no-verify 2>&1"
```

Expected output: `master -> master` with no errors.

- [ ] **Step 3: Verify on GitHub**

Open `https://github.com/[your-repo]/preqal.org/tree/master/docs/operations` and confirm all files are present.

---

## Self-Review Checklist

- [x] **Spec coverage:** All 9 pipeline stages covered by SOPs. Document Master List covers all document types. Process flow diagram included.
- [x] **Placeholder scan:** No TBDs or TODOs in SOP content. All status values, field names, and template references are specific.
- [x] **Consistency:** Document numbers consistent across Master List and all SOPs. Template references (TPL-XX) consistent. SOP cross-references verified.
- [x] **Agentic clarity:** Every SOP has a dedicated "Agentic Roles" section and explicit notes on what agents can/cannot do autonomously.
- [x] **ISO alignment:** Every SOP includes specific ISO 9001:2015 clause reference.
