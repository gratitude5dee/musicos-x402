-- x402 Payment Transactions
CREATE TABLE IF NOT EXISTS x402_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  invoice_id UUID REFERENCES invoices(id),
  booking_id UUID REFERENCES venue_bookings(id),
  royalty_distribution_id UUID,

  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice_payment', 'royalty_distribution', 'booking_deposit', 'merchandise_payment')),
  amount DECIMAL(18, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',

  -- Wallet addresses
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,

  -- Thirdweb/Blockchain details
  thirdweb_transaction_id TEXT,
  blockchain_tx_hash TEXT,
  chain_id INTEGER NOT NULL DEFAULT 8453,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Agent Wallets
CREATE TABLE IF NOT EXISTS agent_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  identifier TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  smart_wallet_address TEXT NOT NULL,
  public_key TEXT,
  role TEXT NOT NULL CHECK (role IN ('booking_agent', 'royalty_agent', 'merchandise_agent', 'general')),
  balance DECIMAL(18, 6) DEFAULT 0,
  last_balance_check TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Royalty Distributions
CREATE TABLE IF NOT EXISTS royalty_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('track', 'album', 'ip_asset', 'nft')),

  -- Distribution details
  total_amount DECIMAL(18, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partial', 'failed')),
  processed_splits INTEGER DEFAULT 0,
  total_splits INTEGER NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Royalty Splits (individual payments within a distribution)
CREATE TABLE IF NOT EXISTS royalty_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES royalty_distributions(id) ON DELETE CASCADE,

  -- Recipient details
  recipient_user_id UUID REFERENCES auth.users(id),
  recipient_address TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  role TEXT NOT NULL,

  -- Payment details
  percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  amount DECIMAL(18, 6) NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id UUID REFERENCES x402_transactions(id),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('wallet_assistant', 'booking_agent', 'general')),
  wallet_address TEXT,
  chain_ids INTEGER[] DEFAULT ARRAY[8453],
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,

  -- For tool/action messages
  action_type TEXT,
  action_data JSONB,
  transaction_id UUID REFERENCES x402_transactions(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_x402_transactions_user ON x402_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_x402_transactions_status ON x402_transactions(status);
CREATE INDEX IF NOT EXISTS idx_x402_transactions_type ON x402_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_agent_wallets_agent ON agent_wallets(agent_id);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_asset ON royalty_distributions(asset_id);
CREATE INDEX IF NOT EXISTS idx_royalty_splits_distribution ON royalty_splits(distribution_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id);

-- Row Level Security
ALTER TABLE x402_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Use safer policy creation to avoid errors if they exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'x402_transactions' AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions" ON x402_transactions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_sessions' AND policyname = 'Users can view own chat sessions'
    ) THEN
        CREATE POLICY "Users can view own chat sessions" ON ai_chat_sessions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ai_chat_sessions' AND policyname = 'Users can insert own chat sessions'
    ) THEN
        CREATE POLICY "Users can insert own chat sessions" ON ai_chat_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_x402_transactions_updated_at ON x402_transactions;
CREATE TRIGGER update_x402_transactions_updated_at
  BEFORE UPDATE ON x402_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_agent_wallets_updated_at ON agent_wallets;
CREATE TRIGGER update_agent_wallets_updated_at
  BEFORE UPDATE ON agent_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at ON ai_chat_sessions;
CREATE TRIGGER update_ai_chat_sessions_updated_at
  BEFORE UPDATE ON ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
