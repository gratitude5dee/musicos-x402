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

    const { orderId, provider } = await req.json();

    // Get the print partner connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from('print_partner_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('is_enabled', true)
      .single();

    if (connectionError || !connection) {
      throw new Error(`${provider} not connected or not enabled`);
    }

    // Get the order details
    const { data: order, error: orderError } = await supabaseClient
      .from('merchandise_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    let externalOrderId = null;
    let response = null;

    // Create order with the print partner
    if (provider === 'printful') {
      response = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.api_key_hash}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: order.shipping_address,
          items: [{
            variant_id: order.product_details.variant_id,
            quantity: order.quantity,
            files: [
              { url: order.product_details.design_url }
            ]
          }]
        }),
      });

      const data = await response.json();
      externalOrderId = data.result?.id;

    } else if (provider === 'printify') {
      response = await fetch('https://api.printify.com/v1/shops/{shop_id}/orders.json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.api_key_hash}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: orderId,
          line_items: [{
            product_id: order.product_details.product_id,
            variant_id: order.product_details.variant_id,
            quantity: order.quantity,
          }],
          shipping_method: 1,
          address_to: order.shipping_address,
        }),
      });

      const data = await response.json();
      externalOrderId = data.id;
    }

    // Update the order with external order ID
    const { error: updateError } = await supabaseClient
      .from('merchandise_orders')
      .update({
        external_order_id: externalOrderId,
        fulfillment_provider: provider,
        status: 'processing',
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        externalOrderId,
        message: `Order sent to ${provider}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating print order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
