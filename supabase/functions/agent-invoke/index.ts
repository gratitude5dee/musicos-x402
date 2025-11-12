import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
};

interface AgentInvocationRequest {
  agentId: string;
  input: string;
  context?: Record<string, any>;
  requiresApproval?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: AgentInvocationRequest = await req.json();
    const { agentId, input, context = {}, requiresApproval = false } = body;

    if (!agentId || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check agent status
    if (agent.status !== 'active') {
      return new Response(
        JSON.stringify({ error: `Agent is ${agent.status}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate correlation ID
    const correlationId = crypto.randomUUID();

    // Log agent invocation
    await supabase.rpc('log_agent_activity', {
      p_agent_id: agentId,
      p_correlation_id: correlationId,
      p_activity_type: 'planning',
      p_context_data: { input, context },
    });

    // Call AI orchestrator (OpenAI, Anthropic, etc.)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const mcpServerUrl = Deno.env.get('MCP_SERVER_URL') || 'http://localhost:8974';
    const mcpBearerToken = Deno.env.get('MCP_BEARER_TOKEN');

    // Step 1: Planning phase - Generate execution plan
    const planningResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI agent orchestrator for MusicOS. You have access to the following tools via the MCP server:
            
${enabledTools.length > 0 ? enabledTools.map((tool: string) => `- ${tool}`).join('\n') : '- (no tools enabled)'}

Your job is to create a multi-step execution plan to accomplish the user's request. Each step should be a tool invocation with specific parameters.

Return your plan as a JSON array of steps:
[
  {
    "tool": "tool_name",
    "input": { ... },
    "description": "What this step accomplishes"
  },
  ...
]`,
          },
          {
            role: 'user',
            content: input,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!planningResponse.ok) {
      throw new Error(`Planning failed: ${planningResponse.statusText}`);
    }

    const planningData = await planningResponse.json();
    const plan = JSON.parse(planningData.choices[0].message.content);
    const enabledTools = Array.isArray(agent.tools_enabled) ? agent.tools_enabled : [];

    console.log('Execution plan generated:', plan);

    // Log planning completion
    await supabase.rpc('log_agent_activity', {
      p_agent_id: agentId,
      p_correlation_id: correlationId,
      p_activity_type: 'planning',
      p_tool_output: plan,
      p_tool_status: 'success',
    });

    // Step 2: Approval gate (if required)
    if (requiresApproval || agent.requires_approval) {
      // Store plan for approval
      const { data: approvalRequest, error: approvalError } = await supabase
        .from('agent_activity_log')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          correlation_id: correlationId,
          activity_type: 'approval_requested',
          tool_input: plan,
          tool_status: 'pending',
        })
        .select()
        .single();

      if (approvalError) {
        throw new Error(`Failed to create approval request: ${approvalError.message}`);
      }

      return new Response(
        JSON.stringify({
          status: 'approval_required',
          correlationId,
          plan: plan.steps,
          approvalRequestId: approvalRequest.id,
          message: 'Plan requires approval before execution',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Execute plan (auto-approved or no approval required)
    const executionResults = [];

    for (const step of plan.steps) {
      console.log(`Executing step: ${step.tool}`);

      // Verify tool is enabled for this agent
      if (!enabledTools.includes(step.tool)) {
        console.warn(`Tool ${step.tool} not enabled for agent ${agentId}`);
        continue;
      }

      const stepStartTime = Date.now();

      try {
        // Invoke MCP tool
        const toolResponse = await fetch(`${mcpServerUrl}/invoke`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mcpBearerToken}`,
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
          },
          body: JSON.stringify({
            tool: step.tool,
            input: step.input,
          }),
        });

        if (!toolResponse.ok) {
          throw new Error(`Tool invocation failed: ${toolResponse.statusText}`);
        }

        const toolResult = await toolResponse.json();
        const latencyMs = Date.now() - stepStartTime;

        // Log tool execution
        await supabase.rpc('log_agent_activity', {
          p_agent_id: agentId,
          p_correlation_id: correlationId,
          p_activity_type: 'tool_call',
          p_tool_name: step.tool,
          p_tool_input: step.input,
          p_tool_output: toolResult.output,
          p_tool_status: 'success',
          p_latency_ms: latencyMs,
        });

        executionResults.push({
          tool: step.tool,
          description: step.description,
          output: toolResult.output,
          latencyMs,
          status: 'success',
        });

      } catch (error: any) {
        console.error(`Tool execution failed:`, error);

        // Log tool error
        await supabase.rpc('log_agent_activity', {
          p_agent_id: agentId,
          p_correlation_id: correlationId,
          p_activity_type: 'error',
          p_tool_name: step.tool,
          p_tool_input: step.input,
          p_error_message: error.message,
          p_tool_status: 'failure',
        });

        executionResults.push({
          tool: step.tool,
          description: step.description,
          error: error.message,
          status: 'failure',
        });
      }
    }

    // Step 4: Final synthesis
    const synthesisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant. Summarize the execution results into a clear, actionable response for the user.',
          },
          {
            role: 'user',
            content: `Original request: ${input}\n\nExecution results:\n${JSON.stringify(executionResults, null, 2)}\n\nProvide a natural language summary of what was accomplished.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const synthesisData = await synthesisResponse.json();
    const finalResponse = synthesisData.choices[0].message.content;

    // Log completion
    await supabase.rpc('log_agent_activity', {
      p_agent_id: agentId,
      p_correlation_id: correlationId,
      p_activity_type: 'completion',
      p_tool_output: { summary: finalResponse, results: executionResults },
      p_tool_status: 'success',
    });

    return new Response(
      JSON.stringify({
        status: 'completed',
        correlationId,
        response: finalResponse,
        executionResults,
        plan: plan.steps,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Agent invocation error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
