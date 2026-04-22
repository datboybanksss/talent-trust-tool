
-- Workspace model: staff write access + attribution columns.
-- Pattern: RLS allows INSERT/UPDATE/DELETE when auth.uid() is either the agency
-- owner OR active staff with the required section. Attribution happens in the
-- app layer via created_by/updated_by columns. Tables explicitly excluded from
-- this pattern: life_file_shares, portal_staff_access, agent_manager_profiles,
-- athlete_contracts, athlete_endorsements, artist_royalties, artist_projects.

-- 1. Attribution columns
ALTER TABLE public.agent_deals
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.client_invitations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.shared_meetings
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS agency_owner_id uuid;

-- 2. Backfill
UPDATE public.agent_deals SET created_by = agent_id WHERE created_by IS NULL;
UPDATE public.agent_deals SET updated_by = agent_id WHERE updated_by IS NULL;

UPDATE public.client_invitations SET created_by = agent_id WHERE created_by IS NULL;
UPDATE public.client_invitations SET updated_by = agent_id WHERE updated_by IS NULL;

UPDATE public.shared_meetings SET updated_by = created_by WHERE updated_by IS NULL;
UPDATE public.shared_meetings SET agency_owner_id = created_by WHERE agency_owner_id IS NULL;

-- 3. Staff write policies — agent_deals (section: pipeline)
CREATE POLICY "Staff with pipeline section can insert deals"
  ON public.agent_deals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'pipeline'));

CREATE POLICY "Staff with pipeline section can update deals"
  ON public.agent_deals FOR UPDATE TO authenticated
  USING (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'pipeline'));

CREATE POLICY "Staff with pipeline section can delete deals"
  ON public.agent_deals FOR DELETE TO authenticated
  USING (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'pipeline'));

-- 4. Staff write policies — client_invitations (section: clients)
CREATE POLICY "Staff with clients section can insert invitations"
  ON public.client_invitations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'clients'));

CREATE POLICY "Staff with clients section can update invitations"
  ON public.client_invitations FOR UPDATE TO authenticated
  USING (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'clients'));

CREATE POLICY "Staff with clients section can delete invitations"
  ON public.client_invitations FOR DELETE TO authenticated
  USING (auth.uid() = agent_id OR public.staff_has_section(agent_id, 'clients'));

-- 5. Staff write policies — shared_meetings (section: calendar)
-- Note: created_by stays = auth.uid() for attribution; agency_owner_id keys the workspace.
CREATE POLICY "Staff with calendar section can insert meetings"
  ON public.shared_meetings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (auth.uid() = agency_owner_id OR public.staff_has_section(agency_owner_id, 'calendar'))
  );

CREATE POLICY "Staff with calendar section can update meetings"
  ON public.shared_meetings FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.staff_has_section(agency_owner_id, 'calendar'));

CREATE POLICY "Staff with calendar section can delete meetings"
  ON public.shared_meetings FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.staff_has_section(agency_owner_id, 'calendar'));

-- 6. Trigger to keep client_invitations.updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_client_invitations ON public.client_invitations;
CREATE TRIGGER trg_touch_client_invitations
  BEFORE UPDATE ON public.client_invitations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
