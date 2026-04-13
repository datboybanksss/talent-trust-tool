
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Cron job runs tracking table
CREATE TABLE public.cron_job_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  result jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cron_job_runs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role can manage cron runs"
  ON public.cron_job_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view
CREATE POLICY "Admins can view cron runs"
  ON public.cron_job_runs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
