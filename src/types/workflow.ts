/**
 * Workflow Types for x402 Agent Composer
 * Supports multi-agent orchestration with conditional logic, branching, and parallel execution
 */

export type WorkflowNodeType =
  | 'agent_invoke'      // Execute an agent with input
  | 'condition'         // Conditional branching (if/else)
  | 'parallel'          // Execute multiple agents in parallel
  | 'transform'         // Transform data between agents
  | 'trigger'           // Workflow entry point (manual, schedule, event)
  | 'webhook'           // Call external webhook
  | 'wait'              // Delay execution
  | 'aggregate';        // Combine multiple results

export type WorkflowTriggerType = 'manual' | 'schedule' | 'event' | 'webhook';

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  inputs?: string[];    // IDs of connected input nodes
  outputs?: string[];   // IDs of connected output nodes
}

export interface WorkflowNodeData {
  // Agent Invoke specific
  agentId?: string;
  agentName?: string;
  agentType?: string;
  input?: string | object;
  inputMapping?: Record<string, string>; // Map previous outputs to agent inputs

  // Condition specific
  condition?: {
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
    field: string;
    value: any;
    trueNodeId?: string;
    falseNodeId?: string;
  };

  // Transform specific
  transform?: {
    type: 'jq' | 'javascript' | 'template';
    expression: string;
  };

  // Trigger specific
  trigger?: {
    type: WorkflowTriggerType;
    schedule?: string; // cron expression
    eventType?: string;
    webhookUrl?: string;
  };

  // Wait specific
  wait?: {
    duration: number; // milliseconds
    unit: 'seconds' | 'minutes' | 'hours';
  };

  // Webhook specific
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    bodyTemplate?: string;
  };

  // Parallel specific
  parallel?: {
    branches: string[]; // Node IDs to execute in parallel
    waitForAll: boolean;
  };

  // Aggregate specific
  aggregate?: {
    strategy: 'merge' | 'concat' | 'first' | 'last' | 'custom';
    customFunction?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;      // Source node ID
  target: string;      // Target node ID
  label?: string;      // Optional edge label (for conditions: "true", "false")
  data?: {
    condition?: string;
  };
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger_type: WorkflowTriggerType;

  // Workflow definition
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // Execution settings
  max_execution_time?: number;  // milliseconds
  retry_policy?: {
    max_retries: number;
    backoff: 'linear' | 'exponential';
    retry_delay: number;
  };

  // Cost controls
  max_cost_usd?: number;
  max_tokens?: number;

  // Metadata
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count?: number;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: WorkflowExecutionStatus;

  // Execution context
  trigger_data?: any;
  input?: any;
  output?: any;
  error?: string;

  // Node execution tracking
  node_executions: NodeExecution[];

  // Metrics
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  total_cost_usd?: number;
  total_tokens?: number;

  // Metadata
  metadata?: Record<string, any>;
}

export interface NodeExecution {
  node_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  input?: any;
  output?: any;
  error?: string;
  agent_activity_log_id?: string; // Link to agent_activity_log
  cost_usd?: number;
  tokens?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'content' | 'distribution' | 'analytics' | 'treasury' | 'custom';
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  estimated_cost: string;

  // Template definition (same as Workflow)
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // Required configuration
  required_agents: string[]; // Agent types required
  required_tools: string[];  // Tools required

  // Usage stats
  usage_count?: number;
  rating?: number;

  created_by: string;
  created_at: string;
}

// UI State Types
export interface WorkflowBuilderState {
  workflow: Workflow | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isExecuting: boolean;
  executionResult?: WorkflowExecution;
  zoom: number;
  pan: { x: number; y: number };
}

// Analytics Types
export interface WorkflowAnalytics {
  workflow_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration_ms: number;
  total_cost_usd: number;
  total_tokens: number;
  success_rate: number;
  executions_by_day: Array<{
    date: string;
    count: number;
    success_count: number;
    fail_count: number;
  }>;
  most_common_errors: Array<{
    error: string;
    count: number;
  }>;
  node_performance: Array<{
    node_id: string;
    node_label: string;
    avg_duration_ms: number;
    success_rate: number;
    total_cost_usd: number;
  }>;
}
