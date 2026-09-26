-- 20260429141717  qms_system_tables
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Document Register
CREATE TABLE IF NOT EXISTS qms_documents (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_id        TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  category      TEXT    NOT NULL CHECK (category IN ('Policy','Procedure','Work Instruction','Form','Record','External')),
  version       TEXT    NOT NULL DEFAULT '1.0',
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','under_review','superseded')),
  owner         TEXT,
  file_url      TEXT,
  description   TEXT,
  issue_date    DATE,
  review_date   DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Non-Conformance Report
CREATE TABLE IF NOT EXISTS qms_ncr (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  ncr_number       TEXT    NOT NULL UNIQUE,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  source           TEXT    CHECK (source IN ('Internal Audit','Customer Complaint','Process Review','Supplier','Management Review','Other')),
  detected_by      TEXT,
  detected_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
  process_area     TEXT,
  severity         TEXT    NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor','major','critical')),
  status           TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_investigation','capa_raised','closed','verified')),
  root_cause       TEXT,
  immediate_action TEXT,
  closed_date      DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CAPA Register
CREATE TABLE IF NOT EXISTS qms_capa (
  id                   UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  capa_number          TEXT    NOT NULL UNIQUE,
  type                 TEXT    NOT NULL DEFAULT 'corrective' CHECK (type IN ('corrective','preventive')),
  title                TEXT    NOT NULL,
  description          TEXT    NOT NULL,
  source               TEXT,
  ncr_id               UUID    REFERENCES qms_ncr(id) ON DELETE SET NULL,
  assigned_to          TEXT,
  due_date             DATE,
  status               TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','verified','closed')),
  action_taken         TEXT,
  effectiveness_review TEXT,
  closed_date          DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Register
CREATE TABLE IF NOT EXISTS qms_audit (
  id                         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_number               TEXT    NOT NULL UNIQUE,
  audit_type                 TEXT    NOT NULL CHECK (audit_type IN ('Internal','External','Supplier','Customer')),
  audit_scope                TEXT    NOT NULL,
  auditor                    TEXT,
  auditee                    TEXT,
  scheduled_date             DATE,
  conducted_date             DATE,
  status                     TEXT    NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  findings_minor             INTEGER DEFAULT 0,
  findings_major             INTEGER DEFAULT 0,
  findings_observation       INTEGER DEFAULT 0,
  summary                    TEXT,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_ncr       ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_capa      ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_audit     ENABLE ROW LEVEL SECURITY;

-- Policies (anon read + write — admin gate is enforced in the app layer)
CREATE POLICY "allow_all_qms_documents" ON qms_documents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_qms_ncr"       ON qms_ncr       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_qms_capa"      ON qms_capa      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_qms_audit"     ON qms_audit     FOR ALL TO anon USING (true) WITH CHECK (true);

