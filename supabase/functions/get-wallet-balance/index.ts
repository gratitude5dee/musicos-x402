// Production-grade wallet balance fetcher with caching
// Supports multi-chain balance queries via Thirdweb

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const THIRDWEB_API_BASE = 'https://api.thirdweb.com/v1';
const CACHE_TTL_SECONDS = 30; // Cache balances for 30 seconds

interface BalanceRequest {
  walletAddress: string;
  chainId: number;
  tokenAddress?: string; // If not provided, returns native token balance
}

interface CachedBalance {
  balance: string;
  symbol: string;
  decimals: number;
  cachedAt: number;
}

// In-memory cache for balances
const balanceCache = new Map<string, CachedBalance>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationId = req.headers.get('x-correlation-id') ?? crypto.randomUUID();
  const startTime = performance.now();

  try {
    let body: BalanceRequest;

    // Support both GET (query params) and POST (body)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      body = {
        walletAddress: url.searchParams.get('address') || '',
        chainId: parseInt(url.searchParams.get('chainId') || '1'),
        tokenAddress: url.searchParams.get('tokenAddress') || undefined,
      };
    } else {
      body = await req.json();
    }

    // Validate required fields
    if (!body.walletAddress) {
      return errorResponse(400, 'Missing wallet address', correlationId);
    }

    if (!body.chainId) {
      return errorResponse(400, 'Missing chain ID', correlationId);
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
      return errorResponse(400, 'Invalid wallet address format', correlationId);
    }

    // Check cache first
    const cacheKey = `${body.walletAddress}-${body.chainId}-${body.tokenAddress || 'native'}`;
    const cached = balanceCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_SECONDS * 1000) {
      console.log(`[${correlationId}] Cache hit for ${cacheKey}`);
      return jsonResponse(200, {
        balance: cached.balance,
        symbol: cached.symbol,
        decimals: cached.decimals,
        cached: true,
      }, correlationId, startTime);
    }

    // Fetch from Thirdweb
    const thirdwebClientId = Deno.env.get('THIRDWEB_CLIENT_ID');
    if (!thirdwebClientId) {
      console.error('THIRDWEB_CLIENT_ID not configured');
      return errorResponse(500, 'Server configuration error', correlationId);
    }

    let balanceData;

    if (body.tokenAddress) {
      // ERC-20 token balance
      const response = await fetch(
        `${THIRDWEB_API_BASE}/chains/${body.chainId}/tokens/${body.tokenAddress}/balanceOf?ownerAddress=${body.walletAddress}`,
        {
          headers: {
            'x-client-id': thirdwebClientId,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Thirdweb balance error: ${response.status} - ${errorText}`);
        
        // Return zero balance for common errors
        if (response.status === 404) {
          balanceData = { balance: '0', symbol: 'UNKNOWN', decimals: 18 };
        } else {
          throw new Error(`Failed to fetch token balance: ${response.status}`);
        }
      } else {
        const data = await response.json();
        balanceData = {
          balance: data.result?.displayValue || '0',
          symbol: data.result?.symbol || 'UNKNOWN',
          decimals: data.result?.decimals || 18,
        };
      }
    } else {
      // Native token balance
      const response = await fetch(
        `${THIRDWEB_API_BASE}/chains/${body.chainId}/rpc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': thirdwebClientId,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [body.walletAddress, 'latest'],
            id: 1,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Thirdweb RPC error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch native balance: ${response.status}`);
      }

      const data = await response.json();
      const balanceWei = BigInt(data.result || '0');
      const balanceEth = Number(balanceWei) / 1e18;

      // Get native token symbol based on chain
      const nativeSymbols: Record<number, string> = {
        1: 'ETH',
        137: 'MATIC',
        8453: 'ETH',
        42161: 'ETH',
        10: 'ETH',
        43114: 'AVAX',
        56: 'BNB',
      };

      balanceData = {
        balance: balanceEth.toFixed(6),
        symbol: nativeSymbols[body.chainId] || 'ETH',
        decimals: 18,
      };
    }

    // Update cache
    balanceCache.set(cacheKey, {
      ...balanceData,
      cachedAt: Date.now(),
    });

    console.log(`[${correlationId}] Balance fetched: ${balanceData.balance} ${balanceData.symbol}`);

    return jsonResponse(200, {
      ...balanceData,
      cached: false,
    }, correlationId, startTime);

  } catch (error) {
    console.error(`[${correlationId}] Balance fetch error:`, error);
    const message = error instanceof Error ? error.message : 'Failed to fetch balance';
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
      'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
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
