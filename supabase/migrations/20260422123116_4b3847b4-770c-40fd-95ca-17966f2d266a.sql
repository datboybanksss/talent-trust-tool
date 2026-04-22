-- Helper: active, confidentiality-accepted staff link with the named section
CREATE OR REPLACE FUNCTION public.staff_has_section(_agent_id uuid, _section text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = _agent_id
      AND status = 'active'
      AND confidentiality_accepted_at IS NOT NULL
      AND activated_at IS NOT NULL
      AND _section = ANY(sections)
  )
$$;

CREATE POLICY "Active staff can view agency invitations"
  ON public.client_invitations FOR SELECT TO authenticated
  USING (public.staff_has_section(agent_id, 'clients'));

CREATE POLICY "Active staff can view agency deals"
  ON public.agent_deals FOR SELECT TO authenticated
  USING (public.staff_has_section(agent_id, 'pipeline'));

CREATE POLICY "Active staff can view agency client shares"
  ON public.life_file_shares FOR SELECT TO authenticated
  USING (public.staff_has_section(shared_with_user_id, 'clients'));

CREATE POLICY "Active staff can view agency meetings"
  ON public.shared_meetings FOR SELECT TO authenticated
  USING (public.staff_has_section(created_by, 'calendar'));

CREATE POLICY "Active staff can view their agency profile"
  ON public.agent_manager_profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = agent_manager_profiles.user_id
      AND status = 'active'
      AND activated_at IS NOT NULL
  ));

-- Realtime: ensure DELETE/UPDATE events on portal_staff_access reach staff
ALTER TABLE public.portal_staff_access REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_staff_access;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;