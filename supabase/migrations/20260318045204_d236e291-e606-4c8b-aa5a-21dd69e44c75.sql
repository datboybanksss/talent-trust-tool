
-- Create payslip & tax documents table
CREATE TABLE public.payslip_tax_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  category TEXT NOT NULL DEFAULT 'personal',
  tax_year TEXT,
  file_name TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payslip_tax_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own payslip tax docs"
  ON public.payslip_tax_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payslip tax docs"
  ON public.payslip_tax_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payslip tax docs"
  ON public.payslip_tax_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payslip tax docs"
  ON public.payslip_tax_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for payslip/tax documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslip-tax-documents', 'payslip-tax-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload payslip tax docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payslip-tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their payslip tax docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payslip-tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their payslip tax docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payslip-tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
