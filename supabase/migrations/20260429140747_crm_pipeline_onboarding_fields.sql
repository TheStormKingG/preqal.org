-- 20260429140747  crm_pipeline_onboarding_fields
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS pipeline_stage    TEXT    NOT NULL DEFAULT 'prospect'
    CHECK (pipeline_stage IN ('prospect','qualified','proposal_sent','negotiating','closed_won','closed_lost')),
  ADD COLUMN IF NOT EXISTS onboarding_stage  TEXT    NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_stage IN ('not_started','welcome','discovery','design','implementation','sign_off','retention','complete')),
  ADD COLUMN IF NOT EXISTS source            TEXT,
  ADD COLUMN IF NOT EXISTS contract_value    NUMERIC,
  ADD COLUMN IF NOT EXISTS client_since      DATE,
  ADD COLUMN IF NOT EXISTS renewal_date      DATE,
  ADD COLUMN IF NOT EXISTS next_action       TEXT,
  ADD COLUMN IF NOT EXISTS next_action_date  DATE,
  ADD COLUMN IF NOT EXISTS notes             TEXT;

COMMENT ON COLUMN crm_clients.pipeline_stage   IS 'Funnel stage: prospect → qualified → proposal_sent → negotiating → closed_won / closed_lost';
COMMENT ON COLUMN crm_clients.onboarding_stage IS 'Onboarding phase: not_started → welcome → discovery → design → implementation → sign_off → retention → complete';
COMMENT ON COLUMN crm_clients.source           IS 'Lead origin: LinkedIn, Facebook, Substack, Organic, Referral, Outbound';
COMMENT ON COLUMN crm_clients.contract_value   IS 'Total contract value';
COMMENT ON COLUMN crm_clients.client_since     IS 'Date agreement was signed';
COMMENT ON COLUMN crm_clients.renewal_date     IS 'Next retainer renewal date';
COMMENT ON COLUMN crm_clients.next_action      IS 'Description of the next required action';
COMMENT ON COLUMN crm_clients.next_action_date IS 'Deadline for next_action';
COMMENT ON COLUMN crm_clients.notes            IS 'Free-form notes and meeting summaries';

