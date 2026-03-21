
-- Athlete Contracts table
CREATE TABLE public.athlete_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'team',
  counterparty TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  value NUMERIC,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts" ON public.athlete_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contracts" ON public.athlete_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contracts" ON public.athlete_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contracts" ON public.athlete_contracts FOR DELETE USING (auth.uid() = user_id);

-- Athlete Endorsements table
CREATE TABLE public.athlete_endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT NOT NULL,
  deal_type TEXT NOT NULL DEFAULT 'sponsorship',
  annual_value NUMERIC,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  start_date DATE NOT NULL,
  end_date DATE,
  deliverables TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own endorsements" ON public.athlete_endorsements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own endorsements" ON public.athlete_endorsements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own endorsements" ON public.athlete_endorsements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own endorsements" ON public.athlete_endorsements FOR DELETE USING (auth.uid() = user_id);
