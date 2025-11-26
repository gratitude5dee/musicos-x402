// Production-grade wallet sync function for Thirdweb
// Thirdweb auto-creates wallets during auth, this syncs to our database

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WalletSyncRequest {
  email: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  const startTime = performance.now();

  try {
    // Parse request body
    const body: WalletSyncRequest = await req.json();
    
    if (!body.email || !body.walletAddress) {
      return errorResponse(400, 'Missing required fields: email, walletAddress', correlationId);
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', body.walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
      throw new Error(`Database error: ${fetchError.message}`);
    }

    let user;
    const now = new Date().toISOString();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: body.email,
          username: body.username || existingUser.username,
          display_name: body.displayName || existingUser.display_name,
          updated_at: now,
        })
        .eq('wallet_address', body.walletAddress)
        .select()
        .single();

      if (error) {
        console.error('User update error:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      user = data;
      console.log('User updated:', user.id);
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: body.email,
          wallet_address: body.walletAddress,
          username: body.username,
          display_name: body.displayName,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      user = data;
      console.log('New user created:', user.id);
    }

    // Create audit log entry
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: existingUser ? 'wallet_synced' : 'wallet_created',
        resource_type: 'wallet',
        resource_id: body.walletAddress,
        metadata: {
          email: body.email,
          username: body.username,
          isNewUser: !existingUser,
        },
        correlation_id: correlationId,
        created_at: now,
      });

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Non-fatal - continue
    }

    // Return success response
    return jsonResponse(
      existingUser ? 200 : 201,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          wallet_address: user.wallet_address,
          display_name: user.display_name,
          created_at: user.created_at,
        },
        cached: !!existingUser,
      },
      correlationId,
      startTime
    );

  } catch (error) {
    console.error(`[${correlationId}] Wallet sync error:`, error);
    const message = error instanceof Error ? error.message : 'Wallet sync failed';
    return errorResponse(500, message, correlationId);
  }
});

// Utility functions
function jsonResponse(
  status: number,
  data: unknown,
  correlationId: string,
  startTime: number
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'X-Response-Time': `${(performance.now() - startTime).toFixed(2)}ms`,
    },
  });
}

function errorResponse(status: number, message: string, correlationId: string) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
    }
  );
}
