import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const getCryptoKey = async () => {
  const secret = Deno.env.get('USER_SECRETS_ENCRYPTION_KEY');
  if (!secret) {
    throw new Error('USER_SECRETS_ENCRYPTION_KEY is not configured');
  }

  const rawKey = toUint8Array(secret);
  if (rawKey.length !== 32) {
    throw new Error('USER_SECRETS_ENCRYPTION_KEY must be a base64-encoded 32 byte key');
  }

  return crypto.subtle.importKey(
    'raw',
    rawKey.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { method } = req;
    const body = method !== 'GET' ? await req.json() : null;
    const cryptoKey = await getCryptoKey();

    switch (method) {
      case 'GET': {
        const { data, error } = await supabaseClient
          .from('user_secrets')
          .select('secret_type, encrypted_value, encryption_iv, created_at, updated_at')
          .eq('user_id', user.id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const secrets = await Promise.all((data || []).map(async (entry) => {
          try {
            if (!entry.encrypted_value || !entry.encryption_iv) {
              return {
                secret_type: entry.secret_type,
                value: '',
                created_at: entry.created_at,
                updated_at: entry.updated_at
              };
            }
            const iv = toUint8Array(entry.encryption_iv);
            const cipherBytes = toUint8Array(entry.encrypted_value);
            const decrypted = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
              cryptoKey,
              cipherBytes.buffer as ArrayBuffer
            );
            const value = decoder.decode(decrypted);
            return {
              secret_type: entry.secret_type,
              value,
              created_at: entry.created_at,
              updated_at: entry.updated_at
            };
          } catch (decryptError) {
            console.error('Failed to decrypt secret', decryptError);
            return {
              secret_type: entry.secret_type,
              value: '',
              created_at: entry.created_at,
              updated_at: entry.updated_at
            };
          }
        }));

        return new Response(
          JSON.stringify(secrets),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'POST': {
        const { secret_type, value } = body ?? {};

        if (!secret_type || !value) {
          return new Response(
            JSON.stringify({ error: 'secret_type and value are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          encoder.encode(value)
        );
        const encryptedValue = new Uint8Array(encryptedBuffer);

        const { error } = await supabaseClient
          .from('user_secrets')
          .upsert({
            user_id: user.id,
            secret_type,
            encrypted_value: toBase64(encryptedValue),
            encryption_iv: toBase64(iv)
          }, {
            onConflict: 'user_id,secret_type'
          });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'DELETE': {
        const { secret_type } = body ?? {};

        if (!secret_type) {
          return new Response(
            JSON.stringify({ error: 'secret_type is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const { error } = await supabaseClient
          .from('user_secrets')
          .delete()
          .eq('user_id', user.id)
          .eq('secret_type', secret_type);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
