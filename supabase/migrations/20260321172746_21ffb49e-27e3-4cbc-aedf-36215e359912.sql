
-- Artist Royalties table
CREATE TABLE public.artist_royalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'streaming',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  period_start DATE NOT NULL,
  period_end DATE,
  status TEXT NOT NULL DEFAULT 'received',
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_royalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own royalties" ON public.artist_royalties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own royalties" ON public.artist_royalties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own royalties" ON public.artist_royalties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own royalties" ON public.artist_royalties FOR DELETE USING (auth.uid() = user_id);

-- Artist Creative Projects table
CREATE TABLE public.artist_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'album',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  start_date DATE,
  release_date DATE,
  budget NUMERIC,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  collaborators TEXT,
  platform TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own projects" ON public.artist_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.artist_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.artist_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.artist_projects FOR DELETE USING (auth.uid() = user_id);
