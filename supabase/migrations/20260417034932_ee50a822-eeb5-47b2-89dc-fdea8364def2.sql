-- 1. is_demo flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN public.profiles.is_demo IS 'TRUE for sales-demo seeded accounts. Filter is_demo=false in production reports.';

-- 2. shared_meetings + RLS
CREATE TABLE IF NOT EXISTS public.shared_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'general',
  attendee_user_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shared_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Attendees and creator can view" ON public.shared_meetings;
CREATE POLICY "Attendees and creator can view"
  ON public.shared_meetings FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = ANY(attendee_user_ids));

DROP POLICY IF EXISTS "Creator can insert" ON public.shared_meetings;
CREATE POLICY "Creator can insert"
  ON public.shared_meetings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can update" ON public.shared_meetings;
CREATE POLICY "Creator can update"
  ON public.shared_meetings FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can delete" ON public.shared_meetings;
CREATE POLICY "Creator can delete"
  ON public.shared_meetings FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- 3. metadata JSONB on artist_projects
ALTER TABLE public.artist_projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. dual-purpose income table comment
COMMENT ON TABLE public.artist_royalties IS 'TODO: rename to income_streams. Stores artist royalty AND athlete image rights/merch/appearance income.';

-- 5. document_type_allowlist on shares
ALTER TABLE public.life_file_shares ADD COLUMN IF NOT EXISTS document_type_allowlist TEXT[] DEFAULT NULL;
COMMENT ON COLUMN public.life_file_shares.document_type_allowlist IS 'When non-null, restricts shared document SELECT to rows where document_type = ANY(allowlist). NULL = all types.';

-- 6. ADDITIVE permissive SELECT policies (allow-list via sections)
DROP POLICY IF EXISTS "Shared users can view athlete contracts" ON public.athlete_contracts;
CREATE POLICY "Shared users can view athlete contracts"
  ON public.athlete_contracts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE owner_id = athlete_contracts.user_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
      AND 'contracts' = ANY(sections)
      AND (expires_at IS NULL OR expires_at > now())
  ));

DROP POLICY IF EXISTS "Shared users can view athlete endorsements" ON public.athlete_endorsements;
CREATE POLICY "Shared users can view athlete endorsements"
  ON public.athlete_endorsements FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE owner_id = athlete_endorsements.user_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
      AND 'endorsements' = ANY(sections)
      AND (expires_at IS NULL OR expires_at > now())
  ));

DROP POLICY IF EXISTS "Shared users can view artist royalties" ON public.artist_royalties;
CREATE POLICY "Shared users can view artist royalties"
  ON public.artist_royalties FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE owner_id = artist_royalties.user_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
      AND 'royalties' = ANY(sections)
      AND (expires_at IS NULL OR expires_at > now())
  ));

DROP POLICY IF EXISTS "Shared users can view artist projects" ON public.artist_projects;
CREATE POLICY "Shared users can view artist projects"
  ON public.artist_projects FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.life_file_shares
    WHERE owner_id = artist_projects.user_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
      AND 'contracts' = ANY(sections)
      AND (expires_at IS NULL OR expires_at > now())
  ));

-- 7. RESTRICTIVE policy: enforces document_type_allowlist when set
DROP POLICY IF EXISTS "Document allowlist restriction" ON public.life_file_documents;
CREATE POLICY "Document allowlist restriction"
  ON public.life_file_documents AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR NOT EXISTS (
      SELECT 1 FROM public.life_file_shares
      WHERE owner_id = life_file_documents.user_id
        AND shared_with_user_id = auth.uid()
        AND document_type_allowlist IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM public.life_file_shares
      WHERE owner_id = life_file_documents.user_id
        AND shared_with_user_id = auth.uid()
        AND document_type_allowlist IS NOT NULL
        AND life_file_documents.document_type = ANY(document_type_allowlist)
    )
  );