
-- Agent/Manager profiles table
CREATE TABLE public.agent_manager_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('athlete_agent', 'artist_manager')),
  company_name TEXT NOT NULL,
  registration_number TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_manager_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent profile"
  ON public.agent_manager_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent profile"
  ON public.agent_manager_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent profile"
  ON public.agent_manager_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Client invitations table
CREATE TABLE public.client_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_type TEXT NOT NULL CHECK (client_type IN ('athlete', 'artist')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),
  pre_populated_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own invitations"
  ON public.client_invitations FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create invitations"
  ON public.client_invitations FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own invitations"
  ON public.client_invitations FOR UPDATE
  USING (auth.uid() = agent_id);

-- Allow public read by token for activation flow (via service role in edge function)
-- The activation will be handled by an edge function with service role
