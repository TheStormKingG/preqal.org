-- Create template_leads table
CREATE TABLE IF NOT EXISTS template_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  job_title text NOT NULL,
  phone_number text NOT NULL,
  country_iso text,
  dial_code text,
  most_pressing_quality_problem text NOT NULL,
  source_page text NOT NULL DEFAULT 'library_unlock'
);

-- Enable Row Level Security
ALTER TABLE template_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "allow anonymous insert" ON template_leads
  FOR INSERT
  TO anon
  WITH CHECK (email IS NOT NULL);

-- Optional: Create index on email for faster lookups (if needed for deduplication later)
-- CREATE INDEX IF NOT EXISTS idx_template_leads_email ON template_leads (lower(email));

-- Optional: Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_template_leads_created_at ON template_leads (created_at DESC);

