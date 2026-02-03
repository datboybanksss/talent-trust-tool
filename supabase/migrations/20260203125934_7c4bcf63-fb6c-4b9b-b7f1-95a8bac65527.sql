-- Create table for social media accounts
CREATE TABLE public.social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  email TEXT,
  password TEXT,
  recovery_email TEXT,
  recovery_phone TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_backup_codes TEXT,
  notes TEXT,
  follower_count INTEGER,
  verified BOOLEAN DEFAULT false,
  account_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;

-- Only owners can view their accounts
CREATE POLICY "Users can view their own social accounts"
ON public.social_media_accounts FOR SELECT
USING (auth.uid() = user_id);

-- Only owners can create accounts
CREATE POLICY "Users can create their own social accounts"
ON public.social_media_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only owners can update accounts
CREATE POLICY "Users can update their own social accounts"
ON public.social_media_accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Only owners can delete accounts
CREATE POLICY "Users can delete their own social accounts"
ON public.social_media_accounts FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_social_media_accounts_updated_at
BEFORE UPDATE ON public.social_media_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();