CREATE UNIQUE INDEX IF NOT EXISTS portal_staff_access_unique_active_email
  ON public.portal_staff_access (agent_id, lower(staff_email))
  WHERE status <> 'revoked';