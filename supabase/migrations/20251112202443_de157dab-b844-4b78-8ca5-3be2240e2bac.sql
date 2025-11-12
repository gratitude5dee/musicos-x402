-- Add missing columns to agent_activity_log table
ALTER TABLE public.agent_activity_log
ADD COLUMN IF NOT EXISTS correlation_id TEXT,
ADD COLUMN IF NOT EXISTS tool_name TEXT,
ADD COLUMN IF NOT EXISTS tool_status TEXT CHECK (tool_status IN ('success', 'failure', 'pending', 'error')),
ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS tokens_used INTEGER,
ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10, 6),
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_activity_log_correlation_id ON public.agent_activity_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_log_tool_status ON public.agent_activity_log(tool_status);
CREATE INDEX IF NOT EXISTS idx_agents_last_active_at ON public.agents(last_active_at DESC);