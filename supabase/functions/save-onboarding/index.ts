import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingData {
  userId: string;
  walletAddress: string;
  creatorName?: string;
  connectedAccounts?: string[];
  uploadedFiles?: any[];
  preferences?: {
    llm?: string;
    chain?: string;
    style?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: OnboardingData = await req.json();
    const { userId, walletAddress, creatorName, connectedAccounts, uploadedFiles, preferences } = body;

    console.log('save-onboarding called with:', { userId, walletAddress });

    // Validate required fields
    if (!userId || !walletAddress) {
      console.error('Missing required fields:', { userId, walletAddress });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and walletAddress' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Verify the user exists and wallet address matches
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('User not found:', userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify wallet address matches (security check)
    if (user.wallet_address?.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error('Wallet address mismatch:', { 
        expected: user.wallet_address, 
        received: walletAddress 
      });
      return new Response(
        JSON.stringify({ error: 'Wallet address mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User verified, upserting profile for:', userId);

    // Upsert profile data with onboarding_completed = true
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: creatorName?.trim() || null,
        connected_accounts: connectedAccounts || [],
        uploaded_files: uploadedFiles || [],
        ai_preferences: preferences || {},
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to save profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile saved successfully:', profile);

    return new Response(
      JSON.stringify({ 
        success: true, 
        onboardingCompleted: true,
        profile 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Unexpected error in save-onboarding:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
