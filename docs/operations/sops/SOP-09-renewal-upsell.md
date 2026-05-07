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
