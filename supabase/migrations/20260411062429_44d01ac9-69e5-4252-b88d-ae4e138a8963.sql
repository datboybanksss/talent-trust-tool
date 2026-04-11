
-- Create audit_log table
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions writing logs)
CREATE POLICY "Service role full access"
ON public.audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can read all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own audit log entries
CREATE POLICY "Users can view their own audit logs"
ON public.audit_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create index for common queries
CREATE INDEX idx_audit_log_user_id ON public.audit_log (user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log (action);
CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
