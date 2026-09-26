-- 20260429190029  context_of_organisation_register
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- ── NEW TABLE: Context Issues Register (ISO 9001 §4.1) ─────────────────────
CREATE TABLE IF NOT EXISTS qms_context_issues (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id          TEXT,
  issue_description  TEXT NOT NULL,
  context_category   TEXT DEFAULT 'External',   -- Internal / External
  factor_type        TEXT,                       -- PESTLE: Political / Economic / Social / Technological / Legal / Environmental / Climate Change / Organisational
  swot_type          TEXT,                       -- Strength / Weakness / Opportunity / Threat
  potential_impact   TEXT,                       -- free text: what area of the QMS / business is affected
  impact_level       INT CHECK (impact_level BETWEEN 1 AND 5),
  likelihood         INT CHECK (likelihood BETWEEN 1 AND 5),
  risk_rating        INT GENERATED ALWAYS AS (COALESCE(impact_level,0) * COALESCE(likelihood,0)) STORED,
  response_action    TEXT,                       -- how the org is addressing this
  owner              TEXT,
  status             TEXT DEFAULT 'active',      -- active / monitored / closed
  review_date        DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- ── EXPAND EXISTING: Interested Parties Register (ISO 9001 §4.2) ───────────
ALTER TABLE qms_org_register
  ADD COLUMN IF NOT EXISTS context_type        TEXT DEFAULT 'External',  -- Internal / External (separate from entity_type)
  ADD COLUMN IF NOT EXISTS needs_expectations  TEXT,                     -- what they need from the org
  ADD COLUMN IF NOT EXISTS relevant_requirements TEXT,                   -- standards / laws / contracts they impose
  ADD COLUMN IF NOT EXISTS compliance_obligation BOOLEAN DEFAULT FALSE,  -- is this a mandatory/compliance requirement?
  ADD COLUMN IF NOT EXISTS priority            TEXT DEFAULT 'Medium',    -- High / Medium / Low
  ADD COLUMN IF NOT EXISTS engagement_method   TEXT;                     -- how we monitor / communicate

-- ── RLS on new table ────────────────────────────────────────────────────────
ALTER TABLE qms_context_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_context_issues"   ON qms_context_issues FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_context_issues"   ON qms_context_issues FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_context_issues"   ON qms_context_issues FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_context_issues"   ON qms_context_issues FOR DELETE TO anon USING (true);

CREATE POLICY "auth_select_context_issues"   ON qms_context_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_context_issues"   ON qms_context_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_context_issues"   ON qms_context_issues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_context_issues"   ON qms_context_issues FOR DELETE TO authenticated USING (true);

