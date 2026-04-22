CREATE TABLE public.agent_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  client_invitation_id uuid,
  client_name text NOT NULL,
  client_type text NOT NULL DEFAULT 'athlete',
  brand text NOT NULL,
  deal_type text NOT NULL DEFAULT 'Endorsement',
  value_text text NOT NULL,
  value_amount numeric,
  currency text NOT NULL DEFAULT 'ZAR',
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'prospecting',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agent_deals_status_check CHECK (status IN ('prospecting','proposal_sent','negotiating','active','closed_won','closed_lost')),
  CONSTRAINT agent_deals_client_type_check CHECK (client_type IN ('athlete','artist'))
);

ALTER TABLE public.agent_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own deals"
  ON public.agent_deals FOR SELECT TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create their own deals"
  ON public.agent_deals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own deals"
  ON public.agent_deals FOR UPDATE TO authenticated
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own deals"
  ON public.agent_deals FOR DELETE TO authenticated
  USING (auth.uid() = agent_id);

CREATE INDEX idx_agent_deals_agent_status ON public.agent_deals(agent_id, status);

CREATE TRIGGER update_agent_deals_updated_at
  BEFORE UPDATE ON public.agent_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();