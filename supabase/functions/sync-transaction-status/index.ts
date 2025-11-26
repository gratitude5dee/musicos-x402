// Background job to sync pending transaction statuses from Thirdweb
// Triggered via cron or on-demand

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const THIRDWEB_API_BASE = 'https://api.thirdweb.com/v1';

// Status mapping from Thirdweb to internal
function mapThirdwebStatus(status: string): 'pending' | 'confirmed' | 'failed' {
  const upperStatus = status.toUpperCase();
  
  if (upperStatus === 'QUEUED' || upperStatus === 'SUBMITTED') {
    return 'pending';
  }
  if (upperStatus === 'CONFIRMED') {
    return 'confirmed';
  }
  if (upperStatus === 'FAILED') {
    return 'failed';
  }
  
  return 'pending';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  const startTime = performance.now();

  try {
    const thirdwebClientId = Deno.env.get('THIRDWEB_CLIENT_ID');
    
    if (!thirdwebClientId) {
      throw new Error('THIRDWEB_CLIENT_ID not configured');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch pending transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .not('thirdweb_transaction_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(100); // Process max 100 at a time

    if (fetchError) {
      console.error('Failed to fetch pending transactions:', fetchError);
      throw new Error(`Database fetch failed: ${fetchError.message}`);
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return jsonResponse(
        200,
        {
          message: 'No pending transactions to sync',
          processed: 0,
        },
        correlationId,
        startTime
      );
    }

    console.log(`Processing ${pendingTransactions.length} pending transactions`);

    // Process each transaction
    const results = await Promise.allSettled(
      pendingTransactions.map(async (tx) => {
        try {
          // Query Thirdweb for transaction status
          const statusResponse = await fetch(
            `${THIRDWEB_API_BASE}/transactions/${tx.thirdweb_transaction_id}`,
            {
              headers: {
                'x-client-id': thirdwebClientId,
              },
            }
          );

          if (!statusResponse.ok) {
            console.error(`Failed to get status for tx ${tx.id}:`, statusResponse.status);
            return { id: tx.id, status: 'error' };
          }

          const statusData = await statusResponse.json();
          const newStatus = mapThirdwebStatus(statusData.result?.status);
          const transactionHash = statusData.result?.transactionHash;

          // Update if status changed
          if (newStatus !== 'pending') {
            const updateData: {
              status: string;
              updated_at: string;
              confirmed_at?: string;
              transaction_hash?: string;
            } = {
              status: newStatus,
              updated_at: new Date().toISOString(),
            };

            if (newStatus === 'confirmed') {
              updateData.confirmed_at = new Date().toISOString();
            }

            if (transactionHash) {
              updateData.transaction_hash = transactionHash;
            }

            const { error: updateError } = await supabase
              .from('transactions')
              .update(updateData)
              .eq('id', tx.id);

            if (updateError) {
              console.error(`Failed to update tx ${tx.id}:`, updateError);
              return { id: tx.id, status: 'update_failed' };
            }

            // Create audit log for status change
            await supabase.from('audit_logs').insert({
              user_id: tx.from_user_id,
              action: `transaction_${newStatus}`,
              resource_type: 'transaction',
              resource_id: tx.id,
              metadata: {
                thirdweb_transaction_id: tx.thirdweb_transaction_id,
                transaction_hash: transactionHash,
                previous_status: 'pending',
                new_status: newStatus,
              },
              correlation_id: correlationId,
            });

            console.log(`Transaction ${tx.id} updated to ${newStatus}`);
            return { id: tx.id, status: 'updated', newStatus };
          }

          return { id: tx.id, status: 'unchanged' };

        } catch (error) {
          console.error(`Error processing transaction ${tx.id}:`, error);
          return { id: tx.id, status: 'error' };
        }
      })
    );

    // Count results
    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          const { status } = result.value;
          if (status === 'updated') acc.updated++;
          else if (status === 'unchanged') acc.unchanged++;
          else acc.errors++;
        } else {
          acc.errors++;
        }
        return acc;
      },
      { updated: 0, unchanged: 0, errors: 0 }
    );

    console.log('Sync summary:', summary);

    return jsonResponse(
      200,
      {
        message: 'Transaction sync completed',
        processed: pendingTransactions.length,
        ...summary,
      },
      correlationId,
      startTime
    );

  } catch (error) {
    console.error(`[${correlationId}] Sync error:`, error);
    const message = error instanceof Error ? error.message : 'Sync failed';
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
