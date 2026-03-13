-- Add user profile and accent color to user_settings for personalization
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS display_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS shop_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT 'blue';
