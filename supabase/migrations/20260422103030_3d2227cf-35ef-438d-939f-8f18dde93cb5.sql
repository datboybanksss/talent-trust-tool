-- 1. Add logo_url column to agent_manager_profiles
ALTER TABLE public.agent_manager_profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create public agency-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage policies for agency-logos
DROP POLICY IF EXISTS "Agency logos are publicly readable" ON storage.objects;
CREATE POLICY "Agency logos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agency-logos');

DROP POLICY IF EXISTS "Agents can upload their own agency logo" ON storage.objects;
CREATE POLICY "Agents can upload their own agency logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agency-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Agents can update their own agency logo" ON storage.objects;
CREATE POLICY "Agents can update their own agency logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agency-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'agency-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Agents can delete their own agency logo" ON storage.objects;
CREATE POLICY "Agents can delete their own agency logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'agency-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. delete_agent_account RPC — is_demo guard is statement #1
CREATE OR REPLACE FUNCTION public.delete_agent_account()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_demo boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  -- STATEMENT #1: demo guard. No deletes occur before this passes.
  SELECT is_demo INTO v_is_demo FROM public.profiles WHERE user_id = v_user_id;
  IF v_is_demo IS TRUE THEN
    RAISE EXCEPTION 'Demo accounts cannot be deleted from the UI'
      USING ERRCODE = '42501';
  END IF;

  -- Then, and only then, the cascade:
  DELETE FROM public.life_file_shares       WHERE shared_with_user_id = v_user_id;
  DELETE FROM public.client_invitations     WHERE agent_id = v_user_id;
  DELETE FROM public.portal_staff_access    WHERE agent_id = v_user_id;
  DELETE FROM public.agent_manager_profiles WHERE user_id = v_user_id;
  DELETE FROM public.user_roles             WHERE user_id = v_user_id;
  DELETE FROM public.profiles               WHERE user_id = v_user_id;

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_agent_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_agent_account() TO authenticated;