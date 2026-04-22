ALTER TABLE public.portal_staff_access
  ADD COLUMN invitation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN activated_at     timestamptz NULL,
  ADD COLUMN expires_at       timestamptz NULL DEFAULT (now() + interval '7 days');

CREATE UNIQUE INDEX portal_staff_access_invitation_token_key
  ON public.portal_staff_access(invitation_token);

ALTER TABLE public.client_invitations
  ADD COLUMN expires_at timestamptz NULL DEFAULT (now() + interval '14 days');

UPDATE public.portal_staff_access
  SET expires_at = created_at + interval '7 days' WHERE expires_at IS NULL;

UPDATE public.client_invitations
  SET expires_at = created_at + interval '14 days' WHERE expires_at IS NULL;

-- Force-expire ALL pending staff invites (pre-email-infra batch needs deliberate resend)
UPDATE public.portal_staff_access
  SET expires_at = now() WHERE status = 'pending';

-- Force-expire stale client invites (>14d, not activated/archived)
UPDATE public.client_invitations
  SET expires_at = now()
  WHERE created_at < now() - interval '14 days'
    AND activated_at IS NULL AND archived_at IS NULL;