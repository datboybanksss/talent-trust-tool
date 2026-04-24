-- SECURITY DEFINER helper: checks active-staff membership without re-triggering
-- SELECT policies on portal_staff_access (prevents infinite recursion).
CREATE OR REPLACE FUNCTION public.is_active_staff_member_of(_agent_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = _agent_id
      AND status = 'active'
      AND activated_at IS NOT NULL
      AND confidentiality_accepted_at IS NOT NULL
  );
$$;

COMMENT ON FUNCTION public.is_active_staff_member_of(uuid) IS
  'Returns true when the calling user is an active, confidentiality-accepted '
  'staff member of the given agency. SECURITY DEFINER bypasses RLS on '
  'portal_staff_access so the check does not recurse into itself.';

-- Drop the self-referential policy causing infinite recursion.
DROP POLICY IF EXISTS "Active staff can view agency roster" ON public.portal_staff_access;

-- Recreate using the SECURITY DEFINER function — no EXISTS subquery into
-- portal_staff_access from within a portal_staff_access policy.
CREATE POLICY "Active staff can view agency roster"
ON public.portal_staff_access FOR SELECT TO authenticated
USING (
  status = 'active'
  AND activated_at IS NOT NULL
  AND public.is_active_staff_member_of(agent_id)
);
