-- Add is_official flag to zakat_sessions
-- Only one session per user should be is_official=true at a time (enforced in app layer)
ALTER TABLE public.zakat_sessions ADD COLUMN IF NOT EXISTS is_official boolean DEFAULT false;
