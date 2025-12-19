import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const THIRDWEB_API_URL = 'https://api.thirdweb.com/v1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Assume the last part of the path is the action or sub-resource
  const parts = url.pathname.split('/');
  const action = parts[parts.length - 1]; // e.g. 'wallet', 'execute'
  const isBalance = url.pathname.includes('balance'); // 'balance' might be queried with params or path

  const secretKey = Deno.env.get('THIRDWEB_SECRET_KEY');
  if (!secretKey) return new Response('Missing Secret Key', { status: 500 });

  try {
    if (action === 'wallet' && req.method === 'POST') {
       const body = await req.json();
       const identifier = `musicos-${body.role}-${body.agentId}`;

       const response = await fetch(`${THIRDWEB_API_URL}/wallets/server`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-secret-key': secretKey,
          },
          body: JSON.stringify({ identifier }),
       });

       if (!response.ok) {
           const err = await response.text();
           throw new Error(`Thirdweb API error: ${err}`);
       }

       const data = await response.json();
       return new Response(JSON.stringify(data.result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    if ((action === 'balance' || isBalance) && req.method === 'GET') {
       const address = url.searchParams.get('address');
       const chainId = url.searchParams.get('chainId') || '8453';

       const response = await fetch(
          `${THIRDWEB_API_URL}/wallet/${address}/balance?chainId=${chainId}`,
          { headers: { 'x-secret-key': secretKey } }
       );
       const data = await response.json();
       return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    if (action === 'execute' && req.method === 'POST') {
       const body = await req.json();

       if (body.actionType === 'payment') {
          // Simulate payment transaction for now
          // In real implementation, this would use the agent wallet to send funds via Thirdweb SDK
          return new Response(JSON.stringify({
             success: true,
             transactionHash: '0x' + crypto.randomUUID().replace(/-/g, '')
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
       }

       return new Response(JSON.stringify({ success: true, result: 'Action completed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });

  } catch (error: any) {
    console.error('Agent API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
