-- Create life_file_shares table
CREATE TABLE public.life_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  access_level TEXT NOT NULL DEFAULT 'view',
  relationship TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sections TEXT[] DEFAULT ARRAY['beneficiaries', 'contacts', 'documents'],
  message TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, shared_with_email)
);

-- Enable RLS
ALTER TABLE public.life_file_shares ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "Owners can view their shares"
ON public.life_file_shares FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create shares"
ON public.life_file_shares FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their shares"
ON public.life_file_shares FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shares"
ON public.life_file_shares FOR DELETE
USING (auth.uid() = owner_id);

-- Recipient policies
CREATE POLICY "Recipients can view shares they received"
ON public.life_file_shares FOR SELECT
USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Recipients can update their share status"
ON public.life_file_shares FOR UPDATE
USING (auth.uid() = shared_with_user_id);

-- Update timestamp trigger
CREATE TRIGGER update_life_file_shares_updated_at
BEFORE UPDATE ON public.life_file_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();

-- Create RLS policies to allow shared users to view owner's data

-- Beneficiaries: Allow shared users with appropriate access to view
CREATE POLICY "Shared users can view beneficiaries"
ON public.beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE life_file_shares.owner_id = beneficiaries.user_id
    AND life_file_shares.shared_with_user_id = auth.uid()
    AND life_file_shares.status = 'accepted'
    AND 'beneficiaries' = ANY(life_file_shares.sections)
    AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  )
);

-- Emergency contacts: Allow shared users with appropriate access to view
CREATE POLICY "Shared users can view emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE life_file_shares.owner_id = emergency_contacts.user_id
    AND life_file_shares.shared_with_user_id = auth.uid()
    AND life_file_shares.status = 'accepted'
    AND 'contacts' = ANY(life_file_shares.sections)
    AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  )
);

-- Documents: Allow shared users with appropriate access to view
CREATE POLICY "Shared users can view life file documents"
ON public.life_file_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE life_file_shares.owner_id = life_file_documents.user_id
    AND life_file_shares.shared_with_user_id = auth.uid()
    AND life_file_shares.status = 'accepted'
    AND 'documents' = ANY(life_file_shares.sections)
    AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  )
);