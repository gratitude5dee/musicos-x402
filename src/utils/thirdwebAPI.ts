const THIRDWEB_API_BASE = 'https://api.thirdweb.com/v1';
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

// Validate client ID on module load
if (!CLIENT_ID) {
  console.error(
    '[ThirdwebAPI] VITE_THIRDWEB_CLIENT_ID is not configured. ' +
    'Please add it to your Lovable secrets to enable Thirdweb authentication.'
  );
}

export interface AuthResponse {
  token: string;
  walletAddress: string;
  isNewUser: boolean;
}

export interface BalanceResponse {
  result: {
    value: string;
    decimals: number;
    symbol: string;
    name: string;
  };
}

export const sendLoginCode = async (email: string) => {
  const response = await fetch(`${THIRDWEB_API_BASE}/auth/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID
    },
    body: JSON.stringify({
      method: 'email',
      email: email
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send code error response:', errorText);
    throw new Error(`Failed to send login code: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const verifyLoginCode = async (email: string, code: string): Promise<AuthResponse> => {
  const response = await fetch(`${THIRDWEB_API_BASE}/auth/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID
    },
    body: JSON.stringify({
      method: 'email',
      email: email,
      code: code
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Verify code error response:', errorText);
    throw new Error(`Failed to verify login code: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    token: data.token,
    walletAddress: data.walletAddress,
    isNewUser: data.isNewUser
  };
};

export const getWalletBalance = async (address: string, chainId: number, tokenAddress?: string): Promise<BalanceResponse> => {
  const url = new URL(`${THIRDWEB_API_BASE}/wallets/${address}/balance`);
  url.searchParams.append('chainId', chainId.toString());
  
  if (tokenAddress && tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    url.searchParams.append('tokenAddress', tokenAddress);
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Balance error response:', errorText);
    throw new Error(`Failed to get wallet balance: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
