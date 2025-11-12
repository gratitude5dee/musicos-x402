-- ============================================================================
-- x402 Agents Commerce Protocol - Database Schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 1. Agent Registry & Lifecycle
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Agent identity
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'studio', 'treasury', 'distribution', 'rights', 'analytics', 'custom'
  )),
  description TEXT,
  avatar_url TEXT,
  
  -- Configuration
  config JSONB DEFAULT '{}',
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- State management
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'disabled', 'archived'
  )),
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Permissions & limits
  spend_limit_sol DECIMAL(20, 9) DEFAULT 5.0,
  daily_spend_limit_sol DECIMAL(20, 9) DEFAULT 10.0,
  requires_approval BOOLEAN DEFAULT TRUE,
  approved_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name)
);

-- Indexes for agent queries
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_type ON public.agents(type);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_last_active ON public.agents(last_active_at DESC);

-- ============================================================================
-- 2. Agent Activity Logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  correlation_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'tool_call', 'planning', 'approval_requested', 'approval_granted', 
    'approval_denied', 'error', 'completion'
  )),
  
  -- Tool invocation tracking
  tool_name TEXT,
  tool_input JSONB,
  tool_output JSONB,
  tool_status TEXT CHECK (tool_status IN ('success', 'failure', 'pending')),
  
  -- Performance metrics
  latency_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  
  -- Error handling
  error_message TEXT,
  error_stack TEXT,
  
  -- Context
  context_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for activity queries
CREATE INDEX idx_activity_agent_id ON public.agent_activity_log(agent_id);
CREATE INDEX idx_activity_user_id ON public.agent_activity_log(user_id);
CREATE INDEX idx_activity_correlation ON public.agent_activity_log(correlation_id);
CREATE INDEX idx_activity_created_at ON public.agent_activity_log(created_at DESC);
CREATE INDEX idx_activity_tool_name ON public.agent_activity_log(tool_name);

-- ============================================================================
-- 3. Agent Memory & Knowledge Base (pgvector)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_memory_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'conversation', 'document', 'instruction', 'outcome', 'preference'
  )),
  
  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536),
  
  -- Metadata
  source_uri TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Lifecycle
  importance_score REAL DEFAULT 0.5 CHECK (importance_score BETWEEN 0 AND 1),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes for memory queries
CREATE INDEX idx_memory_agent_id ON public.agent_memory_chunks(agent_id);
CREATE INDEX idx_memory_user_id ON public.agent_memory_chunks(user_id);
CREATE INDEX idx_memory_content_type ON public.agent_memory_chunks(content_type);
CREATE INDEX idx_memory_created_at ON public.agent_memory_chunks(created_at DESC);

-- Vector similarity index (IVFFlat for pgvector)
CREATE INDEX idx_memory_embedding_ivfflat 
  ON public.agent_memory_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- 4. Treasury & Wallet Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.treasury_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Transaction details
  transaction_signature TEXT UNIQUE,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  amount_sol DECIMAL(20, 9) NOT NULL CHECK (amount_sol > 0),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'failed', 'cancelled'
  )),
  
  -- Context
  purpose TEXT,
  memo TEXT,
  correlation_id TEXT,
  idempotency_key TEXT UNIQUE,
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Indexes for treasury queries
CREATE INDEX idx_treasury_user_id ON public.treasury_transactions(user_id);
CREATE INDEX idx_treasury_agent_id ON public.treasury_transactions(agent_id);
CREATE INDEX idx_treasury_from_wallet ON public.treasury_transactions(from_wallet);
CREATE INDEX idx_treasury_to_wallet ON public.treasury_transactions(to_wallet);
CREATE INDEX idx_treasury_status ON public.treasury_transactions(status);
CREATE INDEX idx_treasury_created_at ON public.treasury_transactions(created_at DESC);
CREATE INDEX idx_treasury_idempotency ON public.treasury_transactions(idempotency_key);

-- ============================================================================
-- 5. Idempotency Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key TEXT NOT NULL UNIQUE,
  tool_name TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Deduplication window
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for idempotency lookups
CREATE INDEX idx_idempotency_key ON public.idempotency_keys(idempotency_key);
CREATE INDEX idx_idempotency_expires ON public.idempotency_keys(expires_at);

-- Automatic cleanup of expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. RPC Functions
-- ============================================================================

-- Function to ensure idempotency
CREATE OR REPLACE FUNCTION public.ensure_idempotency_key(
  p_idempotency_key TEXT,
  p_payload_hash TEXT,
  p_tool_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_stored_hash TEXT;
BEGIN
  -- Check if key exists
  SELECT EXISTS (
    SELECT 1 FROM public.idempotency_keys
    WHERE idempotency_key = p_idempotency_key
  ) INTO v_exists;

  IF v_exists THEN
    -- Verify payload hash matches
    SELECT payload_hash INTO v_stored_hash
    FROM public.idempotency_keys
    WHERE idempotency_key = p_idempotency_key;

    IF v_stored_hash != p_payload_hash THEN
      RAISE EXCEPTION 'Idempotency key collision: payload mismatch';
    END IF;

    -- Return true (duplicate)
    RETURN TRUE;
  ELSE
    -- Insert new key
    INSERT INTO public.idempotency_keys (
      idempotency_key,
      tool_name,
      payload_hash,
      user_id,
      agent_id
    ) VALUES (
      p_idempotency_key,
      p_tool_name,
      p_payload_hash,
      auth.uid(),
      NULL
    );

    -- Return false (new)
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to match knowledge base chunks by similarity
CREATE OR REPLACE FUNCTION public.match_kb_chunks(
  p_query_embedding vector(1536),
  p_agent_id UUID,
  p_match_count INT DEFAULT 10,
  p_similarity_threshold REAL DEFAULT 0.75
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  similarity REAL,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    amc.id,
    amc.content,
    amc.content_type,
    1 - (amc.embedding <=> p_query_embedding) AS similarity,
    amc.metadata,
    amc.created_at
  FROM public.agent_memory_chunks amc
  WHERE
    amc.agent_id = p_agent_id
    AND 1 - (amc.embedding <=> p_query_embedding) > p_similarity_threshold
  ORDER BY amc.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log agent activity
CREATE OR REPLACE FUNCTION public.log_agent_activity(
  p_agent_id UUID,
  p_correlation_id TEXT,
  p_activity_type TEXT,
  p_tool_name TEXT DEFAULT NULL,
  p_tool_input JSONB DEFAULT NULL,
  p_tool_output JSONB DEFAULT NULL,
  p_tool_status TEXT DEFAULT NULL,
  p_latency_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_context_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.agent_activity_log (
    agent_id,
    user_id,
    correlation_id,
    activity_type,
    tool_name,
    tool_input,
    tool_output,
    tool_status,
    latency_ms,
    error_message,
    context_data
  ) VALUES (
    p_agent_id,
    auth.uid(),
    p_correlation_id,
    p_activity_type,
    p_tool_name,
    p_tool_input,
    p_tool_output,
    p_tool_status,
    p_latency_ms,
    p_error_message,
    p_context_data
  )
  RETURNING id INTO v_activity_id;

  -- Update agent last_active_at
  UPDATE public.agents
  SET last_active_at = NOW()
  WHERE id = p_agent_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Row-Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Agents: Users can only see/manage their own agents
CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- Agent activity: Users can only see logs for their own agents
CREATE POLICY "Users can view their agent activity"
  ON public.agent_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity logs"
  ON public.agent_activity_log FOR INSERT
  WITH CHECK (true);

-- Agent memory: Users can only access memory for their own agents
CREATE POLICY "Users can view their agent memory"
  ON public.agent_memory_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their agent memory"
  ON public.agent_memory_chunks FOR ALL
  USING (auth.uid() = user_id);

-- Treasury: Users can only see their own transactions
CREATE POLICY "Users can view their transactions"
  ON public.treasury_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON public.treasury_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Idempotency: Service role only
CREATE POLICY "Service role can manage idempotency keys"
  ON public.idempotency_keys FOR ALL
  USING (true);

-- ============================================================================
-- 8. Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memory_updated_at
  BEFORE UPDATE ON public.agent_memory_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 9. Initial Data - System Agents
-- ============================================================================

-- Create system agents for each user (via trigger on user creation)
CREATE OR REPLACE FUNCTION public.create_default_agents()
RETURNS TRIGGER AS $$
BEGIN
  -- Studio Agent
  INSERT INTO public.agents (
    user_id,
    name,
    type,
    description,
    capabilities,
    tools_enabled
  ) VALUES (
    NEW.id,
    'Studio Agent',
    'studio',
    'AI assistant for content creation, minting, and creative workflows',
    ARRAY['content_generation', 'nft_minting', 'metadata_creation'],
    ARRAY['storage_put', 'storage_get', 'kb_search', 'web_search']
  );

  -- Treasury Agent
  INSERT INTO public.agents (
    user_id,
    name,
    type,
    description,
    capabilities,
    tools_enabled,
    requires_approval
  ) VALUES (
    NEW.id,
    'Treasury Agent',
    'treasury',
    'AI assistant for payment automation and treasury management',
    ARRAY['payment_execution', 'balance_monitoring', 'budget_allocation'],
    ARRAY['wallet_transfer', 'supabase_query_sql', 'supabase_call_rpc'],
    TRUE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_agents
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_agents();

-- ============================================================================
-- 10. Scheduled Job - Cleanup
-- ============================================================================

-- Note: This requires pg_cron extension (available in Supabase Pro)
-- Schedule daily cleanup of expired idempotency keys
-- SELECT cron.schedule(
--   'cleanup-idempotency-keys',
--   '0 2 * * *', -- Every day at 2 AM
--   $$ SELECT cleanup_expired_idempotency_keys(); $$
-- );

COMMENT ON TABLE public.agents IS 'Agent registry and configuration';
COMMENT ON TABLE public.agent_activity_log IS 'Audit log of all agent actions';
COMMENT ON TABLE public.agent_memory_chunks IS 'Vector knowledge base for agent context';
COMMENT ON TABLE public.treasury_transactions IS 'On-chain transaction tracking';
COMMENT ON TABLE public.idempotency_keys IS 'Idempotency enforcement for tool calls';
