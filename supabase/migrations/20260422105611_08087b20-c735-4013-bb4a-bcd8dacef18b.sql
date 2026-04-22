ALTER TABLE public.client_invitations
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_client_invitations_agent_archived
ON public.client_invitations (agent_id, archived_at);