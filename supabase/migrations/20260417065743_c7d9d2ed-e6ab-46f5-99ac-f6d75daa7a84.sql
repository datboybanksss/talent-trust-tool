-- Tighten life-file-documents storage policies to authenticated role only
DROP POLICY IF EXISTS "Users can view their own life file documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own life file documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own life file documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own life file documents" ON storage.objects;

CREATE POLICY "Users can view their own life file documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'life-file-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own life file documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'life-file-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own life file documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'life-file-documents' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'life-file-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own life file documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'life-file-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Add missing UPDATE policy for payslip-tax-documents
CREATE POLICY "Users can update their payslip tax docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'payslip-tax-documents' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'payslip-tax-documents' AND (storage.foldername(name))[1] = (auth.uid())::text);