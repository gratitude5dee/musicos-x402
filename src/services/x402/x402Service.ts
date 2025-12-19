import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment, wrapFetchWithPayment } from "thirdweb/x402";
import { baseSepolia, arbitrum } from "thirdweb/chains";

export interface X402PaymentConfig {
  secretKey: string;
  clientId: string;
  serverWalletAddress: `0x${string}`;
  network: 'mainnet' | 'testnet';
}

export interface X402PaymentRequirements {
  scheme: 'exact';
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: 'application/json';
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
}

export class X402Service {
  private client: ReturnType<typeof createThirdwebClient>;
  private facilitatorInstance: any;
  private config: X402PaymentConfig;

  constructor(config: X402PaymentConfig) {
    this.config = config;
    this.client = createThirdwebClient({
      secretKey: config.secretKey
    });

    this.facilitatorInstance = facilitator({
      client: this.client,
      serverWalletAddress: config.serverWalletAddress,
    });
  }

  async settlePayment(options: {
    resourceUrl: string;
    method: string;
    paymentData: string | null;
    payTo: `0x${string}`;
    price: string;
    description: string;
  }) {
    const chain = this.config.network === 'mainnet' ? arbitrum : baseSepolia;

    return settlePayment({
      resourceUrl: options.resourceUrl,
      method: options.method.toUpperCase(),
      paymentData: options.paymentData,
      payTo: options.payTo,
      network: chain,
      price: options.price,
      facilitator: this.facilitatorInstance,
      routeConfig: {
        description: options.description,
        mimeType: "application/json",
        maxTimeoutSeconds: 300,
      },
    });
  }

  getPaymentWrappedFetch(wallet: any) {
    return wrapFetchWithPayment(fetch, this.client, wallet);
  }
}
