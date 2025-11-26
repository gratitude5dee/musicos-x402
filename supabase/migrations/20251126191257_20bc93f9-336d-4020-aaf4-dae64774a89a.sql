-- Fix RLS policies for idempotency_keys table

CREATE POLICY "Users can view their own idempotency keys"
  ON public.idempotency_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage idempotency keys"
  ON public.idempotency_keys FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );