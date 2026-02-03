-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  allocation_percentage NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create life_file_documents table
CREATE TABLE public.life_file_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'incomplete',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_file_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for beneficiaries
CREATE POLICY "Users can view their own beneficiaries"
ON public.beneficiaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beneficiaries"
ON public.beneficiaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beneficiaries"
ON public.beneficiaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beneficiaries"
ON public.beneficiaries FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency contacts"
ON public.emergency_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
ON public.emergency_contacts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for life_file_documents
CREATE POLICY "Users can view their own life file documents"
ON public.life_file_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life file documents"
ON public.life_file_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life file documents"
ON public.life_file_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life file documents"
ON public.life_file_documents FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for life file documents
INSERT INTO storage.buckets (id, name, public) VALUES ('life-file-documents', 'life-file-documents', false);

-- Storage policies
CREATE POLICY "Users can view their own life file documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'life-file-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own life file documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'life-file-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own life file documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'life-file-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own life file documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'life-file-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update timestamp triggers
CREATE TRIGGER update_beneficiaries_updated_at
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();

CREATE TRIGGER update_life_file_documents_updated_at
BEFORE UPDATE ON public.life_file_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();