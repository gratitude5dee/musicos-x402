import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const THIRDWEB_API_URL = 'https://api.thirdweb.com/ai/chat';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const thirdwebSecretKey = Deno.env.get('THIRDWEB_SECRET_KEY');

    if (!thirdwebSecretKey) {
      throw new Error('THIRDWEB_SECRET_KEY not configured');
    }

    // Forward request to thirdweb AI API
    const response = await fetch(THIRDWEB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': thirdwebSecretKey,
      },
      body: JSON.stringify({
        messages: body.messages,
        stream: true,
        context: body.context || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Thirdweb API error: ${response.status} ${errorText}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
