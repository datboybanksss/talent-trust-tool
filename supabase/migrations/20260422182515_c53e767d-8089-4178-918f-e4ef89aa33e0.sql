-- 1. Backfill: clear client_type on any user that already has an agent or staff profile
UPDATE public.profiles p
SET client_type = NULL,
    updated_at = now()
WHERE p.client_type IS NOT NULL
  AND (
    EXISTS (SELECT 1 FROM public.agent_manager_profiles a WHERE a.user_id = p.user_id)
    OR EXISTS (SELECT 1 FROM public.portal_staff_access s WHERE s.staff_user_id = p.user_id)
  );

-- 2. Trigger function: clear client_type whenever an agent or staff row is created/linked
CREATE OR REPLACE FUNCTION public.clear_client_type_for_agency_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'agent_manager_profiles' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'portal_staff_access' THEN
    v_user_id := NEW.staff_user_id;
  END IF;

  IF v_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET client_type = NULL,
        updated_at = now()
    WHERE user_id = v_user_id
      AND client_type IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Triggers on both tables (insert + update of staff_user_id when invitation is linked)
DROP TRIGGER IF EXISTS clear_client_type_on_agent_profile ON public.agent_manager_profiles;
CREATE TRIGGER clear_client_type_on_agent_profile
AFTER INSERT ON public.agent_manager_profiles
FOR EACH ROW EXECUTE FUNCTION public.clear_client_type_for_agency_member();

DROP TRIGGER IF EXISTS clear_client_type_on_staff_link ON public.portal_staff_access;
CREATE TRIGGER clear_client_type_on_staff_link
AFTER INSERT OR UPDATE OF staff_user_id ON public.portal_staff_access
FOR EACH ROW
WHEN (NEW.staff_user_id IS NOT NULL)
EXECUTE FUNCTION public.clear_client_type_for_agency_member();