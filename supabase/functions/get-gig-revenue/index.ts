import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid authorization token');
    }

    const { gigId } = await req.json();
    
    if (!gigId) {
      throw new Error('gigId is required');
    }

    // Verify the gig belongs to the user
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('id, user_id')
      .eq('id', gigId)
      .single();

    if (gigError || !gig) {
      throw new Error('Gig not found');
    }

    if (gig.user_id !== user.id) {
      throw new Error('You do not have access to this gig');
    }

    // Call the database function to calculate revenue
    const { data, error } = await supabase.rpc('calculate_gig_revenue', {
      gig_id_param: gigId
    });

    if (error) {
      console.error('Error calculating gig revenue:', error);
      throw error;
    }

    return new Response(JSON.stringify(data[0] || {}), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-gig-revenue function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
