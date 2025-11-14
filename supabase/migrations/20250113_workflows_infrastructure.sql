-- Workflows Infrastructure Migration
-- Multi-agent orchestration workflows with visual composition

-- =====================================================
-- 1. WORKFLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'schedule', 'event', 'webhook')),

    -- Workflow definition (JSONB for flexibility)
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Execution settings
    max_execution_time INTEGER, -- milliseconds
    retry_policy JSONB,
    max_cost_usd NUMERIC(10, 4),
    max_tokens INTEGER,

    -- Metadata
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);
CREATE INDEX idx_workflows_trigger_type ON public.workflows(trigger_type);
CREATE INDEX idx_workflows_updated_at ON public.workflows(updated_at DESC);
CREATE INDEX idx_workflows_tags ON public.workflows USING GIN(tags);

-- =====================================================
-- 2. WORKFLOW EXECUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Execution status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Execution context
    trigger_data JSONB,
    input JSONB,
    output JSONB,
    error TEXT,

    -- Node execution tracking
    node_executions JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Metrics
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    total_cost_usd NUMERIC(10, 4),
    total_tokens INTEGER,

    -- Metadata
    metadata JSONB,
    correlation_id TEXT
);

CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON public.workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_workflow_executions_started_at ON public.workflow_executions(started_at DESC);
CREATE INDEX idx_workflow_executions_correlation_id ON public.workflow_executions(correlation_id);

-- =====================================================
-- 3. WORKFLOW TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template info
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('onboarding', 'content', 'distribution', 'analytics', 'treasury', 'custom')),
    icon TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT,
    estimated_cost TEXT,

    -- Template definition
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Requirements
    required_agents TEXT[] NOT NULL DEFAULT '{}',
    required_tools TEXT[] NOT NULL DEFAULT '{}',

    -- Usage stats
    usage_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2),

    -- Metadata
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_public BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_difficulty ON public.workflow_templates(difficulty);
CREATE INDEX idx_workflow_templates_rating ON public.workflow_templates(rating DESC);
CREATE INDEX idx_workflow_templates_usage_count ON public.workflow_templates(usage_count DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Workflows RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflows"
    ON public.workflows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows"
    ON public.workflows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
    ON public.workflows FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
    ON public.workflows FOR DELETE
    USING (auth.uid() = user_id);

-- Workflow Executions RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow executions"
    ON public.workflow_executions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions"
    ON public.workflow_executions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions"
    ON public.workflow_executions FOR UPDATE
    USING (auth.uid() = user_id);

-- Workflow Templates RLS (Public read, admin write)
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
    ON public.workflow_templates FOR SELECT
    USING (is_public = true);

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON public.workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. RPC FUNCTIONS FOR WORKFLOW OPERATIONS
-- =====================================================

-- Execute a workflow
CREATE OR REPLACE FUNCTION execute_workflow(
    p_workflow_id UUID,
    p_input JSONB DEFAULT '{}'::jsonb,
    p_trigger_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
    v_user_id UUID;
BEGIN
    -- Get user_id from workflow
    SELECT user_id INTO v_user_id
    FROM workflows
    WHERE id = p_workflow_id;

    -- Create execution record
    INSERT INTO workflow_executions (
        workflow_id,
        user_id,
        status,
        input,
        trigger_data
    ) VALUES (
        p_workflow_id,
        v_user_id,
        'pending',
        p_input,
        p_trigger_data
    ) RETURNING id INTO v_execution_id;

    -- Update workflow last_executed_at and execution_count
    UPDATE workflows
    SET
        last_executed_at = NOW(),
        execution_count = execution_count + 1
    WHERE id = p_workflow_id;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workflow analytics
CREATE OR REPLACE FUNCTION get_workflow_analytics(p_workflow_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_analytics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'workflow_id', p_workflow_id,
        'total_executions', COUNT(*),
        'successful_executions', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed_executions', COUNT(*) FILTER (WHERE status = 'failed'),
        'average_duration_ms', AVG(duration_ms),
        'total_cost_usd', SUM(total_cost_usd),
        'total_tokens', SUM(total_tokens),
        'success_rate', (COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / NULLIF(COUNT(*), 0) * 100)
    ) INTO v_analytics
    FROM workflow_executions
    WHERE workflow_id = p_workflow_id;

    RETURN v_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE public.workflows IS 'Multi-agent workflow definitions with visual composition';
COMMENT ON TABLE public.workflow_executions IS 'Execution history and tracking for workflows';
COMMENT ON TABLE public.workflow_templates IS 'Pre-built workflow templates for common use cases';

COMMENT ON COLUMN public.workflows.nodes IS 'JSONB array of workflow nodes (agents, conditions, transforms, etc.)';
COMMENT ON COLUMN public.workflows.edges IS 'JSONB array of connections between nodes';
COMMENT ON COLUMN public.workflow_executions.node_executions IS 'JSONB array tracking execution of each node';
