
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier_type text NOT NULL DEFAULT 'client',
  tier_name text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  trial_ends_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_tier_type CHECK (tier_type IN ('client', 'agent')),
  CONSTRAINT valid_client_tier CHECK (
    tier_type != 'client' OR tier_name IN ('starter', 'pro', 'elite', 'legacy')
  ),
  CONSTRAINT valid_agent_tier CHECK (
    tier_type != 'agent' OR tier_name IN ('solo_agent', 'agency', 'association')
  ),
  CONSTRAINT unique_user_tier_type UNIQUE (user_id, tier_type)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier_type, tier_name, status)
  VALUES (NEW.id, 'client', 'starter', 'active');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();
