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
