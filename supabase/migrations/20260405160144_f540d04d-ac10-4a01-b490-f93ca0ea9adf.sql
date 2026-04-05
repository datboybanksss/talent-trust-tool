
CREATE TABLE public.life_file_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_category TEXT NOT NULL DEFAULT 'insurance',
  asset_type TEXT NOT NULL,
  institution TEXT NOT NULL,
  policy_or_account_number TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  premium_or_contribution NUMERIC,
  premium_frequency TEXT DEFAULT 'monthly',
  beneficiary_names TEXT,
  beneficiary_allocation TEXT,
  start_date DATE,
  maturity_or_expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.life_file_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assets" ON public.life_file_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assets" ON public.life_file_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON public.life_file_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON public.life_file_assets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Shared users can view life file assets" ON public.life_file_assets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = life_file_assets.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'assets' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  )
);
