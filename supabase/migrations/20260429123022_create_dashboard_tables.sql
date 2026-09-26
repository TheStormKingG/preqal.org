-- 20260429123022  create_dashboard_tables
--
-- Reconstructed 2026-09-26 from supabase_migrations.schema_migrations, which
-- stores the SQL each migration actually executed. This one was applied through
-- the Supabase dashboard and had no file in the repo, so `supabase db push`
-- refused every push with "remote migration versions not found in local".
-- It is a record of what ran, not hand-authored SQL. Do not edit to change
-- behaviour: the statements below have already executed in production.


-- Quote submissions from the classifier tool
CREATE TABLE IF NOT EXISTS public.quote_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  staff_size text NOT NULL,
  num_services integer NOT NULL,
  avg_processes text NOT NULL,
  base_tier text,
  complexity_score numeric,
  recommended_tier text
);
ALTER TABLE public.quote_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read quote_submissions" ON public.quote_submissions FOR SELECT USING (true);
CREATE POLICY "Public insert quote_submissions" ON public.quote_submissions FOR INSERT WITH CHECK (true);

-- Course module progress
CREATE TABLE IF NOT EXISTS public.ecourse_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  module_title text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.ecourse_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.ecourse_module_progress FOR ALL USING (auth.uid() = user_id);

-- CRM clients
CREATE TABLE IF NOT EXISTS public.crm_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_name text NOT NULL,
  address text,
  contact_name text NOT NULL,
  contact_tel text,
  contact_email text,
  industry_category text,
  tier text,
  num_employees integer,
  num_services integer,
  num_processes_per_service integer,
  notes text,
  status text DEFAULT 'active'
);
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only crm_clients" ON public.crm_clients FOR ALL USING (true);

-- Page views for site traffic
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamptz NOT NULL DEFAULT now(),
  page_path text NOT NULL,
  page_title text,
  referrer text,
  visitor_id text,
  is_new_visitor boolean DEFAULT false,
  country text,
  user_agent text
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read page_views" ON public.page_views FOR SELECT USING (true);

