
-- Create flag_type enum
CREATE TYPE public.flag_type AS ENUM ('needs_time', 'questionable', 'waiting', 'advisor_question', 'other');

-- Create ro_flags table (unified for RO-level and line-level flags)
CREATE TABLE public.ro_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ro_id UUID NOT NULL REFERENCES public.ros(id) ON DELETE CASCADE,
  ro_line_id UUID REFERENCES public.ro_lines(id) ON DELETE CASCADE,
  flag_type public.flag_type NOT NULL DEFAULT 'other',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cleared_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT note_max_length CHECK (char_length(note) <= 80)
);

-- Enable RLS
ALTER TABLE public.ro_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users select own ro_flags" ON public.ro_flags
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own ro_flags" ON public.ro_flags
  FOR INSERT WITH CHECK (user_id = auth.uid() AND owns_ro(auth.uid(), ro_id));

CREATE POLICY "Users update own ro_flags" ON public.ro_flags
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users delete own ro_flags" ON public.ro_flags
  FOR DELETE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_ro_flags_user_created ON public.ro_flags (user_id, created_at DESC);
CREATE INDEX idx_ro_flags_user_type ON public.ro_flags (user_id, flag_type);
CREATE INDEX idx_ro_flags_ro_id ON public.ro_flags (ro_id);
CREATE INDEX idx_ro_flags_active ON public.ro_flags (user_id, created_at DESC) WHERE cleared_at IS NULL;

-- Add user_settings table for preferences (theme, scan confidence toggle, flag inbox prefs)
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'light',
  show_scan_confidence BOOLEAN DEFAULT false,
  flag_inbox_date_range TEXT DEFAULT 'this_week',
  flag_inbox_types public.flag_type[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own settings" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own settings" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
