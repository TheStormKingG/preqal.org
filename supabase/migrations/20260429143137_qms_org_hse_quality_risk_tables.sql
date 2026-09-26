-- 20260429143137  qms_org_hse_quality_risk_tables
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Organisation / Interested Parties Register
CREATE TABLE IF NOT EXISTS qms_org_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'Internal'
    CHECK (entity_type IN ('Internal','External','Supplier','Customer','Regulator','Partner','Interested Party')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  role_responsibility TEXT,
  relevance TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','under_review')),
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE qms_org_register ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_org ON qms_org_register;
CREATE POLICY allow_all_org ON qms_org_register FOR ALL TO anon USING (true) WITH CHECK (true);

-- HSE Risk Register
CREATE TABLE IF NOT EXISTS qms_hse_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  hazard TEXT NOT NULL,
  hazard_category TEXT NOT NULL DEFAULT 'Physical'
    CHECK (hazard_category IN ('Physical','Chemical','Biological','Ergonomic','Psychosocial','Environmental','Fire','Electrical','Other')),
  location_activity TEXT,
  persons_at_risk TEXT,
  existing_controls TEXT,
  likelihood SMALLINT NOT NULL DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
  consequence SMALLINT NOT NULL DEFAULT 3 CHECK (consequence BETWEEN 1 AND 5),
  risk_rating SMALLINT NOT NULL DEFAULT 9,
  additional_controls TEXT,
  responsible_person TEXT,
  target_date DATE,
  residual_likelihood SMALLINT CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_consequence SMALLINT CHECK (residual_consequence BETWEEN 1 AND 5),
  residual_rating SMALLINT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','closed','reviewed')),
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE qms_hse_risk ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_hse ON qms_hse_risk;
CREATE POLICY allow_all_hse ON qms_hse_risk FOR ALL TO anon USING (true) WITH CHECK (true);

-- Quality Risk Register
CREATE TABLE IF NOT EXISTS qms_quality_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id TEXT NOT NULL,
  risk_title TEXT NOT NULL,
  risk_category TEXT NOT NULL DEFAULT 'Process'
    CHECK (risk_category IN ('Process','Product/Service','Customer','Supplier','Resource','Compliance','Strategic','Other')),
  risk_description TEXT,
  potential_cause TEXT,
  potential_consequence TEXT,
  affected_process TEXT,
  likelihood SMALLINT NOT NULL DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
  impact SMALLINT NOT NULL DEFAULT 3 CHECK (impact BETWEEN 1 AND 5),
  risk_rating SMALLINT NOT NULL DEFAULT 9,
  existing_controls TEXT,
  treatment_action TEXT,
  risk_owner TEXT,
  target_date DATE,
  residual_likelihood SMALLINT CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_impact SMALLINT CHECK (residual_impact BETWEEN 1 AND 5),
  residual_rating SMALLINT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','under_treatment','accepted','closed')),
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE qms_quality_risk ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_qr ON qms_quality_risk;
CREATE POLICY allow_all_qr ON qms_quality_risk FOR ALL TO anon USING (true) WITH CHECK (true);

