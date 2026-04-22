CREATE POLICY "Active staff can view agency roster"
ON public.portal_staff_access FOR SELECT TO authenticated
USING (
  status = 'active'
  AND activated_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.portal_staff_access me
    WHERE me.staff_user_id = auth.uid()
      AND me.agent_id = portal_staff_access.agent_id
      AND me.status = 'active'
      AND me.activated_at IS NOT NULL
      AND me.confidentiality_accepted_at IS NOT NULL
  )
);