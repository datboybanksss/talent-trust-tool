-- =============================================
-- PART A: Fix "Shared users can view" policies
-- These 4 tables have SELECT policies granted TO public (includes anon).
-- Re-scope them TO authenticated.
-- =============================================

-- beneficiaries
DROP POLICY "Shared users can view beneficiaries" ON public.beneficiaries;
CREATE POLICY "Shared users can view beneficiaries" ON public.beneficiaries
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = beneficiaries.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'beneficiaries' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- emergency_contacts
DROP POLICY "Shared users can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Shared users can view emergency contacts" ON public.emergency_contacts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = emergency_contacts.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'contacts' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- life_file_documents
DROP POLICY "Shared users can view life file documents" ON public.life_file_documents;
CREATE POLICY "Shared users can view life file documents" ON public.life_file_documents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = life_file_documents.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'documents' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- life_file_assets
DROP POLICY "Shared users can view life file assets" ON public.life_file_assets;
CREATE POLICY "Shared users can view life file assets" ON public.life_file_assets
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = life_file_assets.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'assets' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- =============================================
-- PART B: Add INSERT policy on audit_log for authenticated users
-- (needed for client-side audit logging)
-- =============================================
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);