
ALTER TABLE public.life_file_documents
  ADD COLUMN IF NOT EXISTS reminder_30_days boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_60_days boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_90_days boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_6_months boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_1_year boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_email text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_expired boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_sent_at jsonb DEFAULT '{}';
