import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-payment',
};

// Dynamic thirdweb loader to avoid build-time module resolution
async function loadThirdweb() {
  const thirdwebX402 = await (Function('return import("npm:thirdweb@5.105.41/x402")')() as Promise<any>);
  const thirdweb = await (Function('return import("npm:thirdweb@5.105.41")')() as Promise<any>);
  const chains = await (Function('return import("npm:thirdweb@5.105.41/chains")')() as Promise<any>);
  return { ...thirdwebX402, ...thirdweb, ...chains };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const invoiceId = url.pathname.split('/').pop();
    const paymentData = req.headers.get('x-payment');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, gig:gig_id(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Invoice already paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load thirdweb dynamically at runtime
    const { settlePayment, facilitator: createFacilitator, createThirdwebClient, baseSepolia } = await loadThirdweb();

    const client = createThirdwebClient({
      secretKey: Deno.env.get('THIRDWEB_SECRET_KEY')!,
    });

    const facilitatorInstance = createFacilitator({
      client,
      serverWalletAddress: Deno.env.get('MERCHANT_WALLET_ADDRESS')! as `0x${string}`,
    });

    // Calculate amount in smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = Math.floor(invoice.amount * 1_000_000).toString();

    const result = await settlePayment({
      resourceUrl: req.url,
      method: 'POST',
      paymentData: paymentData || undefined,
      payTo: Deno.env.get('MERCHANT_WALLET_ADDRESS')! as `0x${string}`,
      network: baseSepolia,
      price: {
        amount: amountInSmallestUnit,
        asset: {
          address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
          decimals: 6,
        },
      },
      facilitator: facilitatorInstance,
      routeConfig: {
        description: `Payment for invoice ${invoice.invoice_number}`,
        mimeType: "application/json",
      },
    });

    if (result.status === 200) {
      // Payment successful - update invoice
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: 'x402_usdc',
          balance_due: 0,
          thirdweb_transaction_id: result.paymentReceipt?.transaction,
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          invoiceId,
          transactionId: result.paymentReceipt?.transaction,
          amount: invoice.amount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Payment required - return x402 headers
      return new Response(
        JSON.stringify(result.responseBody),
        {
          status: result.status,
          headers: { ...corsHeaders, ...result.responseHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error('Payment settlement error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});