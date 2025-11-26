// Production-grade token transfer via Thirdweb Payments API
// Supports multi-chain ERC-20 transfers with security controls

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const THIRDWEB_API_BASE = 'https://api.thirdweb.com/v1';
const MAX_DAILY_TRANSACTIONS = 50;

interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenContract: string;
  tokenSymbol: string;
  chainId: number;
  message?: string;
  thirdwebToken: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  const idempotencyKey = req.headers.get('x-idempotency-key');
  const startTime = performance.now();

  try {
    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse request
    const body: TransferRequest = await req.json();
    
    // Validate required fields
    if (!body.fromUserId || !body.toUserId || !body.amount || !body.tokenContract) {
      return errorResponse(400, 'Missing required fields', correlationId);
    }

    // 1. IDEMPOTENCY CHECK
    if (idempotencyKey) {
      const requestHash = await hashRequest(body);
      
      const { data: existing } = await supabase
        .from('idempotency_keys')
        .select('*')
        .eq('key', idempotencyKey)
        .single();

      if (existing) {
        if (existing.request_hash !== requestHash) {
          return errorResponse(409, 'Idempotency key reused with different payload', correlationId);
        }
        
        if (existing.status === 'completed') {
          return jsonResponse(200, existing.response_data, correlationId, startTime);
        }
        
        if (existing.status === 'pending') {
          return errorResponse(409, 'Request already in progress', correlationId);
        }
      }

      // Store idempotency key
      await supabase.from('idempotency_keys').upsert({
        key: idempotencyKey,
        user_id: body.fromUserId,
        request_hash: requestHash,
        status: 'pending',
      });
    }

    // 2. SPEND LIMIT VALIDATION
    const { data: dailySpend } = await supabase
      .from('daily_spend_tracking')
      .select('transaction_count')
      .eq('user_id', body.fromUserId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (dailySpend && dailySpend.transaction_count >= MAX_DAILY_TRANSACTIONS) {
      return errorResponse(429, 'Daily transaction limit exceeded', correlationId);
    }

    // 3. VALIDATE AMOUNT
    const amountNum = parseFloat(body.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return errorResponse(400, 'Invalid amount', correlationId);
    }

    // 4. CREATE PENDING TRANSACTION IN DATABASE
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        from_user_id: body.fromUserId,
        to_user_id: body.toUserId,
        from_address: body.fromAddress,
        to_address: body.toAddress,
        amount: body.amount,
        token_contract: body.tokenContract,
        token_symbol: body.tokenSymbol,
        chain_id: body.chainId,
        message: body.message,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction creation error:', txError);
      throw new Error(`Failed to create transaction: ${txError.message}`);
    }

    console.log('Transaction created:', transaction.id);

    // 5. EXECUTE VIA THIRDWEB PAYMENT API
    try {
      // Create payment
      const createPaymentResponse = await fetch(`${THIRDWEB_API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': Deno.env.get('THIRDWEB_CLIENT_ID')!,
          'Authorization': `Bearer ${body.thirdwebToken}`,
        },
        body: JSON.stringify({
          name: `Payment to ${body.toAddress}`,
          description: body.message || `Transfer ${body.amount} ${body.tokenSymbol}`,
          recipient: body.toAddress,
          token: {
            address: body.tokenContract,
            chainId: body.chainId,
            amount: body.amount,
          },
        }),
      });

      if (!createPaymentResponse.ok) {
        const errorText = await createPaymentResponse.text();
        console.error('Thirdweb create payment error:', errorText);
        throw new Error(`Payment creation failed: ${createPaymentResponse.status}`);
      }

      const paymentData = await createPaymentResponse.json();
      const paymentId = paymentData.result.id;
      const paymentLink = paymentData.result.link;

      console.log('Payment created:', paymentId);

      // Complete payment
      const completePaymentResponse = await fetch(
        `${THIRDWEB_API_BASE}/payments/${paymentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': Deno.env.get('THIRDWEB_CLIENT_ID')!,
            'Authorization': `Bearer ${body.thirdwebToken}`,
          },
          body: JSON.stringify({
            from: body.fromAddress,
          }),
        }
      );

      if (completePaymentResponse.status === 402) {
        // Insufficient funds
        return jsonResponse(
          402,
          {
            status: 'insufficient_funds',
            paymentLink,
            transactionId: transaction.id,
          },
          correlationId,
          startTime
        );
      }

      if (!completePaymentResponse.ok) {
        const errorText = await completePaymentResponse.text();
        console.error('Thirdweb complete payment error:', errorText);
        throw new Error(`Payment completion failed: ${completePaymentResponse.status}`);
      }

      const completeData = await completePaymentResponse.json();
      const thirdwebTxId = completeData.result?.transactionId;

      console.log('Payment completed:', thirdwebTxId);

      // 6. UPDATE TRANSACTION WITH THIRDWEB ID
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          thirdweb_transaction_id: thirdwebTxId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Transaction update error:', updateError);
        // Non-fatal - transaction still submitted
      }

      // 7. AUDIT LOG
      await supabase.from('audit_logs').insert({
        user_id: body.fromUserId,
        action: 'token_transfer_initiated',
        resource_type: 'transaction',
        resource_id: transaction.id,
        metadata: {
          recipient: body.toAddress,
          amount: body.amount,
          token: body.tokenSymbol,
          chain_id: body.chainId,
          thirdweb_transaction_id: thirdwebTxId,
        },
        correlation_id: correlationId,
      });

      // 8. UPDATE IDEMPOTENCY KEY
      if (idempotencyKey) {
        await supabase.from('idempotency_keys').update({
          status: 'completed',
          response_data: {
            transactionId: transaction.id,
            thirdwebTransactionId: thirdwebTxId,
            status: 'pending',
          },
        }).eq('key', idempotencyKey);
      }

      return jsonResponse(
        200,
        {
          transactionId: transaction.id,
          thirdwebTransactionId: thirdwebTxId,
          status: 'pending',
          message: 'Transaction submitted successfully',
        },
        correlationId,
        startTime
      );

    } catch (thirdwebError) {
      // Mark transaction as failed
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      throw thirdwebError;
    }

  } catch (error) {
    console.error(`[${correlationId}] Transfer error:`, error);
    const message = error instanceof Error ? error.message : 'Transfer failed';
    
    // Update idempotency key if present
    if (idempotencyKey) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await supabase.from('idempotency_keys').update({
        status: 'failed',
      }).eq('key', idempotencyKey);
    }
    
    return errorResponse(500, message, correlationId);
  }
});

// Utility: Hash request for idempotency validation
async function hashRequest(body: TransferRequest): Promise<string> {
  const payload = JSON.stringify({
    from: body.fromAddress,
    to: body.toAddress,
    amount: body.amount,
    token: body.tokenContract,
    chain: body.chainId,
  });
  
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility: JSON response with headers
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

// Utility: Error response
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
