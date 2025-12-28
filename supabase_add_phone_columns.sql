-- Add country_iso and dial_code columns to existing template_leads table
-- Run this migration if the table already exists without these columns

-- Add country_iso column (optional, can be null for existing records)
ALTER TABLE template_leads 
ADD COLUMN IF NOT EXISTS country_iso text;

-- Add dial_code column (optional, can be null for existing records)
ALTER TABLE template_leads 
ADD COLUMN IF NOT EXISTS dial_code text;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN template_leads.country_iso IS 'ISO 2-letter country code (e.g., us, gb, jm)';
COMMENT ON COLUMN template_leads.dial_code IS 'International dial code (e.g., +1, +44, +592)';




