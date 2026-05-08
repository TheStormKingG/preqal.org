-- supabase/migrations/20260508_crm_clients_onboarding.sql
-- Adds client onboarding fields to crm_clients for the client-facing onboarding form.

ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS legal_name           text,
  ADD COLUMN IF NOT EXISTS company_reg          text,
  ADD COLUMN IF NOT EXISTS vat_number           text,
  ADD COLUMN IF NOT EXISTS address              text,
  ADD COLUMN IF NOT EXISTS rep_id_passport      text,
  ADD COLUMN IF NOT EXISTS phone                text,
  ADD COLUMN IF NOT EXISTS contract_start       date,
  ADD COLUMN IF NOT EXISTS kickoff_meeting_date date,
  ADD COLUMN IF NOT EXISTS pipeline_stage       text DEFAULT 'onboarded',
  ADD COLUMN IF NOT EXISTS onboarding_stage     text DEFAULT 'complete';
