ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS tour_dismissed_at timestamptz NULL;