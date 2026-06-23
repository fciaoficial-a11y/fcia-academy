ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS objective text,
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;