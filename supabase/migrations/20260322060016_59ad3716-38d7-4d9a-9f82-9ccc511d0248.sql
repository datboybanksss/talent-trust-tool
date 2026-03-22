
-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', false);

-- RLS: Users can upload their own contract files
CREATE POLICY "Users can upload contract files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can view their own contract files
CREATE POLICY "Users can view contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can delete their own contract files
CREATE POLICY "Users can delete contract files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contract-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can update their own contract files
CREATE POLICY "Users can update contract files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contract-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
