CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_meta_client_type text := NEW.raw_user_meta_data->>'client_type';
  v_valid_client_type text;
BEGIN
  IF v_meta_client_type IN ('athlete', 'artist') THEN
    v_valid_client_type := v_meta_client_type;
  ELSE
    v_valid_client_type := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, client_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    v_valid_client_type
  );
  RETURN NEW;
END;
$$;