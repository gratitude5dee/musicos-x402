import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { provider, apiKey, isEnabled } = await req.json();

    // Validate the API key by making a test request to the provider
    let isValid = false;
    let providerData = null;

    if (provider === 'printful') {
      const response = await fetch('https://api.printful.com/stores', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      isValid = response.ok;
      if (isValid) {
        providerData = await response.json();
      }
    } else if (provider === 'printify') {
      const response = await fetch('https://api.printify.com/v1/shops.json', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      isValid = response.ok;
      if (isValid) {
        providerData = await response.json();
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the connection (in a real app, encrypt the API key)
    const { error: insertError } = await supabaseClient
      .from('print_partner_connections')
      .upsert({
        user_id: user.id,
        provider,
        api_key_hash: apiKey, // In production, use proper encryption
        is_enabled: isEnabled,
        provider_data: providerData,
      }, {
        onConflict: 'user_id,provider'
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Print partner connected successfully',
        providerData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error connecting print partner:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
