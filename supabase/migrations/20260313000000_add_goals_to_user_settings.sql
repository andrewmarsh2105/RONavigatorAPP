-- Add goals and hourly rate columns to user_settings for cross-device sync
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS hours_goal_daily numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_goal_weekly numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
