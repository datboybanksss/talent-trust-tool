ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS tour_dismissed_at timestamptz NULL;

COMMENT ON COLUMN public.profiles.tour_completed_at IS
  'Stamped when user finishes the guided tour. Prevents auto-rerun.';
COMMENT ON COLUMN public.profiles.tour_dismissed_at IS
  'Stamped when user clicks Skip. Distinct from completed. Both prevent auto-rerun. Manual replay ignores both.';
