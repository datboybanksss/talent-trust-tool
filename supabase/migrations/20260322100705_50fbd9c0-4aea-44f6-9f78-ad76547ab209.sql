
-- Table to track portal staff invitations and confidentiality acceptance
CREATE TABLE public.portal_staff_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  staff_user_id UUID,
  staff_email TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'custom',
  role_label TEXT NOT NULL DEFAULT 'Custom Role',
  sections TEXT[] NOT NULL DEFAULT '{}',
  confidentiality_accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_staff_access ENABLE ROW LEVEL SECURITY;

-- Agents can manage their own staff invitations
CREATE POLICY "Agents can create staff access"
ON public.portal_staff_access FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can view their own staff"
ON public.portal_staff_access FOR SELECT
TO authenticated
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own staff"
ON public.portal_staff_access FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own staff"
ON public.portal_staff_access FOR DELETE
TO authenticated
USING (auth.uid() = agent_id);

-- Staff can view their own access record (matched by email or user_id)
CREATE POLICY "Staff can view their own access"
ON public.portal_staff_access FOR SELECT
TO authenticated
USING (auth.uid() = staff_user_id);

-- Staff can update their own record (to accept confidentiality)
CREATE POLICY "Staff can accept confidentiality"
ON public.portal_staff_access FOR UPDATE
TO authenticated
USING (auth.uid() = staff_user_id);
