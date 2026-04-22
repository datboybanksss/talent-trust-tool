-- Validation trigger: ensure shared_meetings.agency_owner_id references a real agency owner.
-- Catches accidental drift (e.g. a staff INSERT that mistakenly sets agency_owner_id = staff uid).
CREATE OR REPLACE FUNCTION public.validate_shared_meeting_agency_owner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.agency_owner_id IS NULL THEN
    NEW.agency_owner_id := NEW.created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.agent_manager_profiles
    WHERE user_id = NEW.agency_owner_id
  ) THEN
    RAISE EXCEPTION 'shared_meetings.agency_owner_id (%) must reference a valid agent_manager_profiles.user_id', NEW.agency_owner_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_meeting_owner ON public.shared_meetings;
CREATE TRIGGER trg_validate_meeting_owner
  BEFORE INSERT OR UPDATE OF agency_owner_id ON public.shared_meetings
  FOR EACH ROW EXECUTE FUNCTION public.validate_shared_meeting_agency_owner();

-- Touch trigger for shared_meetings.updated_at
DROP TRIGGER IF EXISTS trg_touch_shared_meetings ON public.shared_meetings;
CREATE TRIGGER trg_touch_shared_meetings
  BEFORE UPDATE ON public.shared_meetings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Touch trigger for agent_deals.updated_at
DROP TRIGGER IF EXISTS trg_touch_agent_deals ON public.agent_deals;
CREATE TRIGGER trg_touch_agent_deals
  BEFORE UPDATE ON public.agent_deals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();