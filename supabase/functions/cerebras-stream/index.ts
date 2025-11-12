import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Node {
  id: string;
  data: {
    text: string;
    nodeType: 'system' | 'user' | 'ai';
  };
}

interface RequestBody {
  boardId: string;
  lineage: Node[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const accessToken = authHeader.replace('Bearer ', '').trim();

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      throw new Error('Invalid authorization token');
    }

    const {
      boardId,
      lineage,
      model = 'llama3.1-8b',
      temperature = 0.8,
      maxTokens = 500,
    }: RequestBody = await req.json();

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id, user_id')
      .eq('id', boardId)
      .maybeSingle();

    if (boardError || !board) {
      throw new Error('Board not found or access denied');
    }

    // Check if user is owner or collaborator
    const { data: collaborator, error: collaboratorError } = await supabase
      .from('board_collaborators')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (collaboratorError && collaboratorError.code !== 'PGRST116') {
      console.error('Error checking collaborator access:', collaboratorError);
      throw new Error('Failed to verify board access');
    }

    const hasAccess = board.user_id === user.id || Boolean(collaborator);
    if (!hasAccess) {
      throw new Error('Access denied to this board');
    }

    const { data: aiRun, error: runError } = await supabase
      .from('ai_runs')
      .insert({
        board_id: boardId,
        user_id: user.id,
        prompt: lineage.map((node) => `${node.data.nodeType}: ${node.data.text}`).join('\n\n'),
        model,
        provider: 'cerebras',
        status: 'running'
      })
      .select()
      .single();

    if (runError || !aiRun) {
      console.error('[cerebras-stream] Failed to create ai_runs row', runError);
      throw new Error('Failed to create AI run record');
    }

    let promptText = '';
    for (const node of lineage) {
      const role = node.data.nodeType === 'user'
        ? 'Human'
        : node.data.nodeType === 'system'
          ? 'System'
          : 'Assistant';
      promptText += `${role}: ${node.data.text}\n\n`;
    }
    promptText += 'Assistant: ';

    const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY');
    if (!cerebrasApiKey) {
      throw new Error('Cerebras API key not configured');
    }

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cerebrasApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant that provides thoughtful, creative responses.' },
          { role: 'user', content: promptText },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error('[cerebras-stream] Cerebras API error', response.status, errorText);
      await supabase
        .from('ai_runs')
        .update({
          status: 'failed',
          error_message: `Cerebras API error: ${response.status} ${errorText}`
        })
        .eq('id', aiRun.id);
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    let hasStartedStreaming = false;
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim() !== '');

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);

              if (data === '[DONE]') {
                await supabase
                  .from('ai_runs')
                  .update({
                    status: 'completed',
                    response: fullResponse,
                    completed_at: new Date().toISOString(),
                  })
                  .eq('id', aiRun.id);

                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed?.choices?.[0]?.delta?.content;
                if (!content) continue;

                fullResponse += content;

                if (!hasStartedStreaming) {
                  hasStartedStreaming = true;
                  await supabase
                    .from('ai_runs')
                    .update({ status: 'streaming' })
                    .eq('id', aiRun.id);
                }

                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } catch (parseError) {
                console.error('[cerebras-stream] Failed to parse stream chunk', parseError);
              }
            }
          }
        } catch (streamError) {
          console.error('[cerebras-stream] Stream processing error', streamError);
          await supabase
            .from('ai_runs')
            .update({
              status: 'failed',
              error_message: streamError instanceof Error ? streamError.message : 'Stream processing failed'
            })
            .eq('id', aiRun.id);

          controller.error(streamError);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[cerebras-stream] Error', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
