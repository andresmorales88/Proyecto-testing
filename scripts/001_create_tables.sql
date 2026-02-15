-- Daily fitness entries table
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  
  -- Garmin data (previous day)
  sleep_score NUMERIC(5,1),
  sleep_hours TEXT,
  body_battery_am NUMERIC(5,1),
  stress_avg NUMERIC(5,1),
  steps INTEGER,
  kcal_burned INTEGER,
  vfc_7d NUMERIC(5,1),
  
  -- Eufy scale data
  weight NUMERIC(5,1),
  body_fat_pct NUMERIC(5,1),
  muscle_mass NUMERIC(5,1),
  mb_kcal INTEGER,
  
  -- Training
  training_type TEXT,
  cardio_yesterday BOOLEAN DEFAULT FALSE,
  
  -- Lifestyle
  alcohol BOOLEAN DEFAULT FALSE,
  mental_state TEXT,
  
  -- Principles
  principle_1 TEXT,
  principle_1_status TEXT,
  principle_2 TEXT,
  principle_2_status TEXT,
  
  -- Notes
  observations TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, entry_date)
);

-- Photo gallery table (separate from daily entries)
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  category TEXT DEFAULT 'progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_entries
CREATE POLICY "Users can view their own entries" ON public.daily_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entries" ON public.daily_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.daily_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.daily_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for progress_photos
CREATE POLICY "Users can view their own photos" ON public.progress_photos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own photos" ON public.progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own photos" ON public.progress_photos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own photos" ON public.progress_photos
  FOR DELETE USING (auth.uid() = user_id);
