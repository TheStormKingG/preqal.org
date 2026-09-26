-- 20260429175654  qms_employees_full_hr_fields
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


ALTER TABLE qms_employees
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS nis_number TEXT,
  ADD COLUMN IF NOT EXISTS tin_number TEXT,
  ADD COLUMN IF NOT EXISTS id_passport_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('Single','Married','Divorced','Widowed','Separated')),
  ADD COLUMN IF NOT EXISTS num_dependents SMALLINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
  ADD COLUMN IF NOT EXISTS disabilities TEXT,
  ADD COLUMN IF NOT EXISTS dietary_restriction TEXT DEFAULT 'None' CHECK (dietary_restriction IN ('None','Vegetarian','No Pork','Pescatarian','Vegan')),
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS hobby TEXT,
  ADD COLUMN IF NOT EXISTS police_clearance_url TEXT,
  ADD COLUMN IF NOT EXISTS offer_letter_url TEXT,
  ADD COLUMN IF NOT EXISTS signed_contract_url TEXT,
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS job_description_url TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending','sent','complete')),
  ADD COLUMN IF NOT EXISTS onboarding_submitted_at TIMESTAMPTZ;

-- Backfill tokens for any existing rows
UPDATE qms_employees SET onboarding_token = gen_random_uuid() WHERE onboarding_token IS NULL;

