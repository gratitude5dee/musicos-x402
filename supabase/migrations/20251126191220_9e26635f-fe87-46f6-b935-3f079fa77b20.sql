-- Phase 1: Core Tables for Thirdweb Payment System

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Index for fast wallet address lookups
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  token_contract TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  thirdweb_transaction_id TEXT,
  transaction_hash TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMPTZ
);

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions they send"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Service role can update transaction status"
  ON public.transactions FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Indexes for transactions
CREATE INDEX idx_transactions_from_user ON public.transactions(from_user_id, created_at DESC);
CREATE INDEX idx_transactions_to_user ON public.transactions(to_user_id, created_at DESC);
CREATE INDEX idx_transactions_thirdweb_id ON public.transactions(thirdweb_transaction_id) WHERE thirdweb_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_status ON public.transactions(status, created_at DESC);
CREATE INDEX idx_transactions_pending ON public.transactions(status, created_at) WHERE status = 'pending';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  correlation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_correlation ON public.audit_logs(correlation_id);

-- ============================================================================
-- IDEMPOTENCY KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  request_hash TEXT NOT NULL,
  response_data JSONB,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

-- Index for cleanup
CREATE INDEX idx_idempotency_expiry ON public.idempotency_keys(expires_at)
  WHERE status = 'pending';

-- Cleanup function for expired keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DAILY SPEND TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_spend_tracking (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_spent_usd NUMERIC(20, 2) DEFAULT 0 NOT NULL,
  transaction_count INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (user_id, date)
);

-- Trigger to update daily spend when transaction is created
CREATE OR REPLACE FUNCTION update_daily_spend()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'failed' THEN
    INSERT INTO public.daily_spend_tracking (user_id, date, total_spent_usd, transaction_count)
    VALUES (NEW.from_user_id, CURRENT_DATE, 0, 1)
    ON CONFLICT (user_id, date) DO UPDATE SET
      transaction_count = daily_spend_tracking.transaction_count + 1,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_daily_spend
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_spend();

-- RLS for daily spend tracking
ALTER TABLE public.daily_spend_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spend tracking"
  ON public.daily_spend_tracking FOR SELECT
  USING (auth.uid() = user_id);