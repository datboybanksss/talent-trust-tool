-- Create storage bucket for agent-uploaded client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-client-documents', 'agent-client-documents', false);

-- RLS: Agents can upload files scoped to their user id folder
CREATE POLICY "Agents can upload client documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-client-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Agents can view their uploaded files
CREATE POLICY "Agents can view client documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'agent-client-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Service role needs full access for moving files on activation
CREATE POLICY "Service role full access agent docs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'agent-client-documents');