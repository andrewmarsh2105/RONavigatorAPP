
CREATE TABLE public.pay_period_closeouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  breakdowns jsonb NOT NULL DEFAULT '{}'::jsonb,
  ro_ids text[] NOT NULL DEFAULT '{}',
  proof_pack_url text
);

ALTER TABLE public.pay_period_closeouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own closeouts"
  ON public.pay_period_closeouts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own closeouts"
  ON public.pay_period_closeouts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own closeouts"
  ON public.pay_period_closeouts
  FOR DELETE
  USING (user_id = auth.uid());
