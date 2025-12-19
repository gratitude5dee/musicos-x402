export interface AgentWallet {
  identifier: string;
  address: string;
  smartWalletAddress: string;
  publicKey: string;
  role: 'booking_agent' | 'royalty_agent' | 'merchandise_agent';
}

export class AgentWalletService {
  private apiUrl = 'https://api.thirdweb.com/v1';
  private secretKey: string;
  private walletCache = new Map<string, AgentWallet>();

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async getOrCreateAgentWallet(
    agentId: string,
    role: AgentWallet['role']
  ): Promise<AgentWallet> {
    const identifier = `musicos-${role}-${agentId}`;

    // Check cache first
    if (this.walletCache.has(identifier)) {
      return this.walletCache.get(identifier)!;
    }

    const response = await fetch(`${this.apiUrl}/wallets/server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': this.secretKey,
      },
      body: JSON.stringify({ identifier }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent wallet: ${response.status}`);
    }

    const data = await response.json();
    const wallet: AgentWallet = {
      identifier,
      address: data.result.address,
      smartWalletAddress: data.result.smartWalletAddress,
      publicKey: data.result.publicKey,
      role,
    };

    this.walletCache.set(identifier, wallet);
    return wallet;
  }

  async getWalletBalance(walletAddress: string, chainId: number = 8453) {
    const response = await fetch(
      `${this.apiUrl}/wallet/${walletAddress}/balance?chainId=${chainId}`,
      {
        headers: { 'x-secret-key': this.secretKey },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.status}`);
    }

    return response.json();
  }

  async executeX402Fetch(
    walletAddress: string,
    targetUrl: string,
    method: string = 'POST'
  ) {
    const queryParams = new URLSearchParams({
      url: targetUrl,
      method,
      from: walletAddress,
    });

    const response = await fetch(
      `${this.apiUrl}/payments/x402/fetch?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'x-secret-key': this.secretKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.json();
  }
}
