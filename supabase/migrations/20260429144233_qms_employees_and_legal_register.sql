-- 20260429144233  qms_employees_and_legal_register
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Employee Register
CREATE TABLE IF NOT EXISTS qms_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  email TEXT,
  phone TEXT,
  employment_type TEXT NOT NULL DEFAULT 'Full-Time'
    CHECK (employment_type IN ('Full-Time','Part-Time','Contractor','Casual')),
  manager_id UUID REFERENCES qms_employees(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','on_leave')),
  qualifications TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE qms_employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_emp ON qms_employees;
CREATE POLICY allow_all_emp ON qms_employees FOR ALL TO anon USING (true) WITH CHECK (true);

-- Legal Register
CREATE TABLE IF NOT EXISTS qms_legal_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Legislation'
    CHECK (category IN ('Legislation','Regulation','Standard','Code of Practice','Licence/Permit','Contract','Other')),
  jurisdiction TEXT NOT NULL DEFAULT 'Federal'
    CHECK (jurisdiction IN ('Federal','State/Territory','International','Internal')),
  reference_number TEXT,
  summary TEXT,
  applicable_to TEXT,
  obligations TEXT,
  responsible_person TEXT,
  compliance_status TEXT NOT NULL DEFAULT 'monitoring'
    CHECK (compliance_status IN ('compliant','non_compliant','monitoring','under_review','not_applicable')),
  effective_date DATE,
  review_date DATE,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE qms_legal_register ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_legal ON qms_legal_register;
CREATE POLICY allow_all_legal ON qms_legal_register FOR ALL TO anon USING (true) WITH CHECK (true);

