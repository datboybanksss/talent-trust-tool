
CREATE OR REPLACE FUNCTION public.link_staff_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.portal_staff_access
  SET staff_user_id = NEW.id,
      updated_at = now()
  WHERE lower(staff_email) = lower(NEW.email)
    AND staff_user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_staff
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_staff_on_signup();
