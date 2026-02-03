-- Create table for shared access
CREATE TABLE public.shared_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  access_type TEXT NOT NULL DEFAULT 'view',
  relationship TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, shared_with_email)
);

-- Enable RLS
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Owners can view their shares
CREATE POLICY "Owners can view their shares"
ON public.shared_access FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can create shares
CREATE POLICY "Owners can create shares"
ON public.shared_access FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their shares
CREATE POLICY "Owners can update their shares"
ON public.shared_access FOR UPDATE
USING (auth.uid() = owner_id);

-- Owners can delete their shares
CREATE POLICY "Owners can delete their shares"
ON public.shared_access FOR DELETE
USING (auth.uid() = owner_id);

-- Users can view shares where they are the recipient
CREATE POLICY "Recipients can view shares"
ON public.shared_access FOR SELECT
USING (auth.uid() = shared_with_user_id);

-- Create updated_at trigger
CREATE TRIGGER update_shared_access_updated_at
BEFORE UPDATE ON public.shared_access
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();