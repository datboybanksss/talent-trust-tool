-- 1. Stage agent's requested share sections on the invitation.
-- COUPLING NOTE: This column exists because life_file_shares.owner_id is NOT NULL
-- and the client's user_id doesn't exist until activation. At activation the value
-- is consumed to create the life_file_shares row, then remains as a historical
-- record of the original request. Do NOT also store a "response" column here —
-- life_file_shares.status is the single source of truth post-activation.
ALTER TABLE public.client_invitations
  ADD COLUMN IF NOT EXISTS requested_share_sections text[] NULL;

COMMENT ON COLUMN public.client_invitations.requested_share_sections IS
  'Agent-requested sections staged pre-activation. Consumed at activation to create life_file_shares row. Historical record only after activation; do not mutate.';

-- 2. Optional decline reason captured by the client.
ALTER TABLE public.life_file_shares
  ADD COLUMN IF NOT EXISTS decline_reason text NULL;

-- 3. First-login banner dismissal flag.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_login_seen_at timestamptz NULL;