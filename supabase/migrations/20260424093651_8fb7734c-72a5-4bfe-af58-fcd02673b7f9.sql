
-- Fix infinite recursion in portal_staff_access RLS policies
-- by routing the recursive lookup through SECURITY DEFINER helper functions.

-- 1. Helper: is the current user an active, confidentiality-accepted staff member for the given agency?
CREATE OR REPLACE FUNCTION public.is_active_staff_for_agency(_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = _agent_id
      AND status = 'active'
      AND activated_at IS NOT NULL
      AND confidentiality_accepted_at IS NOT NULL
  )
$$;

-- 2. Replace the recursive policy on portal_staff_access
DROP POLICY IF EXISTS "Active staff can view agency roster" ON public.portal_staff_access;

CREATE POLICY "Active staff can view agency roster"
ON public.portal_staff_access
FOR SELECT
TO authenticated
USING (
  status = 'active'
  AND activated_at IS NOT NULL
  AND public.is_active_staff_for_agency(agent_id)
);

-- 3. Also fix the matching recursive policy on agent_manager_profiles
--    (it does an EXISTS into portal_staff_access which inherits the same RLS recursion)
DROP POLICY IF EXISTS "Active staff can view their agency profile" ON public.agent_manager_profiles;

CREATE POLICY "Active staff can view their agency profile"
ON public.agent_manager_profiles
FOR SELECT
TO authenticated
USING (public.is_active_staff_for_agency(user_id));
