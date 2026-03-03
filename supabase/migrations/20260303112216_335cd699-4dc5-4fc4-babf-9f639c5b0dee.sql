
-- Add subscription-related columns to user_settings for fast local lookups
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS pro_expires_at timestamp with time zone;

-- Index for fast customer ID lookup from edge functions
CREATE INDEX IF NOT EXISTS idx_user_settings_stripe_customer_id ON public.user_settings (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
