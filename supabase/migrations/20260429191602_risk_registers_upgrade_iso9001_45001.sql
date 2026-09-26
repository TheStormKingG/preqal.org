-- 20260429191602  risk_registers_upgrade_iso9001_45001
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- ── QUALITY RISK REGISTER — ISO 9001 §6.1 upgrades ──────────────────────────
ALTER TABLE qms_quality_risk
  ADD COLUMN IF NOT EXISTS source         TEXT DEFAULT 'Manual',        -- Context Register / Process / Audit / NCR / Customer / Internal Review / Other
  ADD COLUMN IF NOT EXISTS source_ref     TEXT,                          -- e.g. CTX-2025-001
  ADD COLUMN IF NOT EXISTS risk_type      TEXT DEFAULT 'Risk',           -- Risk / Opportunity
  ADD COLUMN IF NOT EXISTS date_raised    DATE,
  ADD COLUMN IF NOT EXISTS treatment_option TEXT,                        -- Avoid / Reduce / Transfer / Accept / Exploit (Opportunity)
  ADD COLUMN IF NOT EXISTS qms_process    TEXT;                          -- Planning / Operations / Customer / Supplier / Monitoring / etc.

-- ── HSE RISK REGISTER — ISO 45001 §6.1.2 HIRA upgrades ─────────────────────
ALTER TABLE qms_hse_risk
  ADD COLUMN IF NOT EXISTS source              TEXT DEFAULT 'Manual',
  ADD COLUMN IF NOT EXISTS source_ref          TEXT,
  ADD COLUMN IF NOT EXISTS activity_task       TEXT,                     -- specific work activity/task being assessed
  ADD COLUMN IF NOT EXISTS hazard_event        TEXT,                     -- what could go wrong (the event/scenario)
  ADD COLUMN IF NOT EXISTS harm_potential      TEXT,                     -- nature of injury/illness that could result
  ADD COLUMN IF NOT EXISTS ctrl_elimination    TEXT,                     -- Hierarchy Level 1: Eliminate the hazard
  ADD COLUMN IF NOT EXISTS ctrl_substitution   TEXT,                     -- Hierarchy Level 2: Substitute with something safer
  ADD COLUMN IF NOT EXISTS ctrl_engineering    TEXT,                     -- Hierarchy Level 3: Engineering/isolation controls
  ADD COLUMN IF NOT EXISTS ctrl_administrative TEXT,                     -- Hierarchy Level 4: Work procedures, training, signage
  ADD COLUMN IF NOT EXISTS ctrl_ppe            TEXT,                     -- Hierarchy Level 5: Personal Protective Equipment
  ADD COLUMN IF NOT EXISTS alarp_justified     BOOLEAN DEFAULT FALSE,    -- residual risk is As Low As Reasonably Practicable
  ADD COLUMN IF NOT EXISTS legal_requirement   TEXT,                     -- applicable OH&S legislation/regulation
  ADD COLUMN IF NOT EXISTS date_assessed       DATE;

-- ── CONTEXT ISSUES — track auto-routing to risk registers ────────────────────
ALTER TABLE qms_context_issues
  ADD COLUMN IF NOT EXISTS linked_risk_id   TEXT,       -- e.g. QR-2025-001 or HSE-2025-001
  ADD COLUMN IF NOT EXISTS linked_risk_type TEXT;       -- 'qr' or 'hse'

